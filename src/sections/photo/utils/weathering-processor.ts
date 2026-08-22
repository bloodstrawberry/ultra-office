export type WeatheringColorMode =
  | 'natural'
  | 'green_mold'
  | 'aged_yellow'
  | 'deep_fried'
  | 'grayscale';

export interface WeatheringConfig {
  presetId?: string;
  generations: number; // 1 to 25 cycles of lossy compression
  jpegQuality: number; // 0.01 to 0.50 (low quality per cycle)
  downscaleFactor: number; // 0.2 to 1.0 (internal resolution downsampling)
  colorMode: WeatheringColorMode;
  sharpenIntensity: number; // 0 to 100 (halo artifact & edge burn)
  showScreenshotUi: boolean; // battery / time / letters
  screenshotUiLevel: number; // 1 to 3 layers of nested status bar & letterbox
  watermarkCount: number; // 0 to 4 stacked community logos
  noiseIntensity: number; // 0 to 100
}

export interface WeatheringPreset {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  icon: string;
  badgeBg: string;
  config: WeatheringConfig;
}

export const WEATHERING_PRESETS: WeatheringPreset[] = [
  {
    id: 'mild',
    name: '살짝 풍화',
    subtitle: '2022 SNS 재업로드',
    desc: '가벼운 JPEG 아티팩트와 은은한 압축 손실',
    icon: '🌱',
    badgeBg: '#10b981',
    config: {
      presetId: 'mild',
      generations: 3,
      jpegQuality: 0.35,
      downscaleFactor: 0.75,
      colorMode: 'natural',
      sharpenIntensity: 20,
      showScreenshotUi: false,
      screenshotUiLevel: 1,
      watermarkCount: 0,
      noiseIntensity: 15,
    },
  },
  {
    id: 'kakaotalk',
    name: '카톡 100회 전송',
    subtitle: '단톡방 무한 재전송 짤',
    desc: '자글자글한 8x8 블록 노이즈와 살짝 누런 압축감',
    icon: '💬',
    badgeBg: '#eab308',
    config: {
      presetId: 'kakaotalk',
      generations: 7,
      jpegQuality: 0.22,
      downscaleFactor: 0.55,
      colorMode: 'aged_yellow',
      sharpenIntensity: 45,
      showScreenshotUi: true,
      screenshotUiLevel: 1,
      watermarkCount: 1,
      noiseIntensity: 30,
    },
  },
  {
    id: 'green_mold',
    name: '초록빛 썩은 짤',
    subtitle: '커뮤니티 대표 풍화 짤',
    desc: '초록색 틴트 변색 + 테두리 자막 하얗게 타는 현상',
    icon: '🍵',
    badgeBg: '#22c55e',
    config: {
      presetId: 'green_mold',
      generations: 12,
      jpegQuality: 0.12,
      downscaleFactor: 0.45,
      colorMode: 'green_mold',
      sharpenIntensity: 70,
      showScreenshotUi: true,
      screenshotUiLevel: 2,
      watermarkCount: 2,
      noiseIntensity: 50,
    },
  },
  {
    id: 'fossil',
    name: '고대 화석 짤',
    subtitle: '2005년 커뮤니티 유물',
    desc: '배터리 3% UI + 겹겹이 중첩된 워터마크 + 심한 픽셀 뭉개짐',
    icon: '🏛️',
    badgeBg: '#8b5cf6',
    config: {
      presetId: 'fossil',
      generations: 18,
      jpegQuality: 0.05,
      downscaleFactor: 0.32,
      colorMode: 'green_mold',
      sharpenIntensity: 85,
      showScreenshotUi: true,
      screenshotUiLevel: 3,
      watermarkCount: 4,
      noiseIntensity: 75,
    },
  },
  {
    id: 'deep_fried',
    name: '딥 프라이드 (혼돈)',
    subtitle: 'Deep-Fried Chaos',
    desc: '채도 300% 폭발 + 극단적 샤픈 + 붉고 노랗게 타는 노이즈',
    icon: '🔥',
    badgeBg: '#ef4444',
    config: {
      presetId: 'deep_fried',
      generations: 14,
      jpegQuality: 0.08,
      downscaleFactor: 0.4,
      colorMode: 'deep_fried',
      sharpenIntensity: 100,
      showScreenshotUi: true,
      screenshotUiLevel: 2,
      watermarkCount: 3,
      noiseIntensity: 80,
    },
  },
];

