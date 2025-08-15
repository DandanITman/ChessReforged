"use client";

import { create } from "zustand";
import { Chess, type Square, type Color, type PieceSymbol, type Move } from "chess.js";
import { serverTimestamp } from 'firebase/firestore';
import {
  MultiplayerGame,
  GamePlayer,
  GameMove,
  GameType,
  TimeControl,
  multiplayerManager,
  matchmakingManager
} from "@/lib/firebase/multiplayer";
import { StatsSync } from "@/lib/firebase/dataSync";
import { SFX } from "@/lib/sound/sfx";

export type MultiplayerGameState = {
  // Current game
  currentGame: MultiplayerGame | null;
  gameId: string | null;
  
  // Local game state
  chess: Chess;
  fen: string;
  playerColor: Color | null;
  isMyTurn: boolean;
  
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Matchmaking
  isInMatchmaking: boolean;
  matchmakingType: GameType | null;
  
  // UI state
  selectedSquare: Square | null;
  highlightedSquares: Square[];
  lastMoveSquares: Square[];
  
  // Actions
  createGame: (gameType: GameType, timeControl: TimeControl, deckId?: string) => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  setReady: (deckId?: string) => Promise<void>;
  makeMove: (from: Square, to: Square) => Promise<boolean>;
  resign: () => Promise<void>;
  leaveGame: () => void;
  
  // Matchmaking actions
  joinMatchmaking: (gameType: GameType, timeControl: TimeControl, deckId?: string) => Promise<void>;
  leaveMatchmaking: () => Promise<void>;
  
  // UI actions
  setSelectedSquare: (square: Square | null) => void;
  
  // Game subscription
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: () => void;
  
  // Helper methods
  board: () => (({ square: Square; type: PieceSymbol; color: Color } | null)[])[];
  legalMoves: (from: Square) => { from: Square; to: Square; san: string }[];
  isGameOver: () => boolean;
  getGameStatus: () => string;
  getTimeRemaining: () => { white: number; black: number } | null;
};

