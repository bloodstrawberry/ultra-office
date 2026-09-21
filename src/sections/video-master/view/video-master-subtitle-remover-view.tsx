'use client';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Replay5RoundedIcon from '@mui/icons-material/Replay5Rounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Forward5RoundedIcon from '@mui/icons-material/Forward5Rounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { SUBTITLE_REMOVER_VIDEO_SAMPLES } from '../data/video-samples';
import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import { SubtitleRemoverTimelineTrack } from '../components/subtitle-remover-timeline-track';
import {
  isPointInBox,
  type InpaintMode,
  isBoxOverlapping,
  getSubtitleBoxHit,
  type SubtitlePreset,
  adjustBoxTimeMargin,
  getPresetSubtitleBox,
  type SubtitleBoxHitType,
  type VideoExportSettings,
  type SubtitleBoundingBox,
  exportSubtitleRemovedVideo,
  type InpaintSampleDirection,
  applySubtitleRemovalToCanvas,
  type SubtitleRemoverRenderOptions,
  detectTimeVaryingSubtitlesAcrossVideo,
} from '../utils/video-subtitle-remover-processor';

// ----------------------------------------------------------------------

interface VideoMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  aspectRatio: string;
}

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

export function VideoMasterSubtitleRemoverView() {
  // Video Source & Metadata
  const [, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Subtitle Boxes State
  const [boxes, setBoxes] = useState<SubtitleBoundingBox[]>([
    getPresetSubtitleBox('bottom-center', '1'),
  ]);
  const [activeBoxId, setActiveBoxId] = useState<string | null>('box-1');

  // Removal & Inpaint Settings
  const [inpaintMode, setInpaintMode] = useState<InpaintMode>('hybrid');
  const [sampleDirection, setSampleDirection] = useState<InpaintSampleDirection>('vertical');
  const [feather, setFeather] = useState<number>(14);
  const [padding, setPadding] = useState<number>(6);
  const [grainStrength, setGrainStrength] = useState<number>(4);
  const [brightnessOffset, setBrightnessOffset] = useState<number>(0);
  const [blendStrength, setBlendStrength] = useState<number>(1.0);
  const [blurRadius, setBlurRadius] = useState<number>(16);
  const [sensitivity] = useState<'low' | 'medium' | 'high'>('medium');

  // Preview Modes
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [showBoxOutline, setShowBoxOutline] = useState<boolean>(true);
  const [showCompareSplit, setShowCompareSplit] = useState<boolean>(false);
  const [splitPercent, setSplitPercent] = useState<number>(50);

  // Detection Status & Options
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectProgress, setDetectProgress] = useState<number>(0);
  const [detectSearchZone, setDetectSearchZone] = useState<'bottom' | 'all'>('bottom');
  const [hasRunAiDetect, setHasRunAiDetect] = useState<boolean>(false);

  // Export Dialog State
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportSettings, setExportSettings] = useState<VideoExportSettings>({
    startTime: 0,
    endTime: 0,
    resolution: 'original',
    quality: 'high',
    muteAudio: false,
    format: 'mp4',
  });

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Interactive Drag & Resize Tracking
  const isInteractingRef = useRef<boolean>(false);
  const dragHandleRef = useRef<SubtitleBoxHitType | null>(null);
  const startMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startBoxStateRef = useRef<SubtitleBoundingBox | null>(null);

  // --------------------------------------------------------------------
  // Load Video File
  // --------------------------------------------------------------------
  const handleFileSelect = useCallback(
    (file: File) => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);
      setExportedVideoUrl(null);
      setHasRunAiDetect(false);

      // Initial placeholder metadata
      setMetadata({
        name: file.name,
        size: file.size,
        width: 1280,
        height: 720,
        duration: 0,
        aspectRatio: '16:9',
      });
    },
    [videoUrl]
  );

  // Video Loaded Metadata Handler
  const handleVideoMetadataLoaded = () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const dur = video.duration || 0;
    const gcdVal = (a: number, b: number): number => (b === 0 ? a : gcdVal(b, a % b));
    const div = gcdVal(w, h);
    const aspect = div > 0 ? `${w / div}:${h / div}` : '16:9';

    setDuration(dur);
    setMetadata((prev) => ({
      name: prev?.name || '영상',
      size: prev?.size || 0,
      width: w,
      height: h,
      duration: dur,
      aspectRatio: aspect,
    }));

    setExportSettings((prev) => ({
      ...prev,
      startTime: 0,
      endTime: dur,
    }));

    // Auto fit initial subtitle box
    const defaultBox = getPresetSubtitleBox('bottom-center', '1');
    setBoxes([defaultBox]);
    setActiveBoxId(defaultBox.id);

    // Render first frame immediately
    requestAnimationFrame(() => {
      renderCurrentFrame();
    });
  };

  // --------------------------------------------------------------------
  // Render Frame onto Canvas
  // --------------------------------------------------------------------
  const renderCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const renderOpts: SubtitleRemoverRenderOptions = {
      boxes,
      activeBoxId,
      defaultMode: inpaintMode,
      showBoxOutline,
      showOriginal,
      showCompareSplit,
      splitPercent,
      currentTime: video.currentTime,
    };

    applySubtitleRemovalToCanvas(ctx, video, renderOpts);
  }, [
    boxes,
    activeBoxId,
    inpaintMode,
    showBoxOutline,
    showOriginal,
    showCompareSplit,
    splitPercent,
  ]);

  // Continuous loop while playing
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (videoRef.current && !videoRef.current.paused) {
        setCurrentTime(videoRef.current.currentTime);
        renderCurrentFrame();
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    } else {
      renderCurrentFrame();
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, renderCurrentFrame]);

  // Update canvas on parameter changes when paused
  useEffect(() => {
    if (!isPlaying) {
      renderCurrentFrame();
    }
  }, [
    isPlaying,
    boxes,
    activeBoxId,
    inpaintMode,
    feather,
    padding,
    showOriginal,
    showBoxOutline,
    showCompareSplit,
    splitPercent,
    renderCurrentFrame,
  ]);

  // --------------------------------------------------------------------
  // Playback Control Handlers
  // --------------------------------------------------------------------
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    renderCurrentFrame();
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const val = Number(value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const skipSeconds = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + sec)
    );
    setCurrentTime(videoRef.current.currentTime);
    renderCurrentFrame();
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // --------------------------------------------------------------------
  // Subtitle Detection Actions
  // --------------------------------------------------------------------
  const handleSmartAutoDetect = async () => {
    const video = videoRef.current;
    if (!video) {
      toast.error('먼저 동영상을 업로드해 주세요.');
      return;
    }

    setIsDetecting(true);
    setDetectProgress(0);
    const wasPlaying = !video.paused;
    if (wasPlaying) video.pause();

    try {
      toast.info('동영상 전구간의 시간대별 자막 위치를 정밀 스캔 중입니다...');
      const detectedSegments = await detectTimeVaryingSubtitlesAcrossVideo(video, {
        sensitivity,
        searchZone: detectSearchZone,
        onProgress: (pct) => setDetectProgress(pct),
      });

      if (detectedSegments.length > 0) {
        const segmentsWithSettings = detectedSegments.map((s) => ({
          ...s,
          mode: inpaintMode,
          feather,
          padding,
        }));

        setBoxes(segmentsWithSettings);
        setActiveBoxId(segmentsWithSettings[0]?.id || null);
        setHasRunAiDetect(true);

        toast.success(
          `🎉 AI 1차 자동 자막 제거 완료! 총 ${segmentsWithSettings.length}개 구간의 자막을 찾아 지워두었습니다. 이제 영상을 보며 미세 조정하거나 자막이 아닌 부분을 지우세요.`
        );

        // Auto-play from start so user immediately watches the result!
        video.currentTime = 0;
        setCurrentTime(0);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        }, 150);
      } else {
        toast.info('자막 텍스트가 뚜렷하지 않아 기본 하단 자막 영역을 적용합니다.');
        setBoxes([getPresetSubtitleBox('bottom-center', '1')]);
      }
    } catch {
      toast.error('자막 자동 감지 중 오류가 발생했습니다. 기본 프리셋을 적용합니다.');
      setBoxes([getPresetSubtitleBox('bottom-center', '1')]);
    } finally {
      setIsDetecting(false);
      renderCurrentFrame();
    }
  };

  const handleApplyPreset = (preset: SubtitlePreset) => {
    const newBox = getPresetSubtitleBox(preset, `${Date.now()}`);
    newBox.mode = inpaintMode;
    newBox.feather = feather;
    newBox.padding = padding;

    setBoxes((prev) => [...prev.filter((b) => b.id !== activeBoxId), newBox]);
    setActiveBoxId(newBox.id);
    toast.success(`'${newBox.label}' 영역이 적용되었습니다.`);
  };

  const handleAddBox = () => {
    const newId = `box-${Date.now()}`;
    const newBox: SubtitleBoundingBox = {
      id: newId,
      label: `자막 영역 ${boxes.length + 1}`,
      x: 0.15,
      y: 0.8,
      width: 0.7,
      height: 0.12,
      feather: 14,
      padding: 6,
      mode: inpaintMode,
      startTime: 0,
      endTime: duration || 99999,
      enabled: true,
    };
    setBoxes((prev) => [...prev, newBox]);
    setActiveBoxId(newId);
    toast.success('새로운 자막 제거 영역이 추가되었습니다.');
  };

  // Timeline Action Handlers
  const handleUpdateBoxTime = (id: string, startTime: number, endTime: number) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, startTime, endTime } : b))
    );
    renderCurrentFrame();
  };

  const handleAddBoxAtCurrentTime = () => {
    const newId = `box-${Date.now()}`;
    const startT = Number(currentTime.toFixed(2));
    const endT = Math.min(
      duration || startT + 2.5,
      Number((startT + 2.5).toFixed(2))
    );

    const newBox: SubtitleBoundingBox = {
      id: newId,
      label: `자막 영역 ${boxes.length + 1}`,
      x: 0.15,
      y: 0.78,
      width: 0.7,
      height: 0.14,
      feather: 14,
      padding: 6,
      mode: inpaintMode,
      sampleDirection: 'vertical',
      startTime: startT,
      endTime: endT,
      enabled: true,
    };

    setBoxes((prev) => [...prev, newBox]);
    setActiveBoxId(newId);
    toast.success(
      `현재 재생 시점(${startT.toFixed(1)}초)에 새로운 자막 지우개 클립이 추가되었습니다.`
    );
    renderCurrentFrame();
  };

  const handleSplitBoxAtCurrentTime = (id: string) => {
    const target = boxes.find((b) => b.id === id);
    if (!target) return;

    const s = target.startTime || 0;
    const e = target.endTime ?? (duration || 99999);
    const splitT = Number(currentTime.toFixed(2));

    if (splitT <= s + 0.15 || splitT >= e - 0.15) {
      toast.warning('자막 클립 내부에서만 분할할 수 있습니다.');
      return;
    }

    const firstBox: SubtitleBoundingBox = {
      ...target,
      endTime: splitT,
      label: `${target.label} (파트 1)`,
    };

    const secondBox: SubtitleBoundingBox = {
      ...target,
      id: `box-${Date.now()}`,
      startTime: splitT,
      label: `${target.label} (파트 2)`,
    };

    setBoxes((prev) =>
      prev.flatMap((b) => (b.id === id ? [firstBox, secondBox] : [b]))
    );
    setActiveBoxId(secondBox.id);
    toast.success(
      `${splitT.toFixed(1)}초 위치에서 자막 클립이 2개로 분할되었습니다.`
    );
    renderCurrentFrame();
  };

  const handleTimelineSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.max(0, Math.min(duration || 100, time));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    renderCurrentFrame();
  };

  const handleSelectBoxFromTimeline = (id: string) => {
    setActiveBoxId(id);
    const target = boxes.find((b) => b.id === id);
    if (target && target.startTime !== undefined && videoRef.current) {
      const s = Math.max(0, target.startTime);
      videoRef.current.currentTime = s;
      setCurrentTime(s);
    }
    renderCurrentFrame();
  };

  const handleDeleteActiveBox = () => {
    if (boxes.length === 0 || !activeBox) return;
    const deletedLabel = activeBox.label;
    const nextBoxes = boxes.filter((b) => b.id !== activeBox.id);
    setBoxes(nextBoxes);
    setActiveBoxId(nextBoxes[0]?.id || null);
    toast.info(`'${deletedLabel}' 구간(자막 아님)을 삭제했습니다.`);
    renderCurrentFrame();
  };

  const handleDeleteBoxById = (id: string) => {
    const target = boxes.find((b) => b.id === id);
    const nextBoxes = boxes.filter((b) => b.id !== id);
    setBoxes(nextBoxes);
    if (activeBoxId === id) {
      setActiveBoxId(nextBoxes[0]?.id || null);
    }
    toast.info(`'${target?.label || '선택한 구간'}' (자막 아님)을 삭제했습니다.`);
    renderCurrentFrame();
  };

  const handleClearAllBoxes = () => {
    setBoxes([]);
    setActiveBoxId(null);
    toast.info('모든 자막 구간을 비웠습니다. (동영상 원본 100% 보존)');
    renderCurrentFrame();
  };

  const activeBox =
    (activeBoxId ? boxes.find((b) => b.id === activeBoxId) : null) || boxes[0] || null;

  // Sync active box settings to local UI controls  // Sync inpainting parameter sliders whenever user switches active box
  useEffect(() => {
    const box = boxes.find((b) => b.id === activeBoxId);
    if (box) {
      if (box.mode) setInpaintMode(box.mode);
      if (box.sampleDirection) setSampleDirection(box.sampleDirection);
      if (box.feather !== undefined) setFeather(box.feather);
      if (box.padding !== undefined) setPadding(box.padding);
      if (box.grainStrength !== undefined) setGrainStrength(box.grainStrength);
      if (box.brightnessOffset !== undefined) setBrightnessOffset(box.brightnessOffset);
      if (box.blendStrength !== undefined) setBlendStrength(box.blendStrength);
      if (box.blurRadius !== undefined) setBlurRadius(box.blurRadius);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBoxId]);

  // Find all boxes that geometrically overlap with the active box
  const overlappingBoxes = useMemo(() => {
    if (!activeBox) return [];
    return boxes.filter((b) => b.id !== activeBox.id && isBoxOverlapping(b, activeBox));
  }, [activeBox, boxes]);

  // Delete all boxes overlapping with active box (e.g. hair/forehead false-positive cluster)
  const handleDeleteOverlappingBoxes = () => {
    if (!activeBox) return;
    const targets = boxes.filter((b) => isBoxOverlapping(b, activeBox));
    if (targets.length === 0) return;

    const count = targets.length;
    const nextBoxes = boxes.filter((b) => !targets.some((t) => t.id === b.id));
    setBoxes(nextBoxes);
    setActiveBoxId(nextBoxes[0]?.id || null);
    toast.success(`이 위치의 오탐지 자막 구간 ${count}개를 모두 일괄 삭제했습니다.`);
    renderCurrentFrame();
  };

  // Keyboard shortcut: Delete or Backspace to immediately delete active subtitle box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && activeBox) {
        e.preventDefault();
        handleDeleteActiveBox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBox, boxes]);

  const updateActiveBox = (updates: Partial<SubtitleBoundingBox>) => {
    if (!activeBox) return;
    setBoxes((prev) => prev.map((b) => (b.id === activeBox.id ? { ...b, ...updates } : b)));
  };

  // Adjust active box time margin (extend/trim start and end times)
  const handleAdjustActiveBoxTime = (
    deltaStart: number,
    deltaEnd: number,
    seekTo?: 'start' | 'end'
  ) => {
    if (!activeBox) return;
    const updated = adjustBoxTimeMargin(activeBox, deltaStart, deltaEnd, duration);
    updateActiveBox({ startTime: updated.startTime, endTime: updated.endTime });
    if (seekTo && videoRef.current) {
      const targetTime = seekTo === 'start' ? updated.startTime : updated.endTime;
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      renderCurrentFrame();
    }
    toast.success(
      `구간 시간 조정 완료: ${formatTime(updated.startTime)} ~ ${formatTime(updated.endTime)}`
    );
  };

  // Set active box start or end time directly from video current playback position
  const handleSetActiveBoxTimeFromCurrent = (type: 'start' | 'end') => {
    if (!activeBox || !videoRef.current) return;
    const cur = Number(videoRef.current.currentTime.toFixed(2));
    if (type === 'start') {
      const newStart = Math.min(cur, Math.max(0, activeBox.endTime - 0.1));
      updateActiveBox({ startTime: Math.max(0, newStart) });
      toast.success(`시작 시간을 현재 시점(${formatTime(newStart)})으로 설정했습니다.`);
    } else {
      const newEnd = Math.max(cur, activeBox.startTime + 0.1);
      updateActiveBox({ endTime: Math.min(duration || 99999, newEnd) });
      toast.success(`종료 시간을 현재 시점(${formatTime(newEnd)})으로 설정했습니다.`);
    }
  };

  // Adjust all subtitle boxes with extra margin
  const handleAdjustAllBoxesTime = (deltaStart: number, deltaEnd: number) => {
    setBoxes((prev) => prev.map((b) => adjustBoxTimeMargin(b, deltaStart, deltaEnd, duration)));
    renderCurrentFrame();
    const signS =
      deltaStart < 0 ? `앞으로 ${Math.abs(deltaStart)}초 당김` : `앞으로 +${deltaStart}초`;
    const signE = deltaEnd > 0 ? `뒤로 ${deltaEnd}초 연장` : `뒤로 ${deltaEnd}초`;
    toast.success(`모든 자막 구간에 시간 여유를 적용했습니다. (${signS}, ${signE})`);
  };

  // Adjust a specific box by ID
  const handleAdjustBoxById = (boxId: string, deltaStart: number, deltaEnd: number) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? adjustBoxTimeMargin(b, deltaStart, deltaEnd, duration) : b))
    );
    renderCurrentFrame();
    toast.success('해당 구간의 시간을 조정했습니다.');
  };

  // --------------------------------------------------------------------
  // Interactive Canvas Mouse Drag & Resize Handlers
  // --------------------------------------------------------------------
  const getCanvasEventCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || boxes.length === 0) return;

    const { x, y } = getCanvasEventCoords(e);

    // 1. Direct click on [✕ 삭제] badge button of ANY box
    for (const box of boxes) {
      const hit = getSubtitleBoxHit(box, canvas.width, canvas.height, x, y);
      if (hit === 'delete') {
        handleDeleteBoxById(box.id);
        return;
      }
    }

    // 2. Active box corner/edge resize handle click
    if (activeBox) {
      const activeHit = getSubtitleBoxHit(activeBox, canvas.width, canvas.height, x, y);
      if (activeHit && activeHit !== 'delete' && activeHit !== 'move' && activeHit !== 'body') {
        isInteractingRef.current = true;
        dragHandleRef.current = activeHit;
        startMousePosRef.current = { x, y };
        startBoxStateRef.current = { ...activeBox };
        return;
      }
    }

    // 3. Click-to-select subtitle box across all boxes on canvas
    const hitBoxes = boxes.filter((b) => isPointInBox(x, y, b, canvas.width, canvas.height));
    if (hitBoxes.length > 0) {
      // If current activeBox is already in hitBoxes and multiple boxes overlap, cycle to next
      let targetBox = hitBoxes[0];
      if (activeBox && hitBoxes.some((b) => b.id === activeBox.id) && hitBoxes.length > 1) {
        const curIdx = hitBoxes.findIndex((b) => b.id === activeBox.id);
        targetBox = hitBoxes[(curIdx + 1) % hitBoxes.length];
      }

      setActiveBoxId(targetBox.id);

      // Seek video to target box start time if video is paused and outside the box's time range
      if (
        videoRef.current &&
        videoRef.current.paused &&
        (videoRef.current.currentTime < targetBox.startTime ||
          videoRef.current.currentTime > targetBox.endTime)
      ) {
        videoRef.current.currentTime = targetBox.startTime;
        setCurrentTime(targetBox.startTime);
      }

      isInteractingRef.current = true;
      dragHandleRef.current = 'move';
      startMousePosRef.current = { x, y };
      startBoxStateRef.current = { ...targetBox };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || boxes.length === 0) return;

    const { x, y } = getCanvasEventCoords(e);

    // Update cursor based on hover handle when not interacting
    if (!isInteractingRef.current) {
      // Check if hovering over any delete button
      const isOverDeleteBtn = boxes.some(
        (b) => getSubtitleBoxHit(b, canvas.width, canvas.height, x, y) === 'delete'
      );
      if (isOverDeleteBtn) {
        canvas.style.cursor = 'pointer';
        return;
      }

      // Check active box resize handles
      if (activeBox) {
        const hit = getSubtitleBoxHit(activeBox, canvas.width, canvas.height, x, y);
        if (hit === 'move' || hit === 'body') {
          canvas.style.cursor = 'move';
          return;
        }
        if (hit === 'nw' || hit === 'se') {
          canvas.style.cursor = 'nwse-resize';
          return;
        }
        if (hit === 'ne' || hit === 'sw') {
          canvas.style.cursor = 'nesw-resize';
          return;
        }
        if (hit === 'n' || hit === 's') {
          canvas.style.cursor = 'ns-resize';
          return;
        }
        if (hit === 'w' || hit === 'e') {
          canvas.style.cursor = 'ew-resize';
          return;
        }
      }

      // Check if hovering over any other subtitle box (clickable to select)
      const isOverAnyBox = boxes.some((b) => isPointInBox(x, y, b, canvas.width, canvas.height));
      if (isOverAnyBox) {
        canvas.style.cursor = 'pointer';
        return;
      }

      canvas.style.cursor = 'default';
      return;
    }

    // Drag / Resize calculation
    const startBox = startBoxStateRef.current;
    const startMouse = startMousePosRef.current;
    const handle = dragHandleRef.current;
    if (!startBox || !handle) return;

    const dx = (x - startMouse.x) / canvas.width;
    const dy = (y - startMouse.y) / canvas.height;

    let nextX = startBox.x;
    let nextY = startBox.y;
    let nextW = startBox.width;
    let nextH = startBox.height;

    if (handle === 'move' || handle === 'body') {
      nextX = Math.max(0, Math.min(1 - nextW, startBox.x + dx));
      nextY = Math.max(0, Math.min(1 - nextH, startBox.y + dy));
    } else {
      // Resizing
      if (handle.includes('w')) {
        const potentialW = startBox.width - dx;
        if (potentialW >= 0.05) {
          nextX = startBox.x + dx;
          nextW = potentialW;
        }
      }
      if (handle.includes('e')) {
        nextW = Math.max(0.05, Math.min(1 - nextX, startBox.width + dx));
      }
      if (handle.includes('n')) {
        const potentialH = startBox.height - dy;
        if (potentialH >= 0.03) {
          nextY = startBox.y + dy;
          nextH = potentialH;
        }
      }
      if (handle.includes('s')) {
        nextH = Math.max(0.03, Math.min(1 - nextY, startBox.height + dy));
      }
    }

    updateActiveBox({
      x: Number(nextX.toFixed(4)),
      y: Number(nextY.toFixed(4)),
      width: Number(nextW.toFixed(4)),
      height: Number(nextH.toFixed(4)),
    });
  };

  const handleCanvasMouseUp = () => {
    isInteractingRef.current = false;
    dragHandleRef.current = null;
    startBoxStateRef.current = null;
  };

  // --------------------------------------------------------------------
  // Video Export Handler
  // --------------------------------------------------------------------
  const handleStartExport = async () => {
    if (!videoUrl || !metadata) {
      toast.error('동영상을 먼저 불러와 주세요.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportElapsedSec(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const activeBoxesClean = boxes.map((b) => ({
      ...b,
      feather: b.feather ?? feather,
      padding: b.padding ?? padding,
      mode: b.mode ?? inpaintMode,
      sampleDirection: b.sampleDirection ?? sampleDirection,
      grainStrength: b.grainStrength ?? grainStrength,
      brightnessOffset: b.brightnessOffset ?? brightnessOffset,
      blendStrength: b.blendStrength ?? blendStrength,
      blurRadius: b.blurRadius ?? blurRadius,
    }));

    const renderOpts: SubtitleRemoverRenderOptions = {
      boxes: activeBoxesClean,
      defaultMode: inpaintMode,
      showBoxOutline: false,
      showOriginal: false,
      showCompareSplit: false,
      currentTime: 0,
    };

    try {
      toast.info('자막 제거 영상 렌더링을 시작합니다. 잠시만 기다려 주세요...');
      const outputBlob = await exportSubtitleRemovedVideo(
        videoUrl,
        renderOpts,
        {
          ...exportSettings,
          startTime: Math.max(0, exportSettings.startTime),
          endTime: exportSettings.endTime > 0 ? exportSettings.endTime : metadata.duration,
        },
        (progress, elapsed) => {
          setExportProgress(progress);
          setExportElapsedSec(elapsed);
        },
        abortController.signal
      );

      const downloadUrl = URL.createObjectURL(outputBlob);
      setExportedVideoUrl(downloadUrl);
      toast.success('🎉 자막이 깨끗하게 제거된 동영상이 완성되었습니다!');
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('취소') || (err as Error)?.message?.includes('중단')) {
        toast.info('동영상 내보내기가 취소되었습니다.');
      } else {
        toast.error('동영상 내보내기 중 오류가 발생했습니다.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExporting(false);
  };

  const handleDownloadExportedVideo = () => {
    if (!exportedVideoUrl) return;
    const a = document.createElement('a');
    a.href = exportedVideoUrl;
    const baseName = metadata?.name.replace(/\.[^/.]+$/, '') || 'video';
    const ext = exportSettings.format === 'webm' ? 'webm' : 'mp4';
    a.download = `${baseName}_subtitle_removed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('비디오 파일 다운로드가 시작되었습니다.');
  };

  // --------------------------------------------------------------------
  // 1. Initial State: Upload Workspace
  // --------------------------------------------------------------------
  if (!videoUrl) {
    return (
      <DashboardContent
        maxWidth={false}
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, md: 3 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: (theme) =>
                  theme.customShadows?.primary || '0 8px 16px rgba(0, 167, 111, 0.24)',
              }}
            >
              <CleaningServicesRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                동영상 자막 지우개 (Video Subtitle Remover)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                동영상에 각인(하드코딩)된 방송·영화·유튜브 자막을 AI 스마트 인페인팅으로 흔적 없이
                자연스럽게 지워드립니다.
              </Typography>
            </Box>
          </Box>
        </Box>

        <VideoUploadWorkspace
          title="자막을 지울 동영상 업로드"
          subtitle="MP4, WebM, MOV 등 동영상 파일을 드래그하거나 선택하세요. 모든 작업은 브라우저 로컬에서 안전하게 처리됩니다."
          sampleTitle="⚡ 즉석 테스트 샘플 자막 동영상"
          sampleSubtitle="클릭 한 번으로 하단 뉴스 자막이나 영화 시네마 자막이 각인된 샘플 영상을 즉시 테스트해 보세요."
          sampleVideos={SUBTITLE_REMOVER_VIDEO_SAMPLES}
          onFileSelect={handleFileSelect}
          icon={<CleaningServicesRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />}
          buttonText="동영상 파일 선택하기"
        />
      </DashboardContent>
    );
  }

  // --------------------------------------------------------------------
  // 2. Main Studio Workspace: 2-Column Full-Screen Viewport
  // --------------------------------------------------------------------
  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.5, md: 2 },
        overflow: 'hidden',
      }}
    >
      {/* Hidden Video element for source playback */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={handleVideoMetadataLoaded}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.5,
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <CleaningServicesRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                동영상 자막 지우개
              </Typography>
              {metadata && (
                <Chip
                  label={`${metadata.width}x${metadata.height} (${metadata.aspectRatio}) · ${formatTime(duration)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {metadata ? `${metadata.name} (${formatBytes(metadata.size)})` : '로딩 중...'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadRoundedIcon />}
            onClick={() => {
              if (videoUrl) URL.revokeObjectURL(videoUrl);
              setVideoUrl(null);
              setVideoFile(null);
            }}
          >
            다른 영상 열기
          </Button>

          <Button
            variant="contained"
            size="small"
            disabled={isDetecting}
            startIcon={
              isDetecting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AutoFixHighRoundedIcon />
              )
            }
            onClick={handleSmartAutoDetect}
            sx={{
              fontWeight: 800,
              px: 2,
              background: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(121, 40, 202, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6821b0 0%, #d9006c 100%)',
              },
            }}
          >
            {isDetecting ? `AI 1차 분석 중... (${detectProgress}%)` : '⚡ AI 1차 자동 자막 제거'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => setExportModalOpen(true)}
            sx={{ fontWeight: 700, px: 2 }}
          >
            자막 제거 영상 내보내기
          </Button>
        </Box>
      </Box>

      {/* Main Studio Body: Left Canvas Viewport & Right Inspector Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left: Video Player & Inpainting Canvas Viewport */}
        <Box
          sx={{
            flex: { xs: 'none', lg: 7 },
            height: { xs: '55vh', lg: '100%' },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#090d16',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
          }}
        >
          {/* Canvas Viewport Container */}
          <Box
            ref={previewContainerRef}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              p: 1.5,
              userSelect: 'none',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
              }}
            />

            {/* Quick Before/After Comparison Overlay Button & AI Primary Button */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2,
                p: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 5,
              }}
            >
              {/* AI 1-Click Primary Auto Clean Button */}
              <Button
                size="small"
                variant="contained"
                disabled={isDetecting}
                startIcon={
                  isDetecting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />
                  )
                }
                onClick={handleSmartAutoDetect}
                sx={{
                  height: 28,
                  fontSize: 11,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(121, 40, 202, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6821b0 0%, #d9006c 100%)',
                  },
                }}
              >
                {isDetecting ? `AI 분석 중... (${detectProgress}%)` : '⚡ AI 1차 자동 작업'}
              </Button>

              {activeBox && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={handleDeleteActiveBox}
                    sx={{
                      height: 28,
                      fontSize: 11,
                      fontWeight: 800,
                      borderColor: 'rgba(255, 86, 48, 0.6)',
                      color: '#ff5630',
                      '&:hover': {
                        borderColor: '#ff5630',
                        bgcolor: 'rgba(255, 86, 48, 0.12)',
                      },
                    }}
                  >
                    자막 아님 (삭제)
                  </Button>
                  {overlappingBoxes.length > 0 && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 14 }} />}
                      onClick={handleDeleteOverlappingBoxes}
                      sx={{
                        height: 28,
                        fontSize: 11,
                        fontWeight: 800,
                        bgcolor: '#ff5630',
                        color: '#ffffff',
                        '&:hover': { bgcolor: '#b71d18' },
                      }}
                    >
                      이 위치 전체 삭제 ({overlappingBoxes.length + 1}개)
                    </Button>
                  )}
                </>
              )}

              <Button
                size="small"
                variant={showOriginal ? 'contained' : 'text'}
                color={showOriginal ? 'warning' : 'inherit'}
                startIcon={showOriginal ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
                onClick={() => setShowOriginal(!showOriginal)}
                sx={{
                  height: 28,
                  fontSize: 12,
                  fontWeight: 700,
                  color: showOriginal ? '#000000' : '#ffffff',
                }}
              >
                {showOriginal ? '원본 확인 중' : '원본 비교'}
              </Button>
            </Box>

            {/* Active Mode Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Chip
                icon={
                  <AutoAwesomeRoundedIcon
                    sx={{ fontSize: '14px !important', color: '#ffffff !important' }}
                  />
                }
                label={
                  showOriginal
                    ? '원본 영상'
                    : inpaintMode === 'hybrid'
                      ? 'AI 스마트 배경 복원 적용됨'
                      : inpaintMode === 'color-fill'
                        ? '주변색 적응형 융합 적용됨'
                        : '가우시안 블러 적용됨'
                }
                size="small"
                sx={{
                  bgcolor: showOriginal ? 'warning.main' : 'primary.main',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 11,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              />
            </Box>

            {/* Initial 1st-stage AI Prompt Floating Banner */}
            {!hasRunAiDetect && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 56,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'rgba(15, 23, 42, 0.94)',
                  backdropFilter: 'blur(12px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2.5,
                  border: '1px solid rgba(121, 40, 202, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  zIndex: 6,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#ffffff', fontWeight: 800, fontSize: 12 }}
                  >
                    ✨ 먼저 1차적으로 AI가 자막을 분석하고 지워두도록 해보세요
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400', fontSize: 10 }}>
                    동영상 전체를 스캔하여 모든 시간대의 자막을 자동으로 깔끔하게 지워둡니다.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  disabled={isDetecting}
                  startIcon={
                    isDetecting ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <AutoFixHighRoundedIcon />
                    )
                  }
                  onClick={handleSmartAutoDetect}
                  sx={{
                    fontWeight: 800,
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                    color: '#ffffff',
                    px: 1.5,
                    height: 28,
                    '&:hover': { background: 'linear-gradient(135deg, #6821b0 0%, #d9006c 100%)' },
                  }}
                >
                  {isDetecting
                    ? `AI 분석 중... (${detectProgress}%)`
                    : '지금 AI 1차 자동 작업 시작'}
                </Button>
              </Box>
            )}

            {/* Bottom Floating Quick Action Pill Banner */}
            {activeBox && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  px: 1.6,
                  py: 0.6,
                  borderRadius: 20,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  zIndex: 5,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#ffffff', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}
                >
                  선택됨: <span style={{ color: '#00A76F' }}>{activeBox.label}</span> (
                  {formatTime(activeBox.startTime)} ~ {formatTime(activeBox.endTime)})
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteRoundedIcon sx={{ fontSize: 13 }} />}
                  onClick={handleDeleteActiveBox}
                  sx={{
                    height: 24,
                    fontSize: 11,
                    fontWeight: 800,
                    px: 1,
                    py: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  자막 아님 (삭제)
                </Button>
                {overlappingBoxes.length > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 13 }} />}
                    onClick={handleDeleteOverlappingBoxes}
                    sx={{
                      height: 24,
                      fontSize: 11,
                      fontWeight: 800,
                      px: 1,
                      py: 0,
                      bgcolor: '#ff5630',
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#b71d18' },
                    }}
                  >
                    이 위치 겹친 {overlappingBoxes.length + 1}개 일괄 삭제
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Bottom Player Control Bar */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* Video Editor Style Interactive Subtitle Mask Timeline Track Panel */}
            <SubtitleRemoverTimelineTrack
              boxes={boxes}
              activeBoxId={activeBoxId}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={handleTimelineSeek}
              onSelectBox={handleSelectBoxFromTimeline}
              onUpdateBoxTime={handleUpdateBoxTime}
              onAddBoxAtCurrentTime={handleAddBoxAtCurrentTime}
              onSplitBoxAtCurrentTime={handleSplitBoxAtCurrentTime}
              onDeleteBox={handleDeleteBoxById}
              onTogglePlay={togglePlay}
            />

            {/* Playback Buttons & Audio Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={togglePlay}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                </IconButton>

                <Tooltip title="5초 뒤로">
                  <IconButton
                    size="small"
                    onClick={() => skipSeconds(-5)}
                    sx={{ color: 'grey.300' }}
                  >
                    <Replay5RoundedIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="5초 앞으로">
                  <IconButton
                    size="small"
                    onClick={() => skipSeconds(5)}
                    sx={{ color: 'grey.300' }}
                  >
                    <Forward5RoundedIcon />
                  </IconButton>
                </Tooltip>

                {/* Volume slider */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                  <IconButton size="small" onClick={toggleMute} sx={{ color: 'grey.300' }}>
                    {isMuted || volume === 0 ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
                  </IconButton>
                  <Slider
                    size="small"
                    value={isMuted ? 0 : volume}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={handleVolumeChange}
                    sx={{ width: 70, color: 'grey.400' }}
                  />
                </Box>
              </Box>

              {/* View options: Split slider & Outline toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showBoxOutline}
                      onChange={(e) => setShowBoxOutline(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: 'grey.300', fontWeight: 600 }}>
                      자막 영역 박스 표시
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showCompareSplit}
                      onChange={(e) => setShowCompareSplit(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: 'grey.300', fontWeight: 600 }}>
                      좌우 분할 비교 (Split)
                    </Typography>
                  }
                />

                {showCompareSplit && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                    <Slider
                      size="small"
                      value={splitPercent}
                      min={10}
                      max={90}
                      onChange={(_, v) => setSplitPercent(Number(v))}
                      sx={{ color: 'primary.main' }}
                    />
                  </Box>
                )}

                {/* Playback speed selector */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[1.0, 1.5, 2.0].map((rate) => (
                    <Button
                      key={rate}
                      size="small"
                      variant={playbackRate === rate ? 'contained' : 'outlined'}
                      color={playbackRate === rate ? 'primary' : 'inherit'}
                      onClick={() => handleSpeedChange(rate)}
                      sx={{
                        minWidth: 36,
                        height: 24,
                        fontSize: 10,
                        px: 0.5,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: playbackRate === rate ? '#ffffff' : 'grey.300',
                      }}
                    >
                      {rate}x
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right: Inspector Control Panel */}
        <Box
          sx={{
            flex: { xs: 'none', lg: 5 },
            height: { xs: 'auto', lg: '100%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
            pr: { lg: 1 },
          }}
        >
          {/* Card 1: AI Primary 1st-Stage Auto Subtitle Remover */}
          <Card
            sx={{
              p: 2.5,
              border: '1.5px solid',
              borderColor: hasRunAiDetect ? 'divider' : 'primary.main',
              bgcolor: hasRunAiDetect ? 'background.paper' : 'rgba(121, 40, 202, 0.03)',
              borderRadius: 2,
              boxShadow: hasRunAiDetect ? 'none' : '0 4px 20px rgba(121, 40, 202, 0.1)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                    color: '#ffffff',
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  STEP 1. AI 1차 자동 자막 제거
                </Typography>
              </Box>
              <Chip
                label={hasRunAiDetect ? '1차 완료됨' : '1차 필수 추천'}
                size="small"
                color={hasRunAiDetect ? 'default' : 'primary'}
                variant="filled"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 800,
                  background: hasRunAiDetect
                    ? undefined
                    : 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                  color: '#ffffff',
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
              동영상 전체 프레임을 정밀 스캔하여 자막 위치를 스스로 찾아 지워둡니다. 1차 작업 후
              아래 목록이나 화면에서 필요한 부분만 직접 미세 조정하거나 지우세요.
            </Typography>

            {/* Scan Target Zone Selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.6 }}>
                스캔 감지 대상 영역:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Button
                  size="small"
                  variant={detectSearchZone === 'bottom' ? 'contained' : 'outlined'}
                  color={detectSearchZone === 'bottom' ? 'primary' : 'inherit'}
                  onClick={() => setDetectSearchZone('bottom')}
                  sx={{ fontSize: 11, fontWeight: 700, py: 0.6 }}
                >
                  하단 본문 자막 (추천)
                </Button>
                <Button
                  size="small"
                  variant={detectSearchZone === 'all' ? 'contained' : 'outlined'}
                  color={detectSearchZone === 'all' ? 'primary' : 'inherit'}
                  onClick={() => setDetectSearchZone('all')}
                  sx={{ fontSize: 11, fontWeight: 700, py: 0.6 }}
                >
                  상단 + 하단 전체 화면
                </Button>
              </Box>
              <Typography
                variant="caption"
                sx={{ fontSize: 10, color: 'text.secondary', mt: 0.6, display: 'block' }}
              >
                {detectSearchZone === 'bottom'
                  ? '인물 얼굴, 머리카락, 배경 간판 오탐지를 방지하고 하단 자막만 집중 감지합니다.'
                  : '상단 헤드라인 타이틀과 하단 자막을 전체 화면에서 함께 감지합니다.'}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              disabled={isDetecting}
              startIcon={
                isDetecting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AutoFixHighRoundedIcon />
                )
              }
              onClick={handleSmartAutoDetect}
              sx={{
                fontWeight: 800,
                mb: 1.5,
                py: 1.3,
                fontSize: 13,
                background: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(121, 40, 202, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6821b0 0%, #d9006c 100%)',
                },
              }}
            >
              {isDetecting
                ? `AI 1차 자동 분석 및 제거 중... (${detectProgress}%)`
                : hasRunAiDetect
                  ? '⚡ AI 1차 자동 자막 제거 다시 실행'
                  : '⚡ AI 1차 자동 자막 제거 실행'}
            </Button>

            {/* Scan Progress Bar */}
            {isDetecting && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={detectProgress}
                  sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                />
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  동영상 전체를 시간대별로 분석하여 자막 구간을 추출하고 인페인팅을 적용하고
                  있습니다.
                </Typography>
              </Box>
            )}

            {hasRunAiDetect && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0, 167, 111, 0.08)',
                  border: '1px solid rgba(0, 167, 111, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700 }}>
                  AI 1차 자막 작업이 적용되었습니다. 아래 구간 목록이나 화면에서 원하는 대로
                  수정하세요.
                </Typography>
              </Box>
            )}

            {/* Presets */}
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
            >
              자막 위치 프리셋 원클릭 적용:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyPreset('bottom-center')}
                sx={{ fontSize: 11, fontWeight: 600, py: 0.8 }}
              >
                하단 표준 자막 (중앙)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyPreset('bottom-wide')}
                sx={{ fontSize: 11, fontWeight: 600, py: 0.8 }}
              >
                하단 와이드 배너 자막
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyPreset('bottom-compact')}
                sx={{ fontSize: 11, fontWeight: 600, py: 0.8 }}
              >
                하단 콤팩트 자막 (1줄)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyPreset('top-headline')}
                sx={{ fontSize: 11, fontWeight: 600, py: 0.8 }}
              >
                상단 헤드라인 자막
              </Button>
            </Box>
          </Card>

          {/* Card: Detected Time-Varying Subtitle Segments */}
          <Card sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  시간대별 자막 구간 목록 ({boxes.length}개)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleAddBox}
                  sx={{ fontSize: 11, fontWeight: 700, py: 0.3, px: 1 }}
                >
                  구간 추가
                </Button>
                {boxes.length > 0 && (
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={handleClearAllBoxes}
                    sx={{ fontSize: 11, fontWeight: 700, py: 0.3, px: 0.8 }}
                  >
                    모두 비우기
                  </Button>
                )}
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
            >
              시간대별로 서로 다른 위치의 자막이 각각 독립적으로 감지되어 적용됩니다. 자막이 아닌
              부분이 감지되었다면 [자막 아님 (삭제)] 버튼으로 즉시 제거할 수 있습니다.
            </Typography>

            {/* Batch Margin Adjustment Controls */}
            {boxes.length > 0 && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    ⚡ 잔여 자막 방지: 모든 구간 여유 시간 추가
                  </Typography>
                  <Tooltip title="자막이 살짝 먼저 나오거나 늦게 사라질 때 전체 구간의 시작을 앞당기고 끝을 늘립니다.">
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 700 }}
                    >
                      도움말
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAdjustAllBoxesTime(-0.3, 0)}
                    sx={{ fontSize: 11, py: 0.3, px: 1, fontWeight: 700 }}
                  >
                    모든 구간 앞 +0.3초
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAdjustAllBoxesTime(0, 0.3)}
                    sx={{ fontSize: 11, py: 0.3, px: 1, fontWeight: 700 }}
                  >
                    모든 구간 뒤 +0.3초
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAdjustAllBoxesTime(-0.5, 0.5)}
                    sx={{ fontSize: 11, py: 0.3, px: 1.2, fontWeight: 800 }}
                  >
                    모든 구간 앞뒤 +0.5초 (추천)
                  </Button>
                </Box>
              </Box>
            )}

            {boxes.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  등록된 자막 구간이 없습니다
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
                >
                  오감지된 영역이 삭제되었거나 자막이 등록되지 않았습니다. 원본 영상이 100% 그대로
                  보존되어 출력됩니다.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddBox}
                    sx={{ fontWeight: 700 }}
                  >
                    자막 영역 직접 추가
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeRoundedIcon />}
                    onClick={handleSmartAutoDetect}
                    sx={{ fontWeight: 700 }}
                  >
                    스마트 자동 감지
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  maxHeight: 320,
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {boxes.map((b, idx) => {
                  const isSelected = b.id === activeBoxId;
                  const isCurrentPlayback =
                    currentTime >= (b.startTime ?? 0) && currentTime <= (b.endTime ?? 99999);
                  const isTop = b.y < 0.35;

                  return (
                    <Box
                      key={b.id || idx}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = b.startTime;
                          setCurrentTime(b.startTime);
                          setActiveBoxId(b.id);
                          renderCurrentFrame();
                        }
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: '1.5px solid',
                        borderColor: isSelected
                          ? 'primary.main'
                          : isCurrentPlayback
                            ? '#00A76F'
                            : 'divider',
                        bgcolor: isSelected
                          ? 'rgba(0, 167, 111, 0.08)'
                          : isCurrentPlayback
                            ? 'rgba(0, 167, 111, 0.04)'
                            : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 2px 8px rgba(0, 167, 111, 0.16)' : 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(0, 167, 111, 0.05)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 0.8,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                        >
                          <Chip
                            size="small"
                            label={`${formatTime(b.startTime)} ~ ${formatTime(b.endTime)}`}
                            color={isCurrentPlayback ? 'primary' : 'default'}
                            variant={isCurrentPlayback ? 'filled' : 'outlined'}
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                          <Chip
                            size="small"
                            label={isTop ? '상단 자막' : '하단 자막'}
                            color={isTop ? 'info' : 'primary'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Switch
                            size="small"
                            checked={b.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateActiveBox({ enabled: e.target.checked });
                            }}
                          />
                          <IconButton
                            size="small"
                            title="자막 아님 (삭제)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoxById(b.id);
                            }}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                          >
                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>
                          {b.label || `구간 ${idx + 1}`}
                        </Typography>

                        {isCurrentPlayback && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'primary.main',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                boxShadow: '0 0 6px #00A76F',
                              }}
                            />
                            현재 자막 지우기 적용 중
                          </Typography>
                        )}
                      </Box>

                      {/* Quick Per-segment Time Margin & Delete Buttons */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1,
                          pt: 0.8,
                          borderTop: '1px dashed',
                          borderColor: 'divider',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteRoundedIcon sx={{ fontSize: 13 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBoxById(b.id);
                          }}
                          sx={{ minWidth: 'auto', px: 0.8, py: 0.1, fontSize: 10, fontWeight: 700 }}
                        >
                          자막 아님 (삭제)
                        </Button>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdjustBoxById(b.id, -0.3, 0);
                            }}
                            sx={{
                              minWidth: 'auto',
                              px: 0.8,
                              py: 0.2,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            앞 +0.3초
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdjustBoxById(b.id, 0, 0.3);
                            }}
                            sx={{
                              minWidth: 'auto',
                              px: 0.8,
                              py: 0.2,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            뒤 +0.3초
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdjustBoxById(b.id, -0.5, 0.5);
                            }}
                            sx={{
                              minWidth: 'auto',
                              px: 0.8,
                              py: 0.2,
                              fontSize: 10,
                              fontWeight: 800,
                            }}
                          >
                            앞뒤 +0.5초
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>

          {/* Card 2: Inpainting & Removal Quality Settings */}
          <Card sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneRoundedIcon color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                자연스러운 제거 (인페인팅) 정밀 파라미터
              </Typography>
            </Box>

            {/* Inpaint Mode Selector */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>제거 모드</InputLabel>
              <Select
                value={inpaintMode}
                label="제거 모드"
                onChange={(e) => {
                  const mode = e.target.value as InpaintMode;
                  setInpaintMode(mode);
                  updateActiveBox({ mode });
                }}
              >
                <MenuItem value="hybrid">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      AI 하이브리드 배경 복원 (권장)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      주변 배경 텍스처와 필름 그레인을 결합하여 가장 자연스럽게 채움
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="color-fill">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      주변 배경색 적응형 융합
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      단색, 부드러운 그라디언트, 애니메이션 배경에 적합
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="blur">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      자연스러운 가우시안 블러
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      가장자리 소프트 페더링이 적용된 부드러운 흐림 효과
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Background Sample Direction Selector */}
            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel>배경 참조 (샘플링) 방향</InputLabel>
              <Select
                value={sampleDirection}
                label="배경 참조 (샘플링) 방향"
                onChange={(e) => {
                  const dir = e.target.value as InpaintSampleDirection;
                  setSampleDirection(dir);
                  updateActiveBox({ sampleDirection: dir });
                }}
              >
                <MenuItem value="vertical">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      상·하 양방향 균등 합성 (기본)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      위와 아래 배경을 부드럽게 대칭 그라디언트로 채움
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="top-only">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      상단 배경 전용 복원 (화면 바닥 자막 추천)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      자막이 화면 맨 아래에 닿아있을 때 위쪽 배경만으로 깔끔하게 복원
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="bottom-only">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      하단 배경 전용 복원 (화면 상단 자막 추천)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      자막이 화면 상단 끝에 닿아있을 때 아래쪽 배경만으로 깔끔하게 복원
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="horizontal">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      좌·우 양방향 합성
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      세로 패턴이나 좌우 배경이 일정한 영상에 최적
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Edge Feathering Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  가장자리 페더링 (Feather): {feather}px
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  경계선 이질감 제거
                </Typography>
              </Box>
              <Slider
                value={feather}
                min={2}
                max={36}
                step={1}
                onChange={(_, v) => {
                  const val = Number(v);
                  setFeather(val);
                  updateActiveBox({ feather: val });
                }}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {/* Region Padding Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  영역 확장 여백 (Padding): {padding}px
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  자막 외곽선 완전 커버
                </Typography>
              </Box>
              <Slider
                value={padding}
                min={0}
                max={28}
                step={1}
                onChange={(_, v) => {
                  const val = Number(v);
                  setPadding(val);
                  updateActiveBox({ padding: val });
                }}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {/* Natural Film Grain Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  필름 그레인 질감 (Film Grain): {grainStrength}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {grainStrength === 0 ? '매끄러움 (2D/애니)' : '실사 영상 질감 일치'}
                </Typography>
              </Box>
              <Slider
                value={grainStrength}
                min={0}
                max={20}
                step={1}
                onChange={(_, v) => {
                  const val = Number(v);
                  setGrainStrength(val);
                  updateActiveBox({ grainStrength: val });
                }}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {/* Brightness / Tone Adjustment Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  명도 톤 미세 일치 (Tone Match):{' '}
                  {brightnessOffset > 0 ? `+${brightnessOffset}` : brightnessOffset}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  자막 그림자/배경 톤 일치
                </Typography>
              </Box>
              <Slider
                value={brightnessOffset}
                min={-40}
                max={40}
                step={2}
                onChange={(_, v) => {
                  const val = Number(v);
                  setBrightnessOffset(val);
                  updateActiveBox({ brightnessOffset: val });
                }}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {/* Blend Strength Slider */}
            <Box sx={{ mb: inpaintMode === 'blur' ? 2 : 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  제거 합성 강도 (Blend): {Math.round(blendStrength * 100)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  불투명도 조절
                </Typography>
              </Box>
              <Slider
                value={blendStrength}
                min={0.1}
                max={1.0}
                step={0.05}
                onChange={(_, v) => {
                  const val = Number(v);
                  setBlendStrength(val);
                  updateActiveBox({ blendStrength: val });
                }}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {/* Blur Radius Slider (when blur mode is selected) */}
            {inpaintMode === 'blur' && (
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    블러 반경 (Blur Radius): {blurRadius}px
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    흐림 강도 조절
                  </Typography>
                </Box>
                <Slider
                  value={blurRadius}
                  min={4}
                  max={40}
                  step={2}
                  onChange={(_, v) => {
                    const val = Number(v);
                    setBlurRadius(val);
                    updateActiveBox({ blurRadius: val });
                  }}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
            )}
          </Card>

          {/* Card 3: Active Subtitle Region Position & Adjustments */}
          {activeBox && (
            <Card sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  자막 영역 정밀 조정
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleDeleteActiveBox}
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      px: 1,
                      py: 0.2,
                      borderColor: 'error.light',
                      '&:hover': { bgcolor: 'error.lighter' },
                    }}
                  >
                    자막 아님 (삭제)
                  </Button>
                  <IconButton
                    size="small"
                    onClick={handleAddBox}
                    sx={{ color: 'primary.main' }}
                    title="새 자막 구간 추가"
                  >
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
              >
                화면 위의 자막 박스를 마우스로 직접 드래그하거나 모서리 핸들을 잡고 크기를 늘려
                조절할 수도 있습니다.
              </Typography>

              {/* Coordinate Sliders */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    가로 위치 (X): {Math.round(activeBox.x * 100)}%
                  </Typography>
                  <Slider
                    size="small"
                    value={activeBox.x}
                    min={0}
                    max={0.9}
                    step={0.01}
                    onChange={(_, v) => updateActiveBox({ x: Number(v) })}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    세로 위치 (Y): {Math.round(activeBox.y * 100)}%
                  </Typography>
                  <Slider
                    size="small"
                    value={activeBox.y}
                    min={0}
                    max={0.9}
                    step={0.01}
                    onChange={(_, v) => updateActiveBox({ y: Number(v) })}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    너비 (W): {Math.round(activeBox.width * 100)}%
                  </Typography>
                  <Slider
                    size="small"
                    value={activeBox.width}
                    min={0.1}
                    max={1}
                    step={0.01}
                    onChange={(_, v) => updateActiveBox({ width: Number(v) })}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    높이 (H): {Math.round(activeBox.height * 100)}%
                  </Typography>
                  <Slider
                    size="small"
                    value={activeBox.height}
                    min={0.04}
                    max={0.5}
                    step={0.01}
                    onChange={(_, v) => updateActiveBox({ height: Number(v) })}
                  />
                </Box>
              </Box>

              {/* Time Range Slider & Precision Controls for Active Subtitle Box */}
              <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      자막 적용 시간: {formatTime(activeBox.startTime)} ~{' '}
                      {formatTime(activeBox.endTime)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${Math.max(0, activeBox.endTime - activeBox.startTime).toFixed(1)}초 적용`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                </Box>

                <Slider
                  size="small"
                  value={[
                    Math.max(0, activeBox.startTime || 0),
                    Math.min(duration || 10, activeBox.endTime || duration || 10),
                  ]}
                  min={0}
                  max={duration || 10}
                  step={0.1}
                  onChange={(_, val) => {
                    if (Array.isArray(val)) {
                      updateActiveBox({ startTime: val[0], endTime: val[1] });
                    }
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => formatTime(v)}
                  sx={{ color: 'primary.main', mb: 2 }}
                />

                {/* Start Time Margin Adjustment (Front) */}
                <Box
                  sx={{
                    p: 1.2,
                    mb: 1.2,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.8,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      앞쪽 시작 시간:{' '}
                      <strong style={{ color: '#00A76F' }}>
                        {formatTime(activeBox.startTime)}
                      </strong>
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      자막이 일찍 시작될 때 앞당김
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleAdjustActiveBoxTime(-0.5, 0, 'start')}
                      sx={{ fontSize: 10, px: 1, py: 0.2, fontWeight: 800 }}
                    >
                      -0.5초 앞당김
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustActiveBoxTime(-0.2, 0, 'start')}
                      sx={{ fontSize: 10, px: 0.8, py: 0.2, fontWeight: 700 }}
                    >
                      -0.2초
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustActiveBoxTime(0.2, 0, 'start')}
                      sx={{ fontSize: 10, px: 0.8, py: 0.2, fontWeight: 700 }}
                    >
                      +0.2초
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleSetActiveBoxTimeFromCurrent('start')}
                      sx={{ fontSize: 10, px: 1, py: 0.2, fontWeight: 700 }}
                    >
                      현재 시점으로 시작
                    </Button>
                  </Box>
                </Box>

                {/* End Time Margin Adjustment (Back) */}
                <Box
                  sx={{
                    p: 1.2,
                    mb: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.8,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      뒤쪽 종료 시간:{' '}
                      <strong style={{ color: '#00A76F' }}>{formatTime(activeBox.endTime)}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      자막이 늦게 사라질 때 뒤로 연장
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustActiveBoxTime(0, -0.2, 'end')}
                      sx={{ fontSize: 10, px: 0.8, py: 0.2, fontWeight: 700 }}
                    >
                      -0.2초
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustActiveBoxTime(0, 0.2, 'end')}
                      sx={{ fontSize: 10, px: 0.8, py: 0.2, fontWeight: 700 }}
                    >
                      +0.2초
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleAdjustActiveBoxTime(0, 0.5, 'end')}
                      sx={{ fontSize: 10, px: 1, py: 0.2, fontWeight: 800 }}
                    >
                      +0.5초 뒤로 연장
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleSetActiveBoxTimeFromCurrent('end')}
                      sx={{ fontSize: 10, px: 1, py: 0.2, fontWeight: 700 }}
                    >
                      현재 시점으로 종료
                    </Button>
                  </Box>
                </Box>

                {/* Quick Combined Margin */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleAdjustActiveBoxTime(-0.5, 0.5)}
                    sx={{ fontSize: 11, fontWeight: 800, py: 0.5 }}
                  >
                    ⚡ 현재 구간 앞뒤 +0.5초 여유 추가
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleAdjustActiveBoxTime(-1.0, 1.0)}
                    sx={{ fontSize: 11, fontWeight: 700, py: 0.5, whiteSpace: 'nowrap' }}
                  >
                    앞뒤 +1.0초
                  </Button>
                </Box>

                {/* False Positive Removal Button */}
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteRoundedIcon />}
                    onClick={handleDeleteActiveBox}
                    sx={{
                      fontWeight: 800,
                      fontSize: 12,
                      py: 0.8,
                      borderWidth: 1.5,
                      bgcolor: 'rgba(255, 86, 48, 0.04)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 86, 48, 0.12)',
                        borderColor: 'error.main',
                      },
                    }}
                  >
                    ❌ 이 영역은 자막이 아님 (현재 구간 삭제)
                  </Button>

                  {overlappingBoxes.length > 0 && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      startIcon={<DeleteSweepRoundedIcon />}
                      onClick={handleDeleteOverlappingBoxes}
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                        fontSize: 12,
                        py: 0.9,
                        bgcolor: '#ff5630',
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: '#b71d18',
                        },
                      }}
                    >
                      🔥 이 위치 겹친 모든 구간 ({overlappingBoxes.length + 1}개) 일괄 삭제
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          )}

          {/* Card 4: Action Banner */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(0, 167, 111, 0.08)',
              border: '1px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                자막 제거 준비 완료
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                설정한 영역의 자막이 지워진 고화질 비디오를 인코딩합니다.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MovieCreationRoundedIcon />}
              onClick={() => setExportModalOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              내보내기
            </Button>
          </Box>
        </Box>
      </Box>

      {/* -------------------------------------------------------------------- */}
      {/* Video Export & Processing Dialog (Safe from PaperProps rule) */}
      {/* -------------------------------------------------------------------- */}
      <Dialog
        open={exportModalOpen}
        onClose={() => {
          if (!isExporting) setExportModalOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2.5,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          자막 지운 동영상 내보내기 (Export Video)
          {!isExporting && (
            <IconButton size="small" onClick={() => setExportModalOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {isExporting ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <CircularProgress size={56} sx={{ mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                동영상 자막 제거 렌더링 중... ({exportProgress}%)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                경과 시간: {exportElapsedSec}초 · 원본 오디오를 동기화하여 고품질로 변환하고
                있습니다.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{ height: 10, borderRadius: 5, mb: 3 }}
              />
              <Button variant="outlined" color="error" onClick={handleCancelExport}>
                인코딩 취소
              </Button>
            </Box>
          ) : exportedVideoUrl ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  color: 'success.dark',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                자막 제거 영상 완성!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                자막이 자연스럽게 지워졌습니다. 아래 미리보기를 재생하거나 즉시 다운로드하세요.
              </Typography>

              {/* Video Player Preview */}
              <Box
                sx={{
                  maxHeight: 240,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#000000',
                  mb: 3,
                }}
              >
                <video
                  src={exportedVideoUrl}
                  controls
                  style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleDownloadExportedVideo}
                  sx={{ fontWeight: 800, px: 3 }}
                >
                  비디오 다운로드 ({exportSettings.format === 'webm' ? '.WEBM' : '.MP4'})
                </Button>
                <Button variant="outlined" onClick={() => setExportedVideoUrl(null)}>
                  다시 설정하기
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
              {/* Output File Format (MP4 / WebM) */}
              <FormControl fullWidth size="small">
                <InputLabel>출력 포맷 (확장자)</InputLabel>
                <Select
                  value={exportSettings.format || 'mp4'}
                  label="출력 포맷 (확장자)"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      format: e.target.value as 'mp4' | 'webm',
                    }))
                  }
                >
                  <MenuItem value="mp4">
                    MP4 (.mp4) - 기본 권장 (모든 PC·스마트폰·플레이어 호환)
                  </MenuItem>
                  <MenuItem value="webm">WebM (.webm) - 웹 표준 고압축</MenuItem>
                </Select>
              </FormControl>

              {/* Resolution selection */}
              <FormControl fullWidth size="small">
                <InputLabel>출력 해상도</InputLabel>
                <Select
                  value={exportSettings.resolution}
                  label="출력 해상도"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      resolution: e.target.value as VideoExportSettings['resolution'],
                    }))
                  }
                >
                  <MenuItem value="original">
                    원본 해상도 유지 ({metadata?.width}x{metadata?.height})
                  </MenuItem>
                  <MenuItem value="1080p">1080p FHD (1920x1080)</MenuItem>
                  <MenuItem value="720p">720p HD (1280x720)</MenuItem>
                  <MenuItem value="480p">480p SD (854x480)</MenuItem>
                </Select>
              </FormControl>

              {/* Quality selection */}
              <FormControl fullWidth size="small">
                <InputLabel>인코딩 품질</InputLabel>
                <Select
                  value={exportSettings.quality}
                  label="인코딩 품질"
                  onChange={(e) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      quality: e.target.value as VideoExportSettings['quality'],
                    }))
                  }
                >
                  <MenuItem value="high">고화질 (8 Mbps) - 추천</MenuItem>
                  <MenuItem value="medium">표준 화질 (5 Mbps)</MenuItem>
                  <MenuItem value="standard">압축 화질 (2.5 Mbps)</MenuItem>
                </Select>
              </FormControl>

              {/* Audio Passthrough */}
              <FormControlLabel
                control={
                  <Switch
                    checked={!exportSettings.muteAudio}
                    onChange={(e) =>
                      setExportSettings((prev) => ({
                        ...prev,
                        muteAudio: !e.target.checked,
                      }))
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      원본 오디오 트랙 보존 (추천)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      영상의 배경 음악 및 대사 사운드를 그대로 유지합니다.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
        </DialogContent>

        {!isExporting && !exportedVideoUrl && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" onClick={() => setExportModalOpen(false)}>
              취소
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartExport}
              startIcon={<MovieCreationRoundedIcon />}
              sx={{ fontWeight: 800, px: 2.5 }}
            >
              인코딩 시작
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </DashboardContent>
  );
}
