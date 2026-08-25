'use client';

import type { StudioTab } from '../types';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { ErdStudio } from '../components/erd-studio';
import { MathStudio } from '../components/math-studio';
import { ChartStudio } from '../components/chart-studio';

const OrgChartStudio = dynamic(
  () => import('../components/org-chart-studio').then((mod) => mod.OrgChartStudio),
  { ssr: false }
);

// ----------------------------------------------------------------------

export function DiagramView() {
  const [currentTab, setCurrentTab] = useState<StudioTab>('erd');

  return (
    <DashboardContent>
      {/* 1. Page Header & Navigation Sub-Tabs */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.3 }}>
            다이어그램 스튜디오 (Diagram, Math & ERD Studio)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            수식(LaTeX), 그래프(차트), 데이터베이스 ERD, 조직도를 손쉽게 작성하고 실전 예시를
            활용합니다.
          </Typography>
        </Box>

        {/* Studio Mode Tabs */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 0.5,
            borderRadius: 2,
            boxShadow: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.6,
                px: 1.6,
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
              },
            }}
          >
            <Tab
              value="erd"
              label="ERD 관계도"
              icon={<StorageRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              value="math"
              label="수식 & LaTeX"
              icon={<FunctionsRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              value="chart"
              label="그래프 & 차트"
              icon={<ShowChartRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              value="orgChart"
              label="조직도 & 마인드맵"
              icon={<AccountTreeRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Box>

      {/* 2. Active Tab Workspace */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {currentTab === 'erd' && <ErdStudio />}
        {currentTab === 'math' && <MathStudio />}
        {currentTab === 'chart' && <ChartStudio />}
        {currentTab === 'orgChart' && <OrgChartStudio />}
      </Box>
    </DashboardContent>
  );
}
export default DiagramView;
