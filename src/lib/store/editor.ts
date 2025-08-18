"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Color, Square } from "chess.js";
import {
  type EditorPiece,
  type ExtendedPieceSymbol,
  validatePlacement,
  canPlacePiece,
} from "@/lib/chess/placement";
import {
  type ArmyDeck,
  calculateBudgetForLevel,
  createEmptyDeck,
  createDefaultDecks,
  generateDeckId,
} from "@/lib/chess/deckSystem";
import { useProfileStore } from "@/lib/store/profile";
import { DeckSync, DebouncedSave } from "@/lib/firebase/dataSync";

type EditorState = {
  // Current editing state
  color: Color;
  selectedType: ExtendedPieceSymbol;

  // Deck management
  decks: ArmyDeck[];
  currentDeckId: string | null;

  // Firebase sync state
  isLoading: boolean;
  lastSyncedAt: number | null;

  // Derived properties
  currentDeck: ArmyDeck | null;
  budget: number; // Calculated from player level
  placed: Partial<Record<Square, EditorPiece>>; // From current deck
  validation: ReturnType<typeof validatePlacement>;

  // Actions
  setColor: (c: Color) => void;
  setSelectedType: (t: ExtendedPieceSymbol) => void;

  // Deck management actions
  createDeck: (name?: string, description?: string) => string;
  deleteDeck: (deckId: string) => void;
  switchToDeck: (deckId: string) => void;
  renameDeck: (deckId: string, name: string, description?: string) => void;
  duplicateDeck: (deckId: string, newName?: string) => string;
  saveDeck: () => void;
  setMainDeck: (deckId: string) => void;

  // Piece placement actions
  placeAt: (sq: Square) => { ok: boolean; reason?: string };
  removeAt: (sq: Square) => void;
  clear: () => void;

  // Utility actions
  initializeForLevel: (level: number) => void;
  getDecksForColor: (color: Color) => ArmyDeck[];

  // Firebase sync actions
  syncWithFirebase: (uid: string) => Promise<void>;
  saveDecksToFirebase: (uid: string) => Promise<void>;
};

