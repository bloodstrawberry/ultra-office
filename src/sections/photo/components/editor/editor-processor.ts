'use client';

import type { PhotoEditorState, DecorateAdjustments } from './editor-types';

// ----------------------------------------------------------------------
// Color Math & Conversion Helpers
// ----------------------------------------------------------------------

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return [r, g, b];
}

// ----------------------------------------------------------------------
// Smart Remaster (AI Auto-Enhance)
// ----------------------------------------------------------------------

export function applySmartRemaster(
  state: PhotoEditorState,
  mode: 'galaxy' | 'iphone'
): PhotoEditorState {
  if (mode === 'galaxy') {
    // Samsung Galaxy Photo Remaster style:
    // Vivid clarity, brightened shadows, enhanced structure, and rich saturation
    return {
      ...state,
      basic: {
        ...state.basic,
        exposure: 8,
        brightness: 5,
        contrast: 12,
        highlights: -8,
        shadows: 18,
        whites: 6,
        blacks: -4,
        gamma: 4,
      },
      color: {
        ...state.color,
        saturation: 16,
        vibrance: 22,
        temperature: 4,
      },
      detail: {
        ...state.detail,
        clarity: 18,
        definition: 14,
        texture: 12,
        structure: 16,
        dehaze: 10,
        sharpening: 22,
        noiseReduction: 15,
      },
    };
  }

  // Apple iPhone iOS Auto Enhance (Magic Wand) style:
  // Balanced dynamic range, natural skin tone preservation, deep blacks, subtle highlight recovery
  return {
    ...state,
    basic: {
      ...state.basic,
      exposure: 6,
      brightness: 2,
      contrast: 10,
      highlights: -16,
      shadows: 20,
      whites: 8,
      blackPoint: 8,
      gamma: 2,
    },
    color: {
      ...state.color,
      saturation: 10,
      vibrance: 14,
      temperature: 6,
    },
    detail: {
      ...state.detail,
      clarity: 12,
      definition: 10,
      sharpening: 16,
      noiseReduction: 10,
    },
  };
}

// ----------------------------------------------------------------------
// Fast In-Memory Canvas Processing Pipeline
// ----------------------------------------------------------------------

/**
 * Applies basic, color, detail, effects, selective, and portrait pixel modifications.
 */
