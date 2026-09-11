export type SlidingSize = number;

export interface SlidingMove {
  tileIndex: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  tileValue: number;
}

export function getGoalBoard(rows: number, cols = rows): number[] {
  const total = rows * cols;
  const board: number[] = [];
  for (let i = 1; i < total; i += 1) {
    board.push(i);
  }
  board.push(0); // 0 is empty
  return board;
}

function countInversions(arr: number[]): number {
  const n = arr.length;
  if (n <= 1) return 0;

  const temp = new Int32Array(n);
  const a = new Int32Array(arr);
  let count = 0;

  function mergeSort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(left, mid);
    mergeSort(mid + 1, right);

    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      if (a[i] <= a[j]) {
        temp[k++] = a[i++];
      } else {
        temp[k++] = a[j++];
        count += mid - i + 1;
      }
    }

    while (i <= mid) temp[k++] = a[i++];
    while (j <= right) temp[k++] = a[j++];

    for (let idx = left; idx <= right; idx += 1) {
      a[idx] = temp[idx];
    }
  }

  mergeSort(0, n - 1);
  return count;
}

export function isSolvable(board: number[], rows: number, cols = rows): boolean {
  const nonZeros: number[] = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== 0) {
      nonZeros.push(board[i]);
    }
  }

  const inversions = countInversions(nonZeros);

  // If cols is odd, the number of inversions must be even.
  if (cols % 2 === 1) {
    return inversions % 2 === 0;
  }

  // If cols is even, blank row from bottom (1-indexed) + inversions must be odd.
  const blankIndex = board.indexOf(0);
  if (blankIndex === -1) return false;
  const blankRowFromBottom = rows - Math.floor(blankIndex / cols);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

export function shuffleBoard(rows: number, cols = rows): number[] {
  const total = rows * cols;
  const board: number[] = [];
  for (let i = 1; i < total; i += 1) {
    board.push(i);
  }
  board.push(0);

  // Fisher-Yates full uniform shuffle across the entire board
  for (let i = board.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = board[i];
    board[i] = board[j];
    board[j] = temp;
  }

  // Ensure mathematical solvability by flipping parity if unsolvable
  if (!isSolvable(board, rows, cols)) {
    // Find the first two non-zero tiles and swap them to flip inversion parity
    let idx1 = -1;
    let idx2 = -1;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i] !== 0) {
        if (idx1 === -1) {
          idx1 = i;
        } else {
          idx2 = i;
          break;
        }
      }
    }
    if (idx1 !== -1 && idx2 !== -1) {
      const temp = board[idx1];
      board[idx1] = board[idx2];
      board[idx2] = temp;
    }
  }

  // Ensure it's not accidentally already solved
  if (isSolved(board, rows, cols)) {
    return shuffleBoard(rows, cols);
  }

  return board;
}

export function isSolved(board: number[], rows: number, cols = rows): boolean {
  const goal = getGoalBoard(rows, cols);
  if (board.length !== goal.length) return false;
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== goal[i]) return false;
  }
  return true;
}

export function getMovableIndices(board: number[], rows: number, cols = rows): number[] {
  const emptyPos = board.indexOf(0);
  if (emptyPos === -1) return [];
  const r = Math.floor(emptyPos / cols);
  const c = emptyPos % cols;
  const result: number[] = [];

  if (r > 0) result.push((r - 1) * cols + c);
  if (r < rows - 1) result.push((r + 1) * cols + c);
  if (c > 0) result.push(r * cols + (c - 1));
  if (c < cols - 1) result.push(r * cols + (c + 1));

  return result;
}

export function moveTile(
  board: number[],
  tileIdx: number,
  rows: number,
  cols = rows
): number[] | null {
  const movable = getMovableIndices(board, rows, cols);
  if (!movable.includes(tileIdx)) return null;

  const emptyPos = board.indexOf(0);
  const next = [...board];
  next[emptyPos] = next[tileIdx];
  next[tileIdx] = 0;
  return next;
}

// Manhattan distance heuristic
function manhattan(board: number[], rows: number, cols: number): number {
  let dist = 0;
  for (let i = 0; i < board.length; i += 1) {
    const val = board[i];
    if (val === 0) continue;
    const targetIdx = val - 1;
    const curR = Math.floor(i / cols);
    const curC = i % cols;
    const targetR = Math.floor(targetIdx / cols);
    const targetC = targetIdx % cols;
    dist += Math.abs(curR - targetR) + Math.abs(curC - targetC);
  }
  return dist;
}

