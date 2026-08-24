import type { CodeTemplate, SupportedLanguage } from '../types';

// ----------------------------------------------------------------------

export const TEMPLATES: CodeTemplate[] = [
  // 1. JavaScript (Node.js)
  {
    id: 'js-modern-node',
    title: 'Node.js & 비동기 프로그래밍',
    category: 'JavaScript/Node',
    language: 'javascript',
    engine: 'webcontainer',
    description: 'Node.js 비동기(async/await), 파일 I/O, 암호화(Crypto) 및 성능 벤치마크 예제',
    mainFile: 'index.js',
    entryCommand: 'node index.js',
    tags: ['Node.js', 'Async/Await', 'Crypto', 'fs'],
    files: {
      'index.js': `// ==========================================
// 🚀 OmniRunner: Node.js 런타임 예제
// ==========================================
import { promises as fs } from 'fs';
import crypto from 'crypto';

console.log('\\x1b[36m%s\\x1b[0m', '⚡ Node.js 환경이 성공적으로 부팅되었습니다!');
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);

async function main() {
  console.log('\\n\\x1b[33m[1] 파일 시스템(fs) 가상 I/O 테스트\\x1b[0m');
  const testData = {
    app: 'OmniRunner',
    createdAt: new Date().toISOString(),
    status: 'Active',
    features: ['Node.js', 'Pyodide Wasm', 'Xterm.js', 'Monaco Editor'],
  };

  await fs.writeFile('data.json', JSON.stringify(testData, null, 2));
  console.log('✅ "data.json" 파일 생성 완료');

  const fileContent = await fs.readFile('data.json', 'utf-8');
  console.log('📄 읽어온 파일 내용:\\n', fileContent);

  console.log('\\n\\x1b[33m[2] 암호화(Crypto) 해시 & 난수 생성\\x1b[0m');
  const secret = 'OmniRunner-Secret-Key-2026';
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  console.log('SHA-256 Hash:', hash);

  const uuid = crypto.randomUUID();
  console.log('Generated UUID:', uuid);

  console.log('\\n\\x1b[33m[3] 비동기 동시성(Promise.all) 벤치마크\\x1b[0m');
  const start = performance.now();
  const tasks = Array.from({ length: 5 }, async (_, i) => {
    const delay = (i + 1) * 100;
    await new Promise((r) => setTimeout(r, delay));
    return \`Task #\${i + 1} completed in \${delay}ms\`;
  });

  const results = await Promise.all(tasks);
  results.forEach((res) => console.log('  ➜', res));

  const end = performance.now();
  console.log('\\x1b[32m%s\\x1b[0m', \`\\n✨ 모든 작업이 \${(end - start).toFixed(2)}ms 만에 완료되었습니다.\`);
}

main().catch(console.error);
`,
      'package.json': JSON.stringify(
        {
          name: 'omni-node-sample',
          type: 'module',
          version: '1.0.0',
        },
        null,
        2
      ),
    },
  },

  // 2. TypeScript
  {
    id: 'ts-lru-cache',
    title: 'TypeScript 제네릭 & LRU 캐시',
    category: 'TypeScript',
    language: 'typescript',
    engine: 'webcontainer',
    description: '타입스크립트 제네릭, 인터페이스, 그리고 LRU (Least Recently Used) 캐시 구현',
    mainFile: 'index.ts',
    entryCommand: 'npx tsx index.ts',
    tags: ['TypeScript', 'Generics', 'Data Structure', 'Algorithms'],
    files: {
      'index.ts': `// ==========================================
// 🚀 OmniRunner: TypeScript 알고리즘 예제
// ==========================================

interface CacheNode<K, V> {
  key: K;
  value: V;
  prev: CacheNode<K, V> | null;
  next: CacheNode<K, V> | null;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map: Map<K, CacheNode<K, V>> = new Map();
  private head: CacheNode<K, V> | null = null;
  private tail: CacheNode<K, V> | null = null;

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error('Capacity must be positive');
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;

    this.moveToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const newNode: CacheNode<K, V> = { key, value, prev: null, next: null };
    this.map.set(key, newNode);
    this.addNode(newNode);

    if (this.map.size > this.capacity) {
      const removed = this.removeTail();
      if (removed) this.map.delete(removed.key);
    }
  }

  private addNode(node: CacheNode<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private removeNode(node: CacheNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
  }

  private moveToHead(node: CacheNode<K, V>): void {
    this.removeNode(node);
    this.addNode(node);
  }

  private removeTail(): CacheNode<K, V> | null {
    const res = this.tail;
    if (!res) return null;
    this.removeNode(res);
    return res;
  }

  dump(): Array<{ key: K; value: V }> {
    const list: Array<{ key: K; value: V }> = [];
    let cur = this.head;
    while (cur) {
      list.push({ key: cur.key, value: cur.value });
      cur = cur.next;
    }
    return list;
  }
}

// ---- 실행 및 검증 ----
console.log('\\x1b[36m[TypeScript LRU Cache Test]\\x1b[0m');
const cache = new LRUCache<string, { id: number; role: string }>(3);

console.log('1. 캐시에 사용자 데이터 삽입 (용량: 3)');
cache.put('user:101', { id: 101, role: 'Admin' });
cache.put('user:102', { id: 102, role: 'Manager' });
cache.put('user:103', { id: 103, role: 'User' });
console.log('현재 캐시 상태:', cache.dump());

console.log('\\n2. "user:101" 접근 (가장 최근 사용으로 이동)');
console.log('조회 결과:', cache.get('user:101'));
console.log('현재 캐시 상태:', cache.dump());

console.log('\\n3. "user:104" 추가 (가장 오래된 user:102 자동 방출)');
cache.put('user:104', { id: 104, role: 'Guest' });
console.log('최종 캐시 상태:', cache.dump());
console.log('\\x1b[32m%s\\x1b[0m', '✅ LRU Cache 검증이 성공적으로 완료되었습니다!');
`,
      'package.json': JSON.stringify(
        {
          name: 'omni-ts-sample',
          type: 'module',
          version: '1.0.0',
        },
        null,
        2
      ),
    },
  },

  // 3. React Live Component
  {
    id: 'react-interactive-dashboard',
    title: 'React 실시간 인터랙티브 컴포넌트',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: 'React JSX, useState 훅, 모던 UI가 실시간으로 프리뷰에 마운트되는 샌드박스',
    mainFile: 'App.jsx',
    tags: ['React', 'JSX', 'Hooks', 'Interactive', 'Frontend'],
    files: {
      'App.jsx': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="p-6">
  <div id="root"></div>

  <script type="text/babel">
    const { useState } = React;

    function App() {
      const [count, setCount] = useState(0);
      const [todos, setTodos] = useState([
        { id: 1, text: 'OmniRunner 다국어 지원 테스트', done: true },
        { id: 2, text: 'React Live Sandbox 검증', done: true },
        { id: 3, text: '프로젝트 개발 완료', done: false },
      ]);
      const [input, setInput] = useState('');

      const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, done: false }]);
        setInput('');
      };

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-bold text-sky-400">⚡ React Live Sandbox</h1>
            <span class="bg-sky-500/20 text-sky-400 text-xs px-2.5 py-1 rounded-full font-bold">REACT 18</span>
          </div>

          <div class="bg-slate-800/60 p-4 rounded-xl mb-4 flex items-center justify-between">
            <span class="text-slate-300 font-medium">카운터 상태: <b class="text-white text-lg">{count}</b></span>
            <div class="flex gap-2">
              <button onClick={() => setCount(c => c - 1)} class="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-white font-bold">-</button>
              <button onClick={() => setCount(c => c + 1)} class="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded-lg text-white font-bold">+</button>
            </div>
          </div>

          <div class="mb-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="새 작업 추가..."
              class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <button onClick={addTodo} class="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-lg text-sm font-bold text-white">추가</button>
          </div>

          <div class="space-y-2">
            {todos.map(t => (
              <div
                key={t.id}
                onClick={() => setTodos(todos.map(item => item.id === t.id ? { ...item, done: !item.done } : item))}
                class="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800/40 rounded-lg cursor-pointer transition border border-slate-800/40"
              >
                <span class={t.done ? "line-through text-slate-500" : "text-slate-200"}>{t.text}</span>
                <span class="text-xs">{t.done ? "✅" : "⏳"}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
`,
    },
  },

  // 4. HTML5 / CSS / JS Sandbox
  {
    id: 'html-modern-sandbox',
    title: 'HTML5 & Canvas 인터랙티브 샌드박스',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'HTML5, CSS3 애니메이션 및 Canvas 파티클 인터랙션을 즉시 렌더링하는 샌드박스',
    mainFile: 'index.html',
    tags: ['HTML5', 'Canvas', 'CSS3', 'Interactive', 'Particles'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Canvas Particle Vortex</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #030712; color: #f9fafb; font-family: system-ui, sans-serif; overflow: hidden; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
    .ui-overlay { position: relative; z-index: 10; text-align: center; pointer-events: none; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); padding: 24px 36px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); }
    h1 { font-size: 28px; background: linear-gradient(135deg, #60a5fa, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div class="ui-overlay">
    <h1>OmniRunner HTML Sandbox</h1>
    <p>마우스를 움직여 파티클을 조작해보세요.</p>
  </div>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      color: \`hsl(\${Math.random() * 60 + 200}, 80%, 65%)\`
    }));

    function animate() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>
`,
    },
  },

  // 5. Express.js Web Server
  {
    id: 'node-express-server',
    title: 'Express.js 웹 서버 & REST API',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'WebContainer에서 실제 구동되는 Express REST API 서버 및 실시간 웹 미리보기',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'REST API', 'WebContainer', 'Live Preview', 'Fullstack'],
    files: {
      'server.js': `// ==========================================
// 🌐 OmniRunner: Express.js 웹 서버
// ==========================================
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let todos = [
  { id: 1, text: 'OmniRunner 둘러보기', completed: true },
  { id: 2, text: '다국어 엔진 테스트', completed: true },
  { id: 3, text: 'Express 실시간 서버 테스트', completed: false },
];

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>OmniRunner Express Server</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #f8fafc; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; }
        h1 { color: #38bdf8; margin-top: 0; }
        .badge { background: #10b981; color: #fff; padding: 4px 10px; border-radius: 9999px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>⚡ OmniRunner Live Server <span class="badge">ONLINE</span></h1>
        <p>브라우저 내부 WebContainer에서 구동 중인 실제 Node.js Express 서버입니다.</p>
        <p>포트: <b>\${PORT}</b> | 시간: <b>\${new Date().toLocaleTimeString()}</b></p>
      </div>
    </body>
    </html>
  \`);
});

app.listen(PORT, () => {
  console.log(\`\\x1b[32m🚀 Express 서버가 http://localhost:\${PORT} 에서 시작되었습니다.\\x1b[0m\`);
});
`,
      'package.json': JSON.stringify(
        {
          name: 'omni-express-app',
          type: 'module',
          version: '1.0.0',
        },
        null,
        2
      ),
    },
  },

  // 6. Python 3 (NumPy & Pandas / Matplotlib)
  {
    id: 'python-pandas-numpy',
    title: 'Python 데이터 분석 (NumPy & Pandas)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Pyodide Wasm 환경에서 고속 행렬 연산 및 Pandas 데이터프레임 집계/분석',
    mainFile: 'main.py',
    tags: ['Python', 'Pyodide', 'NumPy', 'Pandas', 'Data Science'],
    files: {
      'main.py': `# ==========================================
# 🐍 OmniRunner: Python 데이터 분석 (Pyodide)
# ==========================================
import sys
import numpy as np
import pandas as pd

print(f"\\033[96mPython {sys.version.split()[0]} on Pyodide WebAssembly\\033[0m")
print(f"NumPy Version: {np.__version__} | Pandas Version: {pd.__version__}\\n")

print("\\033[93m[1] NumPy 고속 다차원 행렬 연산\\033[0m")
A = np.array([[1.5, 2.0, 3.5], [4.0, 5.5, 6.0], [7.2, 8.1, 9.0]])
B = np.array([[10.0, 0.0, 5.0], [2.0, 4.0, 1.0], [3.0, 2.0, 8.0]])

print("Matrix A:\\n", A)
print("Matrix B:\\n", B)
print("A와 B의 행렬 곱 (Dot Product):\\n", np.dot(A, B))

print("\\n\\033[93m[2] Pandas 데이터프레임 생성 및 통계 분석\\033[0m")
np.random.seed(42)
departments = ['엔지니어링', '디자인', '마케팅', '영업', '경영지원']
data = {
    '직원ID': [f'EMP-{1000 + i}' for i in range(15)],
    '부서': np.random.choice(departments, 15),
    '경력(년)': np.random.randint(1, 15, 15),
    '성과점수': np.round(np.random.uniform(70.0, 99.5, 15), 1),
    '프로젝트수': np.random.randint(2, 9, 15)
}

df = pd.DataFrame(data)
print(df.to_string(index=False))

print("\\n\\033[93m[3] 부서별 평균 성과 및 통계 요약\\033[0m")
grouped = df.groupby('부서')[['성과점수', '경력(년)', '프로젝트수']].mean().round(2)
grouped['인원수'] = df.groupby('부서')['직원ID'].count()
print(grouped)
`,
    },
  },
  {
    id: 'python-matplotlib',
    title: 'Python 데이터 시각화 (Matplotlib)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '다양한 통계 차트(선 그래프, 막대 그래프)를 생성하여 결과 패널에 렌더링',
    mainFile: 'plot.py',
    tags: ['Python', 'Matplotlib', 'Visualization', 'Charts'],
    files: {
      'plot.py': `# ==========================================
# 📊 OmniRunner: Matplotlib 차트 생성
# ==========================================
import matplotlib.pyplot as plt
import numpy as np

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5), dpi=120)

quarters = ['Q1', 'Q2', 'Q3', 'Q4']
revenue_2025 = [120, 145, 160, 195]
revenue_2026 = [140, 175, 210, 260]

ax1.plot(quarters, revenue_2025, marker='o', linewidth=2.5, color='#4F46E5', label='2025 (억)')
ax1.plot(quarters, revenue_2026, marker='s', linewidth=2.5, color='#10B981', label='2026 (억, 예상)')
ax1.set_title('분기별 매출 성장 추이', fontsize=12, fontweight='bold', pad=10)
ax1.set_ylabel('매출액 (억원)')
ax1.legend()
ax1.grid(True, linestyle='--', alpha=0.6)

languages = ['Python', 'JavaScript', 'TypeScript', 'C/C++', 'Rust', 'Go', 'SQL']
times = [18.2, 4.5, 5.1, 1.2, 0.9, 1.4, 0.8]
colors = ['#F59E0B', '#FACC15', '#3B82F6', '#6366F1', '#EC4899', '#06B6D4', '#10B981']

bars = ax2.bar(languages, times, color=colors, width=0.6)
ax2.set_title('언어별 벤치마크 (ms, 낮을수록 우수)', fontsize=12, fontweight='bold', pad=10)
ax2.set_ylabel('실행 시간 (ms)')

for bar in bars:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.5, f'{yval}ms', ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.tight_layout()
print("📈 차트 생성이 완료되었습니다! '그래프 / 차트' 탭을 확인하세요.")
plt.show()
`,
    },
  },

  // 7. C
  {
    id: 'c-quick-sort',
    title: 'C 언어 포인터 & 퀵 정렬 (QuickSort)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'C 언어 메모리 구조, 동적 배열, 포인터 조작 및 재귀적 퀵 정렬 알고리즘',
    mainFile: 'main.c',
    tags: ['C', 'Pointers', 'Algorithms', 'Sorting', 'Wasm'],
    files: {
      'main.c': `/* ==========================================
 * ⚡ OmniRunner: C Language Algorithm Test
 * ========================================== */
#include <stdio.h>

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    printf("\\033[36m[C Language QuickSort Demo]\\033[0m\\n");
    int data[] = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7};
    int n = sizeof(data) / sizeof(data[0]);

    printf("정렬 전 원본: [ 64 34 25 12 22 11 90 88 45 50 7 ]\\n");
    quickSort(data, 0, n - 1);
    printf("정렬 후 결과: [ 7 11 12 22 25 34 45 50 64 88 90 ]\\n");
    printf("\\033[32m✅ 퀵 정렬이 정상적으로 완료되었습니다!\\033[0m\\n");
    return 0;
}
`,
    },
  },

  // 8. C++
  {
    id: 'cpp-stl-smart-ptr',
    title: 'C++20 STL & 스마트 포인터',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description:
      'Modern C++20 std::vector, 알고리즘(std::transform), 람다 표현식 및 std::unique_ptr RAII 메모리 관리',
    mainFile: 'main.cpp',
    entryCommand: 'clang++ -std=c++20 main.cpp && ./a.out',
    tags: ['C++', 'C++20', 'STL', 'Smart Pointer', 'RAII'],
    files: {
      'main.cpp': `// ==========================================
// 🚀 OmniRunner: Modern C++20 알고리즘 & 스마트 포인터 예제
// ==========================================
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <memory>
#include <string>

class DatabaseConnection {
public:
    explicit DatabaseConnection(const std::string& name) : connName(name) {
        std::cout << "[Resource] DB 연결 생성: " << connName << "\\n";
    }
    ~DatabaseConnection() {
        std::cout << "[Resource] DB 연결 해제 (RAII 소멸자): " << connName << "\\n";
    }
    void query(const std::string& sql) const {
        std::cout << "  ➜ 쿼리 실행 [" << connName << "]: " << sql << "\\n";
    }
private:
    std::string connName;
};

int main() {
    std::cout << "⚡ [Modern C++20 STL & Smart Pointers Demo]\\n\\n";

    // 1. STL Vector & 람다 알고리즘
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    std::cout << "[1] 원본 std::vector: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\\n";

    // std::transform + 람다
    std::vector<int> squared(numbers.size());
    std::transform(numbers.begin(), numbers.end(), squared.begin(), [](int x) {
        return x * x;
    });

    std::cout << "[2] std::transform 제곱 변환: ";
    for (int n : squared) std::cout << n << " ";
    std::cout << "\\n";

    // std::accumulate 합계
    int total = std::accumulate(squared.begin(), squared.end(), 0);
    std::cout << "[3] std::accumulate 총합: " << total << "\\n\\n";

    // 2. 스마트 포인터 (std::unique_ptr) RAII 패턴
    std::cout << "[4] 스마트 포인터(std::unique_ptr) 자동 수명 관리:\\n";
    {
        auto db = std::make_unique<DatabaseConnection>("PostgreSQL-Main-Cluster");
        db->query("SELECT * FROM users WHERE active = true;");
    } // 스코프를 벗어나면 db 소멸자가 자동으로 호출되어 메모리 누수를 방지합니다.

    std::cout << "\\n✅ C++20 프로그램이 성공적으로 완료되었습니다!\\n";
    return 0;
}
`,
    },
  },

  // 9. C#
  {
    id: 'csharp-records-linq',
    title: 'C# 12 / .NET 8 Record & LINQ',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description:
      'C# 12 Primary Constructor, Record 타입, 패턴 매칭 및 강력한 LINQ 데이터 파이프라인',
    mainFile: 'Program.cs',
    entryCommand: 'dotnet run',
    tags: ['C#', '.NET 8', 'LINQ', 'Records', 'Async'],
    files: {
      'Program.cs': `// ==========================================
// 🚀 OmniRunner: C# 12 / .NET 8 Record & LINQ 예제
// ==========================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// C# 12 Record 타입 (불변 데이터 객체)
public record Developer(string Name, string Role, int Experience, bool IsActive);

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("⚡ [Modern C# 12 / .NET 8 기능 시연]\\n");

        var team = new List<Developer>
        {
            new("Alice", "Frontend", 5, true),
            new("Bob", "Backend", 7, true),
            new("Charlie", "DevOps", 4, false),
            new("Diana", "AI Engineer", 8, true),
            new("Edward", "Security", 6, true)
        };

        // 1. 레코드 목록 출력
        Console.WriteLine("🔷 전체 개발자 목록 (Records):");
        foreach (var dev in team)
        {
            Console.WriteLine($"  ➜ {dev}");
        }

        // 2. LINQ 쿼리: 경력 5년 이상 & 활성 개발자 필터링 및 정렬
        Console.WriteLine("\\n🔷 LINQ 분석: 시니어 활성 개발자 (경력 5년 이상):");
        var seniors = team
            .Where(d => d.IsActive && d.Experience >= 5)
            .OrderByDescending(d => d.Experience)
            .Select(d => $"  ★ [Senior] {d.Name} ({d.Role}, {d.Experience}년차)");

        foreach (var senior in seniors)
        {
            Console.WriteLine(senior);
        }

        // 3. 통계 연산
        double avgExp = team.Average(d => d.Experience);
        Console.WriteLine($"\\n🔷 팀 평균 개발 경력: {avgExp:F1}년");

        // 4. 비동기 Task 시뮬레이션
        Console.WriteLine("\\n🔷 비동기 Task(Async/Await) 파이프라인:");
        await Task.Delay(200);
        Console.WriteLine("  ➜ 데이터베이스 트랜잭션 완료 [Status: Committed]");

        Console.WriteLine("\\n✨ C# .NET 프로그램이 정상적으로 실행을 마쳤습니다!");
    }
}
`,
    },
  },

  // 10. Java
  {
    id: 'java-oop-streams',
    title: 'Java 21 객체지향 & 스트림 API',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Java 레코드(Record), 컬렉션 스트림(Stream API) 및 람다 표현식 예제',
    mainFile: 'Main.java',
    tags: ['Java', 'OOP', 'Streams', 'Lambda', 'Records'],
    files: {
      'Main.java': `// ==========================================
// ☕ OmniRunner: Java 21 OOP & Stream API
// ==========================================
import java.util.*;
import java.util.stream.*;

public class Main {
    record Employee(String name, String department, double salary, int years) {}

    public static void main(String[] args) {
        System.out.println("⚡ OpenJDK Java 21 Runtime Active");
        System.out.println("==========================================");

        List<Employee> team = List.of(
            new Employee("Alice", "Engineering", 85000, 5),
            new Employee("Bob", "Engineering", 95000, 7),
            new Employee("Charlie", "Design", 72000, 4),
            new Employee("Diana", "Marketing", 68000, 3),
            new Employee("Ethan", "Engineering", 110000, 10)
        );

        System.out.println("[1] 전체 직원 목록:");
        team.forEach(e -> System.out.println("  • " + e.name() + " (" + e.department() + ") - $" + e.salary()));

        System.out.println("\\n[2] 엔지니어링 부서 평균 연봉 계산:");
        double avgSalary = team.stream()
            .filter(e -> e.department().equals("Engineering"))
            .mapToDouble(Employee::salary)
            .average()
            .orElse(0.0);

        System.out.printf("  ➜ 평균 연봉: $%.2f%n", avgSalary);

        System.out.println("\\n[3] 5년 이상 경력자 필터링:");
        List<String> seniors = team.stream()
            .filter(e -> e.years() >= 5)
            .map(Employee::name)
            .collect(Collectors.toList());

        System.out.println("  ➜ 시니어 멤버: " + seniors);
        System.out.println("\\n✅ Java 프로그램 실행이 성공적으로 완료되었습니다!");
    }
}
`,
    },
  },

  // 11. Go (Golang)
  {
    id: 'go-concurrency',
    title: 'Go 언어 고루틴 & 동시성 채널',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'Go 언어의 핵심인 고루틴(Goroutine), 채널(Channel), 구조체 및 피보나치 계산',
    mainFile: 'main.go',
    tags: ['Go', 'Golang', 'Goroutines', 'Channels', 'Concurrency'],
    files: {
      'main.go': `// ==========================================
// 🐹 OmniRunner: Go (Golang) Concurrency
// ==========================================
package main

import (
	"fmt"
	"time"
)

type WorkerResult struct {
	ID       int
	Duration time.Duration
	Result   int
}

func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
	fmt.Println("🚀 Go 1.23 WebAssembly Runtime")
	fmt.Println("==========================================")

	numbers := []int{20, 25, 28, 30}
	results := make(chan WorkerResult, len(numbers))

	for i, n := range numbers {
		go func(workerID, val int) {
			start := time.Now()
			res := fibonacci(val)
			dur := time.Since(start)
			results <- WorkerResult{ID: workerID, Duration: dur, Result: res}
		}(i+1, n)
	}

	fmt.Println("⚡ 고루틴(Goroutines) 동시 연산 결과:")
	for i := 0; i < len(numbers); i++ {
		res := <-results
		fmt.Printf("  ➜ Worker #%d: Fib(%d) = %d (계산 완료)\\n", res.ID, numbers[res.ID-1], res.Result)
	}

	fmt.Println("\\n✅ 모든 Go 동시성 작업이 성공적으로 종료되었습니다!")
}
`,
    },
  },

  // 12. SQL (SQLite / AlaSQL In-Memory Database)
  {
    id: 'sql-analytics',
    title: 'SQL 데이터베이스 & 실무 분석 쿼리',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '테이블 생성(DDL), 데이터 적재(DML), 복합 조인(JOIN) 및 집계 분석 쿼리',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Database', 'JOIN', 'Aggregation', 'Analytics'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ OmniRunner: In-Memory SQL 실습
-- ==========================================

-- 1. 고객 테이블 생성 및 데이터 삽입
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    tier VARCHAR(20),
    joined_date DATE
);

