"use client";

import { create } from "zustand";
import type { PieceSymbol } from "chess.js";

type Inventory = Record<PieceSymbol, number>;

export type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0..goal
  goal: number;
  achieved: boolean;
};

type ProfileState = {
  credits: number;
  inventory: Inventory;
  achievements: Achievement[];
  // Actions
  addCredits: (n: number) => void;
  openBasicPack: () => { received: { type: PieceSymbol; count: number }[] } | { error: string };
  markAchieved: (id: string) => void;
};

const initialInventory: Inventory = {
  p: 0,
  n: 0,
  b: 0,
  r: 0,
  q: 0,
  k: 0,
};

const initialAchievements: Achievement[] = [
  {
    id: "first-edit",
    title: "First Edit",
    description: "Place a piece on the board in the editor.",
    progress: 0,
    goal: 1,
    achieved: false,
  },
  {
    id: "ten-moves",
    title: "Quick Hands",
    description: "Make 10 moves in Play vs Bot.",
    progress: 0,
    goal: 10,
    achieved: false,
  },
];

export const useProfileStore = create<ProfileState>((set, get) => ({
  credits: 500,
  inventory: { ...initialInventory },
  achievements: [...initialAchievements],
  addCredits(n) {
    set((s) => ({ credits: Math.max(0, s.credits + n) }));
  },
  openBasicPack() {
    const cost = 100;
    const { credits } = get();
    if (credits < cost) return { error: "Not enough credits." };

    // Random 3 drops, weighted towards common pieces
    const pool: PieceSymbol[] = ["p", "p", "p", "p", "n", "n", "b", "b", "r", "q"];
    const received: { type: PieceSymbol; count: number }[] = [];
    const gain: Partial<Inventory> = {};

    for (let i = 0; i < 3; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      gain[pick] = (gain[pick] ?? 0) + 1;
    }

    for (const [k, v] of Object.entries(gain)) {
      received.push({ type: k as PieceSymbol, count: v as number });
    }

    set((s) => {
      const nextInv: Inventory = { ...s.inventory };
      for (const { type, count } of received) {
        nextInv[type] += count;
      }
      return { credits: s.credits - cost, inventory: nextInv };
    });

    return { received };
  },
  markAchieved(id) {
    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.id === id ? { ...a, achieved: true, progress: a.goal } : a
      ),
    }));
  },
}));