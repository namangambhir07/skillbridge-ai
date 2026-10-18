import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { calculateMatchScore } from '../services/matchingEngine.js';
import { checkJobSafety } from '../services/safetyService.js';

export const jobRouter = Router();

jobRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, type, category, workMode, location, verifiedOnly, sortBy } = req.query;

    let query = `
      SELECT j.*, ep.org_name, ep.org_website, ep.logo_url, ev.status as verification_status
      FROM jobs j
      JOIN employer_profiles ep ON ep.id = j.employer_id
      LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
      WHERE j.status = 'published'
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ? OR LOWER(ep.org_name) LIKE ?)`;
      const term = `%${String(search).toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (type) {
      query += ` AND j.opportunity_type = ?`;
      params.push(type);
    }

    if (category) {
      query += ` AND j.category = ?`;
      params.push(category);
    }

    if (workMode) {
      query += ` AND j.work_mode = ?`;
      params.push(workMode);
    }

    if (location) {
      query += ` AND LOWER(j.location) LIKE ?`;
      params.push(`%${String(location).toLowerCase()}%`);
    }

    if (verifiedOnly === 'true') {
      query += ` AND ev.status = 'verified'`;
    }

    query += ` ORDER BY j.created_at DESC`;

    const jobs = db.prepare(query).all(...params) as any[];

    // If candidate logged in, get candidate skills for match calculation
    let candidateSkills: any[] = [];
    let candidateProfile: any = null;
    let savedJobIds = new Set<string>();

    if (req.user && req.user.role === 'candidate') {
      candidateProfile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user.userId) as any;
      if (candidateProfile) {
        candidateSkills = db.prepare(`
          SELECT s.name, cs.proficiency_level, cs.evidence_source
          FROM candidate_skills cs
          JOIN skills s ON s.id = cs.skill_id
          WHERE cs.candidate_id = ?
        `).all(candidateProfile.id);

        const saved = db.prepare('SELECT job_id FROM saved_opportunities WHERE candidate_id = ?').all(candidateProfile.id) as any[];
        savedJobIds = new Set(saved.map((s) => s.job_id));
      }
    }

    const enriched = jobs.map((job) => {
      const requirements = db.prepare(`
        SELECT s.name, jsr.is_required, jsr.min_proficiency
        FROM job_skill_requirements jsr
        JOIN skills s ON s.id = jsr.skill_id
        WHERE jsr.job_id = ?
      `).all(job.id) as any[];

      let match = null;
      if (candidateProfile) {
        match = calculateMatchScore(
          {
            id: candidateProfile.id,
            skills: candidateSkills,
            experience: candidateProfile.experience,
            projects: candidateProfile.bio,
            preferred_work_mode: candidateProfile.preferred_work_mode,
            location_preference: candidateProfile.location_preference,
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
          }
        );
      }

      return {
        ...job,
        requirements,
        match,
        isSaved: savedJobIds.has(job.id),
      };
    });

    if (sortBy === 'match' && candidateProfile) {
      enriched.sort((a, b) => (b.match?.overallScore || 0) - (a.match?.overallScore || 0));
    }

    res.json({ jobs: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list jobs', details: err.message });
  }
});

jobRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = db.prepare(`
      SELECT j.*, ep.org_name, ep.org_website, ep.business_email, ep.description as org_description,
             ep.logo_url, ep.company_size, ep.industry, ev.status as verification_status
      FROM jobs j
      JOIN employer_profiles ep ON ep.id = j.employer_id
      LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
      WHERE j.id = ?
    `).get(req.params.id) as any;

    if (!job) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    const requirements = db.prepare(`
      SELECT s.name, jsr.is_required, jsr.min_proficiency
      FROM job_skill_requirements jsr
      JOIN skills s ON s.id = jsr.skill_id
      WHERE jsr.job_id = ?
    `).all(job.id) as any[];

    const assessment = db.prepare(`
      SELECT id, title, task_type, time_limit_minutes, status
      FROM assessments
      WHERE job_id = ? AND status = 'published'
    `).get(job.id);

    let match = null;
    let application = null;
    let isSaved = false;

    if (req.user && req.user.role === 'candidate') {
      const candidateProfile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user.userId) as any;
      if (candidateProfile) {
        const candidateSkills = db.prepare(`
          SELECT s.name, cs.proficiency_level, cs.evidence_source
          FROM candidate_skills cs
          JOIN skills s ON s.id = cs.skill_id
          WHERE cs.candidate_id = ?
        `).all(candidateProfile.id) as any[];

        match = calculateMatchScore(
          {
            id: candidateProfile.id,
            skills: candidateSkills,
            experience: candidateProfile.experience,
            projects: candidateProfile.bio,
            preferred_work_mode: candidateProfile.preferred_work_mode,
            location_preference: candidateProfile.location_preference,
          },
          {
            id: job.id,
            title: job.title,
            category: job.category,
            work_mode: job.work_mode,
            location: job.location,
            experience_level: job.experience_level,
            requirements,
            hasAssessmentAvailable: Boolean(assessment),
          }
        );

        application = db.prepare(`
          SELECT a.*, ass.id as assessment_session_id, ass.status as assessment_status
          FROM applications a
          LEFT JOIN assessment_sessions ass ON ass.application_id = a.id
          WHERE a.job_id = ? AND a.candidate_id = ?
        `).get(job.id, candidateProfile.id);

        const saved = db.prepare('SELECT id FROM saved_opportunities WHERE candidate_id = ? AND job_id = ?').get(candidateProfile.id, job.id);
        isSaved = Boolean(saved);
      }
    }

    res.json({
      job: {
        ...job,
        requirements,
        assessment,
        match,
        application,
        isSaved,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch job details', details: err.message });
  }
});

jobRouter.post('/:id/apply', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    if (!profile) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    const job = db.prepare('SELECT id, title, employer_id FROM jobs WHERE id = ?').get(jobId) as any;
    if (!job) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    // Check existing active application
    const existing = db.prepare(`
      SELECT id, status FROM applications
      WHERE job_id = ? AND candidate_id = ?
    `).get(jobId, profile.id) as any;

    if (existing && !['rejected', 'withdrawn'].includes(existing.status)) {
      res.status(400).json({
        error: `You already have an active application for this role (Status: ${existing.status}).`,
      });
      return;
    }

    const assessment = db.prepare('SELECT id FROM assessments WHERE job_id = ? AND status = "published"').get(jobId) as any;

    const initialStatus = assessment ? 'assessment_required' : 'applied';
    const applicationId = 'app_' + crypto.randomUUID().slice(0, 8);

    db.prepare(`
      INSERT INTO applications (id, job_id, candidate_id, status)
      VALUES (?, ?, ?, ?)
    `).run(applicationId, jobId, profile.id, initialStatus);

    db.prepare(`
      INSERT INTO application_status_history (id, application_id, status, notes, changed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'ash_' + crypto.randomUUID().slice(0, 8),
      applicationId,
      initialStatus,
      assessment ? 'Application submitted. Assessment required to proceed.' : 'Application submitted.',
      req.user!.userId
    );

    // If assessment is required, pre-create the assessment session
    let sessionId = null;
    if (assessment) {
      sessionId = 'ses_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO assessment_sessions (id, assessment_id, candidate_id, application_id, status)
        VALUES (?, ?, ?, ?, 'not_started')
      `).run(sessionId, assessment.id, profile.id, applicationId);
    }

    // Notification for employer
    const empUser = db.prepare('SELECT user_id FROM employer_profiles WHERE id = ?').get(job.employer_id) as any;
    if (empUser) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link)
        VALUES (?, ?, 'New Candidate Application', ?, ?)
      `).run(
        'not_' + crypto.randomUUID().slice(0, 8),
        empUser.user_id,
        `${req.user!.name} applied for "${job.title}".`,
        `/employer/jobs/${job.id}`
      );
    }

    res.status(201).json({
      message: assessment
        ? 'Application initiated. Please complete the practical skill assessment to proceed.'
        : 'Application submitted successfully.',
      applicationId,
      status: initialStatus,
      assessmentSessionId: sessionId,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Application failed', details: err.message });
  }
});

