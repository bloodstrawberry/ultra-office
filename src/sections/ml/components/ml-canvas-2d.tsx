'use client';

import type { DataPoint2D } from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

// ----------------------------------------------------------------------

interface MlCanvas2DProps {
  points: DataPoint2D[];
  onPointsChange?: (newPoints: DataPoint2D[]) => void;
  onResetPreset?: () => void;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
  mode: 'regression' | 'classification' | 'clustering' | 'pca';
  // Optional render callbacks
  renderCurve?: (x: number) => number;
  renderDecisionField?: (x: number, y: number) => number; // returns prob [0, 1] or class
  centroids?: { x: number; y: number }[];
  pcaVectors?: {
    meanX: number;
    meanY: number;
    v1: [number, number];
    v2: [number, number];
    lambda1: number;
    lambda2: number;
  };
  pcaProjection?: (x: number, y: number) => { projX: number; projY: number };
  activeClass?: number;
  onActiveClassChange?: (cls: number) => void;
  height?: number | string;
  showResiduals?: boolean;
}

const CLASS_COLORS = ['#2563EB', '#DC2626', '#10B981', '#F59E0B', '#8B5CF6'];

export function MlCanvas2D({
  points,
  onPointsChange,
  onResetPreset,
  bounds = { minX: -6, maxX: 6, minY: -6, maxY: 6 },
  mode,
  renderCurve,
  renderDecisionField,
  centroids,
  pcaVectors,
  pcaProjection,
  activeClass = 0,
  onActiveClassChange,
  height = 460,
  showResiduals = true,
}: MlCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 460,
  });

  // Coordinate Conversion Helpers
  const { minX, maxX, minY, maxY } = bounds;

  const toCanvasX = useCallback(
    (x: number, w: number) => ((x - minX) / (maxX - minX)) * w,
    [minX, maxX]
  );
  const toCanvasY = useCallback(
    (y: number, h: number) => h - ((y - minY) / (maxY - minY)) * h,
    [minY, maxY]
  );
  const toMathX = useCallback(
    (cx: number, w: number) => minX + (cx / w) * (maxX - minX),
    [minX, maxX]
  );
  const toMathY = useCallback(
    (cy: number, h: number) => minY + ((h - cy) / h) * (maxY - minY),
    [minY, maxY]
  );

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height) || 460,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main Draw Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: w, height: h } = dimensions;
    if (w <= 0 || h <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // 1. Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, w, h);

    // 2. Decision Field Heatmap (Classification mode)
    if (mode === 'classification' && renderDecisionField) {
      const step = 8;
      for (let cx = 0; cx < w; cx += step) {
        const mx = toMathX(cx + step / 2, w);
        for (let cy = 0; cy < h; cy += step) {
          const my = toMathY(cy + step / 2, h);
          const prob = renderDecisionField(mx, my);
          // Red for 1, Blue for 0
          if (prob >= 0.5) {
            const alpha = Math.min(0.28, (prob - 0.5) * 0.55);
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
          } else {
            const alpha = Math.min(0.28, (0.5 - prob) * 0.55);
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
          }
          ctx.fillRect(cx, cy, step, step);
        }
      }
    }

    // 3. Coordinate Grid & Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x += 2) {
      if (x === 0) continue;
      const cx = toCanvasX(x, w);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
      ctx.fillText(`${x}`, cx - 4, toCanvasY(0, h) + 14);
    }

    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 2) {
      if (y === 0) continue;
      const cy = toCanvasY(y, h);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.fillText(`${y}`, toCanvasX(0, w) + 5, cy + 3);
    }

    // Origin Axes
    const ox = toCanvasX(0, w);
    const oy = toCanvasY(0, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, h);
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    ctx.stroke();

    // 4. Regression Curve & Residuals
    if (mode === 'regression' && renderCurve) {
      // Residual lines from points to curve
      if (showResiduals) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        for (const pt of points) {
          const predY = renderCurve(pt.x);
          const px = toCanvasX(pt.x, w);
          const py = toCanvasY(pt.y, h);
          const predPy = toCanvasY(predY, h);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, predPy);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Smooth curve
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let started = false;
      for (let cx = 0; cx <= w; cx += 2) {
        const mx = toMathX(cx, w);
        const my = renderCurve(mx);
        const cy = toCanvasY(my, h);
        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    }

    // 5. PCA Vectors & Projection Lines
    if (mode === 'pca' && pcaVectors) {
      const { meanX, meanY, v1, v2, lambda1, lambda2 } = pcaVectors;
      const ocx = toCanvasX(meanX, w);
      const ocy = toCanvasY(meanY, h);

      // Mean point
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(ocx, ocy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Vector 1 (PC1: Cyan)
      const scale1 = Math.sqrt(Math.max(0.1, lambda1)) * 1.5;
      const pc1x = toCanvasX(meanX + v1[0] * scale1, w);
      const pc1y = toCanvasY(meanY + v1[1] * scale1, h);
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ocx, ocy);
      ctx.lineTo(pc1x, pc1y);
      ctx.stroke();

      // Vector 2 (PC2: Purple)
      const scale2 = Math.sqrt(Math.max(0.1, lambda2)) * 1.5;
      const pc2x = toCanvasX(meanX + v2[0] * scale2, w);
      const pc2y = toCanvasY(meanY + v2[1] * scale2, h);
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ocx, ocy);
      ctx.lineTo(pc2x, pc2y);
      ctx.stroke();

      // Projection lines from points to PC1
      if (pcaProjection) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        for (const p of points) {
          const proj = pcaProjection(p.x, p.y);
          ctx.beginPath();
          ctx.moveTo(toCanvasX(p.x, w), toCanvasY(p.y, h));
          ctx.lineTo(toCanvasX(proj.projX, w), toCanvasY(proj.projY, h));
          ctx.stroke();

          // Projected point on axis
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(toCanvasX(proj.projX, w) - 2, toCanvasY(proj.projY, h) - 2, 4, 4);
        }
        ctx.setLineDash([]);
      }
    }

    // 6. Data Points
    for (const pt of points) {
      const px = toCanvasX(pt.x, w);
      const py = toCanvasY(pt.y, h);

      let color = '#3B82F6';
      if (mode === 'classification') {
        color = CLASS_COLORS[(pt.label ?? 0) % CLASS_COLORS.length];
      } else if (mode === 'clustering') {
        if (pt.isNoise) {
          color = '#6B7280';
        } else {
          color = CLASS_COLORS[(pt.cluster ?? 0) % CLASS_COLORS.length];
        }
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, pt.isNoise ? 3.5 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 7. Cluster Centroids
    if (mode === 'clustering' && centroids) {
      centroids.forEach((c, idx) => {
        const cx = toCanvasX(c.x, w);
        const cy = toCanvasY(c.y, h);
        const color = CLASS_COLORS[idx % CLASS_COLORS.length];

        // Draw outer pulsing ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Draw crosshair
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`C${idx + 1}`, cx + 14, cy + 4);
      });
    }
  }, [
    dimensions,
    points,
    minX,
    maxX,
    minY,
    maxY,
    mode,
    renderCurve,
    renderDecisionField,
    centroids,
    pcaVectors,
    pcaProjection,
    showResiduals,
    toCanvasX,
    toCanvasY,
    toMathX,
    toMathY,
  ]);

  // Handle Click to Add Point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointsChange || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const mx = Number(toMathX(cx, dimensions.width).toFixed(2));
    const my = Number(toMathY(cy, dimensions.height).toFixed(2));

    // Right click or shift-click for alternate class
    let label = activeClass;
    if (e.shiftKey) {
      label = activeClass === 0 ? 1 : 0;
    }

    const newPt: DataPoint2D = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: mx,
      y: my,
      label,
    };

    onPointsChange([...points, newPt]);
  };

  const handleClear = () => {
    if (onPointsChange) {
      onPointsChange([]);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: typeof height === 'number' ? height : 440,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Canvas Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            variant="filled"
            color="default"
            label={`포인트: ${points.length}개`}
            sx={{ fontWeight: 700 }}
          />
          {mode === 'classification' && onActiveClassChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                클릭 시 클래스:
              </Typography>
              <Chip
                size="small"
                label="Class 0 (Blue)"
                color={activeClass === 0 ? 'primary' : 'default'}
                variant={activeClass === 0 ? 'filled' : 'outlined'}
                onClick={() => onActiveClassChange(0)}
                sx={{ cursor: 'pointer', fontWeight: 700 }}
              />
              <Chip
                size="small"
                label="Class 1 (Red)"
                color={activeClass === 1 ? 'error' : 'default'}
                variant={activeClass === 1 ? 'filled' : 'outlined'}
                onClick={() => onActiveClassChange(1)}
                sx={{ cursor: 'pointer', fontWeight: 700 }}
              />
            </Box>
          )}
          <Typography variant="caption" sx={{ color: 'text.disabled', ml: 0.5 }}>
            💡 캔버스를 클릭하여 실시간 데이터 포인트를 추가하세요!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onResetPreset && (
            <Tooltip title="프리셋 데이터셋 복원">
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltRoundedIcon />}
                onClick={onResetPreset}
                sx={{ fontWeight: 700 }}
              >
                프리셋 리셋
              </Button>
            </Tooltip>
          )}
          <Tooltip title="전체 포인트 초기화">
            <IconButton size="small" color="error" onClick={handleClear}>
              <ClearAllRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Interactive Canvas Viewport */}
      <Box
        ref={containerRef}
        sx={{
          flex: '1 1 auto',
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 380,
          cursor: 'crosshair',
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    </Box>
  );
}
