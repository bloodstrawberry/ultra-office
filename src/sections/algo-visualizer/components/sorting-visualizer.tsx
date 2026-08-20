'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';

import type { SortingAlgorithm, SortStep } from '../types';
import { generateRandomArray, generateSortSteps } from '../utils/sorting-algorithms';

// ----------------------------------------------------------------------

export function SortingVisualizer() {
  const [arraySize, setArraySize] = useState<number>(24);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('quick');
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(50); // ms per step

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize array & steps
  const resetArray = (size: number = arraySize, algo: SortingAlgorithm = algorithm) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const arr = generateRandomArray(size);
    const generatedSteps = generateSortSteps(algo, arr);
    setSteps(generatedSteps);
    setCurrentStepIdx(0);
  };

  useEffect(() => {
    resetArray();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, playbackSpeed]);

  const currentStep = steps[currentStepIdx] || {
    array: [],
    comparing: [],
    swapping: [],
    sorted: [],
    comparisons: 0,
    swaps: 0,
    description: '',
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Control Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>정렬 알고리즘</InputLabel>
            <Select
              value={algorithm}
              label="정렬 알고리즘"
              onChange={(e) => {
                const algo = e.target.value as SortingAlgorithm;
                setAlgorithm(algo);
                resetArray(arraySize, algo);
              }}
            >
              <MenuItem value="quick">퀵 정렬 (Quick Sort) - O(N log N)</MenuItem>
              <MenuItem value="bubble">버블 정렬 (Bubble Sort) - O(N²)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color={isPlaying ? 'warning' : 'primary'}
            startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => setIsPlaying((prev) => !prev)}
            sx={{ fontWeight: 800 }}
          >
            {isPlaying ? '일시 정지' : '시뮬레이션 재생'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<SkipNextRoundedIcon />}
            disabled={currentStepIdx >= steps.length - 1}
            onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
          >
            다음 단계 (Step)
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => resetArray(arraySize, algorithm)}
          >
            새 배열 생성
          </Button>
        </Box>

        {/* Speed Slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 220 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 60 }}>
            재생 속도:
          </Typography>
          <Slider
            size="small"
            value={100 - playbackSpeed}
            min={10}
            max={90}
            onChange={(_, val) => setPlaybackSpeed(100 - (val as number))}
          />
        </Box>
      </Box>

      {/* 2. Stats & Step Explanation Banner */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
          진행 상황: {currentStep.description || '준비'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            비교 횟수: <strong>{currentStep.comparisons}</strong>회
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            위치 교환: <strong>{currentStep.swaps}</strong>회
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            스텝: <strong>{currentStepIdx + 1}</strong> / {steps.length}
          </Typography>
        </Box>
      </Box>

      {/* 3. Bar Chart Canvas */}
      <Box
        sx={{
          height: 380,
          bgcolor: '#0f172a',
          borderRadius: 2,
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: { xs: '3px', sm: '8px' },
          border: '1px solid #1e293b',
        }}
      >
        {currentStep.array.map((value, idx) => {
          const isComparing = currentStep.comparing.includes(idx);
          const isSwapping = currentStep.swapping.includes(idx);
          const isSorted = currentStep.sorted.includes(idx);

          const barColor = isSwapping
            ? '#ef4444' // Red
            : isComparing
              ? '#f59e0b' // Yellow
              : isSorted
                ? '#22c55e' // Green
                : '#38bdf8'; // Sky blue

          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                maxWidth: 32,
                height: `${value * 3.4}px`,
                bgcolor: barColor,
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 0.5,
                transition: 'height 0.1s ease, background-color 0.15s ease',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
