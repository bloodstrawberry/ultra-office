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
          background: 'transparent',
          ...(isVertical
            ? {
                width: 6,
                margin: '0 -2px',
                cursor: 'col-resize',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  bgcolor: isDragging ? theme.previewAccent : theme.uiColors.border,
                  boxShadow: isDragging ? `0 0 6px ${theme.previewAccent}80` : 'none',
                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                },
                '&:hover::before': {
                  bgcolor: theme.previewAccent,
                  width: '2px',
                  boxShadow: `0 0 6px ${theme.previewAccent}80`,
                },
              }
            : {
                height: 6,
                width: '100%',
                margin: '-2px 0',
                cursor: 'row-resize',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: isDragging ? theme.previewAccent : theme.uiColors.border,
                  boxShadow: isDragging ? `0 0 6px ${theme.previewAccent}80` : 'none',
                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                },
                '&:hover::before': {
                  bgcolor: theme.previewAccent,
                  height: '2px',
                  boxShadow: `0 0 6px ${theme.previewAccent}80`,
                },
              }),
        }}
      />
    </Tooltip>
  );
}
