'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import DeselectRoundedIcon from '@mui/icons-material/DeselectRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import FlipCameraAndroidRoundedIcon from '@mui/icons-material/FlipCameraAndroidRounded';

import type { ToolSettings, PhotoshopToolType } from '../types';

interface PsOptionsTopProps {
  currentTool: PhotoshopToolType;
  settings: ToolSettings;
  onChangeSettings: (patch: Partial<ToolSettings>) => void;
  onSelectAll: () => void;
  onDeselect: () => void;
  onInvertSelection: () => void;
  onClearSelection: () => void;
  hasSelection: boolean;
}

const FONT_OPTIONS = [
  { label: '잘난체 2 (웹툰 추천)', value: '"Jalnan2", sans-serif' },
  { label: '잘난고딕', value: '"JalnanGothic", sans-serif' },
  { label: '카페24 동동', value: '"Cafe24Dongdong", cursive' },
  { label: '맑은 고딕', value: '"Malgun Gothic", sans-serif' },
  { label: '나눔명조', value: '"Nanum Myeongjo", serif' },
  { label: 'Impact (강조)', value: 'Impact, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
];

export const PsOptionsTop = React.memo(function PsOptionsTop({
  currentTool,
  settings,
  onChangeSettings,
  onSelectAll,
  onDeselect,
  onInvertSelection,
  onClearSelection,
  hasSelection,
}: PsOptionsTopProps) {
  return (
    <Box
      sx={{
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e2228' : '#eef2f6'),
        borderBottom: '1px solid',
        borderColor: 'divider',
        gap: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        '&::-webkit-scrollbar': { height: 3 },
      }}
    >
      {/* Selection tools options */}
      {(currentTool === 'marquee-rect' ||
        currentTool === 'marquee-ellipse' ||
        currentTool === 'lasso' ||
        currentTool === 'magic-wand' ||
        hasSelection) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SelectAllRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onSelectAll}
            sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}
          >
            전체 선택 (Ctrl+A)
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={!hasSelection}
            startIcon={<DeselectRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onDeselect}
            sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}
          >
            선택 해제 (Ctrl+D)
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={!hasSelection}
            startIcon={<FlipCameraAndroidRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onInvertSelection}
            sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}
          >
            선택 반전 (Ctrl+Shift+I)
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={!hasSelection}
            onClick={onClearSelection}
            sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}
          >
            영역 삭제 (Del)
          </Button>
        </Box>
      )}

      {/* Magic Wand & Paint bucket tolerance */}
      {(currentTool === 'magic-wand' || currentTool === 'paint-bucket') && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            허용 오차(Tolerance): {settings.tolerance}
          </Typography>
          <Slider
            size="small"
            value={settings.tolerance}
            min={0}
            max={150}
            onChange={(_, val) => onChangeSettings({ tolerance: Number(val) })}
            sx={{ width: 90 }}
          />
        </Box>
      )}

      {/* Brush / Pencil / Eraser / Blur controls */}
      {(currentTool === 'brush' ||
        currentTool === 'pencil' ||
        currentTool === 'eraser' ||
        currentTool === 'blur-tool' ||
        currentTool === 'dodge') && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Size slider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              크기: {currentTool === 'eraser' ? settings.eraserSize : settings.brushSize}px
            </Typography>
            <Slider
              size="small"
              value={currentTool === 'eraser' ? settings.eraserSize : settings.brushSize}
              min={1}
              max={150}
              onChange={(_, val) =>
                onChangeSettings(
                  currentTool === 'eraser'
                    ? { eraserSize: Number(val) }
                    : { brushSize: Number(val) }
                )
              }
              sx={{ width: 80 }}
            />
          </Box>

          {/* Opacity slider */}
          {currentTool !== 'pencil' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                불투명도:{' '}
                {Math.round(
                  (currentTool === 'eraser' ? settings.eraserOpacity : settings.brushOpacity) * 100
                )}
                %
              </Typography>
              <Slider
                size="small"
                value={currentTool === 'eraser' ? settings.eraserOpacity : settings.brushOpacity}
                min={0.05}
                max={1}
                step={0.05}
                onChange={(_, val) =>
                  onChangeSettings(
                    currentTool === 'eraser'
                      ? { eraserOpacity: Number(val) }
                      : { brushOpacity: Number(val) }
                  )
                }
                sx={{ width: 70 }}
              />
            </Box>
          )}

          {/* Hardness */}
          {currentTool !== 'pencil' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                경도:{' '}
                {Math.round(
                  (currentTool === 'eraser' ? settings.eraserHardness : settings.brushHardness) *
                    100
                )}
                %
              </Typography>
              <Slider
                size="small"
                value={currentTool === 'eraser' ? settings.eraserHardness : settings.brushHardness}
                min={0}
                max={1}
                step={0.1}
                onChange={(_, val) =>
                  onChangeSettings(
                    currentTool === 'eraser'
                      ? { eraserHardness: Number(val) }
                      : { brushHardness: Number(val) }
                  )
                }
                sx={{ width: 60 }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Gradient options */}
      {currentTool === 'gradient' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            그라디언트 형태:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={settings.gradientType}
            exclusive
            onChange={(_, val) => {
              if (val) onChangeSettings({ gradientType: val });
            }}
          >
            <ToggleButton value="linear" sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}>
              선형 (Linear)
            </ToggleButton>
            <ToggleButton value="radial" sx={{ py: 0.25, px: 1, fontSize: '0.72rem' }}>
              원형 (Radial)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Text tool options */}
      {currentTool === 'text' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="입력할 글자..."
            value={settings.textString}
            onChange={(e) => onChangeSettings({ textString: e.target.value })}
            sx={{ width: 140, '& input': { py: 0.5, fontSize: '0.75rem' } }}
          />
          <Select
            size="small"
            value={settings.fontFamily}
            onChange={(e) => onChangeSettings({ fontFamily: e.target.value })}
            sx={{ minWidth: 120, height: 28, fontSize: '0.75rem' }}
          >
            {FONT_OPTIONS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.75rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              크기: {settings.fontSize}pt
            </Typography>
            <Slider
              size="small"
              value={settings.fontSize}
              min={12}
              max={120}
              onChange={(_, val) => onChangeSettings({ fontSize: Number(val) })}
              sx={{ width: 60 }}
            />
          </Box>
          <ToggleButtonGroup size="small">
            <ToggleButton
              value="bold"
              selected={settings.fontWeight === 'bold'}
              onClick={() =>
                onChangeSettings({
                  fontWeight: settings.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              sx={{ py: 0.25, px: 0.5 }}
            >
              <FormatBoldRoundedIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
            <ToggleButton
              value="italic"
              selected={settings.fontStyle === 'italic'}
              onClick={() =>
                onChangeSettings({
                  fontStyle: settings.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              sx={{ py: 0.25, px: 0.5 }}
            >
              <FormatItalicRoundedIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Shapes options */}
      {(currentTool === 'shape-rect' ||
        currentTool === 'shape-ellipse' ||
        currentTool === 'shape-line' ||
        currentTool === 'shape-arrow') && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            size="small"
            value={currentTool}
            onChange={(e) => onChangeSettings({} /* tool handled by parent */)}
            sx={{ height: 28, fontSize: '0.75rem' }}
          >
            <MenuItem value="shape-rect" sx={{ fontSize: '0.75rem' }}>
              직사각형
            </MenuItem>
            <MenuItem value="shape-ellipse" sx={{ fontSize: '0.75rem' }}>
              타원
            </MenuItem>
            <MenuItem value="shape-line" sx={{ fontSize: '0.75rem' }}>
              직선
            </MenuItem>
            <MenuItem value="shape-arrow" sx={{ fontSize: '0.75rem' }}>
              화살표
            </MenuItem>
          </Select>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              선 두께: {settings.shapeStrokeWidth}px
            </Typography>
            <Slider
              size="small"
              value={settings.shapeStrokeWidth}
              min={1}
              max={30}
              onChange={(_, val) => onChangeSettings({ shapeStrokeWidth: Number(val) })}
              sx={{ width: 60 }}
            />
          </Box>
        </Box>
      )}

      {/* Webtoon Bubble tool options */}
      {currentTool === 'bubble' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            말풍선 모양:
          </Typography>
          <Select
            size="small"
            value={settings.bubbleShape}
            onChange={(e) =>
              onChangeSettings({
                bubbleShape: e.target.value as ToolSettings['bubbleShape'],
              })
            }
            sx={{ height: 28, fontSize: '0.75rem' }}
          >
            <MenuItem value="oval" sx={{ fontSize: '0.75rem' }}>
              💬 기본 타원
            </MenuItem>
            <MenuItem value="shout" sx={{ fontSize: '0.75rem' }}>
              💥 외침 풍선
            </MenuItem>
            <MenuItem value="box" sx={{ fontSize: '0.75rem' }}>
              ⏹️ 사각 해설
            </MenuItem>
          </Select>
        </Box>
      )}

      {/* Webtoon Focus lines options */}
      {currentTool === 'focus-line' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            집중선 수: {settings.focusLineCount}개
          </Typography>
          <Slider
            size="small"
            value={settings.focusLineCount}
            min={30}
            max={150}
            onChange={(_, val) => onChangeSettings({ focusLineCount: Number(val) })}
            sx={{ width: 70 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            중심 반경: {settings.focusLineInnerRadius}px
          </Typography>
          <Slider
            size="small"
            value={settings.focusLineInnerRadius}
            min={30}
            max={300}
            onChange={(_, val) => onChangeSettings({ focusLineInnerRadius: Number(val) })}
            sx={{ width: 70 }}
          />
        </Box>
      )}
    </Box>
  );
});
