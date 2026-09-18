'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  tick,
  spawn,
  COLORS,
  ghostY,
  rotate,
  hardDrop,
  softDrop,
  holdPiece,
  movePiece,
  type Game,
  createGame,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  type PieceType,
} from './game';

const CELL = 30;

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: PieceType,
  opacity = 1
) {
  const px = x * CELL;
  const py = y * CELL;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = COLORS[type];
  ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  ctx.fillStyle = '#ffffff55';
  ctx.fillRect(px + 3, py + 3, CELL - 6, 4);
  ctx.fillStyle = '#00000030';
  ctx.fillRect(px + 3, py + CELL - 7, CELL - 6, 4);
  ctx.globalAlpha = 1;
}

function draw(ctx: CanvasRenderingContext2D, game: Game) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, BOARD_WIDTH * CELL, BOARD_HEIGHT * CELL);
  ctx.strokeStyle = '#263350';
  ctx.lineWidth = 1;
  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    for (let col = 0; col < BOARD_WIDTH; col += 1) {
      ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL, CELL);
      const block = game.board[row][col];
      if (block) drawBlock(ctx, col, row, block);
    }
  }
  if (game.status !== 'lost') {
    const landing = ghostY(game);
    for (const [dx, dy] of game.active.cells) {
      if (landing + dy >= 0)
        drawBlock(ctx, game.active.x + dx, landing + dy, game.active.type, 0.22);
    }
    for (const [dx, dy] of game.active.cells) {
      if (game.active.y + dy >= 0)
        drawBlock(ctx, game.active.x + dx, game.active.y + dy, game.active.type);
    }
  }
}

function MiniPiece({ title, type }: { title: string; type: PieceType | null }) {
  const cells = type ? spawn(type).cells : [];
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        minWidth: 110,
        minHeight: 105,
        borderRadius: 2,
        bgcolor: '#172240',
        borderColor: '#33456a',
        color: 'white',
      }}
    >
      <Typography variant="caption" sx={{ color: '#a5b4d7', fontWeight: 800 }}>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', width: 80, height: 64, mx: 'auto', mt: 1 }}>
        {cells.map(([x, y], index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: x * 19,
              top: y * 19,
              width: 18,
              height: 18,
              borderRadius: '5px',
              bgcolor: type ? COLORS[type] : 'transparent',
              boxShadow: 'inset 0 3px #ffffff55',
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}

export function TetrisView() {
  const [game, setGame] = useState<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const act = (action: (current: Game) => Game) =>
    setGame((current) => (current ? action(current) : current));

  useEffect(() => {
    setGame(createGame());
  }, []);

  useEffect(() => {
    if (game?.status !== 'playing') return undefined;
    const delay = Math.max(90, Math.floor(820 * 0.8 ** (game.level - 1)));
    const timer = window.setInterval(() => act(tick), delay);
    return () => window.clearInterval(timer);
  }, [game?.level, game?.status]);

  useEffect(() => {
    if (game && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) draw(ctx, game);
    }
  }, [game]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
      )
        return;
      const key = event.code;
      if (
        ![
          'ArrowLeft',
          'ArrowRight',
          'ArrowDown',
          'ArrowUp',
          'Space',
          'KeyX',
          'KeyZ',
          'KeyC',
          'KeyP',
        ].includes(key)
      )
        return;
      event.preventDefault();
      if (key === 'ArrowLeft') act((current) => movePiece(current, -1));
      if (key === 'ArrowRight') act((current) => movePiece(current, 1));
      if (key === 'ArrowDown') act(softDrop);
      if (key === 'ArrowUp' || key === 'KeyX') act((current) => rotate(current));
      if (key === 'KeyZ') act((current) => rotate(current, -1));
      if (key === 'Space' && !event.repeat) act(hardDrop);
      if (key === 'KeyC' && !event.repeat) act(holdPiece);
      if (key === 'KeyP' && !event.repeat)
        act((current) => ({
          ...current,
          status:
            current.status === 'playing'
              ? 'paused'
              : current.status === 'paused'
                ? 'playing'
                : 'lost',
        }));
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
          sx={{ width: '100%', maxWidth: 620 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              테트리스
            </Typography>
            <Typography variant="body2" color="text.secondary">
              줄을 채우고 지우며 최고 점수에 도전하세요.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={!game || game.status === 'lost'}
              onClick={() =>
                act((current) => ({
                  ...current,
                  status: current.status === 'playing' ? 'paused' : 'playing',
                }))
              }
            >
              {game?.status === 'paused' ? '계속' : '일시정지'}
            </Button>
            <Button variant="contained" onClick={() => setGame(createGame())}>
              새 게임
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 620 }}>
          <Typography fontWeight={700}>점수 {game?.score ?? 0}</Typography>
          <Typography fontWeight={700}>줄 {game?.lines ?? 0}</Typography>
          <Typography fontWeight={700}>레벨 {game?.level ?? 1}</Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%' }}
        >
          <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} order={{ xs: 0, sm: 0 }}>
            <MiniPiece title="보관 (C)" type={game?.hold ?? null} />
            <MiniPiece title="다음" type={game?.queue[0] ?? null} />
          </Stack>
          <Box
            sx={{
              width: '100%',
              maxWidth: 300,
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 14px 36px #0f172a66',
              lineHeight: 0,
              order: { xs: 1, sm: 1 },
            }}
          >
            <canvas
              ref={canvasRef}
              width={BOARD_WIDTH * CELL}
              height={BOARD_HEIGHT * CELL}
              role="img"
              aria-label="테트리스 게임판"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            {game?.status !== 'playing' && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: '#050b1bbb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
                  {game?.status === 'lost'
                    ? '게임 오버'
                    : game?.status === 'paused'
                      ? '일시정지'
                      : '준비 중'}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          useFlexGap
          sx={{ maxWidth: 620 }}
        >
          <Button
            variant="contained"
            onClick={() => act((current) => movePiece(current, -1))}
            aria-label="왼쪽 이동"
          >
            ←
          </Button>
          <Button
            variant="contained"
            onClick={() => act((current) => rotate(current))}
            aria-label="회전"
          >
            ⟳
          </Button>
          <Button
            variant="contained"
            onClick={() => act((current) => movePiece(current, 1))}
            aria-label="오른쪽 이동"
          >
            →
          </Button>
          <Button variant="contained" onClick={() => act(softDrop)} aria-label="아래로 이동">
            ↓
          </Button>
          <Button variant="contained" color="secondary" onClick={() => act(hardDrop)}>
            즉시 내리기
          </Button>
          <Button variant="outlined" onClick={() => act(holdPiece)}>
            보관
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          키보드: ← → 이동 · ↑/X 회전 · Z 반대 회전 · ↓ 빠르게 · Space 즉시 내리기 · C 보관 · P
          일시정지
        </Typography>
      </Stack>
    </DashboardContent>
  );
}
