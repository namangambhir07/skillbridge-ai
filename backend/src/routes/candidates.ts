import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { calculateMatchScore, CandidateMatchingProfile } from '../services/matchingEngine.js';

export const candidateRouter = Router();

// Ensure candidate profile exists for user
function getCandidateProfile(userId: string) {
  let profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(userId) as any;
  if (!profile) {
    const candId = 'cand_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO candidate_profiles (id, user_id, headline, bio)
      VALUES (?, ?, 'Full-Stack Developer', 'Seeking opportunities in modern software engineering.')
    `).run(candId, userId);
    profile = db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(candId);
  }
  return profile;
}

candidateRouter.get('/me', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);
    const skills = db.prepare(`
      SELECT cs.id, s.name, s.category, cs.proficiency_level, cs.evidence_source, cs.verified_at
      FROM candidate_skills cs
      JOIN skills s ON s.id = cs.skill_id
      WHERE cs.candidate_id = ?
    `).all(profile.id);

    const evidence = db.prepare(`
      SELECT pe.*, mp.title as project_title, mp.status as project_status
      FROM profile_evidence pe
      LEFT JOIN mini_projects mp ON mp.id = pe.mini_project_id
      WHERE pe.candidate_id = ?
      ORDER BY pe.verified_at DESC
    `).all(profile.id);

    const savedJobs = db.prepare(`
      SELECT j.id, j.title, j.opportunity_type, j.work_mode, j.location, ep.org_name
      FROM saved_opportunities so
      JOIN jobs j ON j.id = so.job_id
      JOIN employer_profiles ep ON ep.id = j.employer_id
      WHERE so.candidate_id = ?
    `).all(profile.id);

    res.json({
      profile,
      skills,
      evidence,
      savedJobs,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch candidate profile', details: err.message });
  }
});

candidateRouter.patch('/me', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);
    const {
      headline,
      bio,
      education,
      experience,
      portfolio_url,
      github_url,
      linkedin_url,
      preferred_roles,
      preferred_work_mode,
      location_preference,
      availability,
      profile_visibility,
      skills,
    } = req.body;

    db.prepare(`
      UPDATE candidate_profiles
      SET headline = COALESCE(?, headline),
          bio = COALESCE(?, bio),
          education = COALESCE(?, education),
          experience = COALESCE(?, experience),
          portfolio_url = COALESCE(?, portfolio_url),
          github_url = COALESCE(?, github_url),
          linkedin_url = COALESCE(?, linkedin_url),
          preferred_roles = COALESCE(?, preferred_roles),
          preferred_work_mode = COALESCE(?, preferred_work_mode),
          location_preference = COALESCE(?, location_preference),
          availability = COALESCE(?, availability),
          profile_visibility = COALESCE(?, profile_visibility),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      headline,
      bio,
      education,
      experience,
      portfolio_url,
      github_url,
      linkedin_url,
      preferred_roles,
      preferred_work_mode,
      location_preference,
      availability,
      profile_visibility,
      profile.id
    );

    // Update skills if supplied
    if (Array.isArray(skills)) {
      for (const item of skills) {
        if (!item.name) continue;
        let skillRow = db.prepare('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)').get(item.name.trim()) as any;
        if (!skillRow) {
          const sId = 'skl_' + crypto.randomUUID().slice(0, 8);
          db.prepare('INSERT INTO skills (id, name, category) VALUES (?, ?, ?)').run(
            sId,
            item.name.trim(),
            item.category || 'General'
          );
          skillRow = { id: sId };
        }

        const existingCandSkill = db.prepare(`
          SELECT id, evidence_source FROM candidate_skills
          WHERE candidate_id = ? AND skill_id = ?
        `).get(profile.id, skillRow.id) as any;

        if (existingCandSkill) {
          db.prepare(`
            UPDATE candidate_skills
            SET proficiency_level = COALESCE(?, proficiency_level),
                evidence_source = COALESCE(?, evidence_source)
            WHERE id = ?
          `).run(item.proficiency_level, item.evidence_source, existingCandSkill.id);
        } else {
          db.prepare(`
            INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            'csk_' + crypto.randomUUID().slice(0, 8),
            profile.id,
            skillRow.id,
            item.proficiency_level || 'intermediate',
            item.evidence_source || 'self_reported'
          );
        }
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

candidateRouter.get('/me/matches', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);
    const candidateSkills = db.prepare(`
      SELECT s.name, cs.proficiency_level, cs.evidence_source
      FROM candidate_skills cs
      JOIN skills s ON s.id = cs.skill_id
      WHERE cs.candidate_id = ?
    `).all(profile.id) as any[];

    const candMatchingProfile: CandidateMatchingProfile = {
      id: profile.id,
      skills: candidateSkills,
      experience: profile.experience,
      projects: profile.bio,
      preferred_work_mode: profile.preferred_work_mode,
      location_preference: profile.location_preference,
    };

    // Get all published jobs
    const jobs = db.prepare(`
      SELECT j.*, ep.org_name, ep.logo_url, ev.status as verification_status
      FROM jobs j
      JOIN employer_profiles ep ON ep.id = j.employer_id
      LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
      WHERE j.status = 'published'
      ORDER BY j.created_at DESC
    `).all() as any[];

    const results = jobs.map((job) => {
      const requirements = db.prepare(`
        SELECT s.name, jsr.is_required, jsr.min_proficiency
        FROM job_skill_requirements jsr
        JOIN skills s ON s.id = jsr.skill_id
        WHERE jsr.job_id = ?
      `).all(job.id) as any[];

      // Check if candidate passed an assessment for this job
      const session = db.prepare(`
        SELECT ass.status FROM assessment_sessions ass
        JOIN assessments a ON a.id = ass.assessment_id
        WHERE a.job_id = ? AND ass.candidate_id = ? AND ass.status = 'completed'
      `).get(job.id, profile.id);

      const match = calculateMatchScore(
        candMatchingProfile,
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
        Boolean(session)
      );

      // Check if already applied
      const app = db.prepare('SELECT id, status FROM applications WHERE job_id = ? AND candidate_id = ?').get(job.id, profile.id) as any;

      return {
        ...job,
        requirements,
        match,
        applicationStatus: app ? app.status : null,
        hasApplied: Boolean(app),
      };
    });

    results.sort((a, b) => b.match.overallScore - a.match.overallScore);

    res.json({ matches: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate matches', details: err.message });
  }
});

candidateRouter.get('/me/applications', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);
    const applications = db.prepare(`
      SELECT a.*, j.title as job_title, j.opportunity_type, j.work_mode, j.location,
             ep.org_name, ev.status as employer_verification_status,
             ass.id as assessment_session_id, ass.status as assessment_status,
             cf.id as feedback_id, cf.can_reapply
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN employer_profiles ep ON ep.id = j.employer_id
      LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
      LEFT JOIN assessment_sessions ass ON ass.application_id = a.id
      LEFT JOIN candidate_feedback cf ON cf.application_id = a.id
      WHERE a.candidate_id = ?
      ORDER BY a.updated_at DESC
    `).all(profile.id) as any[];

    // Fetch history for each
    const enriched = applications.map((app) => {
      const history = db.prepare(`
        SELECT ash.*, u.name as changed_by_name
        FROM application_status_history ash
        LEFT JOIN users u ON u.id = ash.changed_by
        WHERE ash.application_id = ?
        ORDER BY ash.created_at ASC
      `).all(app.id);

      return {
        ...app,
        history,
      };
    });

    res.json({ applications: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
});

candidateRouter.get('/me/growth', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);

    const miniProjects = db.prepare(`
      SELECT mp.*, cf.feedback_message, a.job_id, j.title as job_title, ep.org_name
      FROM mini_projects mp
      LEFT JOIN candidate_feedback cf ON cf.id = mp.feedback_id
      LEFT JOIN applications a ON a.id = cf.application_id
      LEFT JOIN jobs j ON j.id = a.job_id
      LEFT JOIN employer_profiles ep ON ep.id = j.employer_id
      WHERE mp.candidate_id = ?
      ORDER BY mp.created_at DESC
    `).all(profile.id) as any[];

    const verifiedEvidence = db.prepare(`
      SELECT pe.*, s.name as skill_name, mp.title as project_title
      FROM profile_evidence pe
      LEFT JOIN skills s ON s.name = pe.skill_name
      LEFT JOIN mini_projects mp ON mp.id = pe.mini_project_id
      WHERE pe.candidate_id = ?
      ORDER BY pe.verified_at DESC
    `).all(profile.id);

    const feedbacks = db.prepare(`
      SELECT cf.*, j.title as job_title, ep.org_name, a.job_id, a.id as application_id
      FROM candidate_feedback cf
      JOIN applications a ON a.id = cf.application_id
      JOIN jobs j ON j.id = a.job_id
      JOIN employer_profiles ep ON ep.id = j.employer_id
      WHERE a.candidate_id = ?
      ORDER BY cf.created_at DESC
    `).all(profile.id) as any[];

    // Check opportunities ready for reapplication
    const reapplyEligible = feedbacks.filter((f) => Boolean(f.can_reapply)).map((f) => {
      const hasAcceptedProject = miniProjects.some(
        (mp) => mp.feedback_id === f.id && mp.status === 'accepted'
      );
      return {
        feedbackId: f.id,
        applicationId: f.application_id,
        jobId: f.job_id,
        jobTitle: f.job_title,
        orgName: f.org_name,
        hasAcceptedProject,
      };
    });

    res.json({
      miniProjects,
      verifiedEvidence,
      feedbacks,
      reapplyEligible,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch growth dashboard', details: err.message });
  }
});

candidateRouter.post('/me/evidence', requireAuth, requireRole('candidate'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = getCandidateProfile(req.user!.userId);
    const { skill_name, title, description, evidence_url, mini_project_id } = req.body;

    if (!skill_name || !title) {
      res.status(400).json({ error: 'Skill name and title are required' });
      return;
    }

    const evidenceId = 'evd_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO profile_evidence (id, candidate_id, skill_name, title, description, evidence_url, mini_project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(evidenceId, profile.id, skill_name, title, description || '', evidence_url || '', mini_project_id || null);

    // Ensure skill exists in candidate skills as project_verified
    let skillRow = db.prepare('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)').get(skill_name.trim()) as any;
    if (!skillRow) {
      const sId = 'skl_' + crypto.randomUUID().slice(0, 8);
      db.prepare('INSERT INTO skills (id, name, category) VALUES (?, ?, ?)').run(sId, skill_name.trim(), 'Demonstrated');
      skillRow = { id: sId };
    }

    const candSkill = db.prepare('SELECT id FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?').get(profile.id, skillRow.id) as any;
    if (candSkill) {
      db.prepare(`
        UPDATE candidate_skills
        SET evidence_source = 'project_verified', verified_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(candSkill.id);
    } else {
      db.prepare(`
        INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
        VALUES (?, ?, ?, 'intermediate', 'project_verified', CURRENT_TIMESTAMP)
      `).run('csk_' + crypto.randomUUID().slice(0, 8), profile.id, skillRow.id);
    }

    res.status(201).json({ message: 'Evidence added and profile skill updated with verification badge' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add evidence', details: err.message });
  }
});
