'use client';

import type { CaptionElement, NewsCaptionConfig, FontFamilyChoice } from './news-caption-presets';

// ----------------------------------------------------------------------
// Types for Hit-Testing & Selection
// ----------------------------------------------------------------------

export interface ElementBounds {
  id: string;
  x: number; // canvas px minX
  y: number; // canvas px minY
  width: number;
  height: number;
  normX: number;
  normY: number;
  normWidth: number;
  normHeight: number;
}

// ----------------------------------------------------------------------
// Helper to get Canvas Font Stack
// ----------------------------------------------------------------------

export function getFontFamilyStack(fontChoice: FontFamilyChoice): string {
  switch (fontChoice) {
    case 'myeongjo':
      return '"Nanum Myeongjo", "Batang", "Gowun Batang", "Song Myung", "Noto Serif KR", serif';
    case 'retro':
      return '"Gowun Dodum", "Gulim", "Dotum", "Noto Sans KR", sans-serif';
    case 'impact':
      return '"Impact", "Arial Black", "Pretendard", "Noto Sans KR", sans-serif';
    case 'gothic':
    default:
      return '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  }
}

// ----------------------------------------------------------------------
// Text Outline & Fill Helper (Supports Multi-line & Crisp Stroke)
// ----------------------------------------------------------------------

export function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  strokeColor: string,
  outlineWidth: number,
  shadow = false
) {
  ctx.save();

  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = Math.max(2, outlineWidth);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(1, outlineWidth * 0.2);
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  const lines = text.split('\n');
  const fontMatch = ctx.font.match(/(\d+)px/);
  const fontSize = fontMatch ? parseInt(fontMatch[1], 10) : 32;
  const lineHeight = fontSize * 1.28;

  lines.forEach((line, idx) => {
    const lineY = y + idx * lineHeight;

    if (outlineWidth > 0) {
      ctx.lineWidth = outlineWidth * 2;
      ctx.strokeStyle = strokeColor;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(line, x, lineY);
    }

    ctx.fillStyle = fillColor;
    ctx.fillText(line, x, lineY);
  });

  ctx.restore();
}

// ----------------------------------------------------------------------
// Rounded Rectangle Helper
// ----------------------------------------------------------------------

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ----------------------------------------------------------------------
// Hit-Testing: Compute Bounding Boxes of Elements
// ----------------------------------------------------------------------

export function getElementBounds(
  width: number,
  height: number,
  config: NewsCaptionConfig
): Record<string, ElementBounds> {
  const bounds: Record<string, ElementBounds> = {};
  if (!config.elements || config.elements.length === 0 || typeof document === 'undefined') {
    return bounds;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return bounds;

  const scale = (width / 1200) * (config.fontSizeScale || 1.0);

  for (const el of config.elements) {
    if (!el.visible || !el.text) continue;

    const fontStack = getFontFamilyStack(el.fontFamily);
    const fontSize = Math.round(el.fontSize * scale);
    ctx.font = `${el.fontWeight} ${fontSize}px ${fontStack}`;

    const lines = el.text.split('\n');
    let maxLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const lineHeight = fontSize * 1.28;
    const actualTextHeight = (lines.length - 1) * lineHeight + fontSize * 1.15;
    const pad = Math.max(16 * scale, 12);

    const pxX = el.x * width;
    const pxY = el.y * height;

    let minX = pxX;
    if (el.align === 'center') {
      minX = pxX - maxLineWidth / 2;
    } else if (el.align === 'right') {
      minX = pxX - maxLineWidth;
    }

    // Y position of first line top (ascent ~ 0.88 * fontSize)
    const textTop = pxY - fontSize * 0.88;

    const bWidth = maxLineWidth + pad * 2;
    const bHeight = actualTextHeight + pad * 2;
    const boundMinX = Math.max(0, minX - pad);
    const boundMinY = Math.max(0, textTop - pad);

    bounds[el.id] = {
      id: el.id,
      x: boundMinX,
      y: boundMinY,
      width: bWidth,
      height: bHeight,
      normX: boundMinX / width,
      normY: boundMinY / height,
      normWidth: bWidth / width,
      normHeight: bHeight / height,
    };
  }

  return bounds;
}

// ----------------------------------------------------------------------
// Main News Caption Render Function
// ----------------------------------------------------------------------

export function renderNewsCaption(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  config: NewsCaptionConfig
): void {
  const width = image.naturalWidth || image.width || 1200;
  const height = image.naturalHeight || image.height || 800;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw base original image
  ctx.drawImage(image, 0, 0, width, height);

  // 2. Base scaling factor calibrated to 1200px width
  const scale = (width / 1200) * (config.fontSizeScale || 1.0);

  // 3. Cinema 16:9 Letterbox (상하 블랙 바)
  let letterboxH = 0;
  if (config.enableLetterbox) {
    letterboxH = height * (config.letterboxSize / 100);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, letterboxH);
    ctx.fillRect(0, height - letterboxH, width, letterboxH);
  }

  // 4. Vignette / Dark gradient overlay at bottom
  if (config.enableVignette) {
    const vignetteHeight = height * 0.35;
    const vignetteY = height - letterboxH - vignetteHeight;
    const grad = ctx.createLinearGradient(0, vignetteY, 0, height - letterboxH);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, vignetteY, width, vignetteHeight);
  }

  // 5. Draw News Background Banners (For styles with Lower-Third Graphics)
  drawStyleBackgroundBanners(ctx, width, height, letterboxH, scale, config);

  // 6. Draw Elements
  renderCaptionElements(ctx, width, height, scale, config);
}

