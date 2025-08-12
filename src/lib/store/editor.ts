"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Color, PieceSymbol, Square } from "chess.js";
import {
  DEFAULT_BUDGET,
  type EditorPiece,
  validatePlacement,
  canPlacePiece,
} from "@/lib/chess/placement";
import {
  type ArmyDeck,
  calculateBudgetForLevel,
  createEmptyDeck,
  createDefaultDecks,
  generateDeckId,
  isDeckValidForBudget,
} from "@/lib/chess/deckSystem";

type EditorState = {
  // Current editing state
  color: Color;
  selectedType: PieceSymbol;

  // Deck management
  decks: ArmyDeck[];
  currentDeckId: string | null;

  // Derived properties
  currentDeck: ArmyDeck | null;
  budget: number; // Calculated from player level
  placed: Partial<Record<Square, EditorPiece>>; // From current deck
  validation: ReturnType<typeof validatePlacement>;

  // Actions
  setColor: (c: Color) => void;
  setSelectedType: (t: PieceSymbol) => void;

  // Deck management actions
  createDeck: (name?: string, description?: string) => string;
  deleteDeck: (deckId: string) => void;
  switchToDeck: (deckId: string) => void;
  renameDeck: (deckId: string, name: string, description?: string) => void;
  duplicateDeck: (deckId: string, newName?: string) => string;

  // Piece placement actions
  placeAt: (sq: Square) => { ok: boolean; reason?: string };
  removeAt: (sq: Square) => void;
  clear: () => void;

  // Utility actions
  initializeForLevel: (level: number) => void;
  getDecksForColor: (color: Color) => ArmyDeck[];
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      // Helper functions
      function getCurrentDeck(): ArmyDeck | null {
        const { decks, currentDeckId } = get();
        return decks.find(d => d.id === currentDeckId) || null;
      }

      function updateCurrentDeck(updates: Partial<ArmyDeck>) {
        const { decks, currentDeckId } = get();
        if (!currentDeckId) return;

        const updatedDecks = decks.map(deck =>
          deck.id === currentDeckId
            ? { ...deck, ...updates, lastModified: Date.now() }
            : deck
        );

        set({ decks: updatedDecks });
      }

      function computeValidation() {
        const { placed, color, budget } = get();
        return validatePlacement({ placed, color, budget });
      }

      function computeDerivedState() {
        const state = get();
        const currentDeck = getCurrentDeck();
        const budget = calculateBudgetForLevel(1); // Will be updated by initializeForLevel
        const placed = currentDeck?.placed || {};
        const validation = validatePlacement({ placed, color: state.color, budget });

        return { currentDeck, budget, placed, validation };
      }

      // Initial state
      const initialColor: Color = "w";
      const initialDecks = createDefaultDecks(initialColor);
      const initialCurrentDeckId = initialDecks[0]?.id || null;

      return {
        // Current editing state
        color: initialColor,
        selectedType: "p",

        // Deck management
        decks: initialDecks,
        currentDeckId: initialCurrentDeckId,

        // Derived properties (will be computed)
        get currentDeck() {
          return getCurrentDeck();
        },
        budget: calculateBudgetForLevel(1), // Will be updated when level changes
        get placed() {
          return getCurrentDeck()?.placed || {};
        },
        get validation() {
          return computeValidation();
        },

        // Actions
        setColor(c) {
          // Switch to decks for the new color, create default if none exist
          const { decks } = get();
          const colorDecks = decks.filter(d => d.color === c);

          if (colorDecks.length === 0) {
            // Create default decks for this color
            const newDecks = createDefaultDecks(c);
            set({
              color: c,
              decks: [...decks, ...newDecks],
              currentDeckId: newDecks[0]?.id || null
            });
          } else {
            // Switch to first deck of this color
            set({
              color: c,
              currentDeckId: colorDecks[0].id
            });
          }
        },

        setSelectedType(t) {
          set({ selectedType: t });
        },

        // Deck management actions
        createDeck(name, description) {
          const { color, decks } = get();
          const newDeck = createEmptyDeck(color, name);
          if (description) {
            newDeck.description = description;
          }

          set({
            decks: [...decks, newDeck],
            currentDeckId: newDeck.id
          });

          return newDeck.id;
        },

        deleteDeck(deckId) {
          const { decks, currentDeckId, color } = get();
          const updatedDecks = decks.filter(d => d.id !== deckId);

          // If we're deleting the current deck, switch to another deck of the same color
          let newCurrentDeckId = currentDeckId;
          if (currentDeckId === deckId) {
            const colorDecks = updatedDecks.filter(d => d.color === color);
            newCurrentDeckId = colorDecks[0]?.id || null;

            // If no decks left for this color, create a default one
            if (!newCurrentDeckId) {
              const newDeck = createEmptyDeck(color);
              updatedDecks.push(newDeck);
              newCurrentDeckId = newDeck.id;
            }
          }

          set({
            decks: updatedDecks,
            currentDeckId: newCurrentDeckId
          });
        },

        switchToDeck(deckId) {
          const { decks } = get();
          const targetDeck = decks.find(d => d.id === deckId);
          if (targetDeck) {
            set({
              currentDeckId: deckId,
              color: targetDeck.color
            });
          }
        },

        renameDeck(deckId, name, description) {
          const { decks } = get();
          const updatedDecks = decks.map(deck =>
            deck.id === deckId
              ? {
                  ...deck,
                  name,
                  description: description || deck.description,
                  lastModified: Date.now()
                }
              : deck
          );
          set({ decks: updatedDecks });
        },

        duplicateDeck(deckId, newName) {
          const { decks } = get();
          const sourceDeck = decks.find(d => d.id === deckId);
          if (!sourceDeck) return "";

          const newDeck: ArmyDeck = {
            ...sourceDeck,
            id: generateDeckId(),
            name: newName || `${sourceDeck.name} (Copy)`,
            createdAt: Date.now(),
            lastModified: Date.now(),
          };

          set({
            decks: [...decks, newDeck],
            currentDeckId: newDeck.id
          });

          return newDeck.id;
        },

        // Piece placement actions
        placeAt(sq) {
          const { color, selectedType: t, budget } = get();
          const currentDeck = getCurrentDeck();
          if (!currentDeck) return { ok: false, reason: "No active deck" };

          const placed = currentDeck.placed;
          const check = canPlacePiece({ placed, color, budget, sq, type: t });
          if (!check.ok) return check;

          const newPlaced = { ...placed, [sq]: { color, type: t } as EditorPiece };
          updateCurrentDeck({ placed: newPlaced });
          return { ok: true };
        },

        removeAt(sq) {
          const currentDeck = getCurrentDeck();
          if (!currentDeck || !currentDeck.placed[sq]) return;

          const newPlaced = { ...currentDeck.placed };
          delete newPlaced[sq];
          updateCurrentDeck({ placed: newPlaced });
        },

        clear() {
          updateCurrentDeck({ placed: {} });
        },

        // Utility actions
        initializeForLevel(level) {
          const newBudget = calculateBudgetForLevel(level);
          set({ budget: newBudget });
        },

        getDecksForColor(color) {
          return get().decks.filter(d => d.color === color);
        },
      };
    },
    {
      name: "chess-reforged-editor",
      version: 1,
    }
  )
);