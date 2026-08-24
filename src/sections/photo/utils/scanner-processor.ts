import { PDFDocument } from 'pdf-lib';

import { loadImage } from './image-processor';

// ----------------------------------------------------------------------
// Types & Presets
// ----------------------------------------------------------------------

export type ScanPresetType =
  | 'bw_document'
  | 'color_document'
  | 'copier_gray'
  | 'vintage_fax'
  | 'id_receipt';

export interface ScanConfig {
  preset: ScanPresetType;
  contrast: number; // -50 to +100
  brightness: number; // -50 to +50
  paperWhitening: number; // 0 to 100 (removes yellowish background shadows)
  noise: number; // 0 to 50 (scanner sensor dust/grain)
  skewAngle: number; // -3 to +3 degrees (realistic paper skew)
  edgeVignette: number; // 0 to 100 (scanner bed shadow)
  scanlines: number; // 0 to 100 (optical sensor scanlines)
  sharpen: boolean; // text sharpening
}

export const SCAN_PRESETS: {
  id: ScanPresetType;
  name: string;
  desc: string;
  icon: string;
  defaultConfig: Partial<ScanConfig>;
}[] = [
  {
    id: 'bw_document',
    name: '선명한 흑백 문서',
    desc: '누런 배경과 그림자를 지우고 글씨를 진하고 또렷하게 변환',
    icon: '📄',
    defaultConfig: {
      contrast: 40,
      brightness: 15,
      paperWhitening: 60,
      noise: 8,
      skewAngle: 0.3,
      edgeVignette: 15,
      scanlines: 5,
      sharpen: true,
    },
  },
  {
    id: 'color_document',
    name: '선명한 컬러 문서',
    desc: '붉은 직인·서명 및 컬러 텍스트를 보존하며 종이 배경만 깨끗하게 미백',
    icon: '📑',
    defaultConfig: {
      contrast: 25,
      brightness: 10,
      paperWhitening: 50,
      noise: 6,
      skewAngle: -0.2,
      edgeVignette: 12,
      scanlines: 4,
      sharpen: true,
    },
  },
  {
    id: 'copier_gray',
    name: '사무실 복사기 흑백',
    desc: '사무용 평판 복사기 특유의 토너 농도와 명암 곡선 시뮬레이션',
    icon: '🖨️',
    defaultConfig: {
      contrast: 30,
      brightness: 5,
      paperWhitening: 35,
      noise: 14,
      skewAngle: 0.4,
      edgeVignette: 25,
      scanlines: 10,
      sharpen: true,
    },
  },
  {
    id: 'vintage_fax',
    name: '빈티지 팩스 & 감열지',
    desc: '팩스기 디더링 노이즈와 미세한 주사선이 돋보이는 레트로 문서 룩',
    icon: '📠',
    defaultConfig: {
      contrast: 60,
      brightness: 0,
      paperWhitening: 40,
      noise: 28,
      skewAngle: -0.5,
      edgeVignette: 35,
      scanlines: 30,
      sharpen: true,
    },
  },
  {
    id: 'id_receipt',
    name: '신분증 & 영수증 선명화',
    desc: '작은 활자와 영수증 감열 잉크의 가독성을 극대화하여 스캔',
    icon: '🧾',
    defaultConfig: {
      contrast: 45,
      brightness: 12,
      paperWhitening: 55,
      noise: 5,
      skewAngle: 0.1,
      edgeVignette: 10,
      scanlines: 0,
      sharpen: true,
    },
  },
];

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  preset: 'bw_document',
  contrast: 40,
  brightness: 15,
  paperWhitening: 60,
  noise: 8,
  skewAngle: 0.3,
  edgeVignette: 15,
  scanlines: 5,
  sharpen: true,
};

// ----------------------------------------------------------------------
// Core Scan Processing Algorithm
// ----------------------------------------------------------------------

/**
 * Transforms an image to look like a flatbed scanner or photocopier output.
 */
