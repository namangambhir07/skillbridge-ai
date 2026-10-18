import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

export const feedbackRouter = Router();

feedbackRouter.post('/applications/:id/feedback', requireAuth, requireRole('employer', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = req.params.id;
    const {
      strengths,
      skill_gaps,
      feedback_message,
      learning_resources,
      can_reapply,
      mini_project,
    } = req.body;

    if (!strengths || !skill_gaps || !feedback_message) {
      res.status(400).json({ error: 'Strengths, skill gaps, and feedback message are required' });
      return;
    }

    const app = (await db.prepare(`
      SELECT a.*, cp.id as candidate_profile_id, cp.user_id as candidate_user_id, j.title as job_title
      FROM applications a
      JOIN candidate_profiles cp ON cp.id = a.candidate_id
      JOIN jobs j ON j.id = a.job_id
      WHERE a.id = ?
    `).get(applicationId)) as any;

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const feedbackId = 'fbk_' + crypto.randomUUID().slice(0, 8);
    const gapsArray = Array.isArray(skill_gaps) ? skill_gaps : [skill_gaps];
    const resourcesArray = Array.isArray(learning_resources) ? learning_resources : (learning_resources ? [learning_resources] : []);

    await db.prepare(`
      INSERT INTO candidate_feedback (
        id, application_id, reviewer_id, strengths, skill_gaps, feedback_message, learning_resources, can_reapply
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      feedbackId,
      applicationId,
      req.user!.userId,
      strengths,
      JSON.stringify(gapsArray),
      feedback_message,
      JSON.stringify(resourcesArray),
      can_reapply !== undefined ? (can_reapply ? 1 : 0) : 1
    );

    // Update application status to improvement_suggested
    await db.prepare(`
      UPDATE applications
      SET status = 'improvement_suggested', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(applicationId);

    await db.prepare(`
      INSERT INTO application_status_history (id, application_id, status, notes, changed_by)
      VALUES (?, ?, 'improvement_suggested', 'Detailed constructive feedback and growth roadmap provided.', ?)
    `).run('ash_' + crypto.randomUUID().slice(0, 8), applicationId, req.user!.userId);

    // Assign mini-project if specified
    let miniProjectId = null;
    if (mini_project && mini_project.title && mini_project.objective) {
      miniProjectId = 'mp_' + crypto.randomUUID().slice(0, 8);
      await db.prepare(`
        INSERT INTO mini_projects (
          id, feedback_id, candidate_id, title, skill_name, objective, requirements, acceptance_criteria, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'assigned')
      `).run(
        miniProjectId,
        feedbackId,
        app.candidate_profile_id,
        mini_project.title,
        mini_project.skill_name || gapsArray[0] || 'Technical Skill',
        mini_project.objective,
        mini_project.requirements || 'Build a functioning component addressing the identified gap.',
        mini_project.acceptance_criteria || 'Working demo code, clean error handling, and concise explanation.'
      );
    }

    // Notify candidate
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'Constructive Feedback & Growth Path Received', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      app.candidate_user_id,
      `You received feedback on your application for "${app.job_title}". A mini-project was recommended to help you qualify for reapplication.`,
      '/candidate/growth'
    );

    res.status(201).json({
      message: 'Feedback recorded and mini-project assigned to candidate',
      feedbackId,
      miniProjectId,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record feedback', details: err.message });
  }
});

feedbackRouter.get('/mini-projects/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = (await db.prepare(`
      SELECT mp.*, cf.feedback_message, cf.strengths, cf.can_reapply,
             j.title as job_title, ep.org_name
      FROM mini_projects mp
      LEFT JOIN candidate_feedback cf ON cf.id = mp.feedback_id
      LEFT JOIN applications a ON a.id = cf.application_id
      LEFT JOIN jobs j ON j.id = a.job_id
      LEFT JOIN employer_profiles ep ON ep.id = j.employer_id
      WHERE mp.id = ?
    `).get(req.params.id)) as any;

    if (!project) {
      res.status(404).json({ error: 'Mini-project not found' });
      return;
    }

    const submissions = await db.prepare(`
      SELECT * FROM mini_project_submissions
      WHERE mini_project_id = ?
      ORDER BY submitted_at DESC
    `).all(project.id);

    res.json({ project, submissions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch mini-project', details: err.message });
  }
});

feedbackRouter.post('/mini-projects/:id/submit', requireAuth, requireRole('candidate'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submission_text, repo_url, explanation } = req.body;
    const miniProjectId = req.params.id;

    if (!submission_text || !explanation) {
      res.status(400).json({ error: 'Submission details and explanation of implementation are required' });
      return;
    }

    const project = (await db.prepare(`
      SELECT mp.*, cf.reviewer_id, a.id as application_id, j.title as job_title
      FROM mini_projects mp
      JOIN candidate_feedback cf ON cf.id = mp.feedback_id
      JOIN applications a ON a.id = cf.application_id
      JOIN jobs j ON j.id = a.job_id
      WHERE mp.id = ?
    `).get(miniProjectId)) as any;

    if (!project) {
      res.status(404).json({ error: 'Mini-project not found' });
      return;
    }

    const subId = 'mps_' + crypto.randomUUID().slice(0, 8);
    await db.prepare(`
      INSERT INTO mini_project_submissions (
        id, mini_project_id, submission_text, repo_url, explanation, status
      ) VALUES (?, ?, ?, ?, ?, 'under_review')
    `).run(subId, miniProjectId, submission_text, repo_url || '', explanation);

    await db.prepare(`
      UPDATE mini_projects
      SET status = 'submitted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(miniProjectId);

    // Notify reviewer / employer
    if (project.reviewer_id) {
      await db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link)
        VALUES (?, ?, 'Mini-Project Submitted for Verification', ?, ?)
      `).run(
        'not_' + crypto.randomUUID().slice(0, 8),
        project.reviewer_id,
        `${req.user!.name} submitted practical evidence for "${project.title}".`,
        `/employer/applicants`
      );
    }

    res.status(201).json({
      message: 'Mini-project submitted for review. Once verified, it will be added to your profile evidence.',
      submissionId: subId,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Mini-project submission failed', details: err.message });
  }
});

feedbackRouter.post('/mini-projects/:id/review', requireAuth, requireRole('employer', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const miniProjectId = req.params.id;
    const { status, reviewer_feedback } = req.body;

    if (!['accepted', 'revision_requested', 'not_demonstrated'].includes(status)) {
      res.status(400).json({ error: 'Invalid review status. Must be accepted, revision_requested, or not_demonstrated' });
      return;
    }

    const project = (await db.prepare(`
      SELECT mp.*, cp.id as candidate_profile_id, cp.user_id as candidate_user_id,
             cf.application_id, j.id as job_id, j.title as job_title
      FROM mini_projects mp
      JOIN candidate_profiles cp ON cp.id = mp.candidate_id
      LEFT JOIN candidate_feedback cf ON cf.id = mp.feedback_id
      LEFT JOIN applications a ON a.id = cf.application_id
      LEFT JOIN jobs j ON j.id = a.job_id
      WHERE mp.id = ?
    `).get(miniProjectId)) as any;

    if (!project) {
      res.status(404).json({ error: 'Mini-project not found' });
      return;
    }

    await db.prepare(`
      UPDATE mini_projects
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, miniProjectId);

    // Update latest submission
    await db.prepare(`
      UPDATE mini_project_submissions
      SET status = ?, reviewer_feedback = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE mini_project_id = ?
    `).run(status, reviewer_feedback || '', miniProjectId);

    // If accepted: automatically attach to candidate profile evidence!
    if (status === 'accepted') {
      const evidenceId = 'evd_' + crypto.randomUUID().slice(0, 8);
      await db.prepare(`
        INSERT INTO profile_evidence (id, candidate_id, skill_name, title, description, mini_project_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        evidenceId,
        project.candidate_profile_id,
        project.skill_name,
        `Verified Mini-Project: ${project.title}`,
        reviewer_feedback || 'Demonstrated practical competence through reviewed project implementation.',
        miniProjectId
      );

      // Upgrade candidate skill to project_verified
      let skillRow = (await db.prepare('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)').get(project.skill_name.trim())) as any;
      if (!skillRow) {
        const sId = 'skl_' + crypto.randomUUID().slice(0, 8);
        await db.prepare('INSERT INTO skills (id, name, category) VALUES (?, ?, ?)').run(sId, project.skill_name.trim(), 'Verified');
        skillRow = { id: sId };
      }

      const existingCandSkill = (await db.prepare(`
        SELECT id FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?
      `).get(project.candidate_profile_id, skillRow.id)) as any;

      if (existingCandSkill) {
        await db.prepare(`
          UPDATE candidate_skills
          SET proficiency_level = 'advanced',
              evidence_source = 'project_verified',
              verified_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existingCandSkill.id);
      } else {
        await db.prepare(`
          INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
          VALUES (?, ?, ?, 'advanced', 'project_verified', CURRENT_TIMESTAMP)
        `).run('csk_' + crypto.randomUUID().slice(0, 8), project.candidate_profile_id, skillRow.id);
      }
    }

    // Notify candidate
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      project.candidate_user_id,
      status === 'accepted' ? 'Mini-Project Accepted & Skill Verified!' : 'Mini-Project Review Updated',
      status === 'accepted'
        ? `Your practical project for "${project.title}" was accepted! Your profile has been updated with verified skill evidence.`
        : `Your project for "${project.title}" was reviewed with status "${status}". Check feedback.`,
      '/candidate/growth'
    );

    res.json({
      message: `Mini-project review saved with status "${status}"`,
      status,
      verifiedEvidenceAdded: status === 'accepted',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Review submission failed', details: err.message });
  }
});