// Linear Conflict Heuristic (Hansson, Mayer, Boyd 1992):
// Identifies pairs of tiles in the same row/col that are inverted relative to their goal positions,
// requiring at least 2 extra moves each to bypass one another.
export function computeLinearConflict(board: number[], rows: number, cols: number): number {
  let conflict = 0;

  // 1. Row Linear Conflicts
  for (let r = 0; r < rows; r += 1) {
    const rowTiles: { val: number; c: number; targetC: number }[] = [];
    for (let c = 0; c < cols; c += 1) {
      const val = board[r * cols + c];
      if (val === 0) continue;
      const targetR = Math.floor((val - 1) / cols);
      const targetC = (val - 1) % cols;
      if (targetR === r) {
        rowTiles.push({ val, c, targetC });
      }
    }

    for (let i = 0; i < rowTiles.length; i += 1) {
      for (let j = i + 1; j < rowTiles.length; j += 1) {
        if (rowTiles[i].c < rowTiles[j].c && rowTiles[i].targetC > rowTiles[j].targetC) {
          conflict += 2;
        }
      }
    }
  }

  // 2. Column Linear Conflicts
  for (let c = 0; c < cols; c += 1) {
    const colTiles: { val: number; r: number; targetR: number }[] = [];
    for (let r = 0; r < rows; r += 1) {
      const val = board[r * cols + c];
      if (val === 0) continue;
      const targetR = Math.floor((val - 1) / cols);
      const targetC = (val - 1) % cols;
      if (targetC === c) {
        colTiles.push({ val, r, targetR });
      }
    }

    for (let i = 0; i < colTiles.length; i += 1) {
      for (let j = i + 1; j < colTiles.length; j += 1) {
        if (colTiles[i].r < colTiles[j].r && colTiles[i].targetR > colTiles[j].targetR) {
          conflict += 2;
        }
      }
    }
  }

  return conflict;
}

// Combined Manhattan + Linear Conflict admissible heuristic
export function getPuzzleHeuristic(board: number[], rows: number, cols: number): number {
  return manhattan(board, rows, cols) + computeLinearConflict(board, rows, cols);
}

