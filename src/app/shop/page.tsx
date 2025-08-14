"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfileStore, type PackReward } from "@/lib/store/profile";
import PackOpeningModal from "@/components/PackOpeningModal";
import { Coins, ShoppingBag, Package, Crown, Sparkles, Gem, Palette, X } from "lucide-react";


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
  const [showPackModal, setShowPackModal] = useState(false);
  const [lastPackType, setLastPackType] = useState<string | null>(null);

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
      setShowPackModal(false);
      setLastPackType(null);
    } else {
      setError(null);
      setLastReceived(res.received);
      setShowPackModal(true);
      setLastPackType(packId);
    }
  }

  function handleCloseModal() {
    setShowPackModal(false);
    setLastReceived(null);
    setLastPackType(null);
  }

  function handleOpenMore() {
    if (lastPackType) {
      // Try to open another pack of the same type
      handleOpenPack(lastPackType);
    } else {
      // Fallback: close modal and scroll to packs
      setShowPackModal(false);
      setLastReceived(null);
      setTimeout(() => {
        const packsSection = document.querySelector('.packs-grid');
        if (packsSection) {
          packsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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

      {/* Alerts */}
      {error && (
        <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}





      {/* Packs Grid */}
      <div className="packs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Pack Opening Modal */}
      <PackOpeningModal
        isOpen={showPackModal}
        onClose={handleCloseModal}
        packReward={lastReceived}
        onOpenMore={handleOpenMore}
      />
    </section>
  );
}