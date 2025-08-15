import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';
import type { Square, Color, PieceSymbol } from 'chess.js';
import type { ExtendedPieceSymbol } from '@/lib/chess/placement';

// Game types and interfaces
export type GameType = 'standardCasual' | 'standardRanked' | 'classicalCasual' | 'classicalRanked';
export type GameStatus = 'waiting' | 'starting' | 'active' | 'finished' | 'abandoned';
export type TimeControl = '3+0' | '5+0' | '10+0' | '15+10' | '30+0' | 'unlimited';

export interface GameMove {
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  fen: string;
  timestamp: Timestamp | FieldValue;
  moveNumber: number;
  timeRemaining?: {
    white: number;
    black: number;
  };
}

export interface GamePlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
  color: Color;
  rating: number;
  isReady: boolean;
  connected: boolean;
  lastSeen: Timestamp | FieldValue;
  deckId?: string; // For custom army games
}

export interface MultiplayerGame {
  id: string;
  type: GameType;
  status: GameStatus;
  timeControl: TimeControl;
  
  // Players
  players: GamePlayer[];
  spectators: string[]; // UIDs of spectators
  
  // Game state
  fen: string;
  moves: GameMove[];
  currentTurn: Color;
  
  // Time management
  timeRemaining: {
    white: number; // milliseconds
    black: number; // milliseconds
  };
  lastMoveTime?: Timestamp | FieldValue;
  
  // Game outcome
  result?: {
    winner?: Color;
    reason: 'checkmate' | 'resignation' | 'timeout' | 'draw' | 'abandonment';
    finalFen: string;
  };
  
  // Custom armies (for standard games)
  customSetup?: {
    whiteDeckId: string;
    blackDeckId: string;
    customFen: string;
    pieceMapping: Record<Square, { actualType: ExtendedPieceSymbol; color: Color }>;
  };
  
  // Metadata
  createdAt: Timestamp | FieldValue;
  startedAt?: Timestamp | FieldValue;
  finishedAt?: Timestamp | FieldValue;
  createdBy: string;
}

export interface MatchmakingEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  gameType: GameType;
  timeControl: TimeControl;
  deckId?: string; // For custom army preferences
  createdAt: Timestamp | FieldValue;
  minRating?: number;
  maxRating?: number;
}

// Multiplayer game management
export class MultiplayerGameManager {
  private gameSubscriptions: Map<string, () => void> = new Map();

  // Create a new game
  async createGame(
    creator: GamePlayer,
    gameType: GameType,
    timeControl: TimeControl,
    deckId?: string
  ): Promise<string> {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const game: MultiplayerGame = {
      id: gameId,
      type: gameType,
      status: 'waiting',
      timeControl,
      players: [{ ...creator, isReady: false, connected: true, lastSeen: serverTimestamp() }],
      spectators: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Standard starting position
      moves: [],
      currentTurn: 'w',
      timeRemaining: this.getTimeControlMilliseconds(timeControl),
      createdAt: serverTimestamp(),
      createdBy: creator.uid
    };

    // Add custom setup if this is a standard game with custom armies
    if ((gameType === 'standardCasual' || gameType === 'standardRanked') && deckId) {
      // This would be populated with actual deck data when second player joins
      game.customSetup = {
        whiteDeckId: creator.color === 'w' ? deckId : '',
        blackDeckId: creator.color === 'b' ? deckId : '',
        customFen: '', // Will be set when both players ready
        pieceMapping: {} as Record<Square, { actualType: ExtendedPieceSymbol; color: Color }>
      };
    }

    await setDoc(doc(db, 'games', gameId), game);
    return gameId;
  }

  // Join an existing game
  async joinGame(gameId: string, player: GamePlayer): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameSnap.data() as MultiplayerGame;
    
    if (gameData.players.length >= 2) {
      throw new Error('Game is full');
    }

    if (gameData.status !== 'waiting') {
      throw new Error('Game is no longer accepting players');
    }

    // Assign opposite color to the second player
    const assignedColor: Color = gameData.players[0].color === 'w' ? 'b' : 'w';
    const newPlayer: GamePlayer = {
      ...player,
      color: assignedColor,
      isReady: false,
      connected: true,
      lastSeen: serverTimestamp()
    };

