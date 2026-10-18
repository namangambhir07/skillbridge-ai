import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
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

// Initialize SQLite database schema
initDatabase();

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

// API Routes
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

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'SkillBridge AI',
    tagline: 'Better Matches. Faster Hiring. Real Opportunities.',
    assessmentEngine: 'Trace',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`SkillBridge AI Backend Service Running`);
    console.log(`API URL: http://localhost:${port}/api/v1`);
    console.log(`Health: http://localhost:${port}/api/v1/health`);
    console.log(`=========================================`);
  });
}

export default app;
