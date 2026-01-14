"use client";

import * as React from "react";
import { useTeleprompterSettings } from "@/hooks/use-teleprompter-settings";
import { useTeleprompterScroll } from "@/hooks/use-teleprompter-scroll";
import { useScripts } from "@/hooks/use-scripts";
import { TeleprompterEditor } from "@/components/teleprompter-editor";
import { EnhancedScriptEditor } from "@/components/enhanced-script-editor";
import { TeleprompterDisplay } from "@/components/teleprompter-display";
import { TeleprompterControls } from "@/components/teleprompter-controls";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Maximize,
  Minimize,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScriptStatus } from "@/hooks/use-scripts";

export interface TeleprompterRef {
  openSettings: () => void;
  openEditor: () => void;
  openEnhancedEditor: () => void;
  getScriptHandlers: () => {
    scripts: ReturnType<typeof useScripts>["scripts"];
    selectedScriptId: ReturnType<typeof useScripts>["selectedScriptId"];
    onSelectScript: (id: string) => boolean;
    onCreateScript: () => void;
    onRenameScript: (id: string, name: string) => void;
    onDuplicateScript: (id: string) => void;
    onDeleteScript: (id: string) => void;
    onUpdateStatus: (id: string, status: ScriptStatus) => void;
    onOpenEnhancedEditor: (scriptId?: string) => void;
  } | null;
}

