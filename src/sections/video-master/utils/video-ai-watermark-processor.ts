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
  category?: 'ai_video' | 'ai_model' | 'custom';
}

export interface VideoAiWatermarkRenderOptions {
  opacity: number; // 0.05 ~ 1.0
  scale: number; // 0.05 ~ 0.6 (relative to video dimension)
  rotation: number; // 0 ~ 360
  positionPreset: PositionPreset;
  customX?: number; // 0.0 ~ 1.0
  customY?: number; // 0.0 ~ 1.0
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

export interface VideoExportSettings {
  startTime: number;
  endTime: number;
  resolution: 'original' | '1080p' | '720p' | '480p';
  quality: 'high' | 'medium' | 'standard';
  muteAudio: boolean;
}

export interface SampleVideoItem {
  id: string;
  label: string;
  subLabel: string;
  duration: number;
  aspectRatio: string;
}

// ----------------------------------------------------------------------
// Preset AI Logos
// ----------------------------------------------------------------------

export const PRESET_AI_VIDEO_LOGOS: WatermarkLogo[] = [
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
];

// ----------------------------------------------------------------------
// Custom Logo Store
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

export function getAllVideoLogos(): WatermarkLogo[] {
  return [...customLogosStore, ...PRESET_AI_VIDEO_LOGOS];
}

export function findVideoLogoById(id: string): WatermarkLogo {
  const all = getAllVideoLogos();
  const found = all.find((item) => item.id === id);
  return found || PRESET_AI_VIDEO_LOGOS[0];
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

export function drawHandDrawnCircle(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color = '#EF4444',
  widthMultiplier = 1.0,
  sizeMultiplier = 1.0,
  annotationOpacity = 1.0
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
  ctx.moveTo(rx * 0.35, -ry * 0.92);
  ctx.bezierCurveTo(-rx * 0.6, -ry * 1.15, -rx * 1.12, -ry * 0.5, -rx * 1.08, ry * 0.1);
  ctx.bezierCurveTo(-rx * 1.05, ry * 1.12, rx * 0.4, ry * 1.18, rx * 1.08, ry * 0.5);
  ctx.bezierCurveTo(rx * 1.15, -ry * 0.4, rx * 0.7, -ry * 1.08, -rx * 0.05, -ry * 0.98);
  ctx.bezierCurveTo(-rx * 0.5, -ry * 0.92, -rx * 0.85, -rx * 0.5, -rx * 0.75, -ry * 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = lineWidth * 0.45;
  ctx.globalAlpha = Math.max(0.05, Math.min(1, annotationOpacity)) * 0.65;
  ctx.moveTo(rx * 0.32, -ry * 0.95);
  ctx.bezierCurveTo(-rx * 0.58, -ry * 1.18, -rx * 1.1, -ry * 0.52, -rx * 1.06, ry * 0.08);
  ctx.stroke();

  ctx.restore();
}

export function drawHandDrawnArrow(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color = '#EF4444',
  widthMultiplier = 1.0,
  sizeMultiplier = 1.0,
  annotationOpacity = 1.0
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

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, shaftEndX, shaftEndY);
  ctx.stroke();

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

  ctx.beginPath();
  ctx.moveTo(b1x, b1y);
  ctx.quadraticCurveTo(b1cx, b1cy, endX, endY);
  ctx.quadraticCurveTo(b2cx, b2cy, b2x, b2y);
  ctx.stroke();

  ctx.restore();
}

export function drawHandDrawnSquare(
  ctx: CanvasRenderingContext2D,
  logoW: number,
  logoH: number,
  logoYOffset: number,
  color = '#EF4444',
  widthMultiplier = 1.0,
  sizeMultiplier = 1.0,
  annotationOpacity = 1.0
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
  customX = 0.85,
  customY = 0.85,
  padding = 24
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

export function isPointInWatermark(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: VideoAiWatermarkRenderOptions,
  clickCanvasX: number,
  clickCanvasY: number,
  screenCanvasWidth = 400
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

export function getWatermarkCenterRelative(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: VideoAiWatermarkRenderOptions
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

export function getWatermarkDirectionArrowHit(
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement | null,
  options: VideoAiWatermarkRenderOptions,
  clickCanvasX: number,
  clickCanvasY: number,
  screenCanvasWidth = 400
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
// Real-time Canvas Rendering
// ----------------------------------------------------------------------

export function drawVideoAiWatermark(
  ctx: CanvasRenderingContext2D,
  videoSource: HTMLVideoElement | CanvasImageSource,
  logoImg: HTMLImageElement | null,
  options: VideoAiWatermarkRenderOptions,
  showSelection = false,
  showDirectionArrows = false
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

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // 1. Draw Video Frame
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(videoSource, 0, 0, width, height);

  if (!logoImg) return;

  // 2. Dimensions
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

  // 3. Draw Watermark Content Layer
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.translate(coords.x, coords.y);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  const logoYOffset = hasText ? -totalHeight / 2 + logoH / 2 : 0;
  ctx.drawImage(logoImg, -logoW / 2, logoYOffset - logoH / 2, logoW, logoH);

  // Hand-Drawn Annotations
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

  // Subtext
  if (hasText) {
    ctx.font = `bold ${fontSize}px Pretendard, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = logoYOffset + logoH / 2 + textPadding + fontSize / 2;

    ctx.lineWidth = Math.max(2.5, Math.round(fontSize * 0.16));
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeText(customText.trim(), 0, textY);

    ctx.fillStyle = textColor;
    ctx.fillText(customText.trim(), 0, textY);
  }

  ctx.restore();

  // 4. Selection Outline & Direction Arrows
  if (showSelection) {
    ctx.save();
    ctx.translate(coords.x, coords.y);
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    const boxPadding = Math.max(8, Math.round(minDim * 0.015));
    const boxW = logoW + boxPadding * 2;
    const boxH = totalHeight + boxPadding * 2;

    // Glowing Dash Border
    ctx.strokeStyle = 'rgba(0, 167, 111, 0.9)';
    ctx.lineWidth = Math.max(2, Math.round(minDim * 0.0035));
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // Corner Grips
    const cornerSize = Math.max(6, Math.round(minDim * 0.012));
    ctx.fillStyle = '#00A76F';
    ctx.setLineDash([]);
    ctx.fillRect(-boxW / 2 - cornerSize / 2, -boxH / 2 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(boxW / 2 - cornerSize / 2, -boxH / 2 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(-boxW / 2 - cornerSize / 2, boxH / 2 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(boxW / 2 - cornerSize / 2, boxH / 2 - cornerSize / 2, cornerSize, cornerSize);

    // Direction Handle Arrows (▲ ◀ ▼ ▶)
    if (showDirectionArrows) {
      const arrowRadius = Math.max(16, Math.round(minDim * 0.03));
      const arrowOffset = Math.max(22, arrowRadius * 1.3);

      const handles = [
        { label: '▲', x: 0, y: -boxH / 2 - arrowOffset },
        { label: '▼', x: 0, y: boxH / 2 + arrowOffset },
        { label: '◀', x: -boxW / 2 - arrowOffset, y: 0 },
        { label: '▶', x: boxW / 2 + arrowOffset, y: 0 },
      ];

      for (const h of handles) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, arrowRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 28, 38, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#00A76F';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(arrowRadius * 1.05)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(h.label, h.x, h.y + 1);
      }
    }

    ctx.restore();
  }
}

// ----------------------------------------------------------------------
// In-Browser Video Exporting Engine (MediaRecorder + Web Audio API)
// ----------------------------------------------------------------------

export async function exportAiWatermarkedVideo(
  videoSourceUrl: string,
  logoImg: HTMLImageElement | null,
  options: VideoAiWatermarkRenderOptions,
  exportSettings: VideoExportSettings,
  onProgress?: (percent: number, elapsedSec: number) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSourceUrl;
    video.crossOrigin = 'anonymous';
    video.muted = exportSettings.muteAudio;
    video.playsInline = true;

    if (abortSignal?.aborted) {
      reject(new Error('인코딩이 취소되었습니다.'));
      return;
    }

    abortSignal?.addEventListener('abort', () => {
      video.pause();
      reject(new Error('인코딩이 사용자에 의해 중단되었습니다.'));
    });

    video.onloadedmetadata = async () => {
      const srcW = video.videoWidth || 1280;
      const srcH = video.videoHeight || 720;
      const aspect = srcW / srcH;

      let targetW = srcW;
      let targetH = srcH;

      if (exportSettings.resolution === '1080p') {
        if (aspect >= 1) {
          targetW = 1920;
          targetH = Math.round(1920 / aspect);
        } else {
          targetH = 1920;
          targetW = Math.round(1920 * aspect);
        }
      } else if (exportSettings.resolution === '720p') {
        if (aspect >= 1) {
          targetW = 1280;
          targetH = Math.round(1280 / aspect);
        } else {
          targetH = 1280;
          targetW = Math.round(1280 * aspect);
        }
      } else if (exportSettings.resolution === '480p') {
        if (aspect >= 1) {
          targetW = 854;
          targetH = Math.round(854 / aspect);
        } else {
          targetH = 854;
          targetW = Math.round(854 * aspect);
        }
      }

      // Ensure even dimensions
      targetW = targetW % 2 === 0 ? targetW : targetW - 1;
      targetH = targetH % 2 === 0 ? targetH : targetH - 1;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('캔버스 초기화 실패'));
        return;
      }

      const stream = canvas.captureStream(30);

      // Web Audio setup to retain original audio
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      if (!exportSettings.muteAudio) {
        try {
          const sourceNode = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          sourceNode.connect(dest);
          sourceNode.connect(audioCtx.destination);
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        } catch {
          // audio routing fallback
        }
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      let bps = 5000000;
      if (exportSettings.quality === 'high') bps = 8000000;
      if (exportSettings.quality === 'standard') bps = 2500000;

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: bps,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioCtx.close();
        const outputBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(outputBlob);
      };

      const startT = Math.max(0, exportSettings.startTime);
      const endT = Math.min(video.duration || 10000, exportSettings.endTime || video.duration);
      const totalDuration = Math.max(0.1, endT - startT);

      video.currentTime = startT;

      video.onseeked = () => {
        mediaRecorder.start(100);
        video.play();

        const renderLoop = () => {
          if (abortSignal?.aborted) {
            mediaRecorder.stop();
            video.pause();
            return;
          }

          if (video.currentTime >= endT || video.ended || video.paused) {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              video.pause();
            }
            return;
          }

          drawVideoAiWatermark(ctx, video, logoImg, options, false, false);

          const currentElapsed = Math.max(0, video.currentTime - startT);
          const progress = Math.min(100, Math.round((currentElapsed / totalDuration) * 100));
          if (onProgress) {
            onProgress(progress, currentElapsed);
          }

          requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
      };
    };

    video.onerror = () => {
      reject(new Error('동영상 데이터를 로드할 수 없습니다.'));
    };
  });
}

// ----------------------------------------------------------------------
// Test Sample Video Generator (In-Memory Canvas Animation)
// ----------------------------------------------------------------------

export async function createAiWatermarkSampleVideo(durationSeconds = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'ai_generated_sample_video.webm', { type: 'video/webm' });
      resolve(file);
    };

    mediaRecorder.start();
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const progress = elapsed / totalMs;
      const t = elapsed / 1000;

      // 1. Futuristic Cyberpunk Gradient Backdrop
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#121e36');
      grad.addColorStop(1, '#081426');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Animated Grid Floor
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 167, 111, 0.2)';
      ctx.lineWidth = 1;
      const gridOffset = (t * 60) % 50;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = gridOffset; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Glowing Floating Orb
      const orbX = canvas.width / 2 + Math.sin(t * 2) * 220;
      const orbY = canvas.height / 2 + Math.cos(t * 3) * 90;
      const orbRadius = 75 + Math.sin(t * 4) * 15;

      const radialGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, orbRadius * 2);
      radialGrad.addColorStop(0, 'rgba(0, 230, 153, 0.9)');
      radialGrad.addColorStop(0.4, 'rgba(0, 167, 111, 0.5)');
      radialGrad.addColorStop(1, 'rgba(0, 167, 111, 0)');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Center Typography Banner
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 36px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI Video Studio & Watermark Lab', canvas.width / 2, 140);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 20px Pretendard, sans-serif';
      ctx.fillText('Dynamic Test Stream • 60 FPS Canvas Synth', canvas.width / 2, 180);

      // 5. Timer & Progress Bar
      ctx.fillStyle = '#00A76F';
      ctx.font = '700 24px monospace';
      ctx.fillText(
        `TIME: ${t.toFixed(2)}s / ${(totalMs / 1000).toFixed(1)}s`,
        canvas.width / 2,
        570
      );

      // Progress bar track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(canvas.width / 2 - 250, 600, 500, 12);
      // Progress bar fill
      ctx.fillStyle = '#00A76F';
      ctx.fillRect(canvas.width / 2 - 250, 600, 500 * progress, 12);
    }, 1000 / 30);
  });
}
