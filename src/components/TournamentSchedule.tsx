"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  DollarSign,
  MapPin,
  ChevronRight,
  CalendarDays,
  Timer,
  Star,
  Award
} from "lucide-react";
import { LeaderboardService, Tournament } from "@/lib/firebase/leaderboard";

interface TournamentScheduleProps {
  className?: string;
}

export function TournamentSchedule({ className }: TournamentScheduleProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('upcoming');

  useEffect(() => {
    const loadTournaments = async () => {
      setIsLoading(true);
      try {
        const leaderboardService = LeaderboardService.getInstance();
        const tournamentList = await leaderboardService.getUpcomingTournaments();
        setTournaments(tournamentList);
      } catch (error) {
        console.error('Error loading tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(tournament => 
    filter === 'all' || tournament.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'ongoing':
        return <Trophy className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <Award className="h-4 w-4 text-gray-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0) {
      const pastDays = Math.abs(diffDays);
      if (pastDays === 1) return 'Yesterday';
      if (pastDays < 7) return `${pastDays} days ago`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRegister = (tournament: Tournament) => {
    // Mock registration - would implement real logic here
    console.log('Registering for tournament:', tournament.id);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Tournament Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ongoing')}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Live
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Past
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-20 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tournaments found</p>
              <p className="text-sm">Check back later for upcoming events!</p>
            </div>
          ) : (
            filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  tournament.status === 'ongoing' 
                    ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20' 
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tournament.status)}
                        <h3 className="font-semibold text-lg">{tournament.name}</h3>
                        {tournament.status === 'ongoing' && (
                          <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.description}</p>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>

                  {/* Tournament Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatDate(tournament.startDate)}</div>
                        <div className="text-muted-foreground">{formatTime(tournament.startDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{tournament.timeControl}</div>
                        <div className="text-muted-foreground">Time control</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {tournament.currentParticipants}/{tournament.maxParticipants}
                        </div>
                        <div className="text-muted-foreground">Players</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{tournament.prizePool}</div>
                        <div className="text-muted-foreground">Prize pool</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {tournament.entryFee && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${tournament.entryFee}
                        </Badge>
                      )}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ 
                            width: `${(tournament.currentParticipants / tournament.maxParticipants) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {tournament.status === 'upcoming' && (
                        <Button
                          size="sm"
                          variant={tournament.isRegistered ? "outline" : "default"}
                          onClick={() => handleRegister(tournament)}
                          disabled={tournament.currentParticipants >= tournament.maxParticipants}
                        >
                          {tournament.isRegistered ? 'Registered' : 'Register'}
                        </Button>
                      )}
                      {tournament.status === 'ongoing' && (
                        <Button size="sm" variant="outline">
                          View Live
                        </Button>
                      )}
                      {tournament.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          Results
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredTournaments.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Tournaments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}