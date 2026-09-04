/**
 * SVG Processor Utility
 * 클라이언트 사이드 이미지-SVG 벡터화 및 SVG-래스터 렌더링 엔진
 */

export type SvgConversionMode = 'color' | 'bw' | 'pixel' | 'embed';

export interface ImageToSvgOptions {
  mode: SvgConversionMode;
  colorCount: number; // 2 ~ 32 (컬러 모드용)
  threshold: number; // 0 ~ 255 (흑백 모드용)
  pixelSize: number; // 2 ~ 24 (픽셀 모드용)
  invert: boolean; // 흑백 반전
  removeWhiteBg: boolean; // 흰색/투명 배경 제거
}

export interface SvgRasterizeOptions {
  scale: number; // 1, 2, 4, 8
  format: 'png' | 'jpeg' | 'webp';
  backgroundColor: string; // 'transparent', '#ffffff', '#000000', custom hex
  quality: number; // 0.1 ~ 1.0
  targetWidth?: number;
  targetHeight?: number;
}

export interface SvgValidationResult {
  isValid: boolean;
  error?: string;
  width: number;
  height: number;
  hasViewBox: boolean;
}

export interface SvgSamplePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  svgCode: string;
}

// ----------------------------------------------------------------------
// 1. 이미지 ➜ SVG 벡터화 엔진
// ----------------------------------------------------------------------

/**
 * HTMLImageElement로부터 Canvas ImageData를 추출하여 SVG XML 문자열로 변환합니다.
 */
