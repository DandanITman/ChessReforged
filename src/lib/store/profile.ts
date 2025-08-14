"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PieceSymbol } from "chess.js";
import { PIECE_COSTS, type ExtendedPieceSymbol } from "@/lib/chess/placement";
import { ProfileSync, InventorySync, DebouncedSave } from "@/lib/firebase/dataSync";
import { useAuth } from "@/contexts/AuthContext";

type Inventory = Record<ExtendedPieceSymbol, number>;

export type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0..goal
  goal: number;
  achieved: boolean;
};

export type PackReward = {
  pieces: { type: ExtendedPieceSymbol; count: number }[];
  exp: number;
  orbs: number;
};

type ProfileState = {
  credits: number;
  exp: number;
  orbs: number;
  inventory: Inventory;
  achievements: Achievement[];
  // Cosmetics ownership and equipment
  cosmeticsOwned: string[]; // list of cosmetic ids owned
  equippedCosmetics: Partial<Record<ExtendedPieceSymbol, string>>; // piece type -> cosmetic id
  // Firebase sync state
  isLoading: boolean;
  lastSyncedAt: number | null;
  // Computed
  level: number;
  // Actions
  addCredits: (n: number) => void;
  addExp: (n: number) => void;
  addOrbs: (n: number) => void;
  openBasicPack: () => { received: PackReward } | { error: string };
  openTBDPack: () => { received: PackReward } | { error: string };
  openCosmeticsPack: () => { received: PackReward } | { error: string };
  // Disassembly for orbs
  disassemblePiece: (type: ExtendedPieceSymbol, count: number) => { ok: true; gained: number } | { ok: false; reason: string };
  disassembleMany: (items: { type: ExtendedPieceSymbol; count: number }[]) => { ok: true; gained: number } | { ok: false; reason: string };
  // Cosmetics actions
  unlockCosmetic: (id: string) => void;
  equipCosmetic: (piece: ExtendedPieceSymbol, id: string) => { ok: true } | { ok: false; reason: string };
  unequipCosmetic: (piece: ExtendedPieceSymbol) => void;
  markAchieved: (id: string) => void;
  // Firebase sync actions
  syncWithFirebase: (uid: string) => Promise<void>;
  saveToFirebase: (uid: string) => Promise<void>;
};

