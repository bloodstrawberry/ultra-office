import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const HTML_TEMPLATES: CodeTemplate[] = [
  {
    id: 'html-01-hello',
    title: '01. HTML5 시맨틱 마크업',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'header, main, section, footer 시맨틱 태그와 반응형 CSS 스타일',
    mainFile: 'index.html',
    tags: ['HTML5', 'Semantic', 'CSS', 'Hello World'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>HTML5 Semantic Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    header { border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
    h1 { color: #38bdf8; font-size: 24px; }
    main { display: grid; gap: 16px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <h1>⚡ HTML5 시맨틱 웹 샌드박스</h1>
    <p style="color: #94a3b8; font-size: 14px;">OmniRunner 라이브 브라우저 환경</p>
  </header>
  <main>
    <section class="card">
      <h2 style="font-size: 18px; color: #34d399; margin-bottom: 8px;">1. 웹 표준 시맨틱 구조</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">시맨틱 태그(header, main, section, footer)를 사용하면 검색 엔진 최적화(SEO)와 접근성이 향상됩니다.</p>
    </section>
  </main>
  <footer>© 2026 OmniRunner Polyglot Execution Engine</footer>
</body>
</html>
`,
    },
  },
  {
    id: 'html-02-css-flexbox-grid',
    title: '02. CSS Flexbox & Grid 레이아웃',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: '모던 CSS Grid 카드 그리드와 Flexbox 정렬 시스템',
    mainFile: 'index.html',
    tags: ['CSS', 'Grid', 'Flexbox', 'Layout'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; padding: 24px; }
    .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); border-color: #38bdf8; }
    .badge { align-self: flex-start; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
  </style>
</head>
<body>
  <h2 style="font-size: 20px; color: #38bdf8;">CSS Auto-Fit Grid & Flexbox</h2>
  <div class="grid-container">
    <div class="card"><span class="badge">PRO</span><h3 style="margin: 12px 0 6px;">컴포넌트 1</h3><p style="font-size: 12px; color: #94a3b8;">Flexbox 수직 정렬 카드</p></div>
    <div class="card"><span class="badge">FAST</span><h3 style="margin: 12px 0 6px;">컴포넌트 2</h3><p style="font-size: 12px; color: #94a3b8;">CSS Grid 자동 반응형 폭</p></div>
    <div class="card"><span class="badge">NEW</span><h3 style="margin: 12px 0 6px;">컴포넌트 3</h3><p style="font-size: 12px; color: #94a3b8;">호버 트랜지션 애니메이션</p></div>
  </div>
</body>
</html>
`,
    },
  },
  {
    id: 'html-03-canvas-basics',
    title: '03. Canvas 2D 그래픽 렌더링',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'HTML5 Canvas API를 이용한 도형 그리기 및 동적 원형 차트',
    mainFile: 'index.html',
    tags: ['Canvas', '2D Graphics', 'Charts', 'Drawing'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #030712; color: #f9fafb; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    canvas { background: #111827; border-radius: 16px; border: 1px solid #1f2937; }
  </style>
</head>
<body>
  <canvas id="myCanvas" width="400" height="280"></canvas>
  <script>
    const ctx = document.getElementById('myCanvas').getContext('2d');
    
    // 그라디언트 배경 사각형
    const grad = ctx.createLinearGradient(0, 0, 400, 280);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 280);

    // 원형 파이 차트 그리기
    const data = [{ val: 40, color: '#38bdf8' }, { val: 35, color: '#10b981' }, { val: 25, color: '#f59e0b' }];
    let startAngle = 0;
    const cx = 200, cy = 140, radius = 90;

    data.forEach(d => {
      const sliceAngle = (d.val / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // 내부 구멍 (도넛 차트)
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Canvas 2D', cx, cy + 5);
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-04-svg-graphics',
    title: '04. SVG 벡터 그래픽 & 애니메이션',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'SVG 패스(Path), 그라디언트 및 회전 애니메이션',
    mainFile: 'index.html',
    tags: ['SVG', 'Vector', 'Animations', 'Graphics'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0b0f19; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
    .rotator { animation: spin 8s linear infinite; transform-origin: center; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <svg width="240" height="240" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="svgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" stroke-width="6" />
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#svgGrad)" stroke-width="6" stroke-dasharray="180" stroke-linecap="round" class="rotator" />
    <text x="50" y="55" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">SVG 100%</text>
  </svg>
</body>
</html>
`,
    },
  },
  {
    id: 'html-05-dom-events',
    title: '05. 바닐라 JS DOM 조작 & 이벤트',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: '순수 JavaScript로 DOM 노드 생성, 이벤트 위임, 스타일 조작',
    mainFile: 'index.html',
    tags: ['DOM', 'Vanilla JS', 'Events', 'Interactive'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; }
    input, button { padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; font-size: 14px; }
    input { background: #1e293b; color: white; flex: 1; }
    button { background: #0284c7; color: white; font-weight: bold; cursor: pointer; border: none; }
    button:hover { background: #0369a1; }
    .item { background: #1e293b; padding: 12px; border-radius: 8px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #334155; }
  </style>
</head>
<body>
  <h2 style="margin-bottom: 12px; color: #38bdf8;">DOM 이벤트 목록 관리기</h2>
  <div style="display: flex; gap: 8px;">
    <input type="text" id="itemInput" placeholder="새 항목 입력..." />
    <button id="addBtn">추가</button>
  </div>
  <div id="list" style="margin-top: 16px;"></div>

  <script>
    const input = document.getElementById('itemInput');
    const addBtn = document.getElementById('addBtn');
    const list = document.getElementById('list');

    function addItem() {
      const text = input.value.trim();
      if (!text) return;

      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = \`<span>\${text}</span><button style="background: #ef4444; padding: 4px 8px; font-size: 12px;">삭제</button>\`;
      div.querySelector('button').onclick = () => div.remove();

      list.appendChild(div);
      input.value = '';
    }

    addBtn.onclick = addItem;
    input.onkeydown = (e) => e.key === 'Enter' && addItem();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-06-css-animations',
    title: '06. CSS3 3D 큐브 애니메이션',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'CSS 3D Transform(preserve-3d)과 Keyframes 회전 효과',
    mainFile: 'index.html',
    tags: ['CSS3', '3D', 'Keyframes', 'Transform'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #030712; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; perspective: 800px; }
    .cube { width: 100px; height: 100px; position: relative; transform-style: preserve-3d; animation: rotateCube 10s infinite linear; }
    .face { position: absolute; width: 100px; height: 100px; background: rgba(56, 189, 248, 0.2); border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-family: sans-serif; backdrop-filter: blur(4px); }
    .front  { transform: translateZ(50px); }
    .back   { transform: rotateY(180deg) translateZ(50px); }
    .right  { transform: rotateY(90deg) translateZ(50px); }
    .left   { transform: rotateY(-90deg) translateZ(50px); }
    .top    { transform: rotateX(90deg) translateZ(50px); }
    .bottom { transform: rotateX(-90deg) translateZ(50px); }
    @keyframes rotateCube { from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); } }
  </style>
</head>
<body>
  <div class="cube">
    <div class="face front">FRONT</div>
    <div class="face back">BACK</div>
    <div class="face right">RIGHT</div>
    <div class="face left">LEFT</div>
    <div class="face top">TOP</div>
    <div class="face bottom">BOT</div>
  </div>
</body>
</html>
`,
    },
  },
  {
    id: 'html-07-audio-api',
    title: '07. Web Audio API 신시사이저',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: '오실레이터(OscillatorNode)를 이용한 실시간 피아노 건반 사운드 합성',
    mainFile: 'index.html',
    tags: ['Web Audio API', 'Oscillator', 'Sound', 'Interactive'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0f172a; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .piano { display: flex; gap: 8px; margin-top: 20px; }
    .key { width: 50px; height: 140px; background: #e2e8f0; color: #0f172a; border-radius: 0 0 8px 8px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12px; font-weight: bold; cursor: pointer; user-select: none; transition: transform 0.1s; }
    .key:active { background: #38bdf8; transform: scale(0.96); }
  </style>
</head>
<body>
  <h2>🎵 Web Audio API 건반 신시사이저</h2>
  <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">건반을 클릭하여 순수 주파수 톤을 생성하세요</p>
  <div class="piano">
    <div class="key" data-freq="261.63">도</div>
    <div class="key" data-freq="293.66">레</div>
    <div class="key" data-freq="329.63">미</div>
    <div class="key" data-freq="349.23">파</div>
    <div class="key" data-freq="392.00">솔</div>
    <div class="key" data-freq="440.00">라</div>
    <div class="key" data-freq="493.88">시</div>
    <div class="key" data-freq="523.25">도</div>
  </div>
  <script>
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    document.querySelectorAll('.key').forEach(key => {
      key.onclick = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = parseFloat(key.dataset.freq);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      };
    });
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-08-local-storage',
    title: '08. LocalStorage 기반 영구 메모장',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: '브라우저 LocalStorage에 자동 저장/불러오기되는 빠른 메모장',
    mainFile: 'index.html',
    tags: ['LocalStorage', 'Web Storage', 'Persistence', 'App'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; padding: 24px; max-width: 520px; margin: 0 auto; }
    textarea { width: 100%; height: 200px; background: #1e293b; color: white; border: 1px solid #334155; border-radius: 12px; padding: 14px; font-size: 14px; font-family: monospace; box-sizing: border-box; resize: none; }
    .status { font-size: 12px; color: #34d399; margin-top: 8px; text-align: right; }
  </style>
</head>
<body>
  <h2 style="color: #38bdf8; margin-bottom: 8px;">📝 자동 저장 영구 메모장</h2>
  <textarea id="memo" placeholder="메모를 작성하면 실시간으로 저장됩니다..."></textarea>
  <div class="status" id="saveStatus">저장됨 (Ready)</div>
  <script>
    const memo = document.getElementById('memo');
    const status = document.getElementById('saveStatus');
    memo.value = localStorage.getItem('omni_quick_memo') || '';
    memo.oninput = () => {
      localStorage.setItem('omni_quick_memo', memo.value);
      status.innerText = '저장 완료: ' + new Date().toLocaleTimeString();
    };
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-09-drag-drop',
    title: '09. HTML5 드래그 앤 드롭 칸반 보드',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: 'HTML5 Drag and Drop API를 활용한 작업 이동 인터랙션',
    mainFile: 'index.html',
    tags: ['Drag and Drop', 'DnD', 'Kanban', 'UI'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0f172a; color: white; font-family: system-ui, sans-serif; padding: 20px; }
    .board { display: flex; gap: 16px; }
    .column { flex: 1; background: #1e293b; border-radius: 12px; padding: 16px; min-height: 240px; border: 2px dashed #334155; }
    .card { background: #0284c7; padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: grab; font-size: 13px; font-weight: bold; }
  </style>
</head>
<body>
  <h2 style="margin-bottom: 16px;">📋 드래그 앤 드롭 칸반 보드</h2>
  <div class="board">
    <div class="column" id="col1" ondragover="event.preventDefault()" ondrop="drop(event)">
      <h3 style="font-size: 14px; margin-bottom: 12px; color: #94a3b8;">할 일 (TODO)</h3>
      <div class="card" draggable="true" ondragstart="drag(event)" id="task1">API 명세서 작성</div>
      <div class="card" draggable="true" ondragstart="drag(event)" id="task2">WebContainer 벤치마크</div>
    </div>
    <div class="column" id="col2" ondragover="event.preventDefault()" ondrop="drop(event)">
      <h3 style="font-size: 14px; margin-bottom: 12px; color: #34d399;">완료 (DONE)</h3>
    </div>
  </div>
  <script>
    function drag(e) { e.dataTransfer.setData('text', e.target.id); }
    function drop(e) {
      e.preventDefault();
      const id = e.dataTransfer.getData('text');
      const targetCol = e.target.closest('.column');
      if (targetCol) targetCol.appendChild(document.getElementById(id));
    }
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-10-particle-vortex',
    title: '10. Canvas 인터랙티브 파티클 보텍스',
    category: 'Web & Server',
    language: 'html',
    engine: 'html-sandbox',
    description: '마우스 커서를 따라 소용돌이치는 Canvas 60FPS 파티클 시뮬레이션',
    mainFile: 'index.html',
    tags: ['Canvas', 'Particles', '60FPS', 'Interactive'],
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
    .ui-overlay { position: relative; z-index: 10; text-align: center; pointer-events: none; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); padding: 20px 32px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); }
    h1 { font-size: 24px; background: linear-gradient(135deg, #60a5fa, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 6px; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div class="ui-overlay">
    <h1>Omni Particle Vortex</h1>
    <p style="font-size: 13px; color: #94a3b8;">마우스를 움직여 파티클을 조작해보세요.</p>
  </div>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 90 }, () => ({
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
];
