'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace, type SampleImageItem } from '../components';
import {
  downloadDataUrl,
  floodFillCanvas,
  shareToKakaoTalk,
  type PaddingBgType,
  applyPaddingToCanvas,
  calculateAspectPadding,
  PADDING_GRADIENT_PRESETS,
  toggleBackgroundWhiteTransparent,
} from '../utils/image-processor';

const COLOR_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-logo',
    label: '화이트 배경 로고/아이콘 (배경 투명화/색상 변경)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    subLabel: '로고 & 그래픽',
  },
  {
    id: 'sample-product',
    label: '단색 배경 제품 컷 (여백 & 컬러 채우기)',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    subLabel: '제품 썸네일',
  },
  {
    id: 'sample-profile',
    label: '인물 프로필 (배경색 변경)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '프로필 증명사진',
  },
];

type ToolMode = 'fill' | 'erase' | 'spoid';
type ControlTab = 'color' | 'padding';

const ASPECT_PRESETS = [
  { label: '9:16 스토리/숏폼', w: 9, h: 16 },
  { label: '1:1 정사각형', w: 1, h: 1 },
  { label: '4:5 인스타 피드', w: 4, h: 5 },
  { label: '3:4 세로 표준', w: 3, h: 4 },
  { label: '16:9 가로 썸네일', w: 16, h: 9 },
  { label: '토스 세로 (636×1048)', w: 636, h: 1048 },
  { label: '토스 가로 (1504×741)', w: 1504, h: 741 },
];

