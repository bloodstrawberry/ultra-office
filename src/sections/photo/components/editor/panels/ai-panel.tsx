'use client';

import type { DeviceMode, AiAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HdRoundedIcon from '@mui/icons-material/HdRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';

// ----------------------------------------------------------------------

interface AiPanelProps {
  values: AiAdjustments;
  deviceMode: DeviceMode;
  onTriggerEraser: () => void;
  onTriggerBgRemove: () => void;
  onTriggerUpscale: (factor: 1 | 2 | 4) => void;
  onChange: (newValues: AiAdjustments) => void;
  onReset: () => void;
}

const BG_PRESETS = [
  { id: 'transparent', label: '투명 (PNG)' },
  { id: 'white', label: '순백색' },
  { id: 'studio-gray', label: '스튜디오 그레이' },
  { id: 'soft-gradient', label: '소프트 그라디언트' },
  { id: 'dark-cyber', label: '다크 사이버' },
];

export function AiPanel({
  values,
  deviceMode,
  onTriggerEraser,
  onTriggerBgRemove,
  onTriggerUpscale,
  onChange,
  onReset,
}: AiPanelProps) {
  const updateField = <K extends keyof AiAdjustments>(key: K, val: AiAdjustments[K]) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            AI 스마트 편집 (Galaxy & Apple AI)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            AI 지우개, 배경 제거/생성, 아웃페인팅 및 업스케일
          </Typography>
        </Box>
        <Tooltip title="AI 설정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1. 갤럭시 AI 지우개 (AI Eraser) */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: values.eraserActive ? '2px solid' : '1px solid',
          borderColor: values.eraserActive ? 'primary.main' : 'divider',
          bgcolor: values.eraserActive ? 'action.hover' : 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CleaningServicesRoundedIcon color="primary" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {deviceMode === 'galaxy' ? '갤럭시 AI 지우개' : '클린업 (Clean Up)'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                사진 속 원치 않는 물체나 행인을 브러시로 칠해 감쪽같이 제거
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={values.eraserActive}
            onChange={(e) => updateField('eraserActive', e.target.checked)}
            size="small"
          />
        </Box>

        {values.eraserActive && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">지우개 브러시 크기</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {values.eraserBrushSize}px
                </Typography>
              </Box>
              <Slider
                size="small"
                value={values.eraserBrushSize}
                min={10}
                max={80}
                onChange={(_, v) => updateField('eraserBrushSize', v as number)}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={onTriggerEraser}
              sx={{ fontWeight: 700 }}
            >
              칠한 영역 AI 지우기 실행
            </Button>
          </Box>
        )}
      </Card>

      {/* 2. AI 배경 제거 & 생성 (AI Background Cutout & Gen) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InvertColorsRoundedIcon color="info" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                AI 배경 분리 & 배경 교체
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                머리카락까지 정밀하게 피사체를 분리하고 새 배경 합성
              </Typography>
            </Box>
          </Box>
        </Box>

        <Button
          fullWidth
          variant={values.bgRemoved ? 'soft' : 'outlined'}
          color={values.bgRemoved ? 'success' : 'primary'}
          size="small"
          startIcon={<AutoAwesomeRoundedIcon />}
          onClick={onTriggerBgRemove}
          sx={{ fontWeight: 700, mb: 1.5 }}
        >
          {values.bgRemoved ? '배경 복원하기' : '원클릭 AI 배경 누끼 따기'}
        </Button>

        {values.bgRemoved && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              새 배경 스타일 선택
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {BG_PRESETS.map((bg) => (
                <Chip
                  key={bg.id}
                  label={bg.label}
                  size="small"
                  color={values.bgValue === bg.id ? 'primary' : 'default'}
                  onClick={() => updateField('bgValue', bg.id)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Card>

      {/* 3. AI 배경 확장 (Outpainting / Canvas Expand) */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AspectRatioRoundedIcon color="warning" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              AI 캔버스 확장 (생성형 확장)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              사진의 바깥 영역을 콘텐츠 인식(Content-Aware)으로 자연스럽게 확장
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              updateField('outpaintingExpand', {
                top: 50,
                bottom: 50,
                left: 0,
                right: 0,
              })
            }
          >
            상하 +100px 확장
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              updateField('outpaintingExpand', {
                top: 0,
                bottom: 0,
                left: 60,
                right: 60,
              })
            }
          >
            좌우 +120px 확장
          </Button>
        </Box>
      </Card>

      {/* 4. AI 업스케일 & 초고해상도 복원 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HdRoundedIcon color="success" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              AI 업스케일 (Super Resolution)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              해상도와 깨진 디테일을 선명하게 2배/4배 향상
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={values.upscaleFactor === 2 ? 'contained' : 'outlined'}
            size="small"
            sx={{ flex: 1, fontWeight: 700 }}
            onClick={() => onTriggerUpscale(2)}
          >
            2x AI 고화질
          </Button>
          <Button
            variant={values.upscaleFactor === 4 ? 'contained' : 'outlined'}
            size="small"
            sx={{ flex: 1, fontWeight: 700 }}
            onClick={() => onTriggerUpscale(4)}
          >
            4x 초고해상도
          </Button>
        </Box>
      </Card>

      {/* 5. AI 선명화 & 얼굴 자동 보정 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaceRetouchingNaturalRoundedIcon color="secondary" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                AI 인물 얼굴 자동 보정
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                얼굴 랜드마크를 자동 인식해 피부 톤과 눈빛 최적화
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={values.faceAutoEnhance}
            onChange={(e) => updateField('faceAutoEnhance', e.target.checked)}
            size="small"
          />
        </Box>
      </Card>
    </Box>
  );
}
