'use client';

import type { HslChannel, ColorAdjustments, WhiteBalancePreset } from '../editor-types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import TungstenRoundedIcon from '@mui/icons-material/TungstenRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import WbIncandescentRoundedIcon from '@mui/icons-material/WbIncandescentRounded';

// ----------------------------------------------------------------------

interface ColorPanelProps {
  values: ColorAdjustments;
  onChange: (newValues: ColorAdjustments) => void;
  onReset: () => void;
}

const HSL_CHANNELS: Array<{ id: HslChannel; label: string; color: string }> = [
  { id: 'red', label: '빨강', color: '#ef4444' },
  { id: 'orange', label: '주황', color: '#f97316' },
  { id: 'yellow', label: '노랑', color: '#eab308' },
  { id: 'green', label: '초록', color: '#22c55e' },
  { id: 'cyan', label: '하늘', color: '#06b6d4' },
  { id: 'blue', label: '파랑', color: '#3b82f6' },
  { id: 'purple', label: '보라', color: '#a855f7' },
  { id: 'magenta', label: '자홍', color: '#ec4899' },
];

export function ColorPanel({ values, onChange, onReset }: ColorPanelProps) {
  const [selectedHslChannel, setSelectedHslChannel] = useState<HslChannel>('red');

  const updateField = <K extends keyof ColorAdjustments>(key: K, val: ColorAdjustments[K]) => {
    onChange({ ...values, [key]: val });
  };

  const handleWhiteBalancePreset = (preset: WhiteBalancePreset) => {
    let temp = values.temperature;
    let tint = values.tint;

    switch (preset) {
      case 'daylight':
        temp = 8;
        tint = 2;
        break;
      case 'cloudy':
        temp = 20;
        tint = 6;
        break;
      case 'shade':
        temp = 28;
        tint = 10;
        break;
      case 'tungsten':
        temp = -30;
        tint = -6;
        break;
      case 'fluorescent':
        temp = 12;
        tint = -14;
        break;
      case 'custom':
      default:
        break;
    }

    onChange({
      ...values,
      whiteBalance: preset,
      temperature: temp,
      tint,
    });
  };

  const updateHsl = (channel: HslChannel, field: 'h' | 's' | 'l', val: number) => {
    const nextHsl = {
      ...values.hsl,
      [channel]: {
        ...values.hsl[channel],
        [field]: val,
      },
    };
    onChange({ ...values, hsl: nextHsl });
  };

  const updateColorGrading = (
    tier: 'shadows' | 'midtones' | 'highlights',
    field: 'color' | 'intensity',
    val: string | number
  ) => {
    const nextCg = {
      ...values.colorGrading,
      [tier]: {
        ...values.colorGrading[tier],
        [field]: val,
      },
    };
    onChange({ ...values, colorGrading: nextCg });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            색상 & 화이트 밸런스 (Color & HSL)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            생동감, 색온도, 8채널 HSL 및 3웨이 컬러 그레이딩
          </Typography>
        </Box>
        <Tooltip title="색상 설정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 화이트 밸런스 원클릭 프리셋 */}
      <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
          화이트 밸런스 프리셋
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={values.whiteBalance}
          exclusive
          onChange={(_, p) => p && handleWhiteBalancePreset(p as WhiteBalancePreset)}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, border: 'none' }}
        >
          <ToggleButton
            value="custom"
            sx={{ flex: '1 1 30%', py: 0.5, fontSize: '0.75rem', borderRadius: 1 }}
          >
            수동 (Custom)
          </ToggleButton>
          <ToggleButton
            value="daylight"
            sx={{ flex: '1 1 30%', py: 0.5, fontSize: '0.75rem', borderRadius: 1 }}
          >
            <WbSunnyRoundedIcon sx={{ fontSize: 15, mr: 0.5, color: '#f59e0b' }} /> 맑음
          </ToggleButton>
          <ToggleButton
            value="cloudy"
            sx={{ flex: '1 1 30%', py: 0.5, fontSize: '0.75rem', borderRadius: 1 }}
          >
            <CloudRoundedIcon sx={{ fontSize: 15, mr: 0.5, color: '#94a3b8' }} /> 흐림
          </ToggleButton>
          <ToggleButton
            value="tungsten"
            sx={{ flex: '1 1 30%', py: 0.5, fontSize: '0.75rem', borderRadius: 1 }}
          >
            <TungstenRoundedIcon sx={{ fontSize: 15, mr: 0.5, color: '#0ea5e9' }} /> 백열등
          </ToggleButton>
          <ToggleButton
            value="fluorescent"
            sx={{ flex: '1 1 30%', py: 0.5, fontSize: '0.75rem', borderRadius: 1 }}
          >
            <WbIncandescentRoundedIcon sx={{ fontSize: 15, mr: 0.5, color: '#22c55e' }} /> 형광등
          </ToggleButton>
        </ToggleButtonGroup>
      </Card>

      {/* 전체 기본 색상 조절 슬라이더 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 채도 */}
        <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              채도 (Saturation) - 전체적인 색의 강도 조절
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: values.saturation !== 0 ? 'primary.main' : 'text.secondary',
              }}
            >
              {values.saturation > 0 ? `+${values.saturation}` : values.saturation}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.saturation}
            min={-100}
            max={100}
            onChange={(_, v) => updateField('saturation', v as number)}
          />
        </Card>

        {/* 생동감 */}
        <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              생동감 (Vibrance) - 인물 피부톤을 보호하며 자연스러운 색상 강화
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: values.vibrance !== 0 ? 'primary.main' : 'text.secondary',
              }}
            >
              {values.vibrance > 0 ? `+${values.vibrance}` : values.vibrance}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.vibrance}
            min={-100}
            max={100}
            onChange={(_, v) => updateField('vibrance', v as number)}
          />
        </Card>

        {/* 색온도 */}
        <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              색온도 (Temperature) - 파란빛(차가움) ↔ 노란빛(따뜻함)
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: values.temperature !== 0 ? 'primary.main' : 'text.secondary',
              }}
            >
              {values.temperature > 0 ? `+${values.temperature}` : values.temperature}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.temperature}
            min={-100}
            max={100}
            onChange={(_, v) => updateField('temperature', v as number)}
            sx={{
              '& .MuiSlider-track': {
                backgroundImage: 'linear-gradient(90deg, #38bdf8, #f59e0b)',
                border: 'none',
              },
            }}
          />
        </Card>

        {/* 색조 Tint */}
        <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              색조 (Tint) - 녹색(Green) ↔ 보라색(Magenta)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: values.tint !== 0 ? 'primary.main' : 'text.secondary' }}
            >
              {values.tint > 0 ? `+${values.tint}` : values.tint}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.tint}
            min={-100}
            max={100}
            onChange={(_, v) => updateField('tint', v as number)}
            sx={{
              '& .MuiSlider-track': {
                backgroundImage: 'linear-gradient(90deg, #22c55e, #ec4899)',
                border: 'none',
              },
            }}
          />
        </Card>

        {/* 전체 Hue 회전 */}
        <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              색조 (Hue 회전) - 특정 색상을 다른 스펙트럼 색상으로 변경
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: values.hue !== 0 ? 'primary.main' : 'text.secondary' }}
            >
              {values.hue}°
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.hue}
            min={-180}
            max={180}
            onChange={(_, v) => updateField('hue', v as number)}
          />
        </Card>
      </Box>

      {/* 8채널 HSL 조절기 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.neutral' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
          8채널 정밀 HSL 보정 (Hue, Saturation, Lightness)
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
          색상별로 원하는 색조, 채도, 밝기를 독립적으로 조절합니다.
        </Typography>

        {/* 색상 선택 원형 버튼 8개 */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1.5 }}>
          {HSL_CHANNELS.map((ch) => {
            const isSelected = selectedHslChannel === ch.id;
            return (
              <Box
                key={ch.id}
                onClick={() => setSelectedHslChannel(ch.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.6,
                  transition: 'all 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: ch.color,
                    border: isSelected ? '3px solid #FFFFFF' : '2px solid transparent',
                    boxShadow: isSelected ? '0 0 0 2px #000' : 'none',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.6875rem', fontWeight: isSelected ? 800 : 500 }}
                >
                  {ch.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* 선택된 색상 채널의 H, S, L 슬라이더 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            bgcolor: 'background.paper',
            p: 1.5,
            borderRadius: 2,
          }}
        >
          {/* H */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                색조 (Hue 편차)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.hsl[selectedHslChannel].h}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.hsl[selectedHslChannel].h}
              min={-100}
              max={100}
              onChange={(_, v) => updateHsl(selectedHslChannel, 'h', v as number)}
            />
          </Box>
          {/* S */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                채도 (Saturation)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.hsl[selectedHslChannel].s}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.hsl[selectedHslChannel].s}
              min={-100}
              max={100}
              onChange={(_, v) => updateHsl(selectedHslChannel, 's', v as number)}
            />
          </Box>
          {/* L */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                밝기 (Luminance)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.hsl[selectedHslChannel].l}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.hsl[selectedHslChannel].l}
              min={-100}
              max={100}
              onChange={(_, v) => updateHsl(selectedHslChannel, 'l', v as number)}
            />
          </Box>
        </Box>
      </Card>

      {/* 3웨이 컬러 그레이딩 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
          컬러 그레이딩 (Color Grading)
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
          그림자(Shadows), 미드톤(Midtones), 하이라이트(Highlights)별 색감 지정
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
          {/* 그림자 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              그림자 (암부)
            </Typography>
            <input
              type="color"
              value={values.colorGrading.shadows.color}
              onChange={(e) => updateColorGrading('shadows', 'color', e.target.value)}
              style={{
                width: '100%',
                height: 32,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              강도: {values.colorGrading.shadows.intensity}%
            </Typography>
            <Slider
              size="small"
              value={values.colorGrading.shadows.intensity}
              min={0}
              max={100}
              onChange={(_, v) => updateColorGrading('shadows', 'intensity', v as number)}
            />
          </Box>

          {/* 미드톤 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              미드톤 (중간)
            </Typography>
            <input
              type="color"
              value={values.colorGrading.midtones.color}
              onChange={(e) => updateColorGrading('midtones', 'color', e.target.value)}
              style={{
                width: '100%',
                height: 32,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              강도: {values.colorGrading.midtones.intensity}%
            </Typography>
            <Slider
              size="small"
              value={values.colorGrading.midtones.intensity}
              min={0}
              max={100}
              onChange={(_, v) => updateColorGrading('midtones', 'intensity', v as number)}
            />
          </Box>

          {/* 하이라이트 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              하이라이트
            </Typography>
            <input
              type="color"
              value={values.colorGrading.highlights.color}
              onChange={(e) => updateColorGrading('highlights', 'color', e.target.value)}
              style={{
                width: '100%',
                height: 32,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              강도: {values.colorGrading.highlights.intensity}%
            </Typography>
            <Slider
              size="small"
              value={values.colorGrading.highlights.intensity}
              min={0}
              max={100}
              onChange={(_, v) => updateColorGrading('highlights', 'intensity', v as number)}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
