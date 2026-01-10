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
  textAlign: "left" | "center" | "right" | "justify"
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
  textAlign,
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

  const getTextAlignment = () => {
    switch (textAlign) {
      case "left":
        return "text-left"
      case "right":
        return "text-right"
      case "justify":
        return "text-justify"
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

  // Get base position from preset
  const getHorizontalBasePosition = (): number => {
    switch (horizontalPosition) {
      case "left":
        return 0
      case "center":
        return 50
      case "right":
        return 100
      default:
        return 50
    }
  }
  
  // Calculate final horizontal position: base position + offset
  const getFinalHorizontalPosition = (): number => {
    const base = getHorizontalBasePosition()
    const final = base + horizontalOffset
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, final))
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

  const finalHorizontalPos = getFinalHorizontalPosition()
  const verticalPos = getVerticalPosition()
  
  // Calculate vertical position: 
  // - For center (50%), we want the first line of text to start at viewport center (50vh)
  // - For top (0%), we want text to start at top (0vh)  
  // - For bottom (100%), we want text to start at bottom (100vh)
  // - Then subtract scrollPosition to move content up as we scroll
  const getVerticalBasePosition = (): number => {
    switch (verticalPosition) {
      case "top":
        return 0
      case "center":
        return 50
      case "bottom":
        return 100
      default:
        return 50
    }
  }
  
  const getFinalVerticalPosition = (): number => {
    const base = getVerticalBasePosition()
    const final = base + verticalOffset
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, final))
  }
  
  const finalVerticalPos = getFinalVerticalPosition()
  
  const getVerticalTransform = () => {
    // Position from top of viewport
    // finalVerticalPos is 0-100, where 50 = center (50vh)
    // We want the top of the content to be at ${finalVerticalPos}vh
    // Then translate up by scrollPosition to scroll the content
    return `calc(${finalVerticalPos}vh - ${scrollPosition}px)`
  }
  
  // Calculate horizontal position:
  // - For left (0%): left edge of text block at 0% of viewport
  // - For center (50%): center of text block at 50% of viewport
  // - For right (100%): right edge of text block at 100% of viewport
  const getHorizontalStyle = (): { left: string; transformX: string } => {
    if (finalHorizontalPos === 50) {
      // Center: position at 50% and translate by -50% to center the block
      return { left: "50%", transformX: "-50%" }
    } else if (finalHorizontalPos === 0) {
      // Left: position at 0% (left edge)
      return { left: "0%", transformX: "0%" }
    } else if (finalHorizontalPos === 100) {
      // Right: position at 100% and translate by -100% to align right edge
      return { left: "100%", transformX: "-100%" }
    } else {
      // For fine-tuned positions between presets, interpolate
      // For values < 50%, we're between left and center
      // For values > 50%, we're between center and right
      if (finalHorizontalPos < 50) {
        // Between left (0%) and center (50%)
        // Interpolate: at 0% = left:0%, at 50% = left:50% translateX(-50%)
        const ratio = finalHorizontalPos / 50
        const leftPos = `${finalHorizontalPos}%`
        const translateX = `${-50 * ratio}%`
        return { left: leftPos, transformX: translateX }
      } else {
        // Between center (50%) and right (100%)
        // Interpolate: at 50% = left:50% translateX(-50%), at 100% = left:100% translateX(-100%)
        const ratio = (finalHorizontalPos - 50) / 50
        const leftPos = `${finalHorizontalPos}%`
        const translateX = `calc(-50% + ${-50 * ratio}%)`
        return { left: leftPos, transformX: translateX }
      }
    }
  }
  
  const horizontalPosStyle = getHorizontalStyle()

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
          getTextAlignment()
        )}
        style={{
          // Position horizontally based on horizontalPos
          left: horizontalPosStyle.left,
          // Position vertically: start at the calculated viewport position
          top: 0,
          transform: `translate(${horizontalPosStyle.transformX}, ${getVerticalTransform()})`,
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

