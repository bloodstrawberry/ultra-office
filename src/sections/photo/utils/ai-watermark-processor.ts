'use client';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export type PositionPreset =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

export interface WatermarkLogo {
  id: string;
  name: string;
  src: string;
  defaultText: string;
  category?: 'ai_model' | 'custom';
}

export interface WatermarkRenderOptions {
  opacity: number; // 0.05 ~ 1.0
  scale: number; // 0.05 ~ 0.6 (percentage of main image size)
  rotation: number; // degrees (0 ~ 360)
  positionPreset: PositionPreset;
  customX?: number; // 0.0 ~ 1.0 relative
  customY?: number; // 0.0 ~ 1.0 relative
  customText: string;
  showText?: boolean;
  textColor?: string;
  showLogoCircle?: boolean;
  showLogoArrow?: boolean;
  showLogoSquare?: boolean;
  logoAnnotationColor?: string;
  logoAnnotationLineWidth?: number; // 0.5 ~ 2.5
  logoAnnotationOpacity?: number; // 0.1 ~ 1.0
  logoAnnotationSize?: number; // 0.5 ~ 2.0
}

export interface SampleAiWatermarkImage {
  id: string;
  label: string;
  url: string;
  subLabel: string;
}

// ----------------------------------------------------------------------
// Preset AI Logos
// ----------------------------------------------------------------------

export const PRESET_AI_LOGOS: WatermarkLogo[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    src: '/assets/watermark_logo/chatgpt.png',
    defaultText: 'Created with ChatGPT',
    category: 'ai_model',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    src: '/assets/watermark_logo/gemini.png',
    defaultText: 'Generated with Gemini',
    category: 'ai_model',
  },
  {
    id: 'claude',
    name: 'Claude',
    src: '/assets/watermark_logo/claude.png',
    defaultText: 'Created with Claude',
    category: 'ai_model',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    src: '/assets/watermark_logo/deepseek.png',
    defaultText: 'Created with DeepSeek',
    category: 'ai_model',
  },
  {
    id: 'grok',
    name: 'Grok',
    src: '/assets/watermark_logo/grok.png',
    defaultText: 'Created with Grok',
    category: 'ai_model',
  },
  {
    id: 'galaxy',
    name: 'Galaxy AI',
    src: '/assets/watermark_logo/galaxy.png',
    defaultText: 'Galaxy AI',
    category: 'ai_model',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    src: '/assets/watermark_logo/perplexity.png',
    defaultText: 'Perplexity AI',
    category: 'ai_model',
  },
  {
    id: 'meta',
    name: 'Meta AI',
    src: '/assets/watermark_logo/meta.jpg',
    defaultText: 'Meta AI (Llama)',
    category: 'ai_model',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    src: '/assets/watermark_logo/mistral.png',
    defaultText: 'Mistral AI',
    category: 'ai_model',
  },
  {
    id: 'wrtn',
    name: '뤼튼 (Wrtn)',
    src: '/assets/watermark_logo/wrtn.png',
    defaultText: '뤼튼 AI 생성',
    category: 'ai_model',
  },
  {
    id: 'adot',
    name: '에이닷 (A.dot)',
    src: '/assets/watermark_logo/adot.png',
    defaultText: '에이닷 AI',
    category: 'ai_model',
  },
];

// ----------------------------------------------------------------------
// Sample Images
// ----------------------------------------------------------------------

export const AI_WATERMARK_SAMPLES: SampleAiWatermarkImage[] = [
  {
    id: 'sample-cyberpunk',
    label: '사이버펑크 미래 도시',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    subLabel: 'AI 생성 SF 컨셉 아트',
  },
  {
    id: 'sample-portrait',
    label: '판타지 인물 포트레이트',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
    subLabel: '인물 & 캐릭터 렌더링',
  },
  {
    id: 'sample-landscape',
    label: '환상적인 오로라 산맥',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '풍경 & 자연 일러스트',
  },
  {
    id: 'sample-product',
    label: '미니멀 3D 디자인 제품',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    subLabel: '3D 렌더링 & 패키지 디자인',
  },
];

