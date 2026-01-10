"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TeleprompterDisplayProps {
  text: string
  fontSize: number
  textWidth: number
  horizontalPosition: "left" | "center" | "right"
  verticalPosition: "top" | "center" | "bottom"
  horizontalOffset: number
  verticalOffset: number
  scrollPosition: number
  containerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  onWheelScroll: (delta: number) => void
  enableMarkdown: boolean
}

export function TeleprompterDisplay({
  text,
  fontSize,
  textWidth,
  horizontalPosition,
  verticalPosition,
  horizontalOffset,
  verticalOffset,
  scrollPosition,
  containerRef,
  contentRef,
  onWheelScroll,
  enableMarkdown,
}: TeleprompterDisplayProps) {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 30 : -30 // Scroll down = forward, up = backward
    onWheelScroll(delta)
  }

  const getHorizontalAlignment = () => {
    switch (horizontalPosition) {
      case "left":
        return "text-left"
      case "right":
        return "text-right"
      case "center":
      default:
        return "text-center"
    }
  }

  const getVerticalAlignment = () => {
    switch (verticalPosition) {
      case "top":
        return "justify-start"
      case "bottom":
        return "justify-end"
      case "center":
      default:
        return "justify-center"
    }
  }

  // Calculate horizontal position with offset
  // horizontalOffset is 0-100, where preset buttons set it to 0, 50, or 100
  // User can then fine-tune with the slider
  const getHorizontalPosition = () => {
    return horizontalOffset
  }

  // Calculate vertical position with offset
  // verticalOffset is 0-100, where preset buttons set it to 0, 50, or 100
  // User can then fine-tune with the slider
  const getVerticalPosition = () => {
    return verticalOffset
  }

  // Future: Markdown renderer (placeholder)
  const renderMarkdown = (text: string): React.ReactNode => {
    // This is a placeholder for future markdown support
    // When implementing, use a library like react-markdown
    if (!enableMarkdown) {
      return text
    }
    // For now, just return text
    return text
  }

  const horizontalPos = getHorizontalPosition()
  const verticalPos = getVerticalPosition()

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative h-full w-full overflow-hidden bg-background"
    >
      <div
        ref={contentRef}
        className={cn(
          "transition-transform duration-75 ease-linear absolute",
          getHorizontalAlignment()
        )}
        style={{
          transform: `translate(calc(${horizontalPos}% - 50%), calc(-${scrollPosition}px + ${verticalPos}%))`,
          fontSize: `${fontSize}px`,
          maxWidth: `${textWidth}%`,
          width: "100%",
          lineHeight: 1.6,
          padding: "2rem",
          color: "var(--foreground)",
          fontWeight: 400,
          letterSpacing: "0.01em",
          whiteSpace: "pre-wrap", // Preserve line breaks and whitespace
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {text ? (
          enableMarkdown ? (
            renderMarkdown(text)
          ) : (
            text
          )
        ) : (
          <span className="text-muted-foreground opacity-50">
            Enter your script to begin...
          </span>
        )}
      </div>
    </div>
  )
}

