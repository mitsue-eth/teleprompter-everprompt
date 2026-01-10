"use client"

import * as React from "react"

interface CrosshairProps {
  enabled: boolean
  x: number // 0-100, percentage from left
  y: number // 0-100, percentage from top
}

export function Crosshair({ enabled, x, y }: CrosshairProps) {
  if (!enabled) return null

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Crosshair target - blue and visible */}
      <div className="relative w-24 h-24">
        {/* Outer circle - blue border */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/60" />
        
        {/* Inner circle - brighter blue */}
        <div className="absolute inset-4 rounded-full border border-blue-400/70" />
        
        {/* Center dot - bright blue */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50" />
        
        {/* Horizontal line - blue guide */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/50 -translate-y-1/2" />
        
        {/* Vertical line - blue guide */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-500/50 -translate-x-1/2" />
      </div>
    </div>
  )
}

