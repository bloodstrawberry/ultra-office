'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  formatAllColors,
  generateColorCardPng,
  type FormattedColorData,
} from '../utils/color-utils';

const PRESET_PALETTES = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#0F172A',
  '#64748B',
  '#FFFFFF',
];

export function ColorPickerView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [currentColorHex, setCurrentColorHex] = useState<string>('#3B82F6');
  const [colorData, setColorData] = useState<FormattedColorData>(() => formatAllColors('#3B82F6'));
  const [colorCardUrl, setColorCardUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateColor = useCallback((hex: string) => {
    setCurrentColorHex(hex);
    const data = formatAllColors(hex);
    setColorData(data);
    try {
      const card = generateColorCardPng(data);
      setColorCardUrl(card);
    } catch {
      // card generation error
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const centerData = ctx.getImageData(
          Math.floor(img.width / 2),
          Math.floor(img.height / 2),
          1,
          1
        ).data;
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const hex = `#${toHex(centerData[0])}${toHex(centerData[1])}${toHex(centerData[2])}`;
        updateColor(hex);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
    updateColor(hex);
    toast.success(`스포이드 추출: ${hex.toUpperCase()}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} 복사 완료: ${text}`);
  };

  const handleDownloadCard = async () => {
    if (!colorCardUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        colorCardUrl,
        `color_card_${colorData.hexUpper.replace('#', '')}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!colorCardUrl) return;
    setIsProcessing(true);
    try {
      const res = await shareToKakaoTalk(
        colorCardUrl,
        '컬러 팔레트 카드',
        `color_${colorData.hexUpper}.png`
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
          스포이드 컬러 추출기 (Color Picker & Card)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 클릭하여 색상을 스포이드로 추출하고, HEX/RGB/HSL/HSV/CMYK 변환 및 고해상도 컬러
          카드 PNG를 생성합니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        {/* Left: Image / Eyedropper Stage */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                <ColorLensRoundedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                색상을 추출할 사진 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                사진의 원하는 부분을 클릭하여 색상을 즉시 추출합니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                사진 선택하기
              </Button>
            </Card>
          ) : (
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  스포이드 추출 (사진의 원하는 픽셀 클릭)
                </Typography>
                <Button size="small" onClick={() => fileInputRef.current?.click()}>
                  다른 사진
                </Button>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 280, sm: 400 },
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    cursor: 'crosshair',
                  }}
                />
              </Box>
            </Card>
          )}

          {/* Color Card Preview */}
          {colorCardUrl && (
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, alignSelf: 'flex-start' }}
              >
                생성된 컬러 팔레트 카드 (High-Res PNG)
              </Typography>
              <img
                src={colorCardUrl}
                alt="Color Card"
                style={{
                  maxHeight: 280,
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                }}
              />
            </Card>
          )}
        </Box>

        {/* Right: Color Values & Sliders */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Main Swatch */}
          <Card sx={{ p: 2.5, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: currentColorHex,
                  border: '2px solid rgba(0,0,0,0.1)',
                  boxShadow: 2,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                  {colorData.hexUpper}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {colorData.nameEn} ({colorData.nameKo})
                </Typography>
              </Box>
              <input
                type="color"
                value={currentColorHex}
                onChange={(e) => updateColor(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            </Box>

            {/* Presets */}
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
            >
              프리셋 색상
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
              {PRESET_PALETTES.map((hex) => (
                <Box
                  key={hex}
                  onClick={() => updateColor(hex)}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1,
                    bgcolor: hex,
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,0.15)',
                    transform:
                      currentColorHex.toLowerCase() === hex.toLowerCase() ? 'scale(1.15)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </Box>
          </Card>

          {/* Format Table & Copy */}
          <Card sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              색상 포맷 변환 & 복사
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                { label: 'HEX', val: colorData.hexUpper },
                { label: 'RGB', val: colorData.rgbStr },
                { label: 'HSL', val: colorData.hslStr },
                { label: 'HSV', val: colorData.hsvStr },
                { label: 'CMYK', val: colorData.cmykStr },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {item.val}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleCopy(item.val, item.label)}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setImageSrc('');
                updateColor('#3B82F6');
              }}
              startIcon={<RefreshRoundedIcon />}
              sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadCard}
              disabled={isProcessing || !colorCardUrl}
              startIcon={
                isProcessing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <DownloadRoundedIcon />
                )
              }
              sx={{ flex: 1.5, py: 1.2, borderRadius: 2 }}
            >
              컬러 카드 저장
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleShare}
              disabled={isProcessing || !colorCardUrl}
              startIcon={<ShareRoundedIcon />}
              sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
            >
              공유
            </Button>
          </Box>
        </Box>
      </Box>
    </DashboardContent>
  );
}
