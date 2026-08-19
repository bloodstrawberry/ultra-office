'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  runOcrOnImage,
  type MosaicMode,
  type MosaicTool,
  applyBlurEffect,
  detectFacesInCanvas,
  applyPixelateEffect,
  applyBlackoutEffect,
} from '../utils/mosaic-processor';

export function MosaicView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [tool, setTool] = useState<MosaicTool>('brush');
  const [mode, setMode] = useState<MosaicMode>('pixelate');
  const [blockSize, setBlockSize] = useState<number>(16);
  const [brushRadius, setBrushRadius] = useState<number>(24);

  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const pushState = useCallback(
    (imgData: ImageData) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced.slice(-15), imgData];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 15));
    },
    [historyIndex]
  );

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

        const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialData]);
        setHistoryIndex(0);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIndex = historyIndex - 1;
    const targetState = history[targetIndex];
    if (targetState) {
      canvas.width = targetState.width;
      canvas.height = targetState.height;
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(targetIndex);
      toast.info('되돌리기 실행');
    }
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIndex = historyIndex + 1;
    const targetState = history[targetIndex];
    if (targetState) {
      canvas.width = targetState.width;
      canvas.height = targetState.height;
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(targetIndex);
      toast.info('다시 실행');
    }
  };

  const applyEffectToRect = (x: number, y: number, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mode === 'pixelate') {
      applyPixelateEffect(ctx, x, y, w, h, blockSize);
    } else if (mode === 'blur') {
      applyBlurEffect(ctx, x, y, w, h, blockSize);
    } else if (mode === 'blackout') {
      applyBlackoutEffect(ctx, x, y, w, h, '#000000');
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    isDrawingRef.current = true;
    dragStartRef.current = { x, y };

    if (tool === 'brush') {
      applyEffectToRect(x - brushRadius, y - brushRadius, brushRadius * 2, brushRadius * 2);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (tool === 'brush') {
      applyEffectToRect(x - brushRadius, y - brushRadius, brushRadius * 2, brushRadius * 2);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'rect' && dragStartRef.current) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const endX = Math.round((e.clientX - rect.left) * scaleX);
      const endY = Math.round((e.clientY - rect.top) * scaleY);

      const startX = Math.min(dragStartRef.current.x, endX);
      const startY = Math.min(dragStartRef.current.y, endY);
      const w = Math.abs(endX - dragStartRef.current.x);
      const h = Math.abs(endY - dragStartRef.current.y);

      if (w > 5 && h > 5) {
        applyEffectToRect(startX, startY, w, h);
      }
    }

    dragStartRef.current = null;
    pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleAutoDetectFaces = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    toast.info('얼굴 영역을 감지하고 있습니다...');

    try {
      const faces = await detectFacesInCanvas(canvas);
      if (faces.length === 0) {
        toast.info('감지된 얼굴 영역이 없습니다.');
      } else {
        faces.forEach((f) => {
          applyEffectToRect(f.x, f.y, f.width, f.height);
        });
        pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
        toast.success(`${faces.length}개의 얼굴 영역에 모자이크가 적용되었습니다.`);
      }
    } catch {
      toast.error('얼굴 감지 중 오류가 발생했습니다.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoDetectSensitive = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    toast.info('OCR 텍스트 인식 및 민감 정보(주민번호/계좌/전화번호)를 탐색 중입니다...');

    try {
      const regions = await runOcrOnImage(canvas.toDataURL('image/png'));
      const sensitiveRegions = regions.filter((r) => r.isMosaiced);
      if (sensitiveRegions.length === 0) {
        toast.info('감지된 민감 정보 텍스트가 없습니다.');
      } else {
        sensitiveRegions.forEach((r) => {
          applyEffectToRect(r.bbox.x0, r.bbox.y0, r.bbox.x1 - r.bbox.x0, r.bbox.y1 - r.bbox.y0);
        });
        pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
        toast.success(`${sensitiveRegions.length}개의 민감 정보 영역이 안전하게 마스킹되었습니다.`);
      }
    } catch {
      toast.error('민감 정보 인식 중 오류가 발생했습니다.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await downloadDataUrl(dataUrl, `mosaic_protected_${Date.now()}.png`);
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
        '모자이크 처리된 사진',
        `mosaic_${Date.now()}.png`
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
          모자이크 & 블러 스튜디오 (Mosaic & Blur Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          얼굴 자동 감지, OCR 민감 정보 마스킹, 브러시/드래그 사각형 모자이크 처리를 지원합니다.
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
            <BlurOnRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            모자이크 처리할 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            얼굴, 개인정보, 계좌번호 등을 안전하게 가려드립니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Interactive Canvas */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  편집 캔버스 (도구: {tool === 'brush' ? '브러시 칠하기' : '사각형 드래그'})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={handleUndo} disabled={historyIndex <= 0}>
                    <UndoRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <RedoRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 340, sm: 480 },
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
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    cursor: tool === 'brush' ? 'crosshair' : 'crosshair',
                    touchAction: 'none',
                  }}
                />
              </Box>
            </Card>
          </Box>

          {/* Right: Controls & AI Detectors */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* AI Auto Detect Section */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                1. 원클릭 AI 자동 감지
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleAutoDetectFaces}
                  disabled={isScanning}
                  startIcon={
                    isScanning ? (
                      <CircularProgress size={18} />
                    ) : (
                      <FaceRetouchingNaturalRoundedIcon />
                    )
                  }
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  얼굴 자동 모자이크
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={handleAutoDetectSensitive}
                  disabled={isScanning}
                  startIcon={
                    isScanning ? <CircularProgress size={18} /> : <DocumentScannerRoundedIcon />
                  }
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  OCR 민감정보 가리기
                </Button>
              </Box>
            </Card>

            {/* Manual Tools & Modes */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                2. 모자이크 효과 형태
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="pixelate">픽셀 모자이크</ToggleButton>
                <ToggleButton value="blur">부드러운 블러</ToggleButton>
                <ToggleButton value="blackout">블랙아웃 (먹칠)</ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                3. 그리기 도구
              </Typography>
              <ToggleButtonGroup
                value={tool}
                exclusive
                onChange={(_, v) => v && setTool(v)}
                fullWidth
                size="small"
                sx={{ mb: 2.5 }}
              >
                <ToggleButton value="brush">
                  <BrushRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 브러시 칠하기
                </ToggleButton>
                <ToggleButton value="rect">
                  <CropSquareRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 사각형 영역 드래그
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    효과 강도 / 블록 크기
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {blockSize}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={4}
                  max={48}
                  value={blockSize}
                  onChange={(_, v) => setBlockSize(v as number)}
                />
              </Box>

              {tool === 'brush' && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      브러시 반경 크기
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {brushRadius}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={8}
                    max={64}
                    value={brushRadius}
                    onChange={(_, v) => setBrushRadius(v as number)}
                  />
                </Box>
              )}
            </Card>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setImageSrc('')}
                startIcon={<RefreshRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
              >
                다른 사진
              </Button>
              <Button
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
                sx={{ flex: 1.5, py: 1.2, borderRadius: 2 }}
              >
                보호된 사진 저장
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing}
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