feedbackRouter.post('/applications/:id/reapply', requireAuth, requireRole('candidate'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { note } = req.body;

    const previousApp = (await db.prepare(`
      SELECT a.*, j.title as job_title, j.employer_id, cp.id as candidate_profile_id
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN candidate_profiles cp ON cp.id = a.candidate_id
      WHERE a.id = ?
    `).get(applicationId)) as any;

    if (!previousApp) {
      res.status(404).json({ error: 'Original application not found' });
      return;
    }

    // Check if feedback permits reapplication
    const feedback = (await db.prepare('SELECT * FROM candidate_feedback WHERE application_id = ?').get(applicationId)) as any;
    if (feedback && feedback.can_reapply === 0) {
      res.status(400).json({ error: 'This opportunity does not currently permit reapplication.' });
      return;
    }

    // Check completed evidence
    const completedProjects = (await db.prepare(`
      SELECT COUNT(*) as count FROM mini_projects
      WHERE candidate_id = ? AND status = 'accepted'
    `).get(previousApp.candidate_profile_id)) as any;

    const completedCount = Number(completedProjects?.count || 0);
    const newAppId = 'app_' + crypto.randomUUID().slice(0, 8);
    const reapplyCount = (previousApp.reapplication_count || 0) + 1;

    await db.prepare(`
      INSERT INTO applications (
        id, job_id, candidate_id, status, reapplication_count, previous_application_id
      ) VALUES (?, ?, ?, 'under_review', ?, ?)
    `).run(
      newAppId,
      previousApp.job_id,
      previousApp.candidate_profile_id,
      reapplyCount,
      previousApp.id
    );

    await db.prepare(`
      INSERT INTO application_status_history (id, application_id, status, notes, changed_by)
      VALUES (?, ?, 'under_review', ?, ?)
    `).run(
      'ash_' + crypto.randomUUID().slice(0, 8),
      newAppId,
      `Evidence-based reapplication (Iteration #${reapplyCount}). ${completedCount} verified practical projects attached. Note: ${note || 'Updated profile with verified project evidence.'}`,
      req.user!.userId
    );

    // Notify employer
    const empUser = (await db.prepare('SELECT user_id FROM employer_profiles WHERE id = ?').get(previousApp.employer_id)) as any;
    if (empUser) {
      await db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link)
        VALUES (?, ?, 'Evidence-Based Reapplication Received', ?, ?)
      `).run(
        'not_' + crypto.randomUUID().slice(0, 8),
        empUser.user_id,
        `${req.user!.name} has re-applied for "${previousApp.job_title}" after completing recommended skill improvements.`,
        `/employer/jobs/${previousApp.job_id}`
      );
    }

    res.status(201).json({
      message: 'Reapplication submitted successfully with updated evidence!',
      newApplicationId: newAppId,
      reapplicationCount: reapplyCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Reapplication failed', details: err.message });
  }
});
