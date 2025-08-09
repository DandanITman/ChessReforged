"use client";

import React from "react";
import type { Square } from "chess.js";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/store/editor";
import { pieceGlyph } from "@/lib/store/game";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function algebraic(rankIndex: number, fileIndex: number): Square {
  const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
  const rank = 8 - rankIndex;
  return `${file}${rank}` as Square;
}

export default function EditorBoard() {
  const color = useEditorStore((s) => s.color);
  const placed = useEditorStore((s) => s.placed);
  const placeAt = useEditorStore((s) => s.placeAt);
  const removeAt = useEditorStore((s) => s.removeAt);

  // Only first two ranks per color are allowed
  function isAllowed(sq: Square): boolean {
    const r = Number(sq[1] as string);
    return color === "w" ? r === 1 || r === 2 : r === 7 || r === 8;
  }

  function onSquareClick(sq: Square, e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.button === 2 || e.shiftKey || e.metaKey || e.ctrlKey) {
      removeAt(sq);
      return;
    }
    if (!isAllowed(sq)) return;
    const res = placeAt(sq);
    if (!res.ok) {
      // no-op; Editor page shows validation messages
    }
  }

  return (
    <div className="inline-block select-none">
      <div
        className="grid grid-cols-[20px_repeat(8,48px)] grid-rows-[repeat(8,48px)_20px] border rounded-md overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {Array.from({ length: 8 }).map((_, rankIndex) => {
          const rank = 8 - rankIndex;
          return (
            <React.Fragment key={rank}>
              {/* Rank label */}
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                {rank}
              </div>
              {files.map((_, fileIndex) => {
                const sq = algebraic(rankIndex, fileIndex);
                const p = placed[sq];
                const isDark = (rankIndex + fileIndex) % 2 === 1;
                const allowed = isAllowed(sq);
                return (
                  <div
                    key={sq}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => onSquareClick(sq, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSquareClick(sq, (e as unknown) as React.MouseEvent<HTMLDivElement>);
                      }
                    }}
                    className={cn(
                      "relative size-12",
                      isDark ? "bg-zinc-700/40" : "bg-zinc-200/60",
                      allowed ? "ring-inset ring-0" : "opacity-60"
                    )}
                    aria-label={`${sq} ${allowed ? "allowed" : "not-allowed"}`}
                  >
                    {p ? (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        <span className={p.color === "w" ? "text-black" : "text-black/80 dark:text-white"}>
                          {pieceGlyph(p.color, p.type)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {/* File labels row */}
        <div />
        {files.map((f) => (
          <div key={f} className="flex items-center justify-center text-xs text-muted-foreground">
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}