// ----------------------------------------------------------------------
// Custom Logo Management
// ----------------------------------------------------------------------

const customLogosStore: WatermarkLogo[] = [];

export function addCustomLogo(logo: WatermarkLogo): void {
  const existingIdx = customLogosStore.findIndex((l) => l.id === logo.id);
  if (existingIdx >= 0) {
    customLogosStore[existingIdx] = logo;
  } else {
    customLogosStore.unshift(logo);
  }
}

export function getCustomLogos(): WatermarkLogo[] {
  return [...customLogosStore];
}

export function removeCustomLogo(id: string): void {
  const idx = customLogosStore.findIndex((l) => l.id === id);
  if (idx >= 0) {
    customLogosStore.splice(idx, 1);
  }
}

export function getAllLogos(): WatermarkLogo[] {
  return [...customLogosStore, ...PRESET_AI_LOGOS];
}

export function findLogoById(id: string): WatermarkLogo {
  const all = getAllLogos();
  const found = all.find((item) => item.id === id);
  return found || PRESET_AI_LOGOS[0];
}

// ----------------------------------------------------------------------
// Image Loader Helper
// ----------------------------------------------------------------------

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// ----------------------------------------------------------------------
// Hand-Drawn Marker Annotations (Circle, Arrow, Square)
// ----------------------------------------------------------------------

/**
 * Draws a natural hand-drawn marker style circle around the logo bounding area.
 */
export function drawHandDrawnCircle(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color: string = '#EF4444',
  widthMultiplier: number = 1.0,
  sizeMultiplier: number = 1.0,
  annotationOpacity: number = 1.0
): void {
  const rx = Math.max(logoW * 0.65, 18) * sizeMultiplier;
  const ry = Math.max(logoH * 0.65, 18) * sizeMultiplier;
  const lineWidth = Math.max(3.5, Math.min(rx, ry) * 0.1) * widthMultiplier;

  ctx.save();
  ctx.translate(0, logoYOffset);
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Main hand-drawn circle loop (starting top-right, looping left & bottom, overlapping at top)
  ctx.beginPath();
  ctx.moveTo(rx * 0.35, -ry * 0.92);

  ctx.bezierCurveTo(-rx * 0.6, -ry * 1.15, -rx * 1.12, -ry * 0.5, -rx * 1.08, ry * 0.1);
  ctx.bezierCurveTo(-rx * 1.05, ry * 1.12, rx * 0.4, ry * 1.18, rx * 1.08, ry * 0.5);
  ctx.bezierCurveTo(rx * 1.15, -ry * 0.4, rx * 0.7, -ry * 1.08, -rx * 0.05, -ry * 0.98);
  ctx.bezierCurveTo(-rx * 0.5, -ry * 0.92, -rx * 0.85, -rx * 0.5, -rx * 0.75, -ry * 0.2);

  ctx.stroke();

  // Secondary subtle stroke offset for natural marker ink density
  ctx.beginPath();
  ctx.lineWidth = lineWidth * 0.45;
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity)) * 0.65;
  ctx.moveTo(rx * 0.32, -ry * 0.95);
  ctx.bezierCurveTo(-rx * 0.58, -ry * 1.18, -rx * 1.1, -ry * 0.52, -rx * 1.06, ry * 0.08);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a hand-drawn marker style arrow pointing directly at the logo.
 */
