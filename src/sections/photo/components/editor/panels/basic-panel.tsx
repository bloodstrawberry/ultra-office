'use client';

import type { BasicAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

// ----------------------------------------------------------------------

interface BasicPanelProps {
  values: BasicAdjustments;
  onChange: (key: keyof BasicAdjustments, val: number) => void;
  onReset: () => void;
}

interface SliderConfig {
  key: keyof BasicAdjustments;
  label: string;
  desc: string;
  min: number;
  max: number;
  step?: number;
}

const SLIDERS: SliderConfig[] = [
  {
    key: 'exposure',
    label: '노출 (Exposure)',
    desc: '사진 전체의 빛과 밝은 정도를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'brightness',
    label: '밝기 (Brightness)',
    desc: '사진 전체를 밝게 또는 어둡게 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'luminance',
    label: '휘도 (Luminance)',
    desc: '밝은 부분과 어두운 부분을 균형 있게 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'contrast',
    label: '대비 (Contrast)',
    desc: '밝은 영역과 어두운 영역의 명암 차이를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'highlights',
    label: '하이라이트 (Highlights)',
    desc: '밝은 영역의 디테일과 세부 밝기를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'shadows',
    label: '그림자 (Shadows)',
    desc: '어두운 암부 영역의 밝기와 디테일을 복원',
    min: -100,
    max: 100,
  },
  {
    key: 'whites',
    label: '화이트 (Whites)',
    desc: '가장 밝은 하얀색 영역의 포화도를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'blacks',
    label: '블랙 (Blacks)',
    desc: '가장 어두운 검정색 영역의 깊이를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'blackPoint',
    label: '블랙 포인트 (Black Point)',
    desc: '검정 영역의 기준 깊이와 섀도우 롤오프를 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'gamma',
    label: '감마 (Gamma)',
    desc: '중간 밝기(미드톤) 영역의 계조를 조절',
    min: -100,
    max: 100,
  },
];

export function BasicPanel({ values, onChange, onReset }: BasicPanelProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 및 전체 초기화 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            기본 톤 & 명암 보정
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            노출, 하이라이트, 그림자 및 계조를 정밀 조절합니다.
          </Typography>
        </Box>
        <Tooltip title="기본 보정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 10개 슬라이더 목록 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SLIDERS.map((cfg) => {
          const val = values[cfg.key];
          const isChanged = val !== 0;

          return (
            <Card
              key={cfg.key}
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: isChanged ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s',
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
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {cfg.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', color: 'text.disabled', fontSize: '0.6875rem' }}
                  >
                    {cfg.desc}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      minWidth: 32,
                      textAlign: 'right',
                      color: isChanged ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {val > 0 ? `+${val}` : val}
                  </Typography>
                  {isChanged && (
                    <Tooltip title="0으로 초기화">
                      <IconButton
                        size="small"
                        onClick={() => onChange(cfg.key, 0)}
                        sx={{ p: 0.25, width: 20, height: 20 }}
                      >
                        <RestartAltRoundedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Slider
                size="small"
                value={val}
                min={cfg.min}
                max={cfg.max}
                step={cfg.step || 1}
                onChange={(_, newVal) => onChange(cfg.key, newVal as number)}
                valueLabelDisplay="auto"
                sx={{
                  color: isChanged ? 'primary.main' : 'grey.500',
                  py: 1,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                  },
                }}
              />
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
