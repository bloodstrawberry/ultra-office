import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const TYPESCRIPT_TEMPLATES: CodeTemplate[] = [
  {
    id: 'ts-01-hello-io',
    title: '01. Hello World & 정적 타입 입출력',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: 'TypeScript 인터페이스, 타입 선언 및 컴파일 타임 검증',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Hello World', 'Interface', 'Static Typing'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [01] TypeScript: Hello World & 타입 시스템
// ==========================================

interface DeveloperProfile {
  name: string;
  role: 'Frontend' | 'Backend' | 'Fullstack' | 'Algorithm Engineer';
  level: number;
  skills: readonly string[];
}

const dev: DeveloperProfile = {
  name: '홍길동',
  role: 'Algorithm Engineer',
  level: 5,
  skills: ['TypeScript', 'Graph Theory', 'DP', 'Data Structures']
};

console.log('\\x1b[36m%s\\x1b[0m', '✨ Hello, TypeScript with tsx Execution!');
console.log('------------------------------------------');
console.log(\`개발자: \${dev.name} [Lv.\${dev.level}]\`);
console.log(\`담당 직무: \${dev.role}\`);
console.log(\`보유 알고리즘 역량: \${dev.skills.join(', ')}\`);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-hello',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 제네릭 그래프)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '제네릭 인접 리스트 인터페이스를 활용한 타입 안전한 DFS 탐색 및 연결 요소 산출',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['DFS', 'Graph', 'Generics', 'Connected Components'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [02] TypeScript: 깊이 우선 탐색 (DFS)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [DFS] TypeScript 제네릭 그래프 순회');
console.log('------------------------------------------');

type AdjacencyList<T extends string | number> = Record<T, T[]>;

const networkGraph: AdjacencyList<number> = {
  1: [2, 3],
  2: [1, 4, 5],
  3: [1, 6],
  4: [2],
  5: [2],
  6: [3],
  7: [8],
  8: [7],
  9: []
};

function dfs<T extends string | number>(
  graph: AdjacencyList<T>,
  start: T,
  visited: Set<T> = new Set()
): T[] {
  const result: T[] = [];

  function traverse(node: T) {
    visited.add(node);
    result.push(node);

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        traverse(neighbor);
      }
    }
  }

  traverse(start);
  return result;
}

const visited = new Set<number>();
const cluster1 = dfs(networkGraph, 1, visited);
console.log('노드 1 기준 DFS 순회:', cluster1.join(' ➔ '));

// 전체 연결 요소 분할
visited.clear();
const components: number[][] = [];

for (const nodeStr of Object.keys(networkGraph)) {
  const node = Number(nodeStr);
  if (!visited.has(node)) {
    components.push(dfs(networkGraph, node, visited));
  }
}

console.log('\\n[독립 컴포넌트 분석]');
components.forEach((comp, idx) => {
  console.log(\`  • 서브네트워크 #\${idx + 1}: [ \${comp.join(', ')} ]\`);
});
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-dfs',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 기반 큐와 튜플 좌표계를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['BFS', 'Queue', 'Shortest Path', 'Tuple'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [03] TypeScript: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [BFS] 2D 미로 최단 거리 탐색');
console.log('------------------------------------------');

type Point = [x: number, y: number];
interface PathResult {
  distance: number;
  path: Point[];
}

const maze: readonly number[][] = [
  [0, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0],
];

function solveMazeBFS(grid: readonly number[][], start: Point, end: Point): PathResult | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  const queue: Array<[x: number, y: number, dist: number, path: Point[]]> = [
    [start[0], start[1], 1, [start]]
  ];
  visited[start[1]][start[0]] = true;

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  while (queue.length > 0) {
    const [x, y, dist, path] = queue.shift()!;

    if (x === end[0] && y === end[1]) {
      return { distance: dist, path };
    }

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        if (!visited[ny][nx] && grid[ny][nx] === 0) {
          visited[ny][nx] = true;
          queue.push([nx, ny, dist + 1, [...path, [nx, ny]]]);
        }
      }
    }
  }
  return null;
}

const startPt: Point = [0, 0];
const endPt: Point = [maze[0].length - 1, maze.length - 1];
const result = solveMazeBFS(maze, startPt, endPt);

if (result) {
  console.log('\\x1b[32m%s\\x1b[0m', \`✨ 미로 탈출 최단 거리: \${result.distance}칸\`);
  console.log('이동 경로:');
  console.log(result.path.map(([x, y]) => \`(\${x},\${y})\`).join(' ➔ '));
}
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-bfs',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 명시적 객체 모델을 활용한 0/1 Knapsack 배낭 DP 최적화',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Optimization'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [04] TypeScript: 다이나믹 프로그래밍 (배낭 문제)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [DP] 0/1 Knapsack 배낭 최적화');
console.log('------------------------------------------');

interface Item {
  readonly name: string;
  readonly weight: number;
  readonly value: number;
}

const inventory: Item[] = [
  { name: '노트북', weight: 3, value: 50 },
  { name: '카메라', weight: 1, value: 40 },
  { name: '스마트폰', weight: 1, value: 30 },
  { name: '보조배터리', weight: 2, value: 20 },
  { name: '헤드폰', weight: 2, value: 35 },
];

function knapsackDP(items: Item[], capacity: number): { maxValue: number; selected: Item[] } {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selected: Item[] = [];
  let curW = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][curW] !== dp[i - 1][curW]) {
      selected.push(items[i - 1]);
      curW -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][capacity], selected };
}

const maxCap = 5;
const { maxValue, selected } = knapsackDP(inventory, maxCap);
console.log(\`배낭 허용 최대치: \${maxCap}kg\`);
console.log('\\x1b[32m%s\\x1b[0m', \`✨ 획득 가능한 최대 가치: \${maxValue}만원\`);
console.log('선택된 아이템 조합:');
selected.forEach(it => console.log(\`  ➜ \${it.name} (\${it.weight}kg, \${it.value}만원)\`));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-dp',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '제네릭 비교자 기반 이진 탐색 및 최적화 결정 문제를 푸는 파라메트릭 서치',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Binary Search', 'Parametric Search', 'Generics'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [05] TypeScript: 이진 탐색 & 파라메트릭 서치
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Binary Search] 이진 탐색 알고리즘');
console.log('------------------------------------------');

// 1. Generic Binary Search
function binarySearch<T>(arr: readonly T[], target: T, compare: (a: T, b: T) => number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compare(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const list = [5, 12, 19, 27, 34, 48, 56, 68, 79, 90];
const target = 48;
const idx = binarySearch(list, target, (a, b) => a - b);
console.log('[1] 제네릭 이진 탐색:', list);
console.log(\`  ➜ \${target} 탐색 결과 인덱스: \${idx}\\n\`);

// 2. Parametric Search
const woodCuts: readonly number[] = [802, 743, 457, 539];
const requiredPieces = 11;

function parametricSearch(pieces: readonly number[], needed: number): number {
  let left = 1;
  let right = Math.max(...pieces);
  let best = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const count = pieces.reduce((sum, len) => sum + Math.floor(len / mid), 0);

    if (count >= needed) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return best;
}

const maxPieceLen = parametricSearch(woodCuts, requiredPieces);
console.log(\`[2] 파라메트릭 서치 (필요 수량: \${requiredPieces}개):\`);
console.log('\\x1b[32m%s\\x1b[0m', \`  ✨ 만들 수 있는 최대 길이: \${maxPieceLen}cm\`);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-binary-search',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '엄격한 타입 인터페이스 기반 다익스트라 최단 경로 및 가중치 경로 탐색',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Dijkstra', 'Graph', 'Shortest Path', 'Strict Types'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [06] TypeScript: 다익스트라 최단 경로
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Dijkstra] 가중치 최단 경로');
console.log('------------------------------------------');

interface WeightedEdge<T extends string> {
  to: T;
  weight: number;
}

type Graph<T extends string> = Record<T, WeightedEdge<T>[]>;

type NodeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'Z';

const graph: Graph<NodeId> = {
  A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
  B: [{ to: 'C', weight: 1 }, { to: 'D', weight: 5 }],
  C: [{ to: 'B', weight: 1 }, { to: 'D', weight: 8 }, { to: 'E', weight: 10 }],
  D: [{ to: 'E', weight: 2 }, { to: 'Z', weight: 6 }],
  E: [{ to: 'D', weight: 2 }, { to: 'Z', weight: 3 }],
  Z: [],
};

function dijkstra<T extends string>(g: Graph<T>, start: T) {
  const dist: Record<string, number> = {};
  const prev: Record<string, T | null> = {};
  const unvisited = new Set<T>(Object.keys(g) as T[]);

  for (const node of Object.keys(g)) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[start] = 0;

  while (unvisited.size > 0) {
    let curr: T | null = null;
    let minD = Infinity;

    for (const node of unvisited) {
      if (dist[node] < minD) {
        minD = dist[node];
        curr = node;
      }
    }

    if (!curr || minD === Infinity) break;
    unvisited.delete(curr);

    for (const edge of g[curr] || []) {
      if (unvisited.has(edge.to)) {
        const alt = dist[curr] + edge.weight;
        if (alt < dist[edge.to]) {
          dist[edge.to] = alt;
          prev[edge.to] = curr;
        }
      }
    }
  }

  return { dist, prev };
}

const { dist, prev } = dijkstra(graph, 'A');
console.log('출발지 [A] 기준 최단 거리:');
for (const [dest, cost] of Object.entries(dist)) {
  console.log(\`  • [\${dest}] 최단 비용: \${cost}\`);
}
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-dijkstra',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-07-sorting',
    title: '07. 퀵 정렬 & 병합 정렬 (Generic Sorting)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 매개변수 T를 지원하는 제네릭 퀵 정렬 및 병합 정렬',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['QuickSort', 'MergeSort', 'Generics', 'Divide and Conquer'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [07] TypeScript: 제네릭 퀵 정렬 & 병합 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Sorting] 타입 안전한 정렬 알고리즘');
console.log('------------------------------------------');

// 1. Generic QuickSort
function quickSort<T>(arr: readonly T[], compare: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return [...arr];
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => compare(x, pivot) < 0);
  const mid = arr.filter(x => compare(x, pivot) === 0);
  const right = arr.filter(x => compare(x, pivot) > 0);

  return [...quickSort(left, compare), ...mid, ...quickSort(right, compare)];
}

const rawScores = [88, 42, 95, 12, 73, 61, 100, 54];
console.log('원본 데이터:', rawScores);
const sorted = quickSort(rawScores, (a, b) => a - b);
console.log('\\x1b[32m%s\\x1b[0m', '정렬 결과:', sorted);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-sorting',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '유망성(Promising) 조건 검사를 통한 N-Queens 체스판 배치 백트래킹',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Backtracking', 'N-Queens', 'Recursion'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [08] TypeScript: 백트래킹 (N-Queens)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Backtracking] N-Queens 퍼즐');
console.log('------------------------------------------');

function solveNQueens(N: number): number[][] {
  const solutions: number[][] = [];
  const board: number[] = Array(N).fill(-1);

  function isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(row - r) === Math.abs(col - c)) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row: number) {
    if (row === N) {
      solutions.push([...board]);
      return;
    }
    for (let col = 0; col < N; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        backtrack(row + 1);
        board[row] = -1;
      }
    }
  }

  backtrack(0);
  return solutions;
}

const N = 4;
const solutions = solveNQueens(N);
console.log(\`\${N}x\${N} 체스판 배치 가능한 해답 수: \${solutions.length}가지\\n\`);

solutions.forEach((sol, idx) => {
  console.log(\`[해답 #\${idx + 1}]\`);
  for (let r = 0; r < N; r++) {
    let line = '  ';
    for (let c = 0; c < N; c++) {
      line += sol[r] === c ? ' 👑' : ' ⬜';
    }
    console.log(line);
  }
  console.log('');
});
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-backtracking',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 튜플 기반 Two Sum 탐색 및 고정 길이 슬라이딩 윈도우 최대 합 O(N)',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [09] TypeScript: 투 포인터 & 슬라이딩 윈도우
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Two Pointers] O(N) 고속 선형 탐색');
console.log('------------------------------------------');

// 1. Two Sum Sorted
function twoSumSorted(arr: readonly number[], target: number): Array<[number, number]> {
  let left = 0;
  let right = arr.length - 1;
  const pairs: Array<[number, number]> = [];

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      pairs.push([arr[left], arr[right]]);
      left++;
      right--;
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return pairs;
}

const list = [1, 2, 3, 4, 6, 8, 9, 11, 15];
const target = 12;
console.log('정렬 배열:', list);
console.log('합이 12인 쌍:', twoSumSorted(list, target).map(([a, b]) => \`(\${a}+\${b})\`).join(', '));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-two-pointers',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '인터페이스 모델링 기반 회의실 최대 배정(Activity Selection)',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Greedy', 'Activity Selection', 'Scheduling'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [10] TypeScript: 그리디 (회의실 배정)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Greedy] 회의실 배정 (Activity Selection)');
console.log('------------------------------------------');

interface Meeting {
  readonly id: string;
  readonly start: number;
  readonly end: number;
}

const schedule: readonly Meeting[] = [
  { id: 'M1', start: 1, end: 4 },
  { id: 'M2', start: 3, end: 5 },
  { id: 'M3', start: 0, end: 6 },
  { id: 'M4', start: 5, end: 7 },
  { id: 'M5', start: 3, end: 8 },
  { id: 'M6', start: 5, end: 9 },
  { id: 'M7', start: 6, end: 10 },
  { id: 'M8', start: 8, end: 11 },
  { id: 'M9', start: 8, end: 12 },
  { id: 'M10', start: 12, end: 14 },
];

function selectMaxMeetings(meetings: readonly Meeting[]): Meeting[] {
  const sorted = [...meetings].sort((a, b) =>
    a.end === b.end ? a.start - b.start : a.end - b.end
  );

  const selected: Meeting[] = [];
  let lastEnd = 0;

  for (const m of sorted) {
    if (m.start >= lastEnd) {
      selected.push(m);
      lastEnd = m.end;
    }
  }
  return selected;
}

const res = selectMaxMeetings(schedule);
console.log(\`신청 회의: \${schedule.length}개 ➜ 배정 성공: \${res.length}개\`);
res.forEach(m => console.log(\`  ➜ \${m.id}: \${m.start}시 ~ \${m.end}시 (\${m.end - m.start}시간)\`));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-greedy',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
];
