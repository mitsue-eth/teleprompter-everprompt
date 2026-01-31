"use client";

import * as React from "react";
import { IconSettings, IconHelp, IconFileExport } from "@tabler/icons-react";

import { Logo } from "@/components/logo";
import { SidebarBackground } from "@/components/sidebar-background";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavScripts } from "@/components/nav-scripts";
import { ProjectFilter } from "@/components/project-filter";
import { cn } from "@/lib/utils";
import type { Script, ScriptStatus } from "@/hooks/use-scripts";
import type { Project } from "@/hooks/use-projects";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  scripts?: Script[];
  totalScriptCount?: number;
  selectedScriptId?: string | null;
  onSelectScript?: (id: string) => boolean;
  onCreateScript?: () => void;
  onRenameScript?: (id: string, name: string) => void;
  onDuplicateScript?: (id: string) => void;
  onDeleteScript?: (id: string) => void;
  onUpdateStatus?: (id: string, status: ScriptStatus) => void;
  onTogglePin?: (id: string) => void;
  onOpenEnhancedEditor?: (scriptId?: string) => void;
  onMoveToCloud?: (id: string) => Promise<boolean>;
  onMoveToLocal?: (id: string) => Promise<boolean>;
  onExportImportClick?: () => void;
  projects?: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (id: string | null) => void;
  onAddScriptToProject?: (scriptId: string, projectId: string) => boolean;
  onRemoveScriptFromProject?: (scriptId: string, projectId: string) => boolean;
  onCreateProject?: (name: string, description?: string) => Project | null;
  onUpdateProject?: (
    id: string,
    updates: { name?: string; description?: string | null },
  ) => boolean;
  onDeleteProject?: (id: string) => boolean;
  onCreateVariant?: (
    scriptId: string,
    variantType: string,
  ) => Promise<Script | null>;
  onRecordRehearsal?: (scriptId: string) => Promise<boolean>;
}

export function AppSidebar({
  onSettingsClick,
  onHelpClick,
  scripts = [],
  totalScriptCount,
  selectedScriptId = null,
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
  onExportImportClick,
  projects = [],
  selectedProjectId = null,
  onSelectProject,
  onAddScriptToProject,
  onRemoveScriptFromProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateVariant,
  onRecordRehearsal,
  ...props
}: AppSidebarProps) {
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Close sidebar (mobile or desktop)
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    // Open settings panel
    onSettingsClick?.();
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Close sidebar (mobile or desktop)
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    // Open help dialog
    onHelpClick?.();
  };

  const handleExportImportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    onExportImportClick?.();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="relative h-full flex flex-col">
        <SidebarBackground />

        <SidebarHeader className="relative z-10 border-b border-sidebar-border/50 px-5 py-5 flex-shrink-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="h-auto p-0 hover:bg-transparent data-[slot=sidebar-menu-button]:!p-0"
              >
                <a href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <Logo
                      variant="icon"
                      className="!size-9 transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                      EverPrompt
                    </span>
                    <span className="text-xs text-sidebar-foreground/50 font-normal">
                      Teleprompter
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="relative z-10 flex-1 overflow-y-auto flex flex-col">
          {/* Project Filter Bar - Full Width */}
          {onSelectProject &&
            onCreateProject &&
            onUpdateProject &&
            onDeleteProject && (
              <div className="px-3 py-3 border-b border-sidebar-border/50 bg-sidebar-accent/20">
                <ProjectFilter
                  projects={projects}
                  selectedProjectId={selectedProjectId ?? null}
                  onSelectProject={onSelectProject}
                  onCreateProject={onCreateProject}
                  onUpdateProject={onUpdateProject}
                  onDeleteProject={onDeleteProject}
                  filteredScriptCount={scripts.length}
                  totalScriptCount={totalScriptCount ?? scripts.length}
                />
              </div>
            )}

          {/* Scripts Section */}
          {onSelectScript &&
            onCreateScript &&
            onRenameScript &&
            onDuplicateScript &&
            onDeleteScript &&
            onUpdateStatus && (
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavScripts
                  scripts={scripts}
                  selectedScriptId={selectedScriptId}
                  onSelectScript={onSelectScript}
                  onCreateScript={onCreateScript}
                  onRenameScript={onRenameScript}
                  onDuplicateScript={onDuplicateScript}
                  onDeleteScript={onDeleteScript}
                  onUpdateStatus={onUpdateStatus}
                  onTogglePin={onTogglePin}
                  onOpenEnhancedEditor={onOpenEnhancedEditor}
                  onMoveToCloud={onMoveToCloud}
                  onMoveToLocal={onMoveToLocal}
                  projects={projects.map((p) => ({
                    id: p.id,
                    name: p.name,
                    scriptIds: p.scriptIds,
                  }))}
                  onAddScriptToProject={onAddScriptToProject}
                  onRemoveScriptFromProject={onRemoveScriptFromProject}
                  onCreateVariant={onCreateVariant}
                  onRecordRehearsal={onRecordRehearsal}
                />
              </div>
            )}
        </SidebarContent>

        <SidebarFooter className="relative z-10 border-t border-sidebar-border/50 px-3 py-3 mt-auto flex-shrink-0">
          <div className="space-y-0.5">
            {/* Settings Button */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSettingsClick}
                  className={cn(
                    "h-9 w-full justify-start gap-3 rounded-lg px-3",
                    "text-sidebar-foreground/50 hover:text-sidebar-foreground/80",
                    "hover:bg-sidebar-accent/30 transition-colors",
                    "text-sm cursor-pointer",
                  )}
                >
                  <IconSettings className="size-4" />
                  <span className="text-sm">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Export / Import Button */}
            {onExportImportClick && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleExportImportClick}
                    className={cn(
                      "h-9 w-full justify-start gap-3 rounded-lg px-3",
                      "text-sidebar-foreground/50 hover:text-sidebar-foreground/80",
                      "hover:bg-sidebar-accent/30 transition-colors",
                      "text-sm cursor-pointer",
                    )}
                  >
                    <IconFileExport className="size-4" />
                    <span className="text-sm">Export / Import</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}

            {/* About Project Button */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleHelpClick}
                  className={cn(
                    "h-9 w-full justify-start gap-3 rounded-lg px-3",
                    "text-sidebar-foreground/50 hover:text-sidebar-foreground/80",
                    "hover:bg-sidebar-accent/30 transition-colors",
                    "text-sm cursor-pointer",
                  )}
                >
                  <IconHelp className="size-4" />
                  <span className="text-sm">About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
