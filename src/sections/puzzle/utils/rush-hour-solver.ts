export interface Vehicle {
  id: string;
  name: string;
  length: 2 | 3;
  orientation: 'H' | 'V';
  row: number; // Top-left position
  col: number;
  color: string;
  isTarget?: boolean;
}

export interface RushHourPreset {
  id: string;
  name: string;
  difficulty: '초급' | '중급' | '고급';
  vehicles: Vehicle[];
}

export const GRID_SIZE = 6;
export const EXIT_ROW = 2;

export const RUSH_HOUR_PRESETS: RushHourPreset[] = [
  {
    id: 'beginner-1',
    name: '입문 1단계 (8수 탈출)',
    difficulty: '초급',
    vehicles: [
      {
        id: 'X',
        name: '빨간 주인공 차',
        length: 2,
        orientation: 'H',
        row: 2,
        col: 1,
        color: '#EF4444',
        isTarget: true,
      },
      {
        id: 'A',
        name: '녹색 승용차',
        length: 2,
        orientation: 'V',
        row: 0,
        col: 0,
        color: '#10B981',
      },
      {
        id: 'B',
        name: '노란 승용차',
        length: 2,
        orientation: 'H',
        row: 0,
        col: 3,
        color: '#F59E0B',
      },
      { id: 'C', name: '파란 트럭', length: 3, orientation: 'V', row: 1, col: 3, color: '#3B82F6' },
      {
        id: 'D',
        name: '보라 승용차',
        length: 2,
        orientation: 'H',
        row: 4,
        col: 2,
        color: '#8B5CF6',
      },
      {
        id: 'E',
        name: '하늘 승용차',
        length: 2,
        orientation: 'V',
        row: 3,
        col: 5,
        color: '#06B6D4',
      },
    ],
  },
  {
    id: 'intermediate-2',
    name: '중급 2단계 (15수 탈출)',
    difficulty: '중급',
    vehicles: [
      {
        id: 'X',
        name: '빨간 주인공 차',
        length: 2,
        orientation: 'H',
        row: 2,
        col: 0,
        color: '#EF4444',
        isTarget: true,
      },
      {
        id: 'A',
        name: '녹색 승용차',
        length: 2,
        orientation: 'V',
        row: 0,
        col: 2,
        color: '#10B981',
      },
      { id: 'B', name: '주황 트럭', length: 3, orientation: 'H', row: 3, col: 0, color: '#F97316' },
      { id: 'C', name: '파란 트럭', length: 3, orientation: 'V', row: 1, col: 3, color: '#3B82F6' },
      {
        id: 'D',
        name: '노란 승용차',
        length: 2,
        orientation: 'V',
        row: 1,
        col: 4,
        color: '#F59E0B',
      },
      {
        id: 'E',
        name: '보라 승용차',
        length: 2,
        orientation: 'H',
        row: 4,
        col: 3,
        color: '#8B5CF6',
      },
      {
        id: 'F',
        name: '핑크 승용차',
        length: 2,
        orientation: 'V',
        row: 4,
        col: 1,
        color: '#EC4899',
      },
    ],
  },
  {
    id: 'advanced-3',
    name: '고급 3단계 (러시아워 마스터)',
    difficulty: '고급',
    vehicles: [
      {
        id: 'X',
        name: '빨간 주인공 차',
        length: 2,
        orientation: 'H',
        row: 2,
        col: 1,
        color: '#EF4444',
        isTarget: true,
      },
      {
        id: 'A',
        name: '연두 승용차',
        length: 2,
        orientation: 'V',
        row: 0,
        col: 0,
        color: '#84CC16',
      },
      {
        id: 'B',
        name: '청록 승용차',
        length: 2,
        orientation: 'H',
        row: 0,
        col: 1,
        color: '#14B8A6',
      },
      { id: 'C', name: '노란 트럭', length: 3, orientation: 'V', row: 1, col: 3, color: '#EAB308' },
      { id: 'D', name: '파란 트럭', length: 3, orientation: 'H', row: 5, col: 2, color: '#3B82F6' },
      { id: 'E', name: '보라 트럭', length: 3, orientation: 'V', row: 0, col: 5, color: '#A855F7' },
      {
        id: 'F',
        name: '오렌지 승용차',
        length: 2,
        orientation: 'H',
        row: 3,
        col: 0,
        color: '#F97316',
      },
      {
        id: 'G',
        name: '핑크 승용차',
        length: 2,
        orientation: 'V',
        row: 3,
        col: 4,
        color: '#EC4899',
      },
    ],
  },
];

