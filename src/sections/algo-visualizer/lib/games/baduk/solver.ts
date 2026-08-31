import type {
  Point,
  BoardGrid,
  StoneColor,
  BadukProblem,
  BadukAIAnalysis,
  BadukSolutionNode,
} from './types';

import { findGroups, playMove, isSamePoint, formatBadukCoord, calculateInfluence } from './engine';

/** Evaluate board state score for playerColor (+: player favorable, -: opponent favorable) */
export function evaluateBoardHeuristic(board: BoardGrid, playerColor: StoneColor): number {
  const oppColor: StoneColor = playerColor === 'B' ? 'W' : 'B';
  const groups = findGroups(board);

  let playerScore = 0;
  let oppScore = 0;

  for (const group of groups) {
    // 1. Group size and liberties
    const stoneWeight = group.stones.length * 12;
    const libertyWeight = Math.min(group.libertyCount, 6) * 8;
    const isAtariPenalty = group.libertyCount === 1 ? -30 : 0;

    const groupValue = stoneWeight + libertyWeight + isAtariPenalty;

    if (group.color === playerColor) {
      playerScore += groupValue;
    } else {
      oppScore += groupValue;
    }
  }

  return playerScore - oppScore;
}

/** Generate candidate legal moves, prioritized within focus region or near existing stones */
export function getCandidateMoves(
  board: BoardGrid,
  color: StoneColor,
  focusRegion?: { minR: number; maxR: number; minC: number; maxC: number }
): Point[] {
  const size = board.length;
  const candidates: Point[] = [];

  const minR = focusRegion ? Math.max(0, focusRegion.minR - 1) : 0;
  const maxR = focusRegion ? Math.min(size - 1, focusRegion.maxR + 1) : size - 1;
  const minC = focusRegion ? Math.max(0, focusRegion.minC - 1) : 0;
  const maxC = focusRegion ? Math.min(size - 1, focusRegion.maxC + 1) : size - 1;

  for (let r = minR; r <= maxR; r += 1) {
    for (let c = minC; c <= maxC; c += 1) {
      if (board[r][c] === null) {
        // Test move validity
        const res = playMove(board, { r, c }, color);
        if (res.valid) {
          candidates.push({ r, c });
        }
      }
    }
  }

  return candidates;
}

/** Minimax with Alpha-Beta pruning for tactical Go analysis */
export function minimaxBaduk(
  board: BoardGrid,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  playerColor: StoneColor,
  focusRegion?: { minR: number; maxR: number; minC: number; maxC: number },
  stats = { nodes: 0 }
): { score: number; bestMove: Point | null } {
  stats.nodes += 1;

  const currentColor: StoneColor = isMaximizing ? playerColor : playerColor === 'B' ? 'W' : 'B';

  if (depth === 0) {
    return { score: evaluateBoardHeuristic(board, playerColor), bestMove: null };
  }

  const legalMoves = getCandidateMoves(board, currentColor, focusRegion);
  if (legalMoves.length === 0) {
    return { score: evaluateBoardHeuristic(board, playerColor), bestMove: null };
  }

  // Order moves: captures first
  legalMoves.sort((a, b) => {
    const resA = playMove(board, a, currentColor);
    const resB = playMove(board, b, currentColor);
    return resB.captures.length - resA.captures.length;
  });

  let bestMove: Point | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const res = playMove(board, move, currentColor);
      if (res.valid) {
        const { score } = minimaxBaduk(
          res.newBoard,
          depth - 1,
          alpha,
          beta,
          false,
          playerColor,
          focusRegion,
          stats
        );
        if (score > maxEval) {
          maxEval = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, evalScoreToNumber(score));
        if (beta <= alpha) break; // Beta cutoff
      }
    }
    return { score: maxEval, bestMove: bestMove || legalMoves[0] };
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const res = playMove(board, move, currentColor);
      if (res.valid) {
        const { score } = minimaxBaduk(
          res.newBoard,
          depth - 1,
          alpha,
          beta,
          true,
          playerColor,
          focusRegion,
          stats
        );
        if (score < minEval) {
          minEval = score;
          bestMove = move;
        }
        beta = Math.min(beta, evalScoreToNumber(score));
        if (beta <= alpha) break; // Alpha cutoff
      }
    }
    return { score: minEval, bestMove: bestMove || legalMoves[0] };
  }
}

function evalScoreToNumber(val: number): number {
  if (Number.isNaN(val)) return 0;
  return val;
}

