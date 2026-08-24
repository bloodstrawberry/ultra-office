import gifshot from 'gifshot';

export type MemeEffectType =
  | 'wide'
  | 'fisheye'
  | 'laser_eyes'
  | 'uncanny'
  | 'radial_blur'
  | 'pixel_sort'
  | 'emoji_mosaic'
  | 'spinning_3d'
  | 'tilt_shift'
  | 'ps1_demake';

export interface LaserEyePoint {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
}

export interface MemeLabConfig {
  effectType: MemeEffectType;
  // 1. Wide
  wideStretch: number; // 1.0 to 4.0
  wideWalkAnim: boolean; // whether to generate walking gif

  // 2. Fisheye
  fisheyeStrength: number; // 0.1 to 2.5
  fisheyeRadius: number; // 0.2 to 1.0

  // 3. Laser Eyes
  laserPoints: LaserEyePoint[];
  laserColor: 'red' | 'blue' | 'gold' | 'green';
  laserBeamSize: number; // 10 to 80

  // 4. Uncanny
  uncannyStage: number; // 1 to 10

  // 5. Radial Blur
  radialBlurStrength: number; // 5 to 60
  radialBlurPasses: number; // 5 to 20

  // 6. Pixel Sort
  pixelSortThreshold: number; // 20 to 220
  pixelSortDirection: 'vertical' | 'horizontal';

  // 7. Emoji Mosaic
  emojiDensity: number; // 15 to 60 (grid tiles across width)

  // 8. Spinning 3D
  spinningShape: 'cube' | 'cylinder' | 'flat';
  spinningSpeed: number; // 1 to 5
  spinningAngleDeg?: number; // manual angle 0 to 360

  // 9. Tilt Shift
  tiltShiftPosition: number; // 0 to 100 (% vertical center)
  tiltShiftBlur: number; // 2 to 20

  // 10. PS1 Demake
  ps1Resolution: number; // 120 to 360 (target height)
  ps1ColorDepth: number; // 8, 15, 16, 24 bits
  ps1Jitter: number; // 0 to 10
}

export interface MemeEffectMeta {
  id: MemeEffectType;
  name: string;
  subtitle: string;
  desc: string;
  icon: string;
  badgeBg: string;
  hasGifExport?: boolean;
}

export const MEME_EFFECTS: MemeEffectMeta[] = [
  {
    id: 'wide',
    name: '와이드 푸틴 밈',
    subtitle: 'Wide Stretch & Walk',
    desc: '가로 300% 강제 스트레칭 및 위풍당당 워킹 바운스',
    icon: '🚶‍♂️',
    badgeBg: '#3b82f6',
    hasGifExport: true,
  },
  {
    id: 'fisheye',
    name: '0.5x 어안 코봉이',
    subtitle: '0.5x Fisheye Nose Boop',
    desc: '코앞 3cm 얼빡샷 구체 확대 및 울트라 와이드 왜곡',
    icon: '🐶',
    badgeBg: '#f59e0b',
  },
  {
    id: 'laser_eyes',
    name: '각성 레이저 눈',
    subtitle: 'Laser Eyes & Lens Flare',
    desc: '눈에 발광하는 붉은/황금색 렌즈 플레어 레이저 빔 합성',
    icon: '👁️',
    badgeBg: '#ef4444',
  },
  {
    id: 'uncanny',
    name: '인크레더블 흑화',
    subtitle: 'Uncanny 10 Stages',
    desc: '1단계 정상부터 10단계 심연·해골·네거티브 기괴화',
    icon: '💀',
    badgeBg: '#1f2937',
  },
  {
    id: 'radial_blur',
    name: '방사형 패닉 블러',
    subtitle: 'Mr. Krabs Panic Blur',
    desc: '중심에서 사방으로 터져나가는 멘붕 원형 줌 블러',
    icon: '🚨',
    badgeBg: '#ec4899',
  },
  {
    id: 'pixel_sort',
    name: '픽셀 소팅 폭포수',
    subtitle: 'Pixel Sorting Glitch',
    desc: '밝기 임계값에 따라 픽셀이 아래로 쏟아져 내리는 글리치',
    icon: '🌊',
    badgeBg: '#06b6d4',
  },
  {
    id: 'emoji_mosaic',
    name: '이모지 모자이크',
    subtitle: 'Emoji Tile Mosaic',
    desc: '사진의 모든 픽셀을 😂, 💀, 🔥, 💩 등 이모지로 재구성',
    icon: '😂',
    badgeBg: '#8b5cf6',
  },
  {
    id: 'spinning_3d',
    name: '3D 스피닝 짤방',
    subtitle: 'Spinning 3D Texture',
    desc: '3D 큐브/원통에 사진을 입혀 360도 무한 회전하는 움짤',
    icon: '🐠',
    badgeBg: '#10b981',
    hasGifExport: true,
  },
  {
    id: 'tilt_shift',
    name: '미니어처 틸트시프트',
    subtitle: 'Tilt-Shift Miniature',
    desc: '상하단 아웃포커싱 블러와 고채도로 장난감 디오라마 연출',
    icon: '🤏',
    badgeBg: '#eab308',
  },
  {
    id: 'ps1_demake',
    name: 'PS1 레트로 디메이크',
    subtitle: '1995 PS1 Retro Gaming',
    desc: '240p 도트 경계 + 15비트 색상 감축 + 텍스처 떨림 왜곡',
    icon: '🎮',
    badgeBg: '#6366f1',
  },
];

