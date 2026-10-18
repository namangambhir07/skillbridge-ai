import { calculateMatchScore } from '../services/matchingEngine.js';
import { checkJobSafety } from '../services/safetyService.js';
import { evaluateAdaptation } from '../services/adaptationEvaluator.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/auth.js';
import { db, initDatabase } from '../db/database.js';
import { runSeed } from '../db/seed.js';
import app from '../server.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n=============================================');
  console.log('SkillBridge AI - Business Logic Test Suite');
  console.log('=============================================\n');

  await initDatabase();

  // If running in in-memory test environment, seed database automatically
  const userCheck = ((await db.prepare('SELECT COUNT(*) as c FROM users').get()) as any)?.c;
  if (Number(userCheck || 0) === 0) {
    await runSeed();
  }

  // 1. Auth & Crypto Tests
  console.log('1. Authentication & Security:');
  const rawPw = 'StrongSecurePass123!';
  const hashed = hashPassword(rawPw);
  assert(hashed !== rawPw && hashed.length > 20, 'Password hashing generates bcrypt hash');
  assert(comparePassword(rawPw, hashed), 'comparePassword validates correct password');
  assert(!comparePassword('WrongPassword!', hashed), 'comparePassword rejects incorrect password');

  const token = generateToken({
    userId: 'usr_test_1',
    email: 'test@skillbridge.ai',
    role: 'candidate',
    name: 'Test Candidate',
  });
  const decoded = verifyToken(token);
  assert(decoded !== null && decoded.email === 'test@skillbridge.ai', 'JWT token signs and verifies correctly');

  // 2. Safety Policy Engine Tests
  console.log('\n2. Prototype Safety Policy Engine:');
  const safeJob = checkJobSafety('Senior React Developer', 'Build accessible design systems with TypeScript, Tailwind, and React.');
  assert(safeJob.verdict === 'ALLOW', 'Safe job description is ALLOWED');
  assert(safeJob.ruleIds.length === 0, 'Safe job has 0 triggered safety rules');

  const feeJob = checkJobSafety('Data Assistant', 'Immediate placement. Registration fee of $100 is required for training equipment deposit before starting.');
  assert(feeJob.verdict === 'BLOCK', 'Advance fee requirement triggers BLOCK verdict');
  assert(feeJob.requiresHumanReview === true, 'Fee scam rule flags requiresHumanReview = true');
  assert(feeJob.ruleIds.includes('FEE_PAYMENT_BLOCK'), 'Matches FEE_PAYMENT_BLOCK rule ID');

  const genderJob = checkJobSafety('Office Executive', 'Men only need apply for this fast-paced position.');
  assert(genderJob.verdict === 'BLOCK', 'Gender discriminatory requirement triggers BLOCK');

  const telegramJob = checkJobSafety('Marketing Specialist', 'Great remote opportunity. Please contact us on Telegram directly to schedule interview.');
  assert(telegramJob.verdict === 'REVIEW', 'Circumventing platform to Telegram triggers REVIEW verdict');

  // 3. Matching Engine Tests
  console.log('\n3. Explainable Matching Engine:');
  const candidate = {
    id: 'cand_1',
    skills: [
      { name: 'React', proficiency_level: 'advanced' as const, evidence_source: 'assessment_verified' as const },
      { name: 'TypeScript', proficiency_level: 'intermediate' as const, evidence_source: 'project_verified' as const },
    ],
    experience: 'Built responsive web dashboards in React and TypeScript.',
  };

  const highMatchJob = {
    id: 'job_1',
    title: 'Frontend Engineer',
    category: 'Software Engineering',
    work_mode: 'remote',
    location: 'Remote',
    experience_level: 'Mid',
    requirements: [
      { name: 'React', is_required: true, min_proficiency: 'intermediate' },
      { name: 'TypeScript', is_required: true, min_proficiency: 'intermediate' },
    ],
  };

  const matchHigh = calculateMatchScore(candidate, highMatchJob, true);
  assert(matchHigh.overallScore >= 80, `High alignment yields strong score (${matchHigh.overallScore}/100)`);
  assert(matchHigh.recommendationLevel === 'Strong Match', 'Recommendation level is Strong Match');
  assert(matchHigh.matchedRequiredSkills.includes('React'), 'Identifies React as matched required skill');
  assert(matchHigh.verifiedSkills.includes('React'), 'Identifies React as verified skill');

  const lowMatchJob = {
    id: 'job_2',
    title: 'Rust Systems Architect',
    category: 'Systems',
    work_mode: 'onsite',
    location: 'Berlin',
    experience_level: 'Senior',
    requirements: [
      { name: 'Rust', is_required: true, min_proficiency: 'expert' },
      { name: 'WebAssembly', is_required: true, min_proficiency: 'advanced' },
      { name: 'Kubernetes', is_required: true, min_proficiency: 'advanced' },
    ],
  };

  const matchLow = calculateMatchScore(candidate, lowMatchJob, false);
  assert(matchLow.overallScore < 50, `Unmatched skills yield low score (${matchLow.overallScore}/100)`);
  assert(matchLow.missingRequiredSkills.includes('Rust'), 'Identifies Rust as missing required skill');
  assert(matchLow.explanation.length > 20, 'Generates explainable human-readable reasoning');

  // 4. Trace Dynamic Adaptation Evaluation Tests
  console.log('\n4. Trace Dynamic Follow-Up Adaptation Evaluator:');
  const initialText = 'Dear Client, We are experiencing a 4-day delivery delay due to backend migration validation.';
  const revisedText = 'Dear Client, In response to your executive deadline, we will ship Phase 1 on schedule Monday, and defer Phase 2 analytics by 3 days.';
  const explanation = 'Adapted to the budget constraint by splitting the release into a 2-stage rollout.';

  const evaluation = evaluateAdaptation(
    initialText,
    revisedText,
    explanation,
    'Client executive constraint: budget reduced 50% or 1-day limit.'
  );

  assert(evaluation.overallAdaptationScore >= 80, `Adaptive response scores well (${evaluation.overallAdaptationScore}/100)`);
  assert(evaluation.rubricItems.length === 3, 'Evaluates all 3 rubric criteria');
  assert(evaluation.addressesRequirementScore > 70, 'Detects substantive revision addressing the new constraint');

  // Identical text test (failure to adapt)
  const nonAdaptiveEval = evaluateAdaptation(initialText, initialText, '', 'New scenario constraint');
  assert(nonAdaptiveEval.addressesRequirementScore < 30, 'Identical text flagged with low adaptation score');

  // 5. Database Seed Verification
  console.log('\n5. Persistent Database Seed Verification:');
  const candidateUser = (await db.prepare('SELECT id, name FROM users WHERE email = ?').get('candidate@skillbridge.ai')) as any;
  assert(candidateUser && candidateUser.name === 'Alex Rivera', 'Candidate demo account exists in database');

  const employerUser = (await db.prepare('SELECT id, name FROM users WHERE email = ?').get('employer@skillbridge.ai')) as any;
  assert(employerUser && employerUser.name === 'Elena Rostova', 'Employer demo account exists in database');

  const verifiedOrg = (await db.prepare("SELECT status FROM employer_verifications WHERE employer_id = 'emp_nexus'").get()) as any;
  assert(verifiedOrg && verifiedOrg.status === 'verified', 'Nexus Cloud Systems has verified employer status');

  const jobsCount = Number(((await db.prepare('SELECT COUNT(*) as c FROM jobs').get()) as any)?.c || 0);
  assert(jobsCount >= 4, `Database contains ${jobsCount} seeded opportunities`);

  const assessmentSession = (await db.prepare("SELECT id, status, paste_count FROM assessment_sessions WHERE id = 'ses_alex_demo_1'").get()) as any;
  assert(assessmentSession && assessmentSession.status === 'completed', 'Trace assessment session seeded with completed status');
  assert(assessmentSession.paste_count === 1, 'Objective telemetry captures 1 paste event without accusation');

  const miniProject = (await db.prepare("SELECT status FROM mini_projects WHERE id = 'mp_nexus_alex_1'").get()) as any;
  assert(miniProject && miniProject.status === 'accepted', 'Mini-project seeded in accepted state for reapplication proof');

  // 6. HTTP Route & Registration Endpoint Verification
  console.log('\n6. HTTP Route & Registration Verification:');
  const server = app.listen(0);
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  // 6a. Canonical /api/v1/auth/register
  const res1 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Canonical Test Candidate',
      email: 'canonical@skillbridge.ai',
      password: 'Password123!',
      role: 'candidate',
      headline: 'Frontend Engineer',
    }),
  });
  assert(res1.status === 201, 'Canonical POST /api/v1/auth/register returns HTTP 201 Created');
  const data1 = (await res1.json()) as any;
  assert(data1.token && data1.user?.email === 'canonical@skillbridge.ai', 'Registration response contains JWT token and user metadata');

  // 6b. Resilient alias: /api/v1/register (without /auth)
  const res2 = await fetch(`${baseUrl}/api/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alias Test Employer',
      email: 'alias_emp@skillbridge.ai',
      password: 'Password123!',
      role: 'employer',
      orgName: 'Alias Cloud Tech',
    }),
  });
  assert(res2.status === 201, 'Alias POST /api/v1/register (without /auth) returns HTTP 201 Created');

  // 6c. Resilient alias: /api/auth/register (without /v1)
  const res3 = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alias Test Mentor',
      email: 'alias_mentor@skillbridge.ai',
      password: 'Password123!',
      role: 'mentor',
    }),
  });
  assert(res3.status === 201, 'Alias POST /api/auth/register (without /v1) returns HTTP 201 Created');

  // 6d. Health endpoints
  const health1 = await fetch(`${baseUrl}/api/v1/health`);
  assert(health1.status === 200, 'Health endpoint /api/v1/health returns HTTP 200');

  const health2 = await fetch(`${baseUrl}/health`);
  assert(health2.status === 200, 'Health endpoint /health returns HTTP 200');

  // 6e. Demo Login & Credential Verification
  console.log('\n7. Demo Login & Roles Verification:');
  const demoAccountsRes = await fetch(`${baseUrl}/api/v1/auth/demo-accounts`);
  assert(demoAccountsRes.status === 200, 'Endpoint /api/v1/auth/demo-accounts returns HTTP 200');

  const candidateLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'candidate@skillbridge.ai', password: 'Candidate123!' }),
  });
  assert(candidateLoginRes.status === 200, 'Candidate demo login returns HTTP 200 OK');
  const candidateData = (await candidateLoginRes.json()) as any;
  assert(candidateData.token && candidateData.user?.role === 'candidate', 'Candidate login returns token and candidate role');

  const employerLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employer@skillbridge.ai', password: 'Employer123!' }),
  });
  assert(employerLoginRes.status === 200, 'Employer demo login returns HTTP 200 OK');
  const employerData = (await employerLoginRes.json()) as any;
  assert(employerData.token && employerData.user?.role === 'employer', 'Employer login returns token and employer role');

  const mentorLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mentor@skillbridge.ai', password: 'Mentor123!' }),
  });
  assert(mentorLoginRes.status === 200, 'Mentor demo login returns HTTP 200 OK');

  const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@skillbridge.ai', password: 'Admin123!' }),
  });
  assert(adminLoginRes.status === 200, 'Admin demo login returns HTTP 200 OK');

  server.close();

  await db.close();

  console.log('\n=============================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