// Fast optimal A* solver for small (<= 3x3) sliding puzzles
function solveAStar(
  initialBoard: number[],
  rows: number,
  cols: number
): { solved: boolean; steps: number[][] } {
  const goalStr = getGoalBoard(rows, cols).join(',');
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
      h: getPuzzleHeuristic(initialBoard, rows, cols),
      f: getPuzzleHeuristic(initialBoard, rows, cols),
    },
  ];

  const visited = new Map<string, number>();
  visited.set(startStr, 0);

  let iterations = 0;
  const maxIterations = 35000;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations += 1;

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
      const path: number[][] = [];
      let curr: Node | undefined = current;
      while (curr) {
        path.unshift(curr.board);
        curr = curr.parent;
      }
      return { solved: true, steps: path };
    }

    const movable = getMovableIndices(current.board, rows, cols);
    for (const tileIdx of movable) {
      const nextBoard = moveTile(current.board, tileIdx, rows, cols);
      if (!nextBoard) continue;

      const nextStr = nextBoard.join(',');
      const nextG = current.g + 1;

      const existingG = visited.get(nextStr);
      if (existingG !== undefined && existingG <= nextG) {
        continue;
      }

      visited.set(nextStr, nextG);
      const h = getPuzzleHeuristic(nextBoard, rows, cols);
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

// Memory-efficient IDA* (Iterative Deepening A*) Optimal Solver with Linear Conflict
function solveIdaStar(
  initialBoard: number[],
  rows: number,
  cols: number,
  maxNodes = 35000
): { solved: boolean; steps: number[][] } | null {
  const goal = getGoalBoard(rows, cols);
  const goalStr = goal.join(',');
  if (initialBoard.join(',') === goalStr) {
    return { solved: true, steps: [initialBoard] };
  }

  let nodesVisited = 0;
  let threshold = getPuzzleHeuristic(initialBoard, rows, cols);
  const path: number[][] = [initialBoard];
  const zeroHistory: number[] = [initialBoard.indexOf(0)];

  function search(g: number, bound: number, prevMoveTileIdx: number): number | 'FOUND' | 'LIMIT' {
    const currentBoard = path[path.length - 1];
    const h = getPuzzleHeuristic(currentBoard, rows, cols);
    const f = g + h;

    if (f > bound) return f;
    if (h === 0 && currentBoard.join(',') === goalStr) return 'FOUND';

    nodesVisited += 1;
    if (nodesVisited > maxNodes) return 'LIMIT';

    let minNextBound = Infinity;
    const curZero = zeroHistory[zeroHistory.length - 1];
    const movable = getMovableIndices(currentBoard, rows, cols);

    // Order candidates by heuristic for fast exploration
    const candidates: { tileIdx: number; nextBoard: number[]; nextH: number }[] = [];
    for (const tileIdx of movable) {
      if (tileIdx === prevMoveTileIdx) continue; // Prune immediate undo
      const nextBoard = [...currentBoard];
      nextBoard[curZero] = nextBoard[tileIdx];
      nextBoard[tileIdx] = 0;
      const nextH = getPuzzleHeuristic(nextBoard, rows, cols);
      candidates.push({ tileIdx, nextBoard, nextH });
    }

    candidates.sort((a, b) => a.nextH - b.nextH);

    for (const cand of candidates) {
      path.push(cand.nextBoard);
      zeroHistory.push(cand.tileIdx);

      const res = search(g + 1, bound, curZero);
      if (res === 'FOUND') return 'FOUND';
      if (res === 'LIMIT') return 'LIMIT';
      if (typeof res === 'number' && res < minNextBound) {
        minNextBound = res;
      }

      path.pop();
      zeroHistory.pop();
    }

    return minNextBound;
  }

  while (nodesVisited <= maxNodes) {
    const t = search(0, threshold, -1);
    if (t === 'FOUND') {
      return { solved: true, steps: [...path] };
    }
    if (t === 'LIMIT' || t === Infinity) {
      return null;
    }
    threshold = t as number;
  }

  return null;
}

// Subgoal Layer-by-layer Reduction solver for NxM (4x4, 5x5 up to 10x10) sliding puzzles
function solveLayerReduction(
  initialBoard: number[],
  rows: number,
  cols: number
): { solved: boolean; steps: number[][] } {
  const total = rows * cols;
  const currentBoard = [...initialBoard];
  const steps: number[][] = [[...currentBoard]];
  const locked = new Uint8Array(total);

  const getNeighbors = (pos: number): number[] => {
    const r = Math.floor(pos / cols);
    const c = pos % cols;
    const res: number[] = [];
    if (r > 0) res.push((r - 1) * cols + c);
    if (r < rows - 1) res.push((r + 1) * cols + c);
    if (c > 0) res.push(r * cols + (c - 1));
    if (c < cols - 1) res.push(r * cols + (c + 1));
    return res;
  };

  const applySlide = (fromZero: number, toZero: number) => {
    currentBoard[fromZero] = currentBoard[toZero];
    currentBoard[toZero] = 0;
    steps.push([...currentBoard]);
  };

  // Move single tile to destPos using BFS on (tilePos, zeroPos)
  const moveTileTo = (val: number, destPos: number): boolean => {
    const tilePos = currentBoard.indexOf(val);
    const zeroPos = currentBoard.indexOf(0);
    if (tilePos === destPos) return true;

    const startKey = tilePos * 1000 + zeroPos;
    const queue: number[] = [startKey];
    const parentKey = new Map<number, number>();
    parentKey.set(startKey, -1);

    let head = 0;
    let endKey = -1;

    while (head < queue.length) {
      const currKey = queue[head];
      head += 1;
      const curT = Math.floor(currKey / 1000);
      const curZ = currKey % 1000;

      if (curT === destPos) {
        endKey = currKey;
        break;
      }

      for (const nextZ of getNeighbors(curZ)) {
        if (locked[nextZ]) continue;

        let nextT = curT;
        if (nextZ === curT) {
          nextT = curZ;
        }

        const nextKey = nextT * 1000 + nextZ;
        if (!parentKey.has(nextKey)) {
          parentKey.set(nextKey, currKey);
          queue.push(nextKey);
        }
      }
    }

    if (endKey === -1) return false;

    const keyPath: number[] = [];
    let k = endKey;
    while (k !== -1) {
      keyPath.push(k);
      k = parentKey.get(k) ?? -1;
    }
    keyPath.reverse();

    for (let i = 0; i < keyPath.length - 1; i += 1) {
      const curZ = keyPath[i] % 1000;
      const nextZ = keyPath[i + 1] % 1000;
      applySlide(curZ, nextZ);
    }
    return true;
  };

  // Move pair of tiles (val1, val2) simultaneously to (target1, target2) with zero at targetZero
  const movePairTo = (
    val1: number,
    val2: number,
    target1: number,
    target2: number,
    targetZero: number
  ): boolean => {
    const p1 = currentBoard.indexOf(val1);
    const p2 = currentBoard.indexOf(val2);
    const pZ = currentBoard.indexOf(0);

    if (p1 === target1 && p2 === target2 && pZ === targetZero) return true;

    const startKey = p1 * 10000 + p2 * 100 + pZ;
    const goalKey = target1 * 10000 + target2 * 100 + targetZero;

    const queue: number[] = [startKey];
    const parentKey = new Map<number, number>();
    parentKey.set(startKey, -1);

    let head = 0;
    let found = false;

    while (head < queue.length) {
      const currKey = queue[head];
      head += 1;
      if (currKey === goalKey) {
        found = true;
        break;
      }

      const cur1 = Math.floor(currKey / 10000);
      const cur2 = Math.floor((currKey % 10000) / 100);
      const curZ = currKey % 100;

      for (const nxtZ of getNeighbors(curZ)) {
        if (locked[nxtZ]) continue;

        let nxt1 = cur1;
        let nxt2 = cur2;
        if (nxtZ === cur1) {
          nxt1 = curZ;
        } else if (nxtZ === cur2) {
          nxt2 = curZ;
        }

        const nextKey = nxt1 * 10000 + nxt2 * 100 + nxtZ;
        if (!parentKey.has(nextKey)) {
          parentKey.set(nextKey, currKey);
          queue.push(nextKey);
        }
      }
    }

    if (!found) return false;

    const keyPath: number[] = [];
    let k = goalKey;
    while (k !== -1) {
      keyPath.push(k);
      k = parentKey.get(k) ?? -1;
    }
    keyPath.reverse();

    for (let i = 0; i < keyPath.length - 1; i += 1) {
      const curZ = keyPath[i] % 100;
      const nextZ = keyPath[i + 1] % 100;
      applySlide(curZ, nextZ);
    }
    return true;
  };

  // 1. Layer reduction: Reduce rows and cols until a 3x3 subgrid remains
  let topR = 0;
  let leftC = 0;

  while (rows - topR > 3 || cols - leftC > 3) {
    if (rows - topR >= cols - leftC) {
      const r = topR;
      // Solve row r up to cols - 3
      for (let c = leftC; c <= cols - 3; c += 1) {
        const val = r * cols + c + 1;
        const targetPos = r * cols + c;
        if (!moveTileTo(val, targetPos)) return { solved: false, steps: [] };
        locked[targetPos] = 1;
      }

      // Last 2 tiles of row r
      const val1 = r * cols + (cols - 2) + 1;
      const val2 = r * cols + (cols - 1) + 1;
      const pos1 = r * cols + (cols - 2);
      const pos2 = r * cols + (cols - 1);
      const corner2 = (r + 1) * cols + (cols - 1);

      if (currentBoard[pos1] === val1 && currentBoard[pos2] === val2) {
        locked[pos1] = 1;
        locked[pos2] = 1;
      } else {
        if (!movePairTo(val1, val2, pos2, corner2, pos1)) {
          return { solved: false, steps: [] };
        }
        applySlide(pos1, pos2);
        applySlide(pos2, corner2);
        locked[pos1] = 1;
        locked[pos2] = 1;
      }

      topR += 1;
    } else {
      const c = leftC;
      // Solve col c up to rows - 3
      for (let r = topR; r <= rows - 3; r += 1) {
        const val = r * cols + c + 1;
        const targetPos = r * cols + c;
        if (!moveTileTo(val, targetPos)) return { solved: false, steps: [] };
        locked[targetPos] = 1;
      }

      // Last 2 tiles of col c
      const val1 = (rows - 2) * cols + c + 1;
      const val2 = (rows - 1) * cols + c + 1;
      const pos1 = (rows - 2) * cols + c;
      const pos2 = (rows - 1) * cols + c;
      const corner2 = (rows - 1) * cols + (c + 1);

      if (currentBoard[pos1] === val1 && currentBoard[pos2] === val2) {
        locked[pos1] = 1;
        locked[pos2] = 1;
      } else {
        if (!movePairTo(val1, val2, pos2, corner2, pos1)) {
          return { solved: false, steps: [] };
        }
        applySlide(pos1, pos2);
        applySlide(pos2, corner2);
        locked[pos1] = 1;
        locked[pos2] = 1;
      }

      leftC += 1;
    }
  }

  // 2. Solve remaining 3x3 subgrid at (topR..topR+2, leftC..leftC+2)
  const subPositions: number[] = [];
  for (let dr = 0; dr < 3; dr += 1) {
    for (let dc = 0; dc < 3; dc += 1) {
      subPositions.push((topR + dr) * cols + (leftC + dc));
    }
  }

  const goal = getGoalBoard(rows, cols);
  const targetMap = new Map<number, number>();
  for (let i = 0; i < 9; i += 1) {
    const gVal = goal[subPositions[i]];
    targetMap.set(gVal, i);
  }

  const localBoard = subPositions.map((p) => targetMap.get(currentBoard[p]) ?? 0);

  // Local 3x3 A* solver
  const solve3x3 = (localInit: number[]): number[] | null => {
    const goalStr = '0,1,2,3,4,5,6,7,8';
    if (localInit.join(',') === goalStr) return [];

    const manhattan3x3 = (b: number[]): number => {
      let d = 0;
      for (let i = 0; i < 9; i += 1) {
        const v = b[i];
        if (v === 8) continue; // 8 is the empty space in local goal (position 8)
        const tr = Math.floor(v / 3);
        const tc = v % 3;
        const cr = Math.floor(i / 3);
        const cc = i % 3;
        d += Math.abs(tr - cr) + Math.abs(tc - cc);
      }
      return d;
    };

    const getLocalNeighbors = (idx: number): number[] => {
      const r = Math.floor(idx / 3);
      const c = idx % 3;
      const res: number[] = [];
      if (r > 0) res.push((r - 1) * 3 + c);
      if (r < 2) res.push((r + 1) * 3 + c);
      if (c > 0) res.push(r * 3 + (c - 1));
      if (c < 2) res.push(r * 3 + (c + 1));
      return res;
    };

    interface LocalNode {
      b: number[];
      g: number;
      h: number;
      f: number;
      parent: LocalNode | null;
      move: number;
    }

    const open: LocalNode[] = [
      {
        b: localInit,
        g: 0,
        h: manhattan3x3(localInit),
        f: manhattan3x3(localInit),
        parent: null,
        move: -1,
      },
    ];
    const visited = new Map<string, number>();
    visited.set(localInit.join(','), 0);

    let it = 0;
    while (open.length > 0 && it < 40000) {
      it += 1;
      let bestIdx = 0;
      for (let i = 1; i < open.length; i += 1) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const cur = open.splice(bestIdx, 1)[0];

      if (cur.b.join(',') === goalStr) {
        const path: number[] = [];
        let curr: LocalNode | null = cur;
        while (curr?.parent) {
          path.push(curr.move);
          curr = curr.parent;
        }
        path.reverse();
        return path;
      }

      const zIdx = cur.b.indexOf(8);
      for (const nxt of getLocalNeighbors(zIdx)) {
        const nextB = [...cur.b];
        nextB[zIdx] = nextB[nxt];
        nextB[nxt] = 8;
        const s = nextB.join(',');
        const nextG = cur.g + 1;
        if (!visited.has(s) || (visited.get(s) ?? Infinity) > nextG) {
          visited.set(s, nextG);
          const h = manhattan3x3(nextB);
          open.push({ b: nextB, g: nextG, h, f: nextG + h, parent: cur, move: nxt });
        }
      }
    }
    return null;
  };

  const localMoves = solve3x3(localBoard);
  if (!localMoves) {
    return { solved: false, steps: [] };
  }

  for (const nextLocalZero of localMoves) {
    const curGlobalZero = currentBoard.indexOf(0);
    const nxtGlobalZero = subPositions[nextLocalZero];
    applySlide(curGlobalZero, nxtGlobalZero);
  }

  const isComplete = currentBoard.every((val, idx) => val === goal[idx]);
  return { solved: isComplete, steps };
}

export interface SlidingAlgorithmInfo {
  mode: 'optimal-a-star' | 'optimal-ida-star' | 'constructive-reduction';
  title: string;
  badge: string;
  description: string;
}

export function getSlidingAlgorithmInfo(rows: number, cols: number): SlidingAlgorithmInfo {
  if (rows <= 3 && cols <= 3) {
    return {
      mode: 'optimal-a-star',
      title: 'A* 최적 최단 경로 알고리즘',
      badge: `${rows}x${cols} 최적 A*`,
      description: '선형 충돌(Linear Conflict) 휴리스틱 기반 100% 최단 이동 경로를 산출합니다.',
    };
  }
  if (rows <= 5 && cols <= 5) {
    return {
      mode: 'optimal-ida-star',
      title: 'Linear Conflict IDA* / 최적화 알고리즘',
      badge: `${rows}x${cols} 최적화 IDA*`,
      description:
        '선형 충돌 휴리스틱 반복 심화 탐색(IDA*)과 계층 축소를 결합하여 고효율로 해결합니다.',
    };
  }
  return {
    mode: 'constructive-reduction',
    title: 'Constructive Row-by-Row 고정 축소 알고리즘',
    badge: `${rows}x${cols} Constructive`,
    description:
      '상단 행부터 타일을 차례로 제자리에 고정(Lock)하여 5x5 영역으로 축소한 뒤 최적으로 완성합니다.',
  };
}

// Hybrid Solver for Sliding Puzzle:
// - <= 3x3: Optimal A* with Linear Conflict
// - 4x4 & 5x5: Optimal IDA* with Linear Conflict (with graceful reduction fallback)
// - > 5x5 (up to 10x10): Constructive row-by-row reduction down to 5x5, then completed
export function solveSlidingPuzzle(
  initialBoard: number[],
  rows: number,
  cols = rows
): { solved: boolean; steps: number[][] } {
  if (isSolved(initialBoard, rows, cols)) {
    return { solved: true, steps: [initialBoard] };
  }

  if (!isSolvable(initialBoard, rows, cols)) {
    return { solved: false, steps: [] };
  }

  // 1. For small boards (<= 3x3), use pure optimal A*
  if (rows <= 3 && cols <= 3) {
    return solveAStar(initialBoard, rows, cols);
  }

  // 2. For 4x4, try IDA* with Linear Conflict first for optimal paths
  if (rows === 4 && cols === 4) {
    const idaRes = solveIdaStar(initialBoard, 4, 4, 32000);
    if (idaRes?.solved) {
      return idaRes;
    }
    return solveLayerReduction(initialBoard, 4, 4);
  }

  // 3. For 5x5, try IDA* with Linear Conflict for shallow/medium states first
  if (rows === 5 && cols === 5) {
    const idaRes = solveIdaStar(initialBoard, 5, 5, 12000);
    if (idaRes?.solved) {
      return idaRes;
    }
    return solveLayerReduction(initialBoard, 5, 5);
  }

  // 4. For boards with rows > 5 or cols > 5 (up to 10x10):
  // Constructive algorithm: locks top rows one by one, reducing to 5x5, then solves to completion
  return solveLayerReduction(initialBoard, rows, cols);
}

export function getSlidingStepDescription(
  prevBoard: number[],
  nextBoard: number[],
  cols: number,
  rows = cols
): string {
  const emptyPrev = prevBoard.indexOf(0);
  const movedTileValue = nextBoard[emptyPrev];
  const movedTilePrevIdx = prevBoard.indexOf(movedTileValue);

  const prevR = Math.floor(movedTilePrevIdx / cols);
  const prevC = movedTilePrevIdx % cols;
  const emptyR = Math.floor(emptyPrev / cols);
  const emptyC = emptyPrev % cols;

  let dir = '이동';
  if (emptyR < prevR) dir = '위로';
  else if (emptyR > prevR) dir = '아래로';
  else if (emptyC < prevC) dir = '왼쪽으로';
  else if (emptyC > prevC) dir = '오른쪽으로';

  return `[${movedTileValue}]번 타일을 ${dir} 슬라이드 이동`;
}

/**
 * Calculates adaptive tile size (in px) based on the maximum dimension of the puzzle.
 * Allows the puzzle board to gracefully scale up as tile count increases,
 * keeping each tile comfortably large, distinct, and clickable.
 */
export function getAdaptiveTileSize(maxDim: number): number {
  if (maxDim <= 3) return 126;
  if (maxDim <= 4) return 115;
  if (maxDim <= 5) return 106;
  if (maxDim <= 6) return 100;
  if (maxDim <= 8) return 88;
  if (maxDim <= 10) return 80;
  if (maxDim <= 15) return 65;
  if (maxDim <= 20) return 56;
  if (maxDim <= 30) return 46;
  if (maxDim <= 50) return 36;
  // For 51 to 99: smoothly decrease from 36 down to 24px
  return Math.max(24, Math.round(36 - ((maxDim - 50) / 49) * 12));
}
