'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

export interface DocSplitResizerProps {
  direction: 'vertical' | 'horizontal';
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
  tooltipText?: string;
}

export function DocSplitResizer({
  direction,
  isDragging,
  onMouseDown,
  onDoubleClick,
  tooltipText = '드래그하여 크기 조절 (더블 클릭 시 5:5 초기화)',
}: DocSplitResizerProps) {
  const isVertical = direction === 'vertical';

  return (
    <Tooltip title={tooltipText} placement={isVertical ? 'right' : 'bottom'} enterDelay={600}>
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
          zIndex: 5,
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          ...(isVertical
            ? {
                width: 8,
                cursor: 'col-resize',
                bgcolor: isDragging ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}`,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: -4,
                  right: -4,
                  cursor: 'col-resize',
                },
              }
            : {
                height: 8,
                width: '100%',
                cursor: 'row-resize',
                bgcolor: isDragging ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}`,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: -4,
                  bottom: -4,
                  cursor: 'row-resize',
                },
              }),
        }}
      >
        {/* Subtle Grip Handle Bar */}
        <Box
          sx={{
            borderRadius: 1,
            bgcolor: isDragging ? '#ffffff' : 'text.disabled',
            opacity: isDragging ? 1 : 0.7,
            transition: 'all 0.15s ease',
            ...(isVertical
              ? {
                  width: 3,
                  height: 32,
                }
              : {
                  width: 32,
                  height: 3,
                }),
          }}
        />
      </Box>
    </Tooltip>
  );
}
