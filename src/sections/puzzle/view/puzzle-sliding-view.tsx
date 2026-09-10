'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import {
  isSolved,
  moveTile,
  isSolvable,
  shuffleBoard,
  getGoalBoard,
  type SlidingSize,
  getMovableIndices,
  solveSlidingPuzzle,
  getSlidingStepDescription,
} from '../utils/sliding-solver';

export function PuzzleSlidingView() {
  const [size, setSize] = useState<SlidingSize>(3);
  const [board, setBoard] = useState<number[]>(() => getGoalBoard(3));
  const [, setInitialBoard] = useState<number[]>(() => getGoalBoard(3));
  const [movesCount, setMovesCount] = useState<number>(0);

  // Playback state
  const [solutionSteps, setSolutionSteps] = useState<number[][]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [hintTileIndex, setHintTileIndex] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const solved = isSolved(board, size);
  const movable = getMovableIndices(board, size);

  // Completion toast
  useEffect(() => {
    if (solved && movesCount > 0) {
      toast.success('축하합니다! 슬라이딩 퍼즐을 완벽하게 완성했습니다!', {
        id: 'sliding-status',
      });
    }
  }, [movesCount, solved]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleTileClick = useCallback(
    (tileIdx: number) => {
      stopPlayback();
      const nextBoard = moveTile(board, tileIdx, size);
      if (nextBoard) {
        setBoard(nextBoard);
        setMovesCount((prev) => prev + 1);
        setHintTileIndex(null);
        setSolutionSteps([]);
        setCurrentStepIndex(0);
      }
    },
    [board, size, stopPlayback]
  );

  const handleShuffle = useCallback(() => {
    stopPlayback();
    const shuffled = shuffleBoard(size, size === 3 ? 30 : 25);
    setBoard(shuffled);
    setInitialBoard(shuffled);
    setMovesCount(0);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setHintTileIndex(null);
    toast.info('퍼즐이 무작위로 셔플되었습니다.', { id: 'sliding-status' });
  }, [size, stopPlayback]);

  const handleReset = useCallback(() => {
    stopPlayback();
    const goal = getGoalBoard(size);
    setBoard(goal);
    setInitialBoard(goal);
    setMovesCount(0);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setHintTileIndex(null);
    toast.info('정답 상태로 초기화되었습니다.', { id: 'sliding-status' });
  }, [size, stopPlayback]);

  const handleChangeSize = useCallback(
    (newSize: SlidingSize) => {
      stopPlayback();
      setSize(newSize);
      const goal = getGoalBoard(newSize);
      setBoard(goal);
      setInitialBoard(goal);
      setMovesCount(0);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setHintTileIndex(null);
      toast.info(`[${newSize}x${newSize}] 보드로 변경되었습니다.`, { id: 'sliding-preset' });
    },
    [stopPlayback]
  );

  // Playback logic
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0) return solutionSteps;
    const { solved: success, steps } = solveSlidingPuzzle(board, size);
    if (!success || steps.length <= 1) {
      toast.error('해결 경로를 찾을 수 없습니다.', { id: 'sliding-status' });
      return [];
    }
    setSolutionSteps(steps);
    return steps;
  }, [board, size, solutionSteps]);

  const applyStep = useCallback((stepIdx: number, steps: number[][]) => {
    setCurrentStepIndex(stepIdx);
    if (stepIdx >= 0 && stepIdx < steps.length) {
      setBoard(steps[stepIdx]);
      if (stepIdx > 0) {
        const prev = steps[stepIdx - 1];
        const curr = steps[stepIdx];
        const emptyPrev = prev.indexOf(0);
        const movedVal = curr[emptyPrev];
        setHintTileIndex(curr.indexOf(movedVal));
      } else {
        setHintTileIndex(null);
      }
    }
  }, []);

  const handleTogglePlay = useCallback(() => {
    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      if (currentStepIndex >= steps.length - 1) {
        applyStep(0, steps);
      }
      setIsPlaying(true);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, isPlaying, stopPlayback]);

  const handleStepChange = useCallback(
    (targetStep: number) => {
      stopPlayback();
      const steps = ensureStepsGenerated();
      if (targetStep >= 0 && targetStep < steps.length) {
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
    if (currentStepIndex < steps.length - 1) {
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

    const delay = Math.max(80, Math.round(260 / speed));
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        let steps = solutionSteps;
        if (steps.length === 0) {
          const res = solveSlidingPuzzle(board, size);
          if (res.solved) {
            steps = res.steps;
            setSolutionSteps(steps);
          }
        }

        if (prev < steps.length - 1) {
          const nextIdx = prev + 1;
          setBoard(steps[nextIdx]);
          const prevStep = steps[nextIdx - 1];
          const currStep = steps[nextIdx];
          const emptyPrev = prevStep.indexOf(0);
          const movedVal = currStep[emptyPrev];
          setHintTileIndex(currStep.indexOf(movedVal));
          return nextIdx;
        }
        stopPlayback();
        return prev;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [board, isPlaying, size, solutionSteps, speed, stopPlayback]);

  // 치트키 1: 전체 즉시 완성 (Auto Solve)
  const handleAutoSolve = useCallback(() => {
    stopPlayback();
    const { solved: success, steps } = solveSlidingPuzzle(board, size);
    if (success && steps.length > 0) {
      setBoard(steps[steps.length - 1]);
      setSolutionSteps(steps);
      setCurrentStepIndex(steps.length - 1);
      setHintTileIndex(null);
      toast.success(`⚡ 전체 즉시 완성! 총 ${steps.length - 1}회 이동으로 완료되었습니다.`, {
        id: 'sliding-status',
      });
    } else {
      toast.error('해결 경로를 찾을 수 없습니다.', { id: 'sliding-status' });
    }
  }, [board, size, stopPlayback]);

  // 치트키 2: 다음 이동 타일 힌트 (Single Hint)
  const handleSingleHint = useCallback(() => {
    stopPlayback();
    if (solved) {
      toast.info('이미 퍼즐이 완성되어 있습니다.', { id: 'sliding-status' });
      return;
    }
    const { solved: success, steps } = solveSlidingPuzzle(board, size);
    if (success && steps.length >= 2) {
      const nextBoard = steps[1];
      const emptyNow = board.indexOf(0);
      const movedTileValue = nextBoard[emptyNow];
      const movedTileIndex = board.indexOf(movedTileValue);
      setHintTileIndex(movedTileIndex);
      toast.info(`💡 힌트 치트: [${movedTileValue}]번 타일을 빈칸으로 이동하세요!`, {
        id: 'sliding-status',
      });
    } else {
      toast.error('현재 상태에서 힌트를 계산할 수 없습니다.', { id: 'sliding-status' });
    }
  }, [board, size, solved, stopPlayback]);

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1] && solutionSteps[currentStepIndex]
      ? getSlidingStepDescription(
          solutionSteps[currentStepIndex - 1],
          solutionSteps[currentStepIndex],
          size
        )
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
            슬라이딩 퍼즐 (15-Puzzle) 치트키 & 플레이어
          </Typography>
          <Chip label="A* Visual Player" size="small" color="primary" variant="soft" />
        </Box>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
        >
          타일을 슬라이드해 맞추거나, 재생 버튼을 눌러 A* 최단 경로 풀이 과정을 관람하세요.
        </Typography>
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
        {/* Left: Sliding Board Card */}
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
          {/* Status Badges */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Chip label={`크기: ${size}x${size}`} size="small" variant="outlined" />
            <Chip label={`이동 횟수: ${movesCount}회`} size="small" color="info" variant="soft" />
            <Chip
              label={isSolvable(board, size) ? '해결 가능 (Solvable)' : '해결 불가'}
              size="small"
              color={isSolvable(board, size) ? 'success' : 'error'}
              variant="soft"
            />
          </Box>

          {/* Board Grid Box */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                maxHeight: '100%',
                aspectRatio: '1 / 1',
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`,
                gap: 1.25,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 2,
                border: '3px solid',
                borderColor: 'divider',
                boxShadow: 3,
              }}
            >
              {board.map((val, idx) => {
                const isEmpty = val === 0;
                const isHint = hintTileIndex === idx;
                const canMove = movable.includes(idx);

                if (isEmpty) {
                  return (
                    <Box
                      key={`empty-${idx}`}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        opacity: 0.35,
                        border: '2px dashed',
                        borderColor: 'divider',
                      }}
                    />
                  );
                }

                return (
                  <Box
                    key={`tile-${val}`}
                    onClick={() => handleTileClick(idx)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      cursor: canMove ? 'pointer' : 'default',
                      userSelect: 'none',
                      bgcolor: isHint
                        ? 'warning.main'
                        : canMove
                          ? 'primary.main'
                          : 'primary.darker',
                      color: '#FFF',
                      boxShadow: canMove ? 3 : 1,
                      transform: canMove ? 'scale(1)' : 'scale(0.98)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      border: isHint ? '3px solid #FFF' : 'none',
                      '&:hover': canMove
                        ? {
                            transform: 'scale(1.03)',
                            filter: 'brightness(1.1)',
                          }
                        : {},
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
                        fontWeight: 800,
                      }}
                    >
                      {val}
                    </Typography>
                    {isHint && (
                      <Chip
                        label="HINT"
                        size="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Quick action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%', maxWidth: 400, flexShrink: 0 }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="small"
              startIcon={<ShuffleRoundedIcon />}
              onClick={handleShuffle}
              disabled={isPlaying}
            >
              퍼즐 셔플하기
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              size="small"
              startIcon={<AutorenewRoundedIcon />}
              onClick={handleReset}
              disabled={isPlaying}
            >
              정답 상태로 초기화
            </Button>
          </Box>
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
          {/* Board Size Selector */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              label="보드 크기"
              value={size}
              onChange={(e) => handleChangeSize(Number(e.target.value) as SlidingSize)}
              fullWidth
              size="small"
              disabled={isPlaying}
            >
              <MenuItem value={3}>3x3 (8-퍼즐, 추천)</MenuItem>
              <MenuItem value={4}>4x4 (15-퍼즐)</MenuItem>
            </TextField>
          </Box>

          <Divider />

          {/* 🎬 Visual Player Controls */}
          <PuzzlePlayerControls
            variant="plain"
            title="🎬 슬라이딩 최단 경로 재생"
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={solutionSteps.length > 0 ? solutionSteps.length - 1 : 20}
            onStepChange={handleStepChange}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleResetPlayback}
            speed={speed}
            onSpeedChange={setSpeed}
            currentDescription={currentDescription}
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
              onClick={handleAutoSolve}
              disabled={isPlaying}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              치트키: 전체 즉시 완성 (Auto Solve)
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<LightbulbRoundedIcon />}
              onClick={handleSingleHint}
              disabled={isPlaying || solved}
              sx={{ py: 1, fontWeight: 700 }}
            >
              치트키: 다음 이동 타일 힌트 (Next Hint)
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