export const WEATHERING_SAMPLES = [
  {
    id: 'cat',
    label: '고양이 짤방',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'doge',
    label: '강아지 짤',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'street',
    label: '도심 풍경',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
  },
];

const COMMUNITY_WATERMARKS = [
  {
    text: 'DCINSIDE.COM',
    pos: 'top-left',
    color: 'rgba(0, 51, 153, 0.75)',
    bg: 'rgba(255, 255, 255, 0.65)',
  },
  {
    text: 'humoruniv.com (웃대)',
    pos: 'bottom-right',
    color: 'rgba(204, 0, 0, 0.8)',
    bg: 'rgba(255, 255, 255, 0.7)',
  },
  {
    text: 'RULIWEB.COM 루리웹',
    pos: 'bottom-left',
    color: 'rgba(0, 102, 204, 0.8)',
    bg: 'rgba(255, 255, 255, 0.7)',
  },
  {
    text: 'FB: 세상에서 가장 웃긴 동영상',
    pos: 'top-right',
    color: 'rgba(24, 119, 242, 0.85)',
    bg: 'rgba(255, 255, 255, 0.7)',
  },
];

/**
 * Loads an image from URL/DataURL asynchronously
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
 * Helper to apply sharpening convolution kernel
 */
function applySharpenKernel(data: Uint8ClampedArray, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  const factor = (amount / 100) * 1.5;
  const copy = new Uint8ClampedArray(data);

  // 3x3 unsharp / high-pass kernel
  // [  0, -1,  0 ]
  // [ -1, 4+f, -1 ]
  // [  0, -1,  0 ]
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c += 1) {
        const top = copy[((y - 1) * w + x) * 4 + c];
        const bottom = copy[((y + 1) * w + x) * 4 + c];
        const left = copy[(y * w + (x - 1)) * 4 + c];
        const right = copy[(y * w + (x + 1)) * 4 + c];
        const center = copy[idx + c];

        const val = center + factor * (center * 4 - top - bottom - left - right);
        data[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
      }
    }
  }
}

/**
 * Apply color decay / tint curves for specific weathering mode
 */
function applyColorModeCurve(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  mode: WeatheringColorMode,
  noiseStrength: number
) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (mode === 'green_mold') {
      // Classic Rotten Green Mold: boost green channel, attenuate red/blue high ends
      g = Math.min(255, g * 1.12 + 10);
      r = Math.max(0, r * 0.94 - 4);
      b = Math.max(0, b * 0.9 - 6);

      // Contrast steepening
      r = (r - 128) * 1.25 + 128;
      g = (g - 128) * 1.25 + 128;
      b = (b - 128) * 1.25 + 128;
    } else if (mode === 'aged_yellow') {
      // Aged yellowish oxidation (yellow = red + green, reduce blue)
      r = Math.min(255, r * 1.08 + 8);
      g = Math.min(255, g * 1.05 + 4);
      b = Math.max(0, b * 0.78 - 8);
      // Slight contrast boost
      r = (r - 128) * 1.15 + 128;
      g = (g - 128) * 1.15 + 128;
      b = (b - 128) * 1.15 + 128;
    } else if (mode === 'deep_fried') {
      // Extreme oversaturation and red-orange hyper-contrast
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const delta = maxC - minC;

      // Saturation 250%
      if (delta > 0) {
        const satMult = 2.4;
        const avg = (r + g + b) / 3;
        r = avg + (r - avg) * satMult;
        g = avg + (g - avg) * satMult;
        b = avg + (b - avg) * satMult;
      }

      // Hyper contrast
      r = (r - 128) * 1.7 + 140;
      g = (g - 128) * 1.5 + 115;
      b = (b - 128) * 1.3 + 90;
    } else if (mode === 'grayscale') {
      // Degraded low-fi grayscale
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const stepped = Math.floor(gray / 32) * 32; // Posterized gray
      r = stepped;
      g = stepped;
      b = stepped;
    } else {
      // Natural weathering: mild contrast & mild warmth
      r = Math.min(255, r * 1.03 + 2);
      b = Math.max(0, b * 0.96 - 2);
      r = (r - 128) * 1.08 + 128;
      g = (g - 128) * 1.08 + 128;
      b = (b - 128) * 1.08 + 128;
    }

    // Add noise grain
    if (noiseStrength > 0) {
      const noise = (Math.random() - 0.5) * (noiseStrength * 0.7);
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }
}

