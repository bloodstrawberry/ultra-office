'use client';

import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import { ManualResizeHandle } from 'src/components/resizable/manual-resize-handle';

// ----------------------------------------------------------------------

interface ResizeHandleProps {
  onDrag: (deltaY: number) => void;
}

export function ResizeHandle({ onDrag }: ResizeHandleProps) {
  return <ManualResizeHandle onDrag={onDrag} />;
}

// ----------------------------------------------------------------------

interface TextAreaPanelProps {
  title?: string;
  actions?: React.ReactNode;
  headerContent?: React.ReactNode;
  children: React.ReactNode; // Should contain LineNumberTextField
  sx?: SxProps<Theme>;
  height?: string | number;
}

export function TextAreaPanel({
  title,
  actions,
  headerContent,
  children,
  sx,
  height,
}: TextAreaPanelProps) {
  return (
    <Box
      sx={{
        flex: height ? 'none' : 1,
        height: height || '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {(title || actions || headerContent) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            minHeight: 40,
            flexShrink: 0,
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {title}
              </Typography>
            )}
            {headerContent}
          </Stack>
          <Scrollbar
            fillContent={false}
            sx={{ flexGrow: 1, minWidth: 0, pb: 0.5 }}
            slotProps={{
              contentWrapperSx: { overflowY: 'hidden !important' },
              contentSx: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minWidth: 'max-content',
              },
            }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ flexShrink: 0, ml: 'auto' }}
            >
              {actions}
            </Stack>
          </Scrollbar>
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}
