"use client";

import * as React from "react";
import {
  IconFolder,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Project } from "@/hooks/use-projects";

interface NavProjectsProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (
    name: string,
    description?: string,
  ) => Promise<Project | null>;
  onUpdateProject: (
    id: string,
    updates: { name?: string; description?: string | null },
  ) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
}

export function NavProjects({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: NavProjectsProps) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCreate = React.useCallback(async () => {
    if (!createName.trim()) return;
    setIsSubmitting(true);
    try {
      const project = await onCreateProject(
        createName.trim(),
        createDescription.trim() || undefined,
      );
      if (project) {
        setCreateOpen(false);
        setCreateName("");
        setCreateDescription("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createName, createDescription, onCreateProject]);

  const handleEditStart = (p: Project) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description || "");
  };

  const handleEditSave = React.useCallback(async () => {
    if (!editingId || !editName.trim()) return;
    setIsSubmitting(true);
    try {
      const ok = await onUpdateProject(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      if (ok) {
        setEditingId(null);
        setEditName("");
        setEditDescription("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, editName, editDescription, onUpdateProject]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deletingId) return;
    const ok = await onDeleteProject(deletingId);
    if (ok) {
      if (selectedProjectId === deletingId) {
        onSelectProject(null);
      }
      setDeletingId(null);
    }
  }, [deletingId, selectedProjectId, onDeleteProject, onSelectProject]);

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer"
            onClick={() => setCreateOpen(true)}
            title="Create project"
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <IconFolder className="h-6 w-6 mx-auto mb-2 text-sidebar-foreground/40" />
            <p className="text-xs text-sidebar-foreground/60 mb-2">
              No projects yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-xs"
            >
              <IconPlus className="h-3 w-3 mr-1" />
              New Project
            </Button>
          </div>
        ) : (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onSelectProject(null)}
                isActive={selectedProjectId === null}
                className={cn(
                  "h-auto py-2 px-3 rounded-lg",
                  "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                  "hover:bg-sidebar-accent/50 transition-colors",
                  selectedProjectId === null &&
                    "bg-sidebar-accent text-sidebar-foreground",
                )}
              >
                <span className="text-sm">All scripts</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {projects.map((project) => (
              <SidebarMenu key={project.id}>
                <SidebarMenuItem>
                  <div className="group relative">
                    <SidebarMenuButton
                      onClick={() =>
                        onSelectProject(
                          selectedProjectId === project.id ? null : project.id,
                        )
                      }
                      isActive={selectedProjectId === project.id}
                      className={cn(
                        "h-auto w-full justify-start gap-3 rounded-lg px-3 py-2",
                        "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                        "hover:bg-sidebar-accent/50 transition-colors",
                        selectedProjectId === project.id &&
                          "bg-sidebar-accent text-sidebar-foreground",
                      )}
                    >
                      <IconFolder
                        className="h-4 w-4 shrink-0"
                        style={
                          project.color ? { color: project.color } : undefined
                        }
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <span className="font-medium text-sm truncate block">
                          {project.name}
                        </span>
                        <span className="text-xs text-sidebar-foreground/50">
                          {project.scriptCount} script
                          {project.scriptCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                            "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditStart(project)}
                          className="cursor-pointer"
                        >
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingId(project.id)}
                          className="cursor-pointer"
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            ))}
          </>
        )}
      </div>

      {/* Create project dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a project to group scripts. You can add scripts to projects
              and export by project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Project name"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Description (optional)
              </label>
              <Input
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Brief description"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!createName.trim() || isSubmitting}
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit project dialog */}
      <Dialog
        open={editingId !== null}
        onOpenChange={() => {
          if (!editingId) return;
          setEditingId(null);
          setEditName("");
          setEditDescription("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Change the project name or description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project name"
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Description (optional)
              </label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description"
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setEditName("");
                setEditDescription("");
              }}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editName.trim() || isSubmitting}
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={() => setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete this project? Scripts will not be deleted; they will only
              be removed from this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
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
  );
}
