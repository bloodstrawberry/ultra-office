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
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';

import { ChessBoard } from './ChessBoard';
import { CHESS_PUZZLE_LIST } from '../../../lib/games/chess/puzzles';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import {
  playCheckSound,
  playChessMoveSound,
  playPuzzleSolvedSound,
} from '../../../lib/games/gameSounds';
import {
  findBestChessAIMove,
  analyzeChessPosition,
  getAllLegalChessMoves,
  findMatchingChessNode,
} from '../../../lib/games/chess/solver';
import {
  parseFEN,
  isSameSquare,
  isKingInCheck,
  makeChessMove,
  squareToAlgebraic,
  createEmptyChessBoard,
} from '../../../lib/games/chess/engine';
import {
  type ChessMove,
  type ChessColor,
  type ChessPiece,
  type ChessSquare,
  type ChessPuzzle,
  type ChessPieceType,
  type ChessAIAnalysis,
  type ChessSolutionNode,
  type ChessBoard as ChessBoardType,
} from '../../../lib/games/chess/types';

type TabMode = 'puzzle' | 'sandbox';
type ChessTool = 'play' | 'erase' | { color: ChessColor; type: ChessPieceType };

const STANDARD_CHESS_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function ChessSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tabMode, setTabMode] = useState<TabMode>('puzzle');

  // ================= Puzzle Mode States =================
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<ChessPuzzle>(CHESS_PUZZLE_LIST[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [board, setBoard] = useState<ChessBoardType>(() => createEmptyChessBoard());
  const [history, setHistory] = useState<ChessBoardType[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [turn, setTurn] = useState<ChessColor>('w');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  const [currentNodeTree, setCurrentNodeTree] = useState<ChessSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<ChessAIAnalysis | null>(null);

  // ================= Sandbox Mode States =================
  const [sandboxBoard, setSandboxBoard] = useState<ChessBoardType>(
    () => parseFEN(STANDARD_CHESS_FEN).board
  );
  const [sandboxHistory, setSandboxHistory] = useState<ChessBoardType[]>([]);
  const [sandboxSelectedSquare, setSandboxSelectedSquare] = useState<ChessSquare | null>(null);
  const [sandboxLastMove, setSandboxLastMove] = useState<{
    from: ChessSquare;
    to: ChessSquare;
  } | null>(null);
  const [sandboxTurn, setSandboxTurn] = useState<ChessColor>('w');
  const [activeTool, setActiveTool] = useState<ChessTool>('play');
  const [sandboxAnalysis, setSandboxAnalysis] = useState<ChessAIAnalysis | null>(null);

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
    const { board: stdBoard } = parseFEN(STANDARD_CHESS_FEN);
    setSandboxBoard(stdBoard);
    setSandboxHistory([stdBoard]);
    setSandboxAnalysis(analyzeChessPosition(stdBoard, 'w'));
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

  // ================= Sandbox Handlers =================
  const handleSandboxResetStandard = () => {
    const { board: stdB } = parseFEN(STANDARD_CHESS_FEN);
    setSandboxBoard(stdB);
    setSandboxHistory([stdB]);
    setSandboxSelectedSquare(null);
    setSandboxLastMove(null);
    setSandboxTurn('w');
    setSandboxAnalysis(analyzeChessPosition(stdB, 'w'));
  };

  const handleSandboxClearBoard = () => {
    const empty = createEmptyChessBoard();
    setSandboxBoard(empty);
    setSandboxHistory([empty]);
    setSandboxSelectedSquare(null);
    setSandboxLastMove(null);
    setSandboxTurn('w');
    setSandboxAnalysis(null);
  };

  const handleSandboxUndo = () => {
    if (sandboxHistory.length <= 1) return;
    const nextHist = sandboxHistory.slice(0, sandboxHistory.length - 1);
    const target = nextHist[nextHist.length - 1];
    setSandboxBoard(target);
    setSandboxHistory(nextHist);
    setSandboxSelectedSquare(null);
    setSandboxLastMove(null);
    setSandboxTurn(sandboxTurn === 'w' ? 'b' : 'w');
    setSandboxAnalysis(analyzeChessPosition(target, sandboxTurn === 'w' ? 'b' : 'w'));
  };

  const handleSandboxSelectSquare = (sq: ChessSquare | null) => {
    if (activeTool === 'play') {
      setSandboxSelectedSquare(sq);
    } else if (sq) {
      if (activeTool === 'erase') {
        const nextB = sandboxBoard.map((row, r) =>
          row.map((cell, c) => (r === sq.r && c === sq.c ? null : cell))
        );
        setSandboxBoard(nextB);
        setSandboxHistory((prev) => [...prev, nextB]);
      } else {
        const newPiece: ChessPiece = {
          id: `custom-${activeTool.color}-${activeTool.type}-${Date.now()}`,
          color: activeTool.color,
          type: activeTool.type,
        };
        const nextB = sandboxBoard.map((row, r) =>
          row.map((cell, c) => (r === sq.r && c === sq.c ? newPiece : cell))
        );
        playChessMoveSound();
        setSandboxBoard(nextB);
        setSandboxHistory((prev) => [...prev, nextB]);
      }
    }
  };

  const handleSandboxMovePiece = (from: ChessSquare, to: ChessSquare) => {
    if (activeTool !== 'play') return;

    const piece = sandboxBoard[from.r][from.c];
    if (!piece || piece.color !== sandboxTurn) return;

    const targetPiece = sandboxBoard[to.r][to.c];
    if (targetPiece && targetPiece.color === sandboxTurn) return;

    playChessMoveSound();
    const nextB = makeChessMove(sandboxBoard, {
      from,
      to,
      piece,
      captured: targetPiece,
    });

    const nextTurn = sandboxTurn === 'w' ? 'b' : 'w';
    if (isKingInCheck(nextB, nextTurn)) {
      playCheckSound();
    }

    setSandboxBoard(nextB);
    setSandboxHistory((prev) => [...prev, nextB]);
    setSandboxLastMove({ from, to });
    setSandboxSelectedSquare(null);
    setSandboxTurn(nextTurn);
    setSandboxAnalysis(analyzeChessPosition(nextB, nextTurn));
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
            🎯 체스 전술 퍼즐 (초급 5선)
          </ToggleButton>
          <ToggleButton value="sandbox">
            <SportsEsportsRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
            🎮 체스 자유 대국 & 기물 배치 모드
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ================= MODE 1: PUZZLE SOLVER ================= */}
      {tabMode === 'puzzle' && (
        <>
          {/* Header & Navigation Bar */}
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
                퍼즐 목록 ({selectedProblemIndex + 1} / {CHESS_PUZZLE_LIST.length})
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
                        🎯 체스 전술 정답 수순 및 표기
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
                🎮 체스 자유 대국 & 기물 배치장
              </Typography>

              <Button
                size="small"
                variant="contained"
                startIcon={<RestartAltRoundedIcon sx={{ color: '#ffffff !important' }} />}
                onClick={handleSandboxResetStandard}
                sx={{
                  fontWeight: 800,
                  backgroundColor: '#0284c7 !important',
                  color: '#ffffff !important',
                  '&:hover': { backgroundColor: '#0369a1 !important' },
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
                    activeTool === 'play' ? '#0284c7 !important' : '#ffffff !important',
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
              {/* White Palette */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: '#0284c7', minWidth: 65 }}
                >
                  ⚪ 백 (White):
                </Typography>
                {(
                  [
                    { type: 'k', label: '♔ King' },
                    { type: 'q', label: '♕ Queen' },
                    { type: 'r', label: '♖ Rook' },
                    { type: 'b', label: '♗ Bishop' },
                    { type: 'n', label: '♘ Knight' },
                    { type: 'p', label: '♙ Pawn' },
                  ] as const
                ).map((p) => {
                  const isSelected =
                    typeof activeTool === 'object' &&
                    activeTool.color === 'w' &&
                    activeTool.type === p.type;
                  return (
                    <Button
                      key={`w-${p.type}`}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setActiveTool({ color: 'w', type: p.type })}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: isSelected ? '#0284c7 !important' : '#ffffff !important',
                        color: isSelected ? '#ffffff !important' : '#0284c7 !important',
                        border: '1px solid #bae6fd !important',
                      }}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </Box>

              {/* Black Palette */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: '#0f172a', minWidth: 65 }}
                >
                  ⚫ 흑 (Black):
                </Typography>
                {(
                  [
                    { type: 'k', label: '♚ King' },
                    { type: 'q', label: '♛ Queen' },
                    { type: 'r', label: '♜ Rook' },
                    { type: 'b', label: '♝ Bishop' },
                    { type: 'n', label: '♞ Knight' },
                    { type: 'p', label: '♟ Pawn' },
                  ] as const
                ).map((p) => {
                  const isSelected =
                    typeof activeTool === 'object' &&
                    activeTool.color === 'b' &&
                    activeTool.type === p.type;
                  return (
                    <Button
                      key={`b-${p.type}`}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setActiveTool({ color: 'b', type: p.type })}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: isSelected ? '#0f172a !important' : '#ffffff !important',
                        color: isSelected ? '#ffffff !important' : '#0f172a !important',
                        border: '1px solid #cbd5e1 !important',
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
            {/* Board & Eval Bar */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {sandboxAnalysis && (
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
                  title={`Evaluation: ${sandboxAnalysis.evaluationScore > 0 ? `+${sandboxAnalysis.evaluationScore.toFixed(1)}` : sandboxAnalysis.evaluationScore.toFixed(1)}`}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: `${Math.max(5, Math.min(95, 50 + sandboxAnalysis.evaluationScore * 5))}%`,
                      background: '#0284c7',
                      transition: 'height 0.3s ease',
                    }}
                  />
                </Box>
              )}

              <ChessBoard
                board={sandboxBoard}
                playerColor={sandboxTurn}
                selectedSquare={sandboxSelectedSquare}
                lastMove={sandboxLastMove}
                onSelectSquare={handleSandboxSelectSquare}
                onMovePiece={handleSandboxMovePiece}
              />
            </Box>

            {/* Side Status Card */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  📊 실시간 체스 대국 현황
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: sandboxTurn === 'w' ? '#f0f9ff' : '#ffffff',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: sandboxTurn === 'w' ? '#0284c7' : '#cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369a1' }}>
                      ⚪ 백 (White) {sandboxTurn === 'w' && '◀ 행마 차례'}
                    </Typography>
                    {sandboxAnalysis?.isWhiteInCheck && (
                      <Chip
                        label="체크 위기!"
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
                      bgcolor: sandboxTurn === 'b' ? '#f1f5f9' : '#ffffff',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: sandboxTurn === 'b' ? '#0f172a' : '#cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      ⚫ 흑 (Black) {sandboxTurn === 'b' && '◀ 행마 차례'}
                    </Typography>
                    {sandboxAnalysis?.isBlackInCheck && (
                      <Chip
                        label="체크 위기!"
                        size="small"
                        color="error"
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                  💡 <strong>자유 대국 & 전술 분석 가이드:</strong>
                  <br />• <strong>대국 모드:</strong> 백/흑 번갈아 기물을 클릭하여 정통 체스 룰대로
                  행마할 수 있습니다.
                  <br />• <strong>기물 배치 팔레트:</strong> 백/흑의 원하는 기물을 선택하여 보드판
                  위에 자유롭게 올려놓고 실시간 AI 평가 바(Eval Bar)로 유불리를 점검해보세요.
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
            체스 전술 초급 핵심 5선
          </Box>
          <IconButton onClick={() => setIsCatalogOpen(false)} sx={{ color: '#64748b' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {CHESS_PUZZLE_LIST.map((prob, idx) => {
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
