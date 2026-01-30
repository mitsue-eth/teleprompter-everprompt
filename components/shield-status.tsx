"use client";

import * as React from "react";
import { Shield, ShieldCheck, ShieldAlert, Crown, Cloud } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { useUserLimits } from "@/hooks/use-user-limits";
import { cn } from "@/lib/utils";
import { FREE_LIMITS, PRO_LIMITS } from "@/lib/limits";

interface ShieldStatusProps {
  cloudScriptCount: number;
  onUpgradeClick?: () => void;
  getDefaultStorage?: () => "local" | "cloud";
  setDefaultStorage?: (storage: "local" | "cloud") => void;
}

export function ShieldStatus({
  cloudScriptCount,
  onUpgradeClick,
  getDefaultStorage,
  setDefaultStorage,
}: ShieldStatusProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const limits = useUserLimits({ cloudScriptCount });
  const [defaultStorage, setDefaultStorageDisplay] = React.useState<
    "local" | "cloud"
  >(() => getDefaultStorage?.() ?? "local");

  // Sync displayed default when dialog opens
  React.useEffect(() => {
    if (isOpen && getDefaultStorage) {
      setDefaultStorageDisplay(getDefaultStorage());
    }
  }, [isOpen, getDefaultStorage]);

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
                "flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors cursor-pointer",
                config.className,
              )}
              aria-label="Plan status"
            >
              <IconComponent className="h-5 w-5" />
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
            <div className="space-y-4">
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

              {/* Default for new scripts */}
              {getDefaultStorage && setDefaultStorage && (
                <div className="space-y-2 border-t border-border/30 pt-4">
                  <Label className="text-sm">Default for new scripts</Label>
                  <ToggleGroup
                    type="single"
                    value={defaultStorage}
                    onValueChange={(value) => {
                      if (value === "local" || value === "cloud") {
                        setDefaultStorage(value);
                        setDefaultStorageDisplay(value);
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem
                      value="local"
                      aria-label="Store new scripts locally"
                      title="New scripts stay on this device only"
                    >
                      Local
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="cloud"
                      aria-label="Store new scripts in cloud"
                      title="New scripts sync to the cloud"
                    >
                      Cloud
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground">
                    Choose where new scripts are saved. You can move any script
                    to cloud or local from the script menu.
                  </p>
                </div>
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
                  Scripts up to 10+ hours long
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Priority support
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                AI writing assistance coming soon
              </p>
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
                  Scripts up to 10+ hours long
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
            <div className="space-y-4">
              {/* Free Plan - Current Benefits */}
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  You're using the Free Plan
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 ml-5">
                  <li>
                    • <strong>Unlimited local scripts</strong> — no limits on
                    how many
                  </li>
                  <li>
                    • <strong>No account required</strong> — works right in your
                    browser
                  </li>
                  <li>
                    • <strong>Your data stays yours</strong> — stored in
                    localStorage
                  </li>
                  <li>
                    • <strong>Export anytime</strong> — download as Markdown
                    files
                  </li>
                  <li>
                    • <strong>Full portability</strong> — import into any
                    browser/device
                  </li>
                </ul>
              </div>

              {/* Pro Plan - Teaser */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  Pro — Cloud Sync
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-5">
                  <li>• Sync scripts across all your devices automatically</li>
                  <li>
                    • {PRO_LIMITS.cloudScripts} cloud scripts, up to 10+ hours
                    each
                  </li>
                  <li>• Priority support</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 ml-5">
                  <span className="text-blue-500 font-medium">$4.99/mo</span> or
                  $39.99/year
                </p>
              </div>

              {/* Team/Enterprise - Coming Soon */}
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 opacity-75">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  Team — Coming Soon
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-5">
                  <li>• Shared script libraries for teams</li>
                  <li>• Collaboration features</li>
                  <li>• Admin controls & analytics</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
