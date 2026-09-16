'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { ManualResizeHandle } from 'src/components/resizable/manual-resize-handle';

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
  return <ManualResizeHandle onDrag={onDrag} />;
}
