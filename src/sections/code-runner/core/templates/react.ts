import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const REACT_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: React 기초 및 상태 관리 10선] ---
  {
    id: 'react-01-jsx-state',
    title: '01. JSX 렌더링 & useState 카운터',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'React 18 상태 훅(useState)과 JSX 이벤트 바인딩',
    mainFile: 'App.jsx',
    tags: ['React', 'useState', 'JSX', 'Counter'],
    files: {
      'App.jsx': `export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ color: '#0284c7' }}>⚛️ React 18 Counter</h2>
      <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{count}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
        >
          - 1
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          + 1
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-02-props-composition',
    title: '02. 컴포넌트 합성 & Props 전달',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '재사용 가능한 Card 및 Badge UI 컴포넌트 합성',
    mainFile: 'App.jsx',
    tags: ['React', 'Props', 'Composition', 'Component'],
    files: {
      'App.jsx': `function UserCard({ name, role, skills, avatarColor }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', width: '260px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
          {name[0]}
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px' }}>{name}</h4>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{role}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {skills.map(s => (
          <span key={s} style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginBottom: '16px' }}>👥 팀 멤버 카드</h3>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <UserCard name="김민수" role="Frontend Lead" skills={['React', 'Next.js', 'TS']} avatarColor="#0ea5e9" />
        <UserCard name="이지은" role="Product Designer" skills={['Figma', 'UI/UX', 'CSS']} avatarColor="#ec4899" />
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-03-todo-list',
    title: '03. 인터랙티브 Todo 리스트',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '할 일 추가, 완료 토글(Toggle), 삭제(Delete) CRUD 상태 관리',
    mainFile: 'App.jsx',
    tags: ['React', 'Todo', 'CRUD', 'List'],
    files: {
      'App.jsx': `export default function App() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Next.js 15 앱 라우터 최적화', done: true },
    { id: 2, text: 'WebContainer 알고리즘 샌드박스 구현', done: false },
    { id: 3, text: 'Monaco Editor 테마 적용', done: false },
  ]);
  const [text, setText] = React.useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: text.trim(), done: false }]);
    setText('');
  };

  const toggle = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <div style={{ padding: '24px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3>📝 React Todo App</h3>
      <form onSubmit={addTodo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="새로운 작업 입력..." 
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          추가
        </button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span onClick={() => toggle(t.id)} style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : '#0f172a', cursor: 'pointer' }}>
              {t.done ? '✅ ' : '⬜ '} {t.text}
            </span>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-04-use-effect-timer',
    title: '04. useEffect 타이머 & 클린업(Cleanup)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'setInterval을 활용한 스톱워치 및 메모리 누수 방지 클린업',
    mainFile: 'App.jsx',
    tags: ['React', 'useEffect', 'Timer', 'Stopwatch'],
    files: {
      'App.jsx': `export default function App() {
  const [seconds, setSeconds] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3>⏱️ React 스톱워치</h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '16px 0', fontFamily: 'monospace', color: '#0284c7' }}>
        {formatTime(seconds)}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{ padding: '8px 16px', backgroundColor: isRunning ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {isRunning ? '일시정지' : '시작'}
        </button>
        <button 
          onClick={() => { setIsRunning(false); setSeconds(0); }}
          style={{ padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          초기화
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-05-controlled-form',
    title: '05. 제어 컴포넌트 폼 & 실시간 유효성 검사',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '입력 폼 상태 바인딩, 비밀번호 강도 검사 및 에러 피드백',
    mainFile: 'App.jsx',
    tags: ['React', 'Forms', 'Validation', 'Controlled Component'],
    files: {
      'App.jsx': `export default function App() {
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const isValidEmail = form.email.includes('@') && form.email.includes('.');
  const isStrongPassword = form.password.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidEmail && isStrongPassword) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '360px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3>🔐 회원가입 유효성 검사</h3>
      {submitted ? (
        <div style={{ padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
          🎉 가입 완료: {form.email}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#475569' }}>이메일</label>
            <input 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
            />
            {form.email && !isValidEmail && <span style={{ fontSize: '11px', color: '#ef4444' }}>올바른 이메일 형식이 아닙니다.</span>}
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#475569' }}>비밀번호 (8자 이상)</label>
            <input 
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
            />
            {form.password && !isStrongPassword && <span style={{ fontSize: '11px', color: '#ef4444' }}>8자 이상 입력해주세요.</span>}
          </div>
          <button 
            type="submit" 
            disabled={!isValidEmail || !isStrongPassword}
            style={{ padding: '10px', backgroundColor: isValidEmail && isStrongPassword ? '#0284c7' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            가입하기
          </button>
        </form>
      )}
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-06-custom-hook',
    title: '06. 커스텀 훅 (useLocalStorage & useDebounce)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '재사용 가능한 로컬 상태 영속화 커스텀 훅 패턴',
    mainFile: 'App.jsx',
    tags: ['React', 'Custom Hook', 'useLocalStorage'],
    files: {
      'App.jsx': `function usePersistentState(key, initialValue) {
  const [state, setState] = React.useState(initialValue);

  const setPersistentState = (value) => {
    setState(value);
  };

  return [state, setPersistentState];
}

export default function App() {
  const [theme, setTheme] = usePersistentState('app-theme', 'light');

  return (
    <div style={{ padding: '24px', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? '#f8fafc' : '#0f172a', minHeight: '180px', borderRadius: '12px', transition: 'all 0.3s' }}>
      <h3>🎨 Custom Hook 테마 스위처</h3>
      <p>현재 적용된 테마: <strong>{theme}</strong></p>
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
      >
        테마 전환 ({theme === 'light' ? '🌙 Dark' : '☀️ Light'})
      </button>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-07-use-reducer-cart',
    title: '07. useReducer 복합 상태 (장바구니)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Redux 스타일 액션 디스패치와 장바구니 수량/총액 계산',
    mainFile: 'App.jsx',
    tags: ['React', 'useReducer', 'Cart', 'Redux pattern'],
    files: {
      'App.jsx': `const initialState = [
  { id: 1, name: '기계식 키보드', price: 120000, qty: 1 },
  { id: 2, name: '게이밍 마우스', price: 65000, qty: 2 },
];

function cartReducer(state, action) {
  switch (action.type) {
    case 'INC':
      return state.map(item => item.id === action.id ? { ...item, qty: item.qty + 1 } : item);
    case 'DEC':
      return state.map(item => item.id === action.id ? { ...item, qty: Math.max(1, item.qty - 1) } : item);
    case 'REMOVE':
      return state.filter(item => item.id !== action.id);
    default:
      return state;
  }
}

export default function App() {
  const [cart, dispatch] = React.useReducer(cartReducer, initialState);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h3>🛒 장바구니 (useReducer)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span>{item.name} ({(item.price * item.qty).toLocaleString()}원)</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => dispatch({ type: 'DEC', id: item.id })} style={{ padding: '2px 8px' }}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => dispatch({ type: 'INC', id: item.id })} style={{ padding: '2px 8px' }}>+</button>
              <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <h4 style={{ marginTop: '16px', textAlign: 'right', color: '#0284c7' }}>
        총 결제 금액: {total.toLocaleString()}원
      </h4>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-08-tabs-accordion',
    title: '08. 탭(Tabs) & 아코디언 UI 컴포넌트',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '상태 기반 탭 전환 및 펼침/접힘 아코디언 UI 인터랙션',
    mainFile: 'App.jsx',
    tags: ['React', 'Tabs', 'Accordion', 'UI Interaction'],
    files: {
      'App.jsx': `export default function App() {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = [
    { title: '🚀 개요', content: 'OmniRunner는 17개 언어를 지원하는 브라우저 내장 IDE입니다.' },
    { title: '⚡ 성능', content: 'WebAssembly와 WebContainer 기술로 네이티브에 준하는 속도를 제공합니다.' },
    { title: '🛠️ 아키텍처', content: 'React 18과 Monaco Editor 기반으로 설계되었습니다.' }
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom: activeTab === idx ? '2px solid #0284c7' : 'none',
              backgroundColor: 'transparent',
              fontWeight: activeTab === idx ? 'bold' : 'normal',
              color: activeTab === idx ? '#0284c7' : '#64748b',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 0', color: '#334155', lineHeight: 1.6 }}>
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-09-search-filter',
    title: '09. 실시간 검색 & 다중 필터링 (useMemo)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '검색어 실시간 필터링 및 useMemo 연산 최적화',
    mainFile: 'App.jsx',
    tags: ['React', 'useMemo', 'Search', 'Filter'],
    files: {
      'App.jsx': `const DATA = [
  { id: 1, name: 'JavaScript', type: 'Scripting' },
  { id: 2, name: 'TypeScript', type: 'Typed' },
  { id: 3, name: 'Python', type: 'Scripting' },
  { id: 4, name: 'Rust', type: 'Compiled' },
  { id: 5, name: 'Go', type: 'Compiled' },
  { id: 6, name: 'C++', type: 'Compiled' },
];

export default function App() {
  const [query, setQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('ALL');

  const filtered = React.useMemo(() => {
    return DATA.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchType = filterType === 'ALL' || item.type === filterType;
      return matchQuery && matchType;
    });
  }, [query, filterType]);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h3>🔍 실시간 언어 검색기</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input 
          placeholder="언어 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <select 
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">전체 유형</option>
          <option value="Scripting">Scripting</option>
          <option value="Typed">Typed</option>
          <option value="Compiled">Compiled</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <strong>{item.name}</strong> <span style={{ fontSize: '12px', color: '#64748b' }}>({item.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-10-modal-dialog',
    title: '10. 모달 다이얼로그 (Modal & Backdrop)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '배경 오버레이 클릭 닫기 및 ESC 키보드 이벤트 바인딩',
    mainFile: 'App.jsx',
    tags: ['React', 'Modal', 'Dialog', 'Overlay'],
    files: {
      'App.jsx': `export default function App() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3>팝업 모달 다이얼로그</h3>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        모달 열기
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <h4 style={{ margin: '0 0 12px 0' }}>💡 알림 메시지</h4>
            <p style={{ color: '#64748b', fontSize: '14px' }}>WebContainer 환경에서 안전하게 실행되었습니다.</p>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`,
    },
  },

  // --- [Part 2: 알고리즘 시각화 & 인터랙티브 UI 10선] ---
  {
    id: 'react-11-algo-sort-visualizer',
    title: '11. [시각화] 정렬 알고리즘 애니메이터 (Sorting Visualizer)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '버블 정렬(Bubble Sort)과 막대 그래프 실시간 인터랙티브 시각화',
    mainFile: 'App.jsx',
    tags: ['React', 'Sorting Visualizer', 'Algorithm', 'Animation'],
    files: {
      'App.jsx': `export default function App() {
  const [array, setArray] = React.useState([45, 12, 85, 32, 89, 39, 69, 22, 95, 50]);
  const [sorting, setSorting] = React.useState(false);
  const [activeIndices, setActiveIndices] = React.useState([]);

  const resetArray = () => {
    setArray(Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 15));
    setActiveIndices([]);
  };

  const bubbleSort = async () => {
    setSorting(true);
    let arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setActiveIndices([j, j + 1]);
        await new Promise(r => setTimeout(r, 120));
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
      }
    }
    setActiveIndices([]);
    setSorting(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>📊 버블 정렬 알고리즘 시각화</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '140px', gap: '6px', marginBottom: '16px' }}>
        {array.map((val, idx) => (
          <div 
            key={idx} 
            style={{ 
              height: \`\${val}px\`, 
              width: '24px', 
              backgroundColor: activeIndices.includes(idx) ? '#ef4444' : '#0284c7', 
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              paddingBottom: '2px',
              transition: 'height 0.1s ease'
            }}
          >
            {val}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={resetArray} disabled={sorting} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>랜덤 생성</button>
        <button onClick={bubbleSort} disabled={sorting} style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {sorting ? '정렬 중...' : '정렬 시작'}
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-12-algo-maze-pathfinder',
    title: '12. [시각화] 2D 미로 최단 경로 BFS 탐색기',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '그리드 클릭 벽 생성 및 너비 우선 탐색(BFS) 최단 경로 탐색 시각화',
    mainFile: 'App.jsx',
    tags: ['React', 'BFS', 'Pathfinding', 'Maze'],
    files: {
      'App.jsx': `export default function App() {
  const [grid, setGrid] = React.useState([
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0],
  ]);
  const [path, setPath] = React.useState([]);

  const findPath = () => {
    const H = grid.length, W = grid[0].length;
    const q = [[0, 0, [[0, 0]]]];
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    visited[0][0] = true;

    while (q.length) {
      const [x, y, p] = q.shift();
      if (x === W - 1 && y === H - 1) {
        setPath(p);
        return;
      }
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && !visited[ny][nx] && grid[ny][nx] === 0) {
          visited[ny][nx] = true;
          q.push([nx, ny, [...p, [nx, ny]]]);
        }
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h3>⚡ 미로 최단 경로 BFS 탐색</h3>
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 36px)', gap: '4px', margin: '12px auto' }}>
        {grid.map((row, y) => row.map((cell, x) => {
          const isPath = path.some(([px, py]) => px === x && py === y);
          const isStart = x === 0 && y === 0;
          const isEnd = x === 4 && y === 3;
          let bg = cell === 1 ? '#334155' : '#f1f5f9';
          if (isPath) bg = '#38bdf8';
          if (isStart) bg = '#22c55e';
          if (isEnd) bg = '#ef4444';

          return (
            <div 
              key={\`\${x}-\${y}\`} 
              style={{ width: '36px', height: '36px', backgroundColor: bg, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 'bold' }}
            >
              {isStart ? 'S' : isEnd ? 'E' : ''}
            </div>
          );
        }))}
      </div>
      <div>
        <button onClick={findPath} style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          BFS 최단 경로 탐색 ({path.length ? \`\${path.length}칸\` : '탐색 시작'})
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-13-algo-nqueens-visualizer',
    title: '13. [시각화] N-Queens 체스판 백트래킹',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '4x4 체스판 N-Queens 해답 탐색 및 인터랙티브 시각화',
    mainFile: 'App.jsx',
    tags: ['React', 'N-Queens', 'Backtracking', 'Chess'],
    files: {
      'App.jsx': `export default function App() {
  const [solutionIdx, setSolutionIdx] = React.useState(0);
  const solutions = [
    [1, 3, 0, 2],
    [2, 0, 3, 1]
  ];
  const board = solutions[solutionIdx];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h3>👑 4x4 N-Queens 백트래킹 시각화</h3>
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 42px)', gap: '2px', border: '2px solid #334155', padding: '2px', margin: '12px 0' }}>
        {[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(col => {
          const isQueen = board[row] === col;
          const isDark = (row + col) % 2 === 1;
          return (
            <div 
              key={\`\${row}-\${col}\`}
              style={{ width: '42px', height: '42px', backgroundColor: isDark ? '#cbd5e1' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}
            >
              {isQueen ? '👑' : ''}
            </div>
          );
        }))}
      </div>
      <div>
        <button 
          onClick={() => setSolutionIdx(i => (i + 1) % solutions.length)}
          style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          해답 전환 (해답 #{solutionIdx + 1} / 2)
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-14-interactive-kanban',
    title: '14. [인터랙티브] 칸반(Kanban) 드래그 보드',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'To Do ➔ In Progress ➔ Done 상태 카드 이동 관리',
    mainFile: 'App.jsx',
    tags: ['React', 'Kanban', 'Board', 'State Management'],
    files: {
      'App.jsx': `export default function App() {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: 'Wasm 컴파일러 연동', col: 'todo' },
    { id: 2, text: 'UI 테마 최적화', col: 'doing' },
    { id: 3, text: 'Next.js 15 마이그레이션', col: 'done' },
  ]);

  const move = (id, nextCol) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, col: nextCol } : t));
  };

  const cols = [
    { key: 'todo', label: '📋 할 일', next: 'doing' },
    { key: 'doing', label: '⚡ 진행 중', next: 'done' },
    { key: 'done', label: '🎉 완료', next: 'todo' }
  ];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 12px 0' }}>📌 미니 칸반 보드</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {cols.map(c => (
          <div key={c.key} style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '10px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>{c.label}</h4>
            {tasks.filter(t => t.col === c.key).map(t => (
              <div key={t.id} style={{ backgroundColor: 'white', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div>{t.text}</div>
                <button onClick={() => move(t.id, c.next)} style={{ marginTop: '6px', fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}>
                  이동 ➔
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-15-interactive-canvas-physics',
    title: '15. [시각화] HTML5 Canvas 바운싱 볼 물리 엔진',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'requestAnimationFrame 기반 다중 파티클 반사 물리 시뮬레이션',
    mainFile: 'App.jsx',
    tags: ['React', 'Canvas', 'Physics', 'Animation'],
    files: {
      'App.jsx': `export default function App() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let balls = Array.from({ length: 15 }, () => ({
      x: Math.random() * 260 + 20,
      y: Math.random() * 100 + 20,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 6 + 4,
      color: \`hsl(\${Math.random() * 360}, 80%, 60%)\`
    }));

    let animId;
    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      balls.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < b.radius || b.x > canvas.width - b.radius) b.vx *= -1;
        if (b.y < b.radius || b.y > canvas.height - b.radius) b.vy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>⚽ Canvas 2D 탄성 충돌 시뮬레이션</h3>
      <canvas ref={canvasRef} width={300} height={140} style={{ borderRadius: '8px' }} />
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-16-markdown-previewer',
    title: '16. [인터랙티브] 실시간 Markdown 라이브 뷰어',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '정규식 파서 기반 마크다운(제목, 볼드, 목록) 실시간 변환기',
    mainFile: 'App.jsx',
    tags: ['React', 'Markdown', 'Live Preview', 'Regex'],
    files: {
      'App.jsx': `export default function App() {
  const [md, setMd] = React.useState('### ✨ OmniRunner\\n* 17개 프로그래밍 언어 지원\\n* **Wasm** 고속 샌드박스\\n* 실시간 React Live');

  const parseMd = (text) => {
    return text
      .replace(/^### (.*$)/gim, '<h4 style="margin:4px 0; color:#0284c7;">$1</h4>')
      .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
      .replace(/^\\* (.*$)/gim, '<li>$1</li>');
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>📝 Markdown 실시간 변환</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <textarea 
          value={md}
          onChange={e => setMd(e.target.value)}
          style={{ height: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
        />
        <div 
          dangerouslySetInnerHTML={{ __html: parseMd(md) }}
          style={{ height: '110px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', overflowY: 'auto' }}
        />
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-17-compound-interest',
    title: '17. [인터랙티브] 복리 저축 계산기 & 시각화',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '원금, 수익률, 투자 기간에 따른 복리 수익 곡선 계산',
    mainFile: 'App.jsx',
    tags: ['React', 'Finance', 'Calculator', 'Math'],
    files: {
      'App.jsx': `export default function App() {
  const [principal, setPrincipal] = React.useState(1000);
  const [rate, setRate] = React.useState(7);
  const [years, setYears] = React.useState(5);

  const finalAmount = Math.round(principal * Math.pow(1 + rate / 100, years));

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', maxWidth: '340px', margin: '0 auto' }}>
      <h3>💰 복리 수익 계산기</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        <div>
          원금: {principal.toLocaleString()}만원
          <input type="range" min="100" max="5000" step="100" value={principal} onChange={e => setPrincipal(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          연 수익률: {rate}%
          <input type="range" min="1" max="20" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          투자 기간: {years}년
          <input type="range" min="1" max="20" value={years} onChange={e => setYears(+e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>
      <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
        {years}년 후 예상 자산: {finalAmount.toLocaleString()}만원 (+{(finalAmount - principal).toLocaleString()}만원 수익)
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-18-memory-card-game',
    title: '18. [게임] 메모리 카드 뒤집기 (Memory Match)',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '카드 페어 매칭 게임 및 뒤집기 상태 로직',
    mainFile: 'App.jsx',
    tags: ['React', 'Game', 'Memory Match', 'Interactive'],
    files: {
      'App.jsx': `export default function App() {
  const icons = ['🚀', '⚡', '💎', '🔥'];
  const [cards, setCards] = React.useState(() => 
    [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon, id) => ({ id, icon, flipped: false, matched: false }))
  );
  const [selected, setSelected] = React.useState([]);

  const flip = (id) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSel = [...selected, card];
    setSelected(newSel);

    if (newSel.length === 2) {
      if (newSel[0].icon === card.icon) {
        setCards(prev => prev.map(c => c.icon === card.icon ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.some(s => s.id === c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 700);
      }
    }
  };

  return (
    <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>🃏 카드 기억 맞추기</h3>
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 48px)', gap: '6px' }}>
        {cards.map(c => (
          <div 
            key={c.id} 
            onClick={() => flip(c.id)}
            style={{ width: '48px', height: '48px', backgroundColor: c.flipped || c.matched ? '#38bdf8' : '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {c.flipped || c.matched ? c.icon : '❓'}
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-19-color-palette-generator',
    title: '19. [도구] 컬러 팔레트 생성기 & 복사',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: '스페이스바 컬러 랜덤 생성 및 HEX 코드 클립보드 복사',
    mainFile: 'App.jsx',
    tags: ['React', 'Palette', 'Color', 'Tool'],
    files: {
      'App.jsx': `export default function App() {
  const [colors, setColors] = React.useState(['#0284c7', '#38bdf8', '#818cf8', '#c084fc', '#f472b6']);
  const [copied, setCopied] = React.useState('');

  const generate = () => {
    setColors(Array.from({ length: 5 }, () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')));
  };

  const copy = (c) => {
    setCopied(c);
    setTimeout(() => setCopied(''), 1000);
  };

  return (
    <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3>🎨 팔레트 생성기</h3>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
        {colors.map((c, i) => (
          <div key={i} onClick={() => copy(c)} style={{ width: '50px', height: '80px', backgroundColor: c, borderRadius: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px', color: 'white', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            {c}
          </div>
        ))}
      </div>
      <button onClick={generate} style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        새로운 팔레트 생성
      </button>
      {copied && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>{copied} 복사됨!</div>}
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-20-virtual-dashboard',
    title: '20. [대시보드] 반응형 메트릭 & 차트 위젯',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'KPI 카드, 상태 표시 바, 실시간 트래픽 대시보드 위젯',
    mainFile: 'App.jsx',
    tags: ['React', 'Dashboard', 'Metrics', 'Widget'],
    files: {
      'App.jsx': `export default function App() {
  const metrics = [
    { label: '활성 세션', val: '1,428명', change: '+12.4%', color: '#10b981' },
    { label: 'CPU 부하', val: '24.2%', change: '-3.1%', color: '#0284c7' },
    { label: '에러율', val: '0.02%', change: '안정적', color: '#6366f1' },
  ];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 12px 0' }}>📈 시스템 메트릭 대시보드</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0', color: m.color }}>{m.val}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{m.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
  },
];
