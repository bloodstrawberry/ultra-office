'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DataArrayRoundedIcon from '@mui/icons-material/DataArrayRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { FloatInspector } from '../components/float-inspector';
import { RadixBitmaskPanel } from '../components/radix-bitmask-panel';

// ----------------------------------------------------------------------

export function BitLabView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'float' | 'radix'>('float');

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
          <DataArrayRoundedIcon sx={{ fontSize: 32, color: 'warning.main' }} />
          비트 & IEEE-754 부동소수점 랩 (Bit & Binary Lab)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          32비트 IEEE-754 부동소수점의 부호/지수/가수 비트를 실시간으로 조작하고, 0.1+0.2 오차의
          원인과 진법/비트 연산자를 시각적으로 탐구합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="float"
            label="1. IEEE-754 부동소수점 비트 분해기"
            icon={<FunctionsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="radix"
            label="2. 진법 변환 & 비트 연산자 샌드박스"
            icon={<CalculateRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'float' && <FloatInspector />}
        {currentTab === 'radix' && <RadixBitmaskPanel />}
      </Box>
    </DashboardContent>
  );
}
