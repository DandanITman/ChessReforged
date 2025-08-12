"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  Edit,
  Crown,
  Zap,
  Star,
  Medal
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  // Mock user data
  const user = {
    username: "ChessReforged",
    displayName: "Chess Master",
    bio: "Passionate chess player exploring new strategies and custom army compositions. Always looking for challenging opponents!",
    location: "New York, USA",
    joinDate: "January 2024",
    rating: 1847,
    rank: "Expert",
    gamesPlayed: 342,
    winRate: 68,
    favoriteOpening: "Sicilian Defense",
    playtime: "127 hours"
  };

  const recentGames = [
    { id: 1, opponent: "KnightRider", result: "win", rating: "1823", time: "2 hours ago", opening: "Queen's Gambit" },
    { id: 2, opponent: "PawnStorm", result: "loss", rating: "1901", time: "1 day ago", opening: "Ruy Lopez" },
    { id: 3, opponent: "BishopBoss", result: "win", rating: "1756", time: "2 days ago", opening: "Sicilian Defense" },
    { id: 4, opponent: "RookMaster", result: "draw", rating: "1834", time: "3 days ago", opening: "English Opening" },
  ];

  const achievements = [
    { id: 1, name: "First Victory", description: "Win your first game", icon: Trophy, earned: true },
    { id: 2, name: "Speed Demon", description: "Win 10 blitz games", icon: Zap, earned: true },
    { id: 3, name: "Army Builder", description: "Create 5 custom armies", icon: Crown, earned: true },
    { id: 4, name: "Perfectionist", description: "Win a game without losing pieces", icon: Star, earned: false },
    { id: 5, name: "Grand Master", description: "Reach 2000+ rating", icon: Medal, earned: false },
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-100 text-green-800 border-green-200';
      case 'loss': return 'bg-red-100 text-red-800 border-red-200';
      case 'draw': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="card-hover">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="size-24 ring-4 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                CR
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.displayName}</h1>
                  <Badge className="gradient-card text-white border-0">
                    {user.rank}
                  </Badge>
                </div>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-foreground leading-relaxed">{user.bio}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {user.joinDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {user.playtime} played
                </div>
              </div>
            </div>
            
            <Link href="/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover gradient-card text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Target className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{user.rating}</div>
              <div className="text-sm text-white/80">Current Rating</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-emerald text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{user.winRate}%</div>
              <div className="text-sm text-white/80">Win Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-violet text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Trophy className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{user.gamesPlayed}</div>
              <div className="text-sm text-white/80">Games Played</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-amber text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Star className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-white/80">Achievements</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Games */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Games
            </CardTitle>
            <CardDescription>Your latest matches and results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">vs {game.opponent}</span>
                    <Badge className={getResultColor(game.result)}>
                      {game.result.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {game.opening} • Rating: {game.rating}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {game.time}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Games
            </Button>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Your progress and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                achievement.earned ? 'bg-primary/5 border-primary/20' : 'opacity-50'
              }`}>
                <achievement.icon className={`h-6 w-6 ${
                  achievement.earned ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
                {achievement.earned && (
                  <Badge className="gradient-card text-white border-0">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
            <Link href="/achievements">
              <Button variant="outline" className="w-full">
                View All Achievements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
