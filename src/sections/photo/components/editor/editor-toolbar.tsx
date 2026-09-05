'use client';

import type { DeviceMode } from './editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

// ----------------------------------------------------------------------

interface EditorToolbarProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onSmartRemaster: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  isComparing: boolean;
  onCompareToggle: () => void;
  onResetAll: () => void;
  onOpenExport: () => void;
  onBackToUpload: () => void;
}

export function EditorToolbar({
  deviceMode,
  onDeviceModeChange,
  onSmartRemaster,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  isComparing,
  onCompareToggle,
  onResetAll,
  onOpenExport,
  onBackToUpload,
}: EditorToolbarProps) {
  const isGalaxy = deviceMode === 'galaxy';

  return (
    <Box
      sx={{
        height: 60,
        px: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
        gap: 1.5,
      }}
    >
      {/* 1. 좌측: 뒤로가기 & 모드 스위처 (갤럭시 vs 아이폰) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title="새 사진 선택 (처음 화면으로)">
          <IconButton size="small" onClick={onBackToUpload}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <ToggleButtonGroup
          size="small"
          value={deviceMode}
          exclusive
          onChange={(_, mode) => mode && onDeviceModeChange(mode as DeviceMode)}
          sx={{
            height: 34,
            bgcolor: 'background.neutral',
            p: 0.25,
            borderRadius: 1.5,
            border: 'none',
          }}
        >
          <ToggleButton
            value="galaxy"
            sx={{
              px: 1.5,
              py: 0.25,
              fontSize: '0.75rem',
              fontWeight: 800,
              borderRadius: 1,
              border: 'none !important',
              color: isGalaxy ? '#2563eb' : 'text.secondary',
              bgcolor: isGalaxy ? 'background.paper' : 'transparent',
              boxShadow: isGalaxy ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            📱 갤럭시 모드
          </ToggleButton>
          <ToggleButton
            value="iphone"
            sx={{
              px: 1.5,
              py: 0.25,
              fontSize: '0.75rem',
              fontWeight: 800,
              borderRadius: 1,
              border: 'none !important',
              color: !isGalaxy ? '#ea580c' : 'text.secondary',
              bgcolor: !isGalaxy ? 'background.paper' : 'transparent',
              boxShadow: !isGalaxy ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🍎 아이폰 모드
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 원터치 스마트 리마스터 버튼 */}
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeRoundedIcon />}
          onClick={onSmartRemaster}
          sx={{
            height: 34,
            fontWeight: 800,
            borderRadius: 1.5,
            bgcolor: isGalaxy ? '#2563eb' : '#0f172a',
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: isGalaxy ? '#1d4ed8' : '#1e293b',
            },
          }}
        >
          {isGalaxy ? '✨ 사진 리마스터' : '🪄 자동 보정'}
        </Button>
      </Box>

      {/* 2. 중앙: 실행 취소/다시 실행 & 줌/화면 맞춤 컨트롤 */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        <Tooltip title="실행 취소 (Ctrl+Z)">
          <span>
            <IconButton size="small" disabled={!canUndo} onClick={onUndo}>
              <UndoRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="다시 실행 (Ctrl+Y)">
          <span>
            <IconButton size="small" disabled={!canRedo} onClick={onRedo}>
              <RedoRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', mx: 0.5 }} />

        <Tooltip title="축소">
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 44, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </Typography>

        <Tooltip title="확대">
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomInRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="화면 맞춤">
          <IconButton size="small" onClick={onFitScreen}>
            <FitScreenRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3. 우측: 원본 비교, 전체 초기화, 고화질 내보내기 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant={isComparing ? 'contained' : 'outlined'}
          color={isComparing ? 'warning' : 'inherit'}
          size="small"
          startIcon={<CompareArrowsRoundedIcon />}
          onClick={onCompareToggle}
          sx={{ height: 34, fontWeight: 700, borderRadius: 1.5 }}
        >
          {isComparing ? '보정본 보기' : '원본 비교'}
        </Button>

        <Tooltip title="모든 보정 초기화">
          <IconButton size="small" onClick={onResetAll}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<DownloadRoundedIcon />}
          onClick={onOpenExport}
          sx={{ height: 34, px: 2, fontWeight: 800, borderRadius: 1.5 }}
        >
          내보내기
        </Button>
      </Box>
    </Box>
  );
}
