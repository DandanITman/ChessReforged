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

export type PackReward = {
  pieces: { type: PieceSymbol; count: number }[];
  exp: number;
  orbs: number;
};

type ProfileState = {
  credits: number;
  exp: number;
  orbs: number;
  inventory: Inventory;
  achievements: Achievement[];
  // Computed
  level: number;
  // Actions
  addCredits: (n: number) => void;
  addExp: (n: number) => void;
  addOrbs: (n: number) => void;
  openBasicPack: () => { received: PackReward } | { error: string };
  openTBDPack: () => { received: PackReward } | { error: string };
  openCosmeticsPack: () => { received: PackReward } | { error: string };
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

// Calculate level from EXP (100 EXP per level)
function calculateLevel(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  credits: 500,
  exp: 300, // Start at level 4 to demonstrate budget progression
  orbs: 0,
  inventory: { ...initialInventory },
  achievements: [...initialAchievements],
  get level() {
    return calculateLevel(get().exp);
  },
  addCredits(n) {
    set((s) => ({ credits: Math.max(0, s.credits + n) }));
  },
  addExp(n) {
    set((s) => ({ exp: s.exp + n }));
  },
  addOrbs(n) {
    set((s) => ({ orbs: s.orbs + n }));
  },
  openBasicPack() {
    const cost = 100;
    const { credits } = get();
    if (credits < cost) return { error: "Not enough credits." };

    // Random 1-2 pieces, weighted towards common pieces
    const pool: PieceSymbol[] = ["p", "p", "p", "p", "n", "n", "b", "b", "r", "q"];
    const pieces: { type: PieceSymbol; count: number }[] = [];
    const gain: Partial<Inventory> = {};

    // Randomly decide 1 or 2 pieces (70% chance for 1, 30% chance for 2)
    const numPieces = Math.random() < 0.7 ? 1 : 2;

    for (let i = 0; i < numPieces; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      gain[pick] = (gain[pick] ?? 0) + 1;
    }

    for (const [k, v] of Object.entries(gain)) {
      pieces.push({ type: k as PieceSymbol, count: v as number });
    }

    // Generate EXP (5-15 points)
    const exp = Math.floor(Math.random() * 11) + 5;

    // Generate orbs (2-8 points)
    const orbs = Math.floor(Math.random() * 7) + 2;

    const reward: PackReward = {
      pieces,
      exp,
      orbs
    };

    set((s) => {
      const nextInv: Inventory = { ...s.inventory };
      for (const { type, count } of pieces) {
        nextInv[type] += count;
      }
      return {
        credits: s.credits - cost,
        inventory: nextInv,
        exp: s.exp + exp,
        orbs: s.orbs + orbs
      };
    });

    return { received: reward };
  },
  openTBDPack() {
    const cost = 250;
    const { credits } = get();
    if (credits < cost) return { error: "Not enough credits." };

    // TBD pack has better rewards - always 2 pieces, better pieces, more points
    const pool: PieceSymbol[] = ["n", "n", "b", "b", "r", "r", "q", "q"];
    const pieces: { type: PieceSymbol; count: number }[] = [];
    const gain: Partial<Inventory> = {};

    // Always 2 pieces for TBD pack
    for (let i = 0; i < 2; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      gain[pick] = (gain[pick] ?? 0) + 1;
    }

    for (const [k, v] of Object.entries(gain)) {
      pieces.push({ type: k as PieceSymbol, count: v as number });
    }

    // Generate higher EXP (15-30 points)
    const exp = Math.floor(Math.random() * 16) + 15;

    // Generate higher orbs (8-20 points)
    const orbs = Math.floor(Math.random() * 13) + 8;

    const reward: PackReward = {
      pieces,
      exp,
      orbs
    };

    set((s) => {
      const nextInv: Inventory = { ...s.inventory };
      for (const { type, count } of pieces) {
        nextInv[type] += count;
      }
      return {
        credits: s.credits - cost,
        inventory: nextInv,
        exp: s.exp + exp,
        orbs: s.orbs + orbs
      };
    });

    return { received: reward };
  },
  openCosmeticsPack() {
    // This pack is not available yet
    return { error: "This pack is coming soon!" };
  },
  markAchieved(id) {
    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.id === id ? { ...a, achieved: true, progress: a.goal } : a
      ),
    }));
  },
}));