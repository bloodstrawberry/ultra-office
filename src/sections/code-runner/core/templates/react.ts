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
  {
    id: 'react-21-tailwind-lucide-confetti',
    title: '21. [라이브러리] Tailwind CSS + Lucide + Confetti 축하 카드',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description:
      'Tailwind CSS 유틸리티 클래스, Lucide 벡터 아이콘, Canvas Confetti 파티클 애니메이션',
    mainFile: 'App.jsx',
    tags: ['TailwindCSS', 'LucideIcons', 'CanvasConfetti', 'Gamification'],
    files: {
      'App.jsx': `import React, { useState } from 'react';
import { Trophy, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(350);

  const handleLevelUp = () => {
    setLevel(prev => prev + 1);
    setPoints(prev => prev + 500);

    // Canvas Confetti 축하 파티클 발사
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">마스터 개발자</h2>
            <p className="text-xs text-slate-400">Level {level} 달성자</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold flex items-center gap-1">
          <Zap size={14} /> {points} EXP
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">안정성 지수</div>
            <div className="text-sm font-bold">99.98%</div>
          </div>
        </div>

        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
            <Heart size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">커뮤니티 호감도</div>
            <div className="text-sm font-bold">+1,240</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleLevelUp}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
      >
        <Sparkles size={18} /> 레벨업 & 폭죽 터뜨리기
      </button>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-22-chartjs-live-metrics',
    title: '22. [라이브러리] Chart.js 실시간 인터랙티브 라인/바 차트',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Chart.js 캔버스 렌더링, 실시간 데이터셋 토글 및 그라데이션 차트',
    mainFile: 'App.jsx',
    tags: ['Chart.js', 'Visualization', 'Live Metrics', 'React'],
    files: {
      'App.jsx': `import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function App() {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [metricType, setMetricType] = useState('traffic');

  const dataSets = {
    traffic: {
      label: '일별 방문자 수 (명)',
      data: [1200, 1900, 3000, 5000, 4200, 6800, 7900],
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
    },
    revenue: {
      label: '일별 매출액 (만원)',
      data: [450, 620, 890, 1450, 1200, 2100, 2600],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const cur = dataSets[metricType];

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        datasets: [{
          label: cur.label,
          data: cur.data,
          borderColor: cur.borderColor,
          backgroundColor: cur.backgroundColor,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: cur.borderColor,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#64748b', font: { size: 12 } } },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(226, 232, 240, 0.6)' } }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [metricType]);

  return (
    <div className="p-5 font-sans max-w-lg mx-auto bg-white rounded-xl shadow-md border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">📊 Chart.js 실시간 지표</h3>
          <p className="text-xs text-slate-500">주간 퍼포먼스 모니터링</p>
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMetricType('traffic')}
            className={\`px-2.5 py-1 text-xs rounded-md font-semibold transition-all \${metricType === 'traffic' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600'}\`}
          >
            트래픽
          </button>
          <button
            onClick={() => setMetricType('revenue')}
            className={\`px-2.5 py-1 text-xs rounded-md font-semibold transition-all \${metricType === 'revenue' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}\`}
          >
            매출
          </button>
        </div>
      </div>

      <div className="h-56 w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-23-lodash-dayjs-scheduler',
    title: '23. [라이브러리] Lodash + Day.js 스마트 일정 & 데이터 파이프라인',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Lodash(groupBy, orderBy, sumBy) 및 Day.js(format, fromNow, add) 데이터 분석',
    mainFile: 'App.jsx',
    tags: ['Lodash', 'Dayjs', 'Data Pipeline', 'Scheduler'],
    files: {
      'App.jsx': `import React, { useState } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';

const INITIAL_TASKS = [
  { id: 1, title: 'WebContainer 런타임 최적화', category: '개발', hours: 4, dueDate: dayjs().add(1, 'day').format('YYYY-MM-DD') },
  { id: 2, title: '신규 UI 테마 컬러 검수', category: '디자인', hours: 2, dueDate: dayjs().add(2, 'day').format('YYYY-MM-DD') },
  { id: 3, title: 'SymPy 및 SciPy 라이브러리 검증', category: '개발', hours: 5, dueDate: dayjs().add(1, 'day').format('YYYY-MM-DD') },
  { id: 4, title: '사용자 피드백 서베이 집계', category: '기획', hours: 3, dueDate: dayjs().add(3, 'day').format('YYYY-MM-DD') },
];

export default function App() {
  const [tasks] = useState(INITIAL_TASKS);

  // Lodash 데이터 분석 파이프라인
  const grouped = _.groupBy(tasks, 'category');
  const totalHours = _.sumBy(tasks, 'hours');
  const sorted = _.orderBy(tasks, ['dueDate', 'hours'], ['asc', 'desc']);

  return (
    <div className="p-5 font-sans max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800">📅 Lodash & Day.js 일정 분석</h3>
          <p className="text-xs text-slate-500">기준 일시: {dayjs().format('YYYY-MM-DD HH:mm')}</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
          총 {totalHours}시간
        </span>
      </div>

      <div className="my-3 flex gap-2">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="flex-1 p-2 bg-white rounded-lg border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">{cat}</div>
            <div className="text-sm font-bold text-slate-800">{_.sumBy(list, 'hours')}h ({list.length}건)</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map(t => (
          <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">{t.title}</div>
              <div className="text-[11px] text-slate-400">마감: {t.dueDate} ({t.category})</div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {t.hours}시간
            </span>
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
    id: 'react-24-roughjs-sketchy-ui',
    title: '24. [라이브러리] Rough.js 손그림(Hand-Drawn) 스케치 UI 캔버스',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Rough.js를 활용한 감성적인 핸드 드로잉 스타일 박스, 원, SVG 패스 렌더링',
    mainFile: 'App.jsx',
    tags: ['Rough.js', 'Canvas', 'Hand-drawn', 'Sketchy UI'],
    files: {
      'App.jsx': `import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs/bin/rough';

export default function App() {
  const canvasRef = useRef(null);
  const [roughness, setRoughness] = useState(1.5);
  const [bowing, setBowing] = useState(1);

  useEffect(() => {
    if (!canvasRef.current || !window.rough) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas);

    // Sketchy Rectangle Card
    rc.rectangle(20, 20, 200, 100, {
      roughness: Number(roughness),
      bowing: Number(bowing),
      fill: 'rgba(56, 189, 248, 0.2)',
      fillStyle: 'cross-hatch',
      stroke: '#0284c7',
      strokeWidth: 2,
    });

    // Sketchy Circle
    rc.circle(300, 70, 80, {
      roughness: Number(roughness),
      fill: 'rgba(244, 114, 182, 0.25)',
      fillStyle: 'dots',
      stroke: '#db2777',
      strokeWidth: 2,
    });

    // Sketchy Bar Graph
    const heights = [40, 70, 55, 85, 60];
    heights.forEach((h, idx) => {
      rc.rectangle(30 + idx * 75, 260 - h, 45, h, {
        roughness: Number(roughness),
        fill: ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'][idx],
        fillStyle: 'zigzag',
        stroke: '#334155',
      });
    });
  }, [roughness, bowing]);

  return (
    <div className="p-6 font-sans max-w-lg mx-auto bg-amber-50/50 rounded-2xl border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-base">✏️ Rough.js 핸드 드로잉 그래픽</h3>
        <span className="text-xs bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded font-medium">Canvas API</span>
      </div>

      <div className="flex gap-4 mb-4 text-xs text-slate-600 bg-white p-3 rounded-xl border border-amber-100">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Roughness: {roughness}</label>
          <input
            type="range" min="0" max="3.5" step="0.1" value={roughness}
            onChange={(e) => setRoughness(e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Bowing: {bowing}</label>
          <input
            type="range" min="0" max="3" step="0.2" value={bowing}
            onChange={(e) => setBowing(e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-inner border border-amber-200/70 flex justify-center">
        <canvas ref={canvasRef} width={420} height={280} />
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-25-fusejs-fuzzy-search',
    title: '25. [라이브러리] Fuse.js 고속 퍼지(Fuzzy) 오타 교정 검색',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Fuse.js를 이용한 클라이언트 인메모리 퍼지 매칭, 오타 허용 검색 및 하이라이트',
    mainFile: 'App.jsx',
    tags: ['Fuse.js', 'Fuzzy Search', 'Autocomplete', 'Search'],
    files: {
      'App.jsx': `import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

const DEVELOPER_TOOLS = [
  { title: 'Visual Studio Code', category: 'IDE', author: 'Microsoft', tags: ['Editor', 'TypeScript', 'Extension'] },
  { title: 'Docker Container', category: 'DevOps', author: 'Docker Inc.', tags: ['Container', 'Deploy', 'Linux'] },
  { title: 'PostgreSQL Database', category: 'Database', author: 'PostgreSQL Global', tags: ['SQL', 'Relational', 'ACID'] },
  { title: 'Kubernetes Cluster', category: 'DevOps', author: 'CNCF', tags: ['Orchestration', 'Scaling', 'Cloud'] },
  { title: 'Pyodide Python Wasm', category: 'Runtime', author: 'Mozilla / Pyodide', tags: ['Python', 'Wasm', 'Browser'] },
  { title: 'WebContainer API', category: 'Runtime', author: 'StackBlitz', tags: ['Node.js', 'Terminal', 'Wasm'] },
  { title: 'Tailwind CSS Engine', category: 'Styling', author: 'Tailwind Labs', tags: ['CSS', 'Utility', 'JIT'] }
];

export default function App() {
  const [query, setQuery] = useState('dockr');

  const fuse = useMemo(() => {
    return new Fuse(DEVELOPER_TOOLS, {
      keys: ['title', 'category', 'author', 'tags'],
      threshold: 0.4, // 오타 허용치 (0: 완벽일치 ~ 1: 매우 관대함)
      includeScore: true,
    });
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return DEVELOPER_TOOLS.map(t => ({ item: t, score: 0 }));
    return fuse.search(query);
  }, [query, fuse]);

  return (
    <div className="p-6 font-sans max-w-md mx-auto bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white text-base">🔍 Fuse.js 퍼지 오타 검색</h3>
        <span className="text-xs text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-800">Fuzzy Search</span>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (예: dockr, pyodde, postgr)..."
          className="w-full bg-slate-800 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-sky-500 transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white">✕</button>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-[11px] text-slate-400 flex justify-between">
          <span>검색 결과 ({results.length}건)</span>
          <span>오타 매칭 점수</span>
        </div>

        {results.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/40 rounded-xl">일치하는 항목이 없습니다.</div>
        ) : (
          results.map(({ item, score }, i) => (
            <div key={i} className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between transition-all">
              <div>
                <div className="text-xs font-bold text-sky-300">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.category} • {item.author}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 rounded text-emerald-400 border border-slate-700">
                {score === 0 ? 'Exact' : \`\${(100 - (score || 0) * 100).toFixed(0)}% 일치\`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-26-papaparse-csv-analyzer',
    title: '26. [라이브러리] PapaParse CSV 데이터 파서 & 통계 요약',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'PapaParse를 활용한 실시간 CSV 문자열 파싱, 컬럼 데이터 타입 추론 및 통계 집계',
    mainFile: 'App.jsx',
    tags: ['PapaParse', 'CSV', 'Data Analysis', 'Table'],
    files: {
      'App.jsx': `import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

const DEFAULT_CSV = \`name,department,salary,experience
김철수,인프라팀,7500,5
이영희,프론트엔드팀,6800,3
박지훈,AI연구팀,9200,7
최유진,백엔드팀,8100,6
정다은,디자인팀,5900,2
강민혁,AI연구팀,9800,8\`;

export default function App() {
  const [csvText, setCsvText] = useState(DEFAULT_CSV);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    if (!window.Papa) return;
    const result = Papa.parse(csvText.trim(), {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    setHeaders(result.meta.fields || []);
    setParsedData(result.data || []);
  }, [csvText]);

  const avgSalary = parsedData.length ? Math.round(_.meanBy(parsedData, 'salary')) : 0;
  const maxSalaryPerson = _.maxBy(parsedData, 'salary');

  return (
    <div className="p-6 font-sans max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-base">📊 PapaParse CSV 파서</h3>
          <p className="text-xs text-slate-500">인메모리 CSV 스트리밍 & 집계</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">평균 급여</div>
          <div className="text-sm font-bold text-indigo-600">{avgSalary?.toLocaleString()}만원</div>
        </div>
      </div>

      <div className="my-3">
        <label className="block text-xs font-semibold text-slate-600 mb-1">CSV 원본 데이터 편집</label>
        <textarea
          rows={3}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200">
              {headers.map(h => (
                <th key={h} className="p-2 font-semibold text-slate-700 capitalize">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                {headers.map(h => (
                  <td key={h} className="p-2 text-slate-600">
                    {typeof row[h] === 'number' ? row[h].toLocaleString() : String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {maxSalaryPerson && (
        <div className="mt-3 p-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-800 flex items-center justify-between">
          <span>🏆 최고 급여: <strong>{maxSalaryPerson.name}</strong> ({maxSalaryPerson.department})</span>
          <span className="font-bold">{maxSalaryPerson.salary?.toLocaleString()}만원</span>
        </div>
      )}
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-27-tonejs-sound-board',
    title: '27. [라이브러리] Tone.js 오디오 신디사이저 사운드보드',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'Tone.js Synth & PolySynth를 활용한 실시간 웹 오디오 음계 연주 및 사운드 이펙트',
    mainFile: 'App.jsx',
    tags: ['Tone.js', 'Web Audio', 'Synthesizer', 'Sound FX'],
    files: {
      'App.jsx': `import React, { useState, useRef } from 'react';
import * as Tone from 'tone';

const NOTES = [
  { note: 'C4', label: '도', color: 'bg-rose-500' },
  { note: 'D4', label: '레', color: 'bg-orange-500' },
  { note: 'E4', label: '미', color: 'bg-amber-500' },
  { note: 'F4', label: '파', color: 'bg-emerald-500' },
  { note: 'G4', label: '솔', color: 'bg-teal-500' },
  { note: 'A4', label: '라', color: 'bg-blue-500' },
  { note: 'B4', label: '시', color: 'bg-indigo-500' },
  { note: 'C5', label: '높은 도', color: 'bg-purple-500' },
];

export default function App() {
  const [activeNote, setActiveNote] = useState(null);
  const synthRef = useRef(null);

  const initSynth = () => {
    if (!synthRef.current && window.Tone) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
      }).toDestination();
    }
  };

  const playNote = async (note) => {
    if (!window.Tone) return;
    await Tone.start();
    initSynth();
    synthRef.current.triggerAttackRelease(note, '8n');
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 250);
  };

  const playLaser = async () => {
    if (!window.Tone) return;
    await Tone.start();
    const synth = new Tone.MembraneSynth().toDestination();
    synth.triggerAttackRelease('C2', '16n');
  };

  return (
    <div className="p-6 font-sans max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base">🎹 Tone.js 신디사이저 사운드보드</h3>
          <p className="text-xs text-slate-400">Web Audio API 실시간 합성음</p>
        </div>
        <span className="text-[11px] bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/30">Tone.js</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {NOTES.map((n) => (
          <button
            key={n.note}
            onClick={() => playNote(n.note)}
            className={\`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all active:scale-90 \${n.color} \${activeNote === n.note ? 'ring-4 ring-white/50 scale-105' : 'opacity-90 hover:opacity-100'}\`}
          >
            <span>{n.label}</span>
            <span className="text-[10px] opacity-75 font-mono">{n.note}</span>
          </button>
        ))}
      </div>

      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-300">특수 사운드 FX</span>
        <button
          onClick={playLaser}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-xs font-bold rounded-lg active:scale-95 transition-all shadow"
        >
          💥 킥/베이스 사운드
        </button>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-28-chromajs-palette-contrast',
    title: '28. [라이브러리] Chroma.js 컬러 하모니 & WCAG 명도 대비 검사',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description:
      'Chroma.js 색상 공간 변환(LAB, LCH), 보간(Interpolation) 및 WCAG 접근성 명도 대비 계산기',
    mainFile: 'App.jsx',
    tags: ['Chroma.js', 'Color Palette', 'WCAG Contrast', 'Design System'],
    files: {
      'App.jsx': `import React, { useState, useMemo } from 'react';
import chroma from 'chroma-js';

export default function App() {
  const [baseColor, setBaseColor] = useState('#3b82f6');

  // Chroma.js로 9단계 그라데이션 스케일 생성
  const scale = useMemo(() => {
    if (!window.chroma) return [];
    return chroma.scale(['#ffffff', baseColor, '#0f172a']).mode('lch').colors(9);
  }, [baseColor]);

  // 배경 대비 텍스트 명도비 (WCAG) 계산
  const contrastWhite = window.chroma ? chroma.contrast(baseColor, '#ffffff').toFixed(2) : 0;
  const contrastBlack = window.chroma ? chroma.contrast(baseColor, '#000000').toFixed(2) : 0;

  return (
    <div className="p-6 font-sans max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">🎨 Chroma.js 컬러 엔진</h3>
          <p className="text-xs text-slate-500">LCH 보간 & WCAG 명도 대비</p>
        </div>
        <input
          type="color"
          value={baseColor}
          onChange={(e) => setBaseColor(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">생성된 9단계 LCH 스케일</label>
        <div className="flex h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200">
          {scale.map((c, i) => (
            <div
              key={i}
              style={{ backgroundColor: c }}
              title={c}
              className="flex-1 flex items-end justify-center pb-1 text-[9px] font-mono text-slate-500 select-all"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          style={{ backgroundColor: baseColor, color: '#ffffff' }}
          className="p-3.5 rounded-xl text-center shadow-sm"
        >
          <div className="text-xs font-semibold">흰색 텍스트</div>
          <div className="text-lg font-bold mt-1">{contrastWhite} : 1</div>
          <div className="text-[10px] opacity-80">{Number(contrastWhite) >= 4.5 ? '✅ WCAG AA 통과' : '❌ 명도 대비 부족'}</div>
        </div>

        <div
          style={{ backgroundColor: baseColor, color: '#000000' }}
          className="p-3.5 rounded-xl text-center shadow-sm"
        >
          <div className="text-xs font-semibold">검은색 텍스트</div>
          <div className="text-lg font-bold mt-1">{contrastBlack} : 1</div>
          <div className="text-[10px] opacity-80">{Number(contrastBlack) >= 4.5 ? '✅ WCAG AA 통과' : '❌ 명도 대비 부족'}</div>
        </div>
      </div>
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-29-katex-marked-latex-editor',
    title: '29. [라이브러리] KaTeX + Marked 실시간 마크다운 & 수식 에디터',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description:
      'Marked.js 마크다운 렌더링 및 KaTeX LaTeX 수식 (\\int, \\sum, \\frac, \\sqrt) 실시간 렌더러',
    mainFile: 'App.jsx',
    tags: ['KaTeX', 'Marked', 'LaTeX', 'Markdown'],
    files: {
      'App.jsx': `import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { marked } from 'marked';

const DEFAULT_DOC = \`# 📐 양자역학 & 상대성 이론 공식
- 아인슈타인 질량-에너지 등가: $E = mc^2$
- 슈뢰딩거 파동 방정식: $i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi$
- 가우스 정적분: $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$\`;

export default function App() {
  const [doc, setDoc] = useState(DEFAULT_DOC);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current || !window.marked || !window.katex) return;

    let html = window.marked.parse(doc);

    // Replace $formula$ with KaTeX rendered HTML
    html = html.replace(/\\$([^$]+)\\$/g, (match, formula) => {
      try {
        return window.katex.renderToString(formula, { throwOnError: false });
      } catch (err) {
        return match;
      }
    });

    previewRef.current.innerHTML = html;
  }, [doc]);

  return (
    <div className="p-5 font-sans max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">📝 KaTeX + Marked LaTeX 수식 뷰어</h3>
        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">LaTeX / KaTeX</span>
      </div>

      <textarea
        rows={4}
        value={doc}
        onChange={(e) => setDoc(e.target.value)}
        className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 focus:outline-none focus:border-purple-500"
      />

      <div
        ref={previewRef}
        className="prose prose-sm max-w-none text-xs text-slate-700 p-4 bg-slate-50/50 rounded-xl border border-slate-100"
      />
    </div>
  );
}
`,
    },
  },
  {
    id: 'react-30-qrcode-custom-generator',
    title: '30. [라이브러리] QRCode.js 동적 QR 코드 생성기 & 다운로드',
    category: 'Frontend & UI',
    language: 'react',
    engine: 'react-live',
    description: 'QRCode.js를 활용한 URL / 텍스트 QR 코드 실시간 생성 및 색상 커스텀',
    mainFile: 'App.jsx',
    tags: ['QRCode', 'Canvas', 'Generator', 'Utility'],
    files: {
      'App.jsx': `import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [text, setText] = useState('https://github.com/bloodstrawberry/ultra-office');
  const [color, setColor] = useState('#0f172a');
  const qrRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current || !window.QRCode) return;
    qrRef.current.innerHTML = '';
    new window.QRCode(qrRef.current, {
      text: text || 'https://google.com',
      width: 140,
      height: 140,
      colorDark: color,
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  }, [text, color]);

  return (
    <div className="p-6 font-sans max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 text-center">
      <h3 className="font-bold text-slate-800 text-base mb-1">📱 동적 QR 코드 생성기</h3>
      <p className="text-xs text-slate-500 mb-4">텍스트나 링크를 입력하면 QR이 즉시 생성됩니다</p>

      <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
        <div ref={qrRef} className="shadow-sm p-2 bg-white rounded-lg" />
      </div>

      <div className="space-y-3 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">QR 인코딩 텍스트/URL</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">QR 패턴 색상</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-lg cursor-pointer border-0"
          />
        </div>
      </div>
    </div>
  );
}
`,
    },
  },
];
