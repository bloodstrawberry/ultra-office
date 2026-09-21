// ----------------------------------------------------------------------
// Instant Procedural Video Samples for Video Master Studio
// ----------------------------------------------------------------------

export interface SampleVideoItem {
  id: string;
  label: string;
  subLabel?: string;
  duration?: string;
  tag?: string;
  thumbnailSvg: string;
  generate: () => Promise<File>;
}

// ----------------------------------------------------------------------
// SVG Thumbnails / Posters for Instant Display
// ----------------------------------------------------------------------

const NEON_MOTION_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient><radialGradient id="r1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="50%" stop-color="%23ec4899" stop-opacity="0.8"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="%23090d16"/><rect width="320" height="180" fill="url(%23g1)" opacity="0.25"/><circle cx="160" cy="90" r="50" fill="url(%23r1)"/><circle cx="160" cy="90" r="28" fill="%23ffffff"/><text x="160" y="150" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NEON MOTION 60FPS</text></svg>`;

const TIMECODE_HUD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2300a76f"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="320" height="180" fill="%23020617"/><rect width="320" height="180" fill="url(%23g2)" opacity="0.3"/><rect x="20" y="20" width="280" height="140" fill="none" stroke="%2300a76f" stroke-width="1.5" stroke-dasharray="4,4"/><text x="160" y="85" fill="%2300a76f" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">00:08.00</text><text x="160" y="115" fill="%2394a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">TIMECODE CINEMATIC</text></svg>`;

const CYBERPUNK_AI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect width="320" height="180" fill="%23080e1a"/><rect width="320" height="180" fill="url(%23g3)" opacity="0.35"/><circle cx="160" cy="80" r="35" fill="%238b5cf6" opacity="0.6"/><polygon points="160,50 190,105 130,105" fill="%2306b6d4" opacity="0.8"/><text x="160" y="145" fill="%2338bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">AI STUDIO LAB</text></svg>`;

const OCEAN_WAVE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="320" height="180" fill="%23041322"/><rect width="320" height="180" fill="url(%23g4)" opacity="0.4"/><path d="M0,120 Q80,70 160,110 T320,100 L320,180 L0,180 Z" fill="%230ea5e9" opacity="0.5"/><text x="160" y="70" fill="%23e0f2fe" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">OCEAN WAVE 4K</text></svg>`;

const BROADCAST_SUBTITLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="320" height="180" fill="url(%23g5)"/><circle cx="80" cy="70" r="30" fill="%2338bdf8" opacity="0.4"/><rect x="30" y="130" width="260" height="34" rx="4" fill="%23000000" opacity="0.75"/><rect x="34" y="134" width="45" height="26" rx="3" fill="%23ef4444"/><text x="56" y="151" fill="%23ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">LIVE</text><text x="175" y="152" fill="%23ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">[속보] 도심 한가운데 레이저 쇼 개막</text></svg>`;

const CINEMA_SUBTITLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23180e29"/><stop offset="100%" stop-color="%2305050d"/></linearGradient></defs><rect width="320" height="180" fill="url(%23g6)"/><path d="M40,110 L160,50 L280,110 Z" fill="%23a855f7" opacity="0.3"/><text x="160" y="155" fill="%23fef08a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">“우리가 찾던 그 진실이 바로 여기에 있어.”</text></svg>`;

// ----------------------------------------------------------------------
// Procedural Video Generators
// ----------------------------------------------------------------------

/**
 * 1. Neon Motion Graphics Video
 */
