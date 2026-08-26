'use client';

import type { PhysicsBody, CelestialBody, DoublePendulumState } from '../types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import {
  stepDoublePendulum,
  stepCelestialBodies,
  updatePhysicsBodies,
} from '../utils/physics-engine';

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

const ORBITAL_PRESETS: Record<string, CelestialBody[]> = {
  sunEarthMoon: [
    {
      id: 'sun',
      name: '태양 (Sun)',
      x: 360,
      y: 230,
      vx: 0,
      vy: 0,
      mass: 800,
      radius: 20,
      color: '#facc15',
      trail: [],
    },
    {
      id: 'earth',
      name: '지구 (Earth)',
      x: 360,
      y: 90,
      vx: 2.6,
      vy: 0,
      mass: 25,
      radius: 8,
      color: '#38bdf8',
      trail: [],
    },
    {
      id: 'moon',
      name: '달 (Moon)',
      x: 360,
      y: 68,
      vx: 3.4,
      vy: 0,
      mass: 1.5,
      radius: 4,
      color: '#e2e8f0',
      trail: [],
    },
  ],
  figure8: [
    {
      id: 'body1',
      name: '항성 1',
      x: 360 - 120,
      y: 230,
      vx: 0.46,
      vy: 0.43,
      mass: 300,
      radius: 12,
      color: '#ef4444',
      trail: [],
    },
    {
      id: 'body2',
      name: '항성 2',
      x: 360 + 120,
      y: 230,
      vx: 0.46,
      vy: 0.43,
      mass: 300,
      radius: 12,
      color: '#3b82f6',
      trail: [],
    },
    {
      id: 'body3',
      name: '항성 3',
      x: 360,
      y: 230,
      vx: -0.92,
      vy: -0.86,
      mass: 300,
      radius: 12,
      color: '#22c55e',
      trail: [],
    },
  ],
  trisolaris: [
    {
      id: 'star1',
      name: '주성 Alpha',
      x: 280,
      y: 200,
      vx: 0,
      vy: 1.2,
      mass: 450,
      radius: 15,
      color: '#f97316',
      trail: [],
    },
    {
      id: 'star2',
      name: '주성 Beta',
      x: 440,
      y: 200,
      vx: 0,
      vy: -1.2,
      mass: 450,
      radius: 15,
      color: '#a855f7',
      trail: [],
    },
    {
      id: 'star3',
      name: '주성 Gamma',
      x: 360,
      y: 330,
      vx: -1.0,
      vy: 0,
      mass: 380,
      radius: 13,
      color: '#ec4899',
      trail: [],
    },
    {
      id: 'trisolaris_planet',
      name: '삼체 행성 (Trisolaris)',
      x: 360,
      y: 130,
      vx: 2.1,
      vy: 0,
      mass: 1,
      radius: 5,
      color: '#22d3ee',
      trail: [],
    },
  ],
};

export function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'rigid' | 'pendulum' | 'orbital'>('rigid');
  const [gravity, setGravity] = useState<number>(0.4);
  const [restitution] = useState<number>(0.75);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [orbitalPreset, setOrbitalPreset] = useState<string>('sunEarthMoon');

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

  // Celestial N-body
  const celestialRef = useRef<CelestialBody[]>(
    ORBITAL_PRESETS.sunEarthMoon.map((b) => ({
      ...b,
      trail: [],
    }))
  );

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

  const handleSelectOrbitalPreset = (presetKey: string) => {
    setOrbitalPreset(presetKey);
    const selected = ORBITAL_PRESETS[presetKey] || ORBITAL_PRESETS.sunEarthMoon;
    celestialRef.current = selected.map((b) => ({
      ...b,
      trail: [],
    }));
  };

  // Main 60fps animation loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;
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
      } else if (mode === 'pendulum') {
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
          ctx.moveTo(originX + p.trace[0].x, originY + p.trace[0].y);
          for (let i = 1; i < p.trace.length; i += 1) {
            ctx.lineTo(originX + p.trace[i].x, originY + p.trace[i].y);
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
      } else if (mode === 'orbital') {
        // N-Body Celestial Orbital Gravitational Simulation
        if (isRunning) {
          celestialRef.current = stepCelestialBodies(celestialRef.current);
        }

        const celestialBodies = celestialRef.current;

        // Draw Trails
        celestialBodies.forEach((b) => {
          if (b.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(b.trail[0].x, b.trail[0].y);
            for (let i = 1; i < b.trail.length; i += 1) {
              ctx.lineTo(b.trail[i].x, b.trail[i].y);
            }
            ctx.strokeStyle = `${b.color}77`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        });

        // Draw Celestial Bodies
        celestialBodies.forEach((b) => {
          ctx.save();

          // Outer Glow
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${b.color}33`;
          ctx.fill();

          // Body Sphere
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          // Shiny 3D highlight
          ctx.beginPath();
          ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          // Name label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.name, b.x, b.y - b.radius - 6);

          ctx.restore();
        });
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>물리 시뮬레이션 모드</InputLabel>
            <Select
              value={mode}
              label="물리 시뮬레이션 모드"
              onChange={(e) => setMode(e.target.value as 'rigid' | 'pendulum' | 'orbital')}
            >
              <MenuItem value="rigid">2D 강체 탄성 충돌 샌드박스</MenuItem>
              <MenuItem value="pendulum">이중 진자(Double Pendulum) 카오스</MenuItem>
              <MenuItem value="orbital">N체 천체 중력 & 궤도 시뮬레이션</MenuItem>
            </Select>
          </FormControl>

          {mode === 'orbital' && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>천체 궤도 프리셋</InputLabel>
              <Select
                value={orbitalPreset}
                label="천체 궤도 프리셋"
                onChange={(e) => handleSelectOrbitalPreset(e.target.value)}
              >
                <MenuItem value="sunEarthMoon">태양-지구-달 (계층 궤도)</MenuItem>
                <MenuItem value="figure8">8자 궤도 삼체 안무 (Figure-8)</MenuItem>
                <MenuItem value="trisolaris">삼체 카오스 (Trisolaris)</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            color={isRunning ? 'warning' : 'primary'}
            startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => setIsRunning((prev) => !prev)}
            sx={{ fontWeight: 800 }}
          >
            {isRunning ? '일시 정지' : '시뮬레이션 재생'}
          </Button>

          {mode === 'rigid' && (
            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddBall}>
              공 추가 (Drop Ball)
            </Button>
          )}

          {mode === 'pendulum' && (
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

          {mode === 'orbital' && (
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => handleSelectOrbitalPreset(orbitalPreset)}
            >
              궤도 초기화
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
          bgcolor: '#070b14',
          borderRadius: 2,
          border: '1.5px solid #1e293b',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={460}
          style={{ width: '100%', maxWidth: 760, height: 'auto' }}
        />
      </Box>
    </Card>
  );
}
