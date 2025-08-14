import type { PieceSymbol } from "chess.js";
import type { ExtendedPieceSymbol } from "./placement";

export interface PieceInfo {
  symbol: ExtendedPieceSymbol;
  name: string;
  points: number;
  movement: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
}

export const PIECE_INFO: Record<ExtendedPieceSymbol, PieceInfo> = {
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
  },
  // Custom pieces
  l: {
    symbol: "l",
    name: "The Roaring Lion",
    points: 6,
    movement: "Can move 2 squares in any direction, but can't jump over pieces",
    description: "Pride of the battlefield, this ferocious feline guards its pride with golden courage.",
    rarity: "Epic"
  },
  s: {
    symbol: "s",
    name: "The Footman",
    points: 2,
    movement: "Moves 1 square forward, captures diagonally like a pawn, but can also step sideways",
    description: "Not the flashiest piece, but the backbone of your army.",
    rarity: "Common"
  },
  d: {
    symbol: "d",
    name: "The Skyflame Dragon",
    points: 8,
    movement: "Moves like a queen, but only up to 4 squares at a time",
    description: "Flies above the fray, breathing fire on the unprepared.",
    rarity: "Legendary"
  },
  c: {
    symbol: "c",
    name: "The Stonehurler",
    points: 5,
    movement: "Cannot move normally; instead, once per turn, it can attack a square up to 3 spaces away",
    description: "Lobs heavy boulders, flattening friend or foe alike.",
    rarity: "Rare"
  },
  e: {
    symbol: "e",
    name: "The War Elephant",
    points: 4,
    movement: "Moves exactly 2 squares diagonally, can jump over pieces",
    description: "Gentle giant… until you're in the way.",
    rarity: "Uncommon"
  },
  w: {
    symbol: "w",
    name: "The Arcane Sage",
    points: 7,
    movement: "Moves like a king but can teleport to any empty square once every 5 turns",
    description: "One blink, and he's gone… or right behind you.",
    rarity: "Epic"
  },
  a: {
    symbol: "a",
    name: "The Bowguard",
    points: 3,
    movement: "Moves like a pawn but can shoot diagonally up to 2 squares away without moving",
    description: "Silent, precise, and always watching.",
    rarity: "Uncommon"
  },
  h: {
    symbol: "h",
    name: "The Galleon",
    points: 5,
    movement: "Can only move along ranks or files, but sails until it hits a piece or the edge",
    description: "The tides of war are in its favor.",
    rarity: "Rare"
  },
  m: {
    symbol: "m",
    name: "The Commanding Steed",
    points: 4,
    movement: "Moves like a knight but can also step 1 square in any direction",
    description: "The trusted leader of your cavalry.",
    rarity: "Uncommon"
  },
  t: {
    symbol: "t",
    name: "The Stone Sentinel",
    points: 7,
    movement: "Moves 1 or 2 squares in any direction but cannot be captured by pawns",
    description: "An immovable guardian carved from the earth itself.",
    rarity: "Epic"
  }
};

export function getPieceInfo(symbol: ExtendedPieceSymbol): PieceInfo {
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
