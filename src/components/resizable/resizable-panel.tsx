'use client';

import React from 'react';
import { Panel } from 'react-resizable-panels';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface ResizablePanelProps {
  id?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  order?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
}

export function ResizablePanel({
  id,
  defaultSize,
  minSize = 10,
  maxSize,
  order,
  collapsible,
  collapsedSize,
  children,
  sx,
  style,
}: ResizablePanelProps) {
  return (
    <Panel
      id={id}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          ...sx,
        }}
      >
        {children}
      </Box>
    </Panel>
  );
}