export const useMultiplayerGameStore = create<MultiplayerGameState>((set, get) => {
  const game = new Chess();
  let gameSubscription: (() => void) | null = null;
  let matchmakingSubscription: (() => void) | null = null;

  // Helper to get current user info
  const getCurrentUser = (): { uid: string; displayName: string; photoURL?: string; rating: number } | null => {
    // This would be populated from auth context
    // For now, return placeholder
    return {
      uid: 'current-user-uid',
      displayName: 'Player',
      rating: 1200
    };
  };

  const updateGameState = (gameData: MultiplayerGame | null) => {
    if (!gameData) {
      set({
        currentGame: null,
        gameId: null,
        fen: game.fen(),
        isMyTurn: false,
        isConnected: false
      });
      return;
    }

    // Load game position
    try {
      game.load(gameData.fen);
    } catch (error) {
      console.error('Error loading game FEN:', error);
    }

    const currentUser = getCurrentUser();
    const playerColor = gameData.players.find(p => p.uid === currentUser?.uid)?.color || null;
    const isMyTurn = gameData.currentTurn === playerColor && gameData.status === 'active';

    // Update last move highlights
    const lastMove = gameData.moves[gameData.moves.length - 1];
    const lastMoveSquares = lastMove ? [lastMove.from, lastMove.to] : [];

    set({
      currentGame: gameData,
      fen: gameData.fen,
      playerColor,
      isMyTurn,
      isConnected: true,
      lastMoveSquares
    });

    // Play move sound if this is a new move
    if (lastMove && get().currentGame?.moves.length !== gameData.moves.length) {
      if (lastMove.captured) {
        SFX.capture();
      } else {
        SFX.drop();
      }
    }

    // Check for game over conditions
    if (gameData.status === 'finished') {
      handleGameEnd(gameData);
    }
  };

  const handleGameEnd = async (gameData: MultiplayerGame) => {
    if (!gameData.result) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const playerColor = gameData.players.find(p => p.uid === currentUser.uid)?.color;
    if (!playerColor) return;

    // Determine outcome for this player
    let outcome: 'win' | 'loss' | 'draw';
    if (gameData.result.reason === 'draw') {
      outcome = 'draw';
      SFX.draw();
    } else if (gameData.result.winner === playerColor) {
      outcome = 'win';
      SFX.win();
    } else {
      outcome = 'loss';
      SFX.loss();
    }

    // Update game statistics
    try {
      await StatsSync.updateGameStats(currentUser.uid, outcome);
      
      // Update ELO rating for ranked games
      if (gameData.type.includes('Ranked')) {
        const gameTypeKey = gameData.type as 'standardRanked' | 'classicalRanked';
        // Would calculate new rating based on opponent rating and outcome
        const newRating = currentUser.rating + (outcome === 'win' ? 20 : outcome === 'loss' ? -20 : 0);
        await StatsSync.updateEloRating(currentUser.uid, gameTypeKey, newRating);
      }
    } catch (error) {
      console.error('Error updating game statistics:', error);
    }
  };

  return {
    // Initial state
    currentGame: null,
    gameId: null,
    chess: game,
    fen: game.fen(),
    playerColor: null,
    isMyTurn: false,
    isConnected: false,
    isLoading: false,
    error: null,
    isInMatchmaking: false,
    matchmakingType: null,
    selectedSquare: null,
    highlightedSquares: [],
    lastMoveSquares: [],

    // Game management
    async createGame(gameType: GameType, timeControl: TimeControl, deckId?: string) {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      set({ isLoading: true, error: null });

      try {
        const player: GamePlayer = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          color: 'w', // Creator gets white by default
          rating: currentUser.rating,
          isReady: false,
          connected: true,
          lastSeen: serverTimestamp(),
          deckId
        };

        const gameId = await multiplayerManager.createGame(player, gameType, timeControl, deckId);
        
        set({ 
          gameId,
          isLoading: false 
        });

        // Subscribe to game updates
        get().subscribeToGame(gameId);

        return gameId;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create game' 
        });
        throw error;
      }
    },

    async joinGame(gameId: string) {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      set({ isLoading: true, error: null });

      try {
        const player: GamePlayer = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          color: 'b', // Will be assigned by the server
          rating: currentUser.rating,
          isReady: false,
          connected: true,
          lastSeen: serverTimestamp()
        };

        await multiplayerManager.joinGame(gameId, player);
        
        set({ 
          gameId,
          isLoading: false 
        });

        // Subscribe to game updates
        get().subscribeToGame(gameId);
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to join game' 
        });
        throw error;
      }
    },

    async setReady(deckId?: string) {
      const { gameId } = get();
      const currentUser = getCurrentUser();
      if (!gameId || !currentUser) return;

      try {
        await multiplayerManager.setPlayerReady(gameId, currentUser.uid, deckId);
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to set ready' });
      }
    },

    async makeMove(from: Square, to: Square) {
      const { currentGame, gameId, chess, playerColor } = get();
      const currentUser = getCurrentUser();
      
      if (!currentGame || !gameId || !currentUser || !playerColor) {
        return false;
      }

      if (currentGame.currentTurn !== playerColor) {
        return false;
      }

      try {
        // Validate move locally first
        const move = chess.move({ from, to, promotion: 'q' });
        if (!move) return false;

        // Create move object for Firebase
        const gameMove: Omit<GameMove, 'timestamp' | 'moveNumber'> = {
          from,
          to,
          piece: move.piece as PieceSymbol,
          captured: move.captured as PieceSymbol | undefined,
          promotion: move.promotion as PieceSymbol | undefined,
          san: move.san,
          fen: chess.fen()
        };

        // Send move to Firebase
        await multiplayerManager.makeMove(gameId, currentUser.uid, gameMove);

        // Clear selection
        set({ selectedSquare: null, highlightedSquares: [] });

        return true;
      } catch (error) {
        // Revert local move if Firebase update failed
        chess.undo();
        console.error('Failed to make move:', error);
        return false;
      }
    },

    async resign() {
      const { currentGame, gameId } = get();
      const currentUser = getCurrentUser();
      
      if (!currentGame || !gameId || !currentUser) return;

      try {
        const result = {
          winner: currentGame.players.find(p => p.uid !== currentUser.uid)?.color as Color,
          reason: 'resignation' as const,
          finalFen: currentGame.fen
        };

        await multiplayerManager.endGame(gameId, result);
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to resign' });
      }
    },

    leaveGame() {
      get().unsubscribeFromGame();
      set({
        currentGame: null,
        gameId: null,
        fen: new Chess().fen(),
        playerColor: null,
        isMyTurn: false,
        isConnected: false,
        selectedSquare: null,
        highlightedSquares: [],
        lastMoveSquares: []
      });
    },

    // Matchmaking
    async joinMatchmaking(gameType: GameType, timeControl: TimeControl, deckId?: string) {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      set({ isLoading: true, error: null });

      try {
        const entry = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          rating: currentUser.rating,
          gameType,
          timeControl,
          deckId
        };

        await matchmakingManager.joinMatchmaking(entry);
        set({ 
          isInMatchmaking: true, 
          matchmakingType: gameType,
          isLoading: false 
        });

        // Subscribe to matchmaking updates
        matchmakingSubscription = matchmakingManager.subscribeToMatchmaking(
          currentUser.uid,
          (entry) => {
            if (!entry) {
              set({ isInMatchmaking: false, matchmakingType: null });
            }
          }
        );
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to join matchmaking' 
        });
      }
    },

    async leaveMatchmaking() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      try {
        await matchmakingManager.leaveMatchmaking(currentUser.uid);
        
        if (matchmakingSubscription) {
          matchmakingSubscription();
          matchmakingSubscription = null;
        }

        set({ 
          isInMatchmaking: false, 
          matchmakingType: null 
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to leave matchmaking' });
      }
    },

    // UI actions
    setSelectedSquare(square: Square | null) {
      const { chess } = get();
      let highlightedSquares: Square[] = [];

      if (square) {
        // Get legal moves for this square
        const moves = chess.moves({ square, verbose: true }) as Move[];
        highlightedSquares = moves.map(move => move.to as Square);
      }

      set({ selectedSquare: square, highlightedSquares });
    },

    // Game subscription
    subscribeToGame(gameId: string) {
      // Unsubscribe from any existing subscription
      get().unsubscribeFromGame();

      gameSubscription = multiplayerManager.subscribeToGame(gameId, (gameData) => {
        updateGameState(gameData);
      });
    },

    unsubscribeFromGame() {
      if (gameSubscription) {
        gameSubscription();
        gameSubscription = null;
      }
    },

    // Helper methods
    board() {
      return get().chess.board().map((rank, rankIdx) =>
        rank.map((p, fileIdx) => {
          if (!p) return null;
          const file = String.fromCharCode("a".charCodeAt(0) + fileIdx);
          const algebraic = (file + (8 - rankIdx)) as Square;
          return {
            square: algebraic,
            type: p.type,
            color: p.color,
          };
        }),
      );
    },

    legalMoves(from: Square) {
      try {
        const { chess } = get();
        const verbose = chess.moves({ square: from, verbose: true }) as Move[];
        return verbose.map((m) => ({ 
          from: m.from as Square, 
          to: m.to as Square, 
          san: m.san 
        }));
      } catch {
        return [];
      }
    },

    isGameOver() {
      const { currentGame } = get();
      return currentGame?.status === 'finished' || get().chess.isGameOver();
    },

    getGameStatus() {
      const { currentGame, playerColor, isMyTurn } = get();
      
      if (!currentGame) return 'Not in game';
      
      if (currentGame.status === 'waiting') {
        return 'Waiting for opponent...';
      }
      
      if (currentGame.status === 'starting') {
        return 'Game starting...';
      }
      
      if (currentGame.status === 'finished') {
        if (currentGame.result) {
          const { winner, reason } = currentGame.result;
          if (reason === 'draw') return 'Game drawn';
          
          const winnerName = currentGame.players.find(p => p.color === winner)?.displayName || 'Unknown';
          return `${winnerName} wins by ${reason}`;
        }
        return 'Game finished';
      }
      
      if (isMyTurn) {
        return 'Your turn';
      } else {
        const opponentName = currentGame.players.find(p => p.color !== playerColor)?.displayName || 'Opponent';
        return `${opponentName}'s turn`;
      }
    },

    getTimeRemaining() {
      const { currentGame } = get();
      return currentGame?.timeRemaining || null;
    }
  };
});