import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const JAVASCRIPT_TEMPLATES: CodeTemplate[] = [
  {
    id: 'js-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'JavaScript Node.js 표준 출력(console.log, console.table) 및 프로세스 정보',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Hello World', 'I/O', 'Console'],
    files: {
      'index.js': `// ==========================================
// 🟨 [01] JavaScript: Hello World & 입출력
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '✨ Hello, JavaScript Node.js!');
console.log('------------------------------------------');

const runtimeInfo = {
  engine: 'V8 / WebContainer',
  nodeVersion: process.version,
  platform: process.platform,
  uptimeSec: process.uptime().toFixed(2),
  timestamp: new Date().toISOString(),
};

console.log('[1] 런타임 환경 정보:');
console.table(runtimeInfo);

const greeting = (name, role = 'Developer') => \`환영합니다, \${name}님! (직무: \${role})\`;
console.log('\\n[2] 인사말 출력:');
console.log('  ➜', greeting('철수', 'Frontend Engineer'));
console.log('  ➜', greeting('영희', 'Algorithm Specialist'));
`,
      'package.json': JSON.stringify(
        { name: 'js-hello-io', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description:
      '인접 리스트 그래프에서 재귀적 깊이 우선 탐색(DFS) 및 독립 연결 요소(Connected Components) 분석',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['DFS', 'Graph', 'Recursion', 'Connected Components'],
    files: {
      'index.js': `// ==========================================
// 🟨 [02] JavaScript: 깊이 우선 탐색 (DFS)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [DFS] Depth-First Search 그래프 순회');
console.log('------------------------------------------');

// 인접 리스트로 그래프 표현
const graph = {
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

const visited = new Set();

function dfs(node, path = []) {
  visited.add(node);
  path.push(node);

  for (const neighbor of graph[node] || []) {
    if (!visited.has(neighbor)) {
      dfs(neighbor, path);
    }
  }
  return path;
}

console.log('[1] 노드 1부터 시작하는 DFS 순회 경로:');
const cluster = dfs(1);
console.log('  ➜', cluster.join(' ➔ '));

// 독립된 연결 요소(Connected Components) 분할
visited.clear();
const components = [];

for (const node of Object.keys(graph).map(Number)) {
  if (!visited.has(node)) {
    components.push(dfs(node));
  }
}

console.log('\\n[2] 전체 네트워크의 독립 컴포넌트 목록:');
components.forEach((comp, idx) => {
  console.log(\`  • 그룹 #\${idx + 1} (노드 \${comp.length}개): [ \${comp.join(', ')} ]\`);
});
console.log('\\x1b[32m%s\\x1b[0m', \`\\n총 독립 네트워크 수: \${components.length}개\`);
`,
      'package.json': JSON.stringify({ name: 'js-dfs', type: 'module', version: '1.0.0' }, null, 2),
    },
  },
  {
    id: 'js-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 최단 경로 미로)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '큐(Queue)를 이용한 2D 미로 탈출 최단 거리 및 이동 경로 역추적',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['BFS', 'Queue', 'Shortest Path', 'Maze'],
    files: {
      'index.js': `// ==========================================
// 🟨 [03] JavaScript: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [BFS] 2D 미로 최단 경로 탐색');
console.log('------------------------------------------');

// 0: 이동 가능 길, 1: 벽
const maze = [
  [0, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0],
];

const H = maze.length;
const W = maze[0].length;

function solveMazeBFS(startX, startY, endX, endY) {
  const queue = [[startX, startY, 1, [[startX, startY]]]]; // [x, y, dist, path]
  const visited = Array.from({ length: H }, () => Array(W).fill(false));
  visited[startY][startX] = true;

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  while (queue.length > 0) {
    const [x, y, dist, path] = queue.shift();

    if (x === endX && y === endY) {
      return { dist, path };
    }

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];

      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        if (!visited[ny][nx] && maze[ny][nx] === 0) {
          visited[ny][nx] = true;
          queue.push([nx, ny, dist + 1, [...path, [nx, ny]]]);
        }
      }
    }
  }
  return null;
}

const result = solveMazeBFS(0, 0, W - 1, H - 1);
console.log(\`미로 규격: \${W}x\${H} | 시작 (0,0) ➔ 도착 (\${W-1},\${H-1})\`);
if (result) {
  console.log('\\x1b[32m%s\\x1b[0m', \`✨ 최단 이동 거리: \${result.dist}칸\`);
  console.log('이동 좌표 경로:');
  console.log(result.path.map(([x, y]) => \`(\${x},\${y})\`).join(' ➔ '));
}
`,
      'package.json': JSON.stringify({ name: 'js-bfs', type: 'module', version: '1.0.0' }, null, 2),
    },
  },
  {
    id: 'js-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭 문제)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '제한 용량 하에서 최대 가치를 얻는 0/1 Knapsack DP 테이블 최적화',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Memoization'],
    files: {
      'index.js': `// ==========================================
// 🟨 [04] JavaScript: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [DP] 0/1 Knapsack 배낭 가치 최적화');
console.log('------------------------------------------');

const items = [
  { name: '노트북', weight: 3, value: 50 },
  { name: '카메라', weight: 1, value: 40 },
  { name: '스마트폰', weight: 1, value: 30 },
  { name: '외장배터리', weight: 2, value: 20 },
  { name: '헤드폰', weight: 2, value: 35 },
];

const maxWeight = 5;

function knapsackDP(items, capacity) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

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

  // 선택된 아이템 역추적
  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(items[i - 1]);
      w -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][capacity], selected };
}

const { maxValue, selected } = knapsackDP(items, maxWeight);
console.log(\`배낭 허용 최대 무게: \${maxWeight}kg\`);
console.log('\\x1b[32m%s\\x1b[0m', \`✨ 배낭에 담을 수 있는 최대 가치: \${maxValue}만원\`);
console.log('선택된 아이템 목록:');
selected.forEach(it => console.log(\`  ➜ \${it.name} (무게: \${it.weight}kg, 가치: \${it.value}만원)\`));
`,
      'package.json': JSON.stringify({ name: 'js-dp', type: 'module', version: '1.0.0' }, null, 2),
    },
  },
  {
    id: 'js-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치 (Binary Search)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'O(log N) 고속 탐색 및 조건 만족 최대 길이를 구하는 파라메트릭 서치(랜선 자르기)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Binary Search', 'Parametric Search', 'O(log N)'],
    files: {
      'index.js': `// ==========================================
// 🟨 [05] JavaScript: 이진 탐색 & 파라메트릭 서치
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Binary Search] O(log N) 이진 탐색');
console.log('------------------------------------------');

// 1. 기본 이진 탐색
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
const target = 23;
console.log('[1] 정렬된 배열:', arr);
console.log(\`  ➜ 값 \${target}의 인덱스: \${binarySearch(arr, target)}\\n\`);

// 2. 파라메트릭 서치: K개 이상의 동일한 길이 랜선을 만들 때 최대 길이
const cables = [802, 743, 457, 539];
const required = 11;

function findMaxCableLength(cables, needed) {
  let left = 1;
  let right = Math.max(...cables);
  let best = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const count = cables.reduce((sum, len) => sum + Math.floor(len / mid), 0);

    if (count >= needed) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return best;
}

const maxLen = findMaxCableLength(cables, required);
console.log(\`[2] 파라메트릭 서치 (랜선 \${required}개 만들기):\`);
console.log(\`  • 보유 랜선: [ \${cables.join(', ')} ]\`);
console.log('\\x1b[32m%s\\x1b[0m', \`  ✨ 만들 수 있는 최대 랜선 길이: \${maxLen}cm\`);
`,
      'package.json': JSON.stringify(
        { name: 'js-binary-search', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Shortest Path)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '가중치 방향 그래프에서 단일 출발점 최단 거리 산출 및 경로 복원',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Dijkstra', 'Graph', 'Shortest Path', 'Greedy'],
    files: {
      'index.js': `// ==========================================
// 🟨 [06] JavaScript: 다익스트라 최단 경로
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Dijkstra] 가중치 그래프 최단 경로');
console.log('------------------------------------------');

const graph = {
  A: [{ to: 'B', cost: 4 }, { to: 'C', cost: 2 }],
  B: [{ to: 'C', cost: 1 }, { to: 'D', cost: 5 }],
  C: [{ to: 'B', cost: 1 }, { to: 'D', cost: 8 }, { to: 'E', cost: 10 }],
  D: [{ to: 'E', cost: 2 }, { to: 'Z', cost: 6 }],
  E: [{ to: 'D', cost: 2 }, { to: 'Z', cost: 3 }],
  Z: [],
};

function dijkstra(start) {
  const dist = {};
  const prev = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of Object.keys(graph)) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[start] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minDist = Infinity;

    for (const node of unvisited) {
      if (dist[node] < minDist) {
        minDist = dist[node];
        curr = node;
      }
    }

    if (curr === null || minDist === Infinity) break;
    unvisited.delete(curr);

    for (const edge of graph[curr] || []) {
      if (unvisited.has(edge.to)) {
        const alt = dist[curr] + edge.cost;
        if (alt < dist[edge.to]) {
          dist[edge.to] = alt;
          prev[edge.to] = curr;
        }
      }
    }
  }

  return { dist, prev };
}

const start = 'A';
const { dist, prev } = dijkstra(start);

function getPath(target) {
  const path = [];
  let curr = target;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path.join(' ➔ ');
}

console.log(\`시작 노드: [\${start}]\`);
for (const [node, cost] of Object.entries(dist)) {
  console.log(\`  • 목적지 \${node}: 최단비용 \${cost} (경로: \${getPath(node)})\`);
}
`,
      'package.json': JSON.stringify(
        { name: 'js-dijkstra', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-07-sorting',
    title: '07. 퀵 정렬 & 병합 정렬 (Sorting Algorithms)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description:
      '분할 정복(Divide & Conquer)을 이용한 O(N log N) 퀵 정렬(QuickSort)과 병합 정렬(MergeSort)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['QuickSort', 'MergeSort', 'Sorting', 'Divide and Conquer'],
    files: {
      'index.js': `// ==========================================
// 🟨 [07] JavaScript: 퀵 정렬 & 병합 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Sorting] 분할 정복 기반 고속 정렬');
console.log('------------------------------------------');

// 1. QuickSort
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 2. MergeSort
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

const rawList = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7];
console.log('원본 배열:', rawList);
console.log('\\x1b[32m%s\\x1b[0m', '퀵 정렬 결과:', quickSort(rawList));
console.log('\\x1b[32m%s\\x1b[0m', '병합 정렬 결과:', mergeSort(rawList));
`,
      'package.json': JSON.stringify(
        { name: 'js-sorting', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-08-backtracking',
    title: '08. 백트래킹 (Backtracking - N-Queens 체스)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '상태 공간 트리를 탐색하며 조건 불만족 시 되돌아가는 백트래킹(N-Queens)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Backtracking', 'N-Queens', 'Recursion', 'Chess'],
    files: {
      'index.js': `// ==========================================
// 🟨 [08] JavaScript: 백트래킹 (N-Queens)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Backtracking] N-Queens 체스판 배치');
console.log('------------------------------------------');

function solveNQueens(N) {
  const solutions = [];
  const board = Array(N).fill(-1);

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(row - r) === Math.abs(col - c)) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row) {
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
const results = solveNQueens(N);
console.log(\`\${N}x\${N} 체스판의 유효한 퀸 배치 해답: \${results.length}가지\\n\`);

results.forEach((sol, idx) => {
  console.log(\`[해답 #\${idx + 1}]\`);
  for (let r = 0; r < N; r++) {
    let line = '  ';
    for (let c = 0; c < N; c++) {
      line += (sol[r] === c) ? ' 👑' : ' ⬜';
    }
    console.log(line);
  }
  console.log('');
});
`,
      'package.json': JSON.stringify(
        { name: 'js-backtracking', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우 (Two Pointers)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '정렬 배열의 두 수의 합(Two Sum) 및 연속 부분 배열 최대 합 O(N) 선형 탐색',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)', 'Two Sum'],
    files: {
      'index.js': `// ==========================================
// 🟨 [09] JavaScript: 투 포인터 & 슬라이딩 윈도우
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Two Pointers & Window] O(N) 탐색');
console.log('------------------------------------------');

// 1. Two Pointers (Two Sum)
function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  const pairs = [];

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

const numbers = [1, 2, 3, 4, 6, 8, 9, 11, 15];
const targetSum = 12;
console.log('[1] 투 포인터 (Target Sum: 12):');
console.log('  일치하는 쌍:', twoSumSorted(numbers, targetSum).map(([a, b]) => \`(\${a}+\${b})\`).join(', '));

// 2. Sliding Window
function maxSubarraySum(arr, k) {
  let cur = 0;
  for (let i = 0; i < k; i++) cur += arr[i];
  let max = cur;
  let start = 0;

  for (let i = k; i < arr.length; i++) {
    cur = cur - arr[i - k] + arr[i];
    if (cur > max) {
      max = cur;
      start = i - k + 1;
    }
  }
  return { max, slice: arr.slice(start, start + k) };
}

const sales = [2, 1, 5, 1, 3, 2, 8, 9, 1, 4];
const K = 3;
const { max, slice } = maxSubarraySum(sales, K);
console.log(\`\\n[2] 슬라이딩 윈도우 (윈도우 크기: \${K}):\`);
console.log('\\x1b[32m%s\\x1b[0m', \`  ✨ 연속 \${K}일 최대 매출: \${max} (구간: [ \${slice.join(', ')} ])\`);
`,
      'package.json': JSON.stringify(
        { name: 'js-two-pointers', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '종료 시간이 빠른 순서대로 선택하는 활동 선택 문제(Activity Selection)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Greedy', 'Activity Selection', 'Scheduling', 'Sorting'],
    files: {
      'index.js': `// ==========================================
// 🟨 [10] JavaScript: 그리디 (회의실 배정)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Greedy] 회의실 배정 (Activity Selection)');
console.log('------------------------------------------');

const meetings = [
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

function scheduleMaxMeetings(meetingList) {
  // 그리디 핵심 기준: 종료 시간(end) 오름차순 정렬
  const sorted = [...meetingList].sort((a, b) => (a.end === b.end ? a.start - b.start : a.end - b.end));

  const selected = [];
  let lastEnd = 0;

  for (const m of sorted) {
    if (m.start >= lastEnd) {
      selected.push(m);
      lastEnd = m.end;
    }
  }
  return selected;
}

const scheduled = scheduleMaxMeetings(meetings);
console.log(\`신청된 총 회의 수: \${meetings.length}개\`);
console.log('\\x1b[32m%s\\x1b[0m', \`✨ 배정 가능한 최대 회의 수: \${scheduled.length}개\`);
scheduled.forEach(m => console.log(\`  ➜ \${m.id}: \${m.start}시 ~ \${m.end}시 (\${m.end - m.start}시간)\`));
`,
      'package.json': JSON.stringify(
        { name: 'js-greedy', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
];
