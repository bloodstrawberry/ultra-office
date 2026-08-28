import { Step, GridCell } from '../types';
import { createDefaultGrid, GridConfig } from './gridUtils';

export const ASTAR_CODE = `function aStar(grid: Cell[][], start: Cell, target: Cell): Cell[] {
  const openSet: Cell[] = [start];
  start.gCost = 0;
  start.fCost = heuristic(start, target);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fCost - b.fCost);
    const current = openSet.shift()!;

    if (current === target) return reconstructPath(target);
    current.isVisited = true;

    for (const neighbor of getNeighbors(current, grid)) {
      const tentativeG = current.gCost + 1;
      if (tentativeG < neighbor.gCost) {
        neighbor.gCost = tentativeG;
        neighbor.fCost = tentativeG + heuristic(neighbor, target);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
  return [];
}`;

export function generateAStarSteps(config?: Partial<GridConfig>): Step[] {
  const rows = config?.rows || 15;
  const cols = config?.cols || 25;
  const startPos = config?.start || [Math.floor(rows / 2), 3];
  const targetPos = config?.target || [Math.floor(rows / 2), cols - 4];
  const walls = config?.walls || new Set<string>();

  const grid: GridCell[][] = createDefaultGrid(rows, cols, startPos, targetPos, walls);
  const steps: Step[] = [];
  let stepCount = 0;

  function manhattan(r: number, c: number): number {
    return Math.abs(r - targetPos[0]) + Math.abs(c - targetPos[1]);
  }

  const gCosts: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(Infinity));
  const fCosts: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(Infinity));
  const parentMap = new Map<string, [number, number]>();
  const visited = new Set<string>();
  const visitedOrder: [number, number][] = [];

  gCosts[startPos[0]][startPos[1]] = 0;
  fCosts[startPos[0]][startPos[1]] = manhattan(startPos[0], startPos[1]);

  const openSet: [number, number][] = [[startPos[0], startPos[1]]];

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `A* (A-Star) 길찾기 시작. 시작점 f(n) = g(0) + h(${fCosts[startPos[0]][startPos[1]]})`,
    variables: {
      start: `(${startPos[0]}, ${startPos[1]})`,
      target: `(${targetPos[0]}, ${targetPos[1]})`,
    },
    grid: JSON.parse(JSON.stringify(grid)),
    visitedCellCoords: [],
    pathCellCoords: [],
    soundType: 'step',
  });

  let reachedTarget = false;

  while (openSet.length > 0) {
    openSet.sort((a, b) => fCosts[a[0]][a[1]] - fCosts[b[0]][b[1]]);

    const [cr, cc] = openSet.shift()!;

    if (visited.has(`${cr},${cc}`)) continue;
    visited.add(`${cr},${cc}`);
    visitedOrder.push([cr, cc]);

    if (grid[cr][cc].type !== 'start' && grid[cr][cc].type !== 'target') {
      grid[cr][cc].type = 'visited';
    }

    if (cr === targetPos[0] && cc === targetPos[1]) {
      reachedTarget = true;
      steps.push({
        stepIndex: stepCount++,
        line: 9,
        description: `도착점(E)에 도달했습니다! 최단 비용 f(n) = ${fCosts[cr][cc]}`,
        variables: { currentCell: `(${cr}, ${cc})`, gCost: gCosts[cr][cc], fCost: fCosts[cr][cc] },
        grid: JSON.parse(JSON.stringify(grid)),
        visitedCellCoords: [...visitedOrder],
        currentCellCoord: [cr, cc],
        pathCellCoords: [],
        soundType: 'found',
      });
      break;
    }

    const neighbors: [number, number][] = [
      [cr - 1, cc],
      [cr + 1, cc],
      [cr, cc - 1],
      [cr, cc + 1],
    ];

    const activeNeighbors: [number, number][] = [];

    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (walls.has(`${nr},${nc}`) || visited.has(`${nr},${nc}`)) continue;

      const tentativeG = gCosts[cr][cc] + 1;
      if (tentativeG < gCosts[nr][nc]) {
        gCosts[nr][nc] = tentativeG;
        const h = manhattan(nr, nc);
        fCosts[nr][nc] = tentativeG + h;
        parentMap.set(`${nr},${nc}`, [cr, cc]);
        openSet.push([nr, nc]);
        activeNeighbors.push([nr, nc]);
      }
    }

    if (stepCount % 2 === 0 || openSet.length < 5) {
      steps.push({
        stepIndex: stepCount++,
        line: 14,
        description: `노드 (${cr}, ${cc}) 방문 (g:${gCosts[cr][cc]}, h:${manhattan(cr, cc)}, f:${fCosts[cr][cc]}). 휴리스틱 기반으로 탐색 범위 집중.`,
        variables: {
          current: `(${cr}, ${cc})`,
          gCost: gCosts[cr][cc],
          hCost: manhattan(cr, cc),
          fCost: fCosts[cr][cc],
          openSetSize: openSet.length,
        },
        grid: JSON.parse(JSON.stringify(grid)),
        visitedCellCoords: [...visitedOrder],
        currentCellCoord: [cr, cc],
        activeNeighbors,
        pathCellCoords: [],
        soundType: 'visit',
        soundValue: gCosts[cr][cc],
      });
    }
  }

  if (reachedTarget) {
    const path: [number, number][] = [];
    let currentKey: string | undefined = `${targetPos[0]},${targetPos[1]}`;

    while (currentKey) {
      const parts = currentKey.split(',');
      const r = parseInt(parts[0], 10);
      const c = parseInt(parts[1], 10);
      path.unshift([r, c]);

      if (grid[r][c].type !== 'start' && grid[r][c].type !== 'target') {
        grid[r][c].type = 'path';
      }

      if (r === startPos[0] && c === startPos[1]) {
        break;
      }

      const parent = parentMap.get(currentKey);
      if (parent) {
        currentKey = `${parent[0]},${parent[1]}`;
      } else {
        currentKey = undefined;
      }
    }

    steps.push({
      stepIndex: stepCount++,
      line: 9,
      description: `A* 최단 경로 완성! 총 이동 거리: ${path.length - 1} 칸 (탐색한 노드 수: ${visitedOrder.length})`,
      variables: { pathLength: path.length - 1, totalVisited: visitedOrder.length },
      grid: JSON.parse(JSON.stringify(grid)),
      visitedCellCoords: [...visitedOrder],
      currentCellCoord: null,
      pathCellCoords: [...path],
      soundType: 'complete',
    });
  } else {
    steps.push({
      stepIndex: stepCount++,
      line: 20,
      description: `도착점(E)으로 가는 경로가 존재하지 않습니다.`,
      variables: { result: '도달 불가' },
      grid: JSON.parse(JSON.stringify(grid)),
      visitedCellCoords: [...visitedOrder],
      soundType: 'step',
    });
  }

  return steps;
}
