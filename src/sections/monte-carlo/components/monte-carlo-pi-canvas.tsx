'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

// ----------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
  isInside: boolean;
}

export function MonteCarloPiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [insidePoints, setInsidePoints] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const pointsRef = useRef<Point[]>([]);
  const totalCountRef = useRef<number>(0);
  const insideCountRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;

  // Reset
  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    pointsRef.current = [];
    totalCountRef.current = 0;
    insideCountRef.current = 0;
    setTotalPoints(0);
    setInsidePoints(0);
  }, []);

  // Drop batch of points
  const handleDropPoints = (count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const size = Math.min(width, height) - 40;
    const ox = (width - size) / 2;
    const oy = (height - size) / 2;

    let newInside = 0;
    for (let i = 0; i < count; i += 1) {
      const u = Math.random() * 2 - 1; // -1 to 1
      const v = Math.random() * 2 - 1; // -1 to 1
      const isInside = u * u + v * v <= 1.0;

      if (isInside) newInside += 1;

      const px = ox + ((u + 1) / 2) * size;
      const py = oy + ((v + 1) / 2) * size;

      ctx.fillStyle = isInside ? '#10B981' : '#EF4444';
      ctx.fillRect(px, py, 1.5, 1.5);
    }

    totalCountRef.current += count;
    insideCountRef.current += newInside;
    setTotalPoints(totalCountRef.current);
    setInsidePoints(insideCountRef.current);
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    // Initial background & circle
    const width = canvas.width;
    const height = canvas.height;
    const size = Math.min(width, height) - 40;
    const ox = (width - size) / 2;
    const oy = (height - size) / 2;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Draw Inscribed Circle outline
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ox + size / 2, oy + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Bounding Square outline
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox, oy, size, size);

    const render = () => {
      if (isRunningRef.current) {
        const pointsPerFrame = 50;
        let frameInside = 0;

        for (let i = 0; i < pointsPerFrame; i += 1) {
          const u = Math.random() * 2 - 1;
          const v = Math.random() * 2 - 1;
          const isInside = u * u + v * v <= 1.0;

          if (isInside) frameInside += 1;

          const px = ox + ((u + 1) / 2) * size;
          const py = oy + ((v + 1) / 2) * size;

          ctx.fillStyle = isInside ? '#10B981' : '#EF4444';
          ctx.fillRect(px, py, 1.5, 1.5);
        }

        totalCountRef.current += pointsPerFrame;
        insideCountRef.current += frameInside;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    const syncInterval = setInterval(() => {
      setTotalPoints(totalCountRef.current);
      setInsidePoints(insideCountRef.current);
    }, 150);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearInterval(syncInterval);
    };
  }, []);

  const estimatedPi = totalPoints > 0 ? (4 * insidePoints) / totalPoints : 0;
  const errorPercent = estimatedPi > 0 ? Math.abs((estimatedPi - Math.PI) / Math.PI) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              몬테카를로 원주율(π) 난수 투척 시뮬레이터
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              정사각형 내에 무작위 점을 떨어뜨려 내접원 내부 점의 비율(π/4)로 원주율을 계산합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
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
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDropPoints(5000)}
            >
              +5,000개 즉시 투척
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDropPoints(20000)}
            >
              +2만 개 고속
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleReset}
            >
              초기화
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
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
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
              ● 원 내부 점 (Inside: x² + y² ≤ 1)
            </Typography>
            <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>
              ● 원 외부 점 (Outside)
            </Typography>
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
        </Card>

        {/* Right: Pi Estimation & Formula */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              몬테카를로 π 추정치
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                border: 2,
                borderColor: 'primary.main',
                textAlign: 'center',
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 800 }}>
                현재 추정 π = 4 × (N_inside / N_total)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', my: 0.5 }}>
                {totalPoints > 0 ? estimatedPi.toFixed(5) : '3.14159'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                실제 π = 3.141592... (오차율: <b>{errorPercent.toFixed(3)}%</b>)
              </Typography>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  총 투척 점 수
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {totalPoints.toLocaleString()}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  원 내부 점 수
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {insidePoints.toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}
            >
              💡 몬테카를로 방법(Monte Carlo Method)
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              반지름 1인 원의 면적은 π, 한 변의 길이가 2인 외접 정사각형의 면적은 4입니다. 따라서
              정사각형 안에 균등하게 점을 떨어뜨릴 때 원 안에 들어갈 확률은 정확히 π/4 입니다.
              대수의 법칙(Law of Large Numbers)에 의해 점의 수가 무한히 많아질수록 π ≈ 4 × (N_in /
              N)로 정밀하게 수렴합니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