jobRouter.post('/:id/save', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId) as any;
    const jobId = req.params.id;

    const existing = db.prepare('SELECT id FROM saved_opportunities WHERE candidate_id = ? AND job_id = ?').get(profile.id, jobId);
    if (existing) {
      db.prepare('DELETE FROM saved_opportunities WHERE candidate_id = ? AND job_id = ?').run(profile.id, jobId);
      res.json({ saved: false, message: 'Removed from saved opportunities' });
    } else {
      db.prepare(`
        INSERT INTO saved_opportunities (id, candidate_id, job_id)
        VALUES (?, ?, ?)
      `).run('sav_' + crypto.randomUUID().slice(0, 8), profile.id, jobId);
      res.json({ saved: true, message: 'Opportunity saved' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle save', details: err.message });
  }
});

jobRouter.post('/:id/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, description, evidence_notes } = req.body;
    if (!category || !description) {
      res.status(400).json({ error: 'Category and description are required' });
      return;
    }

    const reportId = 'rep_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO job_reports (id, job_id, reporter_id, category, description, evidence_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `).run(reportId, req.params.id, req.user!.userId, category, description, evidence_notes || '');

    // Notify all admin users
    const admins = db.prepare('SELECT id FROM users WHERE role = "admin"').all() as any[];
    for (const admin of admins) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link)
        VALUES (?, ?, 'Suspicious Job Report Submitted', ?, ?)
      `).run(
        'not_' + crypto.randomUUID().slice(0, 8),
        admin.id,
        `New report submitted for review under category "${category}".`,
        '/admin/reports'
      );
    }

    res.status(201).json({
      message: 'Report submitted. Our moderation team will review this listing objectively.',
      reportId,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit report', details: err.message });
  }
});

jobRouter.post('/check-safety', (req, res) => {
  const { title, description } = req.body;
  const result = checkJobSafety(title || '', description || '');
  res.json(result);
});
