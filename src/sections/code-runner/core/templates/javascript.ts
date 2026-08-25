import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const JAVASCRIPT_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 기초 및 문법 10선] ---
  {
    id: 'js-01-hello-world',
    title: '01. Hello World & 표준 입출력',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'JavaScript Node.js 표준 출력(console.log, console.table) 및 런타임 정보',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Hello World', 'Console', 'I/O'],
    files: {
      'index.js': `// ==========================================
// 🟨 [01] JavaScript: Hello World & 기본 입출력
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
console.log('  ➜', greeting('영희', 'Fullstack Specialist'));
`,
      'package.json': JSON.stringify(
        { name: 'js-hello-world', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-02-variables-types',
    title: '02. 변수, 자료형 & 템플릿 리터럴',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'let/const 스코프, 원시타입(Primitive)과 참조타입(Reference), 구조 분해 할당',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Variables', 'Destructuring', 'Types'],
    files: {
      'index.js': `// ==========================================
// 🟨 [02] JavaScript: 변수와 자료형 & 구조 분해
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '📦 [변수 & 타입 시스템]');

const user = {
  id: 101,
  name: '김민수',
  tags: ['React', 'Node.js', 'TypeScript'],
  address: { city: '서울', district: '강남구' },
};

// 객체 및 배열 구조 분해 할당
const { name, tags: [firstTag, ...restTags], address: { city } } = user;

console.log(\`사용자: \${name} (거주지: \${city})\`);
console.log(\`주요 기술: \${firstTag}, 기타 기술: \${restTags.join(', ')}\`);

// Optional Chaining & Nullish Coalescing
const zipCode = user.address?.zipCode ?? '우편번호 미등록';
console.log(\`우편번호 상태: \${zipCode}\`);
`,
      'package.json': JSON.stringify(
        { name: 'js-variables', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-03-control-flow',
    title: '03. 조건문, 반복문 & FizzBuzz',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'if-else, switch-case, for-of/for-in 루프 및 고전 FizzBuzz 문제',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Control Flow', 'Loops', 'FizzBuzz'],
    files: {
      'index.js': `// ==========================================
// 🟨 [03] JavaScript: 조건문과 반복문 (FizzBuzz)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '🔄 [1부터 20까지 FizzBuzz 연산]');

const results = [];

for (let i = 1; i <= 20; i++) {
  let label = '';
  if (i % 15 === 0) label = 'FizzBuzz (3 & 5 배수)';
  else if (i % 3 === 0) label = 'Fizz (3 배수)';
  else if (i % 5 === 0) label = 'Buzz (5 배수)';
  else label = String(i);

  results.push({ number: i, output: label });
}

console.table(results.slice(0, 15));
`,
      'package.json': JSON.stringify(
        { name: 'js-control-flow', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-04-functions-closures',
    title: '04. 함수, 고차함수 & 클로저(Closure)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '화살표 함수, 팩토리 함수 패턴, 스코프 은닉을 위한 클로저 구현',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Functions', 'Closure', 'Higher-Order'],
    files: {
      'index.js': `// ==========================================
// 🟨 [04] JavaScript: 클로저(Closure) 상태 은닉
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '🔒 [클로저 기반 은닉 카운터 팩토리]');

function createCounter(initialValue = 0, step = 1) {
  let count = initialValue; // 은닉된 상태값

  return {
    increment: () => { count += step; return count; },
    decrement: () => { count -= step; return count; },
    getValue: () => count,
  };
}

const counterA = createCounter(10, 5);
const counterB = createCounter(100, 10);

console.log('Counter A (+5):', counterA.increment(), counterA.increment());
console.log('Counter B (-10):', counterB.decrement(), counterB.decrement());
console.log('Counter A 최종:', counterA.getValue());
`,
      'package.json': JSON.stringify(
        { name: 'js-closures', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-05-array-methods',
    title: '05. 배열 파이프라인 (map, filter, reduce)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '함수형 배열 조작: 체이닝, 집계, 중복 제거, 정렬',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Array', 'Functional', 'reduce'],
    files: {
      'index.js': `// ==========================================
// 🟨 [05] JavaScript: 함수형 배열 파이프라인
// ==========================================

const products = [
  { id: 1, name: '노트북', category: '전자기기', price: 1500000, inStock: true },
  { id: 2, name: '키보드', category: '전자기기', price: 120000, inStock: true },
  { id: 3, name: '마우스패드', category: '사무용품', price: 15000, inStock: false },
  { id: 4, name: '모니터', category: '전자기기', price: 450000, inStock: true },
  { id: 5, name: '커피머신', category: '생활가전', price: 280000, inStock: true },
];

console.log('\\x1b[36m%s\\x1b[0m', '📊 [재고 보유 전자기기 10% 할인 분석]');

const filtered = products
  .filter((p) => p.inStock && p.category === '전자기기')
  .map((p) => ({
    ...p,
    discountedPrice: p.price * 0.9,
  }));

console.table(filtered);

const totalPrice = filtered.reduce((acc, cur) => acc + cur.discountedPrice, 0);
console.log(\`\\n총 할인 구매 예상액: \${totalPrice.toLocaleString('ko-KR')}원\`);
`,
      'package.json': JSON.stringify(
        { name: 'js-arrays', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-06-oop-classes',
    title: '06. 객체 지향 (ES6 Class & 상속)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '클래스 문법, static 메서드, private(#) 필드, 상속(extends/super)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'OOP', 'Class', 'Inheritance'],
    files: {
      'index.js': `// ==========================================
// 🟨 [06] JavaScript: 객체 지향 프로그래밍 (OOP)
// ==========================================

class BankAccount {
  #balance = 0; // Private field

  constructor(owner, initialDeposit = 0) {
    this.owner = owner;
    this.#balance = initialDeposit;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('입금액은 0보다 커야 합니다.');
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('잔액이 부족합니다.');
    this.#balance -= amount;
    return this.#balance;
  }

  getBalance() {
    return this.#balance;
  }
}

class SavingsAccount extends BankAccount {
  constructor(owner, initial, interestRate = 0.03) {
    super(owner, initial);
    this.interestRate = interestRate;
  }

  applyInterest() {
    const interest = this.getBalance() * this.interestRate;
    this.deposit(interest);
    console.log(\`이자 \${interest.toLocaleString()}원 지급 완료\`);
  }
}

const account = new SavingsAccount('홍길동', 1000000, 0.05);
account.deposit(500000);
account.applyInterest();
console.log(\`\${account.owner}님의 최종 잔액: \${account.getBalance().toLocaleString()}원\`);
`,
      'package.json': JSON.stringify({ name: 'js-oop', type: 'module', version: '1.0.0' }, null, 2),
    },
  },
  {
    id: 'js-07-error-handling',
    title: '07. 예외 처리 & 커스텀 Error 클래스',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'try-catch-finally 블록, Custom Error 확장 및 안전한 에러 핸들링',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Error Handling', 'try-catch', 'Custom Error'],
    files: {
      'index.js': `// ==========================================
// 🟨 [07] JavaScript: 예외 처리와 커스텀 Error
// ==========================================

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function registerUser({ username, email, age }) {
  if (!username || username.length < 3) {
    throw new ValidationError('아이디는 3글자 이상이어야 합니다.', 'username');
  }
  if (!email || !email.includes('@')) {
    throw new ValidationError('유효한 이메일 주소를 입력하세요.', 'email');
  }
  if (age < 18) {
    throw new ValidationError('만 18세 이상만 가입 가능합니다.', 'age');
  }
  return { success: true, user: { username, email, age } };
}

try {
  console.log('1. 정상 유저 등록 테스트:');
  console.log(registerUser({ username: 'antigravity', email: 'dev@test.com', age: 25 }));

  console.log('\\n2. 에러 유발 테스트:');
  registerUser({ username: 'ai', email: 'invalid-email', age: 15 });
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(\`\\x1b[31m[검증 실패 (\${err.field})]: \${err.message}\\x1b[0m\`);
  } else {
    console.error('알 수 없는 오류:', err);
  }
} finally {
  console.log('\\n회원가입 프로세스 종료 (finally).');
}
`,
      'package.json': JSON.stringify(
        { name: 'js-errors', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-08-regex-json',
    title: '08. 정규식(RegExp) & JSON 직렬화',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '문자열 패턴 매칭, 이메일/전화번호 추출, JSON.stringify 서식화',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'RegExp', 'JSON', 'Regex'],
    files: {
      'index.js': `// ==========================================
// 🟨 [08] JavaScript: 정규표현식 & JSON 직렬화
// ==========================================

const logText = \`
2026-08-25 14:02:11 [INFO] user: alice@example.com logged in from 192.168.1.10
2026-08-25 14:05:44 [WARN] failed attempt: bob@service.co.kr from 10.0.0.55
2026-08-25 14:08:22 [ERROR] critical error for charlie@domain.org (code: 500)
\`;

console.log('\\x1b[36m%s\\x1b[0m', '🔍 [로그 데이터 정규식 파싱]');

const emailRegex = /([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/g;
const ipRegex = /\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/g;

const emails = logText.match(emailRegex) || [];
const ips = logText.match(ipRegex) || [];

const parsedReport = {
  totalLogs: logText.trim().split('\\n').length,
  extractedEmails: emails,
  extractedIps: ips,
  analyzedAt: new Date().toISOString(),
};

console.log(JSON.stringify(parsedReport, null, 2));
`,
      'package.json': JSON.stringify(
        { name: 'js-regex-json', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-09-async-promises',
    title: '09. 비동기 프로그래밍 (Promise & async/await)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'Promise.all, Promise.race, async/await 병렬 비동기 요청 처리',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Async', 'Promise', 'async/await'],
    files: {
      'index.js': `// ==========================================
// 🟨 [09] JavaScript: Promise & async/await 병렬 처리
// ==========================================

const fakeFetch = (endpoint, delay) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ endpoint, status: 200, data: \`Response from \${endpoint}\` });
    }, delay);
  });

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [비동기 API 병렬 호출 시작]');
const startTime = Date.now();

async function runAsyncPipeline() {
  console.log('1. Promise.all 병렬 호출...');
  const [users, posts, metrics] = await Promise.all([
    fakeFetch('/api/users', 300),
    fakeFetch('/api/posts', 500),
    fakeFetch('/api/metrics', 200),
  ]);

  console.log('  ➜ 수신 완료:', { users: users.endpoint, posts: posts.endpoint, metrics: metrics.endpoint });
  console.log(\`  ⏱ 총 소요 시간: \${Date.now() - startTime}ms (순차 실행 대비 2배 빠름)\`);
}

runAsyncPipeline();
`,
      'package.json': JSON.stringify(
        { name: 'js-async', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-10-lru-cache',
    title: '10. LRU 캐시 자료구조 (Map 기반)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'JavaScript Map의 삽입 순서 보장 특성을 활용한 O(1) LRU Cache',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['JavaScript', 'Data Structures', 'LRU Cache', 'Map'],
    files: {
      'index.js': `// ==========================================
// 🟨 [10] JavaScript: LRU (Least Recently Used) 캐시
// ==========================================

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(\`  🗑 용량 초과로 가장 오래된 키 삭제됨: "\${oldestKey}"\`);
    }
    this.cache.set(key, value);
  }

  dump() {
    return Array.from(this.cache.entries());
  }
}

const cache = new LRUCache(3);
console.log('용량 3인 LRU Cache 초기화');

cache.put('user:1', { name: 'Alice' });
cache.put('user:2', { name: 'Bob' });
cache.put('user:3', { name: 'Charlie' });
console.log('초기 캐시:', cache.dump());

console.log('\\nuser:1 접근 (최신 순서로 갱신):', cache.get('user:1'));
cache.put('user:4', { name: 'David' });
console.log('user:4 추가 후 캐시 상태:', cache.dump());
`,
      'package.json': JSON.stringify(
        { name: 'js-lru-cache', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'js-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
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
// 🧠 [11] JavaScript Algorithm: 깊이 우선 탐색 (DFS)
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [DFS] Depth-First Search 그래프 순회');
console.log('------------------------------------------');

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
      'package.json': JSON.stringify(
        { name: 'js-algo-dfs', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '큐(Queue)를 이용한 2D 미로 탈출 최단 거리 및 이동 경로 역추적',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['BFS', 'Queue', 'Shortest Path', 'Maze'],
    files: {
      'index.js': `// ==========================================
// 🧠 [12] JavaScript Algorithm: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [BFS] 2D 미로 최단 경로 탐색');
console.log('------------------------------------------');

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
  const queue = [[startX, startY, 1, [[startX, startY]]]];
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
      'package.json': JSON.stringify(
        { name: 'js-algo-bfs', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (0/1 배낭 문제)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '제한 용량 하에서 최대 가치를 얻는 0/1 Knapsack DP 테이블 최적화',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Optimization'],
    files: {
      'index.js': `// ==========================================
// 🧠 [13] JavaScript Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
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
      'package.json': JSON.stringify(
        { name: 'js-algo-dp', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'O(log N) 고속 탐색 및 조건 만족 최대 길이를 구하는 파라메트릭 서치(랜선 자르기)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Binary Search', 'Parametric Search', 'O(log N)'],
    files: {
      'index.js': `// ==========================================
// 🧠 [14] JavaScript Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Binary Search] O(log N) 이진 탐색');
console.log('------------------------------------------');

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

// 파라메트릭 서치
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
console.log('\\x1b[32m%s\\x1b[0m', \`  ✨ 만들 수 있는 최대 랜선 길이: \${maxLen}cm\`);
`,
      'package.json': JSON.stringify(
        { name: 'js-algo-binary-search', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '가중치 방향 그래프에서 단일 출발점 최단 거리 산출 및 경로 복원',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Dijkstra', 'Graph', 'Shortest Path', 'Greedy'],
    files: {
      'index.js': `// ==========================================
// 🧠 [15] JavaScript Algorithm: 다익스트라 최단 경로
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
        { name: 'js-algo-dijkstra', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 & 병합 정렬 (Sorting)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '분할 정복(Divide & Conquer)을 이용한 O(N log N) 퀵 정렬과 병합 정렬',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['QuickSort', 'MergeSort', 'Sorting', 'Divide and Conquer'],
    files: {
      'index.js': `// ==========================================
// 🧠 [16] JavaScript Algorithm: 퀵 정렬 & 병합 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Sorting] 분할 정복 기반 고속 정렬');
console.log('------------------------------------------');

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

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
        { name: 'js-algo-sorting', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스 퍼즐)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '상태 공간 트리를 탐색하며 조건 불만족 시 되돌아가는 백트래킹(N-Queens)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Backtracking', 'N-Queens', 'Recursion', 'Chess'],
    files: {
      'index.js': `// ==========================================
// 🧠 [17] JavaScript Algorithm: 백트래킹 (N-Queens)
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
        { name: 'js-algo-backtracking', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '정렬 배열의 두 수의 합(Two Sum) 및 연속 부분 배열 최대 합 O(N) 선형 탐색',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)', 'Two Sum'],
    files: {
      'index.js': `// ==========================================
// 🧠 [18] JavaScript Algorithm: 투 포인터 & 슬라이딩 윈도우
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [Two Pointers & Window] O(N) 탐색');
console.log('------------------------------------------');

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
        { name: 'js-algo-two-pointers', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '종료 시간이 빠른 순서대로 선택하는 활동 선택 문제(Activity Selection)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Greedy', 'Activity Selection', 'Scheduling', 'Sorting'],
    files: {
      'index.js': `// ==========================================
// 🧠 [19] JavaScript Algorithm: 그리디 (회의실 배정)
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
        { name: 'js-algo-greedy', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'js-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: '문자열 접두사 트리(Trie) 자동완성 및 DAG 기반 위상 정렬(Topological Sort)',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Trie', 'Topological Sort', 'DAG', 'Autocomplete'],
    files: {
      'index.js': `// ==========================================
// 🧠 [20] JavaScript Algorithm: 트라이 & 위상 정렬
// ==========================================

console.log('\\x1b[36m%s\\x1b[0m', '⚡ [1] 트라이 (Trie) 접두사 자동완성');

class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }
  autocomplete(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    const res = [];
    const dfs = (curr, w) => {
      if (curr.isEnd) res.push(w);
      for (const [c, next] of Object.entries(curr.children)) dfs(next, w + c);
    };
    dfs(node, prefix);
    return res;
  }
}

const trie = new Trie();
['apple', 'app', 'application', 'apply', 'aptitude', 'banana', 'band'].forEach(w => trie.insert(w));
console.log('  🔍 "app" 접두사 자동완성:', trie.autocomplete('app'));

console.log('\\n\\x1b[36m%s\\x1b[0m', '⚡ [2] 위상 정렬 (Topological Sort) 작업 순서');
const tasks = ['Lint', 'Compile', 'Test', 'Bundle', 'Deploy'];
const deps = [
  { from: 'Lint', to: 'Compile' },
  { from: 'Compile', to: 'Test' },
  { from: 'Compile', to: 'Bundle' },
  { from: 'Test', to: 'Deploy' },
  { from: 'Bundle', to: 'Deploy' },
];

function topologicalSort(tasks, deps) {
  const inDegree = {};
  const adj = {};
  tasks.forEach(t => { inDegree[t] = 0; adj[t] = []; });
  deps.forEach(d => { adj[d.from].push(d.to); inDegree[d.to]++; });

  const q = tasks.filter(t => inDegree[t] === 0);
  const order = [];
  while (q.length) {
    const cur = q.shift();
    order.push(cur);
    for (const nxt of adj[cur]) {
      if (--inDegree[nxt] === 0) q.push(nxt);
    }
  }
  return order;
}

console.log('  ✨ 실행 순환 의존성 해결 순서:', topologicalSort(tasks, deps).join(' ➔ '));
`,
      'package.json': JSON.stringify(
        { name: 'js-algo-trie-topo', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
];
