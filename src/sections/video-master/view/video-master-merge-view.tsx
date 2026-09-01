'use client';

import type { MergeClipData, MergeExportSettings } from '../utils/video-merge-processor';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  createSampleMergeClips,
  exportMergedVideoSequentially,
} from '../utils/video-merge-processor';

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
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);

  // Sequence Live Preview State
  const [previewClipIndex, setPreviewClipIndex] = useState<number>(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [sequenceCurrentTime, setSequenceCurrentTime] = useState<number>(0);

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

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sequenceVideoRef = useRef<HTMLVideoElement | null>(null);
  const exportAbortControllerRef = useRef<AbortController | null>(null);

  // Add Files Handler
  const handleAddFiles = useCallback((files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.isArray(files) ? files : Array.from(files);

    fileArray.forEach((file) => {
      if (!file.type.startsWith('video/')) return;
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // 1-Click Multi Sample Video Generator
  const handleLoadSampleClips = async () => {
    setIsLoadingSamples(true);
    try {
      const sampleFiles = await createSampleMergeClips();
      handleAddFiles(sampleFiles);
      toast.success('3개의 테스트 샘플 비디오 클립이 생성되어 로드되었습니다.');
    } catch {
      toast.error('샘플 비디오 생성 실패');
    } finally {
      setIsLoadingSamples(false);
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
    setExportElapsedSec(0);
    setExportCurrentClipIdx(1);
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
        (percent, currentClipIdx, total, elapsed) => {
          setExportProgress(percent);
          setExportCurrentClipIdx(currentClipIdx);
          setExportElapsedSec(elapsed);
        },
        abortController.signal
      );

      const resultUrl = URL.createObjectURL(mergedBlob);
      setMergedResultUrl(resultUrl);
      toast.success(`총 ${clips.length}개 비디오의 병합이 성공적으로 완료되었습니다!`);
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('취소') || (err as Error)?.message?.includes('중단')) {
        toast.info('비디오 병합이 취소되었습니다.');
      } else {
        toast.error('비디오 병합 중 오류가 발생했습니다.');
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

  const handleDownloadMerged = () => {
    if (!mergedResultUrl) return;
    const link = document.createElement('a');
    link.href = mergedResultUrl;
    link.download = `merged_${clips.length}_clips_${Date.now()}.webm`;
    link.click();
    toast.success('병합된 동영상 다운로드를 시작합니다.');
  };

  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0);
  const totalSize = clips.reduce((acc, c) => acc + (c.size || 0), 0);

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* 1. Header Bar */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          bgcolor: 'background.paper',
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
            <CallMergeRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              동영상 붙이기 (Video Merger & Concatenator)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              다중 클립 무손실 순차 합성 · 비율 맞춤 · 오디오 믹싱 · 실시간 시퀀스 미리보기
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={RouterLink}
            href={paths.videoMaster.root}
            size="small"
            variant="soft"
            color="inherit"
            startIcon={<MovieRoundedIcon />}
          >
            종합 편집기
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<ScienceRoundedIcon />}
            onClick={handleLoadSampleClips}
            disabled={isLoadingSamples}
          >
            {isLoadingSamples ? '생성 중...' : '3종 샘플 영상 불러오기'}
          </Button>

          <Button
            size="small"
            variant="contained"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
          >
            클립 추가
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="video/*"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </Button>
        </Box>
      </Box>

      {/* 2. Main Workspace Layout */}
      {clips.length === 0 ? (
        /* Empty State Dropzone */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            sx={{
              maxWidth: 640,
              width: '100%',
              p: 6,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              bgcolor: isDragOver ? 'action.hover' : 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 2.5,
              cursor: 'pointer',
              boxShadow: 2,
              transition: 'all 0.2s',
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CallMergeRoundedIcon sx={{ fontSize: 40 }} />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                이어붙이고 싶은 동영상 파일들을 드롭하세요 (다중 선택 가능)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                여러 개의 MP4, WebM, MOV 영상을 순서대로 매끄럽게 하나로 병합합니다
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="contained" color="primary">
                내 컴퓨터에서 파일 선택하기
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ScienceRoundedIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSampleClips();
                }}
              >
                테스트 샘플 클립 3종 즉시 생성
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Active Workspace: Left Player & Clip List vs Right Settings */
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 380px', lg: '1fr 420px' },
            overflow: 'hidden',
          }}
        >
          {/* Left: Sequence Player & Reorderable Clip List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, sm: 3 },
              gap: 2.5,
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.neutral',
            }}
          >
            {/* Sequence Live Preview Player */}
            <Card
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 240, sm: 340, md: 380 },
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
                <Chip
                  label={`클립 #${previewClipIndex + 1}/${clips.length}`}
                  size="small"
                  color="primary"
                  sx={{ height: 22, fontWeight: 800 }}
                />
                <span>{currentClip?.name}</span>
                <span style={{ color: '#00A76F' }}>
                  ({formatTime(sequenceCurrentTime)} / {formatTime(currentClip?.duration || 0)})
                </span>
              </Box>

              {/* Transport Overlay Button */}
              <IconButton
                onClick={toggleSequencePlayPause}
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: 'rgba(0, 167, 111, 0.9)',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'primary.main' },
                }}
              >
                {isSequencePlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              </IconButton>
            </Card>

            {/* Sequence Summary HUD & Actions */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    총 {clips.length}개 클립
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    합산 예상 길이:{' '}
                    <span style={{ color: '#00A76F', fontWeight: 800 }}>
                      {formatTime(totalDuration)}
                    </span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ({formatBytes(totalSize)})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant="soft"
                    color="primary"
                    component="label"
                    startIcon={<AddRoundedIcon />}
                  >
                    클립 추가
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="video/*"
                      onChange={(e) => handleAddFiles(e.target.files)}
                    />
                  </Button>
                  <Button
                    size="small"
                    variant="soft"
                    color="error"
                    startIcon={<DeleteSweepRoundedIcon />}
                    onClick={handleClearAll}
                  >
                    전체 비우기
                  </Button>
                </Box>
              </Box>
            </Card>

            {/* Reorderable Clip List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, px: 0.5 }}>
                📋 병합 시퀀스 목록 (위에서 아래 순서로 이어붙여집니다)
              </Typography>

              {clips.map((clip, index) => {
                const isSelectedForPreview = previewClipIndex === index;
                return (
                  <Card
                    key={clip.id}
                    onClick={() => {
                      setPreviewClipIndex(index);
                      setIsSequencePlaying(true);
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '2px solid',
                      borderColor: isSelectedForPreview ? 'primary.main' : 'divider',
                      bgcolor: isSelectedForPreview ? 'primary.lighter' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelectedForPreview ? 2 : 0,
                    }}
                  >
                    {/* Number Badge */}
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: isSelectedForPreview ? 'primary.main' : 'background.neutral',
                        color: isSelectedForPreview ? '#FFFFFF' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>

                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 80,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: '#000000',
                        backgroundImage: clip.thumbnailUrl ? `url(${clip.thumbnailUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!clip.thumbnailUrl && (
                        <MovieRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      )}
                    </Box>

                    {/* Title & Metadata */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                        {clip.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block' }}
                      >
                        {formatTime(clip.duration)} · {clip.width}x{clip.height} ·{' '}
                        {formatBytes(clip.size)}
                      </Typography>
                    </Box>

                    {/* Reorder & Action Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="위로 이동">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveUp(index);
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUpwardRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="아래로 이동">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveDown(index);
                            }}
                            disabled={index === clips.length - 1}
                          >
                            <ArrowDownwardRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="클립 삭제">
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
                      </Tooltip>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>

          {/* Right Sidebar: Merge Output Specifications */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              overflowY: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              병합 출력 규격 & 설정
            </Typography>

            {/* 1. Canvas Output Resolution */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                📐 출력 캔버스 해상도
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
                  label={<Typography variant="body2">1080p FHD (1920x1080 · 16:9)</Typography>}
                />
                <FormControlLabel
                  value="720p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">720p HD (1280x720 · 16:9)</Typography>}
                />
                <FormControlLabel
                  value="vertical"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">9:16 쇼츠 / 릴스 (1080x1920 세로)</Typography>}
                />
                <FormControlLabel
                  value="square"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">1:1 정사각 (1080x1080 인스타)</Typography>}
                />
                <FormControlLabel
                  value="first-clip"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      첫 번째 클립 기준 맞춤 ({clips[0]?.width || 1280}x{clips[0]?.height || 720})
                    </Typography>
                  }
                />
              </RadioGroup>
            </Card>

            {/* 2. Fit Mode & Aspect Ratio Strategy */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                🖼️ 화면 비율 맞춤 방식
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  variant={fitMode === 'contain' ? 'contained' : 'outlined'}
                  color={fitMode === 'contain' ? 'primary' : 'inherit'}
                  onClick={() => setFitMode('contain')}
                  sx={{ flex: 1, fontSize: '0.8rem' }}
                >
                  비율 유지 (레터박스)
                </Button>
                <Button
                  size="small"
                  variant={fitMode === 'cover' ? 'contained' : 'outlined'}
                  color={fitMode === 'cover' ? 'primary' : 'inherit'}
                  onClick={() => setFitMode('cover')}
                  sx={{ flex: 1, fontSize: '0.8rem' }}
                >
                  꽉 채우기 (크롭)
                </Button>
              </Box>

              {/* Background Color Picker */}
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
              >
                여백 배경색 선택
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {[
                  { color: '#000000', label: '블랙' },
                  { color: '#0F172A', label: '슬레이트' },
                  { color: '#27272A', label: '다크그레이' },
                  { color: '#FFFFFF', label: '화이트' },
                ].map((c) => (
                  <Tooltip key={c.color} title={c.label}>
                    <Box
                      onClick={() => setBackgroundColor(c.color)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: c.color,
                        border: '2px solid',
                        borderColor: backgroundColor === c.color ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        boxShadow: 1,
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Card>

            {/* 3. Bitrate Quality */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
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

            {/* 4. Merge Execution Button */}
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CallMergeRoundedIcon />}
                onClick={handleStartMerge}
                disabled={isExporting || clips.length < 2}
                sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
              >
                {clips.length >= 2
                  ? `총 ${clips.length}개 클립 하나로 병합하기 (${formatTime(totalDuration)})`
                  : '클립을 2개 이상 추가해 주세요'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* 3. Export Progress & Download Dialog */}
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
          <span>{isExporting ? '동영상 순차 병합 인코딩 중...' : '🎉 동영상 병합 완료!'}</span>
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
              <Chip
                label={`${exportCurrentClipIdx} / ${clips.length} 번째 클립 합성 중...`}
                color="primary"
                sx={{ fontWeight: 800, alignSelf: 'center' }}
              />

              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{ height: 10, borderRadius: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  전체 진행률: {exportProgress}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  경과 시간: {exportElapsedSec}초
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                💡 Web Audio API와 캔버스 렌더러를 통해 무손실 오디오와 매끄러운 화면 전환으로
                병합하고 있습니다.
              </Typography>
            </Box>
          ) : (
            mergedResultUrl && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <video
                  controls
                  autoPlay
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
                    병합 완료 ({clips.length}개 클립)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    총 재생 시간: {formatTime(totalDuration)}
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
                onClick={handleDownloadMerged}
                sx={{ fontWeight: 800 }}
              >
                병합 비디오 다운로드 (.webm)
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
