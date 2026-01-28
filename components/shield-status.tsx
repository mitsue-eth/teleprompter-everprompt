"use client";

import * as React from "react";
import { Shield, ShieldCheck, ShieldAlert, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserLimits } from "@/hooks/use-user-limits";
import { cn } from "@/lib/utils";
import { FREE_LIMITS, PRO_LIMITS } from "@/lib/limits";

interface ShieldStatusProps {
  cloudScriptCount: number;
  onUpgradeClick?: () => void;
}

export function ShieldStatus({
  cloudScriptCount,
  onUpgradeClick,
}: ShieldStatusProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const limits = useUserLimits({ cloudScriptCount });

  const status = limits.getShieldStatus();

  // Shield icon and color based on status
  const getShieldConfig = () => {
    switch (status) {
      case "signed-out":
        return {
          icon: Shield,
          className: "text-muted-foreground",
          tooltip: "Sign in to sync scripts to cloud",
        };
      case "pro":
        return {
          icon: Crown,
          className: "text-yellow-500",
          tooltip: "Pro Plan",
        };
      case "at-limit":
        return {
          icon: ShieldAlert,
          className: "text-destructive",
          tooltip: `Cloud storage full (${cloudScriptCount}/${limits.maxCloudScripts})`,
        };
      case "warning":
        return {
          icon: ShieldAlert,
          className: "text-yellow-500",
          tooltip: `Almost full (${cloudScriptCount}/${limits.maxCloudScripts})`,
        };
      case "free":
      default:
        return {
          icon: ShieldCheck,
          className: "text-blue-500",
          tooltip: `Free Plan (${cloudScriptCount}/${limits.maxCloudScripts} cloud scripts)`,
        };
    }
  };

  const config = getShieldConfig();
  const IconComponent = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors cursor-pointer",
                config.className,
              )}
              aria-label="Plan status"
            >
              <IconComponent className="h-4 w-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={cn("h-5 w-5", config.className)} />
            {limits.isPro ? "Pro Plan" : "Free Plan"}
          </DialogTitle>
          <DialogDescription>
            {limits.isSignedIn
              ? "Your cloud storage usage and plan details"
              : "Sign in to sync your scripts across devices"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cloud Storage Usage */}
          {limits.isSignedIn && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cloud Scripts</span>
                <span className="font-medium">
                  {cloudScriptCount} / {limits.maxCloudScripts}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    status === "at-limit"
                      ? "bg-destructive"
                      : status === "warning"
                        ? "bg-yellow-500"
                        : "bg-primary",
                  )}
                  style={{ width: `${limits.cloudScriptUsagePercent}%` }}
                />
              </div>
              {!limits.isPro && (
                <p className="text-xs text-muted-foreground">
                  {limits.remainingCloudScripts === 0
                    ? "Upgrade to Pro for more cloud storage"
                    : `${limits.remainingCloudScripts} cloud scripts remaining`}
                </p>
              )}
            </div>
          )}

          {/* Plan Comparison */}
          {!limits.isPro && limits.isSignedIn && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Upgrade to Pro</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  {PRO_LIMITS.cloudScripts} cloud scripts (vs{" "}
                  {FREE_LIMITS.cloudScripts} free)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Unlimited script length
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  AI features (coming soon)
                </li>
              </ul>
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  onUpgradeClick?.();
                }}
              >
                Upgrade to Pro - $4.99/mo
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                or $39.99/year (save 33%)
              </p>
            </div>
          )}

          {/* Pro Benefits */}
          {limits.isPro && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Pro Member
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  {PRO_LIMITS.cloudScripts} cloud scripts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Unlimited script length
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Priority support
                </li>
              </ul>
              {limits.planExpiresAt && (
                <p className="text-xs text-muted-foreground">
                  Renews on {limits.planExpiresAt.toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Signed Out State */}
          {!limits.isSignedIn && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Your scripts are currently stored locally in your browser. Sign
                in to sync them to the cloud and access from any device.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Free: {FREE_LIMITS.cloudScripts} cloud scripts</p>
                <p>
                  Pro: {PRO_LIMITS.cloudScripts} cloud scripts + unlimited
                  length
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
