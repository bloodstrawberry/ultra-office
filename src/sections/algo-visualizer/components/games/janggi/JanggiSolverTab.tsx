'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { JanggiBoard } from './JanggiBoard';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import { JANGGI_BAKBO_LIST } from '../../../lib/games/janggi/puzzles';
import {
  playCheckSound,
  playJanggiPieceSound,
  playPuzzleSolvedSound,
  playPuzzleFailedSound,
} from '../../../lib/games/gameSounds';
import {
  isSideInCheck,
  makeJanggiMove,
  isSameJanggiPoint,
  createEmptyJanggiBoard,
  createStandardJanggiBoard,
} from '../../../lib/games/janggi/engine';
import {
  analyzeJanggiPosition,
  findBestJanggiAIMove,
  getAllLegalJanggiMoves,
  findMatchingBakboNode,
} from '../../../lib/games/janggi/solver';
import {
  type JanggiSide,
  type JanggiPoint,
  type JanggiPiece,
  type JanggiPieceType,
  type JanggiAIAnalysis,
  type JanggiBakboProblem,
  type JanggiSolutionNode,
  type JanggiBoard as JanggiBoardType,
} from '../../../lib/games/janggi/types';

type TabMode = 'puzzle' | 'sandbox';
type JanggiTool = 'play' | 'erase' | { side: JanggiSide; type: JanggiPieceType };

