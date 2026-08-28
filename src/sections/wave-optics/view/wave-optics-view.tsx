'use client';

import type { WaveOpticsTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import BlurCircularRoundedIcon from '@mui/icons-material/BlurCircularRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { DoubleSlitCanvas } from '../components/double-slit-canvas';
import { SnellOpticsCanvas } from '../components/snell-optics-canvas';
import { FourierSeriesCanvas } from '../components/fourier-series-canvas';

// ----------------------------------------------------------------------

export function WaveOpticsView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<WaveOpticsTab>('fourier');

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <WavesRoundedIcon sx={{ fontSize: 32, color: 'success.main' }} />
          파동, 광학 & 푸리에 분석 랩 (Wave, Optics & Fourier Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          회전하는 원들의 합으로 파형을 분해하고 합성하는 푸리에 급수(Fourier Series)와, 영(Young)의
          이중 슬릿 파동 간섭 무늬, 스넬의 법칙 굴절·전반사 및 프리즘 무지개 분산을
          시뮬레이션합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="fourier"
            label="1. 푸리에 급수 & 에피사이클 파형 합성"
            icon={<BlurCircularRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="double-slit"
            label="2. 이중 슬릿 파동 간섭 (Young's Experiment)"
            icon={<WavesRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="snell-optics"
            label="3. 스넬의 법칙 굴절 & 프리즘 분산"
            icon={<LightModeRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'fourier' && <FourierSeriesCanvas />}
        {currentTab === 'double-slit' && <DoubleSlitCanvas />}
        {currentTab === 'snell-optics' && <SnellOpticsCanvas />}
      </Box>
    </DashboardContent>
  );
}
