'use client';

import type { SelectiveMaskType, SelectiveAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import GradientRoundedIcon from '@mui/icons-material/GradientRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import WallpaperRoundedIcon from '@mui/icons-material/WallpaperRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

// ----------------------------------------------------------------------

interface SelectivePanelProps {
  values: SelectiveAdjustments;
  onChange: (newValues: SelectiveAdjustments) => void;
  onReset: () => void;
}

const MASK_TOOLS: Array<{ id: SelectiveMaskType; label: string; icon: React.ReactNode }> = [
  { id: 'brush', label: '브러시', icon: <BrushRoundedIcon fontSize="small" /> },
  { id: 'radial', label: '원형 선택', icon: <RadioButtonUncheckedRoundedIcon fontSize="small" /> },
  { id: 'rect', label: '사각형 선택', icon: <CropSquareRoundedIcon fontSize="small" /> },
  { id: 'linear', label: '선형 그라디언트', icon: <GradientRoundedIcon fontSize="small" /> },
  { id: 'color', label: '색상 범위', icon: <ColorizeRoundedIcon fontSize="small" /> },
  { id: 'subject', label: '피사체 자동', icon: <PersonOutlineRoundedIcon fontSize="small" /> },
  { id: 'sky', label: '하늘 선택', icon: <CloudQueueRoundedIcon fontSize="small" /> },
  { id: 'background', label: '배경 선택', icon: <WallpaperRoundedIcon fontSize="small" /> },
];

export function SelectivePanel({ values, onChange, onReset }: SelectivePanelProps) {
  const updateField = <K extends keyof SelectiveAdjustments>(
    key: K,
    val: SelectiveAdjustments[K]
  ) => {
    onChange({ ...values, [key]: val });
  };

  const handleMaskSelect = (mask: SelectiveMaskType) => {
    onChange({
      ...values,
      active: true,
      maskType: mask,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            선택 보정 (Selective Adjustments)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            원하는 영역만 마스킹하여 부분 노출, 색상 및 블러 조절
          </Typography>
        </Box>
        <Tooltip title="선택 보정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 마스크 도구 선택 그리드 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          영역 선택 방식
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {MASK_TOOLS.map((t) => {
            const isSelected = values.active && values.maskType === t.id;
            return (
              <Card
                key={t.id}
                onClick={() => handleMaskSelect(t.id)}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                  color: isSelected ? 'primary.main' : 'text.primary',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                {t.icon}
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.6875rem', fontWeight: 700 }}
                  noWrap
                >
                  {t.label}
                </Typography>
              </Card>
            );
          })}
        </Box>

        {/* 마스크 반전 토글 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 1.5,
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            마스크 영역 반전 (Invert Selection)
          </Typography>
          <Switch
            checked={values.maskInvert}
            onChange={(e) => updateField('maskInvert', e.target.checked)}
            size="small"
          />
        </Box>
      </Card>

      {/* 브러시 세부 설정 (브러시 모드일 때) */}
      {values.maskType === 'brush' && (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            브러시 크기 & 부드러움
          </Typography>
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">브러시 반지름</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.brushRadius}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.brushRadius}
              min={5}
              max={100}
              onChange={(_, v) => updateField('brushRadius', v as number)}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">경계 페더 (Feather)</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.brushFeather}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.brushFeather}
              min={0}
              max={100}
              onChange={(_, v) => updateField('brushFeather', v as number)}
            />
          </Box>
        </Card>
      )}

      {/* 선택 영역 국소 보정 슬라이더 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
          선택 영역 보정 슬라이더
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 노출 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                국소 노출 (Exposure)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.exposure > 0 ? `+${values.exposure}` : values.exposure}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.exposure}
              min={-100}
              max={100}
              onChange={(_, v) => updateField('exposure', v as number)}
            />
          </Box>

          {/* 대비 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                국소 대비 (Contrast)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.contrast > 0 ? `+${values.contrast}` : values.contrast}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.contrast}
              min={-100}
              max={100}
              onChange={(_, v) => updateField('contrast', v as number)}
            />
          </Box>

          {/* 채도 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                국소 채도 (Saturation)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
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
          </Box>

          {/* 색온도 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                국소 색온도 (Warmth)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.temperature > 0 ? `+${values.temperature}` : values.temperature}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.temperature}
              min={-100}
              max={100}
              onChange={(_, v) => updateField('temperature', v as number)}
            />
          </Box>

          {/* 블러 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                국소 블러 (Blur Out)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.blur}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.blur}
              min={0}
              max={100}
              onChange={(_, v) => updateField('blur', v as number)}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