export const Teleprompter = React.forwardRef<TeleprompterRef>((props, ref) => {
  const {
    settings,
    updateSetting,
    resetSettings,
    isLoaded: settingsLoaded,
  } = useTeleprompterSettings();
  const {
    scripts,
    selectedScript,
    selectedScriptId,
    isLoaded: scriptsLoaded,
    hasUnsavedChanges,
    createScript,
    updateScriptContent,
    updateScriptName,
    updateScriptStatus,
    duplicateScript,
    deleteScript,
    selectScript,
    markUnsavedChanges,
  } = useScripts();

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isControlsOpen, setIsControlsOpen] = React.useState(false);
  const [isEnhancedEditorOpen, setIsEnhancedEditorOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isScrollingUp, setIsScrollingUp] = React.useState(false);
  const [isScrollingDown, setIsScrollingDown] = React.useState(false);
  const [isSpeedDecreasing, setIsSpeedDecreasing] = React.useState(false);
  const [isSpeedIncreasing, setIsSpeedIncreasing] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentText, setCurrentText] = React.useState("");

  const isLoaded = settingsLoaded && scriptsLoaded;

  // Get the current script text or fallback to settings.text for backward compatibility
  const displayText = selectedScript?.content ?? currentText;

  // Expose methods to parent
  React.useImperativeHandle(
    ref,
    () => ({
      openSettings: () => {
        setIsControlsOpen(true);
      },
      openEditor: () => {
        setIsEditorOpen(true);
      },
      openEnhancedEditor: () => {
        // Ensure a script is selected, if not, select the first one or create one
        if (!selectedScriptId && scripts.length > 0) {
          selectScript(scripts[0].id, false);
        } else if (!selectedScriptId && scripts.length === 0) {
          createScript();
        }
        setIsEnhancedEditorOpen(true);
      },
      getScriptHandlers: () => {
        if (!isLoaded) return null;
        return {
          scripts,
          selectedScriptId,
          onSelectScript: (id: string) => {
            const success = selectScript(id, false);
            if (!success) {
              // If there are unsaved changes, show confirmation
              const confirmed = window.confirm(
                "You have unsaved changes. Do you want to discard them and switch scripts?"
              );
              if (confirmed) {
                selectScript(id, true);
                // Open editor after switching script
                setIsEditorOpen(true);
                return true;
              }
              return false;
            }
            // Open editor when script is selected
            setIsEditorOpen(true);
            return true;
          },
          onCreateScript: () => {
            const newScript = createScript();
            // Open editor for the new script
            setIsEditorOpen(true);
            return newScript;
          },
          onRenameScript: updateScriptName,
          onDuplicateScript: (id: string) => {
            const duplicated = duplicateScript(id);
            // Open editor for the duplicated script
            if (duplicated) {
              setIsEditorOpen(true);
            }
            return duplicated;
          },
          onDeleteScript: deleteScript,
          onUpdateStatus: updateScriptStatus,
          onOpenEnhancedEditor: (scriptId?: string) => {
            // If scriptId is provided, select it first
            if (scriptId && scriptId !== selectedScriptId) {
              const success = selectScript(scriptId, false);
              if (!success) {
                const confirmed = window.confirm(
                  "You have unsaved changes. Do you want to discard them and switch scripts?"
                );
                if (confirmed) {
                  selectScript(scriptId, true);
                } else {
                  return;
                }
              }
            } else if (!selectedScriptId && scripts.length > 0) {
              // If no script selected, select the first one
              selectScript(scripts[0].id, false);
            } else if (!selectedScriptId && scripts.length === 0) {
              // If no scripts exist, create one
              createScript();
            }
            setIsEnhancedEditorOpen(true);
          },
        };
      },
    }),
    [
      isLoaded,
      scripts,
      selectedScriptId,
      selectScript,
      createScript,
      updateScriptName,
      duplicateScript,
      deleteScript,
      updateScriptStatus,
    ]
  );

  // Load selected script content when it changes
  React.useEffect(() => {
    if (selectedScript && isLoaded) {
      setCurrentText(selectedScript.content);
    } else if (!selectedScript && isLoaded && scripts.length === 0) {
      // If no scripts exist, use settings.text as fallback
      setCurrentText(settings.text);
    }
  }, [selectedScript, isLoaded, settings.text, scripts.length]);

  // Debounced auto-save
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (!isLoaded || !selectedScriptId) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(() => {
      if (selectedScriptId && currentText !== selectedScript?.content) {
        setIsSaving(true);
        updateScriptContent(selectedScriptId, currentText);
        // Clear saving indicator after a brief moment
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    currentText,
    selectedScriptId,
    selectedScript?.content,
    isLoaded,
    updateScriptContent,
  ]);

  // Ensure component is mounted on client before rendering client-only features
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fullscreen functionality
  const displayCardRef = React.useRef<HTMLDivElement>(null);

  const handleToggleFullscreen = React.useCallback(async () => {
    if (!displayCardRef.current) {
      console.error("Display card ref not available");
      return;
    }

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen - try standard API first, then fallback to vendor prefixes
        const element = displayCardRef.current;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        } else {
          console.error("Fullscreen API not supported");
          return;
        }
        // State will be updated by the fullscreenchange event listener
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        // State will be updated by the fullscreenchange event listener
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
      // Fallback: update state manually if API fails
      updateSetting("isFullscreen", !!document.fullscreenElement);
    }
  }, [updateSetting]);

  // Listen for fullscreen changes (user might exit via ESC key)
  React.useEffect(() => {
    if (!isMounted) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      // Only update if state is different to avoid unnecessary updates
      updateSetting("isFullscreen", isCurrentlyFullscreen);
    };

    // Listen for all fullscreen change events (different browsers use different prefixes)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [isMounted, updateSetting]);

  const handleScrollComplete = React.useCallback(() => {
    // Auto-pause when scrolling completes
    setIsPlaying(false);
  }, []);

  const {
    scrollPosition,
    scrollBy,
    scrollTo,
    reset,
    containerRef,
    contentRef,
  } = useTeleprompterScroll({
    text: displayText,
    speed: settings.scrollSpeed,
    mode: settings.mode,
    isPlaying,
    onComplete: handleScrollComplete,
  });

  const handlePlayPause = React.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleScrollUp = React.useCallback(() => {
    scrollBy(-50);
    setIsScrollingUp(true);
    setTimeout(() => setIsScrollingUp(false), 150);
  }, [scrollBy]);

  const handleScrollDown = React.useCallback(() => {
    scrollBy(50);
    setIsScrollingDown(true);
    setTimeout(() => setIsScrollingDown(false), 150);
  }, [scrollBy]);

  const handleSpeedIncrease = React.useCallback(() => {
    const newSpeed = Math.min(5.0, settings.scrollSpeed + 0.1);
    updateSetting("scrollSpeed", Math.round(newSpeed * 100) / 100);
    setIsSpeedIncreasing(true);
    setTimeout(() => setIsSpeedIncreasing(false), 150); // Visual feedback duration
  }, [settings.scrollSpeed, updateSetting]);

  const handleSpeedDecrease = React.useCallback(() => {
    const newSpeed = Math.max(0.1, settings.scrollSpeed - 0.1);
    updateSetting("scrollSpeed", Math.round(newSpeed * 100) / 100);
    setIsSpeedDecreasing(true);
    setTimeout(() => setIsSpeedDecreasing(false), 150); // Visual feedback duration
  }, [settings.scrollSpeed, updateSetting]);

  const handleReset = React.useCallback(() => {
    reset();
    setIsPlaying(false);
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 150); // Visual feedback duration
  }, [reset]);

  const handleWheelScroll = React.useCallback(
    (delta: number) => {
      scrollBy(delta);
    },
    [scrollBy]
  );

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+E: Open enhanced editor (works globally)
      if (modKey && e.key === "e") {
        e.preventDefault();
        // Ensure a script is selected
        if (!selectedScriptId && scripts.length > 0) {
          selectScript(scripts[0].id, false);
        } else if (!selectedScriptId && scripts.length === 0) {
          createScript();
        }
        setIsEnhancedEditorOpen(true);
        return;
      }

      // Only handle other shortcuts when panels are closed
      if (isEditorOpen || isControlsOpen) return;

      // Space bar: play/pause
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      }

      // ESC key: exit fullscreen if in fullscreen, otherwise reset script
      if (e.code === "Escape") {
        if (settings.isFullscreen) {
          e.preventDefault();
          handleToggleFullscreen();
        } else {
          e.preventDefault();
          handleReset();
        }
      }

      // Arrow keys: scroll up/down, speed left/right
      if (e.code === "ArrowUp") {
        e.preventDefault();
        handleScrollUp();
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        handleScrollDown();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSpeedDecrease();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSpeedIncrease();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isMounted,
    isEditorOpen,
    isControlsOpen,
    handlePlayPause,
    handleScrollUp,
    handleScrollDown,
    handleSpeedDecrease,
    handleSpeedIncrease,
    handleReset,
    selectedScriptId,
    scripts,
    selectScript,
    createScript,
    settings.isFullscreen,
    handleToggleFullscreen,
  ]);

  // Load panel states from localStorage
  React.useEffect(() => {
    if (isLoaded) {
      const editorState = localStorage.getItem("teleprompter-editor-open");
      const controlsState = localStorage.getItem("teleprompter-controls-open");
      if (editorState !== null) setIsEditorOpen(JSON.parse(editorState));
      if (controlsState !== null) setIsControlsOpen(JSON.parse(controlsState));
    }
  }, [isLoaded]);

  // Save panel states to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "teleprompter-editor-open",
        JSON.stringify(isEditorOpen)
      );
    }
  }, [isEditorOpen, isLoaded]);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "teleprompter-controls-open",
        JSON.stringify(isControlsOpen)
      );
    }
  }, [isControlsOpen, isLoaded]);

  // Create a script if none exist (must be before any conditional returns)
  React.useEffect(() => {
    if (isLoaded && scripts.length === 0 && !selectedScriptId) {
      createScript();
    }
  }, [isLoaded, scripts.length, selectedScriptId, createScript]);

  if (!isLoaded || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
              text={currentText}
              onTextChange={(text) => {
                setCurrentText(text);
                markUnsavedChanges();
              }}
              scrollSpeed={settings.scrollSpeed}
              scriptName={selectedScript?.name}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onRename={
                selectedScriptId
                  ? (newName: string) => {
                      updateScriptName(selectedScriptId, newName);
                    }
                  : undefined
              }
              onOpenEnhancedEditor={() => setIsEnhancedEditorOpen(true)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Enhanced Editor Modal */}
      {isMounted && (
        <EnhancedScriptEditor
          text={currentText}
          onTextChange={(text) => {
            setCurrentText(text);
            markUnsavedChanges();
          }}
          scriptName={selectedScript?.name}
          isOpen={isEnhancedEditorOpen}
          onOpenChange={setIsEnhancedEditorOpen}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          scrollSpeed={settings.scrollSpeed}
        />
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
              onResetSettings={resetSettings}
            />
          </SheetContent>
        </Sheet>
      )}

      <div className="relative flex h-[calc(100vh-var(--header-height)-3rem)] gap-4 px-4 lg:px-6">
        {/* Center Panel - Display */}
        <div ref={displayCardRef} className="relative flex-1 overflow-hidden">
          <Card className="relative h-full w-full overflow-hidden p-0">
            {/* Editor Button - positioned in top-left corner of display area */}
            {/* Hide when fullscreen or when hideButtonsDuringPlayback is enabled and playing */}
            {isMounted &&
              !isEditorOpen &&
              !settings.isFullscreen &&
              !(settings.hideButtonsDuringPlayback && isPlaying) && (
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
            {/* Hide when fullscreen or when hideButtonsDuringPlayback is enabled and playing */}
            {isMounted &&
              !isControlsOpen &&
              !settings.isFullscreen &&
              !(settings.hideButtonsDuringPlayback && isPlaying) && (
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
              text={displayText}
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
              textColor={settings.textColor}
              textOpacity={settings.textOpacity}
              lineHeight={settings.lineHeight}
              paragraphSpacing={settings.paragraphSpacing}
              onOpenEditor={() => setIsEditorOpen(true)}
              scrollSpeed={settings.scrollSpeed}
              isFullscreen={settings.isFullscreen}
            />

            {/* Floating Controls - only show when panels are closed, not fullscreen, and not hidden */}
            {isMounted &&
              !isEditorOpen &&
              !isControlsOpen &&
              !settings.isFullscreen &&
              settings.controlsPosition !== "hidden" && (
                <div
                  className={cn(
                    "absolute z-50 flex gap-2",
                    settings.controlsPosition === "left" &&
                      "left-6 top-1/2 -translate-y-1/2 flex-col",
                    settings.controlsPosition === "right" &&
                      "right-6 top-1/2 -translate-y-1/2 flex-col",
                    (settings.controlsPosition === "center" ||
                      (settings.controlsPosition !== "left" &&
                        settings.controlsPosition !== "right" &&
                        settings.controlsPosition !== "hidden")) &&
                      "bottom-6 left-1/2 -translate-x-1/2 flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-2 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg",
                      settings.controlsPosition === "left" ||
                        settings.controlsPosition === "right"
                        ? "flex-col"
                        : "flex-row items-center"
                    )}
                  >
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
                    <div className="px-1.5 py-2 text-[10px] font-medium text-foreground min-w-[2rem] text-center leading-tight">
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
                      variant={isResetting ? "default" : "outline"}
                      size="icon"
                      onClick={handleReset}
                      className={cn(
                        "h-10 w-10 transition-all",
                        isResetting && "scale-110"
                      )}
                      title="Reset (ESC)"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span className="sr-only">Reset</span>
                    </Button>

                    {/* Fullscreen Toggle Button */}
                    <Button
                      variant={settings.isFullscreen ? "default" : "outline"}
                      size="icon"
                      onClick={handleToggleFullscreen}
                      className="h-10 w-10 transition-all"
                      title={
                        settings.isFullscreen
                          ? "Exit Fullscreen (ESC)"
                          : "Enter Fullscreen"
                      }
                    >
                      {settings.isFullscreen ? (
                        <Minimize className="h-5 w-5" />
                      ) : (
                        <Maximize className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {settings.isFullscreen
                          ? "Exit Fullscreen"
                          : "Enter Fullscreen"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
          </Card>
        </div>
      </div>
    </>
  );
});

Teleprompter.displayName = "Teleprompter";