export const MEME_SAMPLES = [
  {
    id: 'putin_cat',
    label: '위풍당당 냥이',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'dog_close',
    label: '호기심 강아지',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'human_face',
    label: '인물 인상 짤',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Loads an image from URL/DataURL safely
 */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * 1. Wide Stretch
 */
export function renderWideEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  stretch: number,
  verticalBounce: number = 0
) {
  const targetW = Math.round(w * stretch);
  const targetH = Math.round(h * (1 - verticalBounce * 0.15));

  ctx.canvas.width = targetW;
  ctx.canvas.height = targetH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);
}

/**
 * 2. Fisheye / Nose Boop Distortion
 */
export function renderFisheyeEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  strength: number,
  radiusFactor: number
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const srcData = ctx.getImageData(0, 0, w, h);
  const sData = srcData.data;
  const outData = ctx.createImageData(w, h);
  const oData = outData.data;

  const centerX = w / 2;
  const centerY = h / 2;
  const maxRadius = (Math.min(w, h) / 2) * radiusFactor;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let srcX = x;
      let srcY = y;

      if (dist < maxRadius) {
        const normDist = dist / maxRadius;
        // Spherical barrel mapping
        const distortion = Math.sin((normDist * Math.PI) / 2);
        const factor = (normDist / (distortion || 0.0001)) ** strength;

        srcX = centerX + dx * factor;
        srcY = centerY + dy * factor;
      }

      srcX = Math.min(w - 1, Math.max(0, Math.round(srcX)));
      srcY = Math.min(h - 1, Math.max(0, Math.round(srcY)));

      const outIdx = (y * w + x) * 4;
      const srcIdx = (srcY * w + srcX) * 4;

      oData[outIdx] = sData[srcIdx];
      oData[outIdx + 1] = sData[srcIdx + 1];
      oData[outIdx + 2] = sData[srcIdx + 2];
      oData[outIdx + 3] = sData[srcIdx + 3];
    }
  }

  ctx.putImageData(outData, 0, 0);
}

/**
 * 3. Laser Eyes / Lens Flare Overlay
 */
