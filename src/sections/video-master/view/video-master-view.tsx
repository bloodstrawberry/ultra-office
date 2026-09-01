'use client';

import type { SampleVideoItem } from '../data/video-samples';
import type {
  VideoMetadata,
  TransformSettings,
  WatermarkSettings,
  TextOverlaySettings,
  VideoFilterSettings,
} from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifMakerPanel } from '../components/gif-maker-panel';
import { VideoInfoCard } from '../components/video-info-card';
import { TrimSpeedPanel } from '../components/trim-speed-panel';
import { VideoMergePanel } from '../components/video-merge-panel';
import { FilterColorPanel } from '../components/filter-color-panel';
import { AudioExtractPanel } from '../components/audio-extract-panel';
import { FrameCapturePanel } from '../components/frame-capture-panel';
import { TransformCropPanel } from '../components/transform-crop-panel';
import { TextWatermarkPanel } from '../components/text-watermark-panel';
import { VideoPlayerPreview } from '../components/video-player-preview';
import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import {
  DEFAULT_FILTERS,
  DEFAULT_TRANSFORM,
  DEFAULT_WATERMARK,
  DEFAULT_TEXT_OVERLAY,
} from '../utils/video-processor';

// ----------------------------------------------------------------------

type ToolTabKey = 'trim' | 'audio' | 'gif' | 'filter' | 'overlay' | 'transform' | 'frame' | 'merge';

