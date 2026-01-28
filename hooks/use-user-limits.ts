"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  PlanType,
  FREE_LIMITS,
  PRO_LIMITS,
  canCreateCloudScript,
  isApproachingCloudLimit,
  isAtCloudLimit,
  getRemainingCloudScripts,
  getCloudScriptUsagePercent,
  isScriptOverLimit,
} from "@/lib/limits";

interface UserPlanData {
  plan: PlanType;
  planExpiresAt: string | null;
}

interface UseUserLimitsProps {
  cloudScriptCount: number;
}

interface UseUserLimitsReturn {
  // Plan info
  plan: PlanType;
  isPro: boolean;
  isSignedIn: boolean;
  planExpiresAt: Date | null;

  // Cloud script limits
  maxCloudScripts: number;
  cloudScriptCount: number;
  remainingCloudScripts: number;
  cloudScriptUsagePercent: number;
  canCreateCloudScript: boolean;
  isApproachingCloudLimit: boolean;
  isAtCloudLimit: boolean;

  // Character limits
  maxCharactersPerScript: number;
  isScriptOverLimit: (characterCount: number) => boolean;

  // Status helpers
  getShieldStatus: () => "signed-out" | "free" | "pro" | "warning" | "at-limit";
}

export function useUserLimits({
  cloudScriptCount,
}: UseUserLimitsProps): UseUserLimitsReturn {
  const { data: session, status } = useSession();

  // For now, we'll derive plan from session
  // In production, this would come from the user object in the session
  const userPlanData = useMemo((): UserPlanData => {
    // TODO: Add plan to session user type and fetch from DB
    // For now, default to free plan
    const user = session?.user as any;
    return {
      plan: (user?.plan as PlanType) || "free",
      planExpiresAt: user?.planExpiresAt || null,
    };
  }, [session]);

  const plan = userPlanData.plan;
  const isPro = plan === "pro";
  const isSignedIn = status === "authenticated";
  const planExpiresAt = userPlanData.planExpiresAt
    ? new Date(userPlanData.planExpiresAt)
    : null;

  const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

  const remainingCloudScripts = getRemainingCloudScripts(plan, cloudScriptCount);
  const cloudScriptUsagePercent = getCloudScriptUsagePercent(plan, cloudScriptCount);
  const canCreate = canCreateCloudScript(plan, cloudScriptCount);
  const isApproaching = isApproachingCloudLimit(plan, cloudScriptCount);
  const isAtLimit = isAtCloudLimit(plan, cloudScriptCount);

  const checkScriptOverLimit = (characterCount: number) =>
    isScriptOverLimit(plan, characterCount);

  const getShieldStatus = (): "signed-out" | "free" | "pro" | "warning" | "at-limit" => {
    if (!isSignedIn) return "signed-out";
    if (isPro) return "pro";
    if (isAtLimit) return "at-limit";
    if (isApproaching) return "warning";
    return "free";
  };

  return {
    // Plan info
    plan,
    isPro,
    isSignedIn,
    planExpiresAt,

    // Cloud script limits
    maxCloudScripts: limits.cloudScripts,
    cloudScriptCount,
    remainingCloudScripts,
    cloudScriptUsagePercent,
    canCreateCloudScript: canCreate,
    isApproachingCloudLimit: isApproaching,
    isAtCloudLimit: isAtLimit,

    // Character limits
    maxCharactersPerScript: limits.maxCharactersPerScript,
    isScriptOverLimit: checkScriptOverLimit,

    // Status helpers
    getShieldStatus,
  };
}
