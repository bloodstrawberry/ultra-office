'use client';

import type { EditorLayer, DecorateAdjustments } from '../editor-types';

import Link from 'next/link';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';

import { paths } from 'src/routes/paths';

import { FRAME_PRESETS, STICKER_PRESETS } from '../editor-presets';

// ----------------------------------------------------------------------

interface DecoratePanelProps {
  values: DecorateAdjustments;
  onChange: (newValues: DecorateAdjustments) => void;
  onReset: () => void;
}

export function DecoratePanel({ values, onChange, onReset }: DecoratePanelProps) {
  const [newText, setNewText] = useState('텍스트 입력');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [drawColor, setDrawColor] = useState(values.currentBrushColor || '#ff0055');

  const updateField = <K extends keyof DecorateAdjustments>(
    key: K,
    val: DecorateAdjustments[K]
  ) => {
    onChange({ ...values, [key]: val });
  };

  const handleAddTextLayer = () => {
    const newLayer: EditorLayer = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: `텍스트: ${newText.slice(0, 8)}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0.5,
      y: 0.5,
      width: 0.4,
      height: 0.1,
      rotation: 0,
      text: {
        content: newText,
        fontSize: 32,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: textColor,
        outlineColor: '#000000',
        outlineWidth: 2,
        shadow: true,
        align: 'center',
      },
    };
    onChange({
      ...values,
      layers: [...values.layers, newLayer],
      selectedLayerId: newLayer.id,
    });
  };

  const handleAddSticker = (preset: { id: string; label: string; value: string }) => {
    const isEmoji = !preset.id.startsWith('badge');
    const newLayer: EditorLayer = {
      id: `sticker-${Date.now()}`,
      type: isEmoji ? 'sticker' : 'text',
      name: preset.label,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0.5,
      y: 0.5,
      width: 0.3,
      height: 0.1,
      rotation: 0,
      sticker: isEmoji ? { emojiOrUrl: preset.value, isEmoji: true } : undefined,
      text: !isEmoji
        ? {
            content: preset.value,
            fontSize: 24,
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: '#FFFFFF',
            outlineColor: '#000000',
            outlineWidth: 2,
            shadow: true,
            align: 'center',
          }
        : undefined,
    };
    onChange({
      ...values,
      layers: [...values.layers, newLayer],
      selectedLayerId: newLayer.id,
    });
  };

  const handleAddHumanTheaterCaption = (sub: string, quote: string) => {
    const timestamp = Date.now();
    const subLayer: EditorLayer = {
      id: `caption-sub-${timestamp}`,
      type: 'text',
      name: `인간극장 인물: ${sub}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0.5,
      y: 0.82,
      width: 0.5,
      height: 0.08,
      rotation: 0,
      text: {
        content: sub,
        fontSize: 26,
        fontFamily: '"Nanum Myeongjo", "Batang", serif',
        fontWeight: 'bold',
        color: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 3,
        shadow: false,
        align: 'center',
      },
    };

    const quoteLayer: EditorLayer = {
      id: `caption-quote-${timestamp + 1}`,
      type: 'text',
      name: `인간극장 대사: ${quote}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0.5,
      y: 0.9,
      width: 0.6,
      height: 0.1,
      rotation: 0,
      text: {
        content: quote,
        fontSize: 34,
        fontFamily: '"Nanum Myeongjo", "Batang", serif',
        fontWeight: 'bold',
        color: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 3,
        shadow: false,
        align: 'center',
      },
    };

    onChange({
      ...values,
      layers: [...values.layers, subLayer, quoteLayer],
      selectedLayerId: quoteLayer.id,
    });
  };

  const handleAddNewsTickerCaption = (headline: string, reporter: string) => {
    const timestamp = Date.now();
    const newsLayer: EditorLayer = {
      id: `caption-news-${timestamp}`,
      type: 'text',
      name: `뉴스 헤드라인: ${headline.slice(0, 10)}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0.5,
      y: 0.91,
      width: 0.8,
      height: 0.1,
      rotation: 0,
      text: {
        content: headline,
        fontSize: 28,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        outlineColor: '#000000',
        outlineWidth: 2,
        shadow: true,
        align: 'center',
      },
    };

    onChange({
      ...values,
      layers: [...values.layers, newsLayer],
      selectedLayerId: newsLayer.id,
    });
  };

  const handleDeleteLayer = (id: string) => {
    onChange({
      ...values,
      layers: values.layers.filter((l) => l.id !== id),
      selectedLayerId: values.selectedLayerId === id ? null : values.selectedLayerId,
    });
  };

  const handleAddMosaicRegion = () => {
    const newRegion = {
      id: `mosaic-${Date.now()}`,
      x: 0.35,
      y: 0.35,
      width: 0.3,
      height: 0.3,
      type: 'mosaic' as const,
      blockSize: 16,
    };
    onChange({
      ...values,
      mosaicRegions: [...values.mosaicRegions, newRegion],
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            합성 및 꾸미기 (Layers & Decorate)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            텍스트, 스티커, 프레임, 드로잉 펜 및 모자이크
          </Typography>
        </Box>
        <Tooltip title="꾸미기 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1. 텍스트 추가 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TitleRoundedIcon color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            텍스트 추가 (Text Layer)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="추가할 문구를 입력하세요"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{ width: 44, height: 40, borderRadius: 2, border: 'none', cursor: 'pointer' }}
          />
        </Box>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddTextLayer}
          sx={{ fontWeight: 700 }}
        >
          사진 위에 텍스트 추가
        </Button>
      </Card>

      {/* 1-2. 뉴스 & 인간극장 자막 프리셋 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TvRoundedIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              뉴스 & 인간극장 자막 프리셋
            </Typography>
          </Box>
          <Button
            component={Link}
            href={paths.photo.newsCaption}
            size="small"
            variant="text"
            sx={{ fontSize: '11px', fontWeight: 700 }}
          >
            전용 스튜디오 →
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() =>
              handleAddHumanTheaterCaption('시능지(23) / 자취생', '"계란이 다 떨어졌다"')
            }
            sx={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: 700 }}
          >
            📺 인간극장: 시능지(23) / &quot;계란이 다 떨어졌다&quot;
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() =>
              handleAddHumanTheaterCaption('김철수(34) / 직장인', '"월급은 통장을 스쳐갈 뿐..."')
            }
            sx={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: 700 }}
          >
            💸 인간극장: 직장인 / &quot;월급은 통장을 스쳐갈 뿐...&quot;
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              handleAddNewsTickerCaption('[속보] 긴급 상황 발생... 전문가들 "침착해야"', 'KBS')
            }
            sx={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: 700 }}
          >
            🚨 9시 뉴스 속보: [속보] 긴급 상황 발생...
          </Button>
        </Box>
      </Card>

      {/* 2. 스티커 및 뱃지 스탬프 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <EmojiEmotionsRoundedIcon color="warning" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            스티커 & 카메라 뱃지
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {STICKER_PRESETS.map((sticker) => (
            <Chip
              key={sticker.id}
              label={sticker.label}
              size="small"
              variant="outlined"
              onClick={() => handleAddSticker(sticker)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { borderColor: 'primary.main' },
              }}
            />
          ))}
        </Box>
      </Card>

      {/* 3. 카메라 프레임 & 테두리 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CropSquareRoundedIcon color="secondary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            카메라 프레임 & 테두리 (Frames)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {FRAME_PRESETS.map((fr) => (
            <Chip
              key={fr.id}
              label={fr.name}
              size="small"
              color={values.frame.preset === fr.id ? 'primary' : 'default'}
              onClick={() => updateField('frame', { ...values.frame, preset: fr.id })}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Card>

      {/* 4. 드로잉 도구 (펜, 형광펜, 지우개) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreateRoundedIcon color="info" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              자유 드로잉 (Doodle & Drawing)
            </Typography>
          </Box>
          <Button
            size="small"
            variant={values.drawingActive ? 'contained' : 'outlined'}
            color={values.drawingActive ? 'primary' : 'inherit'}
            onClick={() => updateField('drawingActive', !values.drawingActive)}
            sx={{ fontWeight: 700 }}
          >
            {values.drawingActive ? '그리기 켜짐' : '그리기 모드'}
          </Button>
        </Box>

        {values.drawingActive && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <ToggleButtonGroup
              size="small"
              value={values.currentBrushType}
              exclusive
              onChange={(_, t) => t && updateField('currentBrushType', t)}
              fullWidth
            >
              <ToggleButton value="pen">일반 펜</ToggleButton>
              <ToggleButton value="highlighter">형광펜</ToggleButton>
              <ToggleButton value="eraser">지우개</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 60 }}>
                색상 선택:
              </Typography>
              <input
                type="color"
                value={drawColor}
                onChange={(e) => {
                  setDrawColor(e.target.value);
                  updateField('currentBrushColor', e.target.value);
                }}
                style={{
                  width: 44,
                  height: 32,
                  borderRadius: 2,
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">선 굵기 (Stroke Width)</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {values.currentBrushWidth}px
                </Typography>
              </Box>
              <Slider
                size="small"
                value={values.currentBrushWidth}
                min={2}
                max={40}
                onChange={(_, v) => updateField('currentBrushWidth', v as number)}
              />
            </Box>
          </Box>
        )}
      </Card>

      {/* 5. 모자이크 & 픽셀화 영역 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BlurOnRoundedIcon color="error" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              모자이크 & 픽셀화
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleAddMosaicRegion}
            sx={{ fontWeight: 700 }}
          >
            + 영역 추가
          </Button>
        </Box>
      </Card>

      {/* 6. 레이어 목록 관리 */}
      {values.layers.length > 0 && (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            추가된 레이어 목록 ({values.layers.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {values.layers.map((l) => {
              const isSelected = values.selectedLayerId === l.id;
              return (
                <Box
                  key={l.id}
                  onClick={() => updateField('selectedLayerId', l.id)}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: isSelected ? 'action.selected' : 'background.paper',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'primary.main' : 'text.primary',
                    }}
                    noWrap
                  >
                    {l.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(l.id);
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Card>
      )}
    </Box>
  );
}
