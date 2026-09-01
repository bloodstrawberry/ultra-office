import type {
  OthelloGrid,
  OthelloPoint,
  OthelloColor,
  OthelloAIAnalysis,
  OthelloSolutionNode,
} from './types';
import {
  OTHELLO_SIZE,
  applyOthelloMove,
  getValidOthelloMoves,
  getFlippedDiscsForMove,
} from './engine';

const POSITION_WEIGHTS: number[][] = [
  [120, -25, 20, 5, 5, 20, -25, 120],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [120, -25, 20, 5, 5, 20, -25, 120],
];

export function evaluateOthelloBoard(board: OthelloGrid, player: OthelloColor): number {
  const opponent: OthelloColor = player === 'B' ? 'W' : 'B';
  let posScore = 0;
  let myDiscs = 0;
  let oppDiscs = 0;

  for (let r = 0; r < OTHELLO_SIZE; r += 1) {
    for (let c = 0; c < OTHELLO_SIZE; c += 1) {
      const cell = board[r][c];
      if (cell === player) {
        posScore += POSITION_WEIGHTS[r][c];
        myDiscs += 1;
      } else if (cell === opponent) {
        posScore -= POSITION_WEIGHTS[r][c];
        oppDiscs += 1;
      }
    }
  }

  const myMoves = getValidOthelloMoves(board, player).length;
  const oppMoves = getValidOthelloMoves(board, opponent).length;
  const mobilityScore =
    myMoves + oppMoves > 0 ? (100 * (myMoves - oppMoves)) / (myMoves + oppMoves) : 0;
  const discScore =
    myDiscs + oppDiscs > 0 ? (100 * (myDiscs - oppDiscs)) / (myDiscs + oppDiscs) : 0;

  return posScore * 1.0 + mobilityScore * 5.0 + discScore * 0.5;
}

let evaluatedCount = 0;

function minimaxAlphaBeta(
  board: OthelloGrid,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  color: OthelloColor
): number {
  evaluatedCount += 1;
  const currentColor: OthelloColor = isMaximizing ? color : color === 'B' ? 'W' : 'B';
  const validMoves = getValidOthelloMoves(board, currentColor);

  if (depth === 0 || validMoves.length === 0) {
    return evaluateOthelloBoard(board, color);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const res = applyOthelloMove(board, move, currentColor);
      if (res.newBoard) {
        const ev = minimaxAlphaBeta(res.newBoard, depth - 1, alpha, beta, false, color);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  }
  let minEval = Infinity;
  for (const move of validMoves) {
    const res = applyOthelloMove(board, move, currentColor);
    if (res.newBoard) {
      const ev = minimaxAlphaBeta(res.newBoard, depth - 1, alpha, beta, true, color);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
  }
  return minEval;
}

export function findBestOthelloAIMove(
  board: OthelloGrid,
  color: OthelloColor,
  depth = 3
): { move: OthelloPoint | null; score: number; reason: string } {
  evaluatedCount = 0;
  const validMoves = getValidOthelloMoves(board, color);
  if (validMoves.length === 0) {
    return { move: null, score: 0, reason: '착수 가능한 위치가 없어 패스합니다.' };
  }

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const res = applyOthelloMove(board, move, color);
    if (res.newBoard) {
      const score = minimaxAlphaBeta(res.newBoard, depth - 1, -Infinity, Infinity, false, color);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  // Reason description
  let reason = '포지션 가중치와 착수 가능 수(Mobility)를 고려한 최선의 착수';
  if ((bestMove.r === 0 || bestMove.r === 7) && (bestMove.c === 0 || bestMove.c === 7)) {
    reason = '절대 뒤집히지 않는 모서리(Corner) 선점';
  }

  return { move: bestMove, score: bestScore, reason };
}

export function analyzeOthelloPosition(board: OthelloGrid, color: OthelloColor): OthelloAIAnalysis {
  const startTime = performance.now();
  const validMoves = getValidOthelloMoves(board, color);

  const scoredMoves = validMoves.map((m) => {
    const flipped = getFlippedDiscsForMove(board, m, color);
    const weight = POSITION_WEIGHTS[m.r][m.c];
    return {
      move: m,
      score: weight + flipped.length * 2,
      flippedCount: flipped.length,
    };
  });

  scoredMoves.sort((a, b) => b.score - a.score);

  const { move: bestMove, score: evalScore } = findBestOthelloAIMove(board, color, 3);
  const timeMs = Math.round(performance.now() - startTime);

  return {
    evaluationScore: evalScore,
    bestMove,
    recommendedMoves: scoredMoves,
    searchDepth: 3,
    searchNodesEvaluated: evaluatedCount || validMoves.length,
    timeMs: Math.max(1, timeMs),
    validMoves,
  };
}

export function findMatchingOthelloNode(
  nodes: OthelloSolutionNode[],
  move: OthelloPoint
): OthelloSolutionNode | undefined {
  return nodes.find((n) => n.move.r === move.r && n.move.c === move.c);
}
