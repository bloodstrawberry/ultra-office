'use client';

import type { EngineMode } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';

// ----------------------------------------------------------------------

interface EngineSwitcherProps {
  currentEngine: EngineMode;
  showTable: boolean;
  isFullscreen: boolean;
  onChangeEngine: (engine: EngineMode) => void;
  onToggleTable: () => void;
  onToggleFullscreen: () => void;
  onOpenPresets: () => void;
}

export function EngineSwitcher({
  currentEngine,
  showTable,
  isFullscreen,
  onChangeEngine,
  onToggleTable,
  onToggleFullscreen,
  onOpenPresets,
}: EngineSwitcherProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      {/* Engine Switcher Tabs */}
      <Tabs
        value={currentEngine}
        onChange={(_, val) => onChangeEngine(val)}
        sx={{
          minHeight: 44,
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderRadius: 1.5,
            px: 2,
            mr: 0.5,
          },
        }}
      >
        <Tab
          value="function-plot"
          label="Function-Plot (2D 뷰어)"
          icon={<SpeedRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="desmos"
          label="Desmos Pro (계산기)"
          icon={<CalculateRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="surface-3d"
          label="3D 곡면 뷰어 (Surface)"
          icon={<ThreeDRotationRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="calculus"
          label="미적분 & 해석 스튜디오"
          icon={<InsightsRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>

      {/* Quick Action Tools */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
          onClick={onOpenPresets}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
        >
          프리셋 갤러리
        </Button>

        <Tooltip title="수치 데이터 테이블 토글" arrow>
          <Button
            size="small"
            variant={showTable ? 'contained' : 'outlined'}
            color={showTable ? 'primary' : 'inherit'}
            startIcon={<TableChartRoundedIcon fontSize="small" />}
            onClick={onToggleTable}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
          >
            데이터 표
          </Button>
        </Tooltip>

        <Tooltip title={isFullscreen ? '전체화면 해제' : '전체화면 모드'} arrow>
          <IconButton size="small" onClick={onToggleFullscreen}>
            {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
