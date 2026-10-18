# SkillBridge AI

### Better Matches. Faster Hiring. Real Opportunities.

**An explainable, skill-first recruitment and career-growth platform that connects talent with opportunities through verified skills, practical assessments, transparent feedback, and measurable improvement.**

Built for **HackShift Hackathon — Problem Statement 2: Entrepreneurship & Employment**

**Check out the link from Here** - https://skillbridge-ai-orcin.vercel.app/
---

## Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Demo Accounts](#-demo-accounts)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)
- [Database Design](#-database-design)
- [Hackathon Demo Guide](#-hackathon-demo-guide)
- [Security and Trust](#-security-and-trust)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Hiring should be more than a resume filter. It should be a transparent process that helps employers identify capable candidates and enables candidates to understand, demonstrate, and improve their skills.

**SkillBridge AI** is a skill-based recruitment, verification, and career-development ecosystem designed to connect:

- 🎓 Job seekers and students
- 🏢 Employers and recruiters
- 🚀 Startups and prospective co-founders
- 🧑‍🏫 Industry mentors
- 🛡️ Platform administrators

Instead of treating rejection as the end of the hiring journey, SkillBridge AI turns it into an opportunity for measurable improvement.

Its core differentiator is **Trace**, a practical assessment engine that evaluates how candidates respond to realistic problems and changing requirements, supported by explainable evaluation criteria and reviewable evidence.

### Our core principle

> Don't just evaluate what a candidate knows. Understand how they think, adapt, improve, and demonstrate their abilities.

---

## 🔍 The Problem

Traditional recruitment faces challenges for both candidates and employers.

| Challenge | Impact |
|---|---|
| Resume-first screening | Capable candidates can be overlooked because their resumes lack conventional credentials or experience. |
| Unverified skill claims | Recruiters struggle to distinguish claimed expertise from demonstrated ability. |
| Limited rejection feedback | Candidates often do not know which skills they need to improve. |
| The experience paradox | Students need experience to get opportunities, but need opportunities to gain experience. |
| AI-generated assessments | Conventional answer-based evaluations may not adequately establish individual understanding or adaptability. |
| Fraudulent job listings | Fake recruiters, advance-fee scams, and misleading opportunities put job seekers at risk. |
| Fragmented career development | Jobs, mentors, practical projects, and startup opportunities often exist on separate platforms. |

**The result:** recruiters spend time filtering applications, while candidates struggle to convert their skills into credible evidence and meaningful opportunities.

---

## 💡 Our Solution

SkillBridge AI creates a continuous cycle of assessment, feedback, and improvement.

```text
Discover Opportunities
        ↓
Apply for a Role
        ↓
Complete a Trace Assessment
        ↓
Review Skills and Evidence
        ↓
Receive Explainable Feedback
        ↓
Identify Skill Gaps
        ↓
Complete a Targeted Mini-Project
        ↓
Build Verified Profile Evidence
        ↓
Reapply with Improved Skills
```

The platform combines four core capabilities:

1. **Verify skills through practical assessments** rather than relying exclusively on self-reported claims.
2. **Match candidates with opportunities transparently** using understandable, weighted criteria.
3. **Turn skill gaps into actionable improvement plans** through recruiter feedback and targeted projects.
4. **Build trust across the hiring ecosystem** through employer verification, job-safety screening, and human moderation.

The result is a platform where recruitment and career development work together instead of operating as separate processes.

---

## 🚀 Key Features

### 1. Trace — Practical Skill Verification

Trace is SkillBridge AI's adaptive assessment subsystem.

Rather than relying exclusively on memorized answers or static coding questions, Trace uses realistic scenarios to examine how candidates approach problems and respond to changing requirements.

**Key capabilities**

- **Scenario-based assessments:** Evaluate problem-solving, technical decisions, architecture, and contextual reasoning.
- **Dynamic requirement changes:** Introduce a new constraint during an assessment, such as a tighter deadline or a sudden scaling requirement.
- **Adaptation evaluation:** Assess whether candidates meaningfully revise their approach in response to the new requirement.
- **Objective interaction telemetry:** Record consented events such as editor revisions and paste events as factual observations, not automatic proof of misconduct.
- **Explainable rubric reports:** Present criterion-level scores, feedback, and supporting timeline evidence.
- **Recruiter review:** Enable employers to inspect assessment evidence alongside other application information.

Trace evaluates observable assessment behavior and submitted work. It does not claim to prove a person's identity, guarantee independent authorship, or determine intent from a paste event alone.

### 2. Explainable Matching Engine

SkillBridge AI uses a deterministic, weighted matching engine to help candidates understand why an opportunity fits their profile.

#### Matching criteria

| Criterion | Weight |
|---|---:|
| Required skills | 45% |
| Preferred skills | 20% |
| Projects and practical experience | 20% |
| Trace assessment evidence | 15% |
| **Total** | **100%** |

The engine evaluates candidates against job requirements and produces a match score with human-readable reasoning.

**What makes it useful?**

- Identifies matched and missing skills.
- Distinguishes required skills from preferred skills.
- Considers practical project evidence.
- Incorporates Trace assessment evidence when applicable.
- Supports weight redistribution when optional assessment evidence is unavailable.
- Connects missing skills to relevant learning paths and mini-projects.

The weights describe the matching model, not a guarantee of hiring success. Missing or pending evidence should be disclosed so that candidates and recruiters can interpret scores appropriately.

### 3. Employer Verification and Job Safety

Finding a job should not expose candidates to fraudulent opportunities.

SkillBridge AI combines employer verification statuses, automated safety rules, community reporting, and administrative moderation.

#### Employer verification statuses

- **Verified Employer** — verification has been completed.
- **Verification Pending** — the review is in progress.
- **Info Requested** — additional information is required.
- **Unverified** — verification has not been established.

#### Rule-based safety engine

The `checkJobSafety` service screens job listings using deterministic rules.

| Rule category | Action |
|---|---|
| Advance payment or registration fee requirements | `BLOCK` |
| Discriminatory hiring requirements | `BLOCK` |
| Suspicious off-platform recruitment redirection | `REVIEW` |
| Implausibly inflated salary claims | `REVIEW` |

Candidates can report suspicious listings. Administrators can inspect flagged evidence, review employer information, suspend offending listings, and record moderation actions.

Automated screening is a first layer of protection; it does not replace comprehensive verification or human review.

### 4. Career Growth and Mini-Projects

SkillBridge AI turns feedback into a practical improvement plan.

When an employer identifies a skill gap, the candidate can receive structured feedback and a targeted mini-project designed to address it.

**Growth workflow**

1. Receive specific feedback on a skill gap.
2. Review the assigned mini-project and acceptance criteria.
3. Complete and submit the work.
4. Receive a review of the submission.
5. Add accepted evidence to the candidate profile.
6. Reapply with the new evidence when permitted.

This makes career development measurable and helps candidates demonstrate progress instead of repeatedly submitting the same resume.

### 5. Startup and Co-Founder Discovery

SkillBridge AI also supports entrepreneurship by connecting people with early-stage ventures.

- Discover startups seeking technical, product, or other co-founders.
- Explore ventures by stage: Idea, Prototype, or Traction.
- Filter opportunities by commitment level.
- Express interest in potential co-founder opportunities.
- Connect practical skills with startup needs.

### 6. Structured Mentorship

Candidates can discover mentors, request guidance, and work toward specific career goals.

Mentorship capabilities include:

- Mentor discovery and directory browsing.
- Targeted mentorship requests.
- Skill-gap-focused guidance.
- Structured feedback and roadmap notes.
- Check-in availability and follow-up planning.

### 7. Role-Based Dashboards

SkillBridge AI provides dedicated workflows for four principal roles.

| Role | Primary capabilities |
|---|---|
| Candidate | Explore matches, apply for jobs, complete assessments, track applications, and improve skills. |
| Employer | Manage jobs, review applicants, inspect Trace evidence, and provide structured feedback. |
| Mentor | Review mentorship requests and provide targeted career guidance. |
| Administrator | Review employer verification, moderate suspicious listings, and inspect audit records. |

A one-click demo persona switcher makes these workflows easy to demonstrate during a hackathon presentation.

---

## 🔄 How It Works

Consider a candidate applying for a Junior Full-Stack Engineer position.

**Step 1 — Discover and apply**

The candidate explores an opportunity and sees how their existing skills align with the role.

**Step 2 — Demonstrate practical ability**

The candidate completes a Trace assessment involving a realistic engineering scenario and an unexpected change in requirements.

**Step 3 — Review evidence**

The recruiter reviews the candidate's work, adaptation evidence, and rubric breakdown alongside their projects and application.

**Step 4 — Receive actionable feedback**

If the candidate needs stronger evidence of caching knowledge, the recruiter can suggest a focused improvement task.

**Step 5 — Complete a mini-project**

The candidate implements an LRU cache with time-to-live (TTL) support and submits the work for review.

**Step 6 — Reapply with new evidence**

Once accepted, the project can strengthen the candidate's profile and support a reapplication where permitted.

**The differentiator:** the candidate's journey does not have to end with rejection. Each evaluation can become a path toward demonstrable improvement.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling and UI | Tailwind CSS, Lucide Icons |
| Data Fetching | TanStack Query v5 |
| Routing | React Router v7 |
| Visualization | Recharts |
| Backend | Node.js, Express, TypeScript |
| API Validation | Zod |
| Authentication | JWT, bcryptjs |
| Database | PostgreSQL |
| Database Driver | `pg` connection pooling |
| Local Testing | `pg-mem` in-memory PostgreSQL |
| Deployment | Vercel and hosted PostgreSQL providers |
| Architecture | Service layer, role-based middleware, REST APIs |

### Design principles

- **Explainability:** matching and assessment results should be understandable.
- **Modularity:** matching, safety screening, and adaptation evaluation use separate services.
- **Security:** protected routes and role-based authorization help separate user permissions.
- **Portability:** environment-based configuration supports local and hosted environments.
- **Testability:** core business logic is covered by automated tests.
- **Cost-conscious development:** the core matching and safety workflows do not require paid LLM API keys.

The architecture includes an optional LLM adapter interface for future integrations. LLM-based features are not required for the core deterministic workflows.

---

## 🏗️ Architecture

The platform separates its user interface, API layer, business logic, and persistent storage.

```mermaid
flowchart TD
    A[React Frontend] --> B[Express REST API]
    B --> C[JWT Authentication]
    B --> D[Role-Based Authorization]
    B --> E[Service Layer]

    E --> F[Matching Engine]
    E --> G[Trace Assessment Evaluator]
    E --> H[Job Safety Engine]
    E --> I[Career Growth and Mentorship]
    E --> J[Application and Moderation Services]

    F --> K[(PostgreSQL)]
    G --> K
    H --> K
    I --> K
    J --> K
```

### Core services

| Service | Responsibility |
|---|---|
| `matchingEngine` | Calculates weighted match scores and generates explanations. |
| `safetyService` | Evaluates job listings against deterministic safety rules. |
| `adaptationEvaluator` | Evaluates responses to changing assessment constraints. |
| Authentication middleware | Validates authentication and protects restricted endpoints. |
| Role middleware | Enforces candidate, employer, mentor, and admin permissions. |
| Migration scripts | Create and evolve the relational database schema. |

---

## 👥 Demo Accounts

The platform includes four seeded personas for demonstrating the end-to-end user journeys.

| Role | Demo identity | Email |
|---|---|---|
| Candidate | Alex Rivera | `candidate@skillbridge.ai` |
| Employer | Marcus Vance — Nexus Cloud | `employer@skillbridge.ai` |
| Mentor | Marcus Chen | `mentor@skillbridge.ai` |
| Administrator | Sarah Jenkins | `admin@skillbridge.ai` |

**Demo credentials**

| Role | Password |
|---|---|
| Candidate | `Candidate123!` |
| Employer | `Employer123!` |
| Mentor | `Mentor123!` |
| Administrator | `Admin123!` |

Use the top-navigation **Demo Switcher** to switch between roles instantly, if enabled in the running environment.

> **Security note:** These credentials are for local or controlled demonstration environments only. Never use seeded demo credentials in production or expose privileged demo accounts on a public deployment.

---

## ⚡ Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm 9 or later
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Replace the placeholders with your actual Git repository URL and directory name.

### 2. Install dependencies

From the repository root:

```bash
npm run setup
```

This project command is intended to install the frontend and backend dependencies and prepare the development environment. Confirm its implementation in the root `package.json` if your checkout behaves differently.

### 3. Configure environment variables

Create the appropriate environment files for your local setup.

**Backend — `backend/.env`**

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173

# Optional: omit only if the application supports
# its configured in-memory development fallback.
DATABASE_URL=
```

**Frontend — `frontend/.env`**

```env
VITE_API_URL=http://localhost:5000
```

If your project requires a database connection for a particular operation, provide a valid PostgreSQL connection string in `DATABASE_URL`.

For local PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/skillbridge_ai
```

Do not commit `.env` files or real credentials to Git.

### 4. Start the application

Run both development servers:

```bash
npm run dev
```

Alternatively, start them separately in two terminals.

**Terminal 1 — Backend**

```bash
npm run dev:backend
```

Backend: `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
npm run dev:frontend
```

Frontend: `http://localhost:5173`

Open the frontend URL in your browser and use the demo switcher to explore the platform.

> Available scripts depend on your root `package.json`. If a command is missing, inspect the configured scripts rather than assuming the command exists.

---

## 🧪 Testing

SkillBridge AI includes a reported suite of 29 automated unit and integration tests covering authentication, matching, job safety, Trace adaptation, and database seed integrity.

Run the test suite from the repository root:

```bash
npm test
```

### Test coverage

**Authentication and security**
- Password hashing and verification.
- JWT signing and verification.

**Job safety**
- Safe listing approval.
- Advance-fee scam detection.
- Discriminatory requirement blocking.
- Suspicious off-platform redirection review.

**Matching engine**
- High-alignment and low-alignment scores.
- Required and missing skill identification.
- Human-readable match explanations.

**Trace assessment**
- Adaptation scoring.
- Rubric evaluation.
- Substantive revision detection.
- Low adaptation scores for unchanged responses.

**Database integrity**
- Demo account availability.
- Seeded opportunities and assessment sessions.
- Employer verification state.
- Telemetry persistence.
- Mini-project and reapplication evidence.

The project documentation reports **29 passing tests**. Run the current test suite to verify the result for your checkout and deployment environment.

---

## 🗄️ Database Design

SkillBridge AI uses a relational PostgreSQL schema to manage users, opportunities, assessments, applications, and career-development workflows.

### Main entities

| Domain | Tables |
|---|---|
| Identity and profiles | `users`, `candidate_profiles`, `candidate_skills` |
| Employers | `employer_profiles`, `employer_verifications` |
| Opportunities | `jobs`, `job_skill_requirements`, `saved_opportunities` |
| Trace assessments | `assessments`, `assessment_sessions`, `assessment_submissions` |
| Assessment evidence | `telemetry_events`, `adaptation_evaluations` |
| Applications | `applications`, `application_status_history` |
| Candidate growth | `candidate_feedback`, `mini_projects`, `mini_project_submissions`, `profile_evidence` |
| Trust and safety | `job_reports`, `audit_logs` |
| Mentorship | `mentors`, `mentorship_requests` |
| Entrepreneurship | `startup_profiles`, `cofounder_interests` |
| Notifications | `notifications` |

The documented schema contains 27 relational tables. Foreign keys, indexes, and deletion rules support data integrity and efficient queries.

### Local database behavior

When `DATABASE_URL` is not configured, the application can use `pg-mem` for an in-memory PostgreSQL-compatible development database, provided the relevant configuration is enabled.

Important distinction:

- In-memory database state is temporary and may disappear when the process restarts.
- Hosted PostgreSQL provides persistent storage across application restarts.
- Database migrations and seed scripts should be run against the intended database.

### Run database migrations

From the backend directory, or through the repository's configured root scripts:

```bash
npm run migrate
```

### Seed demonstration data

```bash
npm run seed
```

Run these commands only after verifying the configured `DATABASE_URL`. Seeding a hosted database can create demo users and records, so use an isolated demonstration database rather than a live production dataset.

---

## ☁️ Production Deployment

The recommended deployment separates the frontend and backend while using a persistent hosted PostgreSQL database.

Example providers include Vercel for frontend hosting and compatible API hosting, and Neon or Supabase for managed PostgreSQL.

### Deployment overview

```text
Git Repository
      |
      ├── Frontend → Vercel
      |
      └── Backend → Compatible Node.js Hosting
                         |
                         └── Hosted PostgreSQL
```

### 1. Create a hosted PostgreSQL database

Create a project using your preferred provider.

Copy its database connection string and store it securely as `DATABASE_URL`. For providers that require SSL, use the provider's recommended connection settings.

### 2. Apply database migrations

Configure `DATABASE_URL` for the hosted database and run the project's migration script:

```bash
npm run migrate
```

Run this from the directory where the migration script is defined. Verify that the schema is created successfully before deploying the application.

### 3. Deploy the backend

Configure the backend project using the actual build and start scripts in `backend/package.json`.

Set these environment variables in your hosting provider:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Hosted PostgreSQL connection string |
| `JWT_SECRET` | Secure secret for signing authentication tokens |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | The deployed frontend's origin |

Build command:

```bash
npm run build
```

The backend must run on a hosting environment that supports its actual runtime and routing configuration. If deploying an Express application as Vercel Functions, ensure the project has the necessary function entry point and routing configuration; a conventional Express server configuration is not automatically serverless-compatible.

### 4. Deploy the frontend

Import the repository into Vercel and configure the frontend root directory.

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Set the frontend environment variable:

```env
VITE_API_URL=https://your-deployed-backend.example.com
```

Replace the example with the actual deployed backend URL, then redeploy the frontend.

### 5. Verify the deployment

If the backend implements the documented health endpoint, test it:

```bash
curl https://your-deployed-backend.example.com/api/v1/health
```

The expected healthy response should indicate that the API is running and the configured database is reachable.

Example response shape:

```json
{
  "status": "healthy",
  "database": "connected",
  "databaseType": "hosted-postgresql",
  "product": "SkillBridge AI",
  "tagline": "Better Matches. Faster Hiring. Real Opportunities.",
  "assessmentEngine": "Trace"
}
```

This is an illustrative response based on the documented contract, not a claim that a live deployment has already been verified.

### Deployment checklist

- [ ] Frontend build succeeds.
- [ ] Backend build and startup succeed.
- [ ] All production environment variables are configured.
- [ ] Database migrations have completed.
- [ ] API and database health checks pass.
- [ ] Frontend API URL points to the deployed backend.
- [ ] CORS allows the intended frontend origin.
- [ ] Authentication and role permissions work.
- [ ] Demo accounts are restricted appropriately.
- [ ] No secrets are exposed in client-side environment variables.

---

## 🎬 Hackathon Demo Guide

The following walkthroughs demonstrate the platform's main differentiators.

### Journey 1 — From Rejection to Improvement

**Persona:** Alex Rivera, Candidate

1. Open the Applications Tracker.
2. Inspect the Junior Full-Stack Engineer application at Nexus Cloud Systems.
3. Open Growth & Mini-Projects.
4. Review feedback requesting stronger in-memory caching evidence.
5. Inspect the LRU Cache with TTL mini-project.
6. Return to the application and demonstrate reapplication with accepted evidence.

**What to highlight:** SkillBridge AI makes feedback actionable and creates a route back into the hiring process.

### Journey 2 — Evidence-Based Assessment

**Persona:** Marcus Vance, Employer

1. Open Manage Jobs.
2. Select applicants for the Junior Full-Stack Engineer role.
3. Open Alex Rivera's Trace Evidence Report.
4. Inspect the assessment timeline and interaction telemetry.
5. Review the dynamic deadline-change scenario.
6. Explore the rubric breakdown.

**Illustrative seeded report**

| Criterion | Example score |
|---|---:|
| Constraint Adaptation | 95% |
| Contextual Continuity | 90% |
| Candidate Rationale | 92% |

The seeded session also illustrates 14 editor revisions, one paste event, and 31 minutes elapsed. These are demo values, not independently validated evidence of authorship.

**What to highlight:** Recruiters can examine structured assessment evidence instead of relying solely on an opaque score.

### Journey 3 — Job Scam Prevention

**Persona:** Sarah Jenkins, Administrator

1. Open the public Jobs board.
2. Identify a suspicious remote customer-support listing.
3. Switch to the Administrator role.
4. Open the Moderation Console.
5. Inspect employer verification information and reported job details.
6. Demonstrate the moderation workflow and its audit trail.

**What to highlight:** Rule-based screening and human review provide a structured way to address suspicious listings.

### Journey 4 — Mentorship and Entrepreneurship

**Personas:** Alex Rivera and Marcus Chen

1. Browse the Mentors Directory.
2. Send a mentorship request with a defined skill objective.
3. Switch to the Mentor role.
4. Review and accept the request.
5. Explore the Startups & Co-Founders directory.
6. Discover ventures by stage and commitment level.

**What to highlight:** SkillBridge AI connects hiring, career development, and startup opportunities within one ecosystem.

---

## 🔐 Security and Trust

Trust is central to a recruitment platform that handles candidate profiles, assessments, and employer information.

SkillBridge AI incorporates the following design considerations:

- **Password security:** bcrypt-based password hashing.
- **Authentication:** JWT-based authentication.
- **Role separation:** candidate, employer, mentor, and administrator access controls.
- **Input validation:** Zod schemas for validating supported API inputs.
- **Database integrity:** relational constraints and indexes.
- **Assessment transparency:** factual telemetry and explainable rubric reports.
- **Job safety:** deterministic screening rules and human moderation.
- **Auditability:** records of relevant application and moderation actions.
- **Configuration security:** environment variables for sensitive deployment configuration.

### Important production considerations

Before handling real candidates or employers, the platform should also be reviewed for authorization edge cases, rate limiting, secure token handling, session expiration, input sanitization, privacy retention policies, consent flows, audit-log integrity, and abuse prevention.

Employer verification badges should reflect actual verification results. An automated safety verdict should not be represented as a guarantee that a listing is legitimate.

---

## 🗺️ Roadmap

Potential future improvements include:

- [ ] More adaptive technical and non-technical assessment scenarios.
- [ ] Stronger evidence provenance and artifact verification.
- [ ] Richer recruiter analytics and application pipeline reporting.
- [ ] Personalized skill-development roadmaps.
- [ ] Additional mentorship scheduling capabilities.
- [ ] Improved startup and co-founder recommendation workflows.
- [ ] Multilingual candidate experiences.
- [ ] Accessibility improvements across assessment workflows.
- [ ] Expanded automated integration and security testing.
- [ ] Optional LLM integrations with transparent, reviewable evaluation outputs.

These are proposed enhancements, not claims that the functionality is already implemented.

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.

   ```bash
   git checkout -b feature/your-feature
   ```

3. Implement and test your changes.
4. Commit your work.

   ```bash
   git commit -m "feat: describe your change"
   ```

5. Push your branch and open a pull request.

Please include a clear description of the change and any relevant test results.

---

## 📄 License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

---

## 👨‍💻 Built for HackShift

**SkillBridge AI — Better Matches. Faster Hiring. Real Opportunities.**

We believe recruitment should not stop at identifying who is qualified today. It should help people demonstrate their capabilities, understand their gaps, and build the evidence needed for their next opportunity.

**Assess fairly. Explain clearly. Improve continuously. Connect meaningfully.**
