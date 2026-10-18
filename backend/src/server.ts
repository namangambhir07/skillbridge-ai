import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, checkDatabaseHealth } from './db/database.js';
import { ensureDemoData } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { candidateRouter } from './routes/candidates.js';
import { jobRouter } from './routes/jobs.js';
import { employerRouter } from './routes/employers.js';
import { assessmentRouter } from './routes/assessments.js';
import { feedbackRouter } from './routes/feedback.js';
import { adminRouter } from './routes/admin.js';
import { communityRouter } from './routes/community.js';
import { notificationRouter } from './routes/notifications.js';

dotenv.config();

// Initialize PostgreSQL database schema asynchronously and ensure baseline demo accounts exist
initDatabase()
  .then(() => ensureDemoData())
  .catch((err) => {
    console.error('[Startup Database Error]: Failed to initialize database schema or demo accounts:', err.message);
  });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes - Canonical
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/candidates', candidateRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/employers', employerRouter);
app.use('/api/v1/assessments', assessmentRouter);
app.use('/api/v1/assessment-sessions', assessmentRouter);
app.use('/api/v1', feedbackRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/community', communityRouter);
app.use('/api/v1/notifications', notificationRouter);

// API Route Aliases (protects against missing /auth, missing /v1, or proxy rewrites)
app.use('/api/v1', authRouter); // Supports /api/v1/register, /api/v1/login, /api/v1/me
app.use('/api/auth', authRouter); // Supports /api/auth/register, /api/auth/login
app.use('/auth', authRouter); // Supports /auth/register, /auth/login

// Health check with database connectivity probe
const healthHandler = async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const statusCode = dbHealth.healthy ? 200 : 503;
  res.status(statusCode).json({
    status: dbHealth.healthy ? 'healthy' : 'degraded',
    database: dbHealth.healthy ? 'connected' : 'disconnected',
    databaseType: dbHealth.type,
    product: 'SkillBridge AI',
    tagline: 'Better Matches. Faster Hiring. Real Opportunities.',
    assessmentEngine: 'Trace',
    timestamp: new Date().toISOString(),
    ...(dbHealth.error ? { databaseError: dbHealth.error } : {}),
  });
};

app.get('/api/v1/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`SkillBridge AI Backend Service Running`);
    console.log(`API URL: http://localhost:${port}/api/v1`);
    console.log(`Health: http://localhost:${port}/api/v1/health`);
    console.log(`=========================================`);
  });
}

export default app;
