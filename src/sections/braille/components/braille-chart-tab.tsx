'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import {
  KOREAN_CHOSUNG_BRAILLE,
  KOREAN_JUNGSUNG_BRAILLE,
  KOREAN_JONGSUNG_BRAILLE,
  KOREAN_ABBREVIATIONS,
  ENGLISH_BRAILLE,
  NUMBER_BRAILLE,
  PUNCTUATION_BRAILLE,
} from '../utils/braille-core';
import { BrailleTactileCell } from './braille-tactile-cell';

// ----------------------------------------------------------------------

export function BrailleChartTab() {
  const [activeCategory, setActiveCategory] = useState<'chosung' | 'jungsung' | 'jongsung' | 'abbr' | 'english' | 'number' | 'punct'>('chosung');

  const getCategoryData = () => {
    switch (activeCategory) {
      case 'chosung':
        return Object.entries(KOREAN_CHOSUNG_BRAILLE).filter(([k]) => k !== 'ㅇ');
      case 'jungsung':
        return Object.entries(KOREAN_JUNGSUNG_BRAILLE);
      case 'jongsung':
        return Object.entries(KOREAN_JONGSUNG_BRAILLE).filter(([k]) => k !== '');
      case 'abbr':
        return Object.entries(KOREAN_ABBREVIATIONS);
      case 'english':
        return Object.entries(ENGLISH_BRAILLE);
      case 'number':
        return Object.entries(NUMBER_BRAILLE);
      case 'punct':
        return Object.entries(PUNCTUATION_BRAILLE).filter(([k]) => k !== ' ');
      default:
        return [];
    }
  };

  const data = getCategoryData();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={(_, val) => setActiveCategory(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTab-root': { fontWeight: 700, minHeight: 44 } }}
      >
        <Tab value="chosung" label="한글 첫소리(초성)" />
        <Tab value="jungsung" label="한글 가운뎃소리(중성)" />
        <Tab value="jongsung" label="한글 끝소리(종성)" />
        <Tab value="abbr" label="한글 약자 / 약어" />
        <Tab value="number" label="숫자 (0-9)" />
        <Tab value="english" label="영문 알파벳 (A-Z)" />
        <Tab value="punct" label="문장 부호" />
      </Tabs>

      {/* Grid of Braille Cells */}
      <Grid container spacing={2}>
        {data.map(([label, brailleChars]) => (
          <Grid size={{ xs: 4, sm: 3, md: 2, lg: 1.5 }} key={`item-${label}`}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1,
                bgcolor: 'background.paper',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.customShadows?.z4,
                },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                {label}
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {Array.from(brailleChars).map((ch, idx) => (
                  <BrailleTactileCell key={`${label}-ch-${idx}`} char={ch} size="small" />
                ))}
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {brailleChars}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
