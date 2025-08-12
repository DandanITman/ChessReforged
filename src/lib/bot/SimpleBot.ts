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

  // Simple evaluation for better move selection
  public getBestMoveWithEvaluation(fen: string): string | null {
    try {
      this.chess.load(fen);
      const moves = this.chess.moves({ verbose: true });
      
      if (moves.length === 0) {
        return null;
      }

      // Score each move and pick the best one
      let bestMove = moves[0];
      let bestScore = -Infinity;

      for (const move of moves) {
        const tempChess = new Chess(fen);
        tempChess.move(move);
        const score = this.evaluatePosition(tempChess);
        
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

  // Simple position evaluation
  private evaluatePosition(chess: Chess): number {
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

    // Add some randomness to avoid repetitive play
    score += (Math.random() - 0.5) * 0.5;

    // Prefer central control
    const centralSquares = ['d4', 'd5', 'e4', 'e5'] as const;
    for (const square of centralSquares) {
      const piece = chess.get(square);
      if (piece) {
        score += piece.color === 'b' ? 0.1 : -0.1;
      }
    }

    return score;
  }
}
