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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

type FilterType = 'pencil' | 'kuwahara' | 'comic' | 'watercolor' | 'cyberpunk';

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
  const [comparePos, setComparePos] = useState<number>(50);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
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

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        resultDataUrl,
        `art_style_${activeFilter}_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
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
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          명화 & 스케치 필터 (Art Style Filters)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          연필 스케치, 쿠와하라 유화, 코믹 팝아트, 수채화, 사이버펑크 네온 효과를 실시간으로
          적용합니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <Card
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            minHeight: 320,
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <AutoFixHighRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            스타일을 적용할 이미지 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            PNG, JPG, WEBP 이미지를 클릭하거나 올려주세요
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            이미지 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Split Before/After Preview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 320, sm: 460 },
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  userSelect: 'none',
                }}
              >
                {/* Processed Image */}
                {resultDataUrl && (
                  <img
                    src={resultDataUrl}
                    alt="Processed"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}

                {/* Original Image (Clipped) */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    width: `${comparePos}%`,
                    borderRight: '2px solid #ffffff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.5)',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Original"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      maxWidth: 'none',
                    }}
                  />
                </Box>

                {/* Split Slider Handle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: `${comparePos}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                    fontSize: 12,
                    fontWeight: 800,
                    pointerEvents: 'none',
                  }}
                >
                  ↔
                </Box>
              </Box>

              {/* Slider Controller */}
              <Box sx={{ mt: 2, px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    원본 (Left)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Before / After 비교 ({comparePos}%)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    필터 적용 (Right)
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={comparePos}
                  onChange={(_, v) => setComparePos(v as number)}
                />
              </Box>
            </Card>
          </Box>

          {/* Right: Filter Options & Sliders */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setResultDataUrl('');
                }}
                startIcon={<RefreshRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
              >
                다른 사진
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ flex: 1.5, py: 1.2, borderRadius: 2 }}
              >
                작품 저장
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<ShareRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
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