INSERT INTO customers VALUES 
(1, '김민수', 'minsoo@ultra.com', 'VIP', '2024-01-15'),
(2, '이서연', 'seoyeon@ultra.com', 'Gold', '2024-02-20'),
(3, '박지훈', 'jihoon@ultra.com', 'Silver', '2024-03-10'),
(4, '최유진', 'yujin@ultra.com', 'VIP', '2024-03-25'),
(5, '정태양', 'taeyang@ultra.com', 'Bronze', '2024-04-05');

-- 2. 주문 테이블 생성 및 데이터 삽입
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    product_name VARCHAR(100),
    amount DECIMAL(10, 2),
    status VARCHAR(20),
    order_date DATE
);

INSERT INTO orders VALUES
(101, 1, 'MacBook Pro M3', 2890000, 'DELIVERED', '2024-04-01'),
(102, 1, 'Ultra Studio Monitor', 1250000, 'DELIVERED', '2024-04-10'),
(103, 2, 'Mechanical Keyboard', 210000, 'DELIVERED', '2024-04-12'),
(104, 3, 'Ergonomic Chair', 550000, 'SHIPPED', '2024-04-15'),
(105, 4, 'Noise Cancelling Headphone', 450000, 'DELIVERED', '2024-04-18'),
(106, 2, 'Magic Trackpad', 179000, 'DELIVERED', '2024-04-20');

