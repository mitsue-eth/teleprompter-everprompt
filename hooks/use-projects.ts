"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// localStorage keys
const LOCAL_PROJECTS_KEY = "teleprompter-local-projects"
const LOCAL_PROJECT_SCRIPTS_KEY = "teleprompter-project-scripts" // Maps projectId -> scriptId[]

/**
 * Project interface.
 * 
 * Projects are ALWAYS stored locally (localStorage). They are organizational
 * containers that can hold both local and cloud scripts.
 * 
 * This follows the "local-first" philosophy where:
 * - Projects = free organizational structure for everyone
 * - Scripts = content that can optionally be synced to cloud (paid feature)
 */
export interface Project {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  scriptCount: number
  scriptIds: string[]
}

interface LocalProject {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

interface LocalProjectScripts {
  [projectId: string]: string[]
}

// Generate a unique local ID
function generateLocalId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const hasInitialized = useRef(false)

  // Load projects from localStorage
  const loadProjects = useCallback((): Project[] => {
    if (typeof window === "undefined") return []
    try {
      const storedProjects = localStorage.getItem(LOCAL_PROJECTS_KEY)
      const storedLinks = localStorage.getItem(LOCAL_PROJECT_SCRIPTS_KEY)
      
      const localProjects: LocalProject[] = storedProjects
        ? JSON.parse(storedProjects)
        : []
      const projectScripts: LocalProjectScripts = storedLinks
        ? JSON.parse(storedLinks)
        : {}

      return localProjects
        .filter((p) => !p.isArchived)
        .map((p) => ({
          ...p,
          scriptIds: projectScripts[p.id] || [],
          scriptCount: (projectScripts[p.id] || []).length,
        }))
    } catch (error) {
      console.error("Error loading projects:", error)
      return []
    }
  }, [])

  // Save projects to localStorage
  const saveProjects = useCallback((localProjects: LocalProject[]) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(localProjects))
    } catch (error) {
      console.error("Error saving projects:", error)
    }
  }, [])

  // Save project-script links to localStorage
  const saveProjectScriptLinks = useCallback((links: LocalProjectScripts) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(LOCAL_PROJECT_SCRIPTS_KEY, JSON.stringify(links))
    } catch (error) {
      console.error("Error saving project-script links:", error)
    }
  }, [])

  // Fetch all projects
  const fetchProjects = useCallback(() => {
    setIsLoading(true)
    try {
      const allProjects = loadProjects().sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      setProjects(allProjects)
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
    }
  }, [loadProjects])

  // Initialize on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    fetchProjects()
  }, [fetchProjects])

  // Create a project
  const createProject = useCallback(
    (name: string, description?: string, color?: string): Project | null => {
      const trimmedName = name.trim()
      if (!trimmedName) return null

      const now = new Date().toISOString()
      const newProject: LocalProject = {
        id: generateLocalId(),
        name: trimmedName,
        description: description?.trim() || null,
        color: color || null,
        icon: null,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      }

      // Save to localStorage
      const stored = localStorage.getItem(LOCAL_PROJECTS_KEY)
      const existing: LocalProject[] = stored ? JSON.parse(stored) : []
      saveProjects([...existing, newProject])

      const project: Project = {
        ...newProject,
        scriptIds: [],
        scriptCount: 0,
      }

      setProjects((prev) =>
        [...prev, project].sort((a, b) => a.name.localeCompare(b.name))
      )
      return project
    },
    [saveProjects]
  )

  // Update a project
  const updateProject = useCallback(
    (
      id: string,
      updates: {
        name?: string
        description?: string | null
        color?: string | null
        isArchived?: boolean
      }
    ): boolean => {
      const project = projects.find((p) => p.id === id)
      if (!project) return false

      const stored = localStorage.getItem(LOCAL_PROJECTS_KEY)
      const localProjects: LocalProject[] = stored ? JSON.parse(stored) : []
      const updatedProjects = localProjects.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          ...updates,
          name: updates.name?.trim() || p.name,
          updatedAt: new Date().toISOString(),
        }
      })
      saveProjects(updatedProjects)

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          return {
            ...p,
            ...updates,
            name: updates.name?.trim() || p.name,
            updatedAt: new Date().toISOString(),
          }
        })
      )
      return true
    },
    [projects, saveProjects]
  )

  // Delete a project
  const deleteProject = useCallback(
    (id: string): boolean => {
      const project = projects.find((p) => p.id === id)
      if (!project) return false

      const stored = localStorage.getItem(LOCAL_PROJECTS_KEY)
      const localProjects: LocalProject[] = stored ? JSON.parse(stored) : []
      saveProjects(localProjects.filter((p) => p.id !== id))

      // Also remove script links
      const storedLinks = localStorage.getItem(LOCAL_PROJECT_SCRIPTS_KEY)
      const links: LocalProjectScripts = storedLinks ? JSON.parse(storedLinks) : {}
      delete links[id]
      saveProjectScriptLinks(links)

      setProjects((prev) => prev.filter((p) => p.id !== id))
      return true
    },
    [projects, saveProjects, saveProjectScriptLinks]
  )

  // Add script to project
  const addScriptToProject = useCallback(
    (projectId: string, scriptId: string): boolean => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return false

      const storedLinks = localStorage.getItem(LOCAL_PROJECT_SCRIPTS_KEY)
      const links: LocalProjectScripts = storedLinks ? JSON.parse(storedLinks) : {}
      
      if (!links[projectId]) {
        links[projectId] = []
      }
      if (!links[projectId].includes(scriptId)) {
        links[projectId].push(scriptId)
        saveProjectScriptLinks(links)
      }

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          if (p.scriptIds.includes(scriptId)) return p
          return {
            ...p,
            scriptIds: [...p.scriptIds, scriptId],
            scriptCount: p.scriptCount + 1,
          }
        })
      )
      return true
    },
    [projects, saveProjectScriptLinks]
  )

  // Remove script from project
  const removeScriptFromProject = useCallback(
    (projectId: string, scriptId: string): boolean => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return false

      const storedLinks = localStorage.getItem(LOCAL_PROJECT_SCRIPTS_KEY)
      const links: LocalProjectScripts = storedLinks ? JSON.parse(storedLinks) : {}
      
      if (links[projectId]) {
        links[projectId] = links[projectId].filter((id) => id !== scriptId)
        saveProjectScriptLinks(links)
      }

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          return {
            ...p,
            scriptIds: p.scriptIds.filter((id) => id !== scriptId),
            scriptCount: Math.max(0, p.scriptCount - 1),
          }
        })
      )
      return true
    },
    [projects, saveProjectScriptLinks]
  )

  return {
    projects,
    isLoading,
    isLoaded,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addScriptToProject,
    removeScriptFromProject,
  }
}
