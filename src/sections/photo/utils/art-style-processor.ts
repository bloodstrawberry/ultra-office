/**
 * Art Style Filter Processor
 * 14 distinct, high-performance canvas image processing algorithms
 */

export type FilterType =
  | 'pencil'
  | 'colored_pencil'
  | 'oil_painting'
  | 'kuwahara'
  | 'watercolor'
  | 'sumi_e'
  | 'charcoal'
  | 'comic'
  | 'halftone'
  | 'anime'
  | 'pastel'
  | 'vintage_film'
  | 'etching'
  | 'cyberpunk';

export interface ArtStyleOption {
  id: FilterType;
  name: string;
  desc: string;
  icon: string;
  category: 'drawing' | 'painting' | 'graphic' | 'vintage';
}

export const ART_FILTERS: ArtStyleOption[] = [
  // 1. 드로잉 & 소묘
  {
    id: 'pencil',
    name: '연필 스케치',
    desc: '흑백 정밀 소묘 & 디테일 연필 드로잉',
    icon: '✏️',
    category: 'drawing',
  },
  {
    id: 'colored_pencil',
    name: '색연필화',
    desc: '화사한 색감과 섬세한 색연필 텍스처',
    icon: '🖍️',
    category: 'drawing',
  },
  {
    id: 'charcoal',
    name: '목탄화 / 크로키',
    desc: '거친 종이 결 & 깊은 명암의 목탄 소묘',
    icon: '🌑',
    category: 'drawing',
  },
  {
    id: 'etching',
    name: '앤틱 에칭 판화',
    desc: '세밀한 펜화 크로스해칭 & 고풍스러운 판화',
    icon: '📜',
    category: 'drawing',
  },
  {
    id: 'sumi_e',
    name: '수묵화 / 동양화',
    desc: '한지 위 은은한 먹선과 담채화 여백의 미',
    icon: '🎍',
    category: 'painting',
  },

  // 2. 페인팅 & 회화
  {
    id: 'oil_painting',
    name: '인상파 유화',
    desc: '두터운 붓터치와 물감의 질감이 살아있는 유화',
    icon: '🖼️',
    category: 'painting',
  },
  {
    id: 'kuwahara',
    name: '클래식 유화 (Kuwahara)',
    desc: '에지 보존 스무딩 & 클래식 붓터치 회화',
    icon: '🎨',
    category: 'painting',
  },
  {
    id: 'watercolor',
    name: '수채화',
    desc: '촉촉한 번짐과 투명한 수채화 물감 감성',
    icon: '🖌️',
    category: 'painting',
  },
  {
    id: 'pastel',
    name: '소프트 파스텔 / 과슈',
    desc: '부드럽고 몽환적인 벨벳 파스텔 일러스트',
    icon: '🌸',
    category: 'painting',
  },

  // 3. 그래픽 & 카툰
  {
    id: 'anime',
    name: '지브리 감성 애니',
    desc: '맑고 청량한 색감 & 애니메이션 셀 룩',
    icon: '☁️',
    category: 'graphic',
  },
  {
    id: 'comic',
    name: '코믹 팝아트',
    desc: '선명한 잉크 외곽선 & 팝아트 카툰',
    icon: '💥',
    category: 'graphic',
  },
  {
    id: 'halftone',
    name: '도트 팝아트 (Ben-Day)',
    desc: '레트로 만화책 벤데이 도트 스크린톤',
    icon: '🔴',
    category: 'graphic',
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크 네온',
    desc: '고대비 네온 글로우 & 사이버 미래',
    icon: '⚡',
    category: 'graphic',
  },

  // 4. 빈티지
  {
    id: 'vintage_film',
    name: '클래식 빈티지 필름',
    desc: '아날로그 필름 감성 세피아 & 비네팅 효과',
    icon: '🎞️',
    category: 'vintage',
  },
];

export interface ProcessArtStyleOptions {
  filter: FilterType;
  intensity: number; // 10 ~ 100
  brushSize: number; // 1 ~ 10
}

/**
 * Apply the selected art style filter on the canvas
 */
