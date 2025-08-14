"use client";

import { create } from "zustand";
import { Chess, type Square, type Color, type PieceSymbol } from "chess.js";

export type BoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

type GameState = {
  chess: Chess;
  fen: string;
  turn: Color;
  // Derived helpers
  board(): (BoardSquare[])[];
  legalMoves(from: Square): { from: Square; to: Square; san: string }[];
  // Actions
  move(from: Square, to: Square): boolean;
  reset(fen?: string): void;
};

export const useGameStore = create<GameState>((set, get) => {
  const game = new Chess();
  return {
    chess: game,
    fen: game.fen(),
    turn: game.turn(),
    board() {
      // chess.board() returns 8 arrays (ranks 8..1) of 8 items (files a..h)
      return get().chess.board().map((rank, rankIdx) =>
        rank.map((p, fileIdx) => {
          if (!p) return null;
          // Compute algebraic square from matrix position
          const file = String.fromCharCode("a".charCodeAt(0) + fileIdx);
          const algebraic = (file + (8 - rankIdx)) as Square;
          return {
            square: algebraic,
            type: p.type,
            color: p.color,
          };
        }),
      );
    },
    legalMoves(from) {
      try {
        const moves = get()
          .chess.moves({ square: from, verbose: true })
          .map((m) => ({ from: m.from as Square, to: m.to as Square, san: m.san }));
        return moves;
      } catch {
        return [];
      }
    },
    move(from, to) {
      try {
        const m = get().chess.move({ from, to, promotion: "q" });
        if (!m) return false;
        const fen = get().chess.fen();
        const turn = get().chess.turn();
        set({ fen, turn });
        return true;
      } catch {
        return false;
      }
    },
    reset(fen?: string) {
      const current = get().chess;
      if (fen) {
        current.load(fen);
      } else {
        current.reset();
      }
      set({ fen: current.fen(), turn: current.turn() });
    },
  };
});

import type { ExtendedPieceSymbol } from "@/lib/chess/placement";

// Unicode piece glyphs for quick rendering
const GLYPHS: Record<Color, Record<ExtendedPieceSymbol, string>> = {
  w: {
    // Standard pieces
    p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔",
    // Custom pieces (using placeholder symbols)
    l: "🦁", s: "⚔", d: "🐉", c: "🏹", e: "🐘", w: "🧙", a: "🏹", h: "⛵", m: "🐎", t: "🗿"
  },
  b: {
    // Standard pieces
    p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
    // Custom pieces (using placeholder symbols)
    l: "🦁", s: "⚔", d: "🐉", c: "🏹", e: "🐘", w: "🧙", a: "🏹", h: "⛵", m: "🐎", t: "🗿"
  },
};

export function pieceGlyph(color: Color, type: ExtendedPieceSymbol): string {
  return GLYPHS[color][type] || "?";
}