export function drawHandDrawnArrow(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color: string = '#EF4444',
  widthMultiplier: number = 1.0,
  sizeMultiplier: number = 1.0,
  annotationOpacity: number = 1.0
): void {
  const rx = Math.max(logoW * 0.65, 18) * sizeMultiplier;
  const ry = Math.max(logoH * 0.65, 18) * sizeMultiplier;
  const lineWidth = Math.max(3.5, Math.min(rx, ry) * 0.1) * widthMultiplier;

  ctx.save();
  ctx.translate(0, logoYOffset);
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --- Shaft: Smooth, sweeping C-curve ---
  const startX = -rx * 1.5;
  const startY = -ry * 1.4;

  const endX = -rx * 0.35;
  const endY = -ry * 0.35;

  const cp1X = -rx * 1.4;
  const cp1Y = -ry * 0.6;
  const cp2X = -rx * 0.8;
  const cp2Y = -ry * 0.35;

  const tdx = endX - cp2X;
  const tdy = endY - cp2Y;
  const tAngle = Math.atan2(tdy, tdx);

  const shaftEndX = endX - Math.cos(tAngle) * (lineWidth * 0.4);
  const shaftEndY = endY - Math.sin(tAngle) * (lineWidth * 0.4);

  // Draw Primary Shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, shaftEndX, shaftEndY);
  ctx.stroke();

  // --- Arrowhead: Continuous V-stroke, asymmetrical for hand-drawn marker feel ---
  const barbLen = Math.max(16, Math.min(rx, ry) * 0.55);

  const angle1 = tAngle - 0.45;
  const b1Len = barbLen * 1.05;
  const b1x = endX - Math.cos(angle1) * b1Len;
  const b1y = endY - Math.sin(angle1) * b1Len;
  const b1cx = endX - Math.cos(tAngle - 0.2) * (b1Len * 0.5);
  const b1cy = endY - Math.sin(tAngle - 0.2) * (b1Len * 0.5);

  const angle2 = tAngle + 0.55;
  const b2Len = barbLen * 0.95;
  const b2x = endX - Math.cos(angle2) * b2Len;
  const b2y = endY - Math.sin(angle2) * b2Len;
  const b2cx = endX - Math.cos(tAngle + 0.3) * (b2Len * 0.5);
  const b2cy = endY - Math.sin(tAngle + 0.3) * (b2Len * 0.5);

  // Draw Primary Arrowhead
  ctx.beginPath();
  ctx.moveTo(b1x, b1y);
  ctx.quadraticCurveTo(b1cx, b1cy, endX, endY);
  ctx.quadraticCurveTo(b2cx, b2cy, b2x, b2y);
  ctx.stroke();

  // Secondary marker wobble
  ctx.lineWidth = lineWidth * 0.45;
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity)) * 0.6;

  ctx.beginPath();
  ctx.moveTo(startX + 1, startY + 1);
  ctx.bezierCurveTo(cp1X + 1.5, cp1Y + 0.5, cp2X - 0.5, cp2Y + 1, shaftEndX - 0.5, shaftEndY + 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(b1x + 0.5, b1y - 0.5);
  ctx.quadraticCurveTo(b1cx + 1, b1cy, endX, endY);
  ctx.quadraticCurveTo(b2cx - 1, b2cy + 0.5, b2x - 0.5, b2y + 0.5);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a hand-drawn marker style square/rectangle around the logo.
 */
export function drawHandDrawnSquare(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color: string = '#EF4444',
  widthMultiplier: number = 1.0,
  sizeMultiplier: number = 1.0,
  annotationOpacity: number = 1.0
): void {
  const rx = Math.max(logoW * 0.65, 18) * sizeMultiplier;
  const ry = Math.max(logoH * 0.65, 18) * sizeMultiplier;
  const lineWidth = Math.max(3.5, Math.min(rx, ry) * 0.1) * widthMultiplier;

  ctx.save();
  ctx.translate(0, logoYOffset);
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-rx * 0.95, -ry * 0.98);
  ctx.quadraticCurveTo(0, -ry * 1.05, rx * 0.98, -ry * 0.95);
  ctx.quadraticCurveTo(rx * 1.05, 0, rx * 0.95, ry * 0.98);
  ctx.quadraticCurveTo(0, ry * 1.05, -rx * 0.98, ry * 0.95);
  ctx.quadraticCurveTo(-rx * 1.05, 0, -rx * 0.92, -ry * 1.08);
  ctx.quadraticCurveTo(-rx * 0.4, -ry * 1.04, rx * 0.1, -ry * 0.96);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = lineWidth * 0.45;
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity)) * 0.65;
  ctx.moveTo(-rx * 0.95, -ry * 0.95);
  ctx.quadraticCurveTo(0, -ry * 1.02, rx * 0.95, -ry * 0.92);
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------
// Coordinate Calculations & Geometry
// ----------------------------------------------------------------------