// ----------------------------------------------------------------------
// Render Caption Elements
// ----------------------------------------------------------------------

function renderCaptionElements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  config: NewsCaptionConfig
) {
  if (!config.elements || config.elements.length === 0) return;

  for (const el of config.elements) {
    if (!el.visible || !el.text) continue;

    const fontStack = getFontFamilyStack(el.fontFamily);
    const fontSize = Math.round(el.fontSize * scale);
    ctx.font = `${el.fontWeight} ${fontSize}px ${fontStack}`;
    ctx.textAlign = el.align;
    ctx.textBaseline = 'alphabetic';

    const pxX = el.x * width;
    const pxY = el.y * height;

    // Crisp outline without muddy shadow blur (matching user reference photo)
    drawOutlinedText(
      ctx,
      el.text,
      pxX,
      pxY,
      el.textColor,
      el.outlineColor,
      el.outlineWidth * scale,
      false
    );
  }
}

// ----------------------------------------------------------------------
// Draw Lower-Third Graphic Banners for Broadcast News Styles
// ----------------------------------------------------------------------

function drawStyleBackgroundBanners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letterboxH: number,
  scale: number,
  config: NewsCaptionConfig
) {
  const headlineEl = config.elements?.find((e) => e.type === 'headline' && e.visible);
  const headlineY = headlineEl ? headlineEl.y * height : height * 0.92;

  switch (config.styleId) {
    case 'kbs-news': {
      const bannerH = Math.round(92 * scale);
      const bannerY = headlineY - bannerH + Math.round(20 * scale);

      const grad = ctx.createLinearGradient(0, bannerY, width, bannerY);
      grad.addColorStop(0, '#0a2342');
      grad.addColorStop(0.15, config.bannerColor || '#1e3a8a');
      grad.addColorStop(0.85, '#1e40af');
      grad.addColorStop(1, '#0f172a');

      ctx.fillStyle = grad;
      ctx.fillRect(0, bannerY, width, bannerH);

      // Red accent line
      ctx.fillStyle = config.accentColor || '#dc2626';
      ctx.fillRect(0, bannerY, width, Math.max(3, 4 * scale));
      break;
    }

    case 'mbc-news': {
      const bannerH = Math.round(85 * scale);
      const bannerY = headlineY - bannerH + Math.round(18 * scale);
      const startX = width * 0.05;
      const bannerW = width * 0.9;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, bannerY);
      ctx.lineTo(startX + bannerW, bannerY);
      ctx.lineTo(startX + bannerW - 20 * scale, bannerY + bannerH);
      ctx.lineTo(startX, bannerY + bannerH);
      ctx.closePath();

      const grad = ctx.createLinearGradient(startX, bannerY, startX + bannerW, bannerY);
      grad.addColorStop(0, config.bannerColor || '#0284c7');
      grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = grad;
      ctx.fill();

      // Cyan accent bar
      ctx.fillStyle = config.accentColor || '#06b6d4';
      ctx.fillRect(startX, bannerY, 8 * scale, bannerH);
      ctx.restore();
      break;
    }

    case 'sbs-news': {
      const bannerH = Math.round(90 * scale);
      const bannerY = headlineY - bannerH + Math.round(20 * scale);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, bannerY, width, bannerH);

      ctx.fillStyle = config.accentColor || '#38bdf8';
      ctx.fillRect(0, bannerY + bannerH - 4 * scale, width, 4 * scale);
      break;
    }

    case 'jtbc-news': {
      const cardW = width * 0.88;
      const cardH = Math.round(95 * scale);
      const cardX = (width - cardW) / 2;
      const cardY = headlineY - cardH + Math.round(18 * scale);

      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.94)';
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 8 * scale);
      ctx.fill();

      ctx.fillStyle = config.accentColor || '#14b8a6';
      ctx.beginPath();
      ctx.moveTo(cardX + 8 * scale, cardY);
      ctx.lineTo(cardX + cardW - 8 * scale, cardY);
      ctx.lineTo(cardX + cardW - 8 * scale, cardY + 4 * scale);
      ctx.lineTo(cardX + 8 * scale, cardY + 4 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'ytn-news': {
      const topH = Math.round(44 * scale);
      const botH = Math.round(52 * scale);
      const totalH = topH + botH;
      const startY = headlineY - totalH + Math.round(15 * scale);

      // Top Red bar
      ctx.fillStyle = config.bannerColor || '#dc2626';
      ctx.fillRect(0, startY, width, topH);

      // Bottom Charcoal bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, startY + topH, width, botH);

      ctx.fillStyle = config.accentColor || '#facc15';
      ctx.fillRect(0, startY + topH, width, 2 * scale);
      break;
    }

    case 'cnn-news': {
      const topH = Math.round(48 * scale);
      const botH = Math.round(56 * scale);
      const totalH = topH + botH;
      const startY = headlineY - totalH + Math.round(18 * scale);

      ctx.fillStyle = config.bannerColor || '#cc0000';
      ctx.fillRect(0, startY, width, topH);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, startY + topH, width, botH);

      ctx.fillStyle = config.accentColor || '#eab308';
      ctx.fillRect(0, startY + topH, width, 4 * scale);
      break;
    }

    case 'investigative': {
      const bannerH = Math.round(100 * scale);
      const bannerY = headlineY - bannerH + Math.round(18 * scale);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, bannerY, width, bannerH);
      break;
    }

    case 'human-theater':
    case 'variety-meme':
    default:
      // No solid lower-third banner; text floats over the video/vignette
      break;
  }
}
