# SkillBridge AI

> **Better Matches. Faster Hiring. Real Opportunities.**  
> *Built for HackShift Hackathon — Problem Statement 2: Entrepreneurship & Employment*

---

## 🌟 Executive Summary

**SkillBridge AI** is a trusted, skill-based recruitment, verification, and career-growth ecosystem connecting job seekers, verified employers, startups, recruiters, mentors, and prospective co-founders.

Traditional hiring frequently ends with an unexplained rejection. Candidates never learn what was missing, recruiters sift through unverified resumes, and students struggle to break the "no experience without a job, no job without experience" deadlock.

SkillBridge AI transforms hiring from an adversarial filter into a **continuous feedback and growth loop**:

$$\text{Apply} \longrightarrow \text{Assess (Trace)} \longrightarrow \text{Review Evidence} \longrightarrow \text{Identify Skill Gaps} \longrightarrow \text{Receive Feedback} \longrightarrow \text{Complete Mini-Project} \longrightarrow \text{Update Profile} \longrightarrow \text{Reapply}$$

---

## 🚀 Key Differentiators & Innovations

### 1. Trace Assessment Subsystem (Adaptive Skill Verification)
Trace is SkillBridge AI's built-in, practical skill verification engine:
- **Real-World Scenarios**: Instead of artificial LeetCode memorization puzzles, candidates solve realistic architecture, client communication, and systems engineering problems.
- **Dynamic Constraint Adaptation**: Midway through the assessment, Trace introduces a dynamic requirement pivot (e.g. an executive deadline compression or sudden scaling constraint). It evaluates **how** candidates adapt their solution in real time.
- **Objective Telemetry, Not Accusations**: Monitors keystrokes, revision cadence, and paste events as *factual observations* with candidate consent—**never** arbitrary "cheating percentage" accusations or invasive biometric spyware.
- **Explainable Rubric Reports**: Evaluates constraint adaptation, contextual continuity, and candidate rationale with human-readable rubric scoring and verifiable timeline evidence.

### 2. Explainable 4-Tier Matching Engine
Deterministic, transparent matching scoring:
- **Required Skills (45%)**: Minimum proficiency matching on hard prerequisites.
- **Preferred Skills (20%)**: Bonus alignment on nice-to-have capabilities.
- **Projects & Practical Experience (20%)**: Real github repositories, portfolios, and completed mini-projects.
- **Trace Assessment Evidence (15%)**: Objective verification from Trace evaluations.
- **Dynamic Weight Redistribution**: Gracefully redistributes weights when assessments are pending or optional.
- **Transparent Rationale**: Every opportunity card explains *why* it matched and lists exact missing skills with direct links to learning paths and mini-projects.

### 3. Trust, Verification & Rule-Based Job Safety Engine
- **Authentic Verification**: Distinct badges for `Verified Employer`, `Verification Pending`, `Info Requested`, and `Unverified`. No fabricated credentials.
- **Upfront Safety Policy Engine (`checkJobSafety`)**: Scans all incoming job listings against deterministic rule sets:
  - Advance payment or registration fee scams (`BLOCK`)
  - Off-platform contact redirection like Telegram/WhatsApp recruitment rings (`REVIEW`)
  - Discriminatory hiring requirements (`BLOCK`)
  - Suspiciously inflated salary lures (`REVIEW`)
- **Community Reporting & Moderation**: Candidates can report suspicious opportunities; platform administrators review evidence, audit trails, and suspend malicious listings with one click.

### 4. Startup & Co-founder Discovery + Mentorship Network
- **One-to-Many Discovery**: Post and discover early-stage startup ventures seeking technical or product co-founders.
- **Structured Mentorship**: Candidates receive structured roadmap guidance from industry mentors to close verified skill gaps.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query v5, React Router v7, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, TypeScript, REST APIs, Zod validation, JWT authentication, bcryptjs |
| **Database** | PostgreSQL via `pg` connection pool with SSL (Production-ready via `DATABASE_URL` for Neon, Supabase, Render, Railway; automatic zero-config in-memory PostgreSQL fallback for local dev & testing) |
| **Architecture** | Clean service layer (`matchingEngine`, `safetyService`, `adaptationEvaluator`), role-based middleware (`candidate`, `employer`, `mentor`, `admin`), safe schema migrations (`npm run migrate`) |
| **Zero External API Cost** | Works 100% locally and offline without paid LLM API keys. Optional LLM adapter interface ready for production scale. |

