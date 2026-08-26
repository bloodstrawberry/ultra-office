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
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace, type SampleImageItem } from '../components';
import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  formatAllColors,
  generateColorCardPng,
  type FormattedColorData,
} from '../utils/color-utils';

const COLOR_PICKER_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-sunset',
    label: '노을 & 석양 풍경 (감성 컬러 팔레트)',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    subLabel: '자연 & 풍경',
  },
  {
    id: 'sample-neon',
    label: '네온 사이버펑크 (화려한 형광 컬러)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    subLabel: '네온 & 야경',
  },
  {
    id: 'sample-fashion',
    label: '패션 룩북 (피부톤/의상 컬러)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 패션',
  },
];

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

  const loadSampleImage = useCallback(
    (url: string) => {
      setImageSrc(url);
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
      img.src = url;
    },
    [updateColor]
  );

  const processFile = useCallback(
    (file: File) => {
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
    },
    [updateColor]
  );

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
          스포이드 컬러 추출기 (Color Picker & Card)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 클릭하여 색상을 스포이드로 추출하고, HEX/RGB/HSL/HSV/CMYK 변환 및 고해상도 컬러
          카드 PNG를 생성합니다.
        </Typography>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={COLOR_PICKER_SAMPLE_IMAGES}
          onSelectSample={loadSampleImage}
          onFileSelect={processFile}
          title="색상을 추출할 사진 업로드"
          subtitle="사진의 원하는 부분을 클릭하여 색상을 즉시 추출합니다."
          icon={<ColorLensRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Image / Eyedropper Stage */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 2,
              pr: { md: 1 },
            }}
          >
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  스포이드 추출 (사진의 원하는 픽셀 클릭)
                </Typography>
                <Button size="small" onClick={() => setImageSrc('')}>
                  다른 사진
                </Button>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
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

            {/* Color Card Preview */}
            {colorCardUrl && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
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
                    maxHeight: 180,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  }}
                />
              </Card>
            )}
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

          {/* Right: Color Values & Sliders */}
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
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
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
                        currentColorHex.toLowerCase() === hex.toLowerCase()
                          ? 'scale(1.15)'
                          : 'none',
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

            {/* Action Buttons Column */}
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
                  updateColor('#3B82F6');
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
                onClick={handleDownloadCard}
                disabled={isProcessing || !colorCardUrl}
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
                disabled={isProcessing || !colorCardUrl}
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
