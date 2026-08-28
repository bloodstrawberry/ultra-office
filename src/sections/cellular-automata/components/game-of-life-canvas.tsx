'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// ----------------------------------------------------------------------

const GRID_COLS = 80;
const GRID_ROWS = 50;

// Famous Conway Patterns
const PRESETS: { name: string; cells: [number, number][]; desc: string }[] = [
  {
    name: '고스퍼 글라이더 건 (Gosper Glider Gun)',
    desc: '영구적으로 우하향 글라이더를 발사하는 무한 증식 장치',
    cells: [
      [5, 1],
      [5, 2],
      [6, 1],
      [6, 2],
      [5, 11],
      [6, 11],
      [7, 11],
      [4, 12],
      [8, 12],
      [3, 13],
      [9, 13],
      [3, 14],
      [9, 14],
      [6, 15],
      [4, 16],
      [8, 16],
      [5, 17],
      [6, 17],
      [7, 17],
      [6, 18],
      [3, 21],
      [4, 21],
      [5, 21],
      [3, 22],
      [4, 22],
      [5, 22],
      [2, 23],
      [6, 23],
      [1, 25],
      [2, 25],
      [6, 25],
      [7, 25],
      [3, 35],
      [4, 35],
      [3, 36],
      [4, 36],
    ],
  },
  {
    name: '펄서 (Pulsar 3주기 진동자)',
    desc: '우아하게 3주기로 맥동하는 대형 진동자',
    cells: [
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 10],
      [2, 11],
      [2, 12],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 10],
      [7, 11],
      [7, 12],
      [9, 4],
      [9, 5],
      [9, 6],
      [9, 10],
      [9, 11],
      [9, 12],
      [14, 4],
      [14, 5],
      [14, 6],
      [14, 10],
      [14, 11],
      [14, 12],
      [4, 2],
      [5, 2],
      [6, 2],
      [10, 2],
      [11, 2],
      [12, 2],
      [4, 7],
      [5, 7],
      [6, 7],
      [10, 7],
      [11, 7],
      [12, 7],
      [4, 9],
      [5, 9],
      [6, 9],
      [10, 9],
      [11, 9],
      [12, 9],
      [4, 14],
      [5, 14],
      [6, 14],
      [10, 14],
      [11, 14],
      [12, 14],
    ],
  },
  {
    name: '경량 우주선 (LWSS Spaceship)',
    desc: '우측으로 전진 비행하는 우주선',
    cells: [
      [1, 2],
      [1, 5],
      [2, 6],
      [3, 2],
      [3, 6],
      [4, 3],
      [4, 4],
      [4, 5],
      [4, 6],
    ],
  },
  {
    name: '아콘 (Acorn - 므두셀라)',
    desc: '단 7개 셀로 시작해 5,206세대 동안 폭발적으로 번식하는 패턴',
    cells: [
      [2, 1],
      [3, 3],
      [4, 0],
      [4, 1],
      [4, 4],
      [4, 5],
      [4, 6],
    ],
  },
  {
    name: 'R-펜토미노 (R-pentomino)',
    desc: '1,103세대 동안 카오스적으로 성장하는 5개 셀',
    cells: [
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 2],
      [3, 2],
    ],
  },
];

