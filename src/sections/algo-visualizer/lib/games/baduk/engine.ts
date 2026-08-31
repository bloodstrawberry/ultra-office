import type { Point, BoardGrid, StoneColor, StoneGroup, BadukMoveResult } from './types';

export function createEmptyBoard(size: number = 19): BoardGrid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => [...row]);
}

export function isSamePoint(p1: Point | null | undefined, p2: Point | null | undefined): boolean {
  if (!p1 || !p2) return false;
  return p1.r === p2.r && p1.c === p2.c;
}

export function getNeighbors(p: Point, size: number): Point[] {
  const deltas = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];
  const neighbors: Point[] = [];
  for (const d of deltas) {
    const nr = p.r + d.r;
    const nc = p.c + d.c;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
}

/** Flood-fill BFS to discover all groups of connected stones */
export function findGroups(board: BoardGrid): StoneGroup[] {
  const size = board.length;
  const visited: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const groups: StoneGroup[] = [];
  let groupId = 1;

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const color = board[r][c];
      if (color !== null && !visited[r][c]) {
        // BFS for connected stones of same color
        const stones: Point[] = [];
        const libertySet = new Set<string>();
        const queue: Point[] = [{ r, c }];
        visited[r][c] = true;

        while (queue.length > 0) {
          const curr = queue.shift()!;
          stones.push(curr);

          const neighbors = getNeighbors(curr, size);
          for (const nb of neighbors) {
            const nbColor = board[nb.r][nb.c];
            if (nbColor === null) {
              libertySet.add(`${nb.r},${nb.c}`);
            } else if (nbColor === color && !visited[nb.r][nb.c]) {
              visited[nb.r][nb.c] = true;
              queue.push(nb);
            }
          }
        }

        const liberties: Point[] = Array.from(libertySet).map((key) => {
          const [lr, lc] = key.split(',').map(Number);
          return { r: lr, c: lc };
        });

        groups.push({
          id: groupId,
          color,
          stones,
          liberties,
          libertyCount: liberties.length,
        });
        groupId += 1;
      }
    }
  }

  return groups;
}

/** Get the single group occupying the given point */
export function getGroupAt(board: BoardGrid, p: Point): StoneGroup | null {
  const color = board[p.r]?.[p.c];
  if (!color) return null;

  const groups = findGroups(board);
  return groups.find((g) => g.stones.some((st) => st.r === p.r && st.c === p.c)) || null;
}

/** Execute a Go move adhering to suicide, Ko, and capture rules */
export function playMove(
  board: BoardGrid,
  point: Point,
  color: StoneColor,
  koPoint: Point | null = null
): BadukMoveResult {
  const size = board.length;
  if (point.r < 0 || point.r >= size || point.c < 0 || point.c >= size) {
    return { valid: false, error: 'OUT_OF_BOUNDS', captures: [], newBoard: board };
  }

  if (board[point.r][point.c] !== null) {
    return { valid: false, error: 'OCCUPIED', captures: [], newBoard: board };
  }

  // Ko rule check
  if (koPoint && isSamePoint(point, koPoint)) {
    return { valid: false, error: 'KO', captures: [], newBoard: board };
  }

  const opponentColor: StoneColor = color === 'B' ? 'W' : 'B';
  const newBoard = cloneBoard(board);
  newBoard[point.r][point.c] = color;

  // 1. Check if placing this stone captures any opponent neighbor groups
  const captures: Point[] = [];
  const neighborPoints = getNeighbors(point, size);
  const oppGroups = findGroups(newBoard).filter((g) => g.color === opponentColor);

  for (const group of oppGroups) {
    // If this opponent group has 0 liberties after our move, it is captured
    if (group.libertyCount === 0) {
      for (const st of group.stones) {
        captures.push(st);
        newBoard[st.r][st.c] = null;
      }
    }
  }

  // 2. If no opponent captures were made, check if this move is suicide (0 liberties for own group)
  if (captures.length === 0) {
    const myGroup = getGroupAt(newBoard, point);
    if (!myGroup || myGroup.libertyCount === 0) {
      return { valid: false, error: 'SUICIDE', captures: [], newBoard: board };
    }
  }

  // 3. Check for new Ko point (single stone captured leaving single liberty in opponent group)
  let nextKoPoint: Point | null = null;
  if (captures.length === 1) {
    const myGroup = getGroupAt(newBoard, point);
    if (myGroup && myGroup.stones.length === 1 && myGroup.libertyCount === 1) {
      nextKoPoint = captures[0];
    }
  }

  return {
    valid: true,
    captures,
    newBoard,
    koPoint: nextKoPoint,
  };
}

/** Calculate radiate influence map (-1.0 to 1.0) */
export function calculateInfluence(board: BoardGrid): number[][] {
  const size = board.length;
  const influence: number[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );

  const decay = 0.55;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const stone = board[r][c];
      if (stone !== null) {
        const val = stone === 'B' ? 1.0 : -1.0;
        for (let dr = -4; dr <= 4; dr += 1) {
          for (let dc = -4; dc <= 4; dc += 1) {
            const tr = r + dr;
            const tc = c + dc;
            if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
              const dist = Math.abs(dr) + Math.abs(dc);
              if (dist === 0) {
                influence[tr][tc] += val * 1.5;
              } else if (dist <= 4) {
                influence[tr][tc] += val * Math.pow(decay, dist);
              }
            }
          }
        }
      }
    }
  }

  // Normalize between -1 and 1
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      influence[r][c] = Math.max(-1, Math.min(1, influence[r][c]));
    }
  }

  return influence;
}

/** Convert coordinate to Baduk column-row notation (e.g. A1, Q16) */
export function formatBadukCoord(p: Point, size: number): string {
  const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // 'I' is skipped in standard Go notation
  const colLetter = letters[p.c] || `C${p.c + 1}`;
  const rowNumber = size - p.r;
  return `${colLetter}${rowNumber}`;
}
