'use client';

import React, { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export interface TextAreaPanelProps {
  title: string;
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  height?: string | number;
}

export function TextAreaPanel({
  title,
  headerContent,
  actions,
  children,
  height,
}: TextAreaPanelProps) {
  return (
    <Card
      sx={{
        p: 2,
        height: height || '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {headerContent}
        </Box>

        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{actions}</Box>}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Card>
  );
}

export function ResizeHandle({ onDrag }: { onDrag: (deltaY: number) => void }) {
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
      onMouseDown={handleMouseDown}
      sx={{
        height: 6,
        margin: '-2px 0',
        flexShrink: 0,
        cursor: 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'transparent',
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
      }}
    />
  );
}
