'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';

// ----------------------------------------------------------------------

export type MlWorkspaceViewMode = 'canvas' | 'spreadsheet' | 'split';

interface MlViewModeBarProps {
  viewMode: MlWorkspaceViewMode;
  onViewModeChange: (mode: MlWorkspaceViewMode) => void;
  pointCount: number;
  label?: string;
}

export function MlViewModeBar({
  viewMode,
  onViewModeChange,
  pointCount,
  label = '작업 공간 뷰 모드',
}: MlViewModeBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        p: 1,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        <Chip
          size="small"
          color="primary"
          variant="soft"
          label={`데이터: ${pointCount}개 포인트`}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
      </Box>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={viewMode}
        onChange={(_, v) => v && onViewModeChange(v)}
        sx={{
          bgcolor: 'background.neutral',
          '& .MuiToggleButton-root': {
            fontWeight: 700,
            fontSize: '0.8125rem',
            px: 1.5,
            py: 0.5,
            gap: 0.75,
          },
        }}
      >
        <ToggleButton value="canvas">
          <AutoGraphRoundedIcon fontSize="small" />
          캔버스 뷰
        </ToggleButton>
        <ToggleButton value="spreadsheet">
          <TableChartRoundedIcon fontSize="small" />
          스프레드시트 뷰
        </ToggleButton>
        <ToggleButton value="split">
          <ViewStreamRoundedIcon fontSize="small" />
          분할 모드 (둘 다 보기)
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
