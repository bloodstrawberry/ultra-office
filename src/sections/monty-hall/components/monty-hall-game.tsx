'use client';

import type { GameStage, DoorContent } from '../types';

import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import { simulateMontyHallBatch } from '../utils/monty-math';

// ----------------------------------------------------------------------

interface DoorState {
  id: number;
  content: DoorContent;
  isSelected: boolean;
  isOpen: boolean;
}

export function MontyHallGame() {
  const [doorCount, setDoorCount] = useState<number>(3);
  const [doors, setDoors] = useState<DoorState[]>([]);
  const [stage, setStage] = useState<GameStage>('choose');
  const [winningDoorId, setWinningDoorId] = useState<number>(0);
  const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);
  const [isSwitched, setIsSwitched] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  // Bulk Simulation Stats
  const [totalSimRounds, setTotalSimRounds] = useState<number>(0);
  const [simSwitchWins, setSimSwitchWins] = useState<number>(0);
  const [simStayWins, setSimStayWins] = useState<number>(0);

  // Initialize interactive game
  const initGame = useCallback(
    (count: number = doorCount) => {
      const winId = Math.floor(Math.random() * count);
      setWinningDoorId(winId);
      setSelectedDoorId(null);
      setStage('choose');
      setGameResult(null);
      setIsSwitched(false);

      const newDoors: DoorState[] = [];
      for (let i = 0; i < count; i += 1) {
        newDoors.push({
          id: i,
          content: i === winId ? 'car' : 'goat',
          isSelected: false,
          isOpen: false,
        });
      }
      setDoors(newDoors);
    },
    [doorCount]
  );

  useEffect(() => {
    initGame(doorCount);
  }, [doorCount, initGame]);

  // Step 1: User selects a door
  const handleSelectDoor = (doorId: number) => {
    if (stage !== 'choose') return;

    setSelectedDoorId(doorId);

    // Monty opens all other doors with goats except one remaining door
    const goatDoorIds = doors
      .filter((d) => d.id !== doorId && d.content === 'goat')
      .map((d) => d.id);

    // If user picked car, randomly leave 1 goat door closed
    let doorsToOpen: number[] = [];
    if (doorId === winningDoorId) {
      // Pick random 1 goat to leave closed
      const keepClosedIndex = Math.floor(Math.random() * goatDoorIds.length);
      doorsToOpen = goatDoorIds.filter((_, idx) => idx !== keepClosedIndex);
    } else {
      // User picked a goat -> open ALL other goats (leaving winning car door closed)
      doorsToOpen = goatDoorIds.filter((id) => id !== winningDoorId);
    }

    setDoors((prev) =>
      prev.map((d) => {
        if (d.id === doorId) return { ...d, isSelected: true };
        if (doorsToOpen.includes(d.id)) return { ...d, isOpen: true };
        return d;
      })
    );

    setStage('opened');
  };

  // Step 2: Final choice: Switch or Stay
  const handleFinalChoice = (switchDoor: boolean) => {
    if (stage !== 'opened' || selectedDoorId === null) return;

    let finalDoorId = selectedDoorId;
    if (switchDoor) {
      // Switch to the only other closed door
      const otherClosedDoor = doors.find((d) => !d.isOpen && d.id !== selectedDoorId);
      if (otherClosedDoor) {
        finalDoorId = otherClosedDoor.id;
      }
    }

    setIsSwitched(switchDoor);
    const isWin = finalDoorId === winningDoorId;
    setGameResult(isWin ? 'win' : 'lose');

    // Open all doors
    setDoors((prev) =>
      prev.map((d) => ({
        ...d,
        isOpen: true,
        isSelected: d.id === finalDoorId,
      }))
    );
    setStage('finished');
  };

  // Bulk Monte Carlo Simulation
  const handleRunBatch = (rounds: number) => {
    const { switchWins, stayWins } = simulateMontyHallBatch(rounds, doorCount);
    setTotalSimRounds((prev) => prev + rounds);
    setSimSwitchWins((prev) => prev + switchWins);
    setSimStayWins((prev) => prev + stayWins);
  };

  const handleResetSim = () => {
    setTotalSimRounds(0);
    setSimSwitchWins(0);
    setSimStayWins(0);
  };

  const switchWinRate = totalSimRounds > 0 ? (simSwitchWins / totalSimRounds) * 100 : 0;
  const stayWinRate = totalSimRounds > 0 ? (simStayWins / totalSimRounds) * 100 : 0;
  const theoreticalSwitchRate = ((doorCount - 1) / doorCount) * 100;
  const theoreticalStayRate = (1 / doorCount) * 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Interactive Door Game Section */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              ① 몬티홀 대화형 딜레마 게임 (Interactive Game)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {stage === 'choose' && '원하는 문 하나를 클릭하여 선택하세요.'}
              {stage === 'opened' && '진행자가 염소 문을 열었습니다! 문을 바꾸시겠습니까?'}
              {stage === 'finished' &&
                (gameResult === 'win'
                  ? '🎉 축하합니다! 자동차(당첨)를 획득하셨습니다!'
                  : '😭 아쉽습니다! 염소를 선택하셨습니다.')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              문 개수: {doorCount}개
            </Typography>
            <Slider
              value={doorCount}
              min={3}
              max={10}
              step={1}
              marks={[
                { value: 3, label: '3개 (기본)' },
                { value: 5, label: '5개' },
                { value: 10, label: '10개' },
              ]}
              disabled={stage !== 'choose'}
              sx={{ width: 140 }}
              onChange={(_, val) => setDoorCount(val as number)}
            />
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => initGame(doorCount)}
            >
              새 게임
            </Button>
          </Box>
        </Box>

        {/* Doors Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(doorCount, 5)}, 1fr)`,
            gap: 2,
            mb: 2.5,
            justifyContent: 'center',
          }}
        >
          {doors.map((door) => {
            const isClosed = !door.isOpen;
            return (
              <Paper
                key={door.id}
                onClick={() => handleSelectDoor(door.id)}
                elevation={door.isSelected ? 6 : 1}
                sx={{
                  p: 2,
                  minHeight: 180,
                  borderRadius: 2,
                  border: 2,
                  borderColor: door.isSelected
                    ? 'primary.main'
                    : door.isOpen && door.content === 'car'
                      ? 'success.main'
                      : 'divider',
                  bgcolor: door.isOpen
                    ? door.content === 'car'
                      ? 'success.lighter'
                      : 'background.neutral'
                    : door.isSelected
                      ? 'primary.lighter'
                      : 'background.paper',
                  cursor: stage === 'choose' ? 'pointer' : 'default',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  '&:hover': {
                    borderColor: stage === 'choose' ? 'primary.light' : undefined,
                    transform: stage === 'choose' ? 'scale(1.02)' : 'none',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  문 #{door.id + 1}
                </Typography>

                {isClosed ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <MeetingRoomRoundedIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: 'text.secondary' }}
                    >
                      {door.isSelected ? '👉 나의 선택' : '닫힘'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 44 }}>
                      {door.content === 'car' ? '🚗' : '🐐'}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: door.content === 'car' ? 'success.main' : 'error.main',
                      }}
                    >
                      {door.content === 'car' ? '자동차 (당첨!)' : '염소 (꽝)'}
                    </Typography>
                  </Box>
                )}

                {door.isSelected && (
                  <Chip size="small" label="선택됨" color="primary" sx={{ mt: 0.5 }} />
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Stage Action Controls */}
        {stage === 'opened' && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'warning.lighter',
              border: 1,
              borderColor: 'warning.main',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.darker' }}>
                🤔 사회자가 염소 문을 열었습니다! 어떻게 하시겠습니까?
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                수학적으로 문을 바꾸면 승률이 <b>{theoreticalSwitchRate.toFixed(1)}%</b>로 2배 이상
                급상승합니다.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SwapHorizontalCircleRoundedIcon />}
                onClick={() => handleFinalChoice(true)}
              >
                다른 문으로 바꾸기 (Switch)
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => handleFinalChoice(false)}
              >
                처음 선택 그대로 유지 (Stay)
              </Button>
            </Box>
          </Paper>
        )}

        {stage === 'finished' && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: gameResult === 'win' ? 'success.lighter' : 'error.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {gameResult === 'win' ? (
                <CheckCircleRoundedIcon color="success" sx={{ fontSize: 36 }} />
              ) : (
                <CancelRoundedIcon color="error" sx={{ fontSize: 36 }} />
              )}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: gameResult === 'win' ? 'success.darker' : 'error.darker',
                  }}
                >
                  {isSwitched ? '문을 바꾼 결과: ' : '그대로 유지한 결과: '}
                  {gameResult === 'win' ? '승리! (자동차 획득)' : '패배 (염소 선택)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  이론 승률: [바꾸기: {theoreticalSwitchRate.toFixed(1)}%] vs [유지:{' '}
                  {theoreticalStayRate.toFixed(1)}%]
                </Typography>
              </Box>
            </Box>

            <Button variant="contained" color="primary" onClick={() => initGame(doorCount)}>
              한 번 더 플레이
            </Button>
          </Paper>
        )}
      </Card>

      {/* 2. Bulk Monte Carlo Simulation Section */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'secondary.main' }}>
              ② 대규모 몬테카를로 승률 검증 (Bulk Simulation)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              수만 회의 컴퓨터 가상 시뮬레이션을 통해 문을 바꿨을 때와 유지했을 때의 실제 승률을
              증명합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRunBatch(100)}
            >
              +100회
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRunBatch(1000)}
            >
              +1,000회
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRunBatch(10000)}
            >
              +10,000회 초고속
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleResetSim}
            >
              통계 리셋
            </Button>
          </Box>
        </Box>

        {/* Win Rate Comparison Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
            mb: 2.5,
          }}
        >
          {/* Switch Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              border: 2,
              borderColor: 'primary.main',
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'primary.dark', fontWeight: 800 }}>
              🔄 항상 문을 바꿨을 때 (Switch Strategy)
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', my: 1 }}>
              {totalSimRounds > 0 ? `${switchWinRate.toFixed(2)}%` : '66.67%'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              승리: {simSwitchWins.toLocaleString()}승 / {totalSimRounds.toLocaleString()}전
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              (이론적 수학 승률: <b>{theoreticalSwitchRate.toFixed(2)}%</b>)
            </Typography>
          </Paper>

          {/* Stay Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              🔒 처음 선택을 그대로 유지했을 때 (Stay Strategy)
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', my: 1 }}>
              {totalSimRounds > 0 ? `${stayWinRate.toFixed(2)}%` : '33.33%'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              승리: {simStayWins.toLocaleString()}승 / {totalSimRounds.toLocaleString()}전
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              (이론적 수학 승률: <b>{theoreticalStayRate.toFixed(2)}%</b>)
            </Typography>
          </Paper>
        </Box>

        {/* Bayes Theorem Mathematical Proof */}
        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            💡 몬티홀 딜레마의 수학적 원리 (왜 50%가 아니라 66.7%인가?)
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            처음 문을 골랐을 때 자동차를 맞출 확률은 <b>1/3</b>이고, 염소를 고를 확률은 <b>2/3</b>
            입니다. 사회자는 자동차의 위치를 알고 있으므로 반드시 <b>남은 문 중 염소만을 오픈</b>
            합니다. 따라서 처음 염소를 골랐던 <b>2/3의 상황</b>에서는 문을 바꾸면 100% 자동차를 얻게
            되므로, 바꾸는 전략의 승률은 정확히 <b>2/3 (66.67%)</b>가 됩니다.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
