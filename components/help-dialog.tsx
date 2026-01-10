"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart } from "lucide-react"
import { YouTubeLogo } from "@/components/youtube-logo"
import { cn } from "@/lib/utils"

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* YouTube Branded Header - Clickable */}
        <a
          href="https://www.youtube.com/@UnreasonableAI"
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-600 p-8 pb-12 block cursor-pointer transition-opacity hover:opacity-90 group"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl group-hover:scale-105 transition-transform">
              <YouTubeLogo size={140} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                Support the Project
              </h2>
              <p className="text-white/90 text-sm max-w-md">
                Help us grow by subscribing and engaging with our content
              </p>
            </div>
          </div>
        </a>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl">About Teleprompter for EverPrompt</DialogTitle>
            <DialogDescription className="text-base">
              Version 0.1 • Created by <span className="font-semibold text-foreground">Unreasonable AI</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Teleprompter</span> is the first tool in the{" "}
              <span className="font-semibold text-foreground">EverPrompt</span> suite. 
              EverPrompt is designed to be a comprehensive platform for content creators, 
              with Teleprompter as our flagship feature. More tools and features are coming soon.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Want to support this project?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The best way to help us grow is by engaging with our YouTube channel:
                  </p>
                </div>
              </div>
              <ul className="list-none space-y-2 ml-8">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Subscribe to our YouTube channel
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Like the videos you watch
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Share with other creators
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="w-full gap-3 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <a
                href="https://youtube.com/@unreasonableai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <YouTubeLogo size={24} />
                <span className="font-semibold">Visit YouTube Channel</span>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

