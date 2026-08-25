import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const HTML_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: HTML5 & CSS3 기초 10선] ---
  {
    id: 'html-01-semantic-tags',
    title: '01. 시맨틱 태그 & 모던 웹 레이아웃',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '<header>, <nav>, <main>, <section>, <footer> 시맨틱 구조',
    mainFile: 'index.html',
    tags: ['HTML5', 'Semantic', 'Layout'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #f8fafc; color: #1e293b; }
    header { background: #0284c7; color: white; padding: 16px; text-align: center; }
    main { max-width: 600px; margin: 20px auto; padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    footer { text-align: center; padding: 16px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <header><h2>🌐 시맨틱 웹 레이아웃</h2></header>
  <main>
    <section>
      <h3>HTML5 표준 아키텍처</h3>
      <p>웹 표준 시맨틱 태그를 사용하여 접근성과 SEO를 극대화합니다.</p>
    </section>
  </main>
  <footer>© 2026 OmniRunner Web Studio</footer>
</body>
</html>
`,
    },
  },
  {
    id: 'html-02-flexbox-grid',
    title: '02. CSS Flexbox & Grid 레이아웃',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '반응형 그리드 시스템 및 Flexbox 정렬',
    mainFile: 'index.html',
    tags: ['CSS', 'Flexbox', 'Grid', 'Responsive'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #0f172a; color: white; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .card { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; text-align: center; }
    .card:hover { border-color: #38bdf8; }
  </style>
</head>
<body>
  <h3>⚡ CSS Grid 반응형 카드</h3>
  <div class="grid">
    <div class="card">🚀 Fast</div>
    <div class="card">🛡️ Safe</div>
    <div class="card">📦 Modular</div>
    <div class="card">🎨 Styled</div>
  </div>
</body>
</html>
`,
    },
  },
  {
    id: 'html-03-canvas-drawing',
    title: '03. HTML5 Canvas 2D 그래픽',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Canvas API 도형 드로잉, 그라디언트, 아크 렌더링',
    mainFile: 'index.html',
    tags: ['Canvas', '2D Graphics', 'HTML5'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="cv" width="300" height="200"></canvas>
  <script>
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 300, 200);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#ec4899');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(150, 100, 60, 0, Math.PI * 2);
    ctx.fill();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-04-svg-animations',
    title: '04. SVG 그래픽 & CSS 키프레임 애니메이션',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '벡터 그래픽 및 무한 회전 로딩 스피너 애니메이션',
    mainFile: 'index.html',
    tags: ['SVG', 'CSS Animation', 'Keyframes'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .spinner { animation: spin 2s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <svg class="spinner" width="64" height="64" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="20" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="80" stroke-linecap="round" />
  </svg>
</body>
</html>
`,
    },
  },
  {
    id: 'html-05-vanilla-js-dom',
    title: '05. 바닐라 JS DOM 이벤트 바인딩',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'querySelector, addEventListener를 이용한 동적 UI 제어',
    mainFile: 'index.html',
    tags: ['Vanilla JS', 'DOM', 'Events'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; text-align: center;">
  <h3 id="txt">버튼을 클릭하세요</h3>
  <button id="btn" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer;">
    클릭 이벤트
  </button>
  <script>
    let count = 0;
    document.getElementById('btn').addEventListener('click', () => {
      count++;
      document.getElementById('txt').textContent = '클릭 횟수: ' + count + '회!';
    });
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-06-glassmorphism',
    title: '06. 글래스모피즘 (Glassmorphism UI)',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'backdrop-filter: blur(12px) 모던 유리 질감 카드 디자인',
    mainFile: 'index.html',
    tags: ['CSS', 'Glassmorphism', 'Design'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background: linear-gradient(45deg, #0ea5e9, #8b5cf6); font-family: sans-serif; }
    .card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 16px; padding: 24px; color: white; width: 260px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <h3 style="margin: 0 0 8px 0;">✨ Glass UI</h3>
    <p style="font-size: 13px; opacity: 0.9;">모던 글래스모피즘 블러 효과 카드</p>
  </div>
</body>
</html>
`,
    },
  },
  {
    id: 'html-07-audio-synth',
    title: '07. Web Audio API 신시사이저',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '브라우저 오디오 컨텍스트(OscillatorNode) 주파수 사운드 생성',
    mainFile: 'index.html',
    tags: ['Web Audio API', 'Sound', 'Synth'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; text-align: center; padding: 30px;">
  <h3>🎵 Web Audio API 비프음</h3>
  <button onclick="playTone(440)" style="padding: 8px 16px; margin: 4px;">A4 (440Hz)</button>
  <button onclick="playTone(523.25)" style="padding: 8px 16px; margin: 4px;">C5 (523Hz)</button>
  <script>
    function playTone(freq) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-08-localstorage-notes',
    title: '08. 로컬 스토리지 메모장',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'localStorage를 활용한 자동 저장 메모장',
    mainFile: 'index.html',
    tags: ['LocalStorage', 'Web Storage', 'Notes'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
  <h3>📝 자동 저장 메모장</h3>
  <textarea id="note" style="width: 100%; height: 100px; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1;" placeholder="메모 입력..."></textarea>
  <script>
    const el = document.getElementById('note');
    el.value = localStorage.getItem('omni_note') || '';
    el.addEventListener('input', () => localStorage.setItem('omni_note', el.value));
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-09-custom-range-slider',
    title: '09. 커스텀 CSS 슬라이더 & 값 바인딩',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '커스텀 스타일링된 <input type="range"> 슬라이더',
    mainFile: 'index.html',
    tags: ['CSS', 'Slider', 'Form Controls'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; text-align: center;">
  <h3>🎛️ 밝기 조절 슬라이더</h3>
  <input type="range" id="rng" min="0" max="100" value="75" style="width: 200px;">
  <p id="val">75%</p>
  <script>
    document.getElementById('rng').addEventListener('input', e => {
      document.getElementById('val').textContent = e.target.value + '%';
    });
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-10-drag-and-drop',
    title: '10. HTML5 드래그 앤 드롭 (Drag & Drop)',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'draggable 속성과 ondragstart, ondrop 이벤트',
    mainFile: 'index.html',
    tags: ['HTML5', 'Drag and Drop', 'Events'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; display: flex; gap: 16px; padding: 20px; }
    .box { width: 120px; height: 120px; border: 2px dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .item { padding: 8px 12px; background: #0284c7; color: white; border-radius: 4px; cursor: grab; }
  </style>
</head>
<body>
  <div class="box" ondragover="event.preventDefault()" ondrop="drop(event)">
    <div id="dragItem" class="item" draggable="true" ondragstart="drag(event)">아이템 1</div>
  </div>
  <div class="box" ondragover="event.preventDefault()" ondrop="drop(event)"></div>
  <script>
    function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
    function drop(ev) {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(data));
    }
  </script>
</body>
</html>
`,
    },
  },

  // --- [Part 2: 캔버스 인터랙티브 & 알고리즘 애플리케이션 10선] ---
  {
    id: 'html-11-canvas-particle-galaxy',
    title: '11. [애플리케이션] 파티클 은하수 (Particle Galaxy)',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Canvas 60FPS 회전 은하수 파티클 애니메이션',
    mainFile: 'index.html',
    tags: ['Canvas', 'Particles', 'Animation'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #030712; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="c" width="360" height="240"></canvas>
  <script>
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let angle = 0;
    const particles = Array.from({length: 120}, () => ({
      r: Math.random() * 90 + 10,
      theta: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
      size: Math.random() * 2 + 1,
      hue: Math.random() * 60 + 190
    }));

    function loop() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, c.width, c.height);
      const cx = c.width / 2, cy = c.height / 2;

      particles.forEach(p => {
        p.theta += p.speed;
        const x = cx + Math.cos(p.theta) * p.r;
        const y = cy + Math.sin(p.theta) * p.r * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = \`hsl(\${p.hue}, 80%, 60%)\`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-12-canvas-drawing-pad',
    title: '12. [애플리케이션] 실시간 캔버스 드로잉 그림판',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '마우스 드래그 자유 곡선 그리기 및 지우개 기능',
    mainFile: 'index.html',
    tags: ['Canvas', 'Drawing', 'Interactive'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 12px; font-family: sans-serif; text-align: center; background: #f8fafc;">
  <div style="margin-bottom: 8px;">
    <button onclick="ctx.clearRect(0,0,320,180)" style="padding: 4px 12px; cursor: pointer;">지우기</button>
  </div>
  <canvas id="pad" width="320" height="180" style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; cursor: crosshair;"></canvas>
  <script>
    const pad = document.getElementById('pad');
    const ctx = pad.getContext('2d');
    let isDrawing = false;

    pad.addEventListener('mousedown', e => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
    pad.addEventListener('mousemove', e => { if (isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
    window.addEventListener('mouseup', () => isDrawing = false);
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-13-3d-wireframe-cube',
    title: '13. [애플리케이션] 3D 와이어프레임 큐브 회전기',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '삼각함수 3D 회전 행렬을 적용한 Canvas 와이어프레임',
    mainFile: 'index.html',
    tags: ['3D', 'Canvas', 'Math', 'Matrix'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="c3d" width="300" height="200"></canvas>
  <script>
    const cv = document.getElementById('c3d');
    const ctx = cv.getContext('2d');
    let angle = 0;

    const vertices = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ];
    const edges = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]
    ];

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, cv.width, cv.height);
      angle += 0.02;

      const proj = vertices.map(([x, y, z]) => {
        let x1 = x * Math.cos(angle) - z * Math.sin(angle);
        let z1 = x * Math.sin(angle) + z * Math.cos(angle);
        let y2 = y * Math.cos(angle) - z1 * Math.sin(angle);
        let z2 = y * Math.sin(angle) + z1 * Math.cos(angle);
        return [cv.width/2 + x1 * 45, cv.height/2 + y2 * 45];
      });

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(proj[u][0], proj[u][1]);
        ctx.lineTo(proj[v][0], proj[v][1]);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-14-breakout-game',
    title: '14. [게임] 벽돌깨기 아케이드 게임 (Breakout)',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '패들 조작 및 볼 충돌 판정 아케이드 게임',
    mainFile: 'index.html',
    tags: ['Game', 'Canvas', 'Arcade'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
  <canvas id="gc" width="320" height="200" style="border: 1px solid #334155; border-radius: 8px;"></canvas>
  <script>
    const c = document.getElementById('gc'), ctx = c.getContext('2d');
    let x = 160, y = 160, dx = 2, dy = -2, px = 120;
    c.addEventListener('mousemove', e => px = e.offsetX - 35);

    function game() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,c.width,c.height);
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fillStyle = '#38bdf8'; ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.fillRect(px, 190, 70, 6);

      if (x < 5 || x > c.width - 5) dx = -dx;
      if (y < 5) dy = -dy;
      else if (y > 185 && x > px && x < px + 70) dy = -dy;
      else if (y > c.height) { x = 160; y = 100; dy = -2; }

      x += dx; y += dy;
      requestAnimationFrame(game);
    }
    game();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-15-pendulum-physics',
    title: '15. [애플리케이션] 단진자 운동 물리 시뮬레이터',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '중력 가속도 및 감쇠 진자 물리 운동 방정식',
    mainFile: 'index.html',
    tags: ['Physics', 'Canvas', 'Simulation'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="pc" width="300" height="200"></canvas>
  <script>
    const cv = document.getElementById('pc'), ctx = cv.getContext('2d');
    let angle = Math.PI / 4, aVel = 0, aAcc = 0, len = 120, originX = 150, originY = 20;

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, cv.width, cv.height);
      aAcc = (-0.4 / len) * Math.sin(angle);
      aVel += aAcc; aVel *= 0.995; angle += aVel;

      const bobX = originX + len * Math.sin(angle);
      const bobY = originY + len * Math.cos(angle);

      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(bobX, bobY); ctx.stroke();

      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(bobX, bobY, 12, 0, Math.PI * 2); ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-16-raycaster-maze',
    title: '16. [애플리케이션] 레이캐스팅 가상 3D 미로 시선',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Wolfenstein 3D 스타일 가상 레이캐스터 뷰어',
    mainFile: 'index.html',
    tags: ['Raycasting', '3D', 'Canvas', 'Retro'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #020617; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="rc" width="320" height="180"></canvas>
  <script>
    const c = document.getElementById('rc'), ctx = c.getContext('2d');
    let rot = 0;
    function render() {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0,0,320,90);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,90,320,90);
      rot += 0.03;

      for (let i = 0; i < 32; i++) {
        let rayAngle = rot + (i - 16) * 0.03;
        let dist = 80 + Math.sin(rayAngle * 3) * 30;
        let h = Math.min(180, (180 / dist) * 40);
        let shade = Math.floor(255 - dist * 1.5);
        ctx.fillStyle = \`rgb(\${shade/2}, \${shade}, \${shade})\`;
        ctx.fillRect(i * 10, (180 - h)/2, 10, h);
      }
      requestAnimationFrame(render);
    }
    render();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-17-solar-orbit',
    title: '17. [애플리케이션] 태양계 행성 공전 궤도',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Canvas 다중 궤도 주기 행성 애니메이션',
    mainFile: 'index.html',
    tags: ['Canvas', 'Orbit', 'Simulation'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #030712; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="sc" width="300" height="200"></canvas>
  <script>
    const c = document.getElementById('sc'), ctx = c.getContext('2d');
    let t = 0;
    function orbit() {
      ctx.fillStyle = '#030712'; ctx.fillRect(0,0,c.width,c.height);
      const cx = 150, cy = 100;
      t += 0.02;

      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill();

      [[35, 2, '#38bdf8', 4], [60, 1.2, '#f43f5e', 5], [90, 0.7, '#a855f7', 7]].forEach(([r, s, col, size]) => {
        ctx.strokeStyle = '#1e293b'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        let px = cx + Math.cos(t * s) * r;
        let py = cy + Math.sin(t * s) * r;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(orbit);
    }
    orbit();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-18-stopwatch-neumorphism',
    title: '18. [디자인] 뉴모피즘 (Neumorphism) 타이머',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '부드러운 입체 음영 뉴모피즘 다이얼 인터페이스',
    mainFile: 'index.html',
    tags: ['CSS', 'Neumorphism', 'UI Design'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background: #e0e5ec; font-family: sans-serif; }
    .neu-dial { width: 140px; height: 140px; border-radius: 50%; background: #e0e5ec; box-shadow: 9px 9px 16px #b8b9be, -9px -9px 16px #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #475569; }
  </style>
</head>
<body>
  <div class="neu-dial">12:30</div>
</body>
</html>
`,
    },
  },
  {
    id: 'html-19-waveform-visualizer',
    title: '19. [애플리케이션] 실시간 오디오 파형 (Waveform)',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Sin 파동 합성을 이용한 가상 오디오 이퀄라이저',
    mainFile: 'index.html',
    tags: ['Audio', 'Waveform', 'Canvas'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<body style="margin: 0; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <canvas id="wc" width="300" height="150"></canvas>
  <script>
    const cv = document.getElementById('wc'), ctx = cv.getContext('2d');
    let phase = 0;
    function wave() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,cv.width,cv.height);
      phase += 0.05;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.beginPath();
      for (let x = 0; x < cv.width; x++) {
        let y = 75 + Math.sin(x * 0.05 + phase) * 25 + Math.sin(x * 0.02 - phase) * 15;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(wave);
    }
    wave();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-20-digital-clock-matrix',
    title: '20. [애플리케이션] 매트릭스 디지털 시계',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: '그린 네온 매트릭스 폰트 실시간 디지털 시계',
    mainFile: 'index.html',
    tags: ['Clock', 'Matrix', 'Neon'],
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background: #000; font-family: monospace; color: #22c55e; text-shadow: 0 0 10px #22c55e; }
    #clk { font-size: 40px; font-weight: bold; }
  </style>
</head>
<body>
  <div id="clk">00:00:00</div>
  <script>
    function tick() { document.getElementById('clk').textContent = new Date().toTimeString().split(' ')[0]; }
    setInterval(tick, 1000); tick();
  </script>
</body>
</html>
`,
    },
  },
];
