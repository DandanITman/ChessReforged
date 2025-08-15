"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Star, Crown, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { SFX } from "@/lib/sound/sfx";
import type { Achievement } from "@/lib/store/profile";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function AchievementNotification({
  achievement,
  onClose,
  autoCloseDelay = 10000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Trigger celebration effects on mount ONLY
  useEffect(() => {
    // Slide in animation
    setIsVisible(true);

    // Achievement sound effect - only play once on mount
    try {
      SFX.achievement(); // Using dedicated achievement sound
    } catch (error) {
      console.log('Achievement sound effect not available:', error);
    }

    // Confetti celebration
    const celebrateAchievement = () => {
      // Multiple confetti bursts for extra celebration
      const colors = ['#FFD700', '#FFA500', '#FF6B35', '#9B59B6', '#3498DB', '#2ECC71'];

      // First burst from the achievement notification area
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.1 }, // Top right where notification appears
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });

      // Second burst with different timing
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.85, y: 0.15 },
          colors,
          gravity: 0.6,
          scalar: 0.8,
        });
      }, 200);

      // Third burst for epic achievements
      if (achievement.goal >= 100 || achievement.id.includes('legendary') || achievement.id.includes('patron')) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { x: 0.9, y: 0.1 },
            colors: ['#FFD700', '#FF1493', '#9370DB', '#00FFFF'],
            gravity: 1,
            scalar: 1.5,
          });
        }, 400);
      }
    };

    celebrateAchievement();

    // No cleanup needed for this effect since it only runs once
  }, [achievement.id]); // Only depend on achievement.id to prevent re-runs

  // Auto-close timer management
  useEffect(() => {
    if (!isHovered) {
      const id = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      setTimeoutId(id);

      return () => {
        clearTimeout(id);
        setTimeoutId(null);
      };
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  }, [isHovered, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for slide-out animation before calling onClose
    setTimeout(onClose, 300);
  };

  const getAchievementIcon = () => {
    if (achievement.goal >= 100 || achievement.id.includes('legendary') || achievement.id.includes('patron')) {
      return <Crown className="h-6 w-6 text-yellow-400" />;
    }
    if (achievement.goal >= 10) {
      return <Trophy className="h-6 w-6 text-amber-500" />;
    }
    return <Star className="h-6 w-6 text-blue-500" />;
  };

  const getAchievementBorderColor = () => {
    if (achievement.goal >= 100 || achievement.id.includes('legendary') || achievement.id.includes('patron')) {
      return 'border-yellow-400 shadow-yellow-400/50';
    }
    if (achievement.goal >= 10) {
      return 'border-amber-500 shadow-amber-500/50';
    }
    return 'border-blue-500 shadow-blue-500/50';
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`
        w-80 p-4 bg-gradient-to-r from-slate-900 to-slate-800
        border-2 ${getAchievementBorderColor()}
        shadow-2xl
        hover:scale-105 transition-transform duration-200
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Achievement Icon with subtle glow effect */}
            <div className="relative">
              {getAchievementIcon()}
            </div>

            {/* Achievement Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-sm">Achievement Unlocked!</h3>
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
              
              <h4 className="font-semibold text-yellow-400 text-lg mb-1 leading-tight">
                {achievement.title}
              </h4>
              
              <p className="text-gray-300 text-xs leading-snug">
                {achievement.description}
              </p>

              {/* Progress indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '100%' }}
                  />
                </div>
                <span className="text-xs text-yellow-400 font-semibold">
                  {achievement.goal >= 1000 ? `${(achievement.goal / 1000).toFixed(0)}K` : achievement.goal}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Subtle sparkle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full opacity-60" />
          <div className="absolute top-4 right-8 w-0.5 h-0.5 bg-blue-400 rounded-full opacity-40" />
          <div className="absolute bottom-3 left-8 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-50" />
          <div className="absolute bottom-2 right-4 w-1 h-1 bg-green-400 rounded-full opacity-60" />
        </div>
      </Card>
    </div>
  );
}