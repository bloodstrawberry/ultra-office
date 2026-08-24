'use client';

import type { IDETheme } from '../core/editor-themes';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

export interface SplitResizerProps {
  direction: 'vertical' | 'horizontal';
  isDragging: boolean;
  theme: IDETheme;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
  tooltipText?: string;
}

export function SplitResizer({
  direction,
  isDragging,
  theme,
  onMouseDown,
  onDoubleClick,
  tooltipText = '드래그하여 크기 조절 (더블 클릭 시 초기화)',
}: SplitResizerProps) {
  const isVertical = direction === 'vertical';

  return (
    <Tooltip title={tooltipText} placement={isVertical ? 'right' : 'bottom'} enterDelay={800}>
      <Box
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          userSelect: 'none',
          touchAction: 'none',
          position: 'relative',
          zIndex: 10,
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          ...(isVertical
            ? {
                width: 6,
                cursor: 'col-resize',
                bgcolor: isDragging ? theme.previewAccent : theme.uiColors.surface,
                borderLeft: `1px solid ${isDragging ? theme.previewAccent : theme.uiColors.border}`,
                borderRight: `1px solid ${isDragging ? theme.previewAccent : theme.uiColors.border}`,
                '&:hover': {
                  bgcolor: theme.previewAccent,
                  boxShadow: `0 0 6px ${theme.previewAccent}80`,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: -3,
                  right: -3,
                  cursor: 'col-resize',
                },
              }
            : {
                height: 6,
                width: '100%',
                cursor: 'row-resize',
                bgcolor: isDragging ? theme.previewAccent : theme.uiColors.surface,
                borderTop: `1px solid ${isDragging ? theme.previewAccent : theme.uiColors.border}`,
                borderBottom: `1px solid ${isDragging ? theme.previewAccent : theme.uiColors.border}`,
                '&:hover': {
                  bgcolor: theme.previewAccent,
                  boxShadow: `0 0 6px ${theme.previewAccent}80`,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: -3,
                  bottom: -3,
                  cursor: 'row-resize',
                },
              }),
        }}
      >
        {/* Subtle Grip Dots/Handle */}
        <Box
          sx={{
            ...(isVertical
              ? {
                  width: 2,
                  height: 24,
                  borderRadius: '1px',
                  bgcolor: isDragging ? '#ffffff' : theme.uiColors.textMuted,
                  opacity: isDragging ? 1 : 0.6,
                }
              : {
                  width: 24,
                  height: 2,
                  borderRadius: '1px',
                  bgcolor: isDragging ? '#ffffff' : theme.uiColors.textMuted,
                  opacity: isDragging ? 1 : 0.6,
                }),
          }}
        />
      </Box>
    </Tooltip>
  );
}
