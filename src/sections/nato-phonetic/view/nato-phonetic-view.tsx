'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
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
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.5,
            mb: 3,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                NATO 음성 알파벳 & 무선 통화표
              </Typography>
              <Chip
                label="ICAO / NATO & 경찰·군 표준"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="무전기 음성 교신 방송"
                size="small"
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              항공, 군사, 통신 현장에서 혼선 없이 정확한 철자 전송을 위한 NATO 음성 알파벳(Alfa, Bravo..) 및
              대한민국 경찰·군 통화표(기러기, 나비..) 변환과 실시간 무전 방송을 지원합니다.
            </Typography>
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Card
          sx={{
            mb: 3,
            p: 0.75,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 48,
                borderRadius: 1.5,
              },
            }}
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
        </Card>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          {currentTab === 'converter' && <NatoConverterTab />}
          {currentTab === 'chart' && <NatoChartTab />}
        </Box>
      </Box>
    </DashboardContent>
  );
}
