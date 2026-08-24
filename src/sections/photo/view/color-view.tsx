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
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  downloadDataUrl,
  floodFillCanvas,
  shareToKakaoTalk,
  toggleBackgroundWhiteTransparent,
} from '../utils/image-processor';

type ToolMode = 'fill' | 'erase';

export function ColorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setHistory((prev) => [...prev.slice(-10), currentData]);
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
      toast.info('실행 취소가 적용되었습니다.');
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
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

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

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

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
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

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processFile(files[0]);
    },
    multiple: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!imageSrc ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 4,
            flex: '1 1 auto',
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: { xs: 64, sm: 80 },
              height: { xs: 64, sm: 80 },
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <InvertColorsRoundedIcon sx={{ fontSize: { xs: 36, sm: 44 } }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
            이미지 업로드
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 480 }}
          >
            단색 배경 로고, 아이콘, 누끼 작업에 최적화되어 있습니다.
            <br />
            이미지를 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CloudUploadRoundedIcon />}
          >
            사진 선택하기
          </Button>
        </Card>
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
                  background:
                    'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 20px 20px',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    cursor: mode === 'erase' ? 'crosshair' : 'pointer',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.1s ease',
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
                2. 페인트 통 도구 모드
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="erase">
                  <InvertColorsRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 투명화 지우개
                </ToggleButton>
                <ToggleButton value="fill">
                  <FormatColorFillRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 색상 채우기
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

              {/* Tolerance Slider */}
              <Box sx={{ mb: 2 }}>
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
                PNG 저장
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
