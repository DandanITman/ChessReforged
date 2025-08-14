import type { Color, PieceSymbol, Square } from "chess.js";

// Extended piece symbols for custom pieces
export type ExtendedPieceSymbol = PieceSymbol | 'l' | 's' | 'd' | 'c' | 'e' | 'w' | 'a' | 'h' | 'm' | 't';

export type EditorPiece = {
  color: Color; // 'w' or 'b'
  type: ExtendedPieceSymbol; // Standard pieces + custom pieces
};

export const PIECE_COSTS: Record<ExtendedPieceSymbol, number> = {
  // Standard pieces
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 8,
  k: 0, // king is mandatory but costs 0
  // Custom pieces
  l: 6, // Lion
  s: 2, // Soldier
  d: 8, // Dragon
  c: 5, // Catapult
  e: 4, // Elephant
  w: 7, // Wizard
  a: 3, // Archer
  h: 5, // Ship
  m: 4, // Knight Commander
  t: 7, // Tower Golem
};

// Budget note:
// - Default budget is 38.
// - With current costs (P=1, N/B=3, R=5, Q=8, K=0 max one), a classic army totals 38.
export const DEFAULT_BUDGET = 38;

export function squareFile(sq: Square): string {
  return sq[0];
}

export function squareRank(sq: Square): number {
  // squares are "a1".."h8"
  return parseInt(sq[1] as string, 10);
}

export function isInFirstThreeRanks(color: Color, sq: Square): boolean {
  const r = squareRank(sq);
  return color === "w" ? r === 1 || r === 2 || r === 3 : r === 6 || r === 7 || r === 8;
}

export function isValidSquareFile(sq: Square): boolean {
  const f = squareFile(sq).charCodeAt(0);
  return f >= "a".charCodeAt(0) && f <= "h".charCodeAt(0);
}

export type PlacementValidation = {
  ok: boolean;
  errors: string[];
  totalCost: number;
  remaining: number;
  kingCount: number;
};

export function computeTotalCost(
  placed: Partial<Record<Square, EditorPiece>>,
  color: Color
): number {
  let sum = 0;
  for (const [sq, p] of Object.entries(placed)) {
    if (!isValidSquareFile(sq as Square)) continue;
    if (!p) continue;
    if (p.color !== color) continue;
    sum += PIECE_COSTS[p.type];
  }
  return sum;
}

export function countKings(
  placed: Partial<Record<Square, EditorPiece>>,
  color: Color
): number {
  let c = 0;
  for (const p of Object.values(placed)) {
    if (p && p.color === color && p.type === "k") c++;
  }
  return c;
}

export function validatePlacement(args: {
  placed: Partial<Record<Square, EditorPiece>>;
  color: Color;
  budget?: number;
}): PlacementValidation {
  const { placed, color } = args;
  const budget = args.budget ?? DEFAULT_BUDGET;
  const errors: string[] = [];

  // Region constraint: only first three ranks for the specified color
  for (const [sq, p] of Object.entries(placed)) {
    if (!p) continue;
    if (p.color !== color) continue;
    if (!isInFirstThreeRanks(color, sq as Square)) {
      errors.push(`Piece ${p.type} at ${sq} is outside the first three ranks for ${color}.`);
    }
  }

  // Budget constraint
  const totalCost = computeTotalCost(placed, color);
  if (totalCost > budget) {
    errors.push(`Total cost ${totalCost} exceeds budget ${budget}.`);
  }

  // King constraint
  const kingCount = countKings(placed, color);
  if (kingCount === 0) errors.push("You must place exactly 1 king.");
  if (kingCount > 1) errors.push(`You have placed ${kingCount} kings; only 1 is allowed.`);

  return {
    ok: errors.length === 0,
    errors,
    totalCost,
    remaining: Math.max(0, budget - totalCost),
    kingCount,
  };
}

export function canPlacePiece(args: {
  placed: Partial<Record<Square, EditorPiece>>;
  color: Color;
  budget?: number;
  sq: Square;
  type: ExtendedPieceSymbol;
}): { ok: boolean; reason?: string } {
  const { placed, color, sq, type } = args;
  const budget = args.budget ?? DEFAULT_BUDGET;

  if (!isInFirstThreeRanks(color, sq)) {
    return { ok: false, reason: "Must place within your first three ranks." };
  }

  // Temporary apply placement for validation
  const next: Partial<Record<Square, EditorPiece>> = { ...placed, [sq]: { color, type } };

  // Disallow multiple kings
  if (type === "k" && countKings(next, color) > 1) {
    return { ok: false, reason: "Only one king is allowed." };
  }

  const total = computeTotalCost(next, color);
  if (total > budget) {
    return { ok: false, reason: `Placing this exceeds budget (${total}/${budget}).` };
  }

  return { ok: true };
}

export function removePiece(args: {
  placed: Partial<Record<Square, EditorPiece>>;
  sq: Square;
}): Partial<Record<Square, EditorPiece>> {
  const { placed, sq } = args;
  if (!placed[sq]) return placed;
  const copy = { ...placed };
  delete copy[sq];
  return copy;
}