---

## 👥 Demo Personas & Quick Switcher

The platform comes pre-seeded with 4 realistic personas for live hackathon demonstration. Use the **1-Click Demo Switcher pill** in the top navigation bar to switch instantly without typing passwords:

| Role | Name | Email | Password | Primary Showcase |
|---|---|---|---|---|
| **Candidate** | Alex Rivera | `candidate@skillbridge.ai` | `Candidate123!` | Explore explainable matches, complete Trace assessments, review feedback, complete mini-projects & reapply. |
| **Employer** | Marcus Vance (Nexus Cloud) | `employer@skillbridge.ai` | `Employer123!` | Verified recruiter dashboard, manage pipeline, review Trace evidence reports, provide structured feedback with mini-projects. |
| **Mentor** | Marcus Chen | `mentor@skillbridge.ai` | `Mentor123!` | Mentor directory, accept candidate mentorship requests, provide skill roadmap guidance. |
| **Administrator** | Sarah Jenkins | `admin@skillbridge.ai` | `Admin123!` | Trust & Safety moderation console, review corporate registrations, adjudicate reported suspicious jobs, inspect audit logs. |

---

## ⚡ Quick Start Instructions

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 22)
- npm 9+

### 1. Setup & Installation
Clone the repository and install all dependencies:

```bash
# In the repository root
npm run setup
```
*(This automatically runs `npm install` in backend and frontend, and seeds the SQLite database with rich demo data).*

### 2. Start Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1 - Backend Server
npm run dev:backend

# Terminal 2 - Frontend Client
npm run dev:frontend
```

Now open your browser at **`http://localhost:5173`**.

### 3. Run Automated Test Suite
SkillBridge AI includes 29 automated unit and integration tests verifying authentication, the matching engine, the safety policy engine, Trace dynamic adaptation, and database relational integrity:

```bash
npm test
```

Expected output:
```
=============================================
SkillBridge AI - Business Logic Test Suite
=============================================
1. Authentication & Security:
  ✓ Password hashing generates bcrypt hash
  ✓ comparePassword validates correct password
  ✓ comparePassword rejects incorrect password
  ✓ JWT token signs and verifies correctly

2. Prototype Safety Policy Engine:
  ✓ Safe job description is ALLOWED
  ✓ Safe job has 0 triggered safety rules
  ✓ Advance fee requirement triggers BLOCK verdict
  ✓ Fee scam rule flags requiresHumanReview = true
  ✓ Matches FEE_PAYMENT_BLOCK rule ID
  ✓ Gender discriminatory requirement triggers BLOCK
  ✓ Circumventing platform to Telegram triggers REVIEW verdict

3. Explainable Matching Engine:
  ✓ High alignment yields strong score (100/100)
  ✓ Recommendation level is Strong Match
  ✓ Identifies React as matched required skill
  ✓ Identifies React as verified skill
  ✓ Unmatched skills yield low score (33/100)
  ✓ Identifies Rust as missing required skill
  ✓ Generates explainable human-readable reasoning

4. Trace Dynamic Follow-Up Adaptation Evaluator:
  ✓ Adaptive response scores well (83/100)
  ✓ Evaluates all 3 rubric criteria
  ✓ Detects substantive revision addressing the new constraint
  ✓ Identical text flagged with low adaptation score

5. Persistent Database Seed Verification:
  ✓ Candidate demo account exists in database
  ✓ Employer demo account exists in database
  ✓ Nexus Cloud Systems has verified employer status
  ✓ Database contains 4 seeded opportunities
  ✓ Trace assessment session seeded with completed status
  ✓ Objective telemetry captures 1 paste event without accusation
  ✓ Mini-project seeded in accepted state for reapplication proof

=============================================
Results: 29 Passed, 0 Failed
=============================================
```

---

## 🗄️ Database Architecture & Vercel Production Deployment

