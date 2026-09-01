'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Slider from '@mui/material/Slider';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { AlkkagiCanvas } from './AlkkagiCanvas';
import { GameAlgorithmInspector } from '../common/GameAlgorithmInspector';
import {
  DEFAULT_PHYSICS,
  createInitialStones,
  updatePhysicsStep,
  calculateAIAim,
} from '../../../lib/games/alkkagi/engine';
import {
  playBadukStoneSound,
  playJanggiPieceSound,
  playAlkkagiFlickSound,
  playAlkkagiFallSound,
  playPuzzleSolvedSound,
} from '../../../lib/games/gameSounds';
import {
  type AlkkagiStone,
  type AlkkagiBoardType,
  type AlkkagiGameMode,
  type AlkkagiFormation,
  type AlkkagiPhysicsConfig,
  type AlkkagiSide,
} from '../../../lib/games/alkkagi/types';

export function AlkkagiTab() {
  const [hasLoaded, setHasLoaded] = useState(false);

  // Settings
  const [boardType, setBoardType] = useState<AlkkagiBoardType>('baduk');
  const [gameMode, setGameMode] = useState<AlkkagiGameMode>('vs-ai');
  const [formation, setFormation] = useState<AlkkagiFormation>('standard5');
  const [physicsConfig, setPhysicsConfig] = useState<AlkkagiPhysicsConfig>(DEFAULT_PHYSICS);

  // Game Play State
  const [stones, setStones] = useState<AlkkagiStone[]>([]);
  const [history, setHistory] = useState<AlkkagiStone[][]>([]);
  const [currentTurn, setCurrentTurn] = useState<AlkkagiSide>('A');
  const [isMoving, setIsMoving] = useState(false);
  const [winner, setWinner] = useState<AlkkagiSide | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const stonesRef = useRef<AlkkagiStone[]>([]);
  stonesRef.current = stones;

  // Initialize stones
  const resetGame = useCallback(
    (bType: AlkkagiBoardType = boardType, form: AlkkagiFormation = formation) => {
      const init = createInitialStones(bType, form);
      setStones(init);
      setHistory([init.map((s) => ({ ...s }))]);
      setCurrentTurn('A');
      setIsMoving(false);
      setWinner(null);
      setStatusMessage(
        bType === 'baduk'
          ? '흑돌을 드래그하여 백돌을 장외로 쳐내세요!'
          : '초(楚)나라 기물을 드래그하여 한(漢)나라 기물을 장외로 쳐내세요!'
      );
    },
    [boardType, formation]
  );

  useEffect(() => {
    setHasLoaded(true);
    resetGame();
  }, [resetGame]);

  // Handle board type change
  const handleBoardTypeChange = (_: React.SyntheticEvent, newType: AlkkagiBoardType | null) => {
    if (!newType || newType === boardType) return;
    setBoardType(newType);
    resetGame(newType, formation);
  };

  // Handle formation change
  const handleFormationChange = (_: React.SyntheticEvent, newForm: AlkkagiFormation | null) => {
    if (!newForm || newForm === formation) return;
    setFormation(newForm);
    resetGame(boardType, newForm);
  };

  // Physics animation ticker
  const runPhysicsLoop = useCallback(
    (onComplete?: () => void) => {
      setIsMoving(true);

      const interval = setInterval(() => {
        const currentList = stonesRef.current.map((s) => ({ ...s }));
        const { hasMoving, collisions, newlyFallen } = updatePhysicsStep(
          currentList,
          physicsConfig
        );

        // Sound triggers
        if (collisions.length > 0) {
          if (boardType === 'baduk') playBadukStoneSound();
          else playJanggiPieceSound();
        }

        if (newlyFallen.length > 0) {
          playAlkkagiFallSound();
        }

        setStones(currentList);

        if (!hasMoving) {
          clearInterval(interval);
          setIsMoving(false);

          // Check Win/Loss
          const aliveA = currentList.filter(
            (s) => s.isAlive && !s.falling && s.side === 'A'
          ).length;
          const aliveB = currentList.filter(
            (s) => s.isAlive && !s.falling && s.side === 'B'
          ).length;

          if (aliveA === 0 && aliveB === 0) {
            setStatusMessage('무승부! 양측 기물이 모두 장외로 떨어졌습니다.');
          } else if (aliveB === 0) {
            setWinner('A');
            playPuzzleSolvedSound();
            setStatusMessage(
              boardType === 'baduk'
                ? '🏆 흑(Black) 완승! 모든 백돌을 쳐냈습니다!'
                : '🏆 초(楚)나라 완승! 모든 한나라 기물을 쳐냈습니다!'
            );
          } else if (aliveA === 0) {
            setWinner('B');
            playPuzzleSolvedSound();
            setStatusMessage(
              boardType === 'baduk'
                ? '🏆 백(White) 완승! 모든 흑돌을 쳐냈습니다!'
                : '🏆 한(漢)나라 완승! 모든 초나라 기물을 쳐냈습니다!'
            );
          } else if (onComplete) {
            onComplete();
          }
        }
      }, 16);
    },
    [physicsConfig, boardType]
  );

  // Player Shoots a stone
  const handleShoot = useCallback(
    (stoneId: string, impulseX: number, impulseY: number) => {
      if (isMoving || winner) return;

      const nextStones = stonesRef.current.map((s) => {
        if (s.id === stoneId) {
          const power = Math.hypot(impulseX, impulseY);
          playAlkkagiFlickSound(power / physicsConfig.maxPower);
          return {
            ...s,
            vx: impulseX,
            vy: impulseY,
          };
        }
        return { ...s };
      });

      setStones(nextStones);
      setHistory((prev) => [...prev, nextStones.map((s) => ({ ...s }))]);

      runPhysicsLoop(() => {
        // After movement stops, switch turn
        if (gameMode === 'pass-and-play') {
          setCurrentTurn((prev) => (prev === 'A' ? 'B' : 'A'));
          setStatusMessage(
            currentTurn === 'A'
              ? boardType === 'baduk'
                ? '⚪ 백(White)의 차례입니다!'
                : '🔴 한(漢)나라의 차례입니다!'
              : boardType === 'baduk'
                ? '⚫ 흑(Black)의 차례입니다!'
                : '🟢 초(楚)나라의 차례입니다!'
          );
        } else if (gameMode === 'vs-ai') {
          // AI turn trigger
          setCurrentTurn('B');
          setStatusMessage('🤖 AI 봇이 조준 및 사격 준비 중입니다...');

          setTimeout(() => {
            const aiAim = calculateAIAim(stonesRef.current, 'B', physicsConfig);
            if (aiAim) {
              const aiStones = stonesRef.current.map((s) => {
                if (s.id === aiAim.shooterId) {
                  const power = Math.hypot(aiAim.impulseX, aiAim.impulseY);
                  playAlkkagiFlickSound(power / physicsConfig.maxPower);
                  return {
                    ...s,
                    vx: aiAim.impulseX,
                    vy: aiAim.impulseY,
                  };
                }
                return { ...s };
              });
              setStones(aiStones);
              runPhysicsLoop(() => {
                setCurrentTurn('A');
                setStatusMessage('당신의 차례입니다! 각도와 파워를 조절해 쳐내세요.');
              });
            } else {
              setCurrentTurn('A');
            }
          }, 600);
        }
      });
    },
    [isMoving, winner, physicsConfig, runPhysicsLoop, gameMode, currentTurn, boardType]
  );

  const handleUndo = () => {
    if (history.length <= 1 || isMoving) return;
    const nextHist = history.slice(0, history.length - 1);
    const target = nextHist[nextHist.length - 1];
    setStones(target.map((s) => ({ ...s })));
    setHistory(nextHist);
    setWinner(null);
    setCurrentTurn('A');
  };

  // Counts
  const aliveCountA = useMemo(
    () => stones.filter((s) => s.isAlive && !s.falling && s.side === 'A').length,
    [stones]
  );
  const aliveCountB = useMemo(
    () => stones.filter((s) => s.isAlive && !s.falling && s.side === 'B').length,
    [stones]
  );

  if (!hasLoaded) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* 1. Header Toolbar */}
      <Card
        sx={{
          p: 2,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
            <SportsEsportsRoundedIcon sx={{ color: '#d97706' }} />
            피직스 알까기 배틀 (Alkkagi Physics)
          </Typography>

          {/* Board Selector */}
          <ToggleButtonGroup
            value={boardType}
            exclusive
            onChange={handleBoardTypeChange}
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              borderRadius: 1.5,
              '& .MuiToggleButton-root': {
                fontWeight: 800,
                fontSize: '0.8rem',
                px: 1.5,
                color: '#475569',
                '&.Mui-selected': {
                  bgcolor: '#d97706',
                  color: '#ffffff',
                  '&:hover': { bgcolor: '#b45309' },
                },
              },
            }}
          >
            <ToggleButton value="baduk">⚪⚫ 바둑알까기</ToggleButton>
            <ToggleButton value="janggi">🟢🔴 장기알까기</ToggleButton>
          </ToggleButtonGroup>

          {/* Mode Selector */}
          <ToggleButtonGroup
            value={gameMode}
            exclusive
            onChange={(_, val) => val && setGameMode(val)}
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              borderRadius: 1.5,
              '& .MuiToggleButton-root': {
                fontWeight: 800,
                fontSize: '0.8rem',
                px: 1.5,
                color: '#475569',
                '&.Mui-selected': {
                  bgcolor: '#0284c7',
                  color: '#ffffff',
                },
              },
            }}
          >
            <ToggleButton value="vs-ai">
              <PsychologyRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} />
              vs AI 봇
            </ToggleButton>
            <ToggleButton value="pass-and-play">
              <PeopleRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} />
              2인 대전
            </ToggleButton>
            <ToggleButton value="practice">
              <AutoAwesomeRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} />
              자유 연습
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UndoRoundedIcon sx={{ color: '#475569 !important' }} />}
            onClick={handleUndo}
            disabled={history.length <= 1 || isMoving}
            sx={{
              fontWeight: 700,
              backgroundColor: '#f1f5f9 !important',
              color: '#334155 !important',
              border: '1px solid #cbd5e1 !important',
            }}
          >
            한 수 무르기
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<ReplayRoundedIcon sx={{ color: '#ffffff !important' }} />}
            onClick={() => resetGame()}
            sx={{
              fontWeight: 800,
              backgroundColor: '#d97706 !important',
              color: '#ffffff !important',
              '&:hover': { backgroundColor: '#b45309 !important' },
            }}
          >
            게임 다시 시작
          </Button>
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
        {/* Left: Physics Canvas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <AlkkagiCanvas
            boardType={boardType}
            stones={stones}
            currentTurn={currentTurn}
            isMoving={isMoving}
            disabled={Boolean(winner)}
            config={physicsConfig}
            onShoot={handleShoot}
          />

          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
            💡 내 기물을 마우스/터치로 뒤로 당겼다 놓아(Slingshot) 상대 돌을 쳐내세요!
          </Typography>
        </Box>

        {/* Right: Game Status & Formations & Physics Tuning */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Winner Banner */}
          {winner && (
            <Card
              sx={{
                p: 2.5,
                bgcolor: '#f0fdf4',
                border: '2px solid #16a34a',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.15)',
              }}
            >
              <EmojiEventsRoundedIcon sx={{ color: '#16a34a', fontSize: 36 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#15803d' }}>
                  {winner === 'A'
                    ? boardType === 'baduk'
                      ? '🎉 흑(Black) 승리!'
                      : '🎉 초(楚)나라 승리!'
                    : boardType === 'baduk'
                      ? '🎉 백(White) 승리!'
                      : '🎉 한(漢)나라 승리!'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#166534' }}>
                  상대 기물을 모두 장외로 쳐내어 완승을 거두었습니다.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => resetGame()}
                sx={{
                  fontWeight: 800,
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                한 판 더!
              </Button>
            </Card>
          )}

          {/* Status & Live Score Board */}
          <Card sx={{ p: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
              📊 실시간 기물 잔여 현황
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: currentTurn === 'A' ? '#f0fdf4' : '#ffffff',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: currentTurn === 'A' ? '#16a34a' : '#cbd5e1',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803d' }}>
                  {boardType === 'baduk' ? '⚫ 흑 (Black)' : '🟢 초 (楚)'}{' '}
                  {currentTurn === 'A' && '◀ 턴'}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#0f172a' }}>
                  {aliveCountA}개
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: currentTurn === 'B' ? '#fef2f2' : '#ffffff',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: currentTurn === 'B' ? '#dc2626' : '#cbd5e1',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                  {boardType === 'baduk' ? '⚪ 백 (White)' : '🔴 한 (漢)'}{' '}
                  {currentTurn === 'B' && '◀ 턴'}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#0f172a' }}>
                  {aliveCountB}개
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
              {statusMessage}
            </Typography>
          </Card>

          {/* Formation Selector Card */}
          <Card sx={{ p: 2.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
              ⚔️ 기물 진형 (Formation) 선택:
            </Typography>

            <ToggleButtonGroup
              value={formation}
              exclusive
              onChange={handleFormationChange}
              size="small"
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  py: 1,
                  color: '#475569',
                  '&.Mui-selected': {
                    bgcolor: '#d97706',
                    color: '#ffffff',
                  },
                },
              }}
            >
              <ToggleButton value="standard5">5 vs 5 표준</ToggleButton>
              <ToggleButton value="battle7">7 vs 7 총력전</ToggleButton>
              <ToggleButton value="fortress">궁성 요새형</ToggleButton>
              <ToggleButton value="triangle">삼각 쐐기형</ToggleButton>
            </ToggleButtonGroup>
          </Card>

          {/* Physics Tuning Card */}
          <Card sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <TuneRoundedIcon sx={{ color: '#d97706', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                물리 엔진 파라미터 조절
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    바닥 마찰력 (Friction): {physicsConfig.friction.toFixed(3)}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={physicsConfig.friction}
                  min={0.96}
                  max={0.995}
                  step={0.001}
                  onChange={(_, val) =>
                    setPhysicsConfig((prev) => ({ ...prev, friction: val as number }))
                  }
                  sx={{ color: '#d97706' }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    탄성 계수 (Restitution e): {physicsConfig.restitution.toFixed(2)}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={physicsConfig.restitution}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  onChange={(_, val) =>
                    setPhysicsConfig((prev) => ({ ...prev, restitution: val as number }))
                  }
                  sx={{ color: '#d97706' }}
                />
              </Box>
            </Box>
          </Card>

          {/* CS & Physics Inspector */}
          <GameAlgorithmInspector
            gameTitle={boardType === 'baduk' ? '바둑알까기 피직스' : '장기알까기 피직스'}
            csConcept="2D 탄성 충돌(Elastic Collision) & 운동량 보존 법칙"
            searchNodes={stones.length * (stones.length - 1)}
            searchDepth={1}
            timeMs={16}
            evalScore={aliveCountA - aliveCountB}
            algorithmName="2D Circle Impulse Collision & Friction Drag Physics Engine"
            complexityInfo={{
              time: 'O(N^2) 충돌 판정 + O(1) 임펄스 분배',
              space: 'O(N) 기물 벡터 상태 배열',
              branchingFactor: '연속 공간 (Continuous Angle/Impulse Vector)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
