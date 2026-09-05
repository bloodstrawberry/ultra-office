'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { CipherConverterTab } from '../components/cipher-converter-tab';
import { CipherBruteforceTab } from '../components/cipher-bruteforce-tab';

// ----------------------------------------------------------------------

export function CipherView() {
  const [currentTab, setCurrentTab] = useState<'cipher' | 'bruteforce'>('cipher');

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
            고전 암호학 스튜디오 (Cipher Studio)
          </Typography>
          <Chip
            label="시저 / 비제네르 / ROT13 / 앳배쉬"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          고대 로마 카이사르 암호부터 비제네르 다중 치환 암호, 레일 펜스 전위 암호까지 실시간
          암호화/복호화 및 시각적 회전 휠을 제공합니다.
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
        {currentTab === 'cipher' && <CipherConverterTab />}
        {currentTab === 'bruteforce' && <CipherBruteforceTab />}
      </Box>
    </DashboardContent>
  );
}
