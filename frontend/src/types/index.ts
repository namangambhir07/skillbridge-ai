export interface User {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'employer' | 'mentor' | 'admin';
  created_at?: string;
}

export interface CandidateSkill {
  id?: string;
  name: string;
  category?: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence_source: 'self_reported' | 'assessment_verified' | 'project_verified';
  verified_at?: string | null;
}

export interface ProfileEvidence {
  id: string;
  candidate_id: string;
  skill_name: string;
  title: string;
  description?: string;
  evidence_url?: string;
  mini_project_id?: string;
  verified_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline: string;
  bio: string;
  education?: string;
  experience?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  preferred_roles?: string;
  preferred_work_mode?: 'remote' | 'hybrid' | 'onsite' | 'any';
  location_preference?: string;
  availability?: string;
  profile_visibility?: 'public' | 'verified_employers_only' | 'private';
  skills?: CandidateSkill[];
}

export interface EmployerProfile {
  id: string;
  user_id: string;
  org_name: string;
  org_website?: string;
  business_email?: string;
  industry?: string;
  company_size?: string;
  description?: string;
  logo_url?: string;
  verification_status?: 'not_submitted' | 'pending_review' | 'additional_info_required' | 'verified' | 'rejected';
  registration_number?: string;
  reviewer_notes?: string;
}

export interface JobRequirement {
  name: string;
  is_required: boolean | number;
  min_proficiency?: string;
}

export interface MatchResult {
  overallScore: number;
  breakdown: {
    requiredScore: number;
    preferredScore: number;
    experienceScore: number;
    assessmentScore: number;
  };
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  verifiedSkills: string[];
  explanation: string;
  recommendationLevel: 'Strong Match' | 'Good Match' | 'Potential Match' | 'Skill Development Recommended';
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  opportunity_type: 'job' | 'internship';
  category: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  location: string;
  experience_level: string;
  description: string;
  responsibilities?: string;
  eligibility_criteria?: string;
  salary_range?: string;
  deadline?: string;
  status: 'draft' | 'review_required' | 'published' | 'closed' | 'suspended';
  safety_verdict?: 'ALLOW' | 'REVIEW' | 'BLOCK';
  safety_reasons?: string;
  created_at: string;
  org_name: string;
  org_website?: string;
  logo_url?: string;
  verification_status?: 'not_submitted' | 'pending_review' | 'additional_info_required' | 'verified' | 'rejected';
  requirements?: JobRequirement[];
  match?: MatchResult | null;
  isSaved?: boolean;
  applicant_count?: number;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  status: string;
  notes?: string;
  changed_by_name?: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'applied' | 'under_review' | 'assessment_required' | 'assessment_submitted' | 'shortlisted' | 'improvement_suggested' | 'selected' | 'rejected' | 'withdrawn';
  applied_at: string;
  updated_at: string;
  reapplication_count: number;
  previous_application_id?: string;
  job_title?: string;
  opportunity_type?: string;
  work_mode?: string;
  location?: string;
  org_name?: string;
  employer_verification_status?: string;
  assessment_session_id?: string;
  assessment_status?: string;
  feedback_id?: string;
  can_reapply?: number;
  history?: ApplicationStatusHistory[];
}

export interface Assessment {
  id: string;
  job_id?: string;
  title: string;
  task_type: 'coding' | 'writing' | 'data_analysis' | 'problem_solving';
  initial_prompt: string;
  follow_up_prompt: string;
  evaluation_criteria: string;
  time_limit_minutes: number;
  status: string;
}

export interface AssessmentSession {
  id: string;
  assessment_id: string;
  candidate_id: string;
  application_id?: string;
  status: 'not_started' | 'in_progress' | 'initial_submitted' | 'follow_up_active' | 'completed';
  consent_accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  paste_count: number;
  edit_count: number;
  elapsed_seconds: number;
}

export interface TelemetryEvent {
  id: string;
  session_id: string;
  event_type: 'opened' | 'consent_accepted' | 'paste_event' | 'editor_change' | 'initial_submit' | 'follow_up_viewed' | 'revision_submit';
  metadata: string;
  event_sequence: number;
  created_at: string;
}

export interface RubricItem {
  criterion: string;
  score: number;
  maxScore: number;
  observation: string;
}

export interface AdaptationEvaluation {
  id: string;
  session_id: string;
  addresses_requirement: number;
  relevance_score: number;
  explanation_quality: number;
  rubric_breakdown?: string;
  rubricBreakdown?: RubricItem[];
  feedback_summary?: string;
  evaluated_at?: string;
}

export interface CandidateFeedback {
  id: string;
  application_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  strengths: string;
  skill_gaps: string;
  feedback_message: string;
  learning_resources?: string;
  can_reapply: number;
  created_at: string;
  job_title?: string;
  org_name?: string;
}

export interface MiniProject {
  id: string;
  feedback_id?: string;
  candidate_id: string;
  title: string;
  skill_name: string;
  objective: string;
  requirements: string;
  acceptance_criteria: string;
  status: 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'revision_requested' | 'not_demonstrated';
  created_at: string;
  job_title?: string;
  org_name?: string;
  feedback_message?: string;
}

export interface MiniProjectSubmission {
  id: string;
  mini_project_id: string;
  submission_text: string;
  repo_url?: string;
  explanation: string;
  status: string;
  reviewer_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  headline: string;
  expertise: string;
  skills: string[];
  experience_years: number;
  bio: string;
  availability: string;
}

export interface StartupProfile {
  id: string;
  founder_id: string;
  founder_name?: string;
  company_name: string;
  domain: string;
  tagline: string;
  description: string;
  stage: 'Idea' | 'Prototype' | 'Early Traction' | 'Scaling';
  commitment_type: 'Full-time' | 'Part-time' | 'Flexible';
  roles_needed: string;
  skills_needed: string[];
  created_at: string;
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  headline?: string;
  bio?: string;
  message: string;
  goals: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  feedback?: string;
  created_at: string;
}
