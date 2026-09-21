'use client';

import type {
  AudioRecordingResult,
  AudioRecordingSourceType,
} from '../utils/voice-recorder-processor';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import LinearProgress from '@mui/material/LinearProgress';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  AudioRecorderManager,
  createAudioAnalyser,
  convertBlobToAudioFormat,
} from '../utils/voice-recorder-processor';

// ----------------------------------------------------------------------

interface RecordedHistoryItem extends AudioRecordingResult {
  id: string;
  createdAt: string;
  title: string;
}

export function VideoMasterVoiceRecordView() {
  const router = useRouter();

  // Recording State
  const [sourceType, setSourceType] = useState<AudioRecordingSourceType>('mic');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // Results & History
  const [historyList, setHistoryList] = useState<RecordedHistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<RecordedHistoryItem | null>(null);
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
        const item: RecordedHistoryItem = {
          ...result,
          id: `rec-${Date.now()}`,
          createdAt: new Date().toLocaleTimeString(),
          title:
            result.sourceType === 'system'
              ? '윈도우 시스템 사운드'
              : result.sourceType === 'mixed'
                ? '마이크+시스템 믹싱'
                : '마이크 음성 녹음',
        };

        setHistoryList((prev) => [item, ...prev]);
        setSelectedResult(item);
        setIsRecording(false);
        setIsPaused(false);
        toast.success(`녹음이 완료되었습니다! (${result.duration.toFixed(1)}초)`);
      });

      // Setup Analyser & Waveform
      const { analyser, cleanup } = createAudioAnalyser(stream);
      analyserCleanupRef.current = cleanup;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let x = 0;
            for (let i = 0; i < dataArray.length; i += 1) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
              gradient.addColorStop(0, '#3b82f6');
              gradient.addColorStop(0.5, '#06b6d4');
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
      toast.info('녹음이 시작되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '녹음 시작 실패';
      toast.error(msg);
    }
  };

  // ─── 2. Pause / Resume Recording ───
  const handleTogglePause = () => {
    if (!recorderRef.current) return;
    if (isPaused) {
      recorderRef.current.resume();
      setIsPaused(false);
      toast.info('녹음을 재개합니다.');
    } else {
      recorderRef.current.pause();
      setIsPaused(true);
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
  };

  // ─── 4. Reset ───
  const handleReset = () => {
    handleStopRecording();
    setElapsedTimeSec(0);
    setVolumeLevel(0);
  };

  // ─── 5. Download Audio File ───
  const handleDownload = async (item: RecordedHistoryItem, format: 'mp3' | 'wav' | 'webm') => {
    if (format === 'webm') {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = `${item.title}_${Date.now()}.webm`;
      a.click();
      return;
    }

    setIsConverting(true);
    setConvertPhase(`${format.toUpperCase()} 인코딩 중...`);

    try {
      const convertedBlob = await convertBlobToAudioFormat(item.blob, format, (p) => {
        setConvertPhase(`${format.toUpperCase()} 인코딩 중 (${p}%)...`);
      });

      const downloadUrl = URL.createObjectURL(convertedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${item.title}_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success(`${format.toUpperCase()} 다운로드가 완료되었습니다.`);
    } catch {
      toast.error('파일 변환에 실패했습니다.');
    } finally {
      setIsConverting(false);
      setConvertPhase('');
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryList((prev) => prev.filter((i) => i.id !== id));
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
    toast.success('기록이 삭제되었습니다.');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toFixed(1).padStart(4, '0');
    return `${m}:${s}`;
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
      {/* ─── 1. Header ─── */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
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
                bgcolor: 'error.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicRoundedIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              음성 & 시스템 사운드 녹음기
            </Typography>
            <Chip
              label="브라우저 100% 로컬 가속 녹음"
              size="small"
              color="error"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            마이크 목소리, 윈도우 컴퓨터 전체 사운드, 그리고 둘의 믹싱 오디오를 무제한으로 녹음하고
            MP3 / WAV로 다운로드합니다.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<MovieCreationRoundedIcon />}
          onClick={() => router.push(paths.videoMaster.root)}
          sx={{ fontWeight: 700 }}
        >
          동영상 편집기로 이동
        </Button>
      </Box>

      {/* ─── 2. Main Workspace Layout ─── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          flex: '1 1 auto',
          minHeight: 0,
          gap: 2,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Recording Console */}
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {/* Source Selection Card */}
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              1. 녹음 입력 소스 선택
            </Typography>

            <RadioGroup
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as AudioRecordingSourceType)}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              <Card
                onClick={() => !isRecording && setSourceType('mic')}
                sx={{
                  p: 1.5,
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  border: '2px solid',
                  borderColor: sourceType === 'mic' ? 'error.main' : 'divider',
                  bgcolor: sourceType === 'mic' ? 'error.lighter' : 'background.paper',
                  transition: 'all 0.15s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <MicRoundedIcon color={sourceType === 'mic' ? 'error' : 'inherit'} />
                  <Radio checked={sourceType === 'mic'} disabled={isRecording} size="small" />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  마이크 음성
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  외장/내장 마이크로 보이스오버 및 목소리 녹음
                </Typography>
              </Card>

              <Card
                onClick={() => !isRecording && setSourceType('system')}
                sx={{
                  p: 1.5,
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  border: '2px solid',
                  borderColor: sourceType === 'system' ? 'primary.main' : 'divider',
                  bgcolor: sourceType === 'system' ? 'primary.lighter' : 'background.paper',
                  transition: 'all 0.15s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <VolumeUpRoundedIcon color={sourceType === 'system' ? 'primary' : 'inherit'} />
                  <Radio checked={sourceType === 'system'} disabled={isRecording} size="small" />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  윈도우 전체 사운드
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  유튜브, 게임, 스트리밍 등 컴퓨터 모든 소리 캡처
                </Typography>
              </Card>

              <Card
                onClick={() => !isRecording && setSourceType('mixed')}
                sx={{
                  p: 1.5,
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  border: '2px solid',
                  borderColor: sourceType === 'mixed' ? 'secondary.main' : 'divider',
                  bgcolor: sourceType === 'mixed' ? 'secondary.lighter' : 'background.paper',
                  transition: 'all 0.15s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <GraphicEqRoundedIcon color={sourceType === 'mixed' ? 'secondary' : 'inherit'} />
                  <Radio checked={sourceType === 'mixed'} disabled={isRecording} size="small" />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  마이크 + 윈도우 사운드
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  목소리와 컴퓨터 소리를 하나로 믹싱하여 동시 녹음
                </Typography>
              </Card>
            </RadioGroup>

            {(sourceType === 'system' || sourceType === 'mixed') && (
              <Alert severity="info" sx={{ mt: 1.5, fontSize: '0.8125rem' }}>
                <strong>💡 윈도우 전체 사운드 녹음 안내:</strong> [녹음 시작]을 클릭하면 브라우저의
                화면 공유 팝업이 나타납니다. 이때 <strong>[전체 화면]</strong> 탭을 선택하고 창
                하단의 <strong>[시스템 오디오 공유(Share audio)]</strong>를 체크하셔야 윈도우 소리가
                브라우저로 인입됩니다.
              </Alert>
            )}
          </Card>

          {/* Realtime Waveform & Meter Console */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: '#090d16',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiberManualRecordRoundedIcon
                  sx={{
                    color: isRecording ? (isPaused ? '#f59e0b' : '#ef4444') : '#64748b',
                    fontSize: 18,
                    animation: isRecording && !isPaused ? 'pulse 1.2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {isRecording
                    ? isPaused
                      ? '녹음 일시정지 중'
                      : '실시간 음성 녹음 진행 중...'
                    : '녹음 대기 상태'}
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}
              >
                {formatTimer(elapsedTimeSec)}
              </Typography>
            </Box>

            {/* Canvas Waveform */}
            <Box
              sx={{
                height: 120,
                width: '100%',
                borderRadius: 1.5,
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {!isRecording && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.875rem',
                  }}
                >
                  녹음 시작 버튼을 누르면 실시간 사운드 스펙트럼 및 오디오 파형이 표시됩니다
                </Box>
              )}
            </Box>

            {/* Volume Level Meter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', width: 50, fontWeight: 700 }}>
                입력 레벨
              </Typography>
              <LinearProgress
                variant="determinate"
                value={volumeLevel}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor:
                      volumeLevel > 80 ? '#ef4444' : volumeLevel > 50 ? '#f59e0b' : '#10b981',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: '#94a3b8', width: 36, textAlign: 'right', fontWeight: 700 }}
              >
                {volumeLevel}%
              </Typography>
            </Box>

            {/* Big Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
              {!isRecording ? (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  startIcon={<FiberManualRecordRoundedIcon />}
                  onClick={handleStartRecording}
                  sx={{ fontWeight: 900, py: 1.5, fontSize: '1rem' }}
                >
                  🎙️ 지금 녹음 시작
                </Button>
              ) : (
                <>
                  <Button
                    variant="soft"
                    color={isPaused ? 'primary' : 'warning'}
                    size="large"
                    onClick={handleTogglePause}
                    startIcon={isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
                    sx={{ flex: 1, fontWeight: 800 }}
                  >
                    {isPaused ? '계속하기' : '일시정지'}
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={handleStopRecording}
                    startIcon={<StopRoundedIcon />}
                    sx={{ flex: 2, fontWeight: 900 }}
                  >
                    녹음 완료 (저장)
                  </Button>

                  <Tooltip title="녹음 취소 및 초기화">
                    <IconButton onClick={handleReset} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <ReplayRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Card>

          {/* Current Selected Result Card */}
          {selectedResult && (
            <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                최근 녹음 결과 미리듣기 & 변환 다운로드
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AudiotrackRoundedIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedResult.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    재생 시간: {selectedResult.duration.toFixed(1)}초 · 파일 용량:{' '}
                    {(selectedResult.sizeBytes / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Box>

              <Box
                component="audio"
                controls
                src={selectedResult.url}
                sx={{ width: '100%', height: 40, mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => handleDownload(selectedResult, 'mp3')}
                  disabled={isConverting}
                  sx={{ fontWeight: 800 }}
                >
                  MP3 고음질 다운로드
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => handleDownload(selectedResult, 'wav')}
                  disabled={isConverting}
                  sx={{ fontWeight: 700 }}
                >
                  WAV 원음 다운로드
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleDownload(selectedResult, 'webm')}
                  disabled={isConverting}
                  sx={{ fontWeight: 700 }}
                >
                  WebM
                </Button>
              </Box>

              {isConverting && (
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {convertPhase}
                  </Typography>
                  <LinearProgress sx={{ height: 6, borderRadius: 1 }} />
                </Box>
              )}
            </Card>
          )}
        </Box>

        {/* Right Column: Recording History List */}
        <Card
          sx={{
            width: { xs: '100%', lg: 360 },
            flexShrink: 0,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              px: 2,
              bgcolor: 'background.neutral',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              녹음 목록 ({historyList.length})
            </Typography>
            {historyList.length > 0 && (
              <Button
                size="small"
                color="error"
                onClick={() => setHistoryList([])}
                sx={{ fontSize: '0.75rem', minWidth: 0, px: 1 }}
              >
                전체 삭제
              </Button>
            )}
          </Box>

          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {historyList.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <AudiotrackRoundedIcon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  녹음된 오디오가 없습니다.
                </Typography>
                <Typography variant="caption">녹음을 시작하면 여기에 기록이 누적됩니다.</Typography>
              </Box>
            ) : (
              historyList.map((item) => {
                const isSelected = selectedResult?.id === item.id;
                return (
                  <Card
                    key={item.id}
                    onClick={() => setSelectedResult(item)}
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'action.selected' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {item.createdAt} · {item.duration.toFixed(1)}s
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                );
              })
            )}
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
