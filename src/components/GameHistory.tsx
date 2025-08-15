"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Clock, 
  Trophy, 
  Target, 
  Calendar,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { LeaderboardService, GameHistoryEntry } from "@/lib/firebase/leaderboard";
import { useAuth } from "@/contexts/AuthContext";

interface GameHistoryProps {
  className?: string;
}

export function GameHistory({ className }: GameHistoryProps) {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');

  useEffect(() => {
    const loadGameHistory = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const leaderboardService = LeaderboardService.getInstance();
        const history = await leaderboardService.getUserGameHistory(user.uid);
        setGameHistory(history);
      } catch (error) {
        console.error('Error loading game history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameHistory();
  }, [user]);

  const filteredHistory = gameHistory.filter(game => 
    filter === 'all' || game.result === filter
  );

  const getResultIcon = (result: string, ratingChange?: number) => {
    switch (result) {
      case 'win':
        return (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            {ratingChange && <span className="text-xs text-green-500">+{ratingChange}</span>}
          </div>
        );
      case 'loss':
        return (
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            {ratingChange && <span className="text-xs text-red-500">{ratingChange}</span>}
          </div>
        );
      case 'draw':
        return (
          <div className="flex items-center gap-1">
            <Minus className="h-4 w-4 text-gray-500" />
            {ratingChange && <span className="text-xs text-gray-500">{ratingChange}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'win':
        return <Badge className="bg-green-500 hover:bg-green-600">Win</Badge>;
      case 'loss':
        return <Badge variant="destructive">Loss</Badge>;
      case 'draw':
        return <Badge variant="secondary">Draw</Badge>;
      default:
        return null;
    }
  };

  const getGameTypeLabel = (gameType: string) => {
    switch (gameType) {
      case 'standardRanked': return 'Standard Ranked';
      case 'standardCasual': return 'Standard Casual';
      case 'classicalRanked': return 'Classical Ranked';
      case 'classicalCasual': return 'Classical Casual';
      default: return gameType;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Game History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'win' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('win')}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Wins
            </Button>
            <Button
              variant={filter === 'loss' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('loss')}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Losses
            </Button>
            <Button
              variant={filter === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('draw')}
              className="text-gray-600 border-gray-600 hover:bg-gray-50"
            >
              Draws
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="w-16 h-6 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Sign in to view your game history</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No games found</p>
              <p className="text-sm">Start playing to build your history!</p>
            </div>
          ) : (
            filteredHistory.map((game) => (
              <div
                key={game.id}
                className="flex items-center space-x-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {/* Result Icon */}
                <div className="w-8 flex justify-center">
                  {getResultIcon(game.result, game.ratingChange)}
                </div>

                {/* Opponent Avatar */}
                <Avatar className="h-8 w-8">
                  <img 
                    src="/pieces/pawn_white.png" 
                    alt={game.opponent.displayName}
                    className="rounded-full"
                  />
                </Avatar>

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">vs {game.opponent.displayName}</p>
                    {getResultBadge(game.result)}
                    <Badge variant="outline" className="text-xs">
                      {game.opponent.rating}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getGameTypeLabel(game.gameType)}</span>
                    <span>•</span>
                    <span>{game.timeControl}</span>
                    <span>•</span>
                    <span>{formatDuration(game.duration)}</span>
                    <span>•</span>
                    <span>{game.moves} moves</span>
                  </div>
                  {game.openingName && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {game.openingName} • {game.endReason.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {/* Date and Arrow */}
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className="text-sm font-medium">{formatDate(game.date)}</div>
                    <div className="text-xs text-muted-foreground">
                      {game.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && user && filteredHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Load More Games
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}