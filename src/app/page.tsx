"use client";

import React from "react";
import { Sword, Bot, Users, Puzzle, ShoppingBag, Package, Eye, Crown, Zap, Star, Clock, Play } from "lucide-react";
import { NavTile } from "@/components/NavTile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "@/lib/store/profile";
import { PlayerCountService } from "@/lib/firebase/playerCount";

export default function Home() {
  const { user, loading } = useRequireAuth();
  const achievements = useProfileStore((state) => state.achievements);
  const [playerCounts, setPlayerCounts] = React.useState({ online: 0, inGame: 0, lookingForGame: 0 });

  // Calculate achievement stats
  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalAchievements = achievements.length;

  // Subscribe to real player counts
  React.useEffect(() => {
    const service = PlayerCountService.getInstance();
    
    const handleCountUpdate = (counts: { online: number; inGame: number; lookingForGame: number }) => {
      setPlayerCounts(counts);
    };

    service.subscribeToPlayerCounts(handleCountUpdate);

    return () => {
      service.unsubscribeFromPlayerCounts();
    };
  }, []);

  // Mock data for live games (would be real in production)
  const liveGames = [
    { id: 1, white: "ChessMaster", black: "KnightRider", rating: "1850", timeLeft: "5:23", viewers: 42 },
    { id: 2, white: "QueenSlayer", black: "PawnStorm", rating: "2100", timeLeft: "12:45", viewers: 28 },
    { id: 3, white: "RookiePlayer", black: "BishopBoss", rating: "1650", timeLeft: "8:12", viewers: 15 },
  ];

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, useRequireAuth will redirect to login
  if (!user) {
    return null;
  }
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Chess Reforged
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience chess like never before with custom pieces, strategic army building, and competitive online play.
        </p>
      </div>

      {/* Main Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <NavTile
          href="/play/bot"
          title="Play vs Bot"
          description="Practice against AI opponents of varying difficulty"
          icon={Bot}
          gradient="gradient-card"
          badge="Quick Start"
          badgeIcon={Zap}
        />
        <NavTile
          href="/play/online"
          title="Play Online"
          description="Challenge players from around the world"
          icon={Users}
          gradient="gradient-card-emerald"
          badge={`${playerCounts.online.toLocaleString()} Online`}
          badgeIcon={Crown}
        />
        <NavTile
          href="/editor"
          title="Army Builder"
          description="Create custom armies within point budgets"
          icon={Sword}
          gradient="gradient-card-violet"
          badge="Creative"
          badgeIcon={Star}
        />
        <NavTile
          href="/shop"
          title="Shop"
          description="Unlock new pieces and cosmetics"
          icon={ShoppingBag}
          gradient="gradient-card-amber"
          badge="New Packs!"
        />
        <NavTile
          href="/inventory"
          title="Inventory"
          description="Manage pieces and apply cosmetics"
          icon={Package}
          gradient="gradient-card-cyan"
          badge="Customize"
        />
        <NavTile
          href="/achievements"
          title="Achievements"
          description="Track your progress and earn rewards"
          icon={Puzzle}
          gradient="gradient-card-rose"
          badge={`${achievedCount}/${totalAchievements} Unlocked`}
        />
      </div>

      {/* Watch Live Games Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Watch Live Games
          </h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveGames.map((game) => (
            <Card key={game.id} className="card-hover cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {game.viewers}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{game.white}</span>
                    <span className="text-sm text-muted-foreground">vs</span>
                    <span className="font-medium">{game.black}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Rating: {game.rating}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {game.timeLeft}
                    </div>
                  </div>
                </div>

                {/* Placeholder chess board */}
                <div className="chess-board w-full h-24 rounded border-2 border-amber-200 flex items-center justify-center">
                  <Play className="h-8 w-8 text-amber-700" />
                </div>

                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Watch Game
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
