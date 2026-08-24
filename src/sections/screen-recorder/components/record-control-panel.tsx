'use client';

import type { RecordedMedia, RecordingStatus, RecordingSource } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

import { formatTime } from '../utils/screen-recorder-utils';

// ----------------------------------------------------------------------

interface RecordControlPanelProps {
  onRecordingComplete: (media: RecordedMedia) => void;
}

export function RecordControlPanel({ onRecordingComplete }: RecordControlPanelProps) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [sourceMode, setSourceMode] = useState<RecordingSource>('screen');
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    },
    []
  );

  const startTimer = () => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      setStatus('preparing');
      chunksRef.current = [];

      let videoStream: MediaStream;

      if (sourceMode === 'camera') {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: includeMic,
        });
      } else {
        // Screen capture
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30, max: 60 } },
          audio: true, // system audio
        });

        // Add mic audio if enabled
        if (includeMic) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream.getAudioTracks().forEach((track) => videoStream.addTrack(track));
          } catch {
            toast.warning('마이크 권한을 가져오지 못해 시스템 오디오만 녹음됩니다.');
          }
        }
      }

      streamRef.current = videoStream;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(videoStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        const mediaItem: RecordedMedia = {
          id: Date.now().toString(),
          blob,
          url,
          duration: elapsedSeconds,
          mimeType,
          width: 1280,
          height: 720,
          createdAt: new Date().toLocaleTimeString('ko-KR'),
          sizeBytes: blob.size,
        };

        onRecordingComplete(mediaItem);
        setStatus('completed');
        toast.success('화면 녹화가 완료되었습니다. 아래 에디터에서 확인하세요.');

        // Stop all tracks
        videoStream.getTracks().forEach((t) => t.stop());
      };

      // Handle user clicking native browser "Stop sharing" button
      videoStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };

      recorder.start(1000); // 1-second chunks
      setStatus('recording');
      startTimer();
      toast.info('화면 녹화가 시작되었습니다.');
    } catch (err: unknown) {
      setStatus('idle');
      stopTimer();
      toast.error('화면 캡처를 시작할 수 없습니다. (권한 취소 또는 미지원)');
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (status === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      if (timerRef.current) clearInterval(timerRef.current);
      toast.info('녹화가 일시 정지되었습니다.');
    } else if (status === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      toast.info('녹화가 다시 시작되었습니다.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Status & Timer Banner */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 1.5,
          bgcolor: status === 'recording' ? 'error.lighter' : 'background.neutral',
          border: '1px solid',
          borderColor: status === 'recording' ? 'error.main' : 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor:
                status === 'recording'
                  ? 'error.main'
                  : status === 'paused'
                    ? 'warning.main'
                    : 'text.disabled',
              animation: status === 'recording' ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.3 },
                '100%': { opacity: 1 },
              },
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {status === 'recording'
              ? '녹화 진행 중...'
              : status === 'paused'
                ? '녹화 일시 정지'
                : status === 'preparing'
                  ? '캡처 준비 중...'
                  : '녹화 대기 중'}
          </Typography>
        </Box>

        {/* Timer Display */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 900,
            color: status === 'recording' ? 'error.main' : 'text.primary',
          }}
        >
          {formatTime(elapsedSeconds)}
        </Typography>
      </Box>

      {/* Recording Options (Disabled while recording) */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={includeMic}
              disabled={status === 'recording' || status === 'paused'}
              onChange={(e) => setIncludeMic(e.target.checked)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MicRoundedIcon fontSize="small" color={includeMic ? 'primary' : 'disabled'} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                마이크 음성 동시 녹음
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Main Recording Trigger Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {status === 'idle' || status === 'completed' ? (
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<FiberManualRecordRoundedIcon />}
            onClick={handleStartRecording}
            sx={{ fontWeight: 800, px: 3 }}
          >
            화면 / 브라우저 탭 녹화 시작
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              color={status === 'recording' ? 'warning' : 'info'}
              size="large"
              startIcon={
                status === 'recording' ? <PauseCircleRoundedIcon /> : <PlayArrowRoundedIcon />
              }
              onClick={handlePauseResume}
              sx={{ fontWeight: 700 }}
            >
              {status === 'recording' ? '일시 정지' : '계속 녹화'}
            </Button>

            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopCircleRoundedIcon />}
              onClick={handleStopRecording}
              sx={{ fontWeight: 800, px: 3 }}
            >
              녹화 완료 및 저장
            </Button>
          </>
        )}
      </Box>
    </Card>
  );
}
