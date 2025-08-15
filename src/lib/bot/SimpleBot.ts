import { Chess } from "chess.js";

export class SimpleChessBot {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  // Make a random legal move
  public getBestMove(fen: string): string | null {
    try {
      this.chess.load(fen);
      const moves = this.chess.moves({ verbose: true });

      if (moves.length === 0) {
        return null; // No legal moves (game over)
      }

      // For now, just pick a random move
      // Later this can be enhanced with actual chess engine logic
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return `${randomMove.from}${randomMove.to}${randomMove.promotion || ''}`;
    } catch (error) {
      console.error('Error getting bot move:', error);
      return null;
    }
  }

  // Enhanced evaluation with checkmate prioritization
  public getBestMoveWithEvaluation(fen: string): string | null {
    try {
      this.chess.load(fen);
      const moves = this.chess.moves({ verbose: true });

      if (moves.length === 0) {
        return null;
      }

      const currentColor = this.chess.turn();
      let bestMove = moves[0];
      let bestScore = -Infinity;

      // First pass: look for immediate checkmate
      for (const move of moves) {
        const tempChess = new Chess(fen);
        tempChess.move(move);

        if (tempChess.isCheckmate()) {
          // Found checkmate! This is the best possible move
          return `${move.from}${move.to}${move.promotion || ''}`;
        }
      }

      // Second pass: look for checks that might lead to checkmate
      const checkMoves = [];
      for (const move of moves) {
        const tempChess = new Chess(fen);
        tempChess.move(move);

        if (tempChess.isCheck()) {
          checkMoves.push(move);
        }
      }

      // If we have check moves, prioritize them
      const movesToEvaluate = checkMoves.length > 0 ? checkMoves : moves;

      // Score each move and pick the best one
      for (const move of movesToEvaluate) {
        const tempChess = new Chess(fen);
        tempChess.move(move);
        let score = this.evaluatePosition(tempChess);

        // Adjust score based on current player
        if (currentColor === 'w') {
          score = -score; // White wants negative scores (since our eval is positive for black)
        }

        // Bonus for captures
        if (move.captured) {
          const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
          score += pieceValues[move.captured] || 0;
        }

        // Bonus for checks
        if (tempChess.isCheck()) {
          score += 1;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      return `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`;
    } catch (error) {
      console.error('Error getting evaluated bot move:', error);
      return null;
    }
  }

  // Enhanced position evaluation with checkmate detection
  private evaluatePosition(chess: Chess): number {
    // Check for game-ending positions first
    if (chess.isCheckmate()) {
      // Checkmate is worth much more than any material advantage
      return chess.turn() === 'w' ? -10000 : 10000; // Negative if white is checkmated, positive if black is checkmated
    }

    if (chess.isDraw() || chess.isStalemate()) {
      return 0; // Draw is neutral
    }

    const board = chess.board();
    let score = 0;

    // Piece values
    const pieceValues = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };

    // Material evaluation
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type];
          score += square.color === 'b' ? value : -value;
        }
      }
    }

    // Check bonus - being in check is bad
    if (chess.isCheck()) {
      score += chess.turn() === 'b' ? -2 : 2; // Penalty for being in check
    }

    // King safety - penalize exposed kings
    const whiteKing = this.findKing(chess, 'w');
    const blackKing = this.findKing(chess, 'b');

    if (whiteKing) {
      score -= this.evaluateKingSafety(chess, whiteKing, 'w') * 0.5;
    }
    if (blackKing) {
      score += this.evaluateKingSafety(chess, blackKing, 'b') * 0.5;
    }

    // Prefer central control
    const centralSquares = ['d4', 'd5', 'e4', 'e5'] as const;
    for (const square of centralSquares) {
      const piece = chess.get(square);
      if (piece) {
        score += piece.color === 'b' ? 0.1 : -0.1;
      }
    }

    // Add small randomness to avoid repetitive play (but less than before)
    score += (Math.random() - 0.5) * 0.1;

    return score;
  }

  // Find king position
  private findKing(chess: Chess, color: 'w' | 'b'): string | null {
    const board = chess.board();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === color) {
          return String.fromCharCode(97 + file) + (8 - rank);
        }
      }
    }
    return null;
  }

  // Evaluate king safety (higher score = more dangerous)
  private evaluateKingSafety(chess: Chess, kingSquare: string, color: 'w' | 'b'): number {
    let danger = 0;

    // Check how many enemy pieces can attack the king
    const enemyColor = color === 'w' ? 'b' : 'w';
    const allMoves = chess.moves({ verbose: true });

    for (const move of allMoves) {
      if (move.color === enemyColor && move.to === kingSquare) {
        danger += 1; // Each attacker increases danger
      }
    }

    return danger;
  }

  // Enhanced depth-based search with checkmate prioritization
  public getBestMoveWithDepth(fen: string, depth: number = 3): string | null {
    try {
      this.chess.load(fen);
      const moves = this.chess.moves({ verbose: true });
      if (moves.length === 0) return null;

      const startTurn = this.chess.turn(); // 'w' or 'b'
      const maximizingForBlack = startTurn === 'b';

      // First, check for immediate checkmate
      for (const move of moves) {
        const tempChess = new Chess(fen);
        tempChess.move(move);
        if (tempChess.isCheckmate()) {
          return `${move.from}${move.to}${move.promotion || ''}`;
        }
      }

      const scoreOf = (fenStr: string): number => {
        const c = new Chess(fenStr);
        return this.evaluatePosition(c); // positive favors black
      };

      const minimax = (fenStr: string, d: number, isMaximizing: boolean): number => {
        const c = new Chess(fenStr);

        // Terminal node evaluation
        if (d === 0 || c.isGameOver()) {
          return scoreOf(fenStr);
        }

        const nextMoves = c.moves({ verbose: true });
        if (nextMoves.length === 0) return scoreOf(fenStr);

        if (isMaximizing) {
          let best = -Infinity;
          for (const m of nextMoves) {
            const cc = new Chess(fenStr);
            cc.move(m);

            // If this move leads to checkmate for us, prioritize it heavily
            if (cc.isCheckmate() && cc.turn() !== startTurn) {
              return 9999 - d; // Prefer quicker checkmates
            }

            const s = minimax(cc.fen(), d - 1, !isMaximizing);
            if (s > best) best = s;
          }
          return best;
        } else {
          let best = Infinity;
          for (const m of nextMoves) {
            const cc = new Chess(fenStr);
            cc.move(m);

            // If this move leads to checkmate against us, avoid it
            if (cc.isCheckmate() && cc.turn() === startTurn) {
              return -9999 + d; // Prefer to delay checkmate if unavoidable
            }

            const s = minimax(cc.fen(), d - 1, !isMaximizing);
            if (s < best) best = s;
          }
          return best;
        }
      };

      let bestMove = moves[0];
      let bestScore = -Infinity;

      for (const move of moves) {
        const tmp = new Chess(fen);
        tmp.move(move);
        const score = minimax(tmp.fen(), Math.max(0, depth - 1), !maximizingForBlack);
        // Normalize to maximizing metric
        const normalized = maximizingForBlack ? score : -score;
        if (normalized > bestScore) {
          bestScore = normalized;
          bestMove = move;
        }
      }

      return `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`;
    } catch (e) {
      console.error('Error in depth search:', e);
      return null;
    }
  }

}
