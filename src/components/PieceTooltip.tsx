"use client";

import React, { useState, useRef } from "react";
import type { PieceSymbol, Color } from "chess.js";
import type { ExtendedPieceSymbol } from "@/lib/chess/placement";
import { getPieceInfo, getPieceRarityColor, getPieceRarityGradient } from "@/lib/chess/pieceInfo";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { Star, Info } from "lucide-react";

interface PieceTooltipProps {
  pieceType: ExtendedPieceSymbol;
  color: Color;
  children: React.ReactNode;
  className?: string;
  inventoryCount?: number;
  delayMs?: number;
  // When provided, tooltip visibility is controlled by parent (no hover delay)
  forceVisible?: boolean;
  onForceHide?: () => void;
}

export default function PieceTooltip({
  pieceType,
  color,
  children,
  className = "",
  inventoryCount,
  delayMs = 0,
  forceVisible,
  onForceHide
}: PieceTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [placeBelow, setPlaceBelow] = useState(false);
  const timerRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pieceInfo = getPieceInfo(pieceType);
  const rarityColor = getPieceRarityColor(pieceInfo.rarity);
  const rarityGradient = getPieceRarityGradient(pieceInfo.rarity);

  const controlled = typeof forceVisible === "boolean";
  const visible = controlled ? !!forceVisible : isVisible;

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      onMouseEnter={() => {
        // Decide placement to avoid clipping off-screen
        try {
          const rect = wrapperRef.current?.getBoundingClientRect();
          if (rect) {
            const estimatedTooltipHeight = 180; // px – conservative height
            const margin = 12;
            const spaceAbove = rect.top;
            const spaceBelow = (typeof window !== "undefined" ? window.innerHeight : 0) - rect.bottom;
            // Place below if not enough room above or below has more space
            const shouldPlaceBelow = spaceAbove < (estimatedTooltipHeight + margin) || spaceBelow > spaceAbove;
            setPlaceBelow(shouldPlaceBelow);
          }
        } catch {}
        if (delayMs > 0) {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => setIsVisible(true), delayMs);
        } else {
          setIsVisible(true);
        }
      }}
      onMouseLeave={() => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsVisible(false);
      }}
    >
      {children}
      
      {visible && (
        <div className={`absolute z-50 ${placeBelow ? "top-full mt-2" : "bottom-full mb-2"} left-1/2 transform -translate-x-1/2 w-80 max-w-[90vw]`}>
          <div className="relative overflow-hidden rounded-lg border bg-card shadow-lg p-4">
            {/* Rarity gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-5`} />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* Piece Image */}
                <div className="flex-shrink-0">
                  <img
                    src={pieceSprite(color, pieceType)}
                    alt={pieceInfo.name}
                    className="w-16 h-16 drop-shadow-sm levitate-fast"
                  />
                </div>
                
                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{pieceInfo.name}</h3>
                    <span className={`text-sm font-medium ${rarityColor}`}>
                      {pieceInfo.rarity}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{pieceInfo.points} points</span>
                    </div>
                    {inventoryCount !== undefined && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary">
                        <span className="text-xs font-medium">Owned: {inventoryCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Movement */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Movement</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {pieceInfo.movement}
                </p>
              </div>
              
              {/* Description */}
              <div>
                <div className="text-sm font-semibold mb-1">Description</div>
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{pieceInfo.description}&rdquo;
                </p>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            {placeBelow ? (
              <div className="absolute top-full left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
              </div>
            ) : (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-border"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
