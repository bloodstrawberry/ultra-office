'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace, type SampleImageItem } from '../components';
import { formatAllColors, type FormattedColorData } from '../utils/color-utils';

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

const MAX_ZOOM = 8;
const ZOOM_STEP = 0.5;

export function ColorPickerView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [currentColorHex, setCurrentColorHex] = useState<string>('#3B82F6');
  const [colorData, setColorData] = useState<FormattedColorData>(() => formatAllColors('#3B82F6'));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const zoomFocusRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(
    null
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(() => {
      setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [imageSrc]);

  const fitScale =
    imageSize.width && imageSize.height && stageSize.width && stageSize.height
      ? Math.min(stageSize.width / imageSize.width, stageSize.height / imageSize.height)
      : 1;
  const displayWidth = imageSize.width * fitScale * zoom;
  const displayHeight = imageSize.height * fitScale * zoom;

  useLayoutEffect(() => {
    const focus = zoomFocusRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!focus || !stage || !canvas) return;
    const stageRect = stage.getBoundingClientRect();
    stage.scrollLeft =
      canvas.offsetLeft + focus.x * displayWidth - (focus.clientX - stageRect.left);
    stage.scrollTop = canvas.offsetTop + focus.y * displayHeight - (focus.clientY - stageRect.top);
    zoomFocusRef.current = null;
  }, [zoom, displayWidth, displayHeight]);

  const changeZoom = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;
      const clampedZoom = Math.max(1, Math.min(MAX_ZOOM, nextZoom));
      if (clampedZoom === zoom) return;
      const stageRect = stage.getBoundingClientRect();
      const focusX = clientX ?? stageRect.left + stageRect.width / 2;
      const focusY = clientY ?? stageRect.top + stageRect.height / 2;
      const canvasRect = canvas.getBoundingClientRect();
      zoomFocusRef.current = {
        x: Math.max(0, Math.min(1, (focusX - canvasRect.left) / canvasRect.width)),
        y: Math.max(0, Math.min(1, (focusY - canvasRect.top) / canvasRect.height)),
        clientX: focusX,
        clientY: focusY,
      };
      setZoom(clampedZoom);
    },
    [zoom]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const handleWheel = (e: WheelEvent) => {
      if (!canvasRef.current || !imageSize.width) return;
      e.preventDefault();
      changeZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), e.clientX, e.clientY);
    };
    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, [changeZoom, imageSize.width, zoom]);

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
  }, []);

  const loadSampleImage = useCallback(
    (url: string) => {
      setZoom(1);
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
        setImageSize({ width: img.width, height: img.height });

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
        setZoom(1);
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
          setImageSize({ width: img.width, height: img.height });

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

    const clickX = Math.max(
      0,
      Math.min(canvas.width - 1, Math.floor((e.clientX - rect.left) * scaleX))
    );
    const clickY = Math.max(
      0,
      Math.min(canvas.height - 1, Math.floor((e.clientY - rect.top) * scaleY))
    );

    const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
    updateColor(hex);
    toast.success(`색상 추출 완료: ${hex.toUpperCase()}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1500);
    toast.success(`${label} 복사 완료: ${text}`);
  };

  const handleCopyAll = () => {
    const textSummary = [
      `HEX: ${colorData.hexUpper}`,
      `RGB: ${colorData.rgbStr}`,
      `RGBA: ${colorData.rgbaStr}`,
      `HSL: ${colorData.hslStr}`,
      `HSV: ${colorData.hsvStr}`,
      `CMYK: ${colorData.cmykStr}`,
      `Name: ${colorData.nameEn} (${colorData.nameKo})`,
      `CSS: ${colorData.cssBg}`,
    ].join('\n');
    navigator.clipboard.writeText(textSummary);
    toast.success('전체 색상 코드가 클립보드에 복사되었습니다.');
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
          Color Picker (색상 추출)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 클릭하여 원하는 픽셀의 색상을 즉시 추출하고, HEX / RGB / HSL / HSV / CMYK 코드를
          확인 및 복사합니다.
        </Typography>
      </Box>

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
              pr: { md: 1 },
            }}
          >
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorizeRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    스포이드 추출 (사진의 원하는 픽셀 클릭)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    aria-label="축소"
                    onClick={() => changeZoom(zoom - ZOOM_STEP)}
                    disabled={zoom <= 1}
                  >
                    <ZoomOutRoundedIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" sx={{ minWidth: 42, textAlign: 'center' }}>
                    {Math.round(zoom * 100)}%
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="확대"
                    onClick={() => changeZoom(zoom + ZOOM_STEP)}
                    disabled={zoom >= MAX_ZOOM}
                  >
                    <ZoomInRoundedIcon fontSize="small" />
                  </IconButton>
                  <Button size="small" onClick={() => changeZoom(1)} disabled={zoom === 1}>
                    맞춤
                  </Button>
                </Box>
              </Box>

              <Box
                ref={stageRef}
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor: '#0f172a',
                  borderRadius: 0,
                  overflow: 'auto',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    position: 'relative',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'max-content',
                    height: 'max-content',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{
                      width: displayWidth || undefined,
                      height: displayHeight || undefined,
                      margin: 'auto',
                      cursor: 'crosshair',
                      imageRendering: zoom >= 3 ? 'pixelated' : 'auto',
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ mt: 0.75, color: 'text.secondary' }}>
                사진 위에서 휠로 확대·축소하고, 확대 후 스크롤 막대로 이동해 원하는 픽셀을 클릭하세요.
              </Typography>
            </Card>
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

          {/* Right: Color Values & Swatch */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.5,
              minHeight: 0,
              height: '100%',
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            {/* Main Swatch Card */}
            <Card sx={{ p: 2, borderRadius: 2, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: currentColorHex,
                    border: '2px solid rgba(0,0,0,0.1)',
                    boxShadow: 2,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    {colorData.hexUpper}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                    {colorData.nameEn} ({colorData.nameKo})
                  </Typography>
                </Box>
                <input
                  type="color"
                  value={currentColorHex}
                  onChange={(e) => updateColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              </Box>

              {/* Presets */}
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75, display: 'block' }}
              >
                프리셋 색상
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                {PRESET_PALETTES.map((hex) => (
                  <Box
                    key={hex}
                    onClick={() => updateColor(hex)}
                    sx={{
                      width: 24,
                      height: 24,
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
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
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
                  mb: 1.25,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  색상 포맷 변환 & 복사
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleCopyAll}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.2 }}
                >
                  전체 복사
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8,
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {[
                  { label: 'HEX', val: colorData.hexUpper },
                  { label: 'RGB', val: colorData.rgbStr },
                  { label: 'RGBA', val: colorData.rgbaStr },
                  { label: 'HSL', val: colorData.hslStr },
                  { label: 'HSV', val: colorData.hsvStr },
                  { label: 'CMYK', val: colorData.cmykStr },
                  { label: 'CSS Background', val: colorData.cssBg },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: '8px 12px',
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          display: 'block',
                          fontSize: '0.72rem',
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        {item.val}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(item.val, item.label)}
                      color={copiedKey === item.label ? 'primary' : 'default'}
                    >
                      {copiedKey === item.label ? (
                        <CheckRoundedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                      )}
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
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleCopy(colorData.hexUpper, 'HEX')}
                startIcon={<ContentCopyRoundedIcon />}
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, fontSize: '0.9rem' }}
              >
                {colorData.hexUpper} HEX 복사
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setImageSize({ width: 0, height: 0 });
                  setZoom(1);
                  updateColor('#3B82F6');
                }}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.82rem' }}
              >
                다른 사진 업로드
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
