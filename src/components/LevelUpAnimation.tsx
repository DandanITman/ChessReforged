"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SFX } from '@/lib/sound/sfx';
import confetti from 'canvas-confetti';

interface LevelUpAnimationProps {
  level: number;
  onAnimationComplete?: () => void;
  className?: string;
  isMobile?: boolean;
}

export default function LevelUpAnimation({
  level,
  onAnimationComplete,
  className,
  isMobile = false
}: LevelUpAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [previousLevel, setPreviousLevel] = useState(level);

  useEffect(() => {
    if (level > previousLevel) {
      // Level increased - trigger animation and effects
      setIsAnimating(true);

      // Play level up sound
      try {
        SFX.levelup(); // Using dedicated level up sound
      } catch (error) {
        console.log('Level up sound effect not available:', error);
      }

      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.2 }, // From top of screen where level counter is
        colors: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
      });

      // Second confetti burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.2 },
          colors: ['#EF4444', '#F97316', '#84CC16', '#06B6D4', '#8B5CF6']
        });
      }, 300);

      // Update display level after a short delay to show the fill-up effect
      setTimeout(() => {
        setDisplayLevel(level);
      }, 200);

      // Complete animation after pop and shake
      setTimeout(() => {
        setIsAnimating(false);
        setPreviousLevel(level);
        onAnimationComplete?.();
      }, 1000);
    } else if (level !== previousLevel) {
      // Level changed but didn't increase (admin reset, etc.)
      setDisplayLevel(level);
      setPreviousLevel(level);
    }
  }, [level, previousLevel, onAnimationComplete]);

  if (isMobile) {
    // Mobile badge version - just the number
    return (
      <div className={cn(
        "bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300",
        isAnimating && "level-up-container",
        className
      )}>
        <span className={cn(
          "transition-all duration-300",
          isAnimating && "level-up-number"
        )}>
          {displayLevel}
        </span>

        {/* Fill-up effect overlay for mobile */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 level-up-fill" />
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary transition-all duration-300",
      isAnimating && "level-up-container",
      className
    )}>
      <span className="text-xs font-medium">Level</span>
      <span className={cn(
        "text-sm font-bold transition-all duration-300",
        isAnimating && "level-up-number"
      )}>
        {displayLevel}
      </span>

      {/* Fill-up effect overlay */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 level-up-fill" />
      )}
    </div>
  );
}
