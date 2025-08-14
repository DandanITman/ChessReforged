"use client";

import { create } from "zustand";
import { Chess, type Square, type Color, type PieceSymbol, type Move } from "chess.js";
import { SimpleChessBot } from "@/lib/bot/SimpleBot";
import { SFX } from "@/lib/sound/sfx";
import type { CustomPieceMapping } from "@/lib/chess/deckSystem";
import type { ExtendedPieceSymbol } from "@/lib/chess/placement";
import { useProfileStore } from "@/lib/store/profile";

export type BotBoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

export type HistoryEntry = {
  ply: number;
  moveNumber: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenAfter: string;
};

type BotGameState = {
  chess: Chess;
  fen: string;
  turn: Color;
  isPlayerTurn: boolean;
  isBotThinking: boolean;
  botColor: Color;
  playerColor: Color;
  gameMode: 'human-vs-human' | 'human-vs-bot';
  difficulty: 'easy' | 'normal' | 'hard';
  resignedBy?: Color;
  rewardGranted: boolean;

  history: HistoryEntry[];
  capturedByWhite: PieceSymbol[]; // pieces White has captured (black pieces)
  capturedByBlack: PieceSymbol[]; // pieces Black has captured (white pieces)
  customPieceMapping: CustomPieceMapping;

  // Actions
  makeMove(from: Square, to: Square): Promise<boolean>;
  makeBotMove(): Promise<void>;
  reset(playerColor?: Color, customFen?: string, customMapping?: CustomPieceMapping): void;
  setGameMode(mode: 'human-vs-human' | 'human-vs-bot'): void;
  setDifficulty(d: 'easy' | 'normal' | 'hard'): void;
  resign(by: Color): void;

  // Helpers
  board(): (BotBoardSquare[])[];
  legalMoves(from: Square): { from: Square; to: Square; san: string }[];
  isGameOver(): boolean;
  getGameStatus(): string;
};

const bot = new SimpleChessBot();

/** Helpers for custom piece constraints and deltas */
function fileCode(sq: Square): number {
  return sq.charCodeAt(0);
}
function rankNum(sq: Square): number {
  return parseInt(sq[1] as string, 10);
}
function deltas(from: Square, to: Square) {
  const dx = fileCode(to) - fileCode(from);
  const dy = rankNum(to) - rankNum(from);
  return { dx, dy };
}
function isOrthogonal(dx: number, dy: number) {
  return dx === 0 || dy === 0;
}
function isDiagonal(dx: number, dy: number) {
  return Math.abs(dx) === Math.abs(dy);
}
function chebyshev(dx: number, dy: number) {
  return Math.max(Math.abs(dx), Math.abs(dy));
}

/**
 * Check if a verbose chess.js Move is allowed under our custom piece rules.
 * We restrict movement by filtering chess.js generated moves based on the
 * customPieceMapping actualType for the from-square.
 */
function isAllowedByCustom(move: Move, mapping: CustomPieceMapping): boolean {
  // Prevent pawn capturing Stone Sentinel
  if (move.piece === 'p' && mapping[move.to]?.actualType === 't' && move.flags.includes('c')) {
    return false;
  }

  const actual = mapping[move.from]?.actualType as ExtendedPieceSymbol | undefined;
  if (!actual) return true; // Standard piece (or no mapping) -> allow chess.js legality

  const { dx, dy } = deltas(move.from as Square, move.to as Square);
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const ch = chebyshev(dx, dy);
  const isCap = move.flags.includes('c');

  switch (actual) {
    case 'l': // Lion: exactly 2 squares in any direction
      return ch === 2;

    case 's': { // Soldier: forward 1 (no capture), diagonal capture 1, sideways 1 (no capture)
      const forward = move.color === 'w' ? 1 : -1;
      if (dx === 0 && dy === forward && !isCap) return true;                    // forward step
      if (absDx === 1 && dy === forward && isCap) return true;                  // diagonal capture forward
      if (absDx === 1 && dy === 0 && !isCap) return true;                       // sideways step (no capture)
      return false;
    }

    case 'd': // Dragon: queen up to 4 squares
      return ch >= 1 && ch <= 4;

    case 'c': // Catapult: cannot move normally (ranged attack not implemented)
      return false;

    case 'e': // Elephant: exactly 2 diagonally (jump not supported with chess.js)
      return isDiagonal(dx, dy) && ch === 2;

    case 'w': // Wizard: king-like 1-square moves (teleport not implemented)
      return ch === 1;

    case 'a': // Archer: pawn-like (shooting not implemented) -> rely on chess.js via mapping
      return true;

    case 'h': // Galleon: rook-like
      return isOrthogonal(dx, dy);

    case 'm': // Knight Commander: knight + king step (extra king step not implemented) -> allow knight (mapping)
      return true;

    case 't': // Stone Sentinel: 1 or 2 squares any direction
      return ch >= 1 && ch <= 2;

    default:
      return true;
  }
}

