"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Heart,
  Shield,
  Sparkles,
  Zap,
  Cloud,
  Download,
  RefreshCcw,
} from "lucide-react";
import { YouTubeLogo } from "@/components/youtube-logo";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* EverPrompt Branded Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 pb-10">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="text-6xl">🦎</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                EverPrompt
              </h2>
              <p className="text-white/90 text-sm max-w-md">
                Professional tools for content creators
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-xl">About EverPrompt</DialogTitle>
            <DialogDescription className="text-sm">
              Version 0.1 • Created by{" "}
              <span className="font-semibold text-foreground">
                Unreasonable AI
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">EverPrompt</span>{" "}
              is a suite of professional tools designed for content creators.
              Our flagship{" "}
              <span className="font-semibold text-foreground">
                Teleprompter
              </span>{" "}
              helps you deliver polished videos with confidence.
            </p>

            {/* Core Philosophy - Data Ownership */}
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Your Scripts. Your Data. No Lock-in.
                  </p>
                  <ul className="list-none space-y-1.5">
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      Work entirely in your browser without ever logging in
                    </li>
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      Export all your scripts anytime and take them anywhere
                    </li>
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      Import into another browser, device, or machine instantly
                    </li>
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      We never lock you in. Your content is always yours.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Free Forever</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Core features always free. No credit card required.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Cloud Sync</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional sync across devices when signed in.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Pro Features</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  500 cloud scripts, 10+ hour scripts, priority support.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCcw className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">No Lock-in</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cancel monthly anytime. 30-day refund on yearly, no questions.
                </p>
              </div>
            </div>

            {/* Support Section - Subtle */}
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                EverPrompt is made with ❤️ by{" "}
                <a
                  href="https://youtube.com/@unreasonableai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline"
                >
                  Unreasonable AI
                </a>
                . If you enjoy the free version, consider subscribing to my
                YouTube channel where I post videos about AI!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <a
                href="https://youtube.com/@unreasonableai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeLogo size={18} />
                <span>YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => onOpenChange(false)}
            >
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
