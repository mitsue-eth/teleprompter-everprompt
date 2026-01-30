// Plan types
export type PlanType = "free" | "pro";

// Limits for each plan
export const FREE_LIMITS = {
  cloudScripts: 7,
  maxCharactersPerScript: 30000, // ~30 minutes speaking time (~5,000 words)
} as const;

export const PRO_LIMITS = {
  cloudScripts: 500,
  maxCharactersPerScript: 450000, // ~10 hours speaking time (~75,000 words)
} as const;

// Get limits for a plan
export function getLimitsForPlan(plan: PlanType) {
  return plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

// Check if user can create more cloud scripts
export function canCreateCloudScript(
  plan: PlanType,
  currentCloudScriptCount: number
): boolean {
  const limits = getLimitsForPlan(plan);
  return currentCloudScriptCount < limits.cloudScripts;
}

// Check if script content exceeds limit
export function isScriptOverLimit(
  plan: PlanType,
  characterCount: number
): boolean {
  const limits = getLimitsForPlan(plan);
  return characterCount > limits.maxCharactersPerScript;
}

// Get remaining cloud scripts
export function getRemainingCloudScripts(
  plan: PlanType,
  currentCloudScriptCount: number
): number {
  const limits = getLimitsForPlan(plan);
  return Math.max(0, limits.cloudScripts - currentCloudScriptCount);
}

// Get usage percentage (for progress indicators)
export function getCloudScriptUsagePercent(
  plan: PlanType,
  currentCloudScriptCount: number
): number {
  const limits = getLimitsForPlan(plan);
  return Math.min(100, (currentCloudScriptCount / limits.cloudScripts) * 100);
}

// Format character count for display
export function formatCharacterCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

// Estimate speaking time from character count (avg 150 words/min, 5 chars/word)
export function estimateSpeakingMinutes(characterCount: number): number {
  const wordsPerMinute = 150;
  const charsPerWord = 5;
  const words = characterCount / charsPerWord;
  return Math.round(words / wordsPerMinute);
}

// Check if approaching limit (for warnings)
export function isApproachingCloudLimit(
  plan: PlanType,
  currentCloudScriptCount: number
): boolean {
  const limits = getLimitsForPlan(plan);
  // Warn when 1 slot remaining or at 80% capacity
  const remaining = limits.cloudScripts - currentCloudScriptCount;
  const percentUsed = (currentCloudScriptCount / limits.cloudScripts) * 100;
  return remaining <= 1 || percentUsed >= 80;
}

// Check if at limit (for blocks)
export function isAtCloudLimit(
  plan: PlanType,
  currentCloudScriptCount: number
): boolean {
  const limits = getLimitsForPlan(plan);
  return currentCloudScriptCount >= limits.cloudScripts;
}
