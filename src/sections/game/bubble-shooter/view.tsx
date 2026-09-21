'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  ROWS,
  WIDTH,
  COLORS,
  HEIGHT,
  RADIUS,
  center,
  settle,
  COLUMNS,
  collides,
  SHOOTER_X,
  SHOOTER_Y,
  type Game,
  createGame,
} from './game';

type Shot = { x: number; y: number; vx: number; vy: number; color: number };
type SceneAssets = {
  background: HTMLCanvasElement;
  board: HTMLCanvasElement;
  sprites: HTMLCanvasElement[];
  smallSprites: HTMLCanvasElement[];
  boardGrid: Game['grid'] | null;
  guideGrid: Game['grid'] | null;
  guideAngle: number;
  guidePoints: { x: number; y: number }[];
};

function bubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: number,
  radius = RADIUS - 1
) {
  const fill = ctx.createRadialGradient(x - radius * 0.38, y - radius * 0.43, 2, x, y, radius);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(0.17, COLORS[color]);
  fill.addColorStop(1, COLORS[color]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.shadowColor = COLORS[color];
  ctx.shadowBlur = 9;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff66';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    x - radius * 0.35,
    y - radius * 0.43,
    radius * 0.24,
    radius * 0.12,
    -0.5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = '#ffffffb8';
  ctx.fill();
}

function canvas(width: number, height: number) {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return element;
}

function sprite(color: number, radius: number) {
  const padding = 9;
  const element = canvas((radius + padding) * 2, (radius + padding) * 2);
  const ctx = element.getContext('2d');
  if (ctx) bubble(ctx, radius + padding, radius + padding, color, radius);
  return element;
}

function createSceneAssets(): SceneAssets {
  const backgroundCanvas = canvas(WIDTH, HEIGHT);
  const ctx = backgroundCanvas.getContext('2d')!;
  const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, '#102454');
  background.addColorStop(1, '#09122e');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#ffffff08';
  for (let x = 18; x < WIDTH; x += 36) {
    for (let y = 20; y < HEIGHT; y += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return {
    background: backgroundCanvas,
    board: canvas(WIDTH, HEIGHT),
    sprites: COLORS.map((_, index) => sprite(index, RADIUS - 1)),
    smallSprites: COLORS.map((_, index) => sprite(index, 12)),
    boardGrid: null,
    guideGrid: null,
    guideAngle: Number.NaN,
    guidePoints: [],
  };
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  element: HTMLCanvasElement,
  x: number,
  y: number
) {
  ctx.drawImage(element, x - element.width / 2, y - element.height / 2);
}

function updateBoard(game: Game, assets: SceneAssets) {
  if (assets.boardGrid === game.grid) return;
  const ctx = assets.board.getContext('2d')!;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLUMNS; col += 1) {
      const color = game.grid[row][col];
      if (color != null) {
        const point = center(row, col);
        drawSprite(ctx, assets.sprites[color], point.x, point.y);
      }
    }
  }

  ctx.strokeStyle = '#ff687680';
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(0, center(14, 0).y);
  ctx.lineTo(WIDTH, center(14, 0).y);
  ctx.stroke();
  ctx.setLineDash([]);
  assets.boardGrid = game.grid;
}

function updateGuide(game: Game, angle: number, assets: SceneAssets) {
  if (assets.guideGrid === game.grid && assets.guideAngle === angle) return;
  const points: { x: number; y: number }[] = [];
  let x = SHOOTER_X;
  let y = SHOOTER_Y;
  let dx = Math.sin(angle) * 11;
  const dy = -Math.cos(angle) * 11;
  for (let index = 0; index < 55; index += 1) {
    x += dx;
    y += dy;
    if (x < RADIUS || x > WIDTH - RADIUS) {
      x = Math.max(RADIUS, Math.min(WIDTH - RADIUS, x));
      dx = -dx;
    }
    if (collides(game.grid, x, y)) break;
    if (index % 2 === 0) points.push({ x, y });
  }
  assets.guideGrid = game.grid;
  assets.guideAngle = angle;
  assets.guidePoints = points;
}

