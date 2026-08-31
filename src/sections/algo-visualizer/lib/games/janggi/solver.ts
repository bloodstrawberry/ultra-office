import type {
  JanggiSide,
  JanggiMove,
  JanggiBoard,
  JanggiAIAnalysis,
  JanggiSolutionNode,
} from './types';

import {
  JANGGI_ROWS,
  JANGGI_COLS,
  isSideInCheck,
  makeJanggiMove,
  getPieceRawMoves,
  isSameJanggiPoint,
  getJanggiPieceName,
  JANGGI_PIECE_VALUES,
} from './engine';

/** Calculate material and positional evaluation score */
export function evaluateJanggiBoard(board: JanggiBoard, perspectiveSide: JanggiSide): number {
  let choScore = 0;
  let hanScore = 1.5; // Han gets 1.5 komi (덤)

  for (let r = 0; r < JANGGI_ROWS; r += 1) {
    for (let c = 0; c < JANGGI_COLS; c += 1) {
      const piece = board[r][c];
      if (piece) {
        const val = JANGGI_PIECE_VALUES[piece.type];
        if (piece.side === 'CHO') {
          choScore += val;
          // Advancement bonus for soldier/horse/chariot
          if (r <= 4) choScore += 0.3;
        } else {
          hanScore += val;
          if (r >= 5) hanScore += 0.3;
        }
      }
    }
  }

  const scoreDiff = choScore - hanScore;
  return perspectiveSide === 'CHO' ? scoreDiff : -scoreDiff;
}

/** Get all strictly legal moves for a given side (ensuring move does not leave own king in check & never captures own piece) */
export function getAllLegalJanggiMoves(board: JanggiBoard, side: JanggiSide): JanggiMove[] {
  const legalMoves: JanggiMove[] = [];

  for (let r = 0; r < JANGGI_ROWS; r += 1) {
    for (let c = 0; c < JANGGI_COLS; c += 1) {
      const piece = board[r][c];
      if (piece && piece.side === side) {
        const { validPoints } = getPieceRawMoves(board, r, c);
        for (const dest of validPoints) {
          const target = board[dest.r][dest.c];
          // STRICT RULE: Cannot move onto or capture own team piece!
          if (target && target.side === side) continue;

          const candidateMove: JanggiMove = {
            from: { r, c },
            to: dest,
            piece,
            captured: target,
          };
          const nextBoard = makeJanggiMove(board, candidateMove);
          // King cannot be in check after own move
          if (!isSideInCheck(nextBoard, side)) {
            candidateMove.isCheck = isSideInCheck(nextBoard, side === 'CHO' ? 'HAN' : 'CHO');
            legalMoves.push(candidateMove);
          }
        }
      }
    }
  }

  return legalMoves;
}

