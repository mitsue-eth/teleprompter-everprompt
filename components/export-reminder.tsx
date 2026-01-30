"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportReminderProps {
  onExportClick: () => void;
  className?: string;
}

export function ExportReminder({
  onExportClick,
  className,
}: ExportReminderProps) {
  const { data: session } = useSession();
  const [prefs, setPrefs] = React.useState<{
    lastExportedAt: string | null;
    exportReminderDays: number;
    showExportReminder: boolean;
  } | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setPrefs(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const shouldShow = React.useMemo(() => {
    if (!session?.user?.id || !prefs?.showExportReminder || dismissed)
      return false;
    if (!prefs.lastExportedAt) return true;
    const last = new Date(prefs.lastExportedAt).getTime();
    const days = (Date.now() - last) / (24 * 60 * 60 * 1000);
    return days >= prefs.exportReminderDays;
  }, [session?.user?.id, prefs, dismissed]);

  const handleDismiss = React.useCallback(async () => {
    setDismissed(true);
    if (!session?.user?.id) return;
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showExportReminder: false }),
      });
    } catch {
      // ignore
    }
  }, [session?.user?.id]);

  const daysSinceExport = React.useMemo(() => {
    if (!prefs?.lastExportedAt) return null;
    const last = new Date(prefs.lastExportedAt).getTime();
    return Math.floor((Date.now() - last) / (24 * 60 * 60 * 1000));
  }, [prefs?.lastExportedAt]);

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm",
        className,
      )}
    >
      <p className="text-foreground/90">
        {daysSinceExport !== null
          ? `You haven't exported your scripts in ${daysSinceExport} days.`
          : "Export your scripts to keep a local backup."}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onExportClick}
          className="gap-1.5 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 cursor-pointer"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
