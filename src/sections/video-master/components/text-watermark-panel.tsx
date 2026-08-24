'use client';

import type { WatermarkSettings, TextOverlaySettings } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';

import { renderAndExportVideo } from '../utils/video-processor';

// ----------------------------------------------------------------------

interface TextWatermarkPanelProps {
  videoUrl: string;
  duration: number;
  textOverlay: TextOverlaySettings;
  watermark: WatermarkSettings;
  onTextOverlayChange: (settings: TextOverlaySettings) => void;
  onWatermarkChange: (settings: WatermarkSettings) => void;
}

export function TextWatermarkPanel({
  videoUrl,
  duration,
  textOverlay,
  watermark,
  onTextOverlayChange,
  onWatermarkChange,
}: TextWatermarkPanelProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        onWatermarkChange({
          ...watermark,
          enabled: true,
          imageSrc: src,
          imageElement: img,
        });
        toast.success('워터마크 이미지가 적용되었습니다.');
      };
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleExportWithOverlays = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await renderAndExportVideo(
        videoUrl,
        {
          startTime: 0,
          endTime: duration,
          textOverlay,
          watermark,
        },
        (progress) => setExportProgress(progress)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `watermarked_video_${Date.now()}.webm`;
      link.click();
      toast.success('자막 & 워터마크가 합성된 비디오가 다운로드되었습니다.');
    } catch {
      toast.error('동영상 렌더링 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Subtitle & Text Overlay */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TitleRoundedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              자막 & 텍스트 오버레이
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={textOverlay.enabled}
                onChange={(e) => onTextOverlayChange({ ...textOverlay, enabled: e.target.checked })}
                color="primary"
              />
            }
            label={<Typography variant="body2">자막 활성화</Typography>}
          />
        </Box>

        {textOverlay.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              multiline
              rows={2}
              size="small"
              label="자막 문구 입력"
              value={textOverlay.text}
              onChange={(e) => onTextOverlayChange({ ...textOverlay, text: e.target.value })}
              placeholder="영상에 표시할 텍스트를 입력하세요."
              fullWidth
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>자막 위치</InputLabel>
                <Select
                  value={textOverlay.position}
                  label="자막 위치"
                  onChange={(e) =>
                    onTextOverlayChange({
                      ...textOverlay,
                      position: e.target.value as 'top' | 'center' | 'bottom' | 'custom',
                    })
                  }
                >
                  <MenuItem value="top">상단 (Top)</MenuItem>
                  <MenuItem value="center">중앙 (Center)</MenuItem>
                  <MenuItem value="bottom">하단 (Bottom)</MenuItem>
                  <MenuItem value="custom">사용자 지정 좌표</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  글자 크기 ({textOverlay.fontSize}px)
                </Typography>
                <Slider
                  size="small"
                  value={textOverlay.fontSize}
                  min={14}
                  max={72}
                  step={2}
                  onChange={(_, val) =>
                    onTextOverlayChange({ ...textOverlay, fontSize: val as number })
                  }
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  배경 박스 투명도 ({Math.round(textOverlay.backgroundOpacity * 100)}%)
                </Typography>
                <Slider
                  size="small"
                  value={textOverlay.backgroundOpacity}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(_, val) =>
                    onTextOverlayChange({ ...textOverlay, backgroundOpacity: val as number })
                  }
                />
              </Box>
            </Box>

            {textOverlay.position === 'custom' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <Box>
                  <Typography variant="caption">가로 위치 X ({textOverlay.customX}%)</Typography>
                  <Slider
                    size="small"
                    value={textOverlay.customX}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_, val) =>
                      onTextOverlayChange({ ...textOverlay, customX: val as number })
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="caption">세로 위치 Y ({textOverlay.customY}%)</Typography>
                  <Slider
                    size="small"
                    value={textOverlay.customY}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_, val) =>
                      onTextOverlayChange({ ...textOverlay, customY: val as number })
                    }
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>

      {/* 2. Logo & Watermark Overlay */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrandingWatermarkRoundedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              로고 & 이미지 워터마크
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={watermark.enabled}
                onChange={(e) => onWatermarkChange({ ...watermark, enabled: e.target.checked })}
                color="primary"
              />
            }
            label={<Typography variant="body2">워터마크 활성화</Typography>}
          />
        </Box>

        {watermark.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadRoundedIcon />}
              fullWidth
            >
              워터마크 로고 이미지 업로드 (PNG / JPG)
              <input type="file" hidden accept="image/*" onChange={handleWatermarkImageUpload} />
            </Button>

            {watermark.imageSrc && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                  gap: 2,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel>배치 위치</InputLabel>
                  <Select
                    value={watermark.position}
                    label="배치 위치"
                    onChange={(e) =>
                      onWatermarkChange({
                        ...watermark,
                        position: e.target.value as WatermarkSettings['position'],
                      })
                    }
                  >
                    <MenuItem value="top-left">좌측 상단</MenuItem>
                    <MenuItem value="top-right">우측 상단</MenuItem>
                    <MenuItem value="bottom-left">좌측 하단</MenuItem>
                    <MenuItem value="bottom-right">우측 하단</MenuItem>
                    <MenuItem value="center">중앙</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    워터마크 너비 ({watermark.width}px)
                  </Typography>
                  <Slider
                    size="small"
                    value={watermark.width}
                    min={40}
                    max={300}
                    step={10}
                    onChange={(_, val) => onWatermarkChange({ ...watermark, width: val as number })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    투명도 ({Math.round(watermark.opacity * 100)}%)
                  </Typography>
                  <Slider
                    size="small"
                    value={watermark.opacity}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onChange={(_, val) =>
                      onWatermarkChange({ ...watermark, opacity: val as number })
                    }
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>

      {/* Export Button */}
      <Button
        variant="contained"
        startIcon={<DownloadRoundedIcon />}
        onClick={handleExportWithOverlays}
        disabled={isExporting}
      >
        {isExporting
          ? `합성 비디오 인코딩 중... (${exportProgress}%)`
          : '자막/워터마크 합성 영상 내보내기 (.webm)'}
      </Button>

      {isExporting && (
        <LinearProgress
          variant="determinate"
          value={exportProgress}
          sx={{ height: 6, borderRadius: 1 }}
        />
      )}
    </Box>
  );
}
