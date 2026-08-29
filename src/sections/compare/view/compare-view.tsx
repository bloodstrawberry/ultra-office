'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { TextDiffTab } from '../components/text-diff-tab';
import { LineCompareTab } from '../components/line-compare-tab';

// ----------------------------------------------------------------------

type TabCategory = 'text' | 'line';

export function CompareView() {
  const [currentTab, setCurrentTab] = useState<TabCategory>('text');

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          데이터 비교 스튜디오 (Data Diff & Compare)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          소스 코드·텍스트 정밀 Diff, 목록 라인 교집합/차집합 분석을 제공합니다.
        </Typography>
      </Box>

      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v: TabCategory) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="텍스트 Diff 비교"
            value="text"
            icon={<TextSnippetRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="라인 목록 비교 (교집합·차집합)"
            value="line"
            icon={<FormatListNumberedRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {currentTab === 'text' && <TextDiffTab />}
        {currentTab === 'line' && <LineCompareTab />}
      </Box>
    </DashboardContent>
  );
}
