'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzleMediaActions } from '../components/puzzle-media-actions';
import { usePuzzleMediaExport } from '../hooks/use-puzzle-media-export';
import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import { NonogramImageUploadDialog } from '../components/nonogram-image-upload-dialog';
import {
  getHintCell,
  generateClues,
  isRowSatisfied,
  NONOGRAM_PRESETS,
  type NonogramStep,
  type NonogramPreset,
  type NonogramCellState,
  createCustomNonogramPreset,
  generateNonogramSolutionSteps,
} from '../utils/nonogram-solver';

export function PuzzleNonogramView() {
  const [customPresets, setCustomPresets] = useState<NonogramPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(NONOGRAM_PRESETS[0].id);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);

  // Directly creating/designing a custom puzzle mode
  const [isDesignMode, setIsDesignMode] = useState<boolean>(false);
  const [designGridSize, setDesignGridSize] = useState<number>(10);
  const [designGrid, setDesignGrid] = useState<number[][]>(() =>
    Array.from({ length: 10 }, () => Array(10).fill(0))
  );

  const allPresets = useMemo(() => [...NONOGRAM_PRESETS, ...customPresets], [customPresets]);

  const currentPreset = useMemo(
    () => allPresets.find((p) => p.id === selectedPresetId) || allPresets[0],
    [allPresets, selectedPresetId]
  );

  const [grid, setGrid] = useState<NonogramCellState[][]>(() =>
    Array.from({ length: NONOGRAM_PRESETS[0].height }, () =>
      Array(NONOGRAM_PRESETS[0].width).fill(0)
    )
  );

  const [inputMode, setInputMode] = useState<'fill' | 'cross'>('fill');
  const [hintCellCoord, setHintCellCoord] = useState<string | null>(null);

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<NonogramStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check completion
  const isCompleted = useMemo(() => {
    const { solution, height, width } = currentPreset;
    for (let r = 0; r < height; r += 1) {
      for (let c = 0; c < width; c += 1) {
        if (solution[r][c] === 1 && grid[r][c] !== 1) return false;
        if (solution[r][c] === 0 && grid[r][c] === 1) return false;
      }
    }
    return true;
  }, [currentPreset, grid]);

  // Completion toast
  useEffect(() => {
    if (isCompleted) {
      toast.success(`도안 완성! 멋진 픽셀 아트 [${currentPreset.name}]를 완성하셨습니다!`, {
        id: 'nonogram-status',
      });
    }
  }, [currentPreset.name, isCompleted]);

  // Progress
  const progress = useMemo(() => {
    let totalTarget = 0;
    let correctlyFilled = 0;
    const { solution, height, width } = currentPreset;
    for (let r = 0; r < height; r += 1) {
      for (let c = 0; c < width; c += 1) {
        if (solution[r][c] === 1) {
          totalTarget += 1;
          if (grid[r][c] === 1) correctlyFilled += 1;
        }
      }
    }
    return totalTarget > 0 ? Math.round((correctlyFilled / totalTarget) * 100) : 0;
  }, [currentPreset, grid]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      stopPlayback();
      if (presetId.startsWith('empty-')) {
        const actualSize = presetId === 'empty-5x5' ? 5 : presetId === 'empty-15x15' ? 15 : 10;
        setDesignGridSize(actualSize);
        setIsDesignMode(true);
        setDesignGrid(Array.from({ length: actualSize }, () => Array(actualSize).fill(0)));
        setHintCellCoord(null);
        setSolutionSteps([]);
        setCurrentStepIndex(0);
        setSelectedPresetId(presetId);
        toast.info(
          `🎨 [직접 만들기 ${actualSize}x${actualSize}] 모드로 전환되었습니다. 빈 캔버스에 그림을 그려보세요!`,
          { id: 'nonogram-mode' }
        );
        return;
      }

      setIsDesignMode(false);
      setSelectedPresetId(presetId);
      const preset = allPresets.find((p) => p.id === presetId) || allPresets[0];
      setGrid(Array.from({ length: preset.height }, () => Array(preset.width).fill(0)));
      setHintCellCoord(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      toast.info(`[${preset.name}] 도안이 적용되었습니다.`, { id: 'nonogram-preset' });
    },
    [allPresets, stopPlayback]
  );

  // Apply preset uploaded from image dialog
  const handleApplyUploadedPreset = useCallback(
    (newPreset: NonogramPreset) => {
      stopPlayback();
      setIsDesignMode(false);
      setCustomPresets((prev) => [newPreset, ...prev]);
      setSelectedPresetId(newPreset.id);
      setGrid(Array.from({ length: newPreset.height }, () => Array(newPreset.width).fill(0)));
      setHintCellCoord(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
    },
    [stopPlayback]
  );

  // Design Mode Handlers
  const handleEnterDesignMode = useCallback(() => {
    stopPlayback();
    setIsDesignMode(true);
    setDesignGrid(Array.from({ length: designGridSize }, () => Array(designGridSize).fill(0)));
    setHintCellCoord(null);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    toast.info('🎨 도안 만들기 모드로 전환되었습니다. 빈 캔버스에 나만의 픽셀 그림을 그려보세요!', {
      id: 'nonogram-mode',
    });
  }, [designGridSize, stopPlayback]);

  const handleChangeDesignSize = useCallback((newSize: number) => {
    setDesignGridSize(newSize);
    setDesignGrid(Array.from({ length: newSize }, () => Array(newSize).fill(0)));
  }, []);

  const handleDesignCellClick = useCallback((r: number, c: number) => {
    setDesignGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  }, []);

  const handleStartPuzzleFromDesign = useCallback(() => {
    const filled = designGrid.flat().filter((v) => v === 1).length;
    if (filled === 0) {
      toast.warning('도안에 칠해진 픽셀이 없습니다. 캔버스에 그림을 먼저 그려주세요.', {
        id: 'nonogram-design',
      });
      return;
    }
    const customName = `직접 만든 도안 (${designGridSize}x${designGridSize})`;
    const customPreset = createCustomNonogramPreset(customName, designGrid);
    setCustomPresets((prev) => [customPreset, ...prev]);
    setSelectedPresetId(customPreset.id);
    setGrid(Array.from({ length: customPreset.height }, () => Array(customPreset.width).fill(0)));
    setIsDesignMode(false);
    setHintCellCoord(null);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    toast.success('🎉 도안이 문제로 등록되었습니다! 이제 완성된 힌트로 퍼즐을 풀어보세요.', {
      id: 'nonogram-design',
    });
  }, [designGrid, designGridSize]);

  // Design mode clues
  const designClues = useMemo(() => {
    if (!isDesignMode) return { rowClues: [], colClues: [] };
    return generateClues(designGrid);
  }, [designGrid, isDesignMode]);

  const handleCellClick = useCallback(
    (r: number, c: number, forcedMode?: 'fill' | 'cross') => {
      stopPlayback();
      const mode = forcedMode || inputMode;
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const current = next[r][c];

        if (mode === 'fill') {
          next[r][c] = current === 1 ? 0 : 1;
        } else {
          next[r][c] = current === 2 ? 0 : 2;
        }
        return next;
      });
      setHintCellCoord(null);
    },
    [inputMode, stopPlayback]
  );

  // Playback logic
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0) return solutionSteps;
    const emptyGrid: NonogramCellState[][] = Array.from({ length: currentPreset.height }, () =>
      Array(currentPreset.width).fill(0)
    );
    const generated = generateNonogramSolutionSteps(emptyGrid, currentPreset.solution);
    setSolutionSteps(generated);
    return generated;
  }, [currentPreset, solutionSteps]);

  const applyStep = useCallback(
    (stepIdx: number, steps: NonogramStep[]) => {
      setCurrentStepIndex(stepIdx);
      if (stepIdx === 0) {
        setGrid(
          Array.from({ length: currentPreset.height }, () => Array(currentPreset.width).fill(0))
        );
        setHintCellCoord(null);
      } else {
        const step = steps[stepIdx - 1];
        setGrid(step.grid.map((row) => [...row]));
        setHintCellCoord(`${step.row}-${step.col}`);
      }
    },
    [currentPreset]
  );

  const handleTogglePlay = useCallback(() => {
    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      if (currentStepIndex >= steps.length) {
        applyStep(0, steps);
      }
      setIsPlaying(true);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, isPlaying, stopPlayback]);

  // Media export (Screenshot & GIF)
  const mediaExport = usePuzzleMediaExport({
    boardRef,
    gameTitle: 'nonogram',
    isPlaying,
    currentStep: currentStepIndex,
    totalSteps: solutionSteps.length,
    speed,
    onStartPlay: handleTogglePlay,
  });

  const handleStepChange = useCallback(
    (targetStep: number) => {
      stopPlayback();
      const steps = ensureStepsGenerated();
      if (targetStep >= 0 && targetStep <= steps.length) {
        applyStep(targetStep, steps);
      }
    },
    [applyStep, ensureStepsGenerated, stopPlayback]
  );

  const handlePrevStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1, steps);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback]);

  const handleNextStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex < steps.length) {
      applyStep(currentStepIndex + 1, steps);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback]);

  const handleResetPlayback = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    applyStep(0, steps);
  }, [applyStep, ensureStepsGenerated, stopPlayback]);

  // Interval ticker
  useEffect(() => {
    if (!isPlaying) return () => {};

    const delay = Math.max(50, Math.round(180 / speed));
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const emptyGrid: NonogramCellState[][] = Array.from({ length: currentPreset.height }, () =>
          Array(currentPreset.width).fill(0)
        );
        const steps =
          solutionSteps.length > 0
            ? solutionSteps
            : generateNonogramSolutionSteps(emptyGrid, currentPreset.solution);

        if (prev < steps.length) {
          const nextIdx = prev + 1;
          const step = steps[nextIdx - 1];
          setGrid(step.grid.map((row) => [...row]));
          setHintCellCoord(`${step.row}-${step.col}`);
          return nextIdx;
        }
        stopPlayback();
        return prev;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [currentPreset, isPlaying, solutionSteps, speed, stopPlayback]);

  // 치트키 1: 전체 완성 치트 (Solve All)
  const handleSolveAll = useCallback(() => {
    stopPlayback();
    const { solution, height, width } = currentPreset;
    const solvedGrid: NonogramCellState[][] = Array.from({ length: height }, (_, r) =>
      Array.from({ length: width }, (__, c) => (solution[r][c] === 1 ? 1 : 2))
    );
    setGrid(solvedGrid);
    const steps = ensureStepsGenerated();
    setCurrentStepIndex(steps.length);
    toast.success('⚡ 전체 완성 치트 발동! 도안의 숨겨진 픽셀 아트를 완성했습니다.', {
      id: 'nonogram-status',
    });
  }, [currentPreset, ensureStepsGenerated, stopPlayback]);

  // 치트키 2: 한 칸 정답 힌트 (Hint)
  const handleSingleHint = useCallback(() => {
    stopPlayback();
    const hint = getHintCell(grid, currentPreset.solution);
    if (hint) {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[hint.row][hint.col] = hint.state;
        return next;
      });
      setHintCellCoord(`${hint.row}-${hint.col}`);
      toast.info(
        `💡 힌트 치트: (${hint.row + 1}행, ${hint.col + 1}열) 정답 [${
          hint.state === 1 ? '칠하기' : 'X 표시'
        }]을 채웠습니다!`,
        { id: 'nonogram-status' }
      );
    } else {
      toast.info('이미 모든 칸이 정확하게 채워져 있습니다.', { id: 'nonogram-status' });
    }
  }, [currentPreset.solution, grid, stopPlayback]);

  // 초기화
  const handleReset = useCallback(() => {
    stopPlayback();
    setGrid(Array.from({ length: currentPreset.height }, () => Array(currentPreset.width).fill(0)));
    setHintCellCoord(null);
    setCurrentStepIndex(0);
    toast.info('보드가 초기화되었습니다.', { id: 'nonogram-status' });
  }, [currentPreset, stopPlayback]);

  const maxColCluesLen = useMemo(
    () => Math.max(...currentPreset.colClues.map((c) => c.length)),
    [currentPreset.colClues]
  );

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1]
      ? solutionSteps[currentStepIndex - 1].description
      : currentStepIndex === 0
        ? '시작 상태 (Initial State)'
        : null;

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        pb: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            네모네모 로직 (노노그램) 치트키 & 플레이어
          </Typography>
          <Chip label="Visual Step Player" size="small" color="primary" variant="soft" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            힌트 숫자로 픽셀 아트를 유추하거나, 재생 버튼을 눌러 완성 과정을 관람하세요.
          </Typography>
          <PuzzleMediaActions mediaExport={mediaExport} variant="header" />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          overflow: 'hidden',
        }}
      >
        {/* Left: Nonogram Grid Board Card */}
        <Card
          sx={{
            p: 2,
            flex: 1,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Input Mode Switcher or Design Mode Controls */}
          {isDesignMode ? (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Chip label="🎨 도안 직접 그리기 모드" color="secondary" size="small" />
              <TextField
                select
                size="small"
                label="캔버스 크기"
                value={designGridSize}
                onChange={(e) => handleChangeDesignSize(Number(e.target.value))}
                sx={{ width: 120 }}
              >
                <MenuItem value={5}>5 x 5</MenuItem>
                <MenuItem value={10}>10 x 10</MenuItem>
                <MenuItem value={15}>15 x 15</MenuItem>
              </TextField>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={handleStartPuzzleFromDesign}
                sx={{ fontWeight: 700 }}
              >
                이 도안으로 문제 시작
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setIsDesignMode(false)}
              >
                취소
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
              <Button
                variant={inputMode === 'fill' ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                startIcon={<CheckBoxRoundedIcon />}
                onClick={() => setInputMode('fill')}
              >
                칸 칠하기 모드 (좌클릭)
              </Button>
              <Button
                variant={inputMode === 'cross' ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                startIcon={<CloseRoundedIcon />}
                onClick={() => setInputMode('cross')}
              >
                X 표시 모드 (우클릭)
              </Button>
            </Box>
          )}

          {/* Nonogram Board Table Area (Scrolls internally if preset is large) */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
            }}
          >
            <Box
              ref={boardRef}
              sx={{
                display: 'inline-block',
                bgcolor: 'background.paper',
                p: 1.5,
                borderRadius: 1.5,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: 2,
                userSelect: 'none',
              }}
            >
              {/* Top Row: Empty Top-Left Corner + Column Clues */}
              <Box sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    width: { xs: 65, sm: 80 },
                    bgcolor: 'action.hover',
                    borderRight: '2px solid',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                    HINTS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  {(isDesignMode ? designClues.colClues : currentPreset.colClues).map(
                    (clues, c) => (
                      <Box
                        key={c}
                        sx={{
                          width: { xs: 28, sm: 34, md: 38 },
                          height: Math.max(45, maxColCluesLen * 18 + 8),
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 0.25,
                          pb: 0.5,
                          borderRight: (c + 1) % 5 === 0 ? '2px solid' : '1px solid',
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                        }}
                      >
                        {clues.map((n, idx) => (
                          <Typography
                            key={idx}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.78rem' },
                              fontWeight: 700,
                              lineHeight: 1,
                              color: n === 0 ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {n}
                          </Typography>
                        ))}
                      </Box>
                    )
                  )}
                </Box>
              </Box>

              {/* Rows: Row Clues + Cells */}
              {(isDesignMode ? designGrid : grid).map((row, r) => {
                const targetRowClues = isDesignMode
                  ? designClues.rowClues[r] || [0]
                  : currentPreset.rowClues[r];
                const rowDone =
                  !isDesignMode && isRowSatisfied(row as NonogramCellState[], targetRowClues);

                return (
                  <Box key={r} sx={{ display: 'flex' }}>
                    <Box
                      sx={{
                        width: { xs: 65, sm: 80 },
                        height: { xs: 28, sm: 34, md: 38 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pr: 1,
                        gap: 0.75,
                        borderRight: '2px solid',
                        borderBottom: (r + 1) % 5 === 0 ? '2px solid' : '1px solid',
                        borderColor: 'divider',
                        bgcolor: rowDone ? 'success.lighter' : 'action.hover',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {targetRowClues.map((n, idx) => (
                        <Typography
                          key={idx}
                          sx={{
                            fontSize: { xs: '0.72rem', sm: '0.8rem' },
                            fontWeight: 700,
                            color: rowDone
                              ? 'success.dark'
                              : n === 0
                                ? 'text.disabled'
                                : 'text.primary',
                            textDecoration: rowDone ? 'line-through' : 'none',
                          }}
                        >
                          {n}
                        </Typography>
                      ))}
                    </Box>

                    {row.map((cellState, c) => {
                      const isHinted = !isDesignMode && hintCellCoord === `${r}-${c}`;
                      const borderRight = (c + 1) % 5 === 0 ? '2px solid' : '1px solid';
                      const borderBottom = (r + 1) % 5 === 0 ? '2px solid' : '1px solid';

                      let cellBg = 'background.paper';
                      if (cellState === 1) cellBg = 'primary.main';
                      else if (isHinted) cellBg = 'warning.lighter';

                      return (
                        <Box
                          key={c}
                          onClick={() =>
                            isDesignMode ? handleDesignCellClick(r, c) : handleCellClick(r, c)
                          }
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!isDesignMode) {
                              handleCellClick(r, c, 'cross');
                            }
                          }}
                          sx={{
                            width: { xs: 28, sm: 34, md: 38 },
                            height: { xs: 28, sm: 34, md: 38 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: cellBg,
                            borderRight,
                            borderBottom,
                            borderColor: 'divider',
                            transition: 'background-color 0.1s',
                            '&:hover': {
                              opacity: 0.85,
                              filter: 'brightness(0.95)',
                            },
                          }}
                        >
                          {cellState === 2 && (
                            <CloseRoundedIcon
                              sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: 'text.secondary',
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', flexShrink: 0 }}
          >
            {isDesignMode
              ? '💡 도안 그리기 모드: 원하는 칸을 클릭하여 픽셀을 칠하세요. 완성 후 상단 [이 도안으로 문제 시작] 버튼을 누르면 풀이 모드로 전환됩니다.'
              : '💡 팁: PC에서는 마우스 우클릭으로 바로 X 표시를 남길 수 있습니다. 5칸마다 굵은 선으로 구분됩니다.'}
          </Typography>
        </Card>

        {/* Right: Unified Controls Sidebar */}
        <Card
          sx={{
            width: { xs: '100%', md: 380, lg: 400 },
            flexShrink: 0,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2.5,
            borderRadius: 2,
            overflowY: 'auto',
          }}
        >
          {/* Image to Nonogram Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltRoundedIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ py: 1.2, fontWeight: 800 }}
          >
            📷 이미지로 도안 불러오기 (픽셀 변환)
          </Button>

          {/* Custom Problem Creation Button */}
          <Button
            variant={isDesignMode ? 'contained' : 'outlined'}
            color="secondary"
            startIcon={<BrushRoundedIcon />}
            onClick={() => {
              if (isDesignMode) {
                setIsDesignMode(false);
              } else {
                handleEnterDesignMode();
              }
            }}
            sx={{ py: 1, fontWeight: 700 }}
          >
            {isDesignMode ? '🎨 도안 그리기 모드 종료' : '🎨 새 문제 직접 만들기 (도안 그리기)'}
          </Button>

          {/* Preset Selector */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              label="도안 프리셋"
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="empty-10x10" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                ✏️ 직접 만들기 (10x10 빈 도안)
              </MenuItem>
              <MenuItem value="empty-5x5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                ✏️ 직접 만들기 (5x5 빈 도안)
              </MenuItem>
              <MenuItem value="empty-15x15" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                ✏️ 직접 만들기 (15x15 빈 도안)
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {allPresets.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.width}x{p.height})
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleReset}
              sx={{ flexShrink: 0, height: 40 }}
              startIcon={<AutorenewRoundedIcon />}
            >
              초기화
            </Button>
          </Box>

          <Divider />

          {/* 🎬 Visual Player Controls */}
          <PuzzlePlayerControls
            variant="plain"
            title="🎬 노노그램 풀이 과정 재생"
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={
              solutionSteps.length > 0
                ? solutionSteps.length
                : currentPreset.width * currentPreset.height
            }
            onStepChange={handleStepChange}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleResetPlayback}
            speed={speed}
            onSpeedChange={setSpeed}
            currentDescription={currentDescription}
            mediaActions={<PuzzleMediaActions mediaExport={mediaExport} variant="compact" />}
          />

          <Divider />

          {/* Cheat Keys */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              ⚡ 즉시 해결 치트키
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<BoltRoundedIcon />}
              onClick={handleSolveAll}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              치트키: 전체 완성 치트 (Solve All)
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<LightbulbRoundedIcon />}
              onClick={handleSingleHint}
              sx={{ py: 1, fontWeight: 700 }}
            >
              치트키: 한 칸 정답 힌트 (Single Hint)
            </Button>

            {/* Progress bar */}
            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  도안 완성도
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Nonogram Image Upload & Pixel Conversion Modal */}
      <NonogramImageUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onApplyPreset={handleApplyUploadedPreset}
      />
    </DashboardContent>
  );
}