export function drawLaserEyeGlow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  colorScheme: 'red' | 'blue' | 'gold' | 'green'
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const coreColor = 'rgba(255, 255, 255, 1)';
  let midColor = 'rgba(255, 50, 50, 0.9)';
  let outerColor = 'rgba(255, 0, 0, 0)';
  let beamColor = 'rgba(255, 80, 80, 0.85)';

  if (colorScheme === 'blue') {
    midColor = 'rgba(50, 150, 255, 0.9)';
    outerColor = 'rgba(0, 100, 255, 0)';
    beamColor = 'rgba(80, 180, 255, 0.85)';
  } else if (colorScheme === 'gold') {
    midColor = 'rgba(255, 200, 30, 0.9)';
    outerColor = 'rgba(255, 150, 0, 0)';
    beamColor = 'rgba(255, 220, 50, 0.85)';
  } else if (colorScheme === 'green') {
    midColor = 'rgba(50, 255, 100, 0.9)';
    outerColor = 'rgba(0, 255, 50, 0)';
    beamColor = 'rgba(80, 255, 120, 0.85)';
  }

  // 1. Central high-intensity radial flare
  const radGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 1.5);
  radGrad.addColorStop(0, coreColor);
  radGrad.addColorStop(0.25, midColor);
  radGrad.addColorStop(1, outerColor);

  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Horizontal anamorphic lens streak
  const streakW = size * 6;
  const streakH = size * 0.35;
  const streakGrad = ctx.createLinearGradient(
    centerX - streakW / 2,
    centerY,
    centerX + streakW / 2,
    centerY
  );
  streakGrad.addColorStop(0, outerColor);
  streakGrad.addColorStop(0.5, beamColor);
  streakGrad.addColorStop(1, outerColor);

  ctx.fillStyle = streakGrad;
  ctx.fillRect(centerX - streakW / 2, centerY - streakH / 2, streakW, streakH);

  // 3. Diagonal star rays
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(centerX - size * 1.8, centerY - size * 0.8);
  ctx.lineTo(centerX + size * 1.8, centerY + size * 0.8);
  ctx.moveTo(centerX - size * 1.8, centerY + size * 0.8);
  ctx.lineTo(centerX + size * 1.8, centerY - size * 0.8);
  ctx.stroke();

  ctx.restore();
}

/**
 * 4. Uncanny 10 Stages Generator
 */
export function renderUncannyEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  stage: number
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Stage 1: Original
  if (stage <= 1) return;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (stage === 2) {
      // Stage 2: Slight Desaturation & Concern
      const desat = 0.4;
      r = r * (1 - desat) + gray * desat;
      g = g * (1 - desat) + gray * desat;
      b = b * (1 - desat) + gray * desat;
    } else if (stage === 3) {
      // Stage 3: Full Grayscale + Mild contrast
      r = (gray - 128) * 1.3 + 128;
      g = (gray - 128) * 1.3 + 128;
      b = (gray - 128) * 1.3 + 128;
    } else if (stage === 4) {
      // Stage 4: High Contrast Shadows (Unsettling)
      let val = gray < 110 ? gray * 0.6 : gray * 1.25;
      val = Math.min(255, Math.max(0, val));
      r = val;
      g = val;
      b = val;
    } else if (stage === 5) {
      // Stage 5: Hollow Contrast + Posterize
      const stepped = Math.floor(gray / 45) * 45;
      r = stepped < 90 ? 0 : stepped;
      g = stepped < 90 ? 0 : stepped;
      b = stepped < 90 ? 0 : stepped;
    } else if (stage === 6) {
      // Stage 6: Inverse Creepiness
      r = 255 - gray;
      g = 255 - gray;
      b = 255 - gray;
      // High contrast
      r = (r - 128) * 1.6 + 128;
      g = (g - 128) * 1.6 + 128;
      b = (b - 128) * 1.6 + 128;
    } else if (stage === 7) {
      // Stage 7: Red Demonic Bloodshot
      r = Math.min(255, gray * 1.5 + 40);
      g = Math.max(0, gray * 0.3 - 20);
      b = Math.max(0, gray * 0.3 - 20);
    } else if (stage === 8) {
      // Stage 8: Skull / Threshold Invert
      const thresh = gray > 120 ? 255 : 0;
      r = 255 - thresh;
      g = Math.round((255 - thresh) * 0.1);
      b = Math.round((255 - thresh) * 0.1);
    } else if (stage === 9) {
      // Stage 9: Extreme Static Void Glitch
      const n = (Math.random() - 0.5) * 140;
      let val = 255 - gray + n;
      val = val > 140 ? 255 : 0;
      r = val;
      g = val > 0 ? 30 : 0;
      b = val > 0 ? 30 : 0;
    } else if (stage >= 10) {
      // Stage 10: Absolute Abyss (Pure black eyes/creepy grain)
      const noise = (Math.random() - 0.5) * 60;
      const val = gray < 130 ? noise : 255;
      r = Math.max(0, Math.min(255, val));
      g = Math.max(0, Math.min(255, val * 0.2));
      b = Math.max(0, Math.min(255, val * 0.2));
    }

    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * 5. Radial Panic Blur (Mr. Krabs)
 */
