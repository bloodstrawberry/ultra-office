'use client';

import type { ChaosShape } from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

// ----------------------------------------------------------------------

export function ChaosGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [shape, setShape] = useState<ChaosShape>('barnsley-fern');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const pointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const totalCountRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;

  // Clear & Reset
  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    pointRef.current = { x: 0, y: 0 };
    totalCountRef.current = 0;
    setTotalPoints(0);
  }, []);

  useEffect(() => {
    handleReset();
  }, [shape, handleReset]);

  // Step calculations
  const calculateNextPoint = useCallback(
    (current: { x: number; y: number }): { x: number; y: number; color: string } => {
      if (shape === 'barnsley-fern') {
        const r = Math.random();
        let nx = 0;
        let ny = 0;
        let col = '#10B981';

        if (r < 0.01) {
          // Stem
          nx = 0;
          ny = 0.16 * current.y;
          col = '#34D399';
        } else if (r < 0.86) {
          // Main successive leaflets
          nx = 0.85 * current.x + 0.04 * current.y;
          ny = -0.04 * current.x + 0.85 * current.y + 1.6;
          col = '#10B981';
        } else if (r < 0.93) {
          // Largest left leaflet
          nx = 0.2 * current.x - 0.26 * current.y;
          ny = 0.23 * current.x + 0.22 * current.y + 1.6;
          col = '#6EE7B7';
        } else {
          // Largest right leaflet
          nx = -0.15 * current.x + 0.28 * current.y;
          ny = 0.26 * current.x + 0.24 * current.y + 0.44;
          col = '#A7F3D0';
        }

        return { x: nx, y: ny, color: col };
      }

      // Sierpinski Triangle (Chaos Game on 3 vertices)
      const vertices = [
        { x: 0, y: 1 },
        { x: -0.866, y: -0.5 },
        { x: 0.866, y: -0.5 },
      ];
      const targetVertex = vertices[Math.floor(Math.random() * 3)];
      const nx = (current.x + targetVertex.x) / 2;
      const ny = (current.y + targetVertex.y) / 2;
      return { x: nx, y: ny, color: '#38BDF8' };
    },
    [shape]
  );

  // Fast forward instant batch
  const handleInstantBatch = (count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    let curr = pointRef.current;
    for (let i = 0; i < count; i += 1) {
      const next = calculateNextPoint(curr);
      curr = { x: next.x, y: next.y };

      let px = 0;
      let py = 0;
      if (shape === 'barnsley-fern') {
        px = width / 2 + curr.x * (width / 6);
        py = height - 20 - curr.y * (height / 11);
      } else {
        px = width / 2 + curr.x * (width / 2.3);
        py = height / 2 - curr.y * (height / 2.3);
      }

      ctx.fillStyle = next.color;
      ctx.fillRect(px, py, 1.2, 1.2);
    }

    pointRef.current = curr;
    totalCountRef.current += count;
    setTotalPoints(totalCountRef.current);
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const render = () => {
      if (isRunningRef.current) {
        const width = canvas.width;
        const height = canvas.height;

        let curr = pointRef.current;
        const pointsPerFrame = 250;

        for (let i = 0; i < pointsPerFrame; i += 1) {
          const next = calculateNextPoint(curr);
          curr = { x: next.x, y: next.y };

          let px = 0;
          let py = 0;
          if (shape === 'barnsley-fern') {
            px = width / 2 + curr.x * (width / 6);
            py = height - 20 - curr.y * (height / 11);
          } else {
            px = width / 2 + curr.x * (width / 2.3);
            py = height / 2 - curr.y * (height / 2.3);
          }

          ctx.fillStyle = next.color;
          ctx.fillRect(px, py, 1.2, 1.2);
        }

        pointRef.current = curr;
        totalCountRef.current += pointsPerFrame;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    const syncInterval = setInterval(() => {
      setTotalPoints(totalCountRef.current);
    }, 150);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearInterval(syncInterval);
    };
  }, [shape, calculateNextPoint]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
              카오스 게임 & 아핀 변환 프랙탈 (Chaos Game & Barnsley Fern)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              무작위로 던져진 수만 개의 점들이 프랙탈 고사리 잎과 삼각형으로 스스로 질서를
              형성합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="chaos-shape-label">프랙탈 모형 선택</InputLabel>
              <Select
                labelId="chaos-shape-label"
                value={shape}
                label="프랙탈 모형 선택"
                onChange={(e) => setShape(e.target.value as ChaosShape)}
              >
                <MenuItem value="barnsley-fern">1. 바른슬리 고사리 (Barnsley Fern)</MenuItem>
                <MenuItem value="sierpinski">2. 시에르핀스키 삼각형 (Sierpinski)</MenuItem>
              </Select>
            </FormControl>

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
              onClick={() => handleInstantBatch(10000)}
            >
              +1만 개 즉시 투척
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
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
              maxWidth: 640,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={450}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5 }}>
            누적 투척 점 수: <b>{totalPoints.toLocaleString()}개</b>
          </Typography>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'success.main' }}>
              🌿 바른슬리 고사리(Barnsley Fern)의 기적
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              영국 수학자 마이클 바른슬리가 고안한 4개의 단순한 2x2 행렬 아핀 변환(줄기 1%, 주
              잎사귀 85%, 좌측 잎 7%, 우측 잎 7%)에 무작위 난수를 대입해 점을 찍으면, 실제 자연에
              존재하는 식물 잎사귀와 100% 동일한 자기 유사 프랙탈 구조가 저절로 나타납니다.
            </Typography>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
              🔺 카오스 게임(Chaos Game)이란?
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              삼각형의 세 꼭짓점 중 하나를 주사위로 무작위 선택하여 현재 위치에서 그 꼭짓점 방향으로
              정확히 절반(1/2)만큼 이동하는 것을 반복하면, 놀랍게도 어지러운 무작위 점 대신 완벽한
              <b>시에르핀스키 삼각형(Sierpinski Triangle)</b>이 창발합니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
