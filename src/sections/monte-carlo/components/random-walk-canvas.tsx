'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// ----------------------------------------------------------------------

interface Walker2D {
  color: string;
  path: { x: number; y: number }[];
}

const COLORS = [
  '#38BDF8',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#F43F5E',
  '#06B6D4',
  '#EAB308',
];

export function RandomWalkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<'2d' | 'gbm'>('2d');
  const [numWalkers, setNumWalkers] = useState<number>(6);
  const [stepCount, setStepCount] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const walkersRef = useRef<Walker2D[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;

  // Initialize Walkers
  const initWalkers = useCallback(
    (count: number = numWalkers) => {
      const newWalkers: Walker2D[] = [];
      for (let i = 0; i < count; i += 1) {
        newWalkers.push({
          color: COLORS[i % COLORS.length],
          path: mode === '2d' ? [{ x: 0, y: 0 }] : [{ x: 0, y: 100 }], // start at $100 for GBM
        });
      }
      walkersRef.current = newWalkers;
      setStepCount(0);
    },
    [mode, numWalkers]
  );

  useEffect(() => {
    initWalkers(numWalkers);
  }, [mode, numWalkers, initWalkers]);

  // Step Random Walk
  const stepWalkers = useCallback(() => {
    const maxSteps = mode === '2d' ? 2500 : 350;

    walkersRef.current.forEach((walker) => {
      const last = walker.path[walker.path.length - 1];
      if (walker.path.length >= maxSteps) return;

      if (mode === '2d') {
        // 2D Random walk step (dx, dy)
        const angle = Math.random() * Math.PI * 2;
        const stepSize = 4;
        walker.path.push({
          x: last.x + Math.cos(angle) * stepSize,
          y: last.y + Math.sin(angle) * stepSize,
        });
      } else {
        // Geometric Brownian Motion (GBM): S_{t+1} = S_t * exp((mu - 0.5*sigma^2)dt + sigma*dW)
        const u1 = Math.max(1e-9, Math.random());
        const u2 = Math.random();
        const dW = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // Normal(0, 1)

        const mu = 0.05; // 5% drift
        const sigma = 0.25; // 25% volatility
        const dt = 1 / 252; // daily
        const nextPrice =
          last.y * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * dW);

        walker.path.push({
          x: last.x + 1,
          y: nextPrice,
        });
      }
    });

    setStepCount((prev) => prev + 1);
  }, [mode]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const render = () => {
      if (isRunningRef.current) {
        stepWalkers();
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      if (mode === '2d') {
        const cx = width / 2;
        const cy = height / 2;

        // Draw Origin Crosshair & Concentric Diffusion Rings
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        [50, 100, 150, 200].forEach((r) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, height - 20);
        ctx.moveTo(20, cy);
        ctx.lineTo(width - 20, cy);
        ctx.stroke();

        // Draw 2D Paths
        walkersRef.current.forEach((walker) => {
          if (walker.path.length < 2) return;
          ctx.beginPath();
          ctx.strokeStyle = walker.color;
          ctx.lineWidth = 1.8;

          walker.path.forEach((pt, idx) => {
            const px = cx + pt.x;
            const py = cy + pt.y;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          // Current position head
          const head = walker.path[walker.path.length - 1];
          ctx.beginPath();
          ctx.arc(cx + head.x, cy + head.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = walker.color;
          ctx.fill();
        });
      } else {
        // GBM Time Series
        const margin = { top: 30, right: 30, bottom: 40, left: 50 };
        const plotW = width - margin.left - margin.right;
        const plotH = height - margin.top - margin.bottom;

        // Baseline $100
        const startY = margin.top + plotH / 2;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(margin.left, startY);
        ctx.lineTo(margin.left + plotW, startY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#64748B';
        ctx.font = '10px sans-serif';
        ctx.fillText('$100 (시작가)', margin.left - 40, startY + 4);

        // Draw Price Lines
        const maxSteps = 350;
        walkersRef.current.forEach((walker) => {
          if (walker.path.length < 2) return;
          ctx.beginPath();
          ctx.strokeStyle = walker.color;
          ctx.lineWidth = 2;

          walker.path.forEach((pt, idx) => {
            const px = margin.left + (pt.x / maxSteps) * plotW;
            const py = margin.top + plotH / 2 - (pt.y - 100) * 3;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        });

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + plotH);
        ctx.lineTo(margin.left + plotW, margin.top + plotH);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText('시간 경과 (Time Days)', margin.left + plotW / 2, height - 10);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [mode, stepWalkers]);

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
          {/* Mode Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="rw-mode-label">보행 모델 선택</InputLabel>
            <Select
              labelId="rw-mode-label"
              value={mode}
              label="보행 모델 선택"
              onChange={(e) => setMode(e.target.value as '2d' | 'gbm')}
            >
              <MenuItem value="2d">1. 2D 무작위 보행 (2D Random Walk)</MenuItem>
              <MenuItem value="gbm">2. 주식 기하 브라운 운동 (GBM Financial Walk)</MenuItem>
            </Select>
          </FormControl>

          {/* Walkers Slider */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              입자 / 경로 수: {numWalkers}개
            </Typography>
            <Slider
              value={numWalkers}
              min={1}
              max={8}
              step={1}
              marks
              onChange={(_, v) => setNumWalkers(v as number)}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={isRunning ? 'outlined' : 'contained'}
              color={isRunning ? 'warning' : 'primary'}
              size="small"
              startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setIsRunning((prev) => !prev)}
            >
              {isRunning ? '일시정지' : '재생'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => initWalkers(numWalkers)}
            >
              초기화
            </Button>
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
            {mode === '2d'
              ? '2D 브라운 운동 확산 궤적'
              : '기하 브라운 운동(GBM) 주가 시계열 시뮬레이션'}
          </Typography>
          <Chip size="small" label={`진행 스텝: ${stepCount}회`} color="primary" />
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
            height={420}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>

        <Box sx={{ width: '100%', mt: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            💡 아인슈타인의 브라운 운동(Brownian Motion) & 블랙-숄즈 모형
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            1905년 아인슈타인은 꽃가루의 무작위 보행으로부터 원자의 실재를 증명하고 확산 거리의
            제곱평균이 시간에 비례함(&lt;r²&gt; ∝ t)을 밝혔습니다. 금융공학에서는 이를
            로그-정규분포로 확장한 <b>기하 브라운 운동(GBM)</b>을 통해 주식 가격 변동성과 노벨
            경제학상을 수상한
            <b>블랙-숄즈(Black-Scholes) 옵션 가격 결정 공식</b>의 기초로 활용합니다.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
