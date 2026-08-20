'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import SportsBaseballRoundedIcon from '@mui/icons-material/SportsBaseballRounded';
import BiotechRoundedIcon from '@mui/icons-material/BiotechRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhysicsCanvas } from '../components/physics-canvas';
import { ChemistryLabPanel } from '../components/chemistry-lab-panel';

// ----------------------------------------------------------------------

export function PhysicsSandboxView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'physics' | 'chemistry'>('physics');

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
          <ScienceRoundedIcon sx={{ fontSize: 32, color: 'success.main' }} />
          2D 물리 & 과학 샌드박스 (Physics & Science Sandbox)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          중력/탄성/마찰력이 동작하는 2D 강체 물리 샌드박스와 이중 진자(Double Pendulum) 카오스를
          시뮬레이션하고, 화학 반응식 양론 계수를 자동 계산합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="physics"
            label="1. 2D 물리 엔진 샌드박스 (Physics Lab)"
            icon={<SportsBaseballRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="chemistry"
            label="2. 화학 반응식 밸런서 & 주기율표 (Chemistry Lab)"
            icon={<BiotechRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'physics' && <PhysicsCanvas />}
        {currentTab === 'chemistry' && <ChemistryLabPanel />}
      </Box>
    </DashboardContent>
  );
}
