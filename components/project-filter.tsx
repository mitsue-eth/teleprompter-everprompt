"use client";

import * as React from "react";
import {
  IconFolder,
  IconPlus,
  IconChevronDown,
  IconX,
  IconEdit,
  IconTrash,
  IconCheck,
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
import { cn } from "@/lib/utils";
import type { Project } from "@/hooks/use-projects";

interface ProjectFilterProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (name: string, description?: string) => Project | null;
  onUpdateProject: (
    id: string,
    updates: { name?: string; description?: string | null },
  ) => boolean;
  onDeleteProject: (id: string) => boolean;
  filteredScriptCount: number;
  totalScriptCount: number;
}

export function ProjectFilter({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  filteredScriptCount,
  totalScriptCount,
}: ProjectFilterProps) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null,
  );
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const handleCreate = React.useCallback(() => {
    if (!createName.trim()) return;
    const project = onCreateProject(
      createName.trim(),
      createDescription.trim() || undefined,
    );
    if (project) {
      setCreateOpen(false);
      setCreateName("");
      setCreateDescription("");
    }
  }, [createName, createDescription, onCreateProject]);

  const handleEditStart = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const handleEditSave = React.useCallback(() => {
    if (!editingProject || !editName.trim()) return;
    const ok = onUpdateProject(editingProject.id, {
      name: editName.trim(),
      description: editDescription.trim() || null,
    });
    if (ok) {
      setEditingProject(null);
      setEditName("");
      setEditDescription("");
    }
  }, [editingProject, editName, editDescription, onUpdateProject]);

  const handleDeleteConfirm = React.useCallback(() => {
    if (!deletingId) return;
    const ok = onDeleteProject(deletingId);
    if (ok) {
      if (selectedProjectId === deletingId) {
        onSelectProject(null);
      }
      setDeletingId(null);
    }
  }, [deletingId, selectedProjectId, onDeleteProject, onSelectProject]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Project Filter Dropdown - Full Width Style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 flex-1 justify-between gap-2 text-sm font-medium",
                "bg-sidebar-accent/30 border-sidebar-border/50 hover:bg-sidebar-accent/50",
                selectedProject
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/70",
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <IconFolder className="h-4 w-4 shrink-0" />
                {selectedProject ? (
                  <span className="truncate">{selectedProject.name}</span>
                ) : (
                  <span>All projects</span>
                )}
              </span>
              <IconChevronDown className="h-4 w-4 opacity-60 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {/* All Projects option */}
            <DropdownMenuItem
              onClick={() => onSelectProject(null)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>All scripts</span>
              {!selectedProjectId && <IconCheck className="h-4 w-4" />}
            </DropdownMenuItem>

            {projects.length > 0 && <DropdownMenuSeparator />}

            {/* Project list */}
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <IconFolder
                    className="h-4 w-4 shrink-0"
                    style={project.color ? { color: project.color } : undefined}
                  />
                  <span className="truncate flex-1">{project.name}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0 tabular-nums">
                    {project.scriptCount}{" "}
                    {project.scriptCount === 1 ? "script" : "scripts"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={(e) => handleEditStart(e, project)}
                    className="p-0.5 hover:bg-accent rounded"
                  >
                    <IconEdit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(project.id);
                    }}
                    className="p-0.5 hover:bg-destructive/20 text-destructive rounded"
                  >
                    <IconTrash className="h-3 w-3" />
                  </button>
                </div>
                {selectedProjectId === project.id && (
                  <IconCheck className="h-4 w-4 shrink-0 ml-1" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* New Project option */}
            <DropdownMenuItem
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              New project...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filter button (only when filtered) */}
        {selectedProject && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={() => onSelectProject(null)}
            title="Clear filter"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}

        {/* Script count indicator */}
        <span className="text-xs text-sidebar-foreground/50 tabular-nums shrink-0">
          {selectedProject ? (
            <span className="font-medium">
              {filteredScriptCount}
              <span className="opacity-60"> / {totalScriptCount}</span>
            </span>
          ) : (
            <span>{totalScriptCount} scripts</span>
          )}
        </span>
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
            <Button onClick={handleCreate} disabled={!createName.trim()}>
              <IconCheck className="h-4 w-4 mr-2" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit project dialog */}
      <Dialog
        open={editingProject !== null}
        onOpenChange={() => {
          setEditingProject(null);
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
                setEditingProject(null);
                setEditName("");
                setEditDescription("");
              }}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editName.trim()}>
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
