export type SlidingSize = 3 | 4;

export interface SlidingMove {
  tileIndex: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  tileValue: number;
}

export function getGoalBoard(size: SlidingSize): number[] {
  const total = size * size;
  const board: number[] = [];
  for (let i = 1; i < total; i += 1) {
    board.push(i);
  }
  board.push(0); // 0 is empty
  return board;
}

export function isSolvable(board: number[], size: SlidingSize): boolean {
  let inversions = 0;
  const total = size * size;

  for (let i = 0; i < total - 1; i += 1) {
    for (let j = i + 1; j < total; j += 1) {
      if (board[i] !== 0 && board[j] !== 0 && board[i] > board[j]) {
        inversions += 1;
      }
    }
  }

  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }

  // For even size, find row of blank from bottom (1-indexed)
  const blankIndex = board.indexOf(0);
  const blankRowFromBottom = size - Math.floor(blankIndex / size);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

export function shuffleBoard(size: SlidingSize, movesCount = 40): number[] {
  const board = getGoalBoard(size);
  let emptyPos = board.indexOf(0);

  // Perform random valid moves starting from goal to guarantee solvability
  let lastPos = -1;
  for (let step = 0; step < movesCount; step += 1) {
    const neighbors: number[] = [];
    const r = Math.floor(emptyPos / size);
    const c = emptyPos % size;

    if (r > 0) neighbors.push((r - 1) * size + c);
    if (r < size - 1) neighbors.push((r + 1) * size + c);
    if (c > 0) neighbors.push(r * size + (c - 1));
    if (c < size - 1) neighbors.push(r * size + (c + 1));

    const validNeighbors = neighbors.filter((pos) => pos !== lastPos);
    const chosen =
      validNeighbors.length > 0
        ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
        : neighbors[0];

    board[emptyPos] = board[chosen];
    board[chosen] = 0;
    lastPos = emptyPos;
    emptyPos = chosen;
  }

  // Ensure not accidentally already solved
  if (isSolved(board, size)) {
    return shuffleBoard(size, movesCount + 5);
  }

  return board;
}

export function isSolved(board: number[], size: SlidingSize): boolean {
  const goal = getGoalBoard(size);
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== goal[i]) return false;
  }
  return true;
}

export function getMovableIndices(board: number[], size: SlidingSize): number[] {
  const emptyPos = board.indexOf(0);
  const r = Math.floor(emptyPos / size);
  const c = emptyPos % size;
  const result: number[] = [];

  if (r > 0) result.push((r - 1) * size + c);
  if (r < size - 1) result.push((r + 1) * size + c);
  if (c > 0) result.push(r * size + (c - 1));
  if (c < size - 1) result.push(r * size + (c + 1));

  return result;
}

export function moveTile(board: number[], tileIdx: number, size: SlidingSize): number[] | null {
  const emptyPos = board.indexOf(0);
  const movable = getMovableIndices(board, size);
  if (!movable.includes(tileIdx)) return null;

  const next = [...board];
  next[emptyPos] = next[tileIdx];
  next[tileIdx] = 0;
  return next;
}

// Manhattan distance heuristic
function manhattan(board: number[], size: SlidingSize): number {
  let dist = 0;
  for (let i = 0; i < board.length; i += 1) {
    const val = board[i];
    if (val === 0) continue;
    const targetIdx = val - 1;
    const curR = Math.floor(i / size);
    const curC = i % size;
    const targetR = Math.floor(targetIdx / size);
    const targetC = targetIdx % size;
    dist += Math.abs(curR - targetR) + Math.abs(curC - targetC);
  }
  return dist;
}

// Fast A* solver for 3x3 and bounded IDA* / greedy search for 4x4
export function solveSlidingPuzzle(
  initialBoard: number[],
  size: SlidingSize
): { solved: boolean; steps: number[][] } {
  if (isSolved(initialBoard, size)) {
    return { solved: true, steps: [initialBoard] };
  }

  if (!isSolvable(initialBoard, size)) {
    return { solved: false, steps: [] };
  }

  // A* implementation
  const goalStr = getGoalBoard(size).join(',');
  const startStr = initialBoard.join(',');

  interface Node {
    board: number[];
    g: number;
    h: number;
    f: number;
    parent?: Node;
  }

  const openList: Node[] = [
    {
      board: initialBoard,
      g: 0,
      h: manhattan(initialBoard, size),
      f: manhattan(initialBoard, size),
    },
  ];

  const visited = new Map<string, number>();
  visited.set(startStr, 0);

  let iterations = 0;
  const maxIterations = size === 3 ? 30000 : 8000;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations += 1;

    // Find node with lowest f
    let minIdx = 0;
    for (let i = 1; i < openList.length; i += 1) {
      if (
        openList[i].f < openList[minIdx].f ||
        (openList[i].f === openList[minIdx].f && openList[i].h < openList[minIdx].h)
      ) {
        minIdx = i;
      }
    }

    const current = openList.splice(minIdx, 1)[0];
    const curStr = current.board.join(',');

    if (curStr === goalStr) {
      // Reconstruct path
      const path: number[][] = [];
      let curr: Node | undefined = current;
      while (curr) {
        path.unshift(curr.board);
        curr = curr.parent;
      }
      return { solved: true, steps: path };
    }

    const movable = getMovableIndices(current.board, size);
    for (const tileIdx of movable) {
      const nextBoard = moveTile(current.board, tileIdx, size);
      if (!nextBoard) continue;

      const nextStr = nextBoard.join(',');
      const nextG = current.g + 1;

      const existingG = visited.get(nextStr);
      if (existingG !== undefined && existingG <= nextG) {
        continue;
      }

      visited.set(nextStr, nextG);
      const h = manhattan(nextBoard, size);
      openList.push({
        board: nextBoard,
        g: nextG,
        h,
        f: nextG + h,
        parent: current,
      });
    }
  }

  return { solved: false, steps: [] };
}

export function getSlidingStepDescription(
  prevBoard: number[],
  nextBoard: number[],
  size: SlidingSize
): string {
  const emptyPrev = prevBoard.indexOf(0);
  const movedTileValue = nextBoard[emptyPrev];
  const movedTilePrevIdx = prevBoard.indexOf(movedTileValue);

  const prevR = Math.floor(movedTilePrevIdx / size);
  const prevC = movedTilePrevIdx % size;
  const emptyR = Math.floor(emptyPrev / size);
  const emptyC = emptyPrev % size;

  let dir = '이동';
  if (emptyR < prevR) dir = '위로';
  else if (emptyR > prevR) dir = '아래로';
  else if (emptyC < prevC) dir = '왼쪽으로';
  else if (emptyC > prevC) dir = '오른쪽으로';

  return `[${movedTileValue}]번 타일을 ${dir} 슬라이드 이동`;
}
