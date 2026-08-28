'use client';

import React, { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { SortingVisualizer } from '../visualizer/SortingVisualizer';
import { ALGORITHMS, DEFAULT_SORT_ARRAY } from '../../lib/algorithms/registry';
import { type AlgorithmId } from '../../lib/algorithms/types';

export function CompareTab() {
  const [algoAId, setAlgoAId] = useState<AlgorithmId>('quickSort');
  const [algoBId, setAlgoBId] = useState<AlgorithmId>('bubbleSort');

  const [stepIdxA, setStepIdxA] = useState<number>(0);
  const [stepIdxB, setStepIdxB] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  // Generate steps on algo change using useMemo (pure derived state)
  const stepsA = useMemo(() => {
    const algoA = ALGORITHMS[algoAId];
    return algoA ? algoA.generateSteps(DEFAULT_SORT_ARRAY) : [];
  }, [algoAId]);

  const stepsB = useMemo(() => {
    const algoB = ALGORITHMS[algoBId];
    return algoB ? algoB.generateSteps(DEFAULT_SORT_ARRAY) : [];
  }, [algoBId]);

  const handleSelectAlgoA = (id: AlgorithmId) => {
    setAlgoAId(id);
    setStepIdxA(0);
    setIsPlaying(false);
  };

  const handleSelectAlgoB = (id: AlgorithmId) => {
    setAlgoBId(id);
    setStepIdxB(0);
    setIsPlaying(false);
  };

  // Synchronized playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(80, Math.floor(500 / speed));
    const timer = setInterval(() => {
      let active = false;

      setStepIdxA((prevA) => {
        if (prevA < stepsA.length - 1) {
          active = true;
          return prevA + 1;
        }
        return prevA;
      });

      setStepIdxB((prevB) => {
        if (prevB < stepsB.length - 1) {
          active = true;
          return prevB + 1;
        }
        return prevB;
      });

      if (!active) {
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, stepsA.length, stepsB.length]);

  const currentStepA = stepsA[stepIdxA] ||
    stepsA[0] || {
      stepIndex: 0,
      line: 1,
      description: '',
      variables: {},
    };

  const currentStepB = stepsB[stepIdxB] ||
    stepsB[0] || {
      stepIndex: 0,
      line: 1,
      description: '',
      variables: {},
    };

  const algoA = ALGORITHMS[algoAId] || ALGORITHMS.quickSort;
  const algoB = ALGORITHMS[algoBId] || ALGORITHMS.bubbleSort;

  const sortingAlgos = Object.values(ALGORITHMS).filter((a) => a.category === 'sorting');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Header Toolbar */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Algo A Selector */}
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="algo-a-label">알고리즘 A</InputLabel>
            <Select
              labelId="algo-a-label"
              value={algoAId}
              label="알고리즘 A"
              onChange={(e) => handleSelectAlgoA(e.target.value as AlgorithmId)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {sortingAlgos.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.icon} {a.name} ({a.complexity.timeAverage})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CompareArrowsRoundedIcon sx={{ color: 'text.secondary' }} />

          {/* Algo B Selector */}
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="algo-b-label">알고리즘 B</InputLabel>
            <Select
              labelId="algo-b-label"
              value={algoBId}
              label="알고리즘 B"
              onChange={(e) => handleSelectAlgoB(e.target.value as AlgorithmId)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {sortingAlgos.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.icon} {a.name} ({a.complexity.timeAverage})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Playback Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Speed Buttons */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: 'background.paper',
              p: 0.5,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {[0.5, 1, 2, 4].map((s) => (
              <Button
                key={s}
                size="small"
                variant={speed === s ? 'contained' : 'text'}
                color={speed === s ? 'primary' : 'inherit'}
                onClick={() => setSpeed(s)}
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {s}x
              </Button>
            ))}
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => {
              setStepIdxA(0);
              setStepIdxB(0);
              setIsPlaying(false);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            리셋
          </Button>

          <Button
            variant="contained"
            color={isPlaying ? 'warning' : 'primary'}
            startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{ borderRadius: 2, fontWeight: 800, px: 2.5 }}
          >
            {isPlaying ? '일시정지' : '동시 실행'}
          </Button>
        </Box>
      </Card>

      {/* 2. Side-by-Side Comparison Split View */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Left: Algorithm A */}
        <Card
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4">{algoA.icon}</Typography>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {algoA.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                >
                  {algoA.englishName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}
              >
                {stepIdxA + 1} / {stepsA.length} 단계
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                평균 {algoA.complexity.timeAverage}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <SortingVisualizer step={currentStepA} />
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}
            >
              {currentStepA.description || '시작 준비'}
            </Typography>
          </Box>
        </Card>

        {/* Right: Algorithm B */}
        <Card
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4">{algoB.icon}</Typography>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {algoB.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                >
                  {algoB.englishName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: 'secondary.main', fontFamily: 'monospace' }}
              >
                {stepIdxB + 1} / {stepsB.length} 단계
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                평균 {algoB.complexity.timeAverage}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <SortingVisualizer step={currentStepB} />
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}
            >
              {currentStepB.description || '시작 준비'}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
