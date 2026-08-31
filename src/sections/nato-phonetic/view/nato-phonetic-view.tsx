'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { NatoConverterTab } from '../components/nato-converter-tab';
import { NatoChartTab } from '../components/nato-chart-tab';

// ----------------------------------------------------------------------

export function NatoPhoneticView() {
  const [currentTab, setCurrentTab] = useState<'converter' | 'chart'>('converter');

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            NATO 음성 알파벳 & 무선 통화표
          </Typography>
          <Chip
            label="ICAO / NATO & 경찰·군 표준"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          항공, 군사, 통신 현장에서 혼선 없이 정확한 철자 전송을 위한 NATO 음성 알파벳(Alfa,
          Bravo..) 및 대한민국 경찰·군 통화표(기러기, 나비..) 변환과 실시간 무전 방송을 지원합니다.
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="converter"
            icon={<RecordVoiceOverRoundedIcon />}
            iconPosition="start"
            label="무선 통화표 변환 & 음성 방송"
          />
          <Tab
            value="chart"
            icon={<MenuBookRoundedIcon />}
            iconPosition="start"
            label="NATO & 국문 통화표 도감"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {currentTab === 'converter' && <NatoConverterTab />}
        {currentTab === 'chart' && <NatoChartTab />}
      </Box>
    </DashboardContent>
  );
}
