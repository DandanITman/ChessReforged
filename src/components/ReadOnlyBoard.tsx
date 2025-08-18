"use client";

import React from "react";
import { Chess } from "chess.js";
import type { Color, PieceSymbol, Square } from "chess.js";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { cn } from "@/lib/utils";

function algebraic(rankIndex: number, fileIndex: number): Square {
  const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
  return (file + (8 - rankIndex)) as Square;
}

export default function ReadOnlyBoard({ fen }: { fen: string }) {
  const chess = React.useMemo(() => {
    const c = new Chess();
    try { c.load(fen); } catch {}
    return c;
  }, [fen]);

  const board = chess.board();

  return (
    <div className="inline-block">
      <div className="grid grid-cols-[1fr_repeat(8,1fr)] grid-rows-[repeat(8,1fr)_1fr] border rounded-lg shadow-lg overflow-hidden w-full max-w-[min(100vw-2rem,100vh-8rem)] aspect-square">
        {Array.from({ length: 8 }).map((_, rankIndex) => {
          const rank = 8 - rankIndex;
          return (
            <React.Fragment key={rank}>
              <div className="flex items-center justify-center text-[11px] font-medium text-black select-none">
                {rank}
              </div>
              {Array.from({ length: 8 }).map((__, fileIndex) => {
                const isDark = (rankIndex + fileIndex) % 2 === 1;
                const p = board[rankIndex]?.[fileIndex];
                const sq = algebraic(rankIndex, fileIndex);
                return (
                  <div
                    key={sq}
                    className={cn(
                      "relative aspect-square w-full",
                      isDark ? "bg-[#769656]" : "bg-[#EEEED2]"
                    )}
                  >
                    {/* File labels (a-h) - only on rank 1 */}
                    {rank === 1 && (
                      <span className="absolute bottom-0 right-0.5 text-xs font-medium opacity-80 text-black">
                        {String.fromCharCode("a".charCodeAt(0) + fileIndex)}
                      </span>
                    )}
                    {/* Rank labels (1-8) - only on file a */}
                    {fileIndex === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-xs font-medium opacity-80 text-black">
                        {rank}
                      </span>
                    )}

                    {p ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={pieceSprite(p.color as Color, p.type as PieceSymbol)}
                          alt={`${p.color === "w" ? "White" : "Black"} ${p.type}`}
                          className="w-full h-full pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,.4)]"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {/* Files axis spacer */}
        <div />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center text-[11px] font-medium text-black select-none">
            {String.fromCharCode("a".charCodeAt(0) + i)}
          </div>
        ))}
      </div>
    </div>
  );
}

