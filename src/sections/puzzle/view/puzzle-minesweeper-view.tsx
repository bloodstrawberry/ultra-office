'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';

import { getMinesweeperMove } from '../utils/minesweeper-solver';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
type GameStatus = 'ready' | 'playing' | 'won' | 'lost';
type Cell = {
  mine: boolean;
  count: number;
  revealed: boolean;
  flagged: boolean;
  exploded: boolean;
};
type Playback = { steps: number; paused: boolean; message: string; lastIndex: number | null };

const LEVELS: Record<Difficulty, { label: string; rows: number; cols: number; mines: number }> = {
  beginner: { label: '초급', rows: 9, cols: 9, mines: 10 },
  intermediate: { label: '중급', rows: 16, cols: 16, mines: 40 },
  expert: { label: '고급', rows: 16, cols: 30, mines: 99 },
};

const NUMBER_COLORS = [
  '',
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#7C3AED',
  '#B45309',
  '#0891B2',
  '#334155',
  '#64748B',
];

function neighbors(index: number, rows: number, cols: number) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result: number[] = [];

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
    }
  }
  return result;
}

function emptyBoard(rows: number, cols: number): Cell[] {
  return Array.from({ length: rows * cols }, () => ({
    mine: false,
    count: 0,
    revealed: false,
    flagged: false,
    exploded: false,
  }));
}

function placeMines(board: Cell[], first: number, rows: number, cols: number, mineCount: number) {
  const safe = new Set([first, ...neighbors(first, rows, cols)]);
  const candidates = board.map((_, index) => index).filter((index) => !safe.has(index));

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  candidates.slice(0, mineCount).forEach((index) => {
    board[index].mine = true;
  });
  board.forEach((cell, index) => {
    if (!cell.mine) {
      cell.count = neighbors(index, rows, cols).filter((neighbor) => board[neighbor].mine).length;
    }
  });
  return board;
}

function revealSafe(board: Cell[], start: number, rows: number, cols: number) {
  const queue = [start];
  const visited = new Set<number>();

  while (queue.length) {
    const index = queue.pop()!;
    if (visited.has(index)) continue;
    visited.add(index);
    const cell = board[index];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.count === 0) queue.push(...neighbors(index, rows, cols));
  }
}

