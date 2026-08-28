'use client';

import type { OpticsMedium } from '../types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// ----------------------------------------------------------------------

const MEDIA: OpticsMedium[] = [
  { name: '공기 (Air, n=1.000)', n: 1.0 },
  { name: '물 (Water, n=1.333)', n: 1.333 },
  { name: '유리 (Crown Glass, n=1.520)', n: 1.52 },
  { name: '다이아몬드 (Diamond, n=2.417)', n: 2.417 },
];

export function SnellOpticsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [medium1Index, setMedium1Index] = useState<number>(1.52); // Glass default
  const [medium2Index, setMedium2Index] = useState<number>(1.0); // Air default (easy to show TIR)
  const [incidentAngleDeg, setIncidentAngleDeg] = useState<number>(30); // 0 to 85 deg
  const [mode, setMode] = useState<'refraction' | 'prism'>('refraction');

  // Calculations
  const n1 = medium1Index;
  const n2 = medium2Index;
  const theta1Rad = (incidentAngleDeg * Math.PI) / 180;

  // Critical angle (only exists when n1 > n2)
  const isTirPossible = n1 > n2;
  const criticalAngleDeg = isTirPossible ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
  const isTir = isTirPossible && sinTheta2 > 1.0;
  const refractedAngleDeg = isTir ? null : (Math.asin(sinTheta2) * 180) / Math.PI;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (mode === 'refraction') {
      const boundaryY = height / 2;

      // Medium 1 (Top)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, boundaryY);

      // Medium 2 (Bottom)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, boundaryY, width, boundaryY);

      // Boundary Line
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, boundaryY);
      ctx.lineTo(width, boundaryY);
      ctx.stroke();

      // Normal Line (Dashed vertical)
      const cx = width / 2;
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, height - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      const rayLength = 160;

      // 1. Incident Ray (Top-Left towards center)
      const incStartX = cx - rayLength * Math.sin(theta1Rad);
      const incStartY = boundaryY - rayLength * Math.cos(theta1Rad);

      ctx.strokeStyle = '#EF4444'; // Red laser
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(incStartX, incStartY);
      ctx.lineTo(cx, boundaryY);
      ctx.stroke();

      // 2. Reflected Ray (Top-Right)
      const refEndX = cx + rayLength * Math.sin(theta1Rad);
      const refEndY = boundaryY - rayLength * Math.cos(theta1Rad);

      ctx.strokeStyle = isTir ? '#EF4444' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = isTir ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, boundaryY);
      ctx.lineTo(refEndX, refEndY);
      ctx.stroke();

      // 3. Refracted Ray (Bottom-Right)
      if (!isTir && refractedAngleDeg !== null) {
        const theta2Rad = (refractedAngleDeg * Math.PI) / 180;
        const refrEndX = cx + rayLength * Math.sin(theta2Rad);
        const refrEndY = boundaryY + rayLength * Math.cos(theta2Rad);

        ctx.strokeStyle = '#38BDF8'; // Blue refracted
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, boundaryY);
        ctx.lineTo(refrEndX, refrEndY);
        ctx.stroke();
      }

      // Labels & Text
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`매질 1 (n₁ = ${n1.toFixed(3)}) - 입사각: ${incidentAngleDeg}°`, 20, 30);
      ctx.fillText(
        `매질 2 (n₂ = ${n2.toFixed(3)}) - ${
          isTir ? '🚨 전반사 발생 (TIR)' : `굴절각: ${refractedAngleDeg?.toFixed(1)}°`
        }`,
        20,
        boundaryY + 30
      );
    } else {
      // Prism Dispersion Mode
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Draw Glass Prism Triangle
      const p1 = { x: width / 2, y: 60 };
      const p2 = { x: width / 2 - 140, y: height - 60 };
      const p3 = { x: width / 2 + 140, y: height - 60 };

      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Incoming White Beam
      const hitX = width / 2 - 70;
      const hitY = height / 2 + 20;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, hitY + 20);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();

      // Rainbow Dispersion Rays Out of Prism
      const rainbow = [
        { color: '#EF4444', dev: -15, label: 'Red (700nm)' },
        { color: '#F97316', dev: -10, label: 'Orange' },
        { color: '#F59E0B', dev: -5, label: 'Yellow' },
        { color: '#10B981', dev: 0, label: 'Green (532nm)' },
        { color: '#06B6D4', dev: 5, label: 'Cyan' },
        { color: '#3B82F6', dev: 10, label: 'Blue' },
        { color: '#8B5CF6', dev: 15, label: 'Violet (400nm)' },
      ];

      const exitX = width / 2 + 70;
      const exitY = height / 2 + 20;

      rainbow.forEach((band) => {
        // Internal beam
        ctx.strokeStyle = band.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(exitX, exitY + band.dev * 0.4);
        ctx.stroke();

        // Dispersed exit beam
        ctx.beginPath();
        ctx.moveTo(exitX, exitY + band.dev * 0.4);
        ctx.lineTo(width - 30, exitY + band.dev * 4 + 40);
        ctx.stroke();
      });

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('백색광 (White Light)', 40, hitY - 10);
      ctx.fillText('무지개 스펙트럼 분산 (Rainbow Spectrum)', width - 240, 40);
    }
  }, [
    medium1Index,
    medium2Index,
    incidentAngleDeg,
    mode,
    n1,
    n2,
    theta1Rad,
    isTir,
    refractedAngleDeg,
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1.2fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Medium 1 Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="m1-label">매질 1 (입사 매질)</InputLabel>
            <Select
              labelId="m1-label"
              value={medium1Index}
              label="매질 1 (입사 매질)"
              onChange={(e) => setMedium1Index(Number(e.target.value))}
            >
              {MEDIA.map((m) => (
                <MenuItem key={m.name} value={m.n}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Medium 2 Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="m2-label">매질 2 (굴절 매질)</InputLabel>
            <Select
              labelId="m2-label"
              value={medium2Index}
              label="매질 2 (굴절 매질)"
              onChange={(e) => setMedium2Index(Number(e.target.value))}
            >
              {MEDIA.map((m) => (
                <MenuItem key={m.name} value={m.n}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Incident Angle Slider */}
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                입사각 (θ₁): {incidentAngleDeg}°
              </Typography>
              {isTir && <Chip size="small" label="전반사 (TIR)" color="error" />}
            </Box>
            <Slider
              value={incidentAngleDeg}
              min={0}
              max={85}
              step={1}
              marks={[
                { value: 0, label: '0°' },
                { value: criticalAngleDeg ? Math.round(criticalAngleDeg) : 42, label: '임계각' },
                { value: 85, label: '85°' },
              ]}
              onChange={(_, v) => setIncidentAngleDeg(v as number)}
            />
          </Box>

          {/* Mode Toggle */}
          <FormControl fullWidth size="small">
            <InputLabel id="optics-mode-label">실험 모드</InputLabel>
            <Select
              labelId="optics-mode-label"
              value={mode}
              label="실험 모드"
              onChange={(e) => setMode(e.target.value as 'refraction' | 'prism')}
            >
              <MenuItem value="refraction">1. 스넬의 법칙 & 전반사</MenuItem>
              <MenuItem value="prism">2. 프리즘 무지개 분산</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Main Canvas */}
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
            💡 스넬의 법칙(Snell&apos;s Law)과 광통신의 원리
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            굴절률이 큰 매질에서 작은 매질로 빛이 진행할 때(예: 유리 → 공기), 입사각이 임계각(θc ={' '}
            {criticalAngleDeg ? `${criticalAngleDeg.toFixed(1)}°` : '없음'})을 초과하면 빛이
            굴절하지 않고 100% 반사되는 <b>전반사(Total Internal Reflection)</b>가 발생합니다. 이
            원리를 이용해 빛 신호를 손실 없이 수천 km 전송하는 것이 바로{' '}
            <b>광섬유(Optical Fiber) 인터넷</b>입니다.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
