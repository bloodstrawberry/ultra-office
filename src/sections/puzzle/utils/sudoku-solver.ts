export type SudokuBoard = number[][];

export interface SudokuHint {
  row: number;
  col: number;
  value: number;
}

export const SUDOKU_PRESETS: Record<string, { name: string; board: SudokuBoard }> = {
  easy: {
    name: '쉬움 (Easy)',
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  medium: {
    name: '보통 (Medium)',
    board: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
  },
  hard: {
    name: '전문가 (Hard)',
    board: [
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 6, 0, 0, 0, 0, 3],
      [0, 7, 4, 0, 8, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 0, 2],
      [0, 8, 0, 0, 4, 0, 0, 1, 0],
      [6, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 7, 8, 0],
      [5, 0, 0, 0, 0, 9, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 4, 0],
    ],
  },
  empty: {
    name: '직접 입력 (Empty)',
    board: Array.from({ length: 9 }, () => Array(9).fill(0)),
  },
  sample: {
    name: '📸 업로드 샘플 (Sample Image)',
    board: [
      [8, 4, 0, 3, 0, 0, 0, 0, 9],
      [0, 0, 9, 7, 5, 0, 8, 0, 0],
      [0, 3, 0, 0, 8, 0, 6, 0, 0],
      [0, 0, 6, 2, 3, 0, 0, 0, 7],
      [2, 1, 8, 5, 4, 7, 0, 0, 0],
      [7, 0, 0, 0, 9, 0, 0, 8, 0],
      [0, 0, 4, 1, 0, 5, 0, 0, 8],
      [0, 6, 0, 0, 7, 0, 4, 1, 0],
      [0, 0, 5, 9, 0, 4, 7, 6, 3],
    ],
  },
};

export function cloneBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]);
}

export function isValidPlacement(
  board: SudokuBoard,
  row: number,
  col: number,
  num: number
): boolean {
  for (let c = 0; c < 9; c += 1) {
    if (c !== col && board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r += 1) {
    if (r !== row && board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const curR = boxRow + r;
      const curC = boxCol + c;
      if ((curR !== row || curC !== col) && board[curR][curC] === num) {
        return false;
      }
    }
  }
  return true;
}

export function solveSudoku(board: SudokuBoard): { solved: boolean; solution: SudokuBoard } {
  const copy = cloneBoard(board);

  function backtrack(): boolean {
    let minCandidates = 10;
    let targetRow = -1;
    let targetCol = -1;
    let targetCandidates: number[] = [];

    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (copy[r][c] === 0) {
          const candidates: number[] = [];
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(copy, r, c, num)) {
              candidates.push(num);
            }
          }
          if (candidates.length === 0) return false;
          if (candidates.length < minCandidates) {
            minCandidates = candidates.length;
            targetRow = r;
            targetCol = c;
            targetCandidates = candidates;
            if (minCandidates === 1) break;
          }
        }
      }
      if (minCandidates === 1) break;
    }

    if (targetRow === -1) {
      return true; // All filled
    }

    for (const num of targetCandidates) {
      copy[targetRow][targetCol] = num;
      if (backtrack()) return true;
      copy[targetRow][targetCol] = 0;
    }

    return false;
  }

  const success = backtrack();
  return { solved: success, solution: copy };
}

export function findCellHint(board: SudokuBoard): SudokuHint | null {
  const { solved, solution } = solveSudoku(board);
  if (!solved) return null;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] === 0) {
        return { row: r, col: c, value: solution[r][c] };
      }
    }
  }
  return null;
}

export function calculateCandidates(board: SudokuBoard): number[][][] {
  const candidates: number[][][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [])
  );

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] === 0) {
        for (let num = 1; num <= 9; num += 1) {
          if (isValidPlacement(board, r, c, num)) {
            candidates[r][c].push(num);
          }
        }
      }
    }
  }

  return candidates;
}

