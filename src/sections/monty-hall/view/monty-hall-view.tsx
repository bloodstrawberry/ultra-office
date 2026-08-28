'use client';

import type { MontyHallTab } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { MontyHallGame } from '../components/monty-hall-game';
import { BirthdayParadoxPanel } from '../components/birthday-paradox-panel';
import { SimpsonsParadoxPanel } from '../components/simpsons-paradox-panel';
import { PrisonersDilemmaPanel } from '../components/prisoners-dilemma-panel';

// ----------------------------------------------------------------------

export function MontyHallView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<MontyHallTab>('monty-hall');

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
          <MeetingRoomRoundedIcon sx={{ fontSize: 32, color: 'warning.main' }} />
          몬티홀 & 확률 역설 랩 (Monty Hall & Probability Paradoxes)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          인간의 직관을 깨뜨리는 유명한 몬티홀 딜레마 게임 및 10만 회 검증부터, 생일 역설(Birthday
          Paradox), 반복 죄수의 딜레마 게임이론, 심슨의 역설까지 확률과 통계의 신비로운 역설들을
          탐구합니다.
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
            value="monty-hall"
            label="1. 몬티홀 딜레마 게임 & 대량 검증"
            icon={<MeetingRoomRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="birthday"
            label="2. 생일 역설 (Birthday Paradox)"
            icon={<CakeRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="prisoners"
            label="3. 반복 죄수의 딜레마 (Game Theory)"
            icon={<GroupsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="simpsons"
            label="4. 심슨의 역설 (Simpson's Paradox)"
            icon={<CompareArrowsRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'monty-hall' && <MontyHallGame />}
        {currentTab === 'birthday' && <BirthdayParadoxPanel />}
        {currentTab === 'prisoners' && <PrisonersDilemmaPanel />}
        {currentTab === 'simpsons' && <SimpsonsParadoxPanel />}
      </Box>
    </DashboardContent>
  );
}
