export interface CandidateSkillInput {
  name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence_source: 'self_reported' | 'assessment_verified' | 'project_verified';
}

export interface CandidateMatchingProfile {
  id: string;
  skills: CandidateSkillInput[];
  experience?: string;
  projects?: string;
  education?: string;
  preferred_work_mode?: string;
  location_preference?: string;
}

export interface OpportunitySkillRequirement {
  name: string;
  is_required: boolean | number;
  min_proficiency?: string;
}

export interface OpportunityMatchingInput {
  id: string;
  title: string;
  category: string;
  work_mode: string;
  location: string;
  experience_level: string;
  requirements: OpportunitySkillRequirement[];
  hasAssessmentAvailable?: boolean;
}

export interface MatchResult {
  overallScore: number; // 0 - 100
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

const PROFICIENCY_VALUES: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function calculateMatchScore(
  candidate: CandidateMatchingProfile,
  opportunity: OpportunityMatchingInput,
  candidateHasAssessmentPassed = false
): MatchResult {
  const candidateSkillMap = new Map<string, CandidateSkillInput>();
  candidate.skills.forEach((s) => {
    candidateSkillMap.set(s.name.trim().toLowerCase(), s);
  });

  const requiredReqs = opportunity.requirements.filter((r) => Boolean(r.is_required));
  const preferredReqs = opportunity.requirements.filter((r) => !Boolean(r.is_required));

  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const verifiedSkills: string[] = [];

  let requiredSkillPoints = 0;
  for (const req of requiredReqs) {
    const key = req.name.trim().toLowerCase();
    const candidateSkill = candidateSkillMap.get(key);
    if (candidateSkill) {
      matchedRequiredSkills.push(req.name);
      const reqVal = PROFICIENCY_VALUES[req.min_proficiency || 'intermediate'] || 2;
      const candVal = PROFICIENCY_VALUES[candidateSkill.proficiency_level] || 2;
      const profScore = Math.min(1.0, candVal / reqVal);
      requiredSkillPoints += profScore;

      if (candidateSkill.evidence_source !== 'self_reported') {
        verifiedSkills.push(req.name);
      }
    } else {
      missingRequiredSkills.push(req.name);
    }
  }

  const requiredCoverage = requiredReqs.length > 0
    ? requiredSkillPoints / requiredReqs.length
    : 1.0;

  const matchedPreferredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  let preferredSkillPoints = 0;

  for (const req of preferredReqs) {
    const key = req.name.trim().toLowerCase();
    const candidateSkill = candidateSkillMap.get(key);
    if (candidateSkill) {
      matchedPreferredSkills.push(req.name);
      const reqVal = PROFICIENCY_VALUES[req.min_proficiency || 'intermediate'] || 2;
      const candVal = PROFICIENCY_VALUES[candidateSkill.proficiency_level] || 2;
      preferredSkillPoints += Math.min(1.0, candVal / reqVal);
      if (candidateSkill.evidence_source !== 'self_reported' && !verifiedSkills.includes(req.name)) {
        verifiedSkills.push(req.name);
      }
    } else {
      missingPreferredSkills.push(req.name);
    }
  }

  const preferredCoverage = preferredReqs.length > 0
    ? preferredSkillPoints / preferredReqs.length
    : (preferredReqs.length === 0 ? 1.0 : 0);

  // Relevant projects & experience calculation
  let experienceScore = 0.5; // Base default competence
  const expText = `${candidate.experience || ''} ${candidate.projects || ''}`.toLowerCase();
  let textMatches = 0;
  for (const req of [...requiredReqs, ...preferredReqs]) {
    if (expText.includes(req.name.toLowerCase())) {
      textMatches++;
    }
  }
  if (opportunity.requirements.length > 0) {
    experienceScore = Math.min(1.0, 0.4 + (textMatches / opportunity.requirements.length) * 0.6);
  }

  // Assessment score
  const assessmentScore = candidateHasAssessmentPassed ? 1.0 : 0.0;

  // Weight distribution:
  // If assessment evidence is unavailable for this calculation, redistribute weight
  let requiredWeight = 0.45;
  let preferredWeight = 0.20;
  let experienceWeight = 0.20;
  let assessmentWeight = 0.15;

  if (!candidateHasAssessmentPassed && !opportunity.hasAssessmentAvailable) {
    // Redistribute assessment weight proportionally
    const factor = 1 / (requiredWeight + preferredWeight + experienceWeight);
    requiredWeight *= factor;
    preferredWeight *= factor;
    experienceWeight *= factor;
    assessmentWeight = 0;
  }

  const weightedScore =
    (requiredCoverage * requiredWeight) +
    (preferredCoverage * preferredWeight) +
    (experienceScore * experienceWeight) +
    (assessmentScore * assessmentWeight);

  const overallScore = Math.round(Math.min(100, Math.max(0, weightedScore * 100)));

  // Generate explainable human-readable reasoning
  let recommendationLevel: 'Strong Match' | 'Good Match' | 'Potential Match' | 'Skill Development Recommended';
  let explanation = '';

  if (overallScore >= 80) {
    recommendationLevel = 'Strong Match';
    explanation = `Strong match: ${matchedRequiredSkills.slice(0, 3).join(', ')} align with core requirements.`;
    if (verifiedSkills.length > 0) {
      explanation += ` Verified evidence present for ${verifiedSkills.join(', ')}.`;
    }
    if (missingRequiredSkills.length > 0) {
      explanation += ` Suggested growth area: ${missingRequiredSkills.join(', ')}.`;
    }
  } else if (overallScore >= 65) {
    recommendationLevel = 'Good Match';
    explanation = `Good alignment: Meets several key requirements (${matchedRequiredSkills.join(', ')}).`;
    if (missingRequiredSkills.length > 0) {
      explanation += ` Missing or under-evidenced: ${missingRequiredSkills.join(', ')}.`;
    }
  } else if (overallScore >= 45) {
    recommendationLevel = 'Potential Match';
    explanation = `Partial match: Demonstrates foundational skills (${matchedRequiredSkills.join(', ') || 'general background'}). Has skill gaps in: ${missingRequiredSkills.join(', ')}.`;
  } else {
    recommendationLevel = 'Skill Development Recommended';
    explanation = `Skill development opportunity: Key required skills (${missingRequiredSkills.slice(0, 3).join(', ')}) need further demonstration. Completing targeted mini-projects can qualify you.`;
  }

  return {
    overallScore,
    breakdown: {
      requiredScore: Math.round(requiredCoverage * 100),
      preferredScore: Math.round(preferredCoverage * 100),
      experienceScore: Math.round(experienceScore * 100),
      assessmentScore: Math.round(assessmentScore * 100),
    },
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    verifiedSkills,
    explanation,
    recommendationLevel,
  };
}
