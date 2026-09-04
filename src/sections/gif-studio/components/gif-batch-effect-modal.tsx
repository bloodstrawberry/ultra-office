'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';

import {
  getBatchEffectById,
  type EffectCategory,
  GIF_BATCH_EFFECTS_REGISTRY,
} from '../utils/gif-batch-effect-registry';
import {
  formatBytes,
  downloadDataUrl,
  type GifFrameItem,
  getDataUrlByteSize,
  createGifFromImages,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  onClose: () => void;
  frames: GifFrameItem[];
  onApplySuccess?: (newGifDataUrl: string) => void;
}

type PreviewViewMode = 'split' | 'single' | 'original';
type SplitOrientation = 'horizontal' | 'vertical';
type SplitMode = 'inside' | 'outside';
type BatchExportType = 'result' | 'compare';

// Helper: load image asynchronously
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Helper: render single split compare frame onto canvas (ZERO lines/bars in output image)
async function renderSplitCompareFrame(
  originalDataUrl: string,
  resultDataUrl: string,
  orientation: SplitOrientation,
  splitMode: SplitMode,
  splitStartPercent: number,
  splitEndPercent: number
): Promise<string> {
  const [imgOrig, imgRes] = await Promise.all([
    loadImage(originalDataUrl),
    loadImage(resultDataUrl),
  ]);

  const width = imgOrig.naturalWidth || imgOrig.width || 400;
  const height = imgOrig.naturalHeight || imgOrig.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return resultDataUrl;

  const sStart = Math.max(0, Math.min(100, Math.min(splitStartPercent, splitEndPercent)));
  const sEnd = Math.max(0, Math.min(100, Math.max(splitStartPercent, splitEndPercent)));

  // 1. Draw transformed result layer on bottom
  ctx.drawImage(imgRes, 0, 0, width, height);

  // 2. Draw original layer with clipping region (CLEAN without any line / border / handle)
  ctx.save();
  ctx.beginPath();

  if (orientation === 'horizontal') {
    const xStart = (sStart / 100) * width;
    const xEnd = (sEnd / 100) * width;

    if (splitMode === 'inside') {
      // Effect is in the center [sStart ~ sEnd], so original is at Left [0 ~ sStart] and Right [sEnd ~ width]
      ctx.rect(0, 0, xStart, height);
      ctx.rect(xEnd, 0, width - xEnd, height);
    } else {
      // Effect is at Edges [0 ~ sStart] and [sEnd ~ width], so original is in Center [sStart ~ sEnd]
      ctx.rect(xStart, 0, xEnd - xStart, height);
    }
  } else {
    const yStart = (sStart / 100) * height;
    const yEnd = (sEnd / 100) * height;

    if (splitMode === 'inside') {
      // Effect is in the center [sStart ~ sEnd], so original is at Top [0 ~ sStart] and Bottom [yEnd ~ height]
      ctx.rect(0, 0, width, yStart);
      ctx.rect(0, yEnd, width, height - yEnd);
    } else {
      // Effect is at Top and Bottom, so original is in Center [sStart ~ sEnd]
      ctx.rect(0, yStart, width, yEnd - yStart);
    }
  }

  ctx.clip();
  ctx.drawImage(imgOrig, 0, 0, width, height);
  ctx.restore();

  // NOTE: Absolutely NO divider lines, handles or overlays are drawn on the exported image!
  return canvas.toDataURL('image/png');
}

