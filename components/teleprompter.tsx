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
import { FileText, Settings, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TeleprompterRef {
  openSettings: () => void
}

export const Teleprompter = React.forwardRef<TeleprompterRef>((props, ref) => {
  const { settings, updateSetting, isLoaded } = useTeleprompterSettings()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isControlsOpen, setIsControlsOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [isScrollingUp, setIsScrollingUp] = React.useState(false)
  const [isScrollingDown, setIsScrollingDown] = React.useState(false)
  const [isSpeedDecreasing, setIsSpeedDecreasing] = React.useState(false)
  const [isSpeedIncreasing, setIsSpeedIncreasing] = React.useState(false)

  // Expose method to open settings panel
  React.useImperativeHandle(ref, () => ({
    openSettings: () => {
      setIsControlsOpen(true)
    },
  }), [])

  // Ensure component is mounted on client before rendering client-only features
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleScrollComplete = React.useCallback(() => {
    // Auto-pause when scrolling completes
    setIsPlaying(false)
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
    onComplete: handleScrollComplete,
  })

  const handlePlayPause = React.useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleScrollUp = React.useCallback(() => {
    scrollBy(-50)
    setIsScrollingUp(true)
    setTimeout(() => setIsScrollingUp(false), 150)
  }, [scrollBy])

  const handleScrollDown = React.useCallback(() => {
    scrollBy(50)
    setIsScrollingDown(true)
    setTimeout(() => setIsScrollingDown(false), 150)
  }, [scrollBy])

  const handleSpeedIncrease = React.useCallback(() => {
    const newSpeed = Math.min(5.0, settings.scrollSpeed + 0.1)
    updateSetting("scrollSpeed", Math.round(newSpeed * 100) / 100)
    setIsSpeedIncreasing(true)
    setTimeout(() => setIsSpeedIncreasing(false), 150) // Visual feedback duration
  }, [settings.scrollSpeed, updateSetting])

  const handleSpeedDecrease = React.useCallback(() => {
    const newSpeed = Math.max(0.1, settings.scrollSpeed - 0.1)
    updateSetting("scrollSpeed", Math.round(newSpeed * 100) / 100)
    setIsSpeedDecreasing(true)
    setTimeout(() => setIsSpeedDecreasing(false), 150) // Visual feedback duration
  }, [settings.scrollSpeed, updateSetting])

  const handleReset = React.useCallback(() => {
    reset()
    setIsPlaying(false)
  }, [reset])

  const handleWheelScroll = React.useCallback((delta: number) => {
    scrollBy(delta)
  }, [scrollBy])

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isMounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when panels are closed
      if (isEditorOpen || isControlsOpen) return

      // Don't handle if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      // Space bar: play/pause
      if (e.code === "Space") {
        e.preventDefault()
        handlePlayPause()
      }

      // Arrow keys: scroll up/down, speed left/right
      if (e.code === "ArrowUp") {
        e.preventDefault()
        handleScrollUp()
      } else if (e.code === "ArrowDown") {
        e.preventDefault()
        handleScrollDown()
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        handleSpeedDecrease()
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        handleSpeedIncrease()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMounted, isEditorOpen, isControlsOpen, handlePlayPause, handleScrollUp, handleScrollDown, handleSpeedDecrease, handleSpeedIncrease])

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
            showCrosshair={settings.showCrosshair}
            crosshairX={settings.crosshairX}
            crosshairY={settings.crosshairY}
            crosshairShape={settings.crosshairShape}
            crosshairSize={settings.crosshairSize}
            crosshairColor={settings.crosshairColor}
            crosshairIntensity={settings.crosshairIntensity}
            onOpenEditor={() => setIsEditorOpen(true)}
          />

          {/* Floating Controls - only show when panels are closed */}
          {isMounted && !isEditorOpen && !isControlsOpen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg">
                {/* Play/Pause Button */}
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-10 w-10"
                  title="Play/Pause (Space)"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span className="sr-only">Play/Pause</span>
                </Button>

                {/* Speed Decrease Button (Left Arrow) */}
                <Button
                  variant={isSpeedDecreasing ? "default" : "outline"}
                  size="icon"
                  onClick={handleSpeedDecrease}
                  className={cn(
                    "h-10 w-10 transition-all",
                    isSpeedDecreasing && "scale-110"
                  )}
                  title="Decrease Speed (←)"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Decrease Speed</span>
                </Button>

                {/* Speed Display */}
                <div className="px-3 py-2 text-sm font-medium text-foreground min-w-[3.5rem] text-center">
                  {settings.scrollSpeed.toFixed(2)}x
                </div>

                {/* Speed Increase Button (Right Arrow) */}
                <Button
                  variant={isSpeedIncreasing ? "default" : "outline"}
                  size="icon"
                  onClick={handleSpeedIncrease}
                  className={cn(
                    "h-10 w-10 transition-all",
                    isSpeedIncreasing && "scale-110"
                  )}
                  title="Increase Speed (→)"
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">Increase Speed</span>
                </Button>

                {/* Scroll Up Button */}
                <Button
                  variant={isScrollingUp ? "default" : "outline"}
                  size="icon"
                  onClick={handleScrollUp}
                  className={cn(
                    "h-10 w-10 transition-all",
                    isScrollingUp && "scale-110"
                  )}
                  title="Scroll Up (↑)"
                >
                  <ChevronUp className="h-5 w-5" />
                  <span className="sr-only">Scroll Up</span>
                </Button>

                {/* Scroll Down Button */}
                <Button
                  variant={isScrollingDown ? "default" : "outline"}
                  size="icon"
                  onClick={handleScrollDown}
                  className={cn(
                    "h-10 w-10 transition-all",
                    isScrollingDown && "scale-110"
                  )}
                  title="Scroll Down (↓)"
                >
                  <ChevronDown className="h-5 w-5" />
                  <span className="sr-only">Scroll Down</span>
                </Button>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="h-10 w-10"
                  title="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="sr-only">Reset</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
})

Teleprompter.displayName = "Teleprompter"

