'use client';

import type { DomainRange } from '../types';

import React, { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';

import { LatexPreview } from './latex-preview';
import {
  analyzeFunction,
  calculateIntegrals,
  createMathEvaluator,
  numericalDerivative,
} from '../utils/math-eval';

// ----------------------------------------------------------------------

interface CalculusStudioProps {
  formula: string;
  domain: DomainRange;
}

type RiemannMethod = 'left' | 'right' | 'mid' | 'trapezoid' | 'simpson';

export function CalculusStudio({ formula, domain }: CalculusStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Integral bounds
  const [intA, setIntA] = useState<number>(-1);
  const [intB, setIntB] = useState<number>(2);
  const [subdivisions, setSubdivisions] = useState<number>(10);
  const [riemannMethod, setRiemannMethod] = useState<RiemannMethod>('trapezoid');

  // Tangent point x0
  const [tangentX, setTangentX] = useState<number>(1.0);
  const [showSecant, setShowSecant] = useState<boolean>(false);
  const [secantDx, setSecantDx] = useState<number>(0.8);

  const evaluator = useMemo(() => createMathEvaluator(formula), [formula]);

  // Numerical analysis summary
  const analysis = useMemo(
    () => analyzeFunction(evaluator, domain.xMin, domain.xMax, 300),
    [evaluator, domain.xMin, domain.xMax]
  );

  // Integral approximations
  const integrals = useMemo(
    () => calculateIntegrals(evaluator, intA, intB, subdivisions),
    [evaluator, intA, intB, subdivisions]
  );

  // Tangent and derivative calculation
  const fx0 = evaluator(tangentX);
  const dfx0 = numericalDerivative(evaluator, tangentX);
  const tangentEqLatex = `y = ${dfx0.toFixed(3)}(x - ${tangentX.toFixed(2)}) + ${fx0.toFixed(3)}`;

  // Draw 2D Calculus visualizer canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth || 600;
      canvas.height = Math.max(340, parent.clientHeight || 340);
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Coordinate mapping
    const xMin = domain.xMin;
    const xMax = domain.xMax;
    const yMin = domain.yMin;
    const yMax = domain.yMax;

    const toPx = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toPy = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      ctx.beginPath();
      ctx.moveTo(toPx(x), 0);
      ctx.lineTo(toPx(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      ctx.beginPath();
      ctx.moveTo(0, toPy(y));
      ctx.lineTo(width, toPy(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    // X Axis (y=0)
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, toPy(0));
      ctx.lineTo(width, toPy(0));
      ctx.stroke();
    }
    // Y Axis (x=0)
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(toPx(0), 0);
      ctx.lineTo(toPx(0), height);
      ctx.stroke();
    }

    // Draw Riemann Sum Rectangles / Trapezoids
    const a = Math.min(intA, intB);
    const b = Math.max(intA, intB);
    const n = Math.max(1, subdivisions);
    const dx = (b - a) / n;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.7)';
    ctx.lineWidth = 1;

    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx;
      const x1 = x0 + dx;

      if (riemannMethod === 'left') {
        const yVal = evaluator(x0);
        const px = toPx(x0);
        const pw = toPx(x1) - px;
        const py = toPy(Math.max(0, yVal));
        const py0 = toPy(0);
        const ph = Math.abs(toPy(yVal) - py0);
        ctx.fillRect(px, yVal >= 0 ? py : py0, pw, ph);
        ctx.strokeRect(px, yVal >= 0 ? py : py0, pw, ph);
      } else if (riemannMethod === 'right') {
        const yVal = evaluator(x1);
        const px = toPx(x0);
        const pw = toPx(x1) - px;
        const py = toPy(Math.max(0, yVal));
        const py0 = toPy(0);
        const ph = Math.abs(toPy(yVal) - py0);
        ctx.fillRect(px, yVal >= 0 ? py : py0, pw, ph);
        ctx.strokeRect(px, yVal >= 0 ? py : py0, pw, ph);
      } else if (riemannMethod === 'mid') {
        const yVal = evaluator((x0 + x1) / 2);
        const px = toPx(x0);
        const pw = toPx(x1) - px;
        const py = toPy(Math.max(0, yVal));
        const py0 = toPy(0);
        const ph = Math.abs(toPy(yVal) - py0);
        ctx.fillRect(px, yVal >= 0 ? py : py0, pw, ph);
        ctx.strokeRect(px, yVal >= 0 ? py : py0, pw, ph);
      } else {
        // Trapezoid
        const y0 = evaluator(x0);
        const y1 = evaluator(x1);
        ctx.beginPath();
        ctx.moveTo(toPx(x0), toPy(0));
        ctx.lineTo(toPx(x0), toPy(y0));
        ctx.lineTo(toPx(x1), toPy(y1));
        ctx.lineTo(toPx(x1), toPy(0));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Draw Function Curve f(x)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const stepPx = 2;
    let started = false;
    for (let px = 0; px <= width; px += stepPx) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = evaluator(x);
      if (isFinite(y)) {
        const py = toPy(y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Draw Tangent Line at x0
    const txMin = xMin;
    const txMax = xMax;
    const tyMin = dfx0 * (txMin - tangentX) + fx0;
    const tyMax = dfx0 * (txMax - tangentX) + fx0;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPx(txMin), toPy(tyMin));
    ctx.lineTo(toPx(txMax), toPy(tyMax));
    ctx.stroke();

    // Draw Tangent Point Dot
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(toPx(tangentX), toPy(fx0), 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Secant line if enabled
    if (showSecant) {
      const xSec2 = tangentX + secantDx;
      const ySec2 = evaluator(xSec2);
      const secSlope = (ySec2 - fx0) / secantDx;
      const sy1 = secSlope * (txMin - tangentX) + fx0;
      const sy2 = secSlope * (txMax - tangentX) + fx0;

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toPx(txMin), toPy(sy1));
      ctx.lineTo(toPx(txMax), toPy(sy2));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.arc(toPx(xSec2), toPy(ySec2), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mark roots with green dots
    analysis.roots.forEach((root) => {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(toPx(root), toPy(0), 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [
    evaluator,
    domain,
    intA,
    intB,
    subdivisions,
    riemannMethod,
    tangentX,
    showSecant,
    secantDx,
    fx0,
    dfx0,
    analysis.roots,
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top Analysis Badges */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <Card
          sx={{ p: 1.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            영점 / 근 (Roots, f(x)=0)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {analysis.roots.length > 0 ? (
              analysis.roots.map((r) => (
                <Chip
                  key={r}
                  label={`x = ${r}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                구간 내 영점 없음
              </Typography>
            )}
          </Box>
        </Card>

        <Card
          sx={{ p: 1.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            y 절편 (y-intercept)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
            {analysis.yIntercept !== null ? `(0, ${analysis.yIntercept})` : '정의되지 않음'}
          </Typography>
        </Card>

        <Card
          sx={{ p: 1.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            극값 점 (Extrema, f&apos;(x)=0)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {analysis.extrema.length > 0 ? (
              analysis.extrema.map((e, idx) => (
                <Chip
                  key={idx}
                  label={`${e.type === 'max' ? '극대' : '극소'} (${e.x}, ${e.y})`}
                  size="small"
                  color={e.type === 'max' ? 'error' : 'info'}
                  sx={{ fontWeight: 600 }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                극값 없음
              </Typography>
            )}
          </Box>
        </Card>

        <Card
          sx={{ p: 1.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            사다리꼴 정적분 (∫ f(x) dx)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mt: 0.5 }}>
            ≈ {integrals.trapezoidal.toFixed(4)}
          </Typography>
        </Card>
      </Box>

      {/* Interactive Visualizer Canvas & Controls */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2,
        }}
      >
        {/* Visualizer Canvas */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 380,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <AutoGraphRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                접선 및 리만 합 적분 시각화
              </Typography>
            </Box>

            <ToggleButtonGroup
              size="small"
              value={riemannMethod}
              exclusive
              onChange={(_, val) => val && setRiemannMethod(val)}
            >
              <ToggleButton value="left" sx={{ textTransform: 'none', px: 1, fontSize: '0.75rem' }}>
                좌단점
              </ToggleButton>
              <ToggleButton value="mid" sx={{ textTransform: 'none', px: 1, fontSize: '0.75rem' }}>
                중점
              </ToggleButton>
              <ToggleButton
                value="right"
                sx={{ textTransform: 'none', px: 1, fontSize: '0.75rem' }}
              >
                우단점
              </ToggleButton>
              <ToggleButton
                value="trapezoid"
                sx={{ textTransform: 'none', px: 1, fontSize: '0.75rem' }}
              >
                사다리꼴
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              minHeight: 320,
              borderRadius: 1.5,
              overflow: 'hidden',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
        </Card>

        {/* Sidebar Controls for Calculus */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Tangent Explorer */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <InsightsRoundedIcon color="error" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                접선 (Tangent) 탐색기
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                접점 x₀ = {tangentX.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                f&apos;({tangentX.toFixed(2)}) = {dfx0.toFixed(3)}
              </Typography>
            </Box>

            <Slider
              size="small"
              value={tangentX}
              min={domain.xMin + 0.5}
              max={domain.xMax - 0.5}
              step={0.1}
              onChange={(_, val) => setTangentX(val as number)}
              color="error"
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                할선 (Secant Line, Δx={secantDx.toFixed(1)})
              </Typography>
              <Switch
                size="small"
                checked={showSecant}
                onChange={(e) => setShowSecant(e.target.checked)}
                color="secondary"
              />
            </Box>

            {showSecant && (
              <Slider
                size="small"
                value={secantDx}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(_, val) => setSecantDx(val as number)}
                color="secondary"
              />
            )}

            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LatexPreview latex={tangentEqLatex} fontSize="0.85rem" />
            </Box>
          </Box>

          {/* Definite Integral Bounds & Riemann Sums */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              pt: 1.5,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <CalculateRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                정적분 구간 및 리만합 분할
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <TextField
                size="small"
                label="시작 a"
                type="number"
                value={intA}
                onChange={(e) => setIntA(Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="종료 b"
                type="number"
                value={intB}
                onChange={(e) => setIntB(Number(e.target.value))}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                분할 수 N: {subdivisions}
              </Typography>
              <Slider
                size="small"
                value={subdivisions}
                min={2}
                max={50}
                step={1}
                onChange={(_, val) => setSubdivisions(val as number)}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            {/* Comparison Table for Riemann vs Trapezoid vs Simpson */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.6,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>좌단점 합 (Left):</span>
                <strong>{integrals.riemannLeft.toFixed(4)}</strong>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>중점 합 (Mid):</span>
                <strong>{integrals.riemannMid.toFixed(4)}</strong>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>우단점 합 (Right):</span>
                <strong>{integrals.riemannRight.toFixed(4)}</strong>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'primary.main' }}>
                <span>사다리꼴 (Trapezoid):</span>
                <strong>{integrals.trapezoidal.toFixed(4)}</strong>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', color: 'secondary.main' }}
              >
                <span>심슨 공식 (Simpson):</span>
                <strong>{integrals.simpson.toFixed(4)}</strong>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
