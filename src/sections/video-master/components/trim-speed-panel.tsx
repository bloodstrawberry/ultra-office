'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';

import { formatTime } from '../utils/audio-processor';
import { renderAndExportVideo } from '../utils/video-processor';

// ----------------------------------------------------------------------

interface TrimSpeedPanelProps {
  videoUrl: string;
  duration: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function TrimSpeedPanel({ videoUrl, duration, videoRef }: TrimSpeedPanelProps) {
  const [trimRange, setTrimRange] = useState<[number, number]>([0, duration || 10]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleSliderChange = (_: Event, val: number | number[]) => {
    if (Array.isArray(val)) {
      setTrimRange([val[0], val[1]]);
      if (videoRef.current) {
        videoRef.current.currentTime = val[0];
      }
    }
  };

  const handlePreviewTrim = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = trimRange[0];
    videoRef.current.playbackRate = speed;
    videoRef.current.muted = muteAudio;
    videoRef.current.play();

    const checkEndTime = () => {
      if (videoRef.current && videoRef.current.currentTime >= trimRange[1]) {
        videoRef.current.pause();
        videoRef.current.removeEventListener('timeupdate', checkEndTime);
      }
    };

    videoRef.current.addEventListener('timeupdate', checkEndTime);
  };

  const handleExportTrimmed = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await renderAndExportVideo(
        videoUrl,
        {
          startTime: trimRange[0],
          endTime: trimRange[1],
          playbackRate: speed,
          muteAudio,
        },
        (progress) => setExportProgress(progress)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `trimmed_video_${Date.now()}.webm`;
      link.click();
      toast.success('구간 자르기 및 인코딩 완료! 파일이 다운로드되었습니다.');
    } catch {
      toast.error('동영상 인코딩 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const trimDuration = Math.max(0, trimRange[1] - trimRange[0]);

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContentCutRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          구간 자르기 (Trim) & 배속 조절
        </Typography>
      </Box>

      {/* Range Slider */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            자르기 구간 설정
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            {formatTime(trimRange[0])} ~ {formatTime(trimRange[1])} (총 {trimDuration.toFixed(1)}초)
          </Typography>
        </Box>

        <Slider
          value={trimRange}
          min={0}
          max={duration || 10}
          step={0.1}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(val) => formatTime(val)}
        />
      </Box>

      {/* Manual Input Time Fields */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          size="small"
          label="시작 시간 (초)"
          type="number"
          value={trimRange[0]}
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
          value={trimRange[1]}
          onChange={(e) => {
            const val = Math.min(duration, Math.max(Number(e.target.value), trimRange[0] + 0.1));
            setTrimRange([trimRange[0], val]);
          }}
          inputProps={{ step: 0.1, min: 0, max: duration }}
        />
      </Box>

      {/* Speed & Mute */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            재생 배속 ({speed}x)
          </Typography>
          <Slider
            size="small"
            value={speed}
            min={0.25}
            max={4.0}
            step={0.25}
            marks={[
              { value: 0.5, label: '0.5x' },
              { value: 1.0, label: '1x' },
              { value: 2.0, label: '2x' },
              { value: 4.0, label: '4x' },
            ]}
            onChange={(_, val) => setSpeed(val as number)}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={muteAudio}
              onChange={(e) => setMuteAudio(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography variant="body2">오디오 음소거 (Mute)</Typography>}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<PlayCircleOutlineRoundedIcon />}
          onClick={handlePreviewTrim}
          disabled={isExporting}
        >
          구간 미리보기 재생
        </Button>

        <Button
          variant="contained"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExportTrimmed}
          disabled={isExporting}
          sx={{ flex: 1 }}
        >
          {isExporting ? `인코딩 중... (${exportProgress}%)` : '자른 영상 내보내기 (.webm)'}
        </Button>
      </Box>

      {/* Progress Bar */}
      {isExporting && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={exportProgress}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      )}
    </Card>
  );
}
