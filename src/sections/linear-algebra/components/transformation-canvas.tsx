'use client';

import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import type { Matrix2x2, Vector2D } from '../types';
import { transformVector } from '../utils/matrix-math';

// ----------------------------------------------------------------------

interface TransformationCanvasProps {
  matrix: Matrix2x2;
}

export function TransformationCanvas({ matrix }: TransformationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const scale = 50; // 50px = 1 unit

    ctx.clearRect(0, 0, width, height);

    const toScreen = (v: Vector2D): Vector2D => ({
      x: center + v.x * scale,
      y: center - v.y * scale,
    });

    // 1. Draw Transformed Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'; // Faint Cyan Grid

    const gridSize = 6;
    for (let i = -gridSize; i <= gridSize; i++) {
      // Horizontal grid lines
      const p1 = toScreen(transformVector(matrix, { x: -gridSize, y: i }));
      const p2 = toScreen(transformVector(matrix, { x: gridSize, y: i }));
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Vertical grid lines
      const p3 = toScreen(transformVector(matrix, { x: i, y: -gridSize }));
      const p4 = toScreen(transformVector(matrix, { x: i, y: gridSize }));
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // 2. Transformed Unit Square Area (Determinant Area)
    const o = toScreen({ x: 0, y: 0 });
    const iVec = toScreen(transformVector(matrix, { x: 1, y: 0 }));
    const jVec = toScreen(transformVector(matrix, { x: 0, y: 1 }));
    const ijVec = toScreen(transformVector(matrix, { x: 1, y: 1 }));

    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)'; // Yellow Area
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(iVec.x, iVec.y);
    ctx.lineTo(ijVec.x, ijVec.y);
    ctx.lineTo(jVec.x, jVec.y);
    ctx.closePath();
    ctx.fill();

    // 3. Coordinate Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(width, center);
    ctx.moveTo(center, 0);
    ctx.lineTo(center, height);
    ctx.stroke();

    // Helper to draw vectors with arrow heads
    const drawArrow = (from: Vector2D, to: Vector2D, color: string, label: string) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - 12 * Math.cos(angle - Math.PI / 6),
        to.y - 12 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        to.x - 12 * Math.cos(angle + Math.PI / 6),
        to.y - 12 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Label text
      ctx.font = 'bold 13px monospace';
      ctx.fillText(label, to.x + 8 * Math.cos(angle), to.y + 8 * Math.sin(angle));
      ctx.restore();
    };

    // 4. Draw Basis Vectors: i-hat (Red) and j-hat (Green)
    drawArrow(o, iVec, '#ef4444', `î (${matrix[0][0]}, ${matrix[1][0]})`);
    drawArrow(o, jVec, '#22c55e', `ĵ (${matrix[0][1]}, ${matrix[1][1]})`);
  }, [matrix]);

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #1e293b',
      }}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ width: '100%', maxWidth: 460, height: 'auto' }}
      />
      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1 }}>
        빨간색 = 변환된 기저벡터 î | 초록색 = 변환된 기저벡터 ĵ | 노란색 면적 = 행렬식 |det(A)|
      </Typography>
    </Card>
  );
}
