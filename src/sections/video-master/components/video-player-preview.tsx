'use client';

import type {
  TransformSettings,
  WatermarkSettings,
  TextOverlaySettings,
  VideoFilterSettings,
} from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';

import { formatTime } from '../utils/audio-processor';
import { drawVideoFrameToCanvas } from '../utils/video-processor';

// ----------------------------------------------------------------------

interface VideoPlayerPreviewProps {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  filters?: VideoFilterSettings;
  transform?: TransformSettings;
  textOverlay?: TextOverlaySettings;
  watermark?: WatermarkSettings;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

export function VideoPlayerPreview({
  videoUrl,
  videoRef,
  canvasRef,
  filters,
  transform,
  textOverlay,
  watermark,
  currentTime,
  duration,
  onTimeUpdate,
  onDurationChange,
}: VideoPlayerPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Animation frame loop for canvas mirroring
  const renderCanvasFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawVideoFrameToCanvas(ctx, video, canvas.width, canvas.height, {
      filters,
      transform,
      textOverlay,
      watermark,
    });
  }, [videoRef, canvasRef, filters, transform, textOverlay, watermark]);

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      renderCanvasFrame();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [renderCanvasFrame]);

  // Adjust canvas size based on video dimensions
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    canvas.width = vw;
    canvas.height = vh;

    onDurationChange(video.duration || 0);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Array.isArray(value) ? value[0] : value;
    video.currentTime = target;
    onTimeUpdate(target);
    renderCanvasFrame();
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    onTimeUpdate(video.currentTime);
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <Card
      ref={containerRef}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        bgcolor: '#0b1120',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        position: 'relative',
        overflow: 'hidden',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[8],
      }}
    >
      {/* Hidden Source Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => {
          if (videoRef.current) {
            onTimeUpdate(videoRef.current.currentTime);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Screen Canvas Area */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          minHeight: 180,
          bgcolor: '#000000',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={togglePlay}
      >
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />

        {/* Center Play Overlay Icon when paused */}
        {!isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: 38 }} />
          </Box>
        )}
      </Box>

      {/* Timeline Scrubber */}
      <Box sx={{ px: 1 }}>
        <Slider
          size="small"
          value={currentTime}
          min={0}
          max={duration || 100}
          step={0.1}
          onChange={handleSeek}
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(32, 101, 209, 0.16)',
              },
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
          <Typography variant="caption" sx={{ color: 'grey.400', fontFamily: 'monospace' }}>
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'grey.400', fontFamily: 'monospace' }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Media Controls Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 0.5,
        }}
      >
        {/* Left: Playback buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}>
            <IconButton onClick={togglePlay} sx={{ color: '#ffffff' }}>
              {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="10초 뒤로">
            <IconButton onClick={() => handleSkip(-10)} sx={{ color: '#ffffff' }}>
              <Replay10RoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="10초 앞으로">
            <IconButton onClick={() => handleSkip(10)} sx={{ color: '#ffffff' }}>
              <Forward10RoundedIcon />
            </IconButton>
          </Tooltip>

          {/* Volume */}
          <Tooltip title={isMuted ? '음소거 해제' : '음소거'}>
            <IconButton onClick={handleToggleMute} sx={{ color: '#ffffff' }}>
              {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
            </IconButton>
          </Tooltip>

          <Slider
            size="small"
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.05}
            onChange={(_, val) => {
              const v = val as number;
              setVolume(v);
              if (videoRef.current) {
                videoRef.current.volume = v;
                videoRef.current.muted = v === 0;
                setIsMuted(v === 0);
              }
            }}
            sx={{ width: 70, color: 'grey.300', display: { xs: 'none', sm: 'inline-flex' } }}
          />
        </Box>

        {/* Right: Speed & Fullscreen */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            size="small"
            value={playbackRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            sx={{
              color: '#ffffff',
              height: 32,
              fontSize: '0.8rem',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
              '& .MuiSvgIcon-root': { color: '#ffffff' },
            }}
          >
            <MenuItem value={0.25}>0.25x</MenuItem>
            <MenuItem value={0.5}>0.5x</MenuItem>
            <MenuItem value={0.75}>0.75x</MenuItem>
            <MenuItem value={1.0}>1.0x (보통)</MenuItem>
            <MenuItem value={1.25}>1.25x</MenuItem>
            <MenuItem value={1.5}>1.5x</MenuItem>
            <MenuItem value={2.0}>2.0x (2배속)</MenuItem>
            <MenuItem value={4.0}>4.0x (타임랩스)</MenuItem>
          </Select>

          <Tooltip title="전체화면">
            <IconButton onClick={handleFullscreen} sx={{ color: '#ffffff' }}>
              <FullscreenRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
}
