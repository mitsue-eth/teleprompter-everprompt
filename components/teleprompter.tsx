"use client"

import * as React from "react"
import { useTeleprompterSettings } from "@/hooks/use-teleprompter-settings"
import { useTeleprompterScroll } from "@/hooks/use-teleprompter-scroll"
import { TeleprompterEditor } from "@/components/teleprompter-editor"
import { TeleprompterDisplay } from "@/components/teleprompter-display"
import { TeleprompterControls } from "@/components/teleprompter-controls"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function Teleprompter() {
  const { settings, updateSetting, isLoaded } = useTeleprompterSettings()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isControlsOpen, setIsControlsOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  // Ensure component is mounted on client before rendering client-only features
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    scrollPosition,
    scrollBy,
    scrollTo,
    reset,
    containerRef,
    contentRef,
  } = useTeleprompterScroll({
    text: settings.text,
    speed: settings.scrollSpeed,
    mode: settings.mode,
    isPlaying,
  })

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleScrollUp = () => {
    scrollBy(-50)
  }

  const handleScrollDown = () => {
    scrollBy(50)
  }

  const handleReset = () => {
    reset()
    setIsPlaying(false)
  }

  const handleWheelScroll = (delta: number) => {
    scrollBy(delta)
  }

  // Load panel states from localStorage
  React.useEffect(() => {
    if (isLoaded) {
      const editorState = localStorage.getItem("teleprompter-editor-open")
      const controlsState = localStorage.getItem("teleprompter-controls-open")
      if (editorState !== null) setIsEditorOpen(JSON.parse(editorState))
      if (controlsState !== null) setIsControlsOpen(JSON.parse(controlsState))
    }
  }, [isLoaded])

  // Save panel states to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("teleprompter-editor-open", JSON.stringify(isEditorOpen))
    }
  }, [isEditorOpen, isLoaded])

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("teleprompter-controls-open", JSON.stringify(isControlsOpen))
    }
  }, [isControlsOpen, isLoaded])

  if (!isLoaded || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* Editor Panel */}
      {isMounted && (
        <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Script Editor</SheetTitle>
            </SheetHeader>
            <TeleprompterEditor
              text={settings.text}
              onTextChange={(text) => updateSetting("text", text)}
              scrollSpeed={settings.scrollSpeed}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Controls Panel */}
      {isMounted && (
        <Sheet open={isControlsOpen} onOpenChange={setIsControlsOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Controls</SheetTitle>
            </SheetHeader>
            <TeleprompterControls
              settings={settings}
              onSettingChange={updateSetting}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onScrollUp={handleScrollUp}
              onScrollDown={handleScrollDown}
              onReset={handleReset}
            />
          </SheetContent>
        </Sheet>
      )}

      <div className="relative flex h-[calc(100vh-var(--header-height)-3rem)] gap-4 px-4 lg:px-6">
        {/* Center Panel - Display */}
        <Card className="relative flex-1 overflow-hidden p-0">
          {/* Editor Button - positioned in top-left corner of display area */}
          {isMounted && !isEditorOpen && (
            <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-4 z-40 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90 transition-all"
                >
                  <FileText className="h-5 w-5" />
                  <span className="sr-only">Open Editor</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          )}

          {/* Controls Button - positioned in top-right corner of display area */}
          {isMounted && !isControlsOpen && (
            <Sheet open={isControlsOpen} onOpenChange={setIsControlsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-4 z-40 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90 transition-all"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Open Controls</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          )}

          <TeleprompterDisplay
            text={settings.text}
            fontSize={settings.fontSize}
            textWidth={settings.textWidth}
            horizontalPosition={settings.horizontalPosition}
            verticalPosition={settings.verticalPosition}
            horizontalOffset={settings.horizontalOffset}
            verticalOffset={settings.verticalOffset}
            textAlign={settings.textAlign}
            scrollPosition={scrollPosition}
            containerRef={containerRef}
            contentRef={contentRef}
            onWheelScroll={handleWheelScroll}
            enableMarkdown={settings.enableMarkdown}
          />
        </Card>
      </div>
    </>
  )
}

