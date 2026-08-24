'use client';

import type { TransformSettings } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';

import { DEFAULT_TRANSFORM, renderAndExportVideo } from '../utils/video-processor';

// ----------------------------------------------------------------------

interface TransformCropPanelProps {
  videoUrl: string;
  duration: number;
  transform: TransformSettings;
  onTransformChange: (settings: TransformSettings) => void;
}

export function TransformCropPanel({
  videoUrl,
  duration,
  transform,
  onTransformChange,
}: TransformCropPanelProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleRotate = () => {
    const nextRot = ((transform.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    onTransformChange({ ...transform, rotation: nextRot });
  };

  const handleToggleFlipH = () => {
    onTransformChange({ ...transform, flipH: !transform.flipH });
  };

  const handleToggleFlipV = () => {
    onTransformChange({ ...transform, flipV: !transform.flipV });
  };

  const handleSelectAspect = (ratio: TransformSettings['aspectRatio']) => {
    onTransformChange({ ...transform, aspectRatio: ratio });
  };

  const handleSelectFitMode = (mode: TransformSettings['fitMode']) => {
    onTransformChange({ ...transform, fitMode: mode });
  };

  const handleReset = () => {
    onTransformChange({ ...DEFAULT_TRANSFORM });
    toast.info('화면 변환 설정이 초기화되었습니다.');
  };

  const handleExportTransformed = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await renderAndExportVideo(
        videoUrl,
        {
          startTime: 0,
          endTime: duration,
          transform,
        },
        (progress) => setExportProgress(progress)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transformed_video_${Date.now()}.webm`;
      link.click();
      toast.success('화면 변환 비디오 인코딩이 완료되어 다운로드되었습니다.');
    } catch {
      toast.error('동영상 렌더링 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CropRotateRoundedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            화면 회전, 반전 & 비율 크롭 (Transform)
          </Typography>
        </Box>

        <Button size="small" variant="outlined" color="inherit" onClick={handleReset}>
          초기화
        </Button>
      </Box>

      {/* 1. Rotation & Flip controls */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          회전 및 반전 조작
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Button
            variant={transform.rotation !== 0 ? 'contained' : 'outlined'}
            startIcon={<RotateRightRoundedIcon />}
            onClick={handleRotate}
          >
            시계방향 90° 회전 (현재: {transform.rotation}°)
          </Button>

          <Button
            variant={transform.flipH ? 'contained' : 'outlined'}
            startIcon={<FlipRoundedIcon />}
            onClick={handleToggleFlipH}
          >
            좌우 반전 (미러 모드)
          </Button>

          <Button
            variant={transform.flipV ? 'contained' : 'outlined'}
            startIcon={<FlipRoundedIcon sx={{ transform: 'rotate(90deg)' }} />}
            onClick={handleToggleFlipV}
          >
            상하 반전
          </Button>
        </Box>
      </Box>

      {/* 2. Aspect Ratio Presets */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <AspectRatioRoundedIcon fontSize="small" />
          화면 종횡비 (Aspect Ratio) 프리셋
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="원본 비율 (Original)"
            onClick={() => handleSelectAspect('original')}
            color={transform.aspectRatio === 'original' ? 'primary' : 'default'}
            variant={transform.aspectRatio === 'original' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label="16:9 (유튜브 / 가로)"
            onClick={() => handleSelectAspect('16:9')}
            color={transform.aspectRatio === '16:9' ? 'primary' : 'default'}
            variant={transform.aspectRatio === '16:9' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label="9:16 (쇼츠 · 릴스 · 틱톡)"
            onClick={() => handleSelectAspect('9:16')}
            color={transform.aspectRatio === '9:16' ? 'primary' : 'default'}
            variant={transform.aspectRatio === '9:16' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label="1:1 (인스타그램 피드)"
            onClick={() => handleSelectAspect('1:1')}
            color={transform.aspectRatio === '1:1' ? 'primary' : 'default'}
            variant={transform.aspectRatio === '1:1' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label="4:3 (클래식 · 태블릿)"
            onClick={() => handleSelectAspect('4:3')}
            color={transform.aspectRatio === '4:3' ? 'primary' : 'default'}
            variant={transform.aspectRatio === '4:3' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        </Box>

        {transform.aspectRatio !== 'original' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              채우기 모드:
            </Typography>
            <Chip
              size="small"
              label="여백 유지 (Contain)"
              onClick={() => handleSelectFitMode('contain')}
              color={transform.fitMode === 'contain' ? 'primary' : 'default'}
              variant={transform.fitMode === 'contain' ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              size="small"
              label="화면 꽉 채우기 (Cover)"
              onClick={() => handleSelectFitMode('cover')}
              color={transform.fitMode === 'cover' ? 'primary' : 'default'}
              variant={transform.fitMode === 'cover' ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </Box>

      {/* Export Button */}
      <Button
        variant="contained"
        startIcon={<DownloadRoundedIcon />}
        onClick={handleExportTransformed}
        disabled={isExporting}
      >
        {isExporting
          ? `화면 변환 비디오 인코딩 중... (${exportProgress}%)`
          : '변환된 영상 내보내기 (.webm)'}
      </Button>

      {isExporting && (
        <LinearProgress
          variant="determinate"
          value={exportProgress}
          sx={{ height: 6, borderRadius: 1 }}
        />
      )}
    </Card>
  );
}
