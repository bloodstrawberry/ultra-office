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
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';

import { BadukBoard } from './BadukBoard';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import { BADUK_PUZZLE_LIST } from '../../../lib/games/baduk/puzzles';
import {
  playBadukStoneSound,
  playPuzzleSolvedSound,
  playPuzzleFailedSound,
} from '../../../lib/games/gameSounds';
import { playMove, createEmptyBoard, formatBadukCoord } from '../../../lib/games/baduk/engine';
import {
  analyzeBadukPosition,
  findBestBadukAIMove,
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

export function BadukSolverTab() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<BadukProblem>(BADUK_PUZZLE_LIST[0]);

  // Catalog Dialog & Filter states
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('전체');

  // Board state & move history
  const [board, setBoard] = useState<BoardGrid>(() => createEmptyBoard(9));
  const [history, setHistory] = useState<BoardGrid[]>([]);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [turn, setTurn] = useState<StoneColor>('B');
  const [isAIMoving, setIsAIMoving] = useState<boolean>(false);

  // Solution tracking
  const [currentNodeTree, setCurrentNodeTree] = useState<BadukSolutionNode[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Visualizer overlays
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

    const analysis = analyzeBadukPosition(newBoard, problem.playerColor, problem.focusRegion);
    setAiAnalysis(analysis);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    setupProblem(BADUK_PUZZLE_LIST[0]);
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
    if (isSolved || isAIMoving || turn !== 'B' || currentNodeTree.length === 0) return;
    const targetNode = currentNodeTree[0];
    if (targetNode) {
      handlePlayMove(targetNode.move.r, targetNode.move.c);
    }
  };

  // Filtered problem list for catalog dialog
  const filteredProblems = useMemo(() => {
    return BADUK_PUZZLE_LIST.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objective.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === '전체' || p.difficulty === selectedDifficulty;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (!hasLoaded) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* 1. Top Header & Navigation Bar */}
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
            바둑 사활 & 기보 AI 스튜디오
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
            문제 목록 ({selectedProblemIndex + 1} / {BADUK_PUZZLE_LIST.length})
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
            color="success"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={handleAutoPlaySolution}
            disabled={isSolved || isAIMoving || turn !== 'B' || currentNodeTree.length === 0}
            sx={{ fontWeight: 700 }}
          >
            정답 한 수
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<LightbulbRoundedIcon />}
            onClick={() => setShowHint(!showHint)}
            sx={{ fontWeight: 700 }}
          >
            사활 힌트
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
        {/* Left: Baduk Board */}
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

          {/* Toggle controls */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={showLiberties ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<LayersRoundedIcon />}
              onClick={() => setShowLiberties(!showLiberties)}
              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              활로(Liberties) 표시
            </Button>
            <Button
              size="small"
              variant={showInfluence ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={<InvertColorsRoundedIcon />}
              onClick={() => setShowInfluence(!showInfluence)}
              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              세력 히트맵
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
                color="success"
                size="small"
                startIcon={<CheckCircleRoundedIcon />}
                onClick={handleAutoPlaySolution}
                disabled={isSolved || isAIMoving || turn !== 'B' || currentNodeTree.length === 0}
                sx={{ fontWeight: 700 }}
              >
                정답 한 수 두기
              </Button>

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
                  사활 힌트 가이드
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
                바둑 이론 & 맥점 해설
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
              {currentProblem.explanation}
            </Typography>
          </Card>

          {/* CS Inspector */}
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
            바둑 사활 & 기보 문제 컬렉션 (총 {BADUK_PUZZLE_LIST.length}선)
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
              placeholder="문제 제목 또는 키워드 검색..."
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

            {/* Category Filter Chips */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {['전체', '사활', '맥점', '수상전', '환격', '귀삼수', '축/장문'].map((cat) => (
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
              ))}
            </Box>
          </Box>

          {/* Problem Cards Grid */}
          <Box sx={{ maxHeight: 450, overflowY: 'auto', pr: 1 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              {filteredProblems.map((prob) => {
                const idx = BADUK_PUZZLE_LIST.findIndex((p) => p.id === prob.id);
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
