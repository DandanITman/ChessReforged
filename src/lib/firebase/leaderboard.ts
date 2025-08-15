import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rank: number;
}

export interface GameHistoryEntry {
  id: string;
  opponent: {
    uid: string;
    displayName: string;
    rating: number;
  };
  result: 'win' | 'loss' | 'draw';
  gameType: 'standardCasual' | 'standardRanked' | 'classicalCasual' | 'classicalRanked';
  timeControl: string;
  duration: number; // in seconds
  moves: number;
  openingName?: string;
  endReason: 'checkmate' | 'resignation' | 'timeout' | 'draw_agreement' | 'stalemate';
  date: Date;
  ratingChange?: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: string;
  timeControl: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  entryFee?: number;
  isRegistered?: boolean;
}

export class LeaderboardService {
  private static instance: LeaderboardService;

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  async getLeaderboard(
    gameType: 'standard' | 'classical', 
    mode: 'casual' | 'ranked' = 'ranked',
    limitCount: number = 50
  ): Promise<LeaderboardEntry[]> {
    try {
      const ratingField = gameType === 'standard' 
        ? (mode === 'ranked' ? 'ratings.standardRanked' : 'ratings.standardCasual')
        : (mode === 'ranked' ? 'ratings.classicalRanked' : 'ratings.classicalCasual');

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('stats.gamesPlayed', '>', 0), // Only users who have played games
        orderBy(ratingField, 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const leaderboard: LeaderboardEntry[] = [];

      snapshot.docs.forEach((doc: QueryDocumentSnapshot, index: number) => {
        const data = doc.data();
        const rating = data.ratings?.[gameType === 'standard'
          ? (mode === 'ranked' ? 'standardRanked' : 'standardCasual')
          : (mode === 'ranked' ? 'classicalRanked' : 'classicalCasual')] || 400;

        leaderboard.push({
          uid: doc.id,
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || '/pieces/pawn_white.png',
          rating,
          gamesPlayed: data.stats?.gamesPlayed || 0,
          wins: data.stats?.wins || 0,
          losses: data.stats?.losses || 0,
          draws: data.stats?.draws || 0,
          winRate: data.stats?.gamesPlayed > 0
            ? Math.round((data.stats.wins / data.stats.gamesPlayed) * 100)
            : 0,
          rank: index + 1
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getUserGameHistory(userId: string, limitCount: number = 20): Promise<GameHistoryEntry[]> {
    // Mock data for now since we don't have actual game records yet
    // This will be implemented when we add the actual game playing functionality
    return this.getMockGameHistory(userId, limitCount);
  }

  async getUpcomingTournaments(): Promise<Tournament[]> {
    // Mock data for now - will be implemented with real tournament system later
    return this.getMockTournaments();
  }

  private getMockGameHistory(userId: string, limit: number): GameHistoryEntry[] {
    const mockHistory: GameHistoryEntry[] = [];
    const opponents = [
      { displayName: 'ChessMaster2024', rating: 1234 },
      { displayName: 'QueenSlayer', rating: 1156 },
      { displayName: 'RookiePlayer', rating: 987 },
      { displayName: 'KnightRider99', rating: 1345 },
      { displayName: 'PawnStorm', rating: 1098 },
    ];

    const results: ('win' | 'loss' | 'draw')[] = ['win', 'loss', 'draw'];
    const gameTypes: GameHistoryEntry['gameType'][] = ['standardRanked', 'classicalRanked', 'standardCasual', 'classicalCasual'];
    const endReasons: GameHistoryEntry['endReason'][] = ['checkmate', 'resignation', 'timeout', 'draw_agreement', 'stalemate'];
    const openings = ['Sicilian Defense', 'Queen\'s Gambit', 'Italian Game', 'Ruy Lopez', 'English Opening'];

    for (let i = 0; i < Math.min(limit, 15); i++) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const result = results[Math.floor(Math.random() * results.length)];
      const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      
      mockHistory.push({
        id: `game_${i + 1}`,
        opponent: {
          uid: `opponent_${i}`,
          displayName: opponent.displayName,
          rating: opponent.rating
        },
        result,
        gameType,
        timeControl: '10+0',
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
        moves: Math.floor(Math.random() * 60) + 20,
        openingName: openings[Math.floor(Math.random() * openings.length)],
        endReason: endReasons[Math.floor(Math.random() * endReasons.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        ratingChange: gameType.includes('Ranked') ? Math.floor(Math.random() * 40) - 20 : undefined
      });
    }

    return mockHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private getMockTournaments(): Tournament[] {
    const now = new Date();
    return [
      {
        id: 'weekend_blitz',
        name: 'Weekend Blitz Championship',
        description: 'Fast-paced 3+2 tournament for all skill levels',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        maxParticipants: 128,
        currentParticipants: 67,
        prizePool: '$500',
        timeControl: '3+2',
        status: 'upcoming',
        entryFee: 5,
        isRegistered: false
      },
      {
        id: 'monthly_classical',
        name: 'Monthly Classical Tournament',
        description: 'Long-form tournament with 30+0 time control',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // In 1 week
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        maxParticipants: 64,
        currentParticipants: 23,
        prizePool: '$1000',
        timeControl: '30+0',
        status: 'upcoming',
        entryFee: 10,
        isRegistered: false
      },
      {
        id: 'beginner_friendly',
        name: 'Beginner Friendly Tournament',
        description: 'For players under 1200 rating - learn and have fun!',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        maxParticipants: 256,
        currentParticipants: 142,
        prizePool: 'Trophies & Titles',
        timeControl: '10+0',
        status: 'upcoming',
        isRegistered: true
      },
      {
        id: 'grandmaster_arena',
        name: 'Grandmaster Arena',
        description: 'Elite tournament for 2000+ rated players',
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (ongoing)
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        maxParticipants: 32,
        currentParticipants: 32,
        prizePool: '$2500',
        timeControl: '15+10',
        status: 'ongoing',
        entryFee: 25
      }
    ];
  }
}