export function calculateWatermarkCoordinates(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  preset: PositionPreset,
  customX: number = 0.85,
  customY: number = 0.85,
  padding: number = 24
): { x: number; y: number } {
  if (preset === 'custom') {
    return {
      x: Math.max(
        watermarkWidth / 2,
        Math.min(canvasWidth - watermarkWidth / 2, customX * canvasWidth)
      ),
      y: Math.max(
        watermarkHeight / 2,
        Math.min(canvasHeight - watermarkHeight / 2, customY * canvasHeight)
      ),
    };
  }

  let x = canvasWidth / 2;
  let y = canvasHeight / 2;

  switch (preset) {
    case 'top-left':
      x = padding + watermarkWidth / 2;
      y = padding + watermarkHeight / 2;
      break;
    case 'top-center':
      x = canvasWidth / 2;
      y = padding + watermarkHeight / 2;
      break;
    case 'top-right':
      x = canvasWidth - padding - watermarkWidth / 2;
      y = padding + watermarkHeight / 2;
      break;
    case 'center-left':
      x = padding + watermarkWidth / 2;
      y = canvasHeight / 2;
      break;
    case 'center':
      x = canvasWidth / 2;
      y = canvasHeight / 2;
      break;
    case 'center-right':
      x = canvasWidth - padding - watermarkWidth / 2;
      y = canvasHeight / 2;
      break;
    case 'bottom-left':
      x = padding + watermarkWidth / 2;
      y = canvasHeight - padding - watermarkHeight / 2;
      break;
    case 'bottom-center':
      x = canvasWidth / 2;
      y = canvasHeight - padding - watermarkHeight / 2;
      break;
    case 'bottom-right':
      x = canvasWidth - padding - watermarkWidth / 2;
      y = canvasHeight - padding - watermarkHeight / 2;
      break;
    default:
      break;
  }

  return { x, y };
}

/**
 * Checks if a point (x, y) on the canvas falls inside or near the logo watermark.
 */
export function isPointInWatermark(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions,
  clickCanvasX: number,
  clickCanvasY: number,
  screenCanvasWidth: number = 400
): boolean {
  const {
    scale = 0.12,
    rotation = 0,
    positionPreset = 'bottom-right',
    customX = 0.85,
    customY = 0.85,
    customText = '',
    showText = false,
  } = options;

  const minDim = Math.min(canvasWidth, canvasHeight);
  const logoAspect = logoImg ? logoImg.width / logoImg.height || 1 : 1;
  const logoBaseSize = minDim * Math.max(0.05, Math.min(0.6, scale));

  let logoW = logoBaseSize;
  let logoH = logoBaseSize / logoAspect;
  if (logoAspect < 1) {
    logoH = logoBaseSize;
    logoW = logoBaseSize * logoAspect;
  }

  const fontSize = Math.max(12, Math.round(logoBaseSize * 0.22));
  const textPadding = Math.round(fontSize * 0.3);
  const hasText = Boolean(showText && customText.trim().length > 0);
  const totalHeight = hasText ? logoH + textPadding + fontSize : logoH;

  const coords = calculateWatermarkCoordinates(
    canvasWidth,
    canvasHeight,
    logoW,
    totalHeight,
    positionPreset,
    customX,
    customY,
    Math.round(minDim * 0.04)
  );

  const dx = clickCanvasX - coords.x;
  const dy = clickCanvasY - coords.y;

  const rad = (-rotation * Math.PI) / 180;
  const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const minScreenTouchPaddingPx = 50;
  const touchPaddingCanvasPx =
    (minScreenTouchPaddingPx / Math.max(1, screenCanvasWidth)) * canvasWidth;

  const finalTouchPadding = Math.max(touchPaddingCanvasPx, logoW * 0.35, minDim * 0.08);

  return (
    Math.abs(localX) <= logoW / 2 + finalTouchPadding &&
    Math.abs(localY) <= totalHeight / 2 + finalTouchPadding
  );
}

