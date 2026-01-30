"use client";

import * as React from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseHeadingsFromContent } from "@/lib/parse-headings";

interface ScriptOutlineProps {
  content: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function ScriptOutline({
  content,
  contentRef,
  className,
}: ScriptOutlineProps) {
  const items = React.useMemo(
    () => parseHeadingsFromContent(content),
    [content],
  );

  const handleClick = React.useCallback(
    (index: number) => {
      const el = contentRef.current?.querySelector(`#section-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [contentRef],
  );

  if (items.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground py-4 px-3", className)}>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <List className="h-4 w-4" />
          <span className="font-medium">Outline</span>
        </div>
        <p className="text-xs">
          Add ## or ### headings in your script to see the outline.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2 px-1">
        <List className="h-4 w-4" />
        <span className="font-medium text-sm">Outline</span>
      </div>
      <nav className="space-y-0.5 max-h-[280px] overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.index}
            type="button"
            onClick={() => handleClick(item.index)}
            className={cn(
              "w-full text-left text-sm rounded px-2 py-1.5 truncate",
              "hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
              item.level === 3 && "pl-4 text-muted-foreground",
            )}
            title={`Jump to: ${item.title}`}
          >
            {item.title}
          </button>
        ))}
      </nav>
    </div>
  );
}
