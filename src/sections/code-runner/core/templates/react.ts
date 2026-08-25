import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

const REACT_HTML_SHELL = (jsxCode: string) => `<!DOCTYPE html>
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
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

${jsxCode}

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
`;

export const REACT_TEMPLATES: CodeTemplate[] = [
  {
    id: 'react-01-hello',
    title: '01. Hello React 18 & JSX',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: 'React 18 루트 마운트와 기본 JSX 문법 및 스타일링',
    mainFile: 'App.jsx',
    tags: ['React', 'JSX', 'React 18', 'Hello World'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
          <div class="inline-block p-3 bg-sky-500/10 rounded-full mb-3">
            <span class="text-3xl">⚛️</span>
          </div>
          <h1 class="text-2xl font-bold text-sky-400 mb-2">Hello, React 18!</h1>
          <p class="text-slate-400 text-sm mb-4">OmniRunner 실시간 샌드박스에서 구동 중입니다.</p>
          <div class="bg-slate-800/80 p-3 rounded-lg text-xs text-slate-300 font-mono">
            React Version: 18.2.0 • Babel Standalone
          </div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-02-props-state',
    title: '02. Props & useState 상태 관리',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '자식 컴포넌트 Props 전달과 useState를 통한 카운터 상태 관리',
    mainFile: 'App.jsx',
    tags: ['React', 'Props', 'useState', 'State Management'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function Badge({ count, label }) {
      return (
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
          <span class="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
          <div class="text-3xl font-black text-emerald-400 mt-1">{count}</div>
        </div>
      );
    }

    function App() {
      const [count, setCount] = useState(0);

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-lg font-bold text-white mb-4">카운터 & Props 전달</h2>
          <Badge count={count} label="현재 수치" />
          <div class="grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => setCount(c => c - 1)} class="bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-bold text-white">-1</button>
            <button onClick={() => setCount(0)} class="bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-slate-300 text-sm">초기화</button>
            <button onClick={() => setCount(c => c + 1)} class="bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg font-bold text-white">+1</button>
          </div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-03-event-handling',
    title: '03. 인터랙티브 이벤트 핸들링',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '마우스 무브 좌표 트래킹 및 키보드 입력 이벤트 처리',
    mainFile: 'App.jsx',
    tags: ['React', 'Events', 'Mouse Events', 'Keyboard'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [pos, setPos] = useState({ x: 0, y: 0 });
      const [key, setKey] = useState('None');

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 class="text-lg font-bold text-sky-400">이벤트 리스너 테스트</h2>
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPos({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
            }}
            class="h-32 bg-slate-950 border border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-crosshair"
          >
            <span class="text-sm font-mono text-amber-400">마우스 좌표: ({pos.x}, {pos.y})</span>
          </div>
          <input
            type="text"
            placeholder="아무 키나 눌러보세요..."
            onKeyDown={(e) => setKey(e.key)}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
          />
          <div class="text-xs text-slate-400 font-mono">마지막 입력 키: <b class="text-white">{key}</b></div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-04-conditional-rendering',
    title: '04. 조건부 렌더링 & 토글 상태',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '삼항 연산자와 단락 평가(&&)를 활용한 뷰 전환',
    mainFile: 'App.jsx',
    tags: ['React', 'Conditional Rendering', 'Ternary', 'UI State'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [showSecret, setShowSecret] = useState(false);

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-white">조건부 렌더링</h2>
            <button
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              class={"px-3 py-1 text-xs font-bold rounded-full " + (isLoggedIn ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}
            >
              {isLoggedIn ? "로그아웃" : "로그인"}
            </button>
          </div>

          {isLoggedIn ? (
            <div class="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-xl space-y-2">
              <p class="text-emerald-300 font-medium">환영합니다! 회원 전용 화면입니다.</p>
              <button onClick={() => setShowSecret(!showSecret)} class="text-xs bg-emerald-700 text-white px-2 py-1 rounded">
                {showSecret ? "비밀번호 숨기기" : "비밀번호 보기"}
              </button>
              {showSecret && <p class="text-xs font-mono text-emerald-200 mt-2">API Secret: sk-live-99281-omni</p>}
            </div>
          ) : (
            <div class="bg-slate-800/50 p-4 rounded-xl text-center text-slate-400 text-sm">
              로그인이 필요한 서비스입니다. 상단 버튼을 눌러주세요.
            </div>
          )}
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-05-lists-keys',
    title: '05. 리스트 렌더링 & Key',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '배열 데이터의 map 렌더링 및 동적 항목 삭제',
    mainFile: 'App.jsx',
    tags: ['React', 'Lists', 'Keys', 'Map'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [items, setItems] = useState([
        { id: 1, title: 'MacBook Pro M3', price: '2,890,000원', category: 'Laptop' },
        { id: 2, title: '4K Studio Monitor', price: '1,250,000원', category: 'Display' },
        { id: 3, title: 'Mechanical Keyboard', price: '189,000원', category: 'Accessory' },
      ]);

      const removeItem = (id) => setItems(items.filter(item => item.id !== id));

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h2 class="text-lg font-bold text-sky-400">장바구니 목록 ({items.length})</h2>
          {items.map(item => (
            <div key={item.id} class="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <div class="text-sm font-semibold text-white">{item.title}</div>
                <div class="text-xs text-slate-400">{item.price} • <span class="text-sky-400">{item.category}</span></div>
              </div>
              <button onClick={() => removeItem(item.id)} class="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1">삭제</button>
            </div>
          ))}
          {items.length === 0 && <p class="text-center text-slate-500 text-sm py-4">장바구니가 비어 있습니다.</p>}
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-06-useeffect-timer',
    title: '06. useEffect 라이프사이클 & 타이머',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: 'useEffect의 Mount/Unmount 클린업 함수와 실시간 스톱워치',
    mainFile: 'App.jsx',
    tags: ['React', 'useEffect', 'Timer', 'Lifecycle', 'Cleanup'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [seconds, setSeconds] = useState(0);
      const [isActive, setIsActive] = useState(false);

      useEffect(() => {
        let interval = null;
        if (isActive) {
          interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else if (!isActive && seconds !== 0) {
          clearInterval(interval);
        }
        return () => clearInterval(interval);
      }, [isActive, seconds]);

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
          <h2 class="text-lg font-bold text-white mb-2">실시간 타이머 (useEffect)</h2>
          <div class="text-5xl font-mono font-black text-sky-400 my-6">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </div>
          <div class="flex justify-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              class={"px-4 py-2 rounded-lg font-bold text-white text-sm " + (isActive ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500")}
            >
              {isActive ? "일시정지" : "시작"}
            </button>
            <button onClick={() => { setIsActive(false); setSeconds(0); }} class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-slate-300 text-sm font-bold">
              초기화
            </button>
          </div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-07-form-controlled',
    title: '07. 제어 컴포넌트 폼 & 실시간 유효성 검사',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: 'Controlled Input 폼 상태 관리 및 이메일/비밀번호 실시간 검증',
    mainFile: 'App.jsx',
    tags: ['React', 'Forms', 'Controlled Components', 'Validation'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [form, setForm] = useState({ email: '', password: '' });
      const [submitted, setSubmitted] = useState(false);

      const isEmailValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email);
      const isPasswordValid = form.password.length >= 6;
      const isFormValid = isEmailValid && isPasswordValid;

      const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) setSubmitted(true);
      };

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-lg font-bold text-white mb-4">회원가입 폼 검증</h2>
          <form onSubmit={handleSubmit} class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setSubmitted(false); }}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="user@example.com"
              />
              {form.email && !isEmailValid && <p class="text-xs text-red-400 mt-1">올바른 이메일 형식이 아닙니다.</p>}
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">비밀번호 (6자 이상)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setSubmitted(false); }}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              {form.password && !isPasswordValid && <p class="text-xs text-red-400 mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>}
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              class={"w-full py-2.5 rounded-lg text-sm font-bold text-white transition " + (isFormValid ? "bg-sky-600 hover:bg-sky-500 cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed")}
            >
              가입 신청
            </button>
          </form>

          {submitted && <div class="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg text-center">✅ 가입 정보가 성공적으로 전송되었습니다!</div>}
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-08-todo-app',
    title: '08. 실전 Todo List CRUD 앱',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '할 일 추가, 완료 토글, 삭제 및 통계 카운터가 포함된 완성형 Todo 앱',
    mainFile: 'App.jsx',
    tags: ['React', 'Todo App', 'CRUD', 'Interactive'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [todos, setTodos] = useState([
        { id: 1, text: 'React Live 엔진 테스트', done: true },
        { id: 2, text: '다국어 코드 템플릿 작성', done: true },
        { id: 3, text: '대시보드 메트릭 검증', done: false },
      ]);
      const [input, setInput] = useState('');

      const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, done: false }]);
        setInput('');
      };

      const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
      };

      const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
      };

      const completed = todos.filter(t => t.done).length;

      return (
        <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-sky-400">⚡ Omni Todo Manager</h2>
            <span class="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full font-bold">{completed}/{todos.length} 완료</span>
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="새 작업 입력..."
              class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <button onClick={addTodo} class="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-lg text-sm font-bold text-white">추가</button>
          </div>

          <div class="space-y-2">
            {todos.map(t => (
              <div key={t.id} class="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl hover:bg-slate-800/30 transition">
                <span onClick={() => toggleTodo(t.id)} class={"flex-1 cursor-pointer text-sm " + (t.done ? "line-through text-slate-500" : "text-slate-200")}>
                  {t.done ? "✅ " : "⏳ "} {t.text}
                </span>
                <button onClick={() => deleteTodo(t.id)} class="text-xs text-red-400 hover:text-red-300 ml-2">삭제</button>
              </div>
            ))}
          </div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-09-custom-hooks',
    title: '09. 커스텀 훅 (useToggle & useCounter)',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '재사용 가능한 Custom Hook 패턴 설계 및 활용',
    mainFile: 'App.jsx',
    tags: ['React', 'Custom Hooks', 'Hooks', 'Design Patterns'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    // 커스텀 훅 정의
    function useToggle(initial = false) {
      const [state, setState] = useState(initial);
      const toggle = useCallback(() => setState(s => !s), []);
      return [state, toggle];
    }

    function useCounter(initial = 0, step = 1) {
      const [count, setCount] = useState(initial);
      const inc = () => setCount(c => c + step);
      const dec = () => setCount(c => c - step);
      const reset = () => setCount(initial);
      return { count, inc, dec, reset };
    }

    function App() {
      const [isDark, toggleDark] = useToggle(true);
      const { count, inc, dec, reset } = useCounter(10, 5);

      return (
        <div class={"max-w-md mx-auto border rounded-2xl p-6 shadow-2xl transition " + (isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Custom Hooks 시연</h2>
            <button onClick={toggleDark} class="px-3 py-1 text-xs font-bold rounded-lg bg-sky-600 text-white">
              {isDark ? "라이트 모드" : "다크 모드"}
            </button>
          </div>

          <div class="p-4 rounded-xl border border-dashed border-slate-700 text-center space-y-3">
            <span class="text-xs font-mono opacity-60">useCounter Hook (Step: 5)</span>
            <div class="text-4xl font-black text-sky-400">{count}</div>
            <div class="flex justify-center gap-2">
              <button onClick={dec} class="bg-slate-700 text-white px-3 py-1 rounded">-5</button>
              <button onClick={reset} class="bg-slate-800 text-white px-3 py-1 rounded text-xs">Reset</button>
              <button onClick={inc} class="bg-emerald-600 text-white px-3 py-1 rounded">+5</button>
            </div>
          </div>
        </div>
      );
    }
`),
    },
  },
  {
    id: 'react-10-dashboard',
    title: '10. 인터랙티브 메트릭 대시보드',
    category: 'Web & Server',
    language: 'react',
    engine: 'html-sandbox',
    description: '실시간 통계 메트릭, 탭 전환, 동적 게이지 차트가 결합된 실무형 대시보드',
    mainFile: 'App.jsx',
    tags: ['React', 'Dashboard', 'Metrics', 'UI Components', 'Full Application'],
    files: {
      'App.jsx': REACT_HTML_SHELL(`
    function App() {
      const [activeTab, setActiveTab] = useState('overview');
      const metrics = [
        { label: 'CPU 사용률', val: '24%', color: 'from-blue-500 to-sky-400', progress: 24 },
        { label: '메모리 점유율', val: '1.2 GB / 4 GB', color: 'from-emerald-500 to-teal-400', progress: 30 },
        { label: '활성 세션', val: '142명', color: 'from-amber-500 to-orange-400', progress: 71 },
        { label: '요청 처리율', val: '99.98%', color: 'from-indigo-500 to-purple-400', progress: 99 },
      ];

      return (
        <div class="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-white flex items-center gap-2">
                <span>⚡</span> Omni Dashboard
              </h1>
              <p class="text-xs text-slate-400">시스템 모니터링 콘솔</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            {metrics.map((m, i) => (
              <div key={i} class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                <span class="text-xs text-slate-400">{m.label}</span>
                <div class="text-lg font-bold text-white my-1">{m.val}</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class={"h-full bg-gradient-to-r " + m.color} style={{ width: m.progress + '%' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">실시간 트래픽 로그</h3>
            <div class="space-y-1.5 font-mono text-xs text-slate-400">
              <div class="flex justify-between"><span>GET /api/v1/status</span><span class="text-emerald-400">200 OK (12ms)</span></div>
              <div class="flex justify-between"><span>POST /api/v1/execute</span><span class="text-emerald-400">200 OK (45ms)</span></div>
              <div class="flex justify-between"><span>WS /stream/connect</span><span class="text-sky-400">Connected</span></div>
            </div>
          </div>
        </div>
      );
    }
`),
    },
  },
];