export function getConflicts(board: SudokuBoard): Set<string> {
  const conflicts = new Set<string>();

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const val = board[r][c];
      if (val !== 0) {
        // check row
        for (let oc = 0; oc < 9; oc += 1) {
          if (oc !== c && board[r][oc] === val) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${r}-${oc}`);
          }
        }
        // check col
        for (let or = 0; or < 9; or += 1) {
          if (or !== r && board[or][c] === val) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${or}-${c}`);
          }
        }
        // check box
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr += 1) {
          for (let dc = 0; dc < 3; dc += 1) {
            const cr = br + dr;
            const cc = bc + dc;
            if ((cr !== r || cc !== c) && board[cr][cc] === val) {
              conflicts.add(`${r}-${c}`);
              conflicts.add(`${cr}-${cc}`);
            }
          }
        }
      }
    }
  }

  return conflicts;
}

export interface SudokuContradiction {
  row: number;
  col: number;
  reason: string;
  relatedCells: { r: number; c: number }[];
}

export interface SudokuStep {
  row: number;
  col: number;
  value: number;
  board: SudokuBoard;
  description: string;
  isContradiction?: boolean;
  contradictionReason?: string;
  relatedCells?: { r: number; c: number }[];
}

export interface GenerateSudokuStepsResult {
  steps: SudokuStep[];
  solved: boolean;
  contradiction: SudokuContradiction | null;
}

export function getPeerCells(
  board: SudokuBoard,
  row: number,
  col: number
): { r: number; c: number }[] {
  const peers: { r: number; c: number }[] = [];
  const seen = new Set<string>();

  // row
  for (let c = 0; c < 9; c += 1) {
    if (c !== col && board[row][c] !== 0) {
      peers.push({ r: row, c });
      seen.add(`${row}-${c}`);
    }
  }
  // col
  for (let r = 0; r < 9; r += 1) {
    if (r !== row && board[r][col] !== 0) {
      if (!seen.has(`${r}-${col}`)) {
        peers.push({ r, c: col });
        seen.add(`${r}-${col}`);
      }
    }
  }
  // box
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let dr = 0; dr < 3; dr += 1) {
    for (let dc = 0; dc < 3; dc += 1) {
      const cr = br + dr;
      const cc = bc + dc;
      if ((cr !== row || cc !== col) && board[cr][cc] !== 0) {
        if (!seen.has(`${cr}-${cc}`)) {
          peers.push({ r: cr, c: cc });
          seen.add(`${cr}-${cc}`);
        }
      }
    }
  }

  return peers;
}

