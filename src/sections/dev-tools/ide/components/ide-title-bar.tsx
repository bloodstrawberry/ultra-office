'use client';

import type { TypingStatus } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import CallToActionRoundedIcon from '@mui/icons-material/CallToActionRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';

interface IdeTitleBarProps {
  fileName: string;
  typingStatus: TypingStatus;
  currentTheme: IDETheme;
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  isTerminalOpen: boolean;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleFullscreen: () => void;
  onPlayPause: () => void;
  onStop?: () => void;
  onOpenCodeInput: () => void;
}

export function IdeTitleBar({
  fileName,
  typingStatus,
  currentTheme,
  isFullscreen,
  isSidebarOpen,
  isTerminalOpen,
  onToggleSidebar,
  onToggleTerminal,
  onToggleFullscreen,
  onPlayPause,
  onStop,
  onOpenCodeInput,
}: IdeTitleBarProps) {
  const isPlaying = typingStatus === 'playing';
  const hoverBg = currentTheme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Box
      sx={{
        height: 38,
        bgcolor: currentTheme.uiColors.bg,
        color: currentTheme.uiColors.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        borderBottom: `1px solid ${currentTheme.uiColors.border}`,
        userSelect: 'none',
        fontSize: '0.8125rem',
        flexShrink: 0,
      }}
    >
      {/* Left: Window Dots & Logo & Menus */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* MacOS Style Window Control Dots */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, pr: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
        </Box>

        {/* VS Code Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <CodeRoundedIcon sx={{ fontSize: 18, color: currentTheme.previewAccent || '#007acc' }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: currentTheme.uiColors.text,
              letterSpacing: -0.2,
            }}
          >
            Visual Studio Code
          </Typography>
        </Box>

        {/* Desktop VS Code Menus (Hidden on very small screens) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            ml: 1,
            color: currentTheme.uiColors.textMuted,
            '& span': {
              cursor: 'pointer',
              fontSize: '0.75rem',
              transition: 'color 0.15s',
              '&:hover': { color: currentTheme.uiColors.text },
            },
          }}
        >
          <span onClick={onOpenCodeInput}>File</span>
          <span onClick={onOpenCodeInput}>Edit</span>
          <span onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Run'}</span>
          {onStop && <span onClick={onStop}>Stop</span>}
          <span onClick={onToggleTerminal}>Terminal</span>
          <span onClick={onToggleSidebar}>View</span>
        </Box>
      </Box>

      {/* Center: Command Palette / File Title Box */}
      <Box
        onClick={onOpenCodeInput}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1,
          bgcolor: currentTheme.uiColors.card,
          border: `1px solid ${currentTheme.uiColors.border}`,
          borderRadius: 1,
          px: 2,
          py: 0.35,
          cursor: 'pointer',
          maxWidth: 420,
          width: '100%',
          justifyContent: 'center',
          transition: 'all 0.15s',
          '&:hover': {
            borderColor: currentTheme.previewAccent || '#007acc',
          },
        }}
      >
        <SearchRoundedIcon sx={{ fontSize: 14, color: currentTheme.uiColors.textMuted }} />
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: currentTheme.uiColors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fileName} — Ultra IDE (클릭하여 코드 변경)
        </Typography>
      </Box>

      {/* Right: Quick Action Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Play/Pause Quick Button */}
        <Tooltip title={isPlaying ? '타이핑 일시정지' : '타이핑 재생'}>
          <IconButton
            size="small"
            onClick={onPlayPause}
            sx={{
              color: isPlaying ? '#ffb74d' : '#4caf50',
              p: 0.5,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            {isPlaying ? (
              <PauseRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Stop Quick Button */}
        {onStop && (
          <Tooltip title="타이핑 정지 (원래 예시 복원)">
            <IconButton
              size="small"
              onClick={onStop}
              sx={{
                color:
                  isPlaying || typingStatus === 'paused'
                    ? '#ff5252'
                    : currentTheme.uiColors.textMuted,
                p: 0.5,
                '&:hover': { bgcolor: hoverBg },
              }}
            >
              <StopRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Sidebar Toggle */}
        <Tooltip title={isSidebarOpen ? '사이드바 숨기기' : '사이드바 열기'}>
          <IconButton
            size="small"
            onClick={onToggleSidebar}
            sx={{
              color: isSidebarOpen
                ? currentTheme.previewAccent || '#007acc'
                : currentTheme.uiColors.textMuted,
              p: 0.5,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            <ViewSidebarRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Terminal Toggle */}
        <Tooltip title={isTerminalOpen ? '하단 패널 닫기' : '하단 패널 열기'}>
          <IconButton
            size="small"
            onClick={onToggleTerminal}
            sx={{
              color: isTerminalOpen
                ? currentTheme.previewAccent || '#007acc'
                : currentTheme.uiColors.textMuted,
              p: 0.5,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            <CallToActionRoundedIcon sx={{ fontSize: 18, transform: 'rotate(180deg)' }} />
          </IconButton>
        </Tooltip>

        {/* Fullscreen Cinema Mode */}
        <Tooltip title={isFullscreen ? '전체화면 해제' : '시네마 전체화면'}>
          <IconButton
            size="small"
            onClick={onToggleFullscreen}
            sx={{
              color: isFullscreen
                ? currentTheme.previewAccent || '#007acc'
                : currentTheme.uiColors.textMuted,
              p: 0.5,
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            {isFullscreen ? (
              <FullscreenExitRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <FullscreenRoundedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
