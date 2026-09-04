'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

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

const DEFAULT_PALETTE_COLORS: Record<PaletteType, string[]> = {
  full: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B'],
  gameboy: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  nes: ['#000000', '#FCFCFC', '#F83800', '#00A800', '#0058F8', '#F8B800'],
  cyberpunk: ['#050505', '#FF007F', '#00F0FF', '#7000FF', '#FFE600'],
  mono: ['#000000', '#FFFFFF'],
  sepia: ['#2B1B10', '#5C3A21', '#966E44', '#D4B483', '#F2E8CF'],
};

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
  const [paletteColors, setPaletteColors] = useState<Record<PaletteType, string[]>>({
    full: [...DEFAULT_PALETTE_COLORS.full],
    gameboy: [...DEFAULT_PALETTE_COLORS.gameboy],
    nes: [...DEFAULT_PALETTE_COLORS.nes],
    cyberpunk: [...DEFAULT_PALETTE_COLORS.cyberpunk],
    mono: [...DEFAULT_PALETTE_COLORS.mono],
    sepia: [...DEFAULT_PALETTE_COLORS.sepia],
  });
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(100);

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

  const handleUpdatePaletteColor = (index: number, newColor: string) => {
    setPaletteColors((prev) => ({
      ...prev,
      [palette]: prev[palette].map((c, i) => (i === index ? newColor : c)),
    }));
  };

  const handleAddPaletteColor = () => {
    if (paletteColors[palette].length >= 16) {
      toast.warning('팔레트 색상은 최대 16개까지 가능합니다.');
      return;
    }
    const currentList = paletteColors[palette];
    const lastColor = currentList[currentList.length - 1] || '#FFFFFF';
    setPaletteColors((prev) => ({
      ...prev,
      [palette]: [...prev[palette], lastColor],
    }));
    toast.success('새 색상이 추가되었습니다.');
  };

  const handleRemovePaletteColor = (index: number) => {
    if (paletteColors[palette].length <= 2) {
      toast.warning('최소 2개 이상의 색상이 필요합니다.');
      return;
    }
    setPaletteColors((prev) => ({
      ...prev,
      [palette]: prev[palette].filter((_, i) => i !== index),
    }));
  };

  const handleResetCurrentPalette = () => {
    const defaultColors = DEFAULT_PALETTE_COLORS[palette];
    if (defaultColors) {
      setPaletteColors((prev) => ({
        ...prev,
        [palette]: [...defaultColors],
      }));
      const palObj = PALETTES.find((p) => p.id === palette);
      toast.success(`'${palObj?.name || palette}' 색상이 기본값으로 복원되었습니다.`);
    }
  };

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

    const currentPalColors = paletteColors[palette] || PALETTES[0].colors;
    const paletteRgbs = currentPalColors.map(hexToRgb);

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
          avgG = Math.min(255, Math.max(0, contrastFactor * (avgR - 128) + 128));
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
  }, [imageSrc, pixelSize, palette, showGrid, contrast, paletteColors]);

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

  const handleSaveResult = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        resultDataUrl,
        `pixel_art_${palette}_result_${Date.now()}.png`
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
      await downloadDataUrl(splitUrl, `pixel_art_${palette}_split_comparison_${Date.now()}.png`);
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
              {/* Palette Selector Header */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                1. 컬러 팔레트 선택
              </Typography>

              {/* 6-Card Palette Grid (Presets) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                {PALETTES.map((pal) => {
                  const isSelected = palette === pal.id;
                  const palColors = paletteColors[pal.id] || pal.colors;
                  return (
                    <Button
                      key={pal.id}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'primary' : 'inherit'}
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
                        {palColors.slice(0, 5).map((col, i) => (
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
                  );
                })}
              </Box>

              {/* Full Color Info Notice */}
              {palette === 'full' && (
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: 'text.secondary', mb: 2, fontSize: '0.72rem' }}
                >
                  💡 풀 컬러 모드는 원본 사진의 모든 색상을 보존하여 픽셀화합니다.
                </Typography>
              )}

              {/* In-Place Palette Color Customization Panel (for retro presets) */}
              {palette !== 'full' && (
                <Box
                  sx={{
                    p: 1.5,
                    mb: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <PaletteRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      {PALETTES.find((p) => p.id === palette)?.name} 색상 직접 변경 (
                      {paletteColors[palette].length}색)
                    </Typography>
                    <Tooltip title="원래 기본 색상으로 되돌리기">
                      <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={handleResetCurrentPalette}
                        startIcon={<RestartAltRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '0.7rem', py: 0.2, px: 0.6, minWidth: 0, fontWeight: 600 }}
                      >
                        기본값 복원
                      </Button>
                    </Tooltip>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      mb: 1.2,
                      fontSize: '0.7rem',
                    }}
                  >
                    아래 색상 칩을 클릭하여 팔레트 색상을 직접 수정할 수 있습니다.
                  </Typography>

                  {/* Color Chips List */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    {paletteColors[palette].map((color, index) => (
                      <Box
                        key={`${palette}-${index}-${color}`}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.3,
                        }}
                      >
                        <Tooltip title="클릭하여 색상 변경">
                          <Box
                            component="label"
                            sx={{
                              position: 'relative',
                              width: 34,
                              height: 34,
                              borderRadius: 1.5,
                              bgcolor: color,
                              border: '2px solid',
                              borderColor: 'background.paper',
                              boxShadow: 1,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.15s ease',
                              '&:hover': {
                                transform: 'scale(1.08)',
                              },
                            }}
                          >
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => handleUpdatePaletteColor(index, e.target.value)}
                              style={{
                                opacity: 0,
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                              }}
                            />
                          </Box>
                        </Tooltip>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            fontFamily: 'monospace',
                            color: 'text.secondary',
                            fontWeight: 600,
                          }}
                        >
                          {color.toUpperCase()}
                        </Typography>
                        {paletteColors[palette].length > 2 && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePaletteColor(index)}
                            sx={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              width: 16,
                              height: 16,
                              p: 0,
                              bgcolor: 'error.main',
                              color: '#ffffff',
                              '&:hover': {
                                bgcolor: 'error.dark',
                              },
                            }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 10 }} />
                          </IconButton>
                        )}
                      </Box>
                    ))}

                    {/* Add Color Button */}
                    {paletteColors[palette].length < 16 && (
                      <Tooltip title="새 색상 추가 (최대 16색)">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleAddPaletteColor}
                          sx={{
                            minWidth: 34,
                            width: 34,
                            height: 34,
                            borderRadius: 1.5,
                            p: 0,
                            borderStyle: 'dashed',
                            borderColor: 'text.disabled',
                            color: 'text.secondary',
                            '&:hover': {
                              borderColor: 'primary.main',
                              color: 'primary.main',
                            },
                          }}
                        >
                          <AddRoundedIcon sx={{ fontSize: 18 }} />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              )}

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
