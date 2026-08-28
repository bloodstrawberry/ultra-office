'use client';

import type { PresetType, BackgroundMode, BlackHoleConfig } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';

import { PRESETS, classifyImpactScenario } from '../physics-engine';
import {
  playResetSound,
  playToggleOnSound,
  playToggleOffSound,
  playButtonClickSound,
  playPanelToggleSound,
  playPresetSelectSound,
} from '../utils/sound';

// ----------------------------------------------------------------------

interface ControlPanelProps {
  config: BlackHoleConfig;
  activePreset: PresetType;
  onChangeConfig: (newConfig: Partial<BlackHoleConfig>) => void;
  onSelectPreset: (preset: PresetType) => void;
  onResetConfig: () => void;
  onShootPhoton: () => void;
}

export function ControlPanel({
  config,
  activePreset,
  onChangeConfig,
  onSelectPreset,
  onResetConfig,
  onShootPhoton,
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const togglePanel = () => {
    playPanelToggleSound(!isOpen);
    setIsOpen((prev) => !prev);
  };

  const handlePresetClick = (presetKey: PresetType) => {
    playPresetSelectSound();
    onSelectPreset(presetKey);
  };

  const handleResetClick = () => {
    playResetSound();
    onResetConfig();
  };

  const scenario = classifyImpactScenario(config.impactParameter);

  return (
    <>
      {/* Collapsed Button */}
      {!isOpen && (
        <Button
          variant="contained"
          size="small"
          startIcon={<TuneRoundedIcon />}
          onClick={togglePanel}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 20,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38BDF8',
            fontWeight: 800,
            borderRadius: 2.5,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.95)' },
          }}
        >
          파라미터 조절
        </Button>
      )}

      {/* Control Panel Card */}
      <Card
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          width: { xs: 290, sm: 330 },
          maxHeight: 'calc(100% - 120px)',
          overflowY: 'auto',
          p: 2,
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          color: '#F8FAFC',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: 1.75,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#38BDF8',
                boxShadow: '0 0 8px #38BDF8',
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8' }}>
              {config.activeMode === 'mode1'
                ? '2D 시공간 격자 제어'
                : config.activeMode === 'mode2'
                  ? '3D 빛의 궤적 제어'
                  : config.activeMode === 'mode3'
                    ? '중력 렌즈 렌더러 제어'
                    : config.activeMode === 'mode4'
                      ? '스파게티화 파쇄 제어'
                      : config.activeMode === 'mode5'
                        ? '중력 시간 지연 제어'
                        : '쌍성 블랙홀 & 중력파 제어'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={togglePanel} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Presets Selector */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}
          >
            물리학 프리셋 (Presets)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
            {(Object.keys(PRESETS) as PresetType[]).map((key) => {
              const isActive = activePreset === key;
              return (
                <Tooltip key={key} title={PRESETS[key].desc}>
                  <Button
                    size="small"
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => handlePresetClick(key)}
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      py: 0.5,
                      px: 0.5,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderColor: isActive ? 'primary.main' : 'rgba(51, 65, 85, 0.8)',
                      bgcolor: isActive ? 'primary.main' : 'rgba(30, 41, 59, 0.5)',
                      color: isActive ? '#FFFFFF' : '#CBD5E1',
                    }}
                  >
                    {PRESETS[key].name.split(' ')[0]}
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Universal Controls: Mass */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.7)',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#CBD5E1' }}>
              블랙홀 질량 (Mass M)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}
            >
              {config.mass.toFixed(1)} M☉
            </Typography>
          </Box>
          <Slider
            value={config.mass}
            min={0.2}
            max={4.0}
            step={0.1}
            onChange={(_, val) => onChangeConfig({ mass: val as number })}
            size="small"
            sx={{ color: '#38BDF8' }}
          />
        </Box>

        {/* Mode 1 & Mode 2 Controls: Impact Parameter b */}
        {(config.activeMode === 'mode1' || config.activeMode === 'mode2') && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#CBD5E1' }}>
                충돌 매개변수 (b / Rph)
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor:
                    scenario === 'deflection'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : scenario === 'orbit'
                        ? 'rgba(252, 211, 77, 0.15)'
                        : 'rgba(251, 113, 133, 0.15)',
                  color:
                    scenario === 'deflection'
                      ? '#38BDF8'
                      : scenario === 'orbit'
                        ? '#FCD34D'
                        : '#FB7185',
                }}
              >
                {config.impactParameter.toFixed(2)} Rph
              </Typography>
            </Box>

            <Slider
              value={config.impactParameter}
              min={0.3}
              max={2.5}
              step={0.05}
              onChange={(_, val) => onChangeConfig({ impactParameter: val as number })}
              size="small"
              sx={{ color: '#FCD34D' }}
            />

            <ButtonGroup size="small" fullWidth sx={{ mt: 0.5 }}>
              <Button
                onClick={() => {
                  playButtonClickSound();
                  onChangeConfig({ impactParameter: 1.8 });
                }}
                sx={{
                  fontSize: '0.65rem',
                  color: '#38BDF8',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                }}
              >
                산란 (1.8)
              </Button>
              <Button
                onClick={() => {
                  playButtonClickSound();
                  onChangeConfig({ impactParameter: 1.0 });
                }}
                sx={{
                  fontSize: '0.65rem',
                  color: '#FCD34D',
                  borderColor: 'rgba(252, 211, 77, 0.4)',
                }}
              >
                광자구 (1.0)
              </Button>
              <Button
                onClick={() => {
                  playButtonClickSound();
                  onChangeConfig({ impactParameter: 0.5 });
                }}
                sx={{
                  fontSize: '0.65rem',
                  color: '#FB7185',
                  borderColor: 'rgba(251, 113, 133, 0.4)',
                }}
              >
                흡수 (0.5)
              </Button>
            </ButtonGroup>

            <Button
              variant="contained"
              size="small"
              startIcon={<RocketLaunchRoundedIcon />}
              onClick={() => {
                playButtonClickSound();
                onShootPhoton();
              }}
              sx={{
                mt: 0.5,
                fontWeight: 800,
                fontSize: '0.75rem',
                background: 'linear-gradient(135deg, #F59E0B 0%, #38BDF8 100%)',
              }}
            >
              광자(빛) 발사 및 궤적 갱신
            </Button>
          </Box>
        )}

        {/* Mode 3 Controls: Kerr Spin & Accretion Disk */}
        {config.activeMode === 'mode3' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#CBD5E1' }}>
                  커(Kerr) 회전 스핀 (a)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: '#FCD34D', fontFamily: 'monospace' }}
                >
                  {config.spin.toFixed(2)}
                </Typography>
              </Box>
              <Slider
                value={config.spin}
                min={-0.99}
                max={0.99}
                step={0.01}
                onChange={(_, val) => onChangeConfig({ spin: val as number })}
                size="small"
                sx={{ color: '#FCD34D' }}
              />
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#CBD5E1' }}>
                강착 원반(Accretion Disk)
              </Typography>
              <Switch
                size="small"
                checked={config.showAccretionDisk}
                onChange={(_, checked) => {
                  if (checked) playToggleOnSound();
                  else playToggleOffSound();
                  onChangeConfig({ showAccretionDisk: checked });
                }}
              />
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#CBD5E1', mb: 0.75, display: 'block' }}
              >
                배경 왜곡 테마
              </Typography>
              <ButtonGroup size="small" fullWidth>
                {(
                  [
                    { id: 'milkyway', label: '은하수' },
                    { id: 'grid', label: '격자' },
                    { id: 'deepspace', label: '심우주' },
                  ] as const
                ).map((bg) => (
                  <Button
                    key={bg.id}
                    variant={config.backgroundMode === bg.id ? 'contained' : 'outlined'}
                    onClick={() => {
                      playButtonClickSound();
                      onChangeConfig({ backgroundMode: bg.id as BackgroundMode });
                    }}
                    sx={{ fontSize: '0.65rem' }}
                  >
                    {bg.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </Box>
        )}

        {/* Bottom Actions: Reset */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            pt: 1,
            borderTop: '1px solid rgba(51, 65, 85, 0.8)',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleResetClick}
            sx={{ fontSize: '0.7rem', color: '#94A3B8', borderColor: 'rgba(51, 65, 85, 0.8)' }}
          >
            설정 초기화
          </Button>
        </Box>
      </Card>
    </>
  );
}
