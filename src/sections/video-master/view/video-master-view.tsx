'use client';

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
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';

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
import {
  DEFAULT_FILTERS,
  DEFAULT_TRANSFORM,
  DEFAULT_WATERMARK,
  DEFAULT_TEXT_OVERLAY,
  createSampleVideoBlob,
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
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Edit Settings
  const [filters, setFilters] = useState<VideoFilterSettings>({ ...DEFAULT_FILTERS });
  const [transform, setTransform] = useState<TransformSettings>({ ...DEFAULT_TRANSFORM });
  const [textOverlay, setTextOverlay] = useState<TextOverlaySettings>({ ...DEFAULT_TEXT_OVERLAY });
  const [watermark, setWatermark] = useState<WatermarkSettings>({ ...DEFAULT_WATERMARK });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoadFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleLoadFile(file);
    } else {
      toast.error('동영상 파일(.mp4, .webm, .mov 등)을 드래그해 주세요.');
    }
  };

  // Load sample video
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const sampleFile = await createSampleVideoBlob(6);
      handleLoadFile(sampleFile);
    } catch {
      toast.error('샘플 비디오 생성 실패');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            동영상 편집 스튜디오 (Video Master)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            서버 통신 없이 100% 브라우저(Web Audio · Canvas · WebAssembly)에서 동작하는 올인원
            비디오 편집기
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ScienceRoundedIcon />}
            onClick={handleLoadSample}
            disabled={isLoadingSample}
          >
            {isLoadingSample ? '생성 중...' : '테스트용 샘플 영상 불러오기'}
          </Button>

          <Button variant="contained" component="label" startIcon={<CloudUploadRoundedIcon />}>
            동영상 열기
            <input type="file" hidden accept="video/*" onChange={handleFileInput} />
          </Button>
        </Box>
      </Box>

      {/* 2. Drag & Drop Zone if no video loaded */}
      {!videoUrl ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          sx={{
            p: 6,
            borderRadius: 2,
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'divider',
            bgcolor: isDragOver ? 'action.hover' : 'background.neutral',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 2,
            minHeight: 380,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="video/*"
            onChange={handleFileInput}
          />
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayCircleFilledWhiteRoundedIcon sx={{ fontSize: 44 }} />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              동영상 파일을 이곳에 드래그하거나 클릭하여 선택하세요
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              지원 포맷: MP4, WebM, MOV, MKV, AVI 등 (모든 작업은 브라우저 로컬에서 안전하게
              처리됩니다)
            </Typography>
          </Box>

          <Button variant="soft" color="primary" sx={{ mt: 1 }}>
            내 컴퓨터에서 파일 찾기
          </Button>
        </Box>
      ) : (
        /* 3. Main Editor Layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Metadata Card */}
          <VideoInfoCard metadata={metadata} />

          {/* Main Grid: Left Player Preview vs Right Editing Panels */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Player & Live Canvas Mirror */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  💡 실시간 캔버스 미러링: 오른쪽 도구 탭에서 필터, 회전, 자막 변경 시 즉시
                  반영됩니다.
                </Typography>

                <Tooltip title="새로운 영상으로 교체">
                  <Button
                    size="small"
                    component="label"
                    color="inherit"
                    startIcon={<RefreshRoundedIcon />}
                  >
                    영상 바꾸기
                    <input type="file" hidden accept="video/*" onChange={handleFileInput} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Right: Feature Tool Tabs & Panels */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ borderRadius: 2 }}>
                <Tabs
                  value={currentTab}
                  onChange={(_, val) => setCurrentTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '& .MuiTab-root': { minHeight: 48, fontWeight: 700, fontSize: '0.85rem' },
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

              {/* Tab Panels */}
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
