'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

export interface TranslatorSplitResizerProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
  tooltipText?: string;
}

export function TranslatorSplitResizer({
  isDragging,
  onMouseDown,
  onDoubleClick,
  tooltipText = '드래그하여 좌우 패널 너비 조절 (더블 클릭 시 5:5 초기화)',
}: TranslatorSplitResizerProps) {
  return (
    <Tooltip title={tooltipText} placement="right" enterDelay={800}>
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
          width: 8,
          margin: '0 -2px',
          cursor: 'col-resize',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: isDragging ? '3px' : '2px',
            bgcolor: isDragging ? 'primary.main' : 'divider',
            borderRadius: '4px',
            boxShadow: isDragging ? (theme) => `0 0 8px ${theme.palette.primary.main}99` : 'none',
            transition: (theme) =>
              theme.transitions.create(['background-color', 'width', 'box-shadow'], {
                duration: 150,
              }),
          },
          '&:hover::before': {
            bgcolor: 'primary.main',
            width: '3px',
            boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}80`,
          },
        }}
      />
    </Tooltip>
  );
}
