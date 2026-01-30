"use client";

import * as React from "react";
import {
  IconCamera,
  IconSettings,
  IconHelp,
  IconFileExport,
} from "@tabler/icons-react";

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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavScripts } from "@/components/nav-scripts";
import { NavProjects } from "@/components/nav-projects";
import { cn } from "@/lib/utils";
import type { Script, ScriptStatus } from "@/hooks/use-scripts";
import type { Project } from "@/hooks/use-projects";

const navItems = [
  {
    title: "Teleprompter",
    url: "/",
    icon: IconCamera,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  scripts?: Script[];
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
  onAddScriptToProject?: (
    scriptId: string,
    projectId: string,
  ) => Promise<boolean>;
  onRemoveScriptFromProject?: (
    scriptId: string,
    projectId: string,
  ) => Promise<boolean>;
  onCreateProject?: (
    name: string,
    description?: string,
  ) => Promise<Project | null>;
  onUpdateProject?: (
    id: string,
    updates: { name?: string; description?: string | null },
  ) => Promise<boolean>;
  onDeleteProject?: (id: string) => Promise<boolean>;
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

        <SidebarHeader className="relative z-10 border-b border-sidebar-border/50 px-6 py-6 flex-shrink-0">
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
                      className="!size-8 transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                      EverPrompt
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 font-normal">
                      Teleprompter
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="relative z-10 px-4 py-6 flex-1 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {navItems.map((item) => (
              <SidebarMenu key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === "/"}
                    className={cn(
                      "h-11 w-full justify-start gap-3 rounded-lg px-4",
                      "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent/50 transition-colors",
                    )}
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon className="size-5" />}
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ))}
          </div>

          {/* Projects Section (when signed in) */}
          {projects.length >= 0 &&
            onSelectProject &&
            onCreateProject &&
            onUpdateProject &&
            onDeleteProject && (
              <div className="border-t border-sidebar-border/50 pt-6">
                <NavProjects
                  projects={projects}
                  selectedProjectId={selectedProjectId ?? null}
                  onSelectProject={onSelectProject}
                  onCreateProject={onCreateProject}
                  onUpdateProject={onUpdateProject}
                  onDeleteProject={onDeleteProject}
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
              <div className="border-t border-sidebar-border/50 pt-6">
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

        <SidebarFooter className="relative z-10 border-t border-sidebar-border/50 px-4 py-4 mt-auto flex-shrink-0">
          <div className="space-y-1">
            {/* Settings Button */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSettingsClick}
                  className={cn(
                    "h-10 w-full justify-start gap-3 rounded-lg px-4",
                    "text-sidebar-foreground/60 hover:text-sidebar-foreground/80",
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
                      "h-10 w-full justify-start gap-3 rounded-lg px-4",
                      "text-sidebar-foreground/60 hover:text-sidebar-foreground/80",
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
                    "h-10 w-full justify-start gap-3 rounded-lg px-4",
                    "text-sidebar-foreground/60 hover:text-sidebar-foreground/80",
                    "hover:bg-sidebar-accent/30 transition-colors",
                    "text-sm cursor-pointer",
                  )}
                >
                  <IconHelp className="size-4" />
                  <span className="text-sm">About Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
