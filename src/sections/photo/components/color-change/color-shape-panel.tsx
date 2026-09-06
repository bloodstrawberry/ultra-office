'use client';

import type { MaskShape, ShapeType } from '../../utils/watermark-remover';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import ChangeHistoryRoundedIcon from '@mui/icons-material/ChangeHistoryRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

// ----------------------------------------------------------------------

export type ColorShapeTool = ShapeType | 'spoid';

interface ColorShapePanelProps {
  // Shape tool & Add
  shapeTool: ColorShapeTool;
  onChangeShapeTool: (tool: ColorShapeTool) => void;
  onAddShape: (type: 'circle' | 'rect' | 'triangle') => void;
  // Fill mode: color vs transparent
  isTransparent: boolean;
  onToggleTransparent: (transparent: boolean) => void;
  fillColorHex: string;
  onChangeFillColorHex: (color: string) => void;
  quickColors: string[];
  autoSurrounding: boolean;
  onToggleAutoSurrounding: (enabled: boolean) => void;
  // Feather & Opacity & Brush
  feather: number;
  onChangeFeather: (feather: number) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  // Shapes List
  shapes: MaskShape[];
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  onDeleteShape: (id: string) => void;
  onClearShapes: () => void;
  onApplyShapesToImage: () => void;
  // Selected shape live editing
  onUpdateSelectedShape?: (updater: (prev: MaskShape) => MaskShape) => void;
  onCommitShapeHistory?: () => void;
  onSampleSurroundingForSelected?: () => void;
}

