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
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzleMediaActions } from '../components/puzzle-media-actions';
import { usePuzzleMediaExport } from '../hooks/use-puzzle-media-export';
import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import { SudokuImageUploadDialog } from '../components/sudoku-image-upload-dialog';
import {
  cloneBoard,
  solveSudoku,
  getConflicts,
  findCellHint,
  SUDOKU_PRESETS,
  type SudokuStep,
  type SudokuBoard,
  calculateCandidates,
  type SudokuContradiction,
  generateSudokuSolutionSteps,
} from '../utils/sudoku-solver';

export function PuzzleSudokuView() {
  const [currentPresetKey, setCurrentPresetKey] = useState<string>('easy');
  const [board, setBoard] = useState<SudokuBoard>(() => cloneBoard(SUDOKU_PRESETS.easy.board));
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>(() =>
    cloneBoard(SUDOKU_PRESETS.easy.board)
  );
  const playbackBaseBoardRef = useRef<SudokuBoard | null>(null);
  const [, setPlaybackBaseBoard] = useState<SudokuBoard | null>(null);

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({
    r: 0,
    c: 0,
  });
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [cheatHighlightedCell, setCheatHighlightedCell] = useState<string | null>(null);
  const [contradictionInfo, setContradictionInfo] = useState<SudokuContradiction | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<SudokuStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check conflicts
  const conflicts = useMemo(() => getConflicts(board), [board]);

  // Check completion
  const isCompleted = useMemo(() => {
    if (conflicts.size > 0) return false;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (board[r][c] === 0) return false;
      }
    }
    return true;
  }, [board, conflicts]);

  // Completion toast
  useEffect(() => {
    if (isCompleted) {
      toast.success('축하합니다! 스도쿠 퍼즐을 완벽히 해결했습니다!', { id: 'sudoku-status' });
    }
  }, [isCompleted]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleSelectPreset = useCallback(
    (presetKey: string) => {
      stopPlayback();
      setCurrentPresetKey(presetKey);
      const newPreset = cloneBoard(SUDOKU_PRESETS[presetKey].board);
      setBoard(newPreset);
      setInitialBoard(cloneBoard(newPreset));
      playbackBaseBoardRef.current = null;
      setPlaybackBaseBoard(null);
      setNotes({});
      setCheatHighlightedCell(null);
      setContradictionInfo(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      toast.info(`[${SUDOKU_PRESETS[presetKey].name}] 프리셋이 적용되었습니다.`, {
        id: 'sudoku-preset',
      });
    },
    [stopPlayback]
  );

  const handleCellClick = useCallback((r: number, c: number) => {
    setSelectedCell({ r, c });
    setCheatHighlightedCell(null);
  }, []);

  // 더블클릭 시 해당 숫자를 즉시 삭제 (모든 난이도에 적용)
  const handleCellDoubleClick = useCallback(
    (r: number, c: number) => {
      stopPlayback();
      const cellVal = board[r][c];
      const hasNotes = (notes[`${r}-${c}`] || []).length > 0;
      if (cellVal === 0 && !hasNotes) return;

      const nextBoard = cloneBoard(board);
      nextBoard[r][c] = 0;
      setBoard(nextBoard);

      // 프리셋에 포함된 고정 단서였더라도 initialBoard에서 지워 모든 난이도에서 자유롭게 수정/삭제 가능하도록 처리
      const nextInitial = cloneBoard(initialBoard);
      nextInitial[r][c] = 0;
      setInitialBoard(nextInitial);

      // 메모 삭제
      const key = `${r}-${c}`;
      setNotes((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });

      // 보드가 변경되었으므로 재생 단계 초기화
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      playbackBaseBoardRef.current = null;
      setPlaybackBaseBoard(null);
      setCheatHighlightedCell(null);
      setContradictionInfo(null);
      setSelectedCell({ r, c });

      toast.info(`(${r + 1}행, ${c + 1}열)의 숫자가 삭제되었습니다.`, {
        id: 'sudoku-status',
      });
    },
    [board, initialBoard, notes, stopPlayback]
  );

  const handleNumberInput = useCallback(
    (num: number) => {
      stopPlayback();
      if (!selectedCell) return;
      const { r, c } = selectedCell;
      if (initialBoard[r][c] !== 0) return;

      if (isNoteMode) {
        const key = `${r}-${c}`;
        const currentNotes = notes[key] || [];
        const nextNotes = currentNotes.includes(num)
          ? currentNotes.filter((n) => n !== num)
          : [...currentNotes, num].sort();
        setNotes((prev) => ({ ...prev, [key]: nextNotes }));
      } else {
        const nextBoard = cloneBoard(board);
        nextBoard[r][c] = nextBoard[r][c] === num ? 0 : num;
        setBoard(nextBoard);

        // Reset solution steps since user edited the board directly
        setSolutionSteps([]);
        setCurrentStepIndex(0);
        playbackBaseBoardRef.current = null;
        setPlaybackBaseBoard(null);
        setCheatHighlightedCell(null);
        setContradictionInfo(null);

        if (nextBoard[r][c] !== 0) {
          setNotes((prev) => {
            const copy = { ...prev };
            delete copy[`${r}-${c}`];
            return copy;
          });
        }

        // Check if conflict introduced
        const newConflicts = getConflicts(nextBoard);
        if (newConflicts.size > 0) {
          toast.error(`현재 ${newConflicts.size}개의 충돌 셀이 발생했습니다. 중복을 확인하세요!`, {
            id: 'sudoku-conflict',
          });
        }
      }
    },
    [board, initialBoard, isNoteMode, notes, selectedCell, stopPlayback]
  );

  const handleDelete = useCallback(() => {
    stopPlayback();
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    const nextBoard = cloneBoard(board);
    nextBoard[r][c] = 0;
    setBoard(nextBoard);

    // initialBoard에서도 제거하여 모든 난이도에서 삭제 가능하도록 지원
    const nextInitial = cloneBoard(initialBoard);
    nextInitial[r][c] = 0;
    setInitialBoard(nextInitial);

    // Reset solution steps since user modified cell
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    playbackBaseBoardRef.current = null;
    setPlaybackBaseBoard(null);
    setCheatHighlightedCell(null);
    setContradictionInfo(null);

    const key = `${r}-${c}`;
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, [board, initialBoard, selectedCell, stopPlayback]);

  // Image OCR 결과 적용 핸들러
  const handleApplyOcrBoard = useCallback(
    (newBoard: SudokuBoard) => {
      stopPlayback();
      setBoard(cloneBoard(newBoard));
      setInitialBoard(cloneBoard(newBoard));
      playbackBaseBoardRef.current = cloneBoard(newBoard);
      setPlaybackBaseBoard(cloneBoard(newBoard));
      setNotes({});
      setCheatHighlightedCell(null);
      setContradictionInfo(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      setCurrentPresetKey('sample');
    },
    [stopPlayback]
  );

  // Player controls logic
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0 && playbackBaseBoardRef.current) {
      return solutionSteps;
    }

    const currentConflicts = getConflicts(board);
    if (currentConflicts.size > 0) {
      toast.error(
        '중복(충돌)된 숫자가 있어 풀이 단계를 생성할 수 없습니다. 중복 셀을 먼저 수정해주세요.',
        {
          id: 'sudoku-status',
        }
      );
      return [];
    }

    // Solve starting from current board (keeps user-entered numbers!)
    const { steps, solved, contradiction } = generateSudokuSolutionSteps(board);
    if (steps.length === 0) {
      toast.error('현재 입력된 숫자로는 풀이 단계를 생성할 수 없습니다. 입력을 확인해주세요.', {
        id: 'sudoku-status',
      });
      return [];
    }

    if (!solved && contradiction) {
      toast.warning(
        `⚠️ 완성 불가능한 스도쿠입니다. 가능한 데까지 풀고 (${contradiction.row + 1}행, ${contradiction.col + 1}열)의 모순을 보여줍니다.`,
        {
          id: 'sudoku-status',
          duration: 5000,
        }
      );
    }

    const base = cloneBoard(board);
    playbackBaseBoardRef.current = base;
    setPlaybackBaseBoard(base);
    setSolutionSteps(steps);
    return steps;
  }, [board, solutionSteps]);

  const applyStep = useCallback(
    (stepIdx: number, steps: SudokuStep[], base?: SudokuBoard) => {
      setCurrentStepIndex(stepIdx);
      const startBoard = base || playbackBaseBoardRef.current || board;
      if (stepIdx === 0) {
        setBoard(cloneBoard(startBoard));
        setCheatHighlightedCell(null);
        setContradictionInfo(null);
      } else {
        const step = steps[stepIdx - 1];
        setBoard(cloneBoard(step.board));
        setSelectedCell({ r: step.row, c: step.col });
        setCheatHighlightedCell(`${step.row}-${step.col}`);

        if (step.isContradiction) {
          setContradictionInfo({
            row: step.row,
            col: step.col,
            reason: step.contradictionReason || step.description,
            relatedCells: step.relatedCells || [],
          });
          stopPlayback();
        } else {
          setContradictionInfo(null);
        }
      }
    },
    [board, stopPlayback]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    if (currentStepIndex >= steps.length) {
      applyStep(0, steps, playbackBaseBoardRef.current || board);
    }
    setIsPlaying(true);
  }, [applyStep, board, currentStepIndex, ensureStepsGenerated, isPlaying, stopPlayback]);

  // Media export (Screenshot & GIF)
  const mediaExport = usePuzzleMediaExport({
    boardRef,
    gameTitle: 'sudoku',
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
        applyStep(targetStep, steps, playbackBaseBoardRef.current || board);
      }
    },
    [applyStep, board, ensureStepsGenerated, stopPlayback]
  );

  const handlePrevStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1, steps, playbackBaseBoardRef.current || board);
    }
  }, [applyStep, board, currentStepIndex, ensureStepsGenerated, stopPlayback]);

  const handleNextStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex < steps.length) {
      applyStep(currentStepIndex + 1, steps, playbackBaseBoardRef.current || board);
    }
  }, [applyStep, board, currentStepIndex, ensureStepsGenerated, stopPlayback]);

  const handleResetPlayback = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (steps.length > 0) {
      applyStep(0, steps, playbackBaseBoardRef.current || board);
    }
  }, [applyStep, board, ensureStepsGenerated, stopPlayback]);

  // Interval player ticker
  useEffect(() => {
    if (!isPlaying) return () => {};

    const delay = Math.max(80, Math.round(400 / speed));
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < solutionSteps.length) {
          const nextIdx = prev + 1;
          const step = solutionSteps[nextIdx - 1];
          setBoard(cloneBoard(step.board));
          setSelectedCell({ r: step.row, c: step.col });
          setCheatHighlightedCell(`${step.row}-${step.col}`);

          if (step.isContradiction) {
            setContradictionInfo({
              row: step.row,
              col: step.col,
              reason: step.contradictionReason || step.description,
              relatedCells: step.relatedCells || [],
            });
            stopPlayback();
            toast.error(`🚨 ${step.description}`, {
              id: 'sudoku-contradiction',
              duration: 6000,
            });
          } else {
            setContradictionInfo(null);
          }

          return nextIdx;
        }
        stopPlayback();
        return prev;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isPlaying, solutionSteps, speed, stopPlayback]);

  // Keyboard shortcut listener for physical typing & arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 모달이 열려있거나 포커스가 input/textarea/contenteditable 인 경우 스도쿠 판 키보드 입력 차단
      if (
        uploadDialogOpen ||
        (e.target instanceof HTMLElement &&
          (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable))
      ) {
        return;
      }

      if (!selectedCell) return;
      const { r, c } = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell({ r: Math.max(0, r - 1), c });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCell({ r: Math.min(8, r + 1), c });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell({ r, c: Math.max(0, c - 1) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell({ r, c: Math.min(8, c + 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete, handleNumberInput, selectedCell, uploadDialogOpen]);

  // 치트키: 즉시 전체 정답 완성 (사용자가 직접 입력한 숫자 보존)
  const handleAutoSolve = useCallback(() => {
    stopPlayback();

    const currentConflicts = getConflicts(board);
    if (currentConflicts.size > 0) {
      toast.error('충돌(중복)된 숫자가 있어 정답을 계산할 수 없습니다. 중복 셀을 확인하세요!', {
        id: 'sudoku-status',
      });
      return;
    }

    const { solved, solution } = solveSudoku(board);
    if (solved) {
      const base = playbackBaseBoardRef.current || cloneBoard(board);
      playbackBaseBoardRef.current = base;
      setPlaybackBaseBoard(base);

      setBoard(solution);
      setNotes({});
      setCheatHighlightedCell(null);
      setContradictionInfo(null);

      const { steps } = generateSudokuSolutionSteps(base);
      setSolutionSteps(steps);
      setCurrentStepIndex(steps.length);
      toast.success('⚡ 즉시 풀이 치트 완료! 모든 빈칸을 정답으로 완성했습니다.', {
        id: 'sudoku-status',
      });
    } else {
      const { steps, contradiction } = generateSudokuSolutionSteps(board);
      if (steps.length > 0 && contradiction) {
        const base = playbackBaseBoardRef.current || cloneBoard(board);
        playbackBaseBoardRef.current = base;
        setPlaybackBaseBoard(base);
        setSolutionSteps(steps);
        applyStep(steps.length, steps, base);
        toast.warning(
          `완성 가능한 정답이 없습니다. 가능한 데까지 풀고 (${contradiction.row + 1}행, ${contradiction.col + 1}열)의 모순을 표시했습니다.`,
          { id: 'sudoku-status', duration: 6000 }
        );
      } else {
        toast.error('현재 입력된 숫자로는 완성 가능한 스도쿠 정답을 찾을 수 없습니다.', {
          id: 'sudoku-status',
        });
      }
    }
  }, [applyStep, board, stopPlayback]);

  // 치트키: 한 칸 힌트 (사용자가 직접 입력한 숫자 반영하여 다음 칸 탐색)
  const handleSingleHint = useCallback(() => {
    stopPlayback();

    const currentConflicts = getConflicts(board);
    if (currentConflicts.size > 0) {
      toast.error('충돌(중복)된 숫자가 있어 힌트를 계산할 수 없습니다.', {
        id: 'sudoku-status',
      });
      return;
    }

    const hint = findCellHint(board);
    if (hint) {
      const nextBoard = cloneBoard(board);
      nextBoard[hint.row][hint.col] = hint.value;
      setBoard(nextBoard);
      setSelectedCell({ r: hint.row, c: hint.col });
      setCheatHighlightedCell(`${hint.row}-${hint.col}`);

      setSolutionSteps([]);
      setCurrentStepIndex(0);
      playbackBaseBoardRef.current = null;
      setPlaybackBaseBoard(null);
      setContradictionInfo(null);

      toast.info(
        `💡 힌트 치트: (${hint.row + 1}행, ${hint.col + 1}열)에 정답 숫자 [${hint.value}] 입력!`,
        {
          id: 'sudoku-status',
        }
      );
    } else {
      toast.warning('이미 모든 칸이 채워져 있거나 유효한 해를 찾을 수 없습니다.', {
        id: 'sudoku-status',
      });
    }
  }, [board, stopPlayback]);

  // 치트키: 후보 숫자 전체 자동 메모
  const handleAutoNotes = useCallback(() => {
    stopPlayback();
    const candidates = calculateCandidates(board);
    const newNotes: Record<string, number[]> = {};
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (board[r][c] === 0 && candidates[r][c].length > 0) {
          newNotes[`${r}-${c}`] = candidates[r][c];
        }
      }
    }
    setNotes(newNotes);
    toast.info('📝 후보 숫자 치트 완료! 가능한 모든 후보 숫자를 기입했습니다.', {
      id: 'sudoku-status',
    });
  }, [board, stopPlayback]);

  // 초기화
  const handleReset = useCallback(() => {
    stopPlayback();
    setBoard(cloneBoard(initialBoard));
    playbackBaseBoardRef.current = null;
    setPlaybackBaseBoard(null);
    setNotes({});
    setCheatHighlightedCell(null);
    setContradictionInfo(null);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    toast.info('보드가 초기화되었습니다.', { id: 'sudoku-status' });
  }, [initialBoard, stopPlayback]);

  // Track which cells were filled by the solver during playback
  const solvedStepCells = useMemo(() => {
    if (currentStepIndex <= 0 || solutionSteps.length === 0) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < currentStepIndex && i < solutionSteps.length; i += 1) {
      const s = solutionSteps[i];
      if (!s.isContradiction && s.value !== 0) {
        set.add(`${s.row}-${s.col}`);
      }
    }
    return set;
  }, [currentStepIndex, solutionSteps]);

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1]
      ? solutionSteps[currentStepIndex - 1].description
      : currentStepIndex === 0
        ? '시작 상태 (입력된 숫자 유지)'
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
            스도쿠 치트키 & 플레이어
          </Typography>
          <Chip label="Visual Step Player" size="small" color="primary" variant="soft" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            스도쿠 문제를 직접 풀거나, 재생 버튼을 눌러 풀이 과정을 관람하세요.
          </Typography>
          <PuzzleMediaActions mediaExport={mediaExport} variant="header" />
        </Box>
      </Box>

      {/* Main Content Area: Fits Remaining Height Exactly */}
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
        {/* Left: Sudoku Board & Keypad Card */}
        <Card
          sx={{
            p: 2,
            flex: 1,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* 9x9 Board - Maximize in available vertical space */}
          <Box
            ref={boardRef}
            sx={{
              width: '100%',
              maxWidth: 480,
              maxHeight: 'calc(100% - 120px)',
              aspectRatio: '1 / 1',
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
              border: '3px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              boxShadow: 2,
            }}
          >
            {board.map((row, r) =>
              row.map((val, c) => {
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const isSameRowOrCol =
                  selectedCell && (selectedCell.r === r || selectedCell.c === c);
                const isSameBox =
                  selectedCell &&
                  Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                  Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
                const isSameValue =
                  val !== 0 && selectedCell && board[selectedCell.r][selectedCell.c] === val;
                const isInitialPreset = initialBoard[r][c] !== 0;
                const isSolverFilled = solvedStepCells.has(`${r}-${c}`);
                const isConflict = conflicts.has(`${r}-${c}`);
                const isCheatCell = cheatHighlightedCell === `${r}-${c}`;
                const cellNotes = notes[`${r}-${c}`] || [];

                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '2px solid' : '1px solid';
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '2px solid' : '1px solid';

                const isContradiction =
                  contradictionInfo && contradictionInfo.row === r && contradictionInfo.col === c;
                const isRelatedToContradiction = contradictionInfo?.relatedCells?.some(
                  (rc) => rc.r === r && rc.c === c
                );

                let cellBg = 'transparent';
                if (isContradiction) cellBg = 'rgba(255, 86, 48, 0.32)';
                else if (isRelatedToContradiction) cellBg = 'rgba(255, 171, 0, 0.22)';
                else if (isSelected) cellBg = 'primary.lighter';
                else if (isCheatCell) cellBg = 'warning.lighter';
                else if (isConflict) cellBg = 'error.lighter';
                else if (isSameValue) cellBg = 'action.selected';
                else if (isSameRowOrCol || isSameBox) cellBg = 'action.hover';

                let cellOutline = 'none';
                let cellOutlineOffset = '0px';
                let cellZIndex = 0;
                if (isContradiction) {
                  cellOutline = '3px solid #FF4842';
                  cellOutlineOffset = '-3px';
                  cellZIndex = 3;
                } else if (isRelatedToContradiction) {
                  cellOutline = '1.5px dashed #FFAB00';
                  cellOutlineOffset = '-2px';
                  cellZIndex = 2;
                }

                return (
                  <Box
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onDoubleClick={() => handleCellDoubleClick(r, c)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      minWidth: 0,
                      minHeight: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRight,
                      borderBottom,
                      borderColor: 'divider',
                      bgcolor: cellBg,
                      outline: cellOutline,
                      outlineOffset: cellOutlineOffset,
                      zIndex: cellZIndex,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.lighter' : 'action.selected',
                      },
                    }}
                  >
                    {isContradiction && val === 0 ? (
                      <Typography
                        sx={{
                          fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem' },
                          lineHeight: 1,
                          userSelect: 'none',
                        }}
                      >
                        🚨
                      </Typography>
                    ) : val !== 0 ? (
                      <Typography
                        sx={{
                          fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' },
                          fontWeight: isInitialPreset || !isSolverFilled ? 800 : 600,
                          lineHeight: 1,
                          userSelect: 'none',
                          color:
                            isContradiction || isConflict
                              ? 'error.main'
                              : isSolverFilled
                                ? 'primary.main'
                                : 'text.primary',
                        }}
                      >
                        {val}
                      </Typography>
                    ) : cellNotes.length > 0 ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gridTemplateRows: 'repeat(3, 1fr)',
                          width: '100%',
                          height: '100%',
                          p: 0.25,
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <Typography
                            key={n}
                            sx={{
                              fontSize: '0.55rem',
                              lineHeight: 1,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: cellNotes.includes(n) ? 'text.secondary' : 'transparent',
                              fontWeight: 700,
                            }}
                          >
                            {n}
                          </Typography>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Box>

          {/* Keypad & Input Toolbar */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 480,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 0.75 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outlined"
                  onClick={() => handleNumberInput(num)}
                  sx={{
                    height: { xs: 36, md: 40 },
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  {num}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant={isNoteMode ? 'contained' : 'outlined'}
                color={isNoteMode ? 'warning' : 'inherit'}
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={() => setIsNoteMode((prev) => !prev)}
                sx={{ flex: 1, height: 34 }}
              >
                메모 모드 {isNoteMode ? '(ON)' : '(OFF)'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<BackspaceRoundedIcon />}
                onClick={handleDelete}
                sx={{ flex: 1, height: 34 }}
              >
                지우기
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.75rem' }}
            >
              💡 팁: 번호가 입력된 칸을 <b>더블클릭</b>하면 모든 난이도에서 해당 숫자를 즉시 지울 수
              있습니다.
            </Typography>
          </Box>
        </Card>

        {/* Right: Unified Controls Sidebar (Scrolls internally if needed) */}
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
          {/* Image OCR Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltRoundedIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ py: 1.2, fontWeight: 800 }}
          >
            📷 이미지로 문제 불러오기 (OCR)
          </Button>

          {/* Preset Selector */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              label="난이도 프리셋"
              value={currentPresetKey}
              onChange={(e) => handleSelectPreset(e.target.value)}
              fullWidth
              size="small"
            >
              {Object.entries(SUDOKU_PRESETS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v.name}
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
            title="🎬 스도쿠 풀이 과정 재생"
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={
              solutionSteps.length > 0
                ? solutionSteps.length
                : Math.max(1, 81 - board.flat().filter((n) => n !== 0).length)
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

          {/* Contradiction Alert Card */}
          {contradictionInfo && (
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: 'rgba(255, 86, 48, 0.1)',
                border: '1.5px solid',
                borderColor: 'error.main',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main' }}>
                🚨 모순 발견: ({contradictionInfo.row + 1}행, {contradictionInfo.col + 1}열)
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontSize: '0.8rem', lineHeight: 1.5 }}
              >
                {contradictionInfo.reason}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.725rem' }}>
                💡 보드에서 붉은색(🚨)으로 표시된 칸과 주황색 점선으로 강조된 연관 셀들을 확인하여
                숫자를 수정해주세요.
              </Typography>
            </Box>
          )}

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
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              치트키: 전체 즉시 풀기 (Auto Solve)
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

            <Button
              variant="outlined"
              color="info"
              startIcon={<FormatListNumberedRoundedIcon />}
              onClick={handleAutoNotes}
              sx={{ py: 1, fontWeight: 700 }}
            >
              치트키: 후보 숫자 모두 채우기 (Auto Notes)
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Sudoku Image Upload & OCR Modal Dialog */}
      <SudokuImageUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onApplyBoard={handleApplyOcrBoard}
      />
    </DashboardContent>
  );
}
