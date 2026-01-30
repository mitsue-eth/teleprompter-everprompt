import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon" | "emoji";
  size?: number;
}

export function Logo({ className, variant = "full", size }: LogoProps) {
  // Simple emoji variant
  if (variant === "emoji") {
    return (
      <span
        className={cn("inline-block", className)}
        style={{ fontSize: size || 32 }}
        role="img"
        aria-label="EverPrompt Logo"
      >
        🦎
      </span>
    );
  }

  // Icon variant - simple cute gecko face
  if (variant === "icon") {
    const iconSize = size || 32;
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("", className)}
      >
        {/* Background circle */}
        <circle cx="16" cy="16" r="15" fill="url(#logo-icon-gradient)" />

        {/* Gecko face - centered and simple */}
        <g transform="translate(6, 7)">
          {/* Head shape */}
          <ellipse cx="10" cy="10" rx="9" ry="8" fill="#7dd87d" />

          {/* Subtle darker underbelly */}
          <ellipse cx="10" cy="12" rx="6" ry="4" fill="#6bc96b" opacity="0.4" />

          {/* Big cute eyes */}
          <circle cx="7" cy="9" r="3" fill="#1a1a2e" />
          <circle cx="13" cy="9" r="3" fill="#1a1a2e" />

          {/* Eye highlights */}
          <circle cx="7.8" cy="8" r="1" fill="white" />
          <circle cx="13.8" cy="8" r="1" fill="white" />

          {/* Happy smile */}
          <path
            d="M 7 13 Q 10 16 13 13"
            stroke="#2d5a2d"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        <defs>
          <linearGradient
            id="logo-icon-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Full variant - same gecko, slightly larger detail
  const fullSize = size || 64;
  return (
    <svg
      width={fullSize}
      height={fullSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="url(#logo-full-gradient)" />

      {/* Gecko face - centered */}
      <g transform="translate(12, 14)">
        {/* Head shape */}
        <ellipse cx="20" cy="20" rx="18" ry="16" fill="#7dd87d" />

        {/* Subtle darker underbelly */}
        <ellipse cx="20" cy="24" rx="12" ry="8" fill="#6bc96b" opacity="0.4" />

        {/* Big cute eyes */}
        <circle cx="14" cy="18" r="6" fill="#1a1a2e" />
        <circle cx="26" cy="18" r="6" fill="#1a1a2e" />

        {/* Eye highlights */}
        <circle cx="15.5" cy="16" r="2" fill="white" />
        <circle cx="27.5" cy="16" r="2" fill="white" />

        {/* Happy smile */}
        <path
          d="M 14 27 Q 20 33 26 27"
          stroke="#2d5a2d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <defs>
        <linearGradient
          id="logo-full-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
