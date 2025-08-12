"use client";

import { create } from "zustand";
import { Chess, type Square, type Color, type PieceSymbol } from "chess.js";
import { SimpleChessBot } from "@/lib/bot/SimpleBot";

export type BotBoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

type BotGameState = {
  chess: Chess;
  fen: string;
  turn: Color;
  isPlayerTurn: boolean;
  isBotThinking: boolean;
  botColor: Color;
  playerColor: Color;
  gameMode: 'human-vs-human' | 'human-vs-bot';
  
  // Actions
  makeMove(from: Square, to: Square): Promise<boolean>;
  makeBotMove(): Promise<void>;
  reset(playerColor?: Color): void;
  setGameMode(mode: 'human-vs-human' | 'human-vs-bot'): void;
  
  // Helpers
  board(): (BotBoardSquare[])[];
  legalMoves(from: Square): { from: Square; to: Square; san: string }[];
  isGameOver(): boolean;
  getGameStatus(): string;
};

const bot = new SimpleChessBot();

export const useBotGameStore = create<BotGameState>((set, get) => {
  const game = new Chess();
  
  return {
    chess: game,
    fen: game.fen(),
    turn: game.turn(),
    isPlayerTurn: true,
    isBotThinking: false,
    botColor: 'b',
    playerColor: 'w',
    gameMode: 'human-vs-bot',
    
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
    
    legalMoves(from) {
      try {
        const moves = get()
          .chess.moves({ square: from, verbose: true })
          .map((m) => ({ from: m.from as Square, to: m.to as Square, san: m.san }));
        return moves;
      } catch {
        return [];
      }
    },
    
    async makeMove(from, to) {
      const state = get();
      
      // Check if it's the player's turn
      if (state.gameMode === 'human-vs-bot' && !state.isPlayerTurn) {
        return false;
      }
      
      try {
        const move = state.chess.move({ from, to, promotion: "q" });
        if (!move) return false;
        
        const newFen = state.chess.fen();
        const newTurn = state.chess.turn();
        
        set({ 
          fen: newFen, 
          turn: newTurn,
          isPlayerTurn: state.gameMode === 'human-vs-human' || newTurn === state.playerColor
        });
        
        // If it's bot mode and now it's bot's turn, make bot move
        if (state.gameMode === 'human-vs-bot' && newTurn === state.botColor && !state.chess.isGameOver()) {
          setTimeout(() => {
            get().makeBotMove();
          }, 500); // Small delay to make it feel natural
        }
        
        return true;
      } catch {
        return false;
      }
    },
    
    async makeBotMove() {
      const state = get();
      
      if (state.chess.isGameOver() || state.turn !== state.botColor) {
        return;
      }
      
      set({ isBotThinking: true });
      
      try {
        // Add a small delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const bestMove = bot.getBestMoveWithEvaluation(state.fen);
        
        if (bestMove && bestMove.length >= 4) {
          const from = bestMove.slice(0, 2) as Square;
          const to = bestMove.slice(2, 4) as Square;
          const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
          
          const move = state.chess.move({ 
            from, 
            to, 
            promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined 
          });
          
          if (move) {
            const newFen = state.chess.fen();
            const newTurn = state.chess.turn();
            
            set({ 
              fen: newFen, 
              turn: newTurn,
              isPlayerTurn: newTurn === state.playerColor,
              isBotThinking: false
            });
          } else {
            set({ isBotThinking: false });
          }
        } else {
          set({ isBotThinking: false });
        }
      } catch (error) {
        console.error('Bot move error:', error);
        set({ isBotThinking: false });
      }
    },
    
    reset(playerColor = 'w') {
      const chess = new Chess();
      set({
        chess,
        fen: chess.fen(),
        turn: chess.turn(),
        playerColor,
        botColor: playerColor === 'w' ? 'b' : 'w',
        isPlayerTurn: playerColor === 'w',
        isBotThinking: false
      });
      
      // If player chose black, bot makes first move
      if (playerColor === 'b') {
        setTimeout(() => {
          get().makeBotMove();
        }, 500);
      }
    },
    
    setGameMode(mode) {
      set({ gameMode: mode });
      if (mode === 'human-vs-bot') {
        get().reset('w'); // Reset with player as white
      }
    },
    
    isGameOver() {
      return get().chess.isGameOver();
    },
    
    getGameStatus() {
      const state = get();
      
      if (state.chess.isCheckmate()) {
        const winner = state.turn === 'w' ? 'Black' : 'White';
        return `Checkmate! ${winner} wins!`;
      }
      
      if (state.chess.isDraw()) {
        if (state.chess.isStalemate()) {
          return 'Draw by stalemate';
        }
        if (state.chess.isThreefoldRepetition()) {
          return 'Draw by threefold repetition';
        }
        if (state.chess.isInsufficientMaterial()) {
          return 'Draw by insufficient material';
        }
        return 'Draw';
      }
      
      if (state.chess.isCheck()) {
        return `${state.turn === 'w' ? 'White' : 'Black'} is in check`;
      }
      
      if (state.isBotThinking) {
        return 'Bot is thinking...';
      }
      
      return `${state.turn === 'w' ? 'White' : 'Black'} to move`;
    }
  };
});
