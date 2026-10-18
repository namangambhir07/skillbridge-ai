import { db, initDatabase } from './database.js';
import { hashPassword } from '../utils/auth.js';

export function runSeed(): void {
  console.log('Seeding SkillBridge AI database with realistic hackathon demo data...');
  initDatabase();

  // Clear existing records to ensure fresh demo state
  const tables = [
    'audit_logs', 'notifications', 'cofounder_interests', 'startup_profiles',
    'mentorship_requests', 'mentors', 'job_reports', 'profile_evidence',
    'mini_project_submissions', 'mini_projects', 'candidate_feedback',
    'adaptation_evaluations', 'telemetry_events', 'assessment_submissions',
    'assessment_sessions', 'application_status_history', 'applications',
    'assessments', 'saved_opportunities', 'job_skill_requirements', 'jobs',
    'candidate_skills', 'skills', 'employer_verifications', 'employer_profiles',
    'candidate_profiles', 'users'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // 1. Seed Skills Catalog
  const skillList = [
    { id: 'skl_react', name: 'React', category: 'Frontend' },
    { id: 'skl_ts', name: 'TypeScript', category: 'Languages' },
    { id: 'skl_node', name: 'Node.js', category: 'Backend' },
    { id: 'skl_py', name: 'Python', category: 'Languages' },
    { id: 'skl_sql', name: 'SQL & Database Design', category: 'Database' },
    { id: 'skl_tailwind', name: 'Tailwind CSS', category: 'Frontend' },
    { id: 'skl_api', name: 'RESTful API Architecture', category: 'Backend' },
    { id: 'skl_docker', name: 'Docker & Containers', category: 'DevOps' },
    { id: 'skl_state', name: 'State Management (Redux/Zustand)', category: 'Frontend' },
    { id: 'skl_problem', name: 'Analytical Problem Solving', category: 'Soft Skills' },
    { id: 'skl_communication', name: 'Technical Writing & Client Communication', category: 'Soft Skills' },
  ];

  const insertSkill = db.prepare('INSERT INTO skills (id, name, category) VALUES (?, ?, ?)');
  for (const s of skillList) {
    insertSkill.run(s.id, s.name, s.category);
  }

  // 2. Seed Users
  const defaultPasswordHash = hashPassword('Candidate123!');
  const employerPasswordHash = hashPassword('Employer123!');
  const mentorPasswordHash = hashPassword('Mentor123!');
  const adminPasswordHash = hashPassword('Admin123!');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Demo Candidate
  insertUser.run('usr_candidate_1', 'candidate@skillbridge.ai', defaultPasswordHash, 'candidate', 'Alex Rivera');
  // Secondary Candidate
  insertUser.run('usr_candidate_2', 'priya@skillbridge.ai', defaultPasswordHash, 'candidate', 'Priya Sharma');

  // Demo Employer (Verified)
  insertUser.run('usr_employer_1', 'employer@skillbridge.ai', employerPasswordHash, 'employer', 'Elena Rostova');
  // Secondary Employer (Pending Review)
  insertUser.run('usr_employer_2', 'david@quantumfin.demo', employerPasswordHash, 'employer', 'David Vance');
  // Suspicious Employer (Unverified / Flagged)
  insertUser.run('usr_employer_3', 'recruiter@quickhires.demo', employerPasswordHash, 'employer', 'Jordan Reed');

  // Demo Mentor
  insertUser.run('usr_mentor_1', 'mentor@skillbridge.ai', mentorPasswordHash, 'mentor', 'Marcus Chen');

  // Demo Admin
  insertUser.run('usr_admin_1', 'admin@skillbridge.ai', adminPasswordHash, 'admin', 'Sarah Jenkins');

  // 3. Seed Candidate Profiles
  db.prepare(`
    INSERT INTO candidate_profiles (
      id, user_id, headline, bio, education, experience, portfolio_url, github_url, linkedin_url,
      preferred_roles, preferred_work_mode, location_preference, availability, profile_visibility
    ) VALUES (
      'cand_alex', 'usr_candidate_1',
      'Full-Stack Software Engineer (React / TypeScript / Node.js)',
      'Passionate full-stack developer eager to build resilient web applications. Strong foundations in React, JavaScript, and REST APIs, currently strengthening backend caching and distributed systems.',
      'B.S. in Computer Science, Tech University (2024)',
      'Junior Web Developer Intern at WebFlow Solutions (6 months); Open-source contributor to React developer tools.',
      'https://alexrivera.dev.demo',
      'https://github.com/alexrivera-demo',
      'https://linkedin.com/in/alexrivera-demo',
      'Full-Stack Developer, Frontend Engineer, Software Engineer',
      'remote',
      'San Francisco / Remote',
      'Immediate',
      'public'
    )
  `).run();

  db.prepare(`
    INSERT INTO candidate_profiles (
      id, user_id, headline, bio, education, experience, preferred_roles, preferred_work_mode, location_preference
    ) VALUES (
      'cand_priya', 'usr_candidate_2',
      'Data Analyst & Python Specialist',
      'Specializing in analytical modeling, SQL optimization, and automated reporting dashboards.',
      'M.S. in Data Analytics, State University (2023)',
      'Data Analytics Associate at Insight Analytics (1.5 years).',
      'Data Analyst, BI Developer, Analytics Engineer',
      'hybrid',
      'New York / Hybrid'
    )
  `).run();

  // 4. Candidate Skills
  const insertCandidateSkill = db.prepare(`
    INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCandidateSkill.run('csk_1', 'cand_alex', 'skl_react', 'advanced', 'assessment_verified', new Date().toISOString());
  insertCandidateSkill.run('csk_2', 'cand_alex', 'skl_ts', 'intermediate', 'project_verified', new Date().toISOString());
  insertCandidateSkill.run('csk_3', 'cand_alex', 'skl_tailwind', 'advanced', 'self_reported', null);
  insertCandidateSkill.run('csk_4', 'cand_alex', 'skl_api', 'intermediate', 'self_reported', null);

  insertCandidateSkill.run('csk_5', 'cand_priya', 'skl_py', 'advanced', 'self_reported', null);
  insertCandidateSkill.run('csk_6', 'cand_priya', 'skl_sql', 'expert', 'assessment_verified', new Date().toISOString());

  // 5. Seed Employer Profiles & Verifications
  // Employer 1: Nexus Cloud Systems (Verified)
  db.prepare(`
    INSERT INTO employer_profiles (
      id, user_id, org_name, org_website, business_email, industry, company_size, description, logo_url
    ) VALUES (
      'emp_nexus', 'usr_employer_1',
      'Nexus Cloud Systems', 'https://nexuscloud.demo', 'careers@nexuscloud.demo',
      'Cloud Infrastructure & Developer Tools', '50-200 employees',
      'Nexus Cloud Systems builds high-velocity enterprise cloud infrastructure and developer productivity platforms.',
      'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=150&auto=format&fit=crop&q=80'
    )
  `).run();

  db.prepare(`
    INSERT INTO employer_verifications (
      id, employer_id, status, registration_number, supporting_info, reviewer_notes, reviewed_by, reviewed_at
    ) VALUES (
      'ver_nexus', 'emp_nexus', 'verified', 'US-DEL-2021-998812',
      'Articles of Incorporation verified, corporate domain email authenticated, active state corporate registry verified.',
      'Approved: Registered enterprise entity in good standing with corporate domain authentication.',
      'usr_admin_1', CURRENT_TIMESTAMP
    )
  `).run();

  // Employer 2: Quantum FinTech (Pending Review)
  db.prepare(`
    INSERT INTO employer_profiles (
      id, user_id, org_name, org_website, business_email, industry, company_size, description
    ) VALUES (
      'emp_quantum', 'usr_employer_2',
      'Quantum FinTech Labs', 'https://quantumfintech.demo', 'contact@quantumfintech.demo',
      'Financial Technology', '10-50 employees',
      'Building next-generation algorithmic wealth management and real-time transaction reconciliation engines.'
    )
  `).run();

  db.prepare(`
    INSERT INTO employer_verifications (
      id, employer_id, status, registration_number, supporting_info
    ) VALUES (
      'ver_quantum', 'emp_quantum', 'pending_review', 'UK-CO-2023-455219',
      'Registered UK entity; undergoing bank accreditation and platform identity check.'
    )
  `).run();

  // Employer 3: Apex Digital Services (Suspicious / Unverified)
  db.prepare(`
    INSERT INTO employer_profiles (
      id, user_id, org_name, org_website, business_email, industry, company_size, description
    ) VALUES (
      'emp_apex', 'usr_employer_3',
      'Apex Digital Recruitment', 'http://unverified-apex-jobs.xyz', 'recruitment-apex@freemail.demo',
      'Staffing & Outsourcing', '1-10 employees',
      'Fast-track hiring consultancy.'
    )
  `).run();

  db.prepare(`
    INSERT INTO employer_verifications (
      id, employer_id, status, registration_number, supporting_info
    ) VALUES (
      'ver_apex', 'emp_apex', 'not_submitted', '', 'No documentation provided.'
    )
  `).run();

  // 6. Seed Jobs & Internships
  // Job 1: Junior Full-Stack Engineer at Nexus (Primary Demo Job)
  db.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, opportunity_type, category, work_mode, location,
      experience_level, description, responsibilities, eligibility_criteria, salary_range, status, safety_verdict
    ) VALUES (
      'job_nexus_fs', 'emp_nexus',
      'Junior Full-Stack Engineer', 'job', 'Software Engineering', 'remote', 'Remote (Global)',
      '0-2 years',
      'We are looking for a motivated Full-Stack Engineer to join our Developer Experience team. You will build user-facing features in React and TypeScript while integrating reliable backend APIs in Node.js. Practical skills, problem-solving, and clean communication are prioritized over pedigree.',
      'Develop modular frontend components in React and TypeScript.\nDesign and maintain REST endpoints in Node.js.\nWrite automated tests and participate in code reviews.\nCollaborate with product designers and platform engineers.',
      'Proficiency in React and TypeScript. Demonstrated understanding of state management and API integration. Open to recent graduates or self-taught developers with practical project evidence.',
      '$75,000 - $95,000 USD',
      'published', 'ALLOW'
    )
  `).run();

  // Job 2: Frontend Engineering Intern at Nexus
  db.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, opportunity_type, category, work_mode, location,
      experience_level, description, responsibilities, eligibility_criteria, salary_range, status, safety_verdict
    ) VALUES (
      'job_nexus_intern', 'emp_nexus',
      'Frontend Engineering Intern', 'internship', 'Software Engineering', 'remote', 'Remote',
      'Entry Level',
      'A 6-month hands-on internship focusing on modern web interfaces, component architecture, and accessibility.',
      'Implement reusable UI widgets.\nRefactor components for WCAG accessibility standards.\nParticipate in sprint planning.',
      'Basic familiarity with React, HTML5, CSS3, and JavaScript.',
      '$35 - $45 / hour',
      'published', 'ALLOW'
    )
  `).run();

  // Job 3: Backend Systems Engineer at Quantum FinTech
  db.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, opportunity_type, category, work_mode, location,
      experience_level, description, responsibilities, eligibility_criteria, salary_range, status, safety_verdict
    ) VALUES (
      'job_quantum_be', 'emp_quantum',
      'Backend Systems Engineer', 'job', 'Financial Technology', 'hybrid', 'London, UK',
      '1-3 years',
      'Build resilient microservices handling high-throughput market events. Focus on low-latency data ingestion and SQL transactions.',
      'Implement robust services in Node.js or Python.\nDesign database schemas with PostgreSQL.\nMonitor API latency and error budgets.',
      'Solid grasp of SQL, concurrency, and RESTful architectures.',
      '£55,000 - £70,000 GBP',
      'published', 'ALLOW'
    )
  `).run();

  // Job 4: Suspicious Job with fee demand (Flagged in Safety Check)
  db.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, opportunity_type, category, work_mode, location,
      experience_level, description, responsibilities, eligibility_criteria, salary_range, status, safety_verdict, safety_reasons
    ) VALUES (
      'job_suspicious_1', 'emp_apex',
      'Remote Customer Support Assistant (Immediate Placement)', 'job', 'Customer Support', 'remote', 'Remote',
      'No Experience Needed',
      'Urgent opening for remote data assistant. High guaranteed payout. Note: Registration fee of $85 is required for background processing and training deposit equipment before joining. Contact us on Telegram directly.',
      'Data entry and remote customer emails.',
      'Must have computer and internet.',
      '$4,000 / month',
      'review_required', 'BLOCK',
      '["Job description appears to request upfront payments, processing fees, or money transfers from applicants, which violates platform safety policy.","Job directs applicants to circumvent the platform to private instant messaging channels without verified business credentials."]'
    )
  `).run();

  // 7. Seed Job Requirements
  const insertJobReq = db.prepare(`
    INSERT INTO job_skill_requirements (id, job_id, skill_id, is_required, min_proficiency)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Requirements for Junior Full-Stack Engineer at Nexus
  insertJobReq.run('req_1', 'job_nexus_fs', 'skl_react', 1, 'intermediate');
  insertJobReq.run('req_2', 'job_nexus_fs', 'skl_ts', 1, 'intermediate');
  insertJobReq.run('req_3', 'job_nexus_fs', 'skl_node', 1, 'intermediate');
  insertJobReq.run('req_4', 'job_nexus_fs', 'skl_api', 0, 'intermediate'); // Preferred
  insertJobReq.run('req_5', 'job_nexus_fs', 'skl_tailwind', 0, 'intermediate'); // Preferred

  // Requirements for Quantum Backend Engineer
  insertJobReq.run('req_6', 'job_quantum_be', 'skl_node', 1, 'advanced');
  insertJobReq.run('req_7', 'job_quantum_be', 'skl_sql', 1, 'advanced');
  insertJobReq.run('req_8', 'job_quantum_be', 'skl_py', 0, 'intermediate');

  // 8. Seed Trace Assessment Template for Nexus
  db.prepare(`
    INSERT INTO assessments (
      id, job_id, title, task_type, initial_prompt, follow_up_prompt, evaluation_criteria, time_limit_minutes, status
    ) VALUES (
      'asm_nexus_fs', 'job_nexus_fs',
      'Client Communication & Service Delivery Scenario', 'writing',
      'Scenario: You are a full-stack engineer leading the delivery of a client dashboard feature. Due to unexpected database migration complexities, the planned launch will be delayed by 4 business days. Write a professional, empathetic, and solution-focused email to the client stakeholder explaining the delay, outlining current mitigation steps, and confirming the new release date.',
      'DYNAMIC SCENARIO CHANGE: The client replied stating their executive committee will only accept a 1-day delay or they will reduce project scope by 50%. Revise your email proposal to present a phased rollout (shipping core reporting on schedule, deferring advanced analytics by 4 days) and provide a 1-sentence rationale of your strategic trade-off.',
      'Assesses professional stakeholder communication, technical diplomacy, crisis de-escalation, and adaptability to sudden scope constraints.',
      45, 'published'
    )
  `).run();

  // Additional Assessment Templates (Writing, Coding, Data Analysis, Virtual Assistant)
  db.prepare(`
    INSERT INTO assessments (
      id, job_id, title, task_type, initial_prompt, follow_up_prompt, evaluation_criteria, time_limit_minutes, status
    ) VALUES (
      'asm_template_code', null,
      'TypeScript State Reducer & Cache Invalidation', 'coding',
      'Write a clean, strongly-typed state reducer function in TypeScript that manages a paginated list of user records, handles optimistic updates, and tracks error states.',
      'DYNAMIC REQUIREMENT CHANGE: Network latency requires adding an expiration TTL of 30 seconds to cached pages. Modify the reducer state and write a helper function to invalidate stale pages.',
      'Evaluates TypeScript type safety, pure state manipulation, edge-case coverage, and algorithmic adaptability.',
      60, 'published'
    )
  `).run();

  db.prepare(`
    INSERT INTO assessments (
      id, job_id, title, task_type, initial_prompt, follow_up_prompt, evaluation_criteria, time_limit_minutes, status
    ) VALUES (
      'asm_template_data', null,
      'Business Metric Discrepancy & Root Cause Analysis', 'data_analysis',
      'Analyze a scenario where Monthly Active Users (MAU) increased by 30% while Revenue per User dropped by 22%. Formulate 3 diagnostic hypotheses and describe the SQL queries you would execute.',
      'DYNAMIC CONSTRAINT: The analytics team discovers that 65% of new users originated from a zero-cost promotional partner trial in Southeast Asia. Revise your analysis and actionable recommendation.',
      'Tests analytical rigor, exploratory hypothesis formulation, and business intuition.',
      45, 'published'
    )
  `).run();

  // 9. Seed Application for Alex Rivera
  db.prepare(`
    INSERT INTO applications (
      id, job_id, candidate_id, status, applied_at, updated_at, reapplication_count
    ) VALUES (
      'app_alex_nexus_1', 'job_nexus_fs', 'cand_alex', 'improvement_suggested',
      datetime('now', '-3 days'), datetime('now', '-1 hours'), 0
    )
  `).run();

  db.prepare(`
    INSERT INTO application_status_history (id, application_id, status, notes, changed_by, created_at)
    VALUES
      ('ash_1', 'app_alex_nexus_1', 'applied', 'Initial application submitted', 'usr_candidate_1', datetime('now', '-3 days')),
      ('ash_2', 'app_alex_nexus_1', 'assessment_required', 'Trace assessment assigned by recruiter', 'usr_employer_1', datetime('now', '-2 days')),
      ('ash_3', 'app_alex_nexus_1', 'assessment_submitted', 'Trace assessment and follow-up completed', 'usr_candidate_1', datetime('now', '-2 hours')),
      ('ash_4', 'app_alex_nexus_1', 'improvement_suggested', 'Strengths in communication noted. Recommended hands-on mini-project to verify Node.js caching & TypeScript state management.', 'usr_employer_1', datetime('now', '-1 hours'))
  `).run();

  // 10. Seed Completed Assessment Session for Alex Rivera (Demonstrating Telemetry, Follow-Up, and Report)
  const sessionId = 'ses_alex_demo_1';
  db.prepare(`
    INSERT INTO assessment_sessions (
      id, assessment_id, candidate_id, application_id, status, consent_accepted_at, started_at, completed_at,
      paste_count, edit_count, elapsed_seconds
    ) VALUES (
      '${sessionId}', 'asm_nexus_fs', 'cand_alex', 'app_alex_nexus_1', 'completed',
      datetime('now', '-2 hours'), datetime('now', '-2 hours'), datetime('now', '-1 hours'),
      1, 14, 1840
    )
  `).run();

  // Initial submission
  db.prepare(`
    INSERT INTO assessment_submissions (
      id, session_id, submission_type, content, candidate_explanation
    ) VALUES (
      'sub_alex_init', '${sessionId}', 'initial',
      'Dear Sarah,\n\nI am reaching out to provide a transparent update regarding our dashboard release milestone. During our end-to-end load validation tests on the database migration layer, our team detected latency spikes that could compromise query reliability under peak user volume.\n\nTo ensure complete data integrity and optimal performance, we have rescheduled the deployment for Thursday, October 22nd (a 4 business-day adjustment). Over the next 72 hours, we are implementing query indexing optimizations and executing stress simulations. We have scheduled a 15-minute briefing tomorrow at 10:00 AM to review our test telemetry and answer any questions.\n\nWe appreciate your partnership and remain committed to delivering a rock-solid release.\n\nBest regards,\nAlex Rivera\nFull-Stack Engineering Team',
      null
    )
  `).run();

  // Revised submission
  db.prepare(`
    INSERT INTO assessment_submissions (
      id, session_id, submission_type, content, candidate_explanation
    ) VALUES (
      'sub_alex_rev', '${sessionId}', 'revision',
      'Dear Sarah,\n\nThank you for the candid feedback regarding your executive committee milestone. We fully understand the critical nature of maintaining your launch window.\n\nTo protect your schedule while safeguarding system stability, we propose a phased deployment:\n\n1. Phase 1 (On Schedule - Monday, Oct 19): We will ship the core executive dashboard, key KPI visualizers, and standard exports on time with zero delay.\n2. Phase 2 (Thursday, Oct 22): The deep historical breakdown and automated background sync will roll out seamlessly as a secondary update once final stress benchmarks pass.\n\nThis phased plan ensures your executive committee receives immediate access to core metrics on schedule without risking system reliability during your live presentation.\n\nSincerely,\nAlex Rivera\nFull-Stack Engineering Team',
      'Adapted to client constraint by unbundling the release into a phased rollout, delivering core executive value immediately while deferring heavy analytical background jobs by 3 days.'
    )
  `).run();

  // Telemetry events
  const insertTel = db.prepare(`
    INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-110 minutes', '+' || ? || ' seconds'))
  `);

  insertTel.run('tel_1', sessionId, 'opened', JSON.stringify({ device: 'Desktop Chrome 129', screen: '1920x1080' }), 1, 0);
  insertTel.run('tel_2', sessionId, 'consent_accepted', JSON.stringify({ policy: 'v1.2-hackathon', noticeVersion: '2026.1' }), 2, 45);
  insertTel.run('tel_3', sessionId, 'editor_change', JSON.stringify({ changeLength: 85, source: 'keystroke' }), 3, 120);
  insertTel.run('tel_4', sessionId, 'paste_event', JSON.stringify({ pasteLength: 42, note: 'Candidate pasted internal project code snippet / draft template' }), 4, 300);
  insertTel.run('tel_5', sessionId, 'editor_change', JSON.stringify({ changeLength: 210, source: 'keystroke' }), 5, 450);
  insertTel.run('tel_6', sessionId, 'initial_submit', JSON.stringify({ totalChars: 680 }), 6, 920);
  insertTel.run('tel_7', sessionId, 'follow_up_viewed', JSON.stringify({ trigger: 'dynamic_budget_constraint' }), 7, 930);
  insertTel.run('tel_8', sessionId, 'editor_change', JSON.stringify({ changeLength: 340, source: 'revision_typing' }), 8, 1200);
  insertTel.run('tel_9', sessionId, 'revision_submit', JSON.stringify({ finalChars: 810, explanationChars: 180 }), 9, 1840);

  // Adaptation Evaluation
  db.prepare(`
    INSERT INTO adaptation_evaluations (
      id, session_id, addresses_requirement, relevance_score, explanation_quality, rubric_breakdown, feedback_summary
    ) VALUES (
      'eva_alex_demo', '${sessionId}',
      0.95, 0.90, 0.92,
      '[{"criterion":"Constraint Adaptation","score":95,"maxScore":100,"observation":"Candidate brilliantly pivoted to a phased rollout to meet client executive timeframes without compromising quality."},{"criterion":"Contextual Continuity","score":90,"maxScore":100,"observation":"Maintained professional diplomacy and exact stakeholder role framing."},{"criterion":"Candidate Rationale","score":92,"maxScore":100,"observation":"Clearly articulated the trade-off between core UI availability and background analytics complexity."}]',
      'Strong adaptability demonstrated. Candidate responded constructively to unexpected stakeholder pressure with a pragmatic engineering mitigation.'
    )
  `).run();

  // 11. Employer Feedback
  db.prepare(`
    INSERT INTO candidate_feedback (
      id, application_id, reviewer_id, strengths, skill_gaps, feedback_message, learning_resources, can_reapply
    ) VALUES (
      'fbk_nexus_alex', 'app_alex_nexus_1', 'usr_employer_1',
      'Excellent communication diplomacy and practical problem-solving shown during the Trace dynamic follow-up. Clear technical articulation and realistic client management.',
      '["Node.js Caching & Memory Management", "TypeScript State Reducer Architecture"]',
      'Alex, we were very impressed by how you handled the abrupt client requirement change in Trace. However, our backend architecture relies heavily on high-throughput Node.js microservices with in-memory caching. We want to see evidence of your backend cache invalidation and state management capabilities before making a final offer. Please complete the mini-project below to qualify for priority reapplication.',
      '["https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", "https://martinfowler.com/articles/patterns-of-distributed-systems/"]',
      1
    )
  `).run();

  // Recommended Mini-Project (Assigned to Alex)
  db.prepare(`
    INSERT INTO mini_projects (
      id, feedback_id, candidate_id, title, skill_name, objective, requirements, acceptance_criteria, status, created_at
    ) VALUES (
      'mp_nexus_alex_1', 'fbk_nexus_alex', 'cand_alex',
      'Resilient In-Memory LRU Cache with TTL & Eviction Alerts',
      'Node.js & Caching',
      'Construct a high-performance in-memory LRU (Least Recently Used) cache class in TypeScript/Node.js with time-to-live (TTL) expiration, thread-safe access simulation, and telemetry event logging on eviction.',
      '1. Implement get(key) and set(key, value, ttlMs).\n2. Enforce max capacity eviction with least recently used policy.\n3. Add active cleanup of expired keys on read.\n4. Expose hit-rate and eviction count metrics.\n5. Include unit tests or demonstration script.',
      'Demonstrated TypeScript type-safety, zero memory leaks, O(1) average lookup/eviction, and clear architectural rationale.',
      'accepted', datetime('now', '-1 hours')
    )
  `).run();

  // Mini-project submission and acceptance
  db.prepare(`
    INSERT INTO mini_project_submissions (
      id, mini_project_id, submission_text, repo_url, explanation, status, reviewer_feedback, submitted_at, reviewed_at
    ) VALUES (
      'mps_alex_1', 'mp_nexus_alex_1',
      'Implemented an LRU cache combining a Hash Map with a Doubly Linked List for guaranteed O(1) get, set, and evict operations. Implemented lazy expiration pruning on retrieval as well as a background interval cleaner. Metrics tracking recorded 94% cache hits during load simulation tests.',
      'https://github.com/alexrivera-demo/lru-cache-service-ts',
      'Used a doubly linked list node structure with TypeScript generics to ensure type safety for arbitrary value payloads. Kept memory footprint bounded by strictly enforcing maxCapacity.',
      'accepted',
      'Outstanding implementation. Clear clean code, O(1) doubly-linked list mechanics verified, and excellent test coverage. This satisfies our backend skill requirement and qualifies Alex for reapplication.',
      datetime('now', '-45 minutes'), datetime('now', '-15 minutes')
    )
  `).run();

  // Profile evidence added for Alex
  db.prepare(`
    INSERT INTO profile_evidence (
      id, candidate_id, skill_name, title, description, evidence_url, mini_project_id, verified_at
    ) VALUES (
      'evd_alex_cache', 'cand_alex', 'Node.js & Caching',
      'Verified Mini-Project: Resilient LRU Cache & In-Memory Eviction',
      'Peer-reviewed and verified implementation of O(1) doubly linked list LRU cache with TTL expiration and performance metrics.',
      'https://github.com/alexrivera-demo/lru-cache-service-ts',
      'mp_nexus_alex_1', datetime('now', '-15 minutes')
    )
  `).run();

  // Add the new skill to Alex's profile as verified!
  db.prepare(`
    INSERT OR REPLACE INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
    VALUES ('csk_alex_cache', 'cand_alex', 'skl_node', 'advanced', 'project_verified', datetime('now', '-15 minutes'))
  `).run();

  // 11. Seed Suspicious Job Report (Awaiting Moderator Review)
  db.prepare(`
    INSERT INTO job_reports (
      id, job_id, reporter_id, category, description, evidence_notes, status, created_at
    ) VALUES (
      'rep_apex_1', 'job_suspicious_1', 'usr_candidate_2',
      'fee_request',
      'Employer listing asks candidates for an upfront $85 "background processing and training equipment deposit" and directs applicants to a private Telegram handle.',
      'Direct quote from job listing: "Registration fee of $85 is required for background processing and training deposit equipment before joining."',
      'open', datetime('now', '-6 hours')
    )
  `).run();

  // 12. Seed Mentors Directory
  db.prepare(`
    INSERT INTO mentors (
      id, user_id, headline, expertise, skills, experience_years, bio, availability
    ) VALUES (
      'men_marcus', 'usr_mentor_1',
      'Principal Distributed Systems Architect at Hyperscale Tech',
      'System Architecture, Engineering Leadership & Hackathon Mentorship',
      '["Distributed Systems", "TypeScript", "React Architecture", "Database Scaling", "Career Strategy"]',
      12,
      'Passionate about mentoring early and mid-career engineers. Believer in learning through evidence and building working prototypes rather than memorizing interview tricks.',
      'Available Tuesdays & Thursdays for 30-min portfolio and project reviews'
    )
  `).run();

  // 13. Seed Startup Co-Founder Directory
  db.prepare(`
    INSERT INTO startup_profiles (
      id, founder_id, company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed
    ) VALUES (
      'stp_greenpulse', 'usr_candidate_1',
      'GreenPulse Analytics', 'Climate & CleanTech',
      'Real-time carbon emissions telemetry for distributed cloud workloads.',
      'GreenPulse is building developer SDKs that correlate cloud compute instances with real-time grid carbon intensity, enabling automated workload shifting to clean energy hours.',
      'Prototype', 'Part-time',
      'Technical Co-Founder / DevOps Lead',
      '["Cloud Infrastructure", "Python", "Data Pipelines", "API Design"]'
    )
  `).run();

  db.prepare(`
    INSERT INTO startup_profiles (
      id, founder_id, company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed
    ) VALUES (
      'stp_medisync', 'usr_candidate_2',
      'MediSync AI', 'Healthcare & AI',
      'Privacy-first clinical trial eligibility parsing for community clinics.',
      'MediSync simplifies clinical trial discovery for underserved patient populations by translating complex protocol eligibility criteria into natural language summaries.',
      'Early Traction', 'Full-time',
      'Full-Stack Founding Engineer',
      '["React", "TypeScript", "FastAPI", "FHIR / Health Tech Standards"]'
    )
  `).run();

  // 14. Seed In-App Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    'not_cand_1', 'usr_candidate_1',
    'Mini-Project Accepted & Skill Verified!',
    'Your LRU Cache mini-project was accepted by Elena Rostova. Node.js has been upgraded to verified on your profile. You are now eligible to reapply!',
    '/candidate/growth', 0, datetimeOffset('-15 minutes')
  );

  insertNotif.run(
    'not_cand_2', 'usr_candidate_1',
    'Constructive Feedback Received for Junior Full-Stack Engineer',
    'Nexus Cloud Systems reviewed your Trace evidence report and assigned a practical mini-project to qualify for reapplication.',
    '/candidate/growth', 1, datetimeOffset('-1 hours')
  );

  insertNotif.run(
    'not_emp_1', 'usr_employer_1',
    'New Practical Mini-Project Evidence Submitted',
    'Alex Rivera submitted code repository and documentation for "Resilient In-Memory LRU Cache".',
    '/employer/applicants', 1, datetimeOffset('-45 minutes')
  );

  insertNotif.run(
    'not_adm_1', 'usr_admin_1',
    'Suspicious Job Listing Flagged for Moderation',
    'Priya Sharma reported "Remote Customer Support Assistant" for advance recruitment fee solicitation.',
    '/admin/reports', 0, datetimeOffset('-6 hours')
  );

  console.log('SkillBridge AI database successfully seeded with all realistic demo scenarios!');
}

function datetimeOffset(offsetStr: string): string {
  const d = new Date();
  if (offsetStr.includes('minutes')) {
    const min = parseInt(offsetStr.replace(/[^0-9]/g, '')) || 0;
    d.setMinutes(d.getMinutes() - min);
  } else if (offsetStr.includes('hours')) {
    const hr = parseInt(offsetStr.replace(/[^0-9]/g, '')) || 0;
    d.setHours(d.getHours() - hr);
  }
  return d.toISOString();
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed();
  process.exit(0);
}