export function applyArtStyleFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ProcessArtStyleOptions
): void {
  const { filter, intensity, brushSize } = options;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const w = width;
  const h = height;

  switch (filter) {
    case 'pencil':
      renderPencilSketch(data, w, h, intensity, brushSize);
      break;
    case 'colored_pencil':
      renderColoredPencil(data, w, h, intensity, brushSize);
      break;
    case 'oil_painting':
      renderOilPainting(data, w, h, intensity, brushSize);
      break;
    case 'kuwahara':
      renderKuwahara(data, w, h, intensity, brushSize);
      break;
    case 'watercolor':
      renderWatercolor(data, w, h, intensity, brushSize);
      break;
    case 'sumi_e':
      renderSumiE(data, w, h, intensity, brushSize);
      break;
    case 'charcoal':
      renderCharcoal(data, w, h, intensity, brushSize);
      break;
    case 'comic':
      renderComic(data, w, h, intensity, brushSize);
      break;
    case 'halftone':
      renderHalftone(data, w, h, intensity, brushSize);
      break;
    case 'anime':
      renderAnime(data, w, h, intensity, brushSize);
      break;
    case 'pastel':
      renderPastel(data, w, h, intensity, brushSize);
      break;
    case 'vintage_film':
      renderVintageFilm(data, w, h, intensity, brushSize);
      break;
    case 'etching':
      renderEtching(data, w, h, intensity, brushSize);
      break;
    case 'cyberpunk':
      renderCyberpunk(data, w, h, intensity, brushSize);
      break;
    default:
      break;
  }

  ctx.putImageData(imgData, 0, 0);
}

// ----------------------------------------------------------------------
// 1. Pencil Sketch (Color Dodge & Contrast)
// ----------------------------------------------------------------------
function renderPencilSketch(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const total = w * h;
  const gray = new Float32Array(total);
  const invert = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    const idx = i * 4;
    const g = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    gray[i] = g;
    invert[i] = 255 - g;
  }

  const r = Math.max(1, Math.min(10, Math.round((brushSize * 2 * intensity) / 100)));
  const blurred = fastBoxBlurGrayscale(invert, w, h, r);

  const blend = intensity / 100;
  for (let i = 0; i < total; i += 1) {
    const g = gray[i];
    const b = blurred[i];
    let color = 255;
    if (b < 255) {
      color = Math.min(255, (g * 256) / (255 - b + 1));
    }
    // High contrast curve for crisp pencil graphite
    let finalVal = Math.round(color * blend + g * (1 - blend));
    if (finalVal < 120) {
      finalVal = Math.max(0, finalVal - 15);
    }
    const idx = i * 4;
    data[idx] = finalVal;
    data[idx + 1] = finalVal;
    data[idx + 2] = finalVal;
  }
}

