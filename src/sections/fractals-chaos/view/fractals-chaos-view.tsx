'use client';

import type { FractalsTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { ChaosGameCanvas } from '../components/chaos-game-canvas';
import { MandelbrotCanvas } from '../components/mandelbrot-canvas';
import { LorenzAttractorCanvas } from '../components/lorenz-attractor-canvas';

// ----------------------------------------------------------------------

export function FractalsChaosView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<FractalsTab>('mandelbrot');

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
          <AllInclusiveRoundedIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
          프랙탈 & 카오스 랩 (Fractals & Chaos Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          복소수 평면에서 끝없이 자가유사성을 갖는 만델브로/줄리아 집합과, 무작위 점들의 아핀
          변환으로 피어나는 바른슬리 고사리, 로렌츠 어트랙터의 3D 나비 효과 궤적을 탐구합니다.
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
            value="mandelbrot"
            label="1. 만델브로 & 줄리아 집합 (Deep Zoom)"
            icon={<AllInclusiveRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="chaos-game"
            label="2. 카오스 게임 & 바른슬리 고사리"
            icon={<GrainRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="lorenz"
            label="3. 로렌츠 어트랙터 (3D 나비 효과)"
            icon={<BlurOnRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'mandelbrot' && <MandelbrotCanvas />}
        {currentTab === 'chaos-game' && <ChaosGameCanvas />}
        {currentTab === 'lorenz' && <LorenzAttractorCanvas />}
      </Box>
    </DashboardContent>
  );
}
