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
    name: "Lion",
    points: 6,
    movement: "Can move exactly 2 squares in any direction (cannot jump over pieces)",
    description: "A powerful predator with precise, calculated strikes.",
    rarity: "Epic"
  },
  s: {
    symbol: "s",
    name: "Soldier",
    points: 2,
    movement: "Moves 1 square forward or sideways (no capture), captures diagonally forward like a pawn",
    description: "A versatile infantry unit that can advance or maneuver sideways.",
    rarity: "Common"
  },
  d: {
    symbol: "d",
    name: "Dragon",
    points: 8,
    movement: "Moves like a queen but limited to 4 squares maximum in any direction",
    description: "The most feared creature of legend with devastating but controlled range.",
    rarity: "Legendary"
  },
  c: {
    symbol: "c",
    name: "Catapult",
    points: 5,
    movement: "Cannot move - stationary siege weapon (ranged attacks not yet implemented)",
    description: "A fixed siege engine designed for long-range bombardment.",
    rarity: "Rare"
  },
  e: {
    symbol: "e",
    name: "Elephant",
    points: 4,
    movement: "Moves exactly 2 squares diagonally (can jump over pieces)",
    description: "A massive war beast with powerful diagonal charges.",
    rarity: "Uncommon"
  },
  w: {
    symbol: "w",
    name: "Wizard",
    points: 7,
    movement: "Moves like a king (1 square in any direction) - teleportation not yet implemented",
    description: "A wise spellcaster with careful, measured movements.",
    rarity: "Epic"
  },
  a: {
    symbol: "a",
    name: "Archer",
    points: 3,
    movement: "Moves like a pawn (forward 1, captures diagonally) - ranged attacks not yet implemented",
    description: "A skilled marksman operating with pawn-like mobility.",
    rarity: "Uncommon"
  },
  h: {
    symbol: "h",
    name: "Ship",
    points: 5,
    movement: "Moves like a rook (horizontally and vertically any distance)",
    description: "A naval vessel that dominates straight lines across the battlefield.",
    rarity: "Rare"
  },
  m: {
    symbol: "m",
    name: "Knight Commander",
    points: 4,
    movement: "Moves like a knight (L-shaped moves) - additional king steps not yet implemented",
    description: "An elite cavalry leader with the agility of a knight.",
    rarity: "Uncommon"
  },
  t: {
    symbol: "t",
    name: "Golem",
    points: 7,
    movement: "Moves 1 or 2 squares in any direction and cannot be captured by pawns",
    description: "An ancient stone guardian immune to pawn attacks but vulnerable to stronger pieces.",
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
