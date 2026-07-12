'use client';

import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import React, { useRef, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface ResizeHandleProps {
  onDrag: (deltaY: number) => void;
}

export function ResizeHandle({ onDrag }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const delta = e.clientY - lastY.current;
      lastY.current = e.clientY;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onDrag]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <Box
      ref={handleRef}
      onMouseDown={handleMouseDown}
      sx={{
        height: 8,
        flexShrink: 0,
        cursor: 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
        transition: 'background-color 0.15s',
        my: 0.5,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&::after': {
          content: '""',
          width: 40,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: 'grey.400',
          transition: 'background-color 0.15s',
        },
        '&:hover::after': {
          backgroundColor: 'primary.main',
        },
      }}
    />
  );
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
