'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';

import { BOARD_WIDTH, BOARD_HEIGHT, BOARD_PADDING } from '../../../lib/games/alkkagi/engine';
import {
  type AlkkagiStone,
  type AlkkagiBoardType,
  type AlkkagiPhysicsConfig,
  type AlkkagiSide,
} from '../../../lib/games/alkkagi/types';

interface AlkkagiCanvasProps {
  boardType: AlkkagiBoardType;
  stones: AlkkagiStone[];
  currentTurn: AlkkagiSide;
  isMoving: boolean;
  disabled?: boolean;
  config: AlkkagiPhysicsConfig;
  onShoot: (stoneId: string, impulseX: number, impulseY: number) => void;
}

export function AlkkagiCanvas({
  boardType,
  stones,
  currentTurn,
  isMoving,
  disabled = false,
  config,
  onShoot,
}: AlkkagiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drag Aiming state
  const [selectedStoneId, setSelectedStoneId] = useState<string | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // Coordinate helper from canvas client rect
  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = BOARD_WIDTH / rect.width;
    const scaleY = BOARD_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isMoving) return;
    const coords = getCanvasCoords(e);

    // Find if clicked on any stone belonging to currentTurn
    const clicked = stones.find((s) => {
      if (!s.isAlive || s.falling || s.side !== currentTurn) return false;
      return Math.hypot(coords.x - s.x, coords.y - s.y) <= s.radius + 6;
    });

    if (clicked) {
      setSelectedStoneId(clicked.id);
      setDragCurrent(coords);
      isDraggingRef.current = true;
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !selectedStoneId) return;
    const coords = getCanvasCoords(e);
    setDragCurrent(coords);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !selectedStoneId || !dragCurrent) {
      setSelectedStoneId(null);
      setDragCurrent(null);
      isDraggingRef.current = false;
      return;
    }

    const stone = stones.find((s) => s.id === selectedStoneId);
    if (stone && stone.isAlive && !stone.falling) {
      // Drag vector: pull-back slingshot
      const dx = stone.x - dragCurrent.x;
      const dy = stone.y - dragCurrent.y;
      const dragDist = Math.hypot(dx, dy);

      if (dragDist > 8) {
        const power = Math.min(config.maxPower, dragDist * config.powerMultiplier);
        const impulseX = (dx / dragDist) * power;
        const impulseY = (dy / dragDist) * power;
        onShoot(stone.id, impulseX, impulseY);
      }
    }

    setSelectedStoneId(null);
    setDragCurrent(null);
    isDraggingRef.current = false;
  };

  // Render Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      // 1. Draw Board Background
      if (boardType === 'baduk') {
        drawBadukBoard(ctx);
      } else {
        drawJanggiBoard(ctx);
      }

      // 2. Draw Stones
      for (const s of stones) {
        if (!s.isAlive) continue;

        ctx.save();
        if (s.falling) {
          const scale = Math.max(0.01, 1 - s.fallProgress);
          const alpha = Math.max(0, 1 - s.fallProgress);
          ctx.globalAlpha = alpha;
          ctx.translate(s.x, s.y);
          ctx.scale(scale, scale);
          drawStone(ctx, 0, 0, s, boardType);
        } else {
          drawStone(ctx, s.x, s.y, s, boardType);
        }
        ctx.restore();
      }

      // 3. Draw Active Aiming Slingshot & Trajectory Line
      if (selectedStoneId && dragCurrent) {
        const shooter = stones.find((s) => s.id === selectedStoneId);
        if (shooter && shooter.isAlive && !shooter.falling) {
          drawAimingGuide(ctx, shooter, dragCurrent, config);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [boardType, stones, selectedStoneId, dragCurrent, config]);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        touchAction: 'none',
        p: 1.5,
        bgcolor: '#78350f',
        borderRadius: 3,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        border: '4px solid #451a03',
      }}
    >
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          width: '100%',
          maxWidth: 600,
          aspectRatio: '1 / 1',
          cursor: isMoving ? 'wait' : selectedStoneId ? 'grabbing' : 'crosshair',
          borderRadius: 8,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
        }}
      />
    </Box>
  );
}