### Why PostgreSQL Replaced SQLite on Vercel
SkillBridge AI was upgraded from SQLite (`better-sqlite3`) to PostgreSQL:
1. **Serverless Filesystem Constraints**: Vercel Serverless Functions execute on a strictly read-only filesystem (only `/tmp` is temporarily writable). SQLite's attempt to create write locks, `.db-wal`, or write-ahead logs fails immediately with `SqliteError: unable to open database`.
2. **Ephemeral Containers**: Moving a SQLite file to `/tmp` is an anti-pattern: serverless containers spin up and down unpredictably. Every cold start or invocation in a new instance wipes all candidate submissions, user registrations, and employer verifications.
3. **Native C++ Addons**: `better-sqlite3` relies on `node-gyp` and platform-specific C++ compilers, which easily fail on cloud container architectures. The pure JavaScript `pg` driver is lightweight, universally portable, and natively supports connection pooling.

### Zero-Config Local Development & Testing
- If `DATABASE_URL` is **not set** in `.env`, SkillBridge AI automatically launches an **in-memory PostgreSQL engine** (`pg-mem`).
- You can clone the repo, run `npm test`, or start development servers without having PostgreSQL installed locally.
- To connect to a local or remote PostgreSQL instance locally, simply create `backend/.env` with:
  ```env
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skillbridge_ai
  ```

