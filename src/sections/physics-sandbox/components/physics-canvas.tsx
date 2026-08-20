'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import type { PhysicsBody, DoublePendulumState } from '../types';
import { updatePhysicsBodies, stepDoublePendulum } from '../utils/physics-engine';

// ----------------------------------------------------------------------

const INITIAL_PENDULUM: DoublePendulumState = {
  l1: 110,
  l2: 100,
  m1: 15,
  m2: 15,
  theta1: Math.PI / 2,
  theta2: Math.PI / 2,
  omega1: 0,
  omega2: 0,
  trace: [],
};

export function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'rigid' | 'pendulum'>('rigid');
  const [gravity, setGravity] = useState<number>(0.4);
  const [restitution, setRestitution] = useState<number>(0.75); // Bounciness
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Rigid bodies
  const [bodies, setBodies] = useState<PhysicsBody[]>([
    {
      id: '1',
      type: 'circle',
      x: 200,
      y: 100,
      vx: 5,
      vy: 0,
      radius: 22,
      mass: 1,
      restitution: 0.8,
      color: '#38bdf8',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 150,
      vx: -3,
      vy: 2,
      radius: 28,
      mass: 2,
      restitution: 0.75,
      color: '#ec4899',
    },
    {
      id: '3',
      type: 'circle',
      x: 500,
      y: 80,
      vx: -4,
      vy: 0,
      radius: 18,
      mass: 0.8,
      restitution: 0.9,
      color: '#eab308',
    },
  ]);

  // Double pendulum
  const pendulumRef = useRef<DoublePendulumState>(INITIAL_PENDULUM);

  const handleAddBall = () => {
    const colors = ['#38bdf8', '#ec4899', '#eab308', '#22c55e', '#a855f7', '#f97316'];
    const newBody: PhysicsBody = {
      id: Date.now().toString(),
      type: 'circle',
      x: 100 + Math.random() * 400,
      y: 50 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * 4,
      radius: 16 + Math.random() * 16,
      mass: 1,
      restitution,
      color: colors[Math.floor(Math.random() * colors.length)] || '#38bdf8',
    };
    setBodies((prev) => [...prev, newBody]);
  };

  // Main 60fps animation loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (mode === 'rigid') {
        if (isRunning) {
          setBodies((prev) => updatePhysicsBodies(prev, gravity, width, height));
        }

        // Draw rigid bodies
        bodies.forEach((b) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius || 20, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          // Shiny 3D highlight
          ctx.beginPath();
          ctx.arc(
            b.x - (b.radius || 20) * 0.3,
            b.y - (b.radius || 20) * 0.3,
            (b.radius || 20) * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
          ctx.restore();
        });
      } else {
        // Double Pendulum Mode
        if (isRunning) {
          pendulumRef.current = stepDoublePendulum(pendulumRef.current);
        }

        const p = pendulumRef.current;
        const originX = width / 2;
        const originY = 120;

        const x1 = originX + p.l1 * Math.sin(p.theta1);
        const y1 = originY + p.l1 * Math.cos(p.theta1);
        const x2 = x1 + p.l2 * Math.sin(p.theta2);
        const y2 = y1 + p.l2 * Math.cos(p.theta2);

        // 1. Draw glowing chaos trace
        if (p.trace.length > 1) {
          ctx.beginPath();
          ctx.moveTo(originX + p.trace[0]!.x, originY + p.trace[0]!.y);
          for (let i = 1; i < p.trace.length; i++) {
            ctx.lineTo(originX + p.trace[i]!.x, originY + p.trace[i]!.y);
          }
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 2. Draw Rods
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 3. Draw Masses (Bobs)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x1, y1, p.m1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(x2, y2, p.m2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, isRunning, gravity, bodies]);

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>물리 시뮬레이션 모드</InputLabel>
            <Select
              value={mode}
              label="물리 시뮬레이션 모드"
              onChange={(e) => setMode(e.target.value as 'rigid' | 'pendulum')}
            >
              <MenuItem value="rigid">2D 강체 탄성 충돌 샌드박스</MenuItem>
              <MenuItem value="pendulum">이중 진자(Double Pendulum) 카오스</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color={isRunning ? 'warning' : 'primary'}
            startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => setIsRunning((prev) => !prev)}
            sx={{ fontWeight: 800 }}
          >
            {isRunning ? '일시 정지' : '시뮬레이션 재생'}
          </Button>

          {mode === 'rigid' ? (
            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddBall}>
              공 추가 (Drop Ball)
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                pendulumRef.current = {
                  ...INITIAL_PENDULUM,
                  theta1: Math.PI / 2 + (Math.random() - 0.5),
                  theta2: Math.PI / 2 + (Math.random() - 0.5),
                  trace: [],
                };
              }}
            >
              새로운 초기 각도로 리셋
            </Button>
          )}

          {mode === 'rigid' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepRoundedIcon />}
              onClick={() => setBodies([])}
            >
              초기화
            </Button>
          )}
        </Box>

        {/* Gravity Slider (for rigid mode) */}
        {mode === 'rigid' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 220 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 60 }}>
              중력 가속도:
            </Typography>
            <Slider
              size="small"
              value={gravity}
              min={0}
              max={1.2}
              step={0.1}
              onChange={(_, v) => setGravity(v as number)}
            />
          </Box>
        )}
      </Box>

      {/* 2. Interactive Canvas */}
      <Box
        sx={{
          bgcolor: '#0f172a',
          borderRadius: 2,
          border: '1.5px solid #1e293b',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={720}
          height={460}
          style={{ width: '100%', maxWidth: 720, height: 'auto' }}
        />
      </Box>
    </Card>
  );
}
