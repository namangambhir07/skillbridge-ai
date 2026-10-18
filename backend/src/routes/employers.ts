import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { checkJobSafety } from '../services/safetyService.js';
import { calculateMatchScore } from '../services/matchingEngine.js';

export const employerRouter = Router();

function getEmployerProfile(userId: string) {
  let profile = db.prepare(`
    SELECT ep.*, ev.status as verification_status, ev.registration_number, ev.reviewer_notes
    FROM employer_profiles ep
    LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
    WHERE ep.user_id = ?
  `).get(userId) as any;

  if (!profile) {
    const empId = 'emp_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO employer_profiles (id, user_id, org_name, description)
      VALUES (?, ?, 'My Organization', 'Technology and Innovation Company.')
    `).run(empId, userId);

    db.prepare(`
      INSERT INTO employer_verifications (id, employer_id, status)
      VALUES (?, ?, 'not_submitted')
    `).run('ver_' + crypto.randomUUID().slice(0, 8), empId);

    profile = db.prepare(`
      SELECT ep.*, ev.status as verification_status, ev.registration_number, ev.reviewer_notes
      FROM employer_profiles ep
      LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
      WHERE ep.id = ?
    `).get(empId);
  }
  return profile;
}

employerRouter.get('/dashboard', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);

    const activeJobs = db.prepare(`
      SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = 'published'
    `).get(profile.id) as any;

    const totalApplications = db.prepare(`
      SELECT COUNT(*) as count FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ?
    `).get(profile.id) as any;

    const awaitingReview = db.prepare(`
      SELECT COUNT(*) as count FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ? AND a.status IN ('applied', 'under_review')
    `).get(profile.id) as any;

    const assessmentsAwaitingReview = db.prepare(`
      SELECT COUNT(*) as count FROM assessment_sessions ass
      JOIN assessments a ON a.id = ass.assessment_id
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ? AND ass.status = 'completed'
    `).get(profile.id) as any;

    const shortlisted = db.prepare(`
      SELECT COUNT(*) as count FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ? AND a.status = 'shortlisted'
    `).get(profile.id) as any;

    const recentApplications = db.prepare(`
      SELECT a.id, a.status, a.applied_at, j.title as job_title, u.name as candidate_name, u.email as candidate_email,
             cp.headline as candidate_headline, ass.id as assessment_session_id, ass.status as assessment_status
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN candidate_profiles cp ON cp.id = a.candidate_id
      JOIN users u ON u.id = cp.user_id
      LEFT JOIN assessment_sessions ass ON ass.application_id = a.id
      WHERE j.employer_id = ?
      ORDER BY a.applied_at DESC
      LIMIT 6
    `).all(profile.id);

    res.json({
      profile,
      metrics: {
        activeJobs: activeJobs.count,
        totalApplications: totalApplications.count,
        awaitingReview: awaitingReview.count,
        assessmentsAwaitingReview: assessmentsAwaitingReview.count,
        shortlisted: shortlisted.count,
      },
      recentApplications,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch employer dashboard', details: err.message });
  }
});

employerRouter.post('/verification', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);
    const { registration_number, org_website, business_email, supporting_info } = req.body;

    if (!registration_number || !business_email) {
      res.status(400).json({ error: 'Registration number and business email are required' });
      return;
    }

    db.prepare(`
      UPDATE employer_profiles
      SET org_website = COALESCE(?, org_website),
          business_email = COALESCE(?, business_email)
      WHERE id = ?
    `).run(org_website, business_email, profile.id);

    db.prepare(`
      UPDATE employer_verifications
      SET status = 'pending_review',
          registration_number = ?,
          supporting_info = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE employer_id = ?
    `).run(registration_number, supporting_info || '', profile.id);

    // Notify admins
    const admins = db.prepare('SELECT id FROM users WHERE role = "admin"').all() as any[];
    for (const admin of admins) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link)
        VALUES (?, ?, 'New Employer Verification Submission', ?, ?)
      `).run(
        'not_' + crypto.randomUUID().slice(0, 8),
        admin.id,
        `${profile.org_name} submitted verification details for review.`,
        '/admin/verifications'
      );
    }

    res.json({
      message: 'Verification submission received. It is now pending review by platform moderators.',
      status: 'pending_review',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Verification submission failed', details: err.message });
  }
});

