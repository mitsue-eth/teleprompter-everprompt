"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Minus,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Type,
  Save,
  Copy,
  Download,
  Undo2,
  Redo2,
  X,
  Palette,
  Zap,
  Pencil,
  Cloud,
  Monitor,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EditorMode = "normal" | "fullscreen" | "distraction-free";
type ViewMode = "editor" | "preview" | "split";

type ContentTab = "full" | "bullet" | "cue";

interface EnhancedScriptEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  scriptName?: string;
  storageType?: "local" | "cloud";
  onRename?: (newName: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  scrollSpeed?: number;
  bulletContent?: string | null;
  cueContent?: string | null;
  onBulletChange?: (text: string) => void;
  onCueChange?: (text: string) => void;
}

export function EnhancedScriptEditor({
  text,
  onTextChange,
  scriptName,
  storageType = "local",
  onRename,
  isOpen,
  onOpenChange,
  hasUnsavedChanges = false,
  isSaving = false,
  scrollSpeed = 1.0,
  bulletContent = null,
  cueContent = null,
  onBulletChange,
  onCueChange,
}: EnhancedScriptEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const [mode, setMode] = React.useState<EditorMode>("normal");
  const [viewMode, setViewMode] = React.useState<ViewMode>("split");
  const [contentTab, setContentTab] = React.useState<ContentTab>("full");
  const [localText, setLocalText] = React.useState(text);
  const [localBulletText, setLocalBulletText] = React.useState(
    bulletContent ?? "",
  );
  const [localCueText, setLocalCueText] = React.useState(cueContent ?? "");
  const [undoStack, setUndoStack] = React.useState<string[]>([text]);
  const [redoStack, setRedoStack] = React.useState<string[]>([]);
  const [undoIndex, setUndoIndex] = React.useState(0);
  const [editorTextColor, setEditorTextColor] = React.useState("#e5e7eb"); // Light gray - visible on dark backgrounds
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");

  // Sync local text with prop
  React.useEffect(() => {
    setLocalText(text);
    setUndoStack([text]);
    setRedoStack([]);
    setUndoIndex(0);
  }, [text, isOpen]);

  React.useEffect(() => {
    setLocalBulletText(bulletContent ?? "");
  }, [bulletContent, isOpen]);

  React.useEffect(() => {
    setLocalCueText(cueContent ?? "");
  }, [cueContent, isOpen]);

  const activeContent =
    contentTab === "full"
      ? localText
      : contentTab === "bullet"
        ? localBulletText
        : localCueText;

  const handleActiveContentChange = (newVal: string) => {
    if (contentTab === "full") {
      handleTextChange(newVal);
    } else if (contentTab === "bullet") {
      setLocalBulletText(newVal);
      onBulletChange?.(newVal);
    } else {
      setLocalCueText(newVal);
      onCueChange?.(newVal);
    }
  };

  const showContentTabs = !!(onBulletChange || onCueChange);

  // Calculate stats from active content
  const wordCount = activeContent.trim()
    ? activeContent.trim().split(/\s+/).length
    : 0;
  const charCount = activeContent.length;

  const calculateReadingTime = (wordCount: number, speed: number): string => {
    if (wordCount === 0) return "0 sec";
    const wordsPerMinute = 175;
    const baseMinutes = wordCount / wordsPerMinute;
    const totalMinutes = baseMinutes / speed;

    if (totalMinutes < 1) {
      const seconds = Math.round(totalMinutes * 60);
      return `${seconds} sec`;
    } else {
      const minutes = Math.floor(totalMinutes);
      const seconds = Math.round((totalMinutes - minutes) * 60);
      if (seconds === 0) {
        return `${minutes} min`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  const readingTime = React.useMemo(
    () => calculateReadingTime(wordCount, scrollSpeed),
    [wordCount, scrollSpeed],
  );

  // Handle text change with undo/redo support
  const handleTextChange = (newText: string) => {
    setLocalText(newText);
    onTextChange(newText);
    // Update undo stack
    setUndoStack((prev) => [...prev.slice(0, undoIndex + 1), newText]);
    setUndoIndex((prev) => prev + 1);
    setRedoStack([]);
  };

  // Undo functionality
  const handleUndo = () => {
    if (undoIndex > 0) {
      const newIndex = undoIndex - 1;
      const previousText = undoStack[newIndex];
      setLocalText(previousText);
      onTextChange(previousText);
      setUndoIndex(newIndex);
      setRedoStack((prev) => [localText, ...prev]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextText = redoStack[0];
      setLocalText(nextText);
      onTextChange(nextText);
      setUndoStack((prev) => [...prev, nextText]);
      setUndoIndex((prev) => prev + 1);
      setRedoStack((prev) => prev.slice(1));
    }
  };

  // Formatting functions
  const insertText = (
    before: string,
    after: string = "",
    placeholder: string = "",
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localText.substring(start, end);
    const replacement = selectedText || placeholder;

    const newText =
      localText.substring(0, start) +
      before +
      replacement +
      after +
      localText.substring(end);

    handleTextChange(newText);

    // Restore selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + replacement.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const formatBold = () => insertText("**", "**", "bold text");
  const formatItalic = () => insertText("*", "*", "italic text");
  const formatStrikethrough = () =>
    insertText("~~", "~~", "strikethrough text");
  const formatHeading1 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = localText.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = localText.indexOf("\n", start);
    const lineEndPos = lineEnd === -1 ? localText.length : lineEnd;
    const line = localText.substring(lineStart, lineEndPos);
    const newLine = line.startsWith("# ") ? line.substring(2) : `# ${line}`;
    const newText =
      localText.substring(0, lineStart) +
      newLine +
      localText.substring(lineEndPos);
    handleTextChange(newText);
  };
  const formatHeading2 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = localText.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = localText.indexOf("\n", start);
    const lineEndPos = lineEnd === -1 ? localText.length : lineEnd;
    const line = localText.substring(lineStart, lineEndPos);
    const newLine = line.startsWith("## ") ? line.substring(3) : `## ${line}`;
    const newText =
      localText.substring(0, lineStart) +
      newLine +
      localText.substring(lineEndPos);
    handleTextChange(newText);
  };
  const formatHeading3 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = localText.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = localText.indexOf("\n", start);
    const lineEndPos = lineEnd === -1 ? localText.length : lineEnd;
    const line = localText.substring(lineStart, lineEndPos);
    const newLine = line.startsWith("### ") ? line.substring(4) : `### ${line}`;
    const newText =
      localText.substring(0, lineStart) +
      newLine +
      localText.substring(lineEndPos);
    handleTextChange(newText);
  };
  const formatList = () => insertText("- ", "", "List item");
  const formatOrderedList = () => insertText("1. ", "", "List item");
  const formatLink = () => insertText("[", "](url)", "link text");
  const formatCode = () => insertText("`", "`", "code");
  const formatCodeBlock = () => insertText("```\n", "\n```", "code");
  const formatQuote = () => insertText("> ", "", "Quote");
  const formatHorizontalRule = () => insertText("\n---\n", "");

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === "b" && !e.shiftKey) {
        e.preventDefault();
        formatBold();
      } else if (modKey && e.key === "i" && !e.shiftKey) {
        e.preventDefault();
        formatItalic();
      } else if (modKey && e.key === "k" && !e.shiftKey) {
        e.preventDefault();
        formatLink();
      } else if (modKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (modKey && e.key === "y") ||
        (modKey && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      } else if (modKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setMode((prev) => (prev === "fullscreen" ? "normal" : "fullscreen"));
      } else if (modKey && e.key === "\\") {
        e.preventDefault();
        setMode((prev) =>
          prev === "distraction-free" ? "normal" : "distraction-free",
        );
      } else if (e.key === "F11") {
        e.preventDefault();
        setMode((prev) => (prev === "fullscreen" ? "normal" : "fullscreen"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, localText, undoIndex, redoStack]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download as file
  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptName || "script"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inline title edit
  const handleTitleClick = () => {
    if (onRename) {
      setRenameValue(scriptName || "Untitled Script");
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    if (onRename && renameValue.trim()) {
      onRename(renameValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === "Escape") {
      setRenameValue(scriptName || "Untitled Script");
      setIsEditingTitle(false);
      titleInputRef.current?.blur();
    }
  };

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?",
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  };

  const isFullscreen = mode === "fullscreen";
  const isDistractionFree = mode === "distraction-free";
  const showToolbar = !isDistractionFree;
  const showPreview = viewMode === "preview" || viewMode === "split";
  const showEditor = viewMode === "editor" || viewMode === "split";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "h-[90vh] p-0 flex flex-col border-2",
          isFullscreen && "h-[100vh] rounded-none border-0",
        )}
        style={
          {
            width: isFullscreen ? "100vw" : "98vw",
            maxWidth: isFullscreen ? "100vw" : "98vw",
            minWidth: isFullscreen ? "100vw" : "98vw",
          } as React.CSSProperties
        }
      >
        <DialogHeader
          className={cn(
            "px-4 py-3 border-b flex-shrink-0",
            isDistractionFree && "hidden",
          )}
        >
          <DialogTitle className="sr-only">
            {scriptName || "Enhanced Editor"}
          </DialogTitle>
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              {isEditingTitle && onRename ? (
                <Input
                  ref={titleInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className={cn(
                    "h-8 text-lg font-semibold bg-transparent border-0 border-b border-border/30 rounded-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border/50",
                    "px-1 py-0 placeholder:text-muted-foreground/50",
                    "w-auto min-w-[8rem] max-w-[20rem]",
                  )}
                  placeholder="Script name"
                />
              ) : (
                <button
                  type="button"
                  onClick={handleTitleClick}
                  className={cn(
                    "flex items-center gap-2 text-left min-w-0 truncate",
                    onRename &&
                      "cursor-pointer hover:text-foreground/90 outline-none rounded px-1 -mx-1",
                  )}
                  title={onRename ? "Click to rename" : undefined}
                >
                  <span className="text-lg font-semibold truncate">
                    {scriptName || "Enhanced Editor"}
                  </span>
                  {onRename && (
                    <Pencil
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 hover:opacity-100"
                      aria-hidden
                    />
                  )}
                </button>
              )}
              {!isEditingTitle && (
                <>
                  {isSaving && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Saving...
                    </span>
                  )}
                  {hasUnsavedChanges && !isSaving && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      (Unsaved)
                    </span>
                  )}
                </>
              )}
              {/* Storage indicator */}
              <div
                className={cn(
                  "flex items-center gap-1 text-xs ml-2 px-2 py-1 rounded-md",
                  storageType === "cloud"
                    ? "text-blue-500 bg-blue-500/10"
                    : "text-muted-foreground bg-muted/50",
                )}
                title={
                  storageType === "cloud" ? "Synced to cloud" : "Stored locally"
                }
              >
                {storageType === "cloud" ? (
                  <>
                    <Cloud className="h-3 w-3" />
                    <span>Cloud</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-3 w-3" />
                    <span>Local</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 pr-8">
              {/* View Mode Toggle */}
              {showToolbar && (
                <div className="flex items-center gap-0.5 border rounded-md p-0.5">
                  <Button
                    variant={viewMode === "editor" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("editor")}
                    className="h-7 w-7 p-0"
                    title="Editor only"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "split" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("split")}
                    className="h-7 w-7 p-0"
                    title="Split view"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "preview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("preview")}
                    className="h-7 w-7 p-0"
                    title="Preview only"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Text Color Picker - Compact */}
              {showToolbar && (
                <div className="flex items-center">
                  <input
                    type="color"
                    value={editorTextColor}
                    onChange={(e) => setEditorTextColor(e.target.value)}
                    className="h-7 w-10 cursor-pointer rounded border border-border bg-background"
                    title="Editor text color"
                  />
                </div>
              )}

              {/* Mode Toggle - Icon only */}
              {showToolbar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMode((prev) =>
                      prev === "fullscreen" ? "normal" : "fullscreen",
                    )
                  }
                  className="h-7 w-7 p-0"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Distraction-free toggle - Icon only */}
              {showToolbar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMode((prev) =>
                      prev === "distraction-free"
                        ? "normal"
                        : "distraction-free",
                    )
                  }
                  className="h-7 w-7 p-0"
                  title={isDistractionFree ? "Exit Focus Mode" : "Focus Mode"}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              )}

              {/* Actions - Icon only */}
              {showToolbar && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 w-7 p-0"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="h-7 w-7 p-0"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          {showToolbar && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span>Words: {wordCount}</span>
              <span>Characters: {charCount}</span>
              <span>Reading time: ~{readingTime}</span>
            </div>
          )}
        </DialogHeader>

        {/* Content tabs: Full / Bullet / Cue */}
        {showContentTabs && showToolbar && (
          <div className="px-6 py-2 border-b border-border flex gap-1">
            <Button
              variant={contentTab === "full" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setContentTab("full")}
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Full script
            </Button>
            <Button
              variant={contentTab === "bullet" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setContentTab("bullet")}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              Bullet mode
            </Button>
            <Button
              variant={contentTab === "cue" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setContentTab("cue")}
              className="gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              Cue mode
            </Button>
          </div>
        )}

        {/* Formatting Toolbar - only for full script */}
        {showToolbar && contentTab === "full" && (
          <div className="flex items-center gap-1 px-6 py-2 border-b overflow-x-auto">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={undoIndex === 0}
                className="h-8 w-8 p-0"
                title="Undo (Ctrl/Cmd+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-8 w-8 p-0"
                title="Redo (Ctrl/Cmd+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={formatBold}
                className="h-8 w-8 p-0"
                title="Bold (Ctrl/Cmd+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatItalic}
                className="h-8 w-8 p-0"
                title="Italic (Ctrl/Cmd+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatStrikethrough}
                className="h-8 w-8 p-0"
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={formatHeading1}
                className="h-8 w-8 p-0"
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatHeading2}
                className="h-8 w-8 p-0"
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatHeading3}
                className="h-8 w-8 p-0"
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={formatList}
                className="h-8 w-8 p-0"
                title="Unordered List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatOrderedList}
                className="h-8 w-8 p-0"
                title="Ordered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatLink}
                className="h-8 w-8 p-0"
                title="Link (Ctrl/Cmd+K)"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={formatCode}
                className="h-8 w-8 p-0"
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatCodeBlock}
                className="h-8 w-8 p-0"
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatQuote}
                className="h-8 w-8 p-0"
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatHorizontalRule}
                className="h-8 w-8 p-0"
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Editor and Preview Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Exit Focus Mode Button - Floating */}
          {isDistractionFree && (
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("normal")}
                className="bg-background/95 backdrop-blur-sm border-2 shadow-lg hover:bg-background h-9 px-4 gap-2"
                title="Exit Focus Mode (Ctrl/Cmd + \)"
              >
                <Zap className="h-4 w-4" />
                <span>Exit Focus Mode</span>
              </Button>
            </div>
          )}

          {/* Editor */}
          {showEditor && (
            <div
              className={cn(
                "flex flex-col",
                viewMode === "split"
                  ? "w-1/2 border-r-2 border-border"
                  : "w-full",
              )}
            >
              {viewMode === "split" && (
                <div className="px-4 py-2 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Markdown Editor
                  </span>
                </div>
              )}
              <Textarea
                ref={contentTab === "full" ? textareaRef : undefined}
                value={activeContent}
                onChange={(e) => handleActiveContentChange(e.target.value)}
                placeholder="Start writing your script...&#10;&#10;Use the toolbar above or keyboard shortcuts to format your text."
                className={cn(
                  "flex-1 resize-none font-mono text-sm border-0 rounded-none",
                  "focus:ring-0 focus-visible:ring-0",
                  isDistractionFree && "text-lg",
                )}
                style={{ color: editorTextColor }}
              />
            </div>
          )}

          {/* Preview */}
          {showPreview && (
            <div
              className={cn(
                "flex flex-col",
                viewMode === "split"
                  ? "w-1/2 border-l-2 border-border"
                  : "w-full",
              )}
            >
              {viewMode === "split" && (
                <div className="px-4 py-2 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preview
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-6 max-w-none",
                  "bg-background",
                )}
                style={{ color: editorTextColor }}
              >
                {activeContent.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p
                          style={{
                            marginBottom: "1em",
                            lineHeight: "1.6",
                            color: editorTextColor,
                          }}
                        >
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 700, color: "#fbbf24" }}>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em style={{ fontStyle: "italic", color: "#a78bfa" }}>
                          {children}
                        </em>
                      ),
                      h1: ({ children }) => (
                        <h1
                          style={{
                            fontSize: "1.8em",
                            fontWeight: 700,
                            margin: "0.75em 0",
                            color: "#60a5fa",
                          }}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontSize: "1.5em",
                            fontWeight: 700,
                            margin: "0.75em 0",
                            color: "#60a5fa",
                          }}
                        >
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3
                          style={{
                            fontSize: "1.3em",
                            fontWeight: 600,
                            margin: "0.75em 0",
                            color: "#60a5fa",
                          }}
                        >
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul
                          style={{
                            margin: "0.5em 0",
                            paddingLeft: "1.5em",
                            listStyleType: "disc",
                            color: editorTextColor,
                          }}
                        >
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol
                          style={{
                            margin: "0.5em 0",
                            paddingLeft: "1.5em",
                            listStyleType: "decimal",
                            color: editorTextColor,
                          }}
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li
                          style={{ margin: "0.25em 0", color: editorTextColor }}
                        >
                          {children}
                        </li>
                      ),
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (!inline && match) {
                          return (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        }
                        return (
                          <code
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              padding: "0.2em 0.4em",
                              borderRadius: "3px",
                              fontFamily: "monospace",
                              fontSize: "0.9em",
                              color: "#34d399",
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          style={{
                            color: "#60a5fa",
                            textDecoration: "underline",
                            textDecorationColor: "#60a5fa",
                          }}
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote
                          style={{
                            borderLeft: "3px solid rgba(255, 255, 255, 0.3)",
                            paddingLeft: "1em",
                            margin: "0.5em 0",
                            fontStyle: "italic",
                            color: "rgba(255, 255, 255, 0.6)",
                          }}
                        >
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {activeContent}
                  </ReactMarkdown>
                ) : (
                  <div className="text-muted-foreground text-center mt-20">
                    <p>Preview will appear here</p>
                    <p className="text-sm mt-2">
                      Start typing to see the markdown preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
