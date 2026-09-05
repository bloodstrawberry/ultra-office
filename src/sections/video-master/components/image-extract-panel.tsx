'use client';

import type { ExtractedFrame } from '../types';
import type { ImageFormatType } from '../utils/frame-extractor';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';

import { formatTime } from '../utils/audio-processor';
import {
  createZipFromFrames,
  extractFramesFromVideo,
  extractFramesByInterval,
  captureVideoFrameAtTime,
  captureCurrentVideoFrame,
} from '../utils/frame-extractor';

// ----------------------------------------------------------------------

interface ImageExtractPanelProps {
  videoUrl: string;
  duration: number;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSeekToTime?: (seconds: number) => void;
}

export function ImageExtractPanel({
  videoUrl,
  duration,
  currentTime,
  videoRef,
  onSeekToTime,
}: ImageExtractPanelProps) {
  // Extraction Settings
  const [snapshotFormat, setSnapshotFormat] = useState<ImageFormatType>('image/png');
  const [quality, setQuality] = useState<number>(95);

  // Multi Extract Mode
  const [extractMode, setExtractMode] = useState<'split' | 'interval'>('split');
  const [splitCount, setSplitCount] = useState<number>(12);
  const [intervalSec, setIntervalSec] = useState<number>(2);
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(Math.ceil(duration || 60));

  // Custom single time capture
  const [customSec, setCustomSec] = useState<number>(Math.round(currentTime));

  // State
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // 1. Single Instant Snapshot (Current Time)
  const handleCaptureCurrent = () => {
    if (!videoRef.current) {
      toast.error('비디오 플레이어를 찾을 수 없습니다.');
      return;
    }

    const dataUrl = captureCurrentVideoFrame(videoRef.current, snapshotFormat, quality / 100);
    if (!dataUrl) {
      toast.error('프레임 캡처에 실패했습니다.');
      return;
    }

    const ext =
      snapshotFormat === 'image/png' ? 'png' : snapshotFormat === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `video_frame_${formatTime(currentTime).replace(/[:.]/g, '_')}.${ext}`;
    link.click();
    toast.success(`현재 시점(${formatTime(currentTime)}) 이미지가 다운로드되었습니다.`);
  };

  // 2. Capture Specific Timestamp
  const handleCaptureSpecificTime = async () => {
    try {
      const dataUrl = await captureVideoFrameAtTime(
        videoUrl,
        customSec,
        snapshotFormat,
        quality / 100
      );
      const ext =
        snapshotFormat === 'image/png' ? 'png' : snapshotFormat === 'image/webp' ? 'webp' : 'jpg';
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `video_frame_${formatTime(customSec).replace(/[:.]/g, '_')}.${ext}`;
      link.click();
      toast.success(`${formatTime(customSec)} 시점 이미지가 다운로드되었습니다.`);
    } catch {
      toast.error('지정 시간 이미지 캡처에 실패했습니다.');
    }
  };

  // 3. Batch Multi-Frame Extraction
  const handleBatchExtract = async () => {
    setIsExtracting(true);
    setExtractProgress(0);
    try {
      let frames: ExtractedFrame[] = [];
      if (extractMode === 'split') {
        frames = await extractFramesFromVideo(
          videoUrl,
          splitCount,
          (p) => setExtractProgress(p),
          snapshotFormat,
          quality / 100
        );
      } else {
        const safeEnd = rangeEnd > 0 ? Math.min(rangeEnd, duration || rangeEnd) : duration;
        frames = await extractFramesByInterval(
          videoUrl,
          intervalSec,
          rangeStart,
          safeEnd,
          (p) => setExtractProgress(p),
          snapshotFormat,
          quality / 100,
          100
        );
      }

      setExtractedFrames(frames);
      toast.success(`총 ${frames.length}장의 프레임 이미지가 성공적으로 추출되었습니다.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '이미지 일괄 추출 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  // 4. Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (extractedFrames.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await createZipFromFrames(extractedFrames, 'video_extracted_image');
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video_images_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('모든 이미지가 ZIP 압축파일로 다운로드되었습니다.');
    } catch {
      toast.error('ZIP 압축 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
    }
  };

  // 5. Download Single Frame from Gallery
  const handleDownloadSingleFrame = (frame: ExtractedFrame, index: number) => {
    let ext = 'jpg';
    if (frame.dataUrl.startsWith('data:image/png')) ext = 'png';
    else if (frame.dataUrl.startsWith('data:image/webp')) ext = 'webp';

    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `extracted_image_${String(index + 1).padStart(3, '0')}_${frame.timeFormatted.replace(/[:.]/g, '_')}.${ext}`;
    link.click();
  };

  const handleRemoveSingleFrame = (id: string) => {
    setExtractedFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFrames = () => {
    setExtractedFrames([]);
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title & Format Controls */}
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
          <CameraAltRoundedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            동영상 이미지 추출 (Frame & Image Extraction)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>저장 포맷</InputLabel>
            <Select
              value={snapshotFormat}
              label="저장 포맷"
              onChange={(e) => setSnapshotFormat(e.target.value as ImageFormatType)}
            >
              <MenuItem value="image/png">PNG (무손실)</MenuItem>
              <MenuItem value="image/jpeg">JPG (고화질)</MenuItem>
              <MenuItem value="image/webp">WebP (고효율)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Quality Slider (JPG/WebP) */}
      {snapshotFormat !== 'image/png' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', minWidth: 70, fontWeight: 700 }}
          >
            화질 품질: {quality}%
          </Typography>
          <Slider
            value={quality}
            min={50}
            max={100}
            step={5}
            onChange={(_, val) => setQuality(val as number)}
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>
      )}

      {/* Section 1: Instant Single Capture */}
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
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CameraAltRoundedIcon fontSize="small" color="primary" />
          단일 프레임 고화질 캡처
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltRoundedIcon />}
            onClick={handleCaptureCurrent}
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, fontWeight: 700 }}
          >
            현재 시점 ({formatTime(currentTime)}) 즉시 캡처 및 다운로드
          </Button>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flex: { xs: '1 1 100%', sm: '0 0 auto' },
            }}
          >
            <TextField
              size="small"
              type="number"
              label="지정 초(sec)"
              value={customSec}
              onChange={(e) => setCustomSec(Math.max(0, Number(e.target.value)))}
              sx={{ width: 110 }}
              inputProps={{ min: 0, max: Math.ceil(duration || 9999), step: 0.5 }}
            />
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCaptureSpecificTime}
              sx={{ whiteSpace: 'nowrap' }}
            >
              지정 시점 캡처
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Section 2: Batch Timeline Frame Extraction */}
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CollectionsRoundedIcon fontSize="small" color="secondary" />
            타임라인 연속 / 다중 이미지 일괄 추출
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              row
              value={extractMode}
              onChange={(e) => setExtractMode(e.target.value as 'split' | 'interval')}
            >
              <FormControlLabel
                value="split"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    균등 분할
                  </Typography>
                }
              />
              <FormControlLabel
                value="interval"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    시간 간격
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {extractMode === 'split' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>분할 추출 장수</InputLabel>
              <Select
                value={splitCount}
                label="분할 추출 장수"
                onChange={(e) => setSplitCount(Number(e.target.value))}
              >
                <MenuItem value={6}>6장 균등 분할</MenuItem>
                <MenuItem value={12}>12장 균등 분할</MenuItem>
                <MenuItem value={18}>18장 균등 분할</MenuItem>
                <MenuItem value={24}>24장 균등 분할</MenuItem>
                <MenuItem value={36}>36장 균등 분할</MenuItem>
                <MenuItem value={48}>48장 균등 분할</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<CollectionsRoundedIcon />}
              onClick={handleBatchExtract}
              disabled={isExtracting}
              sx={{ flex: 1, minWidth: 200, fontWeight: 700 }}
            >
              {isExtracting
                ? `추출 진행 중... (${extractProgress}%)`
                : `균등 ${splitCount}장 일괄 추출 시작`}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>추출 간격</InputLabel>
                <Select
                  value={intervalSec}
                  label="추출 간격"
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                >
                  <MenuItem value={0.5}>0.5초마다</MenuItem>
                  <MenuItem value={1}>1초마다</MenuItem>
                  <MenuItem value={2}>2초마다</MenuItem>
                  <MenuItem value={3}>3초마다</MenuItem>
                  <MenuItem value={5}>5초마다</MenuItem>
                  <MenuItem value={10}>10초마다</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="number"
                label="시작(초)"
                value={rangeStart}
                onChange={(e) => setRangeStart(Math.max(0, Number(e.target.value)))}
                sx={{ width: 100 }}
              />

              <TextField
                size="small"
                type="number"
                label="종료(초)"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Math.max(0, Number(e.target.value)))}
                sx={{ width: 100 }}
              />

              <Button
                variant="contained"
                color="secondary"
                startIcon={<CollectionsRoundedIcon />}
                onClick={handleBatchExtract}
                disabled={isExtracting}
                sx={{ flex: 1, minWidth: 180, fontWeight: 700 }}
              >
                {isExtracting ? `추출 중... (${extractProgress}%)` : '간격 자동 추출 시작'}
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              * 메모리 보호를 위해 한 번에 최대 100장까지 연속 추출됩니다.
            </Typography>
          </Box>
        )}

        {isExtracting && (
          <LinearProgress
            variant="determinate"
            value={extractProgress}
            sx={{ height: 6, borderRadius: 1 }}
          />
        )}
      </Box>

      {/* Section 3: Extracted Images Gallery */}
      {extractedFrames.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              추출된 이미지 갤러리 ({extractedFrames.length}장)
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="soft"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={handleClearAllFrames}
              >
                전체 삭제
              </Button>

              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<FolderZipRoundedIcon />}
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                sx={{ fontWeight: 700 }}
              >
                {isZipping ? '압축 파일 생성 중...' : '전체 ZIP 다운로드'}
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: 1.5,
              maxHeight: 480,
              overflowY: 'auto',
              p: 0.5,
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
                  '&:hover .overlay-actions': { opacity: 1 },
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
                    px: 0.6,
                    py: 0.2,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {frame.timeFormatted}
                </Typography>

                {/* Hover Action Overlay */}
                <Box
                  className="overlay-actions"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {onSeekToTime && (
                    <Tooltip title="이 시점으로 영상 이동">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: 'text.primary',
                          '&:hover': { bgcolor: '#fff' },
                        }}
                        onClick={() => onSeekToTime(frame.timeSec)}
                      >
                        <PlayCircleOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="이 이미지 다운로드">
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      onClick={() => handleDownloadSingleFrame(frame, idx)}
                    >
                      <DownloadRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="목록에서 삭제">
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'error.main',
                        color: '#fff',
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                      onClick={() => handleRemoveSingleFrame(frame.id)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
