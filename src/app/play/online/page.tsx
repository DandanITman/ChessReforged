"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Crown,
  Trophy,
  Clock,
  Zap,
  Target,
  UserPlus,
  Sword,
  ChevronRight,
  Star,
  Timer,
  Globe,
  Search
} from "lucide-react";
import { getRatingClass, getRatingPercentile } from "@/lib/elo/eloSystem";
import { useMultiplayerGameStore } from "@/lib/store/multiplayerGame";
import { useAuth } from "@/contexts/AuthContext";
import type { GameType, TimeControl } from "@/lib/firebase/multiplayer";

type GameMode = 'casual' | 'ranked' | 'friend';
type LocalGameType = 'standard' | 'classical';
type LocalTimeControl = '1+0' | '3+0' | '3+2' | '5+0' | '10+0' | '15+10' | '30+0';

export default function PlayOnlinePage() {
  const { user } = useAuth();
  const {
    isInMatchmaking,
    matchmakingType,
    currentGame,
    isLoading,
    error,
    joinMatchmaking,
    leaveMatchmaking,
    createGame
  } = useMultiplayerGameStore();
  
  const [selectedMode, setSelectedMode] = useState<GameMode>('casual');
  const [selectedGameType, setSelectedGameType] = useState<LocalGameType>('standard');
  const [selectedTimeControl, setSelectedTimeControl] = useState<LocalTimeControl>('10+0');

  // Mock user stats (would come from profile store)
  const userStats = {
    rating: 1247,
    gamesPlayed: 156,
    wins: 89,
    losses: 52,
    draws: 15,
    winRate: 57
  };

  const ratingInfo = getRatingClass(userStats.rating);
  const percentile = getRatingPercentile(userStats.rating);

  const timeControls = [
    { value: '1+0', label: '1 min', description: 'Bullet' },
    { value: '3+0', label: '3 min', description: 'Blitz' },
    { value: '3+2', label: '3+2', description: 'Blitz' },
    { value: '5+0', label: '5 min', description: 'Blitz' },
    { value: '10+0', label: '10 min', description: 'Rapid' },
    { value: '15+10', label: '15+10', description: 'Rapid' },
    { value: '30+0', label: '30 min', description: 'Classical' }
  ];

  // Convert local types to Firebase types
  const getFirebaseGameType = (): GameType => {
    if (selectedGameType === 'standard') {
      return selectedMode === 'ranked' ? 'standardRanked' : 'standardCasual';
    } else {
      return selectedMode === 'ranked' ? 'classicalRanked' : 'classicalCasual';
    }
  };

  const getFirebaseTimeControl = (): TimeControl => {
    // Map local time control to Firebase time control
    const mapping: Record<LocalTimeControl, TimeControl> = {
      '1+0': '3+0', // Map 1+0 to 3+0 since Firebase doesn't have 1+0
      '3+0': '3+0',
      '3+2': '3+0', // Map 3+2 to 3+0 for simplicity
      '5+0': '5+0',
      '10+0': '10+0',
      '15+10': '15+10',
      '30+0': '30+0'
    };
    return mapping[selectedTimeControl];
  };

  const handleStartSearch = async () => {
    if (!user) return;

    if (isInMatchmaking) {
      await leaveMatchmaking();
    } else {
      try {
        const gameType = getFirebaseGameType();
        const timeControl = getFirebaseTimeControl();
        await joinMatchmaking(gameType, timeControl);
      } catch (error) {
        console.error('Failed to join matchmaking:', error);
      }
    }
  };

  const handleCreatePrivateGame = async () => {
    if (!user) return;

    try {
      const gameType = getFirebaseGameType();
      const timeControl = getFirebaseTimeControl();
      const gameId = await createGame(gameType, timeControl);
      console.log('Created private game:', gameId);
      // Could show game link or redirect
    } catch (error) {
      console.error('Failed to create private game:', error);
    }
  };

  useEffect(() => {
    // Redirect to game if already in one
    if (currentGame) {
      console.log('Already in game:', currentGame.id);
      // Could redirect to game page here
    }
  }, [currentGame]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          Play Online
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Challenge players worldwide in casual games, climb the ranked ladder, or play with friends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Mode Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Game Mode
              </CardTitle>
              <CardDescription>Choose how you want to play</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setSelectedMode('casual')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMode === 'casual'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Casual</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Play for fun without affecting your rating
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      No rating change
                    </Badge>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('ranked')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMode === 'ranked'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">Ranked</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Competitive games that affect your ELO rating
                    </p>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Rating changes
                    </Badge>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('friend')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMode === 'friend'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">vs Friend</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create a private game to play with friends
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Private game
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Type Selection */}
          {(selectedMode === 'casual' || selectedMode === 'ranked') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Game Type
                </CardTitle>
                <CardDescription>Choose the variant you want to play</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedGameType('standard')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedGameType === 'standard'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold">Standard Game</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Play with custom army builds and unique pieces
                      </p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Custom armies
                      </Badge>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedGameType('classical')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedGameType === 'classical'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold">Classical Game</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Traditional chess with standard starting position
                      </p>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        Standard chess
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Control Selection */}
          {selectedMode !== 'friend' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Time Control
                </CardTitle>
                <CardDescription>Choose your preferred time limit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeControls.map((control) => (
                    <div
                      key={control.value}
                      onClick={() => setSelectedTimeControl(control.value as LocalTimeControl)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        selectedTimeControl === control.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">{control.label}</div>
                      <div className="text-xs text-muted-foreground">{control.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Game Button */}
          <Card>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-900/50 border border-red-700">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!user && (
                <div className="mb-4 p-3 rounded-md bg-yellow-900/50 border border-yellow-700">
                  <p className="text-sm text-yellow-300 text-center">
                    Please sign in to play online matches
                  </p>
                </div>
              )}

              {selectedMode === 'friend' ? (
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleCreatePrivateGame}
                    disabled={!user || isLoading}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Private Game
                  </Button>
                  <div className="text-center">
                    <Button variant="outline" size="sm" disabled>
                      Join Game by Code
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleStartSearch}
                    disabled={!user || isLoading}
                  >
                    {isInMatchmaking ? (
                      <>
                        <Search className="h-5 w-5 mr-2 animate-spin" />
                        Cancel Search
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Find Match
                      </>
                    )}
                  </Button>

                  {isInMatchmaking && (
                    <div className="mt-4 p-4 rounded-lg bg-blue-900/30 border border-blue-700">
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-blue-400 animate-spin" />
                        <div>
                          <p className="text-white font-medium">Searching for opponent...</p>
                          <p className="text-gray-400 text-sm">
                            {selectedMode} • {selectedGameType} • {selectedTimeControl}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Player Stats Sidebar */}
        <div className="space-y-6">
          {/* Rating Card */}
          {selectedMode === 'ranked' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userStats.rating}</div>
                  <div className={`text-sm font-medium ${ratingInfo.color}`}>
                    {ratingInfo.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Top {100 - percentile}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Games</span>
                    <span>{userStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span>{userStats.winRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Wins</span>
                    <span>{userStats.wins}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Losses</span>
                    <span>{userStats.losses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Draws</span>
                    <span>{userStats.draws}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                View Leaderboard
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Game History
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Tournament Schedule
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Online Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">1,247</div>
                <div className="text-sm text-muted-foreground">Players online</div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>In games</span>
                  <span>892</span>
                </div>
                <div className="flex justify-between">
                  <span>Looking for game</span>
                  <span>355</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}