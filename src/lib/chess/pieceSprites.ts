import type { Color, PieceSymbol } from "chess.js";

/**
 * Return the public URL for a chess piece sprite (SVG).
 * Files are expected at /pieces/w-p.svg, /pieces/b-k.svg, etc.
 */
export function pieceSprite(color: Color, type: PieceSymbol): string {
  const side = color === "w" ? "w" : "b";
  return `/pieces/${side}-${type}.svg`;
}