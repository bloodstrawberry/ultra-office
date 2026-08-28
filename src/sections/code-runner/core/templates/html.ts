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
  {
    id: 'html-21-tailwind-lucide-chartjs',
    title: '21. [라이브러리] Tailwind + Lucide + Chart.js SaaS 대시보드',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Tailwind CSS 다크모드 그리드, Lucide 아이콘, Chart.js 복합 도넛 및 라인 차트',
    mainFile: 'index.html',
    tags: ['TailwindCSS', 'LucideIcons', 'Chart.js', 'Dashboard'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
          <i data-lucide="layout-dashboard" class="w-6 h-6"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold">CloudFlow 분석 대시보드</h1>
          <p class="text-xs text-slate-400">실시간 서비스 트래픽 & 리소스 사용량</p>
        </div>
      </div>
      <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i> 새로고침
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400">총 API 호출 수</div>
          <div class="text-2xl font-bold mt-1 text-white">4,281,902</div>
          <div class="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +14.2% 이번 주
          </div>
        </div>
        <div class="p-3 bg-sky-500/10 text-sky-400 rounded-lg">
          <i data-lucide="activity" class="w-6 h-6"></i>
        </div>
      </div>

      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400">서버 응답 속도</div>
          <div class="text-2xl font-bold mt-1 text-white">24.5 ms</div>
          <div class="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> 99.99% 정상 가동
          </div>
        </div>
        <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <i data-lucide="zap" class="w-6 h-6"></i>
        </div>
      </div>

      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400">활성 컨테이너</div>
          <div class="text-2xl font-bold mt-1 text-white">48개 노드</div>
          <div class="text-xs text-indigo-400 mt-1 flex items-center gap-1">
            <i data-lucide="server" class="w-3.5 h-3.5"></i> 오토스케일링 동작 중
          </div>
        </div>
        <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <i data-lucide="cpu" class="w-6 h-6"></i>
        </div>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div class="p-5 bg-slate-900 rounded-2xl border border-slate-800">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-sm text-slate-200">주간 트래픽 추이</h3>
        <span class="text-xs text-slate-400">단위: Req/Sec</span>
      </div>
      <div class="h-64">
        <canvas id="saasChart"></canvas>
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();

    const ctx = document.getElementById('saasChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [{
          label: 'Inbound Requests',
          data: [12000, 8500, 24000, 48000, 52000, 39000, 18000],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-22-threejs-3d-particles',
    title: '22. [라이브러리] Three.js 인터랙티브 3D 기하체 & 파티클 궤도',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'WebGL Three.js 3D icosahedron 와이어프레임 및 궤도 회전 파티클 시스템',
    mainFile: 'index.html',
    tags: ['Three.js', 'WebGL', '3D Graphics', 'Particles'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #020617; }
    #info {
      position: absolute; top: 16px; left: 16px;
      color: #38bdf8; font-family: monospace; font-size: 13px;
      background: rgba(15, 23, 42, 0.8); padding: 8px 14px;
      border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="info">✨ Three.js WebGL 3D Geometry (Drag to Rotate)</div>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 1. Central Icosahedron Wireframe
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const icosa = new THREE.Mesh(geometry, material);
    scene.add(icosa);

    // 2. Surrounding Particle Field
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x818cf8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambLight = new THREE.AmbientLight(0x334155);
    scene.add(ambLight);

    camera.position.z = 5;

    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);
      icosa.rotation.x += 0.008;
      icosa.rotation.y += 0.012;
      particles.rotation.y -= 0.003;

      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-23-canvas-confetti-celebration',
    title: '23. [라이브러리] Canvas Confetti 다채로운 축하 이벤트',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Canvas Confetti 폭죽 발사, 캐논 폭죽 및 커스텀 색상 앵커 이펙트',
    mainFile: 'index.html',
    tags: ['CanvasConfetti', 'Animation', 'Celebration', 'Interactive'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-screen flex items-center justify-center p-4 font-sans text-white">
  <div class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full text-center space-y-6">
    <div class="w-16 h-16 bg-gradient-to-tr from-amber-400 to-rose-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30">
      <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
    </div>

    <div>
      <h2 class="text-2xl font-extrabold tracking-tight">프로젝트 성공 축하!</h2>
      <p class="text-xs text-slate-300 mt-1.5">버튼을 눌러 다양한 Confetti 이펙트를 실행해보세요</p>
    </div>

    <div class="space-y-2.5">
      <button onclick="fireStandard()" class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
        <i data-lucide="party-popper" class="w-4 h-4"></i> 기본 폭죽 발사
      </button>

      <button onclick="fireCannons()" class="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
        <i data-lucide="flame" class="w-4 h-4"></i> 양방향 캐논 폭죽
      </button>
    </div>
  </div>

  <script>
    lucide.createIcons();

    function fireStandard() {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    function fireCannons() {
      // Left Cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      // Right Cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-24-roughjs-canvas-diagram',
    title: '24. [라이브러리] Rough.js 손그림 시스템 아키텍처 다이어그램',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Rough.js를 이용한 감성적인 핸드 드로잉 클라우드 인프라 아키텍처 다이어그램',
    mainFile: 'index.html',
    tags: ['Rough.js', 'Canvas', 'Hand-drawn', 'Architecture'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js"></script>
</head>
<body class="bg-amber-50/40 min-h-screen p-6 font-sans flex flex-col items-center justify-center">
  <div class="bg-white p-6 rounded-3xl shadow-xl border border-amber-200/80 max-w-xl w-full text-center">
    <div class="flex items-center justify-between mb-3 border-b border-amber-100 pb-3">
      <h2 class="font-bold text-slate-800 text-lg">✏️ Cloud Architecture (Rough.js)</h2>
      <span class="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">Hand-drawn UI</span>
    </div>

    <div class="relative bg-amber-50/30 rounded-2xl p-2 border border-amber-200/50 flex justify-center">
      <canvas id="roughCanvas" width="480" height="260"></canvas>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('roughCanvas');
    const rc = rough.canvas(canvas);

    // 1. Client Browser Box
    rc.rectangle(20, 90, 100, 80, {
      roughness: 1.6, fill: 'rgba(56, 189, 248, 0.25)',
      fillStyle: 'cross-hatch', stroke: '#0284c7', strokeWidth: 2
    });

    // 2. API Gateway Circle
    rc.circle(240, 130, 90, {
      roughness: 1.8, fill: 'rgba(244, 114, 182, 0.25)',
      fillStyle: 'dots', stroke: '#db2777', strokeWidth: 2
    });

    // 3. Database Cylindrical-like box
    rc.rectangle(360, 90, 100, 80, {
      roughness: 1.5, fill: 'rgba(52, 211, 153, 0.25)',
      fillStyle: 'zigzag', stroke: '#059669', strokeWidth: 2
    });

    // Connecting arrows/lines
    rc.line(125, 130, 190, 130, { roughness: 2, stroke: '#64748b', strokeWidth: 2 });
    rc.line(290, 130, 355, 130, { roughness: 2, stroke: '#64748b', strokeWidth: 2 });

    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('Client App', 70, 135);
    ctx.fillText('API Gateway', 240, 135);
    ctx.fillText('Postgres DB', 410, 135);
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-25-tonejs-synth-piano',
    title: '25. [라이브러리] Tone.js 8비트 신디사이저 키보드 피아노',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Tone.js PolySynth 화음 연주 및 8-bit 사운드 이펙트 생성기',
    mainFile: 'index.html',
    tags: ['Tone.js', 'Web Audio', 'Synthesizer', 'Piano'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4 font-sans">
  <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <i data-lucide="music" class="w-5 h-5 text-indigo-400"></i>
        <h2 class="font-bold text-base">Tone.js 8-Bit 신디 피아노</h2>
      </div>
      <span class="text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">PolySynth</span>
    </div>

    <div class="grid grid-cols-7 gap-1.5 h-36 mb-4">
      <button onclick="play('C4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">C</button>
      <button onclick="play('D4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">D</button>
      <button onclick="play('E4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">E</button>
      <button onclick="play('F4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">F</button>
      <button onclick="play('G4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">G</button>
      <button onclick="play('A4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">A</button>
      <button onclick="play('B4')" class="bg-white text-slate-900 rounded-xl font-bold flex items-end justify-center pb-2 hover:bg-indigo-100 active:scale-95 transition-all text-xs">B</button>
    </div>

    <button onclick="playChord()" class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95">
      ✨ C Major 7th 화음 연주 (C-E-G-B)
    </button>
  </div>

  <script>
    lucide.createIcons();
    let polySynth = null;

    async function init() {
      if (!polySynth) {
        await Tone.start();
        polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
      }
    }

    async function play(note) {
      await init();
      polySynth.triggerAttackRelease(note, '8n');
    }

    async function playChord() {
      await init();
      polySynth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '4n');
    }
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-26-fusejs-autocomplete-search',
    title: '26. [라이브러리] Fuse.js 고속 자동완성 & 오타 교정 검색바',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'Fuse.js를 이용한 클라이언트 오타 보정 검색 및 실시간 드롭다운 리스트',
    mainFile: 'index.html',
    tags: ['Fuse.js', 'Autocomplete', 'Fuzzy Search'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-900 min-h-screen p-6 font-sans flex items-center justify-center">
  <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full">
    <h2 class="font-bold text-white text-base mb-3 flex items-center gap-2">
      <i data-lucide="search" class="w-4 h-4 text-sky-400"></i> Fuse.js 실시간 오타 검색
    </h2>

    <input
      type="text"
      id="searchBox"
      placeholder="검색어 입력 (예: react, pyton, postgre)..."
      class="w-full bg-slate-950 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-sky-500 mb-3"
      oninput="handleSearch()"
    />

    <div id="results" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
  </div>

  <script>
    lucide.createIcons();
    const data = [
      { name: 'React Live Sandbox', type: 'Frontend' },
      { name: 'Python Pyodide Wasm', type: 'Data Science' },
      { name: 'PostgreSQL Relational DB', type: 'Database' },
      { name: 'Redis In-Memory Store', type: 'Cache' },
      { name: 'Docker Linux Container', type: 'DevOps' },
      { name: 'Kubernetes Cluster Manager', type: 'Cloud' }
    ];

    const fuse = new Fuse(data, { keys: ['name', 'type'], threshold: 0.4 });

    function handleSearch() {
      const q = document.getElementById('searchBox').value;
      const res = q.trim() ? fuse.search(q) : data.map(d => ({ item: d }));
      const container = document.getElementById('results');
      container.innerHTML = res.map(r => \`
        <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-200">\${r.item.name}</span>
          <span class="text-[10px] text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded">\${r.item.type}</span>
        </div>
      \`).join('');
    }
    handleSearch();
  </script>
</body>
</html>
`,
    },
  },
  {
    id: 'html-27-katex-formula-renderer',
    title: '27. [라이브러리] KaTeX 고속 LaTeX 수학 수식 렌더러',
    category: 'Frontend & UI',
    language: 'html',
    engine: 'html-sandbox',
    description: 'KaTeX 수식 렌더링 엔진을 통한 복잡한 미적분, 행렬, 극한 기호 시각화',
    mainFile: 'index.html',
    tags: ['KaTeX', 'LaTeX', 'Math', 'Formulas'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans flex items-center justify-center">
  <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full shadow-2xl space-y-4">
    <div class="border-b border-slate-800 pb-3">
      <h2 class="font-bold text-white text-base">📐 KaTeX 수학 공식 렌더러</h2>
      <p class="text-xs text-slate-400">초고속 WebAssembly LaTeX 파서</p>
    </div>

    <div class="space-y-3">
      <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <div class="text-[11px] text-slate-500 mb-1">오일러 항등식</div>
        <div id="math1" class="text-lg text-amber-300"></div>
      </div>

      <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <div class="text-[11px] text-slate-500 mb-1">정규분포 확률밀도함수 (Gaussian PDF)</div>
        <div id="math2" class="text-base text-sky-300"></div>
      </div>

      <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <div class="text-[11px] text-slate-500 mb-1">맥스웰 방정식 (전자기학)</div>
        <div id="math3" class="text-base text-emerald-300"></div>
      </div>
    </div>
  </div>

  <script>
    katex.render("e^{i\\\\pi} + 1 = 0", document.getElementById('math1'), { displayMode: true });
    katex.render("f(x) = \\\\frac{1}{\\\\sigma \\\\sqrt{2\\\\pi}} e^{-\\\\frac{1}{2}\\\\left(\\\\frac{x-\\\\mu}{\\\\sigma}\\\\right)^2}", document.getElementById('math2'), { displayMode: true });
    katex.render("\\\\nabla \\\\times \\\\mathbf{E} = -\\\\frac{\\\\partial \\\\mathbf{B}}{\\\\partial t}", document.getElementById('math3'), { displayMode: true });
  </script>
</body>
</html>
`,
    },
  },
];
