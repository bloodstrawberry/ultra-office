'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
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
  getSlidingAlgorithmInfo,
  getSlidingStepDescription,
} from '../utils/sliding-solver';

export function PuzzleSlidingView() {
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [inputRows, setInputRows] = useState<string>('3');
  const [inputCols, setInputCols] = useState<string>('3');
  const [board, setBoard] = useState<number[]>(() => getGoalBoard(3, 3));
  const [, setInitialBoard] = useState<number[]>(() => getGoalBoard(3, 3));
  const [movesCount, setMovesCount] = useState<number>(0);

  const algoInfo = useMemo(() => getSlidingAlgorithmInfo(rows, cols), [rows, cols]);

  // Sanitizes dimension to be between 3 and 10; defaults to 3 on invalid input
  const sanitizeDimension = useCallback((val: string | number): number => {
    const raw = typeof val === 'number' ? val : parseInt(String(val).trim(), 10);
    if (isNaN(raw) || raw < 3 || raw > 10) {
      return 3;
    }
    return raw;
  }, []);

  // Problem Creation & Edit Mode state
  const [isEditingBoard, setIsEditingBoard] = useState<boolean>(false);
  const [selectedEditSwapIdx, setSelectedEditSwapIdx] = useState<number | null>(null);

  // Image Puzzle states
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [showTileNumbers, setShowTileNumbers] = useState<boolean>(true);

  // View & Zoom controls
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 600,
  });
  const [customZoom, setCustomZoom] = useState<number>(100);

  // ResizeObserver for board container to enable pixel-perfect responsive scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return undefined;
    }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ctrl + MouseWheel zoom shortcut
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return undefined;
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setCustomZoom((prev) => Math.min(200, prev + 10));
        } else {
          setCustomZoom((prev) => Math.max(50, prev - 10));
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Board & Tile Dimensions: Screen-fitted and optimized so 10x10 never creates scrollbars
  const { boardWidth, boardHeight, currentTileSize } = useMemo(() => {
    // Safe inner container dimensions leaving 16px breathing room to guarantee NO scrollbars
    const availW = Math.max(100, Math.floor(containerSize.width - 16));
    const availH = Math.max(100, Math.floor(containerSize.height - 16));

    // Maximum width & height that fits within container preserving aspect ratio
    let maxFitW = availW;
    let maxFitH = Math.floor(availW * (rows / cols));
    if (maxFitH > availH) {
      maxFitH = availH;
      maxFitW = Math.floor(availH * (cols / rows));
    }

    const maxDim = Math.max(rows, cols);

    // Natural preferred sizes for smaller boards so 3x3 doesn't stretch excessively
    let preferredPrimary: number;
    if (maxDim <= 3) {
      preferredPrimary = 370;
    } else if (maxDim <= 4) {
      preferredPrimary = 420;
    } else if (maxDim <= 5) {
      preferredPrimary = 460;
    } else if (maxDim <= 6) {
      preferredPrimary = 500;
    } else {
      preferredPrimary = 9999; // 7x7 ~ 10x10 will take full available fit size
    }

    const fitPrimary = cols >= rows ? maxFitW : maxFitH;
    const basePrimary = Math.min(fitPrimary, preferredPrimary);

    let baseW: number;
    let baseH: number;
    if (cols >= rows) {
      baseW = basePrimary;
      baseH = Math.floor(basePrimary * (rows / cols));
    } else {
      baseH = basePrimary;
      baseW = Math.floor(basePrimary * (cols / rows));
    }

    // Apply custom zoom (default 100%)
    const finalW = Math.round(baseW * (customZoom / 100));
    const finalH = Math.round(baseH * (customZoom / 100));
    const tileSz = Math.max(10, Math.floor(finalW / cols));

    return { boardWidth: finalW, boardHeight: finalH, currentTileSize: tileSz };
  }, [containerSize, rows, cols, customZoom]);

  const boardPadding = Math.max(rows, cols) <= 4 ? 1.5 : Math.max(rows, cols) <= 7 ? 1 : 0.75;

  const tilePadding =
    currentTileSize >= 80
      ? { xs: 0.35, sm: 0.5 }
      : currentTileSize >= 55
        ? 0.3
        : currentTileSize >= 40
          ? 0.2
          : 0.12;

  const tileRadius = currentTileSize >= 70 ? 1.5 : currentTileSize >= 45 ? 1 : 0.6;

  const getTileFontSize = useCallback(
    (val: number): { fontSize: string | object; letterSpacing: string } => {
      const isTwoDigit = val >= 10;
      const letterSpacing = isTwoDigit ? '-0.3px' : 'normal';

      let fontSize: string | object;
      if (currentTileSize >= 100) {
        fontSize = { xs: '1.4rem', sm: '1.7rem', md: '2rem' };
      } else if (currentTileSize >= 75) {
        fontSize = { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' };
      } else if (currentTileSize >= 60) {
        fontSize = '1.15rem';
      } else if (currentTileSize >= 45) {
        fontSize = '0.95rem';
      } else if (currentTileSize >= 35) {
        fontSize = '0.8rem';
      } else if (currentTileSize >= 25) {
        fontSize = '0.65rem';
      } else {
        fontSize = '0.52rem';
      }

      return { fontSize, letterSpacing };
    },
    [currentTileSize]
  );

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<number[][]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [hintTileIndex, setHintTileIndex] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const solved = isSolved(board, rows, cols);
  const movable = getMovableIndices(board, rows, cols);

  // Stable list of tile numbers [0, 1, ..., rows*cols - 1]
  const tiles = useMemo(() => Array.from({ length: rows * cols }, (_, i) => i), [rows, cols]);

  // Dynamic sliding duration: faster during auto-play, responsive kinetic feel during manual play
  const slideDurationMs = isPlaying
    ? Math.min(200, Math.max(60, Math.round((260 / speed) * 0.75)))
    : 180;

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
      const nextBoard = moveTile(board, tileIdx, rows, cols);
      if (nextBoard) {
        setBoard(nextBoard);
        setMovesCount((prev) => prev + 1);
        setHintTileIndex(null);
        setSolutionSteps([]);
        setCurrentStepIndex(0);
      }
    },
    [board, rows, cols, stopPlayback]
  );

  // Keyboard arrow keys & WASD controls for intuitive sliding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
        isEditingBoard ||
        uploadDialogOpen
      ) {
        return;
      }

      const emptyIdx = board.indexOf(0);
      if (emptyIdx === -1) return;

      const emptyRow = Math.floor(emptyIdx / cols);
      const emptyCol = emptyIdx % cols;

      let targetRow = -1;
      let targetCol = -1;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        targetRow = emptyRow + 1;
        targetCol = emptyCol;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        targetRow = emptyRow - 1;
        targetCol = emptyCol;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        targetRow = emptyRow;
        targetCol = emptyCol + 1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        targetRow = emptyRow;
        targetCol = emptyCol - 1;
      }

      if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
        e.preventDefault();
        const targetIdx = targetRow * cols + targetCol;
        handleTileClick(targetIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, handleTileClick, isEditingBoard, rows, cols, uploadDialogOpen]);

  const handleShuffle = useCallback(() => {
    stopPlayback();
    const shuffled = shuffleBoard(rows, cols);
    setBoard(shuffled);
    setInitialBoard(shuffled);
    setMovesCount(0);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setHintTileIndex(null);
    toast.info('퍼즐이 전체적으로 완벽하게 셔플되었습니다.', { id: 'sliding-status' });
  }, [rows, cols, stopPlayback]);

  const handleReset = useCallback(() => {
    stopPlayback();
    const goal = getGoalBoard(rows, cols);
    setBoard(goal);
    setInitialBoard(goal);
    setMovesCount(0);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setHintTileIndex(null);
    toast.info('정답 상태로 초기화되었습니다.', { id: 'sliding-status' });
  }, [rows, cols, stopPlayback]);

  const handleApplyDimensions = useCallback(
    (newRows: number | string, newCols: number | string) => {
      stopPlayback();
      const sanitizedR = sanitizeDimension(newRows);
      const sanitizedC = sanitizeDimension(newCols);

      setRows(sanitizedR);
      setCols(sanitizedC);
      setInputRows(String(sanitizedR));
      setInputCols(String(sanitizedC));

      const goal = getGoalBoard(sanitizedR, sanitizedC);
      setBoard(goal);
      setInitialBoard(goal);
      setMovesCount(0);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setHintTileIndex(null);
      setSelectedEditSwapIdx(null);
      toast.info(
        `[${sanitizedR}행 × ${sanitizedC}열] (${sanitizedR * sanitizedC - 1}퍼즐) 보드로 변경되었습니다.`,
        {
          id: 'sliding-preset',
        }
      );
    },
    [sanitizeDimension, stopPlayback]
  );

  // Apply custom puzzle from upload modal
  const handleApplyCustomPuzzle = useCallback(
    (config: {
      size: SlidingSize;
      rows?: number;
      cols?: number;
      board: number[];
      imageUrl?: string;
      showNumbers: boolean;
    }) => {
      stopPlayback();
      setIsEditingBoard(false);
      setSelectedEditSwapIdx(null);
      const newR = sanitizeDimension(config.rows ?? config.size ?? 3);
      const newC = sanitizeDimension(config.cols ?? config.size ?? 3);
      setRows(newR);
      setCols(newC);
      setInputRows(String(newR));
      setInputCols(String(newC));
      setBoard(config.board);
      setInitialBoard(config.board);
      setCustomImageUrl(config.imageUrl || null);
      setShowTileNumbers(config.showNumbers);
      setMovesCount(0);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setHintTileIndex(null);
    },
    [sanitizeDimension, stopPlayback]
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
      if (!isSolvable(board, rows, cols)) {
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
  }, [board, isEditingBoard, rows, cols, stopPlayback]);

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
    const fixed = makeBoardSolvable(board, rows, cols);
    setBoard(fixed);
    setSelectedEditSwapIdx(null);
    toast.success('⚡ 타일 순열을 보정하여 해결 가능한 문제로 수정했습니다!', {
      id: 'sliding-fix',
    });
  }, [board, rows, cols]);

  // Playback logic
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0) return solutionSteps;
    if (rows * cols > 100) {
      toast.info('🎬 알고리즘 풀이 시뮬레이션은 10x10(100칸) 이하 보드에서 지원됩니다.', {
        id: 'sliding-status',
      });
      return [];
    }
    const { solved: success, steps } = solveSlidingPuzzle(board, rows, cols);
    if (!success || steps.length <= 1) {
      toast.error('해결 경로를 찾을 수 없습니다.', { id: 'sliding-status' });
      return [];
    }
    setSolutionSteps(steps);
    const info = getSlidingAlgorithmInfo(rows, cols);
    toast.success(`⚡ [${info.badge}] ${steps.length - 1}단계 해결 경로가 준비되었습니다!`, {
      id: 'sliding-status',
    });
    return steps;
  }, [board, rows, cols, solutionSteps]);

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
          const res = solveSlidingPuzzle(board, rows, cols);
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
  }, [board, isPlaying, rows, cols, solutionSteps, speed, stopPlayback]);

  // 치트키 1: 전체 즉시 완성 (Auto Solve)
  const handleAutoSolve = useCallback(() => {
    stopPlayback();
    if (rows * cols > 100) {
      const goal = getGoalBoard(rows, cols);
      setBoard(goal);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setHintTileIndex(null);
      toast.success('⚡ 전체 즉시 완성! 정답 상태로 즉시 배치되었습니다.', {
        id: 'sliding-status',
      });
      return;
    }
    const { solved: success, steps } = solveSlidingPuzzle(board, rows, cols);
    if (success && steps.length > 0) {
      setBoard(steps[steps.length - 1]);
      setSolutionSteps(steps);
      setCurrentStepIndex(steps.length - 1);
      setHintTileIndex(null);
      const info = getSlidingAlgorithmInfo(rows, cols);
      toast.success(
        `⚡ 전체 즉시 완성! [${info.badge}] 총 ${steps.length - 1}회 이동으로 완료되었습니다.`,
        { id: 'sliding-status' }
      );
    } else {
      toast.error('해결 경로를 찾을 수 없습니다.', { id: 'sliding-status' });
    }
  }, [board, rows, cols, stopPlayback]);

  // 치트키 2: 다음 이동 타일 힌트 (Single Hint)
  const handleSingleHint = useCallback(() => {
    stopPlayback();
    if (solved) {
      toast.info('이미 퍼즐이 완성되어 있습니다.', { id: 'sliding-status' });
      return;
    }
    if (rows * cols > 100) {
      toast.info(
        '💡 실시간 알고리즘 힌트는 100칸 이하 퍼즐에서 지원됩니다. [전체 즉시 완성] 치트키를 사용해보세요!',
        { id: 'sliding-status' }
      );
      return;
    }
    const { solved: success, steps } = solveSlidingPuzzle(board, rows, cols);
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
  }, [board, rows, cols, solved, stopPlayback]);

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1] && solutionSteps[currentStepIndex]
      ? getSlidingStepDescription(
          solutionSteps[currentStepIndex - 1],
          solutionSteps[currentStepIndex],
          cols,
          rows
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
            슬라이딩 퍼즐 치트키 & 플레이어
          </Typography>
          <Chip label="Visual Player" size="small" color="primary" variant="soft" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            타일을 슬라이드해 맞추거나, 재생 버튼을 눌러 알고리즘 풀이 과정을 관람하세요.
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
          {/* Status & View Scale Toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* Left: Status Badges */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={`크기: ${rows}×${cols}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip label={`이동: ${movesCount}회`} size="small" color="info" variant="soft" />
              <Chip
                label={isSolvable(board, rows, cols) ? '해결 가능' : '해결 불가'}
                size="small"
                color={isSolvable(board, rows, cols) ? 'success' : 'error'}
                variant="soft"
              />
              <Tooltip title={algoInfo.description} arrow>
                <Chip
                  label={algoInfo.badge}
                  size="small"
                  color={algoInfo.mode === 'constructive-reduction' ? 'warning' : 'primary'}
                  variant="soft"
                  sx={{ fontWeight: 700, cursor: 'help' }}
                />
              </Tooltip>
              {customImageUrl && (
                <Chip
                  icon={<ImageRoundedIcon />}
                  label="사진 퍼즐"
                  size="small"
                  color="secondary"
                  variant="soft"
                />
              )}
            </Box>

            {/* Right: Board Zoom Controls */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'action.hover',
                p: 0.4,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Tooltip title="화면 크기에 딱 맞춤 (100%)">
                <Button
                  size="small"
                  variant={customZoom === 100 ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setCustomZoom(100)}
                  sx={{
                    height: 26,
                    fontSize: '0.72rem',
                    px: 1,
                    minWidth: 'auto',
                    fontWeight: 700,
                  }}
                >
                  화면 맞춤
                </Button>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

              <Tooltip title="보드 축소 (-10%)">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setCustomZoom((prev) => Math.max(50, prev - 10))}
                    sx={{ p: 0.4 }}
                  >
                    <ZoomOutRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="클릭 시 100% 기본 화면 맞춤으로 복원">
                <Typography
                  variant="caption"
                  onClick={() => setCustomZoom(100)}
                  sx={{
                    minWidth: 42,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {customZoom}%
                </Typography>
              </Tooltip>

              <Tooltip title="보드 확대 (+10%)">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setCustomZoom((prev) => Math.min(200, prev + 10))}
                    sx={{ p: 0.4 }}
                  >
                    <ZoomInRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="기본 배율(100%)로 리셋">
                <span>
                  <IconButton size="small" onClick={() => setCustomZoom(100)} sx={{ p: 0.4 }}>
                    <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Board Grid Box (Auto-fits screen at 100% with no scrollbars; scrollable when zoomed in) */}
          <Box
            ref={containerRef}
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              overflow: customZoom > 100 ? 'auto' : 'hidden',
              position: 'relative',
              p: { xs: 1, sm: 1.5 },
              bgcolor: 'background.neutral',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              // Custom smooth scrollbar
              '&::-webkit-scrollbar': { width: 8, height: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'action.disabledBackground',
                borderRadius: 4,
                '&:hover': { bgcolor: 'text.disabled' },
              },
            }}
          >
            <Box
              ref={boardRef}
              sx={{
                m: 'auto',
                flexShrink: 0,
                width: `${boardWidth}px`,
                height: `${boardHeight}px`,
                aspectRatio: `${cols} / ${rows}`,
                p: boardPadding,
                bgcolor: 'action.hover',
                borderRadius: 2,
                border: '3px solid',
                borderColor: 'divider',
                boxShadow: 3,
                userSelect: 'none',
                position: 'relative',
                transition: isPlaying ? 'none' : 'width 0.2s ease, height 0.2s ease',
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* 1. Background static slots (rendered for boards up to 256 tiles to keep DOM light) */}
                {rows * cols <= 256 &&
                  Array.from({ length: rows * cols }).map((_, slotIdx) => {
                    const slotRow = Math.floor(slotIdx / cols);
                    const slotCol = slotIdx % cols;
                    return (
                      <Box
                        key={`slot-${slotIdx}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${100 / cols}%`,
                          height: `${100 / rows}%`,
                          p: tilePadding,
                          transform: `translate3d(${slotCol * 100}%, ${slotRow * 100}%, 0)`,
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: tileRadius,
                            bgcolor: 'background.paper',
                            opacity: 0.35,
                            border: '1px dashed',
                            borderColor: 'divider',
                          }}
                        />
                      </Box>
                    );
                  })}

                {/* 2. Interactive sliding tiles */}
                {tiles.map((val) => {
                  const currentIdx = board.indexOf(val);
                  if (currentIdx === -1) return null;

                  const row = Math.floor(currentIdx / cols);
                  const col = currentIdx % cols;
                  const isEmpty = val === 0;
                  const isHint = hintTileIndex === currentIdx;
                  const canMove = movable.includes(currentIdx);
                  const isSelectedForEdit = isEditingBoard && selectedEditSwapIdx === currentIdx;

                  if (isEmpty) {
                    if (!isEditingBoard) return null;
                    return (
                      <Box
                        key="tile-empty"
                        onClick={() => handleEditTileClick(currentIdx)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${100 / cols}%`,
                          height: `${100 / rows}%`,
                          p: tilePadding,
                          transform: `translate3d(${col * 100}%, ${row * 100}%, 0)`,
                          transition:
                            rows * cols <= 400
                              ? `transform ${slideDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`
                              : 'none',
                          zIndex: isSelectedForEdit ? 10 : 2,
                          cursor: 'pointer',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: tileRadius,
                            bgcolor: isSelectedForEdit ? 'warning.lighter' : 'background.paper',
                            opacity: isSelectedForEdit ? 0.9 : 0.4,
                            border: isSelectedForEdit ? '2px solid #FFAB00' : '1px dashed',
                            borderColor: isSelectedForEdit ? 'warning.main' : 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {currentTileSize >= 36 && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: currentTileSize >= 60 ? '0.7rem' : '0.5rem',
                                color: 'text.secondary',
                                fontWeight: 700,
                              }}
                            >
                              빈칸
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }

                  const bgStyle =
                    customImageUrl && !isEmpty
                      ? getTileBackgroundStyle(val, rows, cols, customImageUrl)
                      : {};

                  const { fontSize, letterSpacing } = getTileFontSize(val);

                  return (
                    <Box
                      key={`tile-${val}`}
                      onClick={() =>
                        isEditingBoard
                          ? handleEditTileClick(currentIdx)
                          : handleTileClick(currentIdx)
                      }
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${100 / cols}%`,
                        height: `${100 / rows}%`,
                        p: tilePadding,
                        transform: `translate3d(${col * 100}%, ${row * 100}%, 0)`,
                        transition:
                          rows * cols <= 400
                            ? `transform ${slideDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`
                            : 'none',
                        zIndex: isSelectedForEdit ? 10 : isHint ? 5 : canMove ? 3 : 1,
                        cursor: isEditingBoard || canMove ? 'pointer' : 'default',
                        userSelect: 'none',
                        willChange: rows * cols <= 400 ? 'transform' : 'auto',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: tileRadius,
                          bgcolor: isHint
                            ? 'warning.main'
                            : canMove
                              ? 'primary.main'
                              : 'primary.darker',
                          color: '#FFF',
                          boxShadow:
                            currentTileSize >= 28 ? (isSelectedForEdit ? 5 : canMove ? 3 : 1) : 0,
                          transform: isSelectedForEdit
                            ? 'scale(1.05)'
                            : canMove
                              ? 'scale(1)'
                              : 'scale(0.98)',
                          transition:
                            'transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease',
                          position: 'relative',
                          border: isSelectedForEdit
                            ? '2px solid #FFAB00'
                            : isHint
                              ? '2px solid #FFF'
                              : 'none',
                          ...bgStyle,
                          '&:hover':
                            (isEditingBoard || canMove) && currentTileSize >= 20
                              ? {
                                  transform: 'scale(1.03)',
                                  filter: 'brightness(1.1)',
                                }
                              : {},
                        }}
                      >
                        {currentTileSize >= 18 && (!customImageUrl || showTileNumbers) && (
                          <Typography
                            sx={{
                              fontSize,
                              fontWeight: 800,
                              letterSpacing,
                              textShadow: customImageUrl
                                ? '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                                : 'none',
                              color: '#FFFFFF',
                              lineHeight: 1,
                            }}
                          >
                            {val}
                          </Typography>
                        )}
                        {isHint && currentTileSize >= 48 && (
                          <Chip
                            label="HINT"
                            size="small"
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              height: 16,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
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
              {!isSolvable(board, rows, cols) && (
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
                  setBoard(getGoalBoard(rows, cols));
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

          {/* Board Dimensions (Row, Col inputs: min 3, max 10) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                보드 크기 설정 (3~10)
              </Typography>
              <Chip
                label={`${rows}행 × ${cols}열 (${rows * cols - 1}퍼즐)`}
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="행 (Row, 3~10)"
                size="small"
                value={inputRows}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                  setInputRows(digitsOnly);
                }}
                onBlur={() => {
                  const sanitized = sanitizeDimension(inputRows);
                  setInputRows(String(sanitized));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const sR = sanitizeDimension(inputRows);
                    const sC = sanitizeDimension(inputCols);
                    setInputRows(String(sR));
                    setInputCols(String(sC));
                    handleApplyDimensions(sR, sC);
                  }
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    maxLength: 2,
                  },
                }}
                sx={{ flex: 1 }}
                disabled={isPlaying}
              />
              <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                ×
              </Typography>
              <TextField
                label="열 (Col, 3~10)"
                size="small"
                value={inputCols}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                  setInputCols(digitsOnly);
                }}
                onBlur={() => {
                  const sanitized = sanitizeDimension(inputCols);
                  setInputCols(String(sanitized));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const sR = sanitizeDimension(inputRows);
                    const sC = sanitizeDimension(inputCols);
                    setInputRows(String(sR));
                    setInputCols(String(sC));
                    handleApplyDimensions(sR, sC);
                  }
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    maxLength: 2,
                  },
                }}
                sx={{ flex: 1 }}
                disabled={isPlaying}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  const sR = sanitizeDimension(inputRows);
                  const sC = sanitizeDimension(inputCols);
                  setInputRows(String(sR));
                  setInputCols(String(sC));
                  handleApplyDimensions(sR, sC);
                }}
                disabled={
                  isPlaying ||
                  (sanitizeDimension(inputRows) === rows &&
                    sanitizeDimension(inputCols) === cols &&
                    inputRows === String(rows) &&
                    inputCols === String(cols))
                }
                sx={{ height: 40, px: 2, flexShrink: 0, fontWeight: 700 }}
              >
                적용
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              💡 숫자를 자유롭게 지우고 입력할 수 있으며, 비우거나 3~10 범위를 벗어나면 자동으로
              3으로 보정됩니다.
            </Typography>

            {/* Quick Dimension Presets */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {[
                { r: 3, c: 3, label: '3×3 (8)' },
                { r: 4, c: 4, label: '4×4 (15)' },
                { r: 5, c: 5, label: '5×5 (24)' },
                { r: 6, c: 6, label: '6×6 (35)' },
                { r: 8, c: 8, label: '8×8 (63)' },
                { r: 10, c: 10, label: '10×10 (99)' },
              ].map((preset) => (
                <Chip
                  key={`${preset.r}x${preset.c}`}
                  label={preset.label}
                  size="small"
                  variant={rows === preset.r && cols === preset.c ? 'filled' : 'outlined'}
                  color={rows === preset.r && cols === preset.c ? 'primary' : 'default'}
                  onClick={() => handleApplyDimensions(preset.r, preset.c)}
                  disabled={isPlaying}
                  sx={{ cursor: 'pointer', fontSize: '0.72rem' }}
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* 🎬 Visual Player Controls */}
          <PuzzlePlayerControls
            variant="plain"
            title="🎬 슬라이딩 알고리즘 풀이 재생"
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

      {/* Sliding Image Upload & Custom Board Modal */}
      <SlidingImageUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        currentSize={Math.max(rows, cols)}
        onApplyPuzzle={handleApplyCustomPuzzle}
      />
    </DashboardContent>
  );
}