// ----------------------------------------------------------------------
// 2. Colored Pencil (Vibrant Base + Sketch Outlines + Fine Hatch Texture)
// ----------------------------------------------------------------------
function renderColoredPencil(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 25);
  const blend = intensity / 100;
  const strokeScale = Math.max(2, brushSize);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      let r = copy[idx];
      let g = copy[idx + 1];
      let b = copy[idx + 2];

      // Boost saturation & vibrancy
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const delta = maxC - minC;
      if (maxC > 0 && delta > 10) {
        const satBoost = 1.35;
        r = Math.min(255, Math.round(minC + (r - minC) * satBoost));
        g = Math.min(255, Math.round(minC + (g - minC) * satBoost));
        b = Math.min(255, Math.round(minC + (b - minC) * satBoost));
      }

      // Colored pencil paper texture / fine diagonal stroke grain
      const strokeGrain =
        ((x + y * 2) % strokeScale === 0 ? 0.92 : 1.0) * (0.95 + 0.1 * (((x + y * 3) % 3) / 2));
      r = Math.min(255, Math.max(0, Math.round(r * strokeGrain)));
      g = Math.min(255, Math.max(0, Math.round(g * strokeGrain)));
      b = Math.min(255, Math.max(0, Math.round(b * strokeGrain)));

      // Dark colored pencil contour
      const edgeVal = edges[y * w + x];
      if (edgeVal > 30) {
        const pencilLine = 1 - (edgeVal / 255) * 0.75 * blend;
        r = Math.round(r * pencilLine);
        g = Math.round(g * pencilLine);
        b = Math.round(b * pencilLine);
      }

      data[idx] = Math.round(r * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(g * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(b * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 3. Oil Painting (Impasto Intensity-Binning Algorithm)
// ----------------------------------------------------------------------
function renderOilPainting(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const radius = Math.max(1, Math.min(7, brushSize));
  const copy = new Uint8ClampedArray(data);
  const levels = 20;
  const blend = intensity / 100;

  // Precompute pixel intensity
  const total = w * h;
  const intensityMap = new Uint8Array(total);
  for (let i = 0; i < total; i += 1) {
    const idx = i * 4;
    const lum = copy[idx] * 0.299 + copy[idx + 1] * 0.587 + copy[idx + 2] * 0.114;
    intensityMap[i] = Math.min(levels - 1, Math.floor((lum / 256) * levels));
  }

  const count = new Int32Array(levels);
  const sumR = new Float32Array(levels);
  const sumG = new Float32Array(levels);
  const sumB = new Float32Array(levels);

  for (let y = 0; y < h; y += 1) {
    const yMin = Math.max(0, y - radius);
    const yMax = Math.min(h - 1, y + radius);

    for (let x = 0; x < w; x += 1) {
      const xMin = Math.max(0, x - radius);
      const xMax = Math.min(w - 1, x + radius);

      count.fill(0);
      sumR.fill(0);
      sumG.fill(0);
      sumB.fill(0);

      for (let cy = yMin; cy <= yMax; cy += 1) {
        const rowOffset = cy * w;
        for (let cx = xMin; cx <= xMax; cx += 1) {
          const p = rowOffset + cx;
          const intLevel = intensityMap[p];
          const cIdx = p * 4;
          count[intLevel] += 1;
          sumR[intLevel] += copy[cIdx];
          sumG[intLevel] += copy[cIdx + 1];
          sumB[intLevel] += copy[cIdx + 2];
        }
      }

      let maxCount = 0;
      let maxLevel = 0;
      for (let l = 0; l < levels; l += 1) {
        if (count[l] > maxCount) {
          maxCount = count[l];
          maxLevel = l;
        }
      }

      const pIdx = (y * w + x) * 4;
      const targetR = sumR[maxLevel] / maxCount;
      const targetG = sumG[maxLevel] / maxCount;
      const targetB = sumB[maxLevel] / maxCount;

      data[pIdx] = Math.round(targetR * blend + copy[pIdx] * (1 - blend));
      data[pIdx + 1] = Math.round(targetG * blend + copy[pIdx + 1] * (1 - blend));
      data[pIdx + 2] = Math.round(targetB * blend + copy[pIdx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 4. Kuwahara Classic Oil Filter
// ----------------------------------------------------------------------
function renderKuwahara(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const radius = Math.max(1, Math.min(7, brushSize));
  const copy = new Uint8ClampedArray(data);
  const blend = intensity / 100;

  for (let y = radius; y < h - radius; y += 1) {
    for (let x = radius; x < w - radius; x += 1) {
      const sectors = [
        { x1: x - radius, x2: x, y1: y - radius, y2: y },
        { x1: x, x2: x + radius, y1: y - radius, y2: y },
        { x1: x - radius, x2: x, y1: y, y2: y + radius },
        { x1: x, x2: x + radius, y1: y, y2: y + radius },
      ];

      let minVar = Infinity;
      let bestAvg = [0, 0, 0];

      for (let s = 0; s < 4; s += 1) {
        const sec = sectors[s];
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumSqR = 0;
        let sumSqG = 0;
        let sumSqB = 0;
        let count = 0;

        for (let sy = sec.y1; sy <= sec.y2; sy += 1) {
          const rowOffset = sy * w;
          for (let sx = sec.x1; sx <= sec.x2; sx += 1) {
            const idx = (rowOffset + sx) * 4;
            const cr = copy[idx];
            const cg = copy[idx + 1];
            const cb = copy[idx + 2];
            sumR += cr;
            sumG += cg;
            sumB += cb;
            sumSqR += cr * cr;
            sumSqG += cg * cg;
            sumSqB += cb * cb;
            count += 1;
          }
        }

        const meanR = sumR / count;
        const meanG = sumG / count;
        const meanB = sumB / count;
        const variance =
          sumSqR / count -
          meanR * meanR +
          (sumSqG / count - meanG * meanG) +
          (sumSqB / count - meanB * meanB);

        if (variance < minVar) {
          minVar = variance;
          bestAvg = [meanR, meanG, meanB];
        }
      }

      const pIdx = (y * w + x) * 4;
      data[pIdx] = Math.round(bestAvg[0] * blend + copy[pIdx] * (1 - blend));
      data[pIdx + 1] = Math.round(bestAvg[1] * blend + copy[pIdx + 1] * (1 - blend));
      data[pIdx + 2] = Math.round(bestAvg[2] * blend + copy[pIdx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 5. Watercolor Wash (Soft Pigment Diffusion & Wet Edge Pooling)
// ----------------------------------------------------------------------
function renderWatercolor(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 20);
  const r = Math.max(1, Math.min(6, brushSize));
  const blend = intensity / 100;

  for (let y = 0; y < h; y += 1) {
    const yMin = Math.max(0, y - r);
    const yMax = Math.min(h - 1, y + r);

    for (let x = 0; x < w; x += 1) {
      const xMin = Math.max(0, x - r);
      const xMax = Math.min(w - 1, x + r);

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let count = 0;

      for (let cy = yMin; cy <= yMax; cy += 1) {
        const rowOffset = cy * w;
        for (let cx = xMin; cx <= xMax; cx += 1) {
          const idx = (rowOffset + cx) * 4;
          sumR += copy[idx];
          sumG += copy[idx + 1];
          sumB += copy[idx + 2];
          count += 1;
        }
      }

      let meanR = (sumR / count) * 1.12;
      let meanG = (sumG / count) * 1.12;
      let meanB = (sumB / count) * 1.12;

      // Wet edge pigment pooling effect
      const edgeVal = edges[y * w + x];
      if (edgeVal > 25) {
        const darkFactor = 1 - (edgeVal / 255) * 0.35;
        meanR *= darkFactor;
        meanG *= darkFactor;
        meanB *= darkFactor;
      }

      // Translucent watercolor paper texture
      const paperTone = 0.97 + 0.06 * (((x * 13 + y * 7) % 19) / 19);
      meanR = Math.min(255, Math.max(0, meanR * paperTone));
      meanG = Math.min(255, Math.max(0, meanG * paperTone));
      meanB = Math.min(255, Math.max(0, meanB * paperTone));

      const pIdx = (y * w + x) * 4;
      data[pIdx] = Math.round(meanR * blend + copy[pIdx] * (1 - blend));
      data[pIdx + 1] = Math.round(meanG * blend + copy[pIdx + 1] * (1 - blend));
      data[pIdx + 2] = Math.round(meanB * blend + copy[pIdx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 6. Sumi-e Traditional Ink Wash (수묵화 / 동양화)
// ----------------------------------------------------------------------
function renderSumiE(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 28);
  const blend = intensity / 100;
  const strokeThick = Math.max(1, Math.round(brushSize / 2));

  // Hanji (korean paper) warm base color: [248, 243, 230]
  const paperR = 248;
  const paperG = 243;
  const paperB = 230;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const lum = copy[idx] * 0.299 + copy[idx + 1] * 0.587 + copy[idx + 2] * 0.114;

      // Sumi-e Tone Curve: Deep black ink for darks, soft ink wash for mids, hanji paper for lights
      let inkLevel: number;
      if (lum < 60) {
        // Deep solid calligraphy ink
        inkLevel = 15;
      } else if (lum < 150) {
        // Diluted gray ink wash
        inkLevel = 50 + (lum - 60) * 1.2;
      } else {
        // Warm rice paper highlight
        inkLevel = 210 + (lum - 150) * 0.45;
      }

      // Check for calligraphic edge lines
      let isBrushEdge = false;
      for (let dy = -strokeThick; dy <= strokeThick; dy += 1) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          for (let dx = -strokeThick; dx <= strokeThick; dx += 1) {
            const nx = x + dx;
            if (nx >= 0 && nx < w && edges[ny * w + nx] > 40) {
              isBrushEdge = true;
              break;
            }
          }
        }
        if (isBrushEdge) break;
      }

      if (isBrushEdge) {
        inkLevel = Math.min(inkLevel, 20);
      }

      // Tint with warm antique Hanji paper
      const toneRatio = inkLevel / 255;
      const outR = Math.min(255, Math.round(paperR * toneRatio));
      const outG = Math.min(255, Math.round(paperG * toneRatio));
      const outB = Math.min(255, Math.round(paperB * toneRatio));

      data[idx] = Math.round(outR * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(outG * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(outB * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 7. Charcoal Sketch & Smudge (목탄화 / 크로키)
// ----------------------------------------------------------------------
function renderCharcoal(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const total = w * h;
  const gray = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    const idx = i * 4;
    gray[i] = copy[idx] * 0.299 + copy[idx + 1] * 0.587 + copy[idx + 2] * 0.114;
  }

  // Smudge pass along diagonal/horizontal angle
  const smudgeRadius = Math.max(1, Math.min(5, Math.round(brushSize / 2)));
  const smudged = new Float32Array(total);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      let count = 0;
      for (let d = -smudgeRadius; d <= smudgeRadius; d += 1) {
        const nx = x + d;
        const ny = y + Math.round(d * 0.5);
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          sum += gray[ny * w + nx];
          count += 1;
        }
      }
      smudged[y * w + x] = sum / count;
    }
  }

  const blend = intensity / 100;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const g = smudged[y * w + x];

      // Charcoal contrast curve with rich carbon blacks
      let c = g < 90 ? Math.pow(g / 90, 1.4) * 50 : 50 + (g - 90) * 1.25;

      // Heavy tooth grain texture of charcoal paper
      const grain = 1.0 + ((Math.sin(x * 0.8) * Math.cos(y * 0.8) * 45) % 25) / 255;
      c = Math.min(255, Math.max(0, Math.round(c * grain)));

      data[idx] = Math.round(c * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(c * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(c * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 8. Comic Pop-Art (Posterization & Bold Outlines)
// ----------------------------------------------------------------------
function renderComic(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 30);
  const levels = 5;
  const quant = (v: number) => Math.round(Math.round((v / 255) * levels) * (255 / levels));
  const blend = intensity / 100;
  const lineWeight = Math.max(1, Math.round(brushSize / 2));

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;

      let isEdge = false;
      for (let dy = -lineWeight; dy <= lineWeight; dy += 1) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          for (let dx = -lineWeight; dx <= lineWeight; dx += 1) {
            const nx = x + dx;
            if (nx >= 0 && nx < w && edges[ny * w + nx] > 35) {
              isEdge = true;
              break;
            }
          }
        }
        if (isEdge) break;
      }

      let outR: number;
      let outG: number;
      let outB: number;

      if (isEdge) {
        outR = 20;
        outG = 20;
        outB = 20;
      } else {
        outR = quant(copy[idx]);
        outG = quant(copy[idx + 1]);
        outB = quant(copy[idx + 2]);
      }

      data[idx] = Math.round(outR * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(outG * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(outB * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 9. Halftone Ben-Day Dots Pop Art
// ----------------------------------------------------------------------
function renderHalftone(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 30);
  const spacing = Math.max(4, Math.min(14, brushSize * 2));
  const blend = intensity / 100;

  // First copy quantized colors
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.round(copy[i] * 1.15));
    data[i + 1] = Math.min(255, Math.round(copy[i + 1] * 1.15));
    data[i + 2] = Math.min(255, Math.round(copy[i + 2] * 1.15));
  }

  // Draw halftone dot matrix
  const maxR = (spacing / 2) * 1.1;
  for (let gy = 0; gy < h; gy += spacing) {
    for (let gx = 0; gx < w; gx += spacing) {
      const cy = Math.min(h - 1, gy + Math.floor(spacing / 2));
      const cx = Math.min(w - 1, gx + Math.floor(spacing / 2));
      const centerIdx = (cy * w + cx) * 4;

      const lum =
        copy[centerIdx] * 0.299 + copy[centerIdx + 1] * 0.587 + copy[centerIdx + 2] * 0.114;
      const dotRadius = (1 - lum / 255) * maxR;

      if (dotRadius > 0.8) {
        const dotR2 = dotRadius * dotRadius;
        for (let py = Math.max(0, cy - spacing); py <= Math.min(h - 1, cy + spacing); py += 1) {
          const dy = py - cy;
          for (let px = Math.max(0, cx - spacing); px <= Math.min(w - 1, cx + spacing); px += 1) {
            const dx = px - cx;
            if (dx * dx + dy * dy <= dotR2) {
              const pIdx = (py * w + px) * 4;
              // Dark dot overlay
              data[pIdx] = Math.round(data[pIdx] * 0.35);
              data[pIdx + 1] = Math.round(data[pIdx + 1] * 0.35);
              data[pIdx + 2] = Math.round(data[pIdx + 2] * 0.35);
            }
          }
        }
      }
    }
  }

  // Overlay comic outlines
  for (let i = 0; i < w * h; i += 1) {
    if (edges[i] > 35) {
      const idx = i * 4;
      data[idx] = 15;
      data[idx + 1] = 15;
      data[idx + 1] = 15;
    }
  }

  // Blend with original
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * blend + copy[i] * (1 - blend));
    data[i + 1] = Math.round(data[i + 1] * blend + copy[i + 1] * (1 - blend));
    data[i + 2] = Math.round(data[i + 2] * blend + copy[i + 2] * (1 - blend));
  }
}

// ----------------------------------------------------------------------
// 10. Anime / Ghibli Cel-Shading Look
// ----------------------------------------------------------------------
function renderAnime(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 32);
  const blend = intensity / 100;
  const r = Math.max(1, Math.min(4, Math.round(brushSize / 2)));

  for (let y = 0; y < h; y += 1) {
    const yMin = Math.max(0, y - r);
    const yMax = Math.min(h - 1, y + r);

    for (let x = 0; x < w; x += 1) {
      const xMin = Math.max(0, x - r);
      const xMax = Math.min(w - 1, x + r);

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let count = 0;

      for (let cy = yMin; cy <= yMax; cy += 1) {
        const rowOffset = cy * w;
        for (let cx = xMin; cx <= xMax; cx += 1) {
          const idx = (rowOffset + cx) * 4;
          sumR += copy[idx];
          sumG += copy[idx + 1];
          sumB += copy[idx + 2];
          count += 1;
        }
      }

      let cr = sumR / count;
      let cg = sumG / count;
      let cb = sumB / count;

      // Anime Cel-Shading: 3-step quantization
      const quant = (val: number) => {
        if (val < 85) return Math.min(255, val * 0.9);
        if (val < 175) return Math.min(255, val * 1.05 + 10);
        return Math.min(255, val * 1.1 + 15);
      };

      cr = quant(cr);
      cg = quant(cg);
      cb = quant(cb);

      // Warm sunny highlights and vibrant sky tones
      cr = Math.min(255, cr * 1.08);
      cg = Math.min(255, cg * 1.06);
      cb = Math.min(255, cb * 1.02);

      // Clean delicate dark outlines
      const edgeVal = edges[y * w + x];
      if (edgeVal > 30) {
        const darkFactor = 1 - (edgeVal / 255) * 0.7;
        cr *= darkFactor;
        cg *= darkFactor;
        cb *= darkFactor;
      }

      const pIdx = (y * w + x) * 4;
      data[pIdx] = Math.round(cr * blend + copy[pIdx] * (1 - blend));
      data[pIdx + 1] = Math.round(cg * blend + copy[pIdx + 1] * (1 - blend));
      data[pIdx + 2] = Math.round(cb * blend + copy[pIdx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 11. Soft Pastel & Gouache (Velvet Bloom & Chalk)
// ----------------------------------------------------------------------
function renderPastel(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(2, Math.min(6, brushSize));
  const blend = intensity / 100;

  for (let y = 0; y < h; y += 1) {
    const yMin = Math.max(0, y - r);
    const yMax = Math.min(h - 1, y + r);

    for (let x = 0; x < w; x += 1) {
      const xMin = Math.max(0, x - r);
      const xMax = Math.min(w - 1, x + r);

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let count = 0;

      for (let cy = yMin; cy <= yMax; cy += 1) {
        const rowOffset = cy * w;
        for (let cx = xMin; cx <= xMax; cx += 1) {
          const idx = (rowOffset + cx) * 4;
          sumR += copy[idx];
          sumG += copy[idx + 1];
          sumB += copy[idx + 2];
          count += 1;
        }
      }

      let meanR = sumR / count;
      let meanG = sumG / count;
      let meanB = sumB / count;

      // Pastel lift: soften deep shadows, elevate into warm velvet tones
      meanR = Math.min(255, 35 + meanR * 0.88);
      meanG = Math.min(255, 30 + meanG * 0.88);
      meanB = Math.min(255, 40 + meanB * 0.88);

      // Fine chalk dust texture
      const chalkGrain = 0.96 + 0.08 * (((x * 17 + y * 23) % 31) / 31);
      meanR = Math.min(255, meanR * chalkGrain);
      meanG = Math.min(255, meanG * chalkGrain);
      meanB = Math.min(255, meanB * chalkGrain);

      const pIdx = (y * w + x) * 4;
      data[pIdx] = Math.round(meanR * blend + copy[pIdx] * (1 - blend));
      data[pIdx + 1] = Math.round(meanG * blend + copy[pIdx + 1] * (1 - blend));
      data[pIdx + 2] = Math.round(meanB * blend + copy[pIdx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 12. Classic Vintage Film & Sepia Vignette
// ----------------------------------------------------------------------
function renderVintageFilm(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const blend = intensity / 100;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < h; y += 1) {
    const dy = y - centerY;
    for (let x = 0; x < w; x += 1) {
      const dx = x - centerX;
      const idx = (y * w + x) * 4;

      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      // Sepia Matrix Transform
      let tr = r * 0.393 + g * 0.769 + b * 0.189;
      let tg = r * 0.349 + g * 0.686 + b * 0.168;
      let tb = r * 0.272 + g * 0.534 + b * 0.131;

      // Matte Black Lift (Analog Film tone)
      tr = 20 + tr * 0.92;
      tg = 18 + tg * 0.9;
      tb = 12 + tb * 0.85;

      // Radial Vignette
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vignette = 1 - Math.pow(dist / maxDist, 1.8) * 0.45;
      tr *= vignette;
      tg *= vignette;
      tb *= vignette;

      // Subtle Analog Film Grain
      const grain = 1.0 + ((Math.sin(x * 1.3) * Math.cos(y * 1.7) * 100) % 18) / 255;
      tr = Math.min(255, Math.max(0, tr * grain));
      tg = Math.min(255, Math.max(0, tg * grain));
      tb = Math.min(255, Math.max(0, tb * grain));

      data[idx] = Math.round(tr * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(tg * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(tb * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 13. Antique Etching & Crosshatching (판화 / 펜화)
// ----------------------------------------------------------------------
function renderEtching(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const blend = intensity / 100;
  const spacing = Math.max(4, Math.min(10, brushSize + 2));

  // Antique aged parchment color: [247, 242, 230]
  const paperR = 247;
  const paperG = 242;
  const paperB = 230;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const lum = copy[idx] * 0.299 + copy[idx + 1] * 0.587 + copy[idx + 2] * 0.114;

      let isInk = false;
      if (lum < 50) {
        // Deep shadow: heavy solid ink
        isInk = true;
      } else if (lum < 95) {
        // Dark: crosshatch + vertical & horizontal
        isInk =
          (x + y) % spacing === 0 ||
          (x - y) % spacing === 0 ||
          x % spacing === 0 ||
          y % spacing === 0;
      } else if (lum < 145) {
        // Mid-dark: double diagonal crosshatch
        isInk = (x + y) % spacing === 0 || (x - y) % spacing === 0;
      } else if (lum < 200) {
        // Light-mid: single diagonal line
        isInk = (x + y) % spacing === 0;
      } else {
        // Highlight: clear paper
        isInk = false;
      }

      let outR: number;
      let outG: number;
      let outB: number;

      if (isInk) {
        outR = 25;
        outG = 20;
        outB = 18;
      } else {
        outR = paperR;
        outG = paperG;
        outB = paperB;
      }

      data[idx] = Math.round(outR * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(outG * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(outB * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// 14. Cyberpunk Neon Glow
// ----------------------------------------------------------------------
function renderCyberpunk(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number,
  brushSize: number
): void {
  const copy = new Uint8ClampedArray(data);
  const edges = detectEdges(copy, w, h, 25);
  const blend = intensity / 100;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      // Cyberpunk Split Toning: Electric Cyan shadows & Neon Magenta highlights
      let nr = Math.min(255, r * 1.35 + b * 0.3);
      let ng = Math.min(255, g * 0.55 + b * 0.25);
      let nb = Math.min(255, b * 1.55 + r * 0.4);

      // Contrast amplification
      nr = nr > 128 ? Math.min(255, nr * 1.15) : nr * 0.85;
      ng = ng > 128 ? Math.min(255, ng * 1.1) : ng * 0.8;
      nb = nb > 128 ? Math.min(255, nb * 1.2) : nb * 0.85;

      // Neon edge glow
      const edgeVal = edges[y * w + x];
      if (edgeVal > 30) {
        nr = Math.min(255, nr + 70);
        nb = Math.min(255, nb + 80);
      }

      data[idx] = Math.round(nr * blend + copy[idx] * (1 - blend));
      data[idx + 1] = Math.round(ng * blend + copy[idx + 1] * (1 - blend));
      data[idx + 2] = Math.round(nb * blend + copy[idx + 2] * (1 - blend));
    }
  }
}

// ----------------------------------------------------------------------
// Fast Utilities (Grayscale Blur & Sobel Edge Detection)
// ----------------------------------------------------------------------
function fastBoxBlurGrayscale(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const dst = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      let count = 0;
      for (let dy = -r; dy <= r; dy += 1) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          for (let dx = -r; dx <= r; dx += 1) {
            const nx = x + dx;
            if (nx >= 0 && nx < w) {
              sum += src[ny * w + nx];
              count += 1;
            }
          }
        }
      }
      dst[y * w + x] = sum / count;
    }
  }
  return dst;
}

function detectEdges(data: Uint8ClampedArray, w: number, h: number, threshold: number): Uint8Array {
  const edges = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y += 1) {
    const rowOffset = y * w;
    const nextRow = (y + 1) * w;

    for (let x = 1; x < w - 1; x += 1) {
      const idx = (rowOffset + x) * 4;
      const rightIdx = (rowOffset + x + 1) * 4;
      const downIdx = (nextRow + x) * 4;

      const diffR = Math.abs(data[idx] - data[rightIdx]) + Math.abs(data[idx] - data[downIdx]);
      const diffG =
        Math.abs(data[idx + 1] - data[rightIdx + 1]) + Math.abs(data[idx + 1] - data[downIdx + 1]);
      const diffB =
        Math.abs(data[idx + 2] - data[rightIdx + 2]) + Math.abs(data[idx + 2] - data[downIdx + 2]);

      const diff = diffR + diffG + diffB;
      edges[rowOffset + x] = diff > threshold * 3 ? Math.min(255, Math.round(diff / 3)) : 0;
    }
  }
  return edges;
}
