import type { Color, PieceSymbol, Square } from "chess.js";
import { DEFAULT_BUDGET, type EditorPiece, type ExtendedPieceSymbol } from "./placement";

export interface ArmyDeck {
  id: string;
  name: string;
  description: string;
  color: Color;
  placed: Partial<Record<Square, EditorPiece>>;
  createdAt: number;
  lastModified: number;
  isMain?: boolean; // Whether this is the main/default deck for this color
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
      name: "Classic Setup (Default)",
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
      name: "Classic Setup (Default)",
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
    isMain: index === 0, // First deck is the main deck
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
function getPieceCost(type: ExtendedPieceSymbol): number {
  const costs: Record<ExtendedPieceSymbol, number> = {
    // Standard pieces
    p: 1, n: 3, b: 3, r: 5, q: 8, k: 0,
    // Custom pieces
    l: 6, s: 2, d: 8, c: 5, e: 4, w: 7, a: 3, h: 5, m: 4, t: 7
  };
  return costs[type] || 0;
}

// Map custom pieces to standard pieces for chess.js compatibility
const CUSTOM_TO_STANDARD_MAPPING: Record<string, string> = {
  // Map to standard pieces that are supersets of intended movement so we can restrict via UI
  'l': 'q', // Lion -> Queen (we'll restrict to exactly 2 squares)
  's': 'q', // Soldier -> Queen (we'll restrict to fwd/diagonal-capture/sideways 1)
  'd': 'q', // Dragon -> Queen (we'll restrict to <=4 squares)
  'c': 'r', // Catapult -> Rook (cannot move in our rules, filtered in UI)
  'e': 'b', // Elephant -> Bishop (we'll restrict to exactly 2 diagonally; jump not supported)
  'w': 'q', // Wizard -> Queen (we'll restrict to king-like 1-square step)
  'a': 'p', // Archer -> Pawn (shooting not implemented yet)
  'h': 'r', // Galleon -> Rook
  'm': 'n', // Knight Commander -> Knight (extra king step not yet supported)
  't': 'q', // Stone Sentinel -> Queen (we'll restrict to 1-2 squares)
};

// Convert deck placements to FEN string
export function decksToFen(whiteDeck: ArmyDeck | null, blackDeck: ArmyDeck | null): string {
  // Initialize empty 8x8 board
  const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Place white pieces
  if (whiteDeck) {
    for (const [square, piece] of Object.entries(whiteDeck.placed)) {
      if (piece && piece.color === 'w') {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
        const rank = parseInt(square[1]) - 1; // 0-7
        if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
          // Map custom pieces to standard pieces for chess.js compatibility
          const mappedType = CUSTOM_TO_STANDARD_MAPPING[piece.type] || piece.type;
          board[7 - rank][file] = mappedType.toUpperCase(); // White pieces are uppercase
        }
      }
    }
  }

  // Place black pieces
  if (blackDeck) {
    for (const [square, piece] of Object.entries(blackDeck.placed)) {
      if (piece && piece.color === 'b') {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
        const rank = parseInt(square[1]) - 1; // 0-7
        if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
          // Map custom pieces to standard pieces for chess.js compatibility
          const mappedType = CUSTOM_TO_STANDARD_MAPPING[piece.type] || piece.type;
          board[7 - rank][file] = mappedType.toLowerCase(); // Black pieces are lowercase
        }
      }
    }
  }

  // Convert board to FEN notation
  const fenRanks: string[] = [];
  for (let rank = 0; rank < 8; rank++) {
    let fenRank = '';
    let emptyCount = 0;

    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        if (emptyCount > 0) {
          fenRank += emptyCount.toString();
          emptyCount = 0;
        }
        fenRank += piece;
      } else {
        emptyCount++;
      }
    }

    if (emptyCount > 0) {
      fenRank += emptyCount.toString();
    }

    fenRanks.push(fenRank);
  }

  // Standard FEN format: position active_color castling en_passant halfmove fullmove
  // For custom armies, we'll disable castling and set standard values
  return `${fenRanks.join('/')} w - - 0 1`;
}

// Store custom piece mapping for a game
export interface CustomPieceMapping {
  [square: string]: {
    actualType: ExtendedPieceSymbol;
    color: Color;
  };
}

// Generate custom piece mapping from decks
export function generateCustomPieceMapping(whiteDeck: ArmyDeck | null, blackDeck: ArmyDeck | null): CustomPieceMapping {
  const mapping: CustomPieceMapping = {};

  // Standard piece types that don't need custom mapping
  const standardPieces: Set<ExtendedPieceSymbol> = new Set(['p', 'n', 'b', 'r', 'q', 'k']);

  // Map white pieces (only custom pieces)
  if (whiteDeck) {
    for (const [square, piece] of Object.entries(whiteDeck.placed)) {
      if (piece && piece.color === 'w' && !standardPieces.has(piece.type)) {
        mapping[square] = {
          actualType: piece.type,
          color: piece.color,
        };
      }
    }
  }

  // Map black pieces (only custom pieces)
  if (blackDeck) {
    for (const [square, piece] of Object.entries(blackDeck.placed)) {
      if (piece && piece.color === 'b' && !standardPieces.has(piece.type)) {
        mapping[square] = {
          actualType: piece.type,
          color: piece.color,
        };
      }
    }
  }

  return mapping;
}
