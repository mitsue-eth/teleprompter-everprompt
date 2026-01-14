"use client"

import * as React from "react"
import {
  IconFileText,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconCopy,
  IconTrash,
  IconCheck,
  IconX,
  IconMaximize,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { Script, ScriptStatus } from "@/hooks/use-scripts"

interface NavScriptsProps {
  scripts: Script[]
  selectedScriptId: string | null
  onSelectScript: (id: string) => boolean
  onCreateScript: () => void
  onRenameScript: (id: string, name: string) => void
  onDuplicateScript: (id: string) => void
  onDeleteScript: (id: string) => void
  onUpdateStatus: (id: string, status: ScriptStatus) => void
  onOpenEnhancedEditor?: (scriptId?: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  // For older dates, show formatted date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function getStatusIconColor(status: ScriptStatus): string {
  switch (status) {
    case "draft":
      return "text-muted-foreground"
    case "ready":
      return "text-blue-500"
    case "completed":
      return "text-green-500"
    default:
      return "text-muted-foreground"
  }
}

function getStatusLabel(status: ScriptStatus): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "ready":
      return "Ready"
    case "completed":
      return "Completed"
    default:
      return "Draft"
  }
}

export function NavScripts({
  scripts,
  selectedScriptId,
  onSelectScript,
  onCreateScript,
  onRenameScript,
  onDuplicateScript,
  onDeleteScript,
  onUpdateStatus,
  onOpenEnhancedEditor,
}: NavScriptsProps) {
  const [renamingScriptId, setRenamingScriptId] = React.useState<string | null>(null)
  const [renameValue, setRenameValue] = React.useState("")
  const [deletingScriptId, setDeletingScriptId] = React.useState<string | null>(null)

  const handleRenameStart = (script: Script) => {
    setRenameValue(script.name)
    setRenamingScriptId(script.id)
  }

  const handleRenameConfirm = () => {
    if (renamingScriptId && renameValue.trim()) {
      onRenameScript(renamingScriptId, renameValue.trim())
    }
    setRenamingScriptId(null)
    setRenameValue("")
  }

  const handleRenameCancel = () => {
    setRenamingScriptId(null)
    setRenameValue("")
  }

  const handleDeleteConfirm = () => {
    if (deletingScriptId) {
      onDeleteScript(deletingScriptId)
    }
    setDeletingScriptId(null)
  }

  const handleSelectScript = (id: string) => {
    // The onSelectScript handler from parent already handles unsaved changes confirmation
    onSelectScript(id)
  }

  const sortedScripts = [...scripts].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Scripts
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={onCreateScript}
            title="Create new script"
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>

        {sortedScripts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <IconFileText className="h-8 w-8 mx-auto mb-2 text-sidebar-foreground/40" />
            <p className="text-xs text-sidebar-foreground/60 mb-3">No scripts yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateScript}
              className="text-xs"
            >
              <IconPlus className="h-3 w-3 mr-1" />
              Create Script
            </Button>
          </div>
        ) : (
          sortedScripts.map((script) => (
            <SidebarMenu key={script.id}>
              <SidebarMenuItem>
                <div className="group relative">
                  <SidebarMenuButton
                    onClick={() => handleSelectScript(script.id)}
                    isActive={selectedScriptId === script.id}
                    className={cn(
                      "h-auto w-full justify-start gap-3 rounded-lg px-4 py-3",
                      "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent/50 transition-colors",
                      selectedScriptId === script.id && "bg-sidebar-accent text-sidebar-foreground"
                    )}
                  >
                    <div className="relative flex flex-col items-center shrink-0 self-stretch gap-1.5">
                      <IconFileText 
                        className={cn("size-4 mt-0.5", getStatusIconColor(script.status))}
                        title={getStatusLabel(script.status)}
                      />
                      {/* Enhanced Editor Button */}
                      {onOpenEnhancedEditor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-6 w-6 p-0",
                            "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                            "hover:text-blue-400 transition-colors"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenEnhancedEditor(script.id)
                          }}
                          title="Open Enhanced Editor (Ctrl/Cmd+E)"
                        >
                          <IconMaximize className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left pr-12">
                      <div className="mb-1">
                        <span className="font-medium text-sm truncate">{script.name}</span>
                      </div>
                      <p className="text-xs text-sidebar-foreground/50 truncate">
                        {formatDate(script.updatedAt)}
                      </p>
                    </div>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                          "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleRenameStart(script)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateScript(script.id)}>
                        <IconCopy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium mb-1.5 text-muted-foreground">Status</p>
                        <div className="space-y-1">
                          {(["draft", "ready", "completed"] as ScriptStatus[]).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => onUpdateStatus(script.id, status)}
                              className="flex items-center justify-between"
                            >
                              <span>{getStatusLabel(status)}</span>
                              {script.status === status && (
                                <IconCheck className="h-4 w-4" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingScriptId(script.id)}
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          ))
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renamingScriptId !== null} onOpenChange={handleRenameCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Script</DialogTitle>
            <DialogDescription>Enter a new name for this script.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm()
              } else if (e.key === "Escape") {
                handleRenameCancel()
              }
            }}
            autoFocus
            placeholder="Script name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleRenameCancel}>
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!renameValue.trim()}>
              <IconCheck className="h-4 w-4 mr-2" />
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingScriptId !== null} onOpenChange={() => setDeletingScriptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Script</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this script? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingScriptId(null)}>
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <IconTrash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

