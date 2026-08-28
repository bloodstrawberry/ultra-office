'use client';

import type { NormalLabTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { CltSimulator } from '../components/clt-simulator';
import { NormalCalcPanel } from '../components/normal-calc-panel';
import { BoxMullerQqPanel } from '../components/box-muller-qq-panel';
import { GaltonBoardCanvas } from '../components/galton-board-canvas';
import { DiceCoinSimulator } from '../components/dice-coin-simulator';

// ----------------------------------------------------------------------

export function NormalDistributionView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<NormalLabTab>('galton');

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
          <AutoGraphRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          정규분포 & 확률통계 랩 (Normal Distribution & Stats Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          수천 개의 구슬이 핀을 부딪혀 종 모양 곡선을 형성하는 골턴 보드 물리 시뮬레이션부터, 임의의
          모집단에서 정규분포로 수렴하는 중심극한정리(CLT), Z-Score 확률 계산 및 Q-Q 플롯 정규성
          검정을 탐구합니다.
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
            value="galton"
            label="1. 골턴 보드 물리 시뮬레이터 (Galton Board)"
            icon={<ViewColumnRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="clt"
            label="2. 중심극한정리 실험실 (CLT Lab)"
            icon={<AnalyticsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="calc"
            label="3. 정규분포 곡선 & Z-Score 계산기"
            icon={<FunctionsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="dice"
            label="4. 주사위 & 동전 합산 수렴 랩"
            icon={<CasinoRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="box-muller"
            label="5. Box-Muller 난수 & Q-Q 플롯"
            icon={<TimelineRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Content Viewports */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'galton' && <GaltonBoardCanvas />}
        {currentTab === 'clt' && <CltSimulator />}
        {currentTab === 'calc' && <NormalCalcPanel />}
        {currentTab === 'dice' && <DiceCoinSimulator />}
        {currentTab === 'box-muller' && <BoxMullerQqPanel />}
      </Box>
    </DashboardContent>
  );
}
