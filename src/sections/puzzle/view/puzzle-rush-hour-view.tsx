'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzleMediaActions } from '../components/puzzle-media-actions';
import { usePuzzleMediaExport } from '../hooks/use-puzzle-media-export';
import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import {
  EXIT_ROW,
  GRID_SIZE,
  moveVehicle,
  type Vehicle,
  solveRushHour,
  isRushHourWon,
  canMoveVehicle,
  type RushHourStep,
  RUSH_HOUR_PRESETS,
  getRushHourStepDescription,
} from '../utils/rush-hour-solver';

interface VehicleDragState {
  vehicleId: string;
  pointerId: number;
  startClientPosition: number;
  cellSize: number;
  minDelta: number;
  maxDelta: number;
  offsetPx: number;
}

function getVehicleDragBounds(vehicles: Vehicle[], vehicleId: string) {
  const countAvailableCells = (direction: -1 | 1) => {
    let availableCells = 0;
    let positions = vehicles;

    while (true) {
      const next = moveVehicle(positions, vehicleId, direction);
      if (!next) break;
      positions = next;
      availableCells += 1;
    }

    return availableCells;
  };

  return {
    minDelta: -countAvailableCells(-1),
    maxDelta: countAvailableCells(1),
  };
}

export function PuzzleRushHourView() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(RUSH_HOUR_PRESETS[0].id);
  const currentPreset =
    RUSH_HOUR_PRESETS.find((p) => p.id === selectedPresetId) || RUSH_HOUR_PRESETS[0];

  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    currentPreset.vehicles.map((v) => ({ ...v }))
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [movesCount, setMovesCount] = useState<number>(0);

  const playbackBaseVehiclesRef = useRef<Vehicle[] | null>(null);
  const [, setPlaybackBaseVehicles] = useState<Vehicle[] | null>(null);

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<RushHourStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [hintStep, setHintStep] = useState<RushHourStep | null>(null);
  const [dragOffset, setDragOffset] = useState<{ vehicleId: string; offsetPx: number } | null>(
    null
  );
  const vehicleDragRef = useRef<VehicleDragState | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const won = isRushHourWon(vehicles);

  // Won toast
  useEffect(() => {
    if (won) {
      toast.success('탈출 성공! 빨간 주인공 자동차가 막힌 주차장을 무사히 빠져나왔습니다!', {
        id: 'rush-hour-status',
      });
    }
  }, [won]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      stopPlayback();
      setSelectedPresetId(presetId);
      const preset = RUSH_HOUR_PRESETS.find((p) => p.id === presetId) || RUSH_HOUR_PRESETS[0];
      setVehicles(preset.vehicles.map((v) => ({ ...v })));
      playbackBaseVehiclesRef.current = null;
      setPlaybackBaseVehicles(null);
      setSelectedVehicleId(null);
      setMovesCount(0);
      setHintStep(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      toast.info(`[${preset.name} - ${preset.difficulty}] 프리셋이 적용되었습니다.`, {
        id: 'rush-hour-preset',
      });
    },
    [stopPlayback]
  );

  const handleMove = useCallback(
    (vehicleId: string, delta: number) => {
      stopPlayback();
      if (won) return;
      if (canMoveVehicle(vehicles, vehicleId, delta)) {
        const next = moveVehicle(vehicles, vehicleId, delta);
        if (next) {
          setVehicles(next);
          setMovesCount((prev) => prev + 1);
          setHintStep(null);
          setSolutionSteps([]);
          setCurrentStepIndex(0);
          playbackBaseVehiclesRef.current = null;
          setPlaybackBaseVehicles(null);
        }
      }
    },
    [stopPlayback, vehicles, won]
  );

  const handleVehiclePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, vehicle: Vehicle) => {
      if (isPlaying || won || (event.pointerType === 'mouse' && event.button !== 0)) return;

      const board = boardRef.current;
      if (!board) return;

      event.preventDefault();
      stopPlayback();
      setSelectedVehicleId(vehicle.id);

      const boardRect = board.getBoundingClientRect();
      const isVertical = vehicle.orientation === 'V';
      const cellSize = (isVertical ? boardRect.height : boardRect.width) / GRID_SIZE;
      const { minDelta, maxDelta } = getVehicleDragBounds(vehicles, vehicle.id);

      vehicleDragRef.current = {
        vehicleId: vehicle.id,
        pointerId: event.pointerId,
        startClientPosition: isVertical ? event.clientY : event.clientX,
        cellSize,
        minDelta,
        maxDelta,
        offsetPx: 0,
      };
      setDragOffset({ vehicleId: vehicle.id, offsetPx: 0 });
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isPlaying, stopPlayback, vehicles, won]
  );

  const handleVehiclePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, vehicle: Vehicle) => {
      const drag = vehicleDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || drag.vehicleId !== vehicle.id) return;

      event.preventDefault();
      const clientPosition = vehicle.orientation === 'V' ? event.clientY : event.clientX;
      const rawOffset = clientPosition - drag.startClientPosition;
      const offsetPx = Math.min(
        drag.maxDelta * drag.cellSize,
        Math.max(drag.minDelta * drag.cellSize, rawOffset)
      );

      drag.offsetPx = offsetPx;
      setDragOffset({ vehicleId: vehicle.id, offsetPx });
    },
    []
  );

  const finishVehicleDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
      const drag = vehicleDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      vehicleDragRef.current = null;
      setDragOffset(null);

      if (!commit) return;

      const delta = Math.min(
        drag.maxDelta,
        Math.max(drag.minDelta, Math.round(drag.offsetPx / drag.cellSize))
      );
      if (delta !== 0) handleMove(drag.vehicleId, delta);
    },
    [handleMove]
  );

  // Playback logic: solve from CURRENT vehicle positions
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0 && playbackBaseVehiclesRef.current) {
      return solutionSteps;
    }

    const { solved: success, steps } = solveRushHour(vehicles);
    if (!success || steps.length === 0) {
      toast.error('현재 상태에서 탈출 경로를 찾을 수 없습니다.', { id: 'rush-hour-status' });
      return [];
    }

    const base = vehicles.map((v) => ({ ...v }));
    playbackBaseVehiclesRef.current = base;
    setPlaybackBaseVehicles(base);
    setSolutionSteps(steps);
    return steps;
  }, [solutionSteps, vehicles]);

  const applyStep = useCallback(
    (stepIdx: number, steps: RushHourStep[], base?: Vehicle[]) => {
      setCurrentStepIndex(stepIdx);
      const startVehicles = base || playbackBaseVehiclesRef.current || vehicles;
      if (stepIdx === 0) {
        setVehicles(startVehicles.map((v) => ({ ...v })));
        setHintStep(null);
        setSelectedVehicleId(null);
      } else {
        const step = steps[stepIdx - 1];
        setVehicles(step.vehicles.map((v) => ({ ...v })));
        setHintStep(step);
        setSelectedVehicleId(step.vehicleId);
      }
    },
    [vehicles]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    if (currentStepIndex >= steps.length) {
      applyStep(0, steps, playbackBaseVehiclesRef.current || vehicles);
    }
    setIsPlaying(true);
  }, [applyStep, currentStepIndex, ensureStepsGenerated, isPlaying, stopPlayback, vehicles]);

  // Media export (Screenshot & GIF)
  const mediaExport = usePuzzleMediaExport({
    boardRef,
    gameTitle: 'rush-hour',
    isPlaying,
    currentStep: currentStepIndex,
    totalSteps: solutionSteps.length,
    speed,
    onStartPlay: handleTogglePlay,
  });

  const handleStepChange = useCallback(
    (targetStep: number) => {
      stopPlayback();
      const steps = ensureStepsGenerated();
      if (targetStep >= 0 && targetStep <= steps.length) {
        applyStep(targetStep, steps, playbackBaseVehiclesRef.current || vehicles);
      }
    },
    [applyStep, ensureStepsGenerated, stopPlayback, vehicles]
  );

  const handlePrevStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1, steps, playbackBaseVehiclesRef.current || vehicles);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback, vehicles]);

  const handleNextStep = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex < steps.length) {
      applyStep(currentStepIndex + 1, steps, playbackBaseVehiclesRef.current || vehicles);
    }
  }, [applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback, vehicles]);

  const handleResetPlayback = useCallback(() => {
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (steps.length > 0) {
      applyStep(0, steps, playbackBaseVehiclesRef.current || vehicles);
    }
  }, [applyStep, ensureStepsGenerated, stopPlayback, vehicles]);

  // Interval ticker
  useEffect(() => {
    if (!isPlaying) return () => {};

    const delay = Math.max(150, Math.round(700 / speed));
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < solutionSteps.length) {
          const nextIdx = prev + 1;
          const step = solutionSteps[nextIdx - 1];
          setVehicles(step.vehicles.map((v) => ({ ...v })));
          setMovesCount((c) => c + 1);
          setHintStep(step);
          setSelectedVehicleId(step.vehicleId);
          return nextIdx;
        }
        stopPlayback();
        return prev;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isPlaying, solutionSteps, speed, stopPlayback]);

  // 치트키 1: 전체 즉시 탈출 (Auto Solve) - 현재 차량 위치에서 최단 탈출 계산
  const handleAutoSolve = useCallback(() => {
    stopPlayback();
    if (won) {
      toast.info('이미 빨간 자동차가 출구에 도달했습니다.', { id: 'rush-hour-status' });
      return;
    }

    const { solved: success, steps } = solveRushHour(vehicles);
    if (!success || steps.length === 0) {
      toast.error('현재 상태에서 탈출 경로를 찾을 수 없습니다.', { id: 'rush-hour-status' });
      return;
    }

    applyStep(steps.length, steps);
    setMovesCount((c) => c + steps.length);
    toast.success(`⚡ 최단 탈출 치트! 총 ${steps.length}회의 차량 이동으로 탈출에 성공했습니다.`, {
      id: 'rush-hour-status',
    });
  }, [applyStep, stopPlayback, vehicles, won]);

  // 치트키 2: 다음 이동 차량 힌트 (Single Hint)
  const handleSingleHint = useCallback(() => {
    stopPlayback();
    if (won) return;
    const { solved: success, steps } = solveRushHour(vehicles);
    if (success && steps.length > 0) {
      const nextStep = steps[0];
      setHintStep(nextStep);
      setSelectedVehicleId(nextStep.vehicleId);
      toast.info(`💡 힌트 치트: ${getRushHourStepDescription(nextStep)}`, {
        id: 'rush-hour-status',
      });
    } else {
      toast.error('현재 상태에서 탈출 힌트를 찾지 못했습니다.', { id: 'rush-hour-status' });
    }
  }, [stopPlayback, vehicles, won]);

  // Reset
  const handleReset = useCallback(() => {
    stopPlayback();
    setVehicles(currentPreset.vehicles.map((v) => ({ ...v })));
    playbackBaseVehiclesRef.current = null;
    setPlaybackBaseVehicles(null);
    setSelectedVehicleId(null);
    setMovesCount(0);
    setHintStep(null);
    setCurrentStepIndex(0);
    setSolutionSteps([]);
    toast.info('주차장이 초기 상태로 재설정되었습니다.', { id: 'rush-hour-status' });
  }, [currentPreset, stopPlayback]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1]
      ? getRushHourStepDescription(solutionSteps[currentStepIndex - 1])
      : currentStepIndex === 0
        ? '시작 상태 (현재 차량 배치 유지)'
        : null;

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        pb: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Rush Hour (러시아워) 치트키 & 플레이어
          </Typography>
          <Chip label="Traffic Visual Player" size="small" color="primary" variant="soft" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            장애물 차량을 밀어 탈출로를 열거나, 재생 버튼을 눌러 순서대로 비켜주는 과정을
            관람하세요.
          </Typography>
          <PuzzleMediaActions mediaExport={mediaExport} variant="header" />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          overflow: 'hidden',
        }}
      >
        {/* Left: Parking Board Card */}
        <Card
          sx={{
            p: 2,
            flex: 1,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Status Badges */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Chip label={`난이도: ${currentPreset.difficulty}`} size="small" variant="outlined" />
            <Chip label={`이동 횟수: ${movesCount}회`} size="small" color="info" variant="soft" />
            <Chip
              label={
                selectedVehicle ? `선택됨: ${selectedVehicle.name}` : '차량을 클릭하여 조작하세요'
              }
              size="small"
              color={selectedVehicle ? 'warning' : 'default'}
              variant="soft"
            />
          </Box>

          {/* 6x6 Parking Lot with Exit Gate */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              px: 3,
            }}
          >
            <Box
              ref={boardRef}
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 380,
                maxHeight: '100%',
                aspectRatio: '1 / 1',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: `${(EXIT_ROW / GRID_SIZE) * 100}%`,
                  right: -36,
                  height: `${(1 / GRID_SIZE) * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <Chip
                  label="EXIT ➔"
                  color="error"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    height: 22,
                    fontSize: '0.65rem',
                    boxShadow: 2,
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                  bgcolor: 'action.hover',
                  p: 1,
                  borderRadius: 2,
                  border: '3px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  boxShadow: 3,
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      m: 0.25,
                    }}
                  />
                ))}

                {vehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.id;
                  const isHint = hintStep?.vehicleId === v.id;
                  const activeDragOffset = dragOffset?.vehicleId === v.id ? dragOffset.offsetPx : 0;
                  const isDragging = dragOffset?.vehicleId === v.id;

                  const widthPct =
                    v.orientation === 'H' ? (v.length / GRID_SIZE) * 100 : (1 / GRID_SIZE) * 100;
                  const heightPct =
                    v.orientation === 'V' ? (v.length / GRID_SIZE) * 100 : (1 / GRID_SIZE) * 100;
                  const topPct = (v.row / GRID_SIZE) * 100;
                  const leftPct = (v.col / GRID_SIZE) * 100;

                  return (
                    <Box
                      key={v.id}
                      onPointerDown={(event) => handleVehiclePointerDown(event, v)}
                      onPointerMove={(event) => handleVehiclePointerMove(event, v)}
                      onPointerUp={(event) => finishVehicleDrag(event, true)}
                      onPointerCancel={(event) => finishVehicleDrag(event, false)}
                      onClick={() => {
                        stopPlayback();
                        setSelectedVehicleId(v.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: `calc(${topPct}% + 3px)`,
                        left: `calc(${leftPct}% + 3px)`,
                        width: `calc(${widthPct}% - 6px)`,
                        height: `calc(${heightPct}% - 6px)`,
                        bgcolor: v.color,
                        borderRadius: 2,
                        cursor: isPlaying ? 'default' : isDragging ? 'grabbing' : 'grab',
                        boxShadow: isSelected ? 6 : 2,
                        border: isSelected
                          ? '3px solid #FFF'
                          : isHint
                            ? '3px solid #F59E0B'
                            : '2px solid rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: v.orientation === 'V' ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform:
                          v.orientation === 'V'
                            ? `translateY(${activeDragOffset}px)`
                            : `translateX(${activeDragOffset}px)`,
                        transition: isDragging
                          ? 'box-shadow 0.2s'
                          : 'top 0.2s ease, left 0.2s ease, box-shadow 0.2s',
                        zIndex: isSelected ? 5 : 2,
                        userSelect: 'none',
                        touchAction: 'none',
                        color: '#FFF',
                        p: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.72rem', sm: '0.82rem' },
                          fontWeight: 800,
                          textAlign: 'center',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {v.isTarget ? '🚗 HERO' : v.id}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Vehicle Directional Control Pad */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 1.25,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              width: '100%',
              maxWidth: 380,
              minHeight: 48,
              flexShrink: 0,
            }}
          >
            {selectedVehicle ? (
              <>
                <Typography variant="caption" sx={{ fontWeight: 700, mr: 0.5 }}>
                  [{selectedVehicle.name}] 이동:
                </Typography>
                {selectedVehicle.orientation === 'H' ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowBackRoundedIcon />}
                      disabled={!canMoveVehicle(vehicles, selectedVehicle.id, -1)}
                      onClick={() => handleMove(selectedVehicle.id, -1)}
                    >
                      왼쪽
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon />}
                      disabled={!canMoveVehicle(vehicles, selectedVehicle.id, 1)}
                      onClick={() => handleMove(selectedVehicle.id, 1)}
                    >
                      오른쪽
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowUpwardRoundedIcon />}
                      disabled={!canMoveVehicle(vehicles, selectedVehicle.id, -1)}
                      onClick={() => handleMove(selectedVehicle.id, -1)}
                    >
                      위쪽
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowDownwardRoundedIcon />}
                      disabled={!canMoveVehicle(vehicles, selectedVehicle.id, 1)}
                      onClick={() => handleMove(selectedVehicle.id, 1)}
                    >
                      아래쪽
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                💡 주차장 내부 차량을 클릭하면 이동 방향 버튼이 활성화됩니다.
              </Typography>
            )}
          </Box>
        </Card>

        {/* Right: Unified Controls Sidebar */}
        <Card
          sx={{
            width: { xs: '100%', md: 380, lg: 400 },
            flexShrink: 0,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2.5,
            borderRadius: 2,
            overflowY: 'auto',
          }}
        >
          {/* Preset Selector */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              label="난이도 레벨"
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              fullWidth
              size="small"
              disabled={isPlaying}
            >
              {RUSH_HOUR_PRESETS.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.difficulty})
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleReset}
              disabled={isPlaying}
              sx={{ flexShrink: 0, height: 40 }}
              startIcon={<AutorenewRoundedIcon />}
            >
              초기화
            </Button>
          </Box>

          <Divider />

          {/* 🎬 Visual Player Controls */}
          <PuzzlePlayerControls
            variant="plain"
            title="🎬 러시아워 자동 탈출 주행 재생"
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={solutionSteps.length > 0 ? solutionSteps.length : 8}
            onStepChange={handleStepChange}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleResetPlayback}
            speed={speed}
            onSpeedChange={setSpeed}
            currentDescription={currentDescription}
          />

          <Divider />

          {/* Cheat Keys */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              ⚡ 즉시 해결 치트키
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<BoltRoundedIcon />}
              onClick={handleAutoSolve}
              disabled={isPlaying}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              치트키: 전체 즉시 탈출 (Auto Solve)
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<LightbulbRoundedIcon />}
              onClick={handleSingleHint}
              disabled={isPlaying || won}
              sx={{ py: 1, fontWeight: 700 }}
            >
              치트키: 다음 이동 차량 힌트 (Next Hint)
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
