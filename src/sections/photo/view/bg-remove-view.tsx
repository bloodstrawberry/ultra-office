'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GradientRoundedIcon from '@mui/icons-material/GradientRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  BG_REMOVE_MODELS,
  removeBackground,
  type BgStyleType,
  checkWebGPUSupport,
  type BgProgressInfo,
  type BgRemoveResult,
  renderCompositeImage,
} from '../utils/ai-bg-remove';

// ----------------------------------------------------------------------
// Preset Samples for Instant 1-Click Testing
// ----------------------------------------------------------------------

const SAMPLE_IMAGES = [
  {
    id: 'person',
    label: '👤 인물 프로필',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sneaker',
    label: '👟 e-커머스 상품',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'pet',
    label: '🐱 반려동물',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
];

const GRADIENT_PRESETS = [
  { id: 'sunset', label: '석양 (Sunset)', color: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'ocean', label: '오션 (Ocean)', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'cyber', label: '사이버 (Cyber)', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  {
    id: 'emerald',
    label: '에메랄드 (Emerald)',
    color: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  { id: 'warm-studio', label: '웜 스튜디오', color: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
  { id: 'dark-studio', label: '다크 스튜디오', color: 'linear-gradient(135deg, #2e384d, #111827)' },
];

const SOLID_COLORS = [
  { label: '화이트', hex: '#FFFFFF' },
  { label: '스튜디오 그레이', hex: '#F1F5F9' },
  { label: '블랙', hex: '#111827' },
  { label: '파스텔 핑크', hex: '#FCE7F3' },
  { label: '스카이 블루', hex: '#E0F2FE' },
  { label: '민트 그린', hex: '#D1FAE5' },
  { label: '소프트 옐로우', hex: '#FEF3C7' },
];

// ----------------------------------------------------------------------

export function BgRemoveView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('briaai/RMBG-1.4');
  const [gpuStatus, setGpuStatus] = useState<{ supported: boolean; message: string }>({
    supported: false,
    message: '하드웨어 상태 확인 중...',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<BgProgressInfo>({
    status: 'idle',
    text: '',
    progress: 0,
  });

  const [result, setResult] = useState<BgRemoveResult | null>(null);

  // Background Customization State
  const [bgStyle, setBgStyle] = useState<BgStyleType>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [gradientPreset, setGradientPreset] = useState<string>('sunset');
  const [blurAmount, setBlurAmount] = useState<number>(20);

  // Preview Mode
  const [previewMode, setPreviewMode] = useState<'split' | 'single' | 'mask'>('split');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const isDraggingSplit = useRef<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check WebGPU on mount (Hydration safe)
  useEffect(() => {
    checkWebGPUSupport().then(setGpuStatus);
  }, []);

  // Process File
  const handleProcessImage = useCallback(
    async (src: string, modelId: string = selectedModel) => {
      setImageSrc(src);
      setIsLoading(true);
      setResult(null);

      try {
        const res = await removeBackground(src, modelId, (p) => {
          setProgressInfo(p);
        });
        setResult(res);
        toast.success('AI 배경 분리가 완료되었습니다!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`배경 분리 중 오류가 발생했습니다: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedModel]
  );

  // Drop & Paste Hook
  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          handleProcessImage(src);
        };
        reader.readAsDataURL(files[0]);
      }
    },
    multiple: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      handleProcessImage(src);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Split Slider Mouse/Touch Handlers
  const handleSplitMove = useCallback((clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSplitPos(percent);
  }, []);

  const handleMouseDown = () => {
    isDraggingSplit.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingSplit.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit.current) {
        handleSplitMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSplit.current && e.touches[0]) {
        handleSplitMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleSplitMove]);

  // Current display image URL based on selected bgStyle
  const currentRenderedUrl = React.useMemo(() => {
    if (!result) return '';
    if (bgStyle === 'transparent') return result.resultDataUrl;
    return renderCompositeImage(result.foregroundCanvas, result.originalImage, {
      style: bgStyle,
      solidColor,
      gradientPreset,
      blurAmount,
    });
  }, [result, bgStyle, solidColor, gradientPreset, blurAmount]);

  // Download Handler
  const handleDownload = (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = currentRenderedUrl;
    link.download = `ai_bg_removed_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('이미지가 다운로드되었습니다.');
  };

  // Copy PNG to Clipboard
  const handleCopyClipboard = async () => {
    if (!result) return;
    try {
      const response = await fetch(currentRenderedUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      toast.success('클립보드에 PNG 이미지가 복사되었습니다!');
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Box
        sx={{
          mb: 2.5,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              AI 배경 제거 (누끼 따기)
            </Typography>
            <Chip
              label="100% 클라이언트 로컬 AI"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            서버 전송 없이 브라우저 WebGPU 가속으로 인물, 헤어라인, 복잡한 사물 배경을 단 1초 만에
            정밀 분리합니다.
          </Typography>
        </Box>

        {/* Hardware acceleration badge */}
        <Tooltip title={gpuStatus.message}>
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label={gpuStatus.supported ? 'WebGPU ⚡ 하드웨어 가속' : 'WASM CPU 모드'}
            color={gpuStatus.supported ? 'success' : 'default'}
            variant="soft"
            sx={{ fontWeight: 700 }}
          />
        </Tooltip>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {!imageSrc ? (
          /* Empty / Upload State */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card
              {...getRootProps({
                onClick: () => fileInputRef.current?.click(),
              })}
              sx={{
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                borderRadius: 3,
                minHeight: 340,
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <InvertColorsRoundedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                배경을 제거할 사진을 드래그하거나 클릭하여 업로드
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'center' }}
              >
                클립보드 붙여넣기(Ctrl+V) 지원 • 인물, 증명사진, 상품, 반려동물 모두 지원
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                사진 선택하기
              </Button>
            </Card>

            {/* 1-Click Instant Sample Test */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                ⚡ 즉석 테스트 샘플 이미지
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 2, display: 'block' }}
              >
                클릭 한 번으로 AI 누끼 성능을 즉시 테스트해 보세요.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {SAMPLE_IMAGES.map((sample) => (
                  <Card
                    key={sample.id}
                    onClick={() => handleProcessImage(sample.url)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={sample.url}
                      alt={sample.label}
                      sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {sample.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        누끼 실행 ➜
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Card>
          </Box>
        ) : (
          /* Active Processing / Result Workspace */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Viewport Area */}
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Top View Mode Bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <ToggleButtonGroup
                  value={previewMode}
                  exclusive
                  onChange={(_, v) => v && setPreviewMode(v)}
                  size="small"
                >
                  <ToggleButton value="split">
                    <CompareArrowsRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    Before/After 비교 슬라이더
                  </ToggleButton>
                  <ToggleButton value="single">
                    <ViewStreamRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    결과물 보기
                  </ToggleButton>
                  <ToggleButton value="mask">
                    <BlurOnRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    알파 마스크 보기
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setImageSrc('');
                      setResult(null);
                    }}
                    startIcon={<RefreshRoundedIcon />}
                  >
                    다른 사진
                  </Button>
                </Box>
              </Box>

              {/* Viewport Canvas Container */}
              <Box
                ref={splitContainerRef}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 360, sm: 520 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    bgStyle === 'transparent' || previewMode === 'split'
                      ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 20px 20px'
                      : 'background.neutral',
                }}
              >
                {isLoading ? (
                  /* Loading / Progress State */
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      maxWidth: 420,
                    }}
                  >
                    <CircularProgress size={48} thickness={4} color="primary" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {progressInfo.text || 'AI 배경 제거 처리 중...'}
                      </Typography>
                      <LinearProgress
                        variant={progressInfo.progress > 0 ? 'determinate' : 'indeterminate'}
                        value={progressInfo.progress * 100}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        최초 1회 모델 가중치를 로드한 후에는 캐시되어 즉시 처리됩니다.
                      </Typography>
                    </Box>
                  </Box>
                ) : result ? (
                  previewMode === 'split' ? (
                    /* Interactive Split Slider */
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      {/* Background Layer: Edited Result */}
                      <Box
                        component="img"
                        src={currentRenderedUrl}
                        alt="AI Result"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />

                      {/* Foreground Layer: Original Image (Clipped) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                          clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                        }}
                      >
                        <Box
                          component="img"
                          src={imageSrc}
                          alt="Original"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>

                      {/* Split Divider Line & Handle */}
                      <Box
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${splitPos}%`,
                          width: 4,
                          bgcolor: '#FFFFFF',
                          boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                          cursor: 'ew-resize',
                          transform: 'translateX(-50%)',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.primary',
                          }}
                        >
                          <CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </Box>

                      {/* Badges */}
                      <Chip
                        label="원본 (Before)"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label="AI 누끼 (After)"
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  ) : previewMode === 'mask' ? (
                    /* Mask View */
                    <Box
                      component="img"
                      src={result.maskDataUrl}
                      alt="Alpha Mask"
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    /* Single Result View */
                    <Box
                      component="img"
                      src={currentRenderedUrl}
                      alt="Result"
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  )
                ) : (
                  <Box
                    component="img"
                    src={imageSrc}
                    alt="Original"
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                )}
              </Box>
            </Card>

            {/* Right: Controls & Export Sidebar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* AI Model Setting */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  1. AI 모델 설정
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>AI 엔진 모델</InputLabel>
                  <Select
                    value={selectedModel}
                    label="AI 엔진 모델"
                    onChange={(e) => {
                      const newModel = e.target.value;
                      setSelectedModel(newModel);
                      if (imageSrc) handleProcessImage(imageSrc, newModel);
                    }}
                  >
                    {BG_REMOVE_MODELS.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} ({m.size})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disabled={isLoading || !imageSrc}
                  onClick={() => handleProcessImage(imageSrc, selectedModel)}
                  startIcon={<AutoAwesomeRoundedIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  AI 재분석 실행
                </Button>
              </Card>

              {/* Background Customization */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  2. 배경 스타일 교체
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                  <Button
                    variant={bgStyle === 'transparent' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setBgStyle('transparent')}
                    startIcon={<InvertColorsRoundedIcon />}
                    sx={{ py: 1, fontWeight: 700 }}
                  >
                    투명 배경
                  </Button>
                  <Button
                    variant={bgStyle === 'solid' || bgStyle === 'white' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setBgStyle('solid')}
                    startIcon={<ColorLensRoundedIcon />}
                    sx={{ py: 1, fontWeight: 700 }}
                  >
                    단색 컬러
                  </Button>
                  <Button
                    variant={bgStyle === 'gradient' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setBgStyle('gradient')}
                    startIcon={<GradientRoundedIcon />}
                    sx={{ py: 1, fontWeight: 700 }}
                  >
                    그라데이션
                  </Button>
                </Box>

                <Button
                  variant={bgStyle === 'blur' ? 'contained' : 'outlined'}
                  color="secondary"
                  size="small"
                  fullWidth
                  onClick={() => setBgStyle('blur')}
                  startIcon={<BlurOnRoundedIcon />}
                  sx={{ mb: 2, py: 1, fontWeight: 700 }}
                >
                  원본 배경 보케(Bokeh) 블러
                </Button>

                {/* Solid Color Options */}
                {bgStyle === 'solid' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                      추천 배경 색상
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      {SOLID_COLORS.map((c) => (
                        <Tooltip key={c.hex} title={c.label}>
                          <Box
                            onClick={() => setSolidColor(c.hex)}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: c.hex,
                              border: '2px solid',
                              borderColor: solidColor === c.hex ? 'primary.main' : 'divider',
                              cursor: 'pointer',
                              transform: solidColor === c.hex ? 'scale(1.15)' : 'none',
                              transition: 'all 0.15s',
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        style={{
                          width: 40,
                          height: 34,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        커스텀 HEX: {solidColor}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Gradient Options */}
                {bgStyle === 'gradient' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                      그라데이션 프리셋
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {GRADIENT_PRESETS.map((g) => (
                        <Button
                          key={g.id}
                          variant="outlined"
                          size="small"
                          onClick={() => setGradientPreset(g.id)}
                          sx={{
                            background: g.color,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            borderColor: gradientPreset === g.id ? 'primary.main' : 'transparent',
                            borderWidth: 2,
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            py: 1,
                          }}
                        >
                          {g.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Blur Slider */}
                {bgStyle === 'blur' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        블러 강도
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {blurAmount}px
                      </Typography>
                    </Box>
                    <Slider
                      value={blurAmount}
                      min={4}
                      max={40}
                      onChange={(_, v) => setBlurAmount(v as number)}
                    />
                  </Box>
                )}
              </Card>

              {/* Action & Download Bar */}
              <Card
                sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  3. 저장 및 공유
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleDownload('png')}
                  disabled={!result || isLoading}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 1.3, fontWeight: 800, borderRadius: 2 }}
                >
                  고화질 PNG 다운로드
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={handleCopyClipboard}
                    disabled={!result || isLoading}
                    startIcon={<ContentCopyRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    클립보드 복사
                  </Button>

                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={() => handleDownload('jpeg')}
                    disabled={!result || isLoading}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    JPG 저장
                  </Button>
                </Box>

                {/* Connect to other photo tools */}
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}
                >
                  다른 사진 도구로 연계하기:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    href={paths.photo.fourCut}
                    size="small"
                    variant="soft"
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    인생네컷 스티커
                  </Button>
                  <Button
                    component={RouterLink}
                    href={paths.photo.watermark}
                    size="small"
                    variant="soft"
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    워터마크 각인
                  </Button>
                  <Button
                    component={RouterLink}
                    href={paths.photo.sero}
                    size="small"
                    variant="soft"
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    모바일 썸네일
                  </Button>
                </Box>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
