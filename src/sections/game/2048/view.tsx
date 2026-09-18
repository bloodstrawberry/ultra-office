'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { play, type Game, createGame, continueGame, type Direction } from './game';

type Session = { game: Game; previous: Game | null };

const tileColors: Record<number, { background: string; text: string }> = {
  0: { background: '#cdc1b4', text: 'transparent' },
  2: { background: '#eee4da', text: '#776e65' },
  4: { background: '#ede0c8', text: '#776e65' },
  8: { background: '#f2b179', text: '#fff' },
  16: { background: '#f59563', text: '#fff' },
  32: { background: '#f67c5f', text: '#fff' },
  64: { background: '#f65e3b', text: '#fff' },
  128: { background: '#edcf72', text: '#fff' },
  256: { background: '#edcc61', text: '#fff' },
  512: { background: '#edc850', text: '#fff' },
  1024: { background: '#edc53f', text: '#fff' },
  2048: { background: '#edc22e', text: '#fff' },
};

export function Game2048View() {
  const [session, setSession] = useState<Session | null>(null);
  const [best, setBest] = useState(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSession({ game: createGame(), previous: null });
    try {
      setBest(Number(window.localStorage.getItem('game-2048-best') || 0) || 0);
    } catch {
      /* Storage can be unavailable. */
    }
  }, []);

  useEffect(() => {
    const score = session?.game.score ?? 0;
    if (score > best) {
      setBest(score);
      try {
        window.localStorage.setItem('game-2048-best', String(score));
      } catch {
        /* Keep the current game playable. */
      }
    }
  }, [session?.game.score, best]);

  const perform = (direction: Direction) =>
    setSession((current) => {
      if (!current) return current;
      const next = play(current.game, direction);
      return next === current.game ? current : { game: next, previous: current.game };
    });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
      )
        return;
      const directions: Record<string, Direction> = {
        ArrowLeft: 'left',
        KeyA: 'left',
        ArrowRight: 'right',
        KeyD: 'right',
        ArrowUp: 'up',
        KeyW: 'up',
        ArrowDown: 'down',
        KeyS: 'down',
      };
      const direction = directions[event.code];
      if (direction) {
        event.preventDefault();
        perform(direction);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const finishSwipe = (x: number, y: number) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;
    const dx = x - start.x;
    const dy = y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
    perform(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  const game = session?.game;

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', py: { xs: 2, md: 3 } }}
    >
      <Stack alignItems="center" spacing={2} sx={{ pb: { xs: 8, md: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ width: '100%', maxWidth: 520 }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#776e65' }}>
              2048
            </Typography>
            <Typography variant="body2" color="text.secondary">
              같은 숫자를 합쳐 2048을 만들어 보세요.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {[
              ['점수', game?.score ?? 0],
              ['최고', best],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  minWidth: 78,
                  p: 1,
                  borderRadius: 2,
                  bgcolor: '#bbada0',
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: 20, lineHeight: 1.2 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ width: '100%', maxWidth: 520 }}
        >
          <Button
            variant="outlined"
            disabled={!session?.previous}
            onClick={() =>
              setSession((current) =>
                current?.previous ? { game: current.previous, previous: null } : current
              )
            }
          >
            되돌리기
          </Button>
          <Button
            variant="contained"
            onClick={() => setSession({ game: createGame(), previous: null })}
          >
            새 게임
          </Button>
        </Stack>
        <Box
          role="grid"
          aria-label="2048 게임판"
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            startRef.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => finishSwipe(event.clientX, event.clientY)}
          onPointerCancel={() => {
            startRef.current = null;
          }}
          sx={{
            width: '100%',
            maxWidth: 520,
            aspectRatio: '1',
            position: 'relative',
            p: { xs: 1, sm: 1.25 },
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: { xs: 1, sm: 1.25 },
            bgcolor: '#bbada0',
            borderRadius: 3,
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          {(game?.board.flat() ?? Array(16).fill(0)).map((value, index) => {
            const colors = tileColors[value] ?? { background: '#3c3a32', text: '#fff' };
            return (
              <Box
                key={index}
                role="gridcell"
                aria-label={`${Math.floor(index / 4) + 1}행 ${(index % 4) + 1}열 ${value || '빈 칸'}`}
                sx={{
                  minWidth: 0,
                  borderRadius: 1.5,
                  bgcolor: colors.background,
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize:
                    value >= 1024
                      ? { xs: 22, sm: 34 }
                      : value >= 128
                        ? { xs: 28, sm: 42 }
                        : { xs: 34, sm: 52 },
                  fontWeight: 900,
                  lineHeight: 1,
                  transition: 'background-color 120ms ease',
                }}
              >
                {value || ''}
              </Box>
            );
          })}
          {game?.status !== 'playing' && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                bgcolor: '#eee4dabd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#776e65' }}>
                {game?.status === 'won'
                  ? '2048 달성!'
                  : game?.status === 'over'
                    ? '게임 오버'
                    : '게임 준비 중'}
              </Typography>
              {game?.status === 'won' && (
                <Button
                  variant="contained"
                  onClick={() =>
                    setSession((current) =>
                      current ? { ...current, game: continueGame(current.game) } : current
                    )
                  }
                >
                  계속하기
                </Button>
              )}
              {game?.status === 'over' && (
                <Button
                  variant="contained"
                  onClick={() => setSession({ game: createGame(), previous: null })}
                >
                  다시 시작
                </Button>
              )}
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          방향키 또는 WASD로 이동하세요. 모바일에서는 게임판을 스와이프할 수 있습니다.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
          <Button variant="outlined" onClick={() => perform('left')} aria-label="왼쪽으로 이동">
            ←
          </Button>
          <Button variant="outlined" onClick={() => perform('up')} aria-label="위로 이동">
            ↑
          </Button>
          <Button variant="outlined" onClick={() => perform('down')} aria-label="아래로 이동">
            ↓
          </Button>
          <Button variant="outlined" onClick={() => perform('right')} aria-label="오른쪽으로 이동">
            →
          </Button>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}
