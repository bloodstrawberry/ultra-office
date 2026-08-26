'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';
import {
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitMode,
  type SplitOrientation,
  type ComparePreviewMode,
  type SampleImageItem,
} from '../components';

type FilterType = 'pencil' | 'kuwahara' | 'comic' | 'watercolor' | 'cyberpunk';

const ART_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-scenery',
    label: '도시 풍경 (사이버펑크/유화)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    subLabel: '풍경 & 건축물',
  },
  {
    id: 'sample-portrait',
    label: '인물 초상 (스케치/팝아트)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 헤어',
  },
  {
    id: 'sample-nature',
    label: '자연 & 꽃 (수채화)',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80',
    subLabel: '정물 & 자연',
  },
];

interface FilterOption {
  id: FilterType;
  name: string;
  desc: string;
  icon: string;
}

const FILTERS: FilterOption[] = [
  { id: 'pencil', name: '연필 스케치', desc: '흑백 소묘 & 디테일 연필 드로잉', icon: '✏️' },
  { id: 'kuwahara', name: '유화 (Kuwahara)', desc: '붓터치가 살아있는 클래식 유화', icon: '🎨' },
  { id: 'comic', name: '코믹 팝아트', desc: '선명한 외곽선 & 팝아트 카툰', icon: '💥' },
  { id: 'watercolor', name: '수채화', desc: '부드러운 색 번짐 & 수채화 텍스처', icon: '🖌️' },
  {
    id: 'cyberpunk',
    name: '사이버펑크 네온',
    desc: '고대비 네온 글로우 & 사이버 미래',
    icon: '⚡',
  },
];

