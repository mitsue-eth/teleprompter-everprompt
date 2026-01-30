"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SliderWithDefault } from "@/components/ui/slider-with-default";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Settings,
  ChevronDown as ChevronDownIcon,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TeleprompterSettings } from "@/hooks/use-teleprompter-settings";
import { ScriptOutline } from "@/components/script-outline";

// Default values for reset functionality
const DEFAULT_VALUES = {
  scrollSpeed: 1.0,
  fontSize: 24,
  textWidth: 80,
  textOpacity: 100,
  lineHeight: 1.6,
  paragraphSpacing: 1.0,
  horizontalOffset: 0,
  verticalOffset: 0,
  crosshairSize: 24,
  crosshairIntensity: 60,
  crosshairX: 50,
  crosshairY: 50,
};

interface TeleprompterControlsProps {
  settings: TeleprompterSettings;
  onSettingChange: <K extends keyof TeleprompterSettings>(
    key: K,
    value: TeleprompterSettings[K],
  ) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
  onReset: () => void; // Reset scroll position (for play controls)
  onResetSettings?: () => void; // Reset all settings to defaults (for settings panel)
  onExportImportClick?: () => void; // Open export/import dialog
  outlineContent?: string;
  outlineContentRef?: React.RefObject<HTMLDivElement | null>;
}

