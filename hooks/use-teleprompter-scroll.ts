"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseTeleprompterScrollProps {
  text: string
  speed: number
  mode: "auto" | "manual"
  isPlaying: boolean
  onComplete?: () => void // Callback when scrolling reaches the end
}

export function useTeleprompterScroll({
  text,
  speed,
  mode,
  isPlaying,
  onComplete,
}: UseTeleprompterScrollProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isPaused, setIsPaused] = useState(!isPlaying)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const getMaxScroll = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return 0
    const containerHeight = containerRef.current.clientHeight
    const contentHeight = contentRef.current.scrollHeight
    // Allow scrolling past the end so content can fully disappear
    // Add extra scroll space equal to container height
    const maxScroll = Math.max(0, contentHeight + containerHeight)
    return maxScroll
  }, [])

  const scrollTo = useCallback((position: number) => {
    const maxScroll = getMaxScroll()
    const clampedPosition = Math.max(0, Math.min(position, maxScroll))
    setScrollPosition(clampedPosition)
  }, [getMaxScroll])

  const scrollBy = useCallback((delta: number) => {
    setScrollPosition((prev) => {
      const maxScroll = getMaxScroll()
      const newPosition = prev + delta
      return Math.max(0, Math.min(newPosition, maxScroll))
    })
  }, [getMaxScroll])

  const reset = useCallback(() => {
    setScrollPosition(0)
  }, [])

  // Auto-scroll animation
  useEffect(() => {
    if (mode === "auto" && !isPaused && isPlaying) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = currentTime
        }

        const deltaTime = (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
        lastTimeRef.current = currentTime

        // Speed in pixels per second (base speed: 30px/s, multiplied by speed factor)
        const baseSpeed = 30
        const pixelsPerSecond = baseSpeed * speed
        const deltaPixels = pixelsPerSecond * deltaTime

        setScrollPosition((prev) => {
          const maxScroll = getMaxScroll()
          if (maxScroll <= 0) return 0
          
          const newPosition = prev + deltaPixels
          
          // Continue scrolling until content is fully off-screen
          // Stop only when we've scrolled past the maximum (content fully disappeared)
          if (newPosition >= maxScroll) {
            // Content has fully scrolled off-screen, stop animation
            if (animationFrameRef.current !== null) {
              cancelAnimationFrame(animationFrameRef.current)
              animationFrameRef.current = null
            }
            setIsPaused(true)
            // Notify parent that scrolling is complete
            if (onComplete) {
              onComplete()
            }
            return maxScroll
          }
          
          return newPosition
        })

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      lastTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        lastTimeRef.current = 0
      }
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = 0
    }
  }, [mode, isPaused, isPlaying, speed, getMaxScroll, onComplete])

  // Reset scroll position when text changes
  useEffect(() => {
    reset()
  }, [text, reset])

  // Update pause state when isPlaying changes
  useEffect(() => {
    setIsPaused(!isPlaying)
  }, [isPlaying])

  return {
    scrollPosition,
    scrollTo,
    scrollBy,
    reset,
    isPaused,
    setIsPaused,
    containerRef,
    contentRef,
  }
}

