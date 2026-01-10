"use client"

import * as React from "react"

export function SidebarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Flowing lines pattern */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 100 Q 50 80, 100 100 T 200 100"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-foreground"
        />
        <path
          d="M 0 120 Q 50 140, 100 120 T 200 120"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-foreground"
        />
        <path
          d="M 0 80 Q 50 60, 100 80 T 200 80"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-foreground"
        />
      </svg>
      
      {/* Abstract shape on the right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.02]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

