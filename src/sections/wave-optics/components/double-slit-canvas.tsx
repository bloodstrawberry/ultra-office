'use client';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function DoubleSlitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [wavelengthNm, setWavelengthNm] = useState<number>(532); // 532nm Green Laser default
  const [slitDistanceUm, setSlitDistanceUm] = useState<number>(40); // Slit separation d (um)
  const [screenDistanceCm, setScreenDistanceCm] = useState<number>(100); // Screen distance D (cm)

  const phaseRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Convert wavelength nm to RGB laser color
  const getLaserColor = (wl: number): string => {
    if (wl < 440) return '#8B5CF6'; // Violet
    if (wl < 490) return '#3B82F6'; // Blue
    if (wl < 560) return '#10B981'; // Green
    if (wl < 590) return '#F59E0B'; // Yellow
    if (wl < 630) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const laserColor = getLaserColor(wavelengthNm);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const render = () => {
      phaseRef.current += 0.08;
      const phase = phaseRef.current;

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      const slitWallX = 120;
      const screenX = width - 140;
      const cy = height / 2;

      // Slit positions
      const slitGapPx = (slitDistanceUm / 50) * 35;
      const s1 = { x: slitWallX, y: cy - slitGapPx / 2 };
      const s2 = { x: slitWallX, y: cy + slitGapPx / 2 };

      // 1. Draw Incoming Plane Waves
      const waveSpacing = (wavelengthNm / 500) * 14;
      ctx.strokeStyle = laserColor;
      ctx.lineWidth = 1.5;

      for (let x = 10; x < slitWallX; x += waveSpacing) {
        const offset = (x + phase * 6) % waveSpacing;
        const currentX = x + offset;
        if (currentX < slitWallX) {
          ctx.beginPath();
          ctx.moveTo(currentX, 20);
          ctx.lineTo(currentX, height - 20);
          ctx.stroke();
        }
      }

      // 2. Draw Slit Wall Barrier
      ctx.fillStyle = '#334155';
      ctx.fillRect(slitWallX - 4, 10, 8, cy - slitGapPx / 2 - 4);
      ctx.fillRect(slitWallX - 4, cy - slitGapPx / 2 + 4, 8, slitGapPx - 8);
      ctx.fillRect(slitWallX - 4, cy + slitGapPx / 2 + 4, 8, height - (cy + slitGapPx / 2 + 14));

      // 3. Draw Diffracted Concentric Wavefronts
      const maxRadius = screenX - slitWallX;
      for (let r = 5; r < maxRadius; r += waveSpacing) {
        const currentR = r + ((phase * 6) % waveSpacing);

        // Slit 1 wavefront
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, currentR, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.4 - currentR / maxRadius)})`;
        ctx.stroke();

        // Slit 2 wavefront
        ctx.beginPath();
        ctx.arc(s2.x, s2.y, currentR, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.4 - currentR / maxRadius)})`;
        ctx.stroke();
      }

      // 4. Draw Detector Screen Barrier
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(screenX, 10, 10, height - 20);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(screenX, 10, 10, height - 20);

      // 5. Draw Interference Intensity Fringes on Screen
      const fringeStartX = screenX + 15;
      const fringeWidth = 100;

      // Intensity Curve
      ctx.beginPath();
      ctx.strokeStyle = laserColor;
      ctx.lineWidth = 2.5;

      const lambda = wavelengthNm * 1e-9;
      const d = slitDistanceUm * 1e-6;
      const D = screenDistanceCm * 1e-2;

      for (let py = 20; py <= height - 20; py += 1) {
        const yDistMeters = ((py - cy) / height) * 0.04; // 4cm physical scale
        const theta = Math.atan2(yDistMeters, D);
        const beta = (Math.PI * d * Math.sin(theta)) / lambda;

        // Two slit interference intensity I = cos^2(beta)
        const intensity = Math.cos(beta) ** 2;

        const px = fringeStartX + intensity * (fringeWidth - 10);
        if (py === 20) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);

        // Draw color fringe line on detector screen
        ctx.fillStyle = laserColor;
        ctx.globalAlpha = intensity;
        ctx.fillRect(screenX, py, 10, 1.5);
        ctx.globalAlpha = 1.0;
      }
      ctx.stroke();

      // Screen label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('스크린 간섭 줄무늬', screenX + 5, height - 6);
      ctx.fillText('광도 (Intensity)', fringeStartX + fringeWidth / 2, height - 6);

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [wavelengthNm, slitDistanceUm, screenDistanceCm, laserColor]);

  // Fringe spacing calculation: Delta y = (lambda * D) / d
  const fringeSpacingMm =
    ((wavelengthNm * 1e-9 * (screenDistanceCm * 1e-2)) / (slitDistanceUm * 1e-6)) * 1000;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Laser Wavelength Slider */}
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                레이저 파장 (λ): {wavelengthNm} nm
              </Typography>
              <Chip
                size="small"
                label={wavelengthNm === 532 ? '초록 레이저' : `${wavelengthNm}nm`}
                sx={{ bgcolor: laserColor, color: '#FFFFFF', fontWeight: 800 }}
              />
            </Box>
            <Slider
              value={wavelengthNm}
              min={400}
              max={700}
              step={5}
              marks={[
                { value: 400, label: '400 (보라)' },
                { value: 532, label: '532 (초록)' },
                { value: 650, label: '650 (빨강)' },
              ]}
              onChange={(_, v) => setWavelengthNm(v as number)}
            />
          </Box>

          {/* Slit Distance Slider */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              슬릿 간격 (d): {slitDistanceUm} μm
            </Typography>
            <Slider
              value={slitDistanceUm}
              min={15}
              max={100}
              step={5}
              onChange={(_, v) => setSlitDistanceUm(v as number)}
            />
          </Box>

          {/* Screen Distance Slider */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              스크린 거리 (D): {screenDistanceCm} cm
            </Typography>
            <Slider
              value={screenDistanceCm}
              min={50}
              max={200}
              step={10}
              onChange={(_, v) => setScreenDistanceCm(v as number)}
            />
          </Box>
        </Box>
      </Card>

      {/* 2. Main Canvas */}
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
            영(Young)의 이중 슬릿 빛의 간섭 시뮬레이션
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            무늬 간격 (Δy): <b>{fringeSpacingMm.toFixed(2)} mm</b> (공식: Δy = λD/d)
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: 720,
            borderRadius: 2,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            boxShadow: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            width={720}
            height={380}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>

        <Box sx={{ width: '100%', mt: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            💡 빛의 파동성(Wave Nature of Light) 증명
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            1801년 토머스 영(Thomas Young)의 이중 슬릿 실험은 두 슬릿을 통과한 빛의 파동이 서로
            중첩되며 위상이 같은 곳에서는 <b>보강 간섭(밝은 무늬)</b>을, 위상이 반대인 곳에서는{' '}
            <b>상쇄 간섭(어두운 무늬)</b>을 형성함을 보여줌으로써 뉴턴의 입자설을 뒤엎고 빛의
            파동성을 확립한 물리학의 기념비적 실험입니다.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
