'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { CipherConverterTab } from '../components/cipher-converter-tab';
import { CipherBruteforceTab } from '../components/cipher-bruteforce-tab';

// ----------------------------------------------------------------------

export function CipherView() {
  const [currentTab, setCurrentTab] = useState<'cipher' | 'bruteforce'>('cipher');

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
                고전 암호학 스튜디오 (Cipher Studio)
              </Typography>
              <Chip
                label="시저 / 비제네르 / ROT13 / 앳배쉬"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="전수 조사 브루트포스 해독"
                size="small"
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              고대 로마 카이사르 암호부터 비제네르 다중 치환 암호, 레일 펜스 전위 암호까지
              실시간 암호화/복호화 및 시각적 회전 휠을 제공합니다.
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
              value="cipher"
              icon={<LockRoundedIcon />}
              iconPosition="start"
              label="암호화 & 복호화 스튜디오"
            />
            <Tab
              value="bruteforce"
              icon={<KeyRoundedIcon />}
              iconPosition="start"
              label="카이사르 전수 조사 (Brute-Force)"
            />
          </Tabs>
        </Card>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          {currentTab === 'cipher' && <CipherConverterTab />}
          {currentTab === 'bruteforce' && <CipherBruteforceTab />}
        </Box>
      </Box>
    </DashboardContent>
  );
}
