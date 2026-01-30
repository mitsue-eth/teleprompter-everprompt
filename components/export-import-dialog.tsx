"use client";

import * as React from "react";
import { Download, Upload, FileArchive, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadExport } from "@/lib/export";
import type { ScriptForExport } from "@/lib/export";
import {
  parseExportZip,
  parseSingleMarkdownFile,
  type ImportedScript,
} from "@/lib/import";

interface ProjectForExport {
  id: string;
  name: string;
  scriptIds: string[];
}

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scripts: ScriptForExport[];
  onImport: (scripts: ImportedScript[]) => void;
  projects?: ProjectForExport[];
  onExportSuccess?: () => void;
}

export function ExportImportDialog({
  open,
  onOpenChange,
  scripts,
  onImport,
  projects = [],
  onExportSuccess,
}: ExportImportDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [exportScope, setExportScope] = React.useState<"all" | string>("all");

  const scriptsToExport = React.useMemo(() => {
    if (exportScope === "all") return scripts;
    const project = projects.find((p) => p.id === exportScope);
    if (!project) return scripts;
    const idSet = new Set(project.scriptIds);
    return scripts.filter((s) => idSet.has(s.id));
  }, [scripts, projects, exportScope]);

  const handleExport = React.useCallback(async () => {
    if (scriptsToExport.length === 0) return;
    setIsExporting(true);
    setImportError(null);
    try {
      await downloadExport(scriptsToExport);
      onExportSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Export failed:", err);
      setImportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [scriptsToExport, onOpenChange, onExportSuccess]);

  const handleImportFile = React.useCallback(
    async (file: File) => {
      setImportError(null);
      setIsImporting(true);
      try {
        const name = file.name.toLowerCase();
        let parsed: ImportedScript[];
        if (name.endsWith(".zip")) {
          const blob = await file.arrayBuffer();
          parsed = await parseExportZip(new Blob([blob]));
        } else if (name.endsWith(".md")) {
          const text = await file.text();
          parsed = [parseSingleMarkdownFile(text)];
        } else {
          setImportError(
            "Please choose a .zip (EverPrompt export) or .md file.",
          );
          setIsImporting(false);
          return;
        }
        if (parsed.length === 0) {
          setImportError("No scripts found in this file.");
          setIsImporting(false);
          return;
        }
        onImport(parsed);
        onOpenChange(false);
      } catch (err) {
        console.error("Import failed:", err);
        setImportError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setIsImporting(false);
      }
    },
    [onImport, onOpenChange],
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImportFile(file);
      e.target.value = "";
    },
    [handleImportFile],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleImportFile(file);
    },
    [handleImportFile],
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export / Import Scripts</DialogTitle>
          <DialogDescription>
            Export all scripts to a ZIP file, or import from an EverPrompt
            export or a Markdown file. Your data stays in your control.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </h4>
            {projects.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Scope
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                >
                  <option value="all">All scripts ({scripts.length})</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.scriptIds.length} scripts)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Download {scriptsToExport.length} script
              {scriptsToExport.length !== 1 ? "s" : ""} as a ZIP file (Markdown
              + metadata). No account required.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer"
              onClick={handleExport}
              disabled={scriptsToExport.length === 0 || isExporting}
            >
              <FileArchive className="h-4 w-4" />
              {isExporting ? "Exporting…" : "Download ZIP"}
            </Button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </h4>
            <p className="text-sm text-muted-foreground">
              Choose an EverPrompt export (.zip) or a single Markdown file
              (.md). Existing scripts are never overwritten.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.md"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <FileText className="h-4 w-4" />
              {isImporting ? "Importing…" : "Choose file"}
            </Button>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              or drag and drop a .zip or .md file here
            </div>
          </div>

          {importError && (
            <p className="text-sm text-destructive">{importError}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
