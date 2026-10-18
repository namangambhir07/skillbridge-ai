import { db, initDatabase } from './database.js';
import { hashPassword } from '../utils/auth.js';

function datetimeOffset(offsetStr: string, additionalSeconds = 0): string {
  const d = new Date();
  if (offsetStr.includes('days')) {
    const days = parseInt(offsetStr.replace(/[^0-9]/g, '')) || 0;
    d.setDate(d.getDate() - days);
  } else if (offsetStr.includes('hours')) {
    const hr = parseInt(offsetStr.replace(/[^0-9]/g, '')) || 0;
    d.setHours(d.getHours() - hr);
  } else if (offsetStr.includes('minutes')) {
    const min = parseInt(offsetStr.replace(/[^0-9]/g, '')) || 0;
    d.setMinutes(d.getMinutes() - min);
  }
  if (additionalSeconds) {
    d.setSeconds(d.getSeconds() + additionalSeconds);
  }
  return d.toISOString();
}

export async function runSeed(options: { forceClean?: boolean } = {}): Promise<void> {
  const shouldClean = options.forceClean ?? (process.argv.includes('--force-clean') && process.env.NODE_ENV !== 'production');
  console.log(`[Database Seed] Seeding SkillBridge AI demo dataset (mode: ${shouldClean ? 'clean-slate' : 'non-destructive idempotent'})...`);
  await initDatabase();

  if (shouldClean) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Database Seed Warning] Destructive table purge is disabled in production to protect real user data.');
    } else {
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
        await db.prepare(`DELETE FROM ${table}`).run();
      }
    }
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

  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category)
    VALUES (?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category
  `);
  for (const s of skillList) {
    await insertSkill.run(s.id, s.name, s.category);
  }

  // 2. Seed Users
  const defaultPasswordHash = hashPassword('Candidate123!');
  const employerPasswordHash = hashPassword('Employer123!');
  const mentorPasswordHash = hashPassword('Mentor123!');
  const adminPasswordHash = hashPassword('Admin123!');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      name = EXCLUDED.name
  `);

  // Demo Candidate
  await insertUser.run('usr_candidate_1', 'candidate@skillbridge.ai', defaultPasswordHash, 'candidate', 'Alex Rivera');
  // Secondary Candidate
  await insertUser.run('usr_candidate_2', 'priya@skillbridge.ai', defaultPasswordHash, 'candidate', 'Priya Sharma');

  // Demo Employer (Verified)
  await insertUser.run('usr_employer_1', 'employer@skillbridge.ai', employerPasswordHash, 'employer', 'Elena Rostova');
  // Secondary Employer (Pending Review)
  await insertUser.run('usr_employer_2', 'david@quantumfin.demo', employerPasswordHash, 'employer', 'David Vance');
  // Suspicious Employer (Unverified / Flagged)
  await insertUser.run('usr_employer_3', 'recruiter@quickhires.demo', employerPasswordHash, 'employer', 'Jordan Reed');

  // Demo Mentor
  await insertUser.run('usr_mentor_1', 'mentor@skillbridge.ai', mentorPasswordHash, 'mentor', 'Marcus Chen');

  // Demo Admin
  await insertUser.run('usr_admin_1', 'admin@skillbridge.ai', adminPasswordHash, 'admin', 'Sarah Jenkins');

  const getUserId = async (email: string, fallbackId: string) => {
    const row = (await db.prepare('SELECT id FROM users WHERE email = ?').get(email)) as any;
    return row?.id || fallbackId;
  };

  const cand1UserId = await getUserId('candidate@skillbridge.ai', 'usr_candidate_1');
  const cand2UserId = await getUserId('priya@skillbridge.ai', 'usr_candidate_2');
  const emp1UserId = await getUserId('employer@skillbridge.ai', 'usr_employer_1');
  const emp2UserId = await getUserId('david@quantumfin.demo', 'usr_employer_2');
  const emp3UserId = await getUserId('recruiter@quickhires.demo', 'usr_employer_3');
  const mentor1UserId = await getUserId('mentor@skillbridge.ai', 'usr_mentor_1');
  const admin1UserId = await getUserId('admin@skillbridge.ai', 'usr_admin_1');

  // 3. Seed Candidate Profiles
  const insertCandidateProfile = db.prepare(`
    INSERT INTO candidate_profiles (
      id, user_id, headline, bio, education, experience, portfolio_url, github_url, linkedin_url,
      preferred_roles, preferred_work_mode, location_preference, availability, profile_visibility
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT (user_id) DO UPDATE SET
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      education = EXCLUDED.education,
      experience = EXCLUDED.experience,
      portfolio_url = EXCLUDED.portfolio_url,
      github_url = EXCLUDED.github_url,
      linkedin_url = EXCLUDED.linkedin_url,
      preferred_roles = EXCLUDED.preferred_roles,
      preferred_work_mode = EXCLUDED.preferred_work_mode,
      location_preference = EXCLUDED.location_preference,
      availability = EXCLUDED.availability,
      profile_visibility = EXCLUDED.profile_visibility
  `);

  await insertCandidateProfile.run(
    'cand_alex', cand1UserId,
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
  );

  await insertCandidateProfile.run(
    'cand_priya', cand2UserId,
    'Data Analyst & Python Specialist',
    'Specializing in analytical modeling, SQL optimization, and automated reporting dashboards.',
    'M.S. in Data Analytics, State University (2023)',
    'Data Analytics Associate at Insight Analytics (1.5 years).',
    null, null, null,
    'Data Analyst, BI Developer, Analytics Engineer',
    'hybrid',
    'New York / Hybrid',
    '2 weeks',
    'public'
  );

  const getCandidateProfileId = async (userId: string, fallbackId: string) => {
    const row = (await db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(userId)) as any;
    return row?.id || fallbackId;
  };
  const candAlexId = await getCandidateProfileId(cand1UserId, 'cand_alex');
  const candPriyaId = await getCandidateProfileId(cand2UserId, 'cand_priya');

  // 4. Candidate Skills
  const insertCandidateSkill = db.prepare(`
    INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (candidate_id, skill_id) DO UPDATE SET
      proficiency_level = EXCLUDED.proficiency_level,
      evidence_source = EXCLUDED.evidence_source,
      verified_at = EXCLUDED.verified_at
  `);

  await insertCandidateSkill.run('csk_1', candAlexId, 'skl_react', 'advanced', 'assessment_verified', new Date().toISOString());
  await insertCandidateSkill.run('csk_2', candAlexId, 'skl_ts', 'intermediate', 'project_verified', new Date().toISOString());
  await insertCandidateSkill.run('csk_3', candAlexId, 'skl_tailwind', 'advanced', 'self_reported', null);
  await insertCandidateSkill.run('csk_4', candAlexId, 'skl_api', 'intermediate', 'self_reported', null);

  await insertCandidateSkill.run('csk_5', candPriyaId, 'skl_py', 'advanced', 'self_reported', null);
  await insertCandidateSkill.run('csk_6', candPriyaId, 'skl_sql', 'expert', 'assessment_verified', new Date().toISOString());

  // 5. Seed Employer Profiles & Verifications
  const insertEmployerProfile = db.prepare(`
    INSERT INTO employer_profiles (
      id, user_id, org_name, org_website, business_email, industry, company_size, description, logo_url
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT (user_id) DO UPDATE SET
      org_name = EXCLUDED.org_name,
      org_website = EXCLUDED.org_website,
      business_email = EXCLUDED.business_email,
      industry = EXCLUDED.industry,
      company_size = EXCLUDED.company_size,
      description = EXCLUDED.description,
      logo_url = EXCLUDED.logo_url
  `);

  await insertEmployerProfile.run(
    'emp_nexus', emp1UserId,
    'Nexus Cloud Systems', 'https://nexuscloud.demo', 'careers@nexuscloud.demo',
    'Cloud Infrastructure & Developer Tools', '50-200 employees',
    'Nexus Cloud Systems builds high-velocity enterprise cloud infrastructure and developer productivity platforms.',
    'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=150&auto=format&fit=crop&q=80'
  );

  await insertEmployerProfile.run(
    'emp_quantum', emp2UserId,
    'Quantum FinTech Labs', 'https://quantumfintech.demo', 'contact@quantumfintech.demo',
    'Financial Technology', '10-50 employees',
    'Building next-generation algorithmic wealth management and real-time transaction reconciliation engines.',
    null
  );

  await insertEmployerProfile.run(
    'emp_apex', emp3UserId,
    'Apex Digital Recruitment', 'http://unverified-apex-jobs.xyz', 'recruitment-apex@freemail.demo',
    'Staffing & Outsourcing', '1-10 employees',
    'Fast-track hiring consultancy.',
    null
  );

  const getEmployerProfileId = async (userId: string, fallbackId: string) => {
    const row = (await db.prepare('SELECT id FROM employer_profiles WHERE user_id = ?').get(userId)) as any;
    return row?.id || fallbackId;
  };
  const empNexusId = await getEmployerProfileId(emp1UserId, 'emp_nexus');
  const empQuantumId = await getEmployerProfileId(emp2UserId, 'emp_quantum');
  const empApexId = await getEmployerProfileId(emp3UserId, 'emp_apex');

  const insertVerification = db.prepare(`
    INSERT INTO employer_verifications (
      id, employer_id, status, registration_number, supporting_info, reviewer_notes, reviewed_by, reviewed_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT (employer_id) DO UPDATE SET
      status = EXCLUDED.status,
      registration_number = EXCLUDED.registration_number,
      supporting_info = EXCLUDED.supporting_info,
      reviewer_notes = EXCLUDED.reviewer_notes,
      reviewed_by = EXCLUDED.reviewed_by,
      reviewed_at = EXCLUDED.reviewed_at
  `);

  await insertVerification.run(
    'ver_nexus', empNexusId, 'verified', 'US-DEL-2021-998812',
    'Articles of Incorporation verified, corporate domain email authenticated, active state corporate registry verified.',
    'Approved: Registered enterprise entity in good standing with corporate domain authentication.',
    admin1UserId, new Date().toISOString()
  );

  await insertVerification.run(
    'ver_quantum', empQuantumId, 'pending_review', 'UK-CO-2023-455219',
    'Registered UK entity; undergoing bank accreditation and platform identity check.',
    null, null, null
  );

  await insertVerification.run(
    'ver_apex', empApexId, 'not_submitted', '', 'No documentation provided.',
    null, null, null
  );

  // 6. Seed Jobs & Internships
  const insertJob = db.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, opportunity_type, category, work_mode, location,
      experience_level, description, responsibilities, eligibility_criteria, salary_range, status, safety_verdict, safety_reasons
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT (id) DO UPDATE SET
      employer_id = EXCLUDED.employer_id,
      title = EXCLUDED.title,
      opportunity_type = EXCLUDED.opportunity_type,
      category = EXCLUDED.category,
      work_mode = EXCLUDED.work_mode,
      location = EXCLUDED.location,
      experience_level = EXCLUDED.experience_level,
      description = EXCLUDED.description,
      responsibilities = EXCLUDED.responsibilities,
      eligibility_criteria = EXCLUDED.eligibility_criteria,
      salary_range = EXCLUDED.salary_range,
      status = EXCLUDED.status,
      safety_verdict = EXCLUDED.safety_verdict,
      safety_reasons = EXCLUDED.safety_reasons
  `);

  await insertJob.run(
    'job_nexus_fs', empNexusId,
    'Junior Full-Stack Engineer', 'job', 'Software Engineering', 'remote', 'Remote (Global)',
    '0-2 years',
    'We are looking for a motivated Full-Stack Engineer to join our Developer Experience team. You will build user-facing features in React and TypeScript while integrating reliable backend APIs in Node.js. Practical skills, problem-solving, and clean communication are prioritized over pedigree.',
    'Develop modular frontend components in React and TypeScript.\nDesign and maintain REST endpoints in Node.js.\nWrite automated tests and participate in code reviews.\nCollaborate with product designers and platform engineers.',
    'Proficiency in React and TypeScript. Demonstrated understanding of state management and API integration. Open to recent graduates or self-taught developers with practical project evidence.',
    '$75,000 - $95,000 USD',
    'published', 'ALLOW', null
  );

  await insertJob.run(
    'job_nexus_intern', empNexusId,
    'Frontend Engineering Intern', 'internship', 'Software Engineering', 'remote', 'Remote',
    'Entry Level',
    'A 6-month hands-on internship focusing on modern web interfaces, component architecture, and accessibility.',
    'Implement reusable UI widgets.\nRefactor components for WCAG accessibility standards.\nParticipate in sprint planning.',
    'Basic familiarity with React, HTML5, CSS3, and JavaScript.',
    '$35 - $45 / hour',
    'published', 'ALLOW', null
  );

  await insertJob.run(
    'job_quantum_be', empQuantumId,
    'Backend Systems Engineer', 'job', 'Financial Technology', 'hybrid', 'London, UK',
    '1-3 years',
    'Build resilient microservices handling high-throughput market events. Focus on low-latency data ingestion and SQL transactions.',
    'Implement robust services in Node.js or Python.\nDesign database schemas with PostgreSQL.\nMonitor API latency and error budgets.',
    'Solid grasp of SQL, concurrency, and RESTful architectures.',
    '£55,000 - £70,000 GBP',
    'published', 'ALLOW', null
  );

  await insertJob.run(
    'job_suspicious_1', empApexId,
    'Remote Customer Support Assistant (Immediate Placement)',
    'job', 'Customer Support', 'remote', 'Remote',
    'No Experience Needed',
    'Urgent opening for remote data assistant. High guaranteed payout. Note: Registration fee of $85 is required for background processing and training deposit equipment before joining. Contact us on Telegram directly.',
    'Data entry and remote customer emails.',
    'Must have computer and internet.',
    '$4,000 / month',
    'review_required', 'BLOCK',
    '["Job description appears to request upfront payments, processing fees, or money transfers from applicants, which violates platform safety policy.","Job directs applicants to circumvent the platform to private instant messaging channels without verified business credentials."]'
  );

  // 7. Seed Job Requirements
  const insertJobReq = db.prepare(`
    INSERT INTO job_skill_requirements (id, job_id, skill_id, is_required, min_proficiency)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (job_id, skill_id) DO UPDATE SET
      is_required = EXCLUDED.is_required,
      min_proficiency = EXCLUDED.min_proficiency
  `);

  // Requirements for Junior Full-Stack Engineer at Nexus
  await insertJobReq.run('req_1', 'job_nexus_fs', 'skl_react', 1, 'intermediate');
  await insertJobReq.run('req_2', 'job_nexus_fs', 'skl_ts', 1, 'intermediate');
  await insertJobReq.run('req_3', 'job_nexus_fs', 'skl_node', 1, 'intermediate');
  await insertJobReq.run('req_4', 'job_nexus_fs', 'skl_api', 0, 'intermediate');
  await insertJobReq.run('req_5', 'job_nexus_fs', 'skl_tailwind', 0, 'intermediate');

  // Requirements for Quantum Backend Engineer
  await insertJobReq.run('req_6', 'job_quantum_be', 'skl_node', 1, 'advanced');
  await insertJobReq.run('req_7', 'job_quantum_be', 'skl_sql', 1, 'advanced');
  await insertJobReq.run('req_8', 'job_quantum_be', 'skl_py', 0, 'intermediate');

  // 8. Seed Trace Assessment Templates
  const insertAssessment = db.prepare(`
    INSERT INTO assessments (
      id, job_id, title, task_type, initial_prompt, follow_up_prompt, evaluation_criteria, time_limit_minutes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      task_type = EXCLUDED.task_type,
      initial_prompt = EXCLUDED.initial_prompt,
      follow_up_prompt = EXCLUDED.follow_up_prompt,
      evaluation_criteria = EXCLUDED.evaluation_criteria,
      status = EXCLUDED.status
  `);

  await insertAssessment.run(
    'asm_nexus_fs', 'job_nexus_fs',
    'Client Communication & Service Delivery Scenario', 'writing',
    'Scenario: You are a full-stack engineer leading the delivery of a client dashboard feature. Due to unexpected database migration complexities, the planned launch will be delayed by 4 business days. Write a professional, empathetic, and solution-focused email to the client stakeholder explaining the delay, outlining current mitigation steps, and confirming the new release date.',
    'DYNAMIC SCENARIO CHANGE: The client replied stating their executive committee will only accept a 1-day delay or they will reduce project scope by 50%. Revise your email proposal to present a phased rollout (shipping core reporting on schedule, deferring advanced analytics by 4 days) and provide a 1-sentence rationale of your strategic trade-off.',
    'Assesses professional stakeholder communication, technical diplomacy, crisis de-escalation, and adaptability to sudden scope constraints.',
    45, 'published'
  );

  await insertAssessment.run(
    'asm_template_code', null,
    'TypeScript State Reducer & Cache Invalidation', 'coding',
    'Write a clean, strongly-typed state reducer function in TypeScript that manages a paginated list of user records, handles optimistic updates, and tracks error states.',
    'DYNAMIC REQUIREMENT CHANGE: Network latency requires adding an expiration TTL of 30 seconds to cached pages. Modify the reducer state and write a helper function to invalidate stale pages.',
    'Evaluates TypeScript type safety, pure state manipulation, edge-case coverage, and algorithmic adaptability.',
    60, 'published'
  );

  await insertAssessment.run(
    'asm_template_data', null,
    'Business Metric Discrepancy & Root Cause Analysis', 'data_analysis',
    'Analyze a scenario where Monthly Active Users (MAU) increased by 30% while Revenue per User dropped by 22%. Formulate 3 diagnostic hypotheses and describe the SQL queries you would execute.',
    'DYNAMIC CONSTRAINT: The analytics team discovers that 65% of new users originated from a zero-cost promotional partner trial in Southeast Asia. Revise your analysis and actionable recommendation.',
    'Tests analytical rigor, exploratory hypothesis formulation, and business intuition.',
    45, 'published'
  );

  // 9. Seed Application for Alex Rivera
  await db.prepare(`
    INSERT INTO applications (
      id, job_id, candidate_id, status, applied_at, updated_at, reapplication_count
    ) VALUES (
      'app_alex_nexus_1', 'job_nexus_fs', ?, 'improvement_suggested',
      ?, ?, 0
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at
  `).run(candAlexId, datetimeOffset('-3 days'), datetimeOffset('-1 hours'));

  const insertStatusHistory = db.prepare(`
    INSERT INTO application_status_history (id, application_id, status, notes, changed_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `);

  await insertStatusHistory.run('ash_1', 'app_alex_nexus_1', 'applied', 'Initial application submitted', cand1UserId, datetimeOffset('-3 days'));
  await insertStatusHistory.run('ash_2', 'app_alex_nexus_1', 'assessment_required', 'Trace assessment assigned by recruiter', emp1UserId, datetimeOffset('-2 days'));
  await insertStatusHistory.run('ash_3', 'app_alex_nexus_1', 'assessment_submitted', 'Trace assessment and follow-up completed', cand1UserId, datetimeOffset('-2 hours'));
  await insertStatusHistory.run('ash_4', 'app_alex_nexus_1', 'improvement_suggested', 'Strengths in communication noted. Recommended hands-on mini-project to verify Node.js caching & TypeScript state management.', emp1UserId, datetimeOffset('-1 hours'));

  // 10. Seed Completed Assessment Session for Alex Rivera
  const sessionId = 'ses_alex_demo_1';
  await db.prepare(`
    INSERT INTO assessment_sessions (
      id, assessment_id, candidate_id, application_id, status, consent_accepted_at, started_at, completed_at,
      paste_count, edit_count, elapsed_seconds
    ) VALUES (
      '${sessionId}', 'asm_nexus_fs', ?, 'app_alex_nexus_1', 'completed',
      ?, ?, ?,
      1, 14, 1840
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      paste_count = EXCLUDED.paste_count,
      edit_count = EXCLUDED.edit_count,
      elapsed_seconds = EXCLUDED.elapsed_seconds
  `).run(candAlexId, datetimeOffset('-2 hours'), datetimeOffset('-2 hours'), datetimeOffset('-1 hours'));

  // Initial submission
  await db.prepare(`
    INSERT INTO assessment_submissions (
      id, session_id, submission_type, content, candidate_explanation
    ) VALUES (
      'sub_alex_init', '${sessionId}', 'initial',
      'Dear Sarah,\n\nI am reaching out to provide a transparent update regarding our dashboard release milestone. During our end-to-end load validation tests on the database migration layer, our team detected latency spikes that could compromise query reliability under peak user volume.\n\nTo ensure complete data integrity and optimal performance, we have rescheduled the deployment for Thursday, October 22nd (a 4 business-day adjustment). Over the next 72 hours, we are implementing query indexing optimizations and executing stress simulations. We have scheduled a 15-minute briefing tomorrow at 10:00 AM to review our test telemetry and answer any questions.\n\nWe appreciate your partnership and remain committed to delivering a rock-solid release.\n\nBest regards,\nAlex Rivera\nFull-Stack Engineering Team',
      null
    )
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content
  `).run();

  // Revised submission
  await db.prepare(`
    INSERT INTO assessment_submissions (
      id, session_id, submission_type, content, candidate_explanation
    ) VALUES (
      'sub_alex_rev', '${sessionId}', 'revision',
      'Dear Sarah,\n\nThank you for the candid feedback regarding your executive committee milestone. We fully understand the critical nature of maintaining your launch window.\n\nTo protect your schedule while safeguarding system stability, we propose a phased deployment:\n\n1. Phase 1 (On Schedule - Monday, Oct 19): We will ship the core executive dashboard, key KPI visualizers, and standard exports on time with zero delay.\n2. Phase 2 (Thursday, Oct 22): The deep historical breakdown and automated background sync will roll out seamlessly as a secondary update once final stress benchmarks pass.\n\nThis phased plan ensures your executive committee receives immediate access to core metrics on schedule without risking system reliability during your live presentation.\n\nSincerely,\nAlex Rivera\nFull-Stack Engineering Team',
      'Adapted to client constraint by unbundling the release into a phased rollout, delivering core executive value immediately while deferring heavy analytical background jobs by 3 days.'
    )
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      candidate_explanation = EXCLUDED.candidate_explanation
  `).run();

  // Telemetry events
  const insertTel = db.prepare(`
    INSERT INTO telemetry_events (id, session_id, event_type, metadata, event_sequence, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `);

  await insertTel.run('tel_1', sessionId, 'opened', JSON.stringify({ device: 'Desktop Chrome 129', screen: '1920x1080' }), 1, datetimeOffset('-110 minutes', 0));
  await insertTel.run('tel_2', sessionId, 'consent_accepted', JSON.stringify({ policy: 'v1.2-hackathon', noticeVersion: '2026.1' }), 2, datetimeOffset('-110 minutes', 45));
  await insertTel.run('tel_3', sessionId, 'editor_change', JSON.stringify({ changeLength: 85, source: 'keystroke' }), 3, datetimeOffset('-110 minutes', 120));
  await insertTel.run('tel_4', sessionId, 'paste_event', JSON.stringify({ pasteLength: 42, note: 'Candidate pasted internal project code snippet / draft template' }), 4, datetimeOffset('-110 minutes', 300));
  await insertTel.run('tel_5', sessionId, 'editor_change', JSON.stringify({ changeLength: 210, source: 'keystroke' }), 5, datetimeOffset('-110 minutes', 450));
  await insertTel.run('tel_6', sessionId, 'initial_submit', JSON.stringify({ totalChars: 680 }), 6, datetimeOffset('-110 minutes', 920));
  await insertTel.run('tel_7', sessionId, 'follow_up_viewed', JSON.stringify({ trigger: 'dynamic_budget_constraint' }), 7, datetimeOffset('-110 minutes', 930));
  await insertTel.run('tel_8', sessionId, 'editor_change', JSON.stringify({ changeLength: 340, source: 'revision_typing' }), 8, datetimeOffset('-110 minutes', 1200));
  await insertTel.run('tel_9', sessionId, 'revision_submit', JSON.stringify({ finalChars: 810, explanationChars: 180 }), 9, datetimeOffset('-110 minutes', 1840));

  // Adaptation Evaluation
  await db.prepare(`
    INSERT INTO adaptation_evaluations (
      id, session_id, addresses_requirement, relevance_score, explanation_quality, rubric_breakdown, feedback_summary
    ) VALUES (
      'eva_alex_demo', '${sessionId}',
      0.95, 0.90, 0.92,
      '[{"criterion":"Constraint Adaptation","score":95,"maxScore":100,"observation":"Candidate brilliantly pivoted to a phased rollout to meet client executive timeframes without compromising quality."},{"criterion":"Contextual Continuity","score":90,"maxScore":100,"observation":"Maintained professional diplomacy and exact stakeholder role framing."},{"criterion":"Candidate Rationale","score":92,"maxScore":100,"observation":"Clearly articulated the trade-off between core UI availability and background analytics complexity."}]',
      'Strong adaptability demonstrated. Candidate responded constructively to unexpected stakeholder pressure with a pragmatic engineering mitigation.'
    )
    ON CONFLICT (session_id) DO UPDATE SET
      addresses_requirement = EXCLUDED.addresses_requirement,
      relevance_score = EXCLUDED.relevance_score,
      explanation_quality = EXCLUDED.explanation_quality,
      rubric_breakdown = EXCLUDED.rubric_breakdown,
      feedback_summary = EXCLUDED.feedback_summary
  `).run();

  // 11. Employer Feedback
  await db.prepare(`
    INSERT INTO candidate_feedback (
      id, application_id, reviewer_id, strengths, skill_gaps, feedback_message, learning_resources, can_reapply
    ) VALUES (
      'fbk_nexus_alex', 'app_alex_nexus_1', ?,
      'Excellent communication diplomacy and practical problem-solving shown during the Trace dynamic follow-up. Clear technical articulation and realistic client management.',
      '["Node.js Caching & Memory Management", "TypeScript State Reducer Architecture"]',
      'Alex, we were very impressed by how you handled the abrupt client requirement change in Trace. However, our backend architecture relies heavily on high-throughput Node.js microservices with in-memory caching. We want to see evidence of your backend cache invalidation and state management capabilities before making a final offer. Please complete the mini-project below to qualify for priority reapplication.',
      '["https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", "https://martinfowler.com/articles/patterns-of-distributed-systems/"]',
      1
    )
    ON CONFLICT (id) DO UPDATE SET
      strengths = EXCLUDED.strengths,
      skill_gaps = EXCLUDED.skill_gaps,
      feedback_message = EXCLUDED.feedback_message,
      learning_resources = EXCLUDED.learning_resources,
      can_reapply = EXCLUDED.can_reapply
  `).run(emp1UserId);

  // Recommended Mini-Project (Assigned to Alex)
  await db.prepare(`
    INSERT INTO mini_projects (
      id, feedback_id, candidate_id, title, skill_name, objective, requirements, acceptance_criteria, status, created_at
    ) VALUES (
      'mp_nexus_alex_1', 'fbk_nexus_alex', ?,
      'Resilient In-Memory LRU Cache with TTL & Eviction Alerts',
      'Node.js & Caching',
      'Construct a high-performance in-memory LRU (Least Recently Used) cache class in TypeScript/Node.js with time-to-live (TTL) expiration, thread-safe access simulation, and telemetry event logging on eviction.',
      '1. Implement get(key) and set(key, value, ttlMs).\n2. Enforce max capacity eviction with least recently used policy.\n3. Add active cleanup of expired keys on read.\n4. Expose hit-rate and eviction count metrics.\n5. Include unit tests or demonstration script.',
      'Demonstrated TypeScript type-safety, zero memory leaks, O(1) average lookup/eviction, and clear architectural rationale.',
      'accepted', ?
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      objective = EXCLUDED.objective,
      requirements = EXCLUDED.requirements,
      acceptance_criteria = EXCLUDED.acceptance_criteria
  `).run(candAlexId, datetimeOffset('-1 hours'));

  // Mini-project submission and acceptance
  await db.prepare(`
    INSERT INTO mini_project_submissions (
      id, mini_project_id, submission_text, repo_url, explanation, status, reviewer_feedback, submitted_at, reviewed_at
    ) VALUES (
      'mps_alex_1', 'mp_nexus_alex_1',
      'Implemented an LRU cache combining a Hash Map with a Doubly Linked List for guaranteed O(1) get, set, and evict operations. Implemented lazy expiration pruning on retrieval as well as a background interval cleaner. Metrics tracking recorded 94% cache hits during load simulation tests.',
      'https://github.com/alexrivera-demo/lru-cache-service-ts',
      'Used a doubly linked list node structure with TypeScript generics to ensure type safety for arbitrary value payloads. Kept memory footprint bounded by strictly enforcing maxCapacity.',
      'accepted',
      'Outstanding implementation. Clear clean code, O(1) doubly-linked list mechanics verified, and excellent test coverage. This satisfies our backend skill requirement and qualifies Alex for reapplication.',
      ?, ?
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      reviewer_feedback = EXCLUDED.reviewer_feedback,
      repo_url = EXCLUDED.repo_url,
      explanation = EXCLUDED.explanation
  `).run(datetimeOffset('-45 minutes'), datetimeOffset('-15 minutes'));

  // Profile evidence added for Alex
  await db.prepare(`
    INSERT INTO profile_evidence (
      id, candidate_id, skill_name, title, description, evidence_url, mini_project_id, verified_at
    ) VALUES (
      'evd_alex_cache', ?, 'Node.js & Caching',
      'Verified Mini-Project: Resilient LRU Cache & In-Memory Eviction',
      'Peer-reviewed and verified implementation of O(1) doubly linked list LRU cache with TTL expiration and performance metrics.',
      'https://github.com/alexrivera-demo/lru-cache-service-ts',
      'mp_nexus_alex_1', ?
    )
    ON CONFLICT (id) DO NOTHING
  `).run(candAlexId, datetimeOffset('-15 minutes'));

  // Add the new skill to Alex's profile as verified using PostgreSQL ON CONFLICT syntax
  await db.prepare(`
    INSERT INTO candidate_skills (id, candidate_id, skill_id, proficiency_level, evidence_source, verified_at)
    VALUES ('csk_alex_cache', ?, 'skl_node', 'advanced', 'project_verified', ?)
    ON CONFLICT (candidate_id, skill_id) DO UPDATE SET
      proficiency_level = EXCLUDED.proficiency_level,
      evidence_source = EXCLUDED.evidence_source,
      verified_at = EXCLUDED.verified_at
  `).run(candAlexId, datetimeOffset('-15 minutes'));

  // 12. Seed Suspicious Job Report (Awaiting Moderator Review)
  await db.prepare(`
    INSERT INTO job_reports (
      id, job_id, reporter_id, category, description, evidence_notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)
    ON CONFLICT (id) DO NOTHING
  `).run(
    'rep_apex_1',
    'job_suspicious_1',
    cand2UserId,
    'fee_request',
    'Employer listing asks candidates for an upfront $85 "background processing and training equipment deposit" and directs applicants to a private Telegram handle.',
    'Direct quote from job listing: "Registration fee of $85 is required for background processing and training deposit equipment before joining."',
    datetimeOffset('-6 hours')
  );

  // 13. Seed Mentors Directory
  await db.prepare(`
    INSERT INTO mentors (
      id, user_id, headline, expertise, skills, experience_years, bio, availability
    ) VALUES (
      'men_marcus', ?,
      'Principal Distributed Systems Architect at Hyperscale Tech',
      'System Architecture, Engineering Leadership & Hackathon Mentorship',
      '["Distributed Systems", "TypeScript", "React Architecture", "Database Scaling", "Career Strategy"]',
      12,
      'Passionate about mentoring early and mid-career engineers. Believer in learning through evidence and building working prototypes rather than memorizing interview tricks.',
      'Available Tuesdays & Thursdays for 30-min portfolio and project reviews'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      headline = EXCLUDED.headline,
      expertise = EXCLUDED.expertise,
      skills = EXCLUDED.skills,
      experience_years = EXCLUDED.experience_years,
      bio = EXCLUDED.bio,
      availability = EXCLUDED.availability
  `).run(mentor1UserId);

  // 14. Seed Startup Co-Founder Directory
  await db.prepare(`
    INSERT INTO startup_profiles (
      id, founder_id, company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed
    ) VALUES (
      'stp_greenpulse', ?,
      'GreenPulse Analytics', 'Climate & CleanTech',
      'Real-time carbon emissions telemetry for distributed cloud workloads.',
      'GreenPulse is building developer SDKs that correlate cloud compute instances with real-time grid carbon intensity, enabling automated workload shifting to clean energy hours.',
      'Prototype', 'Part-time',
      'Technical Co-Founder / DevOps Lead',
      '["Cloud Infrastructure", "Python", "Data Pipelines", "API Design"]'
    )
    ON CONFLICT (id) DO NOTHING
  `).run(cand1UserId);

  await db.prepare(`
    INSERT INTO startup_profiles (
      id, founder_id, company_name, domain, tagline, description, stage, commitment_type, roles_needed, skills_needed
    ) VALUES (
      'stp_medisync', ?,
      'MediSync AI', 'Healthcare & AI',
      'Privacy-first clinical trial eligibility parsing for community clinics.',
      'MediSync simplifies clinical trial discovery for underserved patient populations by translating complex protocol eligibility criteria into natural language summaries.',
      'Early Traction', 'Full-time',
      'Full-Stack Founding Engineer',
      '["React", "TypeScript", "FastAPI", "FHIR / Health Tech Standards"]'
    )
    ON CONFLICT (id) DO NOTHING
  `).run(cand2UserId);

  // 15. Seed In-App Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `);

  await insertNotif.run(
    'not_cand_1', cand1UserId,
    'Mini-Project Accepted & Skill Verified!',
    'Your LRU Cache mini-project was accepted by Elena Rostova. Node.js has been upgraded to verified on your profile. You are now eligible to reapply!',
    '/candidate/growth', 0, datetimeOffset('-15 minutes')
  );

  await insertNotif.run(
    'not_cand_2', cand1UserId,
    'Constructive Feedback Received for Junior Full-Stack Engineer',
    'Nexus Cloud Systems reviewed your Trace evidence report and assigned a practical mini-project to qualify for reapplication.',
    '/candidate/growth', 1, datetimeOffset('-1 hours')
  );

  await insertNotif.run(
    'not_emp_1', emp1UserId,
    'New Practical Mini-Project Evidence Submitted',
    'Alex Rivera submitted code repository and documentation for "Resilient In-Memory LRU Cache".',
    '/employer/applicants', 1, datetimeOffset('-45 minutes')
  );

  await insertNotif.run(
    'not_adm_1', admin1UserId,
    'Suspicious Job Listing Flagged for Moderation',
    'Priya Sharma reported "Remote Customer Support Assistant" for advance recruitment fee solicitation.',
    '/admin/reports', 0, datetimeOffset('-6 hours')
  );

  console.log('[Database Seed] SkillBridge AI database successfully seeded with all realistic demo scenarios!');
}

let ensureDemoPromise: Promise<void> | null = null;

export async function ensureDemoData(): Promise<void> {
  if (ensureDemoPromise) return ensureDemoPromise;

  ensureDemoPromise = (async () => {
    try {
      await initDatabase();
      const existing = (await db.prepare(
        `SELECT COUNT(*) as count FROM users WHERE email IN ('candidate@skillbridge.ai', 'employer@skillbridge.ai', 'mentor@skillbridge.ai', 'admin@skillbridge.ai')`
      ).get()) as any;

      if (Number(existing?.count || 0) < 4) {
        console.log(`[Database] Found ${existing?.count || 0}/4 demo accounts. Executing non-destructive seed...`);
        await runSeed({ forceClean: false });
      }
    } catch (err: any) {
      console.error('[Database] Failed during ensureDemoData check:', err.message);
    } finally {
      ensureDemoPromise = null;
    }
  })();

  return ensureDemoPromise;
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(() => {
      console.log('Seed execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
