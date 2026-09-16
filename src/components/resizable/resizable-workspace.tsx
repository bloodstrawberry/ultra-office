'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React from 'react';

import { ResizablePanel } from './resizable-panel';
import { ResizableHandle } from './resizable-handle';
import { ResizablePanelGroup } from './resizable-panel-group';

// ----------------------------------------------------------------------

export interface ResizableWorkspaceProps {
  id: string;
  primary: React.ReactNode;
  secondary: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  primaryDefaultSize?: number;
  primaryMinSize?: number;
  secondaryMinSize?: number;
  collapsible?: boolean;
  tooltipText?: string;
  sx?: SxProps<Theme>;
}

/**
 * Standard two-pane workspace for editor-style features.
 * New side-by-side or stacked tools should use this component instead of a fixed CSS grid.
 */
export function ResizableWorkspace({
  id,
  primary,
  secondary,
  orientation = 'horizontal',
  primaryDefaultSize = 50,
  primaryMinSize = 20,
  secondaryMinSize = 20,
  collapsible = false,
  tooltipText,
  sx,
}: ResizableWorkspaceProps) {
  const secondaryDefaultSize = 100 - primaryDefaultSize;

  return (
    <ResizablePanelGroup orientation={orientation} autoSaveId={id} sx={sx}>
      <ResizablePanel
        id={`${id}-primary`}
        defaultSize={primaryDefaultSize}
        minSize={primaryMinSize}
        collapsible={collapsible}
        collapsedSize={0}
      >
        {primary}
      </ResizablePanel>

      <ResizableHandle
        direction={orientation}
        tooltipText={
          tooltipText || (orientation === 'horizontal' ? '좌우 너비 조절' : '상하 높이 조절')
        }
      />

      <ResizablePanel
        id={`${id}-secondary`}
        defaultSize={secondaryDefaultSize}
        minSize={secondaryMinSize}
        collapsible={collapsible}
        collapsedSize={0}
      >
        {secondary}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
