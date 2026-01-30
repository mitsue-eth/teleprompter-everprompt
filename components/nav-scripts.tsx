"use client";

import * as React from "react";
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
  IconCloud,
  IconDeviceDesktop,
  IconSortDescending,
  IconPin,
  IconPinnedOff,
  IconFolder,
  IconFolderOff,
  IconGitBranch,
  IconMicrophone,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import type { Script, ScriptStatus } from "@/hooks/use-scripts";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type SortOption = "date" | "status" | "name";

const SORT_STORAGE_KEY = "teleprompter-scripts-sort";

interface ProjectForNav {
  id: string;
  name: string;
  scriptIds: string[];
}

interface NavScriptsProps {
  scripts: Script[];
  selectedScriptId: string | null;
  onSelectScript: (id: string) => boolean;
  onCreateScript: () => void;
  onRenameScript: (id: string, name: string) => void;
  onDuplicateScript: (id: string) => void;
  onDeleteScript: (id: string) => void;
  onUpdateStatus: (id: string, status: ScriptStatus) => void;
  onTogglePin?: (id: string) => void;
  onOpenEnhancedEditor?: (scriptId?: string) => void;
  onMoveToCloud?: (id: string) => Promise<boolean>;
  onMoveToLocal?: (id: string) => Promise<boolean>;
  projects?: ProjectForNav[];
  onAddScriptToProject?: (
    scriptId: string,
    projectId: string,
  ) => Promise<boolean>;
  onRemoveScriptFromProject?: (
    scriptId: string,
    projectId: string,
  ) => Promise<boolean>;
  onCreateVariant?: (
    scriptId: string,
    variantType: string,
  ) => Promise<Script | null>;
  onRecordRehearsal?: (scriptId: string) => Promise<boolean>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  // For older dates, show formatted date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getStatusIconColor(status: ScriptStatus): string {
  switch (status) {
    case "draft":
      return "text-muted-foreground";
    case "ready":
      return "text-blue-500";
    case "completed":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusLabel(status: ScriptStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "ready":
      return "Ready";
    case "completed":
      return "Filmed";
    default:
      return "Draft";
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
  onTogglePin,
  onOpenEnhancedEditor,
  onMoveToCloud,
  onMoveToLocal,
  projects = [],
  onAddScriptToProject,
  onRemoveScriptFromProject,
  onCreateVariant,
  onRecordRehearsal,
}: NavScriptsProps) {
  const { data: session } = useSession();
  const [renamingScriptId, setRenamingScriptId] = React.useState<string | null>(
    null,
  );
  const [renameValue, setRenameValue] = React.useState("");
  const [deletingScriptId, setDeletingScriptId] = React.useState<string | null>(
    null,
  );
  const [movingScriptId, setMovingScriptId] = React.useState<string | null>(
    null,
  );
  const [movingToLocalScriptId, setMovingToLocalScriptId] = React.useState<
    string | null
  >(null);
  const [sortBy, setSortBy] = React.useState<SortOption>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      if (stored === "date" || stored === "status" || stored === "name") {
        return stored;
      }
    }
    return "date";
  });

  // Persist sort preference
  React.useEffect(() => {
    try {
      localStorage.setItem(SORT_STORAGE_KEY, sortBy);
    } catch (error) {
      console.error("Failed to save sort preference:", error);
    }
  }, [sortBy]);

  const handleRenameStart = (script: Script) => {
    setRenameValue(script.name);
    setRenamingScriptId(script.id);
  };

  const handleRenameConfirm = () => {
    if (renamingScriptId && renameValue.trim()) {
      onRenameScript(renamingScriptId, renameValue.trim());
    }
    setRenamingScriptId(null);
    setRenameValue("");
  };

  const handleRenameCancel = () => {
    setRenamingScriptId(null);
    setRenameValue("");
  };

  const handleDeleteConfirm = () => {
    if (deletingScriptId) {
      onDeleteScript(deletingScriptId);
    }
    setDeletingScriptId(null);
  };

  const handleSelectScript = (id: string) => {
    // The onSelectScript handler from parent already handles unsaved changes confirmation
    onSelectScript(id);
  };

  const handleMoveToCloud = async (id: string) => {
    if (!onMoveToCloud) return;
    setMovingScriptId(id);
    try {
      const success = await onMoveToCloud(id);
      if (success) {
        toast.success("Script moved to cloud");
      } else {
        toast.error("Failed to move script to cloud");
      }
    } catch (error) {
      toast.error("Error moving script to cloud");
    } finally {
      setMovingScriptId(null);
    }
  };

  // Show confirmation dialog before moving to local
  const handleMoveToLocalRequest = (id: string) => {
    setMovingToLocalScriptId(id);
  };

  // Actually move to local after confirmation
  const handleMoveToLocalConfirm = async () => {
    const id = movingToLocalScriptId;
    setMovingToLocalScriptId(null);
    if (!id || !onMoveToLocal) return;
    setMovingScriptId(id);
    try {
      const success = await onMoveToLocal(id);
      if (success) {
        toast.success("Script moved to local storage");
      } else {
        toast.error("Failed to move script to local storage");
      }
    } catch (error) {
      toast.error("Error moving script to local storage");
    } finally {
      setMovingScriptId(null);
    }
  };

  const sortedScripts = React.useMemo(() => {
    const sorted = [...scripts];

    // Helper to apply secondary sort within groups
    const secondarySort = (a: Script, b: Script) => {
      switch (sortBy) {
        case "status": {
          const statusOrder: Record<ScriptStatus, number> = {
            draft: 0,
            ready: 1,
            completed: 2,
          };
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    };

    // Always put pinned scripts first, then apply secondary sort
    return sorted.sort((a, b) => {
      // Pinned scripts come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Within same pin status, apply secondary sort
      return secondarySort(a, b);
    });
  }, [scripts, sortBy]);

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Scripts
          </span>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer"
                  title="Sort scripts"
                >
                  <IconSortDescending className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Sort by
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => setSortBy("date")}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>Last edited</span>
                  {sortBy === "date" && <IconCheck className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("status")}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>Status</span>
                  {sortBy === "status" && <IconCheck className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("name")}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>Name</span>
                  {sortBy === "name" && <IconCheck className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer"
              onClick={onCreateScript}
              title="Create new script"
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {sortedScripts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <IconFileText className="h-8 w-8 mx-auto mb-2 text-sidebar-foreground/40" />
            <p className="text-xs text-sidebar-foreground/60 mb-3">
              No scripts yet
            </p>
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
            <SidebarMenu key={`${script.id}-${script.storageType}`}>
              <SidebarMenuItem>
                <div className="group relative">
                  <SidebarMenuButton
                    onClick={() => handleSelectScript(script.id)}
                    isActive={selectedScriptId === script.id}
                    className={cn(
                      "h-auto w-full justify-start gap-3 rounded-lg px-3 py-2.5",
                      "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent/50 transition-colors",
                      selectedScriptId === script.id &&
                        "bg-sidebar-accent text-sidebar-foreground",
                    )}
                  >
                    {/* Left icons column: Status + Storage */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {/* Status icon */}
                      <IconFileText
                        className={cn(
                          "size-4",
                          getStatusIconColor(script.status),
                        )}
                        title={getStatusLabel(script.status)}
                      />
                      {/* Storage icon placeholder for layout consistency */}
                      <div className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left pr-10">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        {script.isPinned && (
                          <IconPin
                            className="h-3 w-3 text-amber-500 shrink-0"
                            title="Pinned"
                          />
                        )}
                        <span className="font-medium text-sm truncate">
                          {script.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
                        <span className="truncate">
                          {formatDate(script.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>

                  {/* Storage indicator - clickable, positioned in the icon column */}
                  {session?.user && onMoveToCloud && onMoveToLocal && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "absolute left-3 bottom-2 h-4 w-4 flex items-center justify-center rounded z-10",
                            "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors cursor-pointer",
                          )}
                          onClick={(e) => e.stopPropagation()}
                          title={
                            script.storageType === "cloud"
                              ? "Stored in cloud - click to change"
                              : "Stored locally - click to change"
                          }
                        >
                          {script.storageType === "cloud" ? (
                            <IconCloud className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <IconDeviceDesktop className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-medium mb-1 text-muted-foreground">
                            Storage
                          </p>
                        </div>
                        <DropdownMenuItem
                          onClick={() => {
                            if (script.storageType === "cloud") {
                              handleMoveToLocalRequest(script.id);
                            }
                          }}
                          disabled={
                            script.storageType === "local" ||
                            movingScriptId === script.id
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <IconDeviceDesktop className="h-4 w-4" />
                            Local only
                          </span>
                          {script.storageType === "local" && (
                            <IconCheck className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (script.storageType === "local") {
                              handleMoveToCloud(script.id);
                            }
                          }}
                          disabled={
                            script.storageType === "cloud" ||
                            movingScriptId === script.id
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <IconCloud className="h-4 w-4" />
                            Cloud sync
                          </span>
                          {script.storageType === "cloud" && (
                            <IconCheck className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Storage indicator - non-clickable when not signed in */}
                  {(!session?.user || !onMoveToCloud || !onMoveToLocal) && (
                    <div
                      className="absolute left-3 bottom-2 h-4 w-4 flex items-center justify-center"
                      title={
                        script.storageType === "cloud"
                          ? "Stored in cloud"
                          : "Stored locally"
                      }
                    >
                      {script.storageType === "cloud" ? (
                        <IconCloud className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <IconDeviceDesktop className="h-3.5 w-3.5 text-sidebar-foreground/40" />
                      )}
                    </div>
                  )}

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
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleRenameStart(script)}
                      >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDuplicateScript(script.id)}
                      >
                        <IconCopy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {onCreateVariant && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="cursor-pointer">
                            <IconGitBranch className="h-4 w-4 mr-2" />
                            Create variant
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(
                              ["short", "intro", "outro", "custom"] as const
                            ).map((type) => (
                              <DropdownMenuItem
                                key={type}
                                onClick={async () => {
                                  await onCreateVariant(script.id, type);
                                  toast.success(`Created ${type} variant`);
                                }}
                                className="cursor-pointer capitalize"
                              >
                                {type === "short"
                                  ? "Short version"
                                  : type === "intro"
                                    ? "Intro only"
                                    : type === "outro"
                                      ? "Outro only"
                                      : "Custom variant"}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      {onTogglePin && (
                        <DropdownMenuItem
                          onClick={() => onTogglePin(script.id)}
                          className="cursor-pointer"
                        >
                          {script.isPinned ? (
                            <>
                              <IconPinnedOff className="h-4 w-4 mr-2" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <IconPin className="h-4 w-4 mr-2" />
                              Pin to top
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onRecordRehearsal && script.storageType === "cloud" && (
                        <DropdownMenuItem
                          onClick={async () => {
                            const ok = await onRecordRehearsal(script.id);
                            if (ok) toast.success("Rehearsal recorded");
                          }}
                          className="cursor-pointer"
                        >
                          <IconMicrophone className="h-4 w-4 mr-2" />
                          Mark rehearsed
                        </DropdownMenuItem>
                      )}
                      {onOpenEnhancedEditor && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onOpenEnhancedEditor(script.id)}
                          >
                            <IconMaximize className="h-4 w-4 mr-2" />
                            Enhanced Editor
                          </DropdownMenuItem>
                        </>
                      )}
                      {projects.length > 0 &&
                        (onAddScriptToProject || onRemoveScriptFromProject) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="cursor-pointer">
                                <IconFolder className="h-4 w-4 mr-2" />
                                Projects
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {projects.map((project) => {
                                  const inProject = script.projectIds?.includes(
                                    project.id,
                                  );
                                  return (
                                    <DropdownMenuItem
                                      key={project.id}
                                      onClick={async () => {
                                        if (
                                          inProject &&
                                          onRemoveScriptFromProject
                                        ) {
                                          await onRemoveScriptFromProject(
                                            script.id,
                                            project.id,
                                          );
                                        } else if (
                                          !inProject &&
                                          onAddScriptToProject
                                        ) {
                                          await onAddScriptToProject(
                                            script.id,
                                            project.id,
                                          );
                                        }
                                      }}
                                      className="cursor-pointer flex items-center justify-between"
                                    >
                                      <span className="truncate">
                                        {project.name}
                                      </span>
                                      {inProject ? (
                                        <IconCheck className="h-4 w-4 ml-2 shrink-0" />
                                      ) : (
                                        <IconFolderOff className="h-4 w-4 ml-2 shrink-0 opacity-50" />
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </>
                        )}
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                          Status
                        </p>
                        <div className="space-y-1">
                          {(
                            ["draft", "ready", "completed"] as ScriptStatus[]
                          ).map((status) => (
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
      <Dialog
        open={renamingScriptId !== null}
        onOpenChange={handleRenameCancel}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Script</DialogTitle>
            <DialogDescription>
              Enter a new name for this script.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm();
              } else if (e.key === "Escape") {
                handleRenameCancel();
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
            <Button
              onClick={handleRenameConfirm}
              disabled={!renameValue.trim()}
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingScriptId !== null}
        onOpenChange={() => setDeletingScriptId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Script</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this script? This action cannot be
              undone.
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

      {/* Move to Local Confirmation Dialog */}
      <Dialog
        open={movingToLocalScriptId !== null}
        onOpenChange={() => setMovingToLocalScriptId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Local Storage?</DialogTitle>
            <DialogDescription asChild>
              <div className="text-muted-foreground text-sm space-y-2">
                <span className="block">
                  This will{" "}
                  <strong>remove the script from cloud storage</strong> and keep
                  it only in this browser.
                </span>
                <span className="block text-amber-500">
                  The script will no longer sync across devices and will only
                  exist on this machine.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMovingToLocalScriptId(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleMoveToLocalConfirm}>
              <IconDeviceDesktop className="h-4 w-4 mr-2" />
              Move to Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
