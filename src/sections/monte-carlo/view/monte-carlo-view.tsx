'use client';

import type { MonteCarloTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AdjustRoundedIcon from '@mui/icons-material/AdjustRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { RandomWalkCanvas } from '../components/random-walk-canvas';
import { BuffonNeedleCanvas } from '../components/buffon-needle-canvas';
import { MonteCarloPiCanvas } from '../components/monte-carlo-pi-canvas';

// ----------------------------------------------------------------------

export function MonteCarloView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<MonteCarloTab>('buffon');

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
          <ScatterPlotRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          몬테카를로 & 기하 확률 랩 (Monte Carlo Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          무작위 난수 투척을 통해 원주율(π)을 구하는 뷔퐁의 바늘(Buffon&apos;s Needle)과 원투척
          시뮬레이션, 아인슈타인의 브라운 운동 및 주식 기하 브라운 운동(GBM) 확산 궤적을 탐구합니다.
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
            value="buffon"
            label="1. 뷔퐁의 바늘 (Buffon's Needle π 근사)"
            icon={<TimelineRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="pi-drop"
            label="2. 원주율(π) 몬테카를로 점 투척"
            icon={<AdjustRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="random-walk"
            label="3. 2D 랜덤 워크 & 브라운 운동 (GBM)"
            icon={<ShowChartRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'buffon' && <BuffonNeedleCanvas />}
        {currentTab === 'pi-drop' && <MonteCarloPiCanvas />}
        {currentTab === 'random-walk' && <RandomWalkCanvas />}
      </Box>
    </DashboardContent>
  );
}