/**
 * Draw layered screenshot artifacts (nested status bar, letterboxes, volume HUD)
 */
function drawNestedScreenshotOverlays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  level: number
) {
  // 1. Nested letterbox margins
  if (level >= 1) {
    const barH = Math.max(16, Math.round(h * 0.045));
    // Top mobile status bar
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, barH);

    // Status bar contents: Time, 3% battery in red, LTE icon
    ctx.fillStyle = '#f87171'; // Red battery
    const batW = 20;
    const batH = 10;
    const batX = w - batW - 14;
    const batY = Math.round(barH / 2 - batH / 2);
    ctx.fillRect(batX, batY, batW, batH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(batX + batW, batY + 2, 2, batH - 4); // tip

    // Battery percentage text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('3%', batX - 5, barH / 2 + 3);

    // LTE / Wi-Fi icon text
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('LTE 1칸', batX - 28, barH / 2 + 3);

    // Time text
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('새벽 03:37', 12, barH / 2 + 3.5);

    // Bottom home bar
    const btmH = Math.max(12, Math.round(h * 0.03));
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, h - btmH, w, btmH);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 35, h - btmH / 2 - 2, 70, 4, 2);
    ctx.fill();
  }

  // 2. Volume bar HUD artifact (Layer 2)
  if (level >= 2) {
    const hudW = Math.max(36, Math.round(w * 0.1));
    const hudH = Math.max(80, Math.round(h * 0.28));
    const hudX = 14;
    const hudY = Math.round(h * 0.35);

    ctx.fillStyle = 'rgba(30, 30, 30, 0.78)';
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();

    // Volume level pill
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(hudX + hudW / 2 - 3, hudY + hudH * 0.45, 6, hudH * 0.45, 3);
    ctx.fill();

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔊', hudX + hudW / 2, hudY + 22);
  }

  // 3. Second nested outer border (Layer 3)
  if (level >= 3) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 12);
  }
}

/**
 * Draw stacked community watermarks across corners
 */
function drawCommunityWatermarks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number
) {
  const appliedCount = Math.min(count, COMMUNITY_WATERMARKS.length);

  for (let i = 0; i < appliedCount; i += 1) {
    const wm = COMMUNITY_WATERMARKS[i];
    ctx.save();

    const fontSize = Math.max(11, Math.round(w * 0.024));
    ctx.font = `bold ${fontSize}px "Noto Sans KR", Arial, sans-serif`;
    const textWidth = ctx.measureText(wm.text).width;
    const paddingX = 8;
    const paddingY = 4;
    const boxW = textWidth + paddingX * 2;
    const boxH = fontSize + paddingY * 2;

    let posX = 16;
    let posY = 24;

    if (wm.pos === 'top-left') {
      posX = 16;
      posY = Math.round(h * 0.08);
    } else if (wm.pos === 'top-right') {
      posX = w - boxW - 16;
      posY = Math.round(h * 0.08);
    } else if (wm.pos === 'bottom-left') {
      posX = 16;
      posY = h - boxH - Math.round(h * 0.06);
    } else if (wm.pos === 'bottom-right') {
      posX = w - boxW - 16;
      posY = h - boxH - Math.round(h * 0.06);
    }

    // Semi-transparent watermark background badge
    ctx.fillStyle = wm.bg;
    ctx.fillRect(posX, posY, boxW, boxH);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(posX, posY, boxW, boxH);

    // Text
    ctx.fillStyle = wm.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(wm.text, posX + paddingX, posY + boxH / 2);

    ctx.restore();
  }
}

