'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import { PhotoUploadWorkspace, PhotoCompareViewport, type SampleImageItem } from '../components';

const PIXEL_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-portrait',
    label: '인물 프로필 (도트 아바타)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 캐릭터',
  },
  {
    id: 'sample-game',
    label: '게임/오락기 (레트로 도트)',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    subLabel: '레트로 게임',
  },
  {
    id: 'sample-cat',
    label: '고양이 (8비트 펫)',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    subLabel: '반려동물',
  },
];

type PaletteType = 'full' | 'gameboy' | 'nes' | 'cyberpunk' | 'mono' | 'sepia';

interface PaletteOption {
  id: PaletteType;
  name: string;
  desc: string;
  colors: string[];
}

const PALETTES: PaletteOption[] = [
  {
    id: 'full',
    name: '풀 컬러',
    desc: '원본의 모든 색상 보존',
    colors: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B'],
  },
  {
    id: 'gameboy',
    name: '게임보이 (4색)',
    desc: '클래식 4단계 녹색 도트',
    colors: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  },
  {
    id: 'nes',
    name: 'NES 8비트',
    desc: '패미컴 레트로 컬러 팔레트',
    colors: ['#000000', '#FCFCFC', '#F83800', '#00A800', '#0058F8', '#F8B800'],
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크',
    desc: '네온 핑크 & 시안 하이라이트',
    colors: ['#050505', '#FF007F', '#00F0FF', '#7000FF', '#FFE600'],
  },
  {
    id: 'mono',
    name: '1비트 흑백',
    desc: '신문 인쇄 스타일 흑백 도트',
    colors: ['#000000', '#FFFFFF'],
  },
  {
    id: 'sepia',
    name: '세피아 레트로',
    desc: '빈티지 갈색 톤',
    colors: ['#2B1B10', '#5C3A21', '#966E44', '#D4B483', '#F2E8CF'],
  },
];

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}

function findNearestColor(
  r: number,
  g: number,
  b: number,
  paletteRgb: [number, number, number][]
): [number, number, number] {
  let minDistance = Infinity;
  let bestColor: [number, number, number] = paletteRgb[0];

  for (let i = 0; i < paletteRgb.length; i += 1) {
    const [pr, pg, pb] = paletteRgb[i];
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDistance) {
      minDistance = dist;
      bestColor = [pr, pg, pb];
    }
  }

  return bestColor;
}

export function PixelView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [pixelSize, setPixelSize] = useState<number>(10);
  const [palette, setPalette] = useState<PaletteType>('full');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(100);

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

  const renderPixelArt = useCallback(async () => {
    if (!imageSrc) {
      setResultDataUrl('');
      return '';
    }

    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageSrc;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const maxDim = 1200;
    let canvasW = w;
    let canvasH = h;
    if (canvasW > maxDim || canvasH > maxDim) {
      if (canvasW > canvasH) {
        canvasH = Math.round((canvasH * maxDim) / canvasW);
        canvasW = maxDim;
      } else {
        canvasW = Math.round((canvasW * maxDim) / canvasH);
        canvasH = maxDim;
      }
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, canvasW, canvasH);

    const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
    const data = imgData.data;

    const currentPal = PALETTES.find((p) => p.id === palette) || PALETTES[0];
    const paletteRgbs = currentPal.colors.map(hexToRgb);

    const blockSize = Math.max(2, pixelSize);
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let y = 0; y < canvasH; y += blockSize) {
      for (let x = 0; x < canvasW; x += blockSize) {
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        const blockW = Math.min(blockSize, canvasW - x);
        const blockH = Math.min(blockSize, canvasH - y);

        for (let by = 0; by < blockH; by += 1) {
          for (let bx = 0; bx < blockW; bx += 1) {
            const idx = ((y + by) * canvasW + (x + bx)) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count += 1;
          }
        }

        let avgR = totalR / count;
        let avgG = totalG / count;
        let avgB = totalB / count;

        if (contrast !== 100) {
          avgR = Math.min(255, Math.max(0, contrastFactor * (avgR - 128) + 128));
          avgG = Math.min(255, Math.max(0, contrastFactor * (avgG - 128) + 128));
          avgB = Math.min(255, Math.max(0, contrastFactor * (avgB - 128) + 128));
        }

        let finalR = Math.round(avgR);
        let finalG = Math.round(avgG);
        let finalB = Math.round(avgB);

        if (palette !== 'full') {
          [finalR, finalG, finalB] = findNearestColor(finalR, finalG, finalB, paletteRgbs);
        }

        ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
        ctx.fillRect(x, y, blockW, blockH);
      }
    }

    if (showGrid && blockSize >= 4) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= canvasW; x += blockSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvasH);
      }
      for (let y = 0; y <= canvasH; y += blockSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvasW, y + 0.5);
      }
      ctx.stroke();
    }

    return canvas.toDataURL('image/png');
  }, [imageSrc, pixelSize, palette, showGrid, contrast]);

  useEffect(() => {
    let isMounted = true;
    renderPixelArt().then((dataUrl) => {
      if (isMounted && dataUrl) {
        setResultDataUrl(dataUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [renderPixelArt]);

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(resultDataUrl, `pixel_art_${palette}_${Date.now()}.png`);
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
        '픽셀 아트 사진',
        `pixel_${Date.now()}.png`
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
          픽셀 아트 & 레트로 도트 변환기 (Pixel Art Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 게임보이, NES 8비트, 사이버펑크 등 레트로 픽셀 도트 아트로 변환합니다.
        </Typography>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={PIXEL_SAMPLE_IMAGES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={processFile}
          title="픽셀 아트로 만들 이미지 업로드"
          subtitle="PNG, JPG, WEBP 이미지를 드래그하거나 올려주세요."
          icon={<ViewModuleRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Pixel Preview */}
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

          {/* Right: Controls */}
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
              {/* Palette Selector */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                1. 컬러 팔레트 선택
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2.5 }}>
                {PALETTES.map((pal) => (
                  <Button
                    key={pal.id}
                    size="small"
                    variant={palette === pal.id ? 'contained' : 'outlined'}
                    color={palette === pal.id ? 'primary' : 'inherit'}
                    onClick={() => setPalette(pal.id)}
                    sx={{
                      borderRadius: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 1,
                      textTransform: 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.4, mb: 0.5 }}>
                      {pal.colors.slice(0, 5).map((col, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: col,
                            border: '1px solid rgba(255,255,255,0.4)',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                      {pal.name}
                    </Typography>
                  </Button>
                ))}
              </Box>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    도트 크기 (블록 크기)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {pixelSize}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={3}
                  max={30}
                  value={pixelSize}
                  onChange={(_, v) => setPixelSize(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    대비 (Contrast)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {contrast}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={50}
                  max={200}
                  value={contrast}
                  onChange={(_, v) => setContrast(v as number)}
                />
              </Box>

              {/* Grid Toggle */}
              <FormControlLabel
                control={
                  <Switch checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    픽셀 그리드 격자선 표시
                  </Typography>
                }
              />
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
              <Button
                fullWidth
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
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                저장
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
