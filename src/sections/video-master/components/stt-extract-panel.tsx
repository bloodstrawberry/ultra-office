'use client';

import type { STTLanguage, STTTranscriptItem } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SubtitlesRoundedIcon from '@mui/icons-material/SubtitlesRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import {
  transcriptsToSrt,
  transcriptsToVtt,
  transcriptsToTxt,
  downloadTextFile,
  transcriptsToJson,
  formatTimestampDisplay,
  SUPPORTED_STT_LANGUAGES,
  isSpeechRecognitionSupported,
} from '../utils/stt-processor';

// ----------------------------------------------------------------------

interface SttExtractPanelProps {
  videoUrl: string;
  duration: number;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSeekToTime?: (seconds: number) => void;
  videoName?: string;
}

export function SttExtractPanel({
  duration,
  currentTime,
  videoRef,
  onSeekToTime,
  videoName = 'video',
}: SttExtractPanelProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [selectedLang, setSelectedLang] = useState<string>('ko-KR');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [transcripts, setTranscripts] = useState<STTTranscriptItem[]>([]);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Recognition Reference

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const currentSegmentStartRef = useRef<number>(0);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  // Update video playback rate
  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Stop STT
  const stopSTT = useCallback(() => {
    isManuallyStoppedRef.current = true;
    setIsRecording(false);
    setInterimText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [videoRef]);

  // Start STT with Video Sync
  const startSTT = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        '현재 브라우저에서 음성 인식(Web Speech API)을 지원하지 않습니다. Chrome 또는 Edge 브라우저를 권장합니다.'
      );
      return;
    }

    if (!videoRef.current) {
      toast.error('비디오 요소를 찾을 수 없습니다.');
      return;
    }

    isManuallyStoppedRef.current = false;
    currentSegmentStartRef.current = videoRef.current.currentTime || 0;

    // Window recognition constructor

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = selectedLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalSpeech = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += transcript;
        } else {
          currentInterim += transcript;
        }
      }

      if (currentInterim) {
        setInterimText(currentInterim);
      }

      if (finalSpeech.trim().length > 0) {
        const endSec = videoRef.current?.currentTime || currentSegmentStartRef.current + 2;
        const startSec = currentSegmentStartRef.current;
        const newItem: STTTranscriptItem = {
          id: `stt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          startTime: Math.max(0, startSec),
          endTime: Math.max(startSec + 0.5, endSec),
          text: finalSpeech.trim(),
          isFinal: true,
        };

        setTranscripts((prev) => [...prev, newItem]);
        setInterimText('');
        // Next segment starts at current playback time
        currentSegmentStartRef.current = endSec;
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Continuous listening: no error toast needed
        return;
      }
      if (event.error === 'aborted') {
        return;
      }
      toast.error(`음성 인식 오류: ${event.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if video is still playing and not manually stopped
      if (
        !isManuallyStoppedRef.current &&
        videoRef.current &&
        !videoRef.current.paused &&
        videoRef.current.currentTime < (duration || 99999)
      ) {
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);

      // Play video with audio enabled
      videoRef.current.muted = false;
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.play().catch(() => {
        toast.warning(
          '브라우저 정책으로 인해 영상 재생을 시작할 수 없습니다. 재생 버튼을 직접 눌러주세요.'
        );
      });

      toast.info('비디오 음성 인식(STT)이 시작되었습니다.');
    } catch {
      toast.error('음성 인식 시작에 실패했습니다.');
      setIsRecording(false);
    }
  }, [selectedLang, videoRef, duration, playbackRate]);

  // Clean up on unmount
  useEffect(
    () => () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Update text of single transcript
  const handleUpdateText = (id: string, text: string) => {
    setTranscripts((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  // Delete single transcript
  const handleDeleteTranscript = (id: string) => {
    setTranscripts((prev) => prev.filter((item) => item.id !== id));
  };

  // Add empty transcript manually
  const handleAddManualSegment = () => {
    const cur = currentTime;
    const newItem: STTTranscriptItem = {
      id: `manual-${Date.now()}`,
      startTime: cur,
      endTime: Math.min(duration || cur + 3, cur + 3),
      text: '',
      isFinal: true,
    };
    setTranscripts((prev) => [...prev, newItem].sort((a, b) => a.startTime - b.startTime));
  };

  // Clear all transcripts
  const handleClearAll = () => {
    setTranscripts([]);
    toast.success('모든 자막 대본이 초기화되었습니다.');
  };

  // Export handlers
  const handleDownloadSrt = () => {
    if (transcripts.length === 0) {
      toast.error('추출된 자막이 없습니다.');
      return;
    }
    const srtContent = transcriptsToSrt(transcripts);
    downloadTextFile(
      srtContent,
      `${videoName.replace(/\.[^/.]+$/, '')}_subtitles.srt`,
      'text/plain'
    );
    toast.success('SRT 자막 파일이 다운로드되었습니다.');
  };

  const handleDownloadVtt = () => {
    if (transcripts.length === 0) {
      toast.error('추출된 자막이 없습니다.');
      return;
    }
    const vttContent = transcriptsToVtt(transcripts);
    downloadTextFile(vttContent, `${videoName.replace(/\.[^/.]+$/, '')}_subtitles.vtt`, 'text/vtt');
    toast.success('WebVTT 자막 파일이 다운로드되었습니다.');
  };

  const handleDownloadTxt = (includeTime = false) => {
    if (transcripts.length === 0) {
      toast.error('추출된 자막이 없습니다.');
      return;
    }
    const txtContent = transcriptsToTxt(transcripts, includeTime);
    downloadTextFile(txtContent, `${videoName.replace(/\.[^/.]+$/, '')}_script.txt`, 'text/plain');
    toast.success('대본 TXT 파일이 다운로드되었습니다.');
  };

  const handleDownloadJson = () => {
    if (transcripts.length === 0) {
      toast.error('추출된 자막이 없습니다.');
      return;
    }
    const jsonContent = transcriptsToJson(transcripts, videoName);
    downloadTextFile(
      jsonContent,
      `${videoName.replace(/\.[^/.]+$/, '')}_subtitles.json`,
      'application/json'
    );
    toast.success('JSON 메타데이터 파일이 다운로드되었습니다.');
  };

  const handleCopyText = () => {
    if (transcripts.length === 0) {
      toast.error('복사할 텍스트가 없습니다.');
      return;
    }
    const txtContent = transcriptsToTxt(transcripts, false);
    navigator.clipboard.writeText(txtContent);
    toast.success('대본 전체가 클립보드에 복사되었습니다.');
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title & Status */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MicRoundedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            음성 인식 자막 추출 (Video STT & Subtitle)
          </Typography>
        </Box>

        <Chip
          icon={<SubtitlesRoundedIcon />}
          label={isRecording ? '음성 실시간 인식 중...' : `총 ${transcripts.length}개 자막`}
          color={isRecording ? 'error' : 'default'}
          variant={isRecording ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {!isSupported && (
        <Alert severity="warning">
          현재 브라우저는 Web Speech Recognition API를 완전히 지원하지 않을 수 있습니다. 음성 인식
          기능을 원활하게 사용하시려면 Chrome 또는 Edge 브라우저를 사용해 주세요.
        </Alert>
      )}

      {/* Control Toolbar */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {/* Language Selector */}
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>인식 음성 언어</InputLabel>
            <Select
              value={selectedLang}
              label="인식 음성 언어"
              onChange={(e) => setSelectedLang(e.target.value)}
              disabled={isRecording}
            >
              {SUPPORTED_STT_LANGUAGES.map((lang: STTLanguage) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Speed Selector */}
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>재생 속도</InputLabel>
            <Select
              value={playbackRate}
              label="재생 속도"
              onChange={(e) => handleChangePlaybackRate(Number(e.target.value))}
            >
              <MenuItem value={1.0}>1.0x (표준)</MenuItem>
              <MenuItem value={1.25}>1.25x (빠름)</MenuItem>
              <MenuItem value={1.5}>1.5x (고속)</MenuItem>
            </Select>
          </FormControl>

          {/* Start / Stop Toggle */}
          {!isRecording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayCircleRoundedIcon />}
              onClick={startSTT}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, fontWeight: 800, minWidth: 160 }}
            >
              STT 음성 인식 시작
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopCircleRoundedIcon />}
              onClick={stopSTT}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, fontWeight: 800, minWidth: 160 }}
            >
              음성 인식 일시 정지 / 중지
            </Button>
          )}

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddManualSegment}
            sx={{ whiteSpace: 'nowrap' }}
          >
            자막 구간 수동 추가
          </Button>
        </Box>

        {/* Interim / Real-time Live Text Badge */}
        {isRecording && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              border: '1px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'error.main',
                animation: 'pulse 1.2s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 0.3, transform: 'scale(0.8)' },
                  '50%': { opacity: 1, transform: 'scale(1.2)' },
                  '100%': { opacity: 0.3, transform: 'scale(0.8)' },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.darker', flex: 1 }}>
              {interimText
                ? `[인식 중] ${interimText}`
                : '음성을 듣고 있습니다... 비디오에서 말씀해 주세요.'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Export & Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          추출된 자막 타임라인 ({transcripts.length}개)
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="클립보드에 대본 전체 복사">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyText}
              disabled={transcripts.length === 0}
            >
              복사
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<SubtitlesRoundedIcon />}
            onClick={handleDownloadSrt}
            disabled={transcripts.length === 0}
            sx={{ fontWeight: 700 }}
          >
            SRT 다운로드
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<SubtitlesRoundedIcon />}
            onClick={handleDownloadVtt}
            disabled={transcripts.length === 0}
            sx={{ fontWeight: 700 }}
          >
            VTT 다운로드
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<DescriptionRoundedIcon />}
            onClick={() => handleDownloadTxt(false)}
            disabled={transcripts.length === 0}
          >
            TXT 대본
          </Button>

          <Tooltip title="JSON 포맷 내보내기">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadJson}
              disabled={transcripts.length === 0}
            >
              JSON
            </Button>
          </Tooltip>

          {transcripts.length > 0 && (
            <Button
              size="small"
              variant="soft"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={handleClearAll}
            >
              초기화
            </Button>
          )}
        </Box>
      </Box>

      {/* Transcript Timeline List (Scrollable) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxHeight: 480,
          overflowY: 'auto',
          pr: 0.5,
        }}
      >
        {transcripts.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 2,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <SubtitlesRoundedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              아직 추출된 음성 자막이 없습니다.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', maxWidth: 360 }}>
              위의 [STT 음성 인식 시작] 버튼을 누르면 비디오가 재생되면서 말소리를 자동으로 감지하여
              실시간 자막 타임라인을 생성합니다.
            </Typography>
          </Box>
        ) : (
          transcripts.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.customShadows?.z4 || '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              {/* Index & Timestamp Navigator */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  minWidth: 90,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    #{index + 1}
                  </Typography>
                  {onSeekToTime && (
                    <Tooltip title="해당 시점으로 이동">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onSeekToTime(item.startTime)}
                        sx={{ p: 0.2 }}
                      >
                        <PlayArrowRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Chip
                  size="small"
                  label={`${formatTimestampDisplay(item.startTime)} ~ ${formatTimestampDisplay(item.endTime)}`}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    height: 22,
                  }}
                />
              </Box>

              {/* Editable Text Area */}
              <TextField
                fullWidth
                multiline
                size="small"
                value={item.text}
                placeholder="인식된 자막 텍스트를 입력하거나 수정하세요..."
                onChange={(e) => handleUpdateText(item.id, e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  },
                }}
              />

              {/* Delete Button */}
              <Tooltip title="삭제">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTranscript(item.id)}
                  sx={{ mt: 0.5 }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </Box>
    </Card>
  );
}
