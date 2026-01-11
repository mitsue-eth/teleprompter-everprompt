"use client"

import { useState, useEffect } from "react"

export interface TeleprompterSettings {
  fontSize: number
  textWidth: number
  horizontalPosition: "left" | "center" | "right"
  verticalPosition: "top" | "center" | "bottom"
  horizontalOffset: number // -50 to +50, relative offset from preset position
  verticalOffset: number // -50 to +50, relative offset from preset position
  textAlign: "left" | "center" | "right" | "justify" // Text alignment for paragraphs
  scrollSpeed: number
  mode: "auto" | "manual"
  text: string
  enableMarkdown: boolean // Future: markdown support
  showCrosshair: boolean // Show camera lens target crosshair
  crosshairX: number // Crosshair X position (0-100, percentage from left)
  crosshairY: number // Crosshair Y position (0-100, percentage from top)
  crosshairShape: "circle" | "square" | "cross" | "dot" // Crosshair shape style
  crosshairSize: number // Crosshair size/radius (10-100px)
  crosshairColor: string // Crosshair color (hex format, e.g., "#3b82f6" for blue)
  crosshairIntensity: number // Crosshair color intensity/opacity (0-100, percentage)
  textColor: string // Text color (hex format, e.g., "#ffffff" for white)
  textOpacity: number // Text opacity/intensity (0-100, percentage)
  lineHeight: number // Line height multiplier (0.8 to 3.0, e.g., 1.6 = 1.6x font size)
  paragraphSpacing: number // Space between paragraphs in em units (0.5 to 3.0)
}

const DEFAULT_SETTINGS: TeleprompterSettings = {
  fontSize: 24,
  textWidth: 80,
  horizontalPosition: "center",
  verticalPosition: "center",
  horizontalOffset: 0, // 0% offset by default (relative to preset)
  verticalOffset: 0, // 0% offset by default (relative to preset)
  textAlign: "center", // Center aligned by default
  scrollSpeed: 1.0,
  mode: "auto",
  text: "Welcome to EverPrompt Teleprompter!\n\nThis is your starter script. You can edit this text or replace it with your own content.\n\nSimply type or paste your script here, and it will appear in the teleprompter view. You can adjust the speed, font size, and positioning using the settings panel.\n\nStart recording and let the teleprompter guide you through your script smoothly and professionally.",
  enableMarkdown: false,
  showCrosshair: true, // Show crosshair by default
  crosshairX: 50, // Center horizontally by default
  crosshairY: 50, // Center vertically by default
  crosshairShape: "circle", // Circle shape by default
  crosshairSize: 24, // 24px radius by default
  crosshairColor: "#3b82f6", // Blue color by default (#3b82f6 = blue-500)
  crosshairIntensity: 60, // 60% intensity/opacity by default
  textColor: "#ffffff", // White color by default
  textOpacity: 100, // 100% opacity by default (fully opaque)
  lineHeight: 1.6, // 1.6x line height by default
  paragraphSpacing: 1.0, // 1em spacing between paragraphs by default
}

const STORAGE_KEY = "teleprompter-settings"

export function useTeleprompterSettings() {
  const [settings, setSettings] = useState<TeleprompterSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all new properties are included
        setSettings({ 
          ...DEFAULT_SETTINGS, 
          ...parsed,
          // Explicitly ensure new properties exist with defaults if missing
          lineHeight: parsed.lineHeight ?? DEFAULT_SETTINGS.lineHeight,
          paragraphSpacing: parsed.paragraphSpacing ?? DEFAULT_SETTINGS.paragraphSpacing,
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    // Save to localStorage whenever settings change
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error("Failed to save settings:", error)
      }
    }
  }, [settings, isLoaded])

  const updateSetting = <K extends keyof TeleprompterSettings>(
    key: K,
    value: TeleprompterSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    isLoaded,
  }
}