export function JanggiSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tabMode, setTabMode] = useState<TabMode>('puzzle');

  // ================= Puzzle Mode States =================
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<JanggiBakboProblem>(JANGGI_BAKBO_LIST[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [board, setBoard] = useState<JanggiBoardType>(() => createEmptyJanggiBoard());
  const [history, setHistory] = useState<JanggiBoardType[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<JanggiPoint | null>(null);
  const [lastMove, setLastMove] = useState<{ from: JanggiPoint; to: JanggiPoint } | null>(null);
  const [turn, setTurn] = useState<JanggiSide>('CHO');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  const [currentNodeTree, setCurrentNodeTree] = useState<JanggiSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<JanggiAIAnalysis | null>(null);

  // ================= Sandbox Mode States =================
  const [sandboxBoard, setSandboxBoard] = useState<JanggiBoardType>(() =>
    createStandardJanggiBoard()
  );
  const [sandboxHistory, setSandboxHistory] = useState<JanggiBoardType[]>([]);
  const [sandboxSelectedPoint, setSandboxSelectedPoint] = useState<JanggiPoint | null>(null);
  const [sandboxLastMove, setSandboxLastMove] = useState<{
    from: JanggiPoint;
    to: JanggiPoint;
  } | null>(null);
  const [sandboxTurn, setSandboxTurn] = useState<JanggiSide>('CHO');
  const [activeTool, setActiveTool] = useState<JanggiTool>('play');
  const [sandboxCheckState, setSandboxCheckState] = useState<{
    choInCheck: boolean;
    hanInCheck: boolean;
  }>({
    choInCheck: false,
    hanInCheck: false,
  });

  const setupProblem = useCallback((problem: JanggiBakboProblem) => {
    const newBoard = createEmptyJanggiBoard();
    for (const item of problem.initialPieces) {
      newBoard[item.r][item.c] = item.piece;
    }

    setBoard(newBoard);
    setHistory([newBoard]);
    setSelectedPoint(null);
    setLastMove(null);
    setTurn(problem.playerSide);
    setIsAIMoving(false);
    setCurrentNodeTree(problem.solutionTree);
    setStatusMessage(problem.objective);
    setIsSolved(false);
    setIsFailed(false);
    setShowHint(false);
    setShowSolution(false);

    const analysis = analyzeJanggiPosition(newBoard, problem.playerSide);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupProblem(JANGGI_BAKBO_LIST[0]);
    const initStd = createStandardJanggiBoard();
    setSandboxBoard(initStd);
    setSandboxHistory([initStd]);
  }, [setupProblem]);

  const handleSelectProblemIndex = (index: number) => {
    if (index >= 0 && index < JANGGI_BAKBO_LIST.length) {
      setSelectedProblemIndex(index);
      const prob = JANGGI_BAKBO_LIST[index];
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
    if (selectedProblemIndex < JANGGI_BAKBO_LIST.length - 1) {
      handleSelectProblemIndex(selectedProblemIndex + 1);
    }
  };

  const handleRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * JANGGI_BAKBO_LIST.length);
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
    setSelectedPoint(null);
    setLastMove(null);
    setTurn('CHO');
    setIsSolved(false);
    setIsFailed(false);
    setStatusMessage('수를 물렀습니다. 다른 장기수를 시도해보세요.');

    const analysis = analyzeJanggiPosition(targetBoard, currentProblem.playerSide);
    setAiAnalysis(analysis);
  };

  const handleMovePiece = (from: JanggiPoint, to: JanggiPoint) => {
    if (isSolved || isFailed || isAIMoving || turn !== 'CHO') return;

    const piece = board[from.r][from.c];
    if (!piece || piece.side !== 'CHO') return;

    const targetPiece = board[to.r][to.c];
    if (targetPiece && targetPiece.side === 'CHO') return;

    const nextBoard = makeJanggiMove(board, {
      from,
      to,
      piece,
      captured: targetPiece,
    });

    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setLastMove({ from, to });
    setSelectedPoint(null);
    setTurn('HAN');

    const isHanCheck = isSideInCheck(nextBoard, 'HAN');
    if (isHanCheck) {
      playCheckSound();
    }

    const hanLegalMoves = getAllLegalJanggiMoves(nextBoard, 'HAN');

    if (hanLegalMoves.length === 0) {
      if (isHanCheck) {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage('외통 장군! 한 궁이 피할 길이 없어 초나라의 완벽한 승리입니다!');
      } else {
        setIsFailed(true);
        setStatusMessage('빅 (Stalemate): 한이 둘 수 있는 수가 없어 무승부로 끝났습니다.');
      }
      return;
    }

    const matchingNode = findMatchingBakboNode(currentNodeTree, from, to);

    if (matchingNode) {
      if (matchingNode.comment) {
        setStatusMessage(matchingNode.comment);
      }

      const scriptedAI = matchingNode.aiResponse;
      const isScriptedValid =
        scriptedAI &&
        hanLegalMoves.some(
          (lm) =>
            isSameJanggiPoint(lm.from, scriptedAI.from) && isSameJanggiPoint(lm.to, scriptedAI.to)
        );

      if (isScriptedValid && scriptedAI) {
        setIsAIMoving(true);
        setTimeout(() => {
          const aiPiece = nextBoard[scriptedAI.from.r][scriptedAI.from.c];
          if (aiPiece) {
            playJanggiPieceSound();
            const aiBoard = makeJanggiMove(nextBoard, {
              from: scriptedAI.from,
              to: scriptedAI.to,
              piece: aiPiece,
              captured: nextBoard[scriptedAI.to.r][scriptedAI.to.c],
            });
            setBoard(aiBoard);
            setHistory((prev) => [...prev, aiBoard]);
            setLastMove({ from: scriptedAI.from, to: scriptedAI.to });
            setTurn('CHO');
            setIsAIMoving(false);

            if (scriptedAI.comment) {
              setStatusMessage(scriptedAI.comment);
            }

            if (matchingNode.children && matchingNode.children.length > 0) {
              setCurrentNodeTree(matchingNode.children);
            } else {
              setIsSolved(true);
              playPuzzleSolvedSound();
              setStatusMessage('축하합니다! 박보장기를 완벽하게 풀어냈습니다.');
            }
          }
        }, 500);
      } else {
        if (matchingNode.isCheckmate) {
          setIsSolved(true);
          playPuzzleSolvedSound();
          setStatusMessage(matchingNode.comment || '외통수! 초(楚)의 완벽한 승리입니다.');
        } else {
          triggerDynamicAIDefense(nextBoard);
        }
      }
    } else {
      triggerDynamicAIDefense(nextBoard);
    }

    const analysis = analyzeJanggiPosition(nextBoard, currentProblem.playerSide);
    setAiAnalysis(analysis);
  };

  const triggerDynamicAIDefense = (currentBoard: JanggiBoardType) => {
    setIsAIMoving(true);
    setStatusMessage('초(楚) 착수 완료. 한(漢) AI가 수비 수순을 수읽기 중입니다...');

    setTimeout(() => {
      const { move: aiMove, isCheckmate, reason } = findBestJanggiAIMove(currentBoard, 'HAN');

      if (isCheckmate || !aiMove) {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage('외통수! 한(漢)이 장군을 막을 수 없어 초(楚)가 승리했습니다!');
      } else {
        playJanggiPieceSound();
        const aiBoard = makeJanggiMove(currentBoard, aiMove);
        setBoard(aiBoard);
        setHistory((prev) => [...prev, aiBoard]);
        setLastMove({ from: aiMove.from, to: aiMove.to });
        setStatusMessage(`한(漢)이 응수했습니다 (${reason}). 다음 수를 이어가세요!`);
      }

      setIsAIMoving(false);
      setTurn('CHO');
    }, 500);
  };

  const handleAutoPlaySolution = () => {
    if (isAIMoving) return;
    if (currentNodeTree.length === 0 || isSolved || isFailed || turn !== 'CHO') {
      setupProblem(currentProblem);
      setTimeout(() => {
        const firstNode = currentProblem.solutionTree[0];
        if (firstNode) {
          handleMovePiece(firstNode.from, firstNode.to);
        }
      }, 150);
      return;
    }
    const targetNode = currentNodeTree[0];
    if (targetNode) {
      handleMovePiece(targetNode.from, targetNode.to);
    }
  };

  const getJanggiSolutionSteps = (problem: JanggiBakboProblem) => {
    const steps: string[] = [];
    const traverse = (nodes: JanggiSolutionNode[], stepNum: number) => {
      if (!nodes || nodes.length === 0) return;
      const node = nodes[0];
      steps.push(
        `${stepNum}수: 초(楚) ${node.notation || `(${node.from.r}, ${node.from.c}) ➔ (${node.to.r}, ${node.to.c})`}`
      );
      if (node.aiResponse) {
        steps.push(
          `${stepNum + 1}수: 한(漢) ${node.aiResponse.notation || `(${node.aiResponse.from.r}, ${node.aiResponse.from.c}) ➔ (${node.aiResponse.to.r}, ${node.aiResponse.to.c})`}`
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
  const handleSandboxResetStandard = () => {
    const std = createStandardJanggiBoard();
    setSandboxBoard(std);
    setSandboxHistory([std]);
    setSandboxSelectedPoint(null);
    setSandboxLastMove(null);
    setSandboxTurn('CHO');
    setSandboxCheckState({ choInCheck: false, hanInCheck: false });
  };

  const handleSandboxClearBoard = () => {
    const empty = createEmptyJanggiBoard();
    setSandboxBoard(empty);
    setSandboxHistory([empty]);
    setSandboxSelectedPoint(null);
    setSandboxLastMove(null);
    setSandboxTurn('CHO');
    setSandboxCheckState({ choInCheck: false, hanInCheck: false });
  };

  const handleSandboxUndo = () => {
    if (sandboxHistory.length <= 1) return;
    const nextHist = sandboxHistory.slice(0, sandboxHistory.length - 1);
    const target = nextHist[nextHist.length - 1];
    setSandboxBoard(target);
    setSandboxHistory(nextHist);
    setSandboxSelectedPoint(null);
    setSandboxLastMove(null);
    setSandboxTurn(sandboxTurn === 'CHO' ? 'HAN' : 'CHO');
  };

  const handleSandboxSelectPoint = (pt: JanggiPoint | null) => {
    if (activeTool === 'play') {
      setSandboxSelectedPoint(pt);
    } else if (pt) {
      // Place or erase piece
      if (activeTool === 'erase') {
        const nextB = sandboxBoard.map((row, r) =>
          row.map((cell, c) => (r === pt.r && c === pt.c ? null : cell))
        );
        setSandboxBoard(nextB);
        setSandboxHistory((prev) => [...prev, nextB]);
      } else {
        const newPiece: JanggiPiece = {
          id: `custom-${activeTool.side}-${activeTool.type}-${Date.now()}`,
          side: activeTool.side,
          type: activeTool.type,
        };
        const nextB = sandboxBoard.map((row, r) =>
          row.map((cell, c) => (r === pt.r && c === pt.c ? newPiece : cell))
        );
        playJanggiPieceSound();
        setSandboxBoard(nextB);
        setSandboxHistory((prev) => [...prev, nextB]);
      }
    }
  };

  const handleSandboxMovePiece = (from: JanggiPoint, to: JanggiPoint) => {
    if (activeTool !== 'play') return;

    const piece = sandboxBoard[from.r][from.c];
    if (!piece || piece.side !== sandboxTurn) return;

    const targetPiece = sandboxBoard[to.r][to.c];
    if (targetPiece && targetPiece.side === sandboxTurn) return;

    playJanggiPieceSound();
    const nextB = makeJanggiMove(sandboxBoard, {
      from,
      to,
      piece,
      captured: targetPiece,
    });

    const nextTurn = sandboxTurn === 'CHO' ? 'HAN' : 'CHO';
    const isNextInCheck = isSideInCheck(nextB, nextTurn);
    if (isNextInCheck) {
      playCheckSound();
    }

    setSandboxBoard(nextB);
    setSandboxHistory((prev) => [...prev, nextB]);
    setSandboxLastMove({ from, to });
    setSandboxSelectedPoint(null);
    setSandboxTurn(nextTurn);
    setSandboxCheckState({
      choInCheck: isSideInCheck(nextB, 'CHO'),
      hanInCheck: isSideInCheck(nextB, 'HAN'),
    });
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
                bgcolor: '#059669',
                color: '#ffffff',
                '&:hover': { bgcolor: '#047857' },
              },
            },
          }}
        >
          <ToggleButton value="puzzle">
            <MenuBookRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎯 박보 묘수풀이 (초급 5선)
          </ToggleButton>
          <ToggleButton value="sandbox">
            <SportsEsportsRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎮 장기 자유 대국 & 기물 배치 모드
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
                <AutoAwesomeRoundedIcon sx={{ color: '#059669' }} />
                {currentProblem.title}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ListAltRoundedIcon />}
                onClick={() => setIsCatalogOpen(true)}
                sx={{
                  fontWeight: 700,
                  color: '#059669',
                  borderColor: 'rgba(5, 150, 105, 0.4)',
                  background: 'rgba(5, 150, 105, 0.06)',
                  '&:hover': { background: 'rgba(5, 150, 105, 0.12)' },
                }}
              >
                박보 목록 ({selectedProblemIndex + 1} / {JANGGI_BAKBO_LIST.length})
              </Button>

              <Chip
                size="small"
                label={currentProblem.category}
                sx={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', fontWeight: 700 }}
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
                disabled={selectedProblemIndex === JANGGI_BAKBO_LIST.length - 1}
                sx={{ color: '#64748b' }}
                title="다음 문제"
              >
                <NavigateNextRoundedIcon />
              </IconButton>

              <IconButton onClick={handleRandomProblem} sx={{ color: '#d97706' }} title="랜덤 박보">
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
                박보 힌트
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
              <JanggiBoard
                board={board}
                playerSide="CHO"
                selectedPoint={selectedPoint}
                lastMove={lastMove}
                disabled={isSolved || isFailed || isAIMoving}
                onSelectPoint={setSelectedPoint}
                onMovePiece={handleMovePiece}
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

            {/* Right: Problem Details & Analysis */}
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
                        ? '#f0fdf4'
                        : '#ffffff',
                  border: '1px solid',
                  borderColor: isSolved
                    ? '#22c55e'
                    : isFailed
                      ? '#ef4444'
                      : isAIMoving
                        ? '#10b981'
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
                    <PlayArrowRoundedIcon sx={{ color: '#059669', fontSize: 28 }} />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: isSolved ? '#16a34a' : isFailed ? '#dc2626' : '#0f172a',
                    }}
                  >
                    {isSolved
                      ? '외통수 승리!'
                      : isFailed
                        ? '실패'
                        : isAIMoving
                          ? '한(漢) 수비 수읽기 중...'
                          : '초선(楚先) - 기물을 선택하여 이동하세요'}
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
                        🎯 박보 정답 수순 및 묘수
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
                    {getJanggiSolutionSteps(currentProblem).map((s, idx) => (
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
                    💡 <strong>핵심 묘수:</strong> {currentProblem.hint}
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
                      박보 힌트 가이드
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
                  <HelpOutlineRoundedIcon sx={{ color: '#059669', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    박보 묘수 해설
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  {currentProblem.explanation}
                </Typography>
              </Card>

              {/* CS Inspector */}
              {aiAnalysis && (
                <GameAlgorithmInspector
                  gameTitle="장기 (Janggi)"
                  csConcept={currentProblem.csConcept}
                  searchNodes={aiAnalysis.searchNodesEvaluated}
                  searchDepth={aiAnalysis.searchDepth}
                  timeMs={aiAnalysis.timeMs}
                  evalScore={aiAnalysis.scoreAdvantage}
                  algorithmName="장기 Minimax & 연장군 외통 탐색"
                  complexityInfo={{
                    time: 'O(b^d) → Move Ordering 최적화',
                    space: 'O(d) 스택 트리',
                    branchingFactor: 'b ≈ 15~40 (장기 기동성)',
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
                🎮 장기 자유 대국 & 포지션 배치장
              </Typography>

              <Button
                size="small"
                variant="contained"
                startIcon={<RestartAltRoundedIcon sx={{ color: '#ffffff !important' }} />}
                onClick={handleSandboxResetStandard}
                sx={{
                  fontWeight: 800,
                  backgroundColor: '#059669 !important',
                  color: '#ffffff !important',
                  '&:hover': { backgroundColor: '#047857 !important' },
                }}
              >
                정식 대국 배치
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

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                한 수 무르기
              </Button>
            </Box>
          </Box>

          {/* Placement Tool Selector */}
          <Box
            sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                🛠️ 모드 및 기물 배치 도구:
              </Typography>

              <Button
                size="small"
                variant={activeTool === 'play' ? 'contained' : 'outlined'}
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => setActiveTool('play')}
                sx={{
                  fontWeight: 800,
                  backgroundColor:
                    activeTool === 'play' ? '#059669 !important' : '#ffffff !important',
                  color: activeTool === 'play' ? '#ffffff !important' : '#334155 !important',
                  border: '1px solid #cbd5e1 !important',
                }}
              >
                🎮 2인 번갈아 대국 모드
              </Button>

              <Button
                size="small"
                variant={activeTool === 'erase' ? 'contained' : 'outlined'}
                startIcon={<DeleteSweepRoundedIcon />}
                onClick={() => setActiveTool('erase')}
                sx={{
                  fontWeight: 800,
                  backgroundColor:
                    activeTool === 'erase' ? '#dc2626 !important' : '#ffffff !important',
                  color: activeTool === 'erase' ? '#ffffff !important' : '#dc2626 !important',
                  border: '1px solid #fca5a5 !important',
                }}
              >
                🧹 기물 지우개
              </Button>
            </Box>

            {/* Pieces Palettes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Cho Palette */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: '#15803d', minWidth: 65 }}
                >
                  🟢 초(楚) 기물:
                </Typography>
                {(
                  [
                    { type: 'KING', label: '楚 (궁)' },
                    { type: 'CHARIOT', label: '車 (차)' },
                    { type: 'CANNON', label: '包 (포)' },
                    { type: 'HORSE', label: '馬 (마)' },
                    { type: 'ELEPHANT', label: '象 (상)' },
                    { type: 'GUARD', label: '士 (사)' },
                    { type: 'SOLDIER', label: '卒 (졸)' },
                  ] as const
                ).map((p) => {
                  const isSelected =
                    typeof activeTool === 'object' &&
                    activeTool.side === 'CHO' &&
                    activeTool.type === p.type;
                  return (
                    <Button
                      key={`cho-${p.type}`}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setActiveTool({ side: 'CHO', type: p.type })}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: isSelected ? '#15803d !important' : '#ffffff !important',
                        color: isSelected ? '#ffffff !important' : '#15803d !important',
                        border: '1px solid #86efac !important',
                      }}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </Box>

              {/* Han Palette */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: '#b91c1c', minWidth: 65 }}
                >
                  🔴 한(漢) 기물:
                </Typography>
                {(
                  [
                    { type: 'KING', label: '漢 (궁)' },
                    { type: 'CHARIOT', label: '車 (차)' },
                    { type: 'CANNON', label: '包 (포)' },
                    { type: 'HORSE', label: '馬 (마)' },
                    { type: 'ELEPHANT', label: '象 (상)' },
                    { type: 'GUARD', label: '士 (사)' },
                    { type: 'SOLDIER', label: '兵 (병)' },
                  ] as const
                ).map((p) => {
                  const isSelected =
                    typeof activeTool === 'object' &&
                    activeTool.side === 'HAN' &&
                    activeTool.type === p.type;
                  return (
                    <Button
                      key={`han-${p.type}`}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setActiveTool({ side: 'HAN', type: p.type })}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: isSelected ? '#b91c1c !important' : '#ffffff !important',
                        color: isSelected ? '#ffffff !important' : '#b91c1c !important',
                        border: '1px solid #fca5a5 !important',
                      }}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </Box>
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
              <JanggiBoard
                board={sandboxBoard}
                playerSide={sandboxTurn}
                selectedPoint={sandboxSelectedPoint}
                lastMove={sandboxLastMove}
                onSelectPoint={handleSandboxSelectPoint}
                onMovePiece={handleSandboxMovePiece}
              />
            </Box>

            {/* Side Status Card */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  📊 실시간 대국 및 형세 판별
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: sandboxTurn === 'CHO' ? '#f0fdf4' : '#ffffff',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: sandboxTurn === 'CHO' ? '#16a34a' : '#cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803d' }}>
                      🟢 초 (楚) {sandboxTurn === 'CHO' && '◀ 착수 차례'}
                    </Typography>
                    {sandboxCheckState.choInCheck && (
                      <Chip
                        label="장군 위기!"
                        size="small"
                        color="error"
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: sandboxTurn === 'HAN' ? '#fef2f2' : '#ffffff',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: sandboxTurn === 'HAN' ? '#dc2626' : '#cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                      🔴 한 (漢) {sandboxTurn === 'HAN' && '◀ 착수 차례'}
                    </Typography>
                    {sandboxCheckState.hanInCheck && (
                      <Chip
                        label="장군 위기!"
                        size="small"
                        color="error"
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                  💡 <strong>자유 대국 & 배치 가이드:</strong>
                  <br />• <strong>대국 모드:</strong> 초/한 번갈아 기물을 클릭하여 정통 장기 룰대로
                  행마할 수 있습니다.
                  <br />• <strong>기물 배치 팔레트:</strong> 팔레트에서 원하는 기물을 선택한 후
                  장기판 좌표를 클릭하면 원하는 포지션을 자유롭게 만들어 볼 수 있습니다.
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
            장기 박보 묘수풀이 초급 핵심 5선
          </Box>
          <IconButton onClick={() => setIsCatalogOpen(false)} sx={{ color: '#64748b' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {JANGGI_BAKBO_LIST.map((prob, idx) => {
            const isCurrent = idx === selectedProblemIndex;
            return (
              <Card
                key={prob.id}
                onClick={() => handleSelectProblemIndex(idx)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isCurrent ? 'rgba(5, 150, 105, 0.08)' : '#ffffff',
                  border: '1px solid',
                  borderColor: isCurrent ? '#059669' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: 'rgba(5, 150, 105, 0.12)',
                    borderColor: '#059669',
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
                      bgcolor: 'rgba(5, 150, 105, 0.1)',
                      color: '#059669',
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
