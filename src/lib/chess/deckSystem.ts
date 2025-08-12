import type { Color, PieceSymbol, Square } from "chess.js";
import { DEFAULT_BUDGET, type EditorPiece } from "./placement";

export interface ArmyDeck {
  id: string;
  name: string;
  description: string;
  color: Color;
  placed: Partial<Record<Square, EditorPiece>>;
  createdAt: number;
  lastModified: number;
}

export interface DeckTemplate {
  name: string;
  description: string;
  placement: Partial<Record<Square, EditorPiece>>;
}

// Calculate budget based on player level
// Base budget: 38, +1 per level up to level 12, then capped at 50
export function calculateBudgetForLevel(level: number): number {
  const baseBudget = DEFAULT_BUDGET; // 38
  const bonusLevels = Math.min(Math.max(level - 1, 0), 12); // Levels 2-13 give bonus (max 12 bonus)
  return baseBudget + bonusLevels;
}

// Generate a unique deck ID
export function generateDeckId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new empty deck
export function createEmptyDeck(color: Color, name?: string): ArmyDeck {
  const now = Date.now();
  return {
    id: generateDeckId(),
    name: name || `${color === 'w' ? 'White' : 'Black'} Army ${new Date().toLocaleDateString()}`,
    description: "A custom army build",
    color,
    placed: {},
    createdAt: now,
    lastModified: now,
  };
}

// Default deck templates for new players
export const DEFAULT_DECK_TEMPLATES: Record<Color, DeckTemplate[]> = {
  w: [
    {
      name: "Classic Setup",
      description: "Traditional chess starting position",
      placement: {
        a1: { color: 'w', type: 'r' },
        b1: { color: 'w', type: 'n' },
        c1: { color: 'w', type: 'b' },
        d1: { color: 'w', type: 'q' },
        e1: { color: 'w', type: 'k' },
        f1: { color: 'w', type: 'b' },
        g1: { color: 'w', type: 'n' },
        h1: { color: 'w', type: 'r' },
        a2: { color: 'w', type: 'p' },
        b2: { color: 'w', type: 'p' },
        c2: { color: 'w', type: 'p' },
        d2: { color: 'w', type: 'p' },
        e2: { color: 'w', type: 'p' },
        f2: { color: 'w', type: 'p' },
        g2: { color: 'w', type: 'p' },
        h2: { color: 'w', type: 'p' },
      }
    },
    {
      name: "Aggressive Opening",
      description: "Forward-focused army with extra knights",
      placement: {
        d1: { color: 'w', type: 'k' },
        c1: { color: 'w', type: 'q' },
        b1: { color: 'w', type: 'n' },
        f1: { color: 'w', type: 'n' },
        a1: { color: 'w', type: 'r' },
        h1: { color: 'w', type: 'r' },
        a2: { color: 'w', type: 'p' },
        b2: { color: 'w', type: 'p' },
        c2: { color: 'w', type: 'p' },
        e2: { color: 'w', type: 'p' },
        f2: { color: 'w', type: 'p' },
        g2: { color: 'w', type: 'p' },
        h2: { color: 'w', type: 'p' },
        d2: { color: 'w', type: 'n' },
        e1: { color: 'w', type: 'n' },
      }
    }
  ],
  b: [
    {
      name: "Classic Setup",
      description: "Traditional chess starting position",
      placement: {
        a8: { color: 'b', type: 'r' },
        b8: { color: 'b', type: 'n' },
        c8: { color: 'b', type: 'b' },
        d8: { color: 'b', type: 'q' },
        e8: { color: 'b', type: 'k' },
        f8: { color: 'b', type: 'b' },
        g8: { color: 'b', type: 'n' },
        h8: { color: 'b', type: 'r' },
        a7: { color: 'b', type: 'p' },
        b7: { color: 'b', type: 'p' },
        c7: { color: 'b', type: 'p' },
        d7: { color: 'b', type: 'p' },
        e7: { color: 'b', type: 'p' },
        f7: { color: 'b', type: 'p' },
        g7: { color: 'b', type: 'p' },
        h7: { color: 'b', type: 'p' },
      }
    },
    {
      name: "Defensive Wall",
      description: "Strong defensive setup with bishops and rooks",
      placement: {
        e8: { color: 'b', type: 'k' },
        d8: { color: 'b', type: 'q' },
        c8: { color: 'b', type: 'b' },
        f8: { color: 'b', type: 'b' },
        a8: { color: 'b', type: 'r' },
        h8: { color: 'b', type: 'r' },
        b8: { color: 'b', type: 'n' },
        g8: { color: 'b', type: 'n' },
        a7: { color: 'b', type: 'p' },
        b7: { color: 'b', type: 'p' },
        c7: { color: 'b', type: 'p' },
        d7: { color: 'b', type: 'p' },
        e7: { color: 'b', type: 'p' },
        f7: { color: 'b', type: 'p' },
        g7: { color: 'b', type: 'p' },
        h7: { color: 'b', type: 'p' },
      }
    }
  ]
};

// Create default decks for a new player
export function createDefaultDecks(color: Color): ArmyDeck[] {
  const templates = DEFAULT_DECK_TEMPLATES[color];
  return templates.map((template, index) => ({
    id: generateDeckId(),
    name: template.name,
    description: template.description,
    color,
    placed: template.placement,
    createdAt: Date.now() - (templates.length - index) * 1000, // Stagger creation times
    lastModified: Date.now() - (templates.length - index) * 1000,
  }));
}

// Validate if a deck is valid for the given budget
export function isDeckValidForBudget(deck: ArmyDeck, budget: number): boolean {
  const { placed, color } = deck;
  
  // Calculate total cost
  let totalCost = 0;
  let hasKing = false;
  
  for (const piece of Object.values(placed)) {
    if (!piece || piece.color !== color) continue;
    
    if (piece.type === 'k') {
      if (hasKing) return false; // Multiple kings
      hasKing = true;
    }
    
    totalCost += getPieceCost(piece.type);
  }
  
  return totalCost <= budget && hasKing;
}

// Get piece cost (same as PIECE_COSTS but centralized)
function getPieceCost(type: PieceSymbol): number {
  const costs: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 8, k: 0
  };
  return costs[type] || 0;
}