export async function convertImageToSvg(
  img: HTMLImageElement,
  options: ImageToSvgOptions
): Promise<string> {
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  if (!origWidth || !origHeight) {
    throw new Error('유효하지 않은 이미지 크기입니다.');
  }

  // 1) 무손실 임베드 모드 (Lossless Embedded SVG Wrapper)
  if (options.mode === 'embed') {
    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('캔버스 2D 컨텍스트를 생성할 수 없습니다.');

    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${origWidth} ${origHeight}" width="${origWidth}" height="${origHeight}">
  <image href="${dataUrl}" width="${origWidth}" height="${origHeight}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
  }

  // 2) 픽셀 아트 SVG 모드 (Pixel Grid Vector with Run-Length Compression)
  if (options.mode === 'pixel') {
    const pSize = Math.max(2, Math.min(32, Math.round(options.pixelSize)));
    const gridCols = Math.ceil(origWidth / pSize);
    const gridRows = Math.ceil(origHeight / pSize);

    const canvas = document.createElement('canvas');
    canvas.width = gridCols;
    canvas.height = gridRows;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('캔버스 컨텍스트 에러');

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, gridCols, gridRows);

    const imgData = ctx.getImageData(0, 0, gridCols, gridRows);
    const data = imgData.data;

    let rectsSvg = '';

    for (let y = 0; y < gridRows; y += 1) {
      let runStart = -1;
      let runColor = '';

      for (let x = 0; x < gridCols; x += 1) {
        const idx = (y * gridCols + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isTransparent = a < 16;
        const isWhite = options.removeWhiteBg && r > 240 && g > 240 && b > 240;

        if (isTransparent || isWhite) {
          if (runStart !== -1) {
            const runLength = x - runStart;
            rectsSvg += `  <rect x="${runStart * pSize}" y="${y * pSize}" width="${runLength * pSize}" height="${pSize}" fill="${runColor}"/>\n`;
            runStart = -1;
          }
          continue;
        }

        const hexColor = rgbToHex(r, g, b);

        if (runStart === -1) {
          runStart = x;
          runColor = hexColor;
        } else if (runColor !== hexColor) {
          const runLength = x - runStart;
          rectsSvg += `  <rect x="${runStart * pSize}" y="${y * pSize}" width="${runLength * pSize}" height="${pSize}" fill="${runColor}"/>\n`;
          runStart = x;
          runColor = hexColor;
        }
      }

      if (runStart !== -1) {
        const runLength = gridCols - runStart;
        rectsSvg += `  <rect x="${runStart * pSize}" y="${y * pSize}" width="${runLength * pSize}" height="${pSize}" fill="${runColor}"/>\n`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridCols * pSize} ${gridRows * pSize}" width="${gridCols * pSize}" height="${gridRows * pSize}" shape-rendering="crispEdges">
${rectsSvg}</svg>`;
  }

  // 3) 흑백 / 실루엣 트레이스 모드 (B&W Silhouette Vector)
  if (options.mode === 'bw') {
    const maxDimension = 640;
    let targetW = origWidth;
    let targetH = origHeight;
    if (targetW > maxDimension || targetH > maxDimension) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDimension) / targetW);
        targetW = maxDimension;
      } else {
        targetW = Math.round((targetW * maxDimension) / targetH);
        targetH = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('캔버스 컨텍스트 에러');

    ctx.drawImage(img, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;

    const threshold = options.threshold ?? 128;
    const invert = options.invert ?? false;

    let pathData = '';

    for (let y = 0; y < targetH; y += 1) {
      let inRun = false;
      let startX = 0;

      for (let x = 0; x < targetW; x += 1) {
        const idx = (y * targetW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 64) {
          if (inRun) {
            pathData += `M${startX} ${y}h${x - startX}v1h${-(x - startX)}z `;
            inRun = false;
          }
          continue;
        }

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        let isForeground = gray < threshold;
        if (invert) isForeground = !isForeground;

        if (isForeground) {
          if (!inRun) {
            inRun = true;
            startX = x;
          }
        } else if (inRun) {
          pathData += `M${startX} ${y}h${x - startX}v1h${-(x - startX)}z `;
          inRun = false;
        }
      }

      if (inRun) {
        pathData += `M${startX} ${y}h${targetW - startX}v1h${-(targetW - startX)}z `;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetW} ${targetH}" width="${targetW}" height="${targetH}">
  <path d="${pathData.trim()}" fill="#111827" fill-rule="evenodd"/>
</svg>`;
  }

  // 4) 멀티컬러 포스터라이제이션 벡터 모드 (Layered Color Vector)
  const maxDimension = 480;
  let targetW = origWidth;
  let targetH = origHeight;
  if (targetW > maxDimension || targetH > maxDimension) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDimension) / targetW);
      targetW = maxDimension;
    } else {
      targetW = Math.round((targetW * maxDimension) / targetH);
      targetH = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('캔버스 컨텍스트 에러');

  ctx.drawImage(img, 0, 0, targetW, targetH);
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  const numColors = Math.max(2, Math.min(32, options.colorCount || 8));
  const palette = extractColorPalette(data, numColors);

  const colorPaths: Map<string, string> = new Map();
  palette.forEach((color) => {
    colorPaths.set(color, '');
  });

  for (let y = 0; y < targetH; y += 1) {
    let prevColor: string | null = null;
    let startX = 0;

    for (let x = 0; x < targetW; x += 1) {
      const idx = (y * targetW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 32 || (options.removeWhiteBg && r > 245 && g > 245 && b > 245)) {
        if (prevColor !== null) {
          const currentPath = colorPaths.get(prevColor) || '';
          colorPaths.set(
            prevColor,
            currentPath + `M${startX} ${y}h${x - startX}v1h${-(x - startX)}z `
          );
          prevColor = null;
        }
        continue;
      }

      const matchedColor = findNearestColor(r, g, b, palette);

      if (prevColor === null) {
        prevColor = matchedColor;
        startX = x;
      } else if (prevColor !== matchedColor) {
        const currentPath = colorPaths.get(prevColor) || '';
        colorPaths.set(
          prevColor,
          currentPath + `M${startX} ${y}h${x - startX}v1h${-(x - startX)}z `
        );
        prevColor = matchedColor;
        startX = x;
      }
    }

    if (prevColor !== null) {
      const currentPath = colorPaths.get(prevColor) || '';
      colorPaths.set(
        prevColor,
        currentPath + `M${startX} ${y}h${targetW - startX}v1h${-(targetW - startX)}z `
      );
    }
  }

  let layersSvg = '';
  colorPaths.forEach((path, hex) => {
    if (path.trim()) {
      layersSvg += `  <path fill="${hex}" d="${path.trim()}"/>\n`;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetW} ${targetH}" width="${targetW}" height="${targetH}">
${layersSvg}</svg>`;
}

// ----------------------------------------------------------------------
// 2. SVG ➜ 래스터 이미지 렌더링 엔진
// ----------------------------------------------------------------------

/**
 * SVG 소스 코드를 읽어 고해상도 Canvas를 거쳐 래스터 이미지(PNG/JPG/WebP)로 렌더링합니다.
 */
export async function renderSvgToRasterImage(
  svgString: string,
  options: SvgRasterizeOptions
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  byteSize: number;
}> {
  const scale = options.scale || 1;
  const format = options.format || 'png';
  const bgColor = options.backgroundColor || 'transparent';
  const quality = options.quality ?? 0.95;

  const validation = validateSvg(svgString);
  if (!validation.isValid) {
    throw new Error(validation.error || '유효하지 않은 SVG 형식입니다.');
  }

  let baseWidth = options.targetWidth || validation.width;
  let baseHeight = options.targetHeight || validation.height;

  if (!baseWidth || !baseHeight) {
    baseWidth = 800;
    baseHeight = 600;
  }

  const finalWidth = Math.round(baseWidth * scale);
  const finalHeight = Math.round(baseHeight * scale);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('SVG 이미지를 로드하는 중 오류가 발생했습니다.'));
      image.src = blobUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('캔버스 2D 컨텍스트 생성 실패');

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, finalWidth, finalHeight);
    }

    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

    const mimeType =
      format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);
    const byteSize = calculateDataUrlByteSize(dataUrl);

    return {
      dataUrl,
      width: finalWidth,
      height: finalHeight,
      byteSize,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// ----------------------------------------------------------------------
// 3. SVG 유효성 검사 & 치수 파싱 헬퍼
// ----------------------------------------------------------------------

/**
 * 브라우저 DOMParser를 이용해 SVG 구문 검사 및 viewBox / width / height를 추출합니다.
 */
export function validateSvg(svgString: string): SvgValidationResult {
  if (!svgString || !svgString.trim()) {
    return {
      isValid: false,
      error: 'SVG 내용이 비어 있습니다.',
      width: 0,
      height: 0,
      hasViewBox: false,
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      return {
        isValid: false,
        error: parserError.textContent || 'XML 구문 오류가 발견되었습니다.',
        width: 0,
        height: 0,
        hasViewBox: false,
      };
    }

    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      return {
        isValid: false,
        error: '<svg> 루트 요소를 찾을 수 없습니다.',
        width: 0,
        height: 0,
        hasViewBox: false,
      };
    }

    const viewBoxAttr = svgElement.getAttribute('viewBox');
    let width = 0;
    let height = 0;
    let hasViewBox = false;

    if (viewBoxAttr) {
      const parts = viewBoxAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (parts.length === 4 && !Number.isNaN(parts[2]) && !Number.isNaN(parts[3])) {
        width = parts[2];
        height = parts[3];
        hasViewBox = true;
      }
    }

    if (!width) {
      const wAttr = svgElement.getAttribute('width');
      if (wAttr) width = parseFloat(wAttr) || 0;
    }
    if (!height) {
      const hAttr = svgElement.getAttribute('height');
      if (hAttr) height = parseFloat(hAttr) || 0;
    }

    if (!width) width = 800;
    if (!height) height = 600;

    return {
      isValid: true,
      width: Math.round(width),
      height: Math.round(height),
      hasViewBox,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SVG 파싱 중 알 수 없는 오류';
    return {
      isValid: false,
      error: message,
      width: 0,
      height: 0,
      hasViewBox: false,
    };
  }
}

// ----------------------------------------------------------------------
// 4. 유틸리티 헬퍼 (Palette & Color)
// ----------------------------------------------------------------------

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function extractColorPalette(data: Uint8ClampedArray, maxColors: number): string[] {
  const colorBuckets = new Map<string, number>();

  const step = 4;
  for (let i = 0; i < data.length; i += 4 * step) {
    const a = data[i + 3];
    if (a < 32) continue;

    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;

    const hex = rgbToHex(Math.min(255, r), Math.min(255, g), Math.min(255, b));
    colorBuckets.set(hex, (colorBuckets.get(hex) || 0) + 1);
  }

  const sorted = Array.from(colorBuckets.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  if (sorted.length === 0) {
    return ['#000000', '#ffffff'];
  }

  return sorted.slice(0, maxColors);
}

function findNearestColor(r: number, g: number, b: number, palette: string[]): string {
  let minDistance = Infinity;
  let nearest = palette[0];

  for (let i = 0; i < palette.length; i += 1) {
    const { r: pr, g: pg, b: pb } = hexToRgb(palette[i]);
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDistance) {
      minDistance = dist;
      nearest = palette[i];
      if (dist === 0) break;
    }
  }

  return nearest;
}

export function calculateDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    return new Blob([dataUrl]).size;
  }
  const base64Length = dataUrl.length - (base64Index + 8);
  const padding = dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64Length * 3) / 4) - padding);
}

export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

// ----------------------------------------------------------------------
// 5. 샘플 프리셋 데이터
// ----------------------------------------------------------------------

export const SAMPLE_SVG_PRESETS: SvgSamplePreset[] = [
  {
    id: 'toss-blue-shield',
    title: '토스 블루 3D 실드 아이콘',
    category: '아이콘',
    description: '입체감 있는 그라디언트 보안 방패 심볼',
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3182F6" />
      <stop offset="100%" stop-color="#1B64DA" />
    </linearGradient>
    <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#3182F6" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect width="100%" height="100%" rx="80" fill="#F2F4F6" />
  <g filter="url(#dropGlow)">
    <path d="M200 70 L310 115 C310 230 200 325 200 325 C200 325 90 230 90 115 Z" fill="url(#shieldGrad)" />
    <path d="M165 195 L190 220 L245 165" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`,
  },
  {
    id: 'crypto-rocket',
    title: '스페이스 로켓 발사 로고',
    category: '일러스트',
    description: '상승하는 테크 스타트업 비행 로켓 벡터',
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="flame" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF5A00" />
      <stop offset="100%" stop-color="#FFC000" />
    </linearGradient>
  </defs>
  <rect width="500" height="500" rx="100" fill="url(#bgGrad)" />
  <path d="M225 340 Q250 430 250 430 Q250 430 275 340 Z" fill="url(#flame)" />
  <path d="M235 340 Q250 395 250 395 Q250 395 265 340 Z" fill="#FFFFFF" />
  <path d="M175 270 L210 330 L210 250 Z" fill="#EF4444" />
  <path d="M325 270 L290 330 L290 250 Z" fill="#EF4444" />
  <path d="M250 110 C215 170 210 310 210 340 L290 340 C290 310 285 170 250 110 Z" fill="#F8FAFC" />
  <circle cx="250" cy="220" r="28" fill="#38BDF8" stroke="#E2E8F0" stroke-width="8" />
  <path d="M250 110 C234 135 224 165 220 185 L280 185 C276 165 266 135 250 110 Z" fill="#EF4444" />
</svg>`,
  },
  {
    id: 'modern-abstract-flower',
    title: '모던 기하학 아티스틱 심볼',
    category: '기하학',
    description: '회전 대칭 패턴의 추상 그래픽 아트',
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect width="500" height="500" fill="#FAFAFA" rx="60"/>
  <g transform="translate(250, 250)">
    <circle r="60" fill="#6366F1" opacity="0.9"/>
    <ellipse cx="0" cy="-110" rx="45" ry="85" fill="#EC4899" opacity="0.75" />
    <ellipse cx="110" cy="0" rx="85" ry="45" fill="#8B5CF6" opacity="0.75" />
    <ellipse cx="0" cy="110" rx="45" ry="85" fill="#3B82F6" opacity="0.75" />
    <ellipse cx="-110" cy="0" rx="85" ry="45" fill="#10B981" opacity="0.75" />
    <circle r="30" fill="#FFFFFF"/>
  </g>
</svg>`,
  },
];

export const SAMPLE_RASTER_IMAGES = [
  {
    id: 'sample-app-icon',
    label: '✨ 모바일 앱 심볼 & 아이콘 (PNG)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    subLabel: '투명 배경 및 선명한 심볼 ➜ 벡터 SVG 변환에 최적',
  },
  {
    id: 'sample-illustration',
    label: '🎨 컬러 일러스트 아트 (PNG)',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    subLabel: '다채로운 색상 ➜ 컬러 포스터라이제이션 SVG 변환',
  },
  {
    id: 'sample-typography-logo',
    label: '🖋️ 흑백 타이포 & 서명 로고 (JPG)',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    subLabel: '명암 대비 뚜렷한 이미지 ➜ 흑백/실루엣 트레이스에 최적',
  },
];

/**
 * SVG 소스 코드를 읽기 쉽게 들여쓰기 서식을 정리합니다.
 */
export function formatSvgCode(xml: string): string {
  if (!xml) return '';
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // 줄바꿈 정규화 및 태그 분리
  const tokens = xml.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/g);

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i].trim();
    if (!token) continue;

    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += `${tab.repeat(indent)}${token}\n`;
    } else if (
      token.startsWith('<') &&
      !token.startsWith('<?') &&
      !token.startsWith('<!') &&
      !token.endsWith('/>')
    ) {
      formatted += `${tab.repeat(indent)}${token}\n`;
      indent += 1;
    } else {
      formatted += `${tab.repeat(indent)}${token}\n`;
    }
  }

  return formatted.trim();
}
