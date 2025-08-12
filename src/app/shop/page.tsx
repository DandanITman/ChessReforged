"use client";

import { useState } from "react";
import type { PieceSymbol, Color } from "chess.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfileStore, type PackReward } from "@/lib/store/profile";
import { getPieceInfo, getPieceRarityColor, getPieceRarityGradient } from "@/lib/chess/pieceInfo";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { Coins, ShoppingBag, Package, Crown, Sparkles, Zap, Gem, Palette, X, Star, Info } from "lucide-react";

const PIECE_LABEL: Record<PieceSymbol, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

const PACKS = [
  {
    id: "kings-guards",
    name: "Kings Guards",
    description: "Essential pieces for building your royal army. Contains 1-2 pieces, 5-15 EXP, and 2-8 orbs.",
    cost: 100,
    icon: Crown,
    gradient: "from-yellow-400 to-amber-600",
    rarity: "Common",
    available: true
  },
  {
    id: "tbd",
    name: "TBD",
    description: "Mysterious premium pack with rare pieces. Contains 2 pieces, 15-30 EXP, and 8-20 orbs.",
    cost: 250,
    icon: Sparkles,
    gradient: "from-purple-400 to-pink-600",
    rarity: "Rare",
    available: false
  },
  {
    id: "cosmetics",
    name: "Cosmetics Pack",
    description: "Unlock stunning visual customizations for your pieces and board. Pure cosmetic rewards with no gameplay pieces.",
    cost: 150,
    icon: Palette,
    gradient: "from-pink-400 to-rose-600",
    rarity: "Special",
    available: false
  }
];

export default function ShopPage() {
  const credits = useProfileStore((s) => s.credits);
  const orbs = useProfileStore((s) => s.orbs);
  const openBasicPack = useProfileStore((s) => s.openBasicPack);
  const openTBDPack = useProfileStore((s) => s.openTBDPack);
  const openCosmeticsPack = useProfileStore((s) => s.openCosmeticsPack);
  const [lastReceived, setLastReceived] = useState<PackReward | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOpenPack(packId: string) {
    let res;

    switch (packId) {
      case "kings-guards":
        res = openBasicPack();
        break;
      case "tbd":
        res = openTBDPack();
        break;
      case "cosmetics":
        res = openCosmeticsPack();
        break;
      default:
        return;
    }

    if ("error" in res) {
      setError(res.error);
      setLastReceived(null);
    } else {
      setError(null);
      setLastReceived(res.received);
    }
  }

  return (
    <section className="space-y-6">
      {/* Header with Credits */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-7 w-7" />
            Pack Shop
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open packs to unlock new pieces for your army
          </p>
        </div>

        {/* Currencies Display */}
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

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Pack Rewards */}
      {lastReceived && (
        <Card className="p-6 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <div className="font-semibold text-emerald-800 dark:text-emerald-300">Pack Opened!</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastReceived(null)}
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Pieces Received */}
          <div className="mb-4">
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-3">Pieces Received:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastReceived.pieces.map((item, i) => {
                const pieceInfo = getPieceInfo(item.type);
                const rarityColor = getPieceRarityColor(pieceInfo.rarity);
                const rarityGradient = getPieceRarityGradient(pieceInfo.rarity);

                return (
                  <div key={i} className="relative overflow-hidden rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
                    {/* Rarity gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-5`} />

                    <div className="relative flex items-start gap-3">
                      {/* Piece Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={pieceSprite("w" as Color, item.type)}
                          alt={pieceInfo.name}
                          className="w-12 h-12 drop-shadow-sm"
                        />
                      </div>

                      {/* Piece Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-sm">{item.count}x {pieceInfo.name}</h5>
                          <span className={`text-xs font-medium ${rarityColor}`}>
                            {pieceInfo.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium">{pieceInfo.points} points</span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {pieceInfo.movement}
                        </p>

                        <p className="text-xs italic text-muted-foreground">
                          "{pieceInfo.description}"
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Received */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
              <div className="relative">
                <Gem className="h-4 w-4 text-purple-600" />
                <div className="absolute inset-0 animate-pulse">
                  <Gem className="h-4 w-4 text-purple-300 opacity-50" />
                </div>
              </div>
              <span className="text-sm font-medium">+{lastReceived.orbs} Orbs</span>
            </div>
          </div>
        </Card>
      )}

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PACKS.map((pack) => {
          const IconComponent = pack.icon;
          const canAfford = credits >= pack.cost;
          const isAvailable = pack.available;

          return (
            <Card key={pack.id} className={`relative overflow-hidden group transition-all duration-300 ${
              isAvailable ? 'hover:shadow-lg' : 'opacity-75'
            }`}>
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${pack.gradient} opacity-10 ${
                isAvailable ? 'group-hover:opacity-20' : ''
              } transition-opacity`} />

              <div className="relative p-6">
                {/* Pack Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${pack.gradient} text-white shadow-lg ${
                      !isAvailable ? 'grayscale' : ''
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{pack.name}</h3>
                        {!isAvailable && (
                          <span className="text-xs italic text-orange-600 dark:text-orange-400 font-medium">
                            Coming soon
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {pack.rarity}
                      </div>
                    </div>
                  </div>

                  {/* Cost Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    !isAvailable ? 'bg-muted/50 text-muted-foreground' : 'bg-muted'
                  }`}>
                    <Coins className="h-3 w-3" />
                    {pack.cost}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-6">
                  {pack.description}
                </p>

                {/* Buy Button */}
                <Button
                  onClick={() => handleOpenPack(pack.id)}
                  disabled={!canAfford || !isAvailable}
                  className={`w-full h-12 ${
                    !isAvailable
                      ? 'bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed'
                      : ''
                  }`}
                  size="lg"
                  variant={!isAvailable ? "secondary" : "default"}
                >
                  {!isAvailable ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Coming Soon
                    </>
                  ) : canAfford ? (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Open Pack
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Need {pack.cost - credits} more credits
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}