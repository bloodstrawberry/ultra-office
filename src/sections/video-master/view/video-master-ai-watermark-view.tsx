'use client';

import type { SampleVideoItem } from '../data/video-samples';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import {
  loadImage,
  addCustomLogo,
  getAllVideoLogos,
  removeCustomLogo,
  findVideoLogoById,
  type WatermarkLogo,
  isPointInWatermark,
  type PositionPreset,
  drawVideoAiWatermark,
  PRESET_AI_VIDEO_LOGOS,
  exportAiWatermarkedVideo,
  type VideoExportSettings,
  getWatermarkCenterRelative,
  createAiWatermarkSampleVideo,
  getWatermarkDirectionArrowHit,
  type VideoAiWatermarkRenderOptions,
} from '../utils/video-ai-watermark-processor';

// ----------------------------------------------------------------------

interface VideoMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  aspectRatio: string;
}

const PRESET_ANNOTATION_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
  '#18181B', // Dark
];

const PRESET_SUBTEXT_SUGGESTIONS = [
  'Generated with AI',
  'AI 생성 이미지',
  'Created by AI',
  'AI Generated Art',
  '대외비 (CONFIDENTIAL)',
  'SAMPLE',
  'COPYRIGHT ©',
];

const GRID_POSITION_OPTIONS: { id: PositionPreset; label: string; tooltip: string }[] = [
  { id: 'top-left', label: '◤', tooltip: '좌상단' },
  { id: 'top-center', label: '▲', tooltip: '상단 중앙' },
  { id: 'top-right', label: '◥', tooltip: '우상단' },
  { id: 'center-left', label: '◀', tooltip: '좌측 중앙' },
  { id: 'center', label: '●', tooltip: '정중앙' },
  { id: 'center-right', label: '▶', tooltip: '우측 중앙' },
  { id: 'bottom-left', label: '◣', tooltip: '좌하단' },
  { id: 'bottom-center', label: '▼', tooltip: '하단 중앙' },
  { id: 'bottom-right', label: '◢', tooltip: '우하단' },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
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
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function VideoMasterAiWatermarkView() {
  // Video Source & Metadata
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Trimming Range
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);

  // Logo Selection
  const [selectedLogoId, setSelectedLogoId] = useState<string>('chatgpt');
  const [, setCustomLogosVersion] = useState<number>(0);

  // Watermark Adjustments
  const [opacity, setOpacity] = useState<number>(0.5);
  const [scale, setScale] = useState<number>(0.14);
  const [rotation, setRotation] = useState<number>(0);
  const [positionPreset, setPositionPreset] = useState<PositionPreset>('bottom-right');
  const [customX, setCustomX] = useState<number>(0.85);
  const [customY, setCustomY] = useState<number>(0.85);

  // Subtext Options
  const [showText, setShowText] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('Generated with AI');
  const [textColor, setTextColor] = useState<string>('#ffffff');

  // Hand-Drawn Marker Annotations
  const [showLogoCircle, setShowLogoCircle] = useState<boolean>(false);
  const [showLogoArrow, setShowLogoArrow] = useState<boolean>(false);
  const [showLogoSquare, setShowLogoSquare] = useState<boolean>(false);
  const [logoAnnotationColor, setLogoAnnotationColor] = useState<string>('#EF4444');
  const [logoAnnotationLineWidth, setLogoAnnotationLineWidth] = useState<number>(1.0);
  const [logoAnnotationOpacity, setLogoAnnotationOpacity] = useState<number>(1.0);
  const [logoAnnotationSize, setLogoAnnotationSize] = useState<number>(1.0);

  // Export Settings
  const [exportResolution, setExportResolution] = useState<'original' | '1080p' | '720p' | '480p'>(
    'original'
  );
  const [exportQuality, setExportQuality] = useState<'high' | 'medium' | 'standard'>('high');
  const [exportMuteAudio, setExportMuteAudio] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const [exportedResultUrl, setExportedResultUrl] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);

  // UI Control States
  const [activeTab, setActiveTab] = useState<'logo' | 'style' | 'annotation' | 'text' | 'export'>(
    'logo'
  );
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(400);

  // Zoom & Pan for interactive canvas
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const customLogoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSelectionVisibleRef = useRef<boolean>(true);
  const selectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingLogoRef = useRef<boolean>(false);
  const dragPosRef = useRef<{ customX: number; customY: number } | null>(null);
  const lastCustomPosRef = useRef<{ customX: number; customY: number } | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const isPanningRef = useRef<boolean>(false);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number>(0);
  const initialZoomRef = useRef<number>(1.0);
  const lastPanPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const exportAbortControllerRef = useRef<AbortController | null>(null);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(400);

  // Helper options
  const currentRenderOptions: VideoAiWatermarkRenderOptions = useMemo(
    () => ({
      opacity,
      scale,
      rotation,
      positionPreset,
      customX,
      customY,
      customText,
      showText,
      textColor,
      showLogoCircle,
      showLogoArrow,
      showLogoSquare,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationOpacity,
      logoAnnotationSize,
    }),
    [
      opacity,
      scale,
      rotation,
      positionPreset,
      customX,
      customY,
      customText,
      showText,
      textColor,
      showLogoCircle,
      showLogoArrow,
      showLogoSquare,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationOpacity,
      logoAnnotationSize,
    ]
  );

  // Redraw Canvas Frame
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    if (canvas.width !== vw) canvas.width = vw;
    if (canvas.height !== vh) canvas.height = vh;

    if (viewMode === 'before') {
      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(video, 0, 0, vw, vh);
      return;
    }

    const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;
    const effectiveOptions: VideoAiWatermarkRenderOptions = activeCustomPos
      ? {
          ...currentRenderOptions,
          positionPreset: 'custom',
          customX: activeCustomPos.customX,
          customY: activeCustomPos.customY,
        }
      : currentRenderOptions;

    const showDirectionArrows = activeTab === 'style';
    drawVideoAiWatermark(
      ctx,
      video,
      logoImgRef.current,
      effectiveOptions,
      isSelectionVisibleRef.current,
      showDirectionArrows
    );
  }, [currentRenderOptions, activeTab, viewMode]);

  // Animation Loop for Video Playback Synchronous Canvas Mirror
  useEffect(() => {
    let animId: number;
    const renderLoop = () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        redrawCanvas();
        setCurrentTime(videoRef.current.currentTime);
      }
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [redrawCanvas]);

  // Load Selected Logo Image
  useEffect(() => {
    let isCancelled = false;
    const logoObj = findVideoLogoById(selectedLogoId);
    if (logoObj?.src) {
      loadImage(logoObj.src)
        .then((img) => {
          if (isCancelled) return;
          logoImgRef.current = img;
          redrawCanvas();
        })
        .catch(() => {
          if (isCancelled) return;
          logoImgRef.current = null;
          redrawCanvas();
        });
    } else {
      logoImgRef.current = null;
      redrawCanvas();
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedLogoId, redrawCanvas]);

  // Show selection box overlay temporarily
  const triggerSelectionBox = useCallback(() => {
    isSelectionVisibleRef.current = true;
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }
    selectionTimerRef.current = setTimeout(() => {
      isSelectionVisibleRef.current = false;
      redrawCanvas();
    }, 3500);
  }, [redrawCanvas]);

  // Handle Video File Load
  const handleLoadVideoFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
      setExportedResultUrl(null);

      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const w = tempVideo.videoWidth || 1280;
        const h = tempVideo.videoHeight || 720;
        const dur = tempVideo.duration || 0;
        setDuration(dur);
        setTrimRange([0, dur]);

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const div = gcd(w, h);
        const aspect = `${w / div}:${h / div}`;

        setMetadata({
          name: file.name,
          size: file.size,
          width: w,
          height: h,
          duration: dur,
          aspectRatio: aspect,
        });

        triggerSelectionBox();
        toast.success(`'${file.name}' 비디오가 로드되었습니다.`);
      };
    },
    [triggerSelectionBox]
  );

  // Load Test Sample Video
  const handleLoadSampleVideo = async () => {
    setIsLoadingSample(true);
    try {
      const sampleFile = await createAiWatermarkSampleVideo(7);
      handleLoadVideoFile(sampleFile);
    } catch {
      toast.error('샘플 영상 생성에 실패했습니다.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleSelectSample = async (sample: SampleVideoItem) => {
    try {
      const file = await sample.generate();
      handleLoadVideoFile(file);
    } catch {
      toast.error('샘플 비디오 생성에 실패했습니다.');
    }
  };

  // Video Playback Controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime >= trimRange[1]) {
        video.currentTime = trimRange[0];
      }
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    redrawCanvas();
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
    redrawCanvas();
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Pointer & Canvas Interaction (Dragging Logo & Direction Handles)
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { canvasX: 0, canvasY: 0, relX: 0.5, relY: 0.5, imgRenderW: 400 };

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const canvasW = canvas.width || 1280;
    const canvasH = canvas.height || 720;
    const canvasAspect = canvasW / canvasH;

    const rectW = rect.width || 600;
    const rectH = rect.height || 340;
    const rectAspect = rectW / rectH;

    let imgRenderW = rectW;
    let imgRenderH = rectH;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > rectAspect) {
      imgRenderW = rectW;
      imgRenderH = rectW / canvasAspect;
      offsetY = (rectH - imgRenderH) / 2;
    } else {
      imgRenderH = rectH;
      imgRenderW = rectH * canvasAspect;
      offsetX = (rectW - imgRenderW) / 2;
    }

    const imgClickX = clickX - offsetX;
    const imgClickY = clickY - offsetY;

    const relX = Math.max(0, Math.min(1, imgClickX / Math.max(1, imgRenderW)));
    const relY = Math.max(0, Math.min(1, imgClickY / Math.max(1, imgRenderH)));

    const canvasX = relX * canvasW;
    const canvasY = relY * canvasH;

    return { canvasX, canvasY, relX, relY, imgRenderW };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || viewMode === 'before') return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 2) {
      isDraggingLogoRef.current = false;
      isPanningRef.current = false;
      const p1 = pointers[0];
      const p2 = pointers[1];
      initialPinchDistRef.current = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      initialZoomRef.current = zoomScale;
    } else if (pointers.length === 1) {
      const { canvasX, canvasY, relX, relY, imgRenderW } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;
      const effectiveOpts: VideoAiWatermarkRenderOptions = activeCustomPos
        ? {
            ...currentRenderOptions,
            positionPreset: 'custom',
            customX: activeCustomPos.customX,
            customY: activeCustomPos.customY,
          }
        : currentRenderOptions;

      // Check Direction Arrow Hits
      const showDirectionArrows = activeTab === 'style';
      const arrowHit = showDirectionArrows
        ? getWatermarkDirectionArrowHit(
            canvas.width,
            canvas.height,
            logoImgRef.current,
            effectiveOpts,
            canvasX,
            canvasY,
            imgRenderW
          )
        : null;

      if (arrowHit) {
        const logoCenter = getWatermarkCenterRelative(
          canvas.width,
          canvas.height,
          logoImgRef.current,
          effectiveOpts
        );

        const step = 0.015;
        let nextX = logoCenter.relX;
        let nextY = logoCenter.relY;

        if (arrowHit === 'up') nextY = Math.max(0.01, nextY - step);
        if (arrowHit === 'down') nextY = Math.min(0.99, nextY + step);
        if (arrowHit === 'left') nextX = Math.max(0.01, nextX - step);
        if (arrowHit === 'right') nextX = Math.min(0.99, nextX + step);

        dragPosRef.current = { customX: nextX, customY: nextY };
        lastCustomPosRef.current = { customX: nextX, customY: nextY };
        setPositionPreset('custom');
        setCustomX(nextX);
        setCustomY(nextY);

        triggerSelectionBox();
        redrawCanvas();
        return;
      }

      // Check Logo Area Hit
      const isHit = isPointInWatermark(
        canvas.width,
        canvas.height,
        logoImgRef.current,
        effectiveOpts,
        canvasX,
        canvasY,
        imgRenderW
      );

      if (isHit) {
        isDraggingLogoRef.current = true;
        isPanningRef.current = false;
        isSelectionVisibleRef.current = true;

        const logoCenter = getWatermarkCenterRelative(
          canvas.width,
          canvas.height,
          logoImgRef.current,
          effectiveOpts
        );

        dragOffsetRef.current = {
          dx: relX - logoCenter.relX,
          dy: relY - logoCenter.relY,
        };
        dragPosRef.current = { customX: logoCenter.relX, customY: logoCenter.relY };
        lastCustomPosRef.current = { customX: logoCenter.relX, customY: logoCenter.relY };

        redrawCanvas();
      } else {
        const now = Date.now();
        if (now - lastTapTimeRef.current < 300) {
          setZoomScale(1.0);
          setPanOffset({ x: 0, y: 0 });
        }
        lastTapTimeRef.current = now;

        if (zoomScale > 1.0) {
          isPanningRef.current = true;
          isDraggingLogoRef.current = false;
          lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 2) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const currentDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (initialPinchDistRef.current > 0) {
        const scaleFactor = currentDist / initialPinchDistRef.current;
        const newZoom = Math.max(1.0, Math.min(10.0, initialZoomRef.current * scaleFactor));
        setZoomScale(newZoom);
        if (newZoom <= 1.01) {
          setPanOffset({ x: 0, y: 0 });
        }
      }
    } else if (pointers.length === 1) {
      if (isDraggingLogoRef.current) {
        const { relX, relY } = getCanvasCoords(e);
        const targetX = Math.max(0, Math.min(1, relX - dragOffsetRef.current.dx));
        const targetY = Math.max(0, Math.min(1, relY - dragOffsetRef.current.dy));

        dragPosRef.current = { customX: targetX, customY: targetY };
        lastCustomPosRef.current = { customX: targetX, customY: targetY };
        isSelectionVisibleRef.current = true;

        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            redrawCanvas();
          });
        }
      } else if (isPanningRef.current) {
        const dx = (e.clientX - lastPanPosRef.current.x) / zoomScale;
        const dy = (e.clientY - lastPanPosRef.current.y) / zoomScale;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };

        const maxPan = Math.max(150, (zoomScale - 1) * 300);
        setPanOffset((prev) => ({
          x: Math.max(-maxPan, Math.min(maxPan, prev.x + dx)),
          y: Math.max(-maxPan, Math.min(maxPan, prev.y + dy)),
        }));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = 0;
    }

    if (activePointersRef.current.size === 0) {
      if (isDraggingLogoRef.current) {
        isDraggingLogoRef.current = false;
        if (dragPosRef.current) {
          setPositionPreset('custom');
          setCustomX(dragPosRef.current.customX);
          setCustomY(dragPosRef.current.customY);
        }
        dragPosRef.current = null;
        triggerSelectionBox();
      }
      isPanningRef.current = false;
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.003;
    setZoomScale((prev) => {
      const next = Math.max(1.0, Math.min(10.0, prev + zoomDelta));
      if (next <= 1.01) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Custom Logo Upload
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        const newLogo: WatermarkLogo = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '') || '내 커스텀 로고',
          src: dataUrl,
          defaultText: 'AI Custom Watermark',
          category: 'custom',
        };
        addCustomLogo(newLogo);
        setCustomLogosVersion((v) => v + 1);
        setSelectedLogoId(newLogo.id);
        toast.success('커스텀 로고가 성공적으로 등록되었습니다.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteCustomLogo = (e: React.MouseEvent, logoId: string) => {
    e.stopPropagation();
    removeCustomLogo(logoId);
    setCustomLogosVersion((v) => v + 1);
    if (selectedLogoId === logoId) {
      setSelectedLogoId(PRESET_AI_VIDEO_LOGOS[0].id);
    }
    toast.success('커스텀 로고가 삭제되었습니다.');
  };

  // Video Export Execution
  const handleStartExport = async () => {
    if (!videoUrl) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportElapsedSec(0);
    setIsExportDialogOpen(true);

    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;

    const exportSettings: VideoExportSettings = {
      startTime: trimRange[0],
      endTime: trimRange[1] || duration,
      resolution: exportResolution,
      quality: exportQuality,
      muteAudio: exportMuteAudio,
    };

    try {
      const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;
      const effectiveOptions: VideoAiWatermarkRenderOptions = activeCustomPos
        ? {
            ...currentRenderOptions,
            positionPreset: 'custom',
            customX: activeCustomPos.customX,
            customY: activeCustomPos.customY,
          }
        : currentRenderOptions;

      const blob = await exportAiWatermarkedVideo(
        videoUrl,
        logoImgRef.current,
        effectiveOptions,
        exportSettings,
        (progress, elapsed) => {
          setExportProgress(progress);
          setExportElapsedSec(elapsed);
        },
        abortController.signal
      );

      const resultUrl = URL.createObjectURL(blob);
      setExportedResultUrl(resultUrl);
      toast.success('AI 워터마크 비디오 렌더링이 완료되었습니다!');
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('중단') || (err as Error)?.message?.includes('취소')) {
        toast.info('비디오 인코딩이 취소되었습니다.');
      } else {
        toast.error('비디오 렌더링 중 오류가 발생했습니다.');
      }
    } finally {
      setIsExporting(false);
      exportAbortControllerRef.current = null;
    }
  };

  const handleCancelExport = () => {
    if (exportAbortControllerRef.current) {
      exportAbortControllerRef.current.abort();
    }
    setIsExportDialogOpen(false);
  };

  const handleDownloadResult = () => {
    if (!exportedResultUrl) return;
    const link = document.createElement('a');
    link.href = exportedResultUrl;
    link.download = `ai_watermarked_${metadata?.name?.replace(/\.[^/.]+$/, '') || 'video'}_${Date.now()}.webm`;
    link.click();
    toast.success('비디오 다운로드를 시작합니다.');
  };

  // Reset Adjustments
  const handleResetSettings = () => {
    setOpacity(0.5);
    setScale(0.14);
    setRotation(0);
    setPositionPreset('bottom-right');
    setCustomX(0.85);
    setCustomY(0.85);
    setShowText(false);
    setCustomText('Generated with AI');
    setTextColor('#ffffff');
    setShowLogoCircle(false);
    setShowLogoArrow(false);
    setShowLogoSquare(false);
    setLogoAnnotationColor('#EF4444');
    setLogoAnnotationLineWidth(1.0);
    setLogoAnnotationOpacity(1.0);
    setLogoAnnotationSize(1.0);
    triggerSelectionBox();
    toast.info('워터마크 설정이 기본값으로 초기화되었습니다.');
  };

  // Sidebar Resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = rightPanelWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = resizeStartXRef.current - ev.clientX;
      const newWidth = Math.max(320, Math.min(600, resizeStartWidthRef.current + delta));
      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Listen to video time updates to stop at trim end
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (trimRange[1] > 0 && video.currentTime >= trimRange[1]) {
      if (isLooping) {
        video.currentTime = trimRange[0];
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const allLogos = getAllVideoLogos();

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
      {/* 1. Top Header */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MovieFilterRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              동영상 AI 워터마크 각인 (Video AI Watermark)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              비디오에 AI 생성 모델 로고, 손그림 마커, 자막을 100% 브라우저에서 합성
            </Typography>
          </Box>
        </Box>

        {/* Header Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={RouterLink}
            href={paths.videoMaster.trim}
            size="small"
            variant="soft"
            color="inherit"
            startIcon={<ContentCutRoundedIcon />}
          >
            동영상 자르기
          </Button>

          <Button
            component={RouterLink}
            href={paths.videoMaster.merge}
            size="small"
            variant="soft"
            color="inherit"
            startIcon={<CallMergeRoundedIcon />}
          >
            동영상 붙이기
          </Button>

          <Button
            size="small"
            variant="soft"
            color="primary"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={handleLoadSampleVideo}
            disabled={isLoadingSample || isExporting}
          >
            {isLoadingSample ? '생성 중...' : '테스트 샘플 영상'}
          </Button>

          <Button
            size="small"
            variant="contained"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            disabled={isExporting}
          >
            영상 불러오기
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLoadVideoFile(f);
                e.target.value = '';
              }}
            />
          </Button>
        </Box>
      </Box>

      {/* 2. Main Content Viewport */}
      {!videoUrl ? (
        <VideoUploadWorkspace
          onSelectSample={handleSelectSample}
          onFileSelect={handleLoadVideoFile}
          title="AI 워터마크를 각인할 동영상을 업로드하세요"
          subtitle="동영상 파일을 드래그하거나 컴퓨터에서 선택하세요. (AI 모델 로고, 손그림 마커, 자막 100% 브라우저 합성)"
          icon={<MovieFilterRoundedIcon sx={{ fontSize: 38 }} />}
        />
      ) : (
        /* Active Workspace: Left Video Stage + Right Tabs Panel */
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mt: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left: Video Stage & Player Controls */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {/* Hidden Source Video Element */}
            <video
              ref={videoRef}
              src={videoUrl}
              crossOrigin="anonymous"
              playsInline
              loop={isLooping}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />

            {/* Video Stage Header Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 700, maxWidth: { xs: 180, sm: 300 } }}
                >
                  {metadata?.name || 'video'}
                </Typography>
                {metadata && (
                  <Chip
                    size="small"
                    label={`${metadata.width}x${metadata.height} (${metadata.aspectRatio})`}
                    variant="outlined"
                    sx={{ fontSize: '0.72rem', height: 22 }}
                  />
                )}
                {metadata && (
                  <Chip
                    size="small"
                    label={formatBytes(metadata.size)}
                    variant="soft"
                    sx={{ fontSize: '0.72rem', height: 22 }}
                  />
                )}
              </Box>

              {/* View Mode & Zoom Reset Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  sx={{ height: 28 }}
                >
                  <ToggleButton
                    value="after"
                    sx={{ px: 1.2, fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    워터마크 뷰
                  </ToggleButton>
                  <ToggleButton
                    value="before"
                    sx={{ px: 1.2, fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    원본 비교
                  </ToggleButton>
                </ToggleButtonGroup>

                {zoomScale > 1.01 && (
                  <Tooltip title="줌/위치 초기화">
                    <Button
                      size="small"
                      variant="soft"
                      color="inherit"
                      onClick={() => {
                        setZoomScale(1.0);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      sx={{ height: 28, fontSize: '0.72rem', px: 1 }}
                    >
                      줌 {Math.round(zoomScale * 100)}% 리셋
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Interactive Canvas Viewport Stage */}
            <Box
              ref={containerRef}
              onWheel={handleWheel}
              sx={{
                flexGrow: 1,
                bgcolor: '#080C14',
                borderRadius: 2,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                touchAction: 'none',
                minHeight: 260,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${zoomScale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transformOrigin: 'center center',
                  cursor: isDraggingLogoRef.current
                    ? 'grabbing'
                    : zoomScale > 1
                      ? 'grab'
                      : 'crosshair',
                  userSelect: 'none',
                }}
              />

              {/* Floating Helper Pill */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 12,
                  bgcolor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(6px)',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.7rem' }}>
                  💡 캔버스에서 워터마크를 직접 드래그하거나 화살표(▲ ◀ ▼ ▶)를 클릭해 이동하세요
                </Typography>
              </Box>
            </Box>

            {/* Video Player Timeline & Controls Card */}
            <Card sx={{ mt: 1.5, p: 1.5, borderRadius: 2, flexShrink: 0 }}>
              {/* 1. Time Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 46 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Slider
                  size="small"
                  value={currentTime}
                  min={0}
                  max={duration || 100}
                  step={0.05}
                  onChange={(_, val) => handleSeek(val as number)}
                  sx={{ color: 'primary.main' }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', minWidth: 46, textAlign: 'right' }}
                >
                  {formatTime(duration)}
                </Typography>
              </Box>

              {/* 2. Control Buttons Bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 0.5,
                }}
              >
                {/* Left: Playback & Step Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleSkip(-5)} title="5초 뒤로">
                    <FastRewindRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="medium"
                    color="primary"
                    onClick={togglePlayPause}
                    sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light' } }}
                  >
                    {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  </IconButton>

                  <IconButton size="small" onClick={() => handleSkip(5)} title="5초 앞으로">
                    <FastForwardRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color={isLooping ? 'primary' : 'default'}
                    onClick={() => setIsLooping(!isLooping)}
                    title={isLooping ? '반복 재생 켜짐' : '반복 재생 꺼짐'}
                  >
                    <LoopRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Right: Volume & Playback Rate */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Volume Control */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 110 }}>
                    <IconButton size="small" onClick={toggleMute}>
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
                      onChange={(_, val) => handleVolumeChange(val as number)}
                    />
                  </Box>

                  {/* Playback Rate */}
                  <Select
                    size="small"
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                    sx={{ height: 30, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    <MenuItem value={0.5}>0.5x</MenuItem>
                    <MenuItem value={1.0}>1.0x</MenuItem>
                    <MenuItem value={1.25}>1.25x</MenuItem>
                    <MenuItem value={1.5}>1.5x</MenuItem>
                    <MenuItem value={2.0}>2.0x</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* 3. Trimming Range Selector */}
              {duration > 0 && (
                <Box
                  sx={{
                    mt: 1.2,
                    pt: 1,
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 60 }}>
                    구간 자르기
                  </Typography>
                  <Slider
                    size="small"
                    value={trimRange}
                    min={0}
                    max={duration}
                    step={0.1}
                    onChange={(_, val) => setTrimRange(val as [number, number])}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(val) => formatTime(val)}
                    sx={{ color: 'secondary.main' }}
                  />
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                    {(trimRange[1] - trimRange[0]).toFixed(1)}초 각인
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>

          {/* Resizer Handle */}
          <Box
            onMouseDown={handleResizeMouseDown}
            sx={{
              width: 6,
              cursor: 'col-resize',
              display: { xs: 'none', md: 'block' },
              '&:hover': { bgcolor: 'primary.main' },
              transition: 'background 0.2s',
              borderRadius: 1,
            }}
          />

          {/* Right: Feature Tool Tabs & Customizer Sidebar */}
          <Card
            sx={{
              width: { xs: '100%', md: rightPanelWidth },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Tabs Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              {[
                { id: 'logo' as const, label: '로고' },
                { id: 'style' as const, label: '스타일' },
                { id: 'annotation' as const, label: '마커' },
                { id: 'text' as const, label: '문구' },
                { id: 'export' as const, label: '내보내기' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'contained' : 'text'}
                  color={activeTab === tab.id ? 'primary' : 'inherit'}
                  onClick={() => {
                    setActiveTab(tab.id);
                    triggerSelectionBox();
                  }}
                  sx={{
                    borderRadius: 0,
                    py: 1.2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>

            {/* Tabs Scrollable Body */}
            <Box
              sx={{
                p: 2,
                flexGrow: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Tab 1. Logo Selection */}
              {activeTab === 'logo' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      AI 모델 & 비디오 로고 프리셋
                    </Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => customLogoInputRef.current?.click()}
                      sx={{ fontSize: '0.72rem', py: 0.3 }}
                    >
                      커스텀 로고
                    </Button>
                    <input
                      ref={customLogoInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCustomLogoUpload}
                    />
                  </Box>

                  {/* Logo Cards Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
                    {allLogos.map((logo) => {
                      const isSelected = selectedLogoId === logo.id;
                      const isCustom = logo.category === 'custom';

                      return (
                        <Box
                          key={logo.id}
                          onClick={() => {
                            setSelectedLogoId(logo.id);
                            if (logo.defaultText && !showText) {
                              setCustomText(logo.defaultText);
                            }
                            triggerSelectionBox();
                          }}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.8,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.light',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={logo.src}
                            alt={logo.name}
                            sx={{ width: 34, height: 34, objectFit: 'contain' }}
                          />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '0.72rem',
                              color: isSelected ? 'primary.dark' : 'text.primary',
                              textAlign: 'center',
                            }}
                          >
                            {logo.name}
                          </Typography>

                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckRoundedIcon sx={{ fontSize: 11 }} />
                            </Box>
                          )}

                          {isCustom && (
                            <Box
                              onClick={(e) => handleDeleteCustomLogo(e, logo.id)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'error.dark' },
                              }}
                            >
                              <CloseRoundedIcon sx={{ fontSize: 11 }} />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Tab 2. Style & Position */}
              {activeTab === 'style' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Opacity Slider */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        워터마크 투명도
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {Math.round(opacity * 100)}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={opacity}
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      onChange={(_, val) => {
                        setOpacity(val as number);
                        triggerSelectionBox();
                      }}
                    />
                  </Box>

                  {/* Scale Slider */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        크기 비율 (영상 대비)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {Math.round(scale * 100)}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={scale}
                      min={0.05}
                      max={0.4}
                      step={0.01}
                      onChange={(_, val) => {
                        setScale(val as number);
                        triggerSelectionBox();
                      }}
                    />
                  </Box>

                  {/* Rotation Slider & Quick Buttons */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        회전 각도
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {rotation}°
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={rotation}
                      min={0}
                      max={360}
                      step={5}
                      onChange={(_, val) => {
                        setRotation(val as number);
                        triggerSelectionBox();
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {[0, 90, 180, 270].map((deg) => (
                        <Button
                          key={deg}
                          size="small"
                          variant={rotation === deg ? 'contained' : 'outlined'}
                          onClick={() => {
                            setRotation(deg);
                            triggerSelectionBox();
                          }}
                          sx={{ flexGrow: 1, py: 0.3, fontSize: '0.72rem' }}
                        >
                          {deg}°
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* 9-Grid Position Presets */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      배치 위치 프리셋 (9방향 그리드)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                      {GRID_POSITION_OPTIONS.map((opt) => (
                        <Tooltip key={opt.id} title={opt.tooltip}>
                          <Button
                            variant={positionPreset === opt.id ? 'contained' : 'outlined'}
                            color={positionPreset === opt.id ? 'primary' : 'inherit'}
                            onClick={() => {
                              setPositionPreset(opt.id);
                              triggerSelectionBox();
                            }}
                            sx={{
                              py: 1,
                              fontSize: '1rem',
                              fontWeight: 700,
                              borderRadius: 1.5,
                            }}
                          >
                            {opt.label}
                          </Button>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>

                  {/* Free Coordinate Sliders */}
                  <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      자유 좌표 미세 조정 (X / Y)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="caption">
                          가로 X: {Math.round(customX * 100)}%
                        </Typography>
                        <Slider
                          size="small"
                          value={customX}
                          min={0}
                          max={1}
                          step={0.01}
                          onChange={(_, val) => {
                            setPositionPreset('custom');
                            setCustomX(val as number);
                            triggerSelectionBox();
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption">
                          세로 Y: {Math.round(customY * 100)}%
                        </Typography>
                        <Slider
                          size="small"
                          value={customY}
                          min={0}
                          max={1}
                          step={0.01}
                          onChange={(_, val) => {
                            setPositionPreset('custom');
                            setCustomY(val as number);
                            triggerSelectionBox();
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Tab 3. Hand-Drawn Marker Annotations */}
              {activeTab === 'annotation' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      손그림 마커 표기 (강조 효과)
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      onClick={() => setIsAnnotationModalOpen(true)}
                      startIcon={<TuneRoundedIcon fontSize="small" />}
                      sx={{ fontSize: '0.72rem', py: 0.3 }}
                    >
                      마커 세부 조절
                    </Button>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
                    <Button
                      variant={showLogoCircle ? 'contained' : 'outlined'}
                      color={showLogoCircle ? 'error' : 'inherit'}
                      onClick={() => {
                        setShowLogoCircle(!showLogoCircle);
                        triggerSelectionBox();
                      }}
                      startIcon={<RadioButtonUncheckedRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      동그라미
                    </Button>

                    <Button
                      variant={showLogoArrow ? 'contained' : 'outlined'}
                      color={showLogoArrow ? 'error' : 'inherit'}
                      onClick={() => {
                        setShowLogoArrow(!showLogoArrow);
                        triggerSelectionBox();
                      }}
                      startIcon={<NorthEastRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      화살표
                    </Button>

                    <Button
                      variant={showLogoSquare ? 'contained' : 'outlined'}
                      color={showLogoSquare ? 'error' : 'inherit'}
                      onClick={() => {
                        setShowLogoSquare(!showLogoSquare);
                        triggerSelectionBox();
                      }}
                      startIcon={<CropSquareRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      네모 박스
                    </Button>
                  </Box>

                  {/* Marker Color Palette */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      마커 색상 선택
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {PRESET_ANNOTATION_COLORS.map((col) => (
                        <Box
                          key={col}
                          onClick={() => {
                            setLogoAnnotationColor(col);
                            triggerSelectionBox();
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: col,
                            border: '2px solid',
                            borderColor: logoAnnotationColor === col ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: (theme) => theme.customShadows?.z4,
                            transform: logoAnnotationColor === col ? 'scale(1.15)' : 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          {logoAnnotationColor === col && (
                            <CheckRoundedIcon
                              sx={{
                                fontSize: 16,
                                color: col === '#FFFFFF' ? '#000000' : '#FFFFFF',
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Quick Thickness & Opacity Sliders */}
                  <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                        선 굵기 ({logoAnnotationLineWidth.toFixed(1)}x)
                      </Typography>
                      <Slider
                        size="small"
                        value={logoAnnotationLineWidth}
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        onChange={(_, val) => {
                          setLogoAnnotationLineWidth(val as number);
                          triggerSelectionBox();
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                        마커 투명도 ({Math.round(logoAnnotationOpacity * 100)}%)
                      </Typography>
                      <Slider
                        size="small"
                        value={logoAnnotationOpacity}
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        onChange={(_, val) => {
                          setLogoAnnotationOpacity(val as number);
                          triggerSelectionBox();
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Tab 4. Subtext & Prompt Overlay */}
              {activeTab === 'text' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      보조 문구 / 자막 각인
                    </Typography>
                    <Switch
                      checked={showText}
                      onChange={(e) => {
                        setShowText(e.target.checked);
                        triggerSelectionBox();
                      }}
                      color="primary"
                    />
                  </Box>

                  {showText && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        size="small"
                        label="각인 문구 입력"
                        value={customText}
                        onChange={(e) => {
                          setCustomText(e.target.value);
                          triggerSelectionBox();
                        }}
                        fullWidth
                      />

                      {/* Suggestion Chips */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: 'block', mb: 0.8 }}
                        >
                          추천 빠른 문구
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                          {PRESET_SUBTEXT_SUGGESTIONS.map((sug) => (
                            <Chip
                              key={sug}
                              label={sug}
                              size="small"
                              variant={customText === sug ? 'filled' : 'outlined'}
                              color={customText === sug ? 'primary' : 'default'}
                              onClick={() => {
                                setCustomText(sug);
                                triggerSelectionBox();
                              }}
                              sx={{ fontSize: '0.72rem' }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Font Color */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: 'block', mb: 0.8 }}
                        >
                          글자 색상
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {['#ffffff', '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'].map(
                            (c) => (
                              <Box
                                key={c}
                                onClick={() => {
                                  setTextColor(c);
                                  triggerSelectionBox();
                                }}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  bgcolor: c,
                                  border: '2px solid',
                                  borderColor: textColor === c ? 'primary.main' : 'divider',
                                  cursor: 'pointer',
                                }}
                              />
                            )
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 5. Export Video */}
              {activeTab === 'export' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    동영상 내보내기 설정
                  </Typography>

                  {/* Resolution Selector */}
                  <FormControl size="small" fullWidth>
                    <InputLabel>출력 해상도</InputLabel>
                    <Select
                      value={exportResolution}
                      label="출력 해상도"
                      onChange={(e) =>
                        setExportResolution(
                          e.target.value as 'original' | '1080p' | '720p' | '480p'
                        )
                      }
                    >
                      <MenuItem value="original">
                        원본 해상도 유지 ({metadata?.width}x{metadata?.height})
                      </MenuItem>
                      <MenuItem value="1080p">FHD 1080p (고화질)</MenuItem>
                      <MenuItem value="720p">HD 720p (표준화질)</MenuItem>
                      <MenuItem value="480p">SD 480p (용량 절약)</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Quality / Bitrate Selector */}
                  <FormControl size="small" fullWidth>
                    <InputLabel>화질 품질 (비트레이트)</InputLabel>
                    <Select
                      value={exportQuality}
                      label="화질 품질 (비트레이트)"
                      onChange={(e) =>
                        setExportQuality(e.target.value as 'high' | 'medium' | 'standard')
                      }
                    >
                      <MenuItem value="high">최고 화질 (8 Mbps, 선명함)</MenuItem>
                      <MenuItem value="medium">표준 화질 (5 Mbps, 권장)</MenuItem>
                      <MenuItem value="standard">절약 화질 (2.5 Mbps, 빠른 인코딩)</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Audio Mute Switch */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        오디오 음소거 (Mute)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        내보낼 비디오에서 소리를 제거합니다.
                      </Typography>
                    </Box>
                    <Switch
                      checked={exportMuteAudio}
                      onChange={(e) => setExportMuteAudio(e.target.checked)}
                    />
                  </Box>

                  {/* Trim Info Summary */}
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'primary.lighter' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                      ⏱ 내보내기 구간: {formatTime(trimRange[0])} ~{' '}
                      {formatTime(trimRange[1] || duration)} (총{' '}
                      {((trimRange[1] || duration) - trimRange[0]).toFixed(1)}초)
                    </Typography>
                  </Box>

                  {/* Start Export Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={handleStartExport}
                    disabled={isExporting}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: 2 }}
                  >
                    AI 워터마크 비디오 인코딩 & 저장
                  </Button>

                  {/* Download Result Link if available */}
                  {exportedResultUrl && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ShareRoundedIcon />}
                      onClick={() => setIsExportDialogOpen(true)}
                    >
                      완료된 인코딩 영상 다시 보기
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            {/* Bottom Actions Reset */}
            <Box
              sx={{
                p: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                bgcolor: 'background.neutral',
              }}
            >
              <Button
                size="small"
                color="inherit"
                startIcon={<RefreshRoundedIcon />}
                onClick={handleResetSettings}
              >
                워터마크 초기화
              </Button>
            </Box>
          </Card>
        </Box>
      )}

      {/* 3. Hand-Drawn Annotation Customization Dialog */}
      <Dialog
        open={isAnnotationModalOpen}
        onClose={() => setIsAnnotationModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>손그림 마커 표기 세부 설정</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              마커 크기 비율 ({logoAnnotationSize.toFixed(1)}x)
            </Typography>
            <Slider
              size="small"
              value={logoAnnotationSize}
              min={0.5}
              max={2.0}
              step={0.1}
              onChange={(_, val) => {
                setLogoAnnotationSize(val as number);
                triggerSelectionBox();
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              마커 선 굵기 ({logoAnnotationLineWidth.toFixed(1)}x)
            </Typography>
            <Slider
              size="small"
              value={logoAnnotationLineWidth}
              min={0.5}
              max={3.0}
              step={0.1}
              onChange={(_, val) => {
                setLogoAnnotationLineWidth(val as number);
                triggerSelectionBox();
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              마커 불투명도 ({Math.round(logoAnnotationOpacity * 100)}%)
            </Typography>
            <Slider
              size="small"
              value={logoAnnotationOpacity}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(_, val) => {
                setLogoAnnotationOpacity(val as number);
                triggerSelectionBox();
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setIsAnnotationModalOpen(false)}>
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Video Exporting / Progress / Result Dialog */}
      <Dialog
        open={isExportDialogOpen}
        onClose={() => {
          if (!isExporting) setIsExportDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isExporting ? '동영상 AI 워터마크 렌더링 중...' : '비디오 인코딩 완료!'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {isExporting ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{ height: 10, borderRadius: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  인코딩 진행률: {exportProgress}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  처리 시간: {exportElapsedSec.toFixed(1)}초 경과
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Web Audio & Canvas 엔진을 통해 원본 음향과 AI 워터마크를 합성하고 있습니다.
              </Typography>
            </Box>
          ) : exportedResultUrl ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                component="video"
                src={exportedResultUrl}
                controls
                autoPlay
                loop
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  borderRadius: 2,
                  bgcolor: '#000000',
                  objectFit: 'contain',
                }}
              />
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                ✓ 성공적으로 각인되었습니다. 아래 버튼을 눌러 저장하세요.
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {isExporting ? (
            <Button color="error" onClick={handleCancelExport}>
              인코딩 취소
            </Button>
          ) : (
            <>
              <Button color="inherit" onClick={() => setIsExportDialogOpen(false)}>
                닫기
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadResult}
              >
                비디오 다운로드 (.webm)
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
