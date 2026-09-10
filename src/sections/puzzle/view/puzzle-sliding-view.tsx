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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzleMediaActions } from '../components/puzzle-media-actions';
import { usePuzzleMediaExport } from '../hooks/use-puzzle-media-export';
import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import { SlidingImageUploadDialog } from '../components/sliding-image-upload-dialog';
import { makeBoardSolvable, getTileBackgroundStyle } from '../utils/sliding-image-utils';
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

  // Problem Creation & Edit Mode state
  const [isEditingBoard, setIsEditingBoard] = useState<boolean>(false);
  const [selectedEditSwapIdx, setSelectedEditSwapIdx] = useState<number | null>(null);

  // Image Puzzle states
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [showTileNumbers, setShowTileNumbers] = useState<boolean>(true);

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
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

  // Apply custom puzzle from upload modal
  const handleApplyCustomPuzzle = useCallback(
    (config: { size: SlidingSize; board: number[]; imageUrl?: string; showNumbers: boolean }) => {
      stopPlayback();
      setIsEditingBoard(false);
      setSelectedEditSwapIdx(null);
      setSize(config.size);
      setBoard(config.board);
      setInitialBoard(config.board);
      setCustomImageUrl(config.imageUrl || null);
      setShowTileNumbers(config.showNumbers);
      setMovesCount(0);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setHintTileIndex(null);
    },
    [stopPlayback]
  );

  // Toggle Board Edit Mode (Problem Creation on Main Board)
  const handleToggleEditMode = useCallback(() => {
    stopPlayback();
    if (!isEditingBoard) {
      setIsEditingBoard(true);
      setSelectedEditSwapIdx(null);
      toast.info('✏️ 문제 만들기(편집 모드) 활성화! 타일을 클릭하여 위치를 자유롭게 바꾸세요.', {
        id: 'sliding-edit-mode',
      });
    } else {
      if (!isSolvable(board, size)) {
        toast.error(
          '현재 배치는 해결이 불가능합니다. [해결 가능하게 자동 수정]을 먼저 클릭하세요!',
          {
            id: 'sliding-edit-mode',
          }
        );
        return;
      }
      setIsEditingBoard(false);
      setSelectedEditSwapIdx(null);
      setInitialBoard([...board]);
      setMovesCount(0);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      toast.success('🎉 새로운 퍼즐 문제가 설정되었습니다! 이제 완성해보세요.', {
        id: 'sliding-edit-mode',
      });
    }
  }, [board, isEditingBoard, size, stopPlayback]);

  const handleEditTileClick = useCallback(
    (idx: number) => {
      if (selectedEditSwapIdx === null) {
        setSelectedEditSwapIdx(idx);
      } else if (selectedEditSwapIdx === idx) {
        setSelectedEditSwapIdx(null);
      } else {
        setBoard((prev) => {
          const next = [...prev];
          const temp = next[selectedEditSwapIdx];
          next[selectedEditSwapIdx] = next[idx];
          next[idx] = temp;
          return next;
        });
        setSelectedEditSwapIdx(null);
      }
    },
    [selectedEditSwapIdx]
  );

  const handleFixBoardSolvability = useCallback(() => {
    const fixed = makeBoardSolvable(board, size);
    setBoard(fixed);
    setSelectedEditSwapIdx(null);
    toast.success('⚡ 타일 순열을 보정하여 해결 가능한 문제로 수정했습니다!', {
      id: 'sliding-fix',
    });
  }, [board, size]);

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

  // Media export (Screenshot & GIF)
  const mediaExport = usePuzzleMediaExport({
    boardRef,
    gameTitle: 'sliding',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            타일을 슬라이드해 맞추거나, 재생 버튼을 눌러 A* 최단 경로 풀이 과정을 관람하세요.
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
            {customImageUrl && (
              <Chip
                icon={<ImageRoundedIcon />}
                label="사진 퍼즐 활성화됨"
                size="small"
                color="secondary"
                variant="soft"
              />
            )}
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
              ref={boardRef}
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
                const bgStyle =
                  customImageUrl && !isEmpty
                    ? getTileBackgroundStyle(val, size, customImageUrl)
                    : {};

                const isSelectedForEdit = isEditingBoard && selectedEditSwapIdx === idx;

                if (isEmpty) {
                  return (
                    <Box
                      key={`empty-${idx}`}
                      onClick={() => isEditingBoard && handleEditTileClick(idx)}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: isSelectedForEdit ? 'warning.lighter' : 'background.paper',
                        opacity: isSelectedForEdit ? 0.8 : 0.35,
                        border: isSelectedForEdit ? '3px solid #FFAB00' : '2px dashed',
                        borderColor: isSelectedForEdit ? 'warning.main' : 'divider',
                        cursor: isEditingBoard ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isEditingBoard && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                        >
                          빈칸
                        </Typography>
                      )}
                    </Box>
                  );
                }

                return (
                  <Box
                    key={`tile-${val}`}
                    onClick={() =>
                      isEditingBoard ? handleEditTileClick(idx) : handleTileClick(idx)
                    }
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      cursor: isEditingBoard || canMove ? 'pointer' : 'default',
                      userSelect: 'none',
                      bgcolor: isHint
                        ? 'warning.main'
                        : canMove
                          ? 'primary.main'
                          : 'primary.darker',
                      color: '#FFF',
                      boxShadow: isSelectedForEdit ? 5 : canMove ? 3 : 1,
                      transform: isSelectedForEdit
                        ? 'scale(1.06)'
                        : canMove
                          ? 'scale(1)'
                          : 'scale(0.98)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      border: isSelectedForEdit
                        ? '3px solid #FFAB00'
                        : isHint
                          ? '3px solid #FFF'
                          : 'none',
                      ...bgStyle,
                      '&:hover':
                        isEditingBoard || canMove
                          ? {
                              transform: 'scale(1.03)',
                              filter: 'brightness(1.1)',
                            }
                          : {},
                    }}
                  >
                    {(!customImageUrl || showTileNumbers) && (
                      <Typography
                        sx={{
                          fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
                          fontWeight: 800,
                          textShadow: customImageUrl
                            ? '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                            : 'none',
                          color: '#FFFFFF',
                        }}
                      >
                        {val}
                      </Typography>
                    )}
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
          {/* Image & Custom Puzzle Upload Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltRoundedIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ py: 1.2, fontWeight: 800 }}
          >
            📷 이미지 퍼즐 만들기 & 배치 불러오기
          </Button>

          {/* Custom Problem Creation / Edit Button */}
          <Button
            variant={isEditingBoard ? 'contained' : 'outlined'}
            color="secondary"
            startIcon={isEditingBoard ? <CheckRoundedIcon /> : <EditRoundedIcon />}
            onClick={handleToggleEditMode}
            sx={{ py: 1, fontWeight: 700 }}
          >
            {isEditingBoard ? '✅ 문제 만들기 완료 (배치 확정)' : '✏️ 문제 직접 만들기 (배치 편집)'}
          </Button>

          {/* Edit Mode Alert & Solvability auto-fix */}
          {isEditingBoard && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'secondary.lighter',
                border: '1px solid',
                borderColor: 'secondary.main',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                💡 타일 2개를 차례로 클릭하여 서로 위치를 바꾸며 원하는 문제를 만드세요.
              </Typography>
              {!isSolvable(board, size) && (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={handleFixBoardSolvability}
                  sx={{ fontSize: '0.75rem', height: 28, fontWeight: 700 }}
                >
                  ⚡ 해결 가능한 배치로 자동 보정
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setIsEditingBoard(false);
                  setSelectedEditSwapIdx(null);
                  setBoard(getGoalBoard(size));
                }}
                sx={{ fontSize: '0.75rem', height: 28 }}
              >
                취소 (정답 상태로 초기화)
              </Button>
            </Box>
          )}

          {/* Image Puzzle Controls (When active) */}
          {customImageUrl && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                🖼️ 사진 퍼즐 옵션
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  fullWidth
                  startIcon={
                    showTileNumbers ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />
                  }
                  onClick={() => setShowTileNumbers((prev) => !prev)}
                  sx={{ fontSize: '0.75rem', height: 32 }}
                >
                  숫자 표시 {showTileNumbers ? '(ON)' : '(OFF)'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setCustomImageUrl(null)}
                  sx={{ fontSize: '0.75rem', height: 32, flexShrink: 0 }}
                >
                  사진 제거
                </Button>
              </Box>
            </Box>
          )}

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

      {/* Sliding Image Upload & Custom Board Modal */}
      <SlidingImageUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        currentSize={size}
        onApplyPuzzle={handleApplyCustomPuzzle}
      />
    </DashboardContent>
  );
}
