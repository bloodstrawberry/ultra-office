'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Replay5RoundedIcon from '@mui/icons-material/Replay5Rounded';
import Forward5RoundedIcon from '@mui/icons-material/Forward5Rounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  exportTrimmedVideo,
  createSampleTrimVideo,
  extractVideoThumbnails,
} from '../utils/video-trim-processor';

import type { VideoThumbnailItem, VideoTrimSettings } from '../utils/video-trim-processor';

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

export function VideoMasterTrimView() {
  // Video Source & Metadata
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(1280);
  const [videoHeight, setVideoHeight] = useState<number>(720);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Filmstrip Thumbnails
  const [thumbnails, setThumbnails] = useState<VideoThumbnailItem[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoopingTrim, setIsLoopingTrim] = useState<boolean>(true);

  // Trim Range
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 10]);

  // Export Settings
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p'>('original');
  const [quality, setQuality] = useState<'high' | 'medium' | 'standard'>('high');
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [exportedResultUrl, setExportedResultUrl] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const exportAbortControllerRef = useRef<AbortController | null>(null);

  // Handle Video File Load
  const handleLoadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setCurrentTime(0);
    setIsPlaying(false);
    setExportedResultUrl(null);

    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 10;
      const w = tempVideo.videoWidth || 1280;
      const h = tempVideo.videoHeight || 720;
      setDuration(dur);
      setTrimRange([0, dur]);
      setVideoWidth(w);
      setVideoHeight(h);

      toast.success(`'${file.name}' 비디오가 로드되었습니다.`);

      // Extract thumbnails
      setIsLoadingThumbnails(true);
      extractVideoThumbnails(url, 12)
        .then((thumbs) => {
          setThumbnails(thumbs);
        })
        .finally(() => {
          setIsLoadingThumbnails(false);
        });
    };
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLoadFile(file);
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

  // 1-Click Sample Video
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const sampleFile = await createSampleTrimVideo(8);
      handleLoadFile(sampleFile);
    } catch {
      toast.error('샘플 비디오 생성 실패');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Playback Control Handlers
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime >= trimRange[1] || video.currentTime < trimRange[0]) {
        video.currentTime = trimRange[0];
      }
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    // Loop within trim range
    if (isLoopingTrim && video.currentTime >= trimRange[1]) {
      video.currentTime = trimRange[0];
      if (isPlaying) video.play();
    } else if (!isLoopingTrim && video.currentTime >= trimRange[1]) {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
  };

  const handleSetStartAsCurrent = () => {
    const newStart = Math.min(currentTime, trimRange[1] - 0.1);
    setTrimRange([newStart, trimRange[1]]);
    toast.info(`시작점을 ${formatTime(newStart)} 로 설정했습니다.`);
  };

  const handleSetEndAsCurrent = () => {
    const newEnd = Math.max(currentTime, trimRange[0] + 0.1);
    setTrimRange([trimRange[0], newEnd]);
    toast.info(`종료점을 ${formatTime(newEnd)} 로 설정했습니다.`);
  };

  const handlePlayTrimmedSection = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = trimRange[0];
    video.playbackRate = playbackRate;
    video.play();
    setIsPlaying(true);
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

  // Video Export Execution
  const handleStartExport = async () => {
    if (!videoUrl) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportElapsedSec(0);
    setIsExportDialogOpen(true);

    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;

    const settings: VideoTrimSettings = {
      startTime: trimRange[0],
      endTime: trimRange[1],
      playbackRate,
      muteAudio,
      resolution,
      quality,
    };

    try {
      const blob = await exportTrimmedVideo(
        videoUrl,
        settings,
        (percent, elapsed) => {
          setExportProgress(percent);
          setExportElapsedSec(elapsed);
        },
        abortController.signal
      );

      const resultUrl = URL.createObjectURL(blob);
      setExportedResultUrl(resultUrl);
      toast.success('동영상 자르기 인코딩이 완료되었습니다!');
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('중단') || (err as Error)?.message?.includes('취소')) {
        toast.info('인코딩이 취소되었습니다.');
      } else {
        toast.error('동영상 인코딩 중 오류가 발생했습니다.');
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
    link.download = `trimmed_${videoFile?.name?.replace(/\.[^/.]+$/, '') || 'video'}_${Date.now()}.webm`;
    link.click();
    toast.success('비디오 다운로드를 시작합니다.');
  };

  const trimDuration = Math.max(0, trimRange[1] - trimRange[0]);

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
      {/* 1. Header Navigation Bar */}
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
            <ContentCutRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              동영상 자르기 (Video Trimmer)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              타임라인 필름스트립 · 0.1초 단위 정밀 구간 자르기 · 무손실 오디오 인코딩
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
            onClick={handleLoadSample}
            disabled={isLoadingSample}
          >
            {isLoadingSample ? '생성 중...' : '샘플 영상'}
          </Button>

          <Button
            size="small"
            variant="contained"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
          >
            영상 열기
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="video/*"
              onChange={handleFileInput}
            />
          </Button>
        </Box>
      </Box>

      {/* 2. Main Body Area */}
      {!videoUrl ? (
        /* Empty Dropzone State */
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
              <ContentCutRoundedIcon sx={{ fontSize: 40 }} />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                자르고 싶은 동영상 파일을 이곳에 드롭하세요
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                MP4, WebM, MOV, MKV, AVI 등 지원 (브라우저 로컬 100% 안전 처리)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="contained" color="primary">
                내 컴퓨터에서 동영상 찾기
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ScienceRoundedIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
              >
                테스트 샘플 영상 로드
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Active Video Workspace */
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 380px', lg: '1fr 420px' },
            overflow: 'hidden',
          }}
        >
          {/* Left: Player & Interactive Filmstrip Timeline */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, sm: 3 },
              gap: 2,
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.neutral',
            }}
          >
            {/* Video Viewport Container */}
            <Card
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 260, sm: 380, md: 440 },
                boxShadow: 3,
              }}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                style={{ width: '100%', height: '100%', maxHeight: '55vh', objectFit: 'contain' }}
              />

              {/* Timecode Watermark Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  bgcolor: 'rgba(0,0,0,0.75)',
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
                <span>{formatTime(currentTime)}</span>
                <span style={{ color: '#9E9E9E' }}>/</span>
                <span style={{ color: '#00A76F' }}>{formatTime(duration)}</span>
              </Box>

              {/* Resolution Tag */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'rgba(0,0,0,0.75)',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {videoWidth}x{videoHeight}
              </Box>
            </Card>

            {/* Transport Player Controls */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                {/* Play, Pause, Jump */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton color="inherit" onClick={() => handleSkip(-5)}>
                    <Replay5RoundedIcon />
                  </IconButton>

                  <IconButton
                    color="primary"
                    onClick={togglePlayPause}
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: 'primary.lighter',
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                  >
                    {isPlaying ? (
                      <PauseRoundedIcon sx={{ fontSize: 28 }} />
                    ) : (
                      <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />
                    )}
                  </IconButton>

                  <IconButton color="inherit" onClick={() => handleSkip(5)}>
                    <Forward5RoundedIcon />
                  </IconButton>
                </Box>

                {/* Section Quick Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="현재 재생 위치를 시작점으로 지정">
                    <Button
                      size="small"
                      variant="soft"
                      color="primary"
                      startIcon={<FlagRoundedIcon />}
                      onClick={handleSetStartAsCurrent}
                    >
                      시작점 설정
                    </Button>
                  </Tooltip>

                  <Tooltip title="현재 재생 위치를 종료점으로 지정">
                    <Button
                      size="small"
                      variant="soft"
                      color="primary"
                      startIcon={<SportsScoreRoundedIcon />}
                      onClick={handleSetEndAsCurrent}
                    >
                      종료점 설정
                    </Button>
                  </Tooltip>

                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<PlayArrowRoundedIcon />}
                    onClick={handlePlayTrimmedSection}
                  >
                    구간만 재생
                  </Button>
                </Box>

                {/* Volume & Loop */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={toggleMute}
                    color={isMuted ? 'error' : 'inherit'}
                  >
                    {isMuted || volume === 0 ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
                  </IconButton>
                  <Slider
                    size="small"
                    value={isMuted ? 0 : volume}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(_, val) => handleVolumeChange(val as number)}
                    sx={{ width: 70 }}
                  />

                  <Tooltip title="구간 루프(반복) 재생 토글">
                    <IconButton
                      size="small"
                      color={isLoopingTrim ? 'primary' : 'default'}
                      onClick={() => setIsLoopingTrim(!isLoopingTrim)}
                    >
                      <LoopRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>

            {/* Visual Filmstrip & Timeline Scrubber */}
            <Card sx={{ p: 2.5, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  🎞️ 타임라인 필름스트립
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  클릭하여 원하는 시점으로 탐색할 수 있습니다
                </Typography>
              </Box>

              {/* Filmstrip Strip */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 68,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: '#000000',
                  display: 'flex',
                  userSelect: 'none',
                  mb: 1.5,
                }}
              >
                {thumbnails.length > 0 ? (
                  thumbnails.map((t, idx) => (
                    <Box
                      key={idx}
                      onClick={() => handleSeek(t.time)}
                      sx={{
                        flex: 1,
                        height: '100%',
                        backgroundImage: `url(${t.dataUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        opacity: 0.85,
                        '&:hover': { opacity: 1 },
                      }}
                    />
                  ))
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                    }}
                  >
                    {isLoadingThumbnails ? '프레임 썸네일 생성 중...' : '동영상 프레임 로드 완료'}
                  </Box>
                )}

                {/* Trimmed Selection Highlight Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(trimRange[0] / Math.max(1, duration)) * 100}%`,
                    width: `${((trimRange[1] - trimRange[0]) / Math.max(1, duration)) * 100}%`,
                    bgcolor: 'rgba(0, 167, 111, 0.25)',
                    borderLeft: '3px solid #00A76F',
                    borderRight: '3px solid #00A76F',
                    pointerEvents: 'none',
                  }}
                />

                {/* Current Playhead Needle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(currentTime / Math.max(1, duration)) * 100}%`,
                    width: '2px',
                    bgcolor: '#FF5630',
                    boxShadow: '0 0 6px rgba(255,86,48,0.9)',
                    pointerEvents: 'none',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: -4,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#FF5630',
                    },
                  }}
                />
              </Box>

              {/* Dual Range Slider */}
              <Box sx={{ px: 1 }}>
                <Slider
                  value={trimRange}
                  min={0}
                  max={duration || 10}
                  step={0.1}
                  onChange={(_, val) => {
                    if (Array.isArray(val)) {
                      setTrimRange([val[0], val[1]]);
                      handleSeek(val[0]);
                    }
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => formatTime(v)}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 18,
                      height: 18,
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 0 4px rgba(0, 167, 111, 0.16)',
                    },
                    '& .MuiSlider-track': { height: 6 },
                    '& .MuiSlider-rail': { height: 6, opacity: 0.3 },
                  }}
                />
              </Box>

              {/* Range Info Bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'background.neutral',
                  p: 1.5,
                  borderRadius: 1.5,
                  mt: 1,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    시작 시간 (Start)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                    {formatTime(trimRange[0])}
                  </Typography>
                </Box>

                <Chip
                  label={`자른 총 길이: ${trimDuration.toFixed(1)}초`}
                  color="primary"
                  variant="soft"
                  sx={{ fontWeight: 700 }}
                />

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    종료 시간 (End)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                    {formatTime(trimRange[1])}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Right Sidebar: Trim Fine Adjustment & Export Options */}
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
              자르기 & 내보내기 설정
            </Typography>

            {/* 1. Precision Timecode Inputs */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                ⏱️ 정밀 시간 직접 입력 (초 단위)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="시작 시간 (초)"
                  type="number"
                  value={parseFloat(trimRange[0].toFixed(2))}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(Number(e.target.value), trimRange[1] - 0.1));
                    setTrimRange([val, trimRange[1]]);
                  }}
                  inputProps={{ step: 0.1, min: 0, max: duration }}
                />
                <TextField
                  size="small"
                  label="종료 시간 (초)"
                  type="number"
                  value={parseFloat(trimRange[1].toFixed(2))}
                  onChange={(e) => {
                    const val = Math.min(
                      duration,
                      Math.max(Number(e.target.value), trimRange[0] + 0.1)
                    );
                    setTrimRange([trimRange[0], val]);
                  }}
                  inputProps={{ step: 0.1, min: 0, max: duration }}
                />
              </Box>
            </Card>

            {/* 2. Playback Speed Selector */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  ⚡ 재생 배속
                </Typography>
                <Chip
                  label={`${playbackRate}x`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((rate) => (
                  <Button
                    key={rate}
                    size="small"
                    variant={playbackRate === rate ? 'contained' : 'outlined'}
                    color={playbackRate === rate ? 'primary' : 'inherit'}
                    onClick={() => {
                      setPlaybackRate(rate);
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                    }}
                    sx={{ minWidth: 46, py: 0.4, fontSize: '0.75rem' }}
                  >
                    {rate}x
                  </Button>
                ))}
              </Box>
            </Card>

            {/* 3. Resolution & Quality */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                📐 출력 해상도
              </Typography>
              <RadioGroup
                value={resolution}
                onChange={(e) =>
                  setResolution(e.target.value as 'original' | '1080p' | '720p' | '480p')
                }
              >
                <FormControlLabel
                  value="original"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      원본 해상도 ({videoWidth}x{videoHeight})
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="1080p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">FHD 1080p (고선명)</Typography>}
                />
                <FormControlLabel
                  value="720p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">HD 720p (표준 웹)</Typography>}
                />
                <FormControlLabel
                  value="480p"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">SD 480p (용량 절약)</Typography>}
                />
              </RadioGroup>
            </Card>

            {/* 4. Bitrate Quality & Audio Mute */}
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                🎚️ 비트레이트 품질
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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

              <FormControlLabel
                control={
                  <Switch
                    checked={muteAudio}
                    onChange={(e) => setMuteAudio(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2">소리 제거 (오디오 음소거)</Typography>}
              />
            </Card>

            {/* 5. Main Export Button */}
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleStartExport}
                disabled={isExporting}
                sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
              >
                자른 구간 내보내기 ({trimDuration.toFixed(1)}초)
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                component="label"
                startIcon={<RefreshRoundedIcon />}
              >
                다른 영상으로 변경
                <input type="file" hidden accept="video/*" onChange={handleFileInput} />
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
          <span>{isExporting ? '동영상 자르기 인코딩 중...' : '🎉 자르기 완료!'}</span>
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
                  진행률: {exportProgress}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  경과 시간: {exportElapsedSec}초
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                💡 브라우저 Web Audio API와 캔버스를 통해 고품질 비디오로 인코딩하고 있습니다.
              </Typography>
            </Box>
          ) : (
            exportedResultUrl && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <video
                  controls
                  autoPlay
                  loop
                  src={exportedResultUrl}
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
                    결과물 포맷: WebM (고화질 VP9/Opus)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    구간: {trimDuration.toFixed(1)}초
                  </Typography>
                </Box>
              </Box>
            )
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isExporting ? (
            <Button variant="outlined" color="error" onClick={handleCancelExport}>
              인코딩 취소
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
                비디오 다운로드 (.webm)
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
