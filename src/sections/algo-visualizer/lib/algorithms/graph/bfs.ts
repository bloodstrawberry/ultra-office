import { Step, GridCell } from '../types';
import { createDefaultGrid, GridConfig } from './gridUtils';

export const BFS_CODE = `function bfs(grid: Cell[][], start: Cell, target: Cell): Cell[] {
  const queue: Cell[] = [start];
  start.isVisited = true;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === target) return reconstructPath(target);

    for (const neighbor of getUnvisitedNeighbors(current, grid)) {
      neighbor.isVisited = true;
      neighbor.previous = current;
      queue.push(neighbor);
    }
  }
  return [];
}`;

export function generateBFSSteps(config?: Partial<GridConfig>): Step[] {
  const rows = config?.rows || 15;
  const cols = config?.cols || 25;
  const startPos = config?.start || [Math.floor(rows / 2), 3];
  const targetPos = config?.target || [Math.floor(rows / 2), cols - 4];
  const walls = config?.walls || new Set<string>();

  const grid: GridCell[][] = createDefaultGrid(rows, cols, startPos, targetPos, walls);
  const steps: Step[] = [];
  let stepCount = 0;

  const queue: [number, number][] = [startPos];
  const visited = new Set<string>([`${startPos[0]},${startPos[1]}`]);
  const visitedOrder: [number, number][] = [startPos];
  const parentMap = new Map<string, [number, number]>();

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `너비 우선 탐색 (BFS) 시작. 큐(Queue)를 이용하여 레벨별/물결 모양으로 퍼져나갑니다.`,
    variables: { start: `(${startPos[0]}, ${startPos[1]})`, queueSize: 1 },
    grid: JSON.parse(JSON.stringify(grid)),
    visitedCellCoords: [startPos],
    pathCellCoords: [],
    soundType: 'step',
  });

  let reachedTarget = false;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;

    if (grid[cr][cc].type !== 'start' && grid[cr][cc].type !== 'target') {
      grid[cr][cc].type = 'visited';
    }

    if (cr === targetPos[0] && cc === targetPos[1]) {
      reachedTarget = true;
      steps.push({
        stepIndex: stepCount++,
        line: 7,
        description: `도착점(E)에 도달했습니다! (BFS는 비가중치 그래프에서 최단 경로를 보장합니다)`,
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
      queue.push([nr, nc]);
      activeNeighbors.push([nr, nc]);
    }

    if (stepCount % 2 === 0 || queue.length < 3) {
      steps.push({
        stepIndex: stepCount++,
        line: 9,
        description: `좌표 (${cr}, ${cc}) 방문. 4방향 미방문 이웃 ${activeNeighbors.length}개를 큐에 인큐(Enqueue)합니다.`,
        variables: {
          current: `(${cr}, ${cc})`,
          queueSize: queue.length,
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
      description: `BFS 최단 경로 발견! 이동 거리: ${path.length - 1} 칸 (탐색한 노드 수: ${visitedOrder.length})`,
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