const initialInventory: Inventory = {
  // Standard pieces (default starter set)
  p: 8, // Pawns
  n: 2, // Knights
  b: 2, // Bishops
  r: 2, // Rooks
  q: 1, // Queen
  k: 1, // King
  // Custom pieces
  l: 0, // Lion
  s: 0, // Soldier
  d: 0, // Dragon
  c: 0, // Catapult
  e: 0, // Elephant
  w: 0, // Wizard
  a: 0, // Archer
  h: 0, // Ship
  m: 0, // Knight Commander
  t: 0, // Tower Golem
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

// Create debounced save instance
const debouncedSave = new DebouncedSave();

export const useProfileStore = create<ProfileState>()(persist<ProfileState>((set, get) => ({
  credits: 500,
  exp: 300, // Start at level 4 to demonstrate budget progression
  orbs: 0,
  inventory: { ...initialInventory },
  achievements: [...initialAchievements],
  // Seed one demo cosmetic so users can try equipping immediately
  cosmeticsOwned: ["onyx-set-all"],
  equippedCosmetics: {},
  // Firebase sync state
  isLoading: false,
  lastSyncedAt: null,
  get level() {
    return calculateLevel(get().exp);
  },

  // Firebase sync methods
  async syncWithFirebase(uid: string) {
    set({ isLoading: true });
    try {
      const firebaseProfile = await ProfileSync.loadProfile(uid);
      if (firebaseProfile) {
        // Merge Firebase data with local state
        set({
          credits: firebaseProfile.credits,
          exp: firebaseProfile.level * 100 - 100, // Convert level back to exp
          orbs: firebaseProfile.orbs,
          inventory: { ...initialInventory, ...firebaseProfile.inventory } as Inventory,
          // Keep local achievements and cosmetics for now
          lastSyncedAt: Date.now(),
          isLoading: false
        });
      } else {
        // First time user - save local state to Firebase
        await get().saveToFirebase(uid);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
      set({ isLoading: false });
    }
  },

  async saveToFirebase(uid: string) {
    try {
      const state = get();
      await InventorySync.updateCurrency(uid, {
        credits: state.credits,
        orbs: state.orbs,
        exp: state.exp
      });
      await InventorySync.saveInventory(uid, state.inventory);
      set({ lastSyncedAt: Date.now() });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
  },
  addCredits(n: number) {
    set((s: ProfileState) => ({ credits: Math.max(0, s.credits + n) }));
    // Debounced Firebase save
    debouncedSave.debounce('credits', async () => {
      try {
        // Get current user from auth context if available
        const uid = getCurrentUser()?.uid;
        if (uid) {
          await InventorySync.updateCurrency(uid, { credits: get().credits });
        }
      } catch (error) {
        console.error('Error saving credits to Firebase:', error);
      }
    });
  },
  addExp(n: number) {
    set((s: ProfileState) => ({ exp: s.exp + n }));
    // Debounced Firebase save
    debouncedSave.debounce('exp', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          await InventorySync.updateCurrency(uid, { exp: get().exp });
        }
      } catch (error) {
        console.error('Error saving exp to Firebase:', error);
      }
    });
  },
  addOrbs(n: number) {
    set((s: ProfileState) => ({ orbs: s.orbs + n }));
    // Debounced Firebase save
    debouncedSave.debounce('orbs', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          await InventorySync.updateCurrency(uid, { orbs: get().orbs });
        }
      } catch (error) {
        console.error('Error saving orbs to Firebase:', error);
      }
    });
  },
  openBasicPack() {
    const cost = 100;
    const { credits } = get();
    if (credits < cost) return { error: "Not enough credits." };

    // Random 1-2 pieces, weighted towards common pieces
    const pool: ExtendedPieceSymbol[] = ["p", "p", "p", "p", "s", "s", "a", "a", "n", "n", "b", "b", "r", "q"];
    const pieces: { type: ExtendedPieceSymbol; count: number }[] = [];
    const gain: Partial<Inventory> = {};

    // Randomly decide 1 or 2 pieces (70% chance for 1, 30% chance for 2)
    const numPieces = Math.random() < 0.7 ? 1 : 2;

    for (let i = 0; i < numPieces; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      gain[pick] = (gain[pick] ?? 0) + 1;
    }

    for (const [k, v] of Object.entries(gain)) {
      pieces.push({ type: k as ExtendedPieceSymbol, count: v as number });
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

    set((s: ProfileState) => {
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

    // Save pack opening results to Firebase
    debouncedSave.debounce('pack-basic', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          const state = get();
          await InventorySync.updateCurrency(uid, {
            credits: state.credits,
            exp: state.exp,
            orbs: state.orbs
          });
          await InventorySync.saveInventory(uid, state.inventory);
        }
      } catch (error) {
        console.error('Error saving pack results to Firebase:', error);
      }
    });

    return { received: reward };
  },
  openTBDPack() {
    const cost = 250;
    const { credits } = get();
    if (credits < cost) return { error: "Not enough credits." };

    // TBD pack has better rewards - always 2 pieces, better pieces, more points
    const pool: ExtendedPieceSymbol[] = ["n", "n", "b", "b", "r", "r", "q", "q", "e", "m", "l", "c", "h"];
    const pieces: { type: ExtendedPieceSymbol; count: number }[] = [];
    const gain: Partial<Inventory> = {};

    // Always 2 pieces for TBD pack
    for (let i = 0; i < 2; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      gain[pick] = (gain[pick] ?? 0) + 1;
    }

    for (const [k, v] of Object.entries(gain)) {
      pieces.push({ type: k as ExtendedPieceSymbol, count: v as number });
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

    set((s: ProfileState) => {
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

    // Save pack opening results to Firebase
    debouncedSave.debounce('pack-tbd', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          const state = get();
          await InventorySync.updateCurrency(uid, {
            credits: state.credits,
            exp: state.exp,
            orbs: state.orbs
          });
          await InventorySync.saveInventory(uid, state.inventory);
        }
      } catch (error) {
        console.error('Error saving pack results to Firebase:', error);
      }
    });

    return { received: reward };
  },
  openCosmeticsPack() {
    // This pack is not available yet
    return { error: "This pack is coming soon!" };
  },

  // Disassemble pieces for orbs (1 orb per piece point using PIECE_COSTS)
  disassemblePiece(type: ExtendedPieceSymbol, count: number) {
    if (!type || count <= 0) return { ok: false, reason: "Invalid piece or count" };
    const { inventory } = get();
    const owned = inventory[type] ?? 0;
    if (owned < count) return { ok: false, reason: `Not enough pieces to disassemble (have ${owned}, need ${count})` };

    const gained = (PIECE_COSTS[type] ?? 0) * count;

    set((s: ProfileState) => {
      const nextInv: Inventory = { ...s.inventory, [type]: owned - count };
      return { inventory: nextInv, orbs: s.orbs + gained };
    });

    // Save disassembly results to Firebase
    debouncedSave.debounce('disassemble', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          const state = get();
          await InventorySync.updateCurrency(uid, { orbs: state.orbs });
          await InventorySync.saveInventory(uid, state.inventory);
        }
      } catch (error) {
        console.error('Error saving disassembly to Firebase:', error);
      }
    });

    return { ok: true, gained };
  },

  disassembleMany(items: { type: ExtendedPieceSymbol; count: number }[]) {
    if (!Array.isArray(items) || items.length === 0) return { ok: false, reason: "No items provided" };

    // Validate availability
    const inv = get().inventory;
    for (const { type, count } of items) {
      if (count <= 0) return { ok: false, reason: "Invalid count in request" };
      if ((inv[type] ?? 0) < count) return { ok: false, reason: `Not enough ${type} to disassemble` };
    }

    // Compute total gained
    let gained = 0;
    for (const { type, count } of items) {
      gained += (PIECE_COSTS[type] ?? 0) * count;
    }

    // Apply updates
    set((s: ProfileState) => {
      const nextInv: Inventory = { ...s.inventory };
      for (const { type, count } of items) {
        nextInv[type] = Math.max(0, (nextInv[type] ?? 0) - count);
      }
      return { inventory: nextInv, orbs: s.orbs + gained };
    });

    // Save batch disassembly results to Firebase
    debouncedSave.debounce('disassemble-batch', async () => {
      try {
        const uid = getCurrentUser()?.uid;
        if (uid) {
          const state = get();
          await InventorySync.updateCurrency(uid, { orbs: state.orbs });
          await InventorySync.saveInventory(uid, state.inventory);
        }
      } catch (error) {
        console.error('Error saving batch disassembly to Firebase:', error);
      }
    });

    return { ok: true, gained };
  },

  // Cosmetics actions
  unlockCosmetic(id: string) {
    set((s: ProfileState) => {
      if (s.cosmeticsOwned.includes(id)) return {};
      return { cosmeticsOwned: [...s.cosmeticsOwned, id] };
    });
  },
  equipCosmetic(piece: ExtendedPieceSymbol, id: string) {
    const owned = get().cosmeticsOwned.includes(id);
    if (!owned) return { ok: false as const, reason: "Cosmetic not owned" };
    set((s: ProfileState) => ({
      equippedCosmetics: { ...s.equippedCosmetics, [piece]: id }
    }));
    return { ok: true as const };
  },
  unequipCosmetic(piece: ExtendedPieceSymbol) {
    set((s: ProfileState) => {
      const next = { ...s.equippedCosmetics };
      delete next[piece];
      return { equippedCosmetics: next };
    });
  },

  markAchieved(id: string) {
    set((s: ProfileState) => ({
      achievements: s.achievements.map((a: Achievement) =>
        a.id === id ? { ...a, achieved: true, progress: a.goal } : a
      ),
    }));
  },
}), { name: "chess-reforged-profile", version: 2 }));

// Export function to set current user reference
let currentUserRef: { uid: string } | null = null;
export function setCurrentUserRef(user: { uid: string } | null) {
  currentUserRef = user;
}

// Helper function to get current user (avoid circular dependency)
function getCurrentUser(): { uid: string } | null {
  return currentUserRef;
}