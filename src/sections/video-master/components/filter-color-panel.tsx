'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import type { VideoFilterSettings, VideoPresetKey } from '../types';
import { FILTER_PRESETS, DEFAULT_FILTERS, renderAndExportVideo } from '../utils/video-processor';

// ----------------------------------------------------------------------

interface FilterColorPanelProps {
  videoUrl: string;
  duration: number;
  filters: VideoFilterSettings;
  onFilterChange: (filters: VideoFilterSettings) => void;
}

export function FilterColorPanel({
  videoUrl,
  duration,
  filters,
  onFilterChange,
}: FilterColorPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<VideoPresetKey>('normal');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleSelectPreset = (presetKey: VideoPresetKey) => {
    setSelectedPreset(presetKey);
    const found = FILTER_PRESETS.find((p) => p.id === presetKey);
    if (found) {
      onFilterChange({ ...found.filter });
    }
  };

  const handleSliderChange = (key: keyof VideoFilterSettings, value: number) => {
    setSelectedPreset('normal');
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleResetFilters = () => {
    setSelectedPreset('normal');
    onFilterChange({ ...DEFAULT_FILTERS });
    toast.info('필터 설정이 초기화되었습니다.');
  };

  const handleExportFilteredVideo = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await renderAndExportVideo(
        videoUrl,
        {
          startTime: 0,
          endTime: duration,
          filters,
        },
        (progress) => setExportProgress(progress)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `filtered_video_${Date.now()}.webm`;
      link.click();
      toast.success('색감 보정 비디오 인코딩이 완료되어 다운로드되었습니다.');
    } catch {
      toast.error('동영상 인코딩 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title & Reset */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorLensRoundedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            비디오 필터 & 색감 보정 (Color Grading)
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltRoundedIcon />}
          onClick={handleResetFilters}
        >
          초기화
        </Button>
      </Box>

      {/* Preset Chips */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
          원클릭 스타일 프리셋
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {FILTER_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.name}
              onClick={() => handleSelectPreset(preset.id)}
              color={selectedPreset === preset.id ? 'primary' : 'default'}
              variant={selectedPreset === preset.id ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Sliders Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        {/* Brightness */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              밝기 (Brightness)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.brightness}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.brightness}
            min={40}
            max={200}
            step={1}
            onChange={(_, val) => handleSliderChange('brightness', val as number)}
          />
        </Box>

        {/* Contrast */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              대비 (Contrast)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.contrast}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.contrast}
            min={40}
            max={200}
            step={1}
            onChange={(_, val) => handleSliderChange('contrast', val as number)}
          />
        </Box>

        {/* Saturation */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              채도 (Saturation)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.saturation}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.saturation}
            min={0}
            max={250}
            step={1}
            onChange={(_, val) => handleSliderChange('saturation', val as number)}
          />
        </Box>

        {/* Hue Rotate */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              색조 회전 (Hue Rotate)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.hueRotate}°
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.hueRotate}
            min={0}
            max={360}
            step={5}
            onChange={(_, val) => handleSliderChange('hueRotate', val as number)}
          />
        </Box>

        {/* Blur */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              블러 효과 (Blur)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.blur}px
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.blur}
            min={0}
            max={15}
            step={1}
            onChange={(_, val) => handleSliderChange('blur', val as number)}
          />
        </Box>

        {/* Grayscale */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              흑백 (Grayscale)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.grayscale}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.grayscale}
            min={0}
            max={100}
            step={1}
            onChange={(_, val) => handleSliderChange('grayscale', val as number)}
          />
        </Box>

        {/* Sepia */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              세피아 (Sepia)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.sepia}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.sepia}
            min={0}
            max={100}
            step={1}
            onChange={(_, val) => handleSliderChange('sepia', val as number)}
          />
        </Box>

        {/* Invert */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              색상 반전 (Invert)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {filters.invert}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={filters.invert}
            min={0}
            max={100}
            step={1}
            onChange={(_, val) => handleSliderChange('invert', val as number)}
          />
        </Box>
      </Box>

      {/* Export button */}
      <Button
        variant="contained"
        startIcon={<DownloadRoundedIcon />}
        onClick={handleExportFilteredVideo}
        disabled={isExporting}
      >
        {isExporting
          ? `필터 비디오 렌더링 중... (${exportProgress}%)`
          : '필터 적용된 영상 다운로드 (.webm)'}
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