export function VideoMasterView() {
  const [currentTab, setCurrentTab] = useState<ToolTabKey>('trim');

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Edit Settings
  const [filters, setFilters] = useState<VideoFilterSettings>({ ...DEFAULT_FILTERS });
  const [transform, setTransform] = useState<TransformSettings>({ ...DEFAULT_TRANSFORM });
  const [textOverlay, setTextOverlay] = useState<TextOverlaySettings>({ ...DEFAULT_TEXT_OVERLAY });
  const [watermark, setWatermark] = useState<WatermarkSettings>({ ...DEFAULT_WATERMARK });

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(420);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(420);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const newWidth = Math.max(320, Math.min(680, resizeStartWidthRef.current + deltaX));
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

  // Handle Video File Upload
  const handleLoadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setCurrentTime(0);

    // Reset edits
    setFilters({ ...DEFAULT_FILTERS });
    setTransform({ ...DEFAULT_TRANSFORM });
    setTextOverlay({ ...DEFAULT_TEXT_OVERLAY });
    setWatermark({ ...DEFAULT_WATERMARK });

    // Inspect metadata
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const w = tempVideo.videoWidth || 1280;
      const h = tempVideo.videoHeight || 720;
      const dur = tempVideo.duration || 0;
      setDuration(dur);

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const div = gcd(w, h);
      const aspect = `${w / div}:${h / div}`;

      setMetadata({
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        duration: dur,
        width: w,
        height: h,
        aspectRatio: aspect,
        hasAudio: true,
      });

      toast.success(`'${file.name}' 비디오가 로드되었습니다.`);
    };
  }, []);

  const handleSelectSample = async (sample: SampleVideoItem) => {
    try {
      const file = await sample.generate();
      handleLoadFile(file);
    } catch {
      toast.error('샘플 비디오 생성에 실패했습니다.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoadFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleReset = () => {
    setVideoUrl(null);
    setVideoFile(null);
    setMetadata(null);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 2.5 },
      }}
    >
      <input ref={fileInputRef} type="file" hidden accept="video/*" onChange={handleFileInput} />

      {/* 1. Header Navigation Bar */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MovieCreationRoundedIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              동영상 편집 스튜디오 (Video Master)
            </Typography>
            <Chip
              label="100% 브라우저 로컬 가속"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            서버 통신 없이 100% 브라우저 WebAssembly · Web Audio · Canvas에서 안전하고 정밀하게
            영상을 편집합니다.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.videoMaster.trim}
            size="small"
            variant="soft"
            color="primary"
            startIcon={<ContentCutRoundedIcon />}
          >
            동영상 자르기
          </Button>

          <Button
            component={RouterLink}
            href={paths.videoMaster.merge}
            size="small"
            variant="soft"
            color="primary"
            startIcon={<CallMergeRoundedIcon />}
          >
            동영상 붙이기
          </Button>

          <Button
            component={RouterLink}
            href={paths.videoMaster.aiWatermark}
            size="small"
            variant="soft"
            color="primary"
            startIcon={<MovieFilterRoundedIcon />}
          >
            AI 워터마크 각인
          </Button>

          {videoUrl && (
            <>
              <Tooltip title="새 영상으로 교체">
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  영상 바꾸기
                </Button>
              </Tooltip>

              <Button size="small" variant="soft" color="error" onClick={handleReset}>
                닫기
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* 2. Main Content Area */}
      {!videoUrl ? (
        <VideoUploadWorkspace
          onSelectSample={handleSelectSample}
          onFileSelect={handleLoadFile}
          title="편집할 동영상을 업로드하세요"
          subtitle="동영상 파일을 드래그하거나 컴퓨터에서 선택하세요. (모든 작업은 브라우저 로컬에서 안전하게 처리됩니다)"
          icon={<MovieFilterRoundedIcon sx={{ fontSize: 38 }} />}
        />
      ) : (
        /* Active Workspace: Left Viewport & Right Control Panels */
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Player & Live Canvas Viewport */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { lg: 1.5 },
              gap: 1.5,
            }}
          >
            <VideoPlayerPreview
              videoUrl={videoUrl}
              videoRef={videoRef}
              canvasRef={canvasRef}
              filters={filters}
              transform={transform}
              textOverlay={textOverlay}
              watermark={watermark}
              currentTime={currentTime}
              duration={duration}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => setDuration(d)}
            />
          </Box>

          {/* Resizable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              width: 8,
              cursor: 'col-resize',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 10,
              userSelect: 'none',
              touchAction: 'none',
              mx: 0.5,
              '&::after': {
                content: '""',
                width: 3,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'divider',
                transition: 'background-color 0.2s',
              },
              '&:hover::after': {
                bgcolor: 'primary.main',
              },
            }}
          />

          {/* Right: Feature Tool Tabs & Scrollable Panels */}
          <Box
            sx={{
              width: { xs: '100%', lg: rightPanelWidth },
              minWidth: { lg: 320 },
              maxWidth: { lg: 680 },
              flexShrink: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: 1.5,
            }}
          >
            {/* Compact Video Info Header */}
            {metadata && <VideoInfoCard metadata={metadata} />}

            {/* Pinned Tab Header */}
            <Card sx={{ borderRadius: 2, flexShrink: 0 }}>
              <Tabs
                value={currentTab}
                onChange={(_, val) => setCurrentTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1.5,
                  minHeight: 44,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 44,
                    py: 1,
                    px: 1.5,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                  },
                }}
              >
                <Tab
                  value="trim"
                  icon={<ContentCutRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="자르기 · 배속"
                />
                <Tab
                  value="audio"
                  icon={<AudiotrackRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="오디오 추출"
                />
                <Tab
                  value="gif"
                  icon={<GifRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="GIF 움짤"
                />
                <Tab
                  value="filter"
                  icon={<ColorLensRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="필터 · 색감"
                />
                <Tab
                  value="overlay"
                  icon={<TitleRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="자막 · 워터마크"
                />
                <Tab
                  value="transform"
                  icon={<CropRotateRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="회전 · 비율"
                />
                <Tab
                  value="frame"
                  icon={<CameraAltRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="프레임 캡처"
                />
                <Tab
                  value="merge"
                  icon={<CallMergeRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="영상 병합"
                />
              </Tabs>
            </Card>

            {/* Scrollable Tool Panel Area */}
            <Box
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                pr: 0.5,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {currentTab === 'trim' && (
                <TrimSpeedPanel videoUrl={videoUrl} duration={duration} videoRef={videoRef} />
              )}

              {currentTab === 'audio' && (
                <AudioExtractPanel videoFile={videoFile} duration={duration} />
              )}

              {currentTab === 'gif' && <GifMakerPanel videoUrl={videoUrl} duration={duration} />}

              {currentTab === 'filter' && (
                <FilterColorPanel
                  videoUrl={videoUrl}
                  duration={duration}
                  filters={filters}
                  onFilterChange={(f) => setFilters(f)}
                />
              )}

              {currentTab === 'overlay' && (
                <TextWatermarkPanel
                  videoUrl={videoUrl}
                  duration={duration}
                  textOverlay={textOverlay}
                  watermark={watermark}
                  onTextOverlayChange={(t) => setTextOverlay(t)}
                  onWatermarkChange={(w) => setWatermark(w)}
                />
              )}

              {currentTab === 'transform' && (
                <TransformCropPanel
                  videoUrl={videoUrl}
                  duration={duration}
                  transform={transform}
                  onTransformChange={(tr) => setTransform(tr)}
                />
              )}

              {currentTab === 'frame' && (
                <FrameCapturePanel
                  videoUrl={videoUrl}
                  currentTime={currentTime}
                  videoRef={videoRef}
                />
              )}

              {currentTab === 'merge' && <VideoMergePanel />}
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
