'use client';

import type { LogEntry } from '../types';

import { toast } from 'sonner';
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

// ----------------------------------------------------------------------

interface LogStreamViewerProps {
  entries: LogEntry[];
  highlightKeyword?: string;
}

export function LogStreamViewer({ entries, highlightKeyword }: LogStreamViewerProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 30,
  });

  const handleCopyLine = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('로그 라인이 복사되었습니다.');
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return '#ef4444'; // Red
      case 'WARN':
        return '#f59e0b'; // Amber
      case 'DEBUG':
        return '#8b5cf6'; // Purple
      case 'INFO':
      default:
        return '#3b82f6'; // Blue
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#0f172a', // VSCode dark terminal theme
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        border: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        overflow: 'hidden',
      }}
    >
      {/* Terminal Title Bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: '#1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
          <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: '#94a3b8' }}>
            Ultra Giga Stream Engine ({entries.length.toLocaleString()} 라인 렌더링 중)
          </Typography>
        </Box>
      </Box>

      {/* Virtual Scroll Area */}
      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          fontSize: '12.5px',
          lineHeight: '28px',
        }}
      >
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const entry = entries[virtualRow.index];
            if (!entry) return null;

            return (
              <Box
                key={virtualRow.key}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& .copy-btn': { opacity: 1 },
                  },
                }}
              >
                {/* Line Number */}
                <Typography
                  component="span"
                  sx={{
                    width: 55,
                    color: '#64748b',
                    fontSize: '11px',
                    userSelect: 'none',
                    textAlign: 'right',
                    mr: 2,
                    fontFamily: 'monospace',
                  }}
                >
                  {entry.id}
                </Typography>

                {/* Level Badge */}
                <Typography
                  component="span"
                  sx={{
                    width: 58,
                    fontWeight: 800,
                    fontSize: '11px',
                    color: getLevelColor(entry.level),
                    userSelect: 'none',
                  }}
                >
                  [{entry.level}]
                </Typography>

                {/* Raw Log Text */}
                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '12.5px',
                    color:
                      entry.level === 'ERROR'
                        ? '#fca5a5'
                        : entry.level === 'WARN'
                          ? '#fde68a'
                          : '#cbd5e1',
                  }}
                >
                  {entry.raw}
                </Typography>

                {/* Quick Copy Button */}
                <IconButton
                  size="small"
                  className="copy-btn"
                  onClick={() => handleCopyLine(entry.raw)}
                  sx={{ opacity: 0, color: '#94a3b8', p: 0.5, transition: 'opacity 0.15s' }}
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
