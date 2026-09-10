export type NonogramCellState = 0 | 1 | 2; // 0: empty, 1: filled, 2: marked X

export interface NonogramPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  solution: number[][]; // 0 or 1
  rowClues: number[][];
  colClues: number[][];
}

export function generateClues(solution: number[][]): {
  rowClues: number[][];
  colClues: number[][];
} {
  const height = solution.length;
  const width = solution[0].length;

  const rowClues: number[][] = [];
  for (let r = 0; r < height; r += 1) {
    const clues: number[] = [];
    let count = 0;
    for (let c = 0; c < width; c += 1) {
      if (solution[r][c] === 1) {
        count += 1;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    rowClues.push(clues.length > 0 ? clues : [0]);
  }

  const colClues: number[][] = [];
  for (let c = 0; c < width; c += 1) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < height; r += 1) {
      if (solution[r][c] === 1) {
        count += 1;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length > 0 ? clues : [0]);
  }

  return { rowClues, colClues };
}

const HEART_5X5 = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

const SMILE_5X5 = [
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

const DUCK_10X10 = [
  [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
];

const CHERRY_10X10 = [
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const INVADER_15X15 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function makePreset(id: string, name: string, solution: number[][]): NonogramPreset {
  const { rowClues, colClues } = generateClues(solution);
  return {
    id,
    name,
    width: solution[0].length,
    height: solution.length,
    solution,
    rowClues,
    colClues,
  };
}

export const NONOGRAM_PRESETS: NonogramPreset[] = [
  makePreset('heart-5x5', '5x5 사랑의 하트', HEART_5X5),
  makePreset('smile-5x5', '5x5 스마일 이모지', SMILE_5X5),
  makePreset('duck-10x10', '10x10 노란 오리', DUCK_10X10),
  makePreset('cherry-10x10', '10x10 달콤한 체리', CHERRY_10X10),
  makePreset('invader-15x15', '15x15 스페이스 인베이더', INVADER_15X15),
];

export function isRowSatisfied(gridRow: NonogramCellState[], targetClues: number[]): boolean {
  const lineClues: number[] = [];
  let count = 0;
  for (let c = 0; c < gridRow.length; c += 1) {
    if (gridRow[c] === 1) {
      count += 1;
    } else if (count > 0) {
      lineClues.push(count);
      count = 0;
    }
  }
  if (count > 0) lineClues.push(count);
  const actualClues = lineClues.length > 0 ? lineClues : [0];

  if (actualClues.length !== targetClues.length) return false;
  return actualClues.every((v, i) => v === targetClues[i]);
}

export function getHintCell(
  currentGrid: NonogramCellState[][],
  solution: number[][]
): { row: number; col: number; state: 1 | 2 } | null {
  const height = solution.length;
  const width = solution[0].length;

  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      const correctState = solution[r][c] === 1 ? 1 : 2;
      if (currentGrid[r][c] !== correctState) {
        return { row: r, col: c, state: correctState };
      }
    }
  }
  return null;
}

export interface NonogramStep {
  row: number;
  col: number;
  state: 1 | 2;
  grid: NonogramCellState[][];
  description: string;
}

export function generateNonogramSolutionSteps(
  initialGrid: NonogramCellState[][],
  solution: number[][]
): NonogramStep[] {
  const height = solution.length;
  const width = solution[0].length;
  const current = initialGrid.map((row) => [...row]);
  const steps: NonogramStep[] = [];

  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      const targetState = solution[r][c] === 1 ? 1 : 2;
      if (current[r][c] !== targetState) {
        current[r][c] = targetState;
        steps.push({
          row: r,
          col: c,
          state: targetState,
          grid: current.map((row) => [...row]),
          description: `(${r + 1}행, ${c + 1}열) ${
            targetState === 1 ? '■ 칠하기' : '✖ X표시(빈칸) 확정'
          }`,
        });
      }
    }
  }

  return steps;
}
