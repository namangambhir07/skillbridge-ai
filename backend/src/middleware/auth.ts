import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { db } from '../db/database.js';

export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: TokenPayload & { candidateProfileId?: string; employerProfileId?: string };
  headers: Request['headers'];
  body: ReqBody;
  params: P;
  query: ReqQuery;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  // Check if user still exists in database
  const user = (await db.prepare('SELECT id, email, role, name FROM users WHERE id = ?').get(payload.userId)) as any;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not found' });
    return;
  }

  req.user = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  if (user.role === 'candidate') {
    const profile = (await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(user.id)) as any;
    if (profile) req.user.candidateProfileId = profile.id;
  } else if (user.role === 'employer') {
    const profile = (await db.prepare('SELECT id FROM employer_profiles WHERE user_id = ?').get(user.id)) as any;
    if (profile) req.user.employerProfileId = profile.id;
  }

  next();
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      const user = (await db.prepare('SELECT id, email, role, name FROM users WHERE id = ?').get(payload.userId)) as any;
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
        if (user.role === 'candidate') {
          const profile = (await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(user.id)) as any;
          if (profile) req.user.candidateProfileId = profile.id;
        } else if (user.role === 'employer') {
          const profile = (await db.prepare('SELECT id FROM employer_profiles WHERE user_id = ?').get(user.id)) as any;
          if (profile) req.user.employerProfileId = profile.id;
        }
      }
    }
  }
  next();
}
