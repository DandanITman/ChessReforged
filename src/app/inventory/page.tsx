"use client";

import { useMemo, useState } from "react";
import type { Color } from "chess.js";
import type { ExtendedPieceSymbol } from "@/lib/chess/placement";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfileStore } from "@/lib/store/profile";
import { getPieceInfo, getPieceRarityColor } from "@/lib/chess/pieceInfo";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { cosmeticsForPiece } from "@/lib/cosmetics/catalog";
import { Coins, Gem, Package, Palette, Check, X } from "lucide-react";

const PIECE_LABEL: Record<ExtendedPieceSymbol, string> = {
  // Standard pieces
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
  // Custom pieces
  l: "Lion",
  s: "Soldier",
  d: "Dragon",
  c: "Catapult",
  e: "Elephant",
  w: "Wizard",
  a: "Archer",
  h: "Ship",
  m: "Knight Commander",
  t: "Tower Golem",
};

const ALL_PIECES: ExtendedPieceSymbol[] = ["p","n","b","r","q","k","l","s","d","c","e","w","a","h","m","t"];

export default function InventoryPage() {
  // Store values
  const credits = useProfileStore((s) => s.credits);
  const orbs = useProfileStore((s) => s.orbs);
  const inventory = useProfileStore((s) => s.inventory);
  const disassemblePiece = useProfileStore((s) => s.disassemblePiece);

  // Cosmetics store
  const cosmeticsOwned = useProfileStore((s) => s.cosmeticsOwned);
  const equippedCosmetics = useProfileStore((s) => s.equippedCosmetics);
  const equipCosmetic = useProfileStore((s) => s.equipCosmetic);
  const unequipCosmetic = useProfileStore((s) => s.unequipCosmetic);

  // UI state
  const [tab, setTab] = useState<"inventory" | "cosmetics" | "boards">("inventory");
  const [selectedPiece, setSelectedPiece] = useState<ExtendedPieceSymbol>("p");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const ownedEntries = useMemo(
    () => Object.entries(inventory).filter(([, c]) => (c as number) > 0) as [ExtendedPieceSymbol, number][],
    [inventory]
  );

  function handleDisassemble(type: ExtendedPieceSymbol, count: number) {
    setMessage(null);
    setError(null);
    const res = disassemblePiece(type, count);
    if (res.ok) {
      setMessage(`Disassembled ${count}× ${PIECE_LABEL[type]} for +${res.gained} Orbs.`);
    } else {
      setError(res.reason);
    }
  }

  const availableCosmetics = useMemo(() => cosmeticsForPiece(selectedPiece), [selectedPiece]);
  const equippedForSelected = equippedCosmetics[selectedPiece];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7" />
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your owned pieces and apply cosmetics
          </p>
        </div>

        {/* Currencies */}
        <div className="flex gap-3">
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Credits</div>
                <div className="text-lg font-bold">{credits.toLocaleString()}</div>
              </div>
            </div>
          </Card>

          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Gem className="h-5 w-5 text-purple-500" />
                <div className="absolute inset-0 animate-pulse">
                  <Gem className="h-5 w-5 text-purple-300 opacity-50" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Orbs</div>
                <div className="text-lg font-bold">{orbs.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "inventory" ? "default" : "outline"}
          onClick={() => setTab("inventory")}
          className="px-4"
        >
          Inventory
        </Button>
        <Button
          variant={tab === "cosmetics" ? "default" : "outline"}
          onClick={() => setTab("cosmetics")}
          className="px-4"
        >
          Cosmetics
        </Button>
        <Button
          variant={tab === "boards" ? "default" : "outline"}
          onClick={() => setTab("boards")}
          className="px-4"
        >
          Board Themes
        </Button>
      </div>

      {/* Inventory tab */}
      {tab === "inventory" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Pieces</h2>
              <p className="text-sm text-muted-foreground">Disassemble pieces into Orbs to craft cosmetics.</p>
            </div>
          </div>

          {ownedEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You don&apos;t own any pieces yet. Open a pack to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedEntries.map(([type, count]) => {
                const info = getPieceInfo(type);
                const rarityColor = getPieceRarityColor(info.rarity);
                return (
                  <div key={type} className="flex items-center gap-3 rounded-lg border p-3">
                    <img src={pieceSprite("w" as Color, type)} alt={info.name} className="w-10 h-10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm truncate">{info.name}</div>
                        <span className={`text-xs ${rarityColor}`}>{info.rarity}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Owned: {count}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={count < 1}
                        onClick={() => handleDisassemble(type, 1)}
                        title="Disassemble 1"
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={count < 5}
                        onClick={() => handleDisassemble(type, 5)}
                        title="Disassemble 5"
                      >
                        -5
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Cosmetics tab */}
      {tab === "cosmetics" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Apply Cosmetics</div>
                  <div className="text-xs text-muted-foreground">
                    Choose a piece and equip a cosmetic style you own.
                  </div>
                </div>
              </div>
              <div className="w-56">
                <Select
                  value={selectedPiece}
                  onValueChange={(v) => setSelectedPiece(v as ExtendedPieceSymbol)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select piece" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_PIECES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PIECE_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <CardContent className="mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={pieceSprite("w" as Color, selectedPiece)}
                  alt={PIECE_LABEL[selectedPiece]}
                  className="w-12 h-12"
                />
                <div className="text-sm">
                  <div className="font-medium">{PIECE_LABEL[selectedPiece]}</div>
                  <div className="text-muted-foreground">
                    {equippedForSelected ? `Equipped: ${equippedForSelected}` : "No cosmetic equipped"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cosmetics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCosmetics.map((c) => {
              const owned = cosmeticsOwned.includes(c.id);
              const equipped = equippedForSelected === c.id;
              return (
                <Card key={c.id} className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-10`} />
                  <div className="relative p-4 flex items-start gap-3">
                    <div className="rounded-lg p-2 bg-gradient-to-br from-black/60 to-zinc-700 text-white">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{c.name}</div>
                        <span className="text-xs text-muted-foreground">{c.rarity}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{c.description}</div>

                      <div className="mt-3 flex items-center gap-2">
                        {owned ? (
                          equipped ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                unequipCosmetic(selectedPiece);
                                setMessage(`Unequipped ${c.name} from ${PIECE_LABEL[selectedPiece]}.`);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Unequip
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                const res = equipCosmetic(selectedPiece, c.id);
                                if (res.ok) {
                                  setMessage(`Equipped ${c.name} to ${PIECE_LABEL[selectedPiece]}.`);
                                  setError(null);
                                } else {
                                  setError(res.reason ?? "Failed to equip cosmetic.");
                                  setMessage(null);
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Equip
                            </Button>
                          )
                        ) : (
                          <Button size="sm" variant="secondary" disabled title="Not owned">
                            Locked
                          </Button>
                        )}
                        {!owned && (
                          <div className="text-xs text-muted-foreground">Acquire via cosmetics packs (coming soon)</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {availableCosmetics.length === 0 && (
              <div className="text-sm text-muted-foreground">No cosmetics available for this piece yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Board Themes tab */}
      {tab === "boards" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Board Themes</h2>
              <p className="text-sm text-muted-foreground">Customize your chess board appearance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "classic",
                name: "Classic Wood",
                description: "Traditional wooden chess board",
                preview: "bg-gradient-to-br from-amber-100 to-amber-200",
                owned: true,
                equipped: true
              },
              {
                id: "marble",
                name: "Marble Elegance",
                description: "Luxurious marble finish",
                preview: "bg-gradient-to-br from-gray-100 to-gray-300",
                owned: true,
                equipped: false
              },
              {
                id: "metal",
                name: "Steel & Chrome",
                description: "Modern metallic appearance",
                preview: "bg-gradient-to-br from-slate-300 to-slate-500",
                owned: false,
                equipped: false
              },
              {
                id: "neon",
                name: "Neon Glow",
                description: "Futuristic glowing board",
                preview: "bg-gradient-to-br from-cyan-400 to-purple-500",
                owned: false,
                equipped: false
              },
              {
                id: "glass",
                name: "Crystal Glass",
                description: "Transparent crystal design",
                preview: "bg-gradient-to-br from-blue-100 to-blue-200",
                owned: false,
                equipped: false
              }
            ].map((theme) => (
              <Card key={theme.id} className="relative overflow-hidden">
                <div className="relative p-4">
                  <div className={`w-full h-24 rounded-lg ${theme.preview} mb-3 border-2 border-gray-200 dark:border-gray-700`}>
                    <div className="grid grid-cols-8 grid-rows-8 h-full">
                      {Array.from({ length: 64 }).map((_, i) => {
                        const row = Math.floor(i / 8);
                        const col = i % 8;
                        const isDark = (row + col) % 2 === 1;
                        return (
                          <div
                            key={i}
                            className={`${isDark ? 'bg-black/20' : 'bg-white/20'}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{theme.name}</div>
                      {theme.equipped && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="h-3 w-3" />
                          Equipped
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>

                    <div className="flex gap-2 pt-2">
                      {theme.owned ? (
                        theme.equipped ? (
                          <Button size="sm" variant="outline" disabled>
                            <Check className="h-4 w-4 mr-1" />
                            Equipped
                          </Button>
                        ) : (
                          <Button size="sm" variant="default">
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          <X className="h-4 w-4 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>

                    {!theme.owned && (
                      <div className="text-xs text-muted-foreground">
                        Unlock via achievements or shop (coming soon)
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}