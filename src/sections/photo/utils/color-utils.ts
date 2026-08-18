export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HslColor {
  h: number; // 0..360
  s: number; // 0..100 (%)
  l: number; // 0..100 (%)
  a?: number;
}

export interface HsvColor {
  h: number; // 0..360
  s: number; // 0..100 (%)
  v: number; // 0..100 (%)
}

export interface CmykColor {
  c: number; // 0..100 (%)
  m: number; // 0..100 (%)
  y: number; // 0..100 (%)
  k: number; // 0..100 (%)
}

export interface FormattedColorData {
  hexUpper: string; // e.g. #C8C8C8
  hexLower: string; // e.g. #c8c8c8
  hexShort: string; // e.g. #c8c8c8
  rgbStr: string; // e.g. rgb(200, 200, 200)
  rgbaStr: string; // e.g. rgba(200, 200, 200, 1.00)
  hslStr: string; // e.g. hsl(0, 0%, 78%)
  hslaStr: string; // e.g. hsla(0, 0%, 78%, 1.00)
  hsvStr: string; // e.g. hsv(0, 0%, 78%)
  cmykStr: string; // e.g. cmyk(0%, 0%, 0%, 22%)
  nameEn: string; // e.g. LightGray
  nameKo: string; // e.g. 밝은 회색
  cssBg: string; // e.g. background-color: #c8c8c8;
  cssColor: string; // e.g. color: #c8c8c8;
  cssBorder: string; // e.g. border-color: #c8c8c8;
  decimal: number; // e.g. 13158600
  decimalStr: string; // e.g. 13,158,600 (0xC8C8C8)
  normalizedRgb: string; // e.g. (0.78, 0.78, 0.78)
  rgbObj: RgbColor;
  hslObj: HslColor;
  hsvObj: HsvColor;
  cmykObj: CmykColor;
}

// 1. HEX -> RGB
export function hexToRgb(hexInput: string): RgbColor {
  let hex = hexInput.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length < 6) {
    hex = hex.padEnd(6, '0');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  let a = 1;
  if (hex.length >= 8) {
    a = Number((parseInt(hex.substring(6, 8), 16) / 255).toFixed(2));
  }
  return { r, g, b, a };
}

// 2. RGB -> HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 3. RGB -> HSL
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / delta + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// 4. HSL -> RGB
export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