export function ColorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [controlTab, setControlTab] = useState<ControlTab>('color');
  const [mode, setMode] = useState<ToolMode>('erase');
  const [fillColorHex, setFillColorHex] = useState<string>('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(25);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Padding State
  const [paddingLinked, setPaddingLinked] = useState<boolean>(true);
  const [paddingAll, setPaddingAll] = useState<number>(0);
  const [paddingTop, setPaddingTop] = useState<number>(0);
  const [paddingBottom, setPaddingBottom] = useState<number>(0);
  const [paddingLeft, setPaddingLeft] = useState<number>(0);
  const [paddingRight, setPaddingRight] = useState<number>(0);
  const [paddingBgType, setPaddingBgType] = useState<PaddingBgType>('edge-gradient');
  const [paddingSolidColor, setPaddingSolidColor] = useState<string>('#FFFFFF');
  const [paddingGradientPreset, setPaddingGradientPreset] = useState<string>('sunset');
  const [paddingBlurAmount, setPaddingBlurAmount] = useState<number>(25);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const syncBaseFromCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    if (!baseCanvasRef.current) {
      baseCanvasRef.current = document.createElement('canvas');
    }
    const base = baseCanvasRef.current;
    base.width = canvas.width;
    base.height = canvas.height;
    const ctx = base.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, base.width, base.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }, []);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), currentData]);
    syncBaseFromCanvas();
  }, [syncBaseFromCanvas]);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Current state
    const prevState = newHistory[newHistory.length - 1];

    if (prevState) {
      canvas.width = prevState.width;
      canvas.height = prevState.height;
      ctx.putImageData(prevState, 0, 0);
      setHistory(newHistory);
      setImageDimensions({ width: prevState.width, height: prevState.height });
      syncBaseFromCanvas();
      setPaddingAll(0);
      setPaddingTop(0);
      setPaddingBottom(0);
      setPaddingLeft(0);
      setPaddingRight(0);
      toast.info('실행 취소가 적용되었습니다.');
    }
  }, [history, syncBaseFromCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const renderPaddingPreview = useCallback(
    (params?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      bgType?: PaddingBgType;
      solidColor?: string;
      gradientPreset?: string;
      blurAmount?: number;
    }) => {
      const canvas = canvasRef.current;
      const base = baseCanvasRef.current;
      if (!canvas || !base || base.width === 0 || base.height === 0) return;

      const top = params?.top ?? (paddingLinked ? paddingAll : paddingTop);
      const bottom = params?.bottom ?? (paddingLinked ? paddingAll : paddingBottom);
      const left = params?.left ?? (paddingLinked ? paddingAll : paddingLeft);
      const right = params?.right ?? (paddingLinked ? paddingAll : paddingRight);
      const bg = params?.bgType ?? paddingBgType;
      const solid = params?.solidColor ?? paddingSolidColor;
      const grad = params?.gradientPreset ?? paddingGradientPreset;
      const blur = params?.blurAmount ?? paddingBlurAmount;

      // 1. baseCanvas를 메인 캔버스에 복원
      canvas.width = base.width;
      canvas.height = base.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, base.width, base.height);
      ctx.drawImage(base, 0, 0);

      // 2. 패딩이 존재하면 applyPaddingToCanvas 실행
      if (top > 0 || bottom > 0 || left > 0 || right > 0) {
        applyPaddingToCanvas(canvas, {
          top,
          bottom,
          left,
          right,
          bgType: bg,
          solidColor: solid,
          gradientPreset: grad,
          blurAmount: blur,
        });
      }

      setImageDimensions({ width: canvas.width, height: canvas.height });
    },
    [
      paddingLinked,
      paddingAll,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingBgType,
      paddingSolidColor,
      paddingGradientPreset,
      paddingBlurAmount,
    ]
  );

  const handleToggleBackground = () => {
    if (!canvasRef.current) return;
    toggleBackgroundWhiteTransparent(canvasRef.current);
    pushHistory();
    toast.success('흰색 ↔ 투명 전환이 완료되었습니다.');
  };

  const handleApplyPadding = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    pushHistory();
    syncBaseFromCanvas();
    setPaddingAll(0);
    setPaddingTop(0);
    setPaddingBottom(0);
    setPaddingLeft(0);
    setPaddingRight(0);
    toast.success('여백이 적용되었습니다.');
  };

  const handleAutoAspect = (targetRatioW: number, targetRatioH: number) => {
    const base = baseCanvasRef.current;
    if (!base || base.width === 0 || base.height === 0) return;

    const p = calculateAspectPadding(base.width, base.height, targetRatioW, targetRatioH);

    setPaddingLinked(false);
    setPaddingTop(p.top);
    setPaddingBottom(p.bottom);
    setPaddingLeft(p.left);
    setPaddingRight(p.right);

    renderPaddingPreview({
      top: p.top,
      bottom: p.bottom,
      left: p.left,
      right: p.right,
    });

    toast.success(`비율 (${targetRatioW}:${targetRatioH})에 맞추어 여백이 확장되었습니다.`);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    if (mode === 'spoid') {
      const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
      if (pixel[3] === 0) {
        toast.info('투명한 영역을 클릭했습니다.');
      } else {
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
        setFillColorHex(hex);
        setPaddingSolidColor(hex);
        if (controlTab === 'padding' && paddingBgType === 'color') {
          renderPaddingPreview({ solidColor: hex });
        }
        toast.success(`색상이 추출되었습니다: ${hex}`);
      }
      return;
    }

    let fillRGBA: { r: number; g: number; b: number; a: number } | null = null;
    if (mode === 'fill') {
      const hex = fillColorHex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      fillRGBA = { r, g, b, a: 255 };
    }

    floodFillCanvas(canvas, clickX, clickY, fillRGBA, tolerance);
    pushHistory();
  };

  const loadSampleImage = useCallback(
    (url: string) => {
      setImageSrc(url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
        syncBaseFromCanvas();
        setPaddingAll(0);
        setPaddingTop(0);
        setPaddingBottom(0);
        setPaddingLeft(0);
        setPaddingRight(0);
      };
      img.src = url;
    },
    [syncBaseFromCanvas]
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
          setImageDimensions({ width: img.width, height: img.height });
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
          syncBaseFromCanvas();
          setPaddingAll(0);
          setPaddingTop(0);
          setPaddingBottom(0);
          setPaddingLeft(0);
          setPaddingRight(0);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [syncBaseFromCanvas]
  );

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await downloadDataUrl(dataUrl, `transparent_edited_${Date.now()}.png`);
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await shareToKakaoTalk(
        dataUrl,
        '투명화 편집 사진',
        `transparent_${Date.now()}.png`
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
      <Box sx={{ mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          투명화 / 배경 지우개 (Background Eraser)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          원클릭 흰색↔투명 전환 및 스마트 페인트 통으로 불필요한 배경 색상을 빠르게 투명화합니다.
        </Typography>
      </Box>

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={COLOR_SAMPLE_IMAGES}
          onSelectSample={loadSampleImage}
          onFileSelect={processFile}
          title="이미지 업로드"
          subtitle="단색 배경 로고, 아이콘, 누끼 작업, 제품 썸네일에 최적화되어 있습니다."
          icon={<InvertColorsRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Canvas Area (Fills remaining width and height) */}
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
                borderRadius: 3,
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
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  편집 캔버스 ({mode === 'erase' ? '투명화 지우개' : '색상 채우기'})
                </Typography>
                {imageDimensions.width > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`사진 크기: ${imageDimensions.width} × ${imageDimensions.height} px`}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#0f172a',
                  p: { xs: 1, sm: 2 },
                }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    cursor:
                      mode === 'erase' ? 'crosshair' : mode === 'spoid' ? 'crosshair' : 'pointer',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.1s ease',
                    background:
                      'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 16px 16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    borderRadius: 4,
                    display: 'block',
                  }}
                />
              </Box>
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

          {/* Right: Tools & Actions */}
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
            {/* Control Tabs: 색상 조정 | 여백 조정 */}
            <Tabs
              value={controlTab}
              onChange={(_, val) => {
                if (val) {
                  syncBaseFromCanvas();
                  setControlTab(val as ControlTab);
                }
              }}
              variant="fullWidth"
              sx={{
                flexShrink: 0,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                p: 0.5,
                minHeight: 44,
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.75,
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: (theme) => theme.customShadows?.z1 || '0 2px 8px rgba(0,0,0,0.08)',
                  },
                },
              }}
            >
              <Tab
                value="color"
                label="색상 조정"
                icon={<PaletteRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                value="padding"
                label="여백 조정"
                icon={<AspectRatioRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
            </Tabs>

            {/* 1 & 2. Color Adjustment */}
            {controlTab === 'color' && (
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                {/* Quick Actions */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  1. 원클릭 빠른 변환
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={handleToggleBackground}
                  startIcon={<InvertColorsRoundedIcon />}
                  sx={{ mb: 2.5, py: 1.2, borderRadius: 2 }}
                >
                  흰색 배경 ↔ 투명 전환 토글
                </Button>

                {/* Tool Mode */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  2. 페인트 통 & 스포이드 도구 모드
                </Typography>
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(_, v) => v && setMode(v)}
                  size="small"
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 0,
                    border: 'none',
                    bgcolor: 'transparent',
                    height: 'auto',
                    minHeight: 'auto',
                    mb: 2,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: '1 1 auto',
                      whiteSpace: 'nowrap',
                      borderRadius: '8px !important',
                      border: '1px solid !important',
                      borderColor: 'divider !important',
                      px: 1.5,
                      py: 1,
                      minHeight: 38,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      m: '0 !important',
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        borderColor: 'primary.main !important',
                        color: 'primary.main',
                        fontWeight: 700,
                      },
                    },
                  }}
                >
                  <ToggleButton value="erase">
                    <InvertColorsRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 투명화 지우개
                  </ToggleButton>
                  <ToggleButton value="fill">
                    <FormatColorFillRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 색상 채우기
                  </ToggleButton>
                  <ToggleButton value="spoid">
                    <ColorizeRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 스포이드
                  </ToggleButton>
                </ToggleButtonGroup>

                {mode === 'fill' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      채울 색상:
                    </Typography>
                    <input
                      type="color"
                      value={fillColorHex}
                      onChange={(e) => setFillColorHex(e.target.value)}
                      style={{
                        width: 44,
                        height: 36,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {fillColorHex}
                    </Typography>
                  </Box>
                )}

                {mode === 'spoid' && (
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: 'primary.lighter',
                      color: 'primary.darker',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                      🎯 스포이드 모드 활성화됨
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
                      사진 속 원하는 배경 지점을 클릭하면 해당 색상이 추출되어 여백 및 페인트통
                      색상으로 지정됩니다.
                    </Typography>
                  </Box>
                )}

                {/* Tolerance Slider */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      색상 허용 오차 (Tolerance)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ±{tolerance}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={1}
                    max={100}
                    value={tolerance}
                    onChange={(_, v) => setTolerance(v as number)}
                  />
                </Box>
              </Card>
            )}

            {/* 3. Padding & Background Extension Card */}
            {controlTab === 'padding' && (
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AspectRatioRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      3. 여백(Padding) & 어울리는 배경
                    </Typography>
                  </Box>

                  <Tooltip
                    title={
                      paddingLinked ? '상하좌우 개별 조절로 전환' : '상하좌우 동일 크기로 연결'
                    }
                  >
                    <IconButton
                      size="small"
                      color={paddingLinked ? 'primary' : 'default'}
                      onClick={() => setPaddingLinked((prev) => !prev)}
                      sx={{
                        bgcolor: paddingLinked ? 'primary.lighter' : 'action.hover',
                      }}
                    >
                      {paddingLinked ? (
                        <LinkRoundedIcon fontSize="small" />
                      ) : (
                        <LinkOffRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Aspect Ratio Presets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75, display: 'block' }}
                >
                  규격/종횡비 맞춤 여백 자동 계산
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {ASPECT_PRESETS.map((preset) => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      size="small"
                      clickable
                      variant="outlined"
                      onClick={() => handleAutoAspect(preset.w, preset.h)}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>

                {/* Padding Inputs */}
                {paddingLinked ? (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        상하좌우 전체 여백
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        +{paddingAll}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={400}
                      step={2}
                      value={paddingAll}
                      onChange={(_, v) => {
                        const val = v as number;
                        setPaddingAll(val);
                        setPaddingTop(val);
                        setPaddingBottom(val);
                        setPaddingLeft(val);
                        setPaddingRight(val);
                        renderPaddingPreview({
                          top: val,
                          bottom: val,
                          left: val,
                          right: val,
                        });
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                    <TextField
                      size="small"
                      label="위 (Top)"
                      type="number"
                      value={paddingTop}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setPaddingTop(val);
                        renderPaddingPreview({ top: val });
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">px</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      label="아래 (Bottom)"
                      type="number"
                      value={paddingBottom}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setPaddingBottom(val);
                        renderPaddingPreview({ bottom: val });
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">px</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      label="왼쪽 (Left)"
                      type="number"
                      value={paddingLeft}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setPaddingLeft(val);
                        renderPaddingPreview({ left: val });
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">px</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      label="오른쪽 (Right)"
                      type="number"
                      value={paddingRight}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setPaddingRight(val);
                        renderPaddingPreview({ right: val });
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">px</InputAdornment>,
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Quick Presets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75, display: 'block' }}
                >
                  빠른 여백 크기 프리셋
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {[10, 20, 40, 80, 150].map((px) => (
                    <Chip
                      key={px}
                      label={`+${px}px`}
                      size="small"
                      clickable
                      color={paddingLinked && paddingAll === px ? 'primary' : 'default'}
                      variant={paddingLinked && paddingAll === px ? 'filled' : 'outlined'}
                      onClick={() => {
                        setPaddingLinked(true);
                        setPaddingAll(px);
                        setPaddingTop(px);
                        setPaddingBottom(px);
                        setPaddingLeft(px);
                        setPaddingRight(px);
                        renderPaddingPreview({
                          top: px,
                          bottom: px,
                          left: px,
                          right: px,
                        });
                      }}
                      sx={{ fontWeight: paddingLinked && paddingAll === px ? 700 : 500 }}
                    />
                  ))}
                </Box>

                {/* Background Style for Padding */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75, display: 'block' }}
                >
                  추가된 배경 채우기 옵션
                </Typography>
                <ToggleButtonGroup
                  value={paddingBgType}
                  exclusive
                  onChange={(_, v) => {
                    if (v) {
                      setPaddingBgType(v);
                      renderPaddingPreview({ bgType: v });
                    }
                  }}
                  fullWidth
                  size="small"
                  sx={{
                    mb: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 0.5,
                  }}
                >
                  <ToggleButton
                    value="edge-gradient"
                    sx={{
                      border: '1px solid !important',
                      borderRadius: '8px !important',
                      px: 0.5,
                      py: 0.75,
                      fontSize: '0.72rem',
                      gridColumn: 'span 2',
                    }}
                  >
                    <AutoAwesomeRoundedIcon sx={{ mr: 0.5, fontSize: 16, color: 'primary.main' }} />
                    스마트 그라데이션 (추천)
                  </ToggleButton>
                  <ToggleButton
                    value="edge"
                    sx={{
                      border: '1px solid !important',
                      borderRadius: '8px !important',
                      px: 0.5,
                      py: 0.75,
                      fontSize: '0.72rem',
                    }}
                  >
                    <AutoAwesomeRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} /> 테두리 평균
                  </ToggleButton>
                  <ToggleButton
                    value="color"
                    sx={{
                      border: '1px solid !important',
                      borderRadius: '8px !important',
                      px: 0.5,
                      py: 0.75,
                      fontSize: '0.72rem',
                    }}
                  >
                    <FormatColorFillRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} /> 단색
                  </ToggleButton>
                  <ToggleButton
                    value="transparent"
                    sx={{
                      border: '1px solid !important',
                      borderRadius: '8px !important',
                      px: 0.5,
                      py: 0.75,
                      fontSize: '0.72rem',
                    }}
                  >
                    <InvertColorsRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} /> 투명
                  </ToggleButton>
                  <ToggleButton
                    value="blur"
                    sx={{
                      border: '1px solid !important',
                      borderRadius: '8px !important',
                      px: 0.5,
                      py: 0.75,
                      fontSize: '0.72rem',
                    }}
                  >
                    <BlurOnRoundedIcon sx={{ mr: 0.5, fontSize: 16 }} /> 블러
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Sub-options based on paddingBgType */}
                {paddingBgType === 'edge-gradient' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      ✨ 완벽한 스튜디오 배경 확장
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      사진 상단과 하단의 스튜디오 조명 배경색을 감지하여 원본 사진과 경계선 없이
                      100% 매끄럽게 이어집니다.
                    </Typography>
                  </Box>
                )}

                {paddingBgType === 'color' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          배경 색상:
                        </Typography>
                        <input
                          type="color"
                          value={paddingSolidColor}
                          onChange={(e) => {
                            setPaddingSolidColor(e.target.value);
                            renderPaddingPreview({ solidColor: e.target.value });
                          }}
                          style={{
                            width: 36,
                            height: 30,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {paddingSolidColor}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant={mode === 'spoid' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => {
                          setMode('spoid');
                          // toast.info('사진에서 배경색 부분을 클릭하세요.');
                        }}
                        startIcon={<ColorizeRoundedIcon />}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        스포이드
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {[
                        '#FFFFFF',
                        '#F1F5F9',
                        '#111827',
                        '#3B82F6',
                        '#06B6D4',
                        '#FCE7F3',
                        '#E0F2FE',
                        '#D1FAE5',
                        '#FEF3C7',
                      ].map((hex) => (
                        <Box
                          key={hex}
                          onClick={() => {
                            setPaddingSolidColor(hex);
                            renderPaddingPreview({ solidColor: hex });
                          }}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: hex,
                            border: '2px solid',
                            borderColor: paddingSolidColor === hex ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {paddingBgType === 'edge' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      💡 사진 가장자리 외곽 픽셀 평균 색상을 자동 추출하여 여백을 단색으로 채웁니다.
                    </Typography>
                  </Box>
                )}

                {paddingBgType === 'blur' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        블러 강도
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {paddingBlurAmount}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={10}
                      max={60}
                      value={paddingBlurAmount}
                      onChange={(_, v) => {
                        const val = v as number;
                        setPaddingBlurAmount(val);
                        renderPaddingPreview({ blurAmount: val });
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                    >
                      원본 사진을 부드럽게 블러 확대하여 감성적인 배경 효과를 줍니다.
                    </Typography>
                  </Box>
                )}

                {paddingBgType === 'gradient' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      그라데이션 테마 선택
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {PADDING_GRADIENT_PRESETS.map((p) => {
                        const isSelected = paddingGradientPreset === p.id;
                        return (
                          <Chip
                            key={p.id}
                            label={p.label}
                            size="small"
                            clickable
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            onClick={() => {
                              setPaddingGradientPreset(p.id);
                              renderPaddingPreview({ gradientPreset: p.id });
                            }}
                            sx={{ fontWeight: isSelected ? 700 : 500 }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Output Info & Apply Button */}
                {imageDimensions.width > 0 && (
                  <Box
                    sx={{
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      적용 후 예상 해상도:
                    </Typography>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${
                        imageDimensions.width +
                        (paddingLinked ? paddingAll * 2 : paddingLeft + paddingRight)
                      } × ${
                        imageDimensions.height +
                        (paddingLinked ? paddingAll * 2 : paddingTop + paddingBottom)
                      } px`}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                )}

                {/* Apply Padding Button */}
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleApplyPadding}
                  startIcon={<AddRoundedIcon />}
                  sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                >
                  여백 적용하기
                </Button>
              </Card>
            )}

            {/* 4. Zoom & Undo Card */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Zoom Slider */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    화면 확대/축소 (Zoom)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {Math.round(zoomLevel * 100)}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={zoomLevel}
                  onChange={(_, v) => setZoomLevel(v as number)}
                />
              </Box>

              {/* History Undo */}
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handleUndo}
                disabled={history.length <= 1}
                startIcon={<UndoRoundedIcon />}
                sx={{ borderRadius: 2 }}
              >
                실행 취소 (Ctrl + Z)
              </Button>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 'auto', pt: 0.5 }}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setHistory([]);
                  setImageDimensions({ width: 0, height: 0 });
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