export async function renderScanEffect(
  imageSrc: string,
  config: ScanConfig = DEFAULT_SCAN_CONFIG
): Promise<string> {
  const img = await loadImage(imageSrc);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // 1. Setup Canvas with optional skewing rotation
  const rad = (config.skewAngle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const canvasW = Math.round(origW * cos + origH * sin);
  const canvasH = Math.round(origW * sin + origH * cos);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  // Fill pure white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw rotated source image in center
  ctx.save();
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
  ctx.restore();

  // 2. Pixel Manipulation
  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const data = imgData.data;
  const len = data.length;

  const contrastFactor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));
  const brightnessOffset = config.brightness * 1.5;
  const whiteThreshold = 255 - config.paperWhitening * 1.3;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel - minChannel;

    if (config.preset === 'bw_document') {
      // High contrast B&W with paper background elimination
      if (lum > whiteThreshold) {
        // Background paper whitening
        const whitenRatio = (lum - whiteThreshold) / Math.max(1, 255 - whiteThreshold);
        r = 255;
        g = 255;
        b = 255;
      } else {
        // Darken text/ink
        let ink = lum * 0.85;
        ink = contrastFactor * (ink - 128) + 128 + brightnessOffset;
        ink = Math.max(15, Math.min(240, ink));
        r = ink;
        g = ink;
        b = ink;
      }
    } else if (config.preset === 'color_document') {
      // Preserve colorful elements (red stamps, signatures, colored text) while whitening paper
      const isColored = saturation > 28;

      if (!isColored && lum > whiteThreshold) {
        // Paper background
        r = Math.min(255, r + (255 - r) * 0.9);
        g = Math.min(255, g + (255 - g) * 0.9);
        b = Math.min(255, b + (255 - b) * 0.9);
      } else {
        // Enhance ink & stamp color
        r = contrastFactor * (r - 128) + 128 + brightnessOffset;
        g = contrastFactor * (g - 128) + 128 + brightnessOffset;
        b = contrastFactor * (b - 128) + 128 + brightnessOffset;
      }
    } else if (config.preset === 'copier_gray') {
      // Office photocopier toner S-curve
      let gray = lum;
      gray = contrastFactor * (gray - 128) + 128 + brightnessOffset;
      // Photocopier toner grain threshold
      if (gray > 220) gray = 250;
      else if (gray < 50) gray = 20;
      r = gray;
      g = gray;
      b = gray;
    } else if (config.preset === 'vintage_fax') {
      // Vintage fax thermal paper with dithering
      let gray = lum + (Math.random() - 0.5) * (config.noise * 2);
      gray = gray > 140 ? 245 : 30;
      r = gray;
      g = gray;
      b = gray;
    } else if (config.preset === 'id_receipt') {
      // Clean ID / Receipt with high contrast and ink boost
      if (lum > whiteThreshold) {
        r = 255;
        g = 255;
        b = 255;
      } else {
        r = contrastFactor * (r - 128) + 128 + brightnessOffset;
        g = contrastFactor * (g - 128) + 128 + brightnessOffset;
        b = contrastFactor * (b - 128) + 128 + brightnessOffset;
      }
    }

    // Apply scanner grain noise
    if (config.noise > 0 && config.preset !== 'vintage_fax') {
      const n = (Math.random() - 0.5) * config.noise * 1.6;
      r += n;
      g += n;
      b += n;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // 3. Apply Scanlines & Scanner Bed Edge Vignette
  const width = canvasW;
  const height = canvasH;

  for (let y = 0; y < height; y++) {
    const isScanline = config.scanlines > 0 && y % 3 === 0;
    const scanlineDarken = isScanline ? (config.scanlines / 100) * 18 : 0;

    // Distance to edge for scanner bed shadow
    const distY = Math.min(y, height - 1 - y);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Optical scanline
      if (scanlineDarken > 0) {
        data[idx] = Math.max(0, data[idx] - scanlineDarken);
        data[idx + 1] = Math.max(0, data[idx + 1] - scanlineDarken);
        data[idx + 2] = Math.max(0, data[idx + 2] - scanlineDarken);
      }

      // Edge Vignette / Scanner Lid Shadow
      if (config.edgeVignette > 0) {
        const distX = Math.min(x, width - 1 - x);
        const minEdgeDist = Math.min(distX, distY);
        const vignetteRange = Math.max(20, Math.min(width, height) * 0.06);

        if (minEdgeDist < vignetteRange) {
          const shadowFactor =
            (1 - minEdgeDist / vignetteRange) * (config.edgeVignette / 100) * 0.45;
          data[idx] = Math.max(0, data[idx] * (1 - shadowFactor));
          data[idx + 1] = Math.max(0, data[idx + 1] * (1 - shadowFactor));
          data[idx + 2] = Math.max(0, data[idx + 2] * (1 - shadowFactor));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ----------------------------------------------------------------------
// PDF Export Utility
// ----------------------------------------------------------------------

/**
 * Creates a multi-page or single-page PDF document from scanned data URLs.
 */
export async function exportScannedImagesToPdf(
  dataUrls: string[],
  pageSize: 'A4' | 'fit' = 'A4'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const url of dataUrls) {
    const isPng = url.startsWith('data:image/png');
    const base64Data = url.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const embeddedImg = isPng
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    const imgW = embeddedImg.width;
    const imgH = embeddedImg.height;

    if (pageSize === 'A4') {
      // Standard A4 dimensions in points: 595.28 x 841.89
      const a4W = 595.28;
      const a4H = 841.89;
      const margin = 20;
      const maxW = a4W - margin * 2;
      const maxH = a4H - margin * 2;

      const scale = Math.min(maxW / imgW, maxH / imgH, 1);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = (a4W - drawW) / 2;
      const y = (a4H - drawH) / 2;

      const page = pdfDoc.addPage([a4W, a4H]);
      page.drawImage(embeddedImg, { x, y, width: drawW, height: drawH });
    } else {
      // Fit page to image dimensions
      const page = pdfDoc.addPage([imgW, imgH]);
      page.drawImage(embeddedImg, { x: 0, y: 0, width: imgW, height: imgH });
    }
  }

  return pdfDoc.save();
}

/**
 * Triggers PDF file download directly in browser.
 */
export function downloadPdfBytes(pdfBytes: Uint8Array, fileName: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