export function ArtStyleView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('pencil');
  const [intensity, setIntensity] = useState<number>(80);
  const [brushSize, setBrushSize] = useState<number>(4);

  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(360);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(360);

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

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setResultDataUrl('');
    };
    reader.readAsDataURL(file);
  }, []);

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

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      if (activeFilter === 'pencil') {
        const gray = new Float32Array(w * h);
        for (let i = 0; i < data.length; i += 4) {
          gray[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        }

        const invert = new Float32Array(w * h);
        for (let i = 0; i < gray.length; i += 1) {
          invert[i] = 255 - gray[i];
        }

        const r = Math.max(1, Math.round((brushSize * 2 * intensity) / 100));
        const blurred = new Float32Array(w * h);
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            let sum = 0;
            let count = 0;
            for (let dy = -r; dy <= r; dy += 1) {
              const ny = y + dy;
              if (ny >= 0 && ny < h) {
                for (let dx = -r; dx <= r; dx += 1) {
                  const nx = x + dx;
                  if (nx >= 0 && nx < w) {
                    sum += invert[ny * w + nx];
                    count += 1;
                  }
                }
              }
            }
            blurred[y * w + x] = sum / count;
          }
        }

        for (let i = 0; i < gray.length; i += 1) {
          const g = gray[i];
          const b = blurred[i];
          let color = 255;
          if (b < 255) {
            color = Math.min(255, (g * 256) / (255 - b + 1));
          }
          const finalVal = Math.round((color * intensity) / 100 + (g * (100 - intensity)) / 100);
          data[i * 4] = finalVal;
          data[i * 4 + 1] = finalVal;
          data[i * 4 + 2] = finalVal;
        }
      } else if (activeFilter === 'kuwahara') {
        const radius = Math.max(1, brushSize);
        const copy = new Uint8ClampedArray(data);

        for (let y = radius; y < h - radius; y += 1) {
          for (let x = radius; x < w - radius; x += 1) {
            const sectors = [
              { x1: x - radius, x2: x, y1: y - radius, y2: y },
              { x1: x, x2: x + radius, y1: y - radius, y2: y },
              { x1: x - radius, x2: x, y1: y, y2: y + radius },
              { x1: x, x2: x + radius, y1: y, y2: y + radius },
            ];

            let minVar = Infinity;
            let bestAvg = [0, 0, 0];

            for (let s = 0; s < 4; s += 1) {
              const sec = sectors[s];
              let sumR = 0;
              let sumG = 0;
              let sumB = 0;
              let sumSqR = 0;
              let sumSqG = 0;
              let sumSqB = 0;
              let count = 0;

              for (let sy = sec.y1; sy <= sec.y2; sy += 1) {
                for (let sx = sec.x1; sx <= sec.x2; sx += 1) {
                  const idx = (sy * w + sx) * 4;
                  const cr = copy[idx];
                  const cg = copy[idx + 1];
                  const cb = copy[idx + 2];
                  sumR += cr;
                  sumG += cg;
                  sumB += cb;
                  sumSqR += cr * cr;
                  sumSqG += cg * cg;
                  sumSqB += cb * cb;
                  count += 1;
                }
              }

              const meanR = sumR / count;
              const meanG = sumG / count;
              const meanB = sumB / count;
              const variance =
                sumSqR / count -
                meanR * meanR +
                (sumSqG / count - meanG * meanG) +
                (sumSqB / count - meanB * meanB);

              if (variance < minVar) {
                minVar = variance;
                bestAvg = [meanR, meanG, meanB];
              }
            }

            const pIdx = (y * w + x) * 4;
            const blend = intensity / 100;
            data[pIdx] = Math.round(bestAvg[0] * blend + copy[pIdx] * (1 - blend));
            data[pIdx + 1] = Math.round(bestAvg[1] * blend + copy[pIdx + 1] * (1 - blend));
            data[pIdx + 2] = Math.round(bestAvg[2] * blend + copy[pIdx + 2] * (1 - blend));
          }
        }
      } else if (activeFilter === 'comic') {
        const copy = new Uint8ClampedArray(data);
        const threshold = 35;

        for (let y = 1; y < h - 1; y += 1) {
          for (let x = 1; x < w - 1; x += 1) {
            const idx = (y * w + x) * 4;
            const rightIdx = (y * w + (x + 1)) * 4;
            const downIdx = ((y + 1) * w + x) * 4;

            const diffR =
              Math.abs(copy[idx] - copy[rightIdx]) + Math.abs(copy[idx] - copy[downIdx]);
            const diffG =
              Math.abs(copy[idx + 1] - copy[rightIdx + 1]) +
              Math.abs(copy[idx + 1] - copy[downIdx + 1]);
            const diffB =
              Math.abs(copy[idx + 2] - copy[rightIdx + 2]) +
              Math.abs(copy[idx + 2] - copy[downIdx + 2]);
            const isEdge = diffR + diffG + diffB > threshold * 3;

            const levels = 5;
            const quant = (v: number) =>
              Math.round(Math.round((v / 255) * levels) * (255 / levels));

            if (isEdge) {
              data[idx] = 20;
              data[idx + 1] = 20;
              data[idx + 2] = 20;
            } else {
              data[idx] = quant(copy[idx]);
              data[idx + 1] = quant(copy[idx + 1]);
              data[idx + 2] = quant(copy[idx + 2]);
            }
          }
        }
      } else if (activeFilter === 'watercolor') {
        const copy = new Uint8ClampedArray(data);
        const r = Math.max(1, brushSize);

        for (let y = r; y < h - r; y += 1) {
          for (let x = r; x < w - r; x += 1) {
            let sumR = 0;
            let sumG = 0;
            let sumB = 0;
            let count = 0;

            for (let dy = -r; dy <= r; dy += 1) {
              for (let dx = -r; dx <= r; dx += 1) {
                const nIdx = ((y + dy) * w + (x + dx)) * 4;
                sumR += copy[nIdx];
                sumG += copy[nIdx + 1];
                sumB += copy[nIdx + 2];
                count += 1;
              }
            }

            const pIdx = (y * w + x) * 4;
            const meanR = sumR / count;
            const meanG = sumG / count;
            const meanB = sumB / count;

            const boost = 1.15;
            data[pIdx] = Math.min(255, Math.round(meanR * boost));
            data[pIdx + 1] = Math.min(255, Math.round(meanG * boost));
            data[pIdx + 2] = Math.min(255, Math.round(meanB * boost));
          }
        }
      } else if (activeFilter === 'cyberpunk') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const nr = Math.min(255, r * 1.3 + b * 0.2);
          const ng = Math.min(255, g * 0.6 + b * 0.2);
          const nb = Math.min(255, b * 1.5 + r * 0.3);

          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
        }
      }

      ctx.putImageData(imgData, 0, 0);
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
      }, 150);
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
      const res = await downloadDataUrl(
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
      const res = await shareToKakaoTalk(
        resultDataUrl,
        '명화/스케치 변환 사진',
        `art_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          명화 & 스케치 필터 (Art Style Filters)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          연필 스케치, 쿠와하라 유화, 코믹 팝아트, 수채화, 사이버펑크 네온 효과를 실시간으로
          적용합니다.
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
              extraTopActions={
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setImageSrc('');
                    setResultDataUrl('');
                  }}
                  startIcon={<RefreshRoundedIcon />}
                >
                  다른 사진
                </Button>
              }
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
              gap: 2,
              minHeight: 0,
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Filter List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                1. 예술 필터 선택
              </Typography>
              <ToggleButtonGroup
                orientation="vertical"
                value={activeFilter}
                exclusive
                onChange={(_, v) => v && setActiveFilter(v)}
                fullWidth
                sx={{ gap: 1, mb: 2.5 }}
              >
                {FILTERS.map((f) => (
                  <ToggleButton
                    key={f.id}
                    value={f.id}
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: activeFilter === f.id ? 'primary.main' : 'divider',
                      p: 1.2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Typography sx={{ fontSize: '1.4rem' }}>{f.icon}</Typography>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {f.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {f.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    필터 강도 (Intensity)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {intensity}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={10}
                  max={100}
                  value={intensity}
                  onChange={(_, v) => setIntensity(v as number)}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    붓터치 / 브러시 크기
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {brushSize}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={1}
                  max={10}
                  value={brushSize}
                  onChange={(_, v) => setBrushSize(v as number)}
                />
              </Box>
            </Card>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                mt: 'auto',
                pt: 0.5,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setResultDataUrl('');
                }}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>

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
                sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                결과물 저장
              </Button>

              {/* Secondary: Split Slider Comparison State Save */}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSaveSplit}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<CompareArrowsRoundedIcon />}
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
              >
                비교 상태 저장 (Split View)
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<ShareRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
