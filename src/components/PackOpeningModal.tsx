"use client";

import React, { useEffect, useState } from "react";
import type { Color } from "chess.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PackReward } from "@/lib/store/profile";
import { getPieceInfo, getPieceRarityColor, getPieceRarityGradient } from "@/lib/chess/pieceInfo";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { Package, Gem, Star, X, Sparkles, Coins } from "lucide-react";
import confetti from "canvas-confetti";
import { useProfileStore } from "@/lib/store/profile";

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  packReward: PackReward | null;
  onOpenMore: () => void;
}

export default function PackOpeningModal({
  isOpen,
  onClose,
  packReward,
  onOpenMore
}: PackOpeningModalProps) {
  const credits = useProfileStore((s) => s.credits);

  // Trigger confetti/fireworks based on rarity
  const triggerEffects = (pieces: PackReward['pieces']) => {
    const hasEpic = pieces.some(p => getPieceInfo(p.type).rarity === 'Epic');
    const hasLegendary = pieces.some(p => getPieceInfo(p.type).rarity === 'Legendary');

    if (hasLegendary) {
      // Fireworks for legendary
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fireworks from different positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
        });
      }, 250);
    } else if (hasEpic) {
      // Confetti for epic
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#A855F7', '#C084FC', '#E879F9', '#F0ABFC']
      });

      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#9333EA', '#A855F7', '#C084FC', '#E879F9', '#F0ABFC']
        });
      }, 300);
    }
  };

  useEffect(() => {
    if (isOpen && packReward) {
      triggerEffects(packReward.pieces);
    }
  }, [isOpen, packReward]);

  if (!isOpen || !packReward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] mx-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500">
          <Card className="p-6 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xl overflow-y-auto max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-center mb-6 relative">
              {/* Credits Display - Top Left */}
              <div className="absolute left-0 top-0 flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Coins className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {credits.toLocaleString()} credits
                </span>
              </div>

              {/* Centered Header */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                    <Package className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    Pack Opened!
                    <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                  </h2>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Congratulations on your new pieces!
                </p>
              </div>

              {/* Close Button - Top Right */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute right-0 top-0 h-10 w-10 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

          {/* Pieces Received */}
          <div className="mb-6">
            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Pieces Received:
            </div>
            <div className="flex justify-center">
              <div className={`grid gap-4 max-w-2xl w-full ${packReward.pieces.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-2'}`}>
              {packReward.pieces.map((item, i) => {
                const pieceInfo = getPieceInfo(item.type);
                const rarityColor = getPieceRarityColor(pieceInfo.rarity);
                const rarityGradient = getPieceRarityGradient(pieceInfo.rarity);
                const isEpicOrLegendary = pieceInfo.rarity === 'Epic' || pieceInfo.rarity === 'Legendary';

                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${packReward.pieces.length === 1 ? 'max-w-md' : ''}`}
                  >
                    {/* Rarity gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-10`} />

                    {/* Special glow for epic/legendary */}
                    {isEpicOrLegendary && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-20 animate-pulse`} />
                    )}

                    <div className="relative flex items-start gap-3">
                      {/* Piece Image */}
                      <div className="flex-shrink-0">
                        <div className={`relative ${isEpicOrLegendary ? 'animate-bounce' : ''}`}>
                          <img
                            src={pieceSprite("w" as Color, item.type)}
                            alt={pieceInfo.name}
                            className="w-14 h-14 drop-shadow-lg"
                          />
                          {/* Enhanced shine effect for rare pieces */}
                          <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent ${
                            isEpicOrLegendary ? 'animate-pulse' : ''
                          }`} />

                          {/* Sparkle effect for legendary */}
                          {pieceInfo.rarity === 'Legendary' && (
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Piece Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-bold text-base">{item.count}x {pieceInfo.name}</h5>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${rarityColor} bg-opacity-20`}>
                            {pieceInfo.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{pieceInfo.points} points</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {pieceInfo.movement}
                        </p>

                        <p className="text-sm italic text-muted-foreground">
                          &ldquo;{pieceInfo.description}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Orbs Received */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800">
              <div className="relative">
                <Gem className="h-6 w-6 text-purple-600" />
                <div className="absolute inset-0 animate-pulse">
                  <Gem className="h-6 w-6 text-purple-300 opacity-50" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  +{packReward.orbs} Orbs
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  Crafting Currency
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onOpenMore}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Package className="h-5 w-5 mr-2" />
              Open Another Pack
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