/** Minimax Alpha-Beta search for Janggi */
export function minimaxJanggi(
  board: JanggiBoard,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  playerSide: JanggiSide,
  stats = { nodes: 0 }
): { score: number; bestMove: JanggiMove | null } {
  stats.nodes += 1;
  const currentSide: JanggiSide = isMaximizing ? playerSide : playerSide === 'CHO' ? 'HAN' : 'CHO';

  const moves = getAllLegalJanggiMoves(board, currentSide);

  // Checkmate or Stalemate
  if (moves.length === 0) {
    if (isSideInCheck(board, currentSide)) {
      return { score: isMaximizing ? -9999 : 9999, bestMove: null };
    }
    return { score: 0, bestMove: null };
  }

  if (depth === 0) {
    return { score: evaluateJanggiBoard(board, playerSide), bestMove: null };
  }

  // Order moves: Checks and captures first
  moves.sort((a, b) => {
    const aVal = (a.captured ? JANGGI_PIECE_VALUES[a.captured.type] : 0) + (a.isCheck ? 50 : 0);
    const bVal = (b.captured ? JANGGI_PIECE_VALUES[b.captured.type] : 0) + (b.isCheck ? 50 : 0);
    return bVal - aVal;
  });

  let bestMove: JanggiMove | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextBoard = makeJanggiMove(board, move);
      const { score } = minimaxJanggi(nextBoard, depth - 1, alpha, beta, false, playerSide, stats);
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
      const nextBoard = makeJanggiMove(board, move);
      const { score } = minimaxJanggi(nextBoard, depth - 1, alpha, beta, true, playerSide, stats);
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

/** Dynamic legal AI move generator for defensive and tactical response */
export function findBestJanggiAIMove(
  board: JanggiBoard,
  side: JanggiSide = 'HAN'
): { move: JanggiMove | null; isCheckmate: boolean; reason: string } {
  const legalMoves = getAllLegalJanggiMoves(board, side);
  const inCheck = isSideInCheck(board, side);

  if (legalMoves.length === 0) {
    return {
      move: null,
      isCheckmate: inCheck,
      reason: inCheck ? '외통수 (피할 길 없음)' : '빅 (Stalemate)',
    };
  }

  // 1. If King is in check, prioritize king escape or blocker that maintains safety
  const stats = { nodes: 0 };
  const { bestMove } = minimaxJanggi(board, 2, -Infinity, Infinity, true, side, stats);

  if (bestMove) {
    let reason = '수비 및 포지션 정비';
    if (inCheck) {
      if (bestMove.piece.type === 'KING') reason = '한 궁 장군 피신';
      else reason = `${getJanggiPieceName(bestMove.piece.type, side)} 장군 방어`;
    } else if (bestMove.isCheck) {
      reason = '역장군 반격!';
    } else if (bestMove.captured) {
      reason = `초 ${getJanggiPieceName(bestMove.captured.type, bestMove.captured.side)} 포획`;
    }

    return { move: bestMove, isCheckmate: false, reason };
  }

  return { move: legalMoves[0], isCheckmate: false, reason: '합법적 수순 진행' };
}

/** Comprehensive Janggi AI analysis */
export function analyzeJanggiPosition(
  board: JanggiBoard,
  playerSide: JanggiSide
): JanggiAIAnalysis {
  const startTime = Date.now();

  let choScore = 0;
  let hanScore = 1.5;
  for (let r = 0; r < JANGGI_ROWS; r += 1) {
    for (let c = 0; c < JANGGI_COLS; c += 1) {
      const piece = board[r][c];
      if (piece) {
        if (piece.side === 'CHO') choScore += JANGGI_PIECE_VALUES[piece.type];
        else hanScore += JANGGI_PIECE_VALUES[piece.type];
      }
    }
  }

  const isChoInCheck = isSideInCheck(board, 'CHO');
  const isHanInCheck = isSideInCheck(board, 'HAN');

  const stats = { nodes: 0 };
  const searchDepth = 3;
  const { bestMove } = minimaxJanggi(
    board,
    searchDepth,
    -Infinity,
    Infinity,
    true,
    playerSide,
    stats
  );

  const recommendedMoves: { move: JanggiMove; score: number; reason: string }[] = [];
  if (bestMove) {
    let reason = '포지션 우위 점유';
    if (bestMove.isCheck) reason = '장군! 상대 궁성 직격 압박';
    else if (bestMove.captured) {
      reason = `상대 ${getJanggiPieceName(bestMove.captured.type, bestMove.captured.side)} 포획`;
    }

    recommendedMoves.push({
      move: bestMove,
      score: 95,
      reason,
    });
  }

  // Add 1-2 secondary moves
  const legalMoves = getAllLegalJanggiMoves(board, playerSide);
  for (const m of legalMoves) {
    if (
      !bestMove ||
      !isSameJanggiPoint(m.from, bestMove.from) ||
      !isSameJanggiPoint(m.to, bestMove.to)
    ) {
      if (recommendedMoves.length < 3) {
        recommendedMoves.push({
          move: m,
          score: 75,
          reason: m.isCheck ? '장군 위협 경로' : '기물 전진 및 활로 확보',
        });
      }
    }
  }

  const timeMs = Date.now() - startTime;

  return {
    choScore,
    hanScore,
    scoreAdvantage: choScore - hanScore,
    isChoInCheck,
    isHanInCheck,
    recommendedMoves,
    searchNodesEvaluated: stats.nodes,
    searchDepth,
    timeMs,
  };
}

/** Check if user move matches Bakbo solution tree */
export function findMatchingBakboNode(
  tree: JanggiSolutionNode[],
  from: { r: number; c: number },
  to: { r: number; c: number }
): JanggiSolutionNode | null {
  for (const node of tree) {
    if (isSameJanggiPoint(node.from, from) && isSameJanggiPoint(node.to, to)) {
      return node;
    }
  }
  return null;
}
