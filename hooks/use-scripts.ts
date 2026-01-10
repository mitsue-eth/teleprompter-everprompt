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

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load scripts from localStorage on mount
  useEffect(() => {
    try {
      // Load scripts
      const storedScripts = localStorage.getItem(SCRIPTS_STORAGE_KEY)
      if (storedScripts) {
        const parsed = JSON.parse(storedScripts)
        setScripts(parsed)
      }

      // Load selected script ID
      const storedSelectedId = localStorage.getItem(SELECTED_SCRIPT_ID_KEY)
      if (storedSelectedId) {
        setSelectedScriptId(storedSelectedId)
      }

      // Migration: Check if we need to migrate from old settings.text
      const migrationComplete = localStorage.getItem(MIGRATION_COMPLETE_KEY)
      if (!migrationComplete) {
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
              const newScripts = [defaultScript]
              setScripts(newScripts)
              setSelectedScriptId(defaultScript.id)
              localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(newScripts))
              localStorage.setItem(SELECTED_SCRIPT_ID_KEY, defaultScript.id)
            }
          } catch (error) {
            console.error("Failed to migrate old settings:", error)
          }
        }
        localStorage.setItem(MIGRATION_COMPLETE_KEY, "true")
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