export function processPixelData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  state: PhotoEditorState,
  selectiveMaskData?: Uint8ClampedArray | null
): void {
  const { basic, color, detail, effects, selective, portrait } = state;

  // Precompute constants
  const expMult = Math.pow(2, basic.exposure / 50);
  const brightnessOffset = (basic.brightness / 100) * 80;
  const contrastFactor = (259 * (basic.contrast + 100)) / (100 * (259 - basic.contrast));
  const gammaExp = 1 / Math.max(0.1, 1 + basic.gamma / 100);

  const satFactor = 1 + color.saturation / 100;
  const vibranceFactor = color.vibrance / 100;
  const tempShift = color.temperature; // -100 ~ 100
  const tintShift = color.tint; // -100 ~ 100

  // Color grading colors
  const [cgSR, cgSG, cgSB] = hexToRgb(color.colorGrading.shadows.color);
  const [cgMR, cgMG, cgMB] = hexToRgb(color.colorGrading.midtones.color);
  const [cgHR, cgHG, cgHB] = hexToRgb(color.colorGrading.highlights.color);
  const cgSInt = color.colorGrading.shadows.intensity / 100;
  const cgMInt = color.colorGrading.midtones.intensity / 100;
  const cgHInt = color.colorGrading.highlights.intensity / 100;

  // Effects
  const fadeAmount = effects.fade / 100;
  const grainAmount = effects.grain.amount;
  const vignetteAmt = effects.vignette.amount / 100;
  const vMid = effects.vignette.midpoint / 100;
  const vFeather = Math.max(0.01, effects.vignette.feather / 100);

  // Portrait
  const skinSmooth = portrait.skinSmoothing / 100;
  const teethWhiten = portrait.teethWhitening / 100;
  const darkCircleFix = portrait.darkCircle / 100;

  const totalPixels = width * height;
  const halfW = width / 2;
  const halfH = height / 2;
  const maxDist = Math.sqrt(halfW * halfW + halfH * halfH);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    let r = data[idx];
    let g = data[idx + 1];
    let b = data[idx + 2];
    const a = data[idx + 3];

    if (a === 0) continue;

    // Check selective mask weight if present
    let maskWeight = 1.0;
    if (selective.active && selectiveMaskData) {
      maskWeight = selectiveMaskData[i] / 255;
      if (selective.maskInvert) maskWeight = 1.0 - maskWeight;
    }

    // 1. Exposure & Brightness
    r = r * expMult + brightnessOffset;
    g = g * expMult + brightnessOffset;
    b = b * expMult + brightnessOffset;

    // 2. Luminance & Contrast
    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (basic.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 3. Highlights & Shadows
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (basic.highlights !== 0 && lum > 110) {
      const hWeight = Math.min(1, (lum - 110) / 145);
      const hShift = (basic.highlights / 100) * 60 * hWeight;
      r += hShift;
      g += hShift;
      b += hShift;
    }
    if (basic.shadows !== 0 && lum < 145) {
      const sWeight = Math.min(1, (145 - lum) / 145);
      const sShift = (basic.shadows / 100) * 60 * sWeight;
      r += sShift;
      g += sShift;
      b += sShift;
    }

    // Whites & Blacks & Black Point
    if (basic.whites !== 0 && lum > 180) {
      const wWeight = (lum - 180) / 75;
      const wShift = (basic.whites / 100) * 40 * wWeight;
      r += wShift;
      g += wShift;
      b += wShift;
    }
    if (basic.blacks !== 0 && lum < 75) {
      const bWeight = (75 - lum) / 75;
      const bShift = (basic.blacks / 100) * 40 * bWeight;
      r += bShift;
      g += bShift;
      b += bShift;
    }
    if (basic.blackPoint !== 0) {
      const bp = (basic.blackPoint / 100) * 25;
      r = Math.max(0, r - bp);
      g = Math.max(0, g - bp);
      b = Math.max(0, b - bp);
    }

    // Gamma
    if (basic.gamma !== 0) {
      r = Math.pow(Math.max(0, r / 255), gammaExp) * 255;
      g = Math.pow(Math.max(0, g / 255), gammaExp) * 255;
      b = Math.pow(Math.max(0, b / 255), gammaExp) * 255;
    }

    // 4. Color: Temperature & Tint
    if (tempShift !== 0) {
      r += (tempShift / 100) * 35;
      b -= (tempShift / 100) * 35;
    }
    if (tintShift !== 0) {
      g -= (tintShift / 100) * 25;
      r += (tintShift / 100) * 15;
      b += (tintShift / 100) * 15;
    }

    // 5. Saturation & Vibrance
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (color.saturation !== 0 || color.vibrance !== 0) {
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const curSat = (maxC - minC) / (maxC + 0.001);
      const vibBoost = 1 + vibranceFactor * (1 - curSat);
      const totalSat = satFactor * vibBoost;

      r = lum + (r - lum) * totalSat;
      g = lum + (g - lum) * totalSat;
      b = lum + (b - lum) * totalSat;
    }

    // 6. Color Grading
    if (cgSInt > 0 && lum < 128) {
      const sFactor = ((128 - lum) / 128) * cgSInt;
      r += (cgSR - r) * sFactor * 0.5;
      g += (cgSG - g) * sFactor * 0.5;
      b += (cgSB - b) * sFactor * 0.5;
    }
    if (cgHInt > 0 && lum > 128) {
      const hFactor = ((lum - 128) / 128) * cgHInt;
      r += (cgHR - r) * hFactor * 0.5;
      g += (cgHG - g) * hFactor * 0.5;
      b += (cgHB - b) * hFactor * 0.5;
    }
    if (cgMInt > 0) {
      const mFactor = (1 - Math.abs(lum - 128) / 128) * cgMInt;
      r += (cgMR - r) * mFactor * 0.4;
      g += (cgMG - g) * mFactor * 0.4;
      b += (cgMB - b) * mFactor * 0.4;
    }

    // 7. Effects: Fade & Vignette & Grain
    if (fadeAmount > 0) {
      const floor = fadeAmount * 35;
      r = r * (1 - fadeAmount * 0.3) + floor;
      g = g * (1 - fadeAmount * 0.3) + floor;
      b = b * (1 - fadeAmount * 0.3) + floor;
    }

    if (vignetteAmt !== 0) {
      const px = i % width;
      const py = Math.floor(i / width);
      const dist = Math.sqrt((px - halfW) ** 2 + (py - halfH) ** 2) / maxDist;
      if (dist > vMid) {
        const factor = Math.min(1, (dist - vMid) / vFeather);
        const vScale = 1 + vignetteAmt * factor;
        r *= vScale;
        g *= vScale;
        b *= vScale;
      }
    }

    if (grainAmount > 0) {
      const noise = (Math.random() - 0.5) * (grainAmount * 0.8);
      r += noise;
      g += noise;
      b += noise;
    }

    // 8. Portrait touches (Skin smoothing & teeth whitening heuristic)
    if (skinSmooth > 0) {
      // Skin detection in YCbCr/RGB
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15) {
        // Soften high-contrast edges toward median skin tone
        const skinMed = (r + g * 1.1 + b * 0.9) / 3;
        r = r * (1 - skinSmooth * 0.35) + skinMed * skinSmooth * 0.35;
        g = g * (1 - skinSmooth * 0.35) + skinMed * skinSmooth * 0.35;
        b = b * (1 - skinSmooth * 0.35) + skinMed * skinSmooth * 0.35;
      }
    }

    if (teethWhiten > 0 && lum > 140 && Math.abs(r - g) < 25 && b < g) {
      // Reduce yellow tint in teeth area
      b += (g - b) * teethWhiten * 0.6;
      r = Math.min(255, r + teethWhiten * 15);
      g = Math.min(255, g + teethWhiten * 15);
    }

    if (darkCircleFix > 0 && lum < 120 && r > 60 && g > 40) {
      const boost = darkCircleFix * 20;
      r += boost;
      g += boost * 0.9;
      b += boost * 0.8;
    }

    // 9. Blend back with selective mask if active
    if (selective.active && maskWeight < 1.0) {
      const origR = data[idx];
      const origG = data[idx + 1];
      const origB = data[idx + 2];
      r = origR * (1 - maskWeight) + r * maskWeight;
      g = origG * (1 - maskWeight) + g * maskWeight;
      b = origB * (1 - maskWeight) + b * maskWeight;
    }

    data[idx] = Math.max(0, Math.min(255, Math.round(r)));
    data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  // 10. Detail: Unsharp Mask Sharpening
  if (detail.sharpening > 0 || detail.clarity > 0) {
    applySharpenAndClarity(data, width, height, detail.sharpening, detail.clarity);
  }
}

