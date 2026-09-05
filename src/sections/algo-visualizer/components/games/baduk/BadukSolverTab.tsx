'use client';

import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';

import { BadukBoard } from './BadukBoard';
import { BADUK_PUZZLE_LIST } from '../../../lib/games/baduk/puzzles';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import { playMove, createEmptyBoard, formatBadukCoord } from '../../../lib/games/baduk/engine';
import { playBadukStoneSound, playPuzzleSolvedSound } from '../../../lib/games/gameSounds';
import {
  findBestBadukAIMove,
  analyzeBadukPosition,
  findMatchingSolutionNode,
} from '../../../lib/games/baduk/solver';
import {
  type Point,
  type BoardGrid,
  type StoneColor,
  type BadukProblem,
  type BadukAIAnalysis,
  type BadukSolutionNode,
} from '../../../lib/games/baduk/types';

type TabMode = 'puzzle' | 'sandbox';
type PlacementTool = 'play' | 'black' | 'white' | 'eraser';

export function BadukSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tabMode, setTabMode] = useState<TabMode>('puzzle');

  // ================= Puzzle Mode States =================
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<BadukProblem>(BADUK_PUZZLE_LIST[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [board, setBoard] = useState<BoardGrid>(() => createEmptyBoard(9));
  const [history, setHistory] = useState<BoardGrid[]>([]);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [turn, setTurn] = useState<StoneColor>('B');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  const [currentNodeTree, setCurrentNodeTree] = useState<BadukSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // ================= Sandbox Mode States =================
  const [sandboxBoardSize, setSandboxBoardSize] = useState<number>(9);
  const [sandboxBoard, setSandboxBoard] = useState<BoardGrid>(() => createEmptyBoard(9));
  const [sandboxHistory, setSandboxHistory] = useState<BoardGrid[]>([]);
  const [sandboxTurn, setSandboxTurn] = useState<StoneColor>('B');
  const [placementTool, setPlacementTool] = useState<PlacementTool>('play');
  const [blackCaptures, setBlackCaptures] = useState(0);
  const [whiteCaptures, setWhiteCaptures] = useState(0);
  const [sandboxLastMove, setSandboxLastMove] = useState<Point | null>(null);

  // Overlays
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [showInfluence, setShowInfluence] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<BadukAIAnalysis | null>(null);

  // Load problem setup
  const setupProblem = useCallback((problem: BadukProblem) => {
    const newBoard = createEmptyBoard(problem.boardSize);
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

    const analysis = analyzeBadukPosition(newBoard, problem.playerColor, problem.focusRegion);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupProblem(BADUK_PUZZLE_LIST[0]);
    const initSandbox = createEmptyBoard(9);
    setSandboxBoard(initSandbox);
    setSandboxHistory([initSandbox]);
  }, [setupProblem]);

  const handleSelectProblemIndex = (index: number) => {
    if (index >= 0 && index < BADUK_PUZZLE_LIST.length) {
      setSelectedProblemIndex(index);
      const prob = BADUK_PUZZLE_LIST[index];
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
    if (selectedProblemIndex < BADUK_PUZZLE_LIST.length - 1) {
      handleSelectProblemIndex(selectedProblemIndex + 1);
    }
  };

  const handleRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * BADUK_PUZZLE_LIST.length);
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

    const analysis = analyzeBadukPosition(
      targetBoard,
      currentProblem.playerColor,
      currentProblem.focusRegion
    );
    setAiAnalysis(analysis);
  };

  const handlePlayMove = (r: number, c: number) => {
    if (isSolved || isFailed || isAIMoving || turn !== 'B') return;

    const moveRes = playMove(board, { r, c }, 'B');
    if (!moveRes.valid || !moveRes.newBoard) return;

    playBadukStoneSound();
    const nextBoard = moveRes.newBoard;
    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setLastMove({ r, c });
    setTurn('W');

    // Check solution match
    const matchingNode = findMatchingSolutionNode(currentNodeTree, { r, c });

    if (matchingNode) {
      if (matchingNode.comment) {
        setStatusMessage(matchingNode.comment);
      }

      if (matchingNode.aiResponse) {
        setIsAIMoving(true);
        setTimeout(() => {
          const aiMove = matchingNode.aiResponse!;
          const aiRes = playMove(nextBoard, aiMove, 'W');
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
              setStatusMessage('축하합니다! 사활 문제를 완벽하게 풀어냈습니다.');
            }
          } else {
            setIsAIMoving(false);
            setTurn('B');
          }
        }, 500);
      } else {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage(matchingNode.comment || '정답입니다! 묘수를 찾아냈습니다.');
      }
    } else {
      // Dynamic AI counter-move
      setIsAIMoving(true);
      setStatusMessage(
        `흑 ${formatBadukCoord({ r, c }, currentProblem.boardSize)} 착수. 백(AI)이 수읽기 중입니다...`
      );

      setTimeout(() => {
        const { move: aiMove, reason } = findBestBadukAIMove(
          nextBoard,
          'W',
          currentProblem.focusRegion
        );

        if (aiMove) {
          const aiRes = playMove(nextBoard, aiMove, 'W');
          if (aiRes.valid && aiRes.newBoard) {
            playBadukStoneSound();
            setBoard(aiRes.newBoard);
            setHistory((prev) => [...prev, aiRes.newBoard!]);
            setLastMove(aiMove);
            setStatusMessage(
              `백이 ${formatBadukCoord(aiMove, currentProblem.boardSize)}에 응수했습니다 (${reason}). 흑의 다음 수를 두세요!`
            );
          }
        } else {
          setStatusMessage('백이 더 이상 둘 곳이 없습니다. 흑의 승세입니다!');
        }

        setIsAIMoving(false);
        setTurn('B');
      }, 500);
    }

    const analysis = analyzeBadukPosition(
      nextBoard,
      currentProblem.playerColor,
      currentProblem.focusRegion
    );
    setAiAnalysis(analysis);
  };

  const handleAutoPlaySolution = () => {
    if (isAIMoving) return;
    if (currentNodeTree.length === 0 || isSolved || isFailed || turn !== 'B') {
      setupProblem(currentProblem);
      setTimeout(() => {
        const firstNode = currentProblem.solutionTree[0];
        if (firstNode) {
          handlePlayMove(firstNode.move.r, firstNode.move.c);
        }
      }, 150);
      return;
    }
    const targetNode = currentNodeTree[0];
    if (targetNode) {
      handlePlayMove(targetNode.move.r, targetNode.move.c);
    }
  };

  const getBadukSolutionSteps = (problem: BadukProblem) => {
    const steps: string[] = [];
    const traverse = (nodes: BadukSolutionNode[], stepNum: number) => {
      if (!nodes || nodes.length === 0) return;
      const node = nodes[0];
      steps.push(
        `${stepNum}수: 흑(黑) ${formatBadukCoord(node.move, problem.boardSize)} (${node.move.r}, ${node.move.c}) 착수`
      );
      if (node.aiResponse) {
        steps.push(
          `${stepNum + 1}수: 백(白) ${formatBadukCoord(node.aiResponse, problem.boardSize)} (${node.aiResponse.r}, ${node.aiResponse.c}) 응수`
        );
        if (node.children) {
          traverse(node.children, stepNum + 2);
        }
      }
    };
    traverse(problem.solutionTree, 1);
    return steps;
  };

  // ================= Sandbox Handlers =================
  const handleChangeBoardSize = (newSize: number) => {
    setSandboxBoardSize(newSize);
    const newB = createEmptyBoard(newSize);
    setSandboxBoard(newB);
    setSandboxHistory([newB]);
    setSandboxLastMove(null);
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setSandboxTurn('B');
  };

  const handleSandboxClear = () => {
    const newB = createEmptyBoard(sandboxBoardSize);
    setSandboxBoard(newB);
    setSandboxHistory([newB]);
    setSandboxLastMove(null);
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setSandboxTurn('B');
  };

  const handleSandboxUndo = () => {
    if (sandboxHistory.length <= 1) return;
    const nextHistory = sandboxHistory.slice(0, sandboxHistory.length - 1);
    const targetB = nextHistory[nextHistory.length - 1];
    setSandboxBoard(targetB);
    setSandboxHistory(nextHistory);
    setSandboxLastMove(null);
    setSandboxTurn(sandboxTurn === 'B' ? 'W' : 'B');
  };

  const handleSandboxClickPoint = (r: number, c: number) => {
    if (placementTool === 'play') {
      const res = playMove(sandboxBoard, { r, c }, sandboxTurn);
      if (!res.valid || !res.newBoard) return;

      playBadukStoneSound();
      if (res.captures && res.captures.length > 0) {
        if (sandboxTurn === 'B') setBlackCaptures((prev) => prev + res.captures.length);
        else setWhiteCaptures((prev) => prev + res.captures.length);
      }
      setSandboxBoard(res.newBoard);
      setSandboxHistory((prev) => [...prev, res.newBoard!]);
      setSandboxLastMove({ r, c });
      setSandboxTurn(sandboxTurn === 'B' ? 'W' : 'B');
    } else if (placementTool === 'black') {
      const next = sandboxBoard.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? 'B' : cell))
      );
      playBadukStoneSound();
      setSandboxBoard(next);
      setSandboxHistory((prev) => [...prev, next]);
    } else if (placementTool === 'white') {
      const next = sandboxBoard.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? 'W' : cell))
      );
      playBadukStoneSound();
      setSandboxBoard(next);
      setSandboxHistory((prev) => [...prev, next]);
    } else if (placementTool === 'eraser') {
      const next = sandboxBoard.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? null : cell))
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
                bgcolor: '#0284c7',
                color: '#ffffff',
                '&:hover': { bgcolor: '#0369a1' },
              },
            },
          }}
        >
          <ToggleButton value="puzzle">
            <MenuBookRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎯 사활 문제 풀이 (초급 5선)
          </ToggleButton>
          <ToggleButton value="sandbox">
            <SportsEsportsRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎮 자유 대국 & 자유 배치 모드
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
                <AutoAwesomeRoundedIcon sx={{ color: '#0284c7' }} />
                {currentProblem.title}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ListAltRoundedIcon />}
                onClick={() => setIsCatalogOpen(true)}
                sx={{
                  fontWeight: 700,
                  color: '#0284c7',
                  borderColor: 'rgba(2, 132, 199, 0.4)',
                  background: 'rgba(2, 132, 199, 0.06)',
                  '&:hover': { background: 'rgba(2, 132, 199, 0.12)' },
                }}
              >
                예제 목록 ({selectedProblemIndex + 1} / {BADUK_PUZZLE_LIST.length})
              </Button>

              <Chip
                size="small"
                label={currentProblem.category}
                sx={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 }}
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
                disabled={selectedProblemIndex === BADUK_PUZZLE_LIST.length - 1}
                sx={{ color: '#64748b' }}
                title="다음 문제"
              >
                <NavigateNextRoundedIcon />
              </IconButton>

              <IconButton onClick={handleRandomProblem} sx={{ color: '#d97706' }} title="랜덤 문제">
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
                사활 힌트
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

              <IconButton onClick={handleReset} sx={{ color: '#64748b' }} title="문제 초기화">
                <ReplayRoundedIcon />
              </IconButton>
            </Box>
          </Card>

          {/* Main Puzzle Area */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Board */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <BadukBoard
                board={board}
                boardSize={currentProblem.boardSize}
                playerColor="B"
                lastMove={lastMove}
                showLiberties={showLiberties}
                libertiesMap={aiAnalysis?.libertiesMap}
                showInfluence={showInfluence}
                influenceMap={aiAnalysis?.influenceMap}
                recommendedMoves={aiAnalysis?.recommendedMoves}
                disabled={isSolved || isFailed || isAIMoving}
                onPlaceStone={(p) => handlePlayMove(p.r, p.c)}
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
                  variant={showLiberties ? 'contained' : 'outlined'}
                  startIcon={<LayersRoundedIcon />}
                  onClick={() => setShowLiberties(!showLiberties)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: showLiberties ? '#0284c7 !important' : '#f1f5f9 !important',
                    color: showLiberties ? '#ffffff !important' : '#334155 !important',
                    border: '1px solid #cbd5e1 !important',
                  }}
                >
                  활로 표시
                </Button>
                <Button
                  size="small"
                  variant={showInfluence ? 'contained' : 'outlined'}
                  startIcon={<InvertColorsRoundedIcon />}
                  onClick={() => setShowInfluence(!showInfluence)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: showInfluence ? '#7c3aed !important' : '#f1f5f9 !important',
                    color: showInfluence ? '#ffffff !important' : '#334155 !important',
                    border: '1px solid #cbd5e1 !important',
                  }}
                >
                  세력도
                </Button>
              </Box>
            </Box>

            {/* Right: Problem Status & Analysis */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Status Alert Card */}
              <Card
                sx={{
                  p: 2.5,
                  background: isSolved
                    ? '#f0fdf4'
                    : isFailed
                      ? '#fef2f2'
                      : isAIMoving
                        ? '#f0f9ff'
                        : '#ffffff',
                  border: '1px solid',
                  borderColor: isSolved
                    ? '#22c55e'
                    : isFailed
                      ? '#ef4444'
                      : isAIMoving
                        ? '#0ea5e9'
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
                    <PlayArrowRoundedIcon sx={{ color: '#0284c7', fontSize: 28 }} />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: isSolved ? '#16a34a' : isFailed ? '#dc2626' : '#0f172a',
                    }}
                  >
                    {isSolved
                      ? '사활 해결 성공!'
                      : isFailed
                        ? '실패'
                        : isAIMoving
                          ? '백(AI) 수읽기 중...'
                          : '흑선(黑先) - 착수할 위치를 클릭하세요'}
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
                        🎯 바둑 사활 정답 수순 및 좌표
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
                    {getBadukSolutionSteps(currentProblem).map((s, idx) => (
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
                      사활 힌트 가이드
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
                  <HelpOutlineRoundedIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    바둑 이론 & 맥점 해설
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  {currentProblem.explanation}
                </Typography>
              </Card>

              {/* Inspector */}
              {aiAnalysis && (
                <GameAlgorithmInspector
                  gameTitle="바둑 (Go/Baduk)"
                  csConcept={currentProblem.csConcept}
                  searchNodes={aiAnalysis.searchNodesEvaluated}
                  searchDepth={aiAnalysis.searchDepth}
                  timeMs={aiAnalysis.timeMs}
                  evalScore={aiAnalysis.recommendedMoves[0]?.score || 0}
                  algorithmName="BFS 활로 계산 & Minimax Alpha-Beta 탐색"
                  complexityInfo={{
                    time: 'O(b^d) → Alpha-Beta 탐색',
                    space: 'O(V + E) 그래프 BFS 탐색',
                    branchingFactor: 'b ≈ 10~30 (부분 사활 영역)',
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
          {/* Sandbox Toolbar */}
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
                🎮 바둑 자유 대국 & 포지션 배치장
              </Typography>

              {/* Board Size Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GridViewRoundedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                  판 크기:
                </Typography>
                {[9, 13, 19].map((size) => (
                  <Button
                    key={size}
                    size="small"
                    variant={sandboxBoardSize === size ? 'contained' : 'outlined'}
                    onClick={() => handleChangeBoardSize(size)}
                    sx={{
                      minWidth: 44,
                      fontWeight: 800,
                      backgroundColor:
                        sandboxBoardSize === size ? '#0284c7 !important' : '#f1f5f9 !important',
                      color:
                        sandboxBoardSize === size ? '#ffffff !important' : '#334155 !important',
                      border: '1px solid #cbd5e1 !important',
                    }}
                  >
                    {size}x{size}
                  </Button>
                ))}
              </Box>
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
                      bgcolor: '#0284c7',
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

              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteSweepRoundedIcon sx={{ color: '#dc2626 !important' }} />}
                onClick={handleSandboxClear}
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
          </Box>

          {/* Sandbox Main Body */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
              gap: 4,
              alignItems: 'start',
            }}
          >
            {/* Board */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <BadukBoard
                board={sandboxBoard}
                boardSize={sandboxBoardSize}
                playerColor={sandboxTurn}
                lastMove={sandboxLastMove}
                showLiberties={showLiberties}
                showInfluence={showInfluence}
                onPlaceStone={(p) => handleSandboxClickPoint(p.r, p.c)}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={showLiberties ? 'contained' : 'outlined'}
                  startIcon={<LayersRoundedIcon />}
                  onClick={() => setShowLiberties(!showLiberties)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: showLiberties ? '#0284c7 !important' : '#f1f5f9 !important',
                    color: showLiberties ? '#ffffff !important' : '#334155 !important',
                    border: '1px solid #cbd5e1 !important',
                  }}
                >
                  활로 표시
                </Button>
                <Button
                  size="small"
                  variant={showInfluence ? 'contained' : 'outlined'}
                  startIcon={<InvertColorsRoundedIcon />}
                  onClick={() => setShowInfluence(!showInfluence)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: showInfluence ? '#7c3aed !important' : '#f1f5f9 !important',
                    color: showInfluence ? '#ffffff !important' : '#334155 !important',
                    border: '1px solid #cbd5e1 !important',
                  }}
                >
                  세력도
                </Button>
              </Box>
            </Box>

            {/* Sandbox Side Status */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Game Status Card */}
              <Card sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  📊 실시간 대국 정보
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
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                      따낸 백돌: <strong>{blackCaptures}개</strong>
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
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                      따낸 흑돌: <strong>{whiteCaptures}개</strong>
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                  💡 <strong>자유 대국 안내:</strong> 바둑판 위를 클릭하여 자유롭게 수를 놓아보세요.
                  따내기 및 자충수 판별이 실시간으로 작동하며, 도구 팔레트에서 흑/백 돌을 직접
                  올려놓아 원하는 사활 포지션을 직접 만들어 연구할 수도 있습니다.
                </Typography>
              </Card>
            </Box>
          </Box>
        </Card>
      )}

      {/* Problem Catalog Dialog */}
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
            바둑 사활 초급 핵심 5선
          </Box>
          <IconButton onClick={() => setIsCatalogOpen(false)} sx={{ color: '#64748b' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {BADUK_PUZZLE_LIST.map((prob, idx) => {
            const isCurrent = idx === selectedProblemIndex;
            return (
              <Card
                key={prob.id}
                onClick={() => handleSelectProblemIndex(idx)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isCurrent ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                  border: '1px solid',
                  borderColor: isCurrent ? '#0284c7' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: 'rgba(2, 132, 199, 0.12)',
                    borderColor: '#0284c7',
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
                      bgcolor: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
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
