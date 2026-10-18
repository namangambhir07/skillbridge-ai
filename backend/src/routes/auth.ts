import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['candidate', 'employer', 'mentor']),
  orgName: z.string().optional(),
  headline: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation failed', details: parse.error.issues });
      return;
    }

    const { email, password, name, role, orgName, headline } = parse.data;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const passwordHash = hashPassword(password);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, email, passwordHash, role, name);

    // Create role-specific profile
    if (role === 'candidate') {
      const candId = 'cand_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO candidate_profiles (id, user_id, headline, bio, preferred_work_mode, availability)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(candId, userId, headline || 'Aspiring Professional', 'Eager to learn and contribute.', 'remote', 'Immediate');
    } else if (role === 'employer') {
      const empId = 'emp_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO employer_profiles (id, user_id, org_name, description)
        VALUES (?, ?, ?, ?)
      `).run(empId, userId, orgName || `${name}'s Company`, 'Fast-growing technology team.');

      // Initialize verification record
      db.prepare(`
        INSERT INTO employer_verifications (id, employer_id, status)
        VALUES (?, ?, 'not_submitted')
      `).run('ver_' + crypto.randomUUID().slice(0, 8), empId);
    } else if (role === 'mentor') {
      const mentorId = 'men_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO mentors (id, user_id, headline, expertise, skills, experience_years, bio, availability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        mentorId,
        userId,
        headline || 'Experienced Mentor',
        'Software Architecture & Career Guidance',
        JSON.stringify(['System Design', 'React', 'TypeScript']),
        5,
        'Passionate about helping candidates bridge skill gaps.',
        'Weekly office hours'
      );
    }

    const token = generateToken({
      userId,
      email,
      role,
      name,
    });

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid login details', details: parse.error.issues });
      return;
    }

    const { email, password } = parse.data;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !comparePassword(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let profileData = null;
    if (user.role === 'candidate') {
      profileData = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(user.id);
    } else if (user.role === 'employer') {
      profileData = db.prepare(`
        SELECT ep.*, ev.status as verification_status
        FROM employer_profiles ep
        LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
        WHERE ep.user_id = ?
      `).get(user.id);
    } else if (user.role === 'mentor') {
      profileData = db.prepare('SELECT * FROM mentors WHERE user_id = ?').get(user.id);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      profile: profileData,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let profile = null;
    if (user.role === 'candidate') {
      profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(user.id) as any;
      if (profile) {
        const skills = db.prepare(`
          SELECT cs.id, s.name, cs.proficiency_level, cs.evidence_source, cs.verified_at
          FROM candidate_skills cs
          JOIN skills s ON s.id = cs.skill_id
          WHERE cs.candidate_id = ?
        `).all(profile.id);
        profile.skills = skills;
      }
    } else if (user.role === 'employer') {
      profile = db.prepare(`
        SELECT ep.*, ev.status as verification_status, ev.registration_number, ev.reviewer_notes
        FROM employer_profiles ep
        LEFT JOIN employer_verifications ev ON ev.employer_id = ep.id
        WHERE ep.user_id = ?
      `).get(user.id);
    } else if (user.role === 'mentor') {
      profile = db.prepare('SELECT * FROM mentors WHERE user_id = ?').get(user.id);
    }

    res.json({ user, profile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
});

authRouter.get('/demo-accounts', (_req: Request, res: Response) => {
  res.json({
    candidate: {
      email: 'candidate@skillbridge.ai',
      password: 'Candidate123!',
      role: 'candidate',
      name: 'Alex Rivera',
      description: 'Job seeker ready for assessments, growth, and reapplication.',
    },
    employer: {
      email: 'employer@skillbridge.ai',
      password: 'Employer123!',
      role: 'employer',
      name: 'Elena Rostova',
      orgName: 'Nexus Cloud Systems',
      description: 'Verified tech company looking for talent through Trace assessments.',
    },
    mentor: {
      email: 'mentor@skillbridge.ai',
      password: 'Mentor123!',
      role: 'mentor',
      name: 'Marcus Chen',
      description: 'Senior engineer offering career guidance and project mentorship.',
    },
    admin: {
      email: 'admin@skillbridge.ai',
      password: 'Admin123!',
      role: 'admin',
      name: 'Sarah Jenkins',
      description: 'Platform moderator managing employer verification and safety reports.',
    },
  });
});