/**
 * 3x3 Convolution for Sharpening & Clarity
 */
function applySharpenAndClarity(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  sharpening: number,
  clarity: number
): void {
  const strength = (sharpening / 100) * 0.7 + (clarity / 100) * 0.4;
  if (strength <= 0) return;

  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const top = copy[((y - 1) * width + x) * 4 + c];
        const bottom = copy[((y + 1) * width + x) * 4 + c];
        const left = copy[(y * width + (x - 1)) * 4 + c];
        const right = copy[(y * width + (x + 1)) * 4 + c];

        const laplacian = 5 * center - top - bottom - left - right;
        const result = center * (1 - strength) + laplacian * strength;
        data[idx + c] = Math.max(0, Math.min(255, Math.round(result)));
      }
    }
  }
}

// ----------------------------------------------------------------------
// AI Eraser (Content-Aware Patch Inpainting)
// ----------------------------------------------------------------------

export function applyAiInpaint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maskCanvas: HTMLCanvasElement
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return;

  const maskData = maskCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  const mPixels = maskData.data;

  // Multi-pass diffusion / patch-based fill
  const iterations = 8;
  for (let it = 0; it < iterations; it++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const mIdx = (y * width + x) * 4;
        if (mPixels[mIdx] > 50) {
          // Inside erase mask: blend from 4 neighbors that are least masked
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let count = 0;

          const neighbors = [
            (y * width + (x - 1)) * 4,
            (y * width + (x + 1)) * 4,
            ((y - 1) * width + x) * 4,
            ((y + 1) * width + x) * 4,
            ((y - 2) * width + x) * 4,
            ((y + 2) * width + x) * 4,
          ];

          for (const nIdx of neighbors) {
            if (nIdx >= 0 && nIdx < pixels.length) {
              sumR += pixels[nIdx];
              sumG += pixels[nIdx + 1];
              sumB += pixels[nIdx + 2];
              count++;
            }
          }

          if (count > 0) {
            const pIdx = mIdx;
            pixels[pIdx] = Math.round(sumR / count);
            pixels[pIdx + 1] = Math.round(sumG / count);
            pixels[pIdx + 2] = Math.round(sumB / count);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// ----------------------------------------------------------------------
// Render Overlays: Frame, Layers, Light Leaks, Drawings
// ----------------------------------------------------------------------

export function renderEditorOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: PhotoEditorState
): void {
  const { effects, decorate } = state;

  // 1. Light Leak Overlay
  if (effects.lightLeak.enabled && effects.lightLeak.opacity > 0) {
    ctx.save();
    ctx.globalAlpha = effects.lightLeak.opacity / 100;
    ctx.globalCompositeOperation = 'screen';

    const gradX = effects.lightLeak.position.includes('right') ? width : 0;
    const gradY = effects.lightLeak.position.includes('bottom') ? height : 0;
    const radius = Math.max(width, height) * 0.75;

    const radGrad = ctx.createRadialGradient(gradX, gradY, 10, gradX, gradY, radius);
    if (effects.lightLeak.preset === 'warm-corner') {
      radGrad.addColorStop(0, 'rgba(255, 140, 40, 0.9)');
      radGrad.addColorStop(0.5, 'rgba(255, 80, 20, 0.4)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (effects.lightLeak.preset === 'rainbow-burst') {
      radGrad.addColorStop(0, 'rgba(255, 20, 150, 0.85)');
      radGrad.addColorStop(0.3, 'rgba(255, 180, 20, 0.6)');
      radGrad.addColorStop(0.7, 'rgba(20, 220, 255, 0.4)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      radGrad.addColorStop(0, 'rgba(255, 210, 100, 0.8)');
      radGrad.addColorStop(0.6, 'rgba(255, 100, 50, 0.3)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 2. Mosaic / Pixelate Regions
  if (decorate.mosaicRegions && decorate.mosaicRegions.length > 0) {
    for (const region of decorate.mosaicRegions) {
      const rx = Math.round(region.x * width);
      const ry = Math.round(region.y * height);
      const rw = Math.round(region.width * width);
      const rh = Math.round(region.height * height);
      const bSize = Math.max(4, region.blockSize);

      if (rw <= 0 || rh <= 0) continue;

      const rData = ctx.getImageData(rx, ry, rw, rh);
      const rPixels = rData.data;

      for (let by = 0; by < rh; by += bSize) {
        for (let bx = 0; bx < rw; bx += bSize) {
          const sampleIdx = (by * rw + bx) * 4;
          const sR = rPixels[sampleIdx];
          const sG = rPixels[sampleIdx + 1];
          const sB = rPixels[sampleIdx + 2];

          for (let dy = 0; dy < bSize && by + dy < rh; dy++) {
            for (let dx = 0; dx < bSize && bx + dx < rw; dx++) {
              const pIdx = ((by + dy) * rw + (bx + dx)) * 4;
              rPixels[pIdx] = sR;
              rPixels[pIdx + 1] = sG;
              rPixels[pIdx + 2] = sB;
            }
          }
        }
      }
      ctx.putImageData(rData, rx, ry);
    }
  }

  // 3. Freehand Drawings
  if (decorate.drawingPaths && decorate.drawingPaths.length > 0) {
    for (const path of decorate.drawingPaths) {
      if (path.points.length < 2) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = path.width;

      if (path.type === 'highlighter') {
        ctx.strokeStyle = path.color;
        ctx.globalAlpha = 0.45;
        ctx.globalCompositeOperation = 'multiply';
      } else if (path.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.strokeStyle = path.color;
        ctx.globalAlpha = path.opacity || 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.beginPath();
      ctx.moveTo(path.points[0].x * width, path.points[0].y * height);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x * width, path.points[i].y * height);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. Layers (Text, Stickers)
  if (decorate.layers && decorate.layers.length > 0) {
    for (const layer of decorate.layers) {
      if (!layer.visible) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation =
        !layer.blendMode || layer.blendMode === 'normal'
          ? 'source-over'
          : (layer.blendMode as GlobalCompositeOperation);

      const lx = layer.x * width;
      const ly = layer.y * height;

      ctx.translate(lx, ly);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }

      if (layer.type === 'text' && layer.text) {
        const { text } = layer;
        ctx.font = `${text.fontWeight || '700'} ${text.fontSize || 36}px ${text.fontFamily || 'sans-serif'}`;
        ctx.textAlign = text.align || 'center';
        ctx.textBaseline = 'middle';

        if (text.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
        }

        if (text.outlineWidth && text.outlineColor) {
          ctx.strokeStyle = text.outlineColor;
          ctx.lineWidth = text.outlineWidth;
          ctx.strokeText(text.content, 0, 0);
        }

        ctx.fillStyle = text.color || '#FFFFFF';
        ctx.fillText(text.content, 0, 0);
      } else if (layer.type === 'sticker' && layer.sticker) {
        if (layer.sticker.isEmoji) {
          ctx.font = '56px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.sticker.emojiOrUrl, 0, 0);
        }
      }

      ctx.restore();
    }
  }

  // 5. Camera & Aesthetic Frames
  if (decorate.frame.preset !== 'none') {
    renderFrameBorder(ctx, width, height, decorate.frame);
  }
}

function renderFrameBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: DecorateAdjustments['frame']
): void {
  ctx.save();
  const fWidth = frame.width || 24;

  if (frame.preset === 'iphone-viewfinder') {
    // Elegant iPhone Camera Viewfinder frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    const cornerSize = 28;
    const inset = 30;

    // 4 Corner Brackets
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(inset, inset + cornerSize);
    ctx.lineTo(inset, inset);
    ctx.lineTo(inset + cornerSize, inset);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cornerSize, inset);
    ctx.lineTo(width - inset, inset);
    ctx.lineTo(width - inset, inset + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(inset, height - inset - cornerSize);
    ctx.lineTo(inset, height - inset);
    ctx.lineTo(inset + cornerSize, height - inset);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cornerSize, height - inset);
    ctx.lineTo(width - inset, height - inset);
    ctx.lineTo(width - inset, height - inset - cornerSize);
    ctx.stroke();

    // Subtle center crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // Top Status text
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.textAlign = 'left';
    ctx.fillText('4K • 60 FPS', inset + 6, inset - 10);
    ctx.textAlign = 'right';
    ctx.fillText('1x • 24mm', width - inset - 6, inset - 10);
  } else if (frame.preset === 'galaxy-camera') {
    // Samsung One UI Camera frame with yellow focus indicator
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.lineWidth = 2;
    const cx = width / 2;
    const cy = height / 2;
    const boxSize = 60;
    ctx.strokeRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);

    // Galaxy Pro Badge
    ctx.font = '700 13px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('GALAXY EXPERT RAW', 36, 44);
  } else if (frame.preset === 'polaroid') {
    // Polaroid Bottom-Heavy frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, fWidth);
    ctx.fillRect(0, 0, fWidth, height);
    ctx.fillRect(width - fWidth, 0, fWidth, height);
    ctx.fillRect(0, height - fWidth * 3, width, fWidth * 3);
  } else if (frame.preset === 'simple-white') {
    ctx.strokeStyle = frame.color || '#FFFFFF';
    ctx.lineWidth = fWidth;
    ctx.strokeRect(fWidth / 2, fWidth / 2, width - fWidth, height - fWidth);
  }

  ctx.restore();
}
