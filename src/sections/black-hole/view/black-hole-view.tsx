'use client';

import type { PresetType, TelemetryData, BlackHoleConfig, VisualizationMode } from '../types';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AvTimerRoundedIcon from '@mui/icons-material/AvTimerRounded';
import Grid4x4RoundedIcon from '@mui/icons-material/Grid4x4Rounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import FilterTiltShiftRoundedIcon from '@mui/icons-material/FilterTiltShiftRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { TelemetryHUD } from '../components/telemetry-hud';
import { ControlPanel } from '../components/control-panel';
import { DescriptionPanel } from '../components/description-panel';
import { PRESETS, DEFAULT_SIMULATION_CONFIG } from '../physics-engine';
import { isSoundMuted, toggleSoundMuted, playButtonClickSound } from '../utils/sound';

// ----------------------------------------------------------------------

// Dynamic imports with SSR disabled for Three.js Canvas components
const Mode1GravityWell = dynamic(
  () => import('../components/mode1-gravity-well').then((m) => m.Mode1GravityWell),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#020617',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#38BDF8' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          2D 시공간 고무판 메쉬 렌더링 중...
        </Typography>
      </Box>
    ),
  }
);

const Mode2Geodesic3D = dynamic(
  () => import('../components/mode2-geodesic-3d').then((m) => m.Mode2Geodesic3D),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#020617',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#67E8F9' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          3D 광자구 및 영측지선 궤적 준비 중...
        </Typography>
      </Box>
    ),
  }
);

const Mode3Lensing = dynamic(
  () => import('../components/mode3-lensing').then((m) => m.Mode3Lensing),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#000000',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#A5B4FC' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          중력 렌즈 GLSL 레이마칭 셰이더 준비 중...
        </Typography>
      </Box>
    ),
  }
);

const Mode4Spaghettification = dynamic(
  () => import('../components/mode4-spaghettification').then((m) => m.Mode4Spaghettification),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#020617',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#F472B6' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          조석 파괴 스파게티화 시뮬레이터 준비 중...
        </Typography>
      </Box>
    ),
  }
);

const Mode5TimeDilation = dynamic(
  () => import('../components/mode5-time-dilation').then((m) => m.Mode5TimeDilation),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#020617',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#34D399' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          상대론적 듀얼 시계 시뮬레이터 준비 중...
        </Typography>
      </Box>
    ),
  }
);

const Mode6BinaryMerger = dynamic(
  () => import('../components/mode6-binary-merger').then((m) => m.Mode6BinaryMerger),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#020617',
          color: '#94A3B8',
        }}
      >
        <CircularProgress size={36} sx={{ color: '#C084FC' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          쌍성 블랙홀 & 중력파 립플 준비 중...
        </Typography>
      </Box>
    ),
  }
);

// ----------------------------------------------------------------------

