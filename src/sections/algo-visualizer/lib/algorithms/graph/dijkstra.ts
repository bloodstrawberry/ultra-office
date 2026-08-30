import type { GridConfig } from './gridUtils';
import type { Step, GridCell } from '../types';

import { createDefaultGrid } from './gridUtils';

export const DIJKSTRA_CODE = `function dijkstra(grid: Cell[][], start: Cell, target: Cell): Cell[] {
  const unvisited: Cell[] = getAllCells(grid);
  start.distance = 0;

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift()!;
    if (closest.isWall) continue;
    if (closest.distance === Infinity) break; // Trapped

    closest.isVisited = true;
    if (closest === target) return reconstructPath(target);

    updateUnvisitedNeighbors(closest, grid);
  }
  return []; // No path
}`;

export function generateDijkstraSteps(config?: Partial<GridConfig>): Step[] {
  const rows = config?.rows || 15;
  const cols = config?.cols || 25;
  const startPos = config?.start || [Math.floor(rows / 2), 3];
  const targetPos = config?.target || [Math.floor(rows / 2), cols - 4];
  const walls = config?.walls || new Set<string>();

  const grid: GridCell[][] = createDefaultGrid(rows, cols, startPos, targetPos, walls);
  const steps: Step[] = [];
  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `다익스트라(Dijkstra) 최단 경로 알고리즘 시작. 시작점 (S) 거리 = 0으로 초기화.`,
    variables: {
      start: `(${startPos[0]}, ${startPos[1]})`,
      target: `(${targetPos[0]}, ${targetPos[1]})`,
    },
    grid: JSON.parse(JSON.stringify(grid)),
    visitedCellCoords: [],
    pathCellCoords: [],
    soundType: 'step',
  });

  const distances: number[][] = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(Infinity)
  );
  const parentMap = new Map<string, [number, number]>();
  const visited = new Set<string>();
  const visitedOrder: [number, number][] = [];

  distances[startPos[0]][startPos[1]] = 0;

  const unvisitedList: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      unvisitedList.push([r, c]);
    }
  }

  let reachedTarget = false;

  while (unvisitedList.length > 0) {
    unvisitedList.sort((a, b) => distances[a[0]][a[1]] - distances[b[0]][b[1]]);

    const current = unvisitedList.shift()!;
    const [cr, cc] = current;
    const currentDist = distances[cr][cc];

    if (walls.has(`${cr},${cc}`)) continue;
    if (currentDist === Infinity) break;

    visited.add(`${cr},${cc}`);
    visitedOrder.push([cr, cc]);

    if (grid[cr][cc].type !== 'start' && grid[cr][cc].type !== 'target') {
      grid[cr][cc].type = 'visited';
    }

    if (cr === targetPos[0] && cc === targetPos[1]) {
      reachedTarget = true;
      steps.push({
        stepIndex: stepCount++,
        line: 11,
        description: `도착점(E)에 도달했습니다! 최단 거리: ${currentDist}`,
        variables: {
          currentCell: `(${cr}, ${cc})`,
          shortestDistance: currentDist,
          visitedTotal: visitedOrder.length,
        },
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

      const alt = currentDist + 1;
      if (alt < distances[nr][nc]) {
        distances[nr][nc] = alt;
        parentMap.set(`${nr},${nc}`, [cr, cc]);
        activeNeighbors.push([nr, nc]);
      }
    }

    if (stepCount % 2 === 0 || unvisitedList.length < 5) {
      steps.push({
        stepIndex: stepCount++,
        line: 13,
        description: `좌표 (${cr}, ${cc}) 방문 (거리: ${currentDist}). 인접 이웃 노드 거리 완화(Relaxation) 진행.`,
        variables: {
          current: `(${cr}, ${cc})`,
          distance: currentDist,
          visitedCount: visitedOrder.length,
        },
        grid: JSON.parse(JSON.stringify(grid)),
        visitedCellCoords: [...visitedOrder],
        currentCellCoord: [cr, cc],
        activeNeighbors,
        pathCellCoords: [],
        soundType: 'visit',
        soundValue: currentDist,
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
      line: 11,
      description: `최단 경로 역추적 완료! 총 이동 거리: ${path.length - 1} 칸 (탐색한 노드 수: ${visitedOrder.length})`,
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
      line: 16,
      description: `벽으로 가로막혀 도착점(E)에 도달할 수 없습니다.`,
      variables: { result: '도달 불가' },
      grid: JSON.parse(JSON.stringify(grid)),
      visitedCellCoords: [...visitedOrder],
      soundType: 'step',
    });
  }

  return steps;
}
