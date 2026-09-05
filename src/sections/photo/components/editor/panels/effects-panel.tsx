'use client';

import type { EffectsAdjustments } from '../editor-types';

import React, { useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { LIGHT_LEAK_PRESETS } from '../editor-presets';

// ----------------------------------------------------------------------

interface EffectsPanelProps {
  values: EffectsAdjustments;
  onChange: (newValues: EffectsAdjustments) => void;
  onReset: () => void;
}

export function EffectsPanel({ values, onChange, onReset }: EffectsPanelProps) {
  const doubleExpoFileInputRef = useRef<HTMLInputElement>(null);

  const updateVignette = (field: keyof EffectsAdjustments['vignette'], val: number) => {
    onChange({
      ...values,
      vignette: { ...values.vignette, [field]: val },
    });
  };

  const updateGrain = (field: keyof EffectsAdjustments['grain'], val: number) => {
    onChange({
      ...values,
      grain: { ...values.grain, [field]: val },
    });
  };

  const updateBlur = (field: keyof EffectsAdjustments['blur'], val: any) => {
    onChange({
      ...values,
      blur: { ...values.blur, [field]: val },
    });
  };

  const updateGlow = (field: keyof EffectsAdjustments['glow'], val: number) => {
    onChange({
      ...values,
      glow: { ...values.glow, [field]: val },
    });
  };

  const updateBokeh = (field: keyof EffectsAdjustments['bokeh'], val: any) => {
    onChange({
      ...values,
      bokeh: { ...values.bokeh, [field]: val },
    });
  };

  const updateLightLeak = (field: keyof EffectsAdjustments['lightLeak'], val: any) => {
    onChange({
      ...values,
      lightLeak: { ...values.lightLeak, [field]: val },
    });
  };

  const updateDoubleExposure = (field: keyof EffectsAdjustments['doubleExposure'], val: any) => {
    onChange({
      ...values,
      doubleExposure: { ...values.doubleExposure, [field]: val },
    });
  };

  const handleDoubleExposureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateDoubleExposure('imageSrc', reader.result as string);
        updateDoubleExposure('enabled', true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            특수 효과 (Special Effects)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            비네트, 그레인, 빛샘, 블러, 보케 및 더블 노출
          </Typography>
        </Box>
        <Tooltip title="효과 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1. 비네트 (Vignette) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              비네트 (Vignette)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              가장자리를 어둡거나(음수) 밝게(양수) 처리
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {values.vignette.amount}
          </Typography>
        </Box>
        <Slider
          size="small"
          value={values.vignette.amount}
          min={-100}
          max={100}
          onChange={(_, v) => updateVignette('amount', v as number)}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              범위 (Midpoint): {values.vignette.midpoint}%
            </Typography>
            <Slider
              size="small"
              value={values.vignette.midpoint}
              min={10}
              max={90}
              onChange={(_, v) => updateVignette('midpoint', v as number)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
              부드러움 (Feather): {values.vignette.feather}%
            </Typography>
            <Slider
              size="small"
              value={values.vignette.feather}
              min={10}
              max={100}
              onChange={(_, v) => updateVignette('feather', v as number)}
            />
          </Box>
        </Box>
      </Card>

      {/* 2. 필름 그레인 & 페이드 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          필름 그레인 & 페이드 (Vintage Grain & Fade)
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">그레인 입자감 (Grain Amount)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.grain.amount}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.grain.amount}
            min={0}
            max={100}
            onChange={(_, v) => updateGrain('amount', v as number)}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">페이드 (Fade - 빈티지 물빠진 톤)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.fade}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.fade}
            min={0}
            max={100}
            onChange={(_, v) => onChange({ ...values, fade: v as number })}
          />
        </Box>
      </Card>

      {/* 3. 블러 & 글로우 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          블러 & 소프트 글로우 (Blur & Glow)
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">블러 흐림 강도</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.blur.amount}px
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.blur.amount}
            min={0}
            max={50}
            onChange={(_, v) => updateBlur('amount', v as number)}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">빛 번짐 글로우 (Glow Intensity)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {values.glow.amount}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={values.glow.amount}
            min={0}
            max={100}
            onChange={(_, v) => updateGlow('amount', v as number)}
          />
        </Box>
      </Card>

      {/* 4. 보케 (Bokeh / 심도 아웃포커싱) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            보케 효과 (Bokeh Depth of Field)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {values.bokeh.amount}%
          </Typography>
        </Box>
        <Slider
          size="small"
          value={values.bokeh.amount}
          min={0}
          max={100}
          onChange={(_, v) => updateBokeh('amount', v as number)}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Typography variant="caption" sx={{ alignSelf: 'center', fontSize: '0.75rem' }}>
            모양:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={values.bokeh.shape}
            exclusive
            onChange={(_, s) => s && updateBokeh('shape', s)}
          >
            <ToggleButton value="circle" sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}>
              원형
            </ToggleButton>
            <ToggleButton value="heart" sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}>
              하트
            </ToggleButton>
            <ToggleButton value="star" sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}>
              별
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Card>

      {/* 5. 빛샘 효과 (Light Leak) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              빛샘 효과 (Light Leak Overlay)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              렌즈에 새어 들어오는 따스한 햇살 & 플레어
            </Typography>
          </Box>
          <Switch
            checked={values.lightLeak.enabled}
            onChange={(e) => updateLightLeak('enabled', e.target.checked)}
            size="small"
          />
        </Box>

        {values.lightLeak.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                빛샘 스타일 프리셋
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {LIGHT_LEAK_PRESETS.map((leak) => (
                  <Chip
                    key={leak.id}
                    label={leak.name}
                    size="small"
                    color={values.lightLeak.preset === leak.id ? 'primary' : 'default'}
                    onClick={() => updateLightLeak('preset', leak.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">불투명도 (Opacity)</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {values.lightLeak.opacity}%
                </Typography>
              </Box>
              <Slider
                size="small"
                value={values.lightLeak.opacity}
                min={10}
                max={100}
                onChange={(_, v) => updateLightLeak('opacity', v as number)}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                빛샘 위치
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={values.lightLeak.position}
                exclusive
                onChange={(_, pos) => pos && updateLightLeak('position', pos)}
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, border: 'none' }}
              >
                <ToggleButton value="top-left" sx={{ flex: 1, fontSize: '0.6875rem' }}>
                  좌상단
                </ToggleButton>
                <ToggleButton value="top-right" sx={{ flex: 1, fontSize: '0.6875rem' }}>
                  우상단
                </ToggleButton>
                <ToggleButton value="bottom-left" sx={{ flex: 1, fontSize: '0.6875rem' }}>
                  좌하단
                </ToggleButton>
                <ToggleButton value="bottom-right" sx={{ flex: 1, fontSize: '0.6875rem' }}>
                  우하단
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        )}
      </Card>

      {/* 6. 더블 노출 (Double Exposure) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              더블 노출 (Double Exposure)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              두 장의 사진을 겹쳐 예술적인 실루엣 합성
            </Typography>
          </Box>
          <Switch
            checked={values.doubleExposure.enabled}
            onChange={(e) => updateDoubleExposure('enabled', e.target.checked)}
            size="small"
          />
        </Box>

        {values.doubleExposure.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <input
              ref={doubleExpoFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleDoubleExposureFile}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddPhotoAlternateRoundedIcon />}
              onClick={() => doubleExpoFileInputRef.current?.click()}
              sx={{ borderRadius: 1.5 }}
            >
              {values.doubleExposure.imageSrc ? '합성 사진 변경' : '두 번째 사진 추가하기'}
            </Button>

            {values.doubleExposure.imageSrc && (
              <>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">합성 투명도</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {values.doubleExposure.opacity}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={values.doubleExposure.opacity}
                    min={10}
                    max={100}
                    onChange={(_, v) => updateDoubleExposure('opacity', v as number)}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                    혼합 모드 (Blend Mode)
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={values.doubleExposure.blendMode}
                      onChange={(e) => updateDoubleExposure('blendMode', e.target.value)}
                    >
                      <MenuItem value="screen">Screen (밝은 영역 위주 합성)</MenuItem>
                      <MenuItem value="overlay">Overlay (명암 보존 합성)</MenuItem>
                      <MenuItem value="lighten">Lighten (가장 밝은 색만 합성)</MenuItem>
                      <MenuItem value="soft-light">Soft Light (은은한 부드러운 빛)</MenuItem>
                      <MenuItem value="multiply">Multiply (어두운 실루엣 합성)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