    await updateDoc(gameRef, {
      players: [...gameData.players, newPlayer],
      status: 'starting'
    });
  }

  // Mark player as ready
  async setPlayerReady(gameId: string, uid: string, deckId?: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameSnap.data() as MultiplayerGame;
    const playerIndex = gameData.players.findIndex(p => p.uid === uid);
    
    if (playerIndex === -1) {
      throw new Error('Player not in game');
    }

    const updatedPlayers = [...gameData.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      isReady: true,
      deckId: deckId || updatedPlayers[playerIndex].deckId
    };

    const updates: Partial<MultiplayerGame> = {
      players: updatedPlayers
    };

    // If both players are ready, start the game
    if (updatedPlayers.every(p => p.isReady)) {
      updates.status = 'active';
      updates.startedAt = serverTimestamp();
      updates.lastMoveTime = serverTimestamp();

      // Set up custom armies if needed
      if (gameData.customSetup) {
        const whitePlayer = updatedPlayers.find(p => p.color === 'w');
        const blackPlayer = updatedPlayers.find(p => p.color === 'b');
        
        if (whitePlayer?.deckId && blackPlayer?.deckId) {
          updates.customSetup = {
            ...gameData.customSetup,
            whiteDeckId: whitePlayer.deckId,
            blackDeckId: blackPlayer.deckId
            // customFen and pieceMapping would be set based on deck data
          };
        }
      }
    }

    await updateDoc(gameRef, updates);
  }

  // Make a move in the game
  async makeMove(
    gameId: string, 
    uid: string, 
    move: Omit<GameMove, 'timestamp' | 'moveNumber'>
  ): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameSnap.data() as MultiplayerGame;
    
    if (gameData.status !== 'active') {
      throw new Error('Game is not active');
    }

    const player = gameData.players.find(p => p.uid === uid);
    if (!player) {
      throw new Error('Player not in game');
    }

    if (player.color !== gameData.currentTurn) {
      throw new Error('Not your turn');
    }

    const now = serverTimestamp();
    const moveNumber = Math.floor(gameData.moves.length / 2) + 1;
    
    const gameMove: GameMove = {
      ...move,
      timestamp: now,
      moveNumber
    };

    // Calculate time remaining if not unlimited
    const updatedTimeRemaining = { ...gameData.timeRemaining };
    if (gameData.timeControl !== 'unlimited' && gameData.lastMoveTime && 'toMillis' in gameData.lastMoveTime) {
      const timeElapsed = Date.now() - gameData.lastMoveTime.toMillis();
      const currentPlayerColor = gameData.currentTurn === 'w' ? 'white' : 'black';
      updatedTimeRemaining[currentPlayerColor] = Math.max(0,
        updatedTimeRemaining[currentPlayerColor] - timeElapsed
      );
      
      // Add increment for time controls with increment (like 15+10)
      if (gameData.timeControl.includes('+')) {
        const increment = parseInt(gameData.timeControl.split('+')[1]) * 1000;
        updatedTimeRemaining[currentPlayerColor] += increment;
      }
    }

    gameMove.timeRemaining = updatedTimeRemaining;

    const updates: Record<string, unknown> = {
      moves: arrayUnion(gameMove),
      fen: move.fen,
      currentTurn: gameData.currentTurn === 'w' ? 'b' : 'w',
      timeRemaining: updatedTimeRemaining,
      lastMoveTime: now
    };

    await updateDoc(gameRef, updates);
  }

  // End the game
  async endGame(
    gameId: string, 
    result: MultiplayerGame['result']
  ): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    
    await updateDoc(gameRef, {
      status: 'finished',
      result,
      finishedAt: serverTimestamp()
    });

    // Update player ratings if this was a ranked game
    // This would involve calling the ELO system and updating user profiles
  }

  // Subscribe to game updates
  subscribeToGame(gameId: string, callback: (game: MultiplayerGame | null) => void): () => void {
    const gameRef = doc(db, 'games', gameId);
    
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as MultiplayerGame;
        callback(gameData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to game:', error);
      callback(null);
    });

    this.gameSubscriptions.set(gameId, unsubscribe);
    return unsubscribe;
  }

  // Unsubscribe from game updates
  unsubscribeFromGame(gameId: string): void {
    const unsubscribe = this.gameSubscriptions.get(gameId);
    if (unsubscribe) {
      unsubscribe();
      this.gameSubscriptions.delete(gameId);
    }
  }

  // Update player connection status
  async updatePlayerConnection(gameId: string, uid: string, connected: boolean): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) return;

    const gameData = gameSnap.data() as MultiplayerGame;
    const playerIndex = gameData.players.findIndex(p => p.uid === uid);
    
    if (playerIndex === -1) return;

    const updatedPlayers = [...gameData.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      connected,
      lastSeen: serverTimestamp()
    };

    await updateDoc(gameRef, {
      players: updatedPlayers
    });
  }

  // Helper to convert time control string to milliseconds
  private getTimeControlMilliseconds(timeControl: TimeControl): { white: number; black: number } {
    if (timeControl === 'unlimited') {
      return { white: Infinity, black: Infinity };
    }

    const minutes = parseInt(timeControl.split('+')[0]);
    const milliseconds = minutes * 60 * 1000;
    
    return { white: milliseconds, black: milliseconds };
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.gameSubscriptions.forEach(unsubscribe => unsubscribe());
    this.gameSubscriptions.clear();
  }
}

// Matchmaking system
export class MatchmakingManager {
  // Add player to matchmaking queue
  async joinMatchmaking(entry: Omit<MatchmakingEntry, 'createdAt'>): Promise<void> {
    const matchmakingRef = doc(db, 'matchmaking', entry.uid);
    
    await setDoc(matchmakingRef, {
      ...entry,
      createdAt: serverTimestamp()
    });
  }

  // Remove player from matchmaking queue
  async leaveMatchmaking(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'matchmaking', uid));
  }

  // Find potential matches
  async findMatches(
    gameType: GameType,
    rating: number,
    ratingRange: number = 200
  ): Promise<MatchmakingEntry[]> {
    // For now, return empty array - would implement proper matchmaking logic
    // when we have actual matchmaking requirements
    return [];
  }

  // Subscribe to matchmaking updates for a player
  subscribeToMatchmaking(
    uid: string, 
    callback: (entry: MatchmakingEntry | null) => void
  ): () => void {
    const entryRef = doc(db, 'matchmaking', uid);
    
    return onSnapshot(entryRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as MatchmakingEntry);
      } else {
        callback(null);
      }
    });
  }
}

// Export singleton instances
export const multiplayerManager = new MultiplayerGameManager();
export const matchmakingManager = new MatchmakingManager();