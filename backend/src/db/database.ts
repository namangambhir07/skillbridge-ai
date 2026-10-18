import pg from 'pg';
import { newDb } from 'pg-mem';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export function sanitizeConnectionString(url?: string): string {
  if (!url) return 'none (in-memory PostgreSQL)';
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return url.replace(/(:\/\/)([^:]+):([^@]+)@/g, '$1$2:***@');
  }
}

export const DDL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('candidate', 'employer', 'mentor', 'admin')),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candidate_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    education TEXT,
    experience TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    preferred_roles TEXT,
    preferred_work_mode TEXT CHECK(preferred_work_mode IN ('remote', 'hybrid', 'onsite', 'any')),
    location_preference TEXT,
    availability TEXT,
    profile_visibility TEXT DEFAULT 'public' CHECK(profile_visibility IN ('public', 'verified_employers_only', 'private')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_name TEXT NOT NULL,
    org_website TEXT,
    business_email TEXT,
    industry TEXT,
    company_size TEXT,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employer_verifications (
    id TEXT PRIMARY KEY,
    employer_id TEXT UNIQUE NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_submitted' CHECK(status IN ('not_submitted', 'pending_review', 'additional_info_required', 'verified', 'rejected')),
    registration_number TEXT,
    supporting_info TEXT,
    reviewer_notes TEXT,
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS candidate_skills (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL CHECK(proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    evidence_source TEXT NOT NULL DEFAULT 'self_reported' CHECK(evidence_source IN ('self_reported', 'assessment_verified', 'project_verified')),
    verified_at TIMESTAMP,
    UNIQUE(candidate_id, skill_id)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    employer_id TEXT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK(opportunity_type IN ('job', 'internship')),
    category TEXT NOT NULL,
    work_mode TEXT NOT NULL CHECK(work_mode IN ('remote', 'hybrid', 'onsite')),
    location TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    eligibility_criteria TEXT,
    salary_range TEXT,
    deadline TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'review_required', 'published', 'closed', 'suspended')),
    safety_verdict TEXT DEFAULT 'ALLOW',
    safety_reasons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS job_skill_requirements (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required INTEGER NOT NULL DEFAULT 1,
    min_proficiency TEXT DEFAULT 'intermediate',
    UNIQUE(job_id, skill_id)
  );

  CREATE TABLE IF NOT EXISTS saved_opportunities (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK(task_type IN ('coding', 'writing', 'data_analysis', 'problem_solving')),
    initial_prompt TEXT NOT NULL,
    follow_up_prompt TEXT NOT NULL,
    evaluation_criteria TEXT NOT NULL,
    time_limit_minutes INTEGER DEFAULT 45,
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied' CHECK(status IN ('applied', 'under_review', 'assessment_required', 'assessment_submitted', 'shortlisted', 'improvement_suggested', 'selected', 'rejected', 'withdrawn')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reapplication_count INTEGER DEFAULT 0,
    previous_application_id TEXT REFERENCES applications(id)
  );

  CREATE TABLE IF NOT EXISTS application_status_history (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assessment_sessions (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'initial_submitted', 'follow_up_active', 'completed')),
    consent_accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    paste_count INTEGER DEFAULT 0,
    edit_count INTEGER DEFAULT 0,
    elapsed_seconds INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS assessment_submissions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    submission_type TEXT NOT NULL CHECK(submission_type IN ('initial', 'revision')),
    content TEXT NOT NULL,
    candidate_explanation TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('opened', 'consent_accepted', 'paste_event', 'editor_change', 'initial_submit', 'follow_up_viewed', 'revision_submit')),
    metadata TEXT,
    event_sequence INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS adaptation_evaluations (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    addresses_requirement REAL DEFAULT 1.0,
    relevance_score REAL DEFAULT 1.0,
    explanation_quality REAL DEFAULT 1.0,
    rubric_breakdown TEXT,
    feedback_summary TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candidate_feedback (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES users(id),
    strengths TEXT NOT NULL,
    skill_gaps TEXT NOT NULL,
    feedback_message TEXT NOT NULL,
    learning_resources TEXT,
    can_reapply INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mini_projects (
    id TEXT PRIMARY KEY,
    feedback_id TEXT REFERENCES candidate_feedback(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    objective TEXT NOT NULL,
    requirements TEXT NOT NULL,
    acceptance_criteria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK(status IN ('assigned', 'in_progress', 'submitted', 'under_review', 'accepted', 'revision_requested', 'not_demonstrated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mini_project_submissions (
    id TEXT PRIMARY KEY,
    mini_project_id TEXT NOT NULL REFERENCES mini_projects(id) ON DELETE CASCADE,
    submission_text TEXT NOT NULL,
    repo_url TEXT,
    explanation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'under_review' CHECK(status IN ('under_review', 'accepted', 'revision_requested', 'not_demonstrated')),
    reviewer_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile_evidence (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    evidence_url TEXT,
    mini_project_id TEXT REFERENCES mini_projects(id),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS job_reports (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL CHECK(category IN ('suspicious_employer', 'misleading_description', 'fee_request', 'scam_phishing', 'discriminatory', 'other')),
    description TEXT NOT NULL,
    evidence_notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'under_review', 'action_taken', 'dismissed')),
    moderator_notes TEXT,
    reviewed_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mentors (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    expertise TEXT NOT NULL,
    skills TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    bio TEXT NOT NULL,
    availability TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mentorship_requests (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    goals TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'completed')),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS startup_profiles (
    id TEXT PRIMARY KEY,
    founder_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    stage TEXT NOT NULL CHECK(stage IN ('Idea', 'Prototype', 'Early Traction', 'Scaling')),
    commitment_type TEXT NOT NULL CHECK(commitment_type IN ('Full-time', 'Part-time', 'Flexible')),
    roles_needed TEXT NOT NULL,
    skills_needed TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cofounder_interests (
    id TEXT PRIMARY KEY,
    startup_id TEXT NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    relevant_skills TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
  CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
  CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  CREATE INDEX IF NOT EXISTS idx_telemetry_session ON telemetry_events(session_id, event_sequence);
`;

interface PoolLike {
  query(text: string, params?: any[]): Promise<any>;
  end?(): Promise<void>;
}

let activePool: PoolLike | null = null;
let isInMemoryEngine = false;
let initPromise: Promise<void> | null = null;

export function getPool(): PoolLike {
  if (activePool) return activePool;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString && connectionString.trim() !== '') {
    // Configure production PostgreSQL pool
    const isProduction = process.env.NODE_ENV === 'production';
    const requiresSsl =
      connectionString.includes('sslmode=require') ||
      connectionString.includes('sslmode=verify-full') ||
      isProduction;

    activePool = new Pool({
      connectionString,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    isInMemoryEngine = false;
    console.log(`[Database] Initialized PostgreSQL connection pool (${sanitizeConnectionString(connectionString)})`);
  } else {
    // Local development fallback: pure in-memory PostgreSQL engine
    const memDb = newDb();
    const pgAdapter = memDb.adapters.createPg();
    activePool = new pgAdapter.Pool();
    isInMemoryEngine = true;
    console.log('[Database] No DATABASE_URL provided. Running with in-memory PostgreSQL engine for local development/testing.');
    console.log('[Database] To connect persistent data, set DATABASE_URL=postgresql://user:pass@host:5432/dbname in .env');
  }

  return activePool!;
}

export function isUsingInMemory(): boolean {
  return isInMemoryEngine;
}

function convertPlaceholders(sql: string): string {
  if (!sql.includes('?')) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

function normalizeParams(params: any[]): any[] {
  const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  return flattened.map((p) => (p === undefined ? null : p));
}

export interface PreparedStatement {
  get(...params: any[]): Promise<any>;
  all(...params: any[]): Promise<any[]>;
  run(...params: any[]): Promise<{ changes: number; lastInsertRowid?: any }>;
}

export async function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const pool = getPool();
      try {
        await pool.query(DDL_SCHEMA);
        console.log('[Database] Schema verified and indexes initialized successfully.');
      } catch (err: any) {
        initPromise = null;
        console.error(`[Database Error] Failed to initialize schema: ${err.message}`);
        throw err;
      }
    })();
  }
  return initPromise;
}

export interface DatabaseHealthStatus {
  healthy: boolean;
  type: 'hosted-postgresql' | 'in-memory-postgresql';
  target: string;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const isPostgres = Boolean(process.env.DATABASE_URL);
  const target = sanitizeConnectionString(process.env.DATABASE_URL);
  try {
    const pool = getPool();
    const res = await pool.query('SELECT 1 as health_check');
    const healthy = Boolean(res && res.rows && res.rows.length > 0);
    return {
      healthy,
      type: isPostgres ? 'hosted-postgresql' : 'in-memory-postgresql',
      target,
    };
  } catch (err: any) {
    console.error(`[Database Health Check Failed]: ${err.message}`);
    return {
      healthy: false,
      type: isPostgres ? 'hosted-postgresql' : 'in-memory-postgresql',
      target,
      error: err.message,
    };
  }
}

export const db = {
  prepare(sql: string): PreparedStatement {
    const pgSql = convertPlaceholders(sql);
    return {
      async get(...rawParams: any[]) {
        await initDatabase();
        const pool = getPool();
        const params = normalizeParams(rawParams);
        const res = await pool.query(pgSql, params);
        return res.rows[0];
      },
      async all(...rawParams: any[]) {
        await initDatabase();
        const pool = getPool();
        const params = normalizeParams(rawParams);
        const res = await pool.query(pgSql, params);
        return res.rows;
      },
      async run(...rawParams: any[]) {
        await initDatabase();
        const pool = getPool();
        const params = normalizeParams(rawParams);
        const res = await pool.query(pgSql, params);
        return {
          changes: res.rowCount ?? 0,
        };
      },
    };
  },

  async query(sql: string, params: any[] = []): Promise<any> {
    await initDatabase();
    const pool = getPool();
    const pgSql = convertPlaceholders(sql);
    return pool.query(pgSql, normalizeParams(params));
  },

  async exec(sql: string): Promise<void> {
    const pool = getPool();
    await pool.query(sql);
  },

  pragma(_cmd: string): void {
    // No-op for SQLite compatibility (foreign_keys, journal_mode WAL)
  },

  async close(): Promise<void> {
    if (activePool && typeof activePool.end === 'function') {
      await activePool.end();
      activePool = null;
      initPromise = null;
    }
  },
};

export default db;