export function GameOfLifeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [grid, setGrid] = useState<Uint8Array>(() => new Uint8Array(GRID_COLS * GRID_ROWS));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [generation, setGeneration] = useState<number>(0);
  const [population, setPopulation] = useState<number>(0);
  const [fps, setFps] = useState<number>(15);

  const gridRef = useRef<Uint8Array>(grid);
  gridRef.current = grid;
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;
  const isDrawingRef = useRef<boolean>(false);
  const drawModeRef = useRef<number>(1); // 1 = draw, 0 = erase

  // Step Conway Life Generation
  const stepGeneration = useCallback(() => {
    const current = gridRef.current;
    const next = new Uint8Array(GRID_COLS * GRID_ROWS);
    let aliveCount = 0;

    for (let r = 0; r < GRID_ROWS; r += 1) {
      for (let c = 0; c < GRID_COLS; c += 1) {
        let neighbors = 0;

        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + GRID_ROWS) % GRID_ROWS;
            const nc = (c + dc + GRID_COLS) % GRID_COLS;
            if (current[nr * GRID_COLS + nc] === 1) {
              neighbors += 1;
            }
          }
        }

        const idx = r * GRID_COLS + c;
        const isAlive = current[idx] === 1;

        // B3 / S23 Rule:
        // 1. Any live cell with 2 or 3 neighbors survives.
        // 2. Any dead cell with exactly 3 neighbors becomes a live cell.
        // 3. All other live cells die.
        if (isAlive && (neighbors === 2 || neighbors === 3)) {
          next[idx] = 1;
          aliveCount += 1;
        } else if (!isAlive && neighbors === 3) {
          next[idx] = 1;
          aliveCount += 1;
        }
      }
    }

    gridRef.current = next;
    setGrid(next);
    setGeneration((prev) => prev + 1);
    setPopulation(aliveCount);
  }, []);

  // Animation Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        stepGeneration();
      }, 1000 / fps);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, fps, stepGeneration]);

  // Load Preset
  const loadPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    const next = new Uint8Array(GRID_COLS * GRID_ROWS);
    const startR = Math.floor(GRID_ROWS / 2) - 10;
    const startC = Math.floor(GRID_COLS / 2) - 20;

    let count = 0;
    preset.cells.forEach(([r, c]) => {
      const targetR = startR + r;
      const targetC = startC + c;
      if (targetR >= 0 && targetR < GRID_ROWS && targetC >= 0 && targetC < GRID_COLS) {
        next[targetR * GRID_COLS + targetC] = 1;
        count += 1;
      }
    });

    gridRef.current = next;
    setGrid(next);
    setGeneration(0);
    setPopulation(count);
  }, []);

  // Load Initial Preset on Mount
  useEffect(() => {
    loadPreset(PRESETS[0]);
  }, [loadPreset]);

  // Randomize Grid
  const handleRandomize = (density: number = 0.2) => {
    const next = new Uint8Array(GRID_COLS * GRID_ROWS);
    let count = 0;
    for (let i = 0; i < next.length; i += 1) {
      if (Math.random() < density) {
        next[i] = 1;
        count += 1;
      }
    }
    gridRef.current = next;
    setGrid(next);
    setGeneration(0);
    setPopulation(count);
  };

  // Clear Grid
  const handleClear = () => {
    setIsRunning(false);
    const next = new Uint8Array(GRID_COLS * GRID_ROWS);
    gridRef.current = next;
    setGrid(next);
    setGeneration(0);
    setPopulation(0);
  };

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= GRID_COLS; c += 1) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, height);
      ctx.stroke();
    }
    for (let r = 0; r <= GRID_ROWS; r += 1) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(width, r * cellH);
      ctx.stroke();
    }

    // Draw Alive Cells
    ctx.fillStyle = '#10B981';
    for (let r = 0; r < GRID_ROWS; r += 1) {
      for (let c = 0; c < GRID_COLS; c += 1) {
        if (grid[r * GRID_COLS + c] === 1) {
          ctx.fillRect(c * cellW + 0.5, r * cellH + 0.5, cellW - 1, cellH - 1);
        }
      }
    }
  }, [grid]);

  // Mouse Interaction (Click/Drag Drawing)
  const toggleCellAtPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellW = rect.width / GRID_COLS;
    const cellH = rect.height / GRID_ROWS;

    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);

    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
      const idx = r * GRID_COLS + c;
      const next = new Uint8Array(gridRef.current);
      next[idx] = drawModeRef.current as number;
      gridRef.current = next;
      setGrid(next);

      let count = 0;
      for (let i = 0; i < next.length; i += 1) if (next[i] === 1) count += 1;
      setPopulation(count);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / (rect.width / GRID_COLS));
    const r = Math.floor((e.clientY - rect.top) / (rect.height / GRID_ROWS));
    const currentVal = gridRef.current[r * GRID_COLS + c] || 0;
    drawModeRef.current = currentVal === 1 ? 0 : 1;
    toggleCellAtPos(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    toggleCellAtPos(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Presets Bar */}
      <Card sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            생명체 프리셋:
          </Typography>
          {PRESETS.map((p) => (
            <Chip
              key={p.name}
              label={p.name}
              clickable
              variant="outlined"
              color="primary"
              onClick={() => loadPreset(p)}
            />
          ))}
          <Chip
            icon={<CasinoRoundedIcon />}
            label="무작위 20% 배치"
            clickable
            color="secondary"
            onClick={() => handleRandomize(0.2)}
          />
        </Box>
      </Card>

      {/* Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas */}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                2D 생명 그리드 ({GRID_COLS}×{GRID_ROWS})
              </Typography>
              <Chip size="small" label={`세대: ${generation}`} color="primary" />
              <Chip size="small" label={`생존 세포: ${population}`} color="success" />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              캔버스 클릭/드래그: 셀 그리기/지우기
            </Typography>
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: 720,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
              cursor: 'crosshair',
            }}
          >
            <canvas
              ref={canvasRef}
              width={720}
              height={450}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Action Bar */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, alignItems: 'center' }}>
            <Button
              variant={isRunning ? 'outlined' : 'contained'}
              color={isRunning ? 'warning' : 'success'}
              size="small"
              startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setIsRunning((prev) => !prev)}
            >
              {isRunning ? '일시정지' : '시작 (Run)'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<SkipNextRoundedIcon />}
              onClick={stepGeneration}
              disabled={isRunning}
            >
              1세대 전진 (Step)
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleClear}
            >
              화면 비우기
            </Button>
          </Box>
        </Card>

        {/* Right: Rules & Settings */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              시뮬레이션 속도 제어
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  초당 세대수: {fps} FPS
                </Typography>
              </Box>
              <Slider
                value={fps}
                min={1}
                max={60}
                step={1}
                onChange={(_, v) => setFps(v as number)}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}
            >
              🧬 콘웨이의 생명 게임(Conway&apos;s Game of Life) 규칙 (B3/S23)
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              1. <b>생존(Survival)</b>: 살아있는 세포 주위에 이웃이 2개 또는 3개면 다음 세대에도
              생존합니다.
              <br />
              2. <b>탄생(Birth)</b>: 죽은 세포 주위에 이웃이 정확히 3개면 새 세포가 탄생합니다.
              <br />
              3. <b>사망(Overpopulation/Isolation)</b>: 이웃이 1개 이하(고독사)이거나 4개
              이상(과밀사)이면 사망합니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