export function generateSudokuSolutionSteps(board: SudokuBoard): GenerateSudokuStepsResult {
  const { solved, solution } = solveSudoku(board);
  const current = cloneBoard(board);
  const steps: SudokuStep[] = [];

  // If board is completely solvable, generate full solution steps
  if (solved) {
    while (true) {
      let minCandidates = 10;
      let targetRow = -1;
      let targetCol = -1;

      for (let r = 0; r < 9; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          if (current[r][c] === 0) {
            let count = 0;
            for (let num = 1; num <= 9; num += 1) {
              if (isValidPlacement(current, r, c, num)) count += 1;
            }
            if (count < minCandidates) {
              minCandidates = count;
              targetRow = r;
              targetCol = c;
            }
          }
        }
      }

      if (targetRow === -1) break;

      const val = solution[targetRow][targetCol];
      current[targetRow][targetCol] = val;
      steps.push({
        row: targetRow,
        col: targetCol,
        value: val,
        board: cloneBoard(current),
        description: `(${targetRow + 1}행, ${targetCol + 1}열)에 정답 숫자 [${val}] 채우기`,
      });
    }

    return { steps, solved: true, contradiction: null };
  }

  // If puzzle is unsolvable: solve as far as logically possible, then pinpoint contradiction
  while (true) {
    // 1. Check if any empty cell has 0 candidates right now (direct deadlock)
    let directDeadlockCell: { r: number; c: number } | null = null;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (current[r][c] === 0) {
          let count = 0;
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(current, r, c, num)) count += 1;
          }
          if (count === 0) {
            directDeadlockCell = { r, c };
            break;
          }
        }
      }
      if (directDeadlockCell) break;
    }

    if (directDeadlockCell) {
      const { r, c } = directDeadlockCell;
      const peers = getPeerCells(current, r, c);
      const contradiction: SudokuContradiction = {
        row: r,
        col: c,
        reason: `(${r + 1}행, ${c + 1}열) 칸에는 1~9 중 들어갈 수 있는 유효한 숫자가 단 하나도 없습니다. (행/열/박스에 모든 숫자가 선점됨)`,
        relatedCells: peers,
      };
      steps.push({
        row: r,
        col: c,
        value: 0,
        board: cloneBoard(current),
        description: `🚨 모순 발생! ${contradiction.reason}`,
        isContradiction: true,
        contradictionReason: contradiction.reason,
        relatedCells: peers,
      });
      return { steps, solved: false, contradiction };
    }

    // 2. Check Naked Singles (cells with exactly 1 candidate)
    let nakedSingle: { r: number; c: number; val: number } | null = null;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (current[r][c] === 0) {
          const candidates: number[] = [];
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(current, r, c, num)) candidates.push(num);
          }
          if (candidates.length === 1) {
            nakedSingle = { r, c, val: candidates[0] };
            break;
          }
        }
      }
      if (nakedSingle) break;
    }

    if (nakedSingle) {
      const { r, c, val } = nakedSingle;
      current[r][c] = val;
      steps.push({
        row: r,
        col: c,
        value: val,
        board: cloneBoard(current),
        description: `(${r + 1}행, ${c + 1}열)에 유일한 후보 숫자 [${val}] 채우기 (Naked Single)`,
      });
      continue;
    }

    // 3. Check Hidden Singles in units (row, col, 3x3 box)
    let hiddenSingle: { r: number; c: number; val: number; reason: string } | null = null;
    let unitContradiction: { r: number; c: number; reason: string } | null = null;

    for (let d = 1; d <= 9; d += 1) {
      // Row check
      for (let r = 0; r < 9; r += 1) {
        let hasDigit = false;
        for (let c = 0; c < 9; c += 1) {
          if (current[r][c] === d) {
            hasDigit = true;
            break;
          }
        }
        if (!hasDigit) {
          const possibleCols: number[] = [];
          for (let c = 0; c < 9; c += 1) {
            if (current[r][c] === 0 && isValidPlacement(current, r, c, d)) {
              possibleCols.push(c);
            }
          }
          if (possibleCols.length === 0) {
            unitContradiction = {
              r,
              c: 0,
              reason: `${r + 1}행에 숫자 [${d}]가 들어갈 수 있는 빈 칸이 전혀 없습니다.`,
            };
            break;
          }
          if (possibleCols.length === 1) {
            hiddenSingle = {
              r,
              c: possibleCols[0],
              val: d,
              reason: `${r + 1}행에서 숫자 [${d}]가 들어갈 수 있는 유일한 자리`,
            };
            break;
          }
        }
      }
      if (unitContradiction || hiddenSingle) break;

      // Column check
      for (let c = 0; c < 9; c += 1) {
        let hasDigit = false;
        for (let r = 0; r < 9; r += 1) {
          if (current[r][c] === d) {
            hasDigit = true;
            break;
          }
        }
        if (!hasDigit) {
          const possibleRows: number[] = [];
          for (let r = 0; r < 9; r += 1) {
            if (current[r][c] === 0 && isValidPlacement(current, r, c, d)) {
              possibleRows.push(r);
            }
          }
          if (possibleRows.length === 0) {
            unitContradiction = {
              r: 0,
              c,
              reason: `${c + 1}열에 숫자 [${d}]가 들어갈 수 있는 빈 칸이 전혀 없습니다.`,
            };
            break;
          }
          if (possibleRows.length === 1) {
            hiddenSingle = {
              r: possibleRows[0],
              c,
              val: d,
              reason: `${c + 1}열에서 숫자 [${d}]가 들어갈 수 있는 유일한 자리`,
            };
            break;
          }
        }
      }
      if (unitContradiction || hiddenSingle) break;

      // Box check
      for (let b = 0; b < 9; b += 1) {
        const br = Math.floor(b / 3) * 3;
        const bc = (b % 3) * 3;
        let hasDigit = false;
        for (let dr = 0; dr < 3; dr += 1) {
          for (let dc = 0; dc < 3; dc += 1) {
            if (current[br + dr][bc + dc] === d) {
              hasDigit = true;
              break;
            }
          }
          if (hasDigit) break;
        }
        if (!hasDigit) {
          const possibleCells: { r: number; c: number }[] = [];
          for (let dr = 0; dr < 3; dr += 1) {
            for (let dc = 0; dc < 3; dc += 1) {
              const cr = br + dr;
              const cc = bc + dc;
              if (current[cr][cc] === 0 && isValidPlacement(current, cr, cc, d)) {
                possibleCells.push({ r: cr, c: cc });
              }
            }
          }
          if (possibleCells.length === 0) {
            unitContradiction = {
              r: br,
              c: bc,
              reason: `3x3 박스(${br + 1}~${br + 3}행, ${bc + 1}~${bc + 3}열)에 숫자 [${d}]가 들어갈 수 있는 자리가 없습니다.`,
            };
            break;
          }
          if (possibleCells.length === 1) {
            hiddenSingle = {
              r: possibleCells[0].r,
              c: possibleCells[0].c,
              val: d,
              reason: `해당 3x3 박스에서 숫자 [${d}]가 들어갈 수 있는 유일한 자리`,
            };
            break;
          }
        }
      }
      if (unitContradiction || hiddenSingle) break;
    }

    if (unitContradiction) {
      const cr = unitContradiction.r;
      const cc = unitContradiction.c;
      const contradiction: SudokuContradiction = {
        row: cr,
        col: cc,
        reason: unitContradiction.reason,
        relatedCells: [],
      };
      steps.push({
        row: cr,
        col: cc,
        value: 0,
        board: cloneBoard(current),
        description: `🚨 모순 발생! ${unitContradiction.reason}`,
        isContradiction: true,
        contradictionReason: unitContradiction.reason,
        relatedCells: [],
      });
      return { steps, solved: false, contradiction };
    }

    if (hiddenSingle) {
      const { r, c, val, reason } = hiddenSingle;
      current[r][c] = val;
      steps.push({
        row: r,
        col: c,
        value: val,
        board: cloneBoard(current),
        description: `(${r + 1}행, ${c + 1}열)에 숫자 [${val}] 채우기 (${reason})`,
      });
      continue;
    }

    // 4. If all singles are exhausted and branching is required:
    // Pick the cell with minimum candidates (MRV) where all choices lead to a deadlock
    let minCandidates = 10;
    let targetCell: { r: number; c: number; candidates: number[] } | null = null;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (current[r][c] === 0) {
          const candidates: number[] = [];
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(current, r, c, num)) candidates.push(num);
          }
          if (candidates.length < minCandidates && candidates.length > 0) {
            minCandidates = candidates.length;
            targetCell = { r, c, candidates };
          }
        }
      }
    }

    if (!targetCell) {
      break;
    }

    const { r, c, candidates } = targetCell;
    const peers = getPeerCells(current, r, c);
    const contradiction: SudokuContradiction = {
      row: r,
      col: c,
      reason: `(${r + 1}행, ${c + 1}열) 칸의 후보 숫자 [${candidates.join(', ')}] 중 어떤 숫자를 대입해도 이후 모순이 발생하여 완성할 수 없습니다.`,
      relatedCells: peers,
    };
    steps.push({
      row: r,
      col: c,
      value: 0,
      board: cloneBoard(current),
      description: `🚨 모순 발생! ${contradiction.reason}`,
      isContradiction: true,
      contradictionReason: contradiction.reason,
      relatedCells: peers,
    });
    return { steps, solved: false, contradiction };
  }

  return { steps, solved: false, contradiction: null };
}
