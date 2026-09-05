'use client';

import type { DeviceMode, FilterPresetItem, FilterAdjustments } from '../editor-types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { FILTER_PRESETS } from '../editor-presets';

// ----------------------------------------------------------------------

interface FiltersPanelProps {
  values: FilterAdjustments;
  deviceMode: DeviceMode;
  onApplyPreset: (preset: FilterPresetItem) => void;
  onChangeIntensity: (intensity: number) => void;
  onReset: () => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: '전체' },
  { id: 'iphone', label: '🍎 아이폰 iOS' },
  { id: 'galaxy', label: '📱 갤럭시 One UI' },
  { id: 'cinema', label: '🎬 시네마' },
  { id: 'film', label: '🎞️ 필름 카메라' },
  { id: 'vintage', label: '📻 빈티지 & 레트로' },
  { id: 'bw', label: '⚫ 흑백 & 세피아' },
];

export function FiltersPanel({
  values,
  deviceMode,
  onApplyPreset,
  onChangeIntensity,
  onReset,
}: FiltersPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(deviceMode);

  const filteredList = FILTER_PRESETS.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'vintage') return p.category === 'vintage' || p.category === 'retro';
    if (selectedCategory === 'bw') return p.category === 'bw' || p.category === 'sepia';
    return p.category === selectedCategory;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            필터 프리셋 (Filters & Styles)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            갤럭시 One UI & 아이폰 iOS 시그니처 감성 필터
          </Typography>
        </Box>
        <Tooltip title="필터 제거">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 필터 강도 조절 (필터 선택 시 활성화) */}
      <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2, bgcolor: 'background.neutral' }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            필터 적용 강도 (Filter Intensity)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {values.intensity}%
          </Typography>
        </Box>
        <Slider
          size="small"
          value={values.intensity}
          min={0}
          max={100}
          onChange={(_, v) => onChangeIntensity(v as number)}
        />
      </Card>

      {/* 카테고리 칩 탭 */}
      <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5 }}>
        {CATEGORY_TABS.map((tab) => (
          <Chip
            key={tab.id}
            label={tab.label}
            size="small"
            color={selectedCategory === tab.id ? 'primary' : 'default'}
            variant={selectedCategory === tab.id ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategory(tab.id)}
            sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* 프리셋 그리드 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
        {filteredList.map((preset) => {
          const isSelected = values.presetId === preset.id;
          return (
            <Card
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* 컬러 바 & 뱃지 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: preset.thumbnailColor,
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, fontSize: '0.8125rem' }}
                  noWrap
                >
                  {preset.name}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {preset.subtitle}
              </Typography>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
