"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Teleprompter, TeleprompterRef } from "@/components/teleprompter";
import { HelpDialog } from "@/components/help-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ScriptStatus } from "@/hooks/use-scripts";

export default function Home() {
  // Main teleprompter application page
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);
  const teleprompterRef = React.useRef<TeleprompterRef>(null);
  const [scriptHandlers, setScriptHandlers] = React.useState<{
    scripts: any[];
    selectedScriptId: string | null;
    onSelectScript: (id: string) => boolean;
    onCreateScript: () => void;
    onRenameScript: (id: string, name: string) => void;
    onDuplicateScript: (id: string) => void;
    onDeleteScript: (id: string) => void;
    onUpdateStatus: (id: string, status: ScriptStatus) => void;
    onOpenEnhancedEditor: (scriptId?: string) => void;
    onMoveToCloud?: (id: string) => Promise<boolean>;
    onMoveToLocal?: (id: string) => Promise<boolean>;
  } | null>(null);

  const handleSettingsClick = React.useCallback(() => {
    // Open settings panel via Teleprompter component
    if (teleprompterRef.current) {
      teleprompterRef.current.openSettings();
    }
  }, []);

  const handleHelpClick = React.useCallback(() => {
    setIsHelpDialogOpen(true);
  }, []);

  // Get script handlers from Teleprompter component
  // Update handlers whenever they change (scripts, selectedScriptId, etc.)
  React.useEffect(() => {
    const updateHandlers = () => {
      if (teleprompterRef.current) {
        const handlers = teleprompterRef.current.getScriptHandlers();
        if (handlers) {
          setScriptHandlers(handlers);
        }
      }
    };

    // Initial check
    updateHandlers();

    // Check periodically to catch updates
    const interval = setInterval(() => {
      updateHandlers();
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
        scripts={scriptHandlers?.scripts ?? []}
        selectedScriptId={scriptHandlers?.selectedScriptId ?? null}
        onSelectScript={scriptHandlers?.onSelectScript}
        onCreateScript={scriptHandlers?.onCreateScript}
        onRenameScript={scriptHandlers?.onRenameScript}
        onDuplicateScript={scriptHandlers?.onDuplicateScript}
        onDeleteScript={scriptHandlers?.onDeleteScript}
        onUpdateStatus={scriptHandlers?.onUpdateStatus}
        onOpenEnhancedEditor={scriptHandlers?.onOpenEnhancedEditor}
        onMoveToCloud={scriptHandlers?.onMoveToCloud}
        onMoveToLocal={scriptHandlers?.onMoveToLocal}
      />
      <SidebarInset>
        <SiteHeader
          cloudScriptCount={
            scriptHandlers?.scripts?.filter((s) => s.storageType === "cloud")
              .length ?? 0
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Teleprompter ref={teleprompterRef} />
            </div>
          </div>
        </div>
      </SidebarInset>
      <HelpDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen} />
    </SidebarProvider>
  );
}
