'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { ART_FILTERS, type FilterType, applyArtStyleFilter } from '../utils/art-style-processor';
import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';
import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SampleImageItem,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';

const ART_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-scenery',
    label: '도시 야경 (사이버펑크 / 판화)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    subLabel: '풍경 & 건축물',
  },
  {
    id: 'sample-portrait',
    label: '인물 초상 (스케치 / 색연필 / 파스텔)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 헤어',
  },
  {
    id: 'sample-nature',
    label: '자연 & 꽃 (수채화 / 수묵화 / 인상파)',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80',
    subLabel: '정물 & 자연',
  },
  {
    id: 'sample-animal',
    label: '반려동물 (지브리 애니 / 목탄화 / 유화)',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    subLabel: '동물 & 반려묘',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: '전체 (14)' },
  { id: 'drawing', label: '드로잉·소묘' },
  { id: 'painting', label: '회화·수채화' },
  { id: 'graphic', label: '애니·팝아트' },
  { id: 'vintage', label: '빈티지' },
] as const;

type CategoryFilter = (typeof CATEGORY_TABS)[number]['id'];

export function ArtStyleView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('oil_painting');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [intensity, setIntensity] = useState<number>(85);
  const [brushSize, setBrushSize] = useState<number>(4);

  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const newWidth = Math.max(280, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  const applyFilter = useCallback(async () => {
    if (!imageSrc) {
      setResultDataUrl('');
      return '';
    }

    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageSrc;
      });

      const maxDim = 1200;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);

      applyArtStyleFilter(ctx, w, h, {
        filter: activeFilter,
        intensity,
        brushSize,
      });

      const outUrl = canvas.toDataURL('image/png');
      setResultDataUrl(outUrl);
      return outUrl;
    } catch {
      toast.error('필터 적용 중 오류가 발생했습니다.');
      return '';
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, activeFilter, intensity, brushSize]);

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        applyFilter();
      }, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [imageSrc, activeFilter, intensity, brushSize, applyFilter]);

  const handleSaveResult = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        resultDataUrl,
        `art_style_${activeFilter}_result_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('결과물 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSplit = async () => {
    if (!imageSrc || !resultDataUrl) return;
    setIsProcessing(true);
    try {
      const splitUrl = await renderGenericSplitComparisonImage({
        originalSrc: imageSrc,
        resultSrc: resultDataUrl,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      await downloadDataUrl(
        splitUrl,
        `art_style_${activeFilter}_split_comparison_${Date.now()}.png`
      );
      toast.success('슬라이더 비교 상태 그대로 저장되었습니다.');
    } catch {
      toast.error('비교 상태 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const currentFilterObj = ART_FILTERS.find((f) => f.id === activeFilter);
      const res = await shareToKakaoTalk(
        resultDataUrl,
        `[Ultra Office] ${currentFilterObj?.name || '화풍 변환'} 사진`,
        `art_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredList =
    selectedCategory === 'all'
      ? ART_FILTERS
      : ART_FILTERS.filter((f) => f.category === selectedCategory);

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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          명화 & 아티스틱 화풍 변환 (Art Style Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          인상파 유화, 수묵화, 색연필화, 수채화, 지브리 애니, 목탄화, 판화 등 14종의 고품질 예술
          화풍을 적용합니다.
        </Typography>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={ART_SAMPLE_IMAGES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              setImageSrc(src);
              setResultDataUrl('');
            };
            reader.readAsDataURL(file);
          }}
          title="스타일을 적용할 이미지 업로드"
          subtitle="PNG, JPG, WEBP 이미지를 드래그하거나 클릭하여 올려주세요."
          icon={<AutoFixHighRoundedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Split Before/After Preview */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
            }}
          >
            <PhotoCompareViewport
              originalSrc={imageSrc}
              resultSrc={resultDataUrl}
              isLoading={isProcessing}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              splitOrientation={splitOrientation}
              onSplitOrientationChange={setSplitOrientation}
              splitMode={splitMode}
              onSplitModeChange={setSplitMode}
              splitStart={splitStart}
              onSplitStartChange={setSplitStart}
              splitEnd={splitEnd}
              onSplitEndChange={setSplitEnd}
              bgStyle="neutral"
            />
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
              position: 'relative',
              '&:hover .divider-bar, &:active .divider-bar': {
                bgcolor: 'primary.main',
                width: '3px',
              },
              '&:hover .divider-handle, &:active .divider-handle': {
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                '& > div > div': {
                  bgcolor: '#ffffff',
                },
              },
            }}
          >
            {/* Divider Line */}
            <Box
              className="divider-bar"
              sx={{
                width: '2px',
                height: '100%',
                bgcolor: 'divider',
                borderRadius: '1px',
                transition: 'all 0.15s ease',
              }}
            />
            {/* Grab Handle */}
            <Box
              className="divider-handle"
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14,
                height: 36,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  '& > div': {
                    width: 1.5,
                    height: '100%',
                    bgcolor: 'text.disabled',
                    borderRadius: 1,
                    transition: 'all 0.15s ease',
                  },
                }}
              >
                <div />
                <div />
              </Box>
            </Box>
          </Box>

          {/* Right: Filter Options & Sliders */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.25,
              minHeight: 0,
              height: '100%',
              overflow: { xs: 'auto', md: 'hidden' },
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
              }}
            >
              {/* Category Filter Chips */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, flexShrink: 0 }}>
                1. 예술 화풍 선택 (14종)
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, flexShrink: 0 }}>
                {CATEGORY_TABS.map((tab) => (
                  <Chip
                    key={tab.id}
                    label={tab.label}
                    size="small"
                    clickable
                    color={selectedCategory === tab.id ? 'primary' : 'default'}
                    variant={selectedCategory === tab.id ? 'filled' : 'outlined'}
                    onClick={() => setSelectedCategory(tab.id)}
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }}
                  />
                ))}
              </Box>

              {/* Filter List: Dynamic Full-Height Flex Scroll */}
              <ToggleButtonGroup
                orientation="vertical"
                value={activeFilter}
                exclusive
                onChange={(_, v) => v && setActiveFilter(v)}
                fullWidth
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6,
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  mb: 1.25,
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'text.disabled' },
                }}
              >
                {filteredList.map((f) => (
                  <ToggleButton
                    key={f.id}
                    value={f.id}
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: activeFilter === f.id ? 'primary.main' : 'divider',
                      p: '7px 10px',
                      textAlign: 'left',
                      flexShrink: 0,
                      bgcolor: activeFilter === f.id ? 'primary.lighter' : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: activeFilter === f.id ? 'primary.lighter' : 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
                      <Typography sx={{ fontSize: '1.3rem', flexShrink: 0 }}>{f.icon}</Typography>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: activeFilter === f.id ? 'primary.darker' : 'text.primary',
                          }}
                        >
                          {f.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {f.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Sliders in compact container */}
              <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                <Box sx={{ mb: 0.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      화풍 강도 (Intensity)
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}
                    >
                      {intensity}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={10}
                    max={100}
                    value={intensity}
                    onChange={(_, v) => setIntensity(v as number)}
                    sx={{ py: 0.4 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      붓터치 / 브러시 굵기
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}
                    >
                      {brushSize}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={1}
                    max={10}
                    value={brushSize}
                    onChange={(_, v) => setBrushSize(v as number)}
                    sx={{ py: 0.4 }}
                  />
                </Box>
              </Box>
            </Card>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.85,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setImageSrc('');
                    setResultDataUrl('');
                  }}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  다른 사진
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleShare}
                  disabled={isProcessing || !resultDataUrl}
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  공유
                </Button>
              </Box>

              {/* Main: Clean Result Save */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSaveResult}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장
              </Button>

              {/* Secondary: Split Slider Comparison State Save */}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleSaveSplit}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ py: 0.65, borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}
              >
                비교 상태 저장 (Split View)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
