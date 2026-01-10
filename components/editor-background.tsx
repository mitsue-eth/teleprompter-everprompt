"use client"

import * as React from "react"

export function EditorBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Flowing lines pattern */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 100 Q 75 80, 150 100 T 300 100"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 0 200 Q 75 220, 150 200 T 300 200"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 0 300 Q 75 280, 150 300 T 300 300"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  )
}

