import type { ExtendedPieceSymbol } from "@/lib/chess/placement";

export type Cosmetic = {
  id: string;
  name: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Special";
  appliesTo: "all" | ExtendedPieceSymbol[];
  gradient: string; // Tailwind gradient for card accent (bg-gradient-to-br)
};

export const COSMETICS: Cosmetic[] = [
  {
    id: "onyx-set-all",
    name: "Onyx Set",
    description: "Matte-black onyx finish for all pieces.",
    rarity: "Special",
    appliesTo: "all",
    gradient: "from-zinc-700 to-black"
  },
  {
    id: "royal-gold-set",
    name: "Royal Gold",
    description: "Gold-trimmed finish fit for royalty.",
    rarity: "Legendary",
    appliesTo: ["k","q","r"],
    gradient: "from-amber-400 to-yellow-600"
  },
  {
    id: "arcane-glow-set",
    name: "Arcane Glow",
    description: "Subtle arcane energy shimmer.",
    rarity: "Epic",
    appliesTo: ["w","m","t"],
    gradient: "from-violet-500 to-fuchsia-600"
  },
];

export function getCosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS.find(c => c.id === id);
}

export function cosmeticsForPiece(piece: ExtendedPieceSymbol): Cosmetic[] {
  return COSMETICS.filter(c => c.appliesTo === "all" || (Array.isArray(c.appliesTo) && c.appliesTo.includes(piece)));
}