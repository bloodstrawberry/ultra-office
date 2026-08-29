'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

import {
  playCompareSound,
  playSwapSound,
  playSuccessFanfare,
  playFoundSound,
} from '../../lib/sound';
import { DATA_STRUCTURES } from '../../lib/data-structures/registry';

export function ChallengeTab() {
  const [activeGame, setActiveGame] = useState<'sortPuzzle' | 'mazeRunner' | 'dailyQuiz'>(
    'sortPuzzle'
  );

  // ==========================================
  // 1. Sort Puzzle State
  // ==========================================
  const [puzzleArray, setPuzzleArray] = useState<number[]>([45, 12, 88, 32, 65, 20]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [swapCount, setSwapCount] = useState<number>(0);
  const [isSortedSuccess, setIsSortedSuccess] = useState<boolean>(false);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const initPuzzle = () => {
    const randoms = Array.from({ length: 6 }, () => Math.floor(Math.random() * 85) + 15);
    setPuzzleArray(randoms);
    setSelectedIndex(null);
    setSwapCount(0);
    setIsSortedSuccess(false);
    setTimeSeconds(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    if (!isTimerRunning || isSortedSuccess) return;
    const timer = setInterval(() => {
      setTimeSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, isSortedSuccess]);

  const handleBarClick = (idx: number) => {
    if (isSortedSuccess) return;

    if (selectedIndex === null) {
      setSelectedIndex(idx);
      playCompareSound();
    } else if (selectedIndex === idx) {
      setSelectedIndex(null);
    } else {
      const newArr = [...puzzleArray];
      [newArr[selectedIndex], newArr[idx]] = [newArr[idx], newArr[selectedIndex]];
      setPuzzleArray(newArr);
      setSwapCount((c) => c + 1);
      setSelectedIndex(null);
      playSwapSound();

      let sorted = true;
      for (let i = 0; i < newArr.length - 1; i++) {
        if (newArr[i] > newArr[i + 1]) {
          sorted = false;
          break;
        }
      }

      if (sorted) {
        setIsSortedSuccess(true);
        setIsTimerRunning(false);
        playSuccessFanfare();
      }
    }
  };

  // ==========================================
  // 2. Maze Runner State (User vs AI)
  // ==========================================
  const GRID_SIZE = 7;
  const [userPos, setUserPos] = useState<[number, number]>([0, 0]);
  const [aiPos, setAiPos] = useState<[number, number]>([0, 0]);
  const [mazeWalls, setMazeWalls] = useState<Set<string>>(
    new Set(['1,1', '1,2', '2,4', '3,1', '3,2', '4,4', '5,2', '5,3'])
  );
  const [mazeWinner, setMazeWinner] = useState<'user' | 'ai' | null>(null);
  const [isMazeRunning, setIsMazeRunning] = useState<boolean>(false);

  const initMaze = () => {
    setUserPos([0, 0]);
    setAiPos([0, 0]);
    setMazeWinner(null);
    setIsMazeRunning(true);
    const walls = new Set<string>();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if ((r === 0 && c === 0) || (r === GRID_SIZE - 1 && c === GRID_SIZE - 1)) continue;
        if (Math.random() < 0.22) {
          walls.add(`${r},${c}`);
        }
      }
    }
    setMazeWalls(walls);
  };

  useEffect(() => {
    if (!isMazeRunning || mazeWinner) return;

    const interval = setInterval(() => {
      setAiPos(([r, c]) => {
        if (r === GRID_SIZE - 1 && c === GRID_SIZE - 1) {
          setMazeWinner('ai');
          setIsMazeRunning(false);
          return [r, c];
        }

        const nextR = r < GRID_SIZE - 1 && !mazeWalls.has(`${r + 1},${c}`) ? r + 1 : r;
        const nextC = c < GRID_SIZE - 1 && !mazeWalls.has(`${nextR},${c + 1}`) ? c + 1 : c;
        if (nextR === GRID_SIZE - 1 && nextC === GRID_SIZE - 1) {
          setMazeWinner('ai');
          setIsMazeRunning(false);
        }
        return [nextR, nextC];
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isMazeRunning, mazeWinner, mazeWalls]);

  const handleUserMove = (targetR: number, targetC: number) => {
    if (!isMazeRunning || mazeWinner) return;
    const [curR, curC] = userPos;
    const isAdjacent = Math.abs(curR - targetR) + Math.abs(curC - targetC) === 1;

    if (isAdjacent && !mazeWalls.has(`${targetR},${targetC}`)) {
      setUserPos([targetR, targetC]);
      playFoundSound();

      if (targetR === GRID_SIZE - 1 && targetC === GRID_SIZE - 1) {
        setMazeWinner('user');
        setIsMazeRunning(false);
        playSuccessFanfare();
      }
    }
  };

  // ==========================================
  // 3. Daily CS Quiz State
  // ==========================================
  const allQuizzes = [
    ...Object.values(DATA_STRUCTURES).flatMap((ds) => ds.quiz || []),
    {
      id: 'q_algo_1',
      question: '퀵 정렬의 평균 시간복잡도는 얼마일까요?',
      options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(1)'],
      correctIndex: 1,
      explanation: '퀵 정렬은 분할 정복 기법으로 평균 O(N log N)의 매우 빠른 성능을 보여줍니다.',
    },
    {
      id: 'q_algo_2',
      question: '다익스트라 알고리즘은 어떤 간선 가중치가 있을 때 사용할 수 없을까요?',
      options: ['0인 가중치', '소수 가중치', '음수 가중치', '큰 정수 가중치'],
      correctIndex: 2,
      explanation:
        '다익스트라는 음수 가중치 간선이나 음수 사이클이 있을 경우 최단 거리를 보장하지 못합니다(벨만-포드 사용 필요).',
    },
  ];

  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState<number>(3);

  const currentQuiz = allQuizzes[quizIndex % allQuizzes.length];

  const handleAnswerQuiz = (ansIdx: number) => {
    setSelectedQuizAnswer(ansIdx);
    if (ansIdx === currentQuiz.correctIndex) {
      setStreakCount((s) => s + 1);
      playSuccessFanfare();
    } else {
      playCompareSound();
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizAnswer(null);
    setQuizIndex((i) => i + 1);
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: '1 1 auto', minHeight: 0 }}
    >
      {/* 1. Game Mode Selector Toolbar */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'background.neutral',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant={activeGame === 'sortPuzzle' ? 'contained' : 'outlined'}
          color={activeGame === 'sortPuzzle' ? 'primary' : 'inherit'}
          startIcon={<SportsEsportsRoundedIcon />}
          onClick={() => setActiveGame('sortPuzzle')}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          정렬 퍼즐 챌린지
        </Button>
        <Button
          variant={activeGame === 'mazeRunner' ? 'contained' : 'outlined'}
          color={activeGame === 'mazeRunner' ? 'secondary' : 'inherit'}
          startIcon={<DirectionsRunRoundedIcon />}
          onClick={() => setActiveGame('mazeRunner')}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          미로 러너 vs AI
        </Button>
        <Button
          variant={activeGame === 'dailyQuiz' ? 'contained' : 'outlined'}
          color={activeGame === 'dailyQuiz' ? 'success' : 'inherit'}
          startIcon={<WhatshotRoundedIcon />}
          onClick={() => setActiveGame('dailyQuiz')}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          일일 CS 퀴즈 스트릭
        </Button>
      </Card>

      {/* 2. Main Game Arena */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {/* Sort Puzzle Game */}
        {activeGame === 'sortPuzzle' && (
          <Card
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 640,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  🧩 정렬 퍼즐 챌린지
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  막대를 2개씩 클릭해 위치를 교환하여 최소 횟수로 오름차순을 완성하세요!
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={initPuzzle}
                sx={{ borderRadius: 2 }}
              >
                새 게임
              </Button>
            </Box>

            {/* Stats Badge */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Chip
                label={`⏱ 시간: ${timeSeconds}초`}
                color="info"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`🔄 교환 횟수: ${swapCount}회`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* Interactive Bars */}
            <Box
              sx={{
                height: 240,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 2,
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 2,
              }}
            >
              {puzzleArray.map((val, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <Box
                    key={idx}
                    onClick={() => handleBarClick(idx)}
                    sx={{
                      width: 50,
                      height: `${(val / 100) * 180 + 30}px`,
                      bgcolor: isSelected
                        ? 'primary.main'
                        : isSortedSuccess
                          ? 'success.main'
                          : 'info.main',
                      borderRadius: '8px 8px 0 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.08) translateY(-8px)' : 'none',
                      boxShadow: isSelected ? 4 : 1,
                      '&:hover': { opacity: 0.9 },
                    }}
                  >
                    {val}
                  </Box>
                );
              })}
            </Box>

            {isSortedSuccess && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.lighter',
                  color: 'success.darker',
                  borderRadius: 2,
                  textAlign: 'center',
                  fontWeight: 800,
                }}
              >
                🎉 축하합니다! {timeSeconds}초 동안 {swapCount}번의 교환으로 정렬을 완료했습니다!
              </Box>
            )}
          </Card>
        )}

        {/* Maze Runner Game */}
        {activeGame === 'mazeRunner' && (
          <Card
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 640,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  🏃 미로 러너 vs AI
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  인접한 빈칸을 클릭하여 우하단 깃발에 AI보다 먼저 도달하세요!
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={initMaze}
                sx={{ borderRadius: 2 }}
              >
                시작하기
              </Button>
            </Box>

            {/* 7x7 Grid */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`,
                  gap: '4px',
                  p: 1.5,
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                }}
              >
                {Array.from({ length: GRID_SIZE }).map((_, r) =>
                  Array.from({ length: GRID_SIZE }).map((__, c) => {
                    const isWall = mazeWalls.has(`${r},${c}`);
                    const isUser = userPos[0] === r && userPos[1] === c;
                    const isAi = aiPos[0] === r && aiPos[1] === c;
                    const isGoal = r === GRID_SIZE - 1 && c === GRID_SIZE - 1;

                    return (
                      <Box
                        key={`${r}-${c}`}
                        onClick={() => handleUserMove(r, c)}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          cursor: isWall ? 'not-allowed' : 'pointer',
                          bgcolor: isWall
                            ? 'grey.800'
                            : isGoal
                              ? 'warning.light'
                              : 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        {isUser && isAi ? '🤼' : isUser ? '👤' : isAi ? '🤖' : isGoal ? '🏁' : ''}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            {mazeWinner && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: mazeWinner === 'user' ? 'success.lighter' : 'error.lighter',
                  color: mazeWinner === 'user' ? 'success.darker' : 'error.darker',
                  borderRadius: 2,
                  textAlign: 'center',
                  fontWeight: 800,
                }}
              >
                {mazeWinner === 'user'
                  ? '🎉 플레이어 승리! AI를 꺾고 먼저 도착했습니다!'
                  : '💀 AI 승리! 더 빠른 경로를 탐색해보세요.'}
              </Box>
            )}
          </Card>
        )}

        {/* Daily CS Quiz */}
        {activeGame === 'dailyQuiz' && (
          <Card
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 640,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  🔥 데일리 CS 퀴즈 스트릭
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  매일 1문제씩 풀며 코딩테스트 및 기술 면접 개념을 완벽 마스터하세요.
                </Typography>
              </Box>
              <Chip
                label={`🔥 ${streakCount}일 연속 달성!`}
                color="error"
                sx={{ fontWeight: 800 }}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Q{quizIndex + 1}. {currentQuiz.question}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {currentQuiz.options.map((opt, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                const isCorrect = idx === currentQuiz.correctIndex;
                let color: 'primary' | 'success' | 'error' | 'inherit' = 'inherit';
                if (selectedQuizAnswer !== null) {
                  if (isCorrect) color = 'success';
                  else if (isSelected) color = 'error';
                }

                return (
                  <Button
                    key={idx}
                    variant={isSelected ? 'contained' : 'outlined'}
                    color={color}
                    onClick={() => selectedQuizAnswer === null && handleAnswerQuiz(idx)}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >
                    {idx + 1}. {opt}
                  </Button>
                );
              })}
            </Box>

            {selectedQuizAnswer !== null && (
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    color:
                      selectedQuizAnswer === currentQuiz.correctIndex
                        ? 'success.main'
                        : 'error.main',
                  }}
                >
                  {selectedQuizAnswer === currentQuiz.correctIndex
                    ? '✅ 정답입니다!'
                    : '❌ 오답입니다.'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {currentQuiz.explanation}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNextQuiz}
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                >
                  다음 문제 풀기 ➔
                </Button>
              </Box>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
}
