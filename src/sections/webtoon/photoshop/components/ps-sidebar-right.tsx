'use client';

import React, { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FlareRoundedIcon from '@mui/icons-material/FlareRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import {
  type BlendMode,
  type HistoryItem,
  type PhotoshopLayer,
  BLEND_MODE_OPTIONS,
} from '../types';

interface PsSidebarRightProps {
  layers: PhotoshopLayer[];
  activeLayerId: string;
  history: HistoryItem[];
  historyIndex: number;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onCloneLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onChangeBlendMode: (id: string, mode: BlendMode) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onMergeDown: (id: string) => void;
  onFlatten: () => void;
  onJumpHistory: (index: number) => void;
  onApplyFilter: (
    filterType:
      | 'brightness'
      | 'hue'
      | 'grayscale'
      | 'invert'
      | 'sepia'
      | 'threshold'
      | 'blur'
      | 'sharpen'
      | 'lineArt'
      | 'screentone'
      | 'mosaic'
      | 'focusLines'
  ) => void;
}

export const PsSidebarRight = React.memo(function PsSidebarRight({
  layers,
  activeLayerId,
  history,
  historyIndex,
  onSelectLayer,
  onAddLayer,
  onCloneLayer,
  onDeleteLayer,
  onToggleVisible,
  onToggleLock,
  onChangeOpacity,
  onChangeBlendMode,
  onMoveLayer,
  onMergeDown,
  onFlatten,
  onJumpHistory,
  onApplyFilter,
}: PsSidebarRightProps) {
  const [currentTab, setCurrentTab] = useState<'layers' | 'adjust' | 'webtoon' | 'history'>(
    'layers'
  );

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  return (
    <Card
      sx={{
        width: 320,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Dock Tabs Header */}
      <Tabs
        value={currentTab}
        onChange={(_, val) => setCurrentTab(val)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
          '& .MuiTab-root': {
            minHeight: 40,
            py: 0.5,
            px: 0.5,
            fontSize: '0.75rem',
            fontWeight: 700,
          },
        }}
      >
        <Tab
          value="layers"
          icon={<LayersRoundedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="레이어"
        />
        <Tab
          value="adjust"
          icon={<TuneRoundedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="보정·필터"
        />
        <Tab
          value="webtoon"
          icon={<FlareRoundedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="웹툰 FX"
        />
        <Tab
          value="history"
          icon={<HistoryRoundedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="히스토리"
        />
      </Tabs>

      {/* Tab 1: Layers Panel */}
      {currentTab === 'layers' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 0px',
            minHeight: 0,
            p: 1.5,
          }}
        >
          {/* Active Layer Blend Mode & Opacity */}
          {activeLayer && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: 'text.secondary', width: 60 }}
                >
                  합성 모드:
                </Typography>
                <Select
                  size="small"
                  value={activeLayer.blendMode}
                  onChange={(e) => onChangeBlendMode(activeLayer.id, e.target.value as BlendMode)}
                  sx={{ flex: 1, height: 28, fontSize: '0.75rem' }}
                >
                  {BLEND_MODE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.75rem' }}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: 'text.secondary', width: 60 }}
                >
                  불투명도:
                </Typography>
                <Slider
                  size="small"
                  value={Math.round(activeLayer.opacity * 100)}
                  min={0}
                  max={100}
                  onChange={(_, val) => onChangeOpacity(activeLayer.id, Number(val) / 100)}
                  sx={{ flex: 1 }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, width: 36, textAlign: 'right' }}
                >
                  {Math.round(activeLayer.opacity * 100)}%
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Layer List (Top layer displayed first) */}
          <Box
            sx={{
              flex: '1 1 0px',
              minHeight: 0,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
            }}
          >
            <List dense sx={{ p: 0.5 }}>
              {[...layers].reverse().map((layer) => {
                const isCur = layer.id === activeLayerId;
                return (
                  <ListItem
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      py: 0.5,
                      px: 1,
                      cursor: 'pointer',
                      bgcolor: isCur ? 'action.selected' : 'transparent',
                      border: '1px solid',
                      borderColor: isCur ? 'primary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      {/* Visibility Toggle */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisible(layer.id);
                        }}
                        sx={{ p: 0.25 }}
                      >
                        {layer.visible ? (
                          <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityOffRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        )}
                      </IconButton>

                      {/* Lock Toggle */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(layer.id);
                        }}
                        sx={{ p: 0.25 }}
                      >
                        {layer.locked ? (
                          <LockRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                        ) : (
                          <LockOpenRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                        )}
                      </IconButton>

                      {/* Layer Name */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isCur ? 700 : 500,
                          color: isCur ? 'primary.main' : 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {layer.name}
                      </Typography>
                    </Box>

                    {/* Move Up/Down Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveLayer(layer.id, 'up');
                        }}
                        sx={{ p: 0.25 }}
                      >
                        <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveLayer(layer.id, 'down');
                        }}
                        sx={{ p: 0.25 }}
                      >
                        <ArrowDownwardRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Layer Action Buttons Footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 1,
              flexShrink: 0,
            }}
          >
            <Tooltip title="새 레이어 추가">
              <IconButton size="small" onClick={onAddLayer} color="primary">
                <AddRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="선택 레이어 복제">
              <IconButton
                size="small"
                onClick={() => activeLayer && onCloneLayer(activeLayer.id)}
                disabled={!activeLayer}
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="아래 레이어와 병합">
              <IconButton
                size="small"
                onClick={() => activeLayer && onMergeDown(activeLayer.id)}
                disabled={layers.length <= 1}
              >
                <MergeTypeRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="전체 레이어 병합 (Flatten)">
              <Button
                size="small"
                variant="outlined"
                onClick={onFlatten}
                sx={{ py: 0.2, px: 0.8, fontSize: '0.68rem' }}
              >
                모두 병합
              </Button>
            </Tooltip>

            <Tooltip title="선택 레이어 삭제">
              <IconButton
                size="small"
                color="error"
                onClick={() => activeLayer && onDeleteLayer(activeLayer.id)}
                disabled={layers.length <= 1}
              >
                <DeleteRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Tab 2: Adjustments & Filters */}
      {currentTab === 'adjust' && (
        <Box
          sx={{
            flex: '1 1 0px',
            minHeight: 0,
            overflowY: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            색상 & 톤 보정
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('brightness')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              밝기 / 대비
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('hue')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              색조 / 채도
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('grayscale')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              흑백화 (흑백)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('invert')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              색상 반전
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('sepia')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              세피아 톤
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('threshold')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              흑백 이진화
            </Button>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            포토샵 고급 필터
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('blur')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              가우시안 블러
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('sharpen')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              언샵 마스크
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyFilter('mosaic')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              모자이크 / 픽셀화
            </Button>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              startIcon={<AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={() => onApplyFilter('lineArt')}
              sx={{ fontSize: '0.72rem', py: 0.75 }}
            >
              웹툰 선화 추출
            </Button>
          </Box>
        </Box>
      )}

      {/* Tab 3: Webtoon FX */}
      {currentTab === 'webtoon' && (
        <Box
          sx={{
            flex: '1 1 0px',
            minHeight: 0,
            overflowY: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            웹툰 만화 연출 효과
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => onApplyFilter('screentone')}
            sx={{ fontSize: '0.78rem', py: 1 }}
          >
            🏁 인쇄용 망점 스크린톤 (Screentone)
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            만화책 인쇄 특유의 흑백 점(Dot) 망점 스크린톤을 생성합니다.
          </Typography>

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="outlined"
            onClick={() => onApplyFilter('focusLines')}
            sx={{ fontSize: '0.78rem', py: 1 }}
          >
            ⚡ 중앙 집중선 연출 레이어 생성
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            긴박한 장면이나 액션 효과를 위한 웹툰 집중선 레이어를 새로 추가합니다.
          </Typography>
        </Box>
      )}

      {/* Tab 4: History */}
      {currentTab === 'history' && (
        <Box
          sx={{
            flex: '1 1 0px',
            minHeight: 0,
            overflowY: 'auto',
            p: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>
            작업 내역 (History)
          </Typography>
          <List dense sx={{ p: 0 }}>
            {history.map((item, idx) => {
              const isSelected = idx === historyIndex;
              return (
                <ListItem
                  key={item.id}
                  onClick={() => onJumpHistory(idx)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    py: 0.4,
                    px: 1,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {idx + 1}. {item.description}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Card>
  );
});
