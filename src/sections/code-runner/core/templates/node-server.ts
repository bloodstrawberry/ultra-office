import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const NODE_SERVER_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: Express REST API 기초 10선] ---
  {
    id: 'node-01-basic-express',
    title: '01. Express 헬로월드 & JSON 응답',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'Express.js 기본 포트 리스닝 및 GET / JSON 응답',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Node.js', 'REST API'],
    files: {
      'server.js': `import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '✨ Express.js WebContainer Server is Running!', port: PORT });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server ready at http://localhost:\${PORT}\`);
});
`,
      'package.json': JSON.stringify(
        {
          name: 'express-basic',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-02-route-params',
    title: '02. 라우트 파라미터 & 쿼리 스트링',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'req.params (URL 경로 변수) 및 req.query (검색 필터) 처리',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Params', 'Query'],
    files: {
      'server.js': `import express from 'express';
const app = express();
const PORT = 3000;

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const { detail } = req.query;
  res.json({ userId: id, includeDetail: detail === 'true', timestamp: Date.now() });
});

app.listen(PORT, () => console.log(\`Server on http://localhost:\${PORT}\`));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-params',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-03-crud-inmemory',
    title: '03. 인메모리 REST CRUD API',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'GET, POST, PUT, DELETE 표준 RESTful 엔드포인트 구현',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'CRUD', 'REST'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

let items = [
  { id: 1, title: 'Learn WebContainer' },
  { id: 2, title: 'Master Next.js 15' }
];

app.get('/api/items', (req, res) => res.json(items));
app.post('/api/items', (req, res) => {
  const newItem = { id: Date.now(), title: req.body.title };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(3000, () => console.log('CRUD Server ready on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-crud',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-04-custom-middleware',
    title: '04. 커스텀 미들웨어 (Request Logger)',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'HTTP 요청 메서드, URL, 응답 소요 시간(ms) 로깅 미들웨어',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Middleware', 'Logger'],
    files: {
      'server.js': `import express from 'express';
const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url} \${res.statusCode} (\${Date.now() - start}ms)\`);
  });
  next();
});

app.get('/api/status', (req, res) => res.json({ status: 'OK' }));
app.listen(3000, () => console.log('Logger server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-middleware',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-05-global-error-handler',
    title: '05. 글로벌 에러 핸들링 미들웨어',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '(err, req, res, next) 중앙 집중식 오류 응답 포맷팅',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Error Handling', 'Middleware'],
    files: {
      'server.js': `import express from 'express';
const app = express();

app.get('/error-test', (req, res, next) => {
  const err = new Error('의도적인 500 에러 발생');
  err.status = 500;
  next(err);
});

app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.message);
  res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
});

app.listen(3000, () => console.log('Error-handling server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-errors',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-06-static-serving',
    title: '06. 정적 파일 서빙 (express.static)',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'public 디렉토리 정적 파일(HTML, CSS, 이미지) 서빙',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Static', 'Public'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.static('public'));

app.listen(3000, () => console.log('Static server ready at http://localhost:3000/index.html'));
`,
      'public/index.html': `<!DOCTYPE html><html><body><h1>Served via express.static</h1></body></html>`,
      'package.json': JSON.stringify(
        {
          name: 'express-static',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-07-bearer-auth',
    title: '07. Bearer Token 인증 가드 미들웨어',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'Authorization: Bearer <token> 헤더 검증 및 401 Unauthorized 보호',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Auth', 'Bearer Token', 'Security'],
    files: {
      'server.js': `import express from 'express';
const app = express();

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer secret-token-123')) {
    return res.status(401).json({ error: '인증 실패: 유효한 토큰이 필요합니다.' });
  }
  next();
};

app.get('/public', (req, res) => res.json({ access: 'public' }));
app.get('/protected', requireAuth, (req, res) => res.json({ access: 'granted', secret: 'Top Secret Data' }));

app.listen(3000, () => console.log('Auth server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-auth',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-08-body-validation',
    title: '08. 요청 바디(Body) 스키마 검증',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'POST 본문 필수 필드 및 타입 검증 헬퍼',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Validation', 'Body'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { email, age } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '이메일 형식 오류' });
  }
  if (typeof age !== 'number' || age < 18) {
    return res.status(400).json({ error: '18세 이상만 가입 가능' });
  }
  res.status(201).json({ success: true, email });
});

app.listen(3000, () => console.log('Validation server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-val',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-09-search-pagination',
    title: '09. 검색 & 페이지네이션 API',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'page, limit, search 파라미터를 지원하는 REST 엔드포인트',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Pagination', 'Search'],
    files: {
      'server.js': `import express from 'express';
const app = express();

const DB = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: \`Item #\${i + 1}\` }));

app.get('/api/search', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q || '';

  const filtered = DB.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data });
});

app.listen(3000, () => console.log('Pagination server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-pages',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-10-health-metrics',
    title: '10. 헬스체크(Healthcheck) & 시스템 메트릭',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '/healthz 엔드포인트 및 process.memoryUsage() 모니터링',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Healthcheck', 'Metrics'],
    files: {
      'server.js': `import express from 'express';
const app = express();

app.get('/healthz', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'HEALTHY',
    uptimeSec: process.uptime().toFixed(2),
    memory: {
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2)
    },
    nodeVersion: process.version
  });
});

