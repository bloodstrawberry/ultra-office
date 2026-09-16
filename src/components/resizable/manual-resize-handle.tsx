'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React, { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';

// ----------------------------------------------------------------------

export interface ManualResizeHandleProps {
  onDrag: (delta: number) => void;
  direction?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}

/** Standard divider for layouts that cannot use ResizablePanelGroup. */
export function ManualResizeHandle({
  onDrag,
  direction = 'vertical',
  ariaLabel,
  sx,
}: ManualResizeHandleProps) {
  const draggingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const isVertical = direction === 'vertical';

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      event.preventDefault();
      const position = isVertical ? event.clientY : event.clientX;
      onDrag(position - lastPositionRef.current);
      lastPositionRef.current = position;
    };
    const handlePointerUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isVertical, onDrag]);

  return (
    <Box
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel || (isVertical ? '상하 높이 조절' : '좌우 너비 조절')}
      aria-orientation={isVertical ? 'horizontal' : 'vertical'}
      onPointerDown={(event) => {
        event.preventDefault();
        draggingRef.current = true;
        lastPositionRef.current = isVertical ? event.clientY : event.clientX;
        document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
      }}
      onKeyDown={(event) => {
        const delta = event.shiftKey ? 20 : 5;
        if (isVertical && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault();
          onDrag(event.key === 'ArrowUp' ? -delta : delta);
        }
        if (!isVertical && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault();
          onDrag(event.key === 'ArrowLeft' ? -delta : delta);
        }
      }}
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        outline: 'none',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isVertical ? 'row-resize' : 'col-resize',
        ...(isVertical ? { height: 10, my: '-4px' } : { width: 10, mx: '-4px' }),
        '&::before': {
          content: '""',
          position: 'absolute',
          ...(isVertical ? { left: 0, right: 0, height: 1 } : { top: 0, bottom: 0, width: 1 }),
          bgcolor: 'divider',
        },
        '&:hover::before, &:focus-visible::before': {
          bgcolor: 'primary.main',
          ...(isVertical ? { height: 2 } : { width: 2 }),
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          zIndex: 1,
          width: isVertical ? 30 : 18,
          height: isVertical ? 18 : 30,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 1,
          transform: isVertical ? 'rotate(90deg)' : 'none',
        }}
      >
        <DragIndicatorRoundedIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  );
}
