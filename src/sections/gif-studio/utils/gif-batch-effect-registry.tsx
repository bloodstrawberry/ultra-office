'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  drawWatermark,
  type PositionPreset,
  type WatermarkRenderOptions,
} from 'src/sections/photo/utils/ai-watermark-processor';
import {
  MEME_EFFECTS,
  renderMemePhoto,
  type MemeLabConfig,
  type MemeEffectType,
} from 'src/sections/photo/utils/meme-processor';
import {
  SCAN_PRESETS,
  type ScanConfig,
  renderScanEffect,
  type ScanPresetType,
} from 'src/sections/photo/utils/scanner-processor';
// Processors
import {
  ART_FILTERS,
  type FilterType,
  applyArtStyleFilter,
  type ArtStyleOption,
} from 'src/sections/photo/utils/art-style-processor';
import {
  applyBlurRegion,
  applyPixelateRegion,
  detectFacesInCanvas,
  applySolidColorRegion,
} from 'src/sections/photo/utils/mosaic-processor';
import {
  WEATHERING_PRESETS,
  renderWeatheringPhoto,
  type WeatheringConfig,
  type WeatheringPreset,
} from 'src/sections/photo/utils/weathering-processor';
import {
  loadImage,
  cropAndResizeLogo,
  applyPaddingToCanvas,
  cropAndResizeThumbnail,
  toggleWhiteAndTransparent,
} from 'src/sections/photo/utils/image-processor';

// ----------------------------------------------------------------------
// Core Types
// ----------------------------------------------------------------------

export type EffectCategory = 'appsInToss' | 'photoFilter' | 'photoStudio';

export interface GifBatchEffectDefinition<TOptions = any> {
  id: string;
  category: EffectCategory;
  categoryName: string;
  name: string;
  badge?: string;
  description: string;
  icon: string;
  defaultOptions: TOptions;
  renderSettings?: (props: {
    options: TOptions;
    onChange: (newOptions: TOptions) => void;
    previewFrameUrl?: string;
  }) => React.ReactNode;
  apply: (
    sourceDataUrl: string,
    options: TOptions,
    frameIndex: number,
    totalFrames: number
  ) => Promise<string>;
}

// ----------------------------------------------------------------------
// Category 1: Apps in Toss (앱인토스)
// ----------------------------------------------------------------------

// 1.1 Logo Maker (로고 만들기)
export interface LogoOptions {
  aspectRatio: '1:1' | '16:9' | '4:3';
  targetWidth: number;
  targetHeight: number;
}