// -------------------------------------------------------------
// Canvas Drawing Helper Functions
// -------------------------------------------------------------

function drawBadukBoard(ctx: CanvasRenderingContext2D) {
  // Wood texture background
  const grad = ctx.createRadialGradient(
    BOARD_WIDTH / 2,
    BOARD_HEIGHT / 2,
    50,
    BOARD_WIDTH / 2,
    BOARD_HEIGHT / 2,
    BOARD_WIDTH / 1.3
  );
  grad.addColorStop(0, '#fde68a');
  grad.addColorStop(0.7, '#d97706');
  grad.addColorStop(1, '#92400e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // Outer Border Line (Playable boundary)
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3;
  ctx.strokeRect(
    BOARD_PADDING,
    BOARD_PADDING,
    BOARD_WIDTH - BOARD_PADDING * 2,
    BOARD_HEIGHT - BOARD_PADDING * 2
  );

  // 19x19 Grid lines
  const playableW = BOARD_WIDTH - BOARD_PADDING * 2;
  const playableH = BOARD_HEIGHT - BOARD_PADDING * 2;
  const stepX = playableW / 18;
  const stepY = playableH / 18;

  ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 18; i += 1) {
    // Verticals
    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING + i * stepX, BOARD_PADDING);
    ctx.lineTo(BOARD_PADDING + i * stepX, BOARD_HEIGHT - BOARD_PADDING);
    ctx.stroke();

    // Horizontals
    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING, BOARD_PADDING + i * stepY);
    ctx.lineTo(BOARD_WIDTH - BOARD_PADDING, BOARD_PADDING + i * stepY);
    ctx.stroke();
  }

  // 9 Star points
  const starIndices = [3, 9, 15];
  ctx.fillStyle = '#451a03';
  for (const sx of starIndices) {
    for (const sy of starIndices) {
      ctx.beginPath();
      ctx.arc(BOARD_PADDING + sx * stepX, BOARD_PADDING + sy * stepY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawJanggiBoard(ctx: CanvasRenderingContext2D) {
  // Traditional Janggi board
  const grad = ctx.createRadialGradient(
    BOARD_WIDTH / 2,
    BOARD_HEIGHT / 2,
    50,
    BOARD_WIDTH / 2,
    BOARD_HEIGHT / 2,
    BOARD_WIDTH / 1.3
  );
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(0.7, '#ca8a04');
  grad.addColorStop(1, '#78350f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // Outer border line
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3;
  ctx.strokeRect(
    BOARD_PADDING,
    BOARD_PADDING,
    BOARD_WIDTH - BOARD_PADDING * 2,
    BOARD_HEIGHT - BOARD_PADDING * 2
  );

  const playableW = BOARD_WIDTH - BOARD_PADDING * 2;
  const playableH = BOARD_HEIGHT - BOARD_PADDING * 2;
  const stepX = playableW / 8; // 9 cols -> 8 intervals
  const stepY = playableH / 9; // 10 rows -> 9 intervals

  ctx.strokeStyle = 'rgba(69, 26, 3, 0.5)';
  ctx.lineWidth = 1.2;

  // Grid lines
  for (let r = 0; r <= 9; r += 1) {
    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING, BOARD_PADDING + r * stepY);
    ctx.lineTo(BOARD_WIDTH - BOARD_PADDING, BOARD_PADDING + r * stepY);
    ctx.stroke();
  }

  for (let c = 0; c <= 8; c += 1) {
    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING + c * stepX, BOARD_PADDING);
    ctx.lineTo(BOARD_PADDING + c * stepX, BOARD_HEIGHT - BOARD_PADDING);
    ctx.stroke();
  }

  // Palace diagonals (Top & Bottom)
  // Han Palace (Top rows 0-2, cols 3-5)
  ctx.beginPath();
  ctx.moveTo(BOARD_PADDING + 3 * stepX, BOARD_PADDING);
  ctx.lineTo(BOARD_PADDING + 5 * stepX, BOARD_PADDING + 2 * stepY);
  ctx.moveTo(BOARD_PADDING + 5 * stepX, BOARD_PADDING);
  ctx.lineTo(BOARD_PADDING + 3 * stepX, BOARD_PADDING + 2 * stepY);
  ctx.stroke();

  // Cho Palace (Bottom rows 7-9, cols 3-5)
  ctx.beginPath();
  ctx.moveTo(BOARD_PADDING + 3 * stepX, BOARD_PADDING + 7 * stepY);
  ctx.lineTo(BOARD_PADDING + 5 * stepX, BOARD_PADDING + 9 * stepY);
  ctx.moveTo(BOARD_PADDING + 5 * stepX, BOARD_PADDING + 7 * stepY);
  ctx.lineTo(BOARD_PADDING + 3 * stepX, BOARD_PADDING + 9 * stepY);
  ctx.stroke();

  // Han River Center Banner
  ctx.font = 'bold 13px serif';
  ctx.fillStyle = 'rgba(69, 26, 3, 0.4)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('楚  河                  漢  界', BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
}

function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  stone: AlkkagiStone,
  boardType: AlkkagiBoardType
) {
  const r = stone.radius;

  if (boardType === 'baduk') {
    // 3D Baduk Stone
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);

    if (stone.side === 'A') {
      // Obsidian Black
      grad.addColorStop(0, '#475569');
      grad.addColorStop(0.3, '#1e293b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Pearl White
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Janggi Wooden Octagon / Circle Piece
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    const woodGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    woodGrad.addColorStop(0, '#fef08a');
    woodGrad.addColorStop(0.6, '#eab308');
    woodGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = woodGrad;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Wood bevel ring
    ctx.strokeStyle = stone.side === 'A' ? '#15803d' : '#b91c1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Character engraving
    ctx.font = `bold ${Math.round(r * 1.05)}px serif`;
    ctx.fillStyle = stone.side === 'A' ? '#15803d' : '#b91c1c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stone.label, x, y + 1);
  }
}

function drawAimingGuide(
  ctx: CanvasRenderingContext2D,
  shooter: AlkkagiStone,
  dragCurrent: { x: number; y: number },
  config: AlkkagiPhysicsConfig
) {
  const dx = shooter.x - dragCurrent.x;
  const dy = shooter.y - dragCurrent.y;
  const dragDist = Math.hypot(dx, dy);

  if (dragDist < 5) return;

  const powerRatio = Math.min(1, (dragDist * config.powerMultiplier) / config.maxPower);
  const aimX = dx / dragDist;
  const aimY = dy / dragDist;

  // 1. Draw Pull Back Rubber Line
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(shooter.x, shooter.y);
  ctx.lineTo(dragCurrent.x, dragCurrent.y);
  ctx.stroke();

  // 2. Draw Pull Dot Handle
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(dragCurrent.x, dragCurrent.y, 7, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw Projected Trajectory Dotted Line
  const projLen = 60 + powerRatio * 200;
  ctx.strokeStyle = shooter.side === 'A' ? '#38bdf8' : '#fb7185';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(shooter.x, shooter.y);
  ctx.lineTo(shooter.x + aimX * projLen, shooter.y + aimY * projLen);
  ctx.stroke();

  // 4. Power Indicator Circle
  ctx.setLineDash([]);
  ctx.strokeStyle = powerRatio > 0.8 ? '#ef4444' : powerRatio > 0.5 ? '#f59e0b' : '#22c55e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(shooter.x, shooter.y, shooter.radius + 6, 0, Math.PI * 2 * powerRatio);
  ctx.stroke();

  ctx.restore();
}