export function GifBatchEffectModal({ open, onClose, frames, onApplySuccess }: Props) {
  // Category & Search
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Effect
  const [selectedEffectId, setSelectedEffectId] = useState<string>(
    GIF_BATCH_EFFECTS_REGISTRY[0]?.id || 'filter_art_style'
  );

  // Options Store for each effect
  const [optionsMap, setOptionsMap] = useState<Record<string, Record<string, unknown>>>(() => {
    const initial: Record<string, Record<string, unknown>> = {};
    GIF_BATCH_EFFECTS_REGISTRY.forEach((eff) => {
      initial[eff.id] = { ...eff.defaultOptions };
    });
    return initial;
  });

  // Preview & Viewport State
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewResultUrl, setPreviewResultUrl] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewViewMode, setPreviewViewMode] = useState<PreviewViewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  // Split Dragging Reference
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingStartRef = useRef(false);
  const isDraggingEndRef = useRef(false);

  // Transformed Frames Cache (for real-time animation playback)
  const [frameCache, setFrameCache] = useState<Record<number, string>>({});
  const [isPreRenderingAll, setIsPreRenderingAll] = useState<boolean>(false);
  const [preRenderProgress, setPreRenderProgress] = useState<number>(0);

  // Animation Playback State
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);

  // GIF Encoding Options
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [loopMode, setLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [qualitySampleInterval, setQualitySampleInterval] = useState<number>(10);

  // Batch Processing State
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchExportType, setBatchExportType] = useState<BatchExportType>('result');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);
  const [generatedCompareGifUrl, setGeneratedCompareGifUrl] = useState<string | null>(null);

  const selectedEffect = getBatchEffectById(selectedEffectId) || GIF_BATCH_EFFECTS_REGISTRY[0];
  const currentEffectOptions = optionsMap[selectedEffect.id] || selectedEffect.defaultOptions;

  const currentPreviewFrame = frames[previewIndex] || frames[0];

  // Update specific effect options
  const handleUpdateOptions = (newOptions: Record<string, unknown>) => {
    setOptionsMap((prev) => ({
      ...prev,
      [selectedEffect.id]: newOptions,
    }));
  };

  // Render single frame preview when frame, effect, or options change
  const renderSinglePreview = useCallback(
    async (targetIdx: number) => {
      const targetFrame = frames[targetIdx];
      if (!targetFrame || !selectedEffect) return;

      // Check cache first
      if (frameCache[targetIdx]) {
        setPreviewResultUrl(frameCache[targetIdx]);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const res = await selectedEffect.apply(
          targetFrame.dataUrl,
          currentEffectOptions,
          targetIdx,
          frames.length
        );
        setPreviewResultUrl(res);
        setFrameCache((prev) => ({ ...prev, [targetIdx]: res }));
      } catch {
        setPreviewResultUrl(targetFrame.dataUrl);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [frames, selectedEffect, currentEffectOptions, frameCache]
  );

  // Clear cache & reset generated GIFs when effect or options change
  useEffect(() => {
    setFrameCache({});
    setGeneratedGifUrl(null);
    setGeneratedCompareGifUrl(null);
    setProgressPercent(0);
    setProgressText('');
  }, [selectedEffectId, currentEffectOptions, speedMultiplier, loopMode, qualitySampleInterval]);

  // Trigger single frame preview on index or option change
  useEffect(() => {
    if (open && currentPreviewFrame) {
      const timer = setTimeout(() => {
        renderSinglePreview(previewIndex);
      }, 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    open,
    previewIndex,
    selectedEffectId,
    currentEffectOptions,
    renderSinglePreview,
    currentPreviewFrame,
  ]);

  // Background Pre-render all frames for smooth 60fps animation playback
  const handlePreRenderAllFrames = useCallback(async () => {
    if (frames.length === 0 || isPreRenderingAll) return;
    setIsPreRenderingAll(true);
    setPreRenderProgress(0);

    const newCache: Record<number, string> = { ...frameCache };
    for (let i = 0; i < frames.length; i += 1) {
      if (!newCache[i]) {
        try {
          const res = await selectedEffect.apply(
            frames[i].dataUrl,
            currentEffectOptions,
            i,
            frames.length
          );
          newCache[i] = res;
        } catch {
          newCache[i] = frames[i].dataUrl;
        }
      }
      setPreRenderProgress(Math.round(((i + 1) / frames.length) * 100));
    }
    setFrameCache(newCache);
    setIsPreRenderingAll(false);
  }, [frames, isPreRenderingAll, frameCache, selectedEffect, currentEffectOptions]);

  // Animation Playback Interval
  useEffect(() => {
    if (!isPlayingAnimation || frames.length <= 1) return undefined;

    const currentFrameDelay = currentPreviewFrame?.delay || 100;
    const intervalMs = Math.max(30, Math.round(currentFrameDelay / speedMultiplier));

    const interval = setInterval(() => {
      setPreviewIndex((prev) => {
        const nextIdx = (prev + 1) % frames.length;
        if (frameCache[nextIdx]) {
          setPreviewResultUrl(frameCache[nextIdx]);
        }
        return nextIdx;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlayingAnimation, frames.length, currentPreviewFrame?.delay, speedMultiplier, frameCache]);

  // Pointer drag event handlers for Split Handles on Canvas
  const handlePointerDown = (type: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'start') {
      isDraggingStartRef.current = true;
    } else {
      isDraggingEndRef.current = true;
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingStartRef.current && !isDraggingEndRef.current) return;
      const rect = splitContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let pct = 50;
      if (splitOrientation === 'horizontal') {
        const x = e.clientX - rect.left;
        pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      } else {
        const y = e.clientY - rect.top;
        pct = Math.max(0, Math.min(100, (y / rect.height) * 100));
      }

      if (isDraggingStartRef.current) {
        setSplitStart(Math.min(pct, splitEnd - 2));
      } else if (isDraggingEndRef.current) {
        setSplitEnd(Math.max(pct, splitStart + 2));
      }
    },
    [splitOrientation, splitStart, splitEnd]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingStartRef.current = false;
    isDraggingEndRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  // Filtered effect list
  const filteredEffects = GIF_BATCH_EFFECTS_REGISTRY.filter((eff) => {
    const matchesCategory = selectedCategory === 'all' || eff.category === selectedCategory;
    const matchesSearch =
      eff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eff.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eff.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Full Batch Execution (Result GIF or Split Compare GIF)
  const handleExecuteBatch = async (exportType: BatchExportType = 'result') => {
    if (frames.length === 0) {
      toast.error('변환할 프레임이 없습니다.');
      return;
    }

    setIsBatchProcessing(true);
    setBatchExportType(exportType);
    setIsPlayingAnimation(false);
    setProgressPercent(0);
    setProgressText(
      exportType === 'compare'
        ? `1 / ${frames.length} 프레임 비교 상태(Split) 합성 중...`
        : `1 / ${frames.length} 프레임 '${selectedEffect.name}' 효과 적용 중...`
    );

    try {
      const transformedFrames: Array<{ src: string; duration: number }> = [];

      for (let i = 0; i < frames.length; i += 1) {
        const frame = frames[i];
        setProgressText(
          exportType === 'compare'
            ? `${i + 1} / ${frames.length} 프레임 비교 화면 합성 중...`
            : `${i + 1} / ${frames.length} 프레임 '${selectedEffect.name}' 적용 중...`
        );

        // 1. Get or compute transformed dataUrl
        let transformedDataUrl = frameCache[i];
        if (!transformedDataUrl) {
          transformedDataUrl = await selectedEffect.apply(
            frame.dataUrl,
            currentEffectOptions,
            i,
            frames.length
          );
          setFrameCache((prev) => ({ ...prev, [i]: transformedDataUrl }));
        }

        // 2. If compare export, composite with split slider state (ZERO lines in GIF)
        let finalFrameSrc = transformedDataUrl;
        if (exportType === 'compare') {
          finalFrameSrc = await renderSplitCompareFrame(
            frame.dataUrl,
            transformedDataUrl,
            splitOrientation,
            splitMode,
            splitStart,
            splitEnd
          );
        }

        // 3. Adjust frame duration by speed multiplier
        const baseDurationSec = (frame.delay || 100) / 1000;
        const adjustedDurationSec = Math.max(0.02, baseDurationSec / speedMultiplier);

        transformedFrames.push({
          src: finalFrameSrc,
          duration: adjustedDurationSec,
        });

        const percent = Math.round(((i + 1) / frames.length) * 45);
        setProgressPercent(percent);
      }

      setProgressText('GIF 렌더링 및 팔레트 인코딩 중...');

      const firstFrameImg = await loadImage(transformedFrames[0].src);
      const targetWidth = firstFrameImg.naturalWidth || firstFrameImg.width || 400;
      const targetHeight = firstFrameImg.naturalHeight || firstFrameImg.height || 400;

      const gifResultUrl = await createGifFromImages({
        images: transformedFrames,
        width: targetWidth,
        height: targetHeight,
        loopMode,
        sampleInterval: qualitySampleInterval,
        progressCallback: (encProgress: number) => {
          const totalProgress = 45 + Math.round((encProgress / 100) * 55);
          setProgressPercent(Math.min(99, totalProgress));
        },
      });

      setProgressPercent(100);
      setProgressText('GIF 생성 완료!');

      if (exportType === 'compare') {
        setGeneratedCompareGifUrl(gifResultUrl);
        toast.success(`비교 슬라이더 상태로 ${frames.length}개 프레임 GIF가 생성되었습니다!`);
      } else {
        setGeneratedGifUrl(gifResultUrl);
        toast.success(`${frames.length}개 프레임에 효과가 적용되어 새 GIF가 생성되었습니다!`);
      }

      if (onApplySuccess && exportType === 'result') {
        onApplySuccess(gifResultUrl);
      }
    } catch {
      toast.error('일괄 처리 중 오류가 발생했습니다.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleDownloadNewGif = (exportType: BatchExportType = 'result') => {
    const targetUrl = exportType === 'compare' ? generatedCompareGifUrl : generatedGifUrl;
    if (!targetUrl) return;
    const filename =
      exportType === 'compare'
        ? `gif_compare_${selectedEffect.id}_${Date.now()}.gif`
        : `gif_batch_${selectedEffect.id}_${Date.now()}.gif`;
    downloadDataUrl(targetUrl, filename);
    toast.success('GIF 파일이 다운로드되었습니다.');
  };

  // Download single currently previewed frame (PNG, ZERO lines in output)
  const handleDownloadCurrentFrame = async () => {
    if (!currentPreviewFrame) return;
    try {
      let exportSrc = previewResultUrl || currentPreviewFrame.dataUrl;
      if (previewViewMode === 'split') {
        exportSrc = await renderSplitCompareFrame(
          currentPreviewFrame.dataUrl,
          previewResultUrl || currentPreviewFrame.dataUrl,
          splitOrientation,
          splitMode,
          splitStart,
          splitEnd
        );
      }
      downloadDataUrl(exportSrc, `frame_${previewIndex + 1}_${selectedEffect.id}.png`);
      toast.success(`프레임 #${previewIndex + 1} 이미지가 다운로드되었습니다.`);
    } catch {
      toast.error('프레임 다운로드에 실패했습니다.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isBatchProcessing ? undefined : onClose}
      maxWidth={false}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '99vw', sm: '98vw', md: '96vw', lg: '96vw', xl: '1540px' },
          maxWidth: '1600px',
          height: { xs: '98vh', md: '94vh' },
          maxHeight: '96vh',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          m: { xs: 0.5, sm: 1 },
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: 1.5,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            🎨
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                GIF 프레임 일괄 효과 적용 & 스튜디오
              </Typography>
              <Chip
                label={`${frames.length}개 프레임`}
                color="primary"
                size="small"
                sx={{ fontWeight: 700, height: 22 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              앱인토스, 화풍 변환, 픽셀/글리치, 자르기 등 20+가지 필터를 적용하고 실시간 재생 및
              비교 상태 GIF로 제작합니다.
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} disabled={isBatchProcessing}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Body (3-Column Layout: Left Effect Picker / Center Preview & Player / Right Options) */}
      <DialogContent
        sx={{
          p: 0,
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* Left Column: Effect List & Category Tabs (FIXED LAYOUT & SCROLL)  */}
        {/* ----------------------------------------------------------------- */}
        <Box
          sx={{
            width: { xs: '100%', md: '310px', lg: '330px' },
            minWidth: { md: '310px', lg: '330px' },
            maxWidth: { md: '310px', lg: '330px' },
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            bgcolor: 'background.neutral',
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Category Tabs */}
          <Box
            sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1, pt: 1, flexShrink: 0 }}
          >
            <Tabs
              value={selectedCategory}
              onChange={(_, v) => setSelectedCategory(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 42,
                '& .MuiTab-root': {
                  minHeight: 42,
                  py: 0.5,
                  px: 1.2,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  minWidth: 'auto',
                },
              }}
            >
              <Tab label="전체" value="all" />
              <Tab label="앱인토스" value="appsInToss" />
              <Tab label="사진 필터" value="photoFilter" />
              <Tab label="편집 스튜디오" value="photoStudio" />
            </Tabs>
          </Box>

          {/* Search Box */}
          <Box sx={{ p: 1.5, pb: 1, flexShrink: 0 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="효과 검색 (예: 픽셀, 수채화, 하트...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchRoundedIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} />
                ),
              }}
            />
          </Box>

          {/* Effects Cards List (Internal Scrollable with flexShrink: 0 items) */}
          <Box
            sx={{
              flex: '1 1 0px',
              minHeight: 0,
              overflowY: 'auto',
              p: 1.5,
              pt: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
            }}
          >
            {filteredEffects.map((eff) => {
              const isSelected = selectedEffectId === eff.id;
              return (
                <Card
                  key={eff.id}
                  onClick={() => setSelectedEffectId(eff.id)}
                  variant="outlined"
                  sx={{
                    flexShrink: 0,
                    minHeight: 68,
                    p: 1.25,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                    transition: 'all 0.15s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.75,
                      bgcolor: isSelected ? 'primary.main' : 'action.hover',
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    {eff.icon}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.25 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, fontSize: '0.84rem' }}
                        noWrap
                      >
                        {eff.name}
                      </Typography>
                      {eff.badge && (
                        <Chip
                          label={eff.badge}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            bgcolor: isSelected ? 'primary.main' : 'divider',
                            color: isSelected ? '#fff' : 'text.secondary',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.25,
                        fontSize: '0.72rem',
                      }}
                    >
                      {eff.description}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* ----------------------------------------------------------------- */}
        {/* Center Column: Live Preview & Photo Compare Slider & Video Player */}
        {/* ----------------------------------------------------------------- */}
        <Box
          sx={{
            flex: '1 1 0px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1.5, sm: 2 },
            bgcolor: '#0a0f1d',
            minHeight: 0,
            gap: 1.5,
          }}
        >
          {/* Top View Mode & Compare Direction Toolbar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* View Mode Toggle: Split Compare vs Single Result vs Original */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={previewViewMode}
                exclusive
                onChange={(_, v) => v && setPreviewViewMode(v)}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.7)',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    gap: 0.6,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="split">
                  <CompareArrowsRoundedIcon sx={{ fontSize: 16 }} />
                  비교 슬라이더
                </ToggleButton>
                <ToggleButton value="single">
                  <ViewStreamRoundedIcon sx={{ fontSize: 16 }} />
                  결과물 보기
                </ToggleButton>
                <ToggleButton value="original">
                  <LayersRoundedIcon sx={{ fontSize: 16 }} />
                  원본 보기
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Split Orientation & Mode Controls */}
              {previewViewMode === 'split' && (
                <>
                  <ToggleButtonGroup
                    value={splitOrientation}
                    exclusive
                    onChange={(_, v) => v && setSplitOrientation(v)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      '& .MuiToggleButton-root': {
                        color: 'rgba(255,255,255,0.7)',
                        px: 1.2,
                        py: 0.5,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        gap: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.dark',
                          color: '#fff',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="horizontal">
                      <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
                      좌우
                    </ToggleButton>
                    <ToggleButton value="vertical">
                      <SwapVertRoundedIcon sx={{ fontSize: 16 }} />
                      상하
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    value={splitMode}
                    exclusive
                    onChange={(_, v) => v && setSplitMode(v)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      '& .MuiToggleButton-root': {
                        color: 'rgba(255,255,255,0.7)',
                        px: 1.2,
                        py: 0.5,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        gap: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'secondary.dark',
                          color: '#fff',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="inside">
                      {splitOrientation === 'horizontal' ? '→ [중앙 적용] ←' : '↓ [중앙 적용] ↑'}
                    </ToggleButton>
                    <ToggleButton value="outside">
                      {splitOrientation === 'horizontal' ? '← [양끝 적용] →' : '↑ [상하 적용] ↓'}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </>
              )}
            </Box>

            {/* Quick Actions & Caching Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPreRenderingAll ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CircularProgress size={14} sx={{ color: 'primary.light' }} />
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}
                  >
                    전체 렌더링 {preRenderProgress}%
                  </Typography>
                </Box>
              ) : Object.keys(frameCache).length < frames.length ? (
                <Tooltip title="모든 프레임에 효과를 미리 연산하여 끊김 없이 매끄럽게 애니메이션을 재생합니다.">
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={handlePreRenderAllFrames}
                    sx={{
                      fontSize: '0.72rem',
                      py: 0.4,
                      px: 1.2,
                      color: 'primary.light',
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    전체 프레임 미리 계산 ({Object.keys(frameCache).length}/{frames.length})
                  </Button>
                </Tooltip>
              ) : (
                <Chip
                  label={`✨ ${frames.length}개 프레임 연산 완료`}
                  size="small"
                  color="success"
                  sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700 }}
                />
              )}

              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DownloadRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={handleDownloadCurrentFrame}
                sx={{
                  fontSize: '0.72rem',
                  py: 0.4,
                  px: 1.2,
                  color: 'rgba(255,255,255,0.85)',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                현재 프레임 저장 (PNG)
              </Button>
            </Box>
          </Box>

          {/* Main Visual Viewport Area with Interactive Split Handles */}
          <Box
            ref={splitContainerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              position: 'relative',
              borderRadius: 2.5,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#050811',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              userSelect: 'none',
              touchAction: 'none',
              background:
                'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px',
            }}
          >
            {/* Layer 1: Transformed Effect Preview or Original Base */}
            {previewViewMode === 'original' ? (
              currentPreviewFrame && (
                <img
                  src={currentPreviewFrame.dataUrl}
                  alt="Original Frame"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              )
            ) : previewResultUrl ? (
              <img
                src={previewResultUrl}
                alt="Effect Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <CircularProgress size={36} />
            )}

            {/* Layer 2: Split Compare Overlay (Original Frame with Dual / Single clipPath) */}
            {previewViewMode === 'split' && currentPreviewFrame && previewResultUrl && (
              <>
                {splitOrientation === 'horizontal' ? (
                  splitMode === 'inside' ? (
                    <>
                      {/* Left Original [0% to splitStart%] */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                          clipPath: `polygon(0 0, ${splitStart}% 0, ${splitStart}% 100%, 0 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <img
                          src={currentPreviewFrame.dataUrl}
                          alt="Original Left"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </Box>

                      {/* Right Original [splitEnd% to 100%] */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                          clipPath: `polygon(${splitEnd}% 0, 100% 0, 100% 100%, ${splitEnd}% 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <img
                          src={currentPreviewFrame.dataUrl}
                          alt="Original Right"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    /* Center Original [splitStart% to splitEnd%] */
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        clipPath: `polygon(${splitStart}% 0, ${splitEnd}% 0, ${splitEnd}% 100%, ${splitStart}% 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <img
                        src={currentPreviewFrame.dataUrl}
                        alt="Original Center"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                  )
                ) : splitMode === 'inside' ? (
                  <>
                    {/* Top Original [0% to splitStart%] */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        clipPath: `polygon(0 0, 100% 0, 100% ${splitStart}%, 0 ${splitStart}%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <img
                        src={currentPreviewFrame.dataUrl}
                        alt="Original Top"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {/* Bottom Original [splitEnd% to 100%] */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        clipPath: `polygon(0 ${splitEnd}%, 100% ${splitEnd}%, 100% 100%, 0 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <img
                        src={currentPreviewFrame.dataUrl}
                        alt="Original Bottom"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  /* Middle Original [splitStart% to splitEnd%] */
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      clipPath: `polygon(0 ${splitStart}%, 100% ${splitStart}%, 100% ${splitEnd}%, 0 ${splitEnd}%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <img
                      src={currentPreviewFrame.dataUrl}
                      alt="Original Middle"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                )}

                {/* Layer 3: Interactive Handle 1 (Start Handle) */}
                <Box
                  onPointerDown={handlePointerDown('start')}
                  sx={
                    splitOrientation === 'horizontal'
                      ? {
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${splitStart}%`,
                          width: 4,
                          bgcolor: '#3b82f6',
                          boxShadow: '0 0 10px rgba(59,130,246,0.8)',
                          cursor: 'ew-resize',
                          zIndex: 10,
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                      : {
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${splitStart}%`,
                          height: 4,
                          bgcolor: '#3b82f6',
                          boxShadow: '0 0 10px rgba(59,130,246,0.8)',
                          cursor: 'ns-resize',
                          zIndex: 10,
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                  }
                >
                  <Box
                    sx={{
                      width: splitOrientation === 'horizontal' ? 32 : 44,
                      height: splitOrientation === 'horizontal' ? 44 : 32,
                      borderRadius: 1.5,
                      bgcolor: '#1d4ed8',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      border: '2px solid #ffffff',
                      userSelect: 'none',
                    }}
                  >
                    {splitOrientation === 'horizontal' ? (
                      <SwapHorizRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <SwapVertRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>
                </Box>

                {/* Layer 4: Interactive Handle 2 (End Handle) */}
                <Box
                  onPointerDown={handlePointerDown('end')}
                  sx={
                    splitOrientation === 'horizontal'
                      ? {
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${splitEnd}%`,
                          width: 4,
                          bgcolor: '#6366f1',
                          boxShadow: '0 0 10px rgba(99,102,241,0.8)',
                          cursor: 'ew-resize',
                          zIndex: 10,
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                      : {
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${splitEnd}%`,
                          height: 4,
                          bgcolor: '#6366f1',
                          boxShadow: '0 0 10px rgba(99,102,241,0.8)',
                          cursor: 'ns-resize',
                          zIndex: 10,
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                  }
                >
                  <Box
                    sx={{
                      width: splitOrientation === 'horizontal' ? 32 : 44,
                      height: splitOrientation === 'horizontal' ? 44 : 32,
                      borderRadius: 1.5,
                      bgcolor: '#4338ca',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      border: '2px solid #ffffff',
                      userSelect: 'none',
                    }}
                  >
                    {splitOrientation === 'horizontal' ? (
                      <SwapHorizRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <SwapVertRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>
                </Box>
              </>
            )}

            {/* Computing Indicator */}
            {isPreviewLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(6px)',
                  px: 1.4,
                  py: 0.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  zIndex: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>
                  프레임 렌더링 중...
                </Typography>
              </Box>
            )}
          </Box>

          {/* --------------------------------------------------------------- */}
          {/* Bottom Animation Playback Controls & Frame Carousel (REQ 3)     */}
          {/* --------------------------------------------------------------- */}
          <Box
            sx={{
              p: 1.25,
              px: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* Player Controls Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {/* Play / Pause / Step Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={isPlayingAnimation ? 'warning' : 'primary'}
                  onClick={() => setIsPlayingAnimation((prev) => !prev)}
                  startIcon={
                    isPlayingAnimation ? (
                      <ReplayRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    px: 1.8,
                    py: 0.5,
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    borderRadius: 1.75,
                  }}
                >
                  {isPlayingAnimation ? '일시정지' : '▶ 애니메이션 재생'}
                </Button>

                <IconButton
                  size="small"
                  disabled={isPlayingAnimation}
                  onClick={() => {
                    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : frames.length - 1));
                  }}
                  sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)' }}
                >
                  <SkipPreviousRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={isPlayingAnimation}
                  onClick={() => {
                    setPreviewIndex((prev) => (prev + 1) % frames.length);
                  }}
                  sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)' }}
                >
                  <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Frame Counter & Delay Indicator */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    px: 1,
                    py: 0.3,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderRadius: 1,
                  }}
                >
                  프레임 {previewIndex + 1} / {frames.length} ({currentPreviewFrame?.delay || 100}
                  ms)
                </Typography>
              </Box>

              {/* Scrubber Timeline Slider */}
              <Box
                sx={{
                  flex: '1 1 180px',
                  maxWidth: 360,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
                >
                  1
                </Typography>
                <Slider
                  size="small"
                  min={0}
                  max={Math.max(0, frames.length - 1)}
                  step={1}
                  value={previewIndex}
                  onChange={(_, v) => {
                    setIsPlayingAnimation(false);
                    setPreviewIndex(v as number);
                  }}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': { width: 14, height: 14 },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
                >
                  {frames.length}
                </Typography>
              </Box>
            </Box>

            {/* Frame Thumbnail Strip */}
            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                overflowX: 'auto',
                pb: 0.25,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
              }}
            >
              {frames.map((f, idx) => {
                const isSelected = previewIndex === idx;
                const cachedUrl = frameCache[idx];
                return (
                  <Box
                    key={f.id}
                    onClick={() => {
                      setIsPlayingAnimation(false);
                      setPreviewIndex(idx);
                    }}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.15)',
                      bgcolor: '#1e293b',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 10px rgba(32, 101, 209, 0.7)' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <img
                      src={cachedUrl || f.dataUrl}
                      alt={`Frame ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: isSelected ? 'primary.main' : 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: '0.58rem',
                        textAlign: 'center',
                        fontWeight: 800,
                        lineHeight: 1.3,
                      }}
                    >
                      #{idx + 1}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* ----------------------------------------------------------------- */}
        {/* Right Column: Effect Controls & GIF Encoding Settings             */}
        {/* ----------------------------------------------------------------- */}
        <Box
          sx={{
            width: { xs: '100%', md: '340px', lg: '360px' },
            minWidth: { md: '340px', lg: '360px' },
            maxWidth: { md: '340px', lg: '360px' },
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            minHeight: 0,
            overflowY: 'auto',
            p: 2,
            gap: 2,
            bgcolor: 'background.paper',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
          }}
        >
          {/* 1. Selected Effect Specific Controls */}
          <Card sx={{ p: 2, borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography sx={{ fontSize: '1.2rem' }}>{selectedEffect.icon}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {selectedEffect.name} 상세 설정
              </Typography>
            </Box>

            {selectedEffect.renderSettings ? (
              selectedEffect.renderSettings({
                options: currentEffectOptions,
                onChange: handleUpdateOptions,
                previewFrameUrl: currentPreviewFrame?.dataUrl,
              })
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                기본 파라미터로 최적화되어 자동 적용됩니다.
              </Typography>
            )}
          </Card>

          {/* 2. Split Compare Range Sliders */}
          <Card sx={{ p: 2, borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CompareArrowsRoundedIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                비교 슬라이더 범위 조절
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    시작 위치 (Start)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {Math.round(splitStart)}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={splitStart}
                  onChange={(_, v) => setSplitStart(Math.min(v as number, splitEnd - 2))}
                  sx={{ color: '#3b82f6' }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    끝 위치 (End)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6366f1' }}>
                    {Math.round(splitEnd)}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={splitEnd}
                  onChange={(_, v) => setSplitEnd(Math.max(v as number, splitStart + 2))}
                  sx={{ color: '#6366f1' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSplitStart(25);
                    setSplitEnd(75);
                  }}
                  sx={{ flex: 1, fontSize: '0.72rem', py: 0.4 }}
                >
                  중앙 25%~75%
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSplitStart(0);
                    setSplitEnd(50);
                  }}
                  sx={{ flex: 1, fontSize: '0.72rem', py: 0.4 }}
                >
                  좌/우 50% 분할
                </Button>
              </Box>
            </Box>
          </Card>

          {/* 3. Output GIF Controls */}
          <Card sx={{ p: 2, borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <TuneRoundedIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                새 GIF 애니메이션 속성
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Playback Speed Multiplier */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    재생 속도 (배속)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {speedMultiplier}x 배속
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0.25}
                  max={3.0}
                  step={0.25}
                  value={speedMultiplier}
                  onChange={(_, v) => setSpeedMultiplier(v as number)}
                />
              </Box>

              {/* Loop Mode */}
              <FormControl fullWidth size="small">
                <InputLabel>재생 방향</InputLabel>
                <Select
                  value={loopMode}
                  label="재생 방향"
                  onChange={(e) =>
                    setLoopMode(e.target.value as 'normal' | 'reverse' | 'boomerang')
                  }
                >
                  <MenuItem value="normal">정방향 루프 (Normal)</MenuItem>
                  <MenuItem value="reverse">역재생 루프 (Reverse)</MenuItem>
                  <MenuItem value="boomerang">부메랑 왕복 (Boomerang)</MenuItem>
                </Select>
              </FormControl>

              {/* Quality Sample Interval */}
              <FormControl fullWidth size="small">
                <InputLabel>인코딩 품질</InputLabel>
                <Select
                  value={qualitySampleInterval}
                  label="인코딩 품질"
                  onChange={(e) => setQualitySampleInterval(Number(e.target.value))}
                >
                  <MenuItem value={5}>최고 화질 (정밀 샘플링)</MenuItem>
                  <MenuItem value={10}>표준 권장 (고속 렌더링)</MenuItem>
                  <MenuItem value={15}>초고속 (용량 최소화)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Card>
        </Box>
      </DialogContent>

      {/* Dialog Footer Actions & Progress (Dual Result and Clean Split Compare GIF Exports) */}
      <Box
        sx={{
          p: 1.5,
          px: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          flexShrink: 0,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Progress info or completed result info */}
        <Box sx={{ flex: 1, minWidth: 260 }}>
          {isBatchProcessing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {progressText}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ) : generatedGifUrl || generatedCompareGifUrl ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label="🎉 GIF 생성 완료!"
                color="success"
                size="small"
                sx={{ fontWeight: 800 }}
              />
              {generatedGifUrl && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  결과물: {formatBytes(getDataUrlByteSize(generatedGifUrl))}
                </Typography>
              )}
              {generatedCompareGifUrl && (
                <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  비교 상태 GIF: {formatBytes(getDataUrlByteSize(generatedCompareGifUrl))}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              선택한 {frames.length}개 프레임에 &apos;{selectedEffect.name}&apos; 효과를 적용합니다.
            </Typography>
          )}
        </Box>

        {/* Right: Action Buttons for Results & Split Compare Export */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isBatchProcessing}
            sx={{ fontWeight: 600 }}
          >
            닫기
          </Button>

          {/* Option A: Compare GIF Button */}
          {generatedCompareGifUrl ? (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleDownloadNewGif('compare')}
              startIcon={<DownloadRoundedIcon />}
              sx={{ fontWeight: 700 }}
            >
              🎭 비교 GIF 다운로드
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleExecuteBatch('compare')}
              disabled={isBatchProcessing || frames.length === 0}
              startIcon={
                isBatchProcessing && batchExportType === 'compare' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CompareArrowsRoundedIcon />
                )
              }
              sx={{ fontWeight: 700 }}
            >
              {isBatchProcessing && batchExportType === 'compare'
                ? '비교 GIF 생성 중...'
                : '🎭 비교 상태로 GIF 생성'}
            </Button>
          )}

          {/* Option B: Full Transformed Result GIF Button */}
          {generatedGifUrl ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleDownloadNewGif('result')}
              startIcon={<DownloadRoundedIcon />}
              sx={{ fontWeight: 800 }}
            >
              ✨ 결과물 GIF 다운로드
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleExecuteBatch('result')}
              disabled={isBatchProcessing || frames.length === 0}
              startIcon={
                isBatchProcessing && batchExportType === 'result' ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <MovieCreationRoundedIcon />
                )
              }
              sx={{ fontWeight: 800, px: 2.2 }}
            >
              {isBatchProcessing && batchExportType === 'result'
                ? '일괄 변환 중...'
                : '✨ 결과물 GIF 생성'}
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
