"use client";

import EditorBoard from "@/components/EditorBoard";
import CompactDeckSelector from "@/components/CompactDeckSelector";
import { useEditorStore } from "@/lib/store/editor";
import { useProfileStore } from "@/lib/store/profile";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { PIECE_COSTS, type ExtendedPieceSymbol } from "@/lib/chess/placement";
import { getPieceInfo } from "@/lib/chess/pieceInfo";
import PieceTooltip from "@/components/PieceTooltip";
import { useState } from "react";

const PIECES: { key: string; type: ExtendedPieceSymbol; label: string; category: string }[] = [
  // Standard pieces
  { key: "p", type: "p", label: "Pawn", category: "Basic" },
  { key: "n", type: "n", label: "Knight", category: "Basic" },
  { key: "b", type: "b", label: "Bishop", category: "Basic" },
  { key: "r", type: "r", label: "Rook", category: "Basic" },
  { key: "q", type: "q", label: "Queen", category: "Basic" },
  { key: "k", type: "k", label: "King", category: "Basic" },
  // Custom pieces
  { key: "l", type: "l", label: "Lion", category: "Advanced" },
  { key: "s", type: "s", label: "Soldier", category: "Basic" },
  { key: "d", type: "d", label: "Dragon", category: "Legendary" },
  { key: "c", type: "c", label: "Catapult", category: "Advanced" },
  { key: "e", type: "e", label: "Elephant", category: "Advanced" },
  { key: "w", type: "w", label: "Wizard", category: "Legendary" },
  { key: "a", type: "a", label: "Archer", category: "Basic" },
  { key: "h", type: "h", label: "Ship", category: "Advanced" },
  { key: "m", type: "m", label: "Knight Commander", category: "Advanced" },
  { key: "t", type: "t", label: "Tower Golem", category: "Legendary" },
];

export default function EditorPage() {
  const color = useEditorStore((s) => s.color);
  const selectedType = useEditorStore((s) => s.selectedType);
  const validation = useEditorStore((s) => s.validation);
  const setColor = useEditorStore((s) => s.setColor);
  const setSelectedType = useEditorStore((s) => s.setSelectedType);

  const inventory = useProfileStore((s) => s.inventory);
  const playerLevel = useProfileStore((s) => s.level);

  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [activeTab, setActiveTab] = useState<"arsenal" | "inventory">("arsenal");
  const disassemblePiece = useProfileStore((s) => s.disassemblePiece);
  const [invMessage, setInvMessage] = useState<string | null>(null);

  const filteredPieces = PIECES.filter(piece =>
    filterType === "all" || piece.category.toLowerCase() === filterType
  ).sort((a, b) => {
    if (sortBy === "cost") {
      return PIECE_COSTS[a.type] - PIECE_COSTS[b.type];
    }
    return a.label.localeCompare(b.label);
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Army Builder</h1>
        <div className="flex items-center gap-2">
          <Button variant={color === "w" ? "default" : "outline"} onClick={() => setColor("w")}>
            White
          </Button>
          <Button variant={color === "b" ? "default" : "outline"} onClick={() => setColor("b")}>
            Black
          </Button>
        </div>
      </div>

      {/* Compact Deck Management */}
      <CompactDeckSelector playerLevel={playerLevel} />

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Build custom armies within your point budget. Click pieces in the arsenal to select them, then click board squares to place. Right-click to remove.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Selected piece:</span>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border">
            <img
              src={pieceSprite(color, selectedType)}
              alt={PIECES.find(p => p.type === selectedType)?.label || 'None'}
              className="w-4 h-4"
            />
            <span className="font-medium capitalize">{PIECES.find(p => p.type === selectedType)?.label || 'None'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Board Section */}
        <div className="flex-shrink-0">
          <EditorBoard />

          {/* Validation below board */}
          <div className="mt-4">
            {validation.errors.length > 0 ? (
              <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3">
                <p className="font-medium text-red-700 dark:text-red-300 mb-1">Validation</p>
                <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                Army is valid and ready for battle!
              </div>
            )}
          </div>
        </div>

        {/* Piece Selection */}
        <div className="flex-1 min-w-0">
          <div className="space-y-4">

            {/* Filters and Sorting */}
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Filter:</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="cost">Point Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === "arsenal" ? "default" : "outline"}
                onClick={() => setActiveTab("arsenal")}
                className="h-8"
              >
                Arsenal
              </Button>
              <Button
                size="sm"
                variant={activeTab === "inventory" ? "default" : "outline"}
                onClick={() => setActiveTab("inventory")}
                className="h-8"
              >
                Inventory
              </Button>
            </div>

            {activeTab === "arsenal" ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Piece Arsenal</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPieces.map((piece) => {
                    const count = inventory[piece.type] ?? 0;
                    const isOwned = count > 0;
                    return (
                      <PieceTooltip
                        key={piece.key}
                        pieceType={piece.type}
                        color={color}
                        inventoryCount={count}
                      >
                        <button
                          disabled={!isOwned}
                          onClick={() => isOwned && setSelectedType(piece.type)}
                          className={`relative w-full p-3 rounded-lg border transition-all ${
                            selectedType === piece.type
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border bg-card hover:border-primary/50"
                          } ${!isOwned ? "opacity-40 grayscale cursor-not-allowed" : "hover:shadow-md"}`}
                          title={!isOwned ? "You don't own this piece" : undefined}
                        >
                          {/* Count badge */}
                          <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border">
                            x{count}
                          </span>
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={pieceSprite(color, piece.type)}
                              alt={piece.label}
                              className="w-12 h-12 drop-shadow-sm"
                            />
                            <div className="text-center">
                              <div className="font-medium text-sm">{piece.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {PIECE_COSTS[piece.type]} {PIECE_COSTS[piece.type] === 1 ? 'point' : 'points'}
                              </div>
                            </div>
                          </div>
                        </button>
                      </PieceTooltip>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Inventory</h3>
                {invMessage && (
                  <div className="rounded-md border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                    {invMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(inventory).map(([t, count]) => {
                    const type = t as ExtendedPieceSymbol;
                    const info = getPieceInfo(type);
                    return (
                      <div key={type} className="flex items-center gap-3 rounded-lg border p-3">
                        <img src={pieceSprite("w", type)} alt={info.name} className="w-10 h-10" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-sm truncate">{info.name}</div>
                            <span className="text-xs text-muted-foreground">Owned: {count}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            disabled={(count as number) < 1}
                            onClick={() => {
                              const res = disassemblePiece(type, 1);
                              if ("ok" in res && res.ok) setInvMessage(`Disassembled 1× ${info.name} for +${res.gained} Orbs.`);
                              else setInvMessage(res.reason ?? "Unable to disassemble");
                            }}
                            title="Disassemble 1"
                          >
                            -1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            disabled={(count as number) < 5}
                            onClick={() => {
                              const res = disassemblePiece(type, 5);
                              if ("ok" in res && res.ok) setInvMessage(`Disassembled 5× ${info.name} for +${res.gained} Orbs.`);
                              else setInvMessage(res.reason ?? "Unable to disassemble");
                            }}
                            title="Disassemble 5"
                          >
                            -5
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}