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
  type JanggiAIAnalysis,
  type JanggiBakboProblem,
  type JanggiSolutionNode,
  type JanggiBoard as JanggiBoardType,
} from '../../../lib/games/janggi/types';

export function JanggiSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<JanggiBakboProblem>(JANGGI_BAKBO_LIST[0]);

  // Catalog Dialog & Filter states
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Board state & undo history
  const [board, setBoard] = useState<JanggiBoardType>(() => createEmptyJanggiBoard());
  const [history, setHistory] = useState<JanggiBoardType[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<JanggiPoint | null>(null);
  const [lastMove, setLastMove] = useState<{ from: JanggiPoint; to: JanggiPoint } | null>(null);
  const [turn, setTurn] = useState<JanggiSide>('CHO');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  // Solution state
  const [currentNodeTree, setCurrentNodeTree] = useState<JanggiSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<JanggiAIAnalysis | null>(null);

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

    // 1. Check if Han is in Check / Checkmate
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

    // 2. Check match against solution tree
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

  const filteredProblems = useMemo(() => {
    return JANGGI_BAKBO_LIST.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objective.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  if (!hasLoaded) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* 1. Header & Navigation Bar */}
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
            장기 박보 & 묘수풀이 AI 스튜디오
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
              '&:hover': {
                background: 'rgba(5, 150, 105, 0.12)',
              },
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
            label={`${currentProblem.targetMoves}수 외통`}
            sx={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', fontWeight: 700 }}
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
            variant="outlined"
            startIcon={<LightbulbRoundedIcon sx={{ color: '#d97706 !important' }} />}
            onClick={() => setShowHint(!showHint)}
            sx={{
              fontWeight: 800,
              backgroundColor: '#fef3c7 !important',
              color: '#92400e !important',
              border: '1px solid #f59e0b !important',
              '&:hover': {
                backgroundColor: '#fde68a !important',
                color: '#78350f !important',
              },
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
              '&:hover': {
                backgroundColor: '#e2e8f0 !important',
                color: '#0f172a !important',
              },
            }}
          >
            한 수 무르기
          </Button>

          <IconButton onClick={handleReset} sx={{ color: '#64748b' }} title="문제 초기화">
            <ReplayRoundedIcon />
          </IconButton>
        </Box>
      </Card>

      {/* 2. Main Play Area */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Left: Janggi Board */}
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

        {/* Right: Problem Details & Feedback */}
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

          {/* 🎯 Explicit Solution Text Card */}
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
                  color="success"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={handleAutoPlaySolution}
                  sx={{ fontWeight: 800 }}
                >
                  정답 바로 착수하기
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

          {/* Theory & Explanation Card */}
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

      {/* 3. Problem Catalog Dialog */}
      <Dialog
        open={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        maxWidth="md"
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
            장기 박보 & 묘수풀이 컬렉션 (총 {JANGGI_BAKBO_LIST.length}선)
          </Box>
          <IconButton onClick={() => setIsCatalogOpen(false)} sx={{ color: '#64748b' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Search & Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="박보 제목 또는 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 200,
                bgcolor: '#f8fafc',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {['전체', '외통박보', '양차공격', '마포연합', '연장군 박보', '상길돌파'].map(
                (cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    onClick={() => setSelectedCategory(cat)}
                    sx={{
                      fontWeight: 700,
                      bgcolor: selectedCategory === cat ? '#059669' : '#f1f5f9',
                      color: selectedCategory === cat ? '#ffffff' : '#475569',
                      '&:hover': {
                        bgcolor: selectedCategory === cat ? '#047857' : '#e2e8f0',
                      },
                    }}
                  />
                )
              )}
            </Box>
          </Box>

          {/* Problem Grid */}
          <Box sx={{ maxHeight: 450, overflowY: 'auto', pr: 1 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              {filteredProblems.map((prob) => {
                const idx = JANGGI_BAKBO_LIST.findIndex((p) => p.id === prob.id);
                const isCurrent = idx === selectedProblemIndex;
                return (
                  <Card
                    key={prob.id}
                    onClick={() => handleSelectProblemIndex(idx)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      bgcolor: isCurrent ? 'rgba(5, 150, 105, 0.08)' : '#ffffff',
                      border: '1px solid',
                      borderColor: isCurrent ? '#059669' : '#e2e8f0',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {prob.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={prob.difficulty}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(217, 119, 6, 0.1)',
                          color: '#d97706',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      {prob.objective}
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