export const useBotGameStore = create<BotGameState>((set, get) => {
  const game = new Chess();

  // Reward the player with credits when a game concludes (win: 200, loss/draw: 100).
  // Ensures we only grant once per game via rewardGranted.
  function rewardIfGameOver() {
    const s = get();
    if (s.rewardGranted) return;

    let winner: Color | null = null;

    if (s.resignedBy) {
      // If someone resigned, the other color wins
      winner = s.resignedBy === 'w' ? 'b' : 'w';
    } else if (s.chess.isCheckmate()) {
      // After a checkmate move, turn is the side that is checkmated
      winner = s.turn === 'w' ? 'b' : 'w';
    } else if (s.chess.isDraw()) {
      winner = null; // draw
    } else {
      return; // Not over yet
    }

    // Award: player gets 200 on win, else 100 (loss or draw)
    const amount = winner ? (winner === s.playerColor ? 200 : 100) : 100;
    try {
      useProfileStore.getState().addCredits(amount);
    } catch {
      // ignore if profile store not available
    }
    set({ rewardGranted: true });
  }
  
  return {
    chess: game,
    fen: game.fen(),
    turn: game.turn(),
    isPlayerTurn: true,
    isBotThinking: false,
    botColor: 'b',
    playerColor: 'w',
    gameMode: 'human-vs-bot',
    difficulty: 'normal',
    resignedBy: undefined,
    rewardGranted: false,

    history: [],
    capturedByWhite: [],
    capturedByBlack: [],
    customPieceMapping: {},
    
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
        const state = get();
        const verbose = state.chess.moves({ square: from, verbose: true }) as unknown as Move[];
        const filtered = verbose.filter((m) => isAllowedByCustom(m, state.customPieceMapping));
        return filtered.map((m) => ({ from: m.from as Square, to: m.to as Square, san: m.san }));
      } catch {
        return [];
      }
    },
    
    async makeMove(from, to) {
      const state = get();
      
      // Check if it's the player's turn and game not ended
      if ((state.gameMode === 'human-vs-bot' && !state.isPlayerTurn) || state.resignedBy) {
        return false;
      }
      
      try {
        const move = state.chess.move({ from, to, promotion: "q" });
        if (!move) return false;

        const newFen = state.chess.fen();
        const newTurn = state.chess.turn();

        // Update history and captures
        const ply = state.chess.history().length; // after applying move
        const moveNumber = Math.ceil(ply / 2);
        const entry: HistoryEntry = {
          ply,
          moveNumber,
          color: move.color as Color,
          san: move.san,
          from: move.from as Square,
          to: move.to as Square,
          piece: move.piece as PieceSymbol,
          captured: move.captured as PieceSymbol | undefined,
          promotion: move.promotion as PieceSymbol | undefined,
          fenAfter: newFen,
        };
        set((s) => ({
          history: [...s.history, entry],
          capturedByWhite: move.captured && move.color === 'w' ? [...s.capturedByWhite, move.captured as PieceSymbol] : s.capturedByWhite,
          capturedByBlack: move.captured && move.color === 'b' ? [...s.capturedByBlack, move.captured as PieceSymbol] : s.capturedByBlack,
        }));

        // Maintain custom -> actual piece mapping across the player's move
        set((s) => {
          const next: CustomPieceMapping = { ...s.customPieceMapping };
          const fromSq = move.from as Square;
          const toSq = move.to as Square;
          const flags = (move as Move).flags;

          // Determine the actual piece type that moved (custom if present, else standard)
          const movingActual: ExtendedPieceSymbol =
            (s.customPieceMapping[fromSq]?.actualType as ExtendedPieceSymbol) ||
            (move.piece as ExtendedPieceSymbol);

          // Handle en passant captured square removal
          if (flags && flags.includes('e')) {
            const file = toSq[0];
            const rank = parseInt(toSq[1], 10);
            const capturedRank = move.color === 'w' ? rank - 1 : rank + 1;
            const epSq = (file + capturedRank) as Square;
            delete next[epSq];
          }

          // Handle castling rook mapping move
          if (move.piece === 'k' && flags) {
            const rankChar = move.color === 'w' ? '1' : '8';
            if (flags.includes('k')) {
              const rookFrom = ('h' + rankChar) as Square;
              const rookTo = ('f' + rankChar) as Square;
              if (next[rookFrom]) {
                next[rookTo] = next[rookFrom];
                delete next[rookFrom];
              }
            }
            if (flags.includes('q')) {
              const rookFrom = ('a' + rankChar) as Square;
              const rookTo = ('d' + rankChar) as Square;
              if (next[rookFrom]) {
                next[rookTo] = next[rookFrom];
                delete next[rookFrom];
              }
            }
          }

          // Move mapping entry for the moving piece (promotion overrides actual type)
          delete next[fromSq];
          const promoted = move.promotion as ExtendedPieceSymbol | undefined;
          const finalActual: ExtendedPieceSymbol = promoted || movingActual;
          next[toSq] = {
            actualType: finalActual,
            color: move.color as Color,
          };

          return { customPieceMapping: next };
        });

        // Play drop/capture sfx
        if (move.captured) SFX.capture(); else SFX.drop();

        set({
          fen: newFen,
          turn: newTurn,
          isPlayerTurn: state.gameMode === 'human-vs-human' || newTurn === state.playerColor
        });

        // SFX for special states after human move
        if (state.chess.isCheckmate()) {
          SFX.win();
        } else if (state.chess.isCheck()) {
          SFX.check();
        }
        // Reward outcome if game has ended
        rewardIfGameOver();

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
      
      if (state.chess.isGameOver() || state.turn !== state.botColor || state.resignedBy) {
        return;
      }
      
      set({ isBotThinking: true });
      
      try {
        // Add a small delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 300));

        // Build allowed moves under custom rules
        const allVerbose = state.chess.moves({ verbose: true }) as unknown as Move[];
        const allowed = allVerbose.filter((m) => isAllowedByCustom(m, state.customPieceMapping));

        if (allowed.length === 0) {
          set({ isBotThinking: false });
          return;
        }

        // Try engine suggestion if it matches custom constraints, otherwise pick first allowed
        let chosen = allowed[0];
        try {
          let bestMoveStr: string | null = null;
          if (state.difficulty === 'easy') bestMoveStr = bot.getBestMove(state.fen);
          else if (state.difficulty === 'hard') bestMoveStr = bot.getBestMoveWithDepth(state.fen, 3);
          else bestMoveStr = bot.getBestMoveWithEvaluation(state.fen);

          if (bestMoveStr && bestMoveStr.length >= 4) {
            const bf = bestMoveStr.slice(0, 2) as Square;
            const bt = bestMoveStr.slice(2, 4) as Square;
            const match = allowed.find(m => m.from === bf && m.to === bt);
            if (match) chosen = match;
          }
        } catch {
          // ignore and use fallback
        }

        const move = state.chess.move({
          from: chosen.from as Square,
          to: chosen.to as Square,
          promotion: chosen.promotion ? 'q' : undefined // Always promote to queen
        });

        if (move) {
          const newFen = state.chess.fen();
          const newTurn = state.chess.turn();

          // Update history/captures for bot move
          const ply = state.chess.history().length;
          const moveNumber = Math.ceil(ply / 2);
          const entry: HistoryEntry = {
            ply,
            moveNumber,
            color: move.color as Color,
            san: move.san,
            from: move.from as Square,
            to: move.to as Square,
            piece: move.piece as PieceSymbol,
            captured: move.captured as PieceSymbol | undefined,
            promotion: move.promotion as PieceSymbol | undefined,
            fenAfter: newFen,
          };
          set((s) => ({
            history: [...s.history, entry],
            capturedByWhite: move.captured && move.color === 'w' ? [...s.capturedByWhite, move.captured as PieceSymbol] : s.capturedByWhite,
            capturedByBlack: move.captured && move.color === 'b' ? [...s.capturedByBlack, move.captured as PieceSymbol] : s.capturedByBlack,
          }));

          // Maintain custom -> actual piece mapping across the bot's move
          set((s) => {
            const next: CustomPieceMapping = { ...s.customPieceMapping };
            const fromSq = move.from as Square;
            const toSq = move.to as Square;
            const flags = (move as Move).flags;

            // Determine the actual piece type that moved (custom if present, else standard)
            const movingActual: ExtendedPieceSymbol =
              (s.customPieceMapping[fromSq]?.actualType as ExtendedPieceSymbol) ||
              (move.piece as ExtendedPieceSymbol);

            // Handle en passant captured square removal
            if (flags && flags.includes('e')) {
              const file = toSq[0];
              const rank = parseInt(toSq[1], 10);
              const capturedRank = move.color === 'w' ? rank - 1 : rank + 1;
              const epSq = (file + capturedRank) as Square;
              delete next[epSq];
            }

            // Handle castling rook mapping move
            if (move.piece === 'k' && flags) {
              const rankChar = move.color === 'w' ? '1' : '8';
              if (flags.includes('k')) {
                const rookFrom = ('h' + rankChar) as Square;
                const rookTo = ('f' + rankChar) as Square;
                if (next[rookFrom]) {
                  next[rookTo] = next[rookFrom];
                  delete next[rookFrom];
                }
              }
              if (flags.includes('q')) {
                const rookFrom = ('a' + rankChar) as Square;
                const rookTo = ('d' + rankChar) as Square;
                if (next[rookFrom]) {
                  next[rookTo] = next[rookFrom];
                  delete next[rookFrom];
                }
              }
            }

            // Move mapping entry for the moving piece (promotion overrides actual type)
            delete next[fromSq];
            const promoted = move.promotion as ExtendedPieceSymbol | undefined;
            const finalActual: ExtendedPieceSymbol = promoted || movingActual;
            next[toSq] = {
              actualType: finalActual,
              color: move.color as Color,
            };

            return { customPieceMapping: next };
          });

          // Play drop/capture sfx
          if (move.captured) SFX.capture(); else SFX.drop();

          set({
            fen: newFen,
            turn: newTurn,
            isPlayerTurn: newTurn === state.playerColor,
            isBotThinking: false
          });

          // SFX for special states
          if (state.chess.isCheckmate()) {
            SFX.win();
          } else if (state.chess.isCheck()) {
            SFX.check();
          }
          // Reward outcome if game has ended
          rewardIfGameOver();
        } else {
          set({ isBotThinking: false });
        }
      } catch (error) {
        console.error('Bot move error:', error);
        set({ isBotThinking: false });
      }
    },
    
    reset(playerColor = 'w', customFen?: string, customMapping?: CustomPieceMapping) {
      const chess = new Chess();

      // Load custom position if provided
      if (customFen) {
        try {
          chess.load(customFen);
        } catch (error) {
          console.error('Invalid FEN provided, using standard setup:', error);
          chess.reset(); // Fall back to standard setup
        }
      }

      set({
        chess,
        fen: chess.fen(),
        turn: chess.turn(), // This will always be 'w' (white) at the start
        playerColor,
        botColor: playerColor === 'w' ? 'b' : 'w',
        isPlayerTurn: playerColor === 'w', // Player's turn only if player is white (since white goes first)
        isBotThinking: false,
        resignedBy: undefined,
        history: [],
        capturedByWhite: [],
        capturedByBlack: [],
        customPieceMapping: customMapping || {},
        rewardGranted: false,
      });

      // If player chose black, bot (playing white) makes first move
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

    setDifficulty(d) {
      set({ difficulty: d });
    },

    resign(by) {
      const state = get();
      if (state.resignedBy || state.chess.isGameOver()) return;
      set({ resignedBy: by, isBotThinking: false });
      // Reward outcome on resignation
      rewardIfGameOver();
    },
    
    isGameOver() {
      const s = get();
      return s.chess.isGameOver() || !!s.resignedBy;
    },
    
    getGameStatus() {
      const state = get();

      if (state.resignedBy) {
        const winner = state.resignedBy === 'w' ? 'Black' : 'White';
        return `${state.resignedBy === 'w' ? 'White' : 'Black'} resigned — ${winner} wins!`;
      }

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
