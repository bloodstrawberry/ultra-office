import type {
  ChessColor,
  ChessBoard,
  ChessMove,
  ChessAIAnalysis,
  ChessSolutionNode,
} from './types';

import {
  isKingInCheck,
  makeChessMove,
  isSameSquare,
  squareToAlgebraic,
  CHESS_PIECE_VALUES,
  getAllLegalChessMoves,
} from './engine';

// Piece-Square Tables for White (Rank 0..7)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

/** Evaluate board in centipawns (+: white favorable, -: black favorable) */
export function evaluateChessBoard(board: ChessBoard): number {
  let score = 0;

  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece) {
        let pieceVal = CHESS_PIECE_VALUES[piece.type];
        let pstVal = 0;

        if (piece.type === 'p') {
          pstVal = piece.color === 'w' ? PAWN_PST[r][c] : PAWN_PST[7 - r][c];
        } else if (piece.type === 'n') {
          pstVal = piece.color === 'w' ? KNIGHT_PST[r][c] : KNIGHT_PST[7 - r][c];
        }

        const total = pieceVal + pstVal;
        score += piece.color === 'w' ? total : -total;
      }
    }
  }

  return score;
}

/** Minimax Alpha-Beta with Move Ordering */
export function minimaxChess(
  board: ChessBoard,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  playerColor: ChessColor,
  stats = { nodes: 0 }
): { score: number; bestMove: ChessMove | null } {
  stats.nodes += 1;
  const currentColor: ChessColor = isMaximizing ? playerColor : playerColor === 'w' ? 'b' : 'w';

  const moves = getAllLegalChessMoves(board, currentColor);

  if (moves.length === 0) {
    if (isKingInCheck(board, currentColor)) {
      return { score: isMaximizing ? -30000 : 30000, bestMove: null };
    }
    return { score: 0, bestMove: null }; // Stalemate
  }

  if (depth === 0) {
    const rawEval = evaluateChessBoard(board);
    const evalScore = playerColor === 'w' ? rawEval : -rawEval;
    return { score: evalScore, bestMove: null };
  }

  // MVV-LVA move ordering
  moves.sort((a, b) => {
    const aVal = (a.captured ? CHESS_PIECE_VALUES[a.captured.type] : 0) + (a.isCheck ? 150 : 0);
    const bVal = (b.captured ? CHESS_PIECE_VALUES[b.captured.type] : 0) + (b.isCheck ? 150 : 0);
    return bVal - aVal;
  });

  let bestMove: ChessMove | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextBoard = makeChessMove(board, move);
      const { score } = minimaxChess(nextBoard, depth - 1, alpha, beta, false, playerColor, stats);
      if (score > maxEval) {
        maxEval = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Beta cutoff
    }
    return { score: maxEval, bestMove: bestMove || moves[0] };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextBoard = makeChessMove(board, move);
      const { score } = minimaxChess(nextBoard, depth - 1, alpha, beta, true, playerColor, stats);
      if (score < minEval) {
        minEval = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return { score: minEval, bestMove: bestMove || moves[0] };
  }
}

/** Comprehensive Chess AI analysis */
export function analyzeChessPosition(board: ChessBoard, playerColor: ChessColor): ChessAIAnalysis {
  const startTime = Date.now();
  const rawScore = evaluateChessBoard(board);
  const evaluationScore = (playerColor === 'w' ? rawScore : -rawScore) / 100.0;

  const isWhiteInCheck = isKingInCheck(board, 'w');
  const isBlackInCheck = isKingInCheck(board, 'b');

  const stats = { nodes: 0 };
  const searchDepth = 3;
  const { score: bestScore, bestMove } = minimaxChess(
    board,
    searchDepth,
    -Infinity,
    Infinity,
    true,
    playerColor,
    stats
  );

  const recommendedMoves: { move: ChessMove; score: number; reason: string }[] = [];

  if (bestMove) {
    let reason = '포지션 평가 최우선 수';
    if (bestMove.isCheck) reason = '체크! 상대 킹 직접 압박';
    else if (bestMove.captured) reason = `${squareToAlgebraic(bestMove.to)} 기물 포획`;

    recommendedMoves.push({
      move: bestMove,
      score: bestScore / 100.0,
      reason: `${squareToAlgebraic(bestMove.from)} → ${squareToAlgebraic(bestMove.to)} (${reason})`,
    });
  }

  const legalMoves = getAllLegalChessMoves(board, playerColor);
  for (const m of legalMoves) {
    if (!bestMove || !isSameSquare(m.from, bestMove.from) || !isSameSquare(m.to, bestMove.to)) {
      if (recommendedMoves.length < 3) {
        recommendedMoves.push({
          move: m,
          score: evaluationScore - 0.4,
          reason: `${squareToAlgebraic(m.from)} → ${squareToAlgebraic(m.to)} (후보 수)`,
        });
      }
    }
  }

  const timeMs = Date.now() - startTime;

  return {
    evaluationScore,
    isWhiteInCheck,
    isBlackInCheck,
    recommendedMoves,
    searchNodesEvaluated: stats.nodes,
    searchDepth,
    timeMs,
  };
}

export { getAllLegalChessMoves } from './engine';

/** Find the best AI response move for a given color */
export function findBestChessAIMove(
  board: ChessBoard,
  color: ChessColor
): { move: ChessMove | null; isCheckmate: boolean; reason: string } {
  const legalMoves = getAllLegalChessMoves(board, color);
  if (legalMoves.length === 0) {
    const inCheck = isKingInCheck(board, color);
    return { move: null, isCheckmate: inCheck, reason: inCheck ? '체크메이트' : '스테일메이트' };
  }

  const stats = { nodes: 0 };
  const { bestMove } = minimaxChess(board, 2, -Infinity, Infinity, true, color, stats);
  const move = bestMove || legalMoves[0];

  let reason = '최적 방어 응수';
  if (move.isCheck) reason = '역체크 반격!';
  else if (move.captured) reason = '기물 포획 수비';

  return { move, isCheckmate: false, reason };
}

/** Check if user move matches chess puzzle solution tree */
export function findMatchingChessNode(
  tree: ChessSolutionNode[],
  from: { r: number; c: number },
  to: { r: number; c: number }
): ChessSolutionNode | null {
  for (const node of tree) {
    if (isSameSquare(node.from, from) && isSameSquare(node.to, to)) {
      return node;
    }
  }
  return null;
}
