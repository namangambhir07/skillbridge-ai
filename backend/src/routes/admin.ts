import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

export const adminRouter = Router();

adminRouter.get('/stats', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = Number(((await db.prepare('SELECT COUNT(*) as c FROM users').get()) as any)?.c || 0);
    const candidates = Number(((await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'candidate'").get()) as any)?.c || 0);
    const employers = Number(((await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'employer'").get()) as any)?.c || 0);
    const totalJobs = Number(((await db.prepare('SELECT COUNT(*) as c FROM jobs').get()) as any)?.c || 0);
    const pendingVerifications = Number(((await db.prepare("SELECT COUNT(*) as c FROM employer_verifications WHERE status = 'pending_review'").get()) as any)?.c || 0);
    const openReports = Number(((await db.prepare("SELECT COUNT(*) as c FROM job_reports WHERE status = 'open'").get()) as any)?.c || 0);
    const completedAssessments = Number(((await db.prepare("SELECT COUNT(*) as c FROM assessment_sessions WHERE status = 'completed'").get()) as any)?.c || 0);
    const completedMiniProjects = Number(((await db.prepare("SELECT COUNT(*) as c FROM mini_projects WHERE status = 'accepted'").get()) as any)?.c || 0);

    res.json({
      totalUsers,
      candidates,
      employers,
      totalJobs,
      pendingVerifications,
      openReports,
      completedAssessments,
      completedMiniProjects,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message });
  }
});

adminRouter.get('/verifications', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await db.prepare(`
      SELECT ev.*, ep.org_name, ep.org_website, ep.business_email, ep.description,
             u.name as owner_name, u.email as owner_email
      FROM employer_verifications ev
      JOIN employer_profiles ep ON ep.id = ev.employer_id
      JOIN users u ON u.id = ep.user_id
      ORDER BY ev.updated_at DESC
    `).all();
    res.json({ verifications: list });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch verifications', details: err.message });
  }
});

adminRouter.patch('/verifications/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reviewer_notes } = req.body;

    if (!['verified', 'rejected', 'additional_info_required', 'pending_review'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status' });
      return;
    }

    const verification = (await db.prepare(`
      SELECT ev.*, ep.org_name, ep.user_id
      FROM employer_verifications ev
      JOIN employer_profiles ep ON ep.id = ev.employer_id
      WHERE ev.id = ?
    `).get(req.params.id)) as any;

    if (!verification) {
      res.status(404).json({ error: 'Verification record not found' });
      return;
    }

    await db.prepare(`
      UPDATE employer_verifications
      SET status = ?,
          reviewer_notes = ?,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, reviewer_notes || '', req.user!.userId, req.params.id);

    // Audit log
    await db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details)
      VALUES (?, ?, 'employer_verification_review', 'employer_verification', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 8),
      req.user!.userId,
      verification.id,
      `Status changed to ${status}. Notes: ${reviewer_notes || 'None'}`
    );

    // Notify employer
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'Employer Verification Status Update', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      verification.user_id,
      `Your organization verification status was updated to: ${status.replace('_', ' ').toUpperCase()}.`,
      '/employer/dashboard'
    );

    res.json({ message: `Verification status updated to ${status}`, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update verification', details: err.message });
  }
});

adminRouter.get('/reports', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await db.prepare(`
      SELECT jr.*, j.title as job_title, j.status as job_status, ep.org_name,
             u.name as reporter_name, u.email as reporter_email
      FROM job_reports jr
      JOIN jobs j ON j.id = jr.job_id
      JOIN employer_profiles ep ON ep.id = j.employer_id
      JOIN users u ON u.id = jr.reporter_id
      ORDER BY jr.created_at DESC
    `).all();

    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch job reports', details: err.message });
  }
});

adminRouter.patch('/reports/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, moderator_notes, suspend_job } = req.body;

    if (!['open', 'under_review', 'action_taken', 'dismissed'].includes(status)) {
      res.status(400).json({ error: 'Invalid report status' });
      return;
    }

    const report = (await db.prepare('SELECT * FROM job_reports WHERE id = ?').get(req.params.id)) as any;
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    await db.prepare(`
      UPDATE job_reports
      SET status = ?,
          moderator_notes = ?,
          reviewed_by = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, moderator_notes || '', req.user!.userId, req.params.id);

    if (suspend_job) {
      await db.prepare(`UPDATE jobs SET status = 'suspended' WHERE id = ?`).run(report.job_id);
    }

    // Audit log
    await db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details)
      VALUES (?, ?, 'job_report_moderation', 'job_report', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 8),
      req.user!.userId,
      report.id,
      `Report status set to ${status}. Suspend job: ${suspend_job ? 'YES' : 'NO'}. Notes: ${moderator_notes || 'None'}`
    );

    res.json({ message: 'Report status updated', status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});

adminRouter.post('/jobs/:id/suspend', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action } = req.body;
    const newStatus = action === 'reinstate' ? 'published' : 'suspended';

    await db.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, req.params.id);

    await db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details)
      VALUES (?, ?, 'job_status_change', 'job', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 8),
      req.user!.userId,
      req.params.id,
      `Job status changed to ${newStatus}`
    );

    res.json({ message: `Job ${action === 'reinstate' ? 'reinstated' : 'suspended'} successfully`, status: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job status', details: err.message });
  }
});

adminRouter.get('/audit-logs', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await db.prepare(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});