export function PuzzleMinesweeperView() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [board, setBoard] = useState<Cell[]>(() => emptyBoard(9, 9));
  const [status, setStatus] = useState<GameStatus>('ready');
  const [seconds, setSeconds] = useState(0);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [playbackMessage, setPlaybackMessage] = useState<string | null>(null);
  const [playbackDelay, setPlaybackDelay] = useState(100);
  const level = LEVELS[difficulty];
  const flags = board.filter((cell) => cell.flagged).length;

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const advanceLogicalStep = useCallback(
    (auto: boolean) => {
      if (status === 'won' || status === 'lost') return;
      const next = board.map((cell) => ({ ...cell }));
      let message: string;
      let index: number;

      if (status === 'ready') {
        const first = next.findIndex((cell) => !cell.flagged);
        index = first >= 0 ? first : 0;
        next[index].flagged = false;
        placeMines(next, index, level.rows, level.cols, level.mines);
        revealSafe(next, index, level.rows, level.cols);
        message = `${Math.floor(index / level.cols) + 1}행 ${(index % level.cols) + 1}열을 열어 첫 숫자들을 확인했습니다.`;
        setStatus('playing');
      } else {
        const move = getMinesweeperMove(
          board.map((cell) => ({
            revealed: cell.revealed,
            flagged: cell.flagged,
            count: cell.revealed ? cell.count : 0,
          })),
          level.rows,
          level.cols,
          level.mines
        );
        if (!move) {
          setPlayback(null);
          setPlaybackMessage('더 이상 열 수 있는 칸이 없습니다. 깃발 표시를 확인해 주세요.');
          return;
        }
        index = move.index;
        message = move.reason;
        if (move.action === 'flag') {
          next[index].flagged = true;
        } else if (next[index].mine) {
          next[index].exploded = true;
          next.forEach((cell) => {
            if (cell.mine) cell.revealed = true;
          });
          setBoard(next);
          setPlayback(null);
          setStatus('lost');
          setPlaybackMessage(
            `${move.reason} ${
              move.action === 'guess'
                ? '추측한 칸에 지뢰가 있어 실패했습니다.'
                : '기존 깃발 표시가 잘못되어 지뢰를 밟았습니다.'
            }`
          );
          return;
        } else {
          revealSafe(next, index, level.rows, level.cols);
        }
      }

      setBoard(next);
      setHintIndex(null);
      if (next.every((cell) => cell.mine || cell.revealed)) {
        setPlayback(null);
        setPlaybackMessage(`${message} 모든 안전한 칸을 열었습니다.`);
        setStatus('won');
      } else if (auto) {
        setPlayback((current) =>
          current
            ? {
                ...current,
                steps: current.steps + 1,
                message,
                lastIndex: index,
              }
            : null
        );
        setPlaybackMessage(null);
      } else {
        setPlaybackMessage(message);
      }
    },
    [board, status, level.rows, level.cols, level.mines]
  );

  useEffect(() => {
    if (!playback || playback.paused) return undefined;
    const timer = window.setTimeout(() => advanceLogicalStep(true), playbackDelay);
    return () => window.clearTimeout(timer);
  }, [playback, playbackDelay, advanceLogicalStep]);

  function newGame(nextDifficulty = difficulty) {
    const nextLevel = LEVELS[nextDifficulty];
    setDifficulty(nextDifficulty);
    setBoard(emptyBoard(nextLevel.rows, nextLevel.cols));
    setStatus('ready');
    setSeconds(0);
    setHintIndex(null);
    setPlayback(null);
    setPlaybackMessage(null);
  }

  function finishIfWon(next: Cell[]) {
    if (next.every((cell) => cell.mine || cell.revealed)) {
      next.forEach((cell) => {
        if (cell.mine) cell.flagged = true;
      });
      setStatus('won');
    }
  }

  function openCell(index: number) {
    if (playback || status === 'won' || status === 'lost' || board[index].flagged) return;
    setPlaybackMessage(null);
    const next = board.map((cell) => ({ ...cell }));
    if (status === 'ready') {
      placeMines(next, index, level.rows, level.cols, level.mines);
      setStatus('playing');
    }
    const cell = next[index];
    if (cell.revealed) {
      if (cell.count === 0) return;
      const adjacent = neighbors(index, level.rows, level.cols);
      if (adjacent.filter((i) => next[i].flagged).length !== cell.count) return;
      for (const i of adjacent) {
        if (next[i].flagged || next[i].revealed) continue;
        if (next[i].mine) {
          next[i].exploded = true;
          next.forEach((entry) => {
            if (entry.mine) entry.revealed = true;
          });
          setStatus('lost');
          setBoard(next);
          return;
        }
        revealSafe(next, i, level.rows, level.cols);
      }
    } else if (cell.mine) {
      cell.exploded = true;
      next.forEach((entry) => {
        if (entry.mine) entry.revealed = true;
      });
      setStatus('lost');
    } else {
      revealSafe(next, index, level.rows, level.cols);
    }
    setHintIndex(null);
    finishIfWon(next);
    setBoard(next);
  }

  function toggleFlag(index: number) {
    if (playback || status === 'won' || status === 'lost' || board[index].revealed) return;
    setPlaybackMessage(null);
    const next = board.map((cell) => ({ ...cell }));
    next[index].flagged = !next[index].flagged;
    setBoard(next);
    setHintIndex(null);
  }

  function showHint() {
    if (playback || status === 'won' || status === 'lost') return;
    if (status === 'ready') {
      const index = board.findIndex((cell) => !cell.flagged);
      setHintIndex(index >= 0 ? index : null);
      return;
    }
    const index = board.findIndex((cell) => !cell.mine && !cell.revealed && !cell.flagged);
    setHintIndex(index >= 0 ? index : null);
  }

  function playSolution() {
    if (playback) {
      setPlayback({ ...playback, paused: !playback.paused });
      return;
    }
    if (status === 'won' || status === 'lost') return;
    setPlaybackMessage(null);
    setPlayback({
      steps: 0,
      paused: false,
      message: status === 'ready' ? '첫 칸을 열 준비가 되었습니다.' : '보이는 숫자를 분석합니다.',
      lastIndex: null,
    });
  }

  const statusText = playback
    ? `${playback.paused ? '논리 풀이 일시정지' : '논리 풀이 재생 중'} · ${playback.steps}단계 · ${playback.message}`
    : playbackMessage ||
      {
        ready: '칸을 열면 게임이 시작됩니다. 첫 칸과 주변 칸은 안전합니다.',
        playing: '숫자는 주변 8칸에 숨은 지뢰의 개수입니다.',
        won: '성공! 모든 안전한 칸을 열었습니다. 🎉',
        lost: '지뢰를 밟았습니다. 새 게임으로 다시 도전해보세요.',
      }[status];

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3} sx={{ pb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            💣 지뢰찾기
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            안전한 칸을 모두 열어 승리하세요. 왼쪽 클릭으로 칸을 열고, 오른쪽 클릭으로 지뢰에 깃발을
            표시하세요.
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {(Object.keys(LEVELS) as Difficulty[]).map((key) => (
                <Button
                  key={key}
                  size="small"
                  variant={difficulty === key ? 'contained' : 'outlined'}
                  onClick={() => newGame(key)}
                >
                  {LEVELS[key].label} ({LEVELS[key].rows}×{LEVELS[key].cols})
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip label={`💣 남은 지뢰 ${level.mines - flags}`} variant="soft" color="error" />
              <Chip label={`⏱ ${seconds}초`} variant="soft" color="info" />
              <Button variant="outlined" onClick={() => newGame()}>
                새 게임
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={showHint}
                disabled={Boolean(playback) || status === 'won' || status === 'lost'}
              >
                💡 안전한 칸 힌트
              </Button>
              <Button
                variant="outlined"
                onClick={() => advanceLogicalStep(Boolean(playback))}
                disabled={
                  (Boolean(playback) && !playback?.paused) || status === 'won' || status === 'lost'
                }
              >
                한 단계 풀기
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={playSolution}
                disabled={!playback && (status === 'won' || status === 'lost')}
              >
                {playback?.paused ? '▶ 계속 재생' : playback ? '⏸ 일시정지' : '▶ 논리 풀이 재생'}
              </Button>
              <ToggleButtonGroup
                value={playbackDelay}
                exclusive
                size="small"
                aria-label="자동 풀이 재생 속도"
                onChange={(_, value) => {
                  if (value) setPlaybackDelay(value);
                }}
              >
                <ToggleButton value={200}>느리게</ToggleButton>
                <ToggleButton value={100}>보통</ToggleButton>
                <ToggleButton value={35}>빠르게</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Typography role="status" color={status === 'lost' ? 'error.main' : 'text.secondary'}>
              {statusText}
            </Typography>

            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box
                role="grid"
                aria-label="지뢰찾기 게임판"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${level.cols}, 30px)`,
                  gap: '2px',
                  width: 'max-content',
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                {board.map((cell, index) => {
                  const row = Math.floor(index / level.cols) + 1;
                  const col = (index % level.cols) + 1;
                  const label = cell.revealed
                    ? cell.mine
                      ? '지뢰'
                      : cell.count
                        ? `주변 지뢰 ${cell.count}개`
                        : '빈 칸'
                    : cell.flagged
                      ? '깃발'
                      : '닫힌 칸';
                  return (
                    <Box
                      key={index}
                      component="button"
                      type="button"
                      role="gridcell"
                      aria-label={`${row}행 ${col}열 ${label}`}
                      aria-disabled={Boolean(playback) || status === 'won' || status === 'lost'}
                      onClick={() => openCell(index)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        toggleFlag(index);
                      }}
                      sx={{
                        width: 30,
                        height: 30,
                        p: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: 17,
                        fontWeight: 800,
                        lineHeight: '28px',
                        textAlign: 'center',
                        bgcolor: cell.exploded
                          ? 'error.light'
                          : playback?.lastIndex === index
                            ? 'primary.light'
                            : cell.revealed
                              ? 'background.paper'
                              : hintIndex === index
                                ? 'warning.light'
                                : 'action.selected',
                        color:
                          cell.revealed && !cell.mine ? NUMBER_COLORS[cell.count] : 'text.primary',
                        '&:hover': { filter: 'brightness(0.93)' },
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                      }}
                    >
                      {cell.revealed
                        ? cell.mine
                          ? '💣'
                          : cell.count || ''
                        : cell.flagged
                          ? '🚩'
                          : ''}
                    </Box>
                  );
                })}
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              열린 숫자 칸을 누르면 주변 깃발 수가 숫자와 같을 때 나머지 칸을 한 번에 엽니다. 논리
              풀이는 보이는 숫자와 깃발만 사용합니다. 확정할 수 없는 칸은 추측이라고 표시하며,
              지뢰를 밟으면 실패할 수 있습니다.
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