// 5. RGB -> HSV
export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / delta + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// 6. HSV -> RGB
export function hsvToRgb(h: number, s: number, v: number): RgbColor {
  const hNorm = (h % 360) / 60;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;

  const i = Math.floor(hNorm);
  const f = hNorm - i;
  const p = vNorm * (1 - sNorm);
  const q = vNorm * (1 - sNorm * f);
  const t = vNorm * (1 - sNorm * (1 - f));

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = vNorm;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = vNorm;
      b = p;
      break;
    case 2:
      r = p;
      g = vNorm;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = vNorm;
      break;
    case 4:
      r = t;
      g = p;
      b = vNorm;
      break;
    case 5:
      r = vNorm;
      g = p;
      b = q;
      break;
    default:
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// 7. RGB -> CMYK
export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Named Colors Database
const NAMED_COLORS: Array<{
  en: string;
  ko: string;
  r: number;
  g: number;
  b: number;
}> = [
  { en: 'Black', ko: '검정', r: 0, g: 0, b: 0 },
  { en: 'White', ko: '흰색', r: 255, g: 255, b: 255 },
  { en: 'Red', ko: '빨강', r: 255, g: 0, b: 0 },
  { en: 'Lime', ko: '라임', r: 0, g: 255, b: 0 },
  { en: 'Blue', ko: '파랑', r: 0, g: 0, b: 255 },
  { en: 'Yellow', ko: '노랑', r: 255, g: 255, b: 0 },
  { en: 'Cyan', ko: '시안 (청록)', r: 0, g: 255, b: 255 },
  { en: 'Magenta', ko: '마젠타 (자홍)', r: 255, g: 0, b: 255 },
  { en: 'Silver', ko: '실버 (은색)', r: 192, g: 192, b: 192 },
  { en: 'Light Gray', ko: '밝은 회색', r: 200, g: 200, b: 200 },
  { en: 'Gray', ko: '회색', r: 128, g: 128, b: 128 },
  { en: 'Dark Gray', ko: '어두운 회색', r: 64, g: 64, b: 64 },
  { en: 'Maroon', ko: '마룬 (밤색)', r: 128, g: 0, b: 0 },
  { en: 'Olive', ko: '올리브', r: 128, g: 128, b: 0 },
  { en: 'Green', ko: '초록', r: 0, g: 128, b: 0 },
  { en: 'Purple', ko: '보라', r: 128, g: 0, b: 128 },
  { en: 'Teal', ko: '청록', r: 0, g: 128, b: 128 },
  { en: 'Navy', ko: '남색', r: 0, g: 0, b: 128 },
  { en: 'Orange', ko: '주황', r: 255, g: 165, b: 0 },
  { en: 'Pink', ko: '분홍', r: 255, g: 192, b: 203 },
  { en: 'Gold', ko: '금색', r: 255, g: 215, b: 0 },
  { en: 'Sky Blue', ko: '하늘색', r: 135, g: 206, b: 235 },
  { en: 'Deep Sky Blue', ko: '딥 스카이 블루', r: 0, g: 191, b: 255 },
  { en: 'Royal Blue', ko: '로얄 블루', r: 65, g: 105, b: 225 },
  { en: 'Coral', ko: '코랄 (산호색)', r: 255, g: 127, b: 80 },
  { en: 'Tomato', ko: '토마토', r: 255, g: 99, b: 71 },
  { en: 'Crimson', ko: '크림슨 (진홍)', r: 220, g: 20, b: 60 },
  { en: 'Hot Pink', ko: '핫핑크', r: 255, g: 105, b: 180 },
  { en: 'Deep Pink', ko: '딥핑크', r: 255, g: 20, b: 147 },
  { en: 'Violet', ko: '바이올렛', r: 238, g: 130, b: 238 },
  { en: 'Indigo', ko: '인디고', r: 75, g: 0, b: 130 },
  { en: 'Turquoise', ko: '터콰이즈 (민트)', r: 64, g: 224, b: 208 },
  { en: 'Medium Spring Green', ko: '에메랄드 그린', r: 0, g: 250, b: 154 },
  { en: 'Forest Green', ko: '숲색', r: 34, g: 139, b: 34 },
  { en: 'Khaki', ko: '카키', r: 240, g: 230, b: 140 },
  { en: 'Plum', ko: '플럼 (자두색)', r: 221, g: 160, b: 221 },
  { en: 'Orchid', ko: '난초색', r: 218, g: 112, b: 214 },
  { en: 'Ivory', ko: '아이보리 (상아색)', r: 255, g: 255, b: 240 },
  { en: 'Beige', ko: '베이지', r: 245, g: 245, b: 220 },
  { en: 'Chocolate', ko: '초콜릿', r: 210, g: 105, b: 30 },
  { en: 'Brown', ko: '갈색', r: 165, g: 42, b: 42 },
  { en: 'Slate Gray', ko: '슬레이트 회색', r: 112, g: 128, b: 144 },
];

export function getClosestColorName(r: number, g: number, b: number): { en: string; ko: string } {
  let minDistance = Infinity;
  let closest = NAMED_COLORS[0];

  for (let i = 0; i < NAMED_COLORS.length; i += 1) {
    const c = NAMED_COLORS[i];
    const dist = Math.sqrt((r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return { en: closest.en, ko: closest.ko };
}

// Master Formatting Function
export function formatAllColors(hexOrRgb: string | RgbColor): FormattedColorData {
  let rgb: RgbColor;
  if (typeof hexOrRgb === 'string') {
    rgb = hexToRgb(hexOrRgb);
  } else {
    rgb = hexOrRgb;
  }

  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  const a = rgb.a ?? 1;

  const hexLower = rgbToHex(r, g, b);
  const hexUpper = hexLower.toUpperCase();
  const hexShort = hexLower;

  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const name = getClosestColorName(r, g, b);

  const decimal = r * 65536 + g * 256 + b;
  const normalizedRgb = `(${(r / 255).toFixed(2)}, ${(g / 255).toFixed(2)}, ${(b / 255).toFixed(2)})`;

  return {
    hexUpper,
    hexLower,
    hexShort,
    rgbStr: `rgb(${r}, ${g}, ${b})`,
    rgbaStr: `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`,
    hslStr: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hslaStr: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a.toFixed(2)})`,
    hsvStr: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmykStr: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    nameEn: name.en,
    nameKo: name.ko,
    cssBg: `background-color: ${hexLower};`,
    cssColor: `color: ${hexLower};`,
    cssBorder: `border-color: ${hexLower};`,
    decimal,
    decimalStr: `${decimal.toLocaleString()} (0x${hexUpper.replace('#', '')})`,
    normalizedRgb,
    rgbObj: { r, g, b, a },
    hslObj: hsl,
    hsvObj: hsv,
    cmykObj: cmyk,
  };
}

// Generate High-Res PNG Color Card
export function generateColorCardPng(data: FormattedColorData): string {
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1200;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for color card generation');

  const isLightColor =
    (data.rgbObj.r * 299 + data.rgbObj.g * 587 + data.rgbObj.b * 114) / 1000 > 160;

  // Outer Canvas Background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, width, height);

  // Card Background with smooth rounded corners
  const cardMargin = 40;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - cardMargin * 2;
  const cardRadius = 36;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardMargin, cardMargin, cardWidth, cardHeight, cardRadius);
  ctx.fillStyle = '#1E293B';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();
  ctx.restore();

  // Header - App Title
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.fillText('ULTRA OFFICE · COLOR PALETTE CARD', width / 2, cardMargin + 65);

  // Big Color Swatch Box
  const swatchX = cardMargin + 40;
  const swatchY = cardMargin + 100;
  const swatchW = cardWidth - 80;
  const swatchH = 460;
  const swatchRadius = 28;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(swatchX, swatchY, swatchW, swatchH, swatchRadius);
  ctx.fillStyle = data.hexLower;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = isLightColor ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.3)';
  ctx.stroke();

  // Swatch Inner Badge
  const badgeW = 480;
  const badgeH = 96;
  const badgeX = (width - badgeW) / 2;
  const badgeY = swatchY + swatchH - badgeH - 24;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 20);
  ctx.fillStyle = isLightColor ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  ctx.font = 'bold 36px -apple-system, monospace';
  ctx.fillStyle = isLightColor ? '#FFFFFF' : '#0F172A';
  ctx.textAlign = 'center';
  ctx.fillText(data.hexUpper, width / 2, badgeY + 44);

  ctx.font = '600 20px -apple-system, sans-serif';
  ctx.fillStyle = isLightColor ? '#94A3B8' : '#475569';
  ctx.fillText(`${data.nameEn} (${data.nameKo})`, width / 2, badgeY + 74);
  ctx.restore();

  // Values Grid Section
  const startY = swatchY + swatchH + 50;
  const rowHeight = 72;
  const items = [
    { label: 'HEX Code', val: `${data.hexUpper} / ${data.hexLower}` },
    { label: 'RGB', val: data.rgbStr },
    { label: 'HSL', val: data.hslStr },
    { label: 'HSV', val: data.hsvStr },
    { label: 'CMYK', val: data.cmykStr },
    { label: 'Decimal', val: data.decimalStr },
  ];

  ctx.textAlign = 'left';
  items.forEach((item, idx) => {
    const y = startY + idx * rowHeight;
    const isEven = idx % 2 === 0;

    ctx.beginPath();
    ctx.roundRect(swatchX, y - 42, swatchW, 58, 16);
    ctx.fillStyle = isEven ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
    ctx.fill();

    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(item.label, swatchX + 24, y - 4);

    ctx.font = "600 24px 'Courier New', monospace, sans-serif";
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'right';
    ctx.fillText(item.val, swatchX + swatchW - 24, y - 4);
    ctx.textAlign = 'left';
  });

  // Footer branding
  ctx.font = '500 22px -apple-system, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.fillText('Made by Ultra Office', width / 2, height - cardMargin - 30);

  return canvas.toDataURL('image/png');
}
