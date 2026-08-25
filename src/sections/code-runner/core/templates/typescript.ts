import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const TYPESCRIPT_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 기초 및 문법 10선] ---
  {
    id: 'ts-01-hello-world',
    title: '01. Hello World & 정적 타입 시스템',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: 'TypeScript 기본 원시 타입, Interface, 컴파일 타임 검증',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Hello World', 'Interface', 'Static Typing'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [01] TypeScript: Hello World & 타입 선언
// ==========================================

interface DeveloperProfile {
  name: string;
  role: 'Frontend' | 'Backend' | 'Fullstack';
  level: number;
  skills: readonly string[];
}

const dev: DeveloperProfile = {
  name: '홍길동',
  role: 'Fullstack',
  level: 5,
  skills: ['TypeScript', 'Next.js', 'WebContainer', 'Node.js'],
};

console.log('\\x1b[36m%s\\x1b[0m', '✨ Hello, TypeScript with tsx Execution!');
console.log('------------------------------------------');
console.log(\`개발자: \${dev.name} [Lv.\${dev.level}]\`);
console.log(\`담당 직무: \${dev.role}\`);
console.log(\`보유 기술 스택: \${dev.skills.join(', ')}\`);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-hello-world',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-02-interfaces-types',
    title: '02. Interface vs Type Alias & 확장',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '인터페이스 상속(extends), 교차 타입(Intersection &), 인덱스 시그니처',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Interface', 'Type Alias', 'Intersection'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [02] TypeScript: Interface vs Type Alias
// ==========================================

interface BaseEntity {
  readonly id: string;
  createdAt: Date;
}

interface User extends BaseEntity {
  email: string;
  username: string;
}

type WithPermissions = {
  roles: ('admin' | 'editor' | 'viewer')[];
  hasPermission: (permission: string) => boolean;
};

type AdminUser = User & WithPermissions;

const admin: AdminUser = {
  id: 'usr_9981',
  email: 'admin@system.io',
  username: 'super_admin',
  createdAt: new Date(),
  roles: ['admin', 'editor'],
  hasPermission(perm) {
    return this.roles.includes('admin') || perm === 'read';
  },
};

console.log('\\x1b[36m%s\\x1b[0m', '🛡️ [관리자 권한 검증 시스템]');
console.log(\`유저: \${admin.username} (\${admin.email})\`);
console.log('delete 권한 여부:', admin.hasPermission('delete'));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-interfaces',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-03-discriminated-unions',
    title: '03. 판별 유니온 (Discriminated Union)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '공통 태그(type/status)를 활용한 완전한 패턴 매칭 및 Narrowing',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Discriminated Union', 'Narrowing', 'Pattern Matching'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [03] TypeScript: 판별 유니온 (상태 머신)
// ==========================================

type NetworkState =
  | { status: 'idle' }
  | { status: 'loading'; progress: number }
  | { status: 'success'; data: { items: string[] }; timestamp: number }
  | { status: 'error'; error: Error; retryCount: number };

function renderState(state: NetworkState): string {
  switch (state.status) {
    case 'idle':
      return '대기 상태: 작업 준비 완료';
    case 'loading':
      return \`로딩 중... 진행률: \${state.progress}%\`;
    case 'success':
      return \`성공! 아이템 \${state.data.items.length}개 로드됨 (수신시각: \${state.timestamp})\`;
    case 'error':
      return \`오류 발생: \${state.error.message} (재시도: \${state.retryCount}회)\`;
  }
}

console.log(renderState({ status: 'loading', progress: 65 }));
console.log(renderState({ status: 'success', data: { items: ['A', 'B', 'C'] }, timestamp: Date.now() }));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-unions',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-04-generics',
    title: '04. 제네릭 (Generics) & 제약조건',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 매개변수 <T>, extends 제약조건, 제네릭 유틸리티 함수 구현',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Generics', 'Constraints', 'Type Parameters'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [04] TypeScript: 제네릭 (Generics)
// ==========================================

interface HasId {
  id: string | number;
}

class Repository<T extends HasId> {
  private items: Map<string | number, T> = new Map();

  save(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string | number): T | undefined {
    return this.items.get(id);
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }
}

interface Product {
  id: number;
  title: string;
  price: number;
}

const productRepo = new Repository<Product>();
productRepo.save({ id: 1, title: '기계식 키보드', price: 149000 });
productRepo.save({ id: 2, title: '4K 모니터', price: 580000 });

console.table(productRepo.getAll());
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-generics',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-05-enums-as-const',
    title: '05. Enum vs as const 객체 리터럴',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: 'TypeScript 숫자/문자열 Enum과 현대적인 `as const` 패턴 비교',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Enum', 'as const', 'Type Safety'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [05] TypeScript: as const 객체 패턴
// ==========================================

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

function handleResponse(status: HttpStatus) {
  if (status === HTTP_STATUS.OK || status === HTTP_STATUS.CREATED) {
    return '요청이 성공적으로 처리되었습니다.';
  }
  return '클라이언트 또는 서버 오류가 발생했습니다.';
}

console.log('Status 200 처리 결과:', handleResponse(HTTP_STATUS.OK));
console.log('Status 404 처리 결과:', handleResponse(404));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-const',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-06-oop-accessors',
    title: '06. 객체 지향 (접근 제어자 & 추상 클래스)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: 'public/private/protected, readonly, abstract 클래스 및 인터페이스 구현',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'OOP', 'Abstract Class', 'Access Modifiers'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [06] TypeScript: 추상 클래스와 접근 제어자
// ==========================================

abstract class PaymentProcessor {
  constructor(protected readonly apiKey: string) {}

  abstract processPayment(amount: number): Promise<boolean>;

  protected logTransaction(type: string, amount: number) {
    console.log(\`[\${type}] \${amount.toLocaleString()}원 결제 기록 완료\`);
  }
}

class StripeProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    this.logTransaction('Stripe-Card', amount);
    return true;
  }
}

class KakaoPayProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    this.logTransaction('KakaoPay-Simple', amount);
    return true;
  }
}

async function main() {
  const kakao = new KakaoPayProcessor('kko_sec_9912');
  await kakao.processPayment(75000);
}
main();
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-oop',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-07-type-guards',
    title: '07. 커스텀 타입 가드 (Type Predicates)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '사용자 정의 타입 가드(`arg is Type`), in 연산자, unknown 타입 정제',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Type Guard', 'Type Predicate', 'unknown'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [07] TypeScript: 커스텀 타입 가드 (is)
// ==========================================

interface Cat {
  name: string;
  meow: () => void;
}

interface Dog {
  name: string;
  bark: () => void;
}

type Animal = Cat | Dog;

// Custom Type Guard
function isCat(animal: Animal): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function interact(animal: Animal) {
  if (isCat(animal)) {
    console.log(\`🐱 \${animal.name}이(가) 야옹합니다.\`);
    animal.meow();
  } else {
    console.log(\`🐶 \${animal.name}이(가) 멍멍 짖습니다.\`);
    animal.bark();
  }
}

const nabi: Cat = { name: '나비', meow: () => console.log('  "야옹~"') };
const baduk: Dog = { name: '바둑이', bark: () => console.log('  "멍멍!"') };

interact(nabi);
interact(baduk);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-guards',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-08-utility-types',
    title: '08. 고급 유틸리티 타입 (Utility Types)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: 'Partial, Required, Pick, Omit, Record, ReturnType 등 내장 유틸리티 타입',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Utility Types', 'Pick', 'Omit', 'Partial'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [08] TypeScript: 유틸리티 타입 활용
// ==========================================

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
}

type ArticlePreview = Pick<Article, 'id' | 'title' | 'author' | 'viewCount'>;
type ArticleCreateInput = Omit<Article, 'id' | 'viewCount'>;
type ArticleUpdateInput = Partial<ArticleCreateInput>;

const newPost: ArticleCreateInput = {
  title: 'Next.js 15 & WebContainer 혁신',
  content: '브라우저 안에서 모든 Node 프로세스가 실행됩니다.',
  author: 'Gemini',
  tags: ['Next.js', 'WASM'],
  isPublished: true,
};

console.log('생성용 입력 DTO:');
console.log(newPost);
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-utility',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-09-async-pipeline',
    title: '09. 타입 안전한 비동기 데이터 파이프라인',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '제네릭 Result<T, E> 패턴을 활용한 에러 안전 비동기 파이프라인',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Async', 'Result Pattern', 'Error Handling'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [09] TypeScript: Result<T, E> 함수형 에러 핸들링
// ==========================================

type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

async function fetchUserData(userId: number): Promise<Result<{ id: number; name: string }>> {
  if (userId <= 0) {
    return { success: false, error: new Error('유효하지 않은 사용자 ID입니다.') };
  }
  return { success: true, value: { id: userId, name: \`User_\${userId}\` } };
}

async function main() {
  const result1 = await fetchUserData(42);
  if (result1.success) {
    console.log('조회 성공:', result1.value.name);
  }

  const result2 = await fetchUserData(-1);
  if (!result2.success) {
    console.log('\\x1b[31m조회 실패:\\x1b[0m', result2.error.message);
  }
}
main();
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-pipeline',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-10-priority-queue',
    title: '10. 제네릭 우선순위 큐 (Priority Queue)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '최소 힙(Min-Heap) 기반 제네릭 우선순위 큐 자료구조 구현',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Data Structures', 'Heap', 'Priority Queue'],
    files: {
      'index.ts': `// ==========================================
// 🔷 [10] TypeScript: 제네릭 Min-Heap 우선순위 큐
// ==========================================

class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
        [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
        idx = parentIdx;
      } else break;
    }
  }

  private bubbleDown(idx: number): void {
    const len = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < len && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < len && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;

      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else break;
    }
  }

  size(): number { return this.heap.length; }
}