export function renderRadialPanicBlur(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  strength: number,
  samples: number
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  tempCtx.drawImage(img, 0, 0, w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = 1 / samples;

  const maxScale = 1 + strength / 100;

  for (let i = 0; i < samples; i += 1) {
    const scale = 1 + ((maxScale - 1) * i) / (samples - 1);
    const sw = w * scale;
    const sh = h * scale;
    const sx = (w - sw) / 2;
    const sy = (h - sh) / 2;

    ctx.drawImage(tempCanvas, sx, sy, sw, sh);
  }

  ctx.globalAlpha = 1.0;
}

/**
 * 6. Pixel Sorting Glitch (Waterfall)
 */
export function renderPixelSortingEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  threshold: number,
  direction: 'vertical' | 'horizontal'
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const getBrightness = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  if (direction === 'vertical') {
    for (let x = 0; x < w; x += 1) {
      let startY = 0;
      while (startY < h) {
        // Find segment where brightness > threshold
        while (startY < h && getBrightness(x, startY) < threshold) {
          startY += 1;
        }
        let endY = startY;
        while (endY < h && getBrightness(x, endY) >= threshold) {
          endY += 1;
        }

        if (endY > startY) {
          // Sort column slice [startY, endY)
          const slice: { r: number; g: number; b: number; a: number; val: number }[] = [];
          for (let y = startY; y < endY; y += 1) {
            const idx = (y * w + x) * 4;
            const bVal = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            slice.push({
              r: data[idx],
              g: data[idx + 1],
              b: data[idx + 2],
              a: data[idx + 3],
              val: bVal,
            });
          }

          slice.sort((a, b) => a.val - b.val);

          for (let y = startY; y < endY; y += 1) {
            const idx = (y * w + x) * 4;
            const item = slice[y - startY];
            data[idx] = item.r;
            data[idx + 1] = item.g;
            data[idx + 2] = item.b;
            data[idx + 3] = item.a;
          }
        }

        startY = endY + 1;
      }
    }
  } else {
    // Horizontal sort
    for (let y = 0; y < h; y += 1) {
      let startX = 0;
      while (startX < w) {
        while (startX < w && getBrightness(startX, y) < threshold) {
          startX += 1;
        }
        let endX = startX;
        while (endX < w && getBrightness(endX, y) >= threshold) {
          endX += 1;
        }

        if (endX > startX) {
          const slice: { r: number; g: number; b: number; a: number; val: number }[] = [];
          for (let x = startX; x < endX; x += 1) {
            const idx = (y * w + x) * 4;
            const bVal = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            slice.push({
              r: data[idx],
              g: data[idx + 1],
              b: data[idx + 2],
              a: data[idx + 3],
              val: bVal,
            });
          }

          slice.sort((a, b) => a.val - b.val);

          for (let x = startX; x < endX; x += 1) {
            const idx = (y * w + x) * 4;
            const item = slice[x - startX];
            data[idx] = item.r;
            data[idx + 1] = item.g;
            data[idx + 2] = item.b;
            data[idx + 3] = item.a;
          }
        }

        startX = endX + 1;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * 7. Emoji Mosaic Generator
 */
const EMOJI_PALETTE = [
  { char: '💀', r: 230, g: 230, b: 230 },
  { char: '🖤', r: 30, g: 30, b: 30 },
  { char: '😂', r: 255, g: 204, b: 0 },
  { char: '🔥', r: 255, g: 100, b: 0 },
  { char: '❤️', r: 230, g: 30, b: 30 },
  { char: '💙', r: 30, g: 120, b: 255 },
  { char: '💚', r: 50, g: 200, b: 50 },
  { char: '💩', r: 139, g: 69, b: 19 },
  { char: '🗿', r: 140, g: 140, b: 150 },
  { char: '🤡', r: 240, g: 160, b: 170 },
  { char: '🌸', r: 255, g: 182, b: 193 },
  { char: '☕', r: 110, g: 60, b: 30 },
  { char: '🌊', r: 0, g: 180, b: 230 },
  { char: '✨', r: 255, g: 230, b: 100 },
];

export function renderEmojiMosaicEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  density: number
) {
  const tileSize = Math.max(8, Math.round(w / density));
  const cols = Math.floor(w / tileSize);
  const rows = Math.floor(h / tileSize);

  ctx.canvas.width = w;
  ctx.canvas.height = h;

  // Background dark base
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);

  // Measure average color on downscaled canvas
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) return;
  sampleCtx.drawImage(img, 0, 0, cols, rows);
  const sData = sampleCtx.getImageData(0, 0, cols, rows).data;

  ctx.font = `${tileSize * 0.9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = (r * cols + c) * 4;
      const sr = sData[idx];
      const sg = sData[idx + 1];
      const sb = sData[idx + 2];

      // Find closest emoji by Euclidean RGB distance
      let bestEmoji = EMOJI_PALETTE[0].char;
      let minDistance = Infinity;

      for (const em of EMOJI_PALETTE) {
        const dist = (sr - em.r) ** 2 + (sg - em.g) ** 2 + (sb - em.b) ** 2;
        if (dist < minDistance) {
          minDistance = dist;
          bestEmoji = em.char;
        }
      }

      const posX = c * tileSize + tileSize / 2;
      const posY = r * tileSize + tileSize / 2;
      ctx.fillText(bestEmoji, posX, posY);
    }
  }
}

/**
 * 8. 3D Spinning Texture Frame Generator (Software 3D Projection)
 */
export function renderSpinning3DFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  angleRad: number,
  shape: 'cube' | 'cylinder' | 'flat'
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;

  // Dark background gradient
  const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
  bg.addColorStop(0, '#1e293b');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const size = Math.min(w, h) * 0.55;

  ctx.save();
  ctx.translate(cx, cy);

  if (shape === 'flat') {
    // 3D Flat card rotation (Cosine scale projection)
    const cosAngle = Math.cos(angleRad);
    const sinTilt = Math.sin(angleRad * 0.5) * 0.1;
    const isFront = cosAngle >= 0;

    ctx.transform(cosAngle, sinTilt, 0, 1, 0, 0);

    const cardW = size;
    const cardH = (size * img.height) / (img.width || 1);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 14;

    ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);

    // Dynamic shading
    ctx.fillStyle = isFront
      ? `rgba(255, 255, 255, ${(1 - Math.abs(cosAngle)) * 0.35})`
      : 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
  } else {
    // 3D Cube faces projection
    const numFaces = 4;
    const faceW = size * 0.8;
    const faceH = size * 0.8;
    const radius = faceW / 2;

    const faces = [];
    for (let i = 0; i < numFaces; i += 1) {
      const faceAngle = angleRad + (i * Math.PI) / 2;
      const cos = Math.cos(faceAngle);
      const sin = Math.sin(faceAngle);
      const depth = sin * radius;

      faces.push({ index: i, cos, sin, depth, angle: faceAngle });
    }

    // Sort by depth (painter's algorithm)
    faces.sort((a, b) => a.depth - b.depth);

    for (const f of faces) {
      if (f.depth > -radius * 0.7) {
        ctx.save();
        const posX = f.cos * radius;
        const scaleX = -f.sin; // perspective width

        ctx.transform(scaleX, 0, 0, 1, posX, 0);
        ctx.drawImage(img, -faceW / 2, -faceH / 2, faceW, faceH);

        // Lighting shadow
        const shadow = (1 - f.cos) * 0.4;
        ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(0.7, shadow))})`;
        ctx.fillRect(-faceW / 2, -faceH / 2, faceW, faceH);

        ctx.restore();
      }
    }
  }

  ctx.restore();
}

