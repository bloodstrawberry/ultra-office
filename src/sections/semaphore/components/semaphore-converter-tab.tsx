'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';

import { textToSemaphore, REST_SEMAPHORE, type SemaphoreItem } from '../utils/semaphore-data';
import { SemaphoreFlagCanvas } from './semaphore-flag-canvas';

// ----------------------------------------------------------------------

const SEMAPHORE_PRESETS = [
  { label: 'SOS', text: 'SOS' },
  { label: 'HELP ME', text: 'HELP' },
  { label: 'NAVY', text: 'NAVY' },
  { label: 'VICTORY', text: 'VICTORY' },
  { label: 'WELCOME', text: 'WELCOME' },
];

export function SemaphoreConverterTab() {
  const [inputText, setInputText] = useState('HELP');
  const [flags, setFlags] = useState<SemaphoreItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayIndex, setActivePlayIndex] = useState<number | null>(null);

  useEffect(() => {
    setFlags(textToSemaphore(inputText));
  }, [inputText]);

  // Animated Playback
  useEffect(() => {
    if (!isPlaying || flags.length === 0) return () => {};

    let currentIdx = activePlayIndex ?? 0;
    const interval = setInterval(() => {
      if (currentIdx >= flags.length) {
        setIsPlaying(false);
        setActivePlayIndex(null);
        return;
      }
      setActivePlayIndex(currentIdx);
      currentIdx += 1;
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, flags, activePlayIndex]);

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (activePlayIndex === null || activePlayIndex >= flags.length) {
        setActivePlayIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActivePlayIndex(null);
  };

  const currentActiveFlag = activePlayIndex !== null && flags[activePlayIndex] ? flags[activePlayIndex] : REST_SEMAPHORE;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Quick Presets Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          빠른 예시:
        </Typography>
        {SEMAPHORE_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            variant="outlined"
            onClick={() => {
              setInputText(preset.text);
              handleStop();
            }}
            sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          />
        ))}
      </Box>

      {/* Input Card */}
      <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              문자열 입력 (A-Z 알파벳)
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setInputText('')} disabled={!inputText}>
            <ClearRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value.toUpperCase())}
          placeholder="수기 신호로 변환할 영문 단어를 입력하세요 (예: HELP, SOS)"
          variant="outlined"
        />
      </Card>

      {/* Live Animated Signalman Display Card */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              🚩 실시간 수기 신호병 애니메이션 (Signalman Stage)
            </Typography>
            <Chip
              label={isPlaying ? '송신 중...' : '대기'}
              size="small"
              color={isPlaying ? 'warning' : 'default'}
              variant="soft"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color={isPlaying ? 'warning' : 'primary'}
              startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={handlePlay}
              disabled={flags.length === 0}
              sx={{ fontWeight: 700 }}
            >
              {isPlaying ? '일시정지' : '수기 신호 재생'}
            </Button>
            <Button variant="outlined" startIcon={<StopRoundedIcon />} onClick={handleStop} disabled={!isPlaying && activePlayIndex === null}>
              정지
            </Button>
          </Box>
        </Box>

        {/* Big Animated Center Stage */}
        <Box sx={{ my: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SemaphoreFlagCanvas item={currentActiveFlag} size={180} />
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1.5, color: 'primary.main' }}>
            {currentActiveFlag.char}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentActiveFlag.description}
          </Typography>
          {currentActiveFlag.flagMeaning && (
            <Chip label={`국제 해상 의미: ${currentActiveFlag.flagMeaning}`} color="info" variant="soft" sx={{ mt: 1, fontWeight: 700 }} />
          )}
        </Box>
      </Card>

      {/* Sequence of Flag Cards */}
      <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
          전체 수기 신호 시퀀스
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {flags.map((item, idx) => {
            const isCurrent = activePlayIndex === idx;

            return (
              <Box
                key={`flag-${idx}`}
                onClick={() => {
                  setActivePlayIndex(idx);
                  setIsPlaying(false);
                }}
                sx={{
                  cursor: 'pointer',
                  transform: isCurrent ? 'scale(1.08)' : 'none',
                  transition: 'all 0.15s ease',
                  border: (theme) => (isCurrent ? `2px solid ${theme.palette.warning.main}` : 'none'),
                  borderRadius: 2,
                }}
              >
                <SemaphoreFlagCanvas item={item} size={90} />
              </Box>
            );
          })}

          {flags.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              영문 단어를 입력하면 깃발 수기 신호가 여기에 표시됩니다.
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
