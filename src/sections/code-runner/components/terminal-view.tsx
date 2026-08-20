'use client';

import 'xterm/css/xterm.css';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { getThemeById } from '../core/editor-themes';

// ----------------------------------------------------------------------

export interface TerminalRef {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  focus: () => void;
  getRawText: () => string;
}

export interface TerminalViewProps {
  title?: string;
  themeId?: string;
  statusLabel?: string;
  statusColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClear?: () => void;
  onRestart?: () => void;
  onData?: (data: string) => void;
}

export const TerminalView = forwardRef<TerminalRef, TerminalViewProps>(
  (
    {
      title = 'Terminal & Output',
      themeId = 'vs-dark',
      statusLabel,
      statusColor = 'info',
      onClear,
      onRestart,
      onData,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const terminalInstanceRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);
    const bufferTextRef = useRef<string[]>([]);

    const activeTheme = getThemeById(themeId);

    // 테마 동적 업데이트
    useEffect(() => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.options.theme = activeTheme.terminalTheme;
      }
    }, [activeTheme]);

    useEffect(() => {
      let isMounted = true;

      const initXterm = async () => {
        if (!containerRef.current) return;

        const { Terminal } = await import('xterm');
        const { FitAddon } = await import('xterm-addon-fit');

        if (!isMounted) return;

        const term = new Terminal({
          theme: activeTheme.terminalTheme,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.35,
          cursorBlink: true,
          convertEol: true,
          scrollback: 5000,
          allowTransparency: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        containerRef.current.innerHTML = '';
        term.open(containerRef.current);
        fitAddon.fit();

        terminalInstanceRef.current = term;
        fitAddonRef.current = fitAddon;

        // 키 입력 핸들러
        if (onData) {
          term.onData((data) => {
            onData(data);
          });
        }

        // 웰컴 메시지 출력
        term.writeln('\x1b[36m┌──────────────────────────────────────────────────────────┐\x1b[0m');
        term.writeln(
          '\x1b[36m│\x1b[0m  \x1b[1;32m⚡ OmniRunner Terminal\x1b[0m - Multi-Runtime Console       \x1b[36m│\x1b[0m'
        );
        term.writeln(
          '\x1b[36m│\x1b[0m  Node.js • Python (Pyodide) • Wasm • SQL • 15+ Languages \x1b[36m│\x1b[0m'
        );
        term.writeln(
          '\x1b[36m└──────────────────────────────────────────────────────────┘\x1b[0m\r\n'
        );

        const handleResize = () => {
          try {
            fitAddon.fit();
          } catch {
            // ignore
          }
        };

        window.addEventListener('resize', handleResize);

        const observer = new ResizeObserver(() => {
          handleResize();
        });
        if (containerRef.current) {
          observer.observe(containerRef.current);
        }

        return () => {
          window.removeEventListener('resize', handleResize);
          observer.disconnect();
          term.dispose();
        };
      };

      initXterm();

      return () => {
        isMounted = false;
        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.dispose();
          terminalInstanceRef.current = null;
        }
      };
    }, [onData, activeTheme]);

    useImperativeHandle(
      ref,
      () => ({
        write: (data: string) => {
          bufferTextRef.current.push(data);
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.write(data);
          }
        },
        writeln: (data: string) => {
          bufferTextRef.current.push(`${data}\n`);
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.writeln(data);
          }
        },
        clear: () => {
          bufferTextRef.current = [];
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.clear();
          }
        },
        focus: () => {
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.focus();
          }
        },
        getRawText: () => bufferTextRef.current.join(''),
      }),
      []
    );

    const handleCopy = () => {
      const text = bufferTextRef.current.join('');
      navigator.clipboard.writeText(text);
    };

    const handleClear = () => {
      bufferTextRef.current = [];
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.clear();
      }
      onClear?.();
    };

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          bgcolor: activeTheme.terminalTheme.background || '#0d1117',
          borderTop: `1px solid ${activeTheme.uiColors.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.75,
            bgcolor: activeTheme.uiColors.surface,
            borderBottom: `1px solid ${activeTheme.uiColors.border}`,
            minHeight: 36,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalRoundedIcon sx={{ fontSize: 16, color: activeTheme.previewAccent }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: activeTheme.uiColors.text }}
            >
              {title}
            </Typography>
            {statusLabel && (
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  bgcolor:
                    statusColor === 'success'
                      ? 'rgba(63, 185, 80, 0.2)'
                      : statusColor === 'warning'
                        ? 'rgba(210, 153, 34, 0.2)'
                        : statusColor === 'error'
                          ? 'rgba(255, 123, 114, 0.2)'
                          : 'rgba(88, 166, 255, 0.2)',
                  color:
                    statusColor === 'success'
                      ? '#3fb950'
                      : statusColor === 'warning'
                        ? '#d29922'
                        : statusColor === 'error'
                          ? '#ff7b72'
                          : '#58a6ff',
                }}
              >
                {statusLabel}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="로그 복사">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: activeTheme.uiColors.textMuted,
                  '&:hover': { color: activeTheme.uiColors.text },
                }}
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            {onRestart && (
              <Tooltip title="쉘 / 프로세스 재시작">
                <IconButton
                  size="small"
                  onClick={onRestart}
                  sx={{
                    color: activeTheme.uiColors.textMuted,
                    '&:hover': { color: activeTheme.uiColors.text },
                  }}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="터미널 지우기">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  color: activeTheme.uiColors.textMuted,
                  '&:hover': { color: activeTheme.uiColors.text },
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Terminal Canvas Container */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            width: '100%',
            height: '100%',
            p: 1,
            overflow: 'hidden',
            '& .xterm': {
              height: '100%',
            },
            '& .xterm-viewport': {
              overflowY: 'auto !important',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: activeTheme.isDark ? '#30363d' : '#d0d7de',
                borderRadius: 4,
              },
            },
          }}
        />
      </Box>
    );
  }
);

TerminalView.displayName = 'TerminalView';
