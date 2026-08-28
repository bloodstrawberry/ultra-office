'use client';

import type { ColorPalette } from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

// ----------------------------------------------------------------------

const PRESETS = [
  { name: '전체 만델브로 집합', x: -0.75, y: 0.0, zoom: 1, isJulia: false, cr: 0, ci: 0 },
  {
    name: '해마 계곡 (Seahorse Valley)',
    x: -0.7436438870371587,
    y: 0.131825904205312,
    zoom: 120,
    isJulia: false,
    cr: 0,
    ci: 0,
  },
  {
    name: '코끼리 계곡 (Elephant Valley)',
    x: 0.275,
    y: 0.0,
    zoom: 15,
    isJulia: false,
    cr: 0,
    ci: 0,
  },
  {
    name: '미니 만델브로 (Mini Mandelbrot)',
    x: -1.75,
    y: 0.0,
    zoom: 25,
    isJulia: false,
    cr: 0,
    ci: 0,
  },
  {
    name: '줄리아 집합: 드래곤 (Dragon)',
    x: 0.0,
    y: 0.0,
    zoom: 1,
    isJulia: true,
    cr: -0.8,
    ci: 0.156,
  },
  {
    name: '줄리아 집합: 덴드라이트 (Dendrite)',
    x: 0.0,
    y: 0.0,
    zoom: 1,
    isJulia: true,
    cr: 0.0,
    ci: 1.0,
  },
  {
    name: '줄리아 집합: 소용돌이 (Douady Rabbit)',
    x: 0.0,
    y: 0.0,
    zoom: 1,
    isJulia: true,
    cr: -0.123,
    ci: 0.745,
  },
];

