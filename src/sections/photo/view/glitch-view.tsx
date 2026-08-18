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
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

export function GlitchView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [rgbShift, setRgbShift] = useState<number>(20);
  const [sliceCount, setSliceCount] = useState<number>(15);
  const [noiseAmount, setNoiseAmount] = useState<number>(25);
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(1);

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

  const renderGlitch = useCallback(async () => {
    if (!imageSrc) {
      setResultDataUrl('');
      return '';
    }

    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

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

    // 1. RGB Channel Shift (Chromatic Aberration)
    if (rgbShift > 0) {
      const origData = ctx.getImageData(0, 0, w, h);
      const data = origData.data;
      const copy = new Uint8ClampedArray(data);

      const offsetR = Math.round(rgbShift);
      const offsetB = -Math.round(rgbShift * 0.8);

      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const idx = (y * w + x) * 4;

          const rx = Math.min(w - 1, Math.max(0, x + offsetR));
          const rIdx = (y * w + rx) * 4;
          data[idx] = copy[rIdx]; // Red channel shifted

          const bx = Math.min(w - 1, Math.max(0, x + offsetB));
          const bIdx = (y * w + bx) * 4;
          data[idx + 2] = copy[bIdx + 2]; // Blue channel shifted
        }
      }
      ctx.putImageData(origData, 0, 0);
    }

    // 2. Horizontal Slices Displacements
    if (sliceCount > 0) {
      let pseudoRand = seed;
      const getRand = () => {
        pseudoRand = (pseudoRand * 9301 + 49297) % 233280;
        return pseudoRand / 233280;
      };

      for (let i = 0; i < sliceCount; i += 1) {
        const sliceY = Math.floor(getRand() * h);
        const sliceH = Math.max(2, Math.floor(getRand() * 30));
        const maxOffset = Math.floor((rgbShift + 10) * 1.5);
        const sliceOffsetX = Math.floor((getRand() - 0.5) * maxOffset * 2);

        if (sliceY + sliceH <= h) {
          const sliceImgData = ctx.getImageData(0, sliceY, w, sliceH);
          ctx.putImageData(sliceImgData, sliceOffsetX, sliceY);
        }
      }
    }

    // 3. Scanlines
    if (scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1.5);
      }
    }

    // 4. Noise
    if (noiseAmount > 0) {
      const noiseData = ctx.getImageData(0, 0, w, h);
      const nData = noiseData.data;
      const factor = noiseAmount * 0.5;

      for (let i = 0; i < nData.length; i += 4) {
        if (Math.random() < 0.15) {
          const noise = (Math.random() - 0.5) * factor * 2;
          nData[i] = Math.min(255, Math.max(0, nData[i] + noise));
          nData[i + 1] = Math.min(255, Math.max(0, nData[i + 1] + noise));
          nData[i + 2] = Math.min(255, Math.max(0, nData[i + 2] + noise));
        }
      }
      ctx.putImageData(noiseData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setResultDataUrl(dataUrl);
    return dataUrl;
  }, [imageSrc, rgbShift, sliceCount, noiseAmount, scanlines, seed]);

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        renderGlitch();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [imageSrc, rgbShift, sliceCount, noiseAmount, scanlines, seed, renderGlitch]);

  const handleRandomize = () => {
    setRgbShift(Math.floor(5 + Math.random() * 35));
    setSliceCount(Math.floor(5 + Math.random() * 25));
    setNoiseAmount(Math.floor(10 + Math.random() * 40));
    setSeed(Math.floor(Math.random() * 10000));
    toast.success('글리치 효과가 무작위로 재생성되었습니다!');
  };

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(resultDataUrl, `glitch_art_${Date.now()}.png`);
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
        '글리치 아트 사진',
        `glitch_${Date.now()}.png`
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
          글리치 효과 생성기 (Glitch Art FX)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          RGB 색수차 왜곡, 슬라이스 어긋남, CRT 스캔라인 및 아날로그 노이즈를 조합합니다.
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
            <FlashOnRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            글리치 효과를 적용할 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            인물, 앨범 커버, 사이버펑크 스타일에 최적화되어 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Preview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 320, sm: 460 },
                  bgcolor: '#050515',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                }}
              >
                {resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="Glitch Output"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <CircularProgress color="inherit" />
                )}
              </Box>
            </Card>
          </Box>

          {/* Right: Controls */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  글리치 파라미터 조절
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={handleRandomize}
                  startIcon={<ShuffleRoundedIcon />}
                >
                  랜덤 생성
                </Button>
              </Box>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    RGB 색수차 분리 (RGB Shift)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {rgbShift}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={50}
                  value={rgbShift}
                  onChange={(_, v) => setRgbShift(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    가로 슬라이스 찢어짐 (Slices)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {sliceCount}개
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={40}
                  value={sliceCount}
                  onChange={(_, v) => setSliceCount(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    노이즈 강도 (Grain)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {noiseAmount}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={60}
                  value={noiseAmount}
                  onChange={(_, v) => setNoiseAmount(v as number)}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch checked={scanlines} onChange={(e) => setScanlines(e.target.checked)} />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    CRT 아날로그 스캔라인
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
                글리치 저장
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
