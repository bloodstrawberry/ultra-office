export interface WaterColorDef {
  id: number;
  name: string;
  color: string;
  gradient: string;
}

export const WATER_COLORS: Record<number, WaterColorDef> = {
  1: {
    id: 1,
    name: '코랄 루비',
    color: '#FF4D6D',
    gradient: 'linear-gradient(105deg, #FF8FA3 0%, #FF4D6D 42%, #C9184A 100%)',
  },
  2: {
    id: 2,
    name: '사파이어 블루',
    color: '#3A86FF',
    gradient: 'linear-gradient(105deg, #78C6FF 0%, #3A86FF 45%, #2452C6 100%)',
  },
  3: {
    id: 3,
    name: '민트 에메랄드',
    color: '#16DB93',
    gradient: 'linear-gradient(105deg, #72F2C7 0%, #16DB93 45%, #078F68 100%)',
  },
  4: {
    id: 4,
    name: '허니 앰버',
    color: '#FFB703',
    gradient: 'linear-gradient(105deg, #FFE066 0%, #FFB703 48%, #E77700 100%)',
  },
  5: {
    id: 5,
    name: '오로라 바이올렛',
    color: '#9B5DE5',
    gradient: 'linear-gradient(105deg, #D2A8FF 0%, #9B5DE5 45%, #6236B5 100%)',
  },
  6: {
    id: 6,
    name: '피오니 핑크',
    color: '#F15BB5',
    gradient: 'linear-gradient(105deg, #FFACE4 0%, #F15BB5 44%, #B82482 100%)',
  },
  7: {
    id: 7,
    name: '라군 시안',
    color: '#00C2D7',
    gradient: 'linear-gradient(105deg, #7AE7F2 0%, #00C2D7 46%, #087E9B 100%)',
  },
};

export const TUBE_CAPACITY = 4;

export interface WaterSortPreset {
  id: string;
  name: string;
  difficulty: '쉬움' | '보통' | '어려움';
  tubes: number[][]; // From bottom to top
}

export const WATER_SORT_PRESETS: WaterSortPreset[] = [
  {
    id: 'easy-4',
    name: '입문 (4개 튜브)',
    difficulty: '쉬움',
    tubes: [[1, 2, 1, 2], [2, 1, 2, 1], [], []],
  },
  {
    id: 'medium-5',
    name: '보통 (5개 튜브)',
    difficulty: '보통',
    tubes: [[1, 3, 2, 1], [2, 1, 3, 2], [3, 2, 1, 3], [], []],
  },
  {
    id: 'hard-7',
    name: '고급 (7개 튜브)',
    difficulty: '어려움',
    tubes: [[1, 4, 3, 2], [5, 2, 1, 4], [3, 5, 2, 1], [4, 3, 5, 2], [1, 4, 3, 5], [], []],
  },
];

export function isTubeComplete(tube: number[]): boolean {
  if (tube.length === 0) return true;
  if (tube.length !== TUBE_CAPACITY) return false;
  return tube.every((c) => c === tube[0]);
}

export function isWaterSortWon(tubes: number[][]): boolean {
  return tubes.every(isTubeComplete);
}

export function canPour(tubes: number[][], from: number, to: number): boolean {
  if (from === to) return false;
  const src = tubes[from];
  const dst = tubes[to];
  if (!src || !dst || src.length === 0) return false;
  if (dst.length >= TUBE_CAPACITY) return false;

  // Don't pour from a tube that is already completed
  if (src.length === TUBE_CAPACITY && src.every((c) => c === src[0])) {
    return false;
  }

  // If dst is empty, allowed (unless src has all same colors, pouring to empty is redundant)
  if (dst.length === 0) {
    const allSame = src.every((c) => c === src[0]);
    return !allSame;
  }

  // Dst top must equal src top
  return dst[dst.length - 1] === src[src.length - 1];
}

export function executePour(
  tubes: number[][],
  from: number,
  to: number
): { nextTubes: number[][]; pouredCount: number } | null {
  if (!canPour(tubes, from, to)) return null;

  const nextTubes = tubes.map((t) => [...t]);
  const src = nextTubes[from];
  const dst = nextTubes[to];

  const topColor = src[src.length - 1];
  let count = 0;
  for (let i = src.length - 1; i >= 0; i -= 1) {
    if (src[i] === topColor) {
      count += 1;
    } else {
      break;
    }
  }

  const space = TUBE_CAPACITY - dst.length;
  const toPour = Math.min(count, space);

  for (let i = 0; i < toPour; i += 1) {
    src.pop();
    dst.push(topColor);
  }

  return { nextTubes, pouredCount: toPour };
}

export interface WaterSortStep {
  from: number;
  to: number;
}

export function solveWaterSort(initialTubes: number[][]): {
  solved: boolean;
  steps: WaterSortStep[];
} {
  if (isWaterSortWon(initialTubes)) {
    return { solved: true, steps: [] };
  }

  const serialize = (tubes: number[][]): string => tubes.map((t) => t.join(',')).join('|');

  interface QueueNode {
    tubes: number[][];
    steps: WaterSortStep[];
  }

  const visited = new Set<string>();
  const queue: QueueNode[] = [{ tubes: initialTubes, steps: [] }];
  visited.add(serialize(initialTubes));

  let iterations = 0;
  const maxIterations = 25000;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations += 1;
    const current = queue.shift()!;

    if (isWaterSortWon(current.tubes)) {
      return { solved: true, steps: current.steps };
    }

    const n = current.tubes.length;
    for (let f = 0; f < n; f += 1) {
      for (let t = 0; t < n; t += 1) {
        if (canPour(current.tubes, f, t)) {
          const res = executePour(current.tubes, f, t);
          if (!res) continue;

          const key = serialize(res.nextTubes);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({
              tubes: res.nextTubes,
              steps: [...current.steps, { from: f, to: t }],
            });
          }
        }
      }
    }
  }

  return { solved: false, steps: [] };
}

export interface WaterSortFullStep {
  from: number;
  to: number;
  tubes: number[][];
  description: string;
}

export function generateWaterSortStates(initialTubes: number[][]): WaterSortFullStep[] {
  const { solved, steps } = solveWaterSort(initialTubes);
  if (!solved) return [];

  let current = initialTubes.map((t) => [...t]);
  const result: WaterSortFullStep[] = [];

  for (const step of steps) {
    const res = executePour(current, step.from, step.to);
    if (!res) break;
    current = res.nextTubes;
    result.push({
      from: step.from,
      to: step.to,
      tubes: current.map((t) => [...t]),
      description: `[튜브 ${step.from + 1}]의 물을 [튜브 ${step.to + 1}]로 ${res.pouredCount}칸 붓기`,
    });
  }

  return result;
}
