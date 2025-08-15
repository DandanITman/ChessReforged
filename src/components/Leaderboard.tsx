"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Crown, Trophy, Medal, Star } from "lucide-react";
import { LeaderboardService, LeaderboardEntry } from "@/lib/firebase/leaderboard";
import { getRatingClass } from "@/lib/elo/eloSystem";

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [standardLeaderboard, setStandardLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [classicalLeaderboard, setClassicalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("standard");

  useEffect(() => {
    const loadLeaderboards = async () => {
      setIsLoading(true);
      try {
        const leaderboardService = LeaderboardService.getInstance();
        const [standard, classical] = await Promise.all([
          leaderboardService.getLeaderboard('standard', 'ranked', 50),
          leaderboardService.getLeaderboard('classical', 'ranked', 50)
        ]);
        
        setStandardLeaderboard(standard);
        setClassicalLeaderboard(classical);
      } catch (error) {
        console.error('Error loading leaderboards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-medium">#{rank}</span>;
    }
  };

  const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="space-y-3">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded" />
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="w-16 h-6 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No players found</p>
          <p className="text-sm">Be the first to play ranked games!</p>
        </div>
      ) : (
        entries.map((entry) => {
          const ratingInfo = getRatingClass(entry.rating);
          return (
            <div
              key={entry.uid}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' : 'bg-card'
              }`}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <img 
                  src={entry.photoURL} 
                  alt={entry.displayName}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = '/pieces/pawn_white.png';
                  }}
                />
              </Avatar>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{entry.displayName}</p>
                  {entry.rank <= 3 && (
                    <Badge variant="secondary" className="text-xs">
                      {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : '3rd Place'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={ratingInfo.color}>{ratingInfo.title}</span>
                  <span>•</span>
                  <span>{entry.gamesPlayed} games</span>
                  <span>•</span>
                  <span>{entry.winRate}% win rate</span>
                </div>
              </div>

              {/* Rating */}
              <div className="text-right">
                <div className="text-lg font-bold">{entry.rating}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.wins}W/{entry.losses}L/{entry.draws}D
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          ELO Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Standard
            </TabsTrigger>
            <TabsTrigger value="classical" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Classical
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="mt-6">
            <LeaderboardTable entries={standardLeaderboard} />
          </TabsContent>
          
          <TabsContent value="classical" className="mt-6">
            <LeaderboardTable entries={classicalLeaderboard} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}