/**
 * Gets current relative center coordinates (0.0 ~ 1.0) of the watermark.
 */
export function getWatermarkCenterRelative(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions
): { relX: number; relY: number } {
  const {
    scale = 0.12,
    positionPreset = 'bottom-right',
    customX = 0.85,
    customY = 0.85,
    customText = '',
    showText = false,
  } = options;

  const minDim = Math.min(canvasWidth, canvasHeight);
  const logoAspect = logoImg ? logoImg.width / logoImg.height || 1 : 1;
  const logoBaseSize = minDim * Math.max(0.05, Math.min(0.6, scale));

  let logoW = logoBaseSize;
  let logoH = logoBaseSize / logoAspect;
  if (logoAspect < 1) {
    logoH = logoBaseSize;
    logoW = logoBaseSize * logoAspect;
  }

  const fontSize = Math.max(12, Math.round(logoBaseSize * 0.22));
  const textPadding = Math.round(fontSize * 0.3);
  const hasText = Boolean(showText && customText.trim().length > 0);
  const totalHeight = hasText ? logoH + textPadding + fontSize : logoH;

  const coords = calculateWatermarkCoordinates(
    canvasWidth,
    canvasHeight,
    logoW,
    totalHeight,
    positionPreset,
    customX,
    customY,
    Math.round(minDim * 0.04)
  );

  return {
    relX: coords.x / Math.max(1, canvasWidth),
    relY: coords.y / Math.max(1, canvasHeight),
  };
}

/**
 * Checks if a point hits one of the 4 directional arrow handles (▲ ◀ ▼ ▶).
 */
export function getWatermarkDirectionArrowHit(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions,
  clickCanvasX: number,
  clickCanvasY: number,
  screenCanvasWidth: number = 400
): 'up' | 'down' | 'left' | 'right' | null {
  if (!logoImg) return null;

  const {
    scale = 0.12,
    rotation = 0,
    positionPreset = 'bottom-right',
    customX = 0.85,
    customY = 0.85,
    customText = '',
    showText = false,
  } = options;

  const minDim = Math.min(canvasWidth, canvasHeight);
  const logoAspect = logoImg ? logoImg.width / logoImg.height || 1 : 1;
  const logoBaseSize = minDim * Math.max(0.05, Math.min(0.6, scale));

  let logoW = logoBaseSize;
  let logoH = logoBaseSize / logoAspect;
  if (logoAspect < 1) {
    logoH = logoBaseSize;
    logoW = logoBaseSize * logoAspect;
  }

  const fontSize = Math.max(12, Math.round(logoBaseSize * 0.22));
  const textPadding = Math.round(fontSize * 0.3);
  const hasText = Boolean(showText && customText.trim().length > 0);
  const totalHeight = hasText ? logoH + textPadding + fontSize : logoH;

  const coords = calculateWatermarkCoordinates(
    canvasWidth,
    canvasHeight,
    logoW,
    totalHeight,
    positionPreset,
    customX,
    customY,
    Math.round(minDim * 0.04)
  );

  const boxPadding = Math.max(8, Math.round(minDim * 0.015));
  const boxW = logoW + boxPadding * 2;
  const boxH = totalHeight + boxPadding * 2;

  const arrowRadius = Math.max(17, Math.round(minDim * 0.031));
  const arrowOffset = Math.max(24, arrowRadius * 1.3);

  const dx = clickCanvasX - coords.x;
  const dy = clickCanvasY - coords.y;

  const rad = (-rotation * Math.PI) / 180;
  const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const minScreenTouchPaddingPx = 40;
  const hitRadius = Math.max(
    arrowRadius * 1.8,
    (minScreenTouchPaddingPx / Math.max(1, screenCanvasWidth)) * canvasWidth
  );

  const arrowHandles = [
    { type: 'up' as const, x: 0, y: -boxH / 2 - arrowOffset },
    { type: 'down' as const, x: 0, y: boxH / 2 + arrowOffset },
    { type: 'left' as const, x: -boxW / 2 - arrowOffset, y: 0 },
    { type: 'right' as const, x: boxW / 2 + arrowOffset, y: 0 },
  ];

  for (const h of arrowHandles) {
    const dist = Math.hypot(localX - h.x, localY - h.y);
    if (dist <= hitRadius) {
      return h.type;
    }
  }

  return null;
}

