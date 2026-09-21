'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Replay5RoundedIcon from '@mui/icons-material/Replay5Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import Forward5RoundedIcon from '@mui/icons-material/Forward5Rounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';
import { checkerboardBackground } from 'src/sections/photo/utils/checkerboard-export';

import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import { type SampleVideoItem, BG_REMOVE_VIDEO_SAMPLES } from '../data/video-samples';
import {
  renderMaskFrame,
  segmentVideoFrame,
  preloadVideoModel,
  checkIsModelCached,
  checkWebGPUSupport,
  renderCompositeFrame,
  exportBgRemovedVideo,
  downloadFrameSnapshot,
  type VideoBgStyleType,
  VIDEO_BG_REMOVE_MODELS,
  type VideoExportSettings,
  type VideoBgProgressInfo,
  renderSplitComparisonFrame,
  type VideoBgCompositeOptions,
} from '../utils/video-bg-remove-processor';

// ----------------------------------------------------------------------
// Constants & Presets
// ----------------------------------------------------------------------

interface VideoMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  aspectRatio: string;
}

const GRADIENT_PRESETS = [
  { id: 'sunset', label: '석양 (Sunset)', color: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'ocean', label: '오션 (Ocean)', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'cyber', label: '사이버 (Cyber)', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  {
    id: 'emerald',
    label: '에메랄드 (Emerald)',
    color: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  { id: 'warm-studio', label: '웜 스튜디오', color: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
  { id: 'dark-studio', label: '다크 스튜디오', color: 'linear-gradient(135deg, #2e384d, #111827)' },
];

const SOLID_COLORS = [
  { label: '화이트', hex: '#FFFFFF' },
  { label: '스튜디오 그레이', hex: '#F1F5F9' },
  { label: '블랙', hex: '#111827' },
  { label: '크로마키 그린', hex: '#00FF00' },
  { label: '크로마키 블루', hex: '#0000FF' },
  { label: '파스텔 핑크', hex: '#FCE7F3' },
  { label: '스카이 블루', hex: '#E0F2FE' },
  { label: '민트 그린', hex: '#D1FAE5' },
  { label: '소프트 옐로우', hex: '#FEF3C7' },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ----------------------------------------------------------------------

export function VideoMasterBgRemoveView() {
  // Video Source & Element State
  const [, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Video Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Time Trim Range (Start ~ End)
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);

  // AI Segmentation Model & Hardware
  const [selectedModel, setSelectedModel] = useState<string>('briaai/RMBG-1.4');
  const [gpuStatus, setGpuStatus] = useState<{ supported: boolean; message: string }>({
    supported: false,
    message: '하드웨어 상태 확인 중...',
  });
  const [isModelCached, setIsModelCached] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [modelProgress, setModelProgress] = useState<VideoBgProgressInfo>({
    status: 'idle',
    text: '',
    progress: 0,
  });

  // Background Customization Options
  const [bgStyle, setBgStyle] = useState<VideoBgStyleType>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [gradientPreset, setGradientPreset] = useState<string>('sunset');
  const [blurAmount, setBlurAmount] = useState<number>(20);
  const [customBgImgSrc, setCustomBgImgSrc] = useState<string | null>(null);
  const customBgImgRef = useRef<HTMLImageElement | null>(null);

  // Mask Refinement Options
  const [edgeFeather, setEdgeFeather] = useState<number>(2);
  const [maskThreshold, setMaskThreshold] = useState<number>(0);

  // View / Split Modes
  const [viewMode, setViewMode] = useState<'single' | 'split' | 'mask' | 'original'>('split');
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [splitOrientation, setSplitOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [splitMode, setSplitMode] = useState<'inside' | 'outside'>('inside');

  // Segmentation Frame Processing State
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);
  const cachedMaskRef = useRef<HTMLCanvasElement | null>(null);
  const lastMaskTimeRef = useRef<number>(-1);

  // Export Dialog State
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportSettings, setExportSettings] = useState<VideoExportSettings>({
    startTime: 0,
    endTime: 0,
    resolution: 'original',
    quality: 'high',
    format: 'mp4',
    muteAudio: false,
    exportGreenScreen: false,
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const exportAbortControllerRef = useRef<AbortController | null>(null);

  // Sample Dialog State
  const [sampleModalOpen, setSampleModalOpen] = useState<boolean>(false);
  const [sampleLoadingId, setSampleLoadingId] = useState<string | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const bgImageInputRef = useRef<HTMLInputElement | null>(null);

  // ----------------------------------------------------------------------
  // Hardware Check & Model Cache Check on Mount
  // ----------------------------------------------------------------------
  useEffect(() => {
    checkWebGPUSupport().then((status) => {
      setGpuStatus(status);
    });
    checkIsModelCached(selectedModel).then((cached) => {
      setIsModelCached(cached);
    });
  }, [selectedModel]);

  // ----------------------------------------------------------------------
  // File Upload Handlers
  // ----------------------------------------------------------------------
  const handleSelectFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('동영상 파일(MP4, WebM, MOV 등)만 지원됩니다.');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    cachedMaskRef.current = null;
    lastMaskTimeRef.current = -1;

    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 0;
      const w = tempVideo.videoWidth || 1280;
      const h = tempVideo.videoHeight || 720;
      const aspect = (w / h).toFixed(2);

      setMetadata({
        name: file.name,
        size: file.size,
        width: w,
        height: h,
        duration: dur,
        aspectRatio: aspect === '1.78' ? '16:9' : aspect === '0.56' ? '9:16' : `${aspect}:1`,
      });
      setDuration(dur);
      setTrimRange([0, dur]);
      setExportSettings((prev) => ({ ...prev, startTime: 0, endTime: dur }));
    };
  }, []);

  const handleSelectSample = useCallback(
    async (sample: SampleVideoItem) => {
      try {
        setSampleLoadingId(sample.id);
        const file = await sample.generate();
        handleSelectFile(file);
        setSampleModalOpen(false);
        toast.success(`'${sample.label}' 샘플 동영상이 로드되었습니다.`);
      } catch {
        toast.error('샘플 동영상 생성에 실패했습니다.');
      } finally {
        setSampleLoadingId(null);
      }
    },
    [handleSelectFile]
  );

  // ----------------------------------------------------------------------
  // Frame Rendering Loop
  // ----------------------------------------------------------------------
  const renderCurrentDisplay = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // View mode: Original video only
    if (viewMode === 'original') {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);
      return;
    }

    // Check if mask needs to be generated for current time
    if (!cachedMaskRef.current || Math.abs(video.currentTime - lastMaskTimeRef.current) > 0.05) {
      try {
        setIsProcessingFrame(true);
        const mask = await segmentVideoFrame(video, selectedModel, w, h);
        cachedMaskRef.current = mask;
        lastMaskTimeRef.current = video.currentTime;
      } catch (err) {
        console.warn('Frame mask error:', err);
      } finally {
        setIsProcessingFrame(false);
      }
    }

    const currentMask = cachedMaskRef.current;
    if (!currentMask) {
      // Fallback while generating initial mask: draw original
      ctx.drawImage(video, 0, 0, w, h);
      return;
    }

    // View mode: Mask only
    if (viewMode === 'mask') {
      renderMaskFrame(ctx, currentMask, w, h);
      return;
    }

    const compositeOpts: VideoBgCompositeOptions = {
      style: bgStyle,
      solidColor,
      gradientPreset,
      blurAmount,
      customImageSrc: customBgImgSrc || undefined,
      feather: edgeFeather,
      threshold: maskThreshold,
    };

    // View mode: Split comparison
    if (viewMode === 'split') {
      renderSplitComparisonFrame(
        ctx,
        video,
        currentMask,
        compositeOpts,
        splitPercent,
        splitOrientation,
        splitMode,
        w,
        h,
        customBgImgRef.current
      );
      return;
    }

    // View mode: Single composite
    renderCompositeFrame(ctx, video, currentMask, compositeOpts, w, h, customBgImgRef.current);
  }, [
    bgStyle,
    solidColor,
    gradientPreset,
    blurAmount,
    customBgImgSrc,
    edgeFeather,
    maskThreshold,
    viewMode,
    splitPercent,
    splitOrientation,
    splitMode,
    selectedModel,
  ]);

  // Load custom background image into ref
  useEffect(() => {
    if (!customBgImgSrc) {
      customBgImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      customBgImgRef.current = img;
      renderCurrentDisplay();
    };
    img.src = customBgImgSrc;
  }, [customBgImgSrc, renderCurrentDisplay]);

  // Continuous animation frame loop during playback
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderCurrentDisplay();
      return () => {};
    }

    let isSubscribed = true;

    const loop = () => {
      if (!isSubscribed) return;
      const video = videoRef.current;
      if (video) {
        setCurrentTime(video.currentTime);
        renderCurrentDisplay();
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, renderCurrentDisplay]);

  // ----------------------------------------------------------------------
  // Playback Control Handlers
  // ----------------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(video.duration || 0, time));
    video.currentTime = clamped;
    setCurrentTime(clamped);
    cachedMaskRef.current = null;
  }, []);

  const handleStepFrame = useCallback(
    (direction: 'prev' | 'next') => {
      const video = videoRef.current;
      if (!video) return;
      const fps = 30;
      const delta = direction === 'next' ? 1 / fps : -1 / fps;
      handleSeek(video.currentTime + delta);
    },
    [handleSeek]
  );

  const handleSkipTime = useCallback(
    (deltaSec: number) => {
      const video = videoRef.current;
      if (!video) return;
      handleSeek(video.currentTime + deltaSec);
    },
    [handleSeek]
  );

  // ----------------------------------------------------------------------
  // Preload Model Handler
  // ----------------------------------------------------------------------
  const handlePreloadModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      await preloadVideoModel(selectedModel, (p) => {
        setModelProgress(p);
      });
      setIsModelCached(true);
      toast.success('AI 배경 분리 모델이 성공적으로 로드되었습니다!');
    } catch {
      toast.error('AI 모델 로드에 실패했습니다.');
    } finally {
      setIsModelLoading(false);
    }
  }, [selectedModel]);

  // ----------------------------------------------------------------------
  // Snapshot Download Handler
  // ----------------------------------------------------------------------
  const handleDownloadSnapshot = useCallback(
    (format: 'png' | 'jpeg' | 'webp') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const name = metadata?.name.replace(/\.[^/.]+$/, '') || 'video_frame';
      const filename = `${name}_bg_removed_${Math.round(currentTime * 10)}.${format}`;
      downloadFrameSnapshot(canvas, filename, format, bgStyle === 'transparent');
      toast.success(`현재 프레임이 ${format.toUpperCase()} 이미지로 저장되었습니다.`);
    },
    [metadata, currentTime, bgStyle]
  );

  const handleShareKakao = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await shareToKakaoTalk(
        dataUrl,
        'AI 동영상 배경 제거 스냅샷',
        'video_snapshot.png'
      );
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
    }
  }, []);

  // ----------------------------------------------------------------------
  // Video Export Handler
  // ----------------------------------------------------------------------
  const handleStartExport = useCallback(async () => {
    if (!videoUrl) return;

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportElapsedSec(0);

      const abortCtrl = new AbortController();
      exportAbortControllerRef.current = abortCtrl;

      const compOpts: VideoBgCompositeOptions = {
        style: bgStyle,
        solidColor,
        gradientPreset,
        blurAmount,
        customImageSrc: customBgImgSrc || undefined,
        feather: edgeFeather,
        threshold: maskThreshold,
      };

      const finalSettings: VideoExportSettings = {
        ...exportSettings,
        startTime: trimRange[0],
        endTime: trimRange[1],
      };

      const blob = await exportBgRemovedVideo(
        videoUrl,
        compOpts,
        finalSettings,
        selectedModel,
        customBgImgRef.current,
        (progress, elapsed) => {
          setExportProgress(progress);
          setExportElapsedSec(elapsed);
        },
        abortCtrl.signal
      );

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const ext = exportSettings.format === 'mp4' ? 'mp4' : 'webm';
      const baseName = metadata?.name.replace(/\.[^/.]+$/, '') || 'video';
      link.href = downloadUrl;
      link.download = `${baseName}_bg_removed.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('동영상 배경 제거 인코딩이 완료되어 다운로드되었습니다!');
      setExportModalOpen(false);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        toast.info('동영상 내보내기가 취소되었습니다.');
      } else {
        toast.error('동영상 내보내기 중 오류가 발생했습니다.');
      }
    } finally {
      setIsExporting(false);
      exportAbortControllerRef.current = null;
    }
  }, [
    videoUrl,
    bgStyle,
    solidColor,
    gradientPreset,
    blurAmount,
    customBgImgSrc,
    edgeFeather,
    maskThreshold,
    exportSettings,
    trimRange,
    selectedModel,
    metadata,
  ]);

  const handleCancelExport = useCallback(() => {
    if (exportAbortControllerRef.current) {
      exportAbortControllerRef.current.abort();
    }
    setIsExporting(false);
  }, []);

  // ----------------------------------------------------------------------
  // Render Workspace
  // ----------------------------------------------------------------------
  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        p: { xs: 1.5, md: 2.5 },
        height: 'calc(100vh - 75px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.5,
          flexShrink: 0,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              AI 동영상 배경 제거 (Video Background Remover)
            </Typography>
            <Chip
              label={gpuStatus.supported ? '⚡ WebGPU 가속 활성' : 'WASM CPU 모드'}
              size="small"
              color={gpuStatus.supported ? 'primary' : 'default'}
              sx={{ fontWeight: 700, fontSize: 11 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            브라우저 로컬 AI로 영상 속 인물 및 피사체를 분리하고 투명화, 단색, 그라디언트,
            아웃포커싱 블러 배경을 합성합니다.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setSampleModalOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            샘플 영상 테스트
          </Button>

          {videoUrl && (
            <Button
              variant="soft"
              size="small"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={() => {
                setVideoUrl(null);
                setVideoFile(null);
              }}
              sx={{ fontWeight: 700 }}
            >
              새 비영상 열기
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Workspace Area */}
      {!videoUrl ? (
        <Card
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <VideoUploadWorkspace
            sampleVideos={BG_REMOVE_VIDEO_SAMPLES}
            onSelectSample={handleSelectSample}
            onFileSelect={handleSelectFile}
            title="동영상 파일 선택 또는 드래그"
            subtitle="모든 AI 연산은 클라우드 전송 없이 브라우저 내에서 안전하게 실시간 처리됩니다."
            sampleTitle="⚡ 즉석 테스트 샘플 동영상"
            sampleSubtitle="인물 댄스 모션 및 크리에이터 브이로그 샘플로 AI 배경 분리를 즉시 테스트하세요."
          />
        </Card>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left Canvas Viewport & Controls */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: 1.5,
            }}
          >
            {/* Canvas Viewport Container */}
            <Card
              sx={{
                flex: 1,
                minHeight: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#090d16',
                overflow: 'hidden',
                background: bgStyle === 'transparent' ? checkerboardBackground(10) : '#090d16',
              }}
            >
              {/* Hidden Video Source Element */}
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                muted={isMuted}
                onLoadedMetadata={() => {
                  if (videoRef.current && canvasRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth || 640;
                    canvasRef.current.height = videoRef.current.videoHeight || 360;
                    renderCurrentDisplay();
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />

              {/* Main Display Canvas */}
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              />

              {/* AI Processing Overlay Indicator */}
              {isProcessingFrame && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: '#38bdf8',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    AI 세그멘테이션 연산 중...
                  </Typography>
                </Box>
              )}

              {/* Video Info Badge */}
              {metadata && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                    {metadata.width} × {metadata.height} ({metadata.aspectRatio}) •{' '}
                    {formatBytes(metadata.size)}
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Video Player Control Toolbar */}
            <Card sx={{ p: 1.5, flexShrink: 0 }}>
              {/* Timeline Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', fontWeight: 700, minWidth: 54 }}
                >
                  {formatTime(currentTime)}
                </Typography>

                <Slider
                  size="small"
                  value={currentTime}
                  min={0}
                  max={duration || 10}
                  step={0.05}
                  onChange={(_, val) => handleSeek(val as number)}
                  sx={{ flex: 1 }}
                />

                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', color: 'text.secondary', minWidth: 54 }}
                >
                  {formatTime(duration)}
                </Typography>
              </Box>

              {/* Playback Controls & View Mode Toggles */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {/* Left Controls: Play / Step / Skip / Volume */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    color="primary"
                    onClick={togglePlay}
                    sx={{ backgroundColor: 'action.hover' }}
                  >
                    {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  </IconButton>

                  <Tooltip title="5초 뒤로">
                    <IconButton size="small" onClick={() => handleSkipTime(-5)}>
                      <Replay5RoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="5초 앞으로">
                    <IconButton size="small" onClick={() => handleSkipTime(5)}>
                      <Forward5RoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleStepFrame('prev')}
                    sx={{ minWidth: 32, px: 0.8, fontSize: 11 }}
                  >
                    ◀ 1F
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleStepFrame('next')}
                    sx={{ minWidth: 32, px: 0.8, fontSize: 11 }}
                  >
                    1F ▶
                  </Button>

                  {/* Volume Slider */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        if (videoRef.current) videoRef.current.muted = nextMuted;
                      }}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeOffRoundedIcon fontSize="small" />
                      ) : (
                        <VolumeUpRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                    <Slider
                      size="small"
                      value={isMuted ? 0 : volume}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(_, v) => {
                        const val = v as number;
                        setVolume(val);
                        setIsMuted(false);
                        if (videoRef.current) {
                          videoRef.current.volume = val;
                          videoRef.current.muted = false;
                        }
                      }}
                      sx={{ width: 60 }}
                    />
                  </Box>

                  {/* Playback Rate Selector */}
                  <FormControl size="small" sx={{ minWidth: 68, ml: 0.5 }}>
                    <Select
                      size="small"
                      value={playbackRate}
                      onChange={(e) => {
                        const rate = Number(e.target.value);
                        setPlaybackRate(rate);
                        if (videoRef.current) videoRef.current.playbackRate = rate;
                      }}
                      sx={{ fontSize: 11, height: 28 }}
                    >
                      <MenuItem value={0.5} sx={{ fontSize: 11 }}>
                        0.5x
                      </MenuItem>
                      <MenuItem value={1} sx={{ fontSize: 11 }}>
                        1.0x
                      </MenuItem>
                      <MenuItem value={1.25} sx={{ fontSize: 11 }}>
                        1.25x
                      </MenuItem>
                      <MenuItem value={1.5} sx={{ fontSize: 11 }}>
                        1.5x
                      </MenuItem>
                      <MenuItem value={2} sx={{ fontSize: 11 }}>
                        2.0x
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Right Controls: View Mode Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={viewMode}
                    onChange={(_, val) => val && setViewMode(val)}
                  >
                    <ToggleButton value="split">
                      <CompareArrowsRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
                      비교 (Split)
                    </ToggleButton>
                    <ToggleButton value="single">
                      <ColorLensRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
                      결과 (Composite)
                    </ToggleButton>
                    <ToggleButton value="mask">
                      <TuneRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
                      마스크 (Mask)
                    </ToggleButton>
                    <ToggleButton value="original">원본 (Original)</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Right Settings & Export Sidebar Panel */}
          <Card
            sx={{
              width: { xs: '100%', md: 380 },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              gap: 2.5,
              overflowY: 'auto',
              maxHeight: '100%',
            }}
          >
            {/* Section 1: AI Model Selection */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}
              >
                <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
                AI 세그멘테이션 모델
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>분리 모델 선택</InputLabel>
                <Select
                  value={selectedModel}
                  label="분리 모델 선택"
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    cachedMaskRef.current = null;
                  }}
                >
                  {VIDEO_BG_REMOVE_MODELS.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {m.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: 11 }}
                        >
                          {m.size} • {m.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!isModelCached && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="soft"
                    color="primary"
                    onClick={handlePreloadModel}
                    disabled={isModelLoading}
                    startIcon={
                      isModelLoading ? <CircularProgress size={14} /> : <CloudUploadRoundedIcon />
                    }
                    sx={{ fontWeight: 700 }}
                  >
                    {isModelLoading ? '모델 다운로드 중...' : '모델 사전 캐싱 (Preload)'}
                  </Button>
                  {isModelLoading && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={modelProgress.progress * 100} />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                      >
                        {modelProgress.text}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Section 2: Background Replacement Styles */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 1.2, display: 'flex', alignItems: 'center', gap: 0.8 }}
              >
                <ColorLensRoundedIcon color="primary" fontSize="small" />
                배경 합성 스타일
              </Typography>

              <ToggleButtonGroup
                fullWidth
                size="small"
                exclusive
                value={bgStyle}
                onChange={(_, val) => val && setBgStyle(val)}
                sx={{ mb: 1.5, flexWrap: 'wrap' }}
              >
                <ToggleButton value="transparent">투명 (Alpha)</ToggleButton>
                <ToggleButton value="solid">단색 (Solid)</ToggleButton>
                <ToggleButton value="gradient">그라디언트</ToggleButton>
                <ToggleButton value="blur">배경 블러</ToggleButton>
                <ToggleButton value="custom-image">이미지</ToggleButton>
              </ToggleButtonGroup>

              {/* Sub-options for Solid Color */}
              {bgStyle === 'solid' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {SOLID_COLORS.map((col) => (
                      <Tooltip key={col.hex} title={col.label}>
                        <Box
                          onClick={() => setSolidColor(col.hex)}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: col.hex,
                            border:
                              solidColor === col.hex
                                ? '3px solid #38bdf8'
                                : '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      직접 선택:
                    </Typography>
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      style={{
                        width: 36,
                        height: 32,
                        cursor: 'pointer',
                        border: 'none',
                        borderRadius: 4,
                      }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {solidColor.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Sub-options for Gradient */}
              {bgStyle === 'gradient' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {GRADIENT_PRESETS.map((grad) => (
                    <Box
                      key={grad.id}
                      onClick={() => setGradientPreset(grad.id)}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: grad.color,
                        color: grad.id === 'warm-studio' ? '#111' : '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border:
                          gradientPreset === grad.id
                            ? '2px solid #38bdf8'
                            : '1px solid rgba(255,255,255,0.2)',
                        boxShadow:
                          gradientPreset === grad.id ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none',
                      }}
                    >
                      {grad.label}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Sub-options for Blur */}
              {bgStyle === 'blur' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      아웃포커싱 블러 강도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {blurAmount}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={blurAmount}
                    min={4}
                    max={40}
                    step={1}
                    onChange={(_, v) => setBlurAmount(v as number)}
                  />
                </Box>
              )}

              {/* Sub-options for Custom Image */}
              {bgStyle === 'custom-image' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <input
                    ref={bgImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCustomBgImgSrc(url);
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadRoundedIcon />}
                    onClick={() => bgImageInputRef.current?.click()}
                    sx={{ fontWeight: 700 }}
                  >
                    배경 이미지 선택하기
                  </Button>
                  {customBgImgSrc && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ✓ 커스텀 배경 이미지가 적용되었습니다.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Section 3: Split Comparison Settings */}
            {viewMode === 'split' && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}
                >
                  <CompareArrowsRoundedIcon color="primary" fontSize="small" />
                  분할 비교 (Split) 조절
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    분할 위치
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {splitPercent}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={splitPercent}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(_, v) => setSplitPercent(v as number)}
                  sx={{ mb: 1.5 }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={splitOrientation === 'horizontal' ? 'contained' : 'outlined'}
                    startIcon={<SwapHorizRoundedIcon />}
                    onClick={() => setSplitOrientation('horizontal')}
                    sx={{ flex: 1, fontSize: 11 }}
                  >
                    좌우 분할
                  </Button>
                  <Button
                    size="small"
                    variant={splitOrientation === 'vertical' ? 'contained' : 'outlined'}
                    startIcon={<SwapVertRoundedIcon />}
                    onClick={() => setSplitOrientation('vertical')}
                    sx={{ flex: 1, fontSize: 11 }}
                  >
                    상하 분할
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant={splitMode === 'inside' ? 'contained' : 'outlined'}
                    onClick={() => setSplitMode('inside')}
                    sx={{ flex: 1, fontSize: 11 }}
                  >
                    내부 합성
                  </Button>
                  <Button
                    size="small"
                    variant={splitMode === 'outside' ? 'contained' : 'outlined'}
                    onClick={() => setSplitMode('outside')}
                    sx={{ flex: 1, fontSize: 11 }}
                  >
                    외부 합성
                  </Button>
                </Box>
              </Box>
            )}

            {/* Section 4: Mask Edge Refinement */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}
              >
                <TuneRoundedIcon color="primary" fontSize="small" />
                마스크 엣지 미세 조정
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      엣지 페더링 (가장자리 부드러움)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {edgeFeather}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={edgeFeather}
                    min={0}
                    max={10}
                    step={0.5}
                    onChange={(_, v) => setEdgeFeather(v as number)}
                  />
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      알파 마스크 임계값 (Threshold)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {maskThreshold}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={maskThreshold}
                    min={0}
                    max={128}
                    step={2}
                    onChange={(_, v) => setMaskThreshold(v as number)}
                  />
                </Box>
              </Box>
            </Box>

            {/* Section 5: Frame Snapshot Tools */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}
              >
                <CameraAltRoundedIcon color="primary" fontSize="small" />
                현재 프레임 스냅샷 저장
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => handleDownloadSnapshot('png')}
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  >
                    투명 PNG 저장
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => handleDownloadSnapshot('jpeg')}
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  >
                    JPEG 저장
                  </Button>
                </Box>

                <Button
                  fullWidth
                  size="small"
                  variant="soft"
                  color="warning"
                  startIcon={<ShareRoundedIcon />}
                  onClick={handleShareKakao}
                  sx={{ fontWeight: 700, fontSize: 11 }}
                >
                  카카오톡 공유하기
                </Button>
              </Box>
            </Box>

            {/* Section 6: Video Export Action */}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<MovieCreationRoundedIcon />}
                onClick={() => setExportModalOpen(true)}
                sx={{
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: 15,
                  boxShadow: '0 8px 24px rgba(0, 167, 111, 0.35)',
                }}
              >
                동영상 내보내기 (Export) ➜
              </Button>
            </Box>
          </Card>
        </Box>
      )}

      {/* Export Settings Dialog */}
      <Dialog
        open={exportModalOpen}
        onClose={() => !isExporting && setExportModalOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            p: 1,
            width: '100%',
            maxWidth: 480,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>동영상 배경 제거 내보내기</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {!isExporting ? (
            <>
              {/* Format selection */}
              <FormControl fullWidth size="small">
                <InputLabel>출력 동영상 포맷</InputLabel>
                <Select
                  value={exportSettings.format}
                  label="출력 동영상 포맷"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      format: e.target.value as 'mp4' | 'webm',
                    }))
                  }
                >
                  <MenuItem value="mp4">MP4 (배경 합성 비디오 - 고호환성)</MenuItem>
                  <MenuItem value="webm">WebM (투명 알파 채널 또는 고화질 WebM)</MenuItem>
                </Select>
              </FormControl>

              {/* Resolution */}
              <FormControl fullWidth size="small">
                <InputLabel>해상도</InputLabel>
                <Select
                  value={exportSettings.resolution}
                  label="해상도"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      resolution: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="original">
                    원본 해상도 유지 ({metadata?.width} × {metadata?.height})
                  </MenuItem>
                  <MenuItem value="1080p">FHD 1080p (1920 × 1080)</MenuItem>
                  <MenuItem value="720p">HD 720p (1280 × 720)</MenuItem>
                  <MenuItem value="480p">SD 480p (854 × 480)</MenuItem>
                </Select>
              </FormControl>

              {/* Quality */}
              <FormControl fullWidth size="small">
                <InputLabel>인코딩 화질</InputLabel>
                <Select
                  value={exportSettings.quality}
                  label="인코딩 화질"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      quality: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="high">고화질 (8 Mbps - 추천)</MenuItem>
                  <MenuItem value="medium">표준 화질 (5 Mbps)</MenuItem>
                  <MenuItem value="standard">압축 화질 (2.5 Mbps)</MenuItem>
                </Select>
              </FormControl>

              {/* Options Switches */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={exportSettings.exportGreenScreen || false}
                      onChange={(e) =>
                        setExportSettings((prev) => ({
                          ...prev,
                          exportGreenScreen: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="크로마키 그린스크린 (#00FF00) 배경으로 출력"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={exportSettings.muteAudio}
                      onChange={(e) =>
                        setExportSettings((prev) => ({
                          ...prev,
                          muteAudio: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="오디오 음소거 (소리 제거)"
                />
              </Box>

              {/* Trim Range Display */}
              <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: 'action.hover' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  렌더링 구간: {formatTime(trimRange[0])} ~ {formatTime(trimRange[1])} (총{' '}
                  {Math.max(0, trimRange[1] - trimRange[0]).toFixed(1)}초)
                </Typography>
              </Box>
            </>
          ) : (
            <Box
              sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <CircularProgress size={56} thickness={4} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {exportProgress}% 완료
              </Typography>
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{ width: '100%', height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                AI 프레임 세그멘테이션 및 비디오 인코딩 중... ({exportElapsedSec}초 경과)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!isExporting ? (
            <>
              <Button onClick={() => setExportModalOpen(false)}>취소</Button>
              <Button variant="contained" onClick={handleStartExport} sx={{ fontWeight: 700 }}>
                인코딩 시작
              </Button>
            </>
          ) : (
            <Button color="error" onClick={handleCancelExport}>
              내보내기 중단 (취소)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sample Video Selector Dialog */}
      <Dialog
        open={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            p: 1,
            width: '100%',
            maxWidth: 520,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>즉석 테스트 샘플 동영상</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          {BG_REMOVE_VIDEO_SAMPLES.map((sample) => (
            <Card
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
              }}
            >
              <Box
                component="img"
                src={sample.thumbnailSvg}
                sx={{ width: 90, height: 50, borderRadius: 1, objectFit: 'cover' }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {sample.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {sample.subLabel}
                </Typography>
              </Box>
              {sampleLoadingId === sample.id ? (
                <CircularProgress size={20} />
              ) : (
                <Button size="small" variant="soft" color="primary" sx={{ fontWeight: 700 }}>
                  체험하기 ➜
                </Button>
              )}
            </Card>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSampleModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
