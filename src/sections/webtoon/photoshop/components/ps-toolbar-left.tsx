'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import PanToolRoundedIcon from '@mui/icons-material/PanToolRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import FormatPaintRoundedIcon from '@mui/icons-material/FormatPaintRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import FlareRoundedIcon from '@mui/icons-material/FlareRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ChangeHistoryRoundedIcon from '@mui/icons-material/ChangeHistoryRounded';
import Brightness6RoundedIcon from '@mui/icons-material/Brightness6Rounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';

import type { PhotoshopToolType } from '../types';

interface PsToolbarLeftProps {
  currentTool: PhotoshopToolType;
  onSelectTool: (tool: PhotoshopToolType) => void;
  foregroundColor: string;
  backgroundColor: string;
  onChangeForegroundColor: (color: string) => void;
  onChangeBackgroundColor: (color: string) => void;
  onSwapColors: () => void;
  onResetColors: () => void;
}

interface ToolButtonDef {
  tool: PhotoshopToolType;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

export const PsToolbarLeft = React.memo(function PsToolbarLeft({
  currentTool,
  onSelectTool,
  foregroundColor,
  backgroundColor,
  onChangeForegroundColor,
  onChangeBackgroundColor,
  onSwapColors,
  onResetColors,
}: PsToolbarLeftProps) {
  const tools: (ToolButtonDef | 'divider')[] = [
    {
      tool: 'move',
      label: '이동 도구',
      shortcut: 'V',
      icon: <NearMeRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'marquee-rect',
      label: '사각형 선택 윤곽 도구',
      shortcut: 'M',
      icon: <CropSquareRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'marquee-ellipse',
      label: '원형 선택 윤곽 도구',
      shortcut: 'Shift+M',
      icon: <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'lasso',
      label: '올가미 도구',
      shortcut: 'L',
      icon: <ChangeHistoryRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'magic-wand',
      label: '마술봉 자동 선택 도구',
      shortcut: 'W',
      icon: <AutoFixHighRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'crop',
      label: '자르기 도구',
      shortcut: 'C',
      icon: <CropRoundedIcon sx={{ fontSize: 19 }} />,
    },
    'divider',
    {
      tool: 'eyedropper',
      label: '스포이트 도구',
      shortcut: 'I',
      icon: <ColorizeRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'brush',
      label: '브러시 도구',
      shortcut: 'B',
      icon: <BrushRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'pencil',
      label: '연필 (픽셀) 도구',
      shortcut: 'Shift+B',
      icon: <EditRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'eraser',
      label: '지우개 도구',
      shortcut: 'E',
      icon: <ContentCutRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'paint-bucket',
      label: '페인트통 채우기 도구',
      shortcut: 'G',
      icon: <FormatPaintRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'gradient',
      label: '그라디언트 도구',
      shortcut: 'Shift+G',
      icon: <WavesRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'blur-tool',
      label: '흐림/블러 브러시',
      shortcut: 'R',
      icon: <BlurOnRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'dodge',
      label: '닷지 (밝게) / 번 도구',
      shortcut: 'O',
      icon: <Brightness6RoundedIcon sx={{ fontSize: 19 }} />,
    },
    'divider',
    {
      tool: 'text',
      label: '문자 도구',
      shortcut: 'T',
      icon: <TitleRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'shape-rect',
      label: '도형 도구 (직사각형/타원/화살표)',
      shortcut: 'U',
      icon: <CropSquareRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'bubble',
      label: '웹툰 말풍선 도구',
      shortcut: 'Shift+T',
      icon: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'focus-line',
      label: '웹툰 집중선 효과선 도구',
      shortcut: 'F',
      icon: <FlareRoundedIcon sx={{ fontSize: 19 }} />,
    },
    'divider',
    {
      tool: 'hand',
      label: '손 도구 (뷰포트 이동)',
      shortcut: 'H / Space',
      icon: <PanToolRoundedIcon sx={{ fontSize: 19 }} />,
    },
    {
      tool: 'zoom',
      label: '돋보기 줌 도구',
      shortcut: 'Z',
      icon: <ZoomInRoundedIcon sx={{ fontSize: 19 }} />,
    },
  ];

  return (
    <Box
      sx={{
        width: 48,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181b20' : '#f4f6f8'),
        borderRight: '1px solid',
        borderColor: 'divider',
        py: 0.75,
        px: 0.5,
        gap: 0.35,
        overflowY: 'auto',
        overflowX: 'hidden',
        userSelect: 'none',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}
    >
      {tools.map((item, index) => {
        if (item === 'divider') {
          return (
            <Divider key={`div_${index}`} sx={{ width: '80%', my: 0.35, borderColor: 'divider' }} />
          );
        }

        const isSelected = currentTool === item.tool;

        return (
          <Tooltip
            key={item.tool}
            title={`${item.label} (${item.shortcut})`}
            placement="right"
            arrow
          >
            <IconButton
              size="small"
              onClick={() => onSelectTool(item.tool)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                bgcolor: isSelected ? 'primary.main' : 'transparent',
                color: isSelected ? 'primary.contrastText' : 'text.secondary',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                },
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        );
      })}

      <Divider sx={{ width: '80%', my: 0.5, borderColor: 'divider' }} />

      {/* Photoshop Color Picker Swatches */}
      <Box
        sx={{
          position: 'relative',
          width: 36,
          height: 36,
          mt: 0.5,
          mb: 1,
        }}
      >
        {/* Background color swatch */}
        <Tooltip title="배경색 (클릭하여 변경)" placement="right" arrow>
          <Box
            component="label"
            sx={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 20,
              height: 20,
              bgcolor: backgroundColor,
              border: '1.5px solid #ffffff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
              borderRadius: 0.5,
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'inline-block',
            }}
          >
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onChangeBackgroundColor(e.target.value)}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: 40,
                height: 40,
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </Box>
        </Tooltip>

        {/* Foreground color swatch */}
        <Tooltip title="전경색 (클릭하여 변경)" placement="right" arrow>
          <Box
            component="label"
            sx={{
              position: 'absolute',
              left: 2,
              top: 2,
              width: 20,
              height: 20,
              bgcolor: foregroundColor,
              border: '1.5px solid #ffffff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
              borderRadius: 0.5,
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'inline-block',
              zIndex: 1,
            }}
          >
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => onChangeForegroundColor(e.target.value)}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: 40,
                height: 40,
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </Box>
        </Tooltip>

        {/* Swap / Reset Controls */}
        <Tooltip title="전경색/배경색 전환 (X)" placement="right" arrow>
          <IconButton
            size="small"
            onClick={onSwapColors}
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 16,
              height: 16,
              p: 0,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <SwapHorizRoundedIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Default black/white reset */}
      <Tooltip title="기본 흑/백 색상으로 재설정 (D)" placement="right" arrow>
        <Box
          onClick={onResetColors}
          sx={{
            width: 14,
            height: 14,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            cursor: 'pointer',
            borderRadius: 0.25,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ width: '50%', bgcolor: '#000000' }} />
          <Box sx={{ width: '50%', bgcolor: '#ffffff' }} />
        </Box>
      </Tooltip>
    </Box>
  );
});
