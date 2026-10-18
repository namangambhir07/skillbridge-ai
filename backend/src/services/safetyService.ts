export interface SafetyCheckResult {
  verdict: 'ALLOW' | 'REVIEW' | 'BLOCK';
  reasons: string[];
  ruleIds: string[];
  requiresHumanReview: boolean;
  engineName: string;
}

interface SafetyRule {
  id: string;
  category: string;
  severity: 'BLOCK' | 'REVIEW';
  pattern: RegExp;
  reason: string;
}

const SAFETY_RULES: SafetyRule[] = [
  // Block rules: explicit requests for applicant payments
  {
    id: 'FEE_PAYMENT_BLOCK',
    category: 'advance_fee_fraud',
    severity: 'BLOCK',
    pattern: /(pay(ment)?\s+(required|fee)|registration\s+fee|processing\s+fee|deposit\s+money|wire\s+transfer|crypto\s+payment|buy\s+equipment\s+from\s+us|training\s+deposit|refundable\s+security\s+deposit)/i,
    reason: 'Job description appears to request upfront payments, processing fees, or money transfers from applicants, which violates platform safety policy.',
  },
  {
    id: 'DISCRIMINATORY_GENDER_BLOCK',
    category: 'discrimination',
    severity: 'BLOCK',
    pattern: /(men\s+only|women\s+only|male\s+candidates?\s+only|female\s+candidates?\s+only|girls?\s+only|boys?\s+only)/i,
    reason: 'Job contains explicitly discriminatory gender-exclusionary requirements.',
  },
  {
    id: 'GOVT_ID_DEMAND_BLOCK',
    category: 'sensitive_data_collection',
    severity: 'BLOCK',
    pattern: /(send\s+your\s+(ssn|social\s+security|aadhaar|passport\s+copy|bank\s+credentials|credit\s+card))/i,
    reason: 'Immediate submission of sensitive identity documents or banking credentials prior to interview or formal offer is prohibited.',
  },

  // Review rules: suspicious phrasing or contact details in description body
  {
    id: 'TELEGRAM_WHATSAPP_ONLY_REVIEW',
    category: 'unverified_contact_channel',
    severity: 'REVIEW',
    pattern: /(contact\s+(us\s+)?on\s+(telegram|whatsapp|signal)\s+(only|directly)|dm\s+on\s+telegram)/i,
    reason: 'Job directs applicants to circumvent the platform to private instant messaging channels without verified business credentials.',
  },
  {
    id: 'PERSONAL_PHONE_REVIEW',
    category: 'direct_phone_in_body',
    severity: 'REVIEW',
    pattern: /(call\s+or\s+whatsapp\s*[:\s]*(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
    reason: 'Direct phone contact found in description body. Verify legitimate company contact channels.',
  },
  {
    id: 'UNREALISTIC_EARNINGS_REVIEW',
    category: 'suspicious_compensation_claims',
    severity: 'REVIEW',
    pattern: /(earn\s+(\$|₹|£|€)?\s*[0-9,]+\s+(per\s+day|in\s+one\s+hour|guaranteed\s+wealth|no\s+skills?\s+required\s+high\s+income))/i,
    reason: 'Unrealistic or guaranteed rapid earnings promises detected; requires moderator review.',
  },
  {
    id: 'SPARSE_DESCRIPTION_REVIEW',
    category: 'low_quality_listing',
    severity: 'REVIEW',
    pattern: /^.{0,60}$/s,
    reason: 'Job description is unusually sparse (less than 60 characters) and lacks clear role scope.',
  },
];

export function checkJobSafety(title: string, description: string): SafetyCheckResult {
  const combinedText = `${title || ''}\n${description || ''}`;
  const triggeredRules: SafetyRule[] = [];

  for (const rule of SAFETY_RULES) {
    if (rule.pattern.test(combinedText)) {
      triggeredRules.push(rule);
    }
  }

  const hasBlock = triggeredRules.some((r) => r.severity === 'BLOCK');
  const hasReview = triggeredRules.some((r) => r.severity === 'REVIEW');

  let verdict: 'ALLOW' | 'REVIEW' | 'BLOCK' = 'ALLOW';
  let requiresHumanReview = false;

  if (hasBlock) {
    verdict = 'BLOCK';
    requiresHumanReview = true;
  } else if (hasReview) {
    verdict = 'REVIEW';
    requiresHumanReview = true;
  }

  return {
    verdict,
    reasons: triggeredRules.map((r) => r.reason),
    ruleIds: triggeredRules.map((r) => r.id),
    requiresHumanReview,
    engineName: 'Prototype Rule-Based Safety Check',
  };
}
