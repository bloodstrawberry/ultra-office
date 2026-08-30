import type { GridConfig } from './gridUtils';
import type { Step, GridCell } from '../types';

import { createDefaultGrid } from './gridUtils';

export const DFS_CODE = `function dfs(grid: Cell[][], start: Cell, target: Cell): Cell[] {
  const stack: Cell[] = [start];
  start.isVisited = true;

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === target) return reconstructPath(target);

    for (const neighbor of getUnvisitedNeighbors(current, grid)) {
      neighbor.isVisited = true;
      neighbor.previous = current;
      stack.push(neighbor);
    }
  }
  return [];
}`;

export function generateDFSSteps(config?: Partial<GridConfig>): Step[] {
  const rows = config?.rows || 15;
  const cols = config?.cols || 25;
  const startPos = config?.start || [Math.floor(rows / 2), 3];
  const targetPos = config?.target || [Math.floor(rows / 2), cols - 4];
  const walls = config?.walls || new Set<string>();

  const grid: GridCell[][] = createDefaultGrid(rows, cols, startPos, targetPos, walls);
  const steps: Step[] = [];
  let stepCount = 0;

  const stack: [number, number][] = [startPos];
  const visited = new Set<string>([`${startPos[0]},${startPos[1]}`]);
  const visitedOrder: [number, number][] = [startPos];
  const parentMap = new Map<string, [number, number]>();

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `깊이 우선 탐색 (DFS) 시작. 스택(Stack)을 이용해 막다른 길에 다다를 때까지 한 방향으로 깊게 파고듭니다.`,
    variables: { start: `(${startPos[0]}, ${startPos[1]})`, stackSize: 1 },
    grid: JSON.parse(JSON.stringify(grid)),
    visitedCellCoords: [startPos],
    pathCellCoords: [],
    soundType: 'step',
  });

  let reachedTarget = false;

  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;

    if (grid[cr][cc].type !== 'start' && grid[cr][cc].type !== 'target') {
      grid[cr][cc].type = 'visited';
    }

    if (cr === targetPos[0] && cc === targetPos[1]) {
      reachedTarget = true;
      steps.push({
        stepIndex: stepCount++,
        line: 7,
        description: `도착점(E)에 도달했습니다! (DFS는 최단 경로를 보장하지는 않지만 탐색 속도가 빠를 수 있습니다)`,
        variables: { currentCell: `(${cr}, ${cc})`, totalVisited: visitedOrder.length },
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

      visited.add(`${nr},${nc}`);
      visitedOrder.push([nr, nc]);
      parentMap.set(`${nr},${nc}`, [cr, cc]);
      stack.push([nr, nc]);
      activeNeighbors.push([nr, nc]);
    }

    if (stepCount % 2 === 0 || stack.length < 3) {
      steps.push({
        stepIndex: stepCount++,
        line: 9,
        description: `좌표 (${cr}, ${cc}) 방문. 스택 깊이: ${stack.length}, 탐색 진행 중.`,
        variables: {
          current: `(${cr}, ${cc})`,
          stackSize: stack.length,
          visitedTotal: visitedOrder.length,
        },
        grid: JSON.parse(JSON.stringify(grid)),
        visitedCellCoords: [...visitedOrder],
        currentCellCoord: [cr, cc],
        activeNeighbors,
        pathCellCoords: [],
        soundType: 'visit',
        soundValue: visitedOrder.length,
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
      line: 7,
      description: `DFS 경로 추적 완료! 총 탐색 경로 길이: ${path.length - 1} 칸 (탐색한 노드 수: ${visitedOrder.length})`,
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
      line: 14,
      description: `도착점(E)으로 가는 경로가 존재하지 않습니다.`,
      variables: { result: '도달 불가' },
      grid: JSON.parse(JSON.stringify(grid)),
      visitedCellCoords: [...visitedOrder],
      soundType: 'step',
    });
  }

  return steps;
}
