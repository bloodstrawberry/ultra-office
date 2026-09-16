'use client';

import type { Layout } from 'react-resizable-panels';
import type { Theme, SxProps } from '@mui/material/styles';

import React, { useEffect } from 'react';
import { Group, useGroupRef } from 'react-resizable-panels';

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
  const groupRef = useGroupRef();
  const storageKey = autoSaveId ? `ultra-office:resizable:${autoSaveId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) groupRef.current?.setLayout(JSON.parse(saved) as Layout);
    } catch {
      // Ignore unavailable storage or stale layout data.
    }
  }, [groupRef, storageKey]);

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
        id={id ?? autoSaveId}
        groupRef={groupRef}
        orientation={orientation}
        className={className}
        onLayoutChanged={(layout, meta) => {
          if (!storageKey || !meta.isUserInteraction) return;
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(layout));
          } catch {
            // Ignore unavailable storage.
          }
        }}
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