/**
 * 9. Tilt-Shift Miniature
 */
export function renderTiltShiftEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  focusCenterYPct: number,
  blurRadius: number
) {
  ctx.canvas.width = w;
  ctx.canvas.height = h;

  // 1. Draw base image with saturated toy colors
  const sharpCanvas = document.createElement('canvas');
  sharpCanvas.width = w;
  sharpCanvas.height = h;
  const sCtx = sharpCanvas.getContext('2d');
  if (!sCtx) return;

  sCtx.drawImage(img, 0, 0, w, h);
  const sData = sCtx.getImageData(0, 0, w, h);
  const d = sData.data;

  // High saturation + high contrast (toy look)
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (delta > 0) {
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * 1.5;
      g = avg + (g - avg) * 1.5;
      b = avg + (b - avg) * 1.5;
    }

    r = (r - 128) * 1.25 + 128;
    g = (g - 128) * 1.25 + 128;
    b = (b - 128) * 1.25 + 128;

    d[i] = Math.min(255, Math.max(0, Math.round(r)));
    d[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    d[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }
  sCtx.putImageData(sData, 0, 0);

  // 2. Draw blurred copy
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext('2d');
  if (!bCtx) return;

  bCtx.filter = `blur(${blurRadius}px)`;
  bCtx.drawImage(sharpCanvas, 0, 0, w, h);

  // 3. Composite with linear focus mask
  ctx.drawImage(blurCanvas, 0, 0);

  const focusY = (h * focusCenterYPct) / 100;
  const bandH = h * 0.22;

  ctx.save();
  // Create gradient mask for sharp center
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    const grad = mCtx.createLinearGradient(0, 0, 0, h);
    const stop1 = Math.max(0, (focusY - bandH * 1.5) / h);
    const stop2 = Math.max(0, (focusY - bandH * 0.5) / h);
    const stop3 = Math.min(1, (focusY + bandH * 0.5) / h);
    const stop4 = Math.min(1, (focusY + bandH * 1.5) / h);

    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(stop1, 'rgba(0,0,0,0)');
    grad.addColorStop(stop2, 'rgba(0,0,0,1)');
    grad.addColorStop(stop3, 'rgba(0,0,0,1)');
    grad.addColorStop(stop4, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);

    // Apply mask to sharp image
    mCtx.globalCompositeOperation = 'source-in';
    mCtx.drawImage(sharpCanvas, 0, 0);

    ctx.drawImage(maskCanvas, 0, 0);
  }
  ctx.restore();
}