// Create debounced save instance for decks
const deckDebouncedSave = new DebouncedSave();

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      // Helper functions
      function updateCurrentDeck(updates: Partial<ArmyDeck>) {
        const { decks, currentDeckId } = get();
        if (!currentDeckId) return;

        const updatedDecks = decks.map(deck =>
          deck.id === currentDeckId
            ? { ...deck, ...updates, lastModified: Date.now() }
            : deck
        );

        const updatedCurrentDeck = updatedDecks.find(d => d.id === currentDeckId) || null;
        set({
          decks: updatedDecks,
          currentDeck: updatedCurrentDeck,
          placed: updatedCurrentDeck?.placed || {}
        });
      }

      function computeValidation() {
        const { placed, color, budget } = get();
        return validatePlacement({ placed, color, budget });
      }

      // Initial state
      const initialColor: Color = "w";
      const initialDecks = [
        ...createDefaultDecks('w'),
        ...createDefaultDecks('b')
      ];
      const whiteDecks = initialDecks.filter(d => d.color === 'w');
      const initialCurrentDeckId = whiteDecks[0]?.id || null;

      return {
        // Current editing state
        color: initialColor,
        selectedType: "p",

        // Deck management
        decks: initialDecks,
        currentDeckId: initialCurrentDeckId,

        // Firebase sync state
        isLoading: false,
        lastSyncedAt: null,

        currentDeck: initialDecks.find(d => d.id === initialCurrentDeckId) || null,
        budget: calculateBudgetForLevel(1), // Will be updated when level changes
        placed: initialDecks.find(d => d.id === initialCurrentDeckId)?.placed || {},
        get validation() {
          return computeValidation();
        },

        // Firebase sync methods
        async syncWithFirebase(uid: string) {
          set({ isLoading: true });
          try {
            const firebaseDecks = await DeckSync.loadDecks(uid);
            if (firebaseDecks.length > 0) {
              // Merge Firebase decks with any local decks that don't exist in Firebase
              const { decks: localDecks, color } = get();
              const mergedDecks = [...firebaseDecks];
              
              // Add local decks that aren't in Firebase (by ID)
              const firebaseIds = new Set(firebaseDecks.map(d => d.id));
              const newLocalDecks = localDecks.filter(d => !firebaseIds.has(d.id));
              mergedDecks.push(...newLocalDecks.map(deck => ({
                ...deck,
                description: deck.description || '',
                isMain: deck.isMain || false
              })));
              
              // Find current deck for the current color
              const colorDecks = mergedDecks.filter(d => d.color === color);
              const mainDeck = colorDecks.find(d => d.isMain);
              const newCurrentDeck = mainDeck || colorDecks[0] || null;
              
              set({
                decks: mergedDecks.map(deck => ({
                  ...deck,
                  description: deck.description || '',
                  isMain: deck.isMain || false
                })),
                currentDeckId: newCurrentDeck?.id || null,
                currentDeck: newCurrentDeck ? {
                  ...newCurrentDeck,
                  description: newCurrentDeck.description || '',
                  isMain: newCurrentDeck.isMain || false
                } : null,
                placed: newCurrentDeck?.placed || {},
                lastSyncedAt: Date.now(),
                isLoading: false
              });
              
              // Save new local decks to Firebase if any
              if (newLocalDecks.length > 0) {
                await DeckSync.saveDecks(uid, mergedDecks);
              }
            } else {
              // First time user - save local decks to Firebase
              await get().saveDecksToFirebase(uid);
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error syncing decks with Firebase:', error);
            set({ isLoading: false });
          }
        },

        async saveDecksToFirebase(uid: string) {
          try {
            const { decks } = get();
            await DeckSync.saveDecks(uid, decks.map(deck => ({
              ...deck,
              description: deck.description || '',
              isMain: deck.isMain || false
            })));
            set({ lastSyncedAt: Date.now() });
          } catch (error) {
            console.error('Error saving decks to Firebase:', error);
          }
        },

        // Actions
        setColor(c) {
          // Switch to decks for the new color, create default if none exist
          const { decks } = get();
          const colorDecks = decks.filter(d => d.color === c);

          if (colorDecks.length === 0) {
            // Create default decks for this color
            const newDecks = createDefaultDecks(c);
            const newCurrentDeck = newDecks[0] || null;
            set({
              color: c,
              decks: [...decks, ...newDecks],
              currentDeckId: newCurrentDeck?.id || null,
              currentDeck: newCurrentDeck,
              placed: newCurrentDeck?.placed || {}
            });
          } else {
            // Switch to first deck of this color (prefer main deck if available)
            const mainDeck = colorDecks.find(d => d.isMain);
            const newCurrentDeck = mainDeck || colorDecks[0];
            set({
              color: c,
              currentDeckId: newCurrentDeck.id,
              currentDeck: newCurrentDeck,
              placed: newCurrentDeck.placed || {}
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

          const updatedDecks = [...decks, newDeck];
          set({
            decks: updatedDecks,
            currentDeckId: newDeck.id,
            currentDeck: newDeck,
            placed: newDeck.placed || {}
          });

          // Save new deck to Firebase
          deckDebouncedSave.debounce('create-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid) {
                await DeckSync.saveDeck(uid, {
                  ...newDeck,
                  description: newDeck.description || '',
                  isMain: newDeck.isMain || false
                });
              }
            } catch (error) {
              console.error('Error saving new deck to Firebase:', error);
            }
          });

          return newDeck.id;
        },

        deleteDeck(deckId) {
          const { decks, currentDeckId, color } = get();
          const updatedDecks = decks.filter(d => d.id !== deckId);

          // If we're deleting the current deck, switch to another deck of the same color
          let newCurrentDeckId = currentDeckId;
          let newCurrentDeck = null;
          if (currentDeckId === deckId) {
            const colorDecks = updatedDecks.filter(d => d.color === color);
            newCurrentDeckId = colorDecks[0]?.id || null;
            newCurrentDeck = colorDecks[0] || null;

            // If no decks left for this color, create a default one
            if (!newCurrentDeckId) {
              const newDeck = createEmptyDeck(color);
              updatedDecks.push(newDeck);
              newCurrentDeckId = newDeck.id;
              newCurrentDeck = newDeck;
            }
          } else {
            newCurrentDeck = updatedDecks.find(d => d.id === newCurrentDeckId) || null;
          }

          set({
            decks: updatedDecks,
            currentDeckId: newCurrentDeckId,
            currentDeck: newCurrentDeck,
            placed: newCurrentDeck?.placed || {}
          });

          // Save updated decks to Firebase
          deckDebouncedSave.debounce('delete-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid) {
                await DeckSync.saveDecks(uid, updatedDecks.map(deck => ({
                  ...deck,
                  description: deck.description || '',
                  isMain: deck.isMain || false
                })));
              }
            } catch (error) {
              console.error('Error saving after deck deletion to Firebase:', error);
            }
          });
        },

        switchToDeck(deckId) {
          const { decks } = get();
          const targetDeck = decks.find(d => d.id === deckId);
          
          if (targetDeck) {
            set({
              currentDeckId: deckId,
              currentDeck: targetDeck,
              placed: targetDeck.placed || {}
            });
          } else {
            console.error('Deck not found:', deckId);
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

          // Save renamed deck to Firebase
          deckDebouncedSave.debounce('rename-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid) {
                const renamedDeck = updatedDecks.find(d => d.id === deckId);
                if (renamedDeck) {
                  await DeckSync.saveDeck(uid, {
                    ...renamedDeck,
                    description: renamedDeck.description || '',
                    isMain: renamedDeck.isMain || false
                  });
                }
              }
            } catch (error) {
              console.error('Error saving renamed deck to Firebase:', error);
            }
          });
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
            currentDeckId: newDeck.id,
            currentDeck: newDeck
          });

          // Save duplicated deck to Firebase
          deckDebouncedSave.debounce('duplicate-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid) {
                await DeckSync.saveDeck(uid, {
                  ...newDeck,
                  description: newDeck.description || '',
                  isMain: newDeck.isMain || false
                });
              }
            } catch (error) {
              console.error('Error saving duplicated deck to Firebase:', error);
            }
          });

          return newDeck.id;
        },

        // Piece placement actions
        placeAt(sq) {
          const { color, selectedType: t, budget, currentDeck } = get();
          if (!currentDeck) return { ok: false, reason: "No active deck" };

          const placed = currentDeck.placed;

          // Inventory constraint: cannot place more pieces of a type than owned
          try {
            const inv = useProfileStore.getState().inventory;
            const available = inv?.[t] ?? 0;
            const used = Object.values(placed).filter(
              (p) => p && p.color === color && p.type === t
            ).length;
            if (used >= available) {
              return { ok: false, reason: `Not enough inventory for '${t}' pieces (${used}/${available}).` };
            }
          } catch {
            // If profile store isn't accessible for any reason, fall back to allowing placement
          }

          const check = canPlacePiece({ placed, color, budget, sq, type: t });
          if (!check.ok) return check;

          const newPlaced = { ...placed, [sq]: { color, type: t } as EditorPiece };
          updateCurrentDeck({ placed: newPlaced });
          
          // Track army creation achievements
          try {
            const profileStore = useProfileStore.getState();
            profileStore.trackArmyCreation();
          } catch {
            // Ignore if profile store not available
          }
          
          return { ok: true };
        },

        removeAt(sq) {
          const { currentDeck } = get();
          if (!currentDeck || !currentDeck.placed[sq]) return;

          const newPlaced = { ...currentDeck.placed };
          delete newPlaced[sq];
          updateCurrentDeck({ placed: newPlaced });
        },

        clear() {
          updateCurrentDeck({ placed: {} });
        },

        saveDeck() {
          const { currentDeck } = get();
          if (!currentDeck) return;

          // Update the last modified timestamp to indicate save
          updateCurrentDeck({ lastModified: Date.now() });

          // Save current deck to Firebase
          deckDebouncedSave.debounce('save-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid && currentDeck) {
                await DeckSync.saveDeck(uid, {
                  ...currentDeck,
                  description: currentDeck.description || '',
                  isMain: currentDeck.isMain || false
                });
              }
            } catch (error) {
              console.error('Error saving deck to Firebase:', error);
            }
          });
        },

        setMainDeck(deckId) {
          const { decks } = get();
          const targetDeck = decks.find(d => d.id === deckId);
          if (!targetDeck) return;

          // Remove main flag from all decks of this color, then set it on target
          const updatedDecks = decks.map(deck =>
            deck.color === targetDeck.color
              ? { ...deck, isMain: deck.id === deckId }
              : deck
          );

          set({ decks: updatedDecks });

          // Save main deck update to Firebase
          deckDebouncedSave.debounce('set-main-deck', async () => {
            try {
              const uid = getCurrentUserUid();
              if (uid) {
                await DeckSync.saveDecks(uid, updatedDecks.map(deck => ({
                  ...deck,
                  description: deck.description || '',
                  isMain: deck.isMain || false
                })));
              }
            } catch (error) {
              console.error('Error saving main deck update to Firebase:', error);
            }
          });
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
      version: 2, // Increment version to force rehydration
      migrate: (persistedState: unknown, version: number) => {
        console.log('=== ZUSTAND MIGRATION ===');
        console.log('Migrating from version:', version);
        console.log('Persisted state:', persistedState);
        
        // If migrating from version 1 or no version, ensure we have all necessary decks
        if (version < 2) {
          const state = persistedState as Partial<EditorState>;
          
          // Ensure we have decks array
          if (!state.decks || !Array.isArray(state.decks)) {
            console.log('No valid decks found, creating defaults for both colors');
            state.decks = [
              ...createDefaultDecks('w'),
              ...createDefaultDecks('b')
            ];
          } else {
            // Ensure we have default decks for both colors
            const whiteDecks = state.decks.filter(d => d.color === 'w');
            const blackDecks = state.decks.filter(d => d.color === 'b');
            
            if (whiteDecks.length === 0) {
              console.log('Adding missing white default decks');
              state.decks.push(...createDefaultDecks('w'));
            }
            
            if (blackDecks.length === 0) {
              console.log('Adding missing black default decks');
              state.decks.push(...createDefaultDecks('b'));
            }
            
            // Also ensure we have at least the main decks for each color
            const whiteMainDeck = whiteDecks.find(d => d.isMain);
            const blackMainDeck = blackDecks.find(d => d.isMain);
            
            if (!whiteMainDeck && whiteDecks.length > 0) {
              console.log('Setting first white deck as main');
              const firstWhite = state.decks.find(d => d.color === 'w');
              if (firstWhite) firstWhite.isMain = true;
            }
            
            if (!blackMainDeck && blackDecks.length > 0) {
              console.log('Setting first black deck as main');
              const firstBlack = state.decks.find(d => d.color === 'b');
              if (firstBlack) firstBlack.isMain = true;
            }
          }
          
          // Ensure current deck is valid
          if (!state.currentDeckId || !state.decks.find(d => d.id === state.currentDeckId)) {
            const colorDecks = state.decks.filter(d => d.color === (state.color || 'w'));
            state.currentDeckId = colorDecks[0]?.id || null;
          }
          
          console.log('Migration complete. Final decks:', state.decks.map(d => ({ id: d.id, name: d.name, color: d.color })));
        }
        
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('=== ZUSTAND REHYDRATION ===');
        if (state) {
          console.log('Rehydrated decks:', state.decks?.map(d => ({ id: d.id, name: d.name, color: d.color })));
          console.log('Current deck ID:', state.currentDeckId);
          console.log('Current color:', state.color);
        } else {
          console.log('No state rehydrated');
        }
      },
    }
  )
);

// Helper to get current user UID from auth context
// Helper to get current user UID - will be set by auth context
let currentUserUidRef: string | null = null;
export function setCurrentUserUidRef(uid: string | null) {
  currentUserUidRef = uid;
}

function getCurrentUserUid(): string | null {
  return currentUserUidRef;
}