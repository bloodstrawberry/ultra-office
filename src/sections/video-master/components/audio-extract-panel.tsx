'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';

import {
  formatTime,
  formatBytes,
  sliceAudioBuffer,
  audioBufferToWavBlob,
  extractAudioBufferFromFile,
} from '../utils/audio-processor';

// ----------------------------------------------------------------------

interface AudioExtractPanelProps {
  videoFile: File | null;
  duration: number;
}

export function AudioExtractPanel({ videoFile, duration }: AudioExtractPanelProps) {
  const [audioRange, setAudioRange] = useState<[number, number]>([0, duration || 10]);
  const [channels, setChannels] = useState<number>(2); // 2: Stereo, 1: Mono
  const [volumeBoost, setVolumeBoost] = useState<number>(100); // 100%
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [audioBlobSize, setAudioBlobSize] = useState<number>(0);

  const handleExtractAudio = async () => {
    if (!videoFile) {
      toast.error('동영상 파일이 로드되지 않았습니다.');
      return;
    }

    setIsExtracting(true);
    try {
      // 1. Decode raw audio buffer
      const fullBuffer = await extractAudioBufferFromFile(videoFile);

      // 2. Slice buffer if needed
      const slicedBuffer = sliceAudioBuffer(fullBuffer, audioRange[0], audioRange[1]);

      // 3. Convert to WAV Blob
      const wavBlob = audioBufferToWavBlob(slicedBuffer, {
        channels,
        volume: volumeBoost / 100,
      });

      const url = URL.createObjectURL(wavBlob);
      setExtractedAudioUrl(url);
      setAudioBlobSize(wavBlob.size);
      toast.success('오디오 추출이 완료되었습니다! 아래 플레이어에서 확인하세요.');
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
    link.download = `${baseName}_audio.wav`;
    link.click();
    toast.success('오디오 파일(.wav)이 다운로드되었습니다.');
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AudiotrackRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          오디오 추출 & 변환 (MP4 → WAV / MP3)
        </Typography>
      </Box>

      {/* Explanation alert */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'primary.lighter',
          color: 'primary.darker',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <GraphicEqRoundedIcon />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Web Audio API를 통해 브라우저 내부에서 100% 무손실 16-bit PCM 고음질로 오디오 트랙을
          추출합니다. (서버 전송 없음)
        </Typography>
      </Box>

      {/* Range Slider */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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

      {/* Extract Button */}
      <Button
        variant="contained"
        startIcon={
          isExtracting ? <CircularProgress size={20} color="inherit" /> : <AudiotrackRoundedIcon />
        }
        onClick={handleExtractAudio}
        disabled={isExtracting || !videoFile}
      >
        {isExtracting ? '오디오 추출 중...' : '오디오 트랙 추출 실행'}
      </Button>

      {/* Extracted Audio Player Result */}
      {extractedAudioUrl && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              추출된 오디오 미리듣기
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              용량: {formatBytes(audioBlobSize)}
            </Typography>
          </Box>

          <audio controls src={extractedAudioUrl} style={{ width: '100%' }} />

          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadAudio}
          >
            추출된 오디오 파일 다운로드 (.wav)
          </Button>
        </Box>
      )}
    </Card>
  );
}
