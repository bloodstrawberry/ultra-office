'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';

import {
  formatTime,
  formatBytes,
  sliceAudioBuffer,
  audioBufferToWavBlob,
  audioBufferToMp3Blob,
  extractAudioBufferFromFile,
} from '../utils/audio-processor';

// ----------------------------------------------------------------------

interface AudioExtractPanelProps {
  videoFile: File | null;
  duration: number;
}

export function AudioExtractPanel({ videoFile, duration }: AudioExtractPanelProps) {
  const [audioRange, setAudioRange] = useState<[number, number]>([0, duration || 10]);
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  const [bitrate, setBitrate] = useState<128 | 192 | 256 | 320>(192);
  const [channels, setChannels] = useState<number>(2); // 2: Stereo, 1: Mono
  const [volumeBoost, setVolumeBoost] = useState<number>(100); // 100%
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [extractPhase, setExtractPhase] = useState<string>('');
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [audioBlobSize, setAudioBlobSize] = useState<number>(0);

  const handleExtractAudio = async () => {
    if (!videoFile) {
      toast.error('동영상 파일이 로드되지 않았습니다.');
      return;
    }

    setIsExtracting(true);
    setExtractProgress(5);
    setExtractPhase('동영상 오디오 트랙 디코딩 중...');

    try {
      // 1. Decode raw audio buffer
      const fullBuffer = await extractAudioBufferFromFile(videoFile);

      // 2. Slice buffer if needed
      setExtractProgress(25);
      setExtractPhase('선택 구간 추출 중...');
      const slicedBuffer = sliceAudioBuffer(fullBuffer, audioRange[0], audioRange[1]);

      // 3. Convert to MP3 or WAV
      let blob: Blob;
      if (format === 'mp3') {
        setExtractProgress(40);
        setExtractPhase('MP3 인코딩 중...');
        blob = await audioBufferToMp3Blob(slicedBuffer, {
          kbps: bitrate,
          channels,
          volume: volumeBoost / 100,
          onProgress: (p) => {
            setExtractProgress(40 + Math.round(p * 0.55));
            setExtractPhase(`MP3 인코딩 중 (${p}%)...`);
          },
        });
      } else {
        setExtractProgress(70);
        setExtractPhase('WAV 파일 생성 중...');
        blob = audioBufferToWavBlob(slicedBuffer, {
          channels,
          volume: volumeBoost / 100,
        });
      }

      setExtractProgress(100);
      setExtractPhase('완료!');
      const url = URL.createObjectURL(blob);
      setExtractedAudioUrl(url);
      setAudioBlobSize(blob.size);
      toast.success(`${format.toUpperCase()} 오디오 변환이 완료되었습니다!`);
    } catch {
      toast.error(
        '오디오를 추출하는 중 오류가 발생했습니다. (영상에 오디오가 없거나 지원되지 않는 코덱)'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!extractedAudioUrl) return;
    const link = document.createElement('a');
    link.href = extractedAudioUrl;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, '') || 'extracted_audio';
    link.download = `${baseName}.${format}`;
    link.click();
    toast.success(`오디오 파일(.${format})이 다운로드되었습니다.`);
  };

  return (
    <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AudiotrackRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          오디오 추출 & MP3 변환
        </Typography>
      </Box>

      {/* Explanation alert */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'primary.lighter',
          color: 'primary.darker',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <GraphicEqRoundedIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          서버 전송 없이 브라우저 로컬에서 안전하고 초고속으로 오디오를 MP3/WAV로 변환합니다.
        </Typography>
      </Box>

      {/* Format Selection */}
      <Box>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
        >
          출력 오디오 포맷
        </Typography>
        <RadioGroup row value={format} onChange={(e) => setFormat(e.target.value as 'mp3' | 'wav')}>
          <FormControlLabel
            value="mp3"
            control={<Radio size="small" />}
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                MP3 (권장 고음질 압축)
              </Typography>
            }
          />
          <FormControlLabel
            value="wav"
            control={<Radio size="small" />}
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                WAV (무손실 원본 PCM)
              </Typography>
            }
          />
        </RadioGroup>
      </Box>

      {/* Range Slider */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            추출 구간 설정
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            {formatTime(audioRange[0])} ~ {formatTime(audioRange[1])} (총{' '}
            {(audioRange[1] - audioRange[0]).toFixed(1)}초)
          </Typography>
        </Box>

        <Slider
          value={audioRange}
          min={0}
          max={duration || 10}
          step={0.1}
          onChange={(_, val) => setAudioRange(val as [number, number])}
          valueLabelDisplay="auto"
          valueLabelFormat={(val) => formatTime(val)}
        />
      </Box>

      {/* Settings Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        {format === 'mp3' ? (
          <FormControl size="small" fullWidth>
            <InputLabel>MP3 비트레이트</InputLabel>
            <Select
              value={bitrate}
              label="MP3 비트레이트"
              onChange={(e) => setBitrate(Number(e.target.value) as 128 | 192 | 256 | 320)}
            >
              <MenuItem value={128}>128 kbps (표준 품질)</MenuItem>
              <MenuItem value={192}>192 kbps (고품질 - 추천)</MenuItem>
              <MenuItem value={256}>256 kbps (초고음질)</MenuItem>
              <MenuItem value={320}>320 kbps (스튜디오 최고음질)</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <FormControl size="small" fullWidth>
            <InputLabel>오디오 채널</InputLabel>
            <Select
              value={channels}
              label="오디오 채널"
              onChange={(e) => setChannels(Number(e.target.value))}
            >
              <MenuItem value={2}>스테레오 (Stereo 2ch)</MenuItem>
              <MenuItem value={1}>모노 (Mono 1ch)</MenuItem>
            </Select>
          </FormControl>
        )}

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            볼륨 증폭 ({volumeBoost}%)
          </Typography>
          <Slider
            size="small"
            value={volumeBoost}
            min={10}
            max={200}
            step={10}
            onChange={(_, val) => setVolumeBoost(val as number)}
          />
        </Box>
      </Box>

      {/* Extract Button & Progress */}
      <Button
        variant="contained"
        color="primary"
        size="medium"
        startIcon={
          isExtracting ? <CircularProgress size={18} color="inherit" /> : <AudiotrackRoundedIcon />
        }
        onClick={handleExtractAudio}
        disabled={isExtracting || !videoFile}
        sx={{ fontWeight: 700 }}
      >
        {isExtracting ? '오디오 변환 진행 중...' : `${format.toUpperCase()} 오디오 추출 및 변환`}
      </Button>

      {isExtracting && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {extractPhase}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {extractProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={extractProgress}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      )}

      {/* Extracted Audio Player Result */}
      {extractedAudioUrl && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              추출된 {format.toUpperCase()} 오디오 미리듣기
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              용량: {formatBytes(audioBlobSize)}
            </Typography>
          </Box>

          <audio controls src={extractedAudioUrl} style={{ width: '100%', height: 38 }} />

          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadAudio}
            sx={{ fontWeight: 700 }}
          >
            {format.toUpperCase()} 오디오 파일 다운로드
          </Button>
        </Box>
      )}
    </Card>
  );
}
