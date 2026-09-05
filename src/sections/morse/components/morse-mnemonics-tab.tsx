'use client';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';

import { MorseMnemonicCard } from './morse-mnemonic-card';
import { getSharedMorsePlayer } from '../utils/morse-audio';
import { MORSE_MNEMONICS, type MorseMnemonicItem } from '../data/morse-mnemonics-data';

// ----------------------------------------------------------------------

export function MorseMnemonicsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MorseMnemonicItem | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const audioPlayer = getSharedMorsePlayer();

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return MORSE_MNEMONICS;
    return MORSE_MNEMONICS.filter(
      (item) =>
        item.letter.includes(q) ||
        item.morse.includes(q) ||
        item.phoneticEn.toUpperCase().includes(q) ||
        item.phoneticKo.includes(q) ||
        item.explanation.includes(q)
    );
  }, [searchQuery]);

  const handlePlayLetter = (morse: string) => {
    audioPlayer.stop();
    audioPlayer.load(morse);
    audioPlayer.play();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        pr: 0.5,
      }}
    >
      {/* Principle Explanation Hero Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbRoundedIcon sx={{ color: 'warning.main', fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            모스 부호의 원리와 시각적 연상 암기법
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          모스 부호는 무작위로 만든 기호가 아닙니다. 알파벳의 <strong>글자 형태(Shape)</strong>,{' '}
          <strong>사용 빈도수(Frequency)</strong>, 그리고 <strong>소리 리듬(Rhythm)</strong>에
          기초한 정교한 정보 설계 시스템입니다.
        </Typography>

        <Grid container spacing={2.5}>
          {/* Card 1: Visual Shape Principle */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  1. 형상 연상 암기법
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                알파벳의 획과 모서리에 <strong>점(•)</strong>과 <strong>선(━)</strong>을
                오버레이하여 시각적으로 기억합니다. (예: <strong>A</strong>는 상단 꼭짓점 점 1개 +
                가로선 1개 = <code>.-</code>)
              </Typography>
            </Card>
          </Grid>

          {/* Card 2: Frequency Optimization */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EqualizerRoundedIcon sx={{ color: 'success.main', fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  2. 빈도수 최적화 원리
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                영어에서 가장 많이 쓰이는 <strong>E</strong>는 가장 짧은 <code>.</code>(점 1개), 두
                번째로 많은 <strong>T</strong>는 <code>-</code>(선 1개)를 배정하여 전신 송신 속도를
                극대화했습니다.
              </Typography>
            </Card>
          </Grid>

          {/* Card 3: Sound & Rhythm */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RecordVoiceOverRoundedIcon sx={{ color: 'info.main', fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  3. 소리 구음법 (Di-Dah / 돈-쓰)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                모스 부호는 눈이 아닌 귀로 익힙니다. 단점은 <strong>디(di)</strong>/
                <strong>돈</strong>, 장점은 <strong>다(dah)</strong>/<strong>쓰-</strong>로 발음하여
                음악적 리듬으로 기억합니다.
              </Typography>
            </Card>
          </Grid>

          {/* Card 4: Standard PARIS Timing */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerRoundedIcon sx={{ color: 'warning.main', fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  4. PARIS 1:3:7 시간 법칙
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                단점 길이(1단위: t)를 기준으로, 장점은 <strong>3t</strong>, 글자 간격은{' '}
                <strong>3t</strong>, 단어 간격은 <strong>7t</strong>의 완벽한 정수 비례 규칙을
                준수합니다.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Interactive Mnemonics Cards Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              알파벳 형상 연상 암기 도감 (A ~ Z)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              각 카드를 클릭하면 상세 해설을 볼 수 있고, 스피커 버튼을 눌러 소리를 들을 수 있습니다.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="알파벳 검색 (예: A, SOS, 돈쓰)..."
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

        <Grid container spacing={2}>
          {filteredList.map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.letter}>
              <MorseMnemonicCard item={item} onSelect={setSelectedItem} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Detail Inspector Dialog */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 3,
            position: 'relative',
          },
        }}
      >
        {selectedItem && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setSelectedItem(null)}
              sx={{ position: 'absolute', top: 12, right: 12 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>

            {/* Large SVG Visual */}
            <Box
              sx={{
                width: 140,
                height: 140,
                my: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 3,
                p: 1.5,
                border: (theme) => `2px dashed ${theme.palette.divider}`,
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
                <text
                  x="50"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontFamily="'Public Sans', sans-serif"
                  fontWeight="900"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="3 3"
                  opacity="0.25"
                >
                  {selectedItem.letter}
                </text>

                {selectedItem.dashes.map((dash, dIdx) => (
                  <line
                    key={`dash-${dIdx}`}
                    x1={dash.x1}
                    y1={dash.y1}
                    x2={dash.x2}
                    y2={dash.y2}
                    stroke="#f59e0b"
                    strokeWidth={dash.width || 8}
                    strokeLinecap="round"
                  />
                ))}

                {selectedItem.dots.map((dot, dotIdx) => (
                  <circle key={`dot-${dotIdx}`} cx={dot.x} cy={dot.y} r={6.5} fill="#f59e0b" />
                ))}
              </svg>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
              {selectedItem.letter}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 900,
                letterSpacing: 4,
                color: 'primary.main',
                my: 1,
              }}
            >
              {selectedItem.morse}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
              <Chip
                label={`영문 발음: ${selectedItem.phoneticEn}`}
                color="info"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`국문 구음: ${selectedItem.phoneticKo}`}
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography
              variant="body1"
              sx={{ mt: 2, mb: 3, color: 'text.secondary', fontWeight: 600 }}
            >
              {selectedItem.explanation}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<VolumeUpRoundedIcon />}
              onClick={() => handlePlayLetter(selectedItem.morse)}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              모스 부호 사운드 재생
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
