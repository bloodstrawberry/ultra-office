'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

// ----------------------------------------------------------------------

interface Needle {
  x: number;
  y: number;
  angle: number;
  isCross: boolean;
}

export function BuffonNeedleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [needles, setNeedles] = useState<Needle[]>([]);
  const [totalDropped, setTotalDropped] = useState<number>(0);
  const [crossedCount, setCrossedCount] = useState<number>(0);

  const lineSpacing = 40; // D
  const needleLength = 30; // L (L <= D)

  // Reset
  const handleReset = useCallback(() => {
    setNeedles([]);
    setTotalDropped(0);
    setCrossedCount(0);
  }, []);

  // Drop needles batch
  const handleDropNeedles = useCallback(
    (count: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      const newNeedles: Needle[] = [];
      let newCrosses = 0;

      for (let i = 0; i < count; i += 1) {
        const x = Math.random() * (width - 40) + 20;
        const y = Math.random() * (height - 40) + 20;
        const angle = Math.random() * Math.PI; // 0 to pi

        // Vertical distance from center to nearest parallel line
        const distToLine =
          y % lineSpacing > lineSpacing / 2 ? lineSpacing - (y % lineSpacing) : y % lineSpacing;
        const halfProj = (needleLength / 2) * Math.sin(angle);
        const isCross = halfProj >= distToLine;

        if (isCross) newCrosses += 1;
        newNeedles.push({ x, y, angle, isCross });
      }

      setNeedles((prev) => {
        const combined = [...prev, ...newNeedles];
        return combined.slice(-1500); // keep at most 1500 visible on canvas
      });
      setTotalDropped((prev) => prev + count);
      setCrossedCount((prev) => prev + newCrosses);
    },
    [lineSpacing, needleLength]
  );

  useEffect(() => {
    handleDropNeedles(50);
  }, [handleDropNeedles]);

  // Estimated Pi
  // P = (2 * L) / (pi * D) => pi = (2 * L * N) / (D * C)
  const estimatedPi =
    crossedCount > 0 ? (2 * needleLength * totalDropped) / (lineSpacing * crossedCount) : 0;
  const errorPercent = estimatedPi > 0 ? Math.abs((estimatedPi - Math.PI) / Math.PI) * 100 : 0;

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Parallel Lines (Spacing D)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let y = 0; y <= height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Needles
    needles.forEach((n) => {
      const dx = (needleLength / 2) * Math.cos(n.angle);
      const dy = (needleLength / 2) * Math.sin(n.angle);

      ctx.beginPath();
      ctx.moveTo(n.x - dx, n.y - dy);
      ctx.lineTo(n.x + dx, n.y + dy);

      ctx.strokeStyle = n.isCross ? '#10B981' : '#38BDF8'; // Green for cross, blue for non-cross
      ctx.lineWidth = n.isCross ? 2 : 1.2;
      ctx.stroke();
    });
  }, [needles, lineSpacing, needleLength]);

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
              뷔퐁의 바늘 (Buffon&apos;s Needle Problem)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              평행선 격자에 바늘을 무작위로 던져 선과 교차하는 확률로 원주율(π)을 역산합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDropNeedles(100)}
            >
              +100개 투척
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDropNeedles(1000)}
            >
              +1,000개
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDropNeedles(10000)}
            >
              +1만 개 고속
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
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
              ● 녹색 바늘: 선과 교차 (Crossed)
            </Typography>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>
              ● 청색 바늘: 교차하지 않음
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
            }}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={380}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
        </Card>

        {/* Right: Estimated Pi & Stats */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              원주율 (π) 추정 통계
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
                뷔퐁 공식 추정 π 값
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', my: 0.5 }}>
                {totalDropped > 0 ? estimatedPi.toFixed(5) : '3.14159'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                실제 π = 3.141592... (오차: <b>{errorPercent.toFixed(2)}%</b>)
              </Typography>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  누적 바늘 수 (N)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {totalDropped.toLocaleString()}개
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  교차 횟수 (C)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {crossedCount.toLocaleString()}회
                </Typography>
              </Paper>
            </Box>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}
            >
              💡 뷔퐁의 바늘(Buffon&apos;s Needle) 공식
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              1777년 프랑스 수학자 조르주루이 르클레르 드 뷔퐁 백작이 제시한 기하 확률 문제입니다.
              선 간격 D, 바늘 길이 L일 때 교차 확률은 P = (2L) / (πD)가 되므로, 역으로 π = (2L × N)
              / (D × C)을 통해 바늘을 던져 원주율 π를 직접 계산할 수 있습니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