const logoEffect: GifBatchEffectDefinition<LogoOptions> = {
  id: 'apps_logo',
  category: 'appsInToss',
  categoryName: '앱인토스',
  name: '로고 만들기 (규격화)',
  badge: '앱인토스',
  description: '1:1 정사각형 또는 16:9 규격에 맞춰 비율을 정렬하고 리사이즈합니다.',
  icon: '🔲',
  defaultOptions: {
    aspectRatio: '1:1',
    targetWidth: 512,
    targetHeight: 512,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>화면 비율</InputLabel>
        <Select
          value={options.aspectRatio}
          label="화면 비율"
          onChange={(e) => {
            const val = e.target.value as LogoOptions['aspectRatio'];
            let w = 512;
            let h = 512;
            if (val === '16:9') {
              w = 960;
              h = 540;
            } else if (val === '4:3') {
              w = 640;
              h = 480;
            }
            onChange({ ...options, aspectRatio: val, targetWidth: w, targetHeight: h });
          }}
        >
          <MenuItem value="1:1">1:1 정사각형 (512×512)</MenuItem>
          <MenuItem value="16:9">16:9 와이드 (960×540)</MenuItem>
          <MenuItem value="4:3">4:3 표준 (640×480)</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          size="small"
          label="너비 (Width)"
          type="number"
          value={options.targetWidth}
          onChange={(e) => onChange({ ...options, targetWidth: Number(e.target.value) || 512 })}
        />
        <TextField
          size="small"
          label="높이 (Height)"
          type="number"
          value={options.targetHeight}
          onChange={(e) => onChange({ ...options, targetHeight: Number(e.target.value) || 512 })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    return cropAndResizeLogo(
      src,
      { x: 0, y: 0, width: w, height: h },
      opt.targetWidth,
      opt.targetHeight
    );
  },
};

// 1.2 Background Color & Padding (배경색 변경 및 패딩 확장)
export interface BgColorOptions {
  padding: number;
  bgType: 'solid' | 'transparent' | 'blur';
  bgColor: string;
  toggleWhite: boolean;
}

const bgColorEffect: GifBatchEffectDefinition<BgColorOptions> = {
  id: 'apps_bgcolor',
  category: 'appsInToss',
  categoryName: '앱인토스',
  name: '배경색 변경 & 패딩 확장',
  badge: '배경/여백',
  description: '외곽 여백(패딩)을 추가하고 배경을 단색, 투명 또는 블러 처리합니다.',
  icon: '🎨',
  defaultOptions: {
    padding: 20,
    bgType: 'solid',
    bgColor: '#ffffff',
    toggleWhite: false,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            외곽 패딩 (여백 크기)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.padding}px
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={100}
          value={options.padding}
          onChange={(_, v) => onChange({ ...options, padding: v as number })}
        />
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel>배경 스타일</InputLabel>
        <Select
          value={options.bgType}
          label="배경 스타일"
          onChange={(e) =>
            onChange({ ...options, bgType: e.target.value as 'solid' | 'transparent' | 'blur' })
          }
        >
          <MenuItem value="solid">단색 배경</MenuItem>
          <MenuItem value="transparent">투명 배경</MenuItem>
          <MenuItem value="blur">원화 블러 배경</MenuItem>
        </Select>
      </FormControl>

      {options.bgType === 'solid' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            배경 색상
          </Typography>
          <input
            type="color"
            value={options.bgColor}
            onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
            style={{ width: 44, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
          />
        </Box>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={options.toggleWhite}
            onChange={(e) => onChange({ ...options, toggleWhite: e.target.checked })}
          />
        }
        label={<Typography variant="body2">흰색 ↔ 투명 전환 적용</Typography>}
      />
    </Box>
  ),
  apply: async (src, opt) => {
    let currentSrc = src;
    if (opt.toggleWhite) {
      currentSrc = await toggleWhiteAndTransparent(currentSrc);
    }
    if (opt.padding <= 0 && opt.bgType === 'transparent') {
      return currentSrc;
    }

    const img = await loadImage(currentSrc);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return currentSrc;

    ctx.drawImage(img, 0, 0);

    applyPaddingToCanvas(canvas, {
      top: opt.padding,
      bottom: opt.padding,
      left: opt.padding,
      right: opt.padding,
      bgType: opt.bgType as any,
      solidColor: opt.bgColor,
    });

    return canvas.toDataURL('image/png');
  },
};

// 1.3 Vertical Screenshot (세로 스크린샷 규격)
export interface SeroOptions {
  width: number;
  height: number;
}

const seroEffect: GifBatchEffectDefinition<SeroOptions> = {
  id: 'apps_sero',
  category: 'appsInToss',
  categoryName: '앱인토스',
  name: '세로 스크린샷 (모바일 규격)',
  badge: '스마트폰',
  description: '636×1048 등 스마트폰 모바일 화면 세로 비율에 맞게 일괄 크롭/리사이즈합니다.',
  icon: '📱',
  defaultOptions: {
    width: 636,
    height: 1048,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          size="small"
          label="너비 (Width)"
          type="number"
          value={options.width}
          onChange={(e) => onChange({ ...options, width: Number(e.target.value) || 636 })}
        />
        <TextField
          size="small"
          label="높이 (Height)"
          type="number"
          value={options.height}
          onChange={(e) => onChange({ ...options, height: Number(e.target.value) || 1048 })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) =>
    cropAndResizeThumbnail(src, opt.width, {
      width: opt.width,
      height: opt.height,
      x: 0,
      y: 0,
    }),
};

// 1.4 Garo Screenshot (가로 스크린샷 규격)
export interface GaroOptions {
  width: number;
  height: number;
}

const garoEffect: GifBatchEffectDefinition<GaroOptions> = {
  id: 'apps_garo',
  category: 'appsInToss',
  categoryName: '앱인토스',
  name: '가로 스크린샷 (태블릿/PC 규격)',
  badge: '와이드',
  description: '1504×741 등 태블릿/PC 가로 비율에 맞게 일괄 크롭/리사이즈합니다.',
  icon: '💻',
  defaultOptions: {
    width: 1504,
    height: 741,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          size="small"
          label="너비 (Width)"
          type="number"
          value={options.width}
          onChange={(e) => onChange({ ...options, width: Number(e.target.value) || 1504 })}
        />
        <TextField
          size="small"
          label="높이 (Height)"
          type="number"
          value={options.height}
          onChange={(e) => onChange({ ...options, height: Number(e.target.value) || 741 })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) =>
    cropAndResizeThumbnail(src, opt.width, {
      width: opt.width,
      height: opt.height,
      x: 0,
      y: 0,
    }),
};

// ----------------------------------------------------------------------
// Category 2: Photo Filters & FX (사진 필터 및 효과)
// ----------------------------------------------------------------------

// 2.1 Art Style (화풍 변환 14종)
export interface ArtStyleOptions {
  filter: FilterType;
  intensity: number;
  brushSize: number;
}

const artStyleEffect: GifBatchEffectDefinition<ArtStyleOptions> = {
  id: 'filter_art_style',
  category: 'photoFilter',
  categoryName: '사진 필터 및 효과',
  name: '화풍 변환 (14종 아트 스타일)',
  badge: '화풍 필터',
  description: '수채화, 유화, 스케치, 애니메이션, 도트, 판화 등 14가지 예술적 화풍을 적용합니다.',
  icon: '🎨',
  defaultOptions: {
    filter: 'watercolor',
    intensity: 80,
    brushSize: 5,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>화풍 스타일</InputLabel>
        <Select
          value={options.filter}
          label="화풍 스타일"
          onChange={(e) => onChange({ ...options, filter: e.target.value as FilterType })}
        >
          {ART_FILTERS.map((st: ArtStyleOption) => (
            <MenuItem key={st.id} value={st.id}>
              {st.name} ({st.category})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            화풍 강도 (Intensity)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.intensity}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={10}
          max={100}
          value={options.intensity}
          onChange={(_, v) => onChange({ ...options, intensity: v as number })}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            브러시/디테일 크기
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.brushSize}
          </Typography>
        </Box>
        <Slider
          size="small"
          min={1}
          max={10}
          value={options.brushSize}
          onChange={(_, v) => onChange({ ...options, brushSize: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    applyArtStyleFilter(ctx, canvas.width, canvas.height, {
      filter: opt.filter,
      intensity: opt.intensity,
      brushSize: opt.brushSize,
    });
    return canvas.toDataURL('image/png');
  },
};

// 2.2 Pixel Art (픽셀 아트)
export interface PixelArtOptions {
  pixelSize: number;
  palette: 'original' | 'gameboy' | 'nes' | 'cyberpunk' | 'mono' | 'sepia';
  showGrid: boolean;
}

const PALETTES = {
  gameboy: [
    [15, 56, 15],
    [48, 98, 48],
    [139, 172, 15],
    [155, 188, 15],
  ],
  nes: [
    [0, 0, 0],
    [252, 252, 252],
    [248, 56, 0],
    [0, 168, 0],
    [0, 120, 248],
    [248, 184, 0],
  ],
  cyberpunk: [
    [10, 10, 30],
    [255, 0, 128],
    [0, 255, 255],
    [255, 255, 0],
    [128, 0, 255],
  ],
  mono: [
    [0, 0, 0],
    [255, 255, 255],
  ],
  sepia: [
    [44, 28, 17],
    [112, 79, 56],
    [184, 146, 114],
    [237, 218, 196],
  ],
};

const pixelArtEffect: GifBatchEffectDefinition<PixelArtOptions> = {
  id: 'filter_pixel_art',
  category: 'photoFilter',
  categoryName: '사진 필터 및 효과',
  name: '픽셀 아트 (레트로 8비트)',
  badge: '픽셀 도트',
  description: '게임보이, 패미컴(NES), 사이버펑크 등 레트로 픽셀 도트로 변환합니다.',
  icon: '👾',
  defaultOptions: {
    pixelSize: 8,
    palette: 'original',
    showGrid: false,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            픽셀 크기 (도트 굵기)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.pixelSize}px
          </Typography>
        </Box>
        <Slider
          size="small"
          min={2}
          max={32}
          value={options.pixelSize}
          onChange={(_, v) => onChange({ ...options, pixelSize: v as number })}
        />
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel>색상 팔레트</InputLabel>
        <Select
          value={options.palette}
          label="색상 팔레트"
          onChange={(e) =>
            onChange({ ...options, palette: e.target.value as PixelArtOptions['palette'] })
          }
        >
          <MenuItem value="original">원본 색상 유지</MenuItem>
          <MenuItem value="gameboy">게임보이 (초록 4단계)</MenuItem>
          <MenuItem value="nes">NES 패미컴 8-Bit</MenuItem>
          <MenuItem value="cyberpunk">사이버펑크 네온</MenuItem>
          <MenuItem value="mono">1비트 흑백 모노</MenuItem>
          <MenuItem value="sepia">빈티지 세피아</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={options.showGrid}
            onChange={(e) => onChange({ ...options, showGrid: e.target.checked })}
          />
        }
        label={<Typography variant="body2">픽셀 그리드 격자 표시</Typography>}
      />
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const pSize = Math.max(2, opt.pixelSize);
    const smallW = Math.max(1, Math.floor(w / pSize));
    const smallH = Math.max(1, Math.floor(h / pSize));

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;
    const smallCtx = smallCanvas.getContext('2d');
    if (!smallCtx) return src;

    smallCtx.drawImage(img, 0, 0, smallW, smallH);
    const imgData = smallCtx.getImageData(0, 0, smallW, smallH);
    const data = imgData.data;

    if (opt.palette !== 'original' && PALETTES[opt.palette]) {
      const pal = PALETTES[opt.palette];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let bestDist = Infinity;
        let bestColor = pal[0];
        for (const [pr, pg, pb] of pal) {
          const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
          if (dist < bestDist) {
            bestDist = dist;
            bestColor = [pr, pg, pb];
          }
        }
        data[i] = bestColor[0];
        data[i + 1] = bestColor[1];
        data[i + 2] = bestColor[2];
      }
      smallCtx.putImageData(imgData, 0, 0);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(smallCanvas, 0, 0, smallW, smallH, 0, 0, w, h);

    if (opt.showGrid) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += pSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += pSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    return canvas.toDataURL('image/png');
  },
};

// 2.3 Glitch FX (글리치 아트)
export interface GlitchOptions {
  rgbShift: number;
  sliceCount: number;
  noiseAmount: number;
  scanlines: boolean;
}

const glitchEffect: GifBatchEffectDefinition<GlitchOptions> = {
  id: 'filter_glitch',
  category: 'photoFilter',
  categoryName: '사진 필터 및 효과',
  name: '글리치 효과 (Glitch FX)',
  badge: '사이버 왜곡',
  description: 'RGB 색수차 분리, 슬라이스 찢김, CRT 스캔라인 및 아날로그 노이즈를 조합합니다.',
  icon: '⚡',
  defaultOptions: {
    rgbShift: 15,
    sliceCount: 8,
    noiseAmount: 20,
    scanlines: true,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            RGB 색수차 분리 (Shift)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.rgbShift}px
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={40}
          value={options.rgbShift}
          onChange={(_, v) => onChange({ ...options, rgbShift: v as number })}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            가로 슬라이스 찢어짐 (Slices)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.sliceCount}개
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={25}
          value={options.sliceCount}
          onChange={(_, v) => onChange({ ...options, sliceCount: v as number })}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            노이즈 강도 (Noise)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.noiseAmount}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={50}
          value={options.noiseAmount}
          onChange={(_, v) => onChange({ ...options, noiseAmount: v as number })}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={options.scanlines}
            onChange={(e) => onChange({ ...options, scanlines: e.target.checked })}
          />
        }
        label={<Typography variant="body2">CRT 아날로그 스캔라인</Typography>}
      />
    </Box>
  ),
  apply: async (src, opt, frameIndex) => {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.drawImage(img, 0, 0, w, h);

    // 1. RGB Channel Shift
    if (opt.rgbShift > 0) {
      const origData = ctx.getImageData(0, 0, w, h);
      const data = origData.data;
      const copy = new Uint8ClampedArray(data);
      const offsetR = Math.round(opt.rgbShift);
      const offsetB = -Math.round(opt.rgbShift * 0.8);

      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const idx = (y * w + x) * 4;
          const rx = Math.min(w - 1, Math.max(0, x + offsetR));
          const rIdx = (y * w + rx) * 4;
          data[idx] = copy[rIdx];

          const bx = Math.min(w - 1, Math.max(0, x + offsetB));
          const bIdx = (y * w + bx) * 4;
          data[idx + 2] = copy[bIdx + 2];
        }
      }
      ctx.putImageData(origData, 0, 0);
    }

    // 2. Horizontal Slices
    if (opt.sliceCount > 0) {
      let pseudoRand = (frameIndex + 1) * 7919;
      const getRand = () => {
        pseudoRand = (pseudoRand * 9301 + 49297) % 233280;
        return pseudoRand / 233280;
      };

      for (let i = 0; i < opt.sliceCount; i += 1) {
        const sliceY = Math.floor(getRand() * h);
        const sliceH = Math.max(2, Math.floor(getRand() * 25));
        const maxOffset = Math.floor((opt.rgbShift + 10) * 1.2);
        const sliceOffsetX = Math.floor((getRand() - 0.5) * maxOffset * 2);

        if (sliceY + sliceH <= h) {
          const sliceImgData = ctx.getImageData(0, sliceY, w, sliceH);
          ctx.putImageData(sliceImgData, sliceOffsetX, sliceY);
        }
      }
    }

    // 3. Scanlines
    if (opt.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1.5);
      }
    }

    // 4. Noise
    if (opt.noiseAmount > 0) {
      const noiseData = ctx.getImageData(0, 0, w, h);
      const nData = noiseData.data;
      const factor = opt.noiseAmount * 0.5;

      for (let i = 0; i < nData.length; i += 4) {
        if (Math.random() < 0.15) {
          const noise = (Math.random() - 0.5) * factor * 2;
          nData[i] = Math.min(255, Math.max(0, nData[i] + noise));
          nData[i + 1] = Math.min(255, Math.max(0, nData[i + 1] + noise));
          nData[i + 2] = Math.min(255, Math.max(0, nData[i + 2] + noise));
        }
      }
      ctx.putImageData(noiseData, 0, 0);
    }

    return canvas.toDataURL('image/png');
  },
};