/**
 * 10. PS1 Retro 1995 Demake
 */
export function renderPS1DemakeEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  targetHeight: number,
  colorDepthBits: number,
  jitter: number
) {
  const downH = Math.max(80, Math.min(360, targetHeight));
  const downW = Math.round((w * downH) / h);

  const lowCanvas = document.createElement('canvas');
  lowCanvas.width = downW;
  lowCanvas.height = downH;
  const lowCtx = lowCanvas.getContext('2d', { willReadFrequently: true });
  if (!lowCtx) return;

  lowCtx.imageSmoothingEnabled = false;
  lowCtx.drawImage(img, 0, 0, downW, downH);

  const imgData = lowCtx.getImageData(0, 0, downW, downH);
  const data = imgData.data;

  // 15-bit color reduction (32 levels per channel) or customized bits
  const levels = colorDepthBits <= 8 ? 8 : colorDepthBits <= 15 ? 32 : 64;
  const step = 256 / levels;

  for (let i = 0; i < data.length; i += 4) {
    // Dithering pattern
    const px = (i / 4) % downW;
    const py = Math.floor(i / 4 / downW);
    const dither = px % 2 !== py % 2 ? -6 : 6;

    let r = Math.min(255, Math.max(0, data[i] + dither));
    let g = Math.min(255, Math.max(0, data[i + 1] + dither));
    let b = Math.min(255, Math.max(0, data[i + 2] + dither));

    r = Math.floor(r / step) * (255 / (levels - 1));
    g = Math.floor(g / step) * (255 / (levels - 1));
    b = Math.floor(b / step) * (255 / (levels - 1));

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  lowCtx.putImageData(imgData, 0, 0);

  // Upscale without smoothing + add affine jitter scanlines
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.imageSmoothingEnabled = false;

  const jitterOffset = jitter > 0 ? (Math.random() - 0.5) * jitter : 0;
  ctx.drawImage(lowCanvas, jitterOffset, 0, w, h);
}

/**
 * Main Master Meme Processor
 */
export async function renderMemePhoto(imageSrc: string, config: MemeLabConfig): Promise<string> {
  const origImg = await loadImageAsync(imageSrc);

  const maxDim = 1000;
  let targetW = origImg.naturalWidth || origImg.width;
  let targetH = origImg.naturalHeight || origImg.height;

  if (targetW > maxDim || targetH > maxDim) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to create canvas context');

  switch (config.effectType) {
    case 'wide':
      renderWideEffect(ctx, origImg, targetW, targetH, config.wideStretch);
      break;

    case 'fisheye':
      renderFisheyeEffect(
        ctx,
        origImg,
        targetW,
        targetH,
        config.fisheyeStrength,
        config.fisheyeRadius
      );
      break;

    case 'laser_eyes':
      ctx.drawImage(origImg, 0, 0, targetW, targetH);
      for (const pt of config.laserPoints) {
        drawLaserEyeGlow(
          ctx,
          pt.x * targetW,
          pt.y * targetH,
          config.laserBeamSize,
          config.laserColor
        );
      }
      break;

    case 'uncanny':
      renderUncannyEffect(ctx, origImg, targetW, targetH, config.uncannyStage);
      break;

    case 'radial_blur':
      renderRadialPanicBlur(
        ctx,
        origImg,
        targetW,
        targetH,
        config.radialBlurStrength,
        config.radialBlurPasses
      );
      break;

    case 'pixel_sort':
      renderPixelSortingEffect(
        ctx,
        origImg,
        targetW,
        targetH,
        config.pixelSortThreshold,
        config.pixelSortDirection
      );
      break;

    case 'emoji_mosaic':
      renderEmojiMosaicEffect(ctx, origImg, targetW, targetH, config.emojiDensity);
      break;

    case 'spinning_3d':
      renderSpinning3DFrame(
        ctx,
        origImg,
        targetW,
        targetH,
        ((config.spinningAngleDeg || 45) * Math.PI) / 180,
        config.spinningShape
      );
      break;

    case 'tilt_shift':
      renderTiltShiftEffect(
        ctx,
        origImg,
        targetW,
        targetH,
        config.tiltShiftPosition,
        config.tiltShiftBlur
      );
      break;

    case 'ps1_demake':
      renderPS1DemakeEffect(
        ctx,
        origImg,
        targetW,
        targetH,
        config.ps1Resolution,
        config.ps1ColorDepth,
        config.ps1Jitter
      );
      break;

    default:
      ctx.drawImage(origImg, 0, 0, targetW, targetH);
      break;
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates an Animated GIF (e.g. for Wide Walk or 3D Spinning)
 */
export async function createMemeAnimatedGif(
  imageSrc: string,
  config: MemeLabConfig,
  numFrames: number = 16
): Promise<string> {
  const origImg = await loadImageAsync(imageSrc);

  const frameWidth = 480;
  const frameHeight = Math.round((frameWidth * origImg.height) / (origImg.width || 1));

  const canvas = document.createElement('canvas');
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for gif generation');

  const frameImages: string[] = [];

  for (let f = 0; f < numFrames; f += 1) {
    const progress = f / numFrames;

    if (config.effectType === 'spinning_3d') {
      const angle = progress * Math.PI * 2;
      renderSpinning3DFrame(ctx, origImg, frameWidth, frameHeight, angle, config.spinningShape);
    } else if (config.effectType === 'wide') {
      // Walking bounce simulation
      const bounce = Math.abs(Math.sin(progress * Math.PI * 4));
      const stretch = config.wideStretch * (1 + Math.sin(progress * Math.PI * 2) * 0.15);
      renderWideEffect(ctx, origImg, frameWidth, frameHeight, stretch, bounce);
    } else {
      ctx.drawImage(origImg, 0, 0, frameWidth, frameHeight);
    }

    frameImages.push(canvas.toDataURL('image/png'));
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: frameImages,
        gifWidth: canvas.width,
        gifHeight: canvas.height,
        interval: 0.08,
        numWorkers: 2,
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (!obj.error) {
          resolve(obj.image);
        } else {
          reject(new Error(obj.errorMsg || 'Failed to create GIF'));
        }
      }
    );
  });
}
