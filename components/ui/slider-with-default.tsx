"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderWithDefaultProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "defaultValue"> {
  defaultValue?: number; // Our custom prop for the default indicator position
  showDefaultIndicator?: boolean;
  indicatorStyle?: "dot" | "line" | "notch" | "triangle";
}

const SliderWithDefault = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderWithDefaultProps
>(
  (
    {
      className,
      min = 0,
      max = 100,
      value,
      defaultValue,
      showDefaultIndicator = true,
      indicatorStyle = "dot",
      ...props
    },
    ref
  ) => {
    const currentValue = Array.isArray(value) ? value[0] : value;
    const defaultPercent =
      defaultValue !== undefined
        ? ((defaultValue - (min as number)) /
            ((max as number) - (min as number))) *
          100
        : undefined;

    const renderIndicator = () => {
      if (!showDefaultIndicator || defaultPercent === undefined) return null;

      const baseStyle = {
        left: `${defaultPercent}%`,
        transform: "translateX(-50%)",
      };

      switch (indicatorStyle) {
        case "dot":
          // Small circle centered with slider thumb
          // Use exact same positioning as Radix thumb: left percentage with translateX(-50%)
          // The thumb uses items-center for vertical, so we match that
          return (
            <div
              className="absolute h-2 w-2 rounded-full bg-foreground border border-background shadow-sm pointer-events-none z-10"
              style={{
                left: `${defaultPercent}%`,
                transform: "translateX(-50%)",
                borderWidth: "1px",
              }}
              title="Default value"
            />
          );
        case "notch":
          // Small notch on the track
          return (
            <div
              className="absolute -top-0.5 h-3 w-0.5 bg-muted-foreground/50 pointer-events-none z-10 rounded-full"
              style={baseStyle}
              title="Default value"
            />
          );
        case "triangle":
          // Small triangle pointing up
          return (
            <div
              className="absolute -top-2 pointer-events-none z-10"
              style={baseStyle}
              title="Default value"
            >
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-muted-foreground/50" />
            </div>
          );
        case "line":
        default:
          // Vertical line through the track
          return (
            <div
              className="absolute top-0 h-full w-0.5 bg-muted-foreground/40 pointer-events-none z-10"
              style={baseStyle}
              title="Default value"
            />
          );
      }
    };

    // Check if current value matches default (within a small tolerance for floating point)
    const isAtDefault =
      defaultValue !== undefined &&
      currentValue !== undefined &&
      Math.abs(currentValue - defaultValue) < 0.001;

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        min={min}
        max={max}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-visible rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {/* Default value indicator - show as separate element when not at default */}
        {!isAtDefault && renderIndicator()}
        <SliderPrimitive.Thumb
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
            isAtDefault &&
              showDefaultIndicator &&
              indicatorStyle === "dot" &&
              "flex items-center justify-center"
          )}
        >
          {/* Show dot inside thumb when at default value */}
          {isAtDefault && showDefaultIndicator && indicatorStyle === "dot" && (
            <div
              className="h-2 w-2 rounded-full bg-foreground border border-background shadow-sm pointer-events-none"
              style={{ borderWidth: "1px" }}
              title="Default value"
            />
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  }
);
SliderWithDefault.displayName = SliderPrimitive.Root.displayName;

export { SliderWithDefault };