interface Task { name: string; priority: number; }
const pq = new PriorityQueue<Task>((a, b) => a.priority - b.priority);

pq.push({ name: '버그 픽스', priority: 1 });
pq.push({ name: '문서 작성', priority: 4 });
pq.push({ name: '보안 패치', priority: 0 });
pq.push({ name: '리팩토링', priority: 2 });

console.log('우선순위 순서대로 작업 꺼내기:');
while (pq.size() > 0) {
  const task = pq.pop()!;
  console.log(\`  ➜ [우선순위 \${task.priority}] \${task.name}\`);
}
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-pq',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'ts-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 제네릭 그래프)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '제네릭 인접 리스트 인터페이스를 활용한 타입 안전한 DFS 탐색 및 연결 요소 산출',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['DFS', 'Graph', 'Generics', 'Connected Components'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [11] TypeScript Algorithm: 깊이 우선 탐색 (DFS)
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
          name: 'ts-algo-dfs',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 기반 큐와 튜플 좌표계를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['BFS', 'Queue', 'Shortest Path', 'Tuple'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [12] TypeScript Algorithm: 너비 우선 탐색 (BFS)
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
          name: 'ts-algo-bfs',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (0/1 Knapsack)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 명시적 객체 모델을 활용한 0/1 Knapsack 배낭 DP 최적화',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Optimization'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [13] TypeScript Algorithm: 다이나믹 프로그래밍 (배낭)
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
          name: 'ts-algo-dp',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '제네릭 비교자 기반 이진 탐색 및 최적화 결정 문제를 푸는 파라메트릭 서치',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Binary Search', 'Parametric Search', 'Generics'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [14] TypeScript Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Binary Search] 이진 탐색 알고리즘');
console.log('------------------------------------------');

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

// Parametric Search
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
          name: 'ts-algo-binary-search',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '엄격한 타입 인터페이스 기반 다익스트라 최단 경로 및 가중치 경로 탐색',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Dijkstra', 'Graph', 'Shortest Path', 'Strict Types'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [15] TypeScript Algorithm: 다익스트라 최단 경로
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

const { dist } = dijkstra(graph, 'A');
console.log('출발지 [A] 기준 최단 거리:');
for (const [dest, cost] of Object.entries(dist)) {
  console.log(\`  • [\${dest}] 최단 비용: \${cost}\`);
}
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-algo-dijkstra',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 & 병합 정렬 (Generic Sorting)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 매개변수 T를 지원하는 제네릭 퀵 정렬 및 병합 정렬',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['QuickSort', 'MergeSort', 'Generics', 'Divide and Conquer'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [16] TypeScript Algorithm: 제네릭 퀵 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Sorting] 타입 안전한 정렬 알고리즘');
console.log('------------------------------------------');

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
          name: 'ts-algo-sorting',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '유망성(Promising) 조건 검사를 통한 N-Queens 체스판 배치 백트래킹',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Backtracking', 'N-Queens', 'Recursion'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [17] TypeScript Algorithm: 백트래킹 (N-Queens)
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
          name: 'ts-algo-backtracking',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 튜플 기반 Two Sum 탐색 및 고정 길이 슬라이딩 윈도우 최대 합 O(N)',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [18] TypeScript Algorithm: 투 포인터
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Two Pointers] O(N) 고속 선형 탐색');
console.log('------------------------------------------');

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
          name: 'ts-algo-two-pointers',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '인터페이스 모델링 기반 회의실 최대 배정(Activity Selection)',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Greedy', 'Activity Selection', 'Scheduling'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [19] TypeScript Algorithm: 그리디 (회의실 배정)
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
          name: 'ts-algo-greedy',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ts-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입 제네릭 Trie 접두사 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['Trie', 'Topological Sort', 'DAG', 'Generics'],
    files: {
      'index.ts': `// ==========================================
// 🧠 [20] TypeScript Algorithm: 트라이 & 위상 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [1] TypeScript Trie 접두사 검색');

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  root: TrieNode = new TrieNode();

  insert(word: string): void {
    let curr = this.root;
    for (const char of word) {
      if (!curr.children.has(char)) {
        curr.children.set(char, new TrieNode());
      }
      curr = curr.children.get(char)!;
    }
    curr.isEnd = true;
  }

  autocomplete(prefix: string): string[] {
    let curr = this.root;
    for (const char of prefix) {
      if (!curr.children.has(char)) return [];
      curr = curr.children.get(char)!;
    }
    const results: string[] = [];
    const dfs = (node: TrieNode, word: string) => {
      if (node.isEnd) results.push(word);
      for (const [ch, nxt] of node.children.entries()) {
        dfs(nxt, word + ch);
      }
    };
    dfs(curr, prefix);
    return results;
  }
}

const trie = new Trie();
['apple', 'app', 'application', 'apply', 'aptitude', 'banana'].forEach(w => trie.insert(w));
console.log('  🔍 "app" 자동완성:', trie.autocomplete('app'));

console.log('\\n\\x1b[36m%s\\x1b[0m', '⚡ [2] 위상 정렬 (Topological Sort)');
interface Dependency { from: string; to: string; }
const tasks = ['Lint', 'Compile', 'Test', 'Bundle', 'Deploy'];
const deps: Dependency[] = [
  { from: 'Lint', to: 'Compile' },
  { from: 'Compile', to: 'Test' },
  { from: 'Compile', to: 'Bundle' },
  { from: 'Test', to: 'Deploy' },
  { from: 'Bundle', to: 'Deploy' },
];

function topologicalSort(taskList: string[], dependencies: Dependency[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  taskList.forEach(t => { inDegree[t] = 0; adj[t] = []; });
  dependencies.forEach(d => { adj[d.from].push(d.to); inDegree[d.to]++; });

  const queue = taskList.filter(t => inDegree[t] === 0);
  const order: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);
    for (const nxt of adj[cur]) {
      if (--inDegree[nxt] === 0) queue.push(nxt);
    }
  }
  return order;
}

console.log('  ✨ 안전한 빌드 실행 순서:', topologicalSort(tasks, deps).join(' ➔ '));
`,
      'package.json': JSON.stringify(
        {
          name: 'ts-algo-trie-topo',
          type: 'module',
          dependencies: { tsx: '^4.19.0', typescript: '^5.5.0' },
        },
        null,
        2
      ),
    },
  },
];
