'use client';

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

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { PuzzleMediaActions } from '../components/puzzle-media-actions';
import { usePuzzleMediaExport } from '../hooks/use-puzzle-media-export';
import { PuzzlePlayerControls } from '../components/puzzle-player-controls';
import {
  canPour,
  executePour,
  WATER_COLORS,
  solveWaterSort,
  isWaterSortWon,
  isTubeComplete,
  WATER_SORT_PRESETS,
  type WaterSortStep,
  type WaterSortFullStep,
  generateWaterSortStates,
} from '../utils/water-sort-solver';

interface ActivePour {
  from: number;
  to: number;
  colorId: number;
  pouredCount: number;
  dx: number;
  dy: number;
  rotation: number;
  streamLeft: number;
  streamTop: number;
  streamHeight: number;
  duration: number;
}

export function PuzzleWaterSortView() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(WATER_SORT_PRESETS[0].id);
  const currentPreset =
    WATER_SORT_PRESETS.find((p) => p.id === selectedPresetId) || WATER_SORT_PRESETS[0];

  const [tubes, setTubes] = useState<number[][]>(() => currentPreset.tubes.map((t) => [...t]));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [poursCount, setPoursCount] = useState<number>(0);

  const playbackBaseTubesRef = useRef<number[][] | null>(null);
  const [, setPlaybackBaseTubes] = useState<number[][] | null>(null);

  // Playback state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<WaterSortFullStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [hintPours, setHintPours] = useState<WaterSortStep | null>(null);
  const [activePour, setActivePour] = useState<ActivePour | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pourTimersRef = useRef<NodeJS.Timeout[]>([]);
  const tubeRefs = useRef<Array<HTMLDivElement | null>>([]);

  const won = isWaterSortWon(tubes);

  // Won toast
  useEffect(() => {
    if (won) {
      toast.success('축하합니다! 모든 시험관의 물을 완벽하게 분류했습니다!', {
        id: 'water-sort-status',
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

  const clearPourTimers = useCallback(() => {
    pourTimersRef.current.forEach(clearTimeout);
    pourTimersRef.current = [];
    setActivePour(null);
  }, []);

  useEffect(
    () => () => {
      pourTimersRef.current.forEach(clearTimeout);
    },
    []
  );

  const animatePour = useCallback(
    (
      from: number,
      to: number,
      nextTubes: number[][],
      pouredCount: number,
      onComplete?: () => void
    ) => {
      const source = tubeRefs.current[from];
      const target = tubeRefs.current[to];
      const board = boardRef.current;
      if (!source || !target || !board) {
        setTubes(nextTubes.map((tube) => [...tube]));
        onComplete?.();
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const direction = targetRect.left >= sourceRect.left ? 1 : -1;
      const duration = Math.max(520, Math.round(980 / speed));
      const sourceCenter = sourceRect.left + sourceRect.width / 2;
      const targetCenter = targetRect.left + targetRect.width / 2;
      const dx = targetCenter - sourceCenter - direction * Math.min(28, targetRect.width * 0.45);
      const pourLift = Math.min(88, targetRect.height * 0.5);
      const dy = targetRect.top - sourceRect.top - pourLift;
      const streamTop = targetRect.top - boardRect.top + board.scrollTop - pourLift - 4;
      const streamBottom = targetRect.top - boardRect.top + board.scrollTop + 12;

      setActivePour({
        from,
        to,
        colorId: tubes[from][tubes[from].length - 1],
        pouredCount,
        dx,
        dy,
        rotation: direction * 74,
        streamLeft: targetCenter - boardRect.left - 4,
        streamTop,
        streamHeight: Math.max(44, streamBottom - streamTop),
        duration,
      });

      const transferTimer = setTimeout(() => {
        setTubes(nextTubes.map((tube) => [...tube]));
      }, duration * 0.57);
      const finishTimer = setTimeout(() => {
        setActivePour(null);
        pourTimersRef.current = [];
        onComplete?.();
      }, duration);
      pourTimersRef.current = [transferTimer, finishTimer];
    },
    [speed, tubes]
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      stopPlayback();
      clearPourTimers();
      setSelectedPresetId(presetId);
      const preset = WATER_SORT_PRESETS.find((p) => p.id === presetId) || WATER_SORT_PRESETS[0];
      setTubes(preset.tubes.map((t) => [...t]));
      playbackBaseTubesRef.current = null;
      setPlaybackBaseTubes(null);
      setSelectedTube(null);
      setPoursCount(0);
      setHintPours(null);
      setSolutionSteps([]);
      setCurrentStepIndex(0);
      toast.info(`[${preset.name} - ${preset.difficulty}] 프리셋이 적용되었습니다.`, {
        id: 'water-sort-preset',
      });
    },
    [clearPourTimers, stopPlayback]
  );

  const handleTubeClick = useCallback(
    (idx: number) => {
      stopPlayback();
      if (won || activePour) return;

      if (selectedTube === null) {
        if (tubes[idx].length > 0) {
          setSelectedTube(idx);
          setHintPours(null);
        }
      } else if (selectedTube === idx) {
        setSelectedTube(null);
      } else {
        if (canPour(tubes, selectedTube, idx)) {
          const res = executePour(tubes, selectedTube, idx);
          if (res) {
            animatePour(selectedTube, idx, res.nextTubes, res.pouredCount, () => {
              setPoursCount((prev) => prev + 1);
            });
            setSolutionSteps([]);
            setCurrentStepIndex(0);
            playbackBaseTubesRef.current = null;
            setPlaybackBaseTubes(null);
          }
        }
        setSelectedTube(null);
        setHintPours(null);
      }
    },
    [activePour, animatePour, selectedTube, stopPlayback, tubes, won]
  );

  // Playback logic: solve from CURRENT tubes to preserve user's manual moves
  const ensureStepsGenerated = useCallback(() => {
    if (solutionSteps.length > 0 && playbackBaseTubesRef.current) {
      return solutionSteps;
    }

    const steps = generateWaterSortStates(tubes);
    if (steps.length === 0) {
      toast.error('현재 상태에서 해결 경로를 찾을 수 없습니다.', { id: 'water-sort-status' });
      return [];
    }

    const base = tubes.map((t) => [...t]);
    playbackBaseTubesRef.current = base;
    setPlaybackBaseTubes(base);
    setSolutionSteps(steps);
    return steps;
  }, [solutionSteps, tubes]);

  const applyStep = useCallback(
    (stepIdx: number, steps: WaterSortFullStep[], base?: number[][]) => {
      setCurrentStepIndex(stepIdx);
      const startTubes = base || playbackBaseTubesRef.current || tubes;
      if (stepIdx === 0) {
        setTubes(startTubes.map((t) => [...t]));
        setHintPours(null);
        setSelectedTube(null);
      } else {
        const step = steps[stepIdx - 1];
        setTubes(step.tubes.map((t) => [...t]));
        setHintPours({ from: step.from, to: step.to });
        setSelectedTube(step.from);
      }
    },
    [tubes]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (activePour) return;

    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    if (currentStepIndex >= steps.length) {
      applyStep(0, steps, playbackBaseTubesRef.current || tubes);
    }
    setIsPlaying(true);
  }, [
    activePour,
    applyStep,
    currentStepIndex,
    ensureStepsGenerated,
    isPlaying,
    stopPlayback,
    tubes,
  ]);

  // Media export (Screenshot & GIF)
  const mediaExport = usePuzzleMediaExport({
    boardRef,
    gameTitle: 'water-sort',
    isPlaying,
    currentStep: currentStepIndex,
    totalSteps: solutionSteps.length,
    speed,
    captureAnimationFrames: true,
    onStartPlay: handleTogglePlay,
  });

  const handleStepChange = useCallback(
    (targetStep: number) => {
      if (activePour) return;
      stopPlayback();
      const steps = ensureStepsGenerated();
      if (targetStep >= 0 && targetStep <= steps.length) {
        applyStep(targetStep, steps, playbackBaseTubesRef.current || tubes);
      }
    },
    [activePour, applyStep, ensureStepsGenerated, stopPlayback, tubes]
  );

  const handlePrevStep = useCallback(() => {
    if (activePour) return;
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1, steps, playbackBaseTubesRef.current || tubes);
    }
  }, [activePour, applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback, tubes]);

  const handleNextStep = useCallback(() => {
    if (activePour) return;
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (currentStepIndex < steps.length) {
      applyStep(currentStepIndex + 1, steps, playbackBaseTubesRef.current || tubes);
    }
  }, [activePour, applyStep, currentStepIndex, ensureStepsGenerated, stopPlayback, tubes]);

  const handleResetPlayback = useCallback(() => {
    if (activePour) return;
    stopPlayback();
    const steps = ensureStepsGenerated();
    if (steps.length > 0) {
      applyStep(0, steps, playbackBaseTubesRef.current || tubes);
    }
  }, [activePour, applyStep, ensureStepsGenerated, stopPlayback, tubes]);

  // Playback ticker: every solver step uses the same physical pour animation as manual play.
  useEffect(() => {
    if (!isPlaying || activePour) return () => {};
    if (currentStepIndex >= solutionSteps.length) {
      stopPlayback();
      setSelectedTube(null);
      return () => {};
    }

    const step = solutionSteps[currentStepIndex];
    const res = executePour(tubes, step.from, step.to);
    if (!res) {
      stopPlayback();
      return () => {};
    }

    const kickoff = setTimeout(
      () => {
        setHintPours({ from: step.from, to: step.to });
        setSelectedTube(step.from);
        animatePour(step.from, step.to, step.tubes, res.pouredCount, () => {
          setCurrentStepIndex((index) => index + 1);
          setPoursCount((count) => count + 1);
        });
      },
      Math.max(80, Math.round(140 / speed))
    );

    return () => clearTimeout(kickoff);
  }, [
    activePour,
    animatePour,
    currentStepIndex,
    isPlaying,
    solutionSteps,
    speed,
    stopPlayback,
    tubes,
  ]);

  // 치트키 1: 전체 완성 치트 (Auto Solve) - 사용자의 현재 물 배치에서 풀이
  const handleAutoSolve = useCallback(() => {
    stopPlayback();
    if (activePour) return;
    if (won) {
      toast.info('이미 모든 튜브의 색상이 정렬되어 있습니다.', { id: 'water-sort-status' });
      return;
    }

    const steps = ensureStepsGenerated();
    if (steps.length === 0) return;

    applyStep(steps.length, steps);
    setPoursCount((c) => c + steps.length);
    toast.success(`⚡ 전체 붓기 완성 치트! 총 ${steps.length}회의 물 붓기로 정렬을 완료했습니다.`, {
      id: 'water-sort-status',
    });
  }, [activePour, applyStep, ensureStepsGenerated, stopPlayback, won]);

  // 치트키 2: 다음 붓기 추천 (Single Hint)
  const handleSingleHint = useCallback(() => {
    stopPlayback();
    if (activePour) return;
    if (won) return;
    const { solved: success, steps } = solveWaterSort(tubes);
    if (success && steps.length > 0) {
      const nextStep = steps[0];
      setHintPours(nextStep);
      setSelectedTube(nextStep.from);
      toast.info(
        `💡 힌트 치트: [튜브 #${nextStep.from + 1}]의 물을 [튜브 #${nextStep.to + 1}]로 부으세요!`,
        { id: 'water-sort-status' }
      );
    } else {
      toast.error('현재 상태에서 유효한 붓기 힌트를 찾지 못했습니다.', {
        id: 'water-sort-status',
      });
    }
  }, [activePour, stopPlayback, tubes, won]);

  // Reset
  const handleReset = useCallback(() => {
    stopPlayback();
    clearPourTimers();
    setTubes(currentPreset.tubes.map((t) => [...t]));
    playbackBaseTubesRef.current = null;
    setPlaybackBaseTubes(null);
    setSelectedTube(null);
    setPoursCount(0);
    setHintPours(null);
    setCurrentStepIndex(0);
    setSolutionSteps([]);
    toast.info('시험관이 초기 상태로 재설정되었습니다.', { id: 'water-sort-status' });
  }, [clearPourTimers, currentPreset, stopPlayback]);

  const currentDescription =
    currentStepIndex > 0 && solutionSteps[currentStepIndex - 1]
      ? solutionSteps[currentStepIndex - 1].description
      : currentStepIndex === 0
        ? '시작 상태 (현재 물 배치 유지)'
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
            Water Sort (워터 소트) 치트키 & 플레이어
          </Typography>
          <Chip label="BFS Visual Player" size="small" color="primary" variant="soft" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
          >
            시험관을 번갈아 선택해 물을 분류하거나, 재생 버튼을 눌러 물이 옮겨 담아지는 과정을
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
        {/* Left: Test Tubes Card */}
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
            <Chip label={`붓기 횟수: ${poursCount}회`} size="small" color="info" variant="soft" />
            <Chip
              label={
                selectedTube !== null
                  ? `선택됨: #${selectedTube + 1}번 튜브`
                  : '튜브를 클릭하여 선택하세요'
              }
              size="small"
              color={selectedTube !== null ? 'warning' : 'default'}
              variant="soft"
            />
          </Box>

          {/* Test Tubes Container */}
          <Box
            ref={boardRef}
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 2, sm: 3, md: 3.5 },
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              overflowY: 'auto',
              position: 'relative',
              isolation: 'isolate',
              backgroundImage: (theme) =>
                `radial-gradient(circle at 50% 110%, ${theme.palette.primary.main}16, transparent 48%)`,
            }}
          >
            {activePour && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  zIndex: 8,
                  pointerEvents: 'none',
                  left: activePour.streamLeft,
                  top: activePour.streamTop,
                  width: 8,
                  height: activePour.streamHeight,
                  borderRadius: '999px',
                  transformOrigin: '50% 0%',
                  background: `linear-gradient(90deg, ${WATER_COLORS[activePour.colorId].color}99 0%, ${WATER_COLORS[activePour.colorId].color} 38%, rgba(255,255,255,0.86) 52%, ${WATER_COLORS[activePour.colorId].color} 72%)`,
                  boxShadow: `0 0 10px ${WATER_COLORS[activePour.colorId].color}88`,
                  animation: `waterStream ${activePour.duration}ms ease-in-out both`,
                  '@keyframes waterStream': {
                    '0%, 42%': { opacity: 0, transform: 'scaleY(0)' },
                    '48%': { opacity: 0.95, transform: 'scaleY(0.2)' },
                    '55%, 73%': { opacity: 1, transform: 'scaleY(1)' },
                    '80%, 100%': { opacity: 0, transform: 'scaleY(0)' },
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    bottom: -5,
                    width: 24,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: WATER_COLORS[activePour.colorId].color,
                    transform: 'translateX(-50%)',
                    filter: 'blur(2px)',
                  },
                }}
              />
            )}
            {tubes.map((tube, idx) => {
              const isSelected = selectedTube === idx;
              const isComplete = isTubeComplete(tube);
              const isHintFrom = hintPours?.from === idx;
              const isHintTo = hintPours?.to === idx;
              const isPourSource = activePour?.from === idx;
              const isPourTarget = activePour?.to === idx;

              return (
                <Box
                  key={idx}
                  onClick={() => handleTubeClick(idx)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: isPlaying || activePour ? 'default' : 'pointer',
                    transform: isSelected && !isPourSource ? 'translateY(-16px)' : 'none',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <Box sx={{ height: 24, mb: 0.5 }}>
                    {isComplete && tube.length > 0 && (
                      <Chip
                        label="완성"
                        size="small"
                        color="success"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    )}
                    {isHintFrom && (
                      <Chip
                        label="붓기 출발"
                        size="small"
                        color="warning"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    )}
                    {isHintTo && (
                      <Chip
                        label="도착지"
                        size="small"
                        color="info"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    )}
                  </Box>

                  {/* Test Tube Glass */}
                  <Box
                    ref={(element: HTMLDivElement | null) => {
                      tubeRefs.current[idx] = element;
                    }}
                    sx={{
                      width: { xs: 42, sm: 50, md: 56 },
                      height: { xs: 135, sm: 160, md: 175 },
                      border: '3px solid',
                      borderColor: isSelected
                        ? 'warning.main'
                        : isHintFrom || isHintTo
                          ? 'primary.main'
                          : 'text.secondary',
                      borderTop: 'none',
                      borderRadius: '0 0 24px 24px',
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      overflow: 'hidden',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      backgroundImage:
                        'linear-gradient(100deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 18%, transparent 35%, rgba(255,255,255,0.16) 82%, rgba(255,255,255,0.38) 100%)',
                      boxShadow: isPourTarget
                        ? `0 0 0 5px ${WATER_COLORS[activePour.colorId].color}22, 0 14px 28px rgba(30, 64, 175, 0.18)`
                        : isSelected
                          ? 6
                          : '0 10px 24px rgba(15, 23, 42, 0.12), inset 3px 0 5px rgba(255,255,255,0.35)',
                      position: 'relative',
                      zIndex: isPourSource ? 10 : 1,
                      transformOrigin: '50% 8px',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      animation: isPourSource
                        ? `waterBottlePour ${activePour.duration}ms cubic-bezier(0.45, 0, 0.2, 1) both`
                        : undefined,
                      '@keyframes waterBottlePour': {
                        '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                        '18%': { transform: 'translate(0, -18px) rotate(0deg)' },
                        '40%': {
                          transform: `translate(${activePour?.dx ?? 0}px, ${(activePour?.dy ?? 0) - 10}px) rotate(0deg)`,
                        },
                        '50%, 74%': {
                          transform: `translate(${activePour?.dx ?? 0}px, ${activePour?.dy ?? 0}px) rotate(${activePour?.rotation ?? 0}deg)`,
                        },
                        '82%': {
                          transform: `translate(${activePour?.dx ?? 0}px, ${(activePour?.dy ?? 0) - 8}px) rotate(0deg)`,
                        },
                        '100%': { transform: 'translate(0, 0) rotate(0deg)' },
                      },
                      '&:hover': {
                        filter: 'brightness(1.03)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        zIndex: 4,
                        inset: '5px auto 14px 7px',
                        width: '17%',
                        borderRadius: '999px',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.04))',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    {tube.map((colorId, layerIdx) => {
                      const colorDef = WATER_COLORS[colorId];
                      return (
                        <Box
                          key={layerIdx}
                          sx={{
                            height: '25%',
                            width: '100%',
                            background: colorDef.gradient,
                            borderTop: '1px solid rgba(255,255,255,0.42)',
                            boxShadow: `inset 0 7px 10px ${colorDef.color}55`,
                            position: 'relative',
                            transition: 'height 0.28s ease, opacity 0.2s ease',
                            animation: isPourTarget
                              ? 'liquidSettle 0.45s ease-out both'
                              : undefined,
                            '@keyframes liquidSettle': {
                              '0%': { transform: 'scaleY(0.76)', opacity: 0.75 },
                              '65%': { transform: 'scaleY(1.06)', opacity: 1 },
                              '100%': { transform: 'scaleY(1)' },
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: '3px 7px auto',
                              height: 3,
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.48)',
                              filter: 'blur(0.4px)',
                            },
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ mt: 0.75, fontWeight: 700, color: 'text.secondary' }}
                  >
                    #{idx + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', flexShrink: 0 }}
          >
            💡 옮길 물이 있는 튜브를 먼저 클릭한 뒤, 같은 색 물이 맨 위에 있거나 비어있는 튜브를
            클릭하면 물이 이동합니다.
          </Typography>
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
              {WATER_SORT_PRESETS.map((p) => (
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
            title="🎬 워터 소트 자동 붓기 재생"
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentStep={currentStepIndex}
            totalSteps={solutionSteps.length > 0 ? solutionSteps.length : 12}
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
              disabled={isPlaying || Boolean(activePour)}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              치트키: 전체 즉시 완성 (Auto Solve)
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<LightbulbRoundedIcon />}
              onClick={handleSingleHint}
              disabled={isPlaying || won || Boolean(activePour)}
              sx={{ py: 1, fontWeight: 700 }}
            >
              치트키: 다음 붓기 추천 (Next Pour Hint)
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
