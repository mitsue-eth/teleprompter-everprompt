import JSZip from "jszip";
import { saveAs } from "file-saver";

export type ScriptStatus = "draft" | "ready" | "completed";

export interface ScriptForExport {
  id: string;
  name: string;
  content: string;
  status: ScriptStatus;
  createdAt: string;
  updatedAt: string;
  storageType: "local" | "cloud";
  origin?: "local" | "imported" | "cloud";
}

const EXPORT_VERSION = 1;
const SCRIPTS_FOLDER = "scripts";
const METADATA_FILENAME = "metadata.json";

/**
 * Sanitize a script name for use as a filename (safe, no path separators).
 */
function slugifyFilename(name: string): string {
  return name
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .toLowerCase() || "untitled-script";
}

/**
 * Format a single script as Markdown with YAML frontmatter.
 */
export function formatScriptAsMarkdown(script: ScriptForExport): string {
  const frontmatter = [
    "---",
    `id: "${script.id}"`,
    `title: "${script.name.replace(/"/g, '\\"')}"`,
    `status: "${script.status}"`,
    `created_at: "${script.createdAt}"`,
    `updated_at: "${script.updatedAt}"`,
    "---",
    "",
  ].join("\n");
  return frontmatter + (script.content || "");
}

/**
 * Build metadata.json contents for an export.
 */
export function buildMetadataJson(scripts: ScriptForExport[]): string {
  const exportedAt = new Date().toISOString();
  const metadata = {
    exportedAt,
    version: EXPORT_VERSION,
    scriptCount: scripts.length,
    scripts: scripts.map((s) => ({
      id: s.id,
      filename: `${slugifyFilename(s.name)}.md`,
      title: s.name,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  };
  return JSON.stringify(metadata, null, 2);
}

/**
 * Generate a ZIP blob containing scripts as Markdown files and metadata.json.
 */
export async function generateExportZip(scripts: ScriptForExport[]): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(SCRIPTS_FOLDER);
  if (!folder) {
    throw new Error("Failed to create scripts folder in ZIP");
  }

  const usedFilenames = new Set<string>();
  for (const script of scripts) {
    let base = slugifyFilename(script.name);
    let filename = `${base}.md`;
    let counter = 1;
    while (usedFilenames.has(filename)) {
      filename = `${base}-${counter}.md`;
      counter++;
    }
    usedFilenames.add(filename);
    const markdown = formatScriptAsMarkdown(script);
    folder.file(filename, markdown);
  }

  zip.file(METADATA_FILENAME, buildMetadataJson(scripts));
  return zip.generateAsync({ type: "blob" });
}

/**
 * Trigger download of an EverPrompt export ZIP.
 */
export async function downloadExport(scripts: ScriptForExport[]): Promise<void> {
  const blob = await generateExportZip(scripts);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `everprompt-export-${date}.zip`;
  saveAs(blob, filename);
}
