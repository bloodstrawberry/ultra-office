'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { formatTime } from '../utils/audio-processor';
import { convertVideoSegmentToGif } from '../utils/gif-processor';

// ----------------------------------------------------------------------

interface GifMakerPanelProps {
  videoUrl: string;
  duration: number;
}

export function GifMakerPanel({ videoUrl, duration }: GifMakerPanelProps) {
  const [gifRange, setGifRange] = useState<[number, number]>([0, Math.min(5, duration || 5)]);
  const [fps, setFps] = useState<number>(10);
  const [width, setWidth] = useState<number>(480);
  const [quality, setQuality] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);

  const handleGenerateGif = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedGifUrl(null);
    try {
      const height = Math.round((width / 16) * 9);
      const gifDataUrl = await convertVideoSegmentToGif(
        videoUrl,
        {
          startTime: gifRange[0],
          endTime: gifRange[1],
          width,
          height,
          fps,
          quality,
        },
        (p) => setProgress(p)
      );

      setGeneratedGifUrl(gifDataUrl);
      toast.success('움짤(GIF) 생성이 완료되었습니다!');
    } catch {
      toast.error('GIF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadGif = () => {
    if (!generatedGifUrl) return;
    const link = document.createElement('a');
    link.href = generatedGifUrl;
    link.download = `animation_${Date.now()}.gif`;
    link.click();
    toast.success('GIF 애니메이션이 다운로드되었습니다.');
  };

  const gifDuration = Math.max(0.1, gifRange[1] - gifRange[0]);

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GifRoundedIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          동영상 → 움짤 (GIF) 변환 스튜디오
        </Typography>
      </Box>

      {/* Range Slider */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            GIF 구간 설정 (권장: 1초~6초)
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            {formatTime(gifRange[0])} ~ {formatTime(gifRange[1])} (총 {gifDuration.toFixed(1)}초)
          </Typography>
        </Box>

        <Slider
          value={gifRange}
          min={0}
          max={duration || 10}
          step={0.1}
          onChange={(_, val) => setGifRange(val as [number, number])}
          valueLabelDisplay="auto"
          valueLabelFormat={(val) => formatTime(val)}
        />
      </Box>

      {/* Settings Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>FPS (초당 프레임)</InputLabel>
          <Select
            value={fps}
            label="FPS (초당 프레임)"
            onChange={(e) => setFps(Number(e.target.value))}
          >
            <MenuItem value={5}>5 FPS (경량)</MenuItem>
            <MenuItem value={10}>10 FPS (표준)</MenuItem>
            <MenuItem value={15}>15 FPS (부드러움)</MenuItem>
            <MenuItem value={20}>20 FPS (고품질)</MenuItem>
            <MenuItem value={24}>24 FPS (시네마틱)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>해상도 (너비)</InputLabel>
          <Select
            value={width}
            label="해상도 (너비)"
            onChange={(e) => setWidth(Number(e.target.value))}
          >
            <MenuItem value={320}>320 px (작은 크기)</MenuItem>
            <MenuItem value={480}>480 px (표준)</MenuItem>
            <MenuItem value={640}>640 px (고화질)</MenuItem>
            <MenuItem value={800}>800 px (초고화질)</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            품질 & 최적화 ({quality}/10)
          </Typography>
          <Slider
            size="small"
            value={quality}
            min={1}
            max={10}
            step={1}
            onChange={(_, val) => setQuality(val as number)}
          />
        </Box>
      </Box>

      {/* Convert Button */}
      <Button
        variant="contained"
        startIcon={isGenerating ? <AutoAwesomeRoundedIcon /> : <GifRoundedIcon />}
        onClick={handleGenerateGif}
        disabled={isGenerating}
      >
        {isGenerating ? `GIF 인코딩 중... (${progress}%)` : '고화질 GIF 생성하기'}
      </Button>

      {/* Progress */}
      {isGenerating && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      )}

      {/* Result Preview */}
      {generatedGifUrl && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, alignSelf: 'flex-start' }}>
            생성된 GIF 미리보기
          </Typography>

          <Box
            component="img"
            src={generatedGifUrl}
            alt="Generated GIF"
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              objectFit: 'contain',
            }}
          />

          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadGif}
            fullWidth
          >
            GIF 파일 다운로드 (.gif)
          </Button>
        </Box>
      )}
    </Card>
  );
}