function render(
  ctx: CanvasRenderingContext2D,
  game: Game,
  angle: number,
  shot: Shot | null,
  assets: SceneAssets
) {
  updateBoard(game, assets);
  ctx.drawImage(assets.background, 0, 0);
  ctx.drawImage(assets.board, 0, 0);

  if (game.status === 'playing') {
    if (!shot) {
      updateGuide(game, angle, assets);
      ctx.fillStyle = '#ffffff88';
      for (const point of assets.guidePoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.save();
    ctx.translate(SHOOTER_X, SHOOTER_Y + 12);
    ctx.rotate(angle);
    ctx.fillStyle = '#7385b9';
    ctx.beginPath();
    ctx.roundRect(-17, -43, 34, 62, 15);
    ctx.fill();
    ctx.fillStyle = '#d7e4ff';
    ctx.beginPath();
    ctx.roundRect(-11, -38, 22, 50, 10);
    ctx.fill();
    ctx.restore();
    drawSprite(ctx, assets.sprites[game.current], SHOOTER_X, SHOOTER_Y);
    drawSprite(ctx, assets.smallSprites[game.next], 44, HEIGHT - 36);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('NEXT', 63, HEIGHT - 32);
    if (shot) drawSprite(ctx, assets.sprites[shot.color], shot.x, shot.y);
  } else {
    ctx.fillStyle = '#070d26cc';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(game.status === 'won' ? '클리어!' : '게임 오버', WIDTH / 2, HEIGHT / 2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillText(`점수 ${game.score}점 · ${game.shots}발`, WIDTH / 2, HEIGHT / 2 + 25);
    ctx.textAlign = 'start';
  }
}

export function BubbleShooterView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const shotRef = useRef<Shot | null>(null);
  const angleRef = useRef(0);
  const draggingRef = useRef(false);
  const [game, setGame] = useState<Game | null>(null);

  const restart = () => {
    const next = createGame();
    gameRef.current = next;
    shotRef.current = null;
    angleRef.current = 0;
    setGame(next);
  };

  const fire = () => {
    const current = gameRef.current;
    if (!current || current.status !== 'playing' || shotRef.current) return;
    shotRef.current = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx: Math.sin(angleRef.current) * 610,
      vy: -Math.cos(angleRef.current) * 610,
      color: current.current,
    };
  };

  const aim = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    angleRef.current = Math.max(-1.33, Math.min(1.33, Math.atan2(x - SHOOTER_X, SHOOTER_Y - y)));
  };

  useEffect(() => {
    const initial = createGame();
    gameRef.current = initial;
    setGame(initial);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;
    const assets = createSceneAssets();
    let frame = 0;
    let previous = performance.now();
    let lastDrawnGame: Game | null = null;
    let lastAngle = Number.NaN;
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      if (document.hidden) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const current = gameRef.current;
      const shot = shotRef.current;
      if (current && shot) {
        const steps = Math.max(1, Math.ceil((610 * dt) / 7));
        for (let step = 0; step < steps; step += 1) {
          shot.x += (shot.vx * dt) / steps;
          shot.y += (shot.vy * dt) / steps;
          if (shot.x <= RADIUS || shot.x >= WIDTH - RADIUS) {
            shot.x = Math.max(RADIUS, Math.min(WIDTH - RADIUS, shot.x));
            shot.vx *= -1;
          }
          if (collides(current.grid, shot.x, shot.y)) {
            const next = settle(current, shot.x, shot.y);
            gameRef.current = next;
            setGame(next);
            shotRef.current = null;
            break;
          }
        }
      }
      if (
        gameRef.current &&
        (shotRef.current || gameRef.current !== lastDrawnGame || angleRef.current !== lastAngle)
      ) {
        render(ctx, gameRef.current, angleRef.current, shotRef.current, assets);
        lastDrawnGame = gameRef.current;
        lastAngle = angleRef.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        event.preventDefault();
        angleRef.current = Math.max(
          -1.33,
          Math.min(1.33, angleRef.current + (event.code === 'ArrowLeft' ? -0.09 : 0.09))
        );
      } else if (event.code === 'Space') {
        event.preventDefault();
        fire();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', py: { xs: 2, md: 3 } }}
    >
      <Stack alignItems="center" spacing={2} sx={{ minHeight: '100%', pb: { xs: 8, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: '100%', maxWidth: 650 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              버블 슈터
            </Typography>
            <Typography variant="body2" color="text.secondary">
              같은 색 버블 3개 이상을 연결해 터뜨리세요.
            </Typography>
          </Box>
          <Button variant="contained" onClick={restart} sx={{ borderRadius: 2, flexShrink: 0 }}>
            새 게임
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 432 }}>
          <Typography sx={{ fontWeight: 700 }}>점수 {game?.score ?? 0}</Typography>
          <Typography sx={{ fontWeight: 700 }}>발사 {game?.shots ?? 0}</Typography>
          <Typography sx={{ fontWeight: 700, ml: 'auto !important' }}>
            줄 추가까지 {5 - (game?.misses ?? 0)}발
          </Typography>
        </Stack>
        <Box
          sx={{
            width: '100%',
            maxWidth: WIDTH,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 16px 40px #111a3b55',
            touchAction: 'none',
            lineHeight: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            role="img"
            aria-label="버블 슈터 게임판. 방향키로 조준하고 스페이스로 발사할 수 있습니다."
            onPointerMove={(event) => {
              if (event.pointerType === 'mouse' || draggingRef.current)
                aim(event.clientX, event.clientY);
            }}
            onPointerDown={(event) => {
              draggingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              aim(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              if (draggingRef.current) {
                aim(event.clientX, event.clientY);
                fire();
              }
              draggingRef.current = false;
            }}
            onPointerCancel={() => {
              draggingRef.current = false;
            }}
            style={{ display: 'block', width: '100%', height: 'auto', cursor: 'crosshair' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          마우스로 조준 후 클릭하거나, 터치로 끌어 놓아 발사하세요. 방향키와 스페이스도 사용할 수
          있습니다.
        </Typography>
      </Stack>
    </DashboardContent>
  );
}