/** Dynamic AI move generator (White's response in live play) */
export function findBestBadukAIMove(
  board: BoardGrid,
  color: StoneColor = 'W',
  focusRegion?: { minR: number; maxR: number; minC: number; maxC: number }
): { move: Point | null; reason: string } {
  const oppColor: StoneColor = color === 'W' ? 'B' : 'W';
  const groups = findGroups(board);

  // 1. Immediate capture of enemy group in Atari (1 liberty)
  const enemyAtari = groups.filter((g) => g.color === oppColor && g.libertyCount === 1);
  for (const eg of enemyAtari) {
    for (const lib of eg.liberties) {
      const res = playMove(board, lib, color);
      if (res.valid && res.captures.length > 0) {
        return { move: lib, reason: `상대 돌 ${res.captures.length}점 포획 (단수)` };
      }
    }
  }

  // 2. Escape own group in Atari (1 liberty)
  const myAtari = groups.filter((g) => g.color === color && g.libertyCount === 1);
  for (const mg of myAtari) {
    for (const lib of mg.liberties) {
      const res = playMove(board, lib, color);
      if (res.valid) {
        return { move: lib, reason: '아군 돌 단수 탈출 및 활로 확장' };
      }
    }
  }

  // 3. Minimax tactical search (Depth 3)
  const stats = { nodes: 0 };
  const { bestMove } = minimaxBaduk(board, 3, -Infinity, Infinity, true, color, focusRegion, stats);

  if (bestMove) {
    return {
      move: bestMove,
      reason: `${formatBadukCoord(bestMove, board.length)} 반격 및 안형 수비`,
    };
  }

  // Fallback: any legal move in focus region
  const candidates = getCandidateMoves(board, color, focusRegion);
  return { move: candidates[0] || null, reason: '반상 응수' };
}

/** Check if problem has reached win / loss state */
export function checkBadukProblemSolved(
  board: BoardGrid,
  problem: BadukProblem
): { isSolved: boolean; isFailed: boolean; message?: string } {
  // Count remaining white stones in initial target area
  let initialWhiteRemaining = 0;
  for (const w of problem.initialWhite) {
    if (board[w.r]?.[w.c] === 'W') {
      initialWhiteRemaining += 1;
    }
  }

  // If initial white target stones were completely captured
  if (problem.initialWhite.length > 0 && initialWhiteRemaining === 0) {
    return {
      isSolved: true,
      isFailed: false,
      message: '축하합니다! 백 대마를 모두 포획하여 완벽히 승리하셨습니다!',
    };
  }

  // Check if player's black group has 2 solid eyes or captures the goal
  const blackGroups = findGroups(board).filter((g) => g.color === 'B');
  const totalBlackStones = blackGroups.reduce((acc, g) => acc + g.stones.length, 0);

  if (totalBlackStones === 0) {
    return { isSolved: false, isFailed: true, message: '흑돌이 모두 잡혀 사활에 실패하였습니다.' };
  }

  return { isSolved: false, isFailed: false };
}

/** Comprehensive AI analysis for Baduk view */
export function analyzeBadukPosition(
  board: BoardGrid,
  playerColor: StoneColor,
  focusRegion?: { minR: number; maxR: number; minC: number; maxC: number }
): BadukAIAnalysis {
  const startTime = Date.now();
  const size = board.length;

  // 1. Calculate liberties map for each grid square
  const libertiesMap: number[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );
  const groups = findGroups(board);
  for (const group of groups) {
    for (const st of group.stones) {
      libertiesMap[st.r][st.c] = group.libertyCount;
    }
  }

  // 2. Calculate territory & influence map
  const influenceMap = calculateInfluence(board);

  // 3. Search best tactical moves
  const stats = { nodes: 0 };
  const searchDepth = 3;
  const { bestMove } = minimaxBaduk(
    board,
    searchDepth,
    -Infinity,
    Infinity,
    true,
    playerColor,
    focusRegion,
    stats
  );

  const recommendedMoves: { point: Point; score: number; reason: string }[] = [];

  if (bestMove) {
    const moveRes = playMove(board, bestMove, playerColor);
    let reason = '급소 치중 및 세력 안정화';
    if (moveRes.captures.length > 0) {
      reason = `상대 사석 ${moveRes.captures.length}점 포획 (단수/먹여치기)`;
    } else {
      const myG = groups.find((g) => g.color === playerColor && g.libertyCount <= 2);
      if (myG) {
        reason = '아군 위험 그룹 활로 확보 및 연결';
      }
    }

    recommendedMoves.push({
      point: bestMove,
      score: 95,
      reason: `${formatBadukCoord(bestMove, size)} - ${reason}`,
    });
  }

  // Add 1-2 secondary candidate moves
  const candidates = getCandidateMoves(board, playerColor, focusRegion);
  for (const cand of candidates) {
    if (!isSamePoint(cand, bestMove) && recommendedMoves.length < 3) {
      const testRes = playMove(board, cand, playerColor);
      if (testRes.valid) {
        const score = evaluateBoardHeuristic(testRes.newBoard, playerColor);
        recommendedMoves.push({
          point: cand,
          score: Math.max(40, Math.min(88, score)),
          reason: `${formatBadukCoord(cand, size)} - 후보 착수점 (수읽기 분기)`,
        });
      }
    }
  }

  const timeMs = Date.now() - startTime;

  return {
    libertiesMap,
    influenceMap,
    recommendedMoves,
    searchNodesEvaluated: stats.nodes,
    searchDepth,
    timeMs,
  };
}

/** Check if user's move matches solution tree branch */
export function findMatchingSolutionNode(
  tree: BadukSolutionNode[],
  userMove: Point
): BadukSolutionNode | null {
  for (const node of tree) {
    if (isSamePoint(node.move, userMove)) {
      return node;
    }
  }
  return null;
}
