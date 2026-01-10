"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="teleprompter-text" className="text-base font-semibold">
          Script
        </Label>
        <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <div className="text-xs">
            Reading time: ~{readingTime}
          </div>
        </div>
      </div>
      <Textarea
        id="teleprompter-text"
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onPaste={handlePaste}
        placeholder="Enter your script here..."
        className="flex-1 resize-none font-mono text-sm"
      />
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}