// ----------------------------------------------------------------------
// Canvas Drawing & Selection Outline
// ----------------------------------------------------------------------

/**
 * Draws the base image, logo watermark, annotations, and custom text onto a canvas context.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  mainImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions
): void {
  const {
    opacity = 0.4,
    scale = 0.12,
    rotation = 0,
    positionPreset = 'bottom-right',
    customX = 0.85,
    customY = 0.85,
    customText = '',
    showText = false,
    textColor = '#ffffff',
    showLogoCircle = false,
    showLogoArrow = false,
    showLogoSquare = false,
    logoAnnotationColor = '#EF4444',
    logoAnnotationLineWidth = 1.0,
    logoAnnotationOpacity = 1.0,
    logoAnnotationSize = 1.0,
  } = options;

  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  // 1. Clear background & Draw Base Image
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(mainImg, 0, 0, width, height);

  if (!logoImg) return;

  // 2. Calculate Logo Dimensions based on image scale
  const minDim = Math.min(width, height);
  const logoAspect = logoImg.width / logoImg.height || 1;
  const logoBaseSize = minDim * Math.max(0.05, Math.min(0.6, scale));

  let logoW = logoBaseSize;
  let logoH = logoBaseSize / logoAspect;
  if (logoAspect < 1) {
    logoH = logoBaseSize;
    logoW = logoBaseSize * logoAspect;
  }

  // 3. Calculate text offset if text is enabled
  const fontSize = Math.max(12, Math.round(logoBaseSize * 0.22));
  const textPadding = Math.round(fontSize * 0.3);
  const hasText = Boolean(showText && customText.trim().length > 0);
  const totalHeight = hasText ? logoH + textPadding + fontSize : logoH;

  // 4. Determine Center Position
  const coords = calculateWatermarkCoordinates(
    width,
    height,
    logoW,
    totalHeight,
    positionPreset,
    customX,
    customY,
    Math.round(minDim * 0.04)
  );

  // 5. Draw Watermark Layer (Logo + Text) with Opacity & Rotation
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.translate(coords.x, coords.y);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Draw Logo Image (centered at top of total block)
  const logoYOffset = hasText ? -totalHeight / 2 + logoH / 2 : 0;
  ctx.drawImage(logoImg, -logoW / 2, logoYOffset - logoH / 2, logoW, logoH);

  // Draw Hand-Drawn Logo Annotations (Circle, Arrow, Square)
  if (showLogoCircle) {
    drawHandDrawnCircle(
      ctx,
      logoW,
      logoH,
      logoYOffset,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationSize,
      logoAnnotationOpacity
    );
  }
  if (showLogoArrow) {
    drawHandDrawnArrow(
      ctx,
      logoW,
      logoH,
      logoYOffset,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationSize,
      logoAnnotationOpacity
    );
  }
  if (showLogoSquare) {
    drawHandDrawnSquare(
      ctx,
      logoW,
      logoH,
      logoYOffset,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationSize,
      logoAnnotationOpacity
    );
  }

  // Draw Subtext (centered below logo)
  if (hasText) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = logoYOffset + logoH / 2 + textPadding + fontSize / 2;

    // Soft dark outline behind text for visibility over light backgrounds
    ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.16));
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeText(customText.trim(), 0, textY);

    // Main Text Fill
    ctx.fillStyle = textColor;
    ctx.fillText(customText.trim(), 0, textY);
  }

  ctx.restore();
}

/**
 * Draws a temporary selection box outline around the watermark on the canvas.
 */
