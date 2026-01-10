"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Play, Pause, ChevronUp, ChevronDown, RotateCcw } from "lucide-react"
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

const SPEED_STEPS = [0.1, 0.2, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0, 3.0, 5.0]

export function TeleprompterControls({
  settings,
  onSettingChange,
  isPlaying,
  onPlayPause,
  onScrollUp,
  onScrollDown,
  onReset,
}: TeleprompterControlsProps) {
  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0]
    // Find closest step
    const closest = SPEED_STEPS.reduce((prev, curr) =>
      Math.abs(curr - newSpeed) < Math.abs(prev - newSpeed) ? curr : prev
    )
    onSettingChange("scrollSpeed", closest)
  }

  const speedIndex = SPEED_STEPS.indexOf(settings.scrollSpeed)
  const speedSliderValue = speedIndex !== -1 ? [speedIndex] : [5] // Default to 1.0 if not found

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Controls</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

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
      </div>

      <div className="space-y-6 border-t pt-6">
        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="speed-slider">Speed</Label>
            <span className="text-sm text-muted-foreground">
              {settings.scrollSpeed}x
            </span>
          </div>
          <Slider
            id="speed-slider"
            min={0}
            max={SPEED_STEPS.length - 1}
            step={1}
            value={speedSliderValue}
            onValueChange={(value) => {
              const index = value[0]
              if (index >= 0 && index < SPEED_STEPS.length) {
                onSettingChange("scrollSpeed", SPEED_STEPS[index])
              }
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1x</span>
            <span>5.0x</span>
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

        {/* Horizontal Position */}
        <div className="space-y-3">
          <Label>Horizontal Position</Label>
          <ToggleGroup
            type="single"
            value={settings.horizontalPosition}
            onValueChange={(value) => {
              if (value === "left" || value === "center" || value === "right") {
                onSettingChange("horizontalPosition", value)
                // Update offset when preset is selected
                if (value === "left") {
                  onSettingChange("horizontalOffset", 0)
                } else if (value === "center") {
                  onSettingChange("horizontalOffset", 50)
                } else if (value === "right") {
                  onSettingChange("horizontalOffset", 100)
                }
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
                {settings.horizontalOffset}%
              </span>
            </div>
            <Slider
              id="horizontal-offset-slider"
              min={0}
              max={100}
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
                onSettingChange("verticalPosition", value)
                // Update offset when preset is selected
                if (value === "top") {
                  onSettingChange("verticalOffset", 0)
                } else if (value === "center") {
                  onSettingChange("verticalOffset", 50)
                } else if (value === "bottom") {
                  onSettingChange("verticalOffset", 100)
                }
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
                {settings.verticalOffset}%
              </span>
            </div>
            <Slider
              id="vertical-offset-slider"
              min={0}
              max={100}
              step={1}
              value={[settings.verticalOffset]}
              onValueChange={(value) => onSettingChange("verticalOffset", value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

