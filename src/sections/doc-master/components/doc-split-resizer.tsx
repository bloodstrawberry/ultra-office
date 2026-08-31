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
          zIndex: 5,
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
                  bgcolor: isDragging ? 'primary.main' : 'divider',
                  boxShadow: isDragging
                    ? (theme) => `0 0 6px ${theme.palette.primary.main}80`
                    : 'none',
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'width', 'box-shadow'], {
                      duration: 150,
                    }),
                },
                '&:hover::before': {
                  bgcolor: 'primary.main',
                  width: '2px',
                  boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
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
                  bgcolor: isDragging ? 'primary.main' : 'divider',
                  boxShadow: isDragging
                    ? (theme) => `0 0 6px ${theme.palette.primary.main}80`
                    : 'none',
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'height', 'box-shadow'], {
                      duration: 150,
                    }),
                },
                '&:hover::before': {
                  bgcolor: 'primary.main',
                  height: '2px',
                  boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
                },
              }),
        }}
      />
    </Tooltip>
  );
}
