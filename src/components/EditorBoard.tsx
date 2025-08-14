"use client";

import React, { useState } from "react";
import type { Square } from "chess.js";
import { DndContext, type DragStartEvent, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/store/editor";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import type { ExtendedPieceSymbol } from "@/lib/chess/placement";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function algebraic(rankIndex: number, fileIndex: number): Square {
  const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
  const rank = 8 - rankIndex;
  return `${file}${rank}` as Square;
}

function DraggablePiece({
  square,
  color,
  type,
  selected,
  onSelect,
  disabled,
}: {
  square: Square;
  color: "w" | "b";
  type: ExtendedPieceSymbol;
  selected: boolean;
  onSelect: (sq: Square) => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: square,
    disabled,
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 20,
      }
    : {};

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onSelect(square);
      }}
      className={cn(
        "absolute inset-0 flex items-center justify-center text-3xl select-none group",
        "transition-transform",
        selected ? "ring-2 ring-blue-500/70 ring-offset-2 ring-offset-transparent" : "",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        disabled && "cursor-not-allowed"
      )}
      style={style}
      aria-label={`${color === "w" ? "White" : "Black"} ${type} on ${square}`}
    >
      <img
        src={pieceSprite(color, type)}
        alt={`${color === "w" ? "White" : "Black"} ${type}`}
        className="h-10 w-10 md:h-11 md:w-11 pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,.4)] levitate-on-hover"
      />
    </button>
  );
}

function DroppableSquare({
  id,
  children,
  highlight,
  isDark,
  onClick,
}: {
  id: Square;
  children?: React.ReactNode;
  highlight?: "move" | "from";
  isDark: boolean;
  onClick?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "relative size-14",
        isDark ? "bg-[#769656]" : "bg-[#EEEED2]",
        highlight === "move" && "outline outline-2 outline-sky-400/80 outline-offset-0",
        highlight === "from" && "outline outline-2 outline-emerald-400/80 outline-offset-0",
        isOver && "ring-2 ring-sky-500/60",
      )}
    >
      {children}
    </div>
  );
}

export default function EditorBoard() {
  const color = useEditorStore((s) => s.color);
  const placed = useEditorStore((s) => s.placed);
  const selectedType = useEditorStore((s) => s.selectedType);
  const placeAt = useEditorStore((s) => s.placeAt);
  const removeAt = useEditorStore((s) => s.removeAt);
  const setSelectedType = useEditorStore((s) => s.setSelectedType);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [dragFrom, setDragFrom] = useState<Square | null>(null);

  // Only first three ranks per color are allowed
  function isAllowed(sq: Square): boolean {
    const r = Number(sq[1] as string);
    return color === "w" ? r === 1 || r === 2 || r === 3 : r === 6 || r === 7 || r === 8;
  }

  function onSquareClick(sq: Square) {
    if (!isAllowed(sq)) return;
    const res = placeAt(sq);
    if (!res.ok) {
      // no-op; Editor page shows validation messages
    }
  }

  function onSquareRightClick(sq: Square, e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    removeAt(sq);
  }

  // Safe click wrapper to match DroppableSquare signature
  const handleSquareClick = (sq: Square) => () => {
    onSquareClick(sq);
  };

  function movePiece(from: Square, to: Square) {
    if (from === to) return;
    const piece = placed[from];
    if (!piece) return;
    if (!isAllowed(to)) return;

    const prevSel = selectedType;
    try {
      // Set the selected type so inventory checks use the moving piece's type
      setSelectedType(piece.type);

      // Remove first so inventory enforcement doesn't require an extra copy of the same piece when moving
      removeAt(from);

      const res = placeAt(to);
      if (!res.ok) {
        // Restore if destination placement fails
        placeAt(from);
      }
    } finally {
      setSelectedType(prevSel);
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const square = event.active.id as Square;
    const p = placed[square];
    if (!p) return;
    setDragFrom(square);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over && dragFrom) {
      const toSquare = over.id as Square;
      movePiece(dragFrom, toSquare);
    }
    setDragFrom(null);
    setSelectedSquare(null);
  };

  return (
    <div className="inline-block select-none">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          className="grid grid-cols-[20px_repeat(8,56px)] grid-rows-[repeat(8,56px)_20px] border rounded-lg shadow-lg overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          {Array.from({ length: 8 }).map((_, rankIndex) => {
            const rank = 8 - rankIndex;
            return (
              <React.Fragment key={rank}>
                {/* Rank label */}
                <div className="flex items-center justify-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {rank}
                </div>
                {files.map((_, fileIndex) => {
                  const sq = algebraic(rankIndex, fileIndex);
                  const p = placed[sq];
                  const isDark = (rankIndex + fileIndex) % 2 === 1;
                  const allowed = isAllowed(sq);
                  const isFrom = selectedSquare === sq || dragFrom === sq;
                  return (
                    <DroppableSquare
                      key={sq}
                      id={sq}
                      isDark={isDark}
                      highlight={isFrom ? "from" : undefined}
                      onClick={handleSquareClick(sq)}
                    >
                      {/* File labels (a-h) - only on rank 1 */}
                      {rank === 1 && (
                        <span className="absolute bottom-0 right-0.5 text-xs font-medium opacity-80 text-black">
                          {files[fileIndex]}
                        </span>
                      )}
                      {/* Rank labels (1-8) - only on file a */}
                      {fileIndex === 0 && (
                        <span className="absolute top-0.5 left-0.5 text-xs font-medium opacity-80 text-black">
                          {rank}
                        </span>
                      )}

                      {p ? (
                        <div
                          className={cn(
                            "absolute inset-0",
                            allowed ? "ring-2 ring-green-400/30" : ""
                          )}
                          onContextMenu={(e) => onSquareRightClick(sq, e)}
                        >
                          <DraggablePiece
                            square={sq}
                            color={p.color}
                            type={p.type}
                            selected={isFrom}
                            onSelect={(s) => setSelectedSquare(s)}
                            disabled={!allowed}
                          />
                        </div>
                      ) : null}
                    </DroppableSquare>
                  );
                })}
              </React.Fragment>
            );
          })}
          {/* File labels row */}
          <div />
          {files.map((f) => (
            <div key={f} className="flex items-center justify-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {f}
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}