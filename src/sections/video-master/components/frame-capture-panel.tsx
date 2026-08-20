'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';

import type { ExtractedFrame } from '../types';
import { formatTime } from '../utils/audio-processor';
import {
  createZipFromFrames,
  extractFramesFromVideo,
  captureCurrentVideoFrame,
} from '../utils/frame-extractor';

// ----------------------------------------------------------------------

interface FrameCapturePanelProps {
  videoUrl: string;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function FrameCapturePanel({ videoUrl, currentTime, videoRef }: FrameCapturePanelProps) {
  const [snapshotFormat, setSnapshotFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>(
    'image/png'
  );
  const [sampleCount, setSampleCount] = useState<number>(6);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // 1. Single Instant Snapshot
  const handleCaptureCurrent = () => {
    if (!videoRef.current) {
      toast.error('비디오 요소를 찾을 수 없습니다.');
      return;
    }

    const dataUrl = captureCurrentVideoFrame(videoRef.current, snapshotFormat, 0.95);
    if (!dataUrl) {
      toast.error('프레임 캡처에 실패했습니다.');
      return;
    }

    const ext =
      snapshotFormat === 'image/png' ? 'png' : snapshotFormat === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `frame_snapshot_${formatTime(currentTime).replace(':', 'm')}.${ext}`;
    link.click();
    toast.success(`현재 시점(${formatTime(currentTime)}) 스냅샷이 다운로드되었습니다.`);
  };

  // 2. Timeline Frame Sampling
  const handleExtractTimelineFrames = async () => {
    setIsExtracting(true);
    setExtractProgress(0);
    try {
      const frames = await extractFramesFromVideo(videoUrl, sampleCount, (p) =>
        setExtractProgress(p)
      );
      setExtractedFrames(frames);
      toast.success(`총 ${frames.length}개의 타임라인 프레임이 추출되었습니다.`);
    } catch {
      toast.error('프레임 추출 중 오류가 발생했습니다.');
    } finally {
      setIsExtracting(false);
    }
  };

  // 3. Download All Frames as ZIP
  const handleDownloadAllZip = async () => {
    if (extractedFrames.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await createZipFromFrames(extractedFrames);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timeline_frames_${Date.now()}.zip`;
      link.click();
      toast.success('모든 프레임이 ZIP 압축파일로 다운로드되었습니다.');
    } catch {
      toast.error('ZIP 생성 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleFrame = (frame: ExtractedFrame, index: number) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `frame_${index + 1}_${frame.timeFormatted.replace(':', 'm')}.jpg`;
    link.click();
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CameraAltRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          프레임 스냅샷 & 썸네일 연속 추출
        </Typography>
      </Box>

      {/* 1. Instant Current Frame Snapshot Section */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          현재 재생 시점 원본 스냅샷 캡처
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>이미지 포맷</InputLabel>
            <Select
              value={snapshotFormat}
              label="이미지 포맷"
              onChange={(e) =>
                setSnapshotFormat(e.target.value as 'image/png' | 'image/jpeg' | 'image/webp')
              }
            >
              <MenuItem value="image/png">PNG (무손실)</MenuItem>
              <MenuItem value="image/jpeg">JPG (표준)</MenuItem>
              <MenuItem value="image/webp">WebP (고효율)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<CameraAltRoundedIcon />}
            onClick={handleCaptureCurrent}
            sx={{ flex: 1 }}
          >
            현재 프레임 ({formatTime(currentTime)}) 캡처 및 다운로드
          </Button>
        </Box>
      </Box>

      {/* 2. Timeline Frame Extraction Section */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          타임라인 균등 썸네일 자동 분할 추출
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>추출 프레임 개수</InputLabel>
            <Select
              value={sampleCount}
              label="추출 프레임 개수"
              onChange={(e) => setSampleCount(Number(e.target.value))}
            >
              <MenuItem value={6}>6장 분할</MenuItem>
              <MenuItem value={12}>12장 분할</MenuItem>
              <MenuItem value={18}>18장 분할</MenuItem>
              <MenuItem value={24}>24장 분할</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<CollectionsRoundedIcon />}
            onClick={handleExtractTimelineFrames}
            disabled={isExtracting}
            sx={{ flex: 1 }}
          >
            {isExtracting ? `프레임 추출 중... (${extractProgress}%)` : '타임라인 썸네일 일괄 추출'}
          </Button>
        </Box>

        {isExtracting && (
          <LinearProgress
            variant="determinate"
            value={extractProgress}
            sx={{ height: 6, borderRadius: 1 }}
          />
        )}
      </Box>

      {/* 3. Extracted Frames Gallery */}
      {extractedFrames.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              추출된 프레임 갤러리 ({extractedFrames.length}장)
            </Typography>

            <Button
              variant="outlined"
              color="success"
              startIcon={<FolderZipRoundedIcon />}
              onClick={handleDownloadAllZip}
              disabled={isZipping}
            >
              {isZipping ? '압축 생성 중...' : '전체 ZIP 다운로드'}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: 1.5,
            }}
          >
            {extractedFrames.map((frame, idx) => (
              <Box
                key={frame.id}
                sx={{
                  position: 'relative',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#000000',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover .overlay-btn': { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={frame.dataUrl}
                  alt={`Frame ${idx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Timestamp badge */}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.75)',
                    color: '#ffffff',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                  }}
                >
                  {frame.timeFormatted}
                </Typography>

                {/* Hover download button */}
                <Button
                  className="overlay-btn"
                  size="small"
                  variant="contained"
                  onClick={() => handleDownloadSingleFrame(frame, idx)}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    minWidth: 32,
                    p: 0.5,
                  }}
                >
                  <DownloadRoundedIcon fontSize="small" />
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