/**
 * Main Digital Weathering (Generation Loss) Renderer
 */
export async function renderWeatheringPhoto(
  imageSrc: string,
  config: WeatheringConfig
): Promise<string> {
  const origImg = await loadImageAsync(imageSrc);

  const maxDimension = 1100;
  let targetW = origImg.naturalWidth || origImg.width;
  let targetH = origImg.naturalHeight || origImg.height;

  if (targetW > maxDimension || targetH > maxDimension) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDimension) / targetW);
      targetW = maxDimension;
    } else {
      targetW = Math.round((targetW * maxDimension) / targetH);
      targetH = maxDimension;
    }
  }

  // Work canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2d context for weathering canvas');

  // Draw initial base image
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(origImg, 0, 0, targetW, targetH);

  // Apply Nested Overlays (if enabled) before generation cycles so they also undergo weathering!
  if (config.showScreenshotUi) {
    drawNestedScreenshotOverlays(ctx, targetW, targetH, config.screenshotUiLevel);
  }
  if (config.watermarkCount > 0) {
    drawCommunityWatermarks(ctx, targetW, targetH, config.watermarkCount);
  }

  // 1. Initial Color Grading & Sharpening
  let imgData = ctx.getImageData(0, 0, targetW, targetH);
  applyColorModeCurve(imgData.data, targetW, targetH, config.colorMode, config.noiseIntensity);
  applySharpenKernel(imgData.data, targetW, targetH, config.sharpenIntensity);
  ctx.putImageData(imgData, 0, 0);

  // 2. Iterative Generation Loss Loop (Simulate repeated re-compression & reposts)
  const cycles = Math.max(1, Math.min(25, config.generations));
  const quality = Math.max(0.01, Math.min(0.5, config.jpegQuality));
  const downFactor = Math.max(0.2, Math.min(1.0, config.downscaleFactor));

  // Intermediate helper canvas for downsampling
  const downCanvas = document.createElement('canvas');
  const downW = Math.max(32, Math.round(targetW * downFactor));
  const downH = Math.max(32, Math.round(targetH * downFactor));
  downCanvas.width = downW;
  downCanvas.height = downH;
  const downCtx = downCanvas.getContext('2d', { willReadFrequently: true });

  let currentDataUrl = canvas.toDataURL('image/jpeg', quality);

  for (let cycle = 0; cycle < cycles; cycle += 1) {
    const cycleImg = await loadImageAsync(currentDataUrl);

    if (downCtx) {
      // Step A: Downscale with low-quality smoothing to induce 8x8 blockiness
      downCtx.imageSmoothingEnabled = cycle % 2 === 0;
      downCtx.drawImage(cycleImg, 0, 0, downW, downH);

      // Step B: Upscale back to target canvas with slight offset to simulate imperfect screenshot crops
      ctx.imageSmoothingEnabled = false; // Nearest-neighbor upscale accentuates JPEG artifacts
      const offsetX = (cycle % 3) - 1;
      const offsetY = (cycle % 2) - 1;
      ctx.drawImage(downCanvas, offsetX, offsetY, targetW, targetH);
    } else {
      ctx.drawImage(cycleImg, 0, 0, targetW, targetH);
    }

    // Mid-cycle sharpen on selected cycles to simulate social media app auto-sharpening
    if (cycle % 3 === 0 && config.sharpenIntensity > 30) {
      imgData = ctx.getImageData(0, 0, targetW, targetH);
      applySharpenKernel(imgData.data, targetW, targetH, Math.round(config.sharpenIntensity * 0.4));
      ctx.putImageData(imgData, 0, 0);
    }

    // Re-encode to JPEG
    currentDataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // Final slight color tune
  imgData = ctx.getImageData(0, 0, targetW, targetH);
  if (config.colorMode === 'green_mold') {
    // Extra green boost on final output
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i + 1] = Math.min(255, imgData.data[i + 1] * 1.04);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}