employerRouter.get('/jobs', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);
    const jobs = db.prepare(`
      SELECT j.*,
             (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count,
             (SELECT COUNT(*) FROM assessments WHERE job_id = j.id) as has_assessment
      FROM jobs j
      WHERE j.employer_id = ?
      ORDER BY j.created_at DESC
    `).all(profile.id) as any[];

    const enriched = jobs.map((job) => {
      const requirements = db.prepare(`
        SELECT s.name, jsr.is_required, jsr.min_proficiency
        FROM job_skill_requirements jsr
        JOIN skills s ON s.id = jsr.skill_id
        WHERE jsr.job_id = ?
      `).all(job.id);
      return { ...job, requirements };
    });

    res.json({ jobs: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch employer jobs', details: err.message });
  }
});

employerRouter.post('/jobs', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);
    const {
      title,
      opportunity_type,
      category,
      work_mode,
      location,
      experience_level,
      description,
      responsibilities,
      eligibility_criteria,
      salary_range,
      deadline,
      requirements,
      assessment,
    } = req.body;

    if (!title || !description || !category || !work_mode || !location) {
      res.status(400).json({ error: 'Missing required opportunity fields' });
      return;
    }

    // Run prototype safety engine
    const safety = checkJobSafety(title, description);

    if (safety.verdict === 'BLOCK') {
      res.status(400).json({
        error: 'Job posting blocked by safety policy engine. Please revise the description to remove policy violations.',
        safetyResult: safety,
      });
      return;
    }

    const initialStatus = safety.verdict === 'REVIEW' ? 'review_required' : 'published';
    const jobId = 'job_' + crypto.randomUUID().slice(0, 8);

    db.prepare(`
      INSERT INTO jobs (
        id, employer_id, title, opportunity_type, category, work_mode, location,
        experience_level, description, responsibilities, eligibility_criteria, salary_range,
        deadline, status, safety_verdict, safety_reasons
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId,
      profile.id,
      title,
      opportunity_type || 'job',
      category,
      work_mode,
      location,
      experience_level || 'Mid-Level',
      description,
      responsibilities || '',
      eligibility_criteria || '',
      salary_range || '',
      deadline || null,
      initialStatus,
      safety.verdict,
      JSON.stringify(safety.reasons)
    );

    // Save skill requirements
    if (Array.isArray(requirements)) {
      for (const reqItem of requirements) {
        if (!reqItem.name) continue;
        let skillRow = db.prepare('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)').get(reqItem.name.trim()) as any;
        if (!skillRow) {
          const sId = 'skl_' + crypto.randomUUID().slice(0, 8);
          db.prepare('INSERT INTO skills (id, name, category) VALUES (?, ?, ?)').run(sId, reqItem.name.trim(), category);
          skillRow = { id: sId };
        }
        db.prepare(`
          INSERT INTO job_skill_requirements (id, job_id, skill_id, is_required, min_proficiency)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          'jsr_' + crypto.randomUUID().slice(0, 8),
          jobId,
          skillRow.id,
          reqItem.is_required !== undefined ? (reqItem.is_required ? 1 : 0) : 1,
          reqItem.min_proficiency || 'intermediate'
        );
      }
    }

    // Create assessment if specified
    if (assessment && assessment.title && assessment.initial_prompt) {
      const assessmentId = 'asm_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO assessments (
          id, job_id, title, task_type, initial_prompt, follow_up_prompt, evaluation_criteria, time_limit_minutes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')
      `).run(
        assessmentId,
        jobId,
        assessment.title,
        assessment.task_type || 'coding',
        assessment.initial_prompt,
        assessment.follow_up_prompt || 'Client constraints have changed. Revise and explain your adaptation.',
        assessment.evaluation_criteria || 'Evaluation of task accuracy, adaptability, and rationale.',
        assessment.time_limit_minutes || 45
      );
    }

    res.status(201).json({
      message: initialStatus === 'published' ? 'Job published successfully' : 'Job created and flagged for moderator review',
      jobId,
      status: initialStatus,
      safetyResult: safety,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create job', details: err.message });
  }
});

employerRouter.get('/jobs/:id/applicants', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND employer_id = ?').get(req.params.id, profile.id) as any;

    if (!job) {
      res.status(404).json({ error: 'Job not found or access denied' });
      return;
    }

    const requirements = db.prepare(`
      SELECT s.name, jsr.is_required, jsr.min_proficiency
      FROM job_skill_requirements jsr
      JOIN skills s ON s.id = jsr.skill_id
      WHERE jsr.job_id = ?
    `).all(job.id) as any[];

    const applications = db.prepare(`
      SELECT a.*, cp.headline, cp.bio, cp.portfolio_url, cp.github_url, cp.linkedin_url,
             u.name as candidate_name, u.email as candidate_email,
             ass.id as assessment_session_id, ass.status as assessment_status,
             ass.paste_count, ass.edit_count, ass.elapsed_seconds,
             cf.id as feedback_id
      FROM applications a
      JOIN candidate_profiles cp ON cp.id = a.candidate_id
      JOIN users u ON u.id = cp.user_id
      LEFT JOIN assessment_sessions ass ON ass.application_id = a.id
      LEFT JOIN candidate_feedback cf ON cf.application_id = a.id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `).all(job.id) as any[];

    const enriched = applications.map((app) => {
      const candidateSkills = db.prepare(`
        SELECT s.name, cs.proficiency_level, cs.evidence_source
        FROM candidate_skills cs
        JOIN skills s ON s.id = cs.skill_id
        WHERE cs.candidate_id = ?
      `).all(app.candidate_id) as any[];

      const match = calculateMatchScore(
        {
          id: app.candidate_id,
          skills: candidateSkills,
          experience: app.bio,
          projects: app.bio,
        },
        {
          id: job.id,
          title: job.title,
          category: job.category,
          work_mode: job.work_mode,
          location: job.location,
          experience_level: job.experience_level,
          requirements,
          hasAssessmentAvailable: true,
        },
        app.assessment_status === 'completed'
      );

      return {
        ...app,
        candidateSkills,
        match,
      };
    });

    res.json({
      job,
      requirements,
      applicants: enriched,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch applicants', details: err.message });
  }
});

employerRouter.patch('/applications/:id/status', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['applied', 'under_review', 'assessment_required', 'assessment_submitted', 'shortlisted', 'improvement_suggested', 'selected', 'rejected', 'withdrawn'];

    if (!allowed.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
      return;
    }

    const app = db.prepare(`
      SELECT a.*, j.title as job_title, cp.user_id as candidate_user_id
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN candidate_profiles cp ON cp.id = a.candidate_id
      WHERE a.id = ?
    `).get(req.params.id) as any;

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    db.prepare(`
      UPDATE applications
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, app.id);

    db.prepare(`
      INSERT INTO application_status_history (id, application_id, status, notes, changed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run('ash_' + crypto.randomUUID().slice(0, 8), app.id, status, notes || `Status changed to ${status}`, req.user!.userId);

    // Notify candidate
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'Application Status Update', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      app.candidate_user_id,
      `Your application for "${app.job_title}" has been updated to "${status}".`,
      '/candidate/applications'
    );

    res.json({ message: 'Application status updated successfully', status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update application status', details: err.message });
  }
});

employerRouter.get('/analytics', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getEmployerProfile(req.user!.userId);

    // Status breakdown
    const statusRows = db.prepare(`
      SELECT a.status, COUNT(*) as count
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ?
      GROUP BY a.status
    `).all(profile.id) as any[];

    // Assessment completion stats
    const assessmentStats = db.prepare(`
      SELECT
        COUNT(*) as total_assigned,
        SUM(CASE WHEN ass.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN ass.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        AVG(ass.elapsed_seconds) as avg_elapsed_seconds
      FROM assessment_sessions ass
      JOIN assessments a ON a.id = ass.assessment_id
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ?
    `).get(profile.id) as any;

    // Mini projects stats
    const miniProjectStats = db.prepare(`
      SELECT
        COUNT(*) as total_projects,
        SUM(CASE WHEN mp.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN mp.status = 'submitted' THEN 1 ELSE 0 END) as submitted_under_review
      FROM mini_projects mp
      JOIN candidate_feedback cf ON cf.id = mp.feedback_id
      JOIN applications a ON a.id = cf.application_id
      JOIN jobs j ON j.id = a.job_id
      WHERE j.employer_id = ?
    `).get(profile.id) as any;

    res.json({
      applicationStatusDistribution: statusRows,
      assessmentCompletion: {
        totalAssigned: assessmentStats.total_assigned || 0,
        completed: assessmentStats.completed || 0,
        inProgress: assessmentStats.in_progress || 0,
        avgMinutes: assessmentStats.avg_elapsed_seconds ? Math.round(assessmentStats.avg_elapsed_seconds / 60) : 0,
      },
      miniProjectGrowth: {
        totalAssigned: miniProjectStats.total_projects || 0,
        acceptedEvidence: miniProjectStats.accepted || 0,
        awaitingReview: miniProjectStats.submitted_under_review || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});
