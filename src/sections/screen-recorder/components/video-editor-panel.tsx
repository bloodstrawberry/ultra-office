'use client';

import type { RecordedMedia } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';

import { formatTime, formatBytes, convertVideoToGif } from '../utils/screen-recorder-utils';

// ----------------------------------------------------------------------

interface VideoEditorPanelProps {
  media: RecordedMedia;
}

export function VideoEditorPanel({ media }: VideoEditorPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(media.duration || 5);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, media.duration || 5]);
  const [isConvertingGif, setIsConvertingGif] = useState<boolean>(false);
  const [gifProgress, setGifProgress] = useState<number>(0);
  const [gifResultUrl, setGifResultUrl] = useState<string | null>(null);

  // GIF settings
  const [gifFps, setGifFps] = useState<number>(10);
  const [gifWidth, setGifWidth] = useState<number>(640);

  useEffect(() => {
    if (media.duration > 0) {
      setVideoDuration(media.duration);
      setTrimRange([0, media.duration]);
    }
  }, [media]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      const dur = Math.round(videoRef.current.duration);
      setVideoDuration(dur);
      setTrimRange([0, dur]);
    }
  };

  const handleDownloadVideo = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `recording_${new Date().toISOString().slice(0, 10)}.webm`;
    link.click();
    toast.success('비디오 파일(.webm)이 다운로드되었습니다.');
  };

  const handleGenerateGif = async () => {
    setIsConvertingGif(true);
    setGifProgress(0);
    setGifResultUrl(null);
    try {
      const height = Math.round((gifWidth / 16) * 9);
      const gifUrl = await convertVideoToGif(
        media.url,
        {
          fps: gifFps,
          width: gifWidth,
          height,
          quality: 8,
          startTime: trimRange[0],
          endTime: trimRange[1],
        },
        (progress) => setGifProgress(progress)
      );

      setGifResultUrl(gifUrl);
      toast.success('고화질 GIF 생성이 완료되었습니다.');
    } catch {
      toast.error('GIF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConvertingGif(false);
    }
  };

  const handleDownloadGif = () => {
    if (!gifResultUrl) return;
    const link = document.createElement('a');
    link.href = gifResultUrl;
    link.download = `animation_${new Date().toISOString().slice(0, 10)}.gif`;
    link.click();
    toast.success('GIF 애니메이션이 다운로드되었습니다.');
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}>
      {/* 1. Left: Video Player & Trimmer */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            녹화된 영상 미리보기
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatBytes(media.sizeBytes)} · {formatTime(videoDuration)}
          </Typography>
        </Box>

        {/* Video Player Box */}
        <Box
          sx={{
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: '#000000',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            src={media.url}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            style={{ width: '100%', maxHeight: 360, objectFit: 'contain' }}
          />
        </Box>

        {/* Timeline Trimmer Slider */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ContentCutRoundedIcon sx={{ fontSize: 16 }} />
              시작/종료 구간 자르기 (Trimmer)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {formatTime(trimRange[0])} ~ {formatTime(trimRange[1])} (총{' '}
              {trimRange[1] - trimRange[0]}초)
            </Typography>
          </Box>
          <Slider
            value={trimRange}
            min={0}
            max={videoDuration || 10}
            step={1}
            onChange={(_, val) => setTrimRange(val as [number, number])}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => formatTime(v)}
          />
        </Box>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleDownloadVideo}
          sx={{ fontWeight: 700 }}
        >
          녹화 원본 비디오(.webm) 다운로드
        </Button>
      </Card>

      {/* 2. Right: GIF Conversion Studio */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <GifRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          고화질 GIF 애니메이션 제작
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          선택한 구간({trimRange[1] - trimRange[0]}초)을 버그 리포트나 사용 설명서에 첨부하기 좋은
          GIF로 변환합니다.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              프레임 레이트: {gifFps} FPS
            </Typography>
            <Slider
              size="small"
              value={gifFps}
              min={5}
              max={20}
              step={1}
              onChange={(_, v) => setGifFps(v as number)}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              가로 해상도: {gifWidth}px
            </Typography>
            <Slider
              size="small"
              value={gifWidth}
              min={320}
              max={800}
              step={80}
              onChange={(_, v) => setGifWidth(v as number)}
            />
          </Box>
        </Box>

        {isConvertingGif ? (
          <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                GIF 프레임 변환 중...
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {gifProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={gifProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<GifRoundedIcon />}
            onClick={handleGenerateGif}
            sx={{ fontWeight: 800 }}
          >
            선택 구간 GIF 변환 시작
          </Button>
        )}

        {/* Rendered GIF Preview */}
        {gifResultUrl && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
              GIF 변환 완료!
            </Typography>
            <Box
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                maxHeight: 200,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: '#000000',
              }}
            >
              <img
                src={gifResultUrl}
                alt="Converted GIF"
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
              />
            </Box>
            <Button
              variant="contained"
              color="success"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadGif}
              sx={{ fontWeight: 800 }}
            >
              완성된 GIF 다운로드
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
