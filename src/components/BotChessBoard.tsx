"use client";

import React, { useState } from "react";
import { DndContext, type DragEndEvent, type DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useBotGameStore } from "@/lib/store/botGame";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { type Square, type Color, type PieceSymbol } from "chess.js";
import { cn } from "@/lib/utils";
import { SFX } from "@/lib/sound/sfx";


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
  color: Color;
  type: PieceSymbol;
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
        "absolute inset-0 flex items-center justify-center text-3xl select-none",
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

export default function BotChessBoard({ showControls = true }: { showControls?: boolean }) {
  const {
    board,
    legalMoves,
    makeMove,
    turn,
    isPlayerTurn,
    isBotThinking,
    playerColor,
    gameMode,
    getGameStatus,
    isGameOver,
    reset,
    setGameMode
  } = useBotGameStore();

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<{ from: Square; to: Square; san: string }[]>([]);
  const [dragFrom, setDragFrom] = useState<Square | null>(null);

  const boardData = board();
  const status = getGameStatus();
  const gameEnded = isGameOver();

  const canPlayerMove = gameMode === 'human-vs-human' ||
                       (gameMode === 'human-vs-bot' && isPlayerTurn && !isBotThinking);

  const handleSquareSelect = (square: Square) => {
    if (!canPlayerMove || gameEnded) return;

    const piece = boardData
      .flat()
      .find((p) => p?.square === square);

    // If clicking on a piece of the current player
    if (piece && piece.color === turn && (gameMode === 'human-vs-human' || piece.color === playerColor)) {
      setSelectedSquare(square);
      setPossibleMoves(legalMoves(square));
      SFX.select();
    }
    // If there's a selected square and clicking on a possible move
    else if (selectedSquare) {
      const moveExists = possibleMoves.some((m) => m.to === square);
      if (moveExists) {
        makeMove(selectedSquare, square);
      } else {
        SFX.illegal();
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canPlayerMove || gameEnded) return;

    const square = event.active.id as Square;
    const piece = boardData.flat().find((p) => p?.square === square);

    if (piece && piece.color === turn && (gameMode === 'human-vs-human' || piece.color === playerColor)) {
      setDragFrom(square);
      SFX.drag();
      setPossibleMoves(legalMoves(square));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canPlayerMove || gameEnded) return;

    const { over } = event;

    if (over && dragFrom) {
      const fromSquare = dragFrom;
      const toSquare = over.id as Square;

      const moveExists = possibleMoves.some((m) => m.to === toSquare);
      if (moveExists) {
        makeMove(fromSquare, toSquare);
      }
    }

    setDragFrom(null);
    setPossibleMoves([]);
    setSelectedSquare(null);
  };

  return (
    <div className="space-y-4">
      {showControls && (
        <>
          {/* Game Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => setGameMode('human-vs-human')}
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  gameMode === 'human-vs-human'
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Human vs Human
              </button>
              <button
                onClick={() => setGameMode('human-vs-bot')}
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  gameMode === 'human-vs-bot'
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Human vs Bot
              </button>
            </div>

            <button
              onClick={() => reset(playerColor)}
              className="px-3 py-1 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
            >
              New Game
            </button>

            {gameMode === 'human-vs-bot' && (
              <div className="flex gap-2">
                <button
                  onClick={() => reset('w')}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    playerColor === 'w'
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  Play as White
                </button>
                <button
                  onClick={() => reset('b')}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    playerColor === 'b'
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  Play as Black
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Game Status */}
      <div className="text-center">
        <p className={cn(
          "text-lg font-semibold",
          isBotThinking && "text-blue-600 dark:text-blue-400"
        )}>
          {status}
        </p>
      </div>

      {/* Chess Board */}
      <div className="flex justify-center">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-8 border-2 border-gray-800 dark:border-gray-200">
            {/* Rank labels (8-1) */}
            {Array.from({ length: 8 }, (_, rankIndex) => {
              const rank = 8 - rankIndex;
              return Array.from({ length: 8 }, (_, fileIndex) => {
                const square = algebraic(rankIndex, fileIndex);
                const isDark = (rankIndex + fileIndex) % 2 === 1;
                const piece = boardData[rankIndex]?.[fileIndex];

                const isPossibleMove = possibleMoves.some((m) => m.to === square);
                const isSelected = selectedSquare === square;
                const isFrom = dragFrom === square;

                const highlight = isSelected || isFrom ? "from" : isPossibleMove ? "move" : undefined;

                // Determine if this piece can be dragged
                const canDragPiece = piece &&
                  canPlayerMove &&
                  !gameEnded &&
                  piece.color === turn &&
                  (gameMode === 'human-vs-human' || piece.color === playerColor);

                return (
                  <DroppableSquare
                    key={square}
                    id={square}
                    isDark={isDark}
                    highlight={highlight}
                    onClick={() => handleSquareSelect(square)}
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

                    {piece && (
                      <DraggablePiece
                        square={piece.square}
                        color={piece.color}
                        type={piece.type}
                        selected={isSelected}
                        onSelect={handleSquareSelect}
                        disabled={!canDragPiece}
                      />
                    )}
                  </DroppableSquare>
                );
              });
            })}
          </div>
        </DndContext>
      </div>

      {gameEnded && (
        <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Game Over: {status}
          </p>
        </div>
      )}
    </div>
  );
}
