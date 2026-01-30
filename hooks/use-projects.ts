"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

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

export function useProjects() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!session?.user?.id) {
      setProjects([])
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(
    async (name: string, description?: string, color?: string) => {
      if (!session?.user?.id) return null
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description?.trim() || null,
            color: color || null,
          }),
        })
        if (response.ok) {
          const project = await response.json()
          setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)))
          return project
        }
      } catch (error) {
        console.error("Error creating project:", error)
      }
      return null
    },
    [session?.user?.id]
  )

  const updateProject = useCallback(
    async (
      id: string,
      updates: {
        name?: string
        description?: string | null
        color?: string | null
        isArchived?: boolean
      }
    ) => {
      if (!session?.user?.id) return false
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        if (response.ok) {
          const updated = await response.json()
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? updated : p))
          )
          return true
        }
      } catch (error) {
        console.error("Error updating project:", error)
      }
      return false
    },
    [session?.user?.id]
  )

  const deleteProject = useCallback(
    async (id: string) => {
      if (!session?.user?.id) return false
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setProjects((prev) => prev.filter((p) => p.id !== id))
          return true
        }
      } catch (error) {
        console.error("Error deleting project:", error)
      }
      return false
    },
    [session?.user?.id]
  )

  const addScriptToProject = useCallback(
    async (projectId: string, scriptId: string, order?: number) => {
      if (!session?.user?.id) return false
      try {
        const response = await fetch(`/api/projects/${projectId}/scripts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scriptId, order }),
        })
        if (response.ok) {
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
        }
      } catch (error) {
        console.error("Error adding script to project:", error)
      }
      return false
    },
    [session?.user?.id]
  )

  const removeScriptFromProject = useCallback(
    async (projectId: string, scriptId: string) => {
      if (!session?.user?.id) return false
      try {
        const response = await fetch(
          `/api/projects/${projectId}/scripts?scriptId=${encodeURIComponent(scriptId)}`,
          { method: "DELETE" }
        )
        if (response.ok) {
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
        }
      } catch (error) {
        console.error("Error removing script from project:", error)
      }
      return false
    },
    [session?.user?.id]
  )

  return {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addScriptToProject,
    removeScriptFromProject,
  }
}
