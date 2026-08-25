import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const NODE_SERVER_TEMPLATES: CodeTemplate[] = [
  {
    id: 'express-01-hello',
    title: '01. Hello Express.js 웹 서버',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'WebContainer에서 기동되는 기본 Express 웹 서버와 HTML 응답',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Node.js', 'HTTP Server', 'Hello World'],
    files: {
      'server.js': `// ==========================================
// 🌐 [01] Express: Hello Express Web Server
// ==========================================
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>Express Server</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: white; padding: 32px; text-align: center; }
        .box { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 500px; margin: 0 auto; border: 1px solid #334155; }
        h1 { color: #38bdf8; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>⚡ Omni Express Server</h1>
        <p style="margin: 16px 0; color: #94a3b8;">WebContainer 내부에서 실제 구동 중인 Node.js 웹 서버입니다.</p>
        <span class="badge">STATUS: ONLINE (Port \${PORT})</span>
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
        { name: 'express-hello', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-02-routing-params',
    title: '02. URL 라우팅 & 파라미터 (:id)',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: '경로 변수(Path Params)와 쿼리 스트링(Query Params) 추출',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Routing', 'Params', 'Query'],
    files: {
      'server.js': `// ==========================================
// 🌐 [02] Express: 라우팅 & 파라미터
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { role = 'member', tab = 'profile' } = req.query;

  res.json({
    requestedUserId: userId,
    queryParams: { role, tab },
    message: \`User #\${userId} 데이터가 정상 조회되었습니다.\`,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('<h1>Express Routing API</h1><p>테스트 URL: <a href="/users/42?role=admin" style="color: #38bdf8;">/users/42?role=admin</a></p>');
});

app.listen(PORT, () => {
  console.log(\`🚀 라우팅 서버 구동 중: http://localhost:\${PORT}\`);
});
`,
      'package.json': JSON.stringify(
        { name: 'express-routing', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-03-rest-crud',
    title: '03. JSON REST API & CRUD 엔드포인트',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'GET, POST, PUT, DELETE REST API 구현과 인메모리 데이터 관리',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'REST API', 'CRUD', 'JSON'],
    files: {
      'server.js': `// ==========================================
// 🌐 [03] Express: REST API CRUD
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;
app.use(express.json());

let articles = [
  { id: 1, title: 'Node.js WebContainer 소개', author: '민수' },
  { id: 2, title: 'Express 4 vs 5 차이점', author: '지훈' }
];

app.get('/api/articles', (req, res) => res.json(articles));

app.post('/api/articles', (req, res) => {
  const newArticle = { id: Date.now(), title: req.body.title || '제목 없음', author: req.body.author || '익명' };
  articles.push(newArticle);
  res.status(201).json(newArticle);
});

app.get('/', (req, res) => {
  res.send(\`
    <body style="background:#0f172a; color:white; font-family:sans-serif; padding:24px;">
      <h2>📚 Article REST API</h2>
      <p>엔드포인트: <code>/api/articles</code></p>
      <pre style="background:#1e293b; padding:12px; border-radius:8px;">\${JSON.stringify(articles, null, 2)}</pre>
    </body>
  \`);
});

app.listen(PORT, () => console.log(\`🚀 CRUD REST API 실행 중: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-crud', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-04-middleware-logger',
    title: '04. 미들웨어 & 요청 로거',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'HTTP 요청 메서드, URL, 응답 시간을 측정하는 커스텀 로깅 미들웨어',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Middleware', 'Logger', 'Response Time'],
    files: {
      'server.js': `// ==========================================
// 🌐 [04] Express: 요청 로거 미들웨어
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

// 커스텀 로거 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`[\${req.method}] \${req.url} -> \${res.statusCode} (\${duration}ms)\`);
  });
  next();
});

app.get('/', (req, res) => res.send('<h1>로거 미들웨어 테스트 성공</h1>'));
app.get('/api/ping', (req, res) => res.json({ pong: true, time: Date.now() }));

app.listen(PORT, () => console.log(\`🚀 서버 실행 중: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-logger', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-05-error-middleware',
    title: '05. 중앙 집중식 에러 핸들링',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: '4인자 (err, req, res, next) 글로벌 에러 처리 미들웨어',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Error Handling', 'Middleware', 'Exceptions'],
    files: {
      'server.js': `// ==========================================
// 🌐 [05] Express: 글로벌 에러 핸들러
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/error-trigger', (req, res, next) => {
  const err = new Error('가상 데이터베이스 연결 실패!');
  err.status = 500;
  next(err);
});

app.get('/', (req, res) => {
  res.send('<h2>정상 상태</h2><a href="/error-trigger" style="color:red;">에러 발생 테스트 링크</a>');
});

// 글로벌 에러 핸들러 (4개 인자)
app.use((err, req, res, next) => {
  console.error('\\x1b[31m[Global Error Caught]:\\x1b[0m', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message,
    status: err.status || 500
  });
});

app.listen(PORT, () => console.log(\`🚀 에러 처리 서버 실행 중: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-error', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-06-static-html',
    title: '06. 대시보드 웹 서빙',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'Tailwind CSS가 결합된 모던 HTML 웹 대시보드 서빙',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Dashboard', 'UI', 'HTML'],
    files: {
      'server.js': `// ==========================================
// 🌐 [06] Express: 대시보드 웹 서빙
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-white p-8 flex flex-col items-center justify-center min-h-screen">
      <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h1 class="text-xl font-bold text-sky-400">⚡ Omni Express Hub</h1>
        <p class="text-sm text-slate-400">WebContainer 내부 Express 서버가 실시간으로 렌더링한 페이지입니다.</p>
        <div class="bg-slate-800/80 p-3 rounded-lg flex justify-between items-center text-xs font-mono">
          <span>Server Uptime</span>
          <span class="text-emerald-400 font-bold">\${process.uptime().toFixed(1)}s</span>
        </div>
      </div>
    </body>
    </html>
  \`);
});

app.listen(PORT, () => console.log(\`🚀 대시보드 서버 가동: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-static', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-07-auth-mock',
    title: '07. 토큰 기반 인증(Auth) 미들웨어',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'Authorization Header Bearer 토큰 검증 및 보호된 라우트',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Auth', 'Bearer Token', 'Security'],
    files: {
      'server.js': `// ==========================================
// 🌐 [07] Express: 인증(Auth) 미들웨어
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader === 'Bearer secret-token-2026') {
    next();
  } else {
    res.status(401).json({ error: '인증 실패: 유효한 Bearer 토큰이 필요합니다.' });
  }
}

app.get('/api/public', (req, res) => res.json({ message: '누구나 접근 가능한 공개 API' }));
app.get('/api/protected', requireAuth, (req, res) => res.json({ message: '비밀 데이터: 관리자 권한 확인됨' }));

app.get('/', (req, res) => {
  res.send('<h1>인증 미들웨어 테스트</h1><p><a href="/api/public">/api/public</a> | <a href="/api/protected">/api/protected (401 에러)</a></p>');
});

app.listen(PORT, () => console.log(\`🚀 인증 서버 구동: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-auth', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-08-body-validation',
    title: '08. Request Body 유효성 검증',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: 'POST 요청의 필수 필드, 이메일 형식, 비밀번호 길이 사전 검증',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Validation', 'Request Body', 'JSON'],
    files: {
      'server.js': `// ==========================================
// 🌐 [08] Express: 데이터 유효성 검증
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;
app.use(express.json());

function validateUserPayload(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '유효한 이메일을 입력하세요.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' });
  }
  next();
}

app.post('/api/register', validateUserPayload, (req, res) => {
  res.status(201).json({ success: true, user: { email: req.body.email, createdAt: new Date() } });
});

app.get('/', (req, res) => res.send('<h1>POST /api/register 유효성 검증 엔드포인트</h1>'));

app.listen(PORT, () => console.log(\`🚀 검증 서버 구동: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-validate', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-09-query-filtering',
    title: '09. 다중 쿼리 필터링 & 검색 API',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: '카테고리, 가격대, 검색어 기반 상품 목록 필터링 및 페이징',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Filtering', 'Query Search', 'Pagination'],
    files: {
      'server.js': `// ==========================================
// 🌐 [09] Express: 쿼리 필터링 & 검색
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

const products = [
  { id: 1, name: '노트북', category: 'it', price: 1500000 },
  { id: 2, name: '마우스', category: 'accessory', price: 65000 },
  { id: 3, name: '키보드', category: 'accessory', price: 120000 },
  { id: 4, name: '모니터', category: 'it', price: 450000 },
];

app.get('/api/products', (req, res) => {
  let list = [...products];
  const { category, maxPrice } = req.query;

  if (category) list = list.filter(p => p.category === category);
  if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

  res.json({ total: list.length, products: list });
});

app.get('/', (req, res) => {
  res.send('<h2>상품 검색 API</h2><p><a href="/api/products?category=it">/api/products?category=it</a> | <a href="/api/products?maxPrice=200000">/api/products?maxPrice=200000</a></p>');
});

app.listen(PORT, () => console.log(\`🚀 검색 API 서버 구동: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-search', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
  {
    id: 'express-10-dashboard-api',
    title: '10. 실시간 상태 모니터링 서버',
    category: 'Web & Server',
    language: 'node-server',
    engine: 'webcontainer',
    isServer: true,
    defaultPort: 3000,
    description: '메모리 점유율, CPU 가동 시간, API 요청 통계를 실시간 브로드캐스팅',
    mainFile: 'server.js',
    entryCommand: 'node server.js',
    tags: ['Express', 'Monitoring', 'System Metrics', 'Full Server'],
    files: {
      'server.js': `// ==========================================
// 🌐 [10] Express: 시스템 상태 모니터링 서버
// ==========================================
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rss: \`\${(mem.rss / 1024 / 1024).toFixed(1)} MB\`,
      heapUsed: \`\${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB\`
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-white p-6 font-sans">
      <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h1 class="text-xl font-bold text-sky-400 mb-2">⚡ Omni Health Monitor</h1>
        <p class="text-xs text-slate-400 mb-4">5초마다 <code>/api/health</code> 상태를 갱신합니다.</p>
        <div id="metrics" class="space-y-2 text-sm font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
          데이터 로딩 중...
        </div>
      </div>
      <script>
        async function fetchHealth() {
          const res = await fetch('/api/health');
          const data = await res.json();
          document.getElementById('metrics').innerHTML = \`
            <div class="text-emerald-400 font-bold">STATUS: \${data.status}</div>
            <div>Uptime: \${data.uptimeSeconds}s</div>
            <div>Heap: \${data.memory.heapUsed} / RSS: \${data.memory.rss}</div>
            <div class="text-xs text-slate-500 mt-2">\${data.timestamp}</div>
          \`;
        }
        fetchHealth();
        setInterval(fetchHealth, 5000);
      </script>
    </body>
    </html>
  \`);
});

app.listen(PORT, () => console.log(\`🚀 상태 모니터링 서버 가동: http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        { name: 'express-health', type: 'module', version: '1.0.0' },
        null,
        2
      ),
    },
  },
];
