'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

export interface CodeRunnerStyleToggleProps {
  styleMode: 'classic' | 'vscode';
  onChange: (mode: 'classic' | 'vscode') => void;
  isDark?: boolean;
}

export function CodeRunnerStyleToggle({
  styleMode,
  onChange,
  isDark = true,
}: CodeRunnerStyleToggleProps) {
  const isClassic = styleMode === 'classic';
  const isVsCode = styleMode === 'vscode';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        p: '3px',
        borderRadius: '10px',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
        gap: '3px',
        userSelect: 'none',
      }}
    >
      {/* 1. 일반 테마 (Classic) */}
      <Tooltip title="일반 대시보드 컴파일러 화면으로 전환">
        <Button
          size="small"
          onClick={() => onChange('classic')}
          startIcon={<DashboardRoundedIcon sx={{ fontSize: 15 }} />}
          sx={{
            py: 0.4,
            px: 1.2,
            minWidth: 0,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '7px',
            color: isClassic ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            bgcolor: isClassic ? '#1976d2' : 'transparent',
            boxShadow: isClassic ? '0 1px 4px rgba(25, 118, 210, 0.4)' : 'none',
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: isClassic
                ? '#1565c0'
                : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          일반 테마
        </Button>
      </Tooltip>

      {/* 2. VS CODE (VS Code Style) */}
      <Tooltip title="Visual Studio Code IDE 스타일 레이아웃으로 전환">
        <Button
          size="small"
          onClick={() => onChange('vscode')}
          startIcon={<CodeRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 0.4,
            px: 1.2,
            minWidth: 0,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '7px',
            color: isVsCode ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            bgcolor: isVsCode ? '#007acc' : 'transparent',
            boxShadow: isVsCode ? '0 1px 6px rgba(0, 122, 204, 0.5)' : 'none',
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: isVsCode
                ? '#0062a3'
                : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          VS CODE
        </Button>
      </Tooltip>
    </Box>
  );
}