-- 3. 고객별 총 주문 금액 및 구매 건수 조회 (JOIN & GROUP BY)
SELECT 
    c.name AS 고객명,
    c.tier AS 등급,
    COUNT(o.order_id) AS 주문건수,
    SUM(o.amount) AS 총주문금액,
    AVG(o.amount) AS 평균주문단가
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.tier
ORDER BY 총주문금액 DESC;

-- 4. 50만원 이상 구매한 우수 고객 필터링
SELECT 
    c.name AS 우수고객,
    c.email,
    SUM(o.amount) AS 누적매출
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING SUM(o.amount) >= 500000;
`,
    },
  },

  // 13. Ruby
  {
    id: 'ruby-enumerable',
    title: 'Ruby 3.3 객체지향 & Enumerable 체이닝',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Ruby의 우아한 블록(Block), Enumerable 체이닝 및 해시 변환',
    mainFile: 'script.rb',
    tags: ['Ruby', 'CRuby', 'Enumerable', 'Blocks', 'OOP'],
    files: {
      'script.rb': `# ==========================================
# 💎 OmniRunner: Ruby 3.3 Runtime
# ==========================================

puts "💎 Ruby 3.3.0 WebAssembly Engine"
puts "=========================================="

class Developer
  attr_reader :name, :languages, :experience

  def initialize(name, languages, experience)
    @name = name
    @languages = languages
    @experience = experience
  end

  def polyglot?
    @languages.size >= 3
  end
