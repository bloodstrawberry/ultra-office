'use client';

import React from 'react';
import { Separator } from 'react-resizable-panels';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface ResizableHandleProps {
  direction?: 'horizontal' | 'vertical';
  tooltipText?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export function ResizableHandle({
  direction = 'horizontal',
  tooltipText = '드래그하여 크기 조절',
  disabled = false,
  sx,
}: ResizableHandleProps) {
  const isVertical = direction === 'vertical';

  const content = (
    <Separator
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        outline: 'none',
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
        background: 'transparent',
        ...(isVertical
          ? {
              height: 6,
              width: '100%',
              margin: '-2px 0',
              cursor: disabled ? 'default' : 'row-resize',
            }
          : {
              width: 6,
              height: '100%',
              margin: '0 -2px',
              cursor: disabled ? 'default' : 'col-resize',
            }),
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          ...(isVertical
            ? {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: 'divider',
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'height', 'box-shadow'], {
                      duration: 150,
                    }),
                },
                '&:hover::before, &:active::before': {
                  bgcolor: 'primary.main',
                  height: '2px',
                  boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
                },
              }
            : {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  bgcolor: 'divider',
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'width', 'box-shadow'], {
                      duration: 150,
                    }),
                },
                '&:hover::before, &:active::before': {
                  bgcolor: 'primary.main',
                  width: '2px',
                  boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
                },
              }),
          ...sx,
        }}
      />
    </Separator>
  );

  if (tooltipText && !disabled) {
    return (
      <Tooltip title={tooltipText} placement={isVertical ? 'bottom' : 'right'} enterDelay={800}>
        {content}
      </Tooltip>
    );
  }

  return content;
}