export function BlackHoleView() {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<BlackHoleConfig>(DEFAULT_SIMULATION_CONFIG);
  const [activePreset, setActivePreset] = useState<PresetType>('schwarzschild');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    setHasLoaded(true);
    setIsMuted(isSoundMuted());
  }, []);

  const handleConfigChange = useCallback((newPartialConfig: Partial<BlackHoleConfig>) => {
    setConfig((prev) => ({ ...prev, ...newPartialConfig }));
  }, []);

  const handleSelectMode = useCallback((mode: VisualizationMode) => {
    playButtonClickSound();
    setConfig((prev) => ({ ...prev, activeMode: mode }));
  }, []);

  const handleShootPhoton = useCallback(() => {
    setConfig((prev) => ({ ...prev, photonShootId: prev.photonShootId + 1 }));
  }, []);

  const handleSelectPreset = useCallback((presetKey: PresetType) => {
    setActivePreset(presetKey);
    const presetConfig = PRESETS[presetKey].config;
    setConfig((prev) => ({ ...prev, ...presetConfig }));
  }, []);

  const handleResetConfig = useCallback(() => {
    setConfig(DEFAULT_SIMULATION_CONFIG);
    setActivePreset('schwarzschild');
  }, []);

  const handleTelemetryUpdate = useCallback((data: TelemetryData) => {
    setTelemetry(data);
  }, []);

  const handleToggleSound = useCallback(() => {
    const muted = toggleSoundMuted();
    setIsMuted(muted);
  }, []);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
        >
          <CircularProgress size={40} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      {/* 1. Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrackChangesRoundedIcon sx={{ fontSize: 34, color: 'primary.main' }} />
            블랙홀 & 일반 상대성 이론 랩 (Black Hole Relativity Studio)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            슈바르츠실트 및 커(Kerr) 블랙홀의 시공간 곡률, 광자구 영측지선, 아인슈타인 링 GLSL 중력
            렌즈, 스파게티화 조석 파괴, 중력 시간 지연 및 LIGO 쌍성 중력파를 3D로 시뮬레이션합니다.
          </Typography>
        </Box>

        {/* Global Toolbar Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isMuted ? '음소거 해제' : '효과음 끄기'}>
            <IconButton
              onClick={handleToggleSound}
              sx={{
                border: 1,
                borderColor: 'divider',
                color: isMuted ? 'text.disabled' : 'primary.main',
              }}
            >
              {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={config.isPaused ? '시뮬레이션 재개' : '시뮬레이션 일시정지'}>
            <Button
              variant={config.isPaused ? 'contained' : 'outlined'}
              color={config.isPaused ? 'warning' : 'primary'}
              size="small"
              onClick={() => {
                playButtonClickSound();
                setConfig((prev) => ({ ...prev, isPaused: !prev.isPaused }));
              }}
              sx={{ fontWeight: 700 }}
            >
              {config.isPaused ? '재개' : '일시정지'}
            </Button>
          </Tooltip>

          <Tooltip title={isFullscreen ? '전체화면 축소' : '전체화면 확대'}>
            <IconButton
              onClick={() => setIsFullscreen((prev) => !prev)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <FullscreenRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. Mode Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={config.activeMode}
          onChange={(_, val) => handleSelectMode(val as VisualizationMode)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="mode1"
            label="1. 2D 시공간 고무판 격자"
            icon={<Grid4x4RoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="mode2"
            label="2. 3D 빛의 영측지선 & 광자구"
            icon={<AutoAwesomeRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="mode3"
            label="3. 중력 렌즈 & 강착 원반"
            icon={<VisibilityRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="mode4"
            label="4. 스파게티화 & 조석 파괴"
            icon={<FilterTiltShiftRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="mode5"
            label="5. 중력 시간 지연 & 듀얼 시계"
            icon={<AvTimerRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="mode6"
            label="6. 쌍성 합병 & LIGO 중력파"
            icon={<AllInclusiveRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* 3. Main 3D Simulation Viewport Card */}
      <Card
        sx={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : { xs: 580, sm: 640, md: 700 },
          zIndex: isFullscreen ? 1400 : 1,
          borderRadius: isFullscreen ? 0 : 3,
          overflow: 'hidden',
          bgcolor: '#020617',
          border: isFullscreen ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: isFullscreen ? 'none' : '0 16px 48px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Active Three.js 3D Mode Canvas */}
        {config.activeMode === 'mode1' && <Mode1GravityWell config={config} />}
        {config.activeMode === 'mode2' && (
          <Mode2Geodesic3D config={config} onTelemetryUpdate={handleTelemetryUpdate} />
        )}
        {config.activeMode === 'mode3' && (
          <Mode3Lensing config={config} onTelemetryUpdate={handleTelemetryUpdate} />
        )}
        {config.activeMode === 'mode4' && (
          <Mode4Spaghettification config={config} onTelemetryUpdate={handleTelemetryUpdate} />
        )}
        {config.activeMode === 'mode5' && (
          <Mode5TimeDilation config={config} onTelemetryUpdate={handleTelemetryUpdate} />
        )}
        {config.activeMode === 'mode6' && (
          <Mode6BinaryMerger config={config} onTelemetryUpdate={handleTelemetryUpdate} />
        )}

        {/* Real-time Telemetry HUD (Top Left Overlay) */}
        <TelemetryHUD telemetry={telemetry} />

        {/* Interactive Physics Control Panel (Top Right Overlay) */}
        <ControlPanel
          config={config}
          activePreset={activePreset}
          onChangeConfig={handleConfigChange}
          onSelectPreset={handleSelectPreset}
          onResetConfig={handleResetConfig}
          onShootPhoton={handleShootPhoton}
        />

        {/* Dynamic Physics Explanation Card (Bottom Center Overlay) */}
        <DescriptionPanel config={config} />
      </Card>
    </DashboardContent>
  );
}
