"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"

export type ScriptStatus = "draft" | "ready" | "completed"

export interface Script {
  id: string
  name: string
  content: string
  status: ScriptStatus
  createdAt: string
  updatedAt: string
  storageType: "local" | "cloud"
}

const SCRIPTS_STORAGE_KEY = "teleprompter-scripts"
const SELECTED_SCRIPT_ID_KEY = "teleprompter-selected-script-id"
const MIGRATION_COMPLETE_KEY = "teleprompter-scripts-migration-complete"
const SCRIPTS_VERSION_KEY = "teleprompter-scripts-version"
const DEFAULT_STORAGE_KEY = "teleprompter-default-storage"
const CURRENT_VERSION = 2 // Increment this when schema changes (added storageType)

export function useScripts() {
  const { data: session } = useSession()
  const [scripts, setScripts] = useState<Script[]>([])
  const [cloudScripts, setCloudScripts] = useState<Script[]>([])
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingCloud, setIsLoadingCloud] = useState(false)
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
      storageType: script.storageType || "local", // Default to local for migration
    }))
  }

  // Fetch cloud scripts from API
  const fetchCloudScripts = useCallback(async () => {
    if (!session?.user?.id) {
      setCloudScripts([])
      return
    }

    setIsLoadingCloud(true)
    try {
      const response = await fetch("/api/scripts")
      if (response.ok) {
        const data = await response.json()
        setCloudScripts(data)
      } else {
        console.error("Failed to fetch cloud scripts")
        setCloudScripts([])
      }
    } catch (error) {
      console.error("Error fetching cloud scripts:", error)
      setCloudScripts([])
    } finally {
      setIsLoadingCloud(false)
    }
  }, [session])

  // Get default storage preference (local or cloud)
  const getDefaultStorage = useCallback((): "local" | "cloud" => {
    if (!session?.user?.id) return "local"
    try {
      const stored = localStorage.getItem(DEFAULT_STORAGE_KEY)
      return (stored === "cloud" || stored === "local") ? stored : "cloud"
    } catch {
      return session?.user?.id ? "cloud" : "local"
    }
  }, [session])

  // Set default storage preference
  const setDefaultStorage = useCallback((storage: "local" | "cloud") => {
    try {
      localStorage.setItem(DEFAULT_STORAGE_KEY, storage)
    } catch (error) {
      console.error("Failed to save default storage preference:", error)
    }
  }, [])

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
                storageType: "local",
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

      // Mark all loaded scripts as local
      const localScripts = loadedScripts.map((s) => ({
        ...s,
        storageType: "local" as const,
      }))
      setScripts(localScripts)

      // Update version if needed
      if (version < CURRENT_VERSION) {
        // Migrate existing scripts to include storageType
        const migrated = localScripts.map((s) => ({
          ...s,
          storageType: "local" as const,
        }))
        localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(migrated))
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

  // Fetch cloud scripts when session changes
  useEffect(() => {
    if (isLoaded) {
      fetchCloudScripts()
    }
  }, [isLoaded, session, fetchCloudScripts])

  // Merge local and cloud scripts
  useEffect(() => {
    if (isLoaded) {
      const localScripts = scripts.filter((s) => s.storageType === "local")
      const allScripts = [...localScripts, ...cloudScripts]

      // Load selected script ID
      const storedSelectedId = localStorage.getItem(SELECTED_SCRIPT_ID_KEY)
      if (storedSelectedId) {
        // Validate that the selected script still exists
        const scriptExists = allScripts.some((s) => s.id === storedSelectedId)
        if (scriptExists) {
          setSelectedScriptId(storedSelectedId)
        } else if (allScripts.length > 0) {
          // Select first script if selected one doesn't exist
          setSelectedScriptId(allScripts[0].id)
        }
      } else if (allScripts.length > 0 && !selectedScriptId) {
        // Select first script if none selected
        setSelectedScriptId(allScripts[0].id)
      }
    }
  }, [scripts, cloudScripts, isLoaded])

  // Save local scripts to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        const localScripts = scripts.filter((s) => s.storageType === "local")
        localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(localScripts))
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

  // Get all scripts (local + cloud)
  const allScripts = useMemo(() => {
    const localScripts = scripts.filter((s) => s.storageType === "local")
    return [...localScripts, ...cloudScripts]
  }, [scripts, cloudScripts])

  // Get the currently selected script
  const selectedScript = allScripts.find((s) => s.id === selectedScriptId) || null

  // Create a new script
  const createScript = useCallback(async () => {
    const defaultStorage = getDefaultStorage()
    const existingNames = allScripts.map((s) => s.name)
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
      storageType: defaultStorage,
    }

    if (defaultStorage === "cloud" && session?.user?.id) {
      // Create in cloud
      try {
        const response = await fetch("/api/scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newScript.name,
            content: newScript.content,
            status: newScript.status,
          }),
        })
        if (response.ok) {
          const cloudScript = await response.json()
          setCloudScripts((prev) => [...prev, cloudScript])
          setSelectedScriptId(cloudScript.id)
          setHasUnsavedChanges(false)
          return cloudScript
        } else {
          // Fallback to local if cloud creation fails
          console.error("Failed to create cloud script, falling back to local")
        }
      } catch (error) {
        console.error("Error creating cloud script:", error)
        // Fallback to local
      }
    }

    // Create locally
    setScripts((prev) => [...prev, newScript])
    setSelectedScriptId(newScript.id)
    setHasUnsavedChanges(false)
    return newScript
  }, [allScripts, getDefaultStorage, session])

  // Update script content
  const updateScriptContent = useCallback(
    async (id: string, content: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script) return

      if (script.storageType === "cloud" && session?.user?.id) {
        // Update in cloud
        try {
          const response = await fetch(`/api/scripts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          })
          if (response.ok) {
            const updated = await response.json()
            setCloudScripts((prev) =>
              prev.map((s) => (s.id === id ? updated : s))
            )
            setHasUnsavedChanges(false)
            return
          }
        } catch (error) {
          console.error("Error updating cloud script:", error)
        }
      }

      // Update locally
      setScripts((prev) =>
        prev.map((script) =>
          script.id === id
            ? { ...script, content, updatedAt: new Date().toISOString() }
            : script
        )
      )
      setHasUnsavedChanges(false)
    },
    [allScripts, session]
  )

  // Update script name
  const updateScriptName = useCallback(
    async (id: string, name: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script) return

      const trimmedName = name.trim() || script.name

      if (script.storageType === "cloud" && session?.user?.id) {
        // Update in cloud
        try {
          const response = await fetch(`/api/scripts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmedName }),
          })
          if (response.ok) {
            const updated = await response.json()
            setCloudScripts((prev) =>
              prev.map((s) => (s.id === id ? updated : s))
            )
            return
          }
        } catch (error) {
          console.error("Error updating cloud script name:", error)
        }
      }

      // Update locally
      setScripts((prev) =>
        prev.map((script) =>
          script.id === id
            ? { ...script, name: trimmedName, updatedAt: new Date().toISOString() }
            : script
        )
      )
    },
    [allScripts, session]
  )

  // Update script status
  const updateScriptStatus = useCallback(
    async (id: string, status: ScriptStatus) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script) return

      if (script.storageType === "cloud" && session?.user?.id) {
        // Update in cloud
        try {
          const response = await fetch(`/api/scripts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
          if (response.ok) {
            const updated = await response.json()
            setCloudScripts((prev) =>
              prev.map((s) => (s.id === id ? updated : s))
            )
            return
          }
        } catch (error) {
          console.error("Error updating cloud script status:", error)
        }
      }

      // Update locally
      setScripts((prev) =>
        prev.map((script) =>
          script.id === id
            ? { ...script, status, updatedAt: new Date().toISOString() }
            : script
        )
      )
    },
    [allScripts, session]
  )

  // Duplicate script
  const duplicateScript = useCallback(
    async (id: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script) return null

      const existingNames = allScripts.map((s) => s.name)
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
        storageType: script.storageType, // Keep same storage type
      }

      if (duplicated.storageType === "cloud" && session?.user?.id) {
        // Create duplicate in cloud
        try {
          const response = await fetch("/api/scripts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: duplicated.name,
              content: duplicated.content,
              status: duplicated.status,
            }),
          })
          if (response.ok) {
            const cloudScript = await response.json()
            setCloudScripts((prev) => [...prev, cloudScript])
            setSelectedScriptId(cloudScript.id)
            setHasUnsavedChanges(false)
            return cloudScript
          }
        } catch (error) {
          console.error("Error duplicating cloud script:", error)
          // Fallback to local
        }
      }

      // Create duplicate locally
      setScripts((prev) => [...prev, duplicated])
      setSelectedScriptId(duplicated.id)
      setHasUnsavedChanges(false)
      return duplicated
    },
    [allScripts, session]
  )

  // Delete script
  const deleteScript = useCallback(
    async (id: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script) return

      if (script.storageType === "cloud" && session?.user?.id) {
        // Delete from cloud
        try {
          const response = await fetch(`/api/scripts/${id}`, {
            method: "DELETE",
          })
          if (response.ok) {
            setCloudScripts((prev) => prev.filter((s) => s.id !== id))
            // If we deleted the selected script, select the first remaining one or null
            const remaining = allScripts.filter((s) => s.id !== id)
            if (selectedScriptId === id) {
              if (remaining.length > 0) {
                setSelectedScriptId(remaining[0].id)
              } else {
                setSelectedScriptId(null)
              }
            }
            setHasUnsavedChanges(false)
            return
          }
        } catch (error) {
          console.error("Error deleting cloud script:", error)
        }
      }

      // Delete locally
      setScripts((prev) => {
        const filtered = prev.filter((s) => s.id !== id)
        // If we deleted the selected script, select the first remaining one or null
        const remaining = allScripts.filter((s) => s.id !== id)
        if (selectedScriptId === id) {
          if (remaining.length > 0) {
            setSelectedScriptId(remaining[0].id)
          } else {
            setSelectedScriptId(null)
          }
        }
        return filtered
      })
      setHasUnsavedChanges(false)
    },
    [allScripts, selectedScriptId, session]
  )

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

  // Move script from local to cloud
  const moveToCloud = useCallback(
    async (id: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script || script.storageType === "cloud" || !session?.user?.id) {
        return false
      }

      try {
        const response = await fetch("/api/scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: script.name,
            content: script.content,
            status: script.status,
          }),
        })
        if (response.ok) {
          const cloudScript = await response.json()
          // Remove from local
          setScripts((prev) => prev.filter((s) => s.id !== id))
          // Add to cloud
          setCloudScripts((prev) => [...prev, cloudScript])
          // Update selected if needed
          if (selectedScriptId === id) {
            setSelectedScriptId(cloudScript.id)
          }
          return true
        }
      } catch (error) {
        console.error("Error moving script to cloud:", error)
      }
      return false
    },
    [allScripts, session, selectedScriptId]
  )

  // Move script from cloud to local
  const moveToLocal = useCallback(
    async (id: string) => {
      const script = allScripts.find((s) => s.id === id)
      if (!script || script.storageType === "local") {
        return false
      }

      try {
        // Create local copy
        const localScript: Script = {
          ...script,
          storageType: "local",
        }
        setScripts((prev) => [...prev, localScript])
        // Delete from cloud
        const response = await fetch(`/api/scripts/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setCloudScripts((prev) => prev.filter((s) => s.id !== id))
          // Update selected if needed
          if (selectedScriptId === id) {
            setSelectedScriptId(localScript.id)
          }
          return true
        }
      } catch (error) {
        console.error("Error moving script to local:", error)
      }
      return false
    },
    [allScripts, selectedScriptId]
  )

  return {
    scripts: allScripts,
    selectedScript,
    selectedScriptId,
    isLoaded: isLoaded && !isLoadingCloud,
    hasUnsavedChanges,
    createScript,
    updateScriptContent,
    updateScriptName,
    updateScriptStatus,
    duplicateScript,
    deleteScript,
    selectScript,
    markUnsavedChanges,
    moveToCloud,
    moveToLocal,
    getDefaultStorage,
    setDefaultStorage,
  }
}
