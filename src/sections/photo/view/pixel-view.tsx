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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processFile(files[0]);
    },
    multiple: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

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
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          픽셀 아트 변환기 (Pixel Art Maker)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 레트로 8비트/16비트 게임 도트 그래픽으로 변환합니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {!imageSrc ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            minHeight: 320,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
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
            <ViewModuleRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            픽셀 아트로 만들 이미지 업로드
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
          {/* Left: Pixel Preview */}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
              </Box>
            </Card>
          </Box>

          {/* Right: Controls */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                픽셀 아트 저장
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
