'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  drop,
  WIDTH,
  HEIGHT,
  advance,
  type Game,
  type Block,
  createGame,
  BLOCK_HEIGHT,
} from './game';

type Falling = { block: Block; velocity: number };
type SceneAssets = { background: HTMLCanvasElement; sprites: Map<string, HTMLCanvasElement> };

function createSceneAssets(): SceneAssets {
  const backgroundCanvas = document.createElement('canvas');
  backgroundCanvas.width = WIDTH;
  backgroundCanvas.height = HEIGHT;
  const ctx = backgroundCanvas.getContext('2d')!;
  const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, '#091b3a');
  background.addColorStop(1, '#1a1740');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#ffffff24';
  for (let index = 0; index < 48; index += 1) {
    const x = (index * 97 + 31) % WIDTH;
    const y = (index * 163 + 17) % HEIGHT;
    ctx.beginPath();
    ctx.arc(x, y, index % 5 === 0 ? 1.8 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff12';
  for (let index = 0; index < 8; index += 1) {
    const x = index * 61 - 9;
    ctx.fillRect(x, HEIGHT - 58 + (index % 3) * 12, 46, 75);
  }
  return { background: backgroundCanvas, sprites: new Map() };
}

function blockSprite(block: Block, assets: SceneAssets) {
  const key = `${block.color}|${block.width}`;
  const existing = assets.sprites.get(key);
  if (existing) return existing;
  const sprite = document.createElement('canvas');
  sprite.width = Math.max(1, Math.ceil(block.width));
  sprite.height = BLOCK_HEIGHT;
  const ctx = sprite.getContext('2d')!;
  const fill = ctx.createLinearGradient(0, 0, 0, BLOCK_HEIGHT);
  fill.addColorStop(0, '#ffffff88');
  fill.addColorStop(0.12, block.color);
  fill.addColorStop(1, block.color);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(0, 0, block.width, BLOCK_HEIGHT - 2, Math.min(7, block.width / 2));
  ctx.fill();
  ctx.strokeStyle = '#ffffff66';
  ctx.lineWidth = 1;
  ctx.stroke();
  assets.sprites.set(key, sprite);
  return sprite;
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  camera: number,
  assets: SceneAssets,
  glow = false
) {
  const y = block.y + camera;
  if (y < -BLOCK_HEIGHT || y > HEIGHT + BLOCK_HEIGHT) return;
  const sprite = blockSprite(block, assets);
  if (glow) {
    ctx.save();
    ctx.shadowColor = block.color;
    ctx.shadowBlur = 24;
    ctx.drawImage(sprite, block.x, y, block.width, BLOCK_HEIGHT);
    ctx.restore();
  } else ctx.drawImage(sprite, block.x, y, block.width, BLOCK_HEIGHT);
}

function render(
  ctx: CanvasRenderingContext2D,
  game: Game,
  falling: Falling | null,
  perfectVisible: boolean,
  assets: SceneAssets
) {
  const camera = Math.max(0, 288 - game.active.y);
  ctx.drawImage(assets.background, 0, 0);

  const base = game.layers[0];
  const groundY = base.y + BLOCK_HEIGHT + camera;
  if (groundY < HEIGHT) {
    ctx.fillStyle = '#26375e';
    ctx.fillRect(0, groundY, WIDTH, HEIGHT - groundY);
    ctx.fillStyle = '#63759b';
    ctx.fillRect(0, groundY, WIDTH, 4);
  }
  game.layers.forEach((block) => drawBlock(ctx, block, camera, assets));
  if (falling) drawBlock(ctx, falling.block, camera, assets);
  if (game.status !== 'lost') drawBlock(ctx, game.active, camera, assets, true);

  if (perfectVisible && game.status === 'playing') {
    ctx.fillStyle = '#fff4a3';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px sans-serif';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.fillText('PERFECT!', WIDTH / 2, Math.max(90, game.active.y + camera - 17));
    ctx.shadowBlur = 0;
    ctx.textAlign = 'start';
  }

  if (game.status !== 'playing') {
    ctx.fillStyle = '#090e28b8';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(game.status === 'paused' ? '일시정지' : '게임 오버', WIDTH / 2, HEIGHT / 2 - 15);
    ctx.font = '18px sans-serif';
    ctx.fillText(
      game.status === 'paused' ? '계속하기 버튼을 눌러주세요' : `${game.score}층까지 쌓았습니다`,
      WIDTH / 2,
      HEIGHT / 2 + 22
    );
    ctx.textAlign = 'start';
  }
}

export function StackGameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const fallingRef = useRef<Falling | null>(null);
  const perfectUntilRef = useRef(0);
  const [game, setGame] = useState<Game | null>(null);
  const [best, setBest] = useState(0);

  const restart = () => {
    const next = createGame();
    gameRef.current = next;
    fallingRef.current = null;
    perfectUntilRef.current = 0;
    setGame(next);
  };

  const placeBlock = () => {
    const current = gameRef.current;
    if (!current || current.status !== 'playing') return;
    const result = drop(current);
    gameRef.current = result.game;
    fallingRef.current = result.cut ? { block: result.cut, velocity: 40 } : null;
    perfectUntilRef.current = result.game.lastPerfect ? performance.now() + 650 : 0;
    setGame(result.game);
  };

  const togglePause = () => {
    const current = gameRef.current;
    if (!current || current.status === 'lost') return;
    const next: Game = { ...current, status: current.status === 'paused' ? 'playing' : 'paused' };
    gameRef.current = next;
    setGame(next);
  };

  useEffect(() => {
    const initial = createGame();
    gameRef.current = initial;
    setGame(initial);
    try {
      setBest(Number(window.localStorage.getItem('game-stack-best') || 0) || 0);
    } catch {
      /* Storage may be unavailable. */
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return undefined;
    const assets = createSceneAssets();
    let frame = 0;
    let previous = performance.now();
    let lastDrawnGame: Game | null = null;
    const animate = (now: number) => {
      const seconds = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (document.hidden) {
        frame = requestAnimationFrame(animate);
        return;
      }
      if (gameRef.current) {
        gameRef.current = advance(gameRef.current, seconds);
        if (fallingRef.current && gameRef.current.status === 'playing') {
          const falling = fallingRef.current;
          falling.velocity += 700 * seconds;
          falling.block = { ...falling.block, y: falling.block.y + falling.velocity * seconds };
          if (falling.block.y + Math.max(0, 288 - gameRef.current.active.y) > HEIGHT + 40)
            fallingRef.current = null;
        }
        if (gameRef.current !== lastDrawnGame || fallingRef.current) {
          render(ctx, gameRef.current, fallingRef.current, now < perfectUntilRef.current, assets);
          lastDrawnGame = gameRef.current;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const score = game?.score ?? 0;
    if (score > best) {
      setBest(score);
      try {
        window.localStorage.setItem('game-stack-best', String(score));
      } catch {
        /* The game remains playable. */
      }
    }
  }, [game?.score, best]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof HTMLElement && event.target.closest('button, input, textarea'))
      )
        return;
      if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
        event.preventDefault();
        placeBlock();
      }
      if (event.code === 'KeyP' && !event.repeat) {
        event.preventDefault();
        togglePause();
      }
      if (event.code === 'KeyR' && !event.repeat) {
        event.preventDefault();
        restart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', py: { xs: 2, md: 3 } }}
    >
      <Stack alignItems="center" spacing={2} sx={{ pb: { xs: 8, md: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ width: '100%', maxWidth: 600 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              스택 게임
            </Typography>
            <Typography variant="body2" color="text.secondary">
              움직이는 블록을 맞춰 높은 탑을 쌓아 보세요.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={!game || game.status === 'lost'}
              onClick={togglePause}
            >
              {game?.status === 'paused' ? '계속하기' : '일시정지'}
            </Button>
            <Button variant="contained" onClick={restart}>
              새 게임
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 420 }}>
          <Typography fontWeight={800}>현재 {game?.score ?? 0}층</Typography>
          <Typography fontWeight={800}>최고 {best}층</Typography>
          {!!game?.streak && (
            <Typography fontWeight={800} sx={{ ml: 'auto !important', color: 'warning.main' }}>
              Perfect ×{game.streak}
            </Typography>
          )}
        </Stack>
        <Box
          sx={{
            width: '100%',
            maxWidth: WIDTH,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 16px 40px #111a3b55',
            lineHeight: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            role="button"
            tabIndex={0}
            aria-label="스택 게임판. 클릭하거나 스페이스를 눌러 블록 쌓기"
            onClick={placeBlock}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={game?.status === 'lost' ? restart : placeBlock}
          sx={{ minWidth: 180, borderRadius: 2 }}
        >
          {game?.status === 'lost' ? '다시 시작' : '블록 쌓기'}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          블록이 아래층과 겹칠 때 화면을 누르세요. 정확히 맞추면 너비가 줄지 않습니다. 키보드:
          Space/Enter 쌓기 · P 일시정지 · R 새 게임
        </Typography>
      </Stack>
    </DashboardContent>
  );
}
