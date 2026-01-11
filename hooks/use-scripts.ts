"use client"

import { useState, useEffect, useCallback } from "react"

export type ScriptStatus = "draft" | "ready" | "completed"

export interface Script {
  id: string
  name: string
  content: string
  status: ScriptStatus
  createdAt: string
  updatedAt: string
}

const SCRIPTS_STORAGE_KEY = "teleprompter-scripts"
const SELECTED_SCRIPT_ID_KEY = "teleprompter-selected-script-id"
const MIGRATION_COMPLETE_KEY = "teleprompter-scripts-migration-complete"
const SCRIPTS_VERSION_KEY = "teleprompter-scripts-version"
const CURRENT_VERSION = 1 // Increment this when schema changes

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Validate and migrate script data
  const validateAndMigrateScripts = (parsed: any, version: number): Script[] => {
    if (!Array.isArray(parsed)) {
      return []
    }

    // Ensure all scripts have required fields with defaults
    return parsed.map((script: any) => ({
      id: script.id || crypto.randomUUID(),
      name: script.name || "Untitled Script",
      content: script.content || "",
      status: (script.status && ["draft", "ready", "completed"].includes(script.status)) 
        ? script.status 
        : "draft",
      createdAt: script.createdAt || new Date().toISOString(),
      updatedAt: script.updatedAt || new Date().toISOString(),
    }))
  }

  // Load scripts from localStorage on mount
  useEffect(() => {
    try {
      // Check version and migrate if needed
      const storedVersion = localStorage.getItem(SCRIPTS_VERSION_KEY)
      const version = storedVersion ? parseInt(storedVersion, 10) : 0
      
      // Load scripts
      const storedScripts = localStorage.getItem(SCRIPTS_STORAGE_KEY)
      let loadedScripts: Script[] = []
      
      if (storedScripts) {
        try {
          const parsed = JSON.parse(storedScripts)
          loadedScripts = validateAndMigrateScripts(parsed, version)
        } catch (error) {
          console.error("Failed to parse stored scripts:", error)
        }
      }

      // Migration: Check if we need to migrate from old settings.text
      const migrationComplete = localStorage.getItem(MIGRATION_COMPLETE_KEY)
      if (!migrationComplete && loadedScripts.length === 0) {
        const oldSettings = localStorage.getItem("teleprompter-settings")
        if (oldSettings) {
          try {
            const parsed = JSON.parse(oldSettings)
            if (parsed.text && parsed.text.trim()) {
              // Create a default script from old text
              const defaultScript: Script = {
                id: crypto.randomUUID(),
                name: "My Script",
                content: parsed.text,
                status: "draft",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              loadedScripts = [defaultScript]
              setSelectedScriptId(defaultScript.id)
              localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(loadedScripts))
              localStorage.setItem(SELECTED_SCRIPT_ID_KEY, defaultScript.id)
            }
          } catch (error) {
            console.error("Failed to migrate old settings:", error)
          }
        }
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true")
      }

      setScripts(loadedScripts)

      // Load selected script ID
      const storedSelectedId = localStorage.getItem(SELECTED_SCRIPT_ID_KEY)
      if (storedSelectedId) {
        // Validate that the selected script still exists
        const scriptExists = loadedScripts.some((s) => s.id === storedSelectedId)
        if (scriptExists) {
          setSelectedScriptId(storedSelectedId)
        } else if (loadedScripts.length > 0) {
          // Select first script if selected one doesn't exist
          setSelectedScriptId(loadedScripts[0].id)
        }
      }

      // Update version if needed
      if (version < CURRENT_VERSION) {
        localStorage.setItem(SCRIPTS_VERSION_KEY, CURRENT_VERSION.toString())
      } else if (!storedVersion) {
        // First time setup - set version
        localStorage.setItem(SCRIPTS_VERSION_KEY, CURRENT_VERSION.toString())
      }
    } catch (error) {
      console.error("Failed to load scripts:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save scripts to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(scripts))
        // Ensure version is set
        localStorage.setItem(SCRIPTS_VERSION_KEY, CURRENT_VERSION.toString())
      } catch (error) {
        console.error("Failed to save scripts:", error)
      }
    }
  }, [scripts, isLoaded])

  // Save selected script ID to localStorage
  useEffect(() => {
    if (isLoaded && selectedScriptId) {
      try {
        localStorage.setItem(SELECTED_SCRIPT_ID_KEY, selectedScriptId)
      } catch (error) {
        console.error("Failed to save selected script ID:", error)
      }
    }
  }, [selectedScriptId, isLoaded])

  // Get the currently selected script
  const selectedScript = scripts.find((s) => s.id === selectedScriptId) || null

  // Create a new script
  const createScript = useCallback(() => {
    const existingNames = scripts.map((s) => s.name)
    let name = "Untitled Script"
    let counter = 1
    while (existingNames.includes(name)) {
      name = `Untitled Script ${counter}`
      counter++
    }

    const newScript: Script = {
      id: crypto.randomUUID(),
      name,
      content: "",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setScripts((prev) => [...prev, newScript])
    setSelectedScriptId(newScript.id)
    setHasUnsavedChanges(false)
    return newScript
  }, [scripts])

  // Update script content
  const updateScriptContent = useCallback(
    (id: string, content: string) => {
      setScripts((prev) =>
        prev.map((script) =>
          script.id === id
            ? { ...script, content, updatedAt: new Date().toISOString() }
            : script
        )
      )
      setHasUnsavedChanges(false)
    },
    []
  )

  // Update script name
  const updateScriptName = useCallback((id: string, name: string) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === id
          ? { ...script, name: name.trim() || script.name, updatedAt: new Date().toISOString() }
          : script
      )
    )
  }, [])

  // Update script status
  const updateScriptStatus = useCallback((id: string, status: ScriptStatus) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === id
          ? { ...script, status, updatedAt: new Date().toISOString() }
          : script
      )
    )
  }, [])

  // Duplicate script
  const duplicateScript = useCallback(
    (id: string) => {
      const script = scripts.find((s) => s.id === id)
      if (!script) return null

      const existingNames = scripts.map((s) => s.name)
      let newName = `${script.name} (Copy)`
      let counter = 1
      while (existingNames.includes(newName)) {
        newName = `${script.name} (Copy ${counter})`
        counter++
      }

      const duplicated: Script = {
        ...script,
        id: crypto.randomUUID(),
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setScripts((prev) => [...prev, duplicated])
      setSelectedScriptId(duplicated.id)
      setHasUnsavedChanges(false)
      return duplicated
    },
    [scripts]
  )

  // Delete script
  const deleteScript = useCallback((id: string) => {
    setScripts((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      // If we deleted the selected script, select the first remaining one or null
      if (selectedScriptId === id) {
        if (filtered.length > 0) {
          setSelectedScriptId(filtered[0].id)
        } else {
          setSelectedScriptId(null)
        }
      }
      return filtered
    })
    setHasUnsavedChanges(false)
  }, [selectedScriptId])

  // Select a script (with optional unsaved changes check)
  const selectScript = useCallback(
    (id: string, force: boolean = false) => {
      if (!force && hasUnsavedChanges && selectedScriptId) {
        // Return false to indicate we need confirmation
        return false
      }
      setSelectedScriptId(id)
      setHasUnsavedChanges(false)
      return true
    },
    [hasUnsavedChanges, selectedScriptId]
  )

  // Mark as having unsaved changes
  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  return {
    scripts,
    selectedScript,
    selectedScriptId,
    isLoaded,
    hasUnsavedChanges,
    createScript,
    updateScriptContent,
    updateScriptName,
    updateScriptStatus,
    duplicateScript,
    deleteScript,
    selectScript,
    markUnsavedChanges,
  }
}
