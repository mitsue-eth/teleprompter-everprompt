import JSZip from "jszip";
import matter from "gray-matter";

export type ScriptStatus = "draft" | "ready" | "completed";

export interface ImportedScript {
  id: string;
  name: string;
  content: string;
  status: ScriptStatus;
  createdAt: string;
  updatedAt: string;
  origin: "imported";
}

const SCRIPTS_FOLDER = "scripts";
const METADATA_FILENAME = "metadata.json";
const VALID_STATUSES: ScriptStatus[] = ["draft", "ready", "completed"];

function isValidStatus(s: unknown): s is ScriptStatus {
  return typeof s === "string" && VALID_STATUSES.includes(s as ScriptStatus);
}

/**
 * Parse a Markdown string with optional YAML frontmatter into script fields.
 */
export function parseMarkdownWithFrontmatter(
  raw: string,
  fallbackTitle = "Imported Script"
): ImportedScript {
  const now = new Date().toISOString();
  const { data, content } = matter(raw);

  const id =
    typeof data?.id === "string" && data.id.trim()
      ? data.id.trim()
      : crypto.randomUUID();

  const name =
    typeof data?.title === "string" && data.title.trim()
      ? data.title.trim()
      : fallbackTitle;

  const status = isValidStatus(data?.status) ? data.status : "draft";

  const createdAt =
    typeof data?.created_at === "string" && data.created_at.trim()
      ? data.created_at.trim()
      : now;
  const updatedAt =
    typeof data?.updated_at === "string" && data.updated_at.trim()
      ? data.updated_at.trim()
      : now;

  return {
    id,
    name,
    content: content?.trim() ?? "",
    status,
    createdAt,
    updatedAt,
    origin: "imported",
  };
}

/**
 * Parse metadata.json from an EverPrompt export (if present).
 */
interface MetadataScript {
  id?: string;
  filename?: string;
  title?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExportMetadata {
  exportedAt?: string;
  version?: number;
  scriptCount?: number;
  scripts?: MetadataScript[];
}

export function parseMetadataJson(jsonString: string): ExportMetadata | null {
  try {
    const parsed = JSON.parse(jsonString) as ExportMetadata;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Import from an EverPrompt export ZIP.
 * Returns array of scripts; uses metadata.json for index when present, else infers from .md files.
 */
export async function parseExportZip(zipBlob: Blob): Promise<ImportedScript[]> {
  const zip = await JSZip.loadAsync(zipBlob);
  const results: ImportedScript[] = [];

  const metadataFile = zip.file(METADATA_FILENAME);
  let metadata: ExportMetadata | null = null;
  if (metadataFile) {
    const metaText = await metadataFile.async("string");
    metadata = parseMetadataJson(metaText);
  }

  const scriptsFolder = zip.folder(SCRIPTS_FOLDER);
  const mdFiles = scriptsFolder
    ? scriptsFolder.filter((_, file) => file.name.endsWith(".md"))
    : [];

  const metadataByFilename = new Map<string, MetadataScript>();
  if (metadata?.scripts && Array.isArray(metadata.scripts)) {
    for (const s of metadata.scripts) {
      if (s.filename) metadataByFilename.set(s.filename, s);
    }
  }

  for (const file of mdFiles) {
    const raw = await file.async("string");
    const baseName = file.name.split("/").pop() ?? file.name;
    const meta = metadataByFilename.get(baseName);
    const script = parseMarkdownWithFrontmatter(raw, meta?.title ?? baseName.replace(/\.md$/i, ""));

    if (meta?.title && !raw.includes("title:")) script.name = meta.title;
    if (meta?.status && isValidStatus(meta.status)) script.status = meta.status;
    if (meta?.createdAt) script.createdAt = meta.createdAt;
    if (meta?.updatedAt) script.updatedAt = meta.updatedAt;
    if (meta?.id) script.id = meta.id;

    results.push(script);
  }

  return results;
}

/**
 * Import from a single Markdown file (e.g. file picker or drag-and-drop).
 */
export function parseSingleMarkdownFile(raw: string): ImportedScript {
  return parseMarkdownWithFrontmatter(raw);
}
