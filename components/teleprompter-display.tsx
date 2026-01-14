"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Crosshair } from "@/components/crosshair";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Type, Eye, Clock } from "lucide-react";

interface TeleprompterDisplayProps {
  text: string;
  fontSize: number;
  textWidth: number;
  horizontalPosition: "left" | "center" | "right";
  verticalPosition: "top" | "center" | "bottom";
  horizontalOffset: number;
  verticalOffset: number;
  textAlign: "left" | "center" | "right" | "justify";
  scrollPosition: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onWheelScroll: (delta: number) => void;
  enableMarkdown: boolean;
  showCrosshair: boolean;
  crosshairX: number;
  crosshairY: number;
  crosshairShape: "circle" | "square" | "cross" | "dot";
  crosshairSize: number;
  crosshairColor: string;
  crosshairIntensity: number;
  textColor: string;
  textOpacity: number;
  lineHeight: number;
  paragraphSpacing: number;
  onOpenEditor?: () => void;
  showMarkdownToggle?: boolean;
  scrollSpeed?: number;
  isFullscreen?: boolean;
}

export function TeleprompterDisplay({
  text,
  fontSize,
  textWidth,
  horizontalPosition,
  verticalPosition,
  horizontalOffset,
  verticalOffset,
  textAlign,
  scrollPosition,
  containerRef,
  contentRef,
  onWheelScroll,
  enableMarkdown,
  showCrosshair,
  crosshairX,
  crosshairY,
  crosshairShape,
  crosshairSize,
  crosshairColor,
  crosshairIntensity,
  textColor,
  textOpacity,
  lineHeight = 1.6,
  paragraphSpacing = 1.0,
  onOpenEditor,
  showMarkdownToggle = true,
  scrollSpeed = 1.0,
  isFullscreen = false,
}: TeleprompterDisplayProps) {
  const [showMarkdownView, setShowMarkdownView] =
    React.useState(enableMarkdown);

  // Calculate reading time
  const calculateReadingTime = React.useCallback((text: string, speed: number): string => {
    if (!text.trim()) return "0 sec";
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount === 0) return "0 sec";
    const wordsPerMinute = 175; // Average reading speed
    const baseMinutes = wordCount / wordsPerMinute;
    const totalMinutes = baseMinutes / speed; // Higher speed = less time needed
    
    if (totalMinutes < 1) {
      const seconds = Math.round(totalMinutes * 60);
      return `${seconds} sec`;
    } else {
      const minutes = Math.floor(totalMinutes);
      const seconds = Math.round((totalMinutes - minutes) * 60);
      if (seconds === 0) {
        return `${minutes} min`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, []);

  const readingTime = React.useMemo(
    () => calculateReadingTime(text, scrollSpeed),
    [text, scrollSpeed, calculateReadingTime]
  );

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 30 : -30; // Scroll down = forward, up = backward
    onWheelScroll(delta);
  };

  const getTextAlignment = () => {
    switch (textAlign) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      case "center":
      default:
        return "text-center";
    }
  };

  const getVerticalAlignment = () => {
    switch (verticalPosition) {
      case "top":
        return "justify-start";
      case "bottom":
        return "justify-end";
      case "center":
      default:
        return "justify-center";
    }
  };

  // Get base position from preset
  const getHorizontalBasePosition = (): number => {
    switch (horizontalPosition) {
      case "left":
        return 0;
      case "center":
        return 50;
      case "right":
        return 100;
      default:
        return 50;
    }
  };

  // Calculate final horizontal position: base position + offset
  const getFinalHorizontalPosition = (): number => {
    const base = getHorizontalBasePosition();
    const final = base + horizontalOffset;
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, final));
  };

  // Calculate vertical position with offset
  // verticalOffset is 0-100, where preset buttons set it to 0, 50, or 100
  // User can then fine-tune with the slider
  const getVerticalPosition = () => {
    return verticalOffset;
  };

  // Sync local state with prop
  React.useEffect(() => {
    setShowMarkdownView(enableMarkdown);
  }, [enableMarkdown]);

  // Convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const alpha = opacity / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const textColorWithOpacity = hexToRgba(textColor, textOpacity);

  // Markdown renderer with colors
  const renderMarkdown = (text: string): React.ReactNode => {
    if (!showMarkdownView) {
      return text;
    }

    // Calculate colors based on text color
    const isDark =
      textColor.toLowerCase() === "#ffffff" ||
      textColor.toLowerCase() === "#fff";
    const strongColor = isDark ? "#fbbf24" : "#d97706"; // Amber/yellow for bold
    const emColor = isDark ? "#a78bfa" : "#7c3aed"; // Purple for italic
    const headingColor = isDark ? "#60a5fa" : "#2563eb"; // Blue for headings
    const codeBg = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const codeColor = isDark ? "#34d399" : "#059669"; // Green for code
    const linkColor = isDark ? "#60a5fa" : "#2563eb"; // Blue for links
    const blockquoteColor = isDark
      ? "rgba(255, 255, 255, 0.6)"
      : "rgba(0, 0, 0, 0.6)";
    const blockquoteBorder = isDark
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style markdown elements with colors
          p: ({ children }) => (
            <p
              style={{
                marginBottom: `${paragraphSpacing ?? 1.0}em`,
                lineHeight: lineHeight ?? 1.6,
                color: textColorWithOpacity,
              }}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: strongColor }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", color: emColor }}>{children}</em>
          ),
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: "1.8em",
                fontWeight: 700,
                margin: "0.75em 0",
                color: headingColor,
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: "1.5em",
                fontWeight: 700,
                margin: "0.75em 0",
                color: headingColor,
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                fontSize: "1.3em",
                fontWeight: 600,
                margin: "0.75em 0",
                color: headingColor,
              }}
            >
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                listStyleType: "disc",
                color: textColorWithOpacity,
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                listStyleType: "decimal",
                color: textColorWithOpacity,
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "0.25em 0", color: textColorWithOpacity }}>
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code
              style={{
                backgroundColor: codeBg,
                padding: "0.2em 0.4em",
                borderRadius: "3px",
                fontFamily: "monospace",
                fontSize: "0.9em",
                color: codeColor,
              }}
            >
              {children}
            </code>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              style={{
                color: linkColor,
                textDecoration: "underline",
                textDecorationColor: linkColor,
              }}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: `3px solid ${blockquoteBorder}`,
                paddingLeft: "1em",
                margin: "0.5em 0",
                fontStyle: "italic",
                color: blockquoteColor,
              }}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const finalHorizontalPos = getFinalHorizontalPosition();
  const verticalPos = getVerticalPosition();

  // Calculate vertical position:
  // - For center (50%), we want the first line of text to start at viewport center (50vh)
  // - For top (0%), we want text to start at top (0vh)
  // - For bottom (100%), we want text to start at bottom (100vh)
  // - Then subtract scrollPosition to move content up as we scroll
  const getVerticalBasePosition = (): number => {
    switch (verticalPosition) {
      case "top":
        return 0;
      case "center":
        return 50;
      case "bottom":
        return 100;
      default:
        return 50;
    }
  };

  const getFinalVerticalPosition = (): number => {
    const base = getVerticalBasePosition();
    const final = base + verticalOffset;
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, final));
  };

  const finalVerticalPos = getFinalVerticalPosition();

  const getVerticalTransform = () => {
    // Position from top of viewport
    // finalVerticalPos is 0-100, where 50 = center (50vh)
    // We want the top of the content to be at ${finalVerticalPos}vh
    // Then translate up by scrollPosition to scroll the content
    return `calc(${finalVerticalPos}vh - ${scrollPosition}px)`;
  };

  // Calculate horizontal position:
  // - For left (0%): left edge of text block at 0% of viewport
  // - For center (50%): center of text block at 50% of viewport
  // - For right (100%): right edge of text block at 100% of viewport
  const getHorizontalStyle = (): { left: string; transformX: string } => {
    if (finalHorizontalPos === 50) {
      // Center: position at 50% and translate by -50% to center the block
      return { left: "50%", transformX: "-50%" };
    } else if (finalHorizontalPos === 0) {
      // Left: position at 0% (left edge)
      return { left: "0%", transformX: "0%" };
    } else if (finalHorizontalPos === 100) {
      // Right: position at 100% and translate by -100% to align right edge
      return { left: "100%", transformX: "-100%" };
    } else {
      // For fine-tuned positions between presets, interpolate
      // For values < 50%, we're between left and center
      // For values > 50%, we're between center and right
      if (finalHorizontalPos < 50) {
        // Between left (0%) and center (50%)
        // Interpolate: at 0% = left:0%, at 50% = left:50% translateX(-50%)
        const ratio = finalHorizontalPos / 50;
        const leftPos = `${finalHorizontalPos}%`;
        const translateX = `${-50 * ratio}%`;
        return { left: leftPos, transformX: translateX };
      } else {
        // Between center (50%) and right (100%)
        // Interpolate: at 50% = left:50% translateX(-50%), at 100% = left:100% translateX(-100%)
        const ratio = (finalHorizontalPos - 50) / 50;
        const leftPos = `${finalHorizontalPos}%`;
        const translateX = `calc(-50% + ${-50 * ratio}%)`;
        return { left: leftPos, transformX: translateX };
      }
    }
  };

  const horizontalPosStyle = getHorizontalStyle();

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative h-full w-full overflow-hidden bg-background"
    >
      {/* Reading Time Display - Bottom Left */}
      {text && !isFullscreen && (
        <div className="absolute bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm border border-border/50 rounded-md shadow-lg">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            ~{readingTime}
          </span>
        </div>
      )}

      {/* Markdown Toggle Button */}
      {showMarkdownToggle && text && !isFullscreen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMarkdownView(!showMarkdownView)}
          className="absolute bottom-4 right-4 z-50 h-9 bg-background/90 backdrop-blur-sm border-2 hover:bg-background shadow-lg"
          title={
            showMarkdownView
              ? "Switch to simple view"
              : "Switch to markdown view"
          }
        >
          {showMarkdownView ? (
            <>
              <Type className="h-4 w-4 mr-2" />
              Simple
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Markdown
            </>
          )}
        </Button>
      )}

      {/* Crosshair Target */}
      <Crosshair
        enabled={showCrosshair}
        x={crosshairX}
        y={crosshairY}
        shape={crosshairShape}
        size={crosshairSize}
        color={crosshairColor}
        intensity={crosshairIntensity}
      />
      <div
        ref={contentRef}
        className={cn(
          "transition-transform duration-75 ease-linear absolute",
          getTextAlignment()
        )}
        style={{
          // Position horizontally based on horizontalPos
          left: horizontalPosStyle.left,
          // Position vertically: start at the calculated viewport position
          top: 0,
          transform: `translate(${
            horizontalPosStyle.transformX
          }, ${getVerticalTransform()})`,
          fontSize: `${fontSize}px`,
          maxWidth: `${textWidth}%`,
          width: "100%",
          lineHeight: lineHeight ?? 1.6,
          padding: "2rem",
          color: textColorWithOpacity,
          fontWeight: 400,
          letterSpacing: "0.01em",
          whiteSpace: "pre-wrap", // Preserve line breaks and whitespace
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {text ? (
          showMarkdownView ? (
            renderMarkdown(text)
          ) : (
            <div style={{ lineHeight: lineHeight ?? 1.6 }}>
              {text.split(/\n\s*\n/).map((paragraph, index, array) => (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      index < array.length - 1
                        ? `${paragraphSpacing ?? 1.0}em`
                        : 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {paragraph}
                </div>
              ))}
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={onOpenEditor}
            className={cn(
              "text-muted-foreground opacity-50 hover:opacity-70 hover:text-foreground",
              "transition-all cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            )}
          >
            Enter your script to begin...
          </button>
        )}
      </div>
    </div>
  );
}
