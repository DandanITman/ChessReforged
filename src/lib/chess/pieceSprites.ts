import type { Color, PieceSymbol } from "chess.js";

/**
 * Return the public URL for a chess piece sprite (PNG).
 * Files are expected at /pieces/w-p.png, /pieces/b-k.png, etc.
 */
export function pieceSprite(color: Color, type: PieceSymbol): string {
  const side = color === "w" ? "w" : "b";
  return `/pieces/${side}-${type}.png`;
}