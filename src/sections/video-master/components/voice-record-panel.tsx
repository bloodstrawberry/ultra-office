'use client';

import type { VideoStudioAudioItem } from '../types';
import type {
  AudioRecordingResult,
  AudioRecordingSourceType,
} from '../utils/voice-recorder-processor';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import LinearProgress from '@mui/material/LinearProgress';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

import {
  createAudioAnalyser,
  AudioRecorderManager,
  convertBlobToAudioFormat,
} from '../utils/voice-recorder-processor';

// ----------------------------------------------------------------------

interface VoiceRecordPanelProps {
  currentPlayheadTime: number;
  onAddAudioClip: (clip: VideoStudioAudioItem) => void;
  onStartSyncPlayback?: () => void;
  onStopSyncPlayback?: () => void;
}

export function VoiceRecordPanel({
  currentPlayheadTime,
  onAddAudioClip,
  onStartSyncPlayback,
  onStopSyncPlayback,
}: VoiceRecordPanelProps) {
  // Recording Options
  const [sourceType, setSourceType] = useState<AudioRecordingSourceType>('mic');
  const [syncVideoPlayback, setSyncVideoPlayback] = useState<boolean>(true);

  // Recording Status
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // Result
  const [recordedResult, setRecordedResult] = useState<AudioRecordingResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertPhase, setConvertPhase] = useState<string>('');

  // Refs
  const recorderRef = useRef<AudioRecorderManager | null>(null);
  const analyserCleanupRef = useRef<(() => void) | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(
    () => () => {
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
      if (analyserCleanupRef.current) {
        analyserCleanupRef.current();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  // ─── 1. Start Recording ───
  const handleStartRecording = async () => {
    try {
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
      const manager = new AudioRecorderManager();
      recorderRef.current = manager;

      const stream = await manager.start(sourceType, (result) => {
        setRecordedResult(result);
        setIsRecording(false);
        setIsPaused(false);
        if (onStopSyncPlayback) onStopSyncPlayback();
        toast.success(`음성 녹음이 완료되었습니다! (${result.duration.toFixed(1)}초)`);
      });

      // Setup Visualizer & Analyser
      const { analyser, cleanup } = createAudioAnalyser(stream);
      analyserCleanupRef.current = cleanup;

      // Draw loop for Waveform & Volume
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume (0 - 100)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));

        // Draw Waveform to Canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / dataArray.length) * 2.2;
            let x = 0;
            for (let i = 0; i < dataArray.length; i += 1) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
              gradient.addColorStop(0, '#3b82f6');
              gradient.addColorStop(0.6, '#06b6d4');
              gradient.addColorStop(1, '#ef4444');
              ctx.fillStyle = gradient;
              ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
              x += barWidth;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };
      animationFrameRef.current = requestAnimationFrame(draw);

      // Start Timer
      setElapsedTimeSec(0);
      const startMs = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedTimeSec((Date.now() - startMs) / 1000);
      }, 100);

      setIsRecording(true);
      setIsPaused(false);
      setRecordedResult(null);

      // Trigger video playback sync if enabled
      if (syncVideoPlayback && onStartSyncPlayback) {
        onStartSyncPlayback();
      }

      toast.info('녹음이 시작되었습니다. 마이크/사운드를 입력하세요.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '녹음 시작 중 오류가 발생했습니다.';
      toast.error(msg);
      if (onStopSyncPlayback) onStopSyncPlayback();
    }
  };

  // ─── 2. Pause / Resume Recording ───
  const handleTogglePause = () => {
    if (!recorderRef.current) return;
    if (isPaused) {
      recorderRef.current.resume();
      setIsPaused(false);
      if (syncVideoPlayback && onStartSyncPlayback) {
        onStartSyncPlayback();
      }
      toast.info('녹음을 재개합니다.');
    } else {
      recorderRef.current.pause();
      setIsPaused(true);
      if (onStopSyncPlayback) {
        onStopSyncPlayback();
      }
      toast.info('녹음이 일시 정지되었습니다.');
    }
  };

  // ─── 3. Stop Recording ───
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (analyserCleanupRef.current) {
      analyserCleanupRef.current();
      analyserCleanupRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    if (onStopSyncPlayback) {
      onStopSyncPlayback();
    }
  };

  // ─── 4. Reset Recording ───
  const handleResetRecording = () => {
    handleStopRecording();
    setRecordedResult(null);
    setElapsedTimeSec(0);
    setVolumeLevel(0);
  };

  // ─── 5. Insert Audio Clip into Timeline ───
  const handleInsertToTimeline = () => {
    if (!recordedResult) return;

    const sourceLabel =
      recordedResult.sourceType === 'system'
        ? '시스템 사운드'
        : recordedResult.sourceType === 'mixed'
          ? '마이크+시스템 믹싱'
          : '보이스오버';

    const newClip: VideoStudioAudioItem = {
      id: `audio-${Date.now()}`,
      name: `${sourceLabel} (${recordedResult.duration.toFixed(1)}s)`,
      blob: recordedResult.blob,
      src: recordedResult.url,
      startTime: currentPlayheadTime,
      duration: recordedResult.duration,
      volume: 1.0,
      mute: false,
      sourceType: recordedResult.sourceType,
    };

    onAddAudioClip(newClip);
    toast.success(
      `타임라인 ${currentPlayheadTime.toFixed(1)}초 위치에 오디오 트랙이 추가되었습니다!`
    );
  };

  // ─── 6. Download Audio File (WAV or MP3) ───
  const handleDownloadFile = async (format: 'wav' | 'mp3' | 'webm') => {
    if (!recordedResult) return;

    if (format === 'webm') {
      const a = document.createElement('a');
      a.href = recordedResult.url;
      a.download = `voice-recording-${Date.now()}.webm`;
      a.click();
      return;
    }

    setIsConverting(true);
    setConvertPhase(`${format.toUpperCase()} 파일로 변환 중...`);

    try {
      const convertedBlob = await convertBlobToAudioFormat(
        recordedResult.blob,
        format,
        (percent) => {
          setConvertPhase(`${format.toUpperCase()} 인코딩 중... (${percent}%)`);
        }
      );

      const downloadUrl = URL.createObjectURL(convertedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `voice-recording-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success(`${format.toUpperCase()} 오디오 파일 다운로드가 완료되었습니다.`);
    } catch {
      toast.error('오디오 변환에 실패했습니다.');
    } finally {
      setIsConverting(false);
      setConvertPhase('');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toFixed(1).padStart(4, '0');
    return `${m}:${s}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Title & Intro */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: 'error.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MicRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            음성 녹음 & 보이스오버 스튜디오
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            마이크 내레이션 및 윈도우 전체 사운드를 녹음하여 타임라인에 삽입합니다.
          </Typography>
        </Box>
      </Box>

      {/* ─── Source Selector ─── */}
      <Card sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>
          녹음 입력 소스 선택
        </Typography>

        <RadioGroup
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as AudioRecordingSourceType)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}
        >
          <Box
            onClick={() => !isRecording && setSourceType('mic')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 0.8,
              px: 1.2,
              borderRadius: 1,
              bgcolor: sourceType === 'mic' ? 'action.selected' : 'transparent',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              opacity: isRecording && sourceType !== 'mic' ? 0.5 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MicRoundedIcon fontSize="small" color={sourceType === 'mic' ? 'error' : 'inherit'} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  마이크 음성 (내레이션/더빙)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  외장/내장 마이크로 목소리 해설 녹음
                </Typography>
              </Box>
            </Box>
            <Radio checked={sourceType === 'mic'} disabled={isRecording} size="small" />
          </Box>

          <Box
            onClick={() => !isRecording && setSourceType('system')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 0.8,
              px: 1.2,
              borderRadius: 1,
              bgcolor: sourceType === 'system' ? 'action.selected' : 'transparent',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              opacity: isRecording && sourceType !== 'system' ? 0.5 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpRoundedIcon
                fontSize="small"
                color={sourceType === 'system' ? 'primary' : 'inherit'}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  윈도우 전체 사운드 (시스템 오디오)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  유튜브, 게임, BGM 등 컴퓨터 전체 출력 소리
                </Typography>
              </Box>
            </Box>
            <Radio checked={sourceType === 'system'} disabled={isRecording} size="small" />
          </Box>

          <Box
            onClick={() => !isRecording && setSourceType('mixed')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 0.8,
              px: 1.2,
              borderRadius: 1,
              bgcolor: sourceType === 'mixed' ? 'action.selected' : 'transparent',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              opacity: isRecording && sourceType !== 'mixed' ? 0.5 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GraphicEqRoundedIcon
                fontSize="small"
                color={sourceType === 'mixed' ? 'secondary' : 'inherit'}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  마이크 + 윈도우 사운드 (동시 믹싱)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  컴퓨터 소리와 내 목소리를 하나로 합성 녹음
                </Typography>
              </Box>
            </Box>
            <Radio checked={sourceType === 'mixed'} disabled={isRecording} size="small" />
          </Box>
        </RadioGroup>

        {/* Sync Playback Option */}
        <Box
          sx={{
            mt: 1.2,
            pt: 1.2,
            borderTop: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
              녹음 시작 시 동영상 함께 재생 (비디오 싱크 더빙)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
              현재 타임라인 재생헤드 위치부터 영상 화면이 동시에 재생됩니다.
            </Typography>
          </Box>
          <Switch
            size="small"
            checked={syncVideoPlayback}
            onChange={(e) => setSyncVideoPlayback(e.target.checked)}
            disabled={isRecording}
          />
        </Box>
      </Card>

      {/* Guide Alert for System Audio */}
      {(sourceType === 'system' || sourceType === 'mixed') && (
        <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5 }}>
          <strong>💡 시스템 오디오 녹음 안내:</strong> [녹음 시작] 클릭 후 브라우저 공유 창에서{' '}
          <strong>[전체 화면]</strong>을 선택하고 하단 <strong>[시스템 오디오 공유]</strong>를
          반드시 체크해 주세요.
        </Alert>
      )}

      {/* ─── Realtime Waveform & Meter Box ─── */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiberManualRecordRoundedIcon
              sx={{
                fontSize: 14,
                color: isRecording ? (isPaused ? '#f59e0b' : '#ef4444') : '#64748b',
                animation: isRecording && !isPaused ? 'pulse 1.2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
              {isRecording
                ? isPaused
                  ? '녹음 일시정지'
                  : '실시간 녹음 중...'
                : recordedResult
                  ? '녹음 완료'
                  : '녹음 대기 중'}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}
          >
            {formatTimer(elapsedTimeSec)}
          </Typography>
        </Box>

        {/* Realtime Waveform Canvas */}
        <Box
          sx={{
            height: 64,
            width: '100%',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            width={320}
            height={64}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          {!isRecording && !recordedResult && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
              }}
            >
              녹음을 시작하면 실시간 오디오 파형이 표시됩니다
            </Box>
          )}
        </Box>

        {/* Realtime Volume Meter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#94a3b8', width: 36 }}>
            입력 레벨
          </Typography>
          <LinearProgress
            variant="determinate"
            value={volumeLevel}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: volumeLevel > 85 ? '#ef4444' : volumeLevel > 60 ? '#f59e0b' : '#10b981',
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ fontSize: '0.65rem', color: '#94a3b8', width: 28, textAlign: 'right' }}
          >
            {volumeLevel}%
          </Typography>
        </Box>

        {/* Recording Controls */}
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          {!isRecording ? (
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<FiberManualRecordRoundedIcon />}
              onClick={handleStartRecording}
              sx={{ fontWeight: 800, py: 1 }}
            >
              {recordedResult ? '새로 다시 녹음하기' : '🎙️ 녹음 시작'}
            </Button>
          ) : (
            <>
              <Button
                variant="soft"
                color={isPaused ? 'primary' : 'warning'}
                onClick={handleTogglePause}
                startIcon={isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
                sx={{ flex: 1, fontWeight: 700 }}
              >
                {isPaused ? '계속하기' : '일시정지'}
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={handleStopRecording}
                startIcon={<StopRoundedIcon />}
                sx={{ flex: 1.5, fontWeight: 800 }}
              >
                녹음 완료
              </Button>

              <Tooltip title="녹음 취소">
                <IconButton
                  size="small"
                  onClick={handleResetRecording}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <ReplayRoundedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Card>

      {/* ─── Recorded Result Area ─── */}
      {recordedResult && (
        <Card
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.light',
            bgcolor: 'primary.lighter',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AudiotrackRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  녹음된 오디오 클립 준비 완료
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  길이: {recordedResult.duration.toFixed(1)}초 · 크기:{' '}
                  {(recordedResult.sizeBytes / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Audio Previewer */}
          <Box
            component="audio"
            controls
            src={recordedResult.url}
            sx={{ width: '100%', height: 38 }}
          />

          {/* Primary Action: Add to Timeline */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<QueueMusicRoundedIcon />}
            onClick={handleInsertToTimeline}
            sx={{ fontWeight: 800, py: 1.2 }}
          >
            ➕ 타임라인(A1 오디오 트랙)에 삽입
          </Button>

          {/* Secondary Action: Download Files */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<DownloadRoundedIcon />}
              onClick={() => handleDownloadFile('mp3')}
              disabled={isConverting}
              sx={{ flex: 1, fontWeight: 700 }}
            >
              MP3 다운로드
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<DownloadRoundedIcon />}
              onClick={() => handleDownloadFile('wav')}
              disabled={isConverting}
              sx={{ flex: 1, fontWeight: 700 }}
            >
              WAV 다운로드
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => handleDownloadFile('webm')}
              disabled={isConverting}
              sx={{ fontWeight: 700 }}
            >
              WebM
            </Button>
          </Box>

          {isConverting && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {convertPhase}
              </Typography>
              <LinearProgress sx={{ height: 6, borderRadius: 1 }} />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
