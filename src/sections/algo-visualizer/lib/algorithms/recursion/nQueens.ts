import type { Step, CallStackFrame } from '../types';

export const N_QUEENS_CODE = `// N-Queen 문제 백트래킹 (N×N 체스판에 N개의 퀸 배치)
function solveNQueens(n: number): number[][] {
  const board: number[] = new Array(n).fill(-1); // board[row] = col
  const solutions: number[][] = [];

  function isSafe(row: number, col: number): boolean {
    for (let prevRow = 0; prevRow < row; prevRow++) {
      const prevCol = board[prevRow];
      // 1. 같은 열(Column) 충돌 검사
      if (prevCol === col) return false;
      // 2. 대각선(Diagonal) 충돌 검사
      if (Math.abs(prevRow - row) === Math.abs(prevCol - col)) return false;
    }
    return true;
  }

  function placeQueen(row: number) {
    if (row === n) {
      solutions.push([...board]);
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        placeQueen(row + 1);
        board[row] = -1; // Backtrack
      }
    }
  }

  placeQueen(0);
  return solutions;
}`;

export const DEFAULT_N_QUEENS = 4;

export function generateNQueensSteps(n: number = DEFAULT_N_QUEENS): Step[] {
  const steps: Step[] = [];
  const boardSize = Math.max(4, Math.min(5, n));
  const board: number[] = new Array(boardSize).fill(-1);
  const solutions: number[][] = [];
  const stack: CallStackFrame[] = [];

  function to2DBoard(): number[][] {
    const grid: number[][] = Array.from({ length: boardSize }, () => new Array(boardSize).fill(0));
    for (let r = 0; r < boardSize; r++) {
      if (board[r] !== -1) {
        grid[r][board[r]] = 1; // Queen placed
      }
    }
    return grid;
  }

  function isSafe(row: number, col: number): boolean {
    for (let prevRow = 0; prevRow < row; prevRow++) {
      const prevCol = board[prevRow];
      if (prevCol === col) return false;
      if (Math.abs(prevRow - row) === Math.abs(prevCol - col)) return false;
    }
    return true;
  }

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `N-Queen 백트래킹 시작: ${boardSize}×${boardSize} 체스판에 서로 공격할 수 없도록 ${boardSize}개의 퀸을 배치합니다.`,
    variables: { N: boardSize, totalSolutions: 0, phase: '시작' },
    chessBoard: to2DBoard(),
    callStack: [],
    soundType: 'step',
  });

  function placeQueen(row: number) {
    const frame: CallStackFrame = {
      id: `queen-row-${row}`,
      name: 'placeQueen',
      args: `row = ${row}`,
      depth: row,
      status: 'active',
    };
    stack.push(frame);

    if (row === boardSize) {
      solutions.push([...board]);
      steps.push({
        stepIndex: steps.length,
        line: 18,
        description: `[🎉 N-Queen 해답 발견!] 모든 ${boardSize}개의 퀸이 충돌 없이 안전하게 배치되었습니다! (현재까지 총 ${solutions.length}개 해답 도출)`,
        variables: { row, totalSolutions: solutions.length, status: '해답 발견' },
        chessBoard: to2DBoard(),
        callStack: stack.map((s) => ({ ...s })),
        generatedCombinations: solutions.map((sol) => [...sol]),
        soundType: 'found',
        soundValue: 90,
      });

      stack.pop();
      return;
    }

    for (let col = 0; col < boardSize; col++) {
      const safe = isSafe(row, col);

      if (safe) {
        board[row] = col;
        steps.push({
          stepIndex: steps.length,
          line: 24,
          description: `행 ${row}, 열 ${col}에 퀸 배치 성공 (충돌 없음) ➔ 다음 행 placeQueen(${row + 1}) 호출`,
          variables: { row, col, isSafe: true },
          chessBoard: to2DBoard(),
          callStack: stack.map((s) => ({ ...s })),
          soundType: 'compare',
          soundValue: (row * boardSize + col) * 10 + 20,
        });

        placeQueen(row + 1);

        // Backtrack
        board[row] = -1;
        steps.push({
          stepIndex: steps.length,
          line: 26,
          description: `[백트래킹] 행 ${row}, 열 ${col}의 퀸 제거 후 다음 열 탐색 진행`,
          variables: { row, col, action: 'Backtrack' },
          chessBoard: to2DBoard(),
          callStack: stack.map((s) => ({ ...s })),
          soundType: 'swap',
        });
      } else {
        steps.push({
          stepIndex: steps.length,
          line: 10,
          description: `행 ${row}, 열 ${col}에 퀸 배치 불가 (기존 퀸과 같은 열 또는 대각선 충돌)`,
          variables: { row, col, isSafe: false },
          chessBoard: to2DBoard(),
          callStack: stack.map((s) => ({ ...s })),
          soundType: 'step',
        });
      }
    }

    stack.pop();
  }

  placeQueen(0);

  steps.push({
    stepIndex: steps.length,
    line: 30,
    description: `N-Queen 탐색 완료! ${boardSize}×${boardSize} 체스판에서 총 ${solutions.length}개의 모든 유효한 배치 구성을 찾았습니다.`,
    variables: { totalValidPlacements: solutions.length, status: '완료' },
    chessBoard:
      solutions.length > 0
        ? // Show first solution on board
          Array.from({ length: boardSize }, (_, r) => {
            const rowArr = new Array(boardSize).fill(0);
            rowArr[solutions[0][r]] = 1;
            return rowArr;
          })
        : to2DBoard(),
    callStack: [],
    generatedCombinations: solutions.map((sol) => [...sol]),
    soundType: 'complete',
  });

  return steps;
}
