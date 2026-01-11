"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EditorBackground } from "@/components/editor-background"
import { FileText, X, Edit, Clock, Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TeleprompterEditorProps {
  text: string
  onTextChange: (text: string) => void
  scrollSpeed: number
  scriptName?: string
  hasUnsavedChanges?: boolean
  isSaving?: boolean
  onRename?: (newName: string) => void
  onOpenEnhancedEditor?: () => void
}

export function TeleprompterEditor({
  text,
  onTextChange,
  scrollSpeed,
  scriptName,
  hasUnsavedChanges = false,
  isSaving = false,
  onRename,
  onOpenEnhancedEditor,
}: TeleprompterEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  const handleRenameClick = () => {
    if (onRename && scriptName) {
      setRenameValue(scriptName)
      setIsRenaming(true)
    }
  }

  const handleRenameConfirm = () => {
    if (onRename && renameValue.trim()) {
      onRename(renameValue.trim())
    }
    setIsRenaming(false)
    setRenameValue("")
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setRenameValue("")
  }

  const calculateReadingTime = (wordCount: number, speed: number): string => {
    if (wordCount === 0) return "0 sec"
    const wordsPerMinute = 175 // Average reading speed
    const baseMinutes = wordCount / wordsPerMinute
    const totalMinutes = baseMinutes / speed // Higher speed = less time needed
    
    if (totalMinutes < 1) {
      const seconds = Math.round(totalMinutes * 60)
      return `${seconds} sec`
    } else {
      const minutes = Math.floor(totalMinutes)
      const seconds = Math.round((totalMinutes - minutes) * 60)
      if (seconds === 0) {
        return `${minutes} min`
      }
      // Format as "1:14" instead of "1 min 14 sec" for more compact display
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const readingTime = React.useMemo(
    () => calculateReadingTime(wordCount, scrollSpeed),
    [wordCount, scrollSpeed]
  )

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text/plain")
    // Clean up extra whitespace and line breaks
    const cleaned = pastedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
    onTextChange(text + cleaned)
  }

  const handleClear = () => {
    onTextChange("")
    textareaRef.current?.focus()
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <EditorBackground />
      
      {/* Header */}
      <div className="relative z-20 border-b border-border/50 px-6 py-5 pr-16">
        {/* Script Name with Edit Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">
              {scriptName || "Untitled Script"}
            </h1>
            {isSaving && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">Saving...</span>
            )}
            {hasUnsavedChanges && !isSaving && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">(Unsaved)</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenEnhancedEditor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenEnhancedEditor}
                className="h-8 w-8"
                title="Open Enhanced Editor"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            {onRename && scriptName && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRenameClick}
                className="h-8 w-8"
                title="Rename script"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Script Editor Label */}
        <p className="text-xs text-muted-foreground mb-4">Script Editor</p>
        
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
          <div className="flex items-center gap-1.5 ml-auto whitespace-nowrap" title={`Reading time: ~${readingTime.includes(':') ? readingTime.replace(':', ' min ') + ' sec' : readingTime}`}>
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">~{readingTime}</span>
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
            "transition-colors"
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

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={handleRenameCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Script</DialogTitle>
            <DialogDescription>Enter a new name for this script.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm()
              } else if (e.key === "Escape") {
                handleRenameCancel()
              }
            }}
            autoFocus
            placeholder="Script name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleRenameCancel}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

