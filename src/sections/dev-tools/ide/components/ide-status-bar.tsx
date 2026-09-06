'use client';

import type { IdeFile, TypingStatus } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';

import { getLanguageLabel } from '../data/ide-languages';

interface IdeStatusBarProps {
  activeFile: IdeFile;
  cursorLine: number;
  cursorColumn: number;
  typingStatus: TypingStatus;
  currentTheme: IDETheme;
  wpm: number;
}

export function IdeStatusBar({
  activeFile,
  cursorLine,
  cursorColumn,
  typingStatus,
  currentTheme,
  wpm,
}: IdeStatusBarProps) {
  const statusBg = currentTheme.previewAccent || '#007acc';

  return (
    <Box
      sx={{
        height: 24,
        bgcolor: statusBg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        fontSize: '0.6875rem',
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Branch, Errors, Live Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Branch */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}>
          <AccountTreeRoundedIcon sx={{ fontSize: 13 }} />
          <span>main*</span>
        </Box>

        {/* Sync */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <SyncRoundedIcon sx={{ fontSize: 13 }} />
        </Box>

        {/* Problems count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 13 }} />
          <span>0 0</span>
        </Box>

        {/* Typing State Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(0,0,0,0.25)',
            px: 0.8,
            py: 0.1,
            borderRadius: 0.5,
          }}
        >
          <RadioButtonCheckedRoundedIcon
            sx={{
              fontSize: 10,
              color:
                typingStatus === 'playing'
                  ? '#69f0ae'
                  : typingStatus === 'paused'
                    ? '#ffd740'
                    : '#ffffff',
            }}
          />
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600 }}>
            {typingStatus === 'playing'
              ? `타이핑 중 (${wpm} WPM)`
              : typingStatus === 'paused'
                ? '일시정지됨'
                : typingStatus === 'completed'
                  ? '타이핑 완료'
                  : '대기 중'}
          </Typography>
        </Box>
      </Box>

      {/* Right: Line/Col, Encoding, Language */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ cursor: 'pointer' }}>
          Ln {cursorLine}, Col {cursorColumn}
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Spaces: 2</Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>UTF-8</Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>CRLF</Box>
        <Box sx={{ fontWeight: 600, cursor: 'pointer' }}>{getLanguageLabel(activeFile.name)}</Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.3 }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 12 }} />
          <span>Prettier</span>
        </Box>
        <NotificationsNoneRoundedIcon sx={{ fontSize: 13, cursor: 'pointer' }} />
      </Box>
    </Box>
  );
}
