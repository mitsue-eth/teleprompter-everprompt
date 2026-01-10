"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface YouTubeLogoProps {
  className?: string
  size?: number
}

export function YouTubeLogo({ className, size = 120 }: YouTubeLogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      {/* YouTube logo - red background */}
      <path
        d="M195.5 22.5C193.5 15.5 188 10 181 8C168.5 4.5 100 4.5 100 4.5C100 4.5 31.5 4.5 19 8C12 10 6.5 15.5 4.5 22.5C1 35 1 70 1 70C1 70 1 105 4.5 117.5C6.5 124.5 12 130 19 132C31.5 135.5 100 135.5 100 135.5C100 135.5 168.5 135.5 181 132C188 130 193.5 124.5 195.5 117.5C199 105 199 70 199 70C199 70 199 35 195.5 22.5Z"
        fill="#FF0000"
      />
      {/* Play button triangle */}
      <path
        d="M81 50V90L130 70L81 50Z"
        fill="white"
      />
    </svg>
  )
}

