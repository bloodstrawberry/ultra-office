import type {
  GomokuGrid,
  GomokuPoint,
  GomokuColor,
  GomokuAIAnalysis,
  GomokuSolutionNode,
} from './types';
import { GOMOKU_SIZE, cloneGomokuBoard, checkGomokuWin } from './engine';

const PATTERN_SCORES = {
  FIVE: 100000,
  OPEN_FOUR: 10000,
  BLOCKED_FOUR: 1200,
  OPEN_THREE: 900,
  BLOCKED_THREE: 150,
  OPEN_TWO: 30,
};

function getLinePatternScore(
  lineStr: string,
  colorChar: string,
  oppChar: string
): { score: number; name: string } {
  const c = colorChar;
  const o = oppChar;
  const e = '.';

  // 5 in a row
  if (lineStr.includes(c + c + c + c + c)) {
    return { score: PATTERN_SCORES.FIVE, name: '5목 (Five in a Row)' };
  }

  // Open 4: .XXXX.
  if (lineStr.includes(e + c + c + c + c + e)) {
    return { score: PATTERN_SCORES.OPEN_FOUR, name: '열린 4 (Open 4)' };
  }

  // Blocked 4: oXXXX. or .XXXXo or X.XXX or XX.XX
  if (
    lineStr.includes(o + c + c + c + c + e) ||
    lineStr.includes(e + c + c + c + c + o) ||
    lineStr.includes(c + e + c + c + c) ||
    lineStr.includes(c + c + e + c + c) ||
    lineStr.includes(c + c + c + e + c)
  ) {
    return { score: PATTERN_SCORES.BLOCKED_FOUR, name: '닫힌 4 (Four)' };
  }

  // Open 3: .XXX. or .X.XX.
  if (
    lineStr.includes(e + c + c + c + e) ||
    lineStr.includes(e + c + e + c + c + e) ||
    lineStr.includes(e + c + c + e + c + e)
  ) {
    return { score: PATTERN_SCORES.OPEN_THREE, name: '열린 3 (Open 3)' };
  }

  // Blocked 3: oXXX. or .XXXo
  if (lineStr.includes(o + c + c + c + e) || lineStr.includes(e + c + c + c + o)) {
    return { score: PATTERN_SCORES.BLOCKED_THREE, name: '닫힌 3 (Three)' };
  }

  // Open 2: .XX.
  if (lineStr.includes(e + c + c + e)) {
    return { score: PATTERN_SCORES.OPEN_TWO, name: '열린 2 (Open 2)' };
  }

  return { score: 0, name: '기본 착수' };
}

function evaluatePositionPatterns(
  board: GomokuGrid,
  move: GomokuPoint,
  color: GomokuColor
): { score: number; bestPattern: string } {
  const cChar = color === 'B' ? 'X' : 'O';
  const oppChar = color === 'B' ? 'O' : 'X';

  const directions: [number, number][] = [
    [0, 1], // H
    [1, 0], // V
    [1, 1], // D1 \
    [1, -1], // D2 /
  ];

  let totalScore = 0;
  let topPattern = '기본 착수';
  let topScore = 0;

  for (const [dr, dc] of directions) {
    let lineStr = '';
    for (let step = -4; step <= 4; step += 1) {
      const r = move.r + dr * step;
      const c = move.c + dc * step;
      if (r < 0 || r >= GOMOKU_SIZE || c < 0 || c >= GOMOKU_SIZE) {
        lineStr += '#'; // wall
      } else if (step === 0) {
        lineStr += cChar;
      } else {
        const cell = board[r][c];
        if (cell === color) lineStr += cChar;
        else if (cell === null) lineStr += '.';
        else lineStr += oppChar;
      }
    }

    const { score, name } = getLinePatternScore(lineStr, cChar, oppChar);
    totalScore += score;
    if (score > topScore) {
      topScore = score;
      topPattern = name;
    }
  }

  // Center proximity bonus
  const distCenter = Math.abs(move.r - 7) + Math.abs(move.c - 7);
  totalScore += Math.max(0, 14 - distCenter);

  return { score: totalScore, bestPattern: topPattern };
}

export function getCandidateMoves(board: GomokuGrid): GomokuPoint[] {
  const candidates: GomokuPoint[] = [];
  let hasAnyStones = false;

  const candidateMap: boolean[][] = Array.from({ length: GOMOKU_SIZE }, () =>
    Array.from({ length: GOMOKU_SIZE }, () => false)
  );

  for (let r = 0; r < GOMOKU_SIZE; r += 1) {
    for (let c = 0; c < GOMOKU_SIZE; c += 1) {
      if (board[r][c] !== null) {
        hasAnyStones = true;
        for (let dr = -2; dr <= 2; dr += 1) {
          for (let dc = -2; dc <= 2; dc += 1) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < GOMOKU_SIZE &&
              nc >= 0 &&
              nc < GOMOKU_SIZE &&
              board[nr][nc] === null &&
              !candidateMap[nr][nc]
            ) {
              candidateMap[nr][nc] = true;
              candidates.push({ r: nr, c: nc });
            }
          }
        }
      }
    }
  }

  if (!hasAnyStones) {
    return [{ r: 7, c: 7 }]; // Center Tengen
  }

  return candidates;
}

export function findBestGomokuAIMove(
  board: GomokuGrid,
  color: GomokuColor
): { move: GomokuPoint | null; score: number; pattern: string; reason: string } {
  const opponent: GomokuColor = color === 'B' ? 'W' : 'B';
  const candidates = getCandidateMoves(board);

  if (candidates.length === 0) {
    return { move: null, score: 0, pattern: '', reason: '둘 곳이 없습니다.' };
  }

  let bestMove = candidates[0];
  let bestScore = -Infinity;
  let bestPattern = '기본 착수';

  for (const move of candidates) {
    // 1. My attack score
    const attack = evaluatePositionPatterns(board, move, color);

    // 2. Opponent defense score (block opponent's win/open4/open3)
    const defense = evaluatePositionPatterns(board, move, opponent);

    // Combined heuristic: If opponent has a winning 5 or open 4, defense is highest priority
    const combinedScore = attack.score * 1.1 + defense.score * 1.0;

    if (combinedScore > bestScore) {
      bestScore = combinedScore;
      bestMove = move;
      bestPattern =
        attack.score >= defense.score ? attack.bestPattern : `수비 (${defense.bestPattern})`;
    }
  }

  return {
    move: bestMove,
    score: bestScore,
    pattern: bestPattern,
    reason: `${bestPattern}을 노리는 최적 착수점`,
  };
}

export function analyzeGomokuPosition(board: GomokuGrid, color: GomokuColor): GomokuAIAnalysis {
  const startTime = performance.now();
  const candidates = getCandidateMoves(board);

  const scoredMoves = candidates.map((m) => {
    const { score, bestPattern } = evaluatePositionPatterns(board, m, color);
    return {
      move: m,
      score,
      pattern: bestPattern,
    };
  });

  scoredMoves.sort((a, b) => b.score - a.score);

  const { move: bestMove, score: evalScore } = findBestGomokuAIMove(board, color);
  const timeMs = Math.round(performance.now() - startTime);

  return {
    evaluationScore: evalScore,
    bestMove,
    recommendedMoves: scoredMoves.slice(0, 5),
    searchDepth: 2,
    searchNodesEvaluated: candidates.length,
    timeMs: Math.max(1, timeMs),
  };
}

export function findMatchingGomokuNode(
  nodes: GomokuSolutionNode[],
  move: GomokuPoint
): GomokuSolutionNode | undefined {
  return nodes.find((n) => n.move.r === move.r && n.move.c === move.c);
}