app.listen(3000, () => console.log('Healthcheck ready on http://localhost:3000/healthz'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-health',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },

  // --- [Part 2: 고급 백엔드 아키텍처 패턴 10선] ---
  {
    id: 'node-11-sse-streaming',
    title: '11. [실시간] SSE (Server-Sent Events) 스트림',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'text/event-stream 헤더를 활용한 실시간 이벤트 푸시',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['SSE', 'Streaming', 'Realtime', 'Events'],
    files: {
      'server.js': `import express from 'express';
const app = express();

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let count = 0;
  const timer = setInterval(() => {
    count++;
    res.write(\`data: \${JSON.stringify({ event: 'ping', count, time: new Date().toISOString() })}\\n\\n\`);
    if (count >= 5) {
      clearInterval(timer);
      res.end();
    }
  }, 1000);

  req.on('close', () => clearInterval(timer));
});

app.listen(3000, () => console.log('SSE Stream on http://localhost:3000/events'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-sse',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-12-rate-limiter',
    title: '12. [보안] IP 기반 Rate Limiting 미들웨어',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '단위 시간당 최대 요청 수를 제한하는 속도 제한 가드',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Rate Limiting', 'Security', 'Middleware'],
    files: {
      'server.js': `import express from 'express';
const app = express();

const requests = new Map();
const LIMIT = 5;
const WINDOW_MS = 10000;

app.use((req, res, next) => {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const timestamps = (requests.get(ip) || []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= LIMIT) {
    return res.status(429).json({ error: 'Too Many Requests (초과 요청 거절)' });
  }

  timestamps.push(now);
  requests.set(ip, timestamps);
  next();
});

app.get('/api/resource', (req, res) => res.json({ data: 'Protected Resource Data' }));
app.listen(3000, () => console.log('Rate limiter on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-limiter',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-13-cache-aside',
    title: '13. [캐싱] In-Memory Cache-Aside 패턴',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'TTL 기반 메모리 캐시 조회 및 미스 시 DB 쿼리 시뮬레이션',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Caching', 'Cache-Aside', 'TTL', 'Performance'],
    files: {
      'server.js': `import express from 'express';
const app = express();

const cache = new Map();
const TTL = 5000; // 5초

app.get('/api/slow-data', (req, res) => {
  const now = Date.now();
  if (cache.has('slow_key')) {
    const entry = cache.get('slow_key');
    if (now - entry.time < TTL) {
      return res.json({ source: 'CACHE', data: entry.data, ageMs: now - entry.time });
    }
  }

  const computed = { result: 'Heavy Calculation Result', generatedAt: now };
  cache.set('slow_key', { data: computed, time: now });
  res.json({ source: 'DB_COMPUTED', data: computed });
});

app.listen(3000, () => console.log('Cache server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-cache',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-14-job-queue-worker',
    title: '14. [비동기 큐] 인메모리 백그라운드 작업 워커',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '비동기 Job Queue 등록 및 워커 스레드 순차 처리',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Job Queue', 'Worker', 'Async Queue'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

const queue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  const job = queue.shift();
  console.log(\`[Worker] 작업 처리 시작: #\${job.id} (\${job.type})\`);
  await new Promise(r => setTimeout(r, 1000));
  console.log(\`[Worker] 작업 완료: #\${job.id}\`);
  isProcessing = false;
  processQueue();
}

app.post('/api/jobs', (req, res) => {
  const job = { id: Date.now(), type: req.body.type || 'EMAIL_SEND' };
  queue.push(job);
  processQueue();
  res.status(202).json({ message: '작업 큐에 접수됨', job });
});

app.listen(3000, () => console.log('Queue worker server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-queue',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-15-webhook-dispatcher',
    title: '15. [이벤트] 웹훅(Webhook) 브로드캐스터',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '구독자 웹훅 URL 등록 및 이벤트 발생 시 비동기 디스패치',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Webhook', 'Events', 'Dispatcher'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

const webhooks = [];

app.post('/webhooks/subscribe', (req, res) => {
  const { url, event } = req.body;
  webhooks.push({ id: Date.now(), url, event });
  res.json({ message: '웹훅 등록 완료', totalWebhooks: webhooks.length });
});

app.post('/events/trigger', (req, res) => {
  const { eventType, payload } = req.body;
  const targets = webhooks.filter(w => w.event === eventType);
  console.log(\`[Webhook] \${targets.length}개 구독자에게 '\${eventType}' 브로드캐스트\`);
  res.json({ dispatched: targets.length });
});

app.listen(3000, () => console.log('Webhook server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-webhook',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-16-circuit-breaker',
    title: '16. [복원력] 서킷 브레이커 (Circuit Breaker)',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '연속 실패 감지 시 즉시 차단(OPEN) 및 자동 복구(HALF-OPEN)',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Circuit Breaker', 'Resilience', 'Architecture'],
    files: {
      'server.js': `import express from 'express';
const app = express();

let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
let failureCount = 0;

app.get('/api/external', (req, res) => {
  if (state === 'OPEN') {
    return res.status(503).json({ error: 'Circuit is OPEN. 서비스 일시 차단 중' });
  }

  const success = Math.random() > 0.5;
  if (!success) {
    failureCount++;
    if (failureCount >= 3) {
      state = 'OPEN';
      setTimeout(() => { state = 'HALF_OPEN'; failureCount = 0; }, 5000);
    }
    return res.status(500).json({ error: '외부 서비스 호출 실패', state });
  }

  res.json({ message: '호출 성공', state });
});

app.listen(3000, () => console.log('Circuit breaker server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-circuit',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-17-idempotency-key',
    title: '17. [결제/트랜잭션] 멱등성 키 (Idempotency Key)',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '중복 결제 및 중복 요청 방지를 위한 멱등성 보장 엔드포인트',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Idempotency', 'Payments', 'Transaction'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

const processedKeys = new Map();

app.post('/api/payments', (req, res) => {
  const key = req.headers['idempotency-key'];
  if (!key) return res.status(400).json({ error: 'Idempotency-Key 헤더 누락' });

  if (processedKeys.has(key)) {
    return res.json({ cached: true, ...processedKeys.get(key) });
  }

  const result = { paymentId: 'PAY_' + Date.now(), amount: req.body.amount, status: 'SUCCESS' };
  processedKeys.set(key, result);
  res.status(201).json({ cached: false, ...result });
});

app.listen(3000, () => console.log('Idempotent payment server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-idempotency',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-18-versioned-router',
    title: '18. [API 버전 관리] v1 / v2 서브 라우터',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: 'express.Router()를 활용한 모듈식 API 버전 관리',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Express', 'Router', 'Versioning'],
    files: {
      'server.js': `import express from 'express';
const app = express();

const v1 = express.Router();
v1.get('/users', (req, res) => res.json({ version: 'v1', users: ['Alice', 'Bob'] }));

const v2 = express.Router();
v2.get('/users', (req, res) => res.json({ version: 'v2', users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] }));

app.use('/api/v1', v1);
app.use('/api/v2', v2);

app.listen(3000, () => console.log('Versioned API server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-versioning',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-19-file-upload-mock',
    title: '19. [멀티파트] 파일 업로드 시뮬레이션 파서',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '멀티파트 폼데이터 메타데이터 파싱 및 파일 크기 검증',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Multipart', 'Upload', 'File Parser'],
    files: {
      'server.js': `import express from 'express';
const app = express();
app.use(express.json());

app.post('/api/upload', (req, res) => {
  const { filename, sizeBytes, mimeType } = req.body;
  if (!filename || sizeBytes > 5 * 1024 * 1024) {
    return res.status(400).json({ error: '5MB 이하의 파일만 업로드 가능합니다.' });
  }

  res.json({
    success: true,
    file: { filename, sizeBytes, mimeType, storedPath: \`/uploads/\${Date.now()}_\${filename}\` }
  });
});

app.listen(3000, () => console.log('Upload server on 3000'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-upload',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'node-20-prometheus-metrics',
    title: '20. [관측성] 프로메테우스(Prometheus) 메트릭스 엔드포인트',
    category: 'Backend & Server',
    language: 'node-server',
    engine: 'webcontainer',
    description: '/metrics 텍스트 포맷 시계열 메트릭(HTTP 요청 수, 레이턴시) 출력',
    mainFile: 'server.js',
    entryCommand: 'npm start',
    tags: ['Prometheus', 'Metrics', 'Observability', 'DevOps'],
    files: {
      'server.js': `import express from 'express';
const app = express();

let httpRequestsTotal = 0;

app.use((req, res, next) => {
  httpRequestsTotal++;
  next();
});

app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  const metrics = [
    '# HELP http_requests_total Total number of HTTP requests made.',
    '# TYPE http_requests_total counter',
    \`http_requests_total \${httpRequestsTotal}\`,
    '',
    '# HELP nodejs_heap_bytes Process heap usage.',
    '# TYPE nodejs_heap_bytes gauge',
    \`nodejs_heap_bytes \${process.memoryUsage().heapUsed}\`
  ].join('\\n');
  res.send(metrics);
});

app.listen(3000, () => console.log('Prometheus metrics on http://localhost:3000/metrics'));
`,
      'package.json': JSON.stringify(
        {
          name: 'express-prometheus',
          type: 'module',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.19.2' },
        },
        null,
        2
      ),
    },
  },
];
