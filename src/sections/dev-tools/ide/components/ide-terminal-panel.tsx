'use client';

import type { TerminalLog } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OutputRoundedIcon from '@mui/icons-material/OutputRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface IdeTerminalPanelProps {
  logs: TerminalLog[];
  height: number;
  isOpen: boolean;
  currentTheme: IDETheme;
  onClose: () => void;
  onClear: () => void;
}

export function IdeTerminalPanel({
  logs,
  height,
  isOpen,
  currentTheme,
  onClose,
  onClear,
}: IdeTerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'debug' | 'problems'>(
    'terminal'
  );

  if (!isOpen) return null;

  const accent = currentTheme.previewAccent || '#007acc';
  const termBg = currentTheme.terminalTheme?.background || currentTheme.previewBg;
  const termFg = currentTheme.terminalTheme?.foreground || currentTheme.uiColors.text;

  return (
    <Box
      sx={{
        height,
        bgcolor: currentTheme.uiColors.surface,
        color: currentTheme.uiColors.text,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${currentTheme.uiColors.border}`,
        userSelect: 'text',
        flexShrink: 0,
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          height: 32,
          bgcolor: currentTheme.uiColors.surface,
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          userSelect: 'none',
        }}
      >
        {/* Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          <Box
            onClick={() => setActiveTab('problems')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color:
                activeTab === 'problems'
                  ? currentTheme.uiColors.text
                  : currentTheme.uiColors.textMuted,
              borderBottom:
                activeTab === 'problems' ? `2px solid ${accent}` : '2px solid transparent',
              height: '100%',
              px: 0.5,
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: 13 }} />
            <span>PROBLEMS (0)</span>
          </Box>

          <Box
            onClick={() => setActiveTab('output')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color:
                activeTab === 'output'
                  ? currentTheme.uiColors.text
                  : currentTheme.uiColors.textMuted,
              borderBottom:
                activeTab === 'output' ? `2px solid ${accent}` : '2px solid transparent',
              height: '100%',
              px: 0.5,
            }}
          >
            <OutputRoundedIcon sx={{ fontSize: 13 }} />
            <span>OUTPUT</span>
          </Box>

          <Box
            onClick={() => setActiveTab('debug')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color:
                activeTab === 'debug'
                  ? currentTheme.uiColors.text
                  : currentTheme.uiColors.textMuted,
              borderBottom: activeTab === 'debug' ? `2px solid ${accent}` : '2px solid transparent',
              height: '100%',
              px: 0.5,
            }}
          >
            <BugReportRoundedIcon sx={{ fontSize: 13 }} />
            <span>DEBUG CONSOLE</span>
          </Box>

          <Box
            onClick={() => setActiveTab('terminal')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color:
                activeTab === 'terminal'
                  ? currentTheme.uiColors.text
                  : currentTheme.uiColors.textMuted,
              borderBottom:
                activeTab === 'terminal' ? `2px solid ${accent}` : '2px solid transparent',
              height: '100%',
              px: 0.5,
            }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 13 }} />
            <span>TERMINAL (bash)</span>
          </Box>
        </Box>

        {/* Panel Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="터미널 지우기">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                color: currentTheme.uiColors.textMuted,
                p: 0.3,
                '&:hover': { color: currentTheme.uiColors.text },
              }}
            >
              <DeleteSweepRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="패널 닫기">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: currentTheme.uiColors.textMuted,
                p: 0.3,
                '&:hover': { color: currentTheme.uiColors.text },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Panel Terminal Log Output Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.5,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontSize: '0.78125rem',
          lineHeight: 1.6,
          bgcolor: termBg,
          color: termFg,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: currentTheme.uiColors.border },
        }}
      >
        {activeTab === 'terminal' && (
          <>
            <Typography
              component="div"
              sx={{
                color: accent,
                fontSize: '0.78125rem',
                mb: 0.5,
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Ultra Office Virtual Shell v2.4 (Node.js v20.12 / Python 3.12)
            </Typography>
            <Typography
              component="div"
              sx={{
                color: currentTheme.uiColors.textMuted,
                fontSize: '0.75rem',
                mb: 1,
                fontFamily: 'inherit',
              }}
            >
              상단의 코드 타이핑 재생(▶) 버튼을 누르면 실시간 타이핑과 실행 로그가 출력됩니다.
            </Typography>

            {logs.map((log) => {
              let color = termFg;
              if (log.type === 'command') color = accent;
              else if (log.type === 'success') color = '#4caf50';
              else if (log.type === 'warn') color = '#ff9800';
              else if (log.type === 'error') color = '#f44336';

              return (
                <Box
                  key={log.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    py: 0.15,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      color: currentTheme.uiColors.textMuted,
                      fontSize: '0.7rem',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    [{log.timestamp}]
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color,
                      fontSize: '0.78125rem',
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {log.text}
                  </Typography>
                </Box>
              );
            })}

            {/* Simulated blinking shell prompt */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography
                component="span"
                sx={{
                  color: '#4caf50',
                  fontWeight: 700,
                  fontSize: '0.78125rem',
                  fontFamily: 'inherit',
                }}
              >
                ~/workspace $
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 14,
                  bgcolor: termFg,
                  animation: 'blink 1s step-start infinite',
                  '@keyframes blink': { '50%': { opacity: 0 } },
                }}
              />
            </Box>
          </>
        )}

        {activeTab === 'problems' && (
          <Typography sx={{ color: currentTheme.uiColors.textMuted, fontSize: '0.78125rem' }}>
            No problems have been detected in the workspace.
          </Typography>
        )}

        {activeTab === 'output' && (
          <Typography sx={{ color: currentTheme.uiColors.textMuted, fontSize: '0.78125rem' }}>
            [Prettier] Formatting on save: Enabled
            <br />
            [TypeScript] Loaded language service for workspace
          </Typography>
        )}

        {activeTab === 'debug' && (
          <Typography sx={{ color: currentTheme.uiColors.textMuted, fontSize: '0.78125rem' }}>
            Debug session ready. Attach debugger or run typing animation.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
