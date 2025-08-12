"use client";

import React from "react";
import { DndContext, type DragEndEvent, type DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useGameStore } from "@/lib/store/game";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { Chess, type Square, type Color, type PieceSymbol } from "chess.js";
import { cn } from "@/lib/utils";

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
}: {
  square: Square;
  color: Color;
  type: PieceSymbol;
  selected: boolean;
  onSelect: (sq: Square) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: square,
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
        onSelect(square);
      }}
      className={cn(
        "absolute inset-0 flex items-center justify-center text-3xl select-none",
        "transition-transform",
        selected ? "ring-2 ring-blue-500/70 ring-offset-2 ring-offset-transparent" : "",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={style}
      aria-label={`${color === "w" ? "White" : "Black"} ${type} on ${square}`}
    >
      <img
        src={pieceSprite(color, type)}
        alt={`${color === "w" ? "White" : "Black"} ${type}`}
        className="h-10 w-10 md:h-11 md:w-11 pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,.4)]"
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

export default function ChessBoard() {
  const fen = useGameStore((s) => s.fen);
  const turn = useGameStore((s) => s.turn);
  const legalMoves = useGameStore((s) => s.legalMoves);
  const makeMove = useGameStore((s) => s.move);

  // Derive a stable board matrix from FEN so the selector does not change identity every render
  const board = React.useMemo(() => {
    const c = new Chess(fen);
    return c.board();
  }, [fen]);

  // Local UI state for selection + available moves
  const [from, setFrom] = React.useState<Square | null>(null);
  const [targets, setTargets] = React.useState<Set<Square>>(new Set());

  // Build fast lookup map: square -> piece
  const pieceAt = React.useMemo(() => {
    const map = new Map<Square, { color: Color; type: PieceSymbol }>();
    board.forEach((rank, r) => {
      rank.forEach((p, f) => {
        const sq = algebraic(r, f);
        if (p) map.set(sq, { color: p.color, type: p.type });
      });
    });
    return map;
  }, [board]);

  function selectSquare(sq: Square) {
    const piece = pieceAt.get(sq);
    if (piece && piece.color === turn) {
      const moves = legalMoves(sq).map((m) => m.to);
      setFrom(sq);
      setTargets(new Set(moves));
      return;
    }
    // If clicking a target with an active selection, make the move
    if (from && targets.has(sq)) {
      if (makeMove(from, sq)) {
        setFrom(null);
        setTargets(new Set());
      }
      return;
    }
    // Otherwise clear selection
    setFrom(null);
    setTargets(new Set());
  }

  function onDragStart(e: DragStartEvent) {
    const sq = e.active.id as Square;
    const moves = legalMoves(sq).map((m) => m.to);
    setFrom(sq);
    setTargets(new Set(moves));
  }

  function onDragEnd(e: DragEndEvent) {
    const fromSq = e.active.id as Square;
    const toSq = e.over?.id as Square | undefined;
    if (fromSq && toSq && targets.has(toSq)) {
      if (makeMove(fromSq, toSq)) {
        setFrom(null);
        setTargets(new Set());
        return;
      }
    }
    // No move performed; keep selection if same piece, else clear
    if (!toSq || toSq === fromSq) {
      return;
    }
    setFrom(null);
    setTargets(new Set());
  }

  return (
    <div className="inline-block">
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-[20px_repeat(8,56px)] grid-rows-[repeat(8,56px)_20px] border rounded-lg shadow-lg overflow-hidden">
          {Array.from({ length: 8 }).map((_, rankIndex) => {
            const rank = 8 - rankIndex;
            return (
              <React.Fragment key={rank}>
                {/* Rank label */}
                <div className="flex items-center justify-center text-[11px] font-medium text-black select-none">
                  {rank}
                </div>
                {files.map((_, fileIndex) => {
                  const sq = algebraic(rankIndex, fileIndex);
                  const p = pieceAt.get(sq);
                  const isDark = (rankIndex + fileIndex) % 2 === 1;
                  const isFrom = from === sq;
                  const isMoveTarget = targets.has(sq);
                  return (
                    <DroppableSquare
                      key={sq}
                      id={sq}
                      isDark={isDark}
                      highlight={isFrom ? "from" : isMoveTarget ? "move" : undefined}
                      onClick={() => selectSquare(sq)}
                    >
                      {p ? (
                        <DraggablePiece
                          square={sq}
                          color={p.color}
                          type={p.type}
                          selected={isFrom}
                          onSelect={(s) => selectSquare(s)}
                        />
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
            <div
              key={f}
              className="flex items-center justify-center text-[11px] font-medium text-black select-none"
            >
              {f}
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}