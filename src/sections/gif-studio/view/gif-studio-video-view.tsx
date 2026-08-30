'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import {
  formatBytes,
  downloadDataUrl,
  getDataUrlByteSize,
  convertVideoSegmentToGif,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioVideoView() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoRange, setVideoRange] = useState<[number, number]>([0, 5]);
  const [videoFps, setVideoFps] = useState<number>(10);
  const [videoWidth, setVideoWidth] = useState<number>(480);
  const [videoQuality, setVideoQuality] = useState<number>(8);
  const [videoCaption, setVideoCaption] = useState<string>('');
  const [videoResultUrl, setVideoResultUrl] = useState<string>('');
  const [isVideoConverting, setIsVideoConverting] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = rightPanelWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = resizeStartXRef.current - e.clientX;
    const newWidth = Math.max(280, Math.min(680, resizeStartWidthRef.current + deltaX));
    setRightPanelWidth(newWidth);
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('비디오 파일(MP4, WebM 등)을 업로드해주세요.');
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setVideoResultUrl('');
    setVideoProgress(0);
  }, []);

  const videoDrop = useImageDropPaste({
    onFiles: (files) => {
      const vid = files.find((f) => f.type.startsWith('video/'));
      if (vid) handleVideoUpload(vid);
    },
    disabled: false,
  });

  const handleLoadedVideoMetadata = () => {
    if (videoPlayerRef.current) {
      const dur = videoPlayerRef.current.duration || 5;
      setVideoDuration(dur);
      setVideoRange([0, Math.min(5, dur)]);
    }
  };

  const handleConvertVideoToGif = async () => {
    if (!videoUrl) {
      toast.error('변환할 동영상 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsVideoConverting(true);
    setVideoProgress(0);
    setVideoResultUrl('');
    toast.info('동영상을 GIF로 변환하고 있습니다...');

    try {
      const height = Math.round((videoWidth / 16) * 9);
      const res = await convertVideoSegmentToGif(
        videoUrl,
        {
          startTime: videoRange[0],
          endTime: videoRange[1],
          width: videoWidth,
          height,
          fps: videoFps,
          quality: videoQuality,
          textOverlay: videoCaption.trim()
            ? {
                text: videoCaption,
                fontSize: 22,
                fontColor: '#ffffff',
                position: 'bottom',
              }
            : undefined,
        },
        (p) => setVideoProgress(p)
      );

      setVideoResultUrl(res);
      toast.success('동영상 → GIF 변환이 완료되었습니다!');
    } catch {
      toast.error('GIF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsVideoConverting(false);
    }
  };

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <GifStudioNavHeader currentTab="video" />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleVideoUpload(file);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {!videoUrl ? (
        <Card
          {...videoDrop.getRootProps({
            onClick: () => videoInputRef.current?.click(),
          })}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <VideoLibraryRoundedIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            동영상 파일 업로드 (MP4, WebM, MOV 등)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            원하는 구간을 자유롭게 잘라 고화질 움짤 GIF로 변환합니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            동영상 파일 선택
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, lg: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Video Player / Preview */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 1.5,
              pr: { lg: 1 },
            }}
          >
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {videoFile?.name || '동영상 미리보기'} ({videoDuration.toFixed(1)}초)
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {videoResultUrl ? (
                  <img
                    src={videoResultUrl}
                    alt="Video to GIF"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <video
                    ref={videoPlayerRef}
                    src={videoUrl}
                    controls
                    onLoadedMetadata={handleLoadedVideoMetadata}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                )}
              </Box>
            </Card>
          </Box>

          {/* Desktop Resizing Divider */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              width: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            <Box sx={{ width: '2px', height: '100%', bgcolor: 'divider' }} />
          </Box>

          {/* Right: Video Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', lg: `${rightPanelWidth}px` },
              minWidth: { lg: `${rightPanelWidth}px` },
              maxWidth: { lg: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              pl: { lg: 1 },
            }}
          >
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    구간 선택 (시작 ~ 종료)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {videoRange[0].toFixed(1)}s ~ {videoRange[1].toFixed(1)}s (총{' '}
                    {(videoRange[1] - videoRange[0]).toFixed(1)}초)
                  </Typography>
                </Box>
                <Slider
                  value={videoRange}
                  min={0}
                  max={videoDuration || 10}
                  step={0.1}
                  onChange={(_, v) => setVideoRange(v as [number, number])}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel>FPS (초당 프레임)</InputLabel>
                <Select
                  value={videoFps}
                  label="FPS (초당 프레임)"
                  onChange={(e) => setVideoFps(Number(e.target.value))}
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
                  value={videoWidth}
                  label="해상도 (너비)"
                  onChange={(e) => setVideoWidth(Number(e.target.value))}
                >
                  <MenuItem value={320}>320 px (작은 크기)</MenuItem>
                  <MenuItem value={480}>480 px (표준)</MenuItem>
                  <MenuItem value={640}>640 px (고화질)</MenuItem>
                  <MenuItem value={800}>800 px (초고화질)</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  품질 레벨 ({videoQuality}/10)
                </Typography>
                <Slider
                  size="small"
                  min={1}
                  max={10}
                  value={videoQuality}
                  onChange={(_, v) => setVideoQuality(v as number)}
                />
              </Box>

              <TextField
                size="small"
                fullWidth
                label="자막 오버레이 (선택사항)"
                placeholder="하단에 표시할 문구"
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
              />
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleConvertVideoToGif}
                disabled={isVideoConverting}
                startIcon={
                  isVideoConverting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeRoundedIcon />
                  )
                }
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
              >
                {isVideoConverting ? `변환 중 (${videoProgress}%)` : '동영상 → GIF 변환하기'}
              </Button>
              {videoResultUrl && (
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => downloadDataUrl(videoResultUrl, `video_to_gif_${Date.now()}.gif`)}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                >
                  GIF 다운로드 ({formatBytes(getDataUrlByteSize(videoResultUrl))})
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => videoInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 동영상 불러오기
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