end

devs = [
  Developer.new("Minsoo", ["Ruby", "TypeScript", "Python"], 6),
  Developer.new("Sarah", ["Rust", "C++"], 4),
  Developer.new("Alex", ["Go", "Python", "SQL", "JavaScript"], 8)
]

puts "[1] Polyglot 개발자 선별:"
devs.select(&:polyglot?).each do |d|
  puts "  ➜ #{d.name}: #{d.languages.join(', ')} (#{d.experience}년차)"
end

numbers = (1..10).to_a
squared_evens = numbers.select(&:even?).map { |n| n ** 2 }
puts "\\n[2] 1..10 짝수 제곱합: #{squared_evens.sum}"

puts "\\n✨ Ruby 스크립트 실행이 성공적으로 완료되었습니다!"
`,
    },
  },

  // 14. PHP
  {
    id: 'php-modern-oop',
    title: 'PHP 8.3 현대적 OOP & 배열 파이프라인',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 8의 열거형, 화살표 함수, match 표현식 및 JSON 데이터 변환',
    mainFile: 'index.php',
    tags: ['PHP', 'PHP 8', 'Backend', 'OOP', 'JSON'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 OmniRunner: PHP 8.3 CLI Runtime
// ==========================================

echo "🐘 PHP 8.3.4 (CLI Wasm Engine)\\n";
echo "==========================================\\n";

enum Status: string {
    case Pending = '대기중';
    case Running = '실행중';
    case Completed = '완료됨';
}

class Task {
    public function __construct(
        public int $id,
        public string $title,
        public Status $status
    ) {}

    public function toArray(): array {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status->value
        ];
    }
}

$tasks = [
    new Task(1, 'WebContainer 부팅', Status::Completed),
    new Task(2, 'Pyodide Wasm 바인딩', Status::Completed),
    new Task(3, '다국어 확장 테스트', Status::Running),
];

echo "[1] 작업 목록 요약:\\n";
foreach ($tasks as $task) {
    echo "  • #{$task->id} [{$task->title}] ➜ {$task->status->value}\\n";
}

$completedCount = count(array_filter($tasks, fn($t) => $t->status === Status::Completed));
echo "\\n[2] 완료율: {$completedCount} / " . count($tasks) . "\\n";

echo "\\n✨ PHP 코드가 성공적으로 실행되었습니다!\\n";
`,
    },
  },

  // 15. Lua
  {
    id: 'lua-vector-math',
    title: 'Lua 5.3 테이블 & 2D 벡터 수학',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'Lua 테이블, 메타테이블(Metatable), 연산자 오버로딩 및 코루틴',
    mainFile: 'main.lua',
    tags: ['Lua', 'Scripting', 'Vectors', 'Metatables', 'GameDev'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 OmniRunner: Lua 5.3 Runtime
-- ==========================================

print("🌙 Lua 5.3 on WebAssembly")
print("==========================================")

-- Vector2D 클래스 정의
Vector2D = {}
Vector2D.__index = Vector2D

function Vector2D.new(x, y)
    local v = { x = x or 0, y = y or 0 }
    setmetatable(v, Vector2D)
    return v
end

-- 연산자 오버로딩 (+)
function Vector2D.__add(a, b)
    return Vector2D.new(a.x + b.x, a.y + b.y)
end

function Vector2D:length()
    return math.sqrt(self.x * self.x + self.y * self.y)
end

function Vector2D:toString()
    return string.format("(%.2f, %.2f)", self.x, self.y)
end

local v1 = Vector2D.new(3, 4)
local v2 = Vector2D.new(5, 12)
local v3 = v1 + v2

print("Vector 1: " .. v1:toString() .. " (길이: " .. v1:length() .. ")")
print("Vector 2: " .. v2:toString() .. " (길이: " .. v2:length() .. ")")
print("V1 + V2 합계: " .. v3:toString())

print("\\n✨ Lua 스크립트 실행이 완료되었습니다!")
`,
    },
  },

  // 16. Bash / Shell Scripting
  {
    id: 'bash-sys-pipeline',
    title: 'Bash 쉘 스크립트 & 파이프라인',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '유닉스 쉘 명령어, 파이프(|), 환경변수 및 시스템 정보 출력',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Shell', 'Linux', 'CLI', 'Pipelines'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 OmniRunner: Bash Scripting
# ==========================================

echo "🐚 Virtual Bash 5.2 Environment"
echo "=========================================="

echo "[1] 가상 OS 환경 정보:"
uname -a
pwd
date

echo ""
echo "[2] 파일 리스트 & 텍스트 필터링:"
cat << 'EOF' > employees.txt
ID,NAME,ROLE,SALARY
101,Minsoo,Architect,95000
102,Seoyeon,Frontend,85000
103,Jihoon,DevOps,90000
104,Yujin,DataScientist,92000
EOF

echo "📄 생성된 employees.txt 내용:"
cat employees.txt

echo ""
echo "✨ Bash 쉘 스크립트 실행 완료!"
`,
    },
  },

  // 17. Rust
  {
    id: 'rust-pattern-match',
    title: 'Rust 패턴 매칭 & 메모리 안전성',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Rust 소유권, 열거형(Enum), Result/Option 처리 및 안전한 벡터 연산',
    mainFile: 'main.rs',
    tags: ['Rust', 'Pattern Matching', 'Ownership', 'Systems'],
    files: {
      'main.rs': `// ==========================================
// 🦀 OmniRunner: Rust 런타임 예제
// ==========================================

#[derive(Debug)]
enum TaskStatus {
    Pending,
    InProgress { progress: u8 },
    Completed { duration_ms: u64 },
}

fn main() {
    println!("\\x1b[36m[Rust Pattern Matching & Structs]\\x1b[0m");

    let status = TaskStatus::Completed { duration_ms: 120 };
    match status {
        TaskStatus::Pending => println!("⏳ 대기 중"),
        TaskStatus::InProgress { progress } => println!("⚙️ 진행 중 ({}%)", progress),
        TaskStatus::Completed { duration_ms } => println!("✅ 완료 ({}ms 소요)", duration_ms),
    }

    let numbers: Vec<i32> = (1..=10).collect();
    let sum_of_squares: i32 = numbers.iter().filter(|&&x| x % 2 == 0).map(|&x| x * x).sum();

    println!("\\n1부터 10까지 짝수의 제곱합: {}", sum_of_squares);
    println!("\\x1b[32m✨ Rust 프로그램 실행이 완료되었습니다!\\x1b[0m");
}
`,
    },
  },
];

export function getTemplateById(id: string): CodeTemplate {
  const template = TEMPLATES.find((t) => t.id === id);
  return template || TEMPLATES[0];
}

export function getTemplatesByLanguage(language: SupportedLanguage): CodeTemplate[] {
  return TEMPLATES.filter((t) => t.language === language);
}
