/* eslint-disable no-bitwise -- Bit masks enumerate possible mine placements around visible clues. */

export type VisibleCell = { revealed: boolean; flagged: boolean; count: number };
export type MinesweeperMove = {
  index: number;
  action: 'reveal' | 'flag' | 'guess';
  reason: string;
  probability?: number;
};

type Constraint = { cells: number[]; mines: number; source: number };

function neighbors(index: number, rows: number, cols: number) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
    }
  }
  return result;
}

function cellName(index: number, cols: number) {
  return `${Math.floor(index / cols) + 1}행 ${(index % cols) + 1}열`;
}

export function getMinesweeperMove(
  board: VisibleCell[],
  rows: number,
  cols: number,
  totalMines: number
): MinesweeperMove | null {
  const closed = board
    .map((cell, index) => (!cell.revealed && !cell.flagged ? index : -1))
    .filter((i) => i >= 0);
  if (!closed.length) return null;
  const remainingMines = totalMines - board.filter((cell) => cell.flagged).length;
  const constraints: Constraint[] = [];
  let inconsistent = false;

  board.forEach((cell, source) => {
    if (!cell.revealed || !cell.count) return;
    const adjacent = neighbors(source, rows, cols);
    const unknown = adjacent.filter((index) => !board[index].revealed && !board[index].flagged);
    const mines = cell.count - adjacent.filter((index) => board[index].flagged).length;
    if (mines < 0 || mines > unknown.length) inconsistent = true;
    if (unknown.length) constraints.push({ cells: unknown, mines, source });
  });

  if (inconsistent || remainingMines < 0 || remainingMines > closed.length) return null;

  for (const constraint of constraints) {
    if (constraint.mines === 0) {
      return {
        index: constraint.cells[0],
        action: 'reveal',
        reason: `${cellName(constraint.source, cols)}의 지뢰 ${board[constraint.source].count}개가 모두 표시되어 주변 칸은 안전합니다.`,
      };
    }
    if (constraint.mines === constraint.cells.length) {
      return {
        index: constraint.cells[0],
        action: 'flag',
        reason: `${cellName(constraint.source, cols)}의 남은 지뢰 ${constraint.mines}개와 닫힌 칸 ${constraint.cells.length}개가 같아 깃발을 꽂습니다.`,
      };
    }
  }

  if (remainingMines === 0) {
    return { index: closed[0], action: 'reveal', reason: '남은 지뢰가 없어 닫힌 칸은 안전합니다.' };
  }
  if (remainingMines === closed.length) {
    return { index: closed[0], action: 'flag', reason: '남은 닫힌 칸이 모두 지뢰입니다.' };
  }

  for (const a of constraints) {
    for (const b of constraints) {
      if (a === b || a.cells.length >= b.cells.length) continue;
      const aSet = new Set(a.cells);
      if (!a.cells.every((index) => b.cells.includes(index))) continue;
      const difference = b.cells.filter((index) => !aSet.has(index));
      const mines = b.mines - a.mines;
      if (mines === 0 || mines === difference.length) {
        return {
          index: difference[0],
          action: mines === 0 ? 'reveal' : 'flag',
          reason: `${cellName(a.source, cols)}와 ${cellName(b.source, cols)}의 공통 주변 칸을 비교하면 차이 칸 ${difference.length}개 중 지뢰가 ${mines}개입니다.`,
        };
      }
    }
  }

  // Enumerate only small connected frontiers to make further certain deductions.
  const frontier = [...new Set(constraints.flatMap((constraint) => constraint.cells))];
  const seen = new Set<number>();
  for (const start of frontier) {
    if (seen.has(start)) continue;
    const component = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const current = queue.pop()!;
      if (seen.has(current)) continue;
      seen.add(current);
      constraints
        .filter((constraint) => constraint.cells.includes(current))
        .forEach((constraint) => {
          constraint.cells.forEach((index) => {
            if (!component.has(index)) {
              component.add(index);
              queue.push(index);
            }
          });
        });
    }
    if (component.size > 16) continue;
    const cells = [...component];
    const related = constraints.filter((constraint) =>
      constraint.cells.some((index) => component.has(index))
    );
    const mineOccurrences = new Array<number>(cells.length).fill(0);
    let valid = 0;
    for (let mask = 0; mask < 1 << cells.length; mask += 1) {
      if (
        !related.every(
          (constraint) =>
            constraint.cells.reduce(
              (count, index) => count + Number(Boolean(mask & (1 << cells.indexOf(index)))),
              0
            ) === constraint.mines
        )
      )
        continue;
      valid += 1;
      cells.forEach((_, i) => {
        if (mask & (1 << i)) mineOccurrences[i] += 1;
      });
    }
    if (!valid) continue;
    const certain = mineOccurrences.findIndex((count) => count === 0 || count === valid);
    if (certain >= 0) {
      const isMine = mineOccurrences[certain] === valid;
      return {
        index: cells[certain],
        action: isMine ? 'flag' : 'reveal',
        reason: `주변 숫자들이 허용하는 ${valid}가지 배치를 비교하면 ${cellName(cells[certain], cols)}은(는) ${isMine ? '항상 지뢰' : '항상 안전한 칸'}입니다.`,
      };
    }
  }

  const baseRisk = Math.max(0, Math.min(1, remainingMines / closed.length));
  const ranked = closed
    .map((index) => {
      const touching = constraints.filter((constraint) => constraint.cells.includes(index));
      const risk = touching.length
        ? Math.max(...touching.map((constraint) => constraint.mines / constraint.cells.length))
        : baseRisk;
      return { index, risk };
    })
    .sort((a, b) => a.risk - b.risk);
  const choice = ranked[0];
  return {
    index: choice.index,
    action: 'guess',
    probability: choice.risk,
    reason: `확정할 수 있는 칸이 없어 ${cellName(choice.index, cols)}을(를) 추측합니다. 추정 지뢰 확률은 약 ${Math.round(choice.risk * 100)}%입니다.`,
  };
}
