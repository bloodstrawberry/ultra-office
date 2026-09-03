'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { AppsInTossNavHeader, PhotoUploadWorkspace, type SampleImageItem } from '../components';
import {
  downloadDataUrl,
  floodFillCanvas,
  shareToKakaoTalk,
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
    label: '단색 배경 제품 컷 (컬러 채우기 & 누끼)',
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

type ToolMode = 'erase' | 'fill' | 'spoid';

const QUICK_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F1F5F9',
  '#1E293B',
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#E0F2FE',
];

export function PhotoColorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [mode, setMode] = useState<ToolMode>('erase');
  const [fillColorHex, setFillColorHex] = useState<string>('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(25);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [history, setHistory] = useState<ImageData[]>([]);
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

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentData]);
  }, []);

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
      toast.info('실행 취소가 적용되었습니다.');
    }
  }, [history]);

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

  const handleToggleBackground = () => {
    if (!canvasRef.current) return;
    toggleBackgroundWhiteTransparent(canvasRef.current);
    pushHistory();
    toast.success('흰색 ↔ 투명 전환이 완료되었습니다.');
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
        const hex = `#${[pixel[0], pixel[1], pixel[2]]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()}`;
        setFillColorHex(hex);
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

  const loadSampleImage = useCallback((url: string) => {
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
    };
    img.src = url;
  }, []);

  const processFile = useCallback((file: File) => {
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
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await downloadDataUrl(dataUrl, `background_color_${Date.now()}.png`);
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
        '배경색 변경 사진',
        `background_color_${Date.now()}.png`
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
      <AppsInTossNavHeader currentTab="color" />

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
          {/* Left: Canvas Area */}
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
                  편집 캔버스 (
                  {mode === 'erase'
                    ? '투명화 지우개'
                    : mode === 'fill'
                      ? '색상 채우기'
                      : '스포이드'}
                  )
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
                  borderRadius: 0,
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
                    borderRadius: 0,
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
            {/* Color Adjustment Card */}
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
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
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

                  {/* Quick Color Palette */}
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75, display: 'block' }}
                  >
                    추천 색상 팔레트
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {QUICK_COLORS.map((hex) => (
                      <Box
                        key={hex}
                        onClick={() => setFillColorHex(hex)}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: hex,
                          border: '2px solid',
                          borderColor:
                            fillColorHex.toUpperCase() === hex.toUpperCase()
                              ? 'primary.main'
                              : 'divider',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                          '&:hover': { transform: 'scale(1.15)' },
                        }}
                      />
                    ))}
                  </Box>
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
                    사진 속 원하는 배경 지점을 클릭하면 해당 색상이 추출되어 페인트통 색상으로
                    지정됩니다.
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
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                >
                  값이 클수록 비슷한 색상 영역을 더 넓게 한 번에 채우거나 지웁니다.
                </Typography>
              </Box>
            </Card>

            {/* Zoom & Undo Card */}
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

export { PhotoColorView as ColorView };
