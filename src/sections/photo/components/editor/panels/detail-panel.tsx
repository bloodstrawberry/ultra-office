'use client';

import type { DetailAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

// ----------------------------------------------------------------------

interface DetailPanelProps {
  values: DetailAdjustments;
  onChange: (key: keyof DetailAdjustments, val: number) => void;
  onReset: () => void;
}

interface DetailConfig {
  key: keyof DetailAdjustments;
  label: string;
  desc: string;
  min: number;
  max: number;
}

const DETAIL_CONFIGS: DetailConfig[] = [
  {
    key: 'clarity',
    label: '선명도 (Clarity)',
    desc: '윤곽과 디테일을 또렷하고 선명하게 조절',
    min: -100,
    max: 100,
  },
  {
    key: 'definition',
    label: '명료도 (Definition)',
    desc: '중간 밝기 영역의 로컬 대비를 강화',
    min: -100,
    max: 100,
  },
  {
    key: 'texture',
    label: '텍스처 (Texture)',
    desc: '옷감, 피부, 나뭇잎 등 표면의 세부 질감을 강조',
    min: -100,
    max: 100,
  },
  {
    key: 'structure',
    label: '구조 (Structure)',
    desc: '전체적인 피사체 디테일과 굵직한 윤곽을 강조',
    min: -100,
    max: 100,
  },
  {
    key: 'dehaze',
    label: '디헤이즈 (Dehaze)',
    desc: '안개, 빛 번짐 또는 뿌연 느낌을 제거하여 투명하게 복원',
    min: -100,
    max: 100,
  },
  {
    key: 'noiseReduction',
    label: '노이즈 감소 (Noise Reduction)',
    desc: '어두운 곳에서 촬영 시 발생하는 거친 입자 노이즈를 감소',
    min: 0,
    max: 100,
  },
  {
    key: 'colorNoiseReduction',
    label: '색상 노이즈 감소 (Color Noise)',
    desc: '암부의 울긋불긋한 색상 노이즈 얼룩을 부드럽게 정돈',
    min: 0,
    max: 100,
  },
  {
    key: 'sharpening',
    label: '샤프닝 (Sharpening)',
    desc: '흐릿한 윤곽선 엣지를 칼같이 날카롭고 선명하게 만듦',
    min: 0,
    max: 100,
  },
];

export function DetailPanel({ values, onChange, onReset }: DetailPanelProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            디테일 & 선명도 (Detail & Clarity)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            윤곽 선명화, 표면 텍스처, 노이즈 감소 및 디헤이즈
          </Typography>
        </Box>
        <Tooltip title="디테일 설정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 슬라이더 목록 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {DETAIL_CONFIGS.map((cfg) => {
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
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: isChanged ? 'primary.main' : 'text.secondary',
                    minWidth: 32,
                    textAlign: 'right',
                  }}
                >
                  {val > 0 ? `+${val}` : val}
                </Typography>
              </Box>

              <Slider
                size="small"
                value={val}
                min={cfg.min}
                max={cfg.max}
                onChange={(_, v) => onChange(cfg.key, v as number)}
              />
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
