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
  createEmptyChessBoard,
} from '../../../lib/games/chess/engine';
import {
  minimaxChess,
  analyzeChessPosition,
  findMatchingChessNode,
} from '../../../lib/games/chess/solver';
import {
  type ChessSquare,
  type ChessPuzzle,
  type ChessAIAnalysis,
  type ChessSolutionNode,
  type ChessBoard as ChessBoardType,
} from '../../../lib/games/chess/types';

export function ChessSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle>(CHESS_PUZZLE_LIST[0]);

  // Catalog Dialog & Search state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Board state & history
  const [board, setBoard] = useState<ChessBoardType>(() => createEmptyChessBoard());
  const [history, setHistory] = useState<ChessBoardType[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  // Solution tracking
  const [currentNodeTree, setCurrentNodeTree] = useState<ChessSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<ChessAIAnalysis | null>(null);

  const setupPuzzle = useCallback((puzzle: ChessPuzzle) => {
    const { board: parsedBoard } = parseFEN(puzzle.fen);

    setBoard(parsedBoard);
    setHistory([parsedBoard]);
    setSelectedSquare(null);
    setLastMove(null);
    setIsAIMoving(false);
    setCurrentNodeTree(puzzle.solutionTree);
    setStatusMessage(puzzle.objective);
    setIsSolved(false);
    setIsFailed(false);
    setShowHint(false);

    const analysis = analyzeChessPosition(parsedBoard, puzzle.playerColor);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupPuzzle(CHESS_PUZZLE_LIST[0]);
  }, [setupPuzzle]);

  const handleSelectPuzzleIndex = (index: number) => {
    if (index >= 0 && index < CHESS_PUZZLE_LIST.length) {
      setSelectedPuzzleIndex(index);
      const pz = CHESS_PUZZLE_LIST[index];
      setCurrentPuzzle(pz);
      setupPuzzle(pz);
      setIsCatalogOpen(false);
    }
  };

  const handlePrevPuzzle = () => {
    if (selectedPuzzleIndex > 0) {
      handleSelectPuzzleIndex(selectedPuzzleIndex - 1);
    }
  };

  const handleNextPuzzle = () => {
    if (selectedPuzzleIndex < CHESS_PUZZLE_LIST.length - 1) {
      handleSelectPuzzleIndex(selectedPuzzleIndex + 1);
    }
  };

  const handleRandomPuzzle = () => {
    const randomIndex = Math.floor(Math.random() * CHESS_PUZZLE_LIST.length);
    handleSelectPuzzleIndex(randomIndex);
  };

  const handleReset = () => {
    setupPuzzle(currentPuzzle);
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
    setIsSolved(false);
    setIsFailed(false);
    setStatusMessage('수를 물렀습니다. 다른 전술 수를 시도해보세요.');

    const analysis = analyzeChessPosition(targetBoard, currentPuzzle.playerColor);
    setAiAnalysis(analysis);
  };

  const handleMovePiece = (from: ChessSquare, to: ChessSquare) => {
    if (isSolved || isFailed || isAIMoving) return;

    const piece = board[from.r][from.c];
    if (!piece || piece.color !== 'w') return;

    const nextBoard = makeChessMove(board, {
      from,
      to,
      piece,
      captured: board[to.r][to.c],
    });

    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setLastMove({ from, to });

    if (isKingInCheck(nextBoard, 'b')) {
      playCheckSound();
    }

    // Check match against solution tree
    const matchingNode = findMatchingChessNode(currentNodeTree, from, to);

    if (matchingNode) {
      if (matchingNode.comment) {
        setStatusMessage(matchingNode.comment);
      }

      if (matchingNode.aiResponse) {
        setIsAIMoving(true);
        const aiMove = matchingNode.aiResponse;
        setTimeout(() => {
          const aiPiece = nextBoard[aiMove.from.r][aiMove.from.c];
          if (aiPiece) {
            playChessMoveSound();
            const aiBoard = makeChessMove(nextBoard, {
              from: aiMove.from,
              to: aiMove.to,
              piece: aiPiece,
              captured: nextBoard[aiMove.to.r][aiMove.to.c],
            });
            setBoard(aiBoard);
            setHistory((prev) => [...prev, aiBoard]);
            setLastMove({ from: aiMove.from, to: aiMove.to });
            setIsAIMoving(false);

            if (aiMove.comment) {
              setStatusMessage(aiMove.comment);
            }
            if (matchingNode.children && matchingNode.children.length > 0) {
              setCurrentNodeTree(matchingNode.children);
            } else {
              setIsSolved(true);
              playPuzzleSolvedSound();
              setStatusMessage('체크메이트! 퍼즐을 완벽하게 완수했습니다.');
            }
          } else {
            setIsAIMoving(false);
          }
        }, 450);
      } else {
        setIsSolved(true);
        playPuzzleSolvedSound();
        setStatusMessage(matchingNode.comment || '정답입니다! Brilliant Move !!');
      }
    } else {
      setIsAIMoving(true);
      setStatusMessage('백 착수 완료. 흑(Black) AI가 최선의 응수를 계산 중입니다...');

      setTimeout(() => {
        const stats = { nodes: 0 };
        const { bestMove: aiMove } = minimaxChess(
          nextBoard,
          2,
          -Infinity,
          Infinity,
          true,
          'b',
          stats
        );

        if (aiMove) {
          playChessMoveSound();
          const aiBoard = makeChessMove(nextBoard, aiMove);
          setBoard(aiBoard);
          setHistory((prev) => [...prev, aiBoard]);
          setLastMove({ from: aiMove.from, to: aiMove.to });
          setStatusMessage('흑이 응수했습니다. [한 수 무르기] 또는 다음 수를 착수하세요!');
        } else {
          setIsSolved(true);
          playPuzzleSolvedSound();
          setStatusMessage('체크메이트! 흑에게 남은 합법적 수가 없어 백이 승리했습니다.');
        }

        setIsAIMoving(false);
      }, 450);
    }

    const analysis = analyzeChessPosition(nextBoard, currentPuzzle.playerColor);
    setAiAnalysis(analysis);
  };

  const filteredPuzzles = useMemo(() => {
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
            <AutoAwesomeRoundedIcon sx={{ color: '#7c3aed' }} />
            체스 전술 & 퍼즐풀이 AI 스튜디오
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ListAltRoundedIcon />}
            onClick={() => setIsCatalogOpen(true)}
            sx={{
              fontWeight: 700,
              color: '#7c3aed',
              borderColor: 'rgba(124, 58, 237, 0.4)',
              background: 'rgba(124, 58, 237, 0.06)',
              '&:hover': {
                background: 'rgba(124, 58, 237, 0.12)',
              },
            }}
          >
            퍼즐 목록 ({selectedPuzzleIndex + 1} / {CHESS_PUZZLE_LIST.length})
          </Button>

          <Chip
            size="small"
            label={currentPuzzle.category}
            sx={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', fontWeight: 700 }}
          />
          <Chip
            size="small"
            label="White to move (백선)"
            sx={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <IconButton
            onClick={handlePrevPuzzle}
            disabled={selectedPuzzleIndex === 0}
            sx={{ color: '#64748b' }}
            title="이전 문제"
          >
            <NavigateBeforeRoundedIcon />
          </IconButton>

          <IconButton
            onClick={handleNextPuzzle}
            disabled={selectedPuzzleIndex === CHESS_PUZZLE_LIST.length - 1}
            sx={{ color: '#64748b' }}
            title="다음 문제"
          >
            <NavigateNextRoundedIcon />
          </IconButton>

          <IconButton onClick={handleRandomPuzzle} sx={{ color: '#d97706' }} title="랜덤 퍼즐">
            <ShuffleRoundedIcon />
          </IconButton>

          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<LightbulbRoundedIcon />}
            onClick={() => setShowHint(!showHint)}
            sx={{ fontWeight: 700 }}
          >
            전술 힌트
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<UndoRoundedIcon />}
            onClick={handleUndo}
            disabled={history.length <= 1 || isAIMoving}
            sx={{ fontWeight: 700 }}
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
        {/* Left: Chess Board & Evaluation Bar */}
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
                <PlayArrowRoundedIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: isSolved ? '#16a34a' : isFailed ? '#dc2626' : '#0f172a',
                }}
              >
                {isSolved
                  ? '체크메이트 성공!'
                  : isFailed
                    ? '실패'
                    : isAIMoving
                      ? '흑(Black) AI 수읽기 중...'
                      : '백선(White to move) - 기물을 선택하여 이동하세요'}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#334155', fontWeight: 600, mb: 1.5 }}>
              {statusMessage}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<UndoRoundedIcon />}
                onClick={handleUndo}
                disabled={history.length <= 1 || isAIMoving}
                sx={{ fontWeight: 700, borderColor: '#cbd5e1', color: '#475569' }}
              >
                한 수 무르기
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ReplayRoundedIcon />}
                onClick={handleReset}
                sx={{ fontWeight: 700 }}
              >
                처음부터 다시하기
              </Button>
            </Box>
          </Card>

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
                {currentPuzzle.hint}
              </Typography>
            </Card>
          )}

          {/* Theory & Explanation */}
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
              <HelpOutlineRoundedIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                체스 전술 해설
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
              {currentPuzzle.explanation}
            </Typography>
          </Card>

          {/* CS Inspector */}
          {aiAnalysis && (
            <GameAlgorithmInspector
              gameTitle="체스 (Chess)"
              csConcept={currentPuzzle.csConcept}
              searchNodes={aiAnalysis.searchNodesEvaluated}
              searchDepth={aiAnalysis.searchDepth}
              timeMs={aiAnalysis.timeMs}
              evalScore={aiAnalysis.evaluationScore}
              algorithmName="Piece-Square Tables & Alpha-Beta"
              complexityInfo={{
                time: 'O(b^(d/2)) with MVV-LVA',
                space: 'O(d) ply',
                branchingFactor: 'b ≈ 30~35 (Shannon Number)',
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
            체스 전술 & 퍼즐 컬렉션 (총 {CHESS_PUZZLE_LIST.length}선)
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
              placeholder="전술 제목 또는 키워드 검색..."
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
              {[
                '전체',
                '백랭크 메이트',
                '질식 메이트',
                '로열 포크',
                '오페라 메이트',
                '그리스의 선물',
                '체크메이트',
                '포크/스큐어',
              ].map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  clickable
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontWeight: 700,
                    bgcolor: selectedCategory === cat ? '#7c3aed' : '#f1f5f9',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    '&:hover': {
                      bgcolor: selectedCategory === cat ? '#6d28d9' : '#e2e8f0',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Problem Grid */}
          <Box sx={{ maxHeight: 450, overflowY: 'auto', pr: 1 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              {filteredPuzzles.map((prob) => {
                const idx = CHESS_PUZZLE_LIST.findIndex((p) => p.id === prob.id);
                const isCurrent = idx === selectedPuzzleIndex;
                return (
                  <Card
                    key={prob.id}
                    onClick={() => handleSelectPuzzleIndex(idx)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      bgcolor: isCurrent ? 'rgba(124, 58, 237, 0.08)' : '#ffffff',
                      border: '1px solid',
                      borderColor: isCurrent ? '#7c3aed' : '#e2e8f0',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                      '&:hover': {
                        bgcolor: 'rgba(124, 58, 237, 0.12)',
                        borderColor: '#7c3aed',
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
