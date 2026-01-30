"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EditorBackground } from "@/components/editor-background";
import { X, Clock, Maximize2, Pencil, Cloud, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TeleprompterEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  scrollSpeed: number;
  scriptName?: string;
  storageType?: "local" | "cloud";
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onRename?: (newName: string) => void;
  /** When true, focus the title input (e.g. after creating a new script) */
  initialFocusTitle?: boolean;
  /** Called when title has been focused (consumes initialFocusTitle) */
  onTitleFocused?: () => void;
  onOpenEnhancedEditor?: () => void;
}

export function TeleprompterEditor({
  text,
  onTextChange,
  scrollSpeed,
  scriptName,
  storageType = "local",
  hasUnsavedChanges = false,
  isSaving = false,
  onRename,
  initialFocusTitle = false,
  onTitleFocused,
  onOpenEnhancedEditor,
}: TeleprompterEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // When opening after "Create new script", focus the title so user can type the name
  React.useEffect(() => {
    if (initialFocusTitle && onRename) {
      setIsEditingTitle(true);
      setRenameValue(scriptName || "Untitled Script");
      onTitleFocused?.();
    }
  }, [initialFocusTitle]); // eslint-disable-line react-hooks/exhaustive-deps -- only run when initialFocusTitle becomes true

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  const calculateReadingTime = (wordCount: number, speed: number): string => {
    if (wordCount === 0) return "0 sec";
    const wordsPerMinute = 175; // Average reading speed
    const baseMinutes = wordCount / wordsPerMinute;
    const totalMinutes = baseMinutes / speed; // Higher speed = less time needed

    if (totalMinutes < 1) {
      const seconds = Math.round(totalMinutes * 60);
      return `${seconds} sec`;
    } else {
      const minutes = Math.floor(totalMinutes);
      const seconds = Math.round((totalMinutes - minutes) * 60);
      if (seconds === 0) {
        return `${minutes} min`;
      }
      // Format as "1:14" instead of "1 min 14 sec" for more compact display
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  const readingTime = React.useMemo(
    () => calculateReadingTime(wordCount, scrollSpeed),
    [wordCount, scrollSpeed],
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain");
    // Clean up extra whitespace and line breaks
    const cleaned = pastedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n");
    onTextChange(text + cleaned);
  };

  const handleClear = () => {
    onTextChange("");
    textareaRef.current?.focus();
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <EditorBackground />

      {/* Header - pr-12 keeps title clear of sheet close (X) button */}
      <div className="relative z-20 border-b border-border/50 px-6 pr-12 py-5">
        {/* Script Name - inline editable */}
        <div className="flex items-center justify-between mb-3 gap-2 min-w-0">
          {isEditingTitle && onRename ? (
            <Input
              ref={titleInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className={cn(
                "text-xl font-semibold h-8 bg-transparent border-0 border-b border-border/30 rounded-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border/50",
                "px-1 py-0 placeholder:text-muted-foreground/50",
                "w-auto min-w-[8rem] max-w-[16rem]",
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
                  "cursor-pointer hover:text-foreground/80 outline-none rounded px-1 -mx-1",
              )}
              title={onRename ? "Click to rename" : undefined}
            >
              <span className="text-xl font-semibold truncate">
                {scriptName || "Untitled Script"}
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
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  Saving...
                </span>
              )}
              {hasUnsavedChanges && !isSaving && (
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  (Unsaved)
                </span>
              )}
            </>
          )}
        </div>

        {/* Enhanced Editor Button - Prominent placement */}
        {onOpenEnhancedEditor && (
          <div className="mb-3">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenEnhancedEditor}
              className="w-full h-9 gap-2 font-medium shadow-sm hover:shadow-md transition-all"
              title="Open Enhanced Editor (Ctrl/Cmd+E)"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Enhanced Editor</span>
            </Button>
          </div>
        )}

        {/* Script Editor Label + Storage indicator */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">Script Editor</p>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              storageType === "cloud"
                ? "text-blue-500"
                : "text-muted-foreground",
            )}
            title={
              storageType === "cloud" ? "Synced to cloud" : "Stored locally"
            }
          >
            {storageType === "cloud" ? (
              <>
                <Cloud className="h-3.5 w-3.5" />
                <span>Cloud</span>
              </>
            ) : (
              <>
                <Monitor className="h-3.5 w-3.5" />
                <span>Local</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Words:</span>
            <span className="font-medium text-foreground">{wordCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Characters:</span>
            <span className="font-medium text-foreground">{charCount}</span>
          </div>
          <div
            className="flex items-center gap-1.5 ml-auto whitespace-nowrap"
            title={`Reading time: ~${readingTime.includes(":") ? readingTime.replace(":", " min ") + " sec" : readingTime}`}
          >
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              ~{readingTime}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative z-10 flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
        <Textarea
          id="teleprompter-text"
          ref={textareaRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Enter your script here...&#10;&#10;You can paste text from any source. Line breaks and formatting will be preserved."
          className={cn(
            "flex-1 resize-none font-mono text-sm",
            "bg-background/50 border-border/50",
            "focus:bg-background focus:border-border",
            "placeholder:text-muted-foreground/50",
            "transition-colors",
          )}
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Tip: Use line breaks to control pacing
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
