"use client";

import * as React from "react";
import { Crown, Cloud, Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FREE_LIMITS, PRO_LIMITS } from "@/lib/limits";

export type UpgradeReason = "cloud-limit" | "character-limit" | "general";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: UpgradeReason;
  currentUsage?: {
    cloudScripts?: number;
    characterCount?: number;
  };
}

export function UpgradeDialog({
  open,
  onOpenChange,
  reason = "general",
  currentUsage,
}: UpgradeDialogProps) {
  const getTitle = () => {
    switch (reason) {
      case "cloud-limit":
        return "Cloud Storage Full";
      case "character-limit":
        return "Script Too Long";
      default:
        return "Upgrade to Pro";
    }
  };

  const getDescription = () => {
    switch (reason) {
      case "cloud-limit":
        return `You've reached the free limit of ${FREE_LIMITS.cloudScripts} cloud scripts. Upgrade to Pro for ${PRO_LIMITS.cloudScripts} cloud scripts.`;
      case "character-limit":
        return `Free scripts are limited to ${(FREE_LIMITS.maxCharactersPerScript / 1000).toFixed(0)}k characters (~15 min). Upgrade to Pro for unlimited length.`;
      default:
        return "Unlock more features and storage with EverPrompt Pro.";
    }
  };

  const handleUpgrade = () => {
    // TODO: Implement Stripe checkout
    // For now, close dialog and show a message
    console.log("Upgrade clicked - Stripe integration pending");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Usage (if applicable) */}
          {reason === "cloud-limit" &&
            currentUsage?.cloudScripts !== undefined && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                    Cloud Scripts Used
                  </span>
                  <span className="font-medium text-destructive">
                    {currentUsage.cloudScripts} / {FREE_LIMITS.cloudScripts}
                  </span>
                </div>
              </div>
            )}

          {reason === "character-limit" &&
            currentUsage?.characterCount !== undefined && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Script Length</span>
                  <span className="font-medium text-destructive">
                    {(currentUsage.characterCount / 1000).toFixed(1)}k /{" "}
                    {(FREE_LIMITS.maxCharactersPerScript / 1000).toFixed(0)}k
                    chars
                  </span>
                </div>
              </div>
            )}

          {/* Pro Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium">What you get with Pro:</p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-3">
                <Cloud className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    {PRO_LIMITS.cloudScripts} cloud scripts
                  </span>
                  <p className="text-muted-foreground text-xs">
                    vs {FREE_LIMITS.cloudScripts} in free plan
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Unlimited script length</span>
                  <p className="text-muted-foreground text-xs">
                    No character limits
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">AI features</span>
                  <p className="text-muted-foreground text-xs">
                    Coming soon - improve scripts with AI
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4 space-y-3">
            <Button
              className="w-full cursor-pointer"
              size="lg"
              onClick={handleUpgrade}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro - $4.99/month
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              or $39.99/year (save 33%) • Cancel anytime
            </p>
          </div>

          {/* Alternative Actions */}
          {reason === "cloud-limit" && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground text-center">
                You can also keep scripts locally (unlimited) or delete unused
                cloud scripts.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
