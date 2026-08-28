'use client';

import type { FourierWaveType } from '../types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// ----------------------------------------------------------------------

export function FourierSeriesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [waveType, setWaveType] = useState<FourierWaveType>('square');
  const [harmonics, setHarmonics] = useState<number>(5);
  const [speed, setSpeed] = useState<number>(1);

  const timeRef = useRef<number>(0);
  const waveHistoryRef = useRef<number[]>([]);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    waveHistoryRef.current = [];
  }, [waveType, harmonics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const maxHistory = 400;

    const render = () => {
      timeRef.current += 0.02 * speed;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Epicycle center on left
      const cx = 150;
      const cy = height / 2;
      let x = cx;
      let y = cy;

      const baseRadius = 60;

      // Draw Epicycles (Rotating Harmonic Circles)
      for (let i = 0; i < harmonics; i += 1) {
        const prevX = x;
        const prevY = y;

        let n = 0;
        let radius = 0;

        if (waveType === 'square') {
          n = 2 * i + 1; // 1, 3, 5, 7...
          radius = baseRadius * (4 / (n * Math.PI));
        } else if (waveType === 'sawtooth') {
          n = i + 1; // 1, 2, 3, 4...
          radius = baseRadius * (2 / (n * Math.PI)) * (i % 2 === 0 ? 1 : -1);
        } else if (waveType === 'triangle') {
          n = 2 * i + 1;
          radius = baseRadius * (8 / (n * Math.PI) ** 2) * (i % 2 === 0 ? 1 : -1);
        } else if (waveType === 'pulse') {
          n = i + 1;
          radius = baseRadius * 0.35;
        }

        x += radius * Math.cos(n * t);
        y += radius * Math.sin(n * t);

        // Draw Circle
        ctx.beginPath();
        ctx.arc(prevX, prevY, Math.abs(radius), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Vector Line
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Circle Joint Dot
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EC4899';
        ctx.fill();
      }

      // Record Wave Point
      waveHistoryRef.current.unshift(y);
      if (waveHistoryRef.current.length > maxHistory) {
        waveHistoryRef.current.pop();
      }

      // Connecting pointer line from last circle to wave start
      const waveStartX = 300;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(waveStartX, y);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(waveStartX, cy);
      ctx.lineTo(width - 20, cy);
      ctx.stroke();

      // Draw Resulting Synthesized Wave Curve
      if (waveHistoryRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;

        waveHistoryRef.current.forEach((valY, idx) => {
          const px = waveStartX + idx * 1.0;
          if (px > width - 20) return;
          if (idx === 0) ctx.moveTo(px, valY);
          else ctx.lineTo(px, valY);
        });
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [waveType, harmonics, speed]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.5fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Wave Type Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="fourier-type-label">합성할 목표 파형</InputLabel>
            <Select
              labelId="fourier-type-label"
              value={waveType}
              label="합성할 목표 파형"
              onChange={(e) => setWaveType(e.target.value as FourierWaveType)}
            >
              <MenuItem value="square">1. 사각파 (Square Wave - 홀수 고조파)</MenuItem>
              <MenuItem value="sawtooth">2. 톱니파 (Sawtooth Wave - 전체 고조파)</MenuItem>
              <MenuItem value="triangle">3. 삼각파 (Triangle Wave - 급감소 고조파)</MenuItem>
              <MenuItem value="pulse">4. 펄스 트레인 (Pulse Wave)</MenuItem>
            </Select>
          </FormControl>

          {/* Harmonic Order Slider */}
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                고조파 차수 (Harmonics N): {harmonics}개 원
              </Typography>
            </Box>
            <Slider
              value={harmonics}
              min={1}
              max={30}
              step={1}
              marks={[
                { value: 1, label: 'N=1 (사인파)' },
                { value: 5, label: 'N=5' },
                { value: 15, label: 'N=15' },
                { value: 30, label: 'N=30' },
              ]}
              onChange={(_, v) => setHarmonics(v as number)}
            />
          </Box>

          {/* Speed Slider */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              회전 속도: {speed.toFixed(1)}x
            </Typography>
            <Slider
              value={speed}
              min={0.2}
              max={3}
              step={0.1}
              onChange={(_, v) => setSpeed(v as number)}
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
            푸리에 에피사이클(회전 원) 및 파형 실시간 합성 렌더러
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            좌측: 회전하는 사인파 원(Epicycles) | 우측: 중첩되어 생성된 최종 파형
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
            height={360}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>

        <Box sx={{ width: '100%', mt: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            💡 푸리에 급수(Fourier Series)의 원리
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            조제프 푸리에(Joseph Fourier)는 세상의 모든 복잡한 주기 함수 f(t)를 단순한 사인(Sin)과
            코사인(Cos) 함수들의 무한 합으로 완벽히 분해할 수 있음을 증명했습니다. 차수 N이
            증가할수록 기브스 현상(Gibbs Phenomenon)을 수반하며 완벽한 사각파/톱니파로 수렴합니다.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