export async function createNeonMotionVideo(durationSec = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  // Audio tone context
  let audioCtx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      audioDest = audioCtx.createMediaStreamDestination();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioDest);
      osc.start();
    }
  } catch {
    // audio not critical
  }

  const canvasStream = canvas.captureStream(30);
  const combinedTracks = [
    ...canvasStream.getVideoTracks(),
    ...(audioDest ? audioDest.stream.getAudioTracks() : []),
  ];
  const stream = new MediaStream(combinedTracks);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      if (osc) {
        try {
          osc.stop();
        } catch {
          /* ignore */
        }
      }
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch {
          /* ignore */
        }
      }
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(new File([blob], 'neon_motion_sample.webm', { type: 'video/webm' }));
    };

    recorder.start();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
        return;
      }

      const t = elapsed / 1000;
      const progress = elapsed / totalMs;
      const hue = Math.floor(progress * 360);

      // Background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, `hsl(${hue}, 80%, 18%)`);
      grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 85%, 32%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rotating neon particles
      for (let i = 0; i < 8; i += 1) {
        const angle = t * 2 + (i * Math.PI) / 4;
        const dist = 70 + Math.sin(t * 3 + i) * 30;
        const px = canvas.width / 2 + Math.cos(angle) * dist;
        const py = canvas.height / 2 + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${(hue + i * 40) % 360}, 100%, 65%)`;
        ctx.fill();
      }

      // Center glowing circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 42 + Math.sin(t * 4) * 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Title & timer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ Neon Motion Studio', canvas.width / 2, 80);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`00:0${(durationSec - t).toFixed(1)}s`, canvas.width / 2, 300);
    }, 1000 / 30);
  });
}

/**
 * 2. Timecode HUD Cinematic Video
 */
export async function createTimecodeCinematicVideo(durationSec = 8): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(new File([blob], 'timecode_cinematic_sample.webm', { type: 'video/webm' }));
    };

    recorder.start();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
        return;
      }

      const t = elapsed / 1000;
      const progress = elapsed / totalMs;

      // Dark sci-fi backdrop
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 167, 111, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center HUD Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(120, 90, 400, 180);
      ctx.strokeStyle = '#00A76F';
      ctx.lineWidth = 2;
      ctx.strokeRect(120, 90, 400, 180);

      // Timecode
      ctx.fillStyle = '#00A76F';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`00:0${t.toFixed(2)}`, canvas.width / 2, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🎞️ Timecode Cinematic HUD', canvas.width / 2, 210);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '13px monospace';
      ctx.fillText(`FPS: 30 | Progress: ${(progress * 100).toFixed(0)}%`, canvas.width / 2, 245);
    }, 1000 / 30);
  });
}

/**
 * 3. Cyberpunk AI Lab Video
 */
export async function createCyberpunkAiVideo(durationSec = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(new File([blob], 'cyberpunk_ai_sample.webm', { type: 'video/webm' }));
    };

    recorder.start();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
        return;
      }

      const t = elapsed / 1000;
      const progress = elapsed / totalMs;

      // Dark purple backdrop
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f051d');
      grad.addColorStop(0.5, '#1e0836');
      grad.addColorStop(1, '#081726');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing floating orb
      const orbX = canvas.width / 2 + Math.sin(t * 2) * 120;
      const orbY = canvas.height / 2 + Math.cos(t * 3) * 45;
      const radGrad = ctx.createRadialGradient(orbX, orbY, 5, orbX, orbY, 80);
      radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
      radGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.5)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🤖 AI Video & Watermark Lab', canvas.width / 2, 100);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`FRAME TIMING: ${t.toFixed(2)}s / ${durationSec}s`, canvas.width / 2, 280);

      // Bar
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(canvas.width / 2 - 150, 300, 300, 8);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(canvas.width / 2 - 150, 300, 300 * progress, 8);
    }, 1000 / 30);
  });
}

/**
 * 4. Ocean Wave Synth Video
 */
export async function createOceanWaveVideo(durationSec = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(new File([blob], 'ocean_wave_sample.webm', { type: 'video/webm' }));
    };

    recorder.start();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
        return;
      }

      const t = elapsed / 1000;

      // Deep Ocean gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#031024');
      bg.addColorStop(1, '#064e3b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Waves
      ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = 200 + Math.sin(x * 0.02 + t * 3) * 25 + Math.cos(x * 0.01 + t * 2) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Second Wave
      ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = 240 + Math.sin(x * 0.015 - t * 2.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = '#f0fdf4';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 Ocean Wave Ambient', canvas.width / 2, 80);

      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`PLAYBACK: ${(durationSec - t).toFixed(1)}s remaining`, canvas.width / 2, 330);
    }, 1000 / 30);
  });
}

/**
 * 5. Broadcast Lower-Third Subtitle Video (뉴스 방송 하단 자막)
 */
export async function createBroadcastSubtitleVideo(durationSec = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'broadcast_subtitle_sample.webm', { type: 'video/webm' });
      resolve(file);
    };

    recorder.start(100);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / 1000;

      if (elapsed >= totalMs) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      // 1. Dynamic background: City skyline night scene with moving lights
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#1e293b');
      bgGrad.addColorStop(1, '#334155');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving atmospheric light orbs
      const orbX = 180 + Math.sin(t * 1.5) * 120;
      const orbY = 120 + Math.cos(t * 1.2) * 40;
      const radGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 140);
      radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      radGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Building silhouettes
      ctx.fillStyle = '#090d16';
      for (let i = 0; i < 9; i += 1) {
        const bX = i * 75 - 15;
        const bW = 60;
        const bH = 100 + ((i * 37) % 90);
        ctx.fillRect(bX, canvas.height - bH, bW, bH);

        // Windows
        ctx.fillStyle = (i + Math.floor(t * 2)) % 3 === 0 ? '#fde047' : '#64748b';
        ctx.fillRect(bX + 15, canvas.height - bH + 20, 10, 15);
        ctx.fillRect(bX + 35, canvas.height - bH + 20, 10, 15);
        ctx.fillStyle = '#090d16';
      }

      // 2. Burned-in Hardcoded Subtitles (Time-Varying: 0~3s at Bottom, 3~6s at Top!)
      if (t < 3.0) {
        // [0.0s ~ 3.0s] 하단 자막 배너
        const subY = 285;
        const subH = 46;

        // Dark translucent banner bar
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(30, subY, canvas.width - 60, subH);

        // Red 'LIVE' badge
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(36, subY + 7, 56, 32, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIVE', 64, subY + 28);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('[속보] 도심 한가운데 화려한 레이저 페스티벌 개막', 104, subY + 29);
      } else {
        // [3.0s ~ 6.0s] 상단 헤드라인 자막 배너 (시간대별 위치 변경!)
        const topY = 24;
        const topH = 42;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(40, topY, canvas.width - 80, topH);

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(46, topY + 6, 76, 30, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOT ISSUE', 84, topY + 25);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('[화제] 오늘 밤 시민 인터뷰 및 도심 축제 현장 중계', 132, topY + 26);
      }
    }, 1000 / 30);
  });
}

/**
 * 6. Cinema Style Hardcoded Subtitle Video (영화 시네마틱 한글 자막)
 */
export async function createCinemaSubtitleVideo(durationSec = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  const totalMs = durationSec * 1000;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'cinema_subtitle_sample.webm', { type: 'video/webm' });
      resolve(file);
    };

    recorder.start(100);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = elapsed / 1000;

      if (elapsed >= totalMs) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      // Cinematic moody gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(0.5, '#292524');
      bgGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating dust particles & lens flare
      for (let i = 0; i < 15; i += 1) {
        const px = (i * 47 + t * 25) % canvas.width;
        const py = 60 + Math.sin(t * 2 + i) * 80 + ((i * 15) % 150);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Ambient warm spotlight
      const spotGrad = ctx.createRadialGradient(
        canvas.width / 2,
        140,
        20,
        canvas.width / 2,
        140,
        200
      );
      spotGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Movie Subtitle (Yellow with dark outline at bottom center)
      const cinemaCaption =
        t < 3.2
          ? '“우리가 오랫동안 찾던 그 진실이 바로 여기에 있어.”'
          : '“이제 더 이상 뒤돌아보지 않고 앞으로 나아가야 해.”';

      const textY = 308;
      ctx.font = 'bold 17px Pretendard, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      // Text stroke (black border)
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(cinemaCaption, canvas.width / 2, textY);

      // Yellow/White fill
      ctx.fillStyle = '#fef08a';
      ctx.fillText(cinemaCaption, canvas.width / 2, textY);
    }, 1000 / 30);
  });
}

// ----------------------------------------------------------------------
// Default Sample Video Presets
// ----------------------------------------------------------------------

export const DEFAULT_VIDEO_SAMPLES: SampleVideoItem[] = [
  {
    id: 'neon-motion',
    label: '🎬 네온 모션 그래픽스',
    subLabel: '60FPS 비비드 모션 6초',
    duration: '00:06',
    thumbnailSvg: NEON_MOTION_SVG,
    generate: () => createNeonMotionVideo(6),
  },
  {
    id: 'timecode-hud',
    label: '🎞️ 타임코드 시네마틱',
    subLabel: 'HUD 정밀 시간 측정 8초',
    duration: '00:08',
    thumbnailSvg: TIMECODE_HUD_SVG,
    generate: () => createTimecodeCinematicVideo(8),
  },
  {
    id: 'cyberpunk-ai',
    label: '🤖 AI 사이버펑크 랩',
    subLabel: '워터마크 · 각인 테스트 6초',
    duration: '00:06',
    thumbnailSvg: CYBERPUNK_AI_SVG,
    generate: () => createCyberpunkAiVideo(6),
  },
  {
    id: 'ocean-wave',
    label: '🌊 오션 웨이브 힐링',
    subLabel: '색감 · 필터 보정용 6초',
    duration: '00:06',
    thumbnailSvg: OCEAN_WAVE_SVG,
    generate: () => createOceanWaveVideo(6),
  },
];

export const SUBTITLE_REMOVER_VIDEO_SAMPLES: SampleVideoItem[] = [
  {
    id: 'broadcast-subtitle',
    label: '📺 뉴스 방송 가변 자막',
    subLabel: '0~3초 하단 자막 ➔ 3~6초 상단 자막 위치 변경 6초',
    duration: '00:06',
    tag: '위치 가변 자막 (상/하단)',
    thumbnailSvg: BROADCAST_SUBTITLE_SVG,
    generate: () => createBroadcastSubtitleVideo(6),
  },
  {
    id: 'cinema-subtitle',
    label: '🎬 영화 시네마틱 자막',
    subLabel: '중앙 하단 옐로우 텍스트 자막 6초',
    duration: '00:06',
    tag: '영화 대사 자막',
    thumbnailSvg: CINEMA_SUBTITLE_SVG,
    generate: () => createCinemaSubtitleVideo(6),
  },
  {
    id: 'timecode-hud',
    label: '🎞️ 타임코드 시네마틱',
    subLabel: '중앙 타임코드 각인 8초',
    duration: '00:08',
    tag: '중앙 텍스트',
    thumbnailSvg: TIMECODE_HUD_SVG,
    generate: () => createTimecodeCinematicVideo(8),
  },
];
