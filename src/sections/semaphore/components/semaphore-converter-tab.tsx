'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { SemaphoreFlagCanvas } from './semaphore-flag-canvas';
import { REST_SEMAPHORE, textToSemaphore, type SemaphoreItem } from '../utils/semaphore-data';

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

  const currentActiveFlag =
    activePlayIndex !== null && flags[activePlayIndex] ? flags[activePlayIndex] : REST_SEMAPHORE;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minHeight: 0 }}>
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
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              문자열 입력 (A-Z 알파벳)
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setInputText('')} disabled={!inputText}>
            <ClearRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          size="small"
          value={inputText}
          onChange={(e) => setInputText(e.target.value.toUpperCase())}
          placeholder="수기 신호로 변환할 영문 단어를 입력하세요 (예: HELP, SOS)"
          variant="outlined"
        />
      </Card>

      {/* Vertical Resizable Panels: Live Stage & Sequence Cards */}
      <ResizablePanelGroup
        orientation="vertical"
        autoSaveId="semaphore-converter-split"
        sx={{ flex: '1 1 0px', minHeight: 0 }}
      >
        {/* Top: Live Animated Signalman Display Card */}
        <ResizablePanel id="semaphore-stage" defaultSize={45} minSize={30}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              height: '100%',
              bgcolor: 'background.paper',
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  🚩 실시간 수기 신호병 애니메이션 (Signalman Stage)
                </Typography>
                <Chip
                  label={isPlaying ? '송신 중...' : '대기'}
                  size="small"
                  color={isPlaying ? 'warning' : 'default'}
                  variant="soft"
                  sx={{ height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={isPlaying ? 'warning' : 'primary'}
                  startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={handlePlay}
                  disabled={flags.length === 0}
                  sx={{ fontWeight: 700 }}
                >
                  {isPlaying ? '일시정지' : '수기 신호 재생'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<StopRoundedIcon />}
                  onClick={handleStop}
                  disabled={!isPlaying && activePlayIndex === null}
                >
                  정지
                </Button>
              </Box>
            </Box>

            {/* Big Animated Center Stage */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, my: 0.5 }}>
              <SemaphoreFlagCanvas item={currentActiveFlag} size={120} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}
                >
                  {currentActiveFlag.char}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {currentActiveFlag.description}
                </Typography>
                {currentActiveFlag.flagMeaning && (
                  <Chip
                    label={`국제 해상 의미: ${currentActiveFlag.flagMeaning}`}
                    color="info"
                    variant="soft"
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 700, height: 24 }}
                  />
                )}
              </Box>
            </Box>
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="vertical" tooltipText="상하 높이 조절" />

        {/* Bottom: Sequence of Flag Cards */}
        <ResizablePanel id="semaphore-sequence" defaultSize={55} minSize={30}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              height: '100%',
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, flexShrink: 0 }}>
              전체 수기 신호 시퀀스 ({flags.length}자)
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.2,
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                alignContent: 'flex-start',
              }}
            >
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
                      transform: isCurrent ? 'scale(1.06)' : 'none',
                      transition: 'all 0.15s ease',
                      border: (theme) =>
                        isCurrent ? `2px solid ${theme.palette.warning.main}` : 'none',
                      borderRadius: 2,
                    }}
                  >
                    <SemaphoreFlagCanvas item={item} size={76} />
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}