export function ColorShapePanel({
  shapeTool,
  onChangeShapeTool,
  onAddShape,
  isTransparent,
  onToggleTransparent,
  fillColorHex,
  onChangeFillColorHex,
  quickColors,
  autoSurrounding,
  onToggleAutoSurrounding,
  feather,
  onChangeFeather,
  opacity,
  onChangeOpacity,
  brushSize,
  onChangeBrushSize,
  shapes,
  selectedShapeId,
  onSelectShape,
  onDeleteShape,
  onClearShapes,
  onApplyShapesToImage,
  onUpdateSelectedShape,
  onCommitShapeHistory,
  onSampleSurroundingForSelected,
}: ColorShapePanelProps) {
  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  const getShapeIcon = (type: MaskShape['type']) => {
    switch (type) {
      case 'circle':
        return <RadioButtonUncheckedRoundedIcon fontSize="small" />;
      case 'rect':
        return <CropSquareRoundedIcon fontSize="small" />;
      case 'triangle':
        return <ChangeHistoryRoundedIcon fontSize="small" />;
      case 'freehand':
        return <BrushRoundedIcon fontSize="small" />;
      default:
        return <CropSquareRoundedIcon fontSize="small" />;
    }
  };

  const getShapeLabel = (type: MaskShape['type'], index: number) => {
    switch (type) {
      case 'circle':
        return `동그라미 #${index + 1}`;
      case 'rect':
        return `네모 #${index + 1}`;
      case 'triangle':
        return `세모 #${index + 1}`;
      case 'freehand':
        return `자유 그리기 #${index + 1}`;
      default:
        return `도형 #${index + 1}`;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ─── Selected Shape Inspector (크기 변경 & 채울 배경색 UI) ─── */}
      {selectedShape && (
        <Card
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(238, 242, 255, 0.7)',
            boxShadow: (theme) => `0 8px 24px -4px ${theme.palette.primary.main}30`,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Inspector Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getShapeIcon(selectedShape.type)}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                선택된{' '}
                {getShapeLabel(
                  selectedShape.type,
                  shapes.findIndex((s) => s.id === selectedShape.id)
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={`${Math.round(selectedShape.width)} × ${Math.round(selectedShape.height)}px`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
              <IconButton size="small" onClick={() => onSelectShape(null)} title="선택 해제">
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* 1. 크기 조절 (가로 x 세로) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              📐 도형 크기 조절 (가로 × 세로):
            </Typography>

            {/* Width Slider */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  가로 너비 (Width)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round(selectedShape.width)}px
                </Typography>
              </Box>
              <Slider
                size="small"
                min={10}
                max={Math.max(600, Math.round(selectedShape.width * 2))}
                value={Math.round(selectedShape.width)}
                onChange={(_, v) => {
                  const newW = v as number;
                  onUpdateSelectedShape?.((s) => {
                    if (s.type === 'freehand' && s.points) {
                      const scaleX = newW / Math.max(1, s.width);
                      return {
                        ...s,
                        width: newW,
                        points: s.points.map((p) => ({
                          x: Math.round(s.x + (p.x - s.x) * scaleX),
                          y: p.y,
                        })),
                      };
                    }
                    return { ...s, width: newW };
                  });
                }}
                onChangeCommitted={() => onCommitShapeHistory?.()}
              />
            </Box>

            {/* Height Slider */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  세로 높이 (Height)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round(selectedShape.height)}px
                </Typography>
              </Box>
              <Slider
                size="small"
                min={10}
                max={Math.max(600, Math.round(selectedShape.height * 2))}
                value={Math.round(selectedShape.height)}
                onChange={(_, v) => {
                  const newH = v as number;
                  onUpdateSelectedShape?.((s) => {
                    if (s.type === 'freehand' && s.points) {
                      const scaleY = newH / Math.max(1, s.height);
                      return {
                        ...s,
                        height: newH,
                        points: s.points.map((p) => ({
                          x: p.x,
                          y: Math.round(s.y + (p.y - s.y) * scaleY),
                        })),
                      };
                    }
                    return { ...s, height: newH };
                  });
                }}
                onChangeCommitted={() => onCommitShapeHistory?.()}
              />
            </Box>

            {/* Quick Scale Multipliers */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                배율:
              </Typography>
              {[0.5, 0.8, 1.2, 1.5, 2.0].map((factor) => (
                <Button
                  key={factor}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    onUpdateSelectedShape?.((s) => {
                      const newW = Math.max(10, Math.round(s.width * factor));
                      const newH = Math.max(10, Math.round(s.height * factor));
                      if (s.type === 'freehand' && s.points) {
                        return {
                          ...s,
                          width: newW,
                          height: newH,
                          points: s.points.map((p) => ({
                            x: Math.round(s.x + (p.x - s.x) * factor),
                            y: Math.round(s.y + (p.y - s.y) * factor),
                          })),
                        };
                      }
                      return { ...s, width: newW, height: newH };
                    });
                    setTimeout(() => onCommitShapeHistory?.(), 0);
                  }}
                  sx={{ px: 0.8, py: 0.2, minWidth: 'auto', fontSize: '0.72rem' }}
                >
                  {factor}x
                </Button>
              ))}
            </Box>
          </Box>

          {/* 2. 채울 배경색 변경 UI */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              🎨 채울 배경색 변경:
            </Typography>

            {/* Transparent Toggle for Selected Shape */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  투명 배경으로 감추기
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  해당 도형 영역을 완전히 투명하게 뚫어 감춥니다
                </Typography>
              </Box>
              <Switch
                checked={selectedShape.fillColor === 'transparent'}
                onChange={(e) => {
                  const isTrans = e.target.checked;
                  onUpdateSelectedShape?.((s) => ({
                    ...s,
                    fillColor: isTrans ? 'transparent' : fillColorHex,
                  }));
                  setTimeout(() => onCommitShapeHistory?.(), 0);
                }}
                size="small"
              />
            </Box>

            {selectedShape.fillColor !== 'transparent' && (
              <>
                {/* Color Input & Auto Surrounding */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    component="input"
                    type="color"
                    value={
                      selectedShape.fillColor.startsWith('#')
                        ? selectedShape.fillColor
                        : fillColorHex
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const hex = e.target.value;
                      onUpdateSelectedShape?.((s) => ({ ...s, fillColor: hex }));
                      onChangeFillColorHex(hex);
                    }}
                    onBlur={() => onCommitShapeHistory?.()}
                    sx={{
                      width: 44,
                      height: 40,
                      p: 0.3,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      채움 색상: {selectedShape.fillColor}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                    >
                      클릭하여 원하는 색상을 선택하세요
                    </Typography>
                  </Box>

                  {/* Auto Surrounding Button for selected */}
                  {onSampleSurroundingForSelected && (
                    <Button
                      size="small"
                      variant="soft"
                      color="primary"
                      onClick={onSampleSurroundingForSelected}
                      startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
                      sx={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      주변색 추출
                    </Button>
                  )}
                </Box>

                {/* Quick Swatches */}
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  {quickColors.map((color) => {
                    const isCur = selectedShape.fillColor.toLowerCase() === color.toLowerCase();
                    return (
                      <Box
                        key={color}
                        onClick={() => {
                          onUpdateSelectedShape?.((s) => ({ ...s, fillColor: color }));
                          onChangeFillColorHex(color);
                          setTimeout(() => onCommitShapeHistory?.(), 0);
                        }}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: color,
                          cursor: 'pointer',
                          border: isCur ? '2px solid' : '1px solid',
                          borderColor: isCur ? 'primary.main' : 'divider',
                          transform: isCur ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          '&:hover': { transform: 'scale(1.2)' },
                        }}
                      />
                    );
                  })}
                </Box>
              </>
            )}

            {/* Feather & Opacity for Selected Shape */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  페더: {selectedShape.feather}px
                </Typography>
                <Slider
                  size="small"
                  min={0}
                  max={25}
                  value={selectedShape.feather}
                  onChange={(_, v) => {
                    onUpdateSelectedShape?.((s) => ({ ...s, feather: v as number }));
                  }}
                  onChangeCommitted={() => onCommitShapeHistory?.()}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  불투명도: {Math.round(selectedShape.opacity * 100)}%
                </Typography>
                <Slider
                  size="small"
                  min={20}
                  max={100}
                  step={5}
                  value={Math.round(selectedShape.opacity * 100)}
                  onChange={(_, v) => {
                    onUpdateSelectedShape?.((s) => ({ ...s, opacity: (v as number) / 100 }));
                  }}
                  onChangeCommitted={() => onCommitShapeHistory?.()}
                />
              </Box>
            </Box>
          </Box>

          {/* Action Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              color="inherit"
              onClick={() => onSelectShape(null)}
              sx={{ fontSize: '0.75rem' }}
            >
              선택 해제
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteRoundedIcon fontSize="small" />}
              onClick={() => onDeleteShape(selectedShape.id)}
              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              도형 삭제 (DEL)
            </Button>
          </Box>
        </Card>
      )}

      {/* 1. Shape Tools & Add Buttons */}
      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            1. 새 도형 추가 및 도구
          </Typography>
          <Chip
            label="DEL키로 삭제 가능"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.68rem', fontWeight: 600 }}
          />
        </Box>

        {/* Quick Add Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onAddShape('circle')}
            startIcon={<RadioButtonUncheckedRoundedIcon />}
            sx={{ fontWeight: 700, py: 0.8, fontSize: '0.78rem' }}
          >
            + 동그라미
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onAddShape('rect')}
            startIcon={<CropSquareRoundedIcon />}
            sx={{ fontWeight: 700, py: 0.8, fontSize: '0.78rem' }}
          >
            + 네모
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onAddShape('triangle')}
            startIcon={<ChangeHistoryRoundedIcon />}
            sx={{ fontWeight: 700, py: 0.8, fontSize: '0.78rem' }}
          >
            + 세모
          </Button>
        </Box>

        {/* Freehand Drawing or Eyedropper Mode */}
        <ToggleButtonGroup
          value={shapeTool}
          exclusive
          onChange={(_, v) => v && onChangeShapeTool(v)}
          size="small"
          sx={{
            display: 'flex',
            gap: 1,
            p: 0,
            border: 'none',
            bgcolor: 'transparent',
            mb: 2,
            '& .MuiToggleButtonGroup-grouped': {
              flex: 1,
              whiteSpace: 'nowrap',
              borderRadius: '8px !important',
              border: '1px solid !important',
              borderColor: 'divider !important',
              px: 1.2,
              py: 0.8,
              fontSize: '0.8125rem',
              fontWeight: 600,
              m: '0 !important',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderColor: 'primary.main !important',
                color: 'primary.main',
                fontWeight: 700,
              },
            },
          }}
        >
          <ToggleButton value="freehand">
            <BrushRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> ✏️ 자유 그리기 모드
          </ToggleButton>
          <ToggleButton value="spoid">
            <ColorizeRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 🎯 스포이드
          </ToggleButton>
        </ToggleButtonGroup>

        {shapeTool === 'spoid' && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              color: 'primary.darker',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
              🎯 스포이드 모드
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
              캔버스에서 원하는 배경 지점을 클릭하면 해당 색상이 추출되어 도형의 입힐 배경색으로
              지정됩니다.
            </Typography>
          </Box>
        )}

        {/* Freehand Brush Size */}
        {shapeTool === 'freehand' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                자유 그리기 브러시 굵기
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {brushSize}px
              </Typography>
            </Box>
            <Slider
              size="small"
              min={4}
              max={80}
              value={brushSize}
              onChange={(_, v) => onChangeBrushSize(v as number)}
            />
          </Box>
        )}

        {/* 2. Background Fill Style */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          2. 입힐 배경 설정
        </Typography>

        {/* Transparent Mask Toggle vs Color Fill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.2,
            mb: 1.5,
            borderRadius: 2,
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InvertColorsRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                투명 배경으로 지우기
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                도형 영역을 투명하게 뚫어 가립니다.
              </Typography>
            </Box>
          </Box>
          <Switch
            size="small"
            checked={isTransparent}
            onChange={(e) => onToggleTransparent(e.target.checked)}
          />
        </Box>

        {!isTransparent && (
          <>
            {/* Auto surrounding color */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  🪄 주변 배경색 자동 추출
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  도형을 그리면 주변 픽셀을 분석해 배경색을 자동 적용합니다.
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={autoSurrounding}
                onChange={(e) => onToggleAutoSurrounding(e.target.checked)}
              />
            </Box>

            {/* Custom Color & Quick Colors */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  채울 배경색:
                </Typography>
                <input
                  type="color"
                  value={fillColorHex}
                  onChange={(e) => onChangeFillColorHex(e.target.value)}
                  style={{
                    width: 44,
                    height: 36,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {fillColorHex}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75, display: 'block' }}
              >
                추천 색상 팔레트
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {quickColors.map((hex) => (
                  <Box
                    key={hex}
                    onClick={() => onChangeFillColorHex(hex)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: hex,
                      border: '2px solid',
                      borderColor:
                        fillColorHex.toUpperCase() === hex.toUpperCase()
                          ? 'primary.main'
                          : 'divider',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'scale(1.15)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* 3. Softness & Opacity */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              경계 부드럽게 (페더/블러)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {feather}px
            </Typography>
          </Box>
          <Slider
            size="small"
            min={0}
            max={25}
            value={feather}
            onChange={(_, v) => onChangeFeather(v as number)}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            가장자리를 부드럽게 번지게 하여 배경과 자연스럽게 녹아들게 합니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              도형 불투명도
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {Math.round(opacity * 100)}%
            </Typography>
          </Box>
          <Slider
            size="small"
            min={20}
            max={100}
            step={5}
            value={Math.round(opacity * 100)}
            onChange={(_, v) => onChangeOpacity((v as number) / 100)}
          />
        </Box>
      </Card>

      {/* 3. Shape Layers List & Bake Action */}
      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            추가된 도형 목록 ({shapes.length})
          </Typography>
          {shapes.length > 0 && (
            <Button
              size="small"
              color="error"
              onClick={onClearShapes}
              sx={{ fontSize: '0.75rem', p: 0.5 }}
            >
              전체 삭제
            </Button>
          )}
        </Box>

        {shapes.length === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              캔버스에서 마우스 드래그로 원하는 크기의 동그라미, 네모, 세모, 자유 드로잉을
              그려보세요.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 180,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              mb: 2,
              pr: 0.5,
            }}
          >
            {shapes.map((shape, idx) => {
              const isSelected = shape.id === selectedShapeId;
              return (
                <Box
                  key={shape.id}
                  onClick={() => onSelectShape(isSelected ? null : shape.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.2,
                    py: 0.8,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected
                      ? (theme) =>
                          theme.palette.mode === 'dark' ? 'primary.darker' : 'primary.lighter'
                      : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: shape.type === 'circle' ? '50%' : 0.8,
                        bgcolor:
                          shape.fillColor === 'transparent' ? 'transparent' : shape.fillColor,
                        border: '1px solid rgba(0,0,0,0.2)',
                        background:
                          shape.fillColor === 'transparent'
                            ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 6px 6px'
                            : undefined,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getShapeIcon(shape.type)}
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {getShapeLabel(shape.type, idx)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {shape.feather > 0 && (
                      <Chip
                        label={`${shape.feather}px`}
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteShape(shape.id);
                      }}
                    >
                      <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Shortcut Tip */}
        {shapes.length > 0 && (
          <Box
            sx={{
              p: 1.2,
              mb: 1.5,
              borderRadius: 1.5,
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
              display: 'flex',
              flexDirection: 'column',
              gap: 0.4,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              💡 <strong>선택 & 이동:</strong> 캔버스에서 도형을 클릭하여 드래그로 이동
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              ⌨️ <strong>단축키:</strong> 선택 후 <code>DEL</code>(삭제) · <code>Ctrl + Z</code>
              (작업 취소)
            </Typography>
          </Box>
        )}

        {/* Apply to base canvas */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={shapes.length === 0}
          startIcon={<CheckRoundedIcon />}
          onClick={onApplyShapesToImage}
          sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
        >
          배경 가리기 적용 (이미지에 병합)
        </Button>
      </Card>
    </Box>
  );
}
