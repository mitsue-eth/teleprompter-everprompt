"use client"

import * as React from "react"

interface CrosshairProps {
  enabled: boolean
  x: number // 0-100, percentage from left
  y: number // 0-100, percentage from top
  shape: "circle" | "square" | "cross" | "dot"
  size: number // Size/radius in pixels
  color: string // Color in hex format
  intensity: number // Color intensity/opacity (0-100, percentage)
}

export function Crosshair({ enabled, x, y, shape, size, color, intensity }: CrosshairProps) {
  if (!enabled) return null

  const outerSize = size * 4 // Outer size is 4x the radius
  const innerSize = size * 2.5 // Inner size is 2.5x the radius
  const centerDotSize = size * 0.15 // Center dot is 15% of radius
  const lineThickness = Math.max(0.5, size * 0.02) // Line thickness scales with size

  // Convert intensity (0-100) to opacity multiplier (0-1)
  const opacityMultiplier = intensity / 100

  // Convert hex color to rgba for opacity variations
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 } // Default to blue-500
  }

  const rgb = hexToRgb(color)
  const colorBase = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const colorBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.6 * opacityMultiplier})`
  const colorInner = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.7 * opacityMultiplier})`
  const colorCenter = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityMultiplier})`
  const colorLine = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * opacityMultiplier})`
  const colorShadow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * opacityMultiplier})`

  const renderShape = () => {
    switch (shape) {
      case "circle":
        return (
          <>
            {/* Outer circle */}
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${outerSize}px`,
                height: `${outerSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderColor: colorBorder,
              }}
            />
            {/* Inner circle */}
            <div 
              className="absolute rounded-full border"
              style={{
                width: `${innerSize}px`,
                height: `${innerSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderColor: colorInner,
              }}
            />
            {/* Center dot */}
            <div 
              className="absolute rounded-full shadow-lg"
              style={{
                width: `${centerDotSize}px`,
                height: `${centerDotSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: colorCenter,
                boxShadow: `0 10px 15px -3px ${colorShadow}, 0 4px 6px -2px ${colorShadow}`,
              }}
            />
            {/* Horizontal line */}
            <div 
              className="absolute"
              style={{
                left: "0",
                right: "0",
                top: "50%",
                height: `${lineThickness}px`,
                transform: "translateY(-50%)",
                backgroundColor: colorLine,
              }}
            />
            {/* Vertical line */}
            <div 
              className="absolute"
              style={{
                top: "0",
                bottom: "0",
                left: "50%",
                width: `${lineThickness}px`,
                transform: "translateX(-50%)",
                backgroundColor: colorLine,
              }}
            />
          </>
        )
      
      case "square":
        return (
          <>
            {/* Outer square */}
            <div 
              className="absolute border-2"
              style={{
                width: `${outerSize}px`,
                height: `${outerSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderColor: colorBorder,
              }}
            />
            {/* Inner square */}
            <div 
              className="absolute border"
              style={{
                width: `${innerSize}px`,
                height: `${innerSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderColor: colorInner,
              }}
            />
            {/* Center dot */}
            <div 
              className="absolute rounded-full shadow-lg"
              style={{
                width: `${centerDotSize}px`,
                height: `${centerDotSize}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: colorCenter,
                boxShadow: `0 10px 15px -3px ${colorShadow}, 0 4px 6px -2px ${colorShadow}`,
              }}
            />
            {/* Horizontal line */}
            <div 
              className="absolute"
              style={{
                left: "0",
                right: "0",
                top: "50%",
                height: `${lineThickness}px`,
                transform: "translateY(-50%)",
                backgroundColor: colorLine,
              }}
            />
            {/* Vertical line */}
            <div 
              className="absolute"
              style={{
                top: "0",
                bottom: "0",
                left: "50%",
                width: `${lineThickness}px`,
                transform: "translateX(-50%)",
                backgroundColor: colorLine,
              }}
            />
          </>
        )
      
      case "cross":
        return (
          <>
            {/* Center dot */}
            <div 
              className="absolute rounded-full shadow-lg"
              style={{
                width: `${centerDotSize * 2}px`,
                height: `${centerDotSize * 2}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: colorCenter,
                boxShadow: `0 10px 15px -3px ${colorShadow}, 0 4px 6px -2px ${colorShadow}`,
              }}
            />
            {/* Horizontal line - longer */}
            <div 
              className="absolute"
              style={{
                left: "50%",
                width: `${outerSize}px`,
                top: "50%",
                height: `${lineThickness * 2}px`,
                transform: "translate(-50%, -50%)",
                backgroundColor: colorLine,
              }}
            />
            {/* Vertical line - longer */}
            <div 
              className="absolute"
              style={{
                top: "50%",
                height: `${outerSize}px`,
                left: "50%",
                width: `${lineThickness * 2}px`,
                transform: "translate(-50%, -50%)",
                backgroundColor: colorLine,
              }}
            />
          </>
        )
      
      case "dot":
        return (
          <div 
            className="absolute rounded-full shadow-lg border-2"
            style={{
              width: `${size * 1.5}px`,
              height: `${size * 1.5}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: colorCenter,
              borderColor: colorBorder,
              boxShadow: `0 10px 15px -3px ${colorShadow}, 0 4px 6px -2px ${colorShadow}`,
            }}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: `${outerSize}px`,
        height: `${outerSize}px`,
      }}
    >
      {renderShape()}
    </div>
  )
}

