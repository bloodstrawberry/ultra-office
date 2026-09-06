'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

// ----------------------------------------------------------------------

export type ToolMode = 'erase' | 'fill' | 'spoid';

interface ColorOneClickPanelProps {
  onToggleBackground: () => void;
  mode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
  fillColorHex: string;
  onChangeFillColorHex: (color: string) => void;
  quickColors: string[];
  tolerance: number;
  onChangeTolerance: (tolerance: number) => void;
}

export function ColorOneClickPanel({
  onToggleBackground,
  mode,
  onChangeMode,
  fillColorHex,
  onChangeFillColorHex,
  quickColors,
  tolerance,
  onChangeTolerance,
}: ColorOneClickPanelProps) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3 }}>
      {/* 1. Quick Actions */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        1. 원클릭 빠른 변환
      </Typography>
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        onClick={onToggleBackground}
        startIcon={<InvertColorsRoundedIcon />}
        sx={{ mb: 2.5, py: 1.2, borderRadius: 2, fontWeight: 700 }}
      >
        흰색 배경 ↔ 투명 전환 토글
      </Button>

      {/* 2. Tool Mode */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        2. 페인트 통 & 스포이드 도구 모드
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, v) => v && onChangeMode(v)}
        size="small"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          p: 0,
          border: 'none',
          bgcolor: 'transparent',
          height: 'auto',
          minHeight: 'auto',
          mb: 2,
          '& .MuiToggleButtonGroup-grouped': {
            flex: '1 1 auto',
            whiteSpace: 'nowrap',
            borderRadius: '8px !important',
            border: '1px solid !important',
            borderColor: 'divider !important',
            px: 1.5,
            py: 1,
            minHeight: 38,
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
        <ToggleButton value="erase">
          <InvertColorsRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 투명화 지우개
        </ToggleButton>
        <ToggleButton value="fill">
          <FormatColorFillRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 색상 채우기
        </ToggleButton>
        <ToggleButton value="spoid">
          <ColorizeRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 스포이드
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'fill' && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              채울 색상:
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

          {/* Quick Color Palette */}
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
                    fillColorHex.toUpperCase() === hex.toUpperCase() ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {mode === 'spoid' && (
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
            🎯 스포이드 모드 활성화됨
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
            사진 속 원하는 배경 지점을 클릭하면 해당 색상이 추출되어 페인트통 색상으로 지정됩니다.
          </Typography>
        </Box>
      )}

      {/* Tolerance Slider */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            색상 허용 오차 (Tolerance)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ±{tolerance}
          </Typography>
        </Box>
        <Slider
          size="small"
          min={1}
          max={100}
          value={tolerance}
          onChange={(_, v) => onChangeTolerance(v as number)}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          값이 클수록 비슷한 색상 영역을 더 넓게 한 번에 채우거나 지웁니다.
        </Typography>
      </Box>
    </Card>
  );
}
