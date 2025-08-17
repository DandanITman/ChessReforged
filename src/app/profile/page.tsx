"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Edit,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "@/lib/store/profile";
import { getRatingClass } from "@/lib/elo/eloSystem";

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const achievements = useProfileStore((state) => state.achievements);

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate stats from user profile
  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalGames = userProfile?.stats.gamesPlayed || 0;
  const wins = userProfile?.stats.wins || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const currentRating = userProfile?.ratings.standardCasual || 400;
  const ratingInfo = getRatingClass(currentRating);

  // Format join date
  const joinDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  const recentGames = [
    { id: 1, opponent: "KnightRider", result: "win", rating: "1823", time: "2 hours ago", opening: "Queen's Gambit" },
    { id: 2, opponent: "PawnStorm", result: "loss", rating: "1901", time: "1 day ago", opening: "Ruy Lopez" },
    { id: 3, opponent: "BishopBoss", result: "win", rating: "1756", time: "2 days ago", opening: "Sicilian Defense" },
    { id: 4, opponent: "RookMaster", result: "draw", rating: "1834", time: "3 days ago", opening: "English Opening" },
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
              {user.photoURL && (
                <AvatarImage src={user.photoURL} alt={user.displayName || ""} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.displayName || 'Anonymous Player'}</h1>
                  <Badge className={`${ratingInfo.color} border-0`}>
                    {ratingInfo.title}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-foreground leading-relaxed">
                  {userProfile?.settings.theme === 'dark' ? '🌙' : '☀️'} Chess enthusiast exploring custom army strategies
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)} Account
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {joinDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Level {userProfile?.level || 1}
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
              <div className="text-2xl font-bold">{currentRating}</div>
              <div className="text-sm text-white/80">Current Rating</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-emerald text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{winRate}%</div>
              <div className="text-sm text-white/80">Win Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-violet text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Trophy className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{totalGames}</div>
              <div className="text-sm text-white/80">Games Played</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover gradient-card-amber text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Star className="h-8 w-8 mx-auto" />
              <div className="text-2xl font-bold">{achievedCount}</div>
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
            {achievements.slice(0, 5).map((achievement) => (
              <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                achievement.achieved ? 'bg-primary/5 border-primary/20' : 'opacity-50'
              }`}>
                <Trophy className={`h-6 w-6 ${
                  achievement.achieved ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  {!achievement.achieved && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Progress: {achievement.progress}/{achievement.goal}
                    </div>
                  )}
                </div>
                {achievement.achieved && (
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
