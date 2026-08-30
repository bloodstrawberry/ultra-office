'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  type GifFrameItem,
  convertGifToVideo,
  getDataUrlByteSize,
  adjustGifSpeedAndReverse,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioSpeedView() {
  const [speedFile, setSpeedFile] = useState<File | null>(null);
  const [speedFilePreview, setSpeedFilePreview] = useState<string>('');
  const [speedFrames, setSpeedFrames] = useState<GifFrameItem[]>([]);
  const [speedDimensions, setSpeedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isSpeedExtracting, setIsSpeedExtracting] = useState<boolean>(false);
  const [speedPlayerIndex, setSpeedPlayerIndex] = useState<number>(0);
  const [isPlayingSpeed, setIsPlayingSpeed] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [speedLoopMode, setSpeedLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [skipFrames, setSkipFrames] = useState<boolean>(false);
  const [resizeScale, setResizeScale] = useState<number>(1.0);
  const [speedResultUrl, setSpeedResultUrl] = useState<string>('');
  const [activeSpeedPreviewTab, setActiveSpeedPreviewTab] = useState<'live' | 'encoded'>('live');
  const [isSpeedProcessing, setIsSpeedProcessing] = useState<boolean>(false);
  const [speedProgress, setSpeedProgress] = useState<number>(0);
  const [speedMp4Url, setSpeedMp4Url] = useState<string>('');
  const [speedMp4Size, setSpeedMp4Size] = useState<number>(0);
  const [isSpeedMp4Converting, setIsSpeedMp4Converting] = useState<boolean>(false);
  const [speedMp4Progress, setSpeedMp4Progress] = useState<number>(0);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const speedInputRef = useRef<HTMLInputElement>(null);
  const boomerangForwardRef = useRef<boolean>(true);

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = rightPanelWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = resizeStartXRef.current - e.clientX;
    const newWidth = Math.max(280, Math.min(680, resizeStartWidthRef.current + deltaX));
    setRightPanelWidth(newWidth);
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const processSpeedFile = useCallback(async (file: File) => {
    setSpeedFile(file);
    setSpeedResultUrl('');
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    setActiveSpeedPreviewTab('live');
    const url = URL.createObjectURL(file);
    setSpeedFilePreview(url);
    setIsSpeedExtracting(true);
    setSpeedPlayerIndex(0);
    setIsPlayingSpeed(true);
    boomerangForwardRef.current = true;
    toast.info('GIF 프레임을 분석하여 실시간 미리보기를 준비하는 중...');

    try {
      const res = await extractGifFrames(file);
      setSpeedFrames(res.frames);
      setSpeedDimensions({ width: res.width, height: res.height });
      toast.success(`총 ${res.frames.length}개 프레임 로드 완료! 속도와 방향을 즉시 조절해보세요.`);
    } catch {
      toast.error('GIF 프레임 분석에 실패했습니다.');
      setSpeedFrames([]);
    } finally {
      setIsSpeedExtracting(false);
    }
  }, []);

  const speedDrop = useImageDropPaste({
    onFiles: (files) => {
      const gif = files.find((f) => f.type === 'image/gif' || f.name.endsWith('.gif'));
      if (gif) processSpeedFile(gif);
      else toast.error('GIF 파일만 업로드할 수 있습니다.');
    },
    disabled: false,
  });

  const handleSelectSpeedSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const file = await fetchSampleGifFile(sample);
      await processSpeedFile(file);
      toast.success(`'${sample.label}' 예시 파일을 불러왔습니다.`);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  // Filtered active frames based on skipFrames
  const activeSpeedFrames = React.useMemo(() => {
    if (!speedFrames || speedFrames.length === 0) return [];
    if (skipFrames && speedFrames.length > 4) {
      return speedFrames.filter((_, idx) => idx % 2 === 0);
    }
    return speedFrames;
  }, [speedFrames, skipFrames]);

  useEffect(() => {
    if (activeSpeedFrames.length > 0 && speedPlayerIndex >= activeSpeedFrames.length) {
      setSpeedPlayerIndex(0);
    }
  }, [activeSpeedFrames.length, speedPlayerIndex]);

  useEffect(() => {
    if (speedLoopMode === 'reverse') {
      boomerangForwardRef.current = false;
    } else {
      boomerangForwardRef.current = true;
    }
  }, [speedLoopMode]);

  // Live Playback Engine
  useEffect(() => {
    if (!isPlayingSpeed || activeSpeedFrames.length <= 1) return undefined;

    const currentFrame = activeSpeedFrames[speedPlayerIndex] || activeSpeedFrames[0];
    const baseDelay = currentFrame?.delay || 100;
    const effectiveDelay = skipFrames ? baseDelay * 2 : baseDelay;
    const targetDelay = Math.max(5, Math.round(effectiveDelay / Math.max(0.1, speedMultiplier)));

    const timer = setTimeout(() => {
      setSpeedPlayerIndex((prev) => {
        const total = activeSpeedFrames.length;
        if (total <= 1) return 0;

        if (speedLoopMode === 'normal') {
          return (prev + 1) % total;
        }

        if (speedLoopMode === 'reverse') {
          return prev <= 0 ? total - 1 : prev - 1;
        }

        if (speedLoopMode === 'boomerang') {
          if (boomerangForwardRef.current) {
            if (prev >= total - 1) {
              boomerangForwardRef.current = false;
              return Math.max(0, total - 2);
            }
            return prev + 1;
          }
          if (prev <= 0) {
            boomerangForwardRef.current = true;
            return Math.min(total - 1, 1);
          }
          return prev - 1;
        }

        return (prev + 1) % total;
      });
    }, targetDelay);

    return () => clearTimeout(timer);
  }, [
    isPlayingSpeed,
    activeSpeedFrames,
    speedPlayerIndex,
    speedMultiplier,
    speedLoopMode,
    skipFrames,
  ]);

  const handleSpeedMultiplierChange = (newSpeed: number) => {
    setSpeedMultiplier(newSpeed);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleSpeedLoopModeChange = (newMode: 'normal' | 'reverse' | 'boomerang') => {
    setSpeedLoopMode(newMode);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleSpeedSkipFramesChange = (checked: boolean) => {
    setSkipFrames(checked);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleApplySpeedAndReverse = async () => {
    if (!speedFile) {
      toast.error('처리할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSpeedProcessing(true);
    setSpeedProgress(0);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    toast.info('GIF 속도 및 재생 옵션을 새 GIF 파일로 재인코딩 중입니다...');

    try {
      const res = await adjustGifSpeedAndReverse(speedFile, {
        speedMultiplier,
        loopMode: speedLoopMode,
        skipFrames,
        resizeScale,
        progressCallback: (p) => setSpeedProgress(p),
      });
      setSpeedResultUrl(res);
      setActiveSpeedPreviewTab('encoded');
      toast.success('GIF 속도/역재생 인코딩이 완료되었습니다!');
    } catch {
      toast.error('GIF 속도 조절 중 오류가 발생했습니다.');
    } finally {
      setIsSpeedProcessing(false);
    }
  };

  const handleDownloadSpeedMp4 = async () => {
    if (!speedResultUrl) {
      toast.error('먼저 속도/역재생 적용 인코딩을 완료해주세요.');
      return;
    }

    if (speedMp4Url) {
      const link = document.createElement('a');
      link.href = speedMp4Url;
      link.download = `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.mp4`;
      link.click();
      toast.success('MP4 동영상이 다운로드되었습니다.');
      return;
    }

    setIsSpeedMp4Converting(true);
    setSpeedMp4Progress(0);
    toast.info('속도/역재생이 적용된 MP4 동영상으로 변환하고 있습니다...');

    try {
      const resBlob = await fetch(speedResultUrl).then((r) => r.blob());
      const videoRes = await convertGifToVideo(resBlob, {
        targetFormat: 'mp4',
        fps: 30,
        scale: 1.0,
        speedMultiplier: 1.0,
        progressCallback: (p) => setSpeedMp4Progress(p),
      });

      setSpeedMp4Url(videoRes.videoUrl);
      setSpeedMp4Size(videoRes.size);

      const link = document.createElement('a');
      link.href = videoRes.videoUrl;
      link.download = `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.mp4`;
      link.click();

      toast.success('MP4 동영상 다운로드가 완료되었습니다!');
    } catch {
      toast.error('MP4 동영상 변환 중 오류가 발생했습니다.');
    } finally {
      setIsSpeedMp4Converting(false);
    }
  };

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <GifStudioNavHeader currentTab="speed" />

      <input
        ref={speedInputRef}
        type="file"
        accept="image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processSpeedFile(file);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {!speedFile ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <GifSampleSection
            onSelectSample={handleSelectSpeedSample}
            loadingSampleId={loadingSampleId}
            isLoading={isSpeedExtracting || isSpeedProcessing || !!loadingSampleId}
            title="⚡ 즉석 테스트 예시 GIF 파일"
            subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 속도 조절, 역재생, 부메랑 및 MP4 변환을 테스트해 보세요."
            actionLabel="속도 편집 ➜"
          />

          <Card
            {...speedDrop.getRootProps({
              onClick: () => speedInputRef.current?.click(),
            })}
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              flex: '1 1 auto',
              minHeight: 180,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SpeedRoundedIcon sx={{ fontSize: 38 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              속도/역재생을 편집할 GIF 파일 업로드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              재생 배속 변경(0.25x~20x), 거꾸로 역재생, 부메랑 루프를 실시간으로 즉시 확인하고
              인코딩합니다
            </Typography>
            <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
              GIF 파일 선택
            </Button>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, lg: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Preview */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 1.5,
              pr: { lg: 1 },
            }}
          >
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              {/* Header with Mode Toggle / Badges */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                {speedResultUrl ? (
                  <ToggleButtonGroup
                    value={activeSpeedPreviewTab}
                    exclusive
                    onChange={(_, v) => v && setActiveSpeedPreviewTab(v)}
                    size="small"
                  >
                    <ToggleButton
                      value="live"
                      sx={{ px: 1.5, py: 0.5, fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      ⚡ 실시간 조절 미리보기
                    </ToggleButton>
                    <ToggleButton
                      value="encoded"
                      sx={{ px: 1.5, py: 0.5, fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      💾 인코딩 결과 GIF
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      실시간 속도 & 역재생 미리보기
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                  {activeSpeedPreviewTab === 'live' ? (
                    <>
                      <Chip
                        size="small"
                        color="primary"
                        label={`${speedMultiplier}x 속도`}
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          speedLoopMode === 'reverse'
                            ? '역방향 (거꾸로)'
                            : speedLoopMode === 'boomerang'
                              ? '부메랑 루프'
                              : '정방향'
                        }
                        sx={{ fontWeight: 600 }}
                      />
                      {skipFrames && (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label="50% 프레임 감량"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </>
                  ) : (
                    <Chip
                      size="small"
                      color="success"
                      icon={<CheckCircleRoundedIcon />}
                      label={`인코딩 완료 (${formatBytes(getDataUrlByteSize(speedResultUrl))})`}
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Main Preview Box */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSpeedExtracting ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                      color: '#94a3b8',
                    }}
                  >
                    <CircularProgress size={36} color="inherit" />
                    <Typography variant="body2">GIF 프레임을 분석하는 중입니다...</Typography>
                  </Box>
                ) : activeSpeedPreviewTab === 'encoded' && speedResultUrl ? (
                  <img
                    src={speedResultUrl}
                    alt="GIF Speed Encoded Result"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <img
                      src={activeSpeedFrames[speedPlayerIndex]?.dataUrl || speedFilePreview || ''}
                      alt="GIF Speed Live Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />

                    {/* Top-Left Mode & Speed Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff',
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: isPlayingSpeed ? '#22c55e' : '#eab308',
                        }}
                      />
                      {speedMultiplier}x |{' '}
                      {speedLoopMode === 'reverse'
                        ? '역재생'
                        : speedLoopMode === 'boomerang'
                          ? '부메랑'
                          : '정방향'}
                    </Box>

                    {/* Top-Right Frame Badge */}
                    {activeSpeedFrames.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(6px)',
                          color: '#fff',
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        프레임 {speedPlayerIndex + 1} / {activeSpeedFrames.length}
                      </Box>
                    )}
                  </>
                )}
              </Box>

              {/* Playback Control Bar (Live Preview Mode) */}
              {activeSpeedPreviewTab === 'live' && activeSpeedFrames.length > 0 && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.25,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  {/* Scrubber Slider */}
                  <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Slider
                      size="small"
                      value={speedPlayerIndex}
                      min={0}
                      max={Math.max(0, activeSpeedFrames.length - 1)}
                      onChange={(_, val) => {
                        setSpeedPlayerIndex(Number(val));
                        setIsPlayingSpeed(false);
                      }}
                      sx={{ flex: '1 1 auto' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        minWidth: 50,
                        textAlign: 'right',
                        color: 'text.secondary',
                      }}
                    >
                      {speedPlayerIndex + 1} / {activeSpeedFrames.length}
                    </Typography>
                  </Box>

                  {/* Control Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={isPlayingSpeed ? '일시정지' : '실시간 재생'}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setIsPlayingSpeed(!isPlayingSpeed)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          {isPlayingSpeed ? (
                            <PauseRoundedIcon fontSize="small" />
                          ) : (
                            <PlayArrowRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="처음부터 재생">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSpeedPlayerIndex(0);
                            boomerangForwardRef.current = true;
                          }}
                        >
                          <ReplayRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="이전 프레임">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsPlayingSpeed(false);
                            setSpeedPlayerIndex((prev) =>
                              prev <= 0 ? activeSpeedFrames.length - 1 : prev - 1
                            );
                          }}
                        >
                          <SkipPreviousRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="다음 프레임">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsPlayingSpeed(false);
                            setSpeedPlayerIndex((prev) => (prev + 1) % activeSpeedFrames.length);
                          }}
                        >
                          <SkipNextRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 500 }}
                      >
                        해상도: {speedDimensions.width} × {speedDimensions.height}px
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Card>
          </Box>

          {/* Desktop Resizing Divider */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              width: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            <Box sx={{ width: '2px', height: '100%', bgcolor: 'divider' }} />
          </Box>

          {/* Right: Speed Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', lg: `${rightPanelWidth}px` },
              minWidth: { lg: `${rightPanelWidth}px` },
              maxWidth: { lg: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              pl: { lg: 1 },
            }}
          >
            {/* Speed Multiplier Card */}
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    재생 배속 설정
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={speedMultiplier}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleSpeedMultiplierChange(
                          Math.max(0.1, Math.min(20, Math.round(val * 100) / 100))
                        );
                      }
                    }}
                    inputProps={{
                      min: 0.1,
                      max: 20,
                      step: 0.25,
                      style: {
                        padding: '4px 8px',
                        width: 58,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <Chip
                    size="small"
                    color="primary"
                    label={`${speedMultiplier}x`}
                    sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </Box>
              </Box>

              {/* Speed Slider */}
              <Box sx={{ px: 1 }}>
                <Slider
                  value={speedMultiplier}
                  min={0.25}
                  max={20.0}
                  step={0.25}
                  onChange={(_, v) => handleSpeedMultiplierChange(Number(v))}
                  marks={[
                    { value: 0.25, label: '0.25x' },
                    { value: 1.0, label: '1x' },
                    { value: 5.0, label: '5x' },
                    { value: 10.0, label: '10x' },
                    { value: 15.0, label: '15x' },
                    { value: 20.0, label: '20x' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}x`}
                />
              </Box>

              {/* Preset Quick Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 10.0, 15.0, 20.0].map((preset) => (
                  <Chip
                    key={preset}
                    label={`${preset}x`}
                    size="small"
                    clickable
                    onClick={() => handleSpeedMultiplierChange(preset)}
                    color={speedMultiplier === preset ? 'primary' : 'default'}
                    variant={speedMultiplier === preset ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Card>

            {/* Loop Mode Card */}
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                재생 방향 (루프 모드)
              </Typography>
              <ToggleButtonGroup
                value={speedLoopMode}
                exclusive
                onChange={(_, v) => v && handleSpeedLoopModeChange(v)}
                fullWidth
                size="small"
              >
                <ToggleButton value="normal" sx={{ fontWeight: 600, py: 1 }}>
                  정방향
                </ToggleButton>
                <ToggleButton value="reverse" sx={{ fontWeight: 600, py: 1 }}>
                  역방향 (거꾸로)
                </ToggleButton>
                <ToggleButton value="boomerang" sx={{ fontWeight: 600, py: 1 }}>
                  부메랑 (왕복)
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {speedLoopMode === 'normal' &&
                  '처음부터 끝까지 정상 방향으로 무한 반복 재생합니다.'}
                {speedLoopMode === 'reverse' && '마지막 프레임부터 거꾸로 역재생합니다.'}
                {speedLoopMode === 'boomerang' &&
                  '정방향으로 재생 후 다시 거꾸로 재생되어 자연스러운 왕복 루프를 만듭니다.'}
              </Typography>
            </Card>

            {/* Resize & Skip Frames Card */}
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                해상도 및 용량 최적화
              </Typography>

              <FormControl size="small" fullWidth>
                <InputLabel>해상도 리사이즈</InputLabel>
                <Select
                  value={resizeScale}
                  label="해상도 리사이즈"
                  onChange={(e) => setResizeScale(Number(e.target.value))}
                >
                  <MenuItem value={1.0}>100% (원본 해상도 유지)</MenuItem>
                  <MenuItem value={0.75}>75% 축소 (용량 절감)</MenuItem>
                  <MenuItem value={0.5}>50% 축소 (초경량)</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={skipFrames}
                    onChange={(e) => handleSpeedSkipFramesChange(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      프레임 50% 감량
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      홀수 프레임을 건너뛰어 GIF 용량을 대폭 압축합니다
                    </Typography>
                  </Box>
                }
              />
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleApplySpeedAndReverse}
                disabled={isSpeedProcessing}
                startIcon={
                  isSpeedProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SpeedRoundedIcon />
                  )
                }
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
              >
                {isSpeedProcessing
                  ? `새 GIF 인코딩 중 (${speedProgress}%)`
                  : '속도/역재생 적용하기 (새 GIF 인코딩)'}
              </Button>

              {speedResultUrl && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      downloadDataUrl(
                        speedResultUrl,
                        `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.gif`
                      )
                    }
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    GIF 다운로드 ({formatBytes(getDataUrlByteSize(speedResultUrl))})
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    onClick={handleDownloadSpeedMp4}
                    disabled={isSpeedMp4Converting}
                    startIcon={
                      isSpeedMp4Converting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <MovieCreationRoundedIcon />
                      )
                    }
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isSpeedMp4Converting
                      ? `MP4 동영상 변환 중 (${speedMp4Progress}%)`
                      : speedMp4Size > 0
                        ? `MP4 다운로드 (${formatBytes(speedMp4Size)})`
                        : 'MP4 동영상 다운로드'}
                  </Button>
                </>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={(e) => setSampleMenuAnchorEl(e.currentTarget)}
                startIcon={<AutoAwesomeRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
              >
                ⚡ 예시 GIF 불러오기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => speedInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 GIF 파일 불러오기
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Sample Menu */}
      <Menu
        anchorEl={sampleMenuAnchorEl}
        open={Boolean(sampleMenuAnchorEl)}
        onClose={() => setSampleMenuAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            width: 280,
            maxHeight: 380,
            borderRadius: 2,
            p: 0.5,
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            ⚡ 예시 GIF 선택
          </Typography>
        </Box>

        {GIF_SAMPLE_LIST.map((sample) => (
          <MenuItem
            key={sample.id}
            onClick={() => {
              setSampleMenuAnchorEl(null);
              handleSelectSpeedSample(sample);
            }}
            sx={{ gap: 1.5, py: 1, my: 0.25, borderRadius: 1 }}
          >
            <Box
              component="img"
              src={sample.url}
              alt={sample.label}
              sx={{ width: 38, height: 38, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }} noWrap>
                {sample.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                noWrap
              >
                {sample.subLabel}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </DashboardContent>
  );
}