### Step-by-Step Production PostgreSQL Setup (Neon / Supabase)
1. **Create a Free PostgreSQL Database**:
   - Go to [Neon.tech](https://neon.tech) (recommended for serverless) or [Supabase](https://supabase.com).
   - Create a new project named `skillbridge-ai`.
   - Copy the pooled connection string with `?sslmode=require` (e.g., `postgresql://user:pass@ep-cool-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`).
2. **Run Migrations on Production Database**:
   From your local terminal, apply the 27-table relational schema to your hosted PostgreSQL database:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-cool-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run migrate
   ```
3. **(Optional) Seed Demo Data on Production Database**:
   To seed the demo hackathon users, jobs, Trace assessments, and rubric evaluations:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-cool-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run seed
   ```

### Deploying the Backend to Vercel
1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **Add New Project** and import your SkillBridge AI repository.
2. In **Project Settings**:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other (or Node.js)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables** in Vercel Project Settings:
   - `DATABASE_URL`: `postgresql://user:password@host:5432/dbname?sslmode=require` (your hosted PostgreSQL connection string)
   - `JWT_SECRET`: A secure random secret string (e.g., generated with `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your production frontend URL (or `*`)
4. Click **Deploy**.

### Verifying the Production Health Endpoint
Once deployed, verify database connectivity by requesting the health check:
```bash
curl https://your-skillbridge-backend.vercel.app/api/v1/health
```
Expected healthy response:
```json
{
  "status": "healthy",
  "database": "connected",
  "databaseType": "hosted-postgresql",
  "product": "SkillBridge AI",
  "tagline": "Better Matches. Faster Hiring. Real Opportunities.",
  "assessmentEngine": "Trace",
  "timestamp": "2026-10-18T07:00:00.000Z"
}
```
If `DATABASE_URL` is unreachable, the endpoint returns HTTP `503 Service Unavailable` with status `"degraded"`, sanitizing credentials from all log outputs.

---

## 🧭 End-to-End User Journeys (Hackathon Tour)

### Journey 1: The Continuous Growth & Reapplication Loop (Candidate & Recruiter)
1. **Switch to Candidate (`Alex Rivera`)** via the Demo Switcher.
2. Navigate to **Applications Tracker** (`/candidate/applications`):
   - Notice the application for *Junior Full-Stack Engineer* at *Nexus Cloud Systems* has status `Improvement Suggested`.
3. Click **Growth & Mini-Projects** (`/candidate/growth`):
   - See the structured recruiter feedback: Nexus Cloud commended Alex's Trace dynamic adaptation, but requested evidence of in-memory caching before extending an offer.
   - Review the assigned mini-project: *Resilient In-Memory LRU Cache with TTL*.
   - Notice the mini-project has been submitted and reviewed!
4. Navigate back to **Applications Tracker** and click **Reapply with Verified Evidence**:
   - Alex submits a reapplication citing the new verified LRU cache evidence.
   - Application status shifts to `Applied (Reapplication #1)` with full audit trail!

### Journey 2: Trace Assessment & Telemetry Evidence (Recruiter View)
1. **Switch to Employer (`Marcus Vance - Nexus Cloud`)**.
2. Navigate to **Manage Jobs** (`/employer/jobs`) and click on applicants for *Junior Full-Stack Engineer*.
3. Inspect **Alex Rivera's application** and click **View Trace Evidence Report** (`/trace/evidence/ses_alex_demo_1`):
   - **Telemetry Dashboard**: Review objective data (1 paste event, 14 editor revisions, 31 minutes elapsed). Note that paste is noted factually without accusations.
   - **Dynamic Follow-Up Scenario**: See how Alex adjusted when the client moved the deadline forward by 4 weeks.
   - **Rubric Breakdown**: Inspect 3 objective scoring criteria (Constraint Adaptation 95%, Contextual Continuity 90%, Candidate Rationale 92%).

### Journey 3: Job Safety, Scam Screening & Admin Moderation (Moderator View)
1. In the public Jobs board, note the suspicious listing: *Remote Customer Support Assistant (Immediate Placement)*.
2. **Switch to Administrator (`Sarah Jenkins`)**.
3. Open the **Moderation Console** (`/admin/dashboard`):
   - **Employer Verifications**: Review legal entity claims and CIN/EIN corporate filings.
   - **Job Safety Reports**: Inspect reported jobs with rule-based violation highlights (e.g. upfront equipment payment requests).
   - Click **Take Moderation Action**: Suspend the offending listing and notify the employer.

### Journey 4: Mentorship & Startup Discovery
1. Navigate to **Mentors Directory** (`/community/mentors`):
   - Browse vetted industry mentors and send a mentorship request with targeted skill objectives.
2. **Switch to Mentor (`Marcus Chen`)** and open **Mentorship Requests** (`/mentor/requests`):
   - Accept the candidate's request and provide structured guidance notes and scheduled check-in availability.
3. Navigate to **Startups & Co-Founders** (`/community/startups`):
   - Discover early-stage ventures seeking technical partners, filtered by stage (`Idea`, `Prototype`, `Traction`) and commitment level.

---

## 🗄️ Database Architecture

The PostgreSQL relational schema consists of 27 relational tables designed with strict foreign keys, cascade deletes, and B-tree indexes:
- `users`: Core identity with bcrypt password hashing and role constraints.
- `candidate_profiles` & `candidate_skills`: Education, experience, social URLs, proficiency levels, and verification source tracking.
- `employer_profiles` & `employer_verifications`: Corporate registration metadata, business domain validation, and review trails.
- `jobs` & `job_skill_requirements`: Job specifications with required vs. preferred skill classifications.
- `saved_opportunities`: Candidate bookmarked roles.
- `assessments`, `assessment_sessions`, `assessment_submissions`: Trace assessment scenarios, initial submissions, and dynamic follow-up revisions.
- `telemetry_events`: Consensual candidate interaction events (opened, consent_accepted, paste_event, editor_change, initial_submit, revision_submit).
- `adaptation_evaluations`: Dynamic rubric evaluations with score breakdowns and feedback summaries.
- `applications` & `application_status_history`: Complete pipeline progression with reapplication counts and status timeline.
- `candidate_feedback`: Structured recruiter feedback with actionable skill gaps and reapplication authorization.
- `mini_projects` & `mini_project_submissions`: Targeted hands-on challenges closing specific skill gaps.
- `profile_evidence`: Verified artifacts permanently tied to candidate skills.
- `job_reports`: Suspicious listing reports with automated and human adjudication statuses.
- `mentors` & `mentorship_requests`: Mentorship discovery and guided feedback loop.
- `startup_profiles` & `cofounder_interests`: Co-founder matching.
- `notifications`: Real-time cross-role alert system.
- `audit_logs`: Immutable security and moderation action log.

---

## 📄 License & Attribution

Developed for **HackShift Hackathon — Problem Statement 2: Entrepreneurship & Employment**.  
Licensed under the [MIT License](LICENSE).
