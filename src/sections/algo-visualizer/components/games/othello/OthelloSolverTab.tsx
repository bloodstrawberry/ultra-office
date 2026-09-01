'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { OthelloBoard } from './OthelloBoard';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import { OTHELLO_PUZZLE_LIST } from '../../../lib/games/othello/puzzles';
import {
  playBadukStoneSound,
  playPuzzleSolvedSound,
  playPuzzleFailedSound,
} from '../../../lib/games/gameSounds';
import {
  OTHELLO_SIZE,
  applyOthelloMove,
  countOthelloDiscs,
  formatOthelloCoord,
  getValidOthelloMoves,
  createEmptyOthelloBoard,
  createStandardOthelloBoard,
} from '../../../lib/games/othello/engine';
import {
  analyzeOthelloPosition,
  findBestOthelloAIMove,
  findMatchingOthelloNode,
} from '../../../lib/games/othello/solver';
import {
  type OthelloGrid,
  type OthelloPoint,
  type OthelloColor,
  type OthelloProblem,
  type OthelloAIAnalysis,
  type OthelloSolutionNode,
} from '../../../lib/games/othello/types';

type TabMode = 'puzzle' | 'sandbox';
type PlacementTool = 'play' | 'black' | 'white' | 'eraser';

export function OthelloSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tabMode, setTabMode] = useState<TabMode>('puzzle');

  // ================= Puzzle Mode States =================
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<OthelloProblem>(OTHELLO_PUZZLE_LIST[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [board, setBoard] = useState<OthelloGrid>(() => createEmptyOthelloBoard());
  const [history, setHistory] = useState<OthelloGrid[]>([]);
  const [lastMove, setLastMove] = useState<OthelloPoint | null>(null);
  const [turn, setTurn] = useState<OthelloColor>('B');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  const [currentNodeTree, setCurrentNodeTree] = useState<OthelloSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<OthelloAIAnalysis | null>(null);

  // ================= Sandbox Mode States =================
  const [sandboxBoard, setSandboxBoard] = useState<OthelloGrid>(() => createStandardOthelloBoard());
  const [sandboxHistory, setSandboxHistory] = useState<OthelloGrid[]>([]);
  const [sandboxLastMove, setSandboxLastMove] = useState<OthelloPoint | null>(null);
  const [sandboxTurn, setSandboxTurn] = useState<OthelloColor>('B');
  const [placementTool, setPlacementTool] = useState<PlacementTool>('play');
  const [sandboxAnalysis, setSandboxAnalysis] = useState<OthelloAIAnalysis | null>(null);

  const discCounts = useMemo(() => {
    return tabMode === 'puzzle' ? countOthelloDiscs(board) : countOthelloDiscs(sandboxBoard);
  }, [tabMode, board, sandboxBoard]);

  const setupProblem = useCallback((problem: OthelloProblem) => {
    const newBoard = createEmptyOthelloBoard();
    for (const b of problem.initialBlack) {
      newBoard[b.r][b.c] = 'B';
    }
    for (const w of problem.initialWhite) {
      newBoard[w.r][w.c] = 'W';
    }

    setBoard(newBoard);
    setHistory([newBoard]);
    setLastMove(null);
    setTurn(problem.playerColor);
    setIsAIMoving(false);
    setCurrentNodeTree(problem.solutionTree);
    setStatusMessage(problem.objective);
    setIsSolved(false);
    setIsFailed(false);
    setShowHint(false);
    setShowSolution(false);

    const analysis = analyzeOthelloPosition(newBoard, problem.playerColor);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupProblem(OTHELLO_PUZZLE_LIST[0]);
    const initStd = createStandardOthelloBoard();
    setSandboxBoard(initStd);
    setSandboxHistory([initStd]);
    setSandboxAnalysis(analyzeOthelloPosition(initStd, 'B'));
  }, [setupProblem]);

  const handleSelectProblemIndex = (index: number) => {
    if (index >= 0 && index < OTHELLO_PUZZLE_LIST.length) {
      setSelectedProblemIndex(index);
      const prob = OTHELLO_PUZZLE_LIST[index];
      setCurrentProblem(prob);
      setupProblem(prob);
      setIsCatalogOpen(false);
    }
  };

  const handlePrevProblem = () => {
    if (selectedProblemIndex > 0) {
      handleSelectProblemIndex(selectedProblemIndex - 1);
    }
  };

  const handleNextProblem = () => {
    if (selectedProblemIndex < OTHELLO_PUZZLE_LIST.length - 1) {
      handleSelectProblemIndex(selectedProblemIndex + 1);
    }
  };

  const handleRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * OTHELLO_PUZZLE_LIST.length);
    handleSelectProblemIndex(randomIndex);
  };

  const handleReset = () => {
    setupProblem(currentProblem);
  };

  const handleUndo = () => {
    if (history.length <= 1 || isAIMoving) return;

    const undoSteps = history.length >= 3 ? 2 : 1;
    const nextHistory = history.slice(0, history.length - undoSteps);
    const targetBoard = nextHistory[nextHistory.length - 1];

    setBoard(targetBoard);
    setHistory(nextHistory);
    setLastMove(null);
    setTurn('B');
    setIsSolved(false);
    setIsFailed(false);
    setStatusMessage('수를 물렀습니다. 흑(Black)의 다음 착수를 선택하세요.');

    const analysis = analyzeOthelloPosition(targetBoard, 'B');
    setAiAnalysis(analysis);
  };

  const handlePlaceDisc = (p: OthelloPoint) => {
    if (isSolved || isFailed || isAIMoving || turn !== 'B') return;

    const moveRes = applyOthelloMove(board, p, 'B');
    if (!moveRes.valid || !moveRes.newBoard) return;

    playBadukStoneSound();
    const nextBoard = moveRes.newBoard;
    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setLastMove(p);
    setTurn('W');

    const matchingNode = findMatchingOthelloNode(currentNodeTree, p);

    if (matchingNode) {
      if (matchingNode.comment) {
        setStatusMessage(matchingNode.comment);
      }

      if (matchingNode.aiResponse) {
        setIsAIMoving(true);
        setTimeout(() => {
          const aiMove = matchingNode.aiResponse!;
          const aiRes = applyOthelloMove(nextBoard, aiMove, 'W');
          if (aiRes.valid && aiRes.newBoard) {
            playBadukStoneSound();
            setBoard(aiRes.newBoard);
            setHistory((prev) => [...prev, aiRes.newBoard!]);
            setLastMove(aiMove);
            setIsAIMoving(false);
            setTurn('B');

            if (matchingNode.aiComment) {
              setStatusMessage(matchingNode.aiComment);
            }

            if (matchingNode.children && matchingNode.children.length > 0) {
              setCurrentNodeTree(matchingNode.children);
            } else {
              setIsSolved(true);
              playPuzzleSolvedSound();
              setStatusMessage('축하합니다! 오셀로 전술 퍼즐을 완벽하게 풀어냈습니다.');
            }
          }
        }, 500);
      } else {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage(matchingNode.comment || '정답입니다! 묘수를 찾아냈습니다.');
      }
    } else {
      // Dynamic AI move
      setIsAIMoving(true);
      setStatusMessage(`흑 ${formatOthelloCoord(p)} 착수. 백(AI)이 수읽기 중입니다...`);

      setTimeout(() => {
        const { move: aiMove, reason } = findBestOthelloAIMove(nextBoard, 'W', 3);

        if (aiMove) {
          const aiRes = applyOthelloMove(nextBoard, aiMove, 'W');
          if (aiRes.valid && aiRes.newBoard) {
            playBadukStoneSound();
            setBoard(aiRes.newBoard);
            setHistory((prev) => [...prev, aiRes.newBoard!]);
            setLastMove(aiMove);
            setStatusMessage(
              `백이 ${formatOthelloCoord(aiMove)}에 응수했습니다 (${reason}). 흑의 다음 수를 두세요!`
            );
          }
        } else {
          setStatusMessage('백이 둘 곳이 없어 패스(Pass)했습니다. 흑의 연속 착수 기회입니다!');
        }

        setIsAIMoving(false);
        setTurn('B');
      }, 500);
    }

    const analysis = analyzeOthelloPosition(nextBoard, 'B');
    setAiAnalysis(analysis);
  };

  const handleAutoPlaySolution = () => {
    if (isAIMoving) return;
    if (currentNodeTree.length === 0 || isSolved || isFailed || turn !== 'B') {
      setupProblem(currentProblem);
      setTimeout(() => {
        const firstNode = currentProblem.solutionTree[0];
        if (firstNode) {
          handlePlaceDisc(firstNode.move);
        }
      }, 150);
      return;
    }
    const targetNode = currentNodeTree[0];
    if (targetNode) {
      handlePlaceDisc(targetNode.move);
    }
  };

  const getOthelloSolutionSteps = (problem: OthelloProblem) => {
    const steps: string[] = [];
    const traverse = (nodes: OthelloSolutionNode[], stepNum: number) => {
      if (!nodes || nodes.length === 0) return;
      const node = nodes[0];
      steps.push(`${stepNum}수: 흑(Black) ${formatOthelloCoord(node.move)} 착수`);
      if (node.aiResponse) {
        steps.push(`${stepNum + 1}수: 백(White) ${formatOthelloCoord(node.aiResponse)} 응수`);
        if (node.children) {
          traverse(node.children, stepNum + 2);
        }
      }
    };
    traverse(problem.solutionTree, 1);
    return steps;
  };

  // ================= Sandbox Handlers =================
  const handleSandboxResetStandard = () => {
    const std = createStandardOthelloBoard();
    setSandboxBoard(std);
    setSandboxHistory([std]);
    setSandboxLastMove(null);
    setSandboxTurn('B');
    setSandboxAnalysis(analyzeOthelloPosition(std, 'B'));
  };

  const handleSandboxClearBoard = () => {
    const empty = createEmptyOthelloBoard();
    setSandboxBoard(empty);
    setSandboxHistory([empty]);
    setSandboxLastMove(null);
    setSandboxTurn('B');
    setSandboxAnalysis(null);
  };

  const handleSandboxUndo = () => {
    if (sandboxHistory.length <= 1) return;
    const nextHist = sandboxHistory.slice(0, sandboxHistory.length - 1);
    const target = nextHist[nextHist.length - 1];
    setSandboxBoard(target);
    setSandboxHistory(nextHist);
    setSandboxLastMove(null);
    setSandboxTurn(sandboxTurn === 'B' ? 'W' : 'B');
    setSandboxAnalysis(analyzeOthelloPosition(target, sandboxTurn === 'B' ? 'W' : 'B'));
  };

  const handleSandboxClickPoint = (p: OthelloPoint) => {
    if (placementTool === 'play') {
      const res = applyOthelloMove(sandboxBoard, p, sandboxTurn);
      if (!res.valid || !res.newBoard) return;

      playBadukStoneSound();
      const nextTurn = sandboxTurn === 'B' ? 'W' : 'B';
      const validNext = getValidOthelloMoves(res.newBoard, nextTurn);
      const finalTurn = validNext.length > 0 ? nextTurn : sandboxTurn; // Pass if no moves

      setSandboxBoard(res.newBoard);
      setSandboxHistory((prev) => [...prev, res.newBoard!]);
      setSandboxLastMove(p);
      setSandboxTurn(finalTurn);
      setSandboxAnalysis(analyzeOthelloPosition(res.newBoard, finalTurn));
    } else if (placementTool === 'black') {
      const next = sandboxBoard.map((row, r) =>
        row.map((cell, c) => (r === p.r && c === p.c ? ('B' as OthelloColor) : cell))
      );
      playBadukStoneSound();
      setSandboxBoard(next);
      setSandboxHistory((prev) => [...prev, next]);
    } else if (placementTool === 'white') {
      const next = sandboxBoard.map((row, r) =>
        row.map((cell, c) => (r === p.r && c === p.c ? ('W' as OthelloColor) : cell))
      );
      playBadukStoneSound();
      setSandboxBoard(next);
      setSandboxHistory((prev) => [...prev, next]);
    } else if (placementTool === 'eraser') {
      const next = sandboxBoard.map((row, r) =>
        row.map((cell, c) => (r === p.r && c === p.c ? null : cell))
      );
      setSandboxBoard(next);
      setSandboxHistory((prev) => [...prev, next]);
    }
  };

  if (!hasLoaded) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* Mode Switch Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <ToggleButtonGroup
          value={tabMode}
          exclusive
          onChange={(_, val) => val && setTabMode(val)}
          size="small"
          sx={{
            bgcolor: '#f1f5f9',
            p: 0.5,
            borderRadius: 2,
            border: '1px solid #cbd5e1',
            '& .MuiToggleButton-root': {
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              border: 'none',
              color: '#475569',
              '&.Mui-selected': {
                bgcolor: '#15803d',
                color: '#ffffff',
                '&:hover': { bgcolor: '#166534' },
              },
            },
          }}
        >
          <ToggleButton value="puzzle">
            <MenuBookRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎯 오셀로 전술 퍼즐 (초급 5선)
          </ToggleButton>
          <ToggleButton value="sandbox">
            <SportsEsportsRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎮 자유 대국 & 기물 배치 모드
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ================= MODE 1: PUZZLE SOLVER ================= */}
      {tabMode === 'puzzle' && (
        <>
          {/* Header & Controls */}
          <Card
            sx={{
              p: 2,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: '#15803d' }} />
                {currentProblem.title}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ListAltRoundedIcon />}
                onClick={() => setIsCatalogOpen(true)}
                sx={{
                  fontWeight: 700,
                  color: '#15803d',
                  borderColor: 'rgba(21, 128, 61, 0.4)',
                  background: 'rgba(21, 128, 61, 0.06)',
                  '&:hover': { background: 'rgba(21, 128, 61, 0.12)' },
                }}
              >
                퍼즐 목록 ({selectedProblemIndex + 1} / {OTHELLO_PUZZLE_LIST.length})
              </Button>

              <Chip
                size="small"
                label={currentProblem.category}
                sx={{ background: 'rgba(21, 128, 61, 0.1)', color: '#15803d', fontWeight: 700 }}
              />
              <Chip
                size="small"
                label="초급"
                sx={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <IconButton
                onClick={handlePrevProblem}
                disabled={selectedProblemIndex === 0}
                sx={{ color: '#64748b' }}
                title="이전 문제"
              >
                <NavigateBeforeRoundedIcon />
              </IconButton>

              <IconButton
                onClick={handleNextProblem}
                disabled={selectedProblemIndex === OTHELLO_PUZZLE_LIST.length - 1}
                sx={{ color: '#64748b' }}
                title="다음 문제"
              >
                <NavigateNextRoundedIcon />
              </IconButton>

              <IconButton onClick={handleRandomProblem} sx={{ color: '#d97706' }} title="랜덤 퍼즐">
                <ShuffleRoundedIcon />
              </IconButton>

              <Button
                size="small"
                variant="contained"
                startIcon={<MenuBookRoundedIcon sx={{ color: '#ffffff !important' }} />}
                onClick={() => setShowSolution(!showSolution)}
                sx={{
                  fontWeight: 800,
                  backgroundColor: '#15803d !important',
                  color: '#ffffff !important',
                  border: '1px solid #166534',
                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.35)',
                  '&:hover': { backgroundColor: '#166534 !important', color: '#ffffff !important' },
                }}
              >
                💡 정답 보기
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<LightbulbRoundedIcon sx={{ color: '#d97706 !important' }} />}
                onClick={() => setShowHint(!showHint)}
                sx={{
                  fontWeight: 800,
                  backgroundColor: '#fef3c7 !important',
                  color: '#92400e !important',
                  border: '1px solid #f59e0b !important',
                  '&:hover': { backgroundColor: '#fde68a !important', color: '#78350f !important' },
                }}
              >
                전술 힌트
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<UndoRoundedIcon sx={{ color: '#475569 !important' }} />}
                onClick={handleUndo}
                disabled={history.length <= 1 || isAIMoving}
                sx={{
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9 !important',
                  color: '#334155 !important',
                  border: '1px solid #cbd5e1 !important',
                  '&:hover': { backgroundColor: '#e2e8f0 !important', color: '#0f172a !important' },
                }}
              >
                한 수 무르기
              </Button>

              <IconButton onClick={handleReset} sx={{ color: '#64748b' }} title="퍼즐 초기화">
                <ReplayRoundedIcon />
              </IconButton>
            </Box>
          </Card>

          {/* Main Play Area */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Othello Board */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <OthelloBoard
                board={board}
                playerColor="B"
                lastMove={lastMove}
                disabled={isSolved || isFailed || isAIMoving}
                onPlaceDisc={handlePlaceDisc}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<MenuBookRoundedIcon sx={{ color: '#ffffff !important' }} />}
                  onClick={() => setShowSolution(!showSolution)}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    backgroundColor: '#15803d !important',
                    color: '#ffffff !important',
                    border: '1px solid #166534',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.35)',
                    '&:hover': {
                      backgroundColor: '#166534 !important',
                      color: '#ffffff !important',
                    },
                  }}
                >
                  💡 정답 보기
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon sx={{ color: '#ffffff !important' }} />}
                  onClick={handleAutoPlaySolution}
                  disabled={isAIMoving}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    backgroundColor: '#0284c7 !important',
                    color: '#ffffff !important',
                    border: '1px solid #0369a1',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                    '&:hover': {
                      backgroundColor: '#0369a1 !important',
                      color: '#ffffff !important',
                    },
                  }}
                >
                  ▶ 정답 한 수 두기
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UndoRoundedIcon sx={{ color: '#475569 !important' }} />}
                  onClick={handleUndo}
                  disabled={history.length <= 1 || isAIMoving}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9 !important',
                    color: '#334155 !important',
                    border: '1px solid #cbd5e1 !important',
                    '&:hover': {
                      backgroundColor: '#e2e8f0 !important',
                      color: '#0f172a !important',
                    },
                  }}
                >
                  한 수 무르기
                </Button>
              </Box>
            </Box>

            {/* Right: Details & Status */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Score Bar */}
              <Card sx={{ p: 2, border: '1px solid #e2e8f0' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ⚫ 흑(Black): {discCounts.black}개
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ⚪ 백(White): {discCounts.white}개
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 12,
                    bgcolor: '#e2e8f0',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                  }}
                >
                  <Box
                    sx={{
                      width: `${(discCounts.black / Math.max(1, discCounts.black + discCounts.white)) * 100}%`,
                      bgcolor: '#0f172a',
                      transition: 'width 0.3s ease',
                    }}
                  />
                  <Box
                    sx={{
                      width: `${(discCounts.white / Math.max(1, discCounts.black + discCounts.white)) * 100}%`,
                      bgcolor: '#94a3b8',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Card>

              {/* Status Alert Card */}
              <Card
                sx={{
                  p: 2.5,
                  background: isSolved
                    ? '#f0fdf4'
                    : isFailed
                      ? '#fef2f2'
                      : isAIMoving
                        ? '#f0fdf4'
                        : '#ffffff',
                  border: '1px solid',
                  borderColor: isSolved
                    ? '#22c55e'
                    : isFailed
                      ? '#ef4444'
                      : isAIMoving
                        ? '#16a34a'
                        : '#e2e8f0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  color: '#0f172a',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  {isSolved ? (
                    <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                  ) : isFailed ? (
                    <CancelRoundedIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                  ) : (
                    <PlayArrowRoundedIcon sx={{ color: '#15803d', fontSize: 28 }} />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: isSolved ? '#16a34a' : isFailed ? '#dc2626' : '#0f172a',
                    }}
                  >
                    {isSolved
                      ? '퍼즐 해결 성공!'
                      : isFailed
                        ? '실패'
                        : isAIMoving
                          ? '백(AI) 수읽기 중...'
                          : '흑선(Black) - 착수할 위치를 클릭하세요'}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ color: '#334155', fontWeight: 600, mb: 1.5 }}>
                  {statusMessage}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<MenuBookRoundedIcon sx={{ color: '#ffffff !important' }} />}
                    onClick={() => setShowSolution(!showSolution)}
                    sx={{
                      fontWeight: 800,
                      backgroundColor: '#15803d !important',
                      color: '#ffffff !important',
                      border: '1px solid #166534',
                      boxShadow: '0 2px 6px rgba(21, 128, 61, 0.35)',
                      '&:hover': {
                        backgroundColor: '#166534 !important',
                        color: '#ffffff !important',
                      },
                    }}
                  >
                    💡 정답 보기
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowRoundedIcon sx={{ color: '#ffffff !important' }} />}
                    onClick={handleAutoPlaySolution}
                    disabled={isAIMoving}
                    sx={{
                      fontWeight: 800,
                      backgroundColor: '#0284c7 !important',
                      color: '#ffffff !important',
                      border: '1px solid #0369a1',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                      '&:hover': {
                        backgroundColor: '#0369a1 !important',
                        color: '#ffffff !important',
                      },
                    }}
                  >
                    ▶ 정답 한 수 두기
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UndoRoundedIcon sx={{ color: '#475569 !important' }} />}
                    onClick={handleUndo}
                    disabled={history.length <= 1 || isAIMoving}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9 !important',
                      color: '#334155 !important',
                      border: '1px solid #cbd5e1 !important',
                      '&:hover': {
                        backgroundColor: '#e2e8f0 !important',
                        color: '#0f172a !important',
                      },
                    }}
                  >
                    한 수 무르기
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReplayRoundedIcon sx={{ color: '#475569 !important' }} />}
                    onClick={handleReset}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: '#f8fafc !important',
                      color: '#475569 !important',
                      border: '1px solid #cbd5e1 !important',
                      '&:hover': {
                        backgroundColor: '#f1f5f9 !important',
                        color: '#1e293b !important',
                      },
                    }}
                  >
                    다시 시작
                  </Button>
                </Box>
              </Card>

              {/* Solution Card */}
              {showSolution && (
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: '#f0fdf4',
                    border: '2px solid #16a34a',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#15803d' }}>
                        🎯 오셀로 정답 수순 및 좌표
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrowRoundedIcon sx={{ color: '#ffffff !important' }} />}
                      onClick={handleAutoPlaySolution}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: '#15803d !important',
                        color: '#ffffff !important',
                        '&:hover': { backgroundColor: '#166534 !important' },
                      }}
                    >
                      정답 바로 착수
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 1.5,
                      p: 1.5,
                      bgcolor: '#ffffff',
                      borderRadius: 1.5,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {getOthelloSolutionSteps(currentProblem).map((s, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}
                      >
                        • {s}
                      </Typography>
                    ))}
                  </Box>

                  <Typography variant="body2" sx={{ color: '#14532d', lineHeight: 1.6 }}>
                    💡 <strong>정답 해설:</strong> {currentProblem.hint}
                  </Typography>
                </Card>
              )}

              {/* Hint Card */}
              {showHint && (
                <Card
                  sx={{
                    p: 2,
                    background: '#fffbeb',
                    border: '1px solid #fcd34d',
                    color: '#92400e',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LightbulbRoundedIcon sx={{ color: '#d97706', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>
                      전술 힌트 가이드
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#78350f' }}>
                    {currentProblem.hint}
                  </Typography>
                </Card>
              )}

              {/* Theory Card */}
              <Card
                sx={{
                  p: 2.5,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  color: '#0f172a',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HelpOutlineRoundedIcon sx={{ color: '#15803d', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    오셀로 이론 & 포지션 해설
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  {currentProblem.explanation}
                </Typography>
              </Card>

              {/* Inspector */}
              {aiAnalysis && (
                <GameAlgorithmInspector
                  gameTitle="오셀로 (Othello / Reversi)"
                  csConcept={currentProblem.csConcept}
                  searchNodes={aiAnalysis.searchNodesEvaluated}
                  searchDepth={aiAnalysis.searchDepth}
                  timeMs={aiAnalysis.timeMs}
                  evalScore={aiAnalysis.evaluationScore}
                  algorithmName="Minimax Alpha-Beta & Positional Weight Matrix"
                  complexityInfo={{
                    time: 'O(b^d) → Alpha-Beta 가지치기',
                    space: 'O(d) 스택 트리',
                    branchingFactor: 'b ≈ 5~15 (오셀로 평균 착수수)',
                  }}
                />
              )}
            </Box>
          </Box>
        </>
      )}

      {/* ================= MODE 2: FREE SANDBOX PLAYGROUND ================= */}
      {tabMode === 'sandbox' && (
        <Card
          sx={{
            p: 3,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
              pb: 2,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                🎮 오셀로 자유 대국 & 포지션 배치장
              </Typography>

              <Button
                size="small"
                variant="contained"
                startIcon={<RestartAltRoundedIcon sx={{ color: '#ffffff !important' }} />}
                onClick={handleSandboxResetStandard}
                sx={{
                  fontWeight: 800,
                  backgroundColor: '#15803d !important',
                  color: '#ffffff !important',
                  '&:hover': { backgroundColor: '#166534 !important' },
                }}
              >
                정규 대국 배치
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteSweepRoundedIcon sx={{ color: '#dc2626 !important' }} />}
                onClick={handleSandboxClearBoard}
                sx={{
                  fontWeight: 700,
                  backgroundColor: '#fef2f2 !important',
                  color: '#dc2626 !important',
                  border: '1px solid #fca5a5 !important',
                }}
              >
                판 비우기
              </Button>
            </Box>

            {/* Tools Palette */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={placementTool}
                exclusive
                onChange={(_, val) => val && setPlacementTool(val)}
                size="small"
                sx={{
                  bgcolor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 1.5,
                  '& .MuiToggleButton-root': {
                    fontWeight: 700,
                    px: 1.5,
                    color: '#475569',
                    '&.Mui-selected': {
                      bgcolor: '#15803d',
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <ToggleButton value="play">
                  <PlayArrowRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  번갈아 대국
                </ToggleButton>
                <ToggleButton value="black">⚫ 흑돌 배치</ToggleButton>
                <ToggleButton value="white">⚪ 백돌 배치</ToggleButton>
                <ToggleButton value="eraser">
                  <DeleteSweepRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} />돌 제거
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                size="small"
                variant="outlined"
                startIcon={<UndoRoundedIcon sx={{ color: '#475569 !important' }} />}
                onClick={handleSandboxUndo}
                disabled={sandboxHistory.length <= 1}
                sx={{
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9 !important',
                  color: '#334155 !important',
                  border: '1px solid #cbd5e1 !important',
                }}
              >
                무르기
              </Button>
            </Box>
          </Box>

          {/* Sandbox Main Play Area */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
              gap: 4,
              alignItems: 'start',
            }}
          >
            {/* Board */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <OthelloBoard
                board={sandboxBoard}
                playerColor={sandboxTurn}
                lastMove={sandboxLastMove}
                onPlaceDisc={handleSandboxClickPoint}
              />
            </Box>

            {/* Side Status Card */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  📊 실시간 오셀로 대국 현황
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: sandboxTurn === 'B' ? '#0f172a' : '#ffffff',
                      color: sandboxTurn === 'B' ? '#ffffff' : '#0f172a',
                      borderRadius: 2,
                      border: '2px solid #0f172a',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      ⚫ 흑 (Black) {sandboxTurn === 'B' && '◀ 착수 차례'}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 900 }}>
                      {discCounts.black}개
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: sandboxTurn === 'W' ? '#f1f5f9' : '#ffffff',
                      color: '#0f172a',
                      borderRadius: 2,
                      border: '2px solid #cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      ⚪ 백 (White) {sandboxTurn === 'W' && '◀ 착수 차례'}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 900 }}>
                      {discCounts.white}개
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                  💡 <strong>자유 대국 안내:</strong>
                  <br />• <strong>대국 모드:</strong> 흑과 백이 번갈아 착수 가능 위치(고스트 도트)를
                  클릭하면 가로/세로/대각선 상의 상대 돌이 자동으로 뒤집힙니다.
                  <br />• <strong>돌 배치 모드:</strong> 원하는 색상의 돌을 선택하여 임의의 포지션을
                  구성하고 전략을 분석해보세요.
                </Typography>
              </Card>
            </Box>
          </Box>
        </Card>
      )}

      {/* Catalog Dialog */}
      <Dialog
        open={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            오셀로 전술 퍼즐 초급 핵심 5선
          </Box>
          <IconButton onClick={() => setIsCatalogOpen(false)} sx={{ color: '#64748b' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {OTHELLO_PUZZLE_LIST.map((prob, idx) => {
            const isCurrent = idx === selectedProblemIndex;
            return (
              <Card
                key={prob.id}
                onClick={() => handleSelectProblemIndex(idx)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isCurrent ? 'rgba(21, 128, 61, 0.08)' : '#ffffff',
                  border: '1px solid',
                  borderColor: isCurrent ? '#15803d' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: 'rgba(21, 128, 61, 0.12)',
                    borderColor: '#15803d',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {prob.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={prob.category}
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(21, 128, 61, 0.1)',
                      color: '#15803d',
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {prob.objective}
                </Typography>
              </Card>
            );
          })}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
