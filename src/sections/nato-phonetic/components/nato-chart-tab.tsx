'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';

import {
  NATO_ALPHABET_MAP,
  NATO_NUMBER_MAP,
  KOREAN_PHONETIC_MAP,
  KOREAN_NUMBER_MAP,
} from '../utils/phonetic-data';
import { walkieTalkie } from '../utils/walkie-talkie-audio';

// ----------------------------------------------------------------------

export function NatoChartTab() {
  const [activeTab, setActiveTab] = useState<'nato' | 'korean' | 'number'>('nato');

  const handleSpeakWord = (word: string, isKo = false) => {
    walkieTalkie.speakWords([word], isKo ? 'ko-KR' : 'en-US');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTab-root': { fontWeight: 700, minHeight: 44 } }}
      >
        <Tab value="nato" label="국제 표준 NATO 음성 알파벳 (A-Z)" />
        <Tab value="korean" label="대한민국 경찰·군 표준 통화표 (가나다..)" />
        <Tab value="number" label="항공 및 군용 숫자 통화표 (0-9)" />
      </Tabs>

      <Grid container spacing={2}>
        {activeTab === 'nato' &&
          Object.values(NATO_ALPHABET_MAP).map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={`nato-${item.char}`}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.z4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {item.char}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleSpeakWord(item.word, false)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <VolumeUpRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {item.word}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  발음: [{item.pronunciation}]
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'info.main' }}>
                  모스: {item.morse}
                </Typography>
              </Card>
            </Grid>
          ))}

        {activeTab === 'korean' &&
          Object.values(KOREAN_PHONETIC_MAP).map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={`ko-${item.char}`}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.z4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {item.char}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleSpeakWord(item.word, true)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <VolumeUpRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {item.word}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  호출 단어: {item.word}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'info.main' }}>
                  모스: {item.morse}
                </Typography>
              </Card>
            </Grid>
          ))}

        {activeTab === 'number' &&
          Object.values(NATO_NUMBER_MAP).map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={`num-${item.char}`}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.z4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {item.char}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleSpeakWord(item.word, false)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <VolumeUpRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {item.word}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  발음: [{item.pronunciation}]
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'info.main' }}>
                  모스: {item.morse}
                </Typography>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
