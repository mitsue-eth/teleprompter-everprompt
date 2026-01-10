"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Teleprompter, TeleprompterRef } from "@/components/teleprompter";
import { HelpDialog } from "@/components/help-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);
  const teleprompterRef = React.useRef<TeleprompterRef>(null);

  const handleSettingsClick = React.useCallback(() => {
    // Open settings panel via Teleprompter component
    if (teleprompterRef.current) {
      teleprompterRef.current.openSettings();
    }
  }, []);

  const handleHelpClick = React.useCallback(() => {
    setIsHelpDialogOpen(true);
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
      />
      <SidebarInset>
        <SiteHeader />
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