export function TeleprompterControls({
  settings,
  onSettingChange,
  isPlaying,
  onPlayPause,
  onScrollUp,
  onScrollDown,
  onReset,
  onResetSettings,
  onExportImportClick,
  outlineContent = "",
  outlineContentRef,
}: TeleprompterControlsProps) {
  const { theme, setTheme } = useTheme();

  // Speed range: 0.1x to 5.0x with 0.01x granularity for fine control
  const MIN_SPEED = 0.1;
  const MAX_SPEED = 5.0;
  const SPEED_STEP = 0.01;

  // Collapsible section states
  const [isTextOpen, setIsTextOpen] = React.useState(true);
  const [isPositionOpen, setIsPositionOpen] = React.useState(false);
  const [isCrosshairOpen, setIsCrosshairOpen] = React.useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-5 pr-16 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30">
            <Settings className="w-5 h-5 text-foreground/80" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Controls</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjust teleprompter settings
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Outline / Structure */}
          {outlineContentRef && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <ScriptOutline
                content={outlineContent}
                contentRef={outlineContentRef}
              />
            </div>
          )}

          {/* Playback Section */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground/90">
                Playback
              </h3>
            </div>
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

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="speed-slider"
                    onDoubleClick={() =>
                      onSettingChange("scrollSpeed", DEFAULT_VALUES.scrollSpeed)
                    }
                    className="cursor-pointer select-none"
                    title="Double-click to reset to default"
                  >
                    Speed
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.scrollSpeed.toFixed(2)}x
                  </span>
                </div>
                <SliderWithDefault
                  id="speed-slider"
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step={SPEED_STEP}
                  value={[settings.scrollSpeed]}
                  defaultValue={DEFAULT_VALUES.scrollSpeed}
                  onValueChange={(value) => {
                    const speed = Math.max(
                      MIN_SPEED,
                      Math.min(MAX_SPEED, value[0]),
                    );
                    onSettingChange(
                      "scrollSpeed",
                      Math.round(speed * 100) / 100,
                    );
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{MIN_SPEED}x</span>
                  <span>{MAX_SPEED}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Section */}
          <div className="space-y-3 border-t border-border/30 pt-6">
            <button
              type="button"
              onClick={() => setIsTextOpen(!isTextOpen)}
              className="flex w-full items-center justify-between text-left cursor-pointer hover:text-foreground transition-colors"
            >
              <Label className="text-base font-semibold cursor-pointer">
                Text
              </Label>
              {isTextOpen ? (
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isTextOpen && (
              <div className="space-y-6 pt-3">
                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="font-size-slider"
                      onDoubleClick={() =>
                        onSettingChange("fontSize", DEFAULT_VALUES.fontSize)
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Font Size
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.fontSize}px
                    </span>
                  </div>
                  <SliderWithDefault
                    id="font-size-slider"
                    min={12}
                    max={72}
                    step={1}
                    value={[settings.fontSize]}
                    defaultValue={DEFAULT_VALUES.fontSize}
                    onValueChange={(value) =>
                      onSettingChange("fontSize", value[0])
                    }
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
                    <Label
                      htmlFor="width-slider"
                      onDoubleClick={() =>
                        onSettingChange("textWidth", DEFAULT_VALUES.textWidth)
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Text Width
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.textWidth}%
                    </span>
                  </div>
                  <SliderWithDefault
                    id="width-slider"
                    min={10}
                    max={100}
                    step={1}
                    value={[settings.textWidth]}
                    defaultValue={DEFAULT_VALUES.textWidth}
                    onValueChange={(value) =>
                      onSettingChange("textWidth", value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-3">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: "White", value: "#ffffff" },
                      { name: "Black", value: "#000000" },
                      { name: "Blue", value: "#3b82f6" },
                      { name: "Red", value: "#ef4444" },
                      { name: "Green", value: "#22c55e" },
                      { name: "Yellow", value: "#eab308" },
                      { name: "Purple", value: "#a855f7" },
                      { name: "Orange", value: "#f97316" },
                      { name: "Pink", value: "#ec4899" },
                      { name: "Cyan", value: "#06b6d4" },
                      { name: "Lime", value: "#84cc16" },
                      { name: "Gray", value: "#94a3b8" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          onSettingChange("textColor", color.value)
                        }
                        className={cn(
                          "h-8 w-full rounded-md border-2 transition-all cursor-pointer",
                          settings.textColor === color.value
                            ? "border-foreground scale-110"
                            : "border-border hover:border-foreground/50",
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="text-color-input" className="text-sm">
                      Custom:
                    </Label>
                    <input
                      id="text-color-input"
                      type="color"
                      value={settings.textColor}
                      onChange={(e) =>
                        onSettingChange("textColor", e.target.value)
                      }
                      className="h-8 w-16 cursor-pointer rounded border border-border bg-background"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {settings.textColor}
                    </span>
                  </div>
                </div>

                {/* Text Opacity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="text-opacity-slider"
                      onDoubleClick={() =>
                        onSettingChange(
                          "textOpacity",
                          DEFAULT_VALUES.textOpacity,
                        )
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Opacity
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.textOpacity}%
                    </span>
                  </div>
                  <SliderWithDefault
                    id="text-opacity-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.textOpacity]}
                    defaultValue={DEFAULT_VALUES.textOpacity}
                    onValueChange={(value) =>
                      onSettingChange("textOpacity", value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="line-height-slider"
                      onDoubleClick={() =>
                        onSettingChange("lineHeight", DEFAULT_VALUES.lineHeight)
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Line Height
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {(settings.lineHeight ?? 1.6).toFixed(1)}x
                    </span>
                  </div>
                  <SliderWithDefault
                    id="line-height-slider"
                    min={0.8}
                    max={3.0}
                    step={0.1}
                    value={[settings.lineHeight ?? 1.6]}
                    defaultValue={DEFAULT_VALUES.lineHeight}
                    onValueChange={(value) =>
                      onSettingChange(
                        "lineHeight",
                        Math.round(value[0] * 10) / 10,
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.8x</span>
                    <span>3.0x</span>
                  </div>
                </div>

                {/* Paragraph Spacing */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="paragraph-spacing-slider"
                      onDoubleClick={() =>
                        onSettingChange(
                          "paragraphSpacing",
                          DEFAULT_VALUES.paragraphSpacing,
                        )
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Paragraph Spacing
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {(settings.paragraphSpacing ?? 1.0).toFixed(1)}em
                    </span>
                  </div>
                  <SliderWithDefault
                    id="paragraph-spacing-slider"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={[settings.paragraphSpacing ?? 1.0]}
                    defaultValue={DEFAULT_VALUES.paragraphSpacing}
                    onValueChange={(value) =>
                      onSettingChange(
                        "paragraphSpacing",
                        Math.round(value[0] * 10) / 10,
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5em</span>
                    <span>3.0em</span>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-3">
                  <Label>Text Alignment</Label>
                  <ToggleGroup
                    type="single"
                    value={settings.textAlign}
                    onValueChange={(value) => {
                      if (
                        value === "left" ||
                        value === "center" ||
                        value === "right" ||
                        value === "justify"
                      ) {
                        onSettingChange("textAlign", value);
                      }
                    }}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="left"
                      aria-label="Left align"
                      className="flex-1"
                    >
                      Left
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="center"
                      aria-label="Center align"
                      className="flex-1"
                    >
                      Center
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="right"
                      aria-label="Right align"
                      className="flex-1"
                    >
                      Right
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="justify"
                      aria-label="Justify"
                      className="flex-1"
                    >
                      Justify
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            )}
          </div>

          {/* Position Section */}
          <div className="space-y-3 border-t border-border/30 pt-6">
            <button
              type="button"
              onClick={() => setIsPositionOpen(!isPositionOpen)}
              className="flex w-full items-center justify-between text-left cursor-pointer hover:text-foreground transition-colors"
            >
              <Label className="text-base font-semibold cursor-pointer">
                Position
              </Label>
              {isPositionOpen ? (
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isPositionOpen && (
              <div className="space-y-6 pt-3">
                {/* Horizontal Position */}
                <div className="space-y-3">
                  <Label>Horizontal Position</Label>
                  <ToggleGroup
                    type="single"
                    value={settings.horizontalPosition}
                    onValueChange={(value) => {
                      if (
                        value === "left" ||
                        value === "center" ||
                        value === "right"
                      ) {
                        // Always reset offset to 0 when switching presets
                        onSettingChange("horizontalPosition", value);
                        onSettingChange("horizontalOffset", 0);
                      }
                    }}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="left"
                      aria-label="Left"
                      className="flex-1"
                    >
                      Left
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="center"
                      aria-label="Center"
                      className="flex-1"
                    >
                      Center
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="right"
                      aria-label="Right"
                      className="flex-1"
                    >
                      Right
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="horizontal-offset-slider"
                        className="text-sm cursor-pointer select-none"
                        onDoubleClick={() =>
                          onSettingChange(
                            "horizontalOffset",
                            DEFAULT_VALUES.horizontalOffset,
                          )
                        }
                        title="Double-click to reset to default"
                      >
                        Fine-tune
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {settings.horizontalOffset > 0 ? "+" : ""}
                        {settings.horizontalOffset}%
                      </span>
                    </div>
                    <SliderWithDefault
                      id="horizontal-offset-slider"
                      min={-50}
                      max={50}
                      step={1}
                      value={[settings.horizontalOffset]}
                      defaultValue={DEFAULT_VALUES.horizontalOffset}
                      onValueChange={(value) =>
                        onSettingChange("horizontalOffset", value[0])
                      }
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
                      if (
                        value === "top" ||
                        value === "center" ||
                        value === "bottom"
                      ) {
                        // Always reset offset to 0 when switching presets
                        onSettingChange("verticalPosition", value);
                        onSettingChange("verticalOffset", 0);
                      }
                    }}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="top"
                      aria-label="Top"
                      className="flex-1"
                    >
                      Top
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="center"
                      aria-label="Center"
                      className="flex-1"
                    >
                      Center
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="bottom"
                      aria-label="Bottom"
                      className="flex-1"
                    >
                      Bottom
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="vertical-offset-slider"
                        className="text-sm cursor-pointer select-none"
                        onDoubleClick={() =>
                          onSettingChange(
                            "verticalOffset",
                            DEFAULT_VALUES.verticalOffset,
                          )
                        }
                        title="Double-click to reset to default"
                      >
                        Fine-tune
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {settings.verticalOffset > 0 ? "+" : ""}
                        {settings.verticalOffset}%
                      </span>
                    </div>
                    <SliderWithDefault
                      id="vertical-offset-slider"
                      min={-50}
                      max={50}
                      step={1}
                      value={[settings.verticalOffset]}
                      defaultValue={DEFAULT_VALUES.verticalOffset}
                      onValueChange={(value) =>
                        onSettingChange("verticalOffset", value[0])
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera Target - Collapsible Section */}
          <div className="space-y-3 border-t border-border/30 pt-6">
            <div
              onClick={() => setIsCrosshairOpen(!isCrosshairOpen)}
              className="flex w-full items-center justify-between text-left cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold cursor-pointer">
                  Camera Lens Target
                </Label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={settings.showCrosshair}
                    onCheckedChange={(checked) =>
                      onSettingChange("showCrosshair", checked === true)
                    }
                  />
                </div>
              </div>
              {isCrosshairOpen ? (
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {isCrosshairOpen && settings.showCrosshair && (
              <div className="space-y-6 pt-3">
                {/* Crosshair Shape */}
                <div className="space-y-3">
                  <Label>Shape</Label>
                  <ToggleGroup
                    type="single"
                    value={settings.crosshairShape}
                    onValueChange={(value) => {
                      if (
                        value === "circle" ||
                        value === "square" ||
                        value === "cross" ||
                        value === "dot"
                      ) {
                        onSettingChange("crosshairShape", value);
                      }
                    }}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="circle"
                      aria-label="Circle"
                      className="flex-1"
                    >
                      Circle
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="square"
                      aria-label="Square"
                      className="flex-1"
                    >
                      Square
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="cross"
                      aria-label="Cross"
                      className="flex-1"
                    >
                      Cross
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="dot"
                      aria-label="Dot"
                      className="flex-1"
                    >
                      Dot
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Crosshair Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="crosshair-size-slider"
                      onDoubleClick={() =>
                        onSettingChange(
                          "crosshairSize",
                          DEFAULT_VALUES.crosshairSize,
                        )
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Size
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.crosshairSize}px
                    </span>
                  </div>
                  <SliderWithDefault
                    id="crosshair-size-slider"
                    min={10}
                    max={100}
                    step={2}
                    value={[settings.crosshairSize]}
                    defaultValue={DEFAULT_VALUES.crosshairSize}
                    onValueChange={(value) =>
                      onSettingChange("crosshairSize", value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10px</span>
                    <span>100px</span>
                  </div>
                </div>

                {/* Crosshair Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="crosshair-intensity-slider"
                      onDoubleClick={() =>
                        onSettingChange(
                          "crosshairIntensity",
                          DEFAULT_VALUES.crosshairIntensity,
                        )
                      }
                      className="cursor-pointer select-none"
                      title="Double-click to reset to default"
                    >
                      Color Intensity
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.crosshairIntensity}%
                    </span>
                  </div>
                  <SliderWithDefault
                    id="crosshair-intensity-slider"
                    min={0}
                    max={100}
                    step={5}
                    value={[settings.crosshairIntensity]}
                    defaultValue={DEFAULT_VALUES.crosshairIntensity}
                    onValueChange={(value) =>
                      onSettingChange("crosshairIntensity", value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Crosshair Color */}
                <div className="space-y-3">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: "Blue", value: "#3b82f6" },
                      { name: "Red", value: "#ef4444" },
                      { name: "Green", value: "#22c55e" },
                      { name: "Yellow", value: "#eab308" },
                      { name: "Purple", value: "#a855f7" },
                      { name: "White", value: "#ffffff" },
                      { name: "Orange", value: "#f97316" },
                      { name: "Pink", value: "#ec4899" },
                      { name: "Cyan", value: "#06b6d4" },
                      { name: "Lime", value: "#84cc16" },
                      { name: "Indigo", value: "#6366f1" },
                      { name: "Gray", value: "#94a3b8" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          onSettingChange("crosshairColor", color.value)
                        }
                        className={cn(
                          "h-8 w-full rounded-md border-2 transition-all cursor-pointer",
                          settings.crosshairColor === color.value
                            ? "border-foreground scale-110"
                            : "border-border hover:border-foreground/50",
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="crosshair-color-input" className="text-sm">
                      Custom:
                    </Label>
                    <input
                      id="crosshair-color-input"
                      type="color"
                      value={settings.crosshairColor}
                      onChange={(e) =>
                        onSettingChange("crosshairColor", e.target.value)
                      }
                      className="h-8 w-16 cursor-pointer rounded border border-border bg-background"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {settings.crosshairColor}
                    </span>
                  </div>
                </div>

                {/* Crosshair Position */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="crosshair-x-slider"
                      className="text-sm cursor-pointer select-none"
                      onDoubleClick={() =>
                        onSettingChange("crosshairX", DEFAULT_VALUES.crosshairX)
                      }
                      title="Double-click to reset to default"
                    >
                      Horizontal Position
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.crosshairX}%
                    </span>
                  </div>
                  <SliderWithDefault
                    id="crosshair-x-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.crosshairX]}
                    defaultValue={DEFAULT_VALUES.crosshairX}
                    onValueChange={(value) =>
                      onSettingChange("crosshairX", value[0])
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="crosshair-y-slider"
                      className="text-sm cursor-pointer select-none"
                      onDoubleClick={() =>
                        onSettingChange("crosshairY", DEFAULT_VALUES.crosshairY)
                      }
                      title="Double-click to reset to default"
                    >
                      Vertical Position
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.crosshairY}%
                    </span>
                  </div>
                  <SliderWithDefault
                    id="crosshair-y-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.crosshairY]}
                    defaultValue={DEFAULT_VALUES.crosshairY}
                    onValueChange={(value) =>
                      onSettingChange("crosshairY", value[0])
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4 border-t border-border/30 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
              >
                {isPreferencesOpen ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>General Preferences</span>
              </button>
            </div>
          </div>

          {isPreferencesOpen && (
            <div className="pl-6 space-y-6 border-l border-border/50">
              {/* Theme Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Theme</Label>
                <ToggleGroup
                  type="single"
                  value={theme === "light" || theme === "dark" ? theme : "dark"}
                  onValueChange={(value) => {
                    if (value === "light" || value === "dark") {
                      setTheme(value);
                    }
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="dark"
                    aria-label="Dark theme"
                    title="Use dark theme (default)"
                  >
                    Dark
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="light"
                    aria-label="Light theme"
                    title="Use light theme"
                  >
                    Light
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-muted-foreground">
                  Dark is the default, even if your system uses light mode.
                </p>
              </div>

              {/* Controls Position */}
              <div className="space-y-2">
                <Label className="text-sm">Controls Position</Label>
                <ToggleGroup
                  type="single"
                  value={settings.controlsPosition}
                  onValueChange={(value) => {
                    if (value) {
                      onSettingChange(
                        "controlsPosition",
                        value as "left" | "right" | "center" | "hidden",
                      );
                    }
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="center"
                    aria-label="Center"
                    title="Position controls centered at bottom"
                  >
                    Center
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="left"
                    aria-label="Left"
                    title="Position controls on the left side"
                  >
                    Left
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Right"
                    title="Position controls on the right side"
                  >
                    Right
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="hidden"
                    aria-label="Hidden"
                    title="Hide controls completely"
                  >
                    Hidden
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Hide Buttons During Playback */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hide-buttons-playback"
                  checked={settings.hideButtonsDuringPlayback}
                  onCheckedChange={(checked) =>
                    onSettingChange(
                      "hideButtonsDuringPlayback",
                      checked === true,
                    )
                  }
                />
                <Label
                  htmlFor="hide-buttons-playback"
                  className="text-sm font-normal cursor-pointer"
                >
                  Hide buttons during playback
                </Label>
              </div>

              {/* Export / Import */}
              {onExportImportClick && (
                <div className="space-y-2">
                  <Label className="text-sm">Data</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportImportClick}
                    className="w-full gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <Upload className="h-4 w-4" />
                    Export / Import scripts
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Download all scripts as ZIP or import from file. Your data
                    stays in your control.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reset Settings Button */}
        {onResetSettings && (
          <div className="pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetSettings}
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
