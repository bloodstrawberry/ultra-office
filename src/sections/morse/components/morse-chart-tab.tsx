'use client';

import React, { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import {
  KOREAN_MORSE_MAP,
  INTERNATIONAL_MORSE_MAP,
  getMorseTimingEvents,
} from '../utils/morse-core';
import { getSharedMorsePlayer } from '../utils/morse-audio';

// ----------------------------------------------------------------------

interface MorseItem {
  char: string;
  code: string;
  category: 'korean' | 'english' | 'number' | 'symbol' | 'emergency';
  desc?: string;
}

const EMERGENCY_PROSIGNS: MorseItem[] = [
  {
    char: 'SOS',
    code: '... --- ...',
    category: 'emergency',
    desc: '국제 조난 구조 신호 (Save Our Souls)',
  },
  {
    char: 'MAYDAY',
    code: '-- .- -.-- -.. .- -.--',
    category: 'emergency',
    desc: '음성 및 무선 긴급 구조 요청',
  },
  {
    char: 'CQ',
    code: '-.-. --.-',
    category: 'emergency',
    desc: '모든 무선국을 호출함 (Calling Any Station)',
  },
  {
    char: '73',
    code: '--... ...--',
    category: 'emergency',
    desc: '안부를 전하며 작별 인사 (Best Regards)',
  },
  {
    char: '88',
    code: '---.. ---..',
    category: 'emergency',
    desc: '사랑과 키스를 담아 (Love and Kisses)',
  },
  {
    char: 'SK',
    code: '...-.-',
    category: 'emergency',
    desc: '교신 완전 종료 (End of Transmission)',
  },
  {
    char: 'AR',
    code: '.-.-.',
    category: 'emergency',
    desc: '송신 종료 / 응답 대기 (End of Message)',
  },
  { char: 'BT', code: '-...-', category: 'emergency', desc: '문장 분리 / 절 구분 (Break)' },
  { char: 'K', code: '-.-', category: 'emergency', desc: '송신 요청 (Invitation to Transmit)' },
];

export function MorseChartTab() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const audioPlayer = getSharedMorsePlayer();

  // Build complete items list
  const allItems: MorseItem[] = useMemo(() => {
    const list: MorseItem[] = [];

    // Korean
    Object.entries(KOREAN_MORSE_MAP).forEach(([char, code]) => {
      list.push({ char, code, category: 'korean' });
    });

    // English
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((char) => {
      if (INTERNATIONAL_MORSE_MAP[char]) {
        list.push({ char, code: INTERNATIONAL_MORSE_MAP[char], category: 'english' });
      }
    });

    // Numbers
    '0123456789'.split('').forEach((char) => {
      if (INTERNATIONAL_MORSE_MAP[char]) {
        list.push({ char, code: INTERNATIONAL_MORSE_MAP[char], category: 'number' });
      }
    });

    // Symbols
    const symbols = [
      '.',
      ',',
      '?',
      "'",
      '!',
      '/',
      '(',
      ')',
      '&',
      ':',
      ';',
      '=',
      '+',
      '-',
      '_',
      '"',
      '$',
      '@',
    ];
    symbols.forEach((char) => {
      if (INTERNATIONAL_MORSE_MAP[char]) {
        list.push({ char, code: INTERNATIONAL_MORSE_MAP[char], category: 'symbol' });
      }
    });

    // Emergency Prosigns
    list.push(...EMERGENCY_PROSIGNS);

    return list;
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allItems.filter((item) => {
      // Tab filter
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      // Search filter
      if (query) {
        const matchChar = item.char.toLowerCase().includes(query);
        const matchCode = item.code.includes(query);
        const matchDesc = item.desc?.toLowerCase().includes(query) ?? false;
        return matchChar || matchCode || matchDesc;
      }

      return true;
    });
  }, [allItems, activeTab, searchQuery]);

  // Play Morse item sound
  const handlePlayItem = (code: string) => {
    audioPlayer.stop();
    audioPlayer.load(code);
    audioPlayer.play();
  };

  // Copy code
  const handleCopyCode = (char: string, code: string) => {
    navigator.clipboard.writeText(`${char}: ${code}`);
    setCopiedKey(char);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Search & Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 700, minHeight: 44 },
          }}
        >
          <Tab value="all" label="전체 보기" />
          <Tab value="korean" label="한글 자모" />
          <Tab value="english" label="영문 알파벳" />
          <Tab value="number" label="숫자 (0-9)" />
          <Tab value="symbol" label="특수기호" />
          <Tab value="emergency" label="조난 & 전신 약어" />
        </Tabs>

        <TextField
          size="small"
          placeholder="문자 또는 부호 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', sm: 260 } }}
        />
      </Box>

      {/* Grid of Morse Code Cards */}
      <Grid container spacing={2}>
        {filteredItems.map((item) => {
          const isCopied = copiedKey === item.char;

          return (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={`${item.category}-${item.char}`}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.z8,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: item.category === 'emergency' ? 'error.main' : 'primary.main',
                    }}
                  >
                    {item.char}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handlePlayItem(item.code)}
                      sx={{ bgcolor: 'action.hover' }}
                    >
                      <VolumeUpRoundedIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleCopyCode(item.char, item.code)}
                      sx={{ bgcolor: 'action.hover' }}
                    >
                      {isCopied ? (
                        <CheckRoundedIcon fontSize="small" color="success" />
                      ) : (
                        <ContentCopyRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    letterSpacing: 2,
                    color: 'text.primary',
                    my: 0.5,
                  }}
                >
                  {item.code}
                </Typography>

                {item.desc && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 32,
                    }}
                  >
                    {item.desc}
                  </Typography>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredItems.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            검색 결과가 없습니다.
          </Typography>
          <Typography variant="body2">다른 검색어나 카테고리 탭을 선택해보세요.</Typography>
        </Box>
      )}
    </Box>
  );
}
