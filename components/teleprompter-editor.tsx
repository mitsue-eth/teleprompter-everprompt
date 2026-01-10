"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EditorBackground } from "@/components/editor-background"
import { FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeleprompterEditorProps {
  text: string
  onTextChange: (text: string) => void
  scrollSpeed: number
}

export function TeleprompterEditor({ text, onTextChange, scrollSpeed }: TeleprompterEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

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
      return `${minutes} min ${seconds} sec`
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
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30">
            <FileText className="w-5 h-5 text-foreground/80" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Script Editor</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Write and edit your teleprompter script</p>
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
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-muted-foreground">Reading time:</span>
            <span className="font-medium text-foreground">~{readingTime}</span>
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
    </div>
  )
}

