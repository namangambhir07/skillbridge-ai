export interface RubricEvaluationResult {
  addressesRequirementScore: number; // 0 - 100
  relevanceScore: number; // 0 - 100
  explanationQualityScore: number; // 0 - 100
  overallAdaptationScore: number; // 0 - 100
  rubricItems: {
    criterion: string;
    score: number;
    maxScore: number;
    observation: string;
  }[];
  evaluationSummary: string;
}

export function evaluateAdaptation(
  initialSubmission: string,
  revisedSubmission: string,
  candidateExplanation: string,
  followUpPrompt: string
): RubricEvaluationResult {
  const initial = (initialSubmission || '').trim();
  const revised = (revisedSubmission || '').trim();
  const explanation = (candidateExplanation || '').trim();
  const followUpLower = (followUpPrompt || '').toLowerCase();

  // 1. Revision addressing new requirement
  // Check if revised has meaningful difference from initial
  const isIdentical = initial.toLowerCase() === revised.toLowerCase();
  let addressScore = 85;
  let addressObservation = 'Revision substantively incorporates the updated constraint.';

  if (isIdentical) {
    addressScore = 20;
    addressObservation = 'Revised text is identical to initial submission; does not address new requirement.';
  } else if (revised.length < 20) {
    addressScore = 35;
    addressObservation = 'Revision is too brief to adequately address the new scenario.';
  } else {
    // Check keywords from prompt (budget, 50%, scope, constraint, etc.)
    const promptKeywords = followUpLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const revisedLower = revised.toLowerCase();
    const matchedCount = promptKeywords.filter((k) => revisedLower.includes(k)).length;
    if (matchedCount > 0) {
      addressScore = Math.min(100, 75 + matchedCount * 8);
    }
  }

  // 2. Relevance retention (retains context of initial task)
  let relevanceScore = 90;
  let relevanceObservation = 'Maintains continuity and role context from original task.';
  if (revised.length === 0) {
    relevanceScore = 0;
    relevanceObservation = 'No revision content provided.';
  } else {
    const initialWords = new Set(initial.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const revisedWords = revised.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const retained = revisedWords.filter((w) => initialWords.has(w)).length;
    const ratio = revisedWords.length > 0 ? retained / revisedWords.length : 0;
    if (ratio < 0.15) {
      relevanceScore = 60;
      relevanceObservation = 'Significant departure from initial context; verify coherence.';
    } else {
      relevanceScore = Math.min(100, Math.round(70 + ratio * 30));
    }
  }

  // 3. Explanation Quality
  let explanationScore = 80;
  let explanationObservation = 'Candidate provided a coherent rationale for the adaptations made.';
  if (!explanation || explanation.length < 10) {
    explanationScore = 30;
    explanationObservation = 'Explanation is minimal or missing.';
  } else if (explanation.length > 40) {
    explanationScore = 95;
    explanationObservation = 'Detailed explanation clarifying specific trade-offs and changes.';
  }

  const overallAdaptationScore = Math.round(
    addressScore * 0.45 + relevanceScore * 0.30 + explanationScore * 0.25
  );

  return {
    addressesRequirementScore: addressScore,
    relevanceScore,
    explanationQualityScore: explanationScore,
    overallAdaptationScore,
    rubricItems: [
      {
        criterion: 'Constraint Adaptation',
        score: addressScore,
        maxScore: 100,
        observation: addressObservation,
      },
      {
        criterion: 'Contextual Continuity',
        score: relevanceScore,
        maxScore: 100,
        observation: relevanceObservation,
      },
      {
        criterion: 'Candidate Rationale',
        score: explanationScore,
        maxScore: 100,
        observation: explanationObservation,
      },
    ],
    evaluationSummary: `Adaptation score: ${overallAdaptationScore}/100. ${addressObservation} Candidate rationale: ${explanationObservation}`,
  };
}
