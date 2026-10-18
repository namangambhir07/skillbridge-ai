import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest, optionalAuth } from '../middleware/auth.js';

export const communityRouter = Router();

// Startups & Co-founders
communityRouter.get('/startups', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, stage, commitment } = req.query;
    let query = `
      SELECT sp.*, u.name as founder_name, u.email as founder_email
      FROM startup_profiles sp
      JOIN users u ON u.id = sp.founder_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (domain) {
      query += ' AND LOWER(sp.domain) LIKE ?';
      params.push(`%${String(domain).toLowerCase()}%`);
    }

    if (stage) {
      query += ' AND sp.stage = ?';
      params.push(stage);
    }

    if (commitment) {
      query += ' AND sp.commitment_type = ?';
      params.push(commitment);
    }

    query += ' ORDER BY sp.created_at DESC';

    const startups = (await db.prepare(query).all(...params)) as any[];

    // Parse skills_needed
    const enriched = startups.map((s) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(s.skills_needed);
      } catch {
        skills = [s.skills_needed];
      }
      return { ...s, skills_needed: skills };
    });

    res.json({ startups: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch startups', details: err.message });
  }
});

communityRouter.post('/startups', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed } = req.body;

    if (!company_name || !domain || !tagline || !description) {
      res.status(400).json({ error: 'Missing required startup fields' });
      return;
    }

    const startupId = 'stp_' + crypto.randomUUID().slice(0, 8);
    const skillsArray = Array.isArray(skills_needed) ? skills_needed : [skills_needed || 'Product Development'];

    await db.prepare(`
      INSERT INTO startup_profiles (
        id, founder_id, company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      startupId,
      req.user!.userId,
      company_name,
      domain,
      tagline,
      description,
      stage || 'Prototype',
      commitment_type || 'Flexible',
      roles_needed || 'Technical Co-founder',
      JSON.stringify(skillsArray)
    );

    res.status(201).json({ message: 'Startup opportunity published', startupId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create startup listing', details: err.message });
  }
});

communityRouter.post('/startups/:id/express-interest', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const startupId = req.params.id;
    const { message, relevant_skills } = req.body;

    const candProfile = (await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId)) as any;
    if (!candProfile) {
      res.status(403).json({ error: 'Candidate profile required to express interest' });
      return;
    }

    const startup = (await db.prepare('SELECT * FROM startup_profiles WHERE id = ?').get(startupId)) as any;
    if (!startup) {
      res.status(404).json({ error: 'Startup opportunity not found' });
      return;
    }

    const interestId = 'int_' + crypto.randomUUID().slice(0, 8);
    await db.prepare(`
      INSERT INTO cofounder_interests (id, startup_id, candidate_id, message, relevant_skills, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(interestId, startupId, candProfile.id, message || 'Interested in collaborating.', relevant_skills || 'Full-Stack Development');

    // Notify founder
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'New Co-Founder Interest Expressed', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      startup.founder_id,
      `${req.user!.name} expressed interest in joining "${startup.company_name}".`,
      '/community/startups'
    );

    res.status(201).json({ message: 'Interest expressed successfully!', interestId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to express interest', details: err.message });
  }
});

// Mentors Directory
communityRouter.get('/mentors', async (_req, res) => {
  try {
    const mentors = (await db.prepare(`
      SELECT m.*, u.name, u.email
      FROM mentors m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC
    `).all()) as any[];

    const enriched = mentors.map((m) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(m.skills);
      } catch {
        skills = [m.skills];
      }
      return { ...m, skills };
    });

    res.json({ mentors: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch mentors', details: err.message });
  }
});

communityRouter.post('/mentors/:id/request', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mentorId = req.params.id;
    const { message, goals } = req.body;

    const candProfile = (await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user!.userId)) as any;
    if (!candProfile) {
      res.status(403).json({ error: 'Candidate profile required to request mentorship' });
      return;
    }

    const mentor = (await db.prepare('SELECT * FROM mentors WHERE id = ?').get(mentorId)) as any;
    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }

    const requestId = 'mrq_' + crypto.randomUUID().slice(0, 8);
    await db.prepare(`
      INSERT INTO mentorship_requests (id, mentor_id, candidate_id, message, goals, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(requestId, mentorId, candProfile.id, message || 'Seeking career guidance and skill roadmap support.', goals || 'Improve system design and practical project evidence.');

    // Notify mentor
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'New Mentorship Request', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      mentor.user_id,
      `${req.user!.name} requested mentorship for skill growth.`,
      '/mentor/requests'
    );

    res.status(201).json({ message: 'Mentorship request sent successfully!', requestId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send mentorship request', details: err.message });
  }
});

communityRouter.get('/mentors/my-requests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mentor = (await db.prepare('SELECT id FROM mentors WHERE user_id = ?').get(req.user!.userId)) as any;
    if (!mentor) {
      res.status(403).json({ error: 'Only registered mentors can access this route' });
      return;
    }

    const requests = await db.prepare(`
      SELECT mr.*, cp.headline, cp.bio, u.name as candidate_name, u.email as candidate_email
      FROM mentorship_requests mr
      JOIN candidate_profiles cp ON cp.id = mr.candidate_id
      JOIN users u ON u.id = cp.user_id
      WHERE mr.mentor_id = ?
      ORDER BY mr.created_at DESC
    `).all(mentor.id);

    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch mentor requests', details: err.message });
  }
});

communityRouter.patch('/mentors/requests/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, feedback } = req.body;

    const request = (await db.prepare(`
      SELECT mr.*, cp.user_id as candidate_user_id, u.name as mentor_name
      FROM mentorship_requests mr
      JOIN mentors m ON m.id = mr.mentor_id
      JOIN users u ON u.id = m.user_id
      JOIN candidate_profiles cp ON cp.id = mr.candidate_id
      WHERE mr.id = ?
    `).get(req.params.id)) as any;

    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    await db.prepare(`
      UPDATE mentorship_requests
      SET status = ?, feedback = ?
      WHERE id = ?
    `).run(status, feedback || '', req.params.id);

    // Notify candidate
    await db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link)
      VALUES (?, ?, 'Mentorship Request Update', ?, ?)
    `).run(
      'not_' + crypto.randomUUID().slice(0, 8),
      request.candidate_user_id,
      `Your mentorship request was marked as "${status}". Note: ${feedback || 'Check details.'}`,
      '/community/mentors'
    );

    res.json({ message: `Mentorship request updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update mentorship request', details: err.message });
  }
});