export function drawWatermarkSelectionOutline(
  ctx: CanvasRenderingContext2D,
  mainImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions,
  showDirectionArrows: boolean = true
): void {
  if (!logoImg) return;

  const {
    scale = 0.12,
    rotation = 0,
    positionPreset = 'bottom-right',
    customX = 0.85,
    customY = 0.85,
    customText = '',
    showText = false,
  } = options;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const minDim = Math.min(width, height);
  const logoAspect = logoImg.width / logoImg.height || 1;
  const logoBaseSize = minDim * Math.max(0.05, Math.min(0.6, scale));

  let logoW = logoBaseSize;
  let logoH = logoBaseSize / logoAspect;
  if (logoAspect < 1) {
    logoH = logoBaseSize;
    logoW = logoBaseSize * logoAspect;
  }

  const fontSize = Math.max(12, Math.round(logoBaseSize * 0.22));
  const textPadding = Math.round(fontSize * 0.3);
  const hasText = Boolean(showText && customText.trim().length > 0);
  const totalHeight = hasText ? logoH + textPadding + fontSize : logoH;

  const coords = calculateWatermarkCoordinates(
    width,
    height,
    logoW,
    totalHeight,
    positionPreset,
    customX,
    customY,
    Math.round(minDim * 0.04)
  );

  const boxPadding = Math.max(8, Math.round(minDim * 0.015));
  const boxW = logoW + boxPadding * 2;
  const boxH = totalHeight + boxPadding * 2;

  ctx.save();
  ctx.translate(coords.x, coords.y);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Semi-transparent selection background
  ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, Math.max(4, boxPadding / 2));
  } else {
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
  }
  ctx.fill();

  // Outer dashed selection stroke
  ctx.lineWidth = Math.max(2, Math.round(minDim * 0.005));
  ctx.strokeStyle = '#3B82F6';
  ctx.setLineDash([Math.max(6, minDim * 0.01), Math.max(4, minDim * 0.007)]);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, Math.max(4, boxPadding / 2));
  } else {
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
  }
  ctx.stroke();

  // Corner control points
  ctx.setLineDash([]);
  const handleRadius = Math.max(6, Math.round(minDim * 0.012));
  const corners = [
    { x: -boxW / 2, y: -boxH / 2 },
    { x: boxW / 2, y: -boxH / 2 },
    { x: -boxW / 2, y: boxH / 2 },
    { x: boxW / 2, y: boxH / 2 },
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = Math.max(2, Math.round(minDim * 0.004));

  corners.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, handleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // 4 Directional Arrow Handles (▲ ◀ ▼ ▶) on 4 sides
  if (showDirectionArrows) {
    const arrowRadius = Math.max(17, Math.round(minDim * 0.031));
    const arrowOffset = Math.max(24, arrowRadius * 1.3);

    const arrowHandles = [
      { type: 'up', symbol: '▲', x: 0, y: -boxH / 2 - arrowOffset },
      { type: 'down', symbol: '▼', x: 0, y: boxH / 2 + arrowOffset },
      { type: 'left', symbol: '◀', x: -boxW / 2 - arrowOffset, y: 0 },
      { type: 'right', symbol: '▶', x: boxW / 2 + arrowOffset, y: 0 },
    ];

    arrowHandles.forEach((h) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(h.x, h.y, arrowRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6';
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(2, Math.round(minDim * 0.005));
      ctx.stroke();

      ctx.font = `bold ${Math.round(arrowRadius * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(h.symbol, h.x, h.y + (h.type === 'up' ? -1 : h.type === 'down' ? 1 : 0));
      ctx.restore();
    });
  }

  ctx.restore();
}

/**
 * Exports clean watermarked image at full original resolution using an offscreen canvas.
 */
export function exportWatermarkDataUrl(
  mainImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  options: WatermarkRenderOptions
): string {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = mainImg.naturalWidth || mainImg.width || 800;
  exportCanvas.height = mainImg.naturalHeight || mainImg.height || 600;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return '';
  drawWatermark(ctx, mainImg, logoImg, options);
  return exportCanvas.toDataURL('image/png');
}
