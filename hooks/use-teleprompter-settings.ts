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
  text: "",
  enableMarkdown: false,
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
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
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

