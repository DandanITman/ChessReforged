"use client";

import { create } from "zustand";
import type { Color, PieceSymbol, Square } from "chess.js";
import {
  DEFAULT_BUDGET,
  type EditorPiece,
  validatePlacement,
  canPlacePiece,
} from "@/lib/chess/placement";

type EditorState = {
  color: Color;
  budget: number;
  selectedType: PieceSymbol;
  placed: Partial<Record<Square, EditorPiece>>;

  // Derived
  validation: ReturnType<typeof validatePlacement>;

  // Actions
  setColor: (c: Color) => void;
  setBudget: (b: number) => void;
  setSelectedType: (t: PieceSymbol) => void;
  placeAt: (sq: Square) => { ok: boolean; reason?: string };
  removeAt: (sq: Square) => void;
  clear: () => void;
};

export const useEditorStore = create<EditorState>((set, get) => {
  const color: Color = "w";
  const budget = DEFAULT_BUDGET;
  const placed: Partial<Record<Square, EditorPiece>> = {};

  function computeValidation() {
    return validatePlacement({ placed: get().placed, color: get().color, budget: get().budget });
  }

  return {
    color,
    budget,
    selectedType: "p",
    placed,
    validation: validatePlacement({ placed, color, budget }),

    setColor(c) {
      set({ color: c }, false);
      set({ validation: computeValidation() });
    },
    setBudget(b) {
      set({ budget: b }, false);
      set({ validation: computeValidation() });
    },
    setSelectedType(t) {
      set({ selectedType: t });
    },
    placeAt(sq) {
      const { placed: cur, color: c, selectedType: t, budget: b } = get();
      const check = canPlacePiece({ placed: cur, color: c, budget: b, sq, type: t });
      if (!check.ok) return check;

      const next = { ...cur, [sq]: { color: c, type: t } as EditorPiece };
      set({ placed: next }, false);
      set({ validation: validatePlacement({ placed: next, color: c, budget: b }) });
      return { ok: true };
    },
    removeAt(sq) {
      const { placed: cur, color: c, budget: b } = get();
      if (!cur[sq]) return;
      const next = { ...cur };
      delete next[sq];
      set({ placed: next }, false);
      set({ validation: validatePlacement({ placed: next, color: c, budget: b }) });
    },
    clear() {
      const { color: c, budget: b } = get();
      set({ placed: {} }, false);
      set({ validation: validatePlacement({ placed: {}, color: c, budget: b }) });
    },
  };
});