export function buildGrid(vehicles: Vehicle[]): string[][] {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('.'));

  for (const v of vehicles) {
    for (let i = 0; i < v.length; i += 1) {
      const r = v.orientation === 'V' ? v.row + i : v.row;
      const c = v.orientation === 'H' ? v.col + i : v.col;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        grid[r][c] = v.id;
      }
    }
  }

  return grid;
}

export function isRushHourWon(vehicles: Vehicle[]): boolean {
  const target = vehicles.find((v) => v.isTarget);
  if (!target) return false;
  return target.col === GRID_SIZE - target.length; // Reached right exit (col 4 for len 2)
}

export function canMoveVehicle(vehicles: Vehicle[], vehicleId: string, delta: number): boolean {
  if (delta === 0) return false;
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return false;

  const grid = buildGrid(vehicles.filter((v) => v.id !== vehicleId));

  const newRow = vehicle.orientation === 'V' ? vehicle.row + delta : vehicle.row;
  const newCol = vehicle.orientation === 'H' ? vehicle.col + delta : vehicle.col;

  // Boundary check
  if (vehicle.orientation === 'V') {
    if (newRow < 0 || newRow + vehicle.length > GRID_SIZE) return false;
    for (let i = 0; i < vehicle.length; i += 1) {
      if (grid[newRow + i][vehicle.col] !== '.') return false;
    }
  } else {
    if (newCol < 0 || newCol + vehicle.length > GRID_SIZE) return false;
    for (let i = 0; i < vehicle.length; i += 1) {
      if (grid[vehicle.row][newCol + i] !== '.') return false;
    }
  }

  return true;
}

export function moveVehicle(
  vehicles: Vehicle[],
  vehicleId: string,
  delta: number
): Vehicle[] | null {
  if (!canMoveVehicle(vehicles, vehicleId, delta)) return null;

  return vehicles.map((v) => {
    if (v.id !== vehicleId) return v;
    return {
      ...v,
      row: v.orientation === 'V' ? v.row + delta : v.row,
      col: v.orientation === 'H' ? v.col + delta : v.col,
    };
  });
}

export interface RushHourStep {
  vehicleId: string;
  vehicleName: string;
  delta: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  vehicles: Vehicle[];
}

export function solveRushHour(initialVehicles: Vehicle[]): {
  solved: boolean;
  steps: RushHourStep[];
} {
  if (isRushHourWon(initialVehicles)) {
    return { solved: true, steps: [] };
  }

  const serialize = (vehicles: Vehicle[]): string =>
    vehicles
      .map((v) => `${v.id}:${v.row},${v.col}`)
      .sort()
      .join('|');

  interface QueueNode {
    vehicles: Vehicle[];
    steps: RushHourStep[];
  }

  const visited = new Set<string>();
  const queue: QueueNode[] = [{ vehicles: initialVehicles, steps: [] }];
  visited.add(serialize(initialVehicles));

  let iterations = 0;
  const maxIterations = 30000;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations += 1;
    const current = queue.shift()!;

    if (isRushHourWon(current.vehicles)) {
      return { solved: true, steps: current.steps };
    }

    for (const v of current.vehicles) {
      // Possible deltas: -1, +1, -2, +2, etc. (we check single step increments)
      const possibleDeltas = [-1, 1];
      for (const delta of possibleDeltas) {
        if (canMoveVehicle(current.vehicles, v.id, delta)) {
          const nextVehicles = moveVehicle(current.vehicles, v.id, delta);
          if (!nextVehicles) continue;

          const key = serialize(nextVehicles);
          if (!visited.has(key)) {
            visited.add(key);

            let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'RIGHT';
            if (v.orientation === 'V') {
              direction = delta > 0 ? 'DOWN' : 'UP';
            } else {
              direction = delta > 0 ? 'RIGHT' : 'LEFT';
            }

            queue.push({
              vehicles: nextVehicles,
              steps: [
                ...current.steps,
                {
                  vehicleId: v.id,
                  vehicleName: v.name,
                  delta,
                  direction,
                  vehicles: nextVehicles,
                },
              ],
            });
          }
        }
      }
    }
  }

  return { solved: false, steps: [] };
}

export function getRushHourStepDescription(step: RushHourStep): string {
  const dirKorean =
    step.direction === 'UP'
      ? '위쪽으로'
      : step.direction === 'DOWN'
        ? '아래쪽으로'
        : step.direction === 'LEFT'
          ? '왼쪽으로'
          : '오른쪽으로';
  const count = Math.abs(step.delta);
  return `[${step.vehicleName}] ${dirKorean} ${count}칸 이동`;
}
