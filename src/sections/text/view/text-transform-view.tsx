'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { FormatConvertTab } from '../components/format-convert-tab';
import { ContentProcessorTab } from '../components/content-processor-tab';

// ----------------------------------------------------------------------

type TabCategory = 'format' | 'content';

export function TextTransformView() {
  const [currentTab, setCurrentTab] = useState<TabCategory>('format');

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        pb: 2,
      }}
    >
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          텍스트 변환 스튜디오 (Text Transform)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          JSON·CSV·XML·YAML 구조 데이터 상호 변환 및 텍스트 가공·인코딩을 제공합니다.
        </Typography>
      </Box>

      <Box sx={{ flexShrink: 0, mb: 1.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v: TabCategory) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. 구조 데이터 변환 (JSON ⇄ CSV ⇄ XML ⇄ YAML)"
            value="format"
            icon={<TransformRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. 텍스트 가공 & 보안/인코딩"
            value="content"
            icon={<CodeRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {currentTab === 'format' && <FormatConvertTab />}
        {currentTab === 'content' && <ContentProcessorTab />}
      </Box>
    </DashboardContent>
  );
}
