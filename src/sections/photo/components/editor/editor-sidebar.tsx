'use client';

import type { TabCategory, PhotoEditorState, FilterPresetItem } from './editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import DetailsRoundedIcon from '@mui/icons-material/DetailsRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoAwesomeMotionRoundedIcon from '@mui/icons-material/AutoAwesomeMotionRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';

import { AiPanel } from './panels/ai-panel';
import { CropPanel } from './panels/crop-panel';
import { BasicPanel } from './panels/basic-panel';
import { ColorPanel } from './panels/color-panel';
import { DetailPanel } from './panels/detail-panel';
import { EffectsPanel } from './panels/effects-panel';
import { FiltersPanel } from './panels/filters-panel';
import { PortraitPanel } from './panels/portrait-panel';
import { DecoratePanel } from './panels/decorate-panel';
import { SelectivePanel } from './panels/selective-panel';
import {
  DEFAULT_AI_ADJUSTMENTS,
  DEFAULT_CROP_ADJUSTMENTS,
  DEFAULT_BASIC_ADJUSTMENTS,
  DEFAULT_COLOR_ADJUSTMENTS,
  DEFAULT_DETAIL_ADJUSTMENTS,
  DEFAULT_FILTER_ADJUSTMENTS,
  DEFAULT_EFFECTS_ADJUSTMENTS,
  DEFAULT_PORTRAIT_ADJUSTMENTS,
  DEFAULT_DECORATE_ADJUSTMENTS,
  DEFAULT_SELECTIVE_ADJUSTMENTS,
} from './editor-types';

// ----------------------------------------------------------------------

interface EditorSidebarProps {
  currentTab: TabCategory;
  onTabChange: (tab: TabCategory) => void;
  state: PhotoEditorState;
  onStateChange: (newState: PhotoEditorState) => void;
  onTriggerEraser: () => void;
  onTriggerBgRemove: () => void;
  onTriggerUpscale: (factor: 1 | 2 | 4) => void;
  width?: number;
}

const TABS: Array<{ id: TabCategory; label: string; icon: React.ReactElement }> = [
  { id: 'basic', label: '기본 보정', icon: <TuneRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'color', label: '색상', icon: <ColorLensRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'detail', label: '디테일', icon: <DetailsRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'effects', label: '효과', icon: <AutoAwesomeMotionRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'filters', label: '필터', icon: <FilterAltRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'crop', label: '크롭/회전', icon: <CropRotateRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'selective', label: '선택 보정', icon: <SelectAllRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'ai', label: 'AI 편집', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} /> },
  {
    id: 'portrait',
    label: '인물 보정',
    icon: <FaceRetouchingNaturalRoundedIcon sx={{ fontSize: 18 }} />,
  },
  { id: 'decorate', label: '합성/꾸미기', icon: <LayersRoundedIcon sx={{ fontSize: 18 }} /> },
];

export function EditorSidebar({
  currentTab,
  onTabChange,
  state,
  onStateChange,
  onTriggerEraser,
  onTriggerBgRemove,
  onTriggerUpscale,
  width = 380,
}: EditorSidebarProps) {
  return (
    <Box
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. 상단 탭 네비게이션 스크롤 바 */}
      <Box
        sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, val) => onTabChange(val as TabCategory)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              py: 1,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              gap: 0.5,
              flexDirection: 'row',
            },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.id} value={t.id} label={t.label} icon={t.icon} />
          ))}
        </Tabs>
      </Box>

      {/* 2. 각 카테고리별 내부 스크롤 콘텐츠 패널 */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {currentTab === 'basic' && (
          <BasicPanel
            values={state.basic}
            onChange={(key, val) =>
              onStateChange({ ...state, basic: { ...state.basic, [key]: val } })
            }
            onReset={() => onStateChange({ ...state, basic: DEFAULT_BASIC_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'color' && (
          <ColorPanel
            values={state.color}
            onChange={(newColor) => onStateChange({ ...state, color: newColor })}
            onReset={() => onStateChange({ ...state, color: DEFAULT_COLOR_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'detail' && (
          <DetailPanel
            values={state.detail}
            onChange={(key, val) =>
              onStateChange({ ...state, detail: { ...state.detail, [key]: val } })
            }
            onReset={() => onStateChange({ ...state, detail: DEFAULT_DETAIL_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'effects' && (
          <EffectsPanel
            values={state.effects}
            onChange={(newEffects) => onStateChange({ ...state, effects: newEffects })}
            onReset={() => onStateChange({ ...state, effects: DEFAULT_EFFECTS_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'filters' && (
          <FiltersPanel
            values={state.filters}
            deviceMode={state.deviceMode}
            onApplyPreset={(preset: FilterPresetItem) => {
              onStateChange({
                ...state,
                filters: { presetId: preset.id, intensity: 100 },
                basic: { ...state.basic, ...preset.settings },
                color: { ...state.color, ...preset.settings },
                detail: { ...state.detail, ...preset.settings },
                effects: { ...state.effects, ...preset.settings },
              });
            }}
            onChangeIntensity={(intensity) =>
              onStateChange({
                ...state,
                filters: { ...state.filters, intensity },
              })
            }
            onReset={() => onStateChange({ ...state, filters: DEFAULT_FILTER_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'crop' && (
          <CropPanel
            values={state.crop}
            onChange={(newCrop) => onStateChange({ ...state, crop: newCrop })}
            onReset={() => onStateChange({ ...state, crop: DEFAULT_CROP_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'selective' && (
          <SelectivePanel
            values={state.selective}
            onChange={(newSelective) => onStateChange({ ...state, selective: newSelective })}
            onReset={() => onStateChange({ ...state, selective: DEFAULT_SELECTIVE_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'ai' && (
          <AiPanel
            values={state.ai}
            deviceMode={state.deviceMode}
            onTriggerEraser={onTriggerEraser}
            onTriggerBgRemove={onTriggerBgRemove}
            onTriggerUpscale={onTriggerUpscale}
            onChange={(newAi) => onStateChange({ ...state, ai: newAi })}
            onReset={() => onStateChange({ ...state, ai: DEFAULT_AI_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'portrait' && (
          <PortraitPanel
            values={state.portrait}
            onChange={(newPortrait) => onStateChange({ ...state, portrait: newPortrait })}
            onReset={() => onStateChange({ ...state, portrait: DEFAULT_PORTRAIT_ADJUSTMENTS })}
          />
        )}

        {currentTab === 'decorate' && (
          <DecoratePanel
            values={state.decorate}
            onChange={(newDecorate) => onStateChange({ ...state, decorate: newDecorate })}
            onReset={() => onStateChange({ ...state, decorate: DEFAULT_DECORATE_ADJUSTMENTS })}
          />
        )}
      </Box>
    </Box>
  );
}
