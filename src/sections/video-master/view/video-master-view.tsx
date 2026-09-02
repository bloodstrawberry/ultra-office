'use client';

import type { SampleVideoItem } from '../data/video-samples';
import type {
  FilterPreset,
  VideoFilterSettings,
  VideoStudioClipItem,
  VideoStudioTextItem,
  VideoStudioExportSettings,
} from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import FlipCameraAndroidRoundedIcon from '@mui/icons-material/FlipCameraAndroidRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { SttExtractPanel } from '../components/stt-extract-panel';
import { ImageExtractPanel } from '../components/image-extract-panel';
import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import { FILTER_PRESETS, DEFAULT_FILTERS } from '../utils/video-processor';
import {
  exportStudioGif,
  exportStudioVideo,
  getClipAtGlobalTime,
  drawClipFrameToCanvas,
  drawTextOverlaysToCanvas,
  calculateTotalTimelineDuration,
  createVideoStudioClipFromFile,
} from '../utils/video-studio-processor';

// ----------------------------------------------------------------------

type InspectorTabKey = 'clip' | 'text' | 'image-extract' | 'stt-extract' | 'export';

export function VideoMasterView() {
  // ─── Multi-Track Clips & Text Items ───
  const [clips, setClips] = useState<VideoStudioClipItem[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  const [textClips, setTextClips] = useState<VideoStudioTextItem[]>([
    {
      id: 'text-1',
      text: '동영상 제목 및 자막을 입력하세요',
      startTime: 0,
      duration: 4.0,
      fontSize: 32,
      fontColor: '#ffffff',
      fontBgColor: 'rgba(0,0,0,0.6)',
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      position: 'bottom',
      xPercent: 50,
      yPercent: 85,
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>('text-1');

  // ─── Timeline & Playhead State ───
  const [currentPlayheadTime, setCurrentPlayheadTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [globalVolume, setGlobalVolume] = useState<number>(1.0);

  // ─── Inspector & Export State ───
  const [inspectorTab, setInspectorTab] = useState<InspectorTabKey>('clip');
  const [exportSettings, setExportSettings] = useState<VideoStudioExportSettings>({
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    format: 'mp4',
    quality: 'high',
    fitMode: 'contain',
    backgroundColor: '#000000',
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportPhase, setExportPhase] = useState<string>('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // ─── Drag & Drop / Trimming Interaction ───
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [copiedClip, setCopiedClip] = useState<VideoStudioClipItem | null>(null);
  const [copiedTextClip, setCopiedTextClip] = useState<VideoStudioTextItem | null>(null);

  const [trimmingClipState, setTrimmingClipState] = useState<{
    clipId: string;
    handle: 'start' | 'end';
    startX: number;
    initialTrimStart: number;
    initialTrimEnd: number;
    pxPerSec: number;
  } | null>(null);

  // ─── Canvas Interaction (Text Drag & Resize) ───
  const [canvasDraggingTextId, setCanvasDraggingTextId] = useState<string | null>(null);
  const [canvasTextMode, setCanvasTextMode] = useState<'move' | 'resize' | null>(null);
  const canvasResizeStartRef = useRef<{ startX: number; startY: number; initialFontSize: number }>({
    startX: 0,
    startY: 0,
    initialFontSize: 32,
  });

  // ─── DOM References ───
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastPlayTimestampRef = useRef<number | null>(null);

  const totalDuration = calculateTotalTimelineDuration(clips);
  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0] || null;
  const selectedText = textClips.find((t) => t.id === selectedTextId) || textClips[0] || null;

  // ─── 1. Load Files & Append Clips ───
  const handleAddFiles = useCallback(
    async (files: FileList | File[]) => {
      const newClips: VideoStudioClipItem[] = [];
      for (let i = 0; i < files.length; i += 1) {
        try {
          const clip = await createVideoStudioClipFromFile(files[i]);
          newClips.push(clip);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '파일 로드 오류';
          toast.error(msg);
        }
      }

      if (newClips.length > 0) {
        setClips((prev) => {
          const next = [...prev, ...newClips];
          if (!selectedClipId && next.length > 0) {
            setSelectedClipId(next[0].id);
          }
          return next;
        });
        toast.success(`${newClips.length}개의 클립이 타임라인에 추가되었습니다.`);
      }
    },
    [selectedClipId]
  );

  const handleSelectSample = async (sample: SampleVideoItem) => {
    try {
      const file = await sample.generate();
      await handleAddFiles([file]);
    } catch {
      toast.error('샘플 비디오 생성에 실패했습니다.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    if (e.target) e.target.value = '';
  };

  // ─── 2. Playhead & Playback Loop ───
  const updateCanvasFrame = useCallback(
    (globalTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { clip, clipSourceTimeSec } = getClipAtGlobalTime(clips, globalTime);

      if (clip) {
        if (clip.type === 'video') {
          let videoElem = activeVideoRef.current;
          if (!videoElem || videoElem.src !== clip.src) {
            videoElem = document.createElement('video');
            videoElem.src = clip.src;
            videoElem.crossOrigin = 'anonymous';
            videoElem.muted = isMuted || clip.mute;
            videoElem.volume = Math.min(1, clip.volume * globalVolume);
            videoElem.playsInline = true;
            activeVideoRef.current = videoElem;
          }

          if (Math.abs(videoElem.currentTime - clipSourceTimeSec) > 0.08) {
            videoElem.currentTime = clipSourceTimeSec;
          }

          drawClipFrameToCanvas(
            ctx,
            videoElem,
            clip,
            canvas.width,
            canvas.height,
            exportSettings.fitMode,
            exportSettings.backgroundColor
          );
        }
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Text Overlay
      drawTextOverlaysToCanvas(ctx, textClips, globalTime, canvas.width, canvas.height);
    },
    [clips, textClips, exportSettings, isMuted, globalVolume]
  );

  useEffect(() => {
    if (!isPlaying) {
      updateCanvasFrame(currentPlayheadTime);
      return;
    }

    let lastTime = performance.now();
    const playLoop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentPlayheadTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        updateCanvasFrame(next);
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(playLoop);
    };

    animationFrameRef.current = requestAnimationFrame(playLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration, updateCanvasFrame, currentPlayheadTime]);

  // ─── 3. Timeline Split & Trimming ───
  const handleSplitClipAtPlayhead = () => {
    const { clip, clipIndex, clipLocalTimeSec } = getClipAtGlobalTime(clips, currentPlayheadTime);
    if (!clip) {
      toast.error('분할할 클립이 없습니다.');
      return;
    }

    const splitSourceTime = clip.trimStart + clipLocalTimeSec * clip.speedMultiplier;
    if (splitSourceTime <= clip.trimStart + 0.3 || splitSourceTime >= clip.trimEnd - 0.3) {
      toast.warning('클립의 가장자리에서는 분할할 수 없습니다.');
      return;
    }

    const clip1: VideoStudioClipItem = {
      ...clip,
      id: `clip-${Date.now()}-1`,
      name: `${clip.name} (Part 1)`,
      trimEnd: splitSourceTime,
      duration: (splitSourceTime - clip.trimStart) / clip.speedMultiplier,
    };

    const clip2: VideoStudioClipItem = {
      ...clip,
      id: `clip-${Date.now()}-2`,
      name: `${clip.name} (Part 2)`,
      trimStart: splitSourceTime,
      duration: (clip.trimEnd - splitSourceTime) / clip.speedMultiplier,
    };

    const nextClips = [...clips];
    nextClips.splice(clipIndex, 1, clip1, clip2);
    setClips(nextClips);
    setSelectedClipId(clip2.id);
    toast.success('클립이 2개로 분할되었습니다.');
  };

  const handleDeleteSelectedClip = () => {
    if (!selectedClipId) return;
    setClips((prev) => prev.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(null);
    toast.success('선택된 클립이 삭제되었습니다.');
  };

  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    const duplicated: VideoStudioClipItem = {
      ...selectedClip,
      id: `clip-${Date.now()}-dup`,
      name: `${selectedClip.name} (복사본)`,
    };
    setClips((prev) => [...prev, duplicated]);
    setSelectedClipId(duplicated.id);
    toast.success('클립이 복제되었습니다.');
  };

  // ─── 4. Timeline Pointer Scrubbing ───
  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    isScrubbingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleTimelineScrub(e);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbingRef.current) return;
    handleTimelineScrub(e);
  };

  const handleTimelinePointerUp = (e: React.PointerEvent) => {
    if (isScrubbingRef.current) {
      isScrubbingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleTimelineScrub = (e: React.PointerEvent) => {
    if (!timelineScrollRef.current) return;
    const rect = timelineScrollRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 80; // 80px track label width
    const pxPerSec = 50 * timelineZoom;
    const targetSec = Math.max(0, Math.min(totalDuration, clickX / pxPerSec));
    setCurrentPlayheadTime(targetSec);
    updateCanvasFrame(targetSec);
  };

  // ─── 5. Text Item Manipulation ───
  const handleAddTextClip = () => {
    const cur = currentPlayheadTime;
    const newText: VideoStudioTextItem = {
      id: `text-${Date.now()}`,
      text: '새 자막 텍스트',
      startTime: cur,
      duration: 3.0,
      fontSize: 32,
      fontColor: '#ffffff',
      fontBgColor: 'rgba(0,0,0,0.6)',
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      position: 'bottom',
      xPercent: 50,
      yPercent: 80,
    };
    setTextClips((prev) => [...prev, newText]);
    setSelectedTextId(newText.id);
    setInspectorTab('text');
    toast.success('새 자막 텍스트가 추가되었습니다.');
  };

  const handleDeleteTextClip = (id: string) => {
    setTextClips((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
    toast.success('자막이 삭제되었습니다.');
  };

  // ─── 6. Video / GIF Export ───
  const handleStartExport = async () => {
    if (clips.length === 0) {
      toast.error('내보낼 동영상 클립이 없습니다.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportPhase('인코딩 준비 중...');
    setExportedVideoUrl(null);

    try {
      let blob: Blob;
      if (exportSettings.format === 'gif') {
        blob = await exportStudioGif(clips, textClips, exportSettings, (p) => {
          setExportProgress(p);
          setExportPhase(`GIF 프레임 생성 중... (${p}%)`);
        });
      } else {
        blob = await exportStudioVideo(clips, textClips, exportSettings, (p, phase) => {
          setExportProgress(p);
          setExportPhase(phase);
        });
      }

      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);
      toast.success('동영상 렌더링이 성공적으로 완료되었습니다!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '동영상 내보내기 실패';
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExported = () => {
    if (!exportedVideoUrl) return;
    const ext = exportSettings.format === 'gif' ? 'gif' : 'mp4';
    const link = document.createElement('a');
    link.href = exportedVideoUrl;
    link.download = `video_studio_export_${Date.now()}.${ext}`;
    link.click();
  };

  const handleResetProject = () => {
    setClips([]);
    setSelectedClipId(null);
    setTextClips([]);
    setSelectedTextId(null);
    setCurrentPlayheadTime(0);
    setIsPlaying(false);
    setExportedVideoUrl(null);
    toast.info('프로젝트가 초기화되었습니다.');
  };

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept="video/*,image/*"
        onChange={handleFileInputChange}
      />

      {/* ─── 1. Header Navigation Bar ─── */}
      <Box
        sx={{
          mb: 1.5,
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
              동영상 편집기 (Video Studio)
            </Typography>
            <Chip
              label="100% 브라우저 로컬 가속 멀티트랙 에디터"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            서버 업로드 없이 브라우저에서 동영상 자르기 · 이어붙이기 · 자막 · 배속 · 필터 ·
            이미지/STT 추출을 일체형으로 편집합니다.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.videoMaster.aiWatermark}
            size="small"
            variant="soft"
            color="primary"
            startIcon={<MovieFilterRoundedIcon />}
          >
            동영상 AI 워터마크 각인
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ fontWeight: 700 }}
          >
            미디어 클립 추가
          </Button>

          {clips.length > 0 && (
            <Button size="small" variant="soft" color="error" onClick={handleResetProject}>
              초기화
            </Button>
          )}
        </Box>
      </Box>

      {/* ─── 2. Main Workspace ─── */}
      {clips.length === 0 ? (
        <VideoUploadWorkspace
          onSelectSample={handleSelectSample}
          onFileSelect={(file) => handleAddFiles([file])}
          title="편집할 동영상 또는 이미지를 추가하세요"
          subtitle="여러 개의 동영상/이미지 파일을 드래그하여 타임라인에서 손쉽게 자르고, 이어붙이고, 자막을 추가하세요."
          icon={<MovieFilterRoundedIcon sx={{ fontSize: 44 }} />}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            gap: 1.5,
          }}
        >
          {/* Top Row: Left Interactive Viewport & Right Inspector Panel */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              flex: '1 1 0px',
              minHeight: 0,
              gap: 1.5,
            }}
          >
            {/* Left: Viewport Screen */}
            <Card
              sx={{
                flex: '1 1 0px',
                minWidth: 0,
                borderRadius: 2,
                bgcolor: '#090d16',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Canvas Previewer */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  position: 'relative',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: 8,
                    objectFit: 'contain',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                />
              </Box>

              {/* Viewport Floating Bottom Toolbar */}
              <Box
                sx={{
                  py: 1,
                  px: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  </IconButton>

                  <Typography
                    variant="body2"
                    sx={{ color: '#ffffff', fontFamily: 'monospace', fontWeight: 700 }}
                  >
                    {new Date(currentPlayheadTime * 1000).toISOString().substr(14, 5)} /{' '}
                    {new Date(totalDuration * 1000).toISOString().substr(14, 5)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ color: '#fff' }}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
                  </IconButton>
                  <Slider
                    size="small"
                    value={isMuted ? 0 : globalVolume * 100}
                    min={0}
                    max={100}
                    onChange={(_, v) => {
                      setGlobalVolume((v as number) / 100);
                      if (isMuted) setIsMuted(false);
                    }}
                    sx={{ width: 80, color: 'primary.main' }}
                  />
                </Box>
              </Box>
            </Card>

            {/* Right: Inspector Tabs Panel */}
            <Card
              sx={{
                width: { xs: '100%', lg: 380 },
                minWidth: { lg: 340 },
                maxWidth: { lg: 440 },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Inspector Tab Bar */}
              <Tabs
                value={inspectorTab}
                onChange={(_, v) => setInspectorTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: 'background.neutral',
                  minHeight: 44,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 44,
                    py: 1,
                    px: 1.2,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                  },
                }}
              >
                <Tab value="clip" label="클립 속성" />
                <Tab value="text" label="자막 편집" />
                <Tab value="image-extract" label="이미지 추출" />
                <Tab value="stt-extract" label="STT 추출" />
                <Tab value="export" label="내보내기" />
              </Tabs>

              {/* Inspector Content Area (Scrollable) */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* ── Tab 1: Clip Properties ── */}
                {inspectorTab === 'clip' && (
                  <>
                    {selectedClip ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          선택 클립: {selectedClip.name}
                        </Typography>

                        {/* Speed Control */}
                        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: 'text.secondary',
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            재생 속도 (배속): {selectedClip.speedMultiplier}x
                          </Typography>
                          <Slider
                            value={selectedClip.speedMultiplier}
                            min={0.25}
                            max={4.0}
                            step={0.25}
                            marks={[
                              { value: 0.5, label: '0.5x' },
                              { value: 1.0, label: '1.0x' },
                              { value: 2.0, label: '2.0x' },
                              { value: 4.0, label: '4.0x' },
                            ]}
                            onChange={(_, v) => {
                              const mult = v as number;
                              setClips((prev) =>
                                prev.map((c) =>
                                  c.id === selectedClip.id
                                    ? {
                                        ...c,
                                        speedMultiplier: mult,
                                        duration: (c.trimEnd - c.trimStart) / mult,
                                      }
                                    : c
                                )
                              );
                            }}
                          />
                        </Box>

                        {/* Rotation & Flip */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<RotateRightRoundedIcon />}
                            onClick={() => {
                              const nextRot = ((selectedClip.rotation + 90) % 360) as
                                | 0
                                | 90
                                | 180
                                | 270;
                              setClips((prev) =>
                                prev.map((c) =>
                                  c.id === selectedClip.id ? { ...c, rotation: nextRot } : c
                                )
                              );
                            }}
                            sx={{ flex: 1 }}
                          >
                            90° 회전 ({selectedClip.rotation}°)
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<FlipCameraAndroidRoundedIcon />}
                            onClick={() => {
                              setClips((prev) =>
                                prev.map((c) =>
                                  c.id === selectedClip.id ? { ...c, flipH: !c.flipH } : c
                                )
                              );
                            }}
                          >
                            좌우 반전
                          </Button>
                        </Box>

                        {/* Filter Presets */}
                        <FormControl size="small" fullWidth>
                          <InputLabel>색감 필터</InputLabel>
                          <Select
                            value={selectedClip.filterPreset || 'normal'}
                            label="색감 필터"
                            onChange={(e) => {
                              const key = e.target.value;
                              const preset = FILTER_PRESETS.find((p) => p.id === key);
                              if (preset) {
                                setClips((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClip.id
                                      ? {
                                          ...c,
                                          filterPreset: preset.id,
                                          filters: { ...preset.filter },
                                        }
                                      : c
                                  )
                                );
                              }
                            }}
                          >
                            {FILTER_PRESETS.map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="soft"
                            color="primary"
                            startIcon={<ContentCopyRoundedIcon />}
                            onClick={handleDuplicateClip}
                            sx={{ flex: 1 }}
                          >
                            클립 복제
                          </Button>
                          <Button
                            size="small"
                            variant="soft"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={handleDeleteSelectedClip}
                          >
                            삭제
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
                      >
                        하단 타임라인에서 클립을 클릭하여 선택해 주세요.
                      </Typography>
                    )}
                  </>
                )}

                {/* ── Tab 2: Text / Subtitle ── */}
                {inspectorTab === 'text' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        자막 편집
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleAddTextClip}
                      >
                        새 자막 추가
                      </Button>
                    </Box>

                    {selectedText ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                          multiline
                          rows={3}
                          size="small"
                          label="자막 문구"
                          value={selectedText.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTextClips((prev) =>
                              prev.map((t) => (t.id === selectedText.id ? { ...t, text: val } : t))
                            );
                          }}
                        />

                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <TextField
                            size="small"
                            type="number"
                            label="글자 크기"
                            value={selectedText.fontSize}
                            onChange={(e) => {
                              const s = Number(e.target.value);
                              setTextClips((prev) =>
                                prev.map((t) =>
                                  t.id === selectedText.id ? { ...t, fontSize: s } : t
                                )
                              );
                            }}
                            sx={{ width: 110 }}
                          />

                          <TextField
                            size="small"
                            type="number"
                            label="지속 시간(초)"
                            value={selectedText.duration}
                            onChange={(e) => {
                              const d = Math.max(0.5, Number(e.target.value));
                              setTextClips((prev) =>
                                prev.map((t) =>
                                  t.id === selectedText.id ? { ...t, duration: d } : t
                                )
                              );
                            }}
                            sx={{ flex: 1 }}
                          />
                        </Box>

                        <Button
                          size="small"
                          variant="soft"
                          color="error"
                          startIcon={<DeleteRoundedIcon />}
                          onClick={() => handleDeleteTextClip(selectedText.id)}
                        >
                          이 자막 삭제
                        </Button>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
                      >
                        자막을 추가하거나 타임라인에서 자막을 선택하세요.
                      </Typography>
                    )}
                  </Box>
                )}

                {/* ── Tab 3: Image Extract ── */}
                {inspectorTab === 'image-extract' && (
                  <ImageExtractPanel
                    videoUrl={selectedClip?.src || ''}
                    duration={totalDuration}
                    currentTime={currentPlayheadTime}
                    videoRef={activeVideoRef}
                    onSeekToTime={(t) => setCurrentPlayheadTime(t)}
                  />
                )}

                {/* ── Tab 4: STT Extract ── */}
                {inspectorTab === 'stt-extract' && (
                  <SttExtractPanel
                    videoUrl={selectedClip?.src || ''}
                    duration={totalDuration}
                    currentTime={currentPlayheadTime}
                    videoRef={activeVideoRef}
                    onSeekToTime={(t) => setCurrentPlayheadTime(t)}
                    videoName={selectedClip?.name || 'video'}
                  />
                )}

                {/* ── Tab 5: Export Video / GIF ── */}
                {inspectorTab === 'export' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      동영상 및 GIF 내보내기 설정
                    </Typography>

                    <FormControl size="small" fullWidth>
                      <InputLabel>출력 화면 비율</InputLabel>
                      <Select
                        value={exportSettings.aspectRatio}
                        label="출력 화면 비율"
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            aspectRatio: e.target.value as VideoStudioExportSettings['aspectRatio'],
                          }))
                        }
                      >
                        <MenuItem value="16:9">16:9 (유튜브 · 와이드)</MenuItem>
                        <MenuItem value="9:16">9:16 (쇼츠 · 릴스 · 틱톡)</MenuItem>
                        <MenuItem value="1:1">1:1 (인스타그램 피드)</MenuItem>
                        <MenuItem value="4:3">4:3 (클래식 비율)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>출력 포맷</InputLabel>
                      <Select
                        value={exportSettings.format}
                        label="출력 포맷"
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            format: e.target.value as 'mp4' | 'webm' | 'gif',
                          }))
                        }
                      >
                        <MenuItem value="mp4">MP4 비디오 (표준 고화질)</MenuItem>
                        <MenuItem value="webm">WebM 비디오 (웹 최적화)</MenuItem>
                        <MenuItem value="gif">GIF 움짤 (애니메이션)</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleStartExport}
                      disabled={isExporting}
                      sx={{ fontWeight: 800, py: 1.5 }}
                    >
                      {isExporting ? '인코딩 진행 중...' : '🚀 최종 편집 동영상 렌더링 & 다운로드'}
                    </Button>

                    {isExporting && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {exportPhase}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={exportProgress}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    )}

                    {exportedVideoUrl && (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadExported}
                        sx={{ fontWeight: 700 }}
                      >
                        완료된 파일 즉시 다운로드
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          </Box>

          {/* ─── Bottom: Multi-Track Timeline Workspace (GIF Studio Style) ─── */}
          <Card
            sx={{
              height: 220,
              flexShrink: 0,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#0f172a',
              color: '#ffffff',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Timeline Top Control Toolbar */}
            <Box
              sx={{
                py: 0.8,
                px: 1.5,
                bgcolor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="재생 / 일시정지">
                  <IconButton
                    size="small"
                    sx={{
                      color: '#fff',
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <PauseRoundedIcon fontSize="small" />
                    ) : (
                      <PlayArrowRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="현재 위치에서 분할(자르기)">
                  <Button
                    size="small"
                    variant="soft"
                    color="primary"
                    startIcon={<ContentCutRoundedIcon fontSize="small" />}
                    onClick={handleSplitClipAtPlayhead}
                    sx={{ fontWeight: 700, px: 1.2 }}
                  >
                    자르기
                  </Button>
                </Tooltip>

                <Tooltip title="클립 복제">
                  <IconButton size="small" sx={{ color: '#fff' }} onClick={handleDuplicateClip}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="클립 삭제">
                  <IconButton
                    size="small"
                    sx={{ color: '#f87171' }}
                    onClick={handleDeleteSelectedClip}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ZoomOutRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Slider
                  size="small"
                  value={timelineZoom}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  onChange={(_, v) => setTimelineZoom(v as number)}
                  sx={{ width: 80, color: 'primary.main' }}
                />
                <ZoomInRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
            </Box>

            {/* Timeline Scrollable Track Area */}
            <Box
              ref={timelineScrollRef}
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
              sx={{
                flex: '1 1 auto',
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                cursor: 'crosshair',
                userSelect: 'none',
              }}
            >
              {/* Time Ruler & Playhead Marker */}
              <Box
                sx={{
                  position: 'relative',
                  height: 20,
                  width: Math.max(800, totalDuration * 50 * timelineZoom + 200),
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  mb: 0.5,
                }}
              >
                {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
                  <Box
                    key={sec}
                    sx={{
                      position: 'absolute',
                      left: 80 + sec * 50 * timelineZoom,
                      top: 0,
                      height: '100%',
                      borderLeft: '1px solid rgba(255,255,255,0.2)',
                      pl: 0.5,
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {sec}s
                  </Box>
                ))}

                {/* Red Playhead Line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 80 + currentPlayheadTime * 50 * timelineZoom,
                    top: 0,
                    bottom: -150,
                    width: 2,
                    bgcolor: '#ef4444',
                    zIndex: 20,
                    pointerEvents: 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: -5,
                      width: 12,
                      height: 12,
                      bgcolor: '#ef4444',
                      borderRadius: '50%',
                    },
                  }}
                />
              </Box>

              {/* V1 Video Clip Track */}
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 52 }}>
                <Typography
                  variant="caption"
                  sx={{ width: 70, flexShrink: 0, fontWeight: 800, color: 'primary.light' }}
                >
                  V1 미디어
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.8, flex: '1 1 auto', alignItems: 'center' }}>
                  {clips.map((clip) => {
                    const isSelected = clip.id === selectedClipId;
                    const clipWidth = Math.max(60, clip.duration * 50 * timelineZoom);

                    return (
                      <Box
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClipId(clip.id);
                          setInspectorTab('clip');
                        }}
                        sx={{
                          width: clipWidth,
                          height: 48,
                          borderRadius: 1,
                          bgcolor: isSelected ? 'primary.main' : '#334155',
                          border: isSelected
                            ? '2px solid #60a5fa'
                            : '1px solid rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          px: 1,
                          gap: 1,
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': { bgcolor: isSelected ? 'primary.main' : '#475569' },
                        }}
                      >
                        {clip.thumbnailUrl && (
                          <Box
                            component="img"
                            src={clip.thumbnailUrl}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 0.5,
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography noWrap variant="caption" sx={{ fontWeight: 700, flex: 1 }}>
                          {clip.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {clip.duration.toFixed(1)}s
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* T1 Subtitle / Text Track */}
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                <Typography
                  variant="caption"
                  sx={{ width: 70, flexShrink: 0, fontWeight: 800, color: 'secondary.light' }}
                >
                  T1 자막
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    height: 36,
                    width: Math.max(800, totalDuration * 50 * timelineZoom),
                  }}
                >
                  {textClips.map((text) => {
                    const isSelected = text.id === selectedTextId;
                    const leftPos = text.startTime * 50 * timelineZoom;
                    const textWidth = Math.max(40, text.duration * 50 * timelineZoom);

                    return (
                      <Box
                        key={text.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextId(text.id);
                          setInspectorTab('text');
                        }}
                        sx={{
                          position: 'absolute',
                          left: leftPos,
                          width: textWidth,
                          height: 32,
                          top: 2,
                          borderRadius: 1,
                          bgcolor: isSelected ? 'secondary.main' : '#475569',
                          border: isSelected
                            ? '2px solid #f472b6'
                            : '1px solid rgba(255,255,255,0.1)',
                          px: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <TitleRoundedIcon sx={{ fontSize: 14 }} />
                        <Typography noWrap variant="caption" sx={{ fontWeight: 700 }}>
                          {text.text}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      )}
    </DashboardContent>
  );
}
