'use client';

import type { SampleVideoItem } from '../data/video-samples';
import type { MergeClipData, MergeExportSettings } from '../utils/video-merge-processor';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import {
  createSampleMergeClips,
  exportMergedVideoSequentially,
} from '../utils/video-merge-processor';
import {
  createOceanWaveVideo,
  createNeonMotionVideo,
  createCyberpunkAiVideo,
  createTimecodeCinematicVideo,
} from '../data/video-samples';

// ----------------------------------------------------------------------

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
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ----------------------------------------------------------------------

export function VideoMasterMergeView() {
  // Clips state
  const [clips, setClips] = useState<MergeClipData[]>([]);

  // Sequence Live Preview State
  const [previewClipIndex, setPreviewClipIndex] = useState<number>(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [, setSequenceCurrentTime] = useState<number>(0);

  // Single Clip Preview Modal
  const [previewModalClip, setPreviewModalClip] = useState<MergeClipData | null>(null);

  // Export Settings
  const [resolutionMode, setResolutionMode] = useState<
    'first-clip' | '1080p' | '720p' | 'square' | 'vertical'
  >('1080p');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [quality, setQuality] = useState<'high' | 'medium' | 'standard'>('high');

  // Export Progress State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportCurrentClipIdx, setExportCurrentClipIdx] = useState<number>(1);
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [mergedResultUrl, setMergedResultUrl] = useState<string | null>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(400);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(400);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sequenceVideoRef = useRef<HTMLVideoElement | null>(null);
  const exportAbortControllerRef = useRef<AbortController | null>(null);

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
    const newWidth = Math.max(300, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  // Add Files Handler
  const handleAddFiles = useCallback((files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.isArray(files) ? files : Array.from(files);

    fileArray.forEach((file) => {
      if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv|avi)$/i.test(file.name)) return;
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;

      tempVideo.onloadedmetadata = () => {
        const w = tempVideo.videoWidth || 1280;
        const h = tempVideo.videoHeight || 720;
        const dur = tempVideo.duration || 0;

        // Generate thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        let thumbUrl = '';

        tempVideo.currentTime = Math.min(dur * 0.1, 1);
        tempVideo.onseeked = () => {
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, 160, 90);
            thumbUrl = canvas.toDataURL('image/jpeg', 0.6);
          }
          setClips((prev) => [
            ...prev,
            {
              id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              file,
              name: file.name,
              size: file.size,
              duration: dur,
              previewUrl: url,
              width: w,
              height: h,
              thumbnailUrl: thumbUrl,
            },
          ]);
        };
      };
    });

    toast.success(`${fileArray.length}개의 동영상 클립을 목록에 추가했습니다.`);
  }, []);

  // Preset Samples for Merge
  const mergeSamplePresets: SampleVideoItem[] = [
    {
      id: 'merge-3-parts',
      label: '🎬 3부작 테마 연속 클립',
      subLabel: 'Intro · Main · Outro (총 12초)',
      duration: '3클립',
      thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%230f172a"/><rect x="15" y="25" width="85" height="130" rx="6" fill="%2300a76f" opacity="0.8"/><rect x="115" y="25" width="85" height="130" rx="6" fill="%230284c7" opacity="0.8"/><rect x="215" y="25" width="85" height="130" rx="6" fill="%238b5cf6" opacity="0.8"/><text x="160" y="95" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">3 CLIPS MERGE</text></svg>`,
      generate: async () => {
        const sampleFiles = await createSampleMergeClips();
        return sampleFiles[0];
      },
    },
    {
      id: 'merge-neon-timecode',
      label: '⚡ 네온 + 타임코드 2종',
      subLabel: '모션 & 타임코드 연결 (총 14초)',
      duration: '2클립',
      thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23090d16"/><rect x="20" y="25" width="130" height="130" rx="6" fill="%236366f1" opacity="0.7"/><rect x="170" y="25" width="130" height="130" rx="6" fill="%2300a76f" opacity="0.7"/><text x="160" y="95" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">NEON + HUD</text></svg>`,
      generate: async () => createNeonMotionVideo(6),
    },
    {
      id: 'merge-ocean-cyber',
      label: '🌊 오션 + 사이버 2종',
      subLabel: '웨이브 & 사이버 연결 (총 12초)',
      duration: '2클립',
      thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23041322"/><rect x="20" y="25" width="130" height="130" rx="6" fill="%230ea5e9" opacity="0.7"/><rect x="170" y="25" width="130" height="130" rx="6" fill="%23ec4899" opacity="0.7"/><text x="160" y="95" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">OCEAN + CYBER</text></svg>`,
      generate: async () => createOceanWaveVideo(6),
    },
  ];

  const handleSelectSample = async (sample: SampleVideoItem) => {
    if (sample.id === 'merge-3-parts') {
      const sampleFiles = await createSampleMergeClips();
      handleAddFiles(sampleFiles);
    } else if (sample.id === 'merge-neon-timecode') {
      const [f1, f2] = await Promise.all([
        createNeonMotionVideo(6),
        createTimecodeCinematicVideo(8),
      ]);
      handleAddFiles([f1, f2]);
    } else if (sample.id === 'merge-ocean-cyber') {
      const [f1, f2] = await Promise.all([createOceanWaveVideo(6), createCyberpunkAiVideo(6)]);
      handleAddFiles([f1, f2]);
    }
  };

  // List Reorder Handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setClips((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === clips.length - 1) return;
    setClips((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleDelete = (index: number) => {
    setClips((prev) => prev.filter((_, i) => i !== index));
    if (previewClipIndex >= clips.length - 1) {
      setPreviewClipIndex(Math.max(0, clips.length - 2));
    }
  };

  const handleClearAll = () => {
    setClips([]);
    setPreviewClipIndex(0);
    setIsSequencePlaying(false);
    toast.info('모든 클립이 목록에서 제거되었습니다.');
  };

  // Sequence Live Playback Management
  const currentClip = clips[previewClipIndex] || null;

  const toggleSequencePlayPause = () => {
    const video = sequenceVideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsSequencePlaying(true);
    } else {
      video.pause();
      setIsSequencePlaying(false);
    }
  };

  const handleSequenceVideoEnded = () => {
    if (previewClipIndex < clips.length - 1) {
      setPreviewClipIndex((prev) => prev + 1);
      setTimeout(() => {
        if (sequenceVideoRef.current) {
          sequenceVideoRef.current.play();
          setIsSequencePlaying(true);
        }
      }, 50);
    } else {
      // Loop sequence from beginning
      setPreviewClipIndex(0);
      setTimeout(() => {
        if (sequenceVideoRef.current) {
          sequenceVideoRef.current.play();
          setIsSequencePlaying(true);
        }
      }, 50);
    }
  };

  // Sequential Export Execution
  const handleStartMerge = async () => {
    if (clips.length < 2) {
      toast.error('병합하려면 동영상 클립을 2개 이상 추가해 주세요.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportCurrentClipIdx(1);
    setExportElapsedSec(0);
    setIsExportDialogOpen(true);

    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;

    const settings: MergeExportSettings = {
      resolutionMode,
      fitMode,
      backgroundColor,
      quality,
    };

    try {
      const mergedBlob = await exportMergedVideoSequentially(
        clips,
        settings,
        (progress, currentIdx, _, elapsed) => {
          setExportProgress(progress);
          setExportCurrentClipIdx(currentIdx);
          setExportElapsedSec(elapsed);
        },
        abortController.signal
      );

      const resultUrl = URL.createObjectURL(mergedBlob);
      setMergedResultUrl(resultUrl);
      toast.success('동영상 병합 및 인코딩이 성공적으로 완료되었습니다!');
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('취소')) {
        toast.info('동영상 병합 작업이 취소되었습니다.');
      } else {
        toast.error('동영상 병합 중 오류가 발생했습니다.');
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
    if (!mergedResultUrl) return;
    const link = document.createElement('a');
    link.href = mergedResultUrl;
    link.download = `merged_video_${Date.now()}.webm`;
    link.click();
    toast.success('병합된 비디오 다운로드를 시작합니다.');
  };

  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0);
  const totalBytes = clips.reduce((acc, c) => acc + (c.size || 0), 0);

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
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept="video/*"
        onChange={(e) => handleAddFiles(e.target.files)}
      />

      {/* 1. Top Header */}
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
              <CallMergeRoundedIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              동영상 붙이기 (Video Merge)
            </Typography>
            <Chip
              label="다중 클립 무제한 병합"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            여러 개의 동영상을 순서대로 매끄럽게 연결하고 해상도 및 비율을 자동 맞춤하여 하나로
            출력합니다.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {clips.length > 0 && (
            <>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                클립 추가
              </Button>

              <Button
                size="small"
                variant="soft"
                color="error"
                startIcon={<DeleteSweepRoundedIcon />}
                onClick={handleClearAll}
              >
                전체 삭제
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* 2. Main Workspace Layout */}
      {clips.length === 0 ? (
        <VideoUploadWorkspace
          multiple
          sampleVideos={mergeSamplePresets}
          onSelectSample={handleSelectSample}
          onFileSelect={(f) => handleAddFiles([f])}
          onMultipleFilesSelect={handleAddFiles}
          title="이어붙일 동영상 파일들을 업로드하세요"
          subtitle="여러 개의 동영상 파일(MP4, WebM, MOV 등)을 드래그하거나 다중 선택하세요."
          icon={<CallMergeRoundedIcon sx={{ fontSize: 38 }} />}
          buttonText="동영상 파일 다중 선택"
        />
      ) : (
        /* Active Workspace: Left Player & Clip List vs Right Settings */
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
          {/* Left: Sequence Player & Reorderable Clip List */}
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
              overflowY: 'auto',
            }}
          >
            {/* Sequence Live Preview Player */}
            <Card
              sx={{
                position: 'relative',
                borderRadius: 2.5,
                overflow: 'hidden',
                bgcolor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1 1 auto',
                minHeight: 220,
                boxShadow: 3,
              }}
            >
              {currentClip && (
                <video
                  ref={sequenceVideoRef}
                  src={currentClip.previewUrl}
                  playsInline
                  autoPlay={isSequencePlaying}
                  onTimeUpdate={() => {
                    if (sequenceVideoRef.current) {
                      setSequenceCurrentTime(sequenceVideoRef.current.currentTime);
                    }
                  }}
                  onEnded={handleSequenceVideoEnded}
                  style={{ width: '100%', height: '100%', maxHeight: '45vh', objectFit: 'contain' }}
                />
              )}

              {/* Current Playing Clip Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span>
                  클립 {previewClipIndex + 1} / {clips.length}
                </span>
                <span style={{ color: '#00A76F' }}>({currentClip?.name})</span>
              </Box>

              {/* Resolution Tag */}
              {currentClip && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0,0,0,0.8)',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'grey.400',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {currentClip.width}x{currentClip.height}
                </Box>
              )}
            </Card>

            {/* Sequence Control Bar */}
            <Card sx={{ p: 1.5, borderRadius: 2, flexShrink: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={toggleSequencePlayPause}
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: 'primary.lighter',
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                  >
                    {isSequencePlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  </IconButton>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {isSequencePlaying ? '연속 미리보기 재생 중' : '시퀀스 미리보기 일시정지'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    총 재생시간:
                  </Typography>
                  <Chip
                    label={formatTime(totalDuration)}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 800, fontFamily: 'monospace' }}
                  />
                  <Chip
                    label={formatBytes(totalBytes)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Card>

            {/* Reorderable Clip List Section */}
            <Card sx={{ p: 2, borderRadius: 2, flexShrink: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  📋 병합 순서 목록 ({clips.length}개 클립)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  클립 추가
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {clips.map((clip, index) => {
                  const isSelected = index === previewClipIndex;

                  return (
                    <Box
                      key={clip.id}
                      onClick={() => setPreviewClipIndex(index)}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      {/* Left: Thumbnail & Name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: isSelected ? 'primary.main' : 'action.selected',
                            color: isSelected ? '#ffffff' : 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>

                        {clip.thumbnailUrl && (
                          <Box
                            component="img"
                            src={clip.thumbnailUrl}
                            alt={clip.name}
                            sx={{
                              width: 54,
                              height: 34,
                              borderRadius: 1,
                              objectFit: 'cover',
                              bgcolor: '#000000',
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                            noWrap
                          >
                            {clip.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatTime(clip.duration)} · {clip.width}x{clip.height}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveUp(index);
                          }}
                        >
                          <ArrowUpwardRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index === clips.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveDown(index);
                          }}
                        >
                          <ArrowDownwardRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>
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

          {/* Right: Output Settings & Merge Action Panel */}
          <Box
            sx={{
              width: { xs: '100%', lg: rightPanelWidth },
              minWidth: { lg: 300 },
              maxWidth: { lg: 650 },
              flexShrink: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: 1.5,
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
            {/* 1. Resolution Mode */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                📐 출력 해상도 및 화면 비율
              </Typography>
              <RadioGroup
                value={resolutionMode}
                onChange={(e) =>
                  setResolutionMode(
                    e.target.value as 'first-clip' | '1080p' | '720p' | 'square' | 'vertical'
                  )
                }
              >
                <FormControlLabel
                  value="1080p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">FHD 1080p (1920x1080 - 16:9 표준)</Typography>}
                />
                <FormControlLabel
                  value="720p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">HD 720p (1280x720 - 빠른 처리)</Typography>}
                />
                <FormControlLabel
                  value="first-clip"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      첫 번째 클립 기준 ({clips[0]?.width || 1280}x{clips[0]?.height || 720})
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="vertical"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">쇼츠/릴스 세로형 (1080x1920 - 9:16)</Typography>
                  }
                />
                <FormControlLabel
                  value="square"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">인스타그램 정사각형 (1080x1080 - 1:1)</Typography>
                  }
                />
              </RadioGroup>
            </Card>

            {/* 2. Fit Mode & Background */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                🖼️ 화면 맞춤 & 레터박스 여백색
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Button
                  size="small"
                  variant={fitMode === 'contain' ? 'contained' : 'outlined'}
                  color={fitMode === 'contain' ? 'primary' : 'inherit'}
                  onClick={() => setFitMode('contain')}
                  sx={{ flex: 1, fontSize: '0.75rem' }}
                >
                  원본 비율 유지 (여백 생성)
                </Button>
                <Button
                  size="small"
                  variant={fitMode === 'cover' ? 'contained' : 'outlined'}
                  color={fitMode === 'cover' ? 'primary' : 'inherit'}
                  onClick={() => setFitMode('cover')}
                  sx={{ flex: 1, fontSize: '0.75rem' }}
                >
                  화면 꽉 채우기 (자르기)
                </Button>
              </Box>

              {fitMode === 'contain' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    배경 여백 색상:
                  </Typography>
                  {['#000000', '#ffffff', '#1e293b', '#0f172a'].map((c) => (
                    <Box
                      key={c}
                      onClick={() => setBackgroundColor(c)}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: c,
                        border: '2px solid',
                        borderColor: backgroundColor === c ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Card>

            {/* 3. Bitrate Quality */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                🎚️ 비트레이트 품질
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { id: 'high', label: '최고화질 (8M)' },
                  { id: 'medium', label: '표준 (5M)' },
                  { id: 'standard', label: '절약 (2.5M)' },
                ].map((q) => (
                  <Button
                    key={q.id}
                    size="small"
                    variant={quality === q.id ? 'contained' : 'outlined'}
                    color={quality === q.id ? 'primary' : 'inherit'}
                    onClick={() => setQuality(q.id as 'high' | 'medium' | 'standard')}
                    sx={{ flex: 1, fontSize: '0.75rem' }}
                  >
                    {q.label}
                  </Button>
                ))}
              </Box>
            </Card>

            {/* 4. Merge Action Button */}
            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CallMergeRoundedIcon />}
                onClick={handleStartMerge}
                disabled={isExporting || clips.length < 2}
                sx={{ py: 1.4, fontWeight: 800, fontSize: '0.95rem' }}
              >
                {clips.length >= 2
                  ? `${clips.length}개 영상 하나로 병합하기 (${formatTime(totalDuration)})`
                  : '2개 이상 클립을 추가하세요'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* 3. Export Dialog */}
      <Dialog
        open={isExportDialogOpen}
        onClose={handleCancelExport}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{isExporting ? '동영상 순차 병합 중...' : '🎉 동영상 병합 완료!'}</span>
          {!isExporting && (
            <IconButton onClick={() => setIsExportDialogOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
          {isExporting ? (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center', py: 2 }}
            >
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{ height: 10, borderRadius: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  현재 클립: {exportCurrentClipIdx} / {clips.length} ({exportProgress}%)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  경과 시간: {exportElapsedSec}초
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                💡 브라우저 로컬 캔버스 합성으로 해상도 및 비율을 완벽히 맞추어 병합 중입니다.
              </Typography>
            </Box>
          ) : (
            mergedResultUrl && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <video
                  controls
                  autoPlay
                  loop
                  src={mergedResultUrl}
                  style={{
                    width: '100%',
                    maxHeight: 280,
                    borderRadius: 12,
                    backgroundColor: '#000000',
                  }}
                />
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    포맷: WebM (고화질 VP9)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    총 {clips.length}개 클립 병합 완료 ({formatTime(totalDuration)})
                  </Typography>
                </Box>
              </Box>
            )
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isExporting ? (
            <Button variant="outlined" color="error" onClick={handleCancelExport}>
              병합 취소
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={() => setIsExportDialogOpen(false)}>
                닫기
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadResult}
                sx={{ fontWeight: 800 }}
              >
                병합 비디오 다운로드 (.webm)
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 4. Single Clip Preview Dialog */}
      <Dialog
        open={Boolean(previewModalClip)}
        onClose={() => setPreviewModalClip(null)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{previewModalClip?.name}</DialogTitle>
        <DialogContent dividers>
          {previewModalClip && (
            <video
              controls
              autoPlay
              src={previewModalClip.previewUrl}
              style={{ width: '100%', maxHeight: 400, borderRadius: 8, backgroundColor: '#000000' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewModalClip(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
