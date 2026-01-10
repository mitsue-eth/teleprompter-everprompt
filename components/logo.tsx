import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: "full" | "icon"
}

export function Logo({ className, variant = "full" }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-foreground", className)}
      >
        <rect x="12" y="16" width="40" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="18" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="32" x2="46" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="40" x2="46" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <path d="M 28 28 L 28 36 L 36 32 Z" fill="currentColor" opacity="0.7"/>
      </svg>
    )
  }

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
    >
      <circle cx="100" cy="100" r="95" fill="currentColor" opacity="0.1"/>
      <rect x="40" y="50" width="120" height="100" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
      <g opacity="0.8">
        <line x1="55" y1="75" x2="145" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="55" y1="90" x2="145" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="55" y1="105" x2="145" y2="105" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="55" y1="120" x2="145" y2="120" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </g>
      <path d="M 100 40 L 90 50 L 110 50 Z" fill="currentColor" opacity="0.6"/>
      <path d="M 100 160 L 90 150 L 110 150 Z" fill="currentColor" opacity="0.6"/>
      <circle cx="100" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      <path d="M 92 95 L 92 105 L 108 100 Z" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

