'use client';

import type { PortraitAdjustments } from '../editor-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';

// ----------------------------------------------------------------------

interface PortraitPanelProps {
  values: PortraitAdjustments;
  onChange: (newValues: PortraitAdjustments) => void;
  onReset: () => void;
}

export function PortraitPanel({ values, onChange, onReset }: PortraitPanelProps) {
  const updateField = <K extends keyof PortraitAdjustments>(
    key: K,
    val: PortraitAdjustments[K]
  ) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            인물 & 뷰티 보정 (Portrait Retouch)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            피부결, 윤곽 성형, 이목구비 및 전신/다리 비율 보정
          </Typography>
        </Box>
        <Tooltip title="인물 보정 초기화">
          <IconButton size="small" onClick={onReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 1. 피부결 & 얼굴 결점 케어 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FaceRetouchingNaturalRoundedIcon color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            피부결 & 잡티 케어
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 피부 스무딩 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                피부결 매끄럽게 (Skin Smoothing)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.skinSmoothing}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.skinSmoothing}
              min={0}
              max={100}
              onChange={(_, v) => updateField('skinSmoothing', v as number)}
            />
          </Box>

          {/* 주름 완화 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                주름 제거 & 완화 (Wrinkle Soften)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.wrinkleSoften}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.wrinkleSoften}
              min={0}
              max={100}
              onChange={(_, v) => updateField('wrinkleSoften', v as number)}
            />
          </Box>

          {/* 다크서클 제거 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                다크서클 제거 (Dark Circle Remover)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.darkCircle}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.darkCircle}
              min={0}
              max={100}
              onChange={(_, v) => updateField('darkCircle', v as number)}
            />
          </Box>

          {/* 치아 미백 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                치아 미백 (Teeth Whitening)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.teethWhitening}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.teethWhitening}
              min={0}
              max={100}
              onChange={(_, v) => updateField('teethWhitening', v as number)}
            />
          </Box>
        </Box>
      </Card>

      {/* 2. 이목구비 & 윤곽 보정 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
          이목구비 & V라인 윤곽
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 눈 크기 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                눈 크기 확대 (Eye Enlarge)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.eyeEnlarge}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.eyeEnlarge}
              min={0}
              max={100}
              onChange={(_, v) => updateField('eyeEnlarge', v as number)}
            />
          </Box>

          {/* 얼굴형 윤곽 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                얼굴형 슬리밍 (Face Contour)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.faceContour}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.faceContour}
              min={0}
              max={100}
              onChange={(_, v) => updateField('faceContour', v as number)}
            />
          </Box>

          {/* 턱선 V라인 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                턱선 V라인 (Jawline Slim)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.jawline}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.jawline}
              min={0}
              max={100}
              onChange={(_, v) => updateField('jawline', v as number)}
            />
          </Box>

          {/* 코 보정 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                코 크기 & 폭 조절 (Nose Reshape)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.noseReshape}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.noseReshape}
              min={-50}
              max={50}
              onChange={(_, v) => updateField('noseReshape', v as number)}
            />
          </Box>

          {/* 입술 생기 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                입술 볼륨 & 생기 (Lip Plump & Tint)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.lipEnhance.volume}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.lipEnhance.volume}
              min={0}
              max={100}
              onChange={(_, v) =>
                updateField('lipEnhance', { ...values.lipEnhance, volume: v as number })
              }
            />
          </Box>
        </Box>
      </Card>

      {/* 3. 체형 & 다리 길이 보정 */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <AccessibilityNewRoundedIcon color="warning" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            체형 & 다리 비율 보정
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 체형 슬리밍 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                체형 슬리밍 (Body Slimming)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.bodySlim}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.bodySlim}
              min={0}
              max={100}
              onChange={(_, v) => updateField('bodySlim', v as number)}
            />
          </Box>

          {/* 다리 길이 늘리기 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                다리 길이 스트레치 (Leg Extension)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {values.legExtension}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={values.legExtension}
              min={0}
              max={100}
              onChange={(_, v) => updateField('legExtension', v as number)}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
