"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Play, Pause, ChevronUp, ChevronDown, RotateCcw, Settings } from "lucide-react"
import type { TeleprompterSettings } from "@/hooks/use-teleprompter-settings"

interface TeleprompterControlsProps {
  settings: TeleprompterSettings
  onSettingChange: <K extends keyof TeleprompterSettings>(
    key: K,
    value: TeleprompterSettings[K]
  ) => void
  isPlaying: boolean
  onPlayPause: () => void
  onScrollUp: () => void
  onScrollDown: () => void
  onReset: () => void
}

export function TeleprompterControls({
  settings,
  onSettingChange,
  isPlaying,
  onPlayPause,
  onScrollUp,
  onScrollDown,
  onReset,
}: TeleprompterControlsProps) {
  // Speed range: 0.1x to 5.0x with 0.01x granularity for fine control
  const MIN_SPEED = 0.1
  const MAX_SPEED = 5.0
  const SPEED_STEP = 0.01

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-5 pr-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30">
            <Settings className="w-5 h-5 text-foreground/80" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Controls</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Adjust teleprompter settings</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Play/Pause and Mode */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="lg"
                onClick={onPlayPause}
                className="flex-1 gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Play
                  </>
                )}
              </Button>
            </div>

            <ToggleGroup
              type="single"
              value={settings.mode}
              onValueChange={(value) => {
                if (value === "auto" || value === "manual") {
                  onSettingChange("mode", value)
                }
              }}
              className="w-full"
            >
              <ToggleGroupItem value="auto" aria-label="Auto mode" className="flex-1">
                Auto
              </ToggleGroupItem>
              <ToggleGroupItem value="manual" aria-label="Manual mode" className="flex-1">
                Manual
              </ToggleGroupItem>
            </ToggleGroup>

            {settings.mode === "manual" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onScrollUp}
                  className="flex-1 gap-2"
                >
                  <ChevronUp className="h-4 w-4" />
                  Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onScrollDown}
                  className="flex-1 gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Down
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6 border-t border-border/30 pt-6">
            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="speed-slider">Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.scrollSpeed.toFixed(2)}x
                </span>
              </div>
              <Slider
                id="speed-slider"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={SPEED_STEP}
                value={[settings.scrollSpeed]}
                onValueChange={(value) => {
                  const speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, value[0]))
                  onSettingChange("scrollSpeed", Math.round(speed * 100) / 100) // Round to 2 decimal places
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{MIN_SPEED}x</span>
                <span>{MAX_SPEED}x</span>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size-slider">Font Size</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.fontSize}px
                </span>
              </div>
              <Slider
                id="font-size-slider"
                min={12}
                max={72}
                step={2}
                value={[settings.fontSize]}
                onValueChange={(value) => onSettingChange("fontSize", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12px</span>
                <span>72px</span>
              </div>
            </div>

            {/* Text Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="width-slider">Text Width</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.textWidth}%
                </span>
              </div>
              <Slider
                id="width-slider"
                min={20}
                max={100}
                step={5}
                value={[settings.textWidth]}
                onValueChange={(value) => onSettingChange("textWidth", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-3">
              <Label>Text Alignment</Label>
              <ToggleGroup
                type="single"
                value={settings.textAlign}
                onValueChange={(value) => {
                  if (value === "left" || value === "center" || value === "right" || value === "justify") {
                    onSettingChange("textAlign", value)
                  }
                }}
                className="w-full"
              >
                <ToggleGroupItem value="left" aria-label="Left align" className="flex-1">
                  Left
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Center align" className="flex-1">
                  Center
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Right align" className="flex-1">
                  Right
                </ToggleGroupItem>
                <ToggleGroupItem value="justify" aria-label="Justify" className="flex-1">
                  Justify
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Horizontal Position */}
            <div className="space-y-3">
              <Label>Horizontal Position</Label>
              <ToggleGroup
                type="single"
                value={settings.horizontalPosition}
                onValueChange={(value) => {
                  if (value === "left" || value === "center" || value === "right") {
                    // Always reset offset to 0 when switching presets
                    onSettingChange("horizontalPosition", value)
                    onSettingChange("horizontalOffset", 0)
                  }
                }}
                className="w-full"
              >
                <ToggleGroupItem value="left" aria-label="Left" className="flex-1">
                  Left
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Center" className="flex-1">
                  Center
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Right" className="flex-1">
                  Right
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="horizontal-offset-slider" className="text-sm">
                    Fine-tune
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.horizontalOffset > 0 ? "+" : ""}{settings.horizontalOffset}%
                  </span>
                </div>
                <Slider
                  id="horizontal-offset-slider"
                  min={-50}
                  max={50}
                  step={1}
                  value={[settings.horizontalOffset]}
                  onValueChange={(value) => onSettingChange("horizontalOffset", value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Vertical Position */}
            <div className="space-y-3">
              <Label>Vertical Position</Label>
              <ToggleGroup
                type="single"
                value={settings.verticalPosition}
                onValueChange={(value) => {
                  if (value === "top" || value === "center" || value === "bottom") {
                    // Always reset offset to 0 when switching presets
                    onSettingChange("verticalPosition", value)
                    onSettingChange("verticalOffset", 0)
                  }
                }}
                className="w-full"
              >
                <ToggleGroupItem value="top" aria-label="Top" className="flex-1">
                  Top
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Center" className="flex-1">
                  Center
                </ToggleGroupItem>
                <ToggleGroupItem value="bottom" aria-label="Bottom" className="flex-1">
                  Bottom
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vertical-offset-slider" className="text-sm">
                    Fine-tune
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.verticalOffset > 0 ? "+" : ""}{settings.verticalOffset}%
                  </span>
                </div>
                <Slider
                  id="vertical-offset-slider"
                  min={-50}
                  max={50}
                  step={1}
                  value={[settings.verticalOffset]}
                  onValueChange={(value) => onSettingChange("verticalOffset", value[0])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
