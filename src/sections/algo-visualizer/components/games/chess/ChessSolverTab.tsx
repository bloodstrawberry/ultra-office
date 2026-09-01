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

import { ChessBoard } from './ChessBoard';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import { CHESS_PUZZLE_LIST } from '../../../lib/games/chess/puzzles';
import {
  playCheckSound,
  playChessMoveSound,
  playPuzzleSolvedSound,
  playPuzzleFailedSound,
} from '../../../lib/games/gameSounds';
import {
  parseFEN,
  isKingInCheck,
  makeChessMove,
  isSameSquare,
  squareToAlgebraic,
  createEmptyChessBoard,
} from '../../../lib/games/chess/engine';
import {
  analyzeChessPosition,
  findBestChessAIMove,
  getAllLegalChessMoves,
  findMatchingChessNode,
} from '../../../lib/games/chess/solver';
import {
  type ChessColor,
  type ChessMove,
  type ChessSquare,
  type ChessPuzzle,
  type ChessAIAnalysis,
  type ChessSolutionNode,
  type ChessBoard as ChessBoardType,
} from '../../../lib/games/chess/types';

export function ChessSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<ChessPuzzle>(CHESS_PUZZLE_LIST[0]);

  // Catalog Dialog & Filter states
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Board state & undo history
  const [board, setBoard] = useState<ChessBoardType>(() => createEmptyChessBoard());
  const [history, setHistory] = useState<ChessBoardType[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [turn, setTurn] = useState<ChessColor>('w');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  // Solution state
  const [currentNodeTree, setCurrentNodeTree] = useState<ChessSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<ChessAIAnalysis | null>(null);

  const setupProblem = useCallback((problem: ChessPuzzle) => {
    const { board: initialBoard, activeColor } = parseFEN(problem.fen);

    setBoard(initialBoard);
    setHistory([initialBoard]);
    setSelectedSquare(null);
    setLastMove(null);
    setTurn(activeColor);
    setIsAIMoving(false);
    setCurrentNodeTree(problem.solutionTree);
    setStatusMessage(problem.objective);
    setIsSolved(false);
    setIsFailed(false);
    setShowHint(false);
    setShowSolution(false);

    const analysis = analyzeChessPosition(initialBoard, activeColor);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupProblem(CHESS_PUZZLE_LIST[0]);
  }, [setupProblem]);

  const handleSelectProblemIndex = (index: number) => {
    if (index >= 0 && index < CHESS_PUZZLE_LIST.length) {
      setSelectedProblemIndex(index);
      const prob = CHESS_PUZZLE_LIST[index];
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
    if (selectedProblemIndex < CHESS_PUZZLE_LIST.length - 1) {
      handleSelectProblemIndex(selectedProblemIndex + 1);
    }
  };

  const handleRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * CHESS_PUZZLE_LIST.length);
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
    setSelectedSquare(null);
    setLastMove(null);
    setTurn('w');
    setIsSolved(false);
    setIsFailed(false);
    setStatusMessage('수를 물렀습니다. 백(White)의 다음 행마를 선택하세요.');

    const analysis = analyzeChessPosition(targetBoard, 'w');
    setAiAnalysis(analysis);
  };

  const handleMovePiece = (from: ChessSquare, to: ChessSquare) => {
    if (isSolved || isFailed || isAIMoving || turn !== 'w') return;

    const piece = board[from.r][from.c];
    if (!piece || piece.color !== 'w') return;

    const targetPiece = board[to.r][to.c];
    if (targetPiece && targetPiece.color === 'w') return;

    const moveObj: ChessMove = {
      from,
      to,
      piece,
      captured: targetPiece,
    };

    const nextBoard = makeChessMove(board, moveObj);
    playChessMoveSound();

    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setLastMove({ from, to });
    setSelectedSquare(null);
    setTurn('b');

    // Check check / checkmate
    const isBlackInCheck = isKingInCheck(nextBoard, 'b');
    if (isBlackInCheck) {
      playCheckSound();
    }

    const blackLegalMoves = getAllLegalChessMoves(nextBoard, 'b');

    if (blackLegalMoves.length === 0) {
      if (isBlackInCheck) {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage('체크메이트! 백(White)의 완벽한 승리입니다!');
      } else {
        setIsFailed(true);
        setStatusMessage('스테일메이트 (Stalemate): 무승부입니다.');
      }
      return;
    }

    // Match solution tree
    const matchingNode = findMatchingChessNode(currentNodeTree, from, to);

    if (matchingNode) {
      if (matchingNode.comment) {
        setStatusMessage(matchingNode.comment);
      }

      const scriptedAI = matchingNode.aiResponse;
      const isScriptedValid =
        scriptedAI &&
        blackLegalMoves.some(
          (lm: ChessMove) =>
            isSameSquare(lm.from, scriptedAI.from) && isSameSquare(lm.to, scriptedAI.to)
        );

      if (isScriptedValid && scriptedAI) {
        setIsAIMoving(true);
        setTimeout(() => {
          const aiPiece = nextBoard[scriptedAI.from.r][scriptedAI.from.c];
          if (aiPiece) {
            playChessMoveSound();
            const aiBoard = makeChessMove(nextBoard, {
              from: scriptedAI.from,
              to: scriptedAI.to,
              piece: aiPiece,
              captured: nextBoard[scriptedAI.to.r][scriptedAI.to.c],
            });
            setBoard(aiBoard);
            setHistory((prev) => [...prev, aiBoard]);
            setLastMove({ from: scriptedAI.from, to: scriptedAI.to });
            setTurn('w');
            setIsAIMoving(false);

            if (matchingNode.children && matchingNode.children.length > 0) {
              setCurrentNodeTree(matchingNode.children);
            } else {
              setIsSolved(true);
              playPuzzleSolvedSound();
              setStatusMessage('축하합니다! 체스 퍼즐을 완벽하게 해결했습니다.');
            }
          }
        }, 500);
      } else {
        if (
          !matchingNode.aiResponse &&
          (!matchingNode.children || matchingNode.children.length === 0)
        ) {
          setIsSolved(true);
          playPuzzleSolvedSound();
          setStatusMessage(matchingNode.comment || '체크메이트 승리!');
        } else {
          triggerDynamicAIDefense(nextBoard);
        }
      }
    } else {
      triggerDynamicAIDefense(nextBoard);
    }

    const analysis = analyzeChessPosition(nextBoard, 'w');
    setAiAnalysis(analysis);
  };

  const triggerDynamicAIDefense = (currentBoard: ChessBoardType) => {
    setIsAIMoving(true);
    setStatusMessage('백(White) 행마 완료. 흑(Black) AI가 최선의 응수를 수읽기 중입니다...');

    setTimeout(() => {
      const { move: aiMove, isCheckmate, reason } = findBestChessAIMove(currentBoard, 'b');

      if (isCheckmate || !aiMove) {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage('체크메이트! 흑(Black)이 응수할 수 없어 백이 승리했습니다!');
      } else {
        playChessMoveSound();
        const aiBoard = makeChessMove(currentBoard, aiMove);
        setBoard(aiBoard);
        setHistory((prev) => [...prev, aiBoard]);
        setLastMove({ from: aiMove.from, to: aiMove.to });
        setStatusMessage(
          `흑이 ${squareToAlgebraic(aiMove.to)}로 응수했습니다 (${reason}). 다음 수를 두세요!`
        );
      }

      setIsAIMoving(false);
      setTurn('w');
    }, 500);
  };

  const handleAutoPlaySolution = () => {
    if (isAIMoving) return;
    if (currentNodeTree.length === 0 || isSolved || isFailed || turn !== 'w') {
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

  const getChessSolutionSteps = (problem: ChessPuzzle) => {
    const steps: string[] = [];
    const traverse = (nodes: ChessSolutionNode[], stepNum: number) => {
      if (!nodes || nodes.length === 0) return;
      const node = nodes[0];
      steps.push(
        `${stepNum}수: 백(White) ${node.san || `${squareToAlgebraic(node.from)} ➔ ${squareToAlgebraic(node.to)}`}`
      );
      if (node.aiResponse) {
        steps.push(
          `${stepNum + 1}수: 흑(Black) ${node.aiResponse.san || `${squareToAlgebraic(node.aiResponse.from)} ➔ ${squareToAlgebraic(node.aiResponse.to)}`}`
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
    return CHESS_PUZZLE_LIST.filter((p) => {
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
            <AutoAwesomeRoundedIcon sx={{ color: '#0284c7' }} />
            체스 전술 & 체크메이트 AI 스튜디오
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
              '&:hover': {
                background: 'rgba(2, 132, 199, 0.12)',
              },
            }}
          >
            전술 목록 ({selectedProblemIndex + 1} / {CHESS_PUZZLE_LIST.length})
          </Button>

          <Chip
            size="small"
            label={currentProblem.category}
            sx={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 }}
          />
          <Chip
            size="small"
            label={`난이도: ${currentProblem.difficulty}`}
            sx={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <IconButton
            onClick={handlePrevProblem}
            disabled={selectedProblemIndex === 0}
            sx={{ color: '#64748b' }}
            title="이전 퍼즐"
          >
            <NavigateBeforeRoundedIcon />
          </IconButton>

          <IconButton
            onClick={handleNextProblem}
            disabled={selectedProblemIndex === CHESS_PUZZLE_LIST.length - 1}
            sx={{ color: '#64748b' }}
            title="다음 퍼즐"
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
              '&:hover': {
                backgroundColor: '#e2e8f0 !important',
                color: '#0f172a !important',
              },
            }}
          >
            한 수 무르기
          </Button>

          <IconButton onClick={handleReset} sx={{ color: '#64748b' }} title="퍼즐 초기화">
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
        {/* Left: Chess Board & Evaluation Bar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {aiAnalysis && (
              <Box
                sx={{
                  width: 18,
                  height: 432,
                  background: '#f1f5f9',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
                title={`Evaluation: ${aiAnalysis.evaluationScore > 0 ? `+${aiAnalysis.evaluationScore.toFixed(1)}` : aiAnalysis.evaluationScore.toFixed(1)}`}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: `${Math.max(5, Math.min(95, 50 + aiAnalysis.evaluationScore * 5))}%`,
                    background: '#0284c7',
                    transition: 'height 0.3s ease',
                  }}
                />
              </Box>
            )}

            <ChessBoard
              board={board}
              playerColor="w"
              selectedSquare={selectedSquare}
              lastMove={lastMove}
              disabled={isSolved || isFailed || isAIMoving}
              onSelectSquare={setSelectedSquare}
              onMovePiece={handleMovePiece}
            />
          </Box>

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
          {/* Status Alert Card */}
          <Card
            sx={{
              p: 2.5,
              background: isSolved
                ? '#f0fdf4'
                : isFailed
                  ? '#fef2f2'
                  : isAIMoving
                    ? '#faf5ff'
                    : '#ffffff',
              border: '1px solid',
              borderColor: isSolved
                ? '#22c55e'
                : isFailed
                  ? '#ef4444'
                  : isAIMoving
                    ? '#a855f7'
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
                  ? '체크메이트 승리!'
                  : isFailed
                    ? '실패'
                    : isAIMoving
                      ? '흑(Black) 수비 수읽기 중...'
                      : '백선(White) - 기물을 선택하여 이동하세요'}
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
                    🎯 체스 전술 정답 수순 및 표기
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
                {getChessSolutionSteps(currentProblem).map((s, idx) => (
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
                💡 <strong>핵심 전술 해설:</strong> {currentProblem.hint}
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
              <HelpOutlineRoundedIcon sx={{ color: '#0284c7', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                체스 이론 & 전술 해설
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
              {currentProblem.explanation}
            </Typography>
          </Card>

          {/* CS Inspector */}
          {aiAnalysis && (
            <GameAlgorithmInspector
              gameTitle="체스 (Chess)"
              csConcept={currentProblem.csConcept}
              searchNodes={aiAnalysis.searchNodesEvaluated}
              searchDepth={aiAnalysis.searchDepth}
              timeMs={aiAnalysis.timeMs}
              evalScore={aiAnalysis.evaluationScore}
              algorithmName="체스 Minimax & Alpha-Beta 가지치기"
              complexityInfo={{
                time: 'O(b^d) → Alpha-Beta 탐색',
                space: 'O(d) 스택 트리',
                branchingFactor: 'b ≈ 35 (체스 평균 분기수)',
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
            체스 전술 & 체크메이트 퍼즐 컬렉션 (총 {CHESS_PUZZLE_LIST.length}선)
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
              placeholder="체스 퍼즐 검색..."
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
              {['전체', '체크메이트', '백랭크', '포크', '핀', '디스커버드', '유명 기보'].map(
                (cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    onClick={() => setSelectedCategory(cat)}
                    sx={{
                      fontWeight: 700,
                      bgcolor: selectedCategory === cat ? '#0284c7' : '#f1f5f9',
                      color: selectedCategory === cat ? '#ffffff' : '#475569',
                      '&:hover': {
                        bgcolor: selectedCategory === cat ? '#0369a1' : '#e2e8f0',
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
                const idx = CHESS_PUZZLE_LIST.findIndex((p) => p.id === prob.id);
                const isCurrent = idx === selectedProblemIndex;
                return (
                  <Card
                    key={prob.id}
                    onClick={() => handleSelectProblemIndex(idx)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      bgcolor: isCurrent ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                      border: '1px solid',
                      borderColor: isCurrent ? '#0284c7' : '#e2e8f0',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
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
                          bgcolor: 'rgba(124, 58, 237, 0.1)',
                          color: '#7c3aed',
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
