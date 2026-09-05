'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React from 'react';
import { Group } from 'react-resizable-panels';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export interface ResizablePanelGroupProps {
  id?: string;
  autoSaveId?: string;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
  className?: string;
}

export function ResizablePanelGroup({
  id,
  autoSaveId,
  orientation = 'horizontal',
  children,
  sx,
  style,
  className,
}: ResizablePanelGroupProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Group
        id={id}
        orientation={orientation}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          ...style,
        }}
      >
        {children}
      </Group>
    </Box>
  );
}