// 2.4 Digital Weathering (디지털 풍화 효과)
export interface WeatheringOptions {
  presetId: string;
  generations: number;
  jpegQuality: number;
  sharpenIntensity: number;
}

const weatheringEffect: GifBatchEffectDefinition<WeatheringOptions> = {
  id: 'filter_weathering',
  category: 'photoFilter',
  categoryName: '사진 필터 및 효과',
  name: '디지털 풍화 효과 (짤 열화)',
  badge: '디지털 풍화',
  description: '카카오톡 100회 전송, 초록빛 곰팡이 썩은 짤, 고대 화석 짤 JPEG 열화를 재현합니다.',
  icon: '🧟',
  defaultOptions: {
    presetId: 'kakaotalk',
    generations: 8,
    jpegQuality: 0.2,
    sharpenIntensity: 30,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>풍화 프리셋</InputLabel>
        <Select
          value={options.presetId}
          label="풍화 프리셋"
          onChange={(e) => {
            const pId = e.target.value;
            const pData = WEATHERING_PRESETS.find((item: WeatheringPreset) => item.id === pId);
            if (pData) {
              onChange({
                ...options,
                presetId: pId,
                generations: pData.config.generations,
                jpegQuality: pData.config.jpegQuality,
                sharpenIntensity: pData.config.sharpenIntensity,
              });
            }
          }}
        >
          {WEATHERING_PRESETS.map((p: WeatheringPreset) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            압축 세대 수 (Generations)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.generations}세대
          </Typography>
        </Box>
        <Slider
          size="small"
          min={1}
          max={25}
          value={options.generations}
          onChange={(_, v) => onChange({ ...options, generations: v as number })}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            샤픈/열화 강도 (Sharpen)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.sharpenIntensity}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={100}
          value={options.sharpenIntensity}
          onChange={(_, v) => onChange({ ...options, sharpenIntensity: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const config: WeatheringConfig = {
      presetId: opt.presetId,
      generations: opt.generations,
      jpegQuality: opt.jpegQuality,
      downscaleFactor: 0.75,
      colorMode: 'natural',
      sharpenIntensity: opt.sharpenIntensity,
      showScreenshotUi: false,
      screenshotUiLevel: 1,
      watermarkCount: 0,
      noiseIntensity: 15,
    };
    return renderWeatheringPhoto(src, config);
  },
};

// 2.5 Meme Lab (종합 밈 연구소)
export interface MemeLabOptions {
  effectType: MemeEffectType;
  wideStretch: number;
  fisheyeStrength: number;
  radialBlurStrength: number;
}

const memeLabEffect: GifBatchEffectDefinition<MemeLabOptions> = {
  id: 'filter_meme_lab',
  category: 'photoFilter',
  categoryName: '사진 필터 및 효과',
  name: '종합 밈 연구소 (Meme Lab)',
  badge: '밈 왜곡',
  description: '와이드 푸틴, 어안 렌즈, 각성 레이저, 줌 블러 등 인터넷 유명 밈을 일괄 생성합니다.',
  icon: '🧪',
  defaultOptions: {
    effectType: 'wide',
    wideStretch: 2.0,
    fisheyeStrength: 1.5,
    radialBlurStrength: 25,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>밈 왜곡 효과</InputLabel>
        <Select
          value={options.effectType}
          label="밈 왜곡 효과"
          onChange={(e) => onChange({ ...options, effectType: e.target.value as MemeEffectType })}
        >
          {MEME_EFFECTS.map((eff) => (
            <MenuItem key={eff.id} value={eff.id}>
              {eff.icon} {eff.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {options.effectType === 'wide' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              가로 스트레칭 배율
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {options.wideStretch}x
            </Typography>
          </Box>
          <Slider
            size="small"
            min={1.2}
            max={3.5}
            step={0.1}
            value={options.wideStretch}
            onChange={(_, v) => onChange({ ...options, wideStretch: v as number })}
          />
        </Box>
      )}

      {options.effectType === 'fisheye' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              어안 왜곡 강도
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {options.fisheyeStrength}
            </Typography>
          </Box>
          <Slider
            size="small"
            min={0.5}
            max={2.5}
            step={0.1}
            value={options.fisheyeStrength}
            onChange={(_, v) => onChange({ ...options, fisheyeStrength: v as number })}
          />
        </Box>
      )}

      {options.effectType === 'radial_blur' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              줌 블러 강도
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {options.radialBlurStrength}%
            </Typography>
          </Box>
          <Slider
            size="small"
            min={5}
            max={60}
            value={options.radialBlurStrength}
            onChange={(_, v) => onChange({ ...options, radialBlurStrength: v as number })}
          />
        </Box>
      )}
    </Box>
  ),
  apply: async (src, opt) => {
    const config: MemeLabConfig = {
      effectType: opt.effectType,
      wideStretch: opt.wideStretch,
      wideWalkAnim: false,
      fisheyeStrength: opt.fisheyeStrength,
      fisheyeRadius: 0.75,
      laserPoints: [
        { x: 0.42, y: 0.45 },
        { x: 0.58, y: 0.45 },
      ],
      laserColor: 'red',
      laserBeamSize: 35,
      uncannyStage: 6,
      radialBlurStrength: opt.radialBlurStrength,
      radialBlurPasses: 10,
      pixelSortThreshold: 95,
      pixelSortDirection: 'vertical',
      emojiDensity: 36,
      spinningShape: 'cube',
      spinningSpeed: 3,
      spinningAngleDeg: 45,
      tiltShiftPosition: 50,
      tiltShiftBlur: 8,
      ps1Resolution: 220,
      ps1ColorDepth: 15,
      ps1Jitter: 4,
    };
    return renderMemePhoto(src, config);
  },
};

// ----------------------------------------------------------------------
// Category 3: Photo Studio (사진 편집 스튜디오)
// ----------------------------------------------------------------------

// 3.1 Flip & Rotate (상하 · 좌우 반전 및 회전)
export interface FlipRotateOptions {
  flipH: boolean;
  flipV: boolean;
  rotation: number;
}

const flipRotateEffect: GifBatchEffectDefinition<FlipRotateOptions> = {
  id: 'studio_flip_rotate',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '상하 · 좌우 반전 & 각도 회전',
  badge: '반전/회전',
  description: '선택한 모든 프레임을 거울 모드 좌우 반전, 상하 반전 또는 90도 회전합니다.',
  icon: '🔄',
  defaultOptions: {
    flipH: true,
    flipV: false,
    rotation: 0,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <ToggleButtonGroup
          value={[options.flipH ? 'h' : '', options.flipV ? 'v' : ''].filter(Boolean)}
          onChange={(_, val) => {
            onChange({
              ...options,
              flipH: val.includes('h'),
              flipV: val.includes('v'),
            });
          }}
          fullWidth
          size="small"
        >
          <ToggleButton value="h">↔️ 좌우 반전</ToggleButton>
          <ToggleButton value="v">↕️ 상하 반전</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel>방향 회전</InputLabel>
        <Select
          value={options.rotation}
          label="방향 회전"
          onChange={(e) => onChange({ ...options, rotation: Number(e.target.value) || 0 })}
        >
          <MenuItem value={0}>0° (회전 없음)</MenuItem>
          <MenuItem value={90}>시계 방향 90°</MenuItem>
          <MenuItem value={180}>180° 회전</MenuItem>
          <MenuItem value={270}>반시계 방향 90°</MenuItem>
        </Select>
      </FormControl>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const rot = ((opt.rotation % 360) + 360) % 360;
    const isSwap = rot === 90 || rot === 270;
    const w = isSwap ? img.height : img.width;
    const h = isSwap ? img.width : img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.translate(w / 2, h / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(opt.flipH ? -1 : 1, opt.flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    return canvas.toDataURL('image/png');
  },
};

// 3.2 Shape Crop (도형 자르기)
export type ShapeCropType =
  | 'circle'
  | 'rounded-rect'
  | 'heart'
  | 'star'
  | 'flower'
  | 'clover'
  | 'cloud'
  | 'diamond'
  | 'hexagon';

export interface ShapeCropOptions {
  shape: ShapeCropType;
  scale: number;
  borderWidth: number;
  borderColor: string;
}

const shapeCropEffect: GifBatchEffectDefinition<ShapeCropOptions> = {
  id: 'studio_shape_crop',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '도형 자르기 (하트, 별, 원형)',
  badge: '도형 마스크',
  description: '하트, 별, 원형, 클로버, 뱃지 등 다채로운 모양으로 프레임을 크롭합니다.',
  icon: '💖',
  defaultOptions: {
    shape: 'heart',
    scale: 85,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>도형 모양</InputLabel>
        <Select
          value={options.shape}
          label="도형 모양"
          onChange={(e) => onChange({ ...options, shape: e.target.value as ShapeCropType })}
        >
          <MenuItem value="circle">⚪ 원형 (Circle)</MenuItem>
          <MenuItem value="rounded-rect">🔲 둥근 사각형</MenuItem>
          <MenuItem value="heart">❤️ 하트 (Heart)</MenuItem>
          <MenuItem value="star">⭐ 별 (Star)</MenuItem>
          <MenuItem value="flower">🌸 꽃 (Flower)</MenuItem>
          <MenuItem value="clover">🍀 클로버</MenuItem>
          <MenuItem value="cloud">☁️ 구름</MenuItem>
          <MenuItem value="diamond">🔶 다이아몬드</MenuItem>
          <MenuItem value="hexagon">⬡ 육각형</MenuItem>
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            도형 크기 (Scale)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.scale}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={30}
          max={100}
          value={options.scale}
          onChange={(_, v) => onChange({ ...options, scale: v as number })}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TextField
          size="small"
          label="테두리 두께 (px)"
          type="number"
          value={options.borderWidth}
          onChange={(e) => onChange({ ...options, borderWidth: Number(e.target.value) || 0 })}
          sx={{ flex: 1 }}
        />
        {options.borderWidth > 0 && (
          <input
            type="color"
            value={options.borderColor}
            onChange={(e) => onChange({ ...options, borderColor: e.target.value })}
            style={{ width: 44, height: 38, border: 'none', borderRadius: 4, cursor: 'pointer' }}
          />
        )}
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) / 2;
    const r = (maxR * opt.scale) / 100;

    ctx.save();
    ctx.beginPath();

    if (opt.shape === 'circle') {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (opt.shape === 'rounded-rect') {
      ctx.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3);
    } else if (opt.shape === 'heart') {
      const topNotchY = cy - r * 0.28;
      const bottomTipY = cy + r * 0.88;
      ctx.moveTo(cx, topNotchY);
      ctx.bezierCurveTo(
        cx - r * 0.55,
        cy - r * 0.96,
        cx - r * 1.18,
        cy - r * 0.12,
        cx - r * 0.98,
        cy + r * 0.24
      );
      ctx.bezierCurveTo(cx - r * 0.82, cy + r * 0.56, cx - r * 0.36, cy + r * 0.76, cx, bottomTipY);
      ctx.bezierCurveTo(
        cx + r * 0.36,
        cy + r * 0.76,
        cx + r * 0.82,
        cy + r * 0.56,
        cx + r * 0.98,
        cy + r * 0.24
      );
      ctx.bezierCurveTo(cx + r * 1.18, cy - r * 0.12, cx + r * 0.55, cy - r * 0.96, cx, topNotchY);
    } else if (opt.shape === 'star') {
      const points = 5;
      for (let i = 0; i < points * 2; i += 1) {
        const rad = (i * Math.PI) / points - Math.PI / 2;
        const curR = i % 2 === 0 ? r : r * 0.45;
        const x = cx + Math.cos(rad) * curR;
        const y = cy + Math.sin(rad) * curR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (opt.shape === 'flower') {
      const petals = 6;
      for (let i = 0; i < petals * 2; i += 1) {
        const rad = (i * Math.PI) / petals - Math.PI / 2;
        const curR = i % 2 === 0 ? r : r * 0.45;
        const x = cx + Math.cos(rad) * curR;
        const y = cy + Math.sin(rad) * curR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (opt.shape === 'diamond') {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
    } else if (opt.shape === 'hexagon') {
      for (let i = 0; i < 6; i += 1) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }

    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, w, h);

    if (opt.borderWidth > 0) {
      ctx.strokeStyle = opt.borderColor;
      ctx.lineWidth = opt.borderWidth * 2;
      ctx.stroke();
    }
    ctx.restore();

    return canvas.toDataURL('image/png');
  },
};

// 3.3 Mosaic & Blur (모자이크 및 블러)
export interface MosaicBlurOptions {
  effectType: 'pixelate' | 'blur' | 'solid';
  regionType: 'center' | 'faces';
  intensity: number;
}

const mosaicBlurEffect: GifBatchEffectDefinition<MosaicBlurOptions> = {
  id: 'studio_mosaic_blur',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '모자이크 & 블러 (익명화)',
  badge: '프라이버시',
  description: '중앙 영역 또는 AI 얼굴 자동 인식 영역을 픽셀화 모자이크나 블러 처리합니다.',
  icon: '🌫️',
  defaultOptions: {
    effectType: 'pixelate',
    regionType: 'center',
    intensity: 15,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>효과 종류</InputLabel>
        <Select
          value={options.effectType}
          label="효과 종류"
          onChange={(e) =>
            onChange({
              ...options,
              effectType: e.target.value as MosaicBlurOptions['effectType'],
            })
          }
        >
          <MenuItem value="pixelate">픽셀화 모자이크 (Pixelate)</MenuItem>
          <MenuItem value="blur">가우시안 블러 (Blur)</MenuItem>
          <MenuItem value="solid">블랙아웃 마스킹 (Solid Black)</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>적용 대상 영역</InputLabel>
        <Select
          value={options.regionType}
          label="적용 대상 영역"
          onChange={(e) =>
            onChange({
              ...options,
              regionType: e.target.value as MosaicBlurOptions['regionType'],
            })
          }
        >
          <MenuItem value="center">중앙 주요 영역 (Center)</MenuItem>
          <MenuItem value="faces">인공지능 얼굴 자동 감지 (Faces)</MenuItem>
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            모자이크 강도
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.intensity}
          </Typography>
        </Box>
        <Slider
          size="small"
          min={5}
          max={40}
          value={options.intensity}
          onChange={(_, v) => onChange({ ...options, intensity: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.drawImage(img, 0, 0, w, h);

    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];

    if (opt.regionType === 'faces') {
      const faces = await detectFacesInCanvas(canvas);
      if (faces.length > 0) {
        faces.forEach((f) => regions.push(f));
      } else {
        regions.push({ x: w * 0.25, y: h * 0.2, width: w * 0.5, height: h * 0.6 });
      }
    } else {
      regions.push({ x: w * 0.25, y: h * 0.25, width: w * 0.5, height: h * 0.5 });
    }

    regions.forEach((r) => {
      if (opt.effectType === 'pixelate') {
        applyPixelateRegion(ctx, r.x, r.y, r.width, r.height, opt.intensity);
      } else if (opt.effectType === 'blur') {
        applyBlurRegion(ctx, r.x, r.y, r.width, r.height, opt.intensity * 1.5);
      } else if (opt.effectType === 'solid') {
        applySolidColorRegion(ctx, r.x, r.y, r.width, r.height, '#000000');
      }
    });

    return canvas.toDataURL('image/png');
  },
};

// 3.4 Watermark (워터마크 각인)
export interface WatermarkOptions {
  text: string;
  fontSize: number;
  textColor: string;
  opacity: number;
  position: PositionPreset;
}

const watermarkEffect: GifBatchEffectDefinition<WatermarkOptions> = {
  id: 'studio_watermark',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '워터마크 각인 (저작권/서명)',
  badge: '서명 각인',
  description: '대외비, 저작권 문구 또는 로고 서명을 원하는 위치에 일괄 각인합니다.',
  icon: '✍️',
  defaultOptions: {
    text: 'COPYRIGHT ©',
    fontSize: 28,
    textColor: '#ffffff',
    opacity: 0.65,
    position: 'bottom-right',
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        size="small"
        fullWidth
        label="각인 텍스트 문구"
        value={options.text}
        onChange={(e) => onChange({ ...options, text: e.target.value })}
      />

      <FormControl fullWidth size="small">
        <InputLabel>각인 위치</InputLabel>
        <Select
          value={options.position}
          label="각인 위치"
          onChange={(e) => onChange({ ...options, position: e.target.value as PositionPreset })}
        >
          <MenuItem value="bottom-right">우측 하단 (Bottom-Right)</MenuItem>
          <MenuItem value="bottom-left">좌측 하단 (Bottom-Left)</MenuItem>
          <MenuItem value="top-right">우측 상단 (Top-Right)</MenuItem>
          <MenuItem value="top-left">좌측 상단 (Top-Left)</MenuItem>
          <MenuItem value="center">화면 정중앙 (Center)</MenuItem>
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            불투명도 (Opacity)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {Math.round(options.opacity * 100)}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0.1}
          max={1.0}
          step={0.05}
          value={options.opacity}
          onChange={(_, v) => onChange({ ...options, opacity: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    const renderOpts: WatermarkRenderOptions = {
      opacity: opt.opacity,
      scale: 0.12,
      rotation: 0,
      positionPreset: opt.position,
      customText: opt.text,
      showText: true,
      textColor: opt.textColor,
    };

    drawWatermark(ctx, img, null, renderOpts);
    return canvas.toDataURL('image/png');
  },
};

// 3.5 Scanner FX (문서 스캔 효과)
export interface ScannerOptions {
  preset: ScanPresetType;
  contrast: number;
}

const scannerEffect: GifBatchEffectDefinition<ScannerOptions> = {
  id: 'studio_scanner',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '스캔 효과 · 문서 스캐너',
  badge: '스캔 FX',
  description: '흑백 복사기, 고대비 컬러 스캔, 빈티지 팩스 문서 필터를 일괄 적용합니다.',
  icon: '🖨️',
  defaultOptions: {
    preset: 'bw_document',
    contrast: 40,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>스캔 프리셋</InputLabel>
        <Select
          value={options.preset}
          label="스캔 프리셋"
          onChange={(e) => onChange({ ...options, preset: e.target.value as ScanPresetType })}
        >
          {SCAN_PRESETS.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            대비 강조 (Contrast)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.contrast}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={-50}
          max={100}
          value={options.contrast}
          onChange={(_, v) => onChange({ ...options, contrast: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const config: ScanConfig = {
      preset: opt.preset,
      contrast: opt.contrast,
      brightness: 15,
      paperWhitening: 60,
      noise: 8,
      skewAngle: 0,
      edgeVignette: 15,
      scanlines: 5,
      sharpen: true,
    };
    return renderScanEffect(src, config);
  },
};

// 3.6 Resize & Scale (이미지 크기 조절)
export interface ResizeOptions {
  scalePercent: number;
}

const resizeEffect: GifBatchEffectDefinition<ResizeOptions> = {
  id: 'studio_resize',
  category: 'photoStudio',
  categoryName: '사진 편집 스튜디오',
  name: '이미지 크기 조절 (해상도 리사이즈)',
  badge: '리사이즈',
  description: '프레임의 가로/세로 해상도를 20%~200% 비율로 축소 또는 확대합니다.',
  icon: '📐',
  defaultOptions: {
    scalePercent: 75,
  },
  renderSettings: ({ options, onChange }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            해상도 비율 (Scale)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {options.scalePercent}%
          </Typography>
        </Box>
        <Slider
          size="small"
          min={20}
          max={200}
          step={5}
          value={options.scalePercent}
          onChange={(_, v) => onChange({ ...options, scalePercent: v as number })}
        />
      </Box>
    </Box>
  ),
  apply: async (src, opt) => {
    const img = await loadImage(src);
    const w = Math.round(((img.naturalWidth || img.width) * opt.scalePercent) / 100);
    const h = Math.round(((img.naturalHeight || img.height) * opt.scalePercent) / 100);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(10, w);
    canvas.height = Math.max(10, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  },
};

// ----------------------------------------------------------------------
// Master Registry List
// (새로운 기능 추가 시 아래 배열에 효과 객체 하나만 등록하면 자동 연동됩니다)
// ----------------------------------------------------------------------

export const GIF_BATCH_EFFECTS_REGISTRY: GifBatchEffectDefinition[] = [
  // 1. 앱인토스
  logoEffect,
  bgColorEffect,
  seroEffect,
  garoEffect,

  // 2. 사진 필터 및 효과
  artStyleEffect,
  pixelArtEffect,
  glitchEffect,
  weatheringEffect,
  memeLabEffect,

  // 3. 사진 편집 스튜디오
  flipRotateEffect,
  shapeCropEffect,
  mosaicBlurEffect,
  watermarkEffect,
  scannerEffect,
  resizeEffect,
];

/**
 * Helper to find effect definition by ID
 */
export function getBatchEffectById(id: string): GifBatchEffectDefinition | undefined {
  return GIF_BATCH_EFFECTS_REGISTRY.find((eff) => eff.id === id);
}

/**
 * Helper to filter effects by category
 */
export function getBatchEffectsByCategory(
  category: EffectCategory | 'all'
): GifBatchEffectDefinition[] {
  if (category === 'all') return GIF_BATCH_EFFECTS_REGISTRY;
  return GIF_BATCH_EFFECTS_REGISTRY.filter((eff) => eff.category === category);
}
