'use client';

import type { CellularTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import HiveRoundedIcon from '@mui/icons-material/HiveRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { WolframCaCanvas } from '../components/wolfram-ca-canvas';
import { GameOfLifeCanvas } from '../components/game-of-life-canvas';

// ----------------------------------------------------------------------

export function CellularAutomataView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<CellularTab>('life-game');

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
          <HiveRoundedIcon sx={{ fontSize: 32, color: 'info.main' }} />
          셀룰러 오토마타 & 라이프 게임 (Cellular Automata & Life Game)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          단순한 규칙에서 스스로 진화하며 인공 생명체를 형성하는 콘웨이의 라이프 게임(B3/S23)과,
          튜링 완전성을 갖는 울프럼 1차원 셀룰러 오토마타를 시뮬레이션합니다.
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
            value="life-game"
            label="1. 콘웨이의 생명 게임 (Conway's Game of Life)"
            icon={<HiveRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="wolfram-1d"
            label="2. 울프럼 1D 셀룰러 오토마타 (Rule 30, 90, 110)"
            icon={<ViewStreamRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'life-game' && <GameOfLifeCanvas />}
        {currentTab === 'wolfram-1d' && <WolframCaCanvas />}
      </Box>
    </DashboardContent>
  );
}
