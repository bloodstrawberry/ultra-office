'use client';

import type { TypingConfig, TypingStatus } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';

import { IDE_THEMES } from 'src/sections/code-runner/core/editor-themes';

import { keyboardAudio, type KeyboardSoundType, KEYBOARD_SOUND_PROFILES } from '../sound-effect';

interface IdePlayerControlsProps {
  status: TypingStatus;
  config: TypingConfig;
  currentTheme: IDETheme;
  currentChars: number;
  totalChars: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onSkipToEnd: () => void;
  onUpdateConfig: (partial: Partial<TypingConfig>) => void;
  onThemeChange: (themeId: string) => void;
  onSoundTypeChange: (soundType: KeyboardSoundType) => void;
  onOpenCodeInput: () => void;
}

export function IdePlayerControls({
  status,
  config,
  currentTheme,
  currentChars,
  totalChars,
  onPlay,
  onPause,
  onStop,
  onReset,
  onSkipToEnd,
  onUpdateConfig,
  onThemeChange,
  onSoundTypeChange,
  onOpenCodeInput,
}: IdePlayerControlsProps) {
  const isPlaying = status === 'playing';
  const progressPercent =
    totalChars > 0 ? Math.min(100, Math.round((currentChars / totalChars) * 100)) : 0;

  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [soundMenuAnchor, setSoundMenuAnchor] = useState<null | HTMLElement>(null);
  const [speedMenuAnchor, setSpeedMenuAnchor] = useState<null | HTMLElement>(null);

  const speedOptions: {
    id: TypingConfig['speedPreset'];
    label: string;
    subLabel: string;
    ms: number;
    charsPerTick: number;
    desc: string;
  }[] = [
    {
      id: 'slow',
      label: '0.5x 느림',
      subLabel: '22자/초',
      ms: 45,
      charsPerTick: 1,
      desc: '차분한 타건 (약 22자/초)',
    },
    {
      id: 'normal',
      label: '1.0x 표준',
      subLabel: '55자/초',
      ms: 18,
      charsPerTick: 1,
      desc: '자연스러운 인간 개발자 타건 (약 55자/초)',
    },
    {
      id: 'fast',
      label: '2.0x 빠름',
      subLabel: '300자/초',
      ms: 10,
      charsPerTick: 3,
      desc: '빠른 코딩 시연 (약 300자/초)',
    },
    {
      id: 'turbo',
      label: '4.0x 터보',
      subLabel: '1,140자/초',
      ms: 7,
      charsPerTick: 8,
      desc: '초고속 터보 타이핑 (약 1,140자/초)',
    },
    {
      id: 'hacker',
      label: '8.0x 해커',
      subLabel: '3,600자/초',
      ms: 5,
      charsPerTick: 18,
      desc: '영화 속 해커 폭포수 타이핑 (약 3,600자/초)',
    },
    {
      id: 'lightning',
      label: '16.0x 광속',
      subLabel: '10,000자/초',
      ms: 4,
      charsPerTick: 40,
      desc: '순간 완성 광속 모드 (약 10,000자/초)',
    },
  ];

  const currentSoundProfile =
    KEYBOARD_SOUND_PROFILES.find((p) => p.id === config.soundType) || KEYBOARD_SOUND_PROFILES[0];

  const hoverBg = currentTheme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  return (
    <Box
      sx={{
        bgcolor: currentTheme.uiColors.surface,
        borderBottom: `1px solid ${currentTheme.uiColors.border}`,
        px: 2,
        py: 0.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Left: Playback Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Main Play / Pause Button */}
        <Button
          variant="contained"
          onClick={isPlaying ? onPause : onPlay}
          startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          sx={{
            bgcolor: isPlaying ? '#e65100' : '#007acc',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            px: 2,
            py: 0.6,
            borderRadius: 1.5,
            boxShadow: isPlaying ? '0 0 12px rgba(230,81,0,0.4)' : '0 0 12px rgba(0,122,204,0.4)',
            '&:hover': {
              bgcolor: isPlaying ? '#ef6c00' : '#0062a3',
            },
          }}
        >
          {isPlaying ? '일시정지' : status === 'paused' ? '이어하기' : '코드 타이핑 재생'}
        </Button>

        {/* Dedicated Stop Button (정지 시 원래 예시 코드로 복원) */}
        <Tooltip title="타이핑 정지 (원래 예시 코드로 복원)">
          <Button
            variant="outlined"
            size="small"
            onClick={onStop}
            startIcon={<StopRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              color: isPlaying || status === 'paused' ? '#ff5252' : currentTheme.uiColors.text,
              borderColor:
                isPlaying || status === 'paused'
                  ? 'rgba(255,82,82,0.6)'
                  : currentTheme.uiColors.border,
              bgcolor:
                isPlaying || status === 'paused'
                  ? 'rgba(255,82,82,0.1)'
                  : currentTheme.uiColors.card,
              fontWeight: 700,
              fontSize: '0.8125rem',
              px: 1.6,
              py: 0.55,
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255,82,82,0.2)',
                borderColor: '#ff5252',
                color: '#ff5252',
              },
            }}
          >
            정지
          </Button>
        </Tooltip>

        {/* Restart / Replay Button */}
        <Tooltip title="처음부터 다시 타이핑">
          <IconButton
            size="small"
            onClick={onReset}
            sx={{
              color: currentTheme.uiColors.text,
              bgcolor: currentTheme.uiColors.card,
              border: `1px solid ${currentTheme.uiColors.border}`,
              borderRadius: 1.5,
              p: 0.8,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            <ReplayRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Skip to End */}
        <Tooltip title="끝까지 즉시 완성">
          <IconButton
            size="small"
            onClick={onSkipToEnd}
            sx={{
              color: currentTheme.uiColors.text,
              bgcolor: currentTheme.uiColors.card,
              border: `1px solid ${currentTheme.uiColors.border}`,
              borderRadius: 1.5,
              p: 0.8,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Progress Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
          <Chip
            size="small"
            label={`${progressPercent}% (${currentChars.toLocaleString()} / ${totalChars.toLocaleString()}자)`}
            sx={{
              bgcolor: currentTheme.uiColors.card,
              color: progressPercent === 100 ? '#4caf50' : currentTheme.previewAccent || '#90caf9',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
              border: `1px solid ${currentTheme.uiColors.border}`,
            }}
          />
        </Box>
      </Box>

      {/* Right: Typing Speed, Theme, Sound & Input Settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
        {/* Speed Selector Presets (Desktop & Tablet) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          <SpeedRoundedIcon
            sx={{ fontSize: 16, color: currentTheme.uiColors.textMuted, mr: 0.3 }}
          />
          {speedOptions.map((opt) => {
            const isSelected = config.speedPreset === opt.id;
            return (
              <Tooltip key={opt.id} title={opt.desc}>
                <Chip
                  label={opt.label}
                  size="small"
                  onClick={() =>
                    onUpdateConfig({
                      speedPreset: opt.id,
                      speedMs: opt.ms,
                      charsPerTick: opt.charsPerTick,
                    })
                  }
                  sx={{
                    height: 24,
                    fontSize: '0.6875rem',
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? '#007acc' : currentTheme.uiColors.card,
                    color: isSelected ? '#ffffff' : currentTheme.uiColors.textMuted,
                    border: '1px solid',
                    borderColor: isSelected ? '#007acc' : currentTheme.uiColors.border,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? '#007acc' : hoverBg,
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        {/* Speed Selector (Compact mobile/narrow screens) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <Button
            size="small"
            onClick={(e) => setSpeedMenuAnchor(e.currentTarget)}
            startIcon={<SpeedRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{
              bgcolor: currentTheme.uiColors.card,
              color: currentTheme.uiColors.text,
              border: `1px solid ${currentTheme.uiColors.border}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 1.5,
              py: 0.4,
              px: 1,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            {speedOptions.find((o) => o.id === config.speedPreset)?.label || '속도'}
          </Button>
          <Menu
            anchorEl={speedMenuAnchor}
            open={Boolean(speedMenuAnchor)}
            onClose={() => setSpeedMenuAnchor(null)}
            sx={{
              '& .MuiPaper-root': {
                bgcolor: currentTheme.uiColors.card,
                color: currentTheme.uiColors.text,
                border: `1px solid ${currentTheme.uiColors.border}`,
                minWidth: 160,
              },
            }}
          >
            {speedOptions.map((opt) => (
              <MenuItem
                key={opt.id}
                selected={config.speedPreset === opt.id}
                onClick={() => {
                  onUpdateConfig({
                    speedPreset: opt.id,
                    speedMs: opt.ms,
                    charsPerTick: opt.charsPerTick,
                  });
                  setSpeedMenuAnchor(null);
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  fontSize: '0.75rem',
                }}
              >
                <span>{opt.label}</span>
                <span style={{ color: currentTheme.uiColors.textMuted, fontSize: '0.6875rem' }}>
                  {opt.subLabel}
                </span>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Theme Switcher Button */}
        <Button
          size="small"
          onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
          startIcon={
            <PaletteRoundedIcon sx={{ fontSize: 16, color: currentTheme.previewAccent }} />
          }
          sx={{
            bgcolor: currentTheme.uiColors.card,
            color: currentTheme.uiColors.text,
            border: `1px solid ${currentTheme.uiColors.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            py: 0.4,
            px: 1.2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          {currentTheme.name}
        </Button>

        {/* Theme Menu Dropdown */}
        <Menu
          anchorEl={themeMenuAnchor}
          open={Boolean(themeMenuAnchor)}
          onClose={() => setThemeMenuAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: currentTheme.uiColors.card,
              color: currentTheme.uiColors.text,
              border: `1px solid ${currentTheme.uiColors.border}`,
              minWidth: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 0.8, borderBottom: `1px solid ${currentTheme.uiColors.border}` }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: currentTheme.uiColors.textMuted }}
            >
              VS CODE 에디터 테마 선택
            </Typography>
          </Box>
          {IDE_THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <MenuItem
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setThemeMenuAnchor(null);
                }}
                selected={isSelected}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1,
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 400,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0, 122, 204, 0.15)',
                  },
                }}
              >
                {/* Theme Color Preview Swatch */}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: theme.previewBg,
                    border: `2px solid ${theme.previewAccent}`,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 500 }}
                  >
                    {theme.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.6875rem', color: currentTheme.uiColors.textMuted }}
                  >
                    {theme.category}
                  </Typography>
                </Box>
                {isSelected && (
                  <Chip
                    label="선택됨"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      bgcolor: '#007acc',
                      color: '#ffffff',
                    }}
                  />
                )}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Keyboard Sound Profile Selector Button */}
        <Button
          size="small"
          onClick={(e) => setSoundMenuAnchor(e.currentTarget)}
          startIcon={
            config.soundEnabled ? (
              <KeyboardRoundedIcon sx={{ color: currentSoundProfile.color, fontSize: 16 }} />
            ) : (
              <VolumeOffRoundedIcon sx={{ color: currentTheme.uiColors.textMuted, fontSize: 16 }} />
            )
          }
          sx={{
            bgcolor: currentTheme.uiColors.card,
            color: config.soundEnabled
              ? currentTheme.uiColors.text
              : currentTheme.uiColors.textMuted,
            border: `1px solid ${currentTheme.uiColors.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            py: 0.4,
            px: 1.2,
            '&:hover': { bgcolor: hoverBg },
          }}
        >
          {config.soundEnabled ? currentSoundProfile.name.split(' (')[0] : '타건음 음소거'}
        </Button>

        {/* Keyboard Sound Menu Dropdown */}
        <Menu
          anchorEl={soundMenuAnchor}
          open={Boolean(soundMenuAnchor)}
          onClose={() => setSoundMenuAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: currentTheme.uiColors.card,
              color: currentTheme.uiColors.text,
              border: `1px solid ${currentTheme.uiColors.border}`,
              minWidth: 320,
              maxWidth: 360,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              borderBottom: `1px solid ${currentTheme.uiColors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: currentTheme.uiColors.textMuted }}
            >
              키보드 타건음 스위치 사운드 선택
            </Typography>
            <Button
              size="small"
              onClick={() => {
                onUpdateConfig({ soundEnabled: !config.soundEnabled });
              }}
              sx={{
                fontSize: '0.6875rem',
                p: 0.4,
                color: config.soundEnabled ? '#e53935' : '#4caf50',
                fontWeight: 700,
              }}
            >
              {config.soundEnabled ? '음소거 끄기' : '타건음 켜기'}
            </Button>
          </Box>
          {KEYBOARD_SOUND_PROFILES.map((profile) => {
            const isSelected = config.soundEnabled && config.soundType === profile.id;
            return (
              <MenuItem
                key={profile.id}
                onClick={() => {
                  onUpdateConfig({ soundEnabled: true });
                  onSoundTypeChange(profile.id);
                  keyboardAudio.setSoundType(profile.id);
                  keyboardAudio.playKey('a', profile.id);
                  setSoundMenuAnchor(null);
                }}
                selected={isSelected}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.2,
                  py: 1.2,
                  fontSize: '0.8125rem',
                  '&.Mui-selected': { bgcolor: 'rgba(0, 122, 204, 0.15)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: profile.color,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        {profile.name}
                      </Typography>
                      <Chip
                        label={profile.tag}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.625rem',
                          bgcolor: currentTheme.isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.06)',
                          color: profile.color,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.6875rem', color: currentTheme.uiColors.textMuted }}
                    >
                      {profile.desc}
                    </Typography>
                  </Box>
                </Box>

                {/* Preview Click Button */}
                <Tooltip title="소리 미리듣기">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      keyboardAudio.playKey('a', profile.id);
                    }}
                    sx={{
                      color: profile.color,
                      p: 0.6,
                      bgcolor: currentTheme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      '&:hover': {
                        bgcolor: currentTheme.isDark
                          ? 'rgba(255,255,255,0.18)'
                          : 'rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <VolumeUpRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            );
          })}
        </Menu>

        {/* Human Jitter Toggle */}
        <Tooltip title="실제 인간 개발자처럼 줄바꿈/공백 시 미세한 생각 멈춤 딜레이 추가">
          <Button
            size="small"
            onClick={() => onUpdateConfig({ naturalJitter: !config.naturalJitter })}
            startIcon={
              <ElectricBoltRoundedIcon
                sx={{
                  color: config.naturalJitter ? '#ffb74d' : currentTheme.uiColors.textMuted,
                  fontSize: 16,
                }}
              />
            }
            sx={{
              bgcolor: currentTheme.uiColors.card,
              color: config.naturalJitter ? '#ffb74d' : currentTheme.uiColors.textMuted,
              border: `1px solid ${currentTheme.uiColors.border}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 1.5,
              py: 0.4,
              px: 1.2,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            휴먼 지터
          </Button>
        </Tooltip>

        {/* Input Custom Code Button */}
        <Button
          size="small"
          variant="outlined"
          onClick={onOpenCodeInput}
          startIcon={<EditNoteRoundedIcon />}
          sx={{
            borderColor: '#007acc',
            color: currentTheme.isDark ? '#90caf9' : '#007acc',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            py: 0.4,
            px: 1.5,
            '&:hover': {
              borderColor: '#64b5f6',
              bgcolor: 'rgba(0, 122, 204, 0.1)',
            },
          }}
        >
          소스코드 변경
        </Button>
      </Box>
    </Box>
  );
}
