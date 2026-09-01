// Self-contained game move validator
import { JANGGI_BAKBO_LIST } from '../src/sections/algo-visualizer/lib/games/janggi/puzzles.ts';
import { BADUK_PUZZLE_LIST } from '../src/sections/algo-visualizer/lib/games/baduk/puzzles.ts';
import { CHESS_PUZZLE_LIST } from '../src/sections/algo-visualizer/lib/games/chess/puzzles.ts';
import { createEmptyJanggiBoard, makeJanggiMove, getPieceRawMoves } from '../src/sections/algo-visualizer/lib/games/janggi/engine.ts';
import { createEmptyBoard, playMove } from '../src/sections/algo-visualizer/lib/games/baduk/engine.ts';
import { parseFEN, makeChessMove, getAllLegalChessMoves } from '../src/sections/algo-visualizer/lib/games/chess/engine.ts';

console.log('=== 1. TESTING JANGGI BAKBO PUZZLES (' + JANGGI_BAKBO_LIST.length + ') ===');
let jFail = 0;
for (const p of JANGGI_BAKBO_LIST) {
  const board = createEmptyJanggiBoard();
  for (const item of p.initialPieces) {
    board[item.r][item.c] = item.piece;
  }

  for (const node of p.solutionTree) {
    const raw = getPieceRawMoves(board, node.from.r, node.from.c);
    const isValid = raw.validPoints.some(pt => pt.r === node.to.r && pt.c === node.to.c);
    if (!isValid) {
      console.error(`[JANGGI FAIL] ${p.id} (${p.title}): Move (${node.from.r},${node.from.c}) -> (${node.to.r},${node.to.c}) ILLEGAL! Piece:`, board[node.from.r][node.from.c]);
      jFail++;
    } else {
      const piece = board[node.from.r][node.from.c];
      const nextBoard = makeJanggiMove(board, { from: node.from, to: node.to, piece, captured: board[node.to.r][node.to.c] });
      if (node.aiResponse) {
        const aiRaw = getPieceRawMoves(nextBoard, node.aiResponse.from.r, node.aiResponse.from.c);
        const isAiValid = aiRaw.validPoints.some(pt => pt.r === node.aiResponse.to.r && pt.c === node.aiResponse.to.c);
        if (!isAiValid) {
          console.error(`[JANGGI AI FAIL] ${p.id}: AI move (${node.aiResponse.from.r},${node.aiResponse.from.c}) -> (${node.aiResponse.to.r},${node.aiResponse.to.c}) ILLEGAL!`);
          jFail++;
        }
      }
    }
  }
}
console.log('Janggi failures:', jFail);

console.log('\n=== 2. TESTING BADUK PUZZLES (' + BADUK_PUZZLE_LIST.length + ') ===');
let bFail = 0;
for (const p of BADUK_PUZZLE_LIST) {
  const board = createEmptyBoard(p.boardSize);
  for (const b of p.initialBlack) board[b.r][b.c] = 'B';
  for (const w of p.initialWhite) board[w.r][w.c] = 'W';

  for (const node of p.solutionTree) {
    const res = playMove(board, node.move, 'B');
    if (!res.valid) {
      console.error(`[BADUK FAIL] ${p.id} (${p.title}): Move (${node.move.r},${node.move.c}) ILLEGAL!`);
      bFail++;
    } else if (node.aiResponse) {
      const aiRes = playMove(res.newBoard, node.aiResponse, 'W');
      if (!aiRes.valid) {
        console.error(`[BADUK AI FAIL] ${p.id}: AI move (${node.aiResponse.r},${node.aiResponse.c}) ILLEGAL!`);
        bFail++;
      }
    }
  }
}
console.log('Baduk failures:', bFail);

console.log('\n=== 3. TESTING CHESS PUZZLES (' + CHESS_PUZZLE_LIST.length + ') ===');
let cFail = 0;
for (const p of CHESS_PUZZLE_LIST) {
  const { board } = parseFEN(p.fen);
  for (const node of p.solutionTree) {
    const legal = getAllLegalChessMoves(board, 'w');
    const isValid = legal.some(m => m.from.r === node.from.r && m.from.c === node.from.c && m.to.r === node.to.r && m.to.c === node.to.c);
    if (!isValid) {
      console.error(`[CHESS FAIL] ${p.id} (${p.title}): Move (${node.from.r},${node.from.c}) -> (${node.to.r},${node.to.c}) ILLEGAL!`);
      cFail++;
    }
  }
}
console.log('Chess failures:', cFail);

import { OTHELLO_PUZZLE_LIST } from '../src/sections/algo-visualizer/lib/games/othello/puzzles.ts';
import { createEmptyOthelloBoard, applyOthelloMove } from '../src/sections/algo-visualizer/lib/games/othello/engine.ts';

console.log('\n=== 4. TESTING OTHELLO PUZZLES (' + OTHELLO_PUZZLE_LIST.length + ') ===');
let oFail = 0;
for (const p of OTHELLO_PUZZLE_LIST) {
  const board = createEmptyOthelloBoard();
  for (const b of p.initialBlack) board[b.r][b.c] = 'B';
  for (const w of p.initialWhite) board[w.r][w.c] = 'W';

  for (const node of p.solutionTree) {
    const res = applyOthelloMove(board, node.move, 'B');
    if (!res.valid) {
      console.error(`[OTHELLO FAIL] ${p.id} (${p.title}): Move (${node.move.r},${node.move.c}) ILLEGAL!`);
      oFail++;
    }
  }
}
console.log('Othello failures:', oFail);

import { GOMOKU_PUZZLE_LIST } from '../src/sections/algo-visualizer/lib/games/gomoku/puzzles.ts';
import { createEmptyGomokuBoard } from '../src/sections/algo-visualizer/lib/games/gomoku/engine.ts';

console.log('\n=== 5. TESTING GOMOKU PUZZLES (' + GOMOKU_PUZZLE_LIST.length + ') ===');
let gFail = 0;
for (const p of GOMOKU_PUZZLE_LIST) {
  const board = createEmptyGomokuBoard();
  for (const b of p.initialBlack) board[b.r][b.c] = 'B';
  for (const w of p.initialWhite) board[w.r][w.c] = 'W';

  for (const node of p.solutionTree) {
    if (board[node.move.r][node.move.c] !== null) {
      console.error(`[GOMOKU FAIL] ${p.id} (${p.title}): Move (${node.move.r},${node.move.c}) OCCUPIED!`);
      gFail++;
    }
  }
}
console.log('Gomoku failures:', gFail);
