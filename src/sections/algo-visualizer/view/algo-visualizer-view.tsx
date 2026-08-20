'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { SortingVisualizer } from '../components/sorting-visualizer';
import { PathfindingVisualizer } from '../components/pathfinding-visualizer';

// ----------------------------------------------------------------------

export function AlgoVisualizerView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'sorting' | 'pathfinding'>('sorting');

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
          <SchemaRoundedIcon sx={{ fontSize: 32, color: 'info.main' }} />
          인터랙티브 알고리즘 & 자료구조 스튜디오 (Algorithm Visualizer)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          퀵/병합 정렬 및 A* 미로 최단 경로 탐색 알고리즘의 동작 과정을 실시간 애니메이션과
          단계별(Step) 재생으로 관찰합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="sorting"
            label="1. 정렬 알고리즘 랩 (Sorting Lab)"
            icon={<BarChartRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="pathfinding"
            label="2. A* 미로 & 최단경로 탐색 (Pathfinding Lab)"
            icon={<AltRouteRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'sorting' && <SortingVisualizer />}
        {currentTab === 'pathfinding' && <PathfindingVisualizer />}
      </Box>
    </DashboardContent>
  );
}
