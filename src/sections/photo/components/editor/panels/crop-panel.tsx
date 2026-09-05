'use client';

import type { CropAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';

import { ASPECT_RATIO_OPTIONS } from '../editor-presets';

// ----------------------------------------------------------------------

interface CropPanelProps {
  values: CropAdjustments;
  onChange: (newValues: CropAdjustments) => void;
  onReset: () => void;
}

export function CropPanel({ values, onChange, onReset }: CropPanelProps) {
  const updateField = <K extends keyof CropAdjustments>(key: K, val: CropAdjustments[K]) => {
    onChange({ ...values, [key]: val });
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    const nextRot = (values.rotation + delta + 360) % 360;
    updateField('rotation', nextRot);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            자르기 및 변형 (Crop & Transform)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            비율 자르기, 회전, 반전, 수평 및 원근/렌즈 왜곡 보정
          </Typography>
        </Box>
        <Tooltip title="변형 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1. 비율 선택 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          자르기 비율 (Aspect Ratio)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ASPECT_RATIO_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              size="small"
              color={values.aspectRatio === opt.id ? 'primary' : 'default'}
              variant={values.aspectRatio === opt.id ? 'filled' : 'outlined'}
              onClick={() => updateField('aspectRatio', opt.id)}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            />
          ))}
        </Box>
      </Card>

      {/* 2. 회전 및 반전 액션 버튼 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          회전 & 반전 (Rotate & Flip)
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleRotate('ccw')}
            sx={{ display: 'flex', flexDirection: 'column', py: 1, gap: 0.5 }}
          >
            <RotateLeftRoundedIcon />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              -90°
            </Typography>
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleRotate('cw')}
            sx={{ display: 'flex', flexDirection: 'column', py: 1, gap: 0.5 }}
          >
            <RotateRightRoundedIcon />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              +90°
            </Typography>
          </Button>
          <Button
            variant={values.flipH ? 'contained' : 'outlined'}
            size="small"
            onClick={() => updateField('flipH', !values.flipH)}
            sx={{ display: 'flex', flexDirection: 'column', py: 1, gap: 0.5 }}
          >
            <FlipRoundedIcon />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              좌우 반전
            </Typography>
          </Button>
          <Button
            variant={values.flipV ? 'contained' : 'outlined'}
            size="small"
            onClick={() => updateField('flipV', !values.flipV)}
            sx={{ display: 'flex', flexDirection: 'column', py: 1, gap: 0.5 }}
          >
            <FlipRoundedIcon sx={{ transform: 'rotate(90deg)' }} />
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              상하 반전
            </Typography>
          </Button>
        </Box>
      </Card>

      {/* 3. 수평 보정 (Straighten) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              수평 보정 (Straighten)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              기울어진 수평선/지평선을 미세 회전하여 수평 맞춤
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {values.straighten > 0 ? `+${values.straighten}°` : `${values.straighten}°`}
          </Typography>
        </Box>
        <Slider
          size="small"
          value={values.straighten}
          min={-45}
          max={45}
          onChange={(_, v) => updateField('straighten', v as number)}
        />
      </Card>

      {/* 4. 원근 보정 (Perspective Keystone) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          원근 왜곡 보정 (Perspective Keystone)
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">수직 원근 (Vertical Tilt)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.perspectiveVertical}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.perspectiveVertical}
            min={-30}
            max={30}
            onChange={(_, v) => updateField('perspectiveVertical', v as number)}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">수평 원근 (Horizontal Tilt)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.perspectiveHorizontal}
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.perspectiveHorizontal}
            min={-30}
            max={30}
            onChange={(_, v) => updateField('perspectiveHorizontal', v as number)}
          />
        </Box>
      </Card>

      {/* 5. 렌즈 왜곡 보정 (Lens Distortion) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              렌즈 왜곡 보정 (Lens Distortion)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              배럴(볼록 왜곡) ↔ 핀쿠션(오목 왜곡) 보정
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {values.lensDistortion}
          </Typography>
        </Box>
        <Slider
          size="small"
          value={values.lensDistortion}
          min={-50}
          max={50}
          onChange={(_, v) => updateField('lensDistortion', v as number)}
        />
      </Card>
    </Box>
  );
}