export function MandelbrotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [centerX, setCenterX] = useState<number>(-0.75);
  const [centerY, setCenterY] = useState<number>(0.0);
  const [zoom, setZoom] = useState<number>(1);
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [palette, setPalette] = useState<ColorPalette>('electric-blue');
  const [isJulia, setIsJulia] = useState<boolean>(false);
  const [juliaCr, setJuliaCr] = useState<number>(-0.8);
  const [juliaCi, setJuliaCi] = useState<number>(0.156);

  // Mouse interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getPaletteColor = useCallback(
    (iter: number, maxIter: number): [number, number, number] => {
      if (iter >= maxIter) return [0, 0, 0]; // Inside set -> Black
      const t = iter / maxIter;

      if (palette === 'electric-blue') {
        const r = Math.floor(9 * (1 - t) * t * t * t * 255);
        const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
        const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
        return [r * 2.5, g * 2.5, b * 3.5].map((v) => Math.min(255, v)) as [number, number, number];
      }

      if (palette === 'fire') {
        const r = Math.floor(Math.min(255, iter * 6));
        const g = Math.floor(Math.min(255, Math.max(0, (iter - 20) * 8)));
        const b = Math.floor(Math.min(255, Math.max(0, (iter - 50) * 12)));
        return [r, g, b];
      }

      if (palette === 'rainbow') {
        const hue = (iter * 7) % 360;
        const s = 0.85;
        const l = 0.5;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;
        if (hue < 60) {
          r = c;
          g = x;
        } else if (hue < 120) {
          r = x;
          g = c;
        } else if (hue < 180) {
          g = c;
          b = x;
        } else if (hue < 240) {
          g = x;
          b = c;
        } else if (hue < 300) {
          r = x;
          b = c;
        } else {
          r = c;
          b = x;
        }
        return [Math.floor((r + m) * 255), Math.floor((g + m) * 255), Math.floor((b + m) * 255)];
      }

      if (palette === 'neon') {
        const r = Math.floor(Math.sin(iter * 0.1) * 127 + 128);
        const g = Math.floor(Math.sin(iter * 0.1 + 2) * 127 + 128);
        const b = Math.floor(Math.sin(iter * 0.1 + 4) * 127 + 128);
        return [r, g, b];
      }

      // Monochrome
      const v = Math.floor(255 * (1 - t));
      return [v, v, v];
    },
    [palette]
  );

  // Render Mandelbrot / Julia Image Data
  const renderFractal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Viewport scaling
    const scale = 3.0 / (zoom * Math.min(width, height));
    const xMin = centerX - (width / 2) * scale;
    const yMin = centerY - (height / 2) * scale;

    for (let py = 0; py < height; py += 1) {
      const y0 = yMin + py * scale;
      for (let px = 0; px < width; px += 1) {
        const x0 = xMin + px * scale;

        let zr = isJulia ? x0 : 0;
        let zi = isJulia ? y0 : 0;
        const cr = isJulia ? juliaCr : x0;
        const ci = isJulia ? juliaCi : y0;

        let iter = 0;
        while (zr * zr + zi * zi <= 4.0 && iter < maxIterations) {
          const zrNext = zr * zr - zi * zi + cr;
          const ziNext = 2.0 * zr * zi + ci;
          zr = zrNext;
          zi = ziNext;
          iter += 1;
        }

        const [r, g, b] = getPaletteColor(iter, maxIterations);
        const pixelIndex = (py * width + px) * 4;
        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [centerX, centerY, zoom, maxIterations, isJulia, juliaCr, juliaCi, getPaletteColor]);

  useEffect(() => {
    renderFractal();
  }, [renderFractal]);

  // Mouse drag pan handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const scale = 3.0 / (zoom * Math.min(canvasRef.current.width, canvasRef.current.height));
    setCenterX((prev) => prev - dx * scale);
    setCenterY((prev) => prev - dy * scale);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => prev * 1.3);
    } else {
      setZoom((prev) => Math.max(0.2, prev / 1.3));
    }
  };

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setCenterX(preset.x);
    setCenterY(preset.y);
    setZoom(preset.zoom);
    setIsJulia(preset.isJulia);
    if (preset.isJulia) {
      setJuliaCr(preset.cr);
      setJuliaCi(preset.ci);
    }
  };

  const handleResetView = () => {
    setCenterX(isJulia ? 0.0 : -0.75);
    setCenterY(0.0);
    setZoom(1);
    setMaxIterations(100);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Preset Chips */}
      <Card sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            탐험 프리셋 (Presets):
          </Typography>
          {PRESETS.map((p) => (
            <Chip
              key={p.name}
              label={p.name}
              clickable
              variant="outlined"
              color={p.isJulia ? 'secondary' : 'primary'}
              onClick={() => handleSelectPreset(p)}
            />
          ))}
        </Box>
      </Card>

      {/* 2. Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {isJulia
                ? `줄리아 집합 (c = ${juliaCr} + ${juliaCi}i)`
                : '만델브로 집합 (zₙ₊₁ = zₙ² + c)'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              마우스 드래그: 화면 이동 | 휠 스크롤: 실시간 줌인/줌아웃
            </Typography>
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: 680,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={420}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Quick Zoom Bar */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ZoomInRoundedIcon />}
              onClick={() => setZoom((prev) => prev * 1.5)}
            >
              확대 (Zoom In)
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ZoomOutRoundedIcon />}
              onClick={() => setZoom((prev) => Math.max(0.2, prev / 1.5))}
            >
              축소 (Zoom Out)
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleResetView}
            >
              위치 초기화
            </Button>
          </Box>
        </Card>

        {/* Right: Controls Panel */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              렌더링 파라미터 제어
            </Typography>

            {/* Mode Switch: Mandelbrot vs Julia */}
            <Box sx={{ mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Switch checked={isJulia} onChange={(e) => setIsJulia(e.target.checked)} />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    줄리아 집합 (Julia Set) 모드 전환
                  </Typography>
                }
              />
            </Box>

            {/* Julia Parameters */}
            {isJulia && (
              <Box sx={{ mb: 2.5, p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  복소 상수 c = Re(c) + Im(c)i
                </Typography>
                <Typography variant="caption">실수부 Re(c): {juliaCr}</Typography>
                <Slider
                  value={juliaCr}
                  min={-2}
                  max={2}
                  step={0.01}
                  onChange={(_, val) => setJuliaCr(val as number)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption">허수부 Im(c): {juliaCi}</Typography>
                <Slider
                  value={juliaCi}
                  min={-2}
                  max={2}
                  step={0.01}
                  onChange={(_, val) => setJuliaCi(val as number)}
                />
              </Box>
            )}

            {/* Iteration Depth */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  반복 연산 횟수 (Iterations): {maxIterations}
                </Typography>
              </Box>
              <Slider
                value={maxIterations}
                min={30}
                max={300}
                step={10}
                onChange={(_, val) => setMaxIterations(val as number)}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                * 횟수가 높을수록 프랙탈 경계면이 더욱 정밀하고 세밀하게 렌더링됩니다.
              </Typography>
            </Box>

            {/* Color Palette Selector */}
            <FormControl fullWidth size="small">
              <InputLabel id="palette-select-label">컬러 팔레트 테마</InputLabel>
              <Select
                labelId="palette-select-label"
                value={palette}
                label="컬러 팔레트 테마"
                onChange={(e) => setPalette(e.target.value as ColorPalette)}
              >
                <MenuItem value="electric-blue">1. 일렉트릭 블루 (Electric Blue)</MenuItem>
                <MenuItem value="fire">2. 파이어 (Fire)</MenuItem>
                <MenuItem value="rainbow">3. 레인보우 스펙트럼 (Rainbow)</MenuItem>
                <MenuItem value="neon">4. 사이버 네온 (Neon)</MenuItem>
                <MenuItem value="monochrome">5. 흑백 모노크롬 (Monochrome)</MenuItem>
              </Select>
            </FormControl>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              💡 만델브로 집합(Mandelbrot Set)이란?
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              단순한 복소수 2차 수열 z(n+1) = z(n)² + c 가 무한대로 발산하지 않는 복소수 c들의
              집합입니다. 아무리 깊이 확대해도 완전히 동일하지 않으면서 끝없이
              자가유사성(Self-similarity)을 갖는 수학계에서 가장 아름다운 프랙탈 예술입니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
