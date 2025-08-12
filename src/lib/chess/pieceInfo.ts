import type { PieceSymbol } from "chess.js";

export interface PieceInfo {
  symbol: PieceSymbol;
  name: string;
  points: number;
  movement: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
}

export const PIECE_INFO: Record<PieceSymbol, PieceInfo> = {
  p: {
    symbol: "p",
    name: "Pawn",
    points: 1,
    movement: "Moves forward one square, captures diagonally forward",
    description: "The humble foot soldier of your army. Though weak individually, they form the backbone of any strategy.",
    rarity: "Common"
  },
  n: {
    symbol: "n", 
    name: "Knight",
    points: 3,
    movement: "Moves in an L-shape: two squares in one direction, then one square perpendicular",
    description: "The cavalry of the battlefield. Its unique movement allows it to leap over other pieces and strike unexpectedly.",
    rarity: "Uncommon"
  },
  b: {
    symbol: "b",
    name: "Bishop", 
    points: 3,
    movement: "Moves diagonally any number of squares",
    description: "The spiritual advisor with far-reaching influence. Controls the diagonal pathways of the battlefield.",
    rarity: "Uncommon"
  },
  r: {
    symbol: "r",
    name: "Rook",
    points: 5, 
    movement: "Moves horizontally or vertically any number of squares",
    description: "The fortress tower that commands ranks and files. A cornerstone of both defense and devastating attacks.",
    rarity: "Rare"
  },
  q: {
    symbol: "q",
    name: "Queen",
    points: 8,
    movement: "Combines the power of rook and bishop - moves any direction any number of squares", 
    description: "The most powerful piece on the board. Her versatility and range make her the crown jewel of any army.",
    rarity: "Epic"
  },
  k: {
    symbol: "k",
    name: "King",
    points: 0,
    movement: "Moves one square in any direction",
    description: "The heart of your kingdom. Though limited in movement, his survival determines victory or defeat.",
    rarity: "Legendary"
  }
};

export function getPieceInfo(symbol: PieceSymbol): PieceInfo {
  return PIECE_INFO[symbol];
}

export function getPieceRarityColor(rarity: PieceInfo["rarity"]): string {
  switch (rarity) {
    case "Common":
      return "text-gray-600 dark:text-gray-400";
    case "Uncommon": 
      return "text-green-600 dark:text-green-400";
    case "Rare":
      return "text-blue-600 dark:text-blue-400";
    case "Epic":
      return "text-purple-600 dark:text-purple-400";
    case "Legendary":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

export function getPieceRarityGradient(rarity: PieceInfo["rarity"]): string {
  switch (rarity) {
    case "Common":
      return "from-gray-400 to-gray-600";
    case "Uncommon":
      return "from-green-400 to-green-600";
    case "Rare": 
      return "from-blue-400 to-blue-600";
    case "Epic":
      return "from-purple-400 to-purple-600";
    case "Legendary":
      return "from-yellow-400 to-yellow-600";
    default:
      return "from-gray-400 to-gray-600";
  }
}
