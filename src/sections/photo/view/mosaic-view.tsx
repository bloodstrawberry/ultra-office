'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from '../components';
import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  runOcrOnImage,
  type MosaicMode,
  type MosaicTool,
  applyBlurEffect,
  applyPixelateEffect,
  applyBlackoutEffect,
} from '../utils/mosaic-processor';
import {
  drawEyeBarCensor,
  drawEmojiSticker,
  EMOJI_STICKER_OPTIONS,
  detectFacesWithMediaPipe,
  type MediaPipeFaceDetection,
} from '../utils/mediapipe-face';

// ----------------------------------------------------------------------
// Preset Test Samples
// ----------------------------------------------------------------------

const SAMPLE_MOSAIC_IMAGES = [
  {
    id: 'group',
    label: '👥 단체 인물 사진',
    desc: '다중 얼굴 동시 감지',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=80',
  },
  {
    id: 'portrait',
    label: '👤 인물 단독 프로필',
    desc: '정밀 눈/얼굴 감지',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
  },
  {
    id: 'receipt',
    label: '📄 영수증 / 문서',
    desc: 'OCR 민감정보 마스킹',
    url: 'https://images.unsplash.com/photo-1554415707-9e49fe02807c?w=700&auto=format&fit=crop&q=80',
  },
];

// ----------------------------------------------------------------------

export function MosaicView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [tool, setTool] = useState<MosaicTool>('brush');
  const [mode, setMode] = useState<MosaicMode>('pixelate');
  const [blockSize, setBlockSize] = useState<number>(16);
  const [brushRadius, setBrushRadius] = useState<number>(24);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😎');

  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanActionName, setScanActionName] = useState<string>('');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const loadSampleImage = (url: string) => {
    setImageSrc(url);
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
      toast.success('샘플 이미지가 로드되었습니다.');
    };
    img.src = url;
  };

  const handleUndo = useCallback(() => {
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
      toast.info('실행 취소');
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
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
  }, [historyIndex, history]);

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
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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

  // Pointer Handlers for Manual Drawing
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

  // --------------------------------------------------------------------
  // MediaPipe AI Actions
  // --------------------------------------------------------------------

  // 1. Full Face Mosaic / Blur
  const handleAutoDetectFaces = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    setScanActionName('MediaPipe AI 얼굴 감지 중...');

    try {
      const faces: MediaPipeFaceDetection[] = await detectFacesWithMediaPipe(canvas);
      if (faces.length === 0) {
        toast.info('감지된 얼굴 영역이 없습니다.');
      } else {
        faces.forEach((f) => {
          applyEffectToRect(f.box.x, f.box.y, f.box.width, f.box.height);
        });
        pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
        toast.success(`MediaPipe AI: ${faces.length}개의 얼굴이 감지되어 마스킹되었습니다.`);
      }
    } catch {
      toast.error('얼굴 감지 중 오류가 발생했습니다.');
    } finally {
      setIsScanning(false);
      setScanActionName('');
    }
  };

  // 2. Eye Censor Bar (Broadcast News Style)
  const handleAutoEyeBar = async (barStyle: 'black' | 'blur' | 'pixelate' = 'black') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    setScanActionName('MediaPipe AI 눈 좌표 인식 중...');

    try {
      const faces = await detectFacesWithMediaPipe(canvas);
      if (faces.length === 0) {
        toast.info('감지된 얼굴/눈 영역이 없습니다.');
      } else {
        faces.forEach((f) => {
          drawEyeBarCensor(ctx, f, barStyle);
        });
        pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
        toast.success(`${faces.length}명의 눈 영역에 가림 바(Censor Bar)가 적용되었습니다.`);
      }
    } catch {
      toast.error('눈 가림 바 생성 중 오류가 발생했습니다.');
    } finally {
      setIsScanning(false);
      setScanActionName('');
    }
  };

  // 3. Emoji Sticker Masking
  const handleAutoEmojiMask = async (emoji: string = selectedEmoji) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    setScanActionName('MediaPipe AI 얼굴 위치 스티커 부착 중...');

    try {
      const faces = await detectFacesWithMediaPipe(canvas);
      if (faces.length === 0) {
        toast.info('감지된 얼굴 영역이 없습니다.');
      } else {
        faces.forEach((f) => {
          drawEmojiSticker(ctx, f, emoji);
        });
        pushState(ctx.getImageData(0, 0, canvas.width, canvas.height));
        toast.success(`${faces.length}개의 얼굴에 ${emoji} 스티커가 부착되었습니다.`);
      }
    } catch {
      toast.error('이모지 스티커 합성 중 오류가 발생했습니다.');
    } finally {
      setIsScanning(false);
      setScanActionName('');
    }
  };

  // 4. Sensitive Info OCR Masking
  const handleAutoDetectSensitive = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    setScanActionName('OCR 민감 개인정보(주민번호/계좌/전화번호) 탐색 중...');

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
      setScanActionName('');
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

  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 복사되었습니다.');
      });
    } catch {
      toast.error('클립보드 복사 중 오류가 발생했습니다.');
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      await shareToKakaoTalk(
        dataUrl,
        '모자이크 비식별화 사진',
        'AI 스마트 모자이크 비식별화 처리된 사진입니다.'
      );
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
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
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              AI 스마트 모자이크 & 블러 비식별화
            </Typography>
            <Chip
              label="Google MediaPipe Vision AI 탑재"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            다중 인물 얼굴 정밀 감지, 방송 뉴스 스타일 눈 가림 바, 귀여운 이모지 마스킹, OCR
            개인정보 블랙아웃을 100% 로컬에서 지원합니다.
          </Typography>
        </Box>

        <Chip
          icon={<AutoAwesomeRoundedIcon />}
          label="MediaPipe BlazeFace ⚡ 가속"
          color="success"
          variant="soft"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={SAMPLE_MOSAIC_IMAGES.map((s) => ({
            id: s.id,
            label: s.label,
            url: s.url,
            subLabel: s.desc,
          }))}
          onSelectSample={loadSampleImage}
          onFileSelect={processFile}
          title="모자이크 및 비식별화할 사진을 업로드하세요"
          subtitle="드래그 & 드롭 및 클립보드 붙여넣기(Ctrl+V) 지원 • 다중 인물, 단체 사진, 신분증/영수증"
          icon={<BlurOnRoundedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        /* Active Editing Workspace */
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, lg: 0 },
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
              pr: { lg: 1 },
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
                  flexWrap: 'wrap',
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  편집 캔버스 (도구: {tool === 'brush' ? '브러시 칠하기' : '사각형 드래그'})
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="실행 취소 (Ctrl + Z)">
                    <span>
                      <IconButton size="small" onClick={handleUndo} disabled={historyIndex <= 0}>
                        <UndoRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="다시 실행 (Ctrl + Y)">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                      >
                        <RedoRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setImageSrc('');
                      setHistory([]);
                    }}
                    startIcon={<RefreshRoundedIcon />}
                    sx={{ ml: 1 }}
                  >
                    다른 사진
                  </Button>
                </Box>
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
                {isScanning && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(15, 23, 42, 0.7)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      color: 'white',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <CircularProgress color="primary" size={40} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {scanActionName || 'AI 분석 중...'}
                    </Typography>
                  </Box>
                )}

                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    cursor: 'crosshair',
                    touchAction: 'none',
                    borderRadius: 4,
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
              display: { xs: 'none', lg: 'flex' },
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

          {/* Right Sidebar: AI Auto Masking & Manual Tools */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', lg: `${rightPanelWidth}px` },
              minWidth: { lg: `${rightPanelWidth}px` },
              maxWidth: { lg: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflow: 'auto',
              pl: { lg: 1 },
              pr: 0.5,
            }}
          >
            {/* 1. AI Auto Detection & One-Click Masking */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  1. AI 자동 얼굴 & 개인정보 감지
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 2, display: 'block' }}
              >
                MediaPipe 초고속 AI로 사진 속 얼굴과 민감정보를 한 번에 자동 가림 처리합니다.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disabled={isScanning}
                  onClick={handleAutoDetectFaces}
                  startIcon={<BlurOnRoundedIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: 2, fontWeight: 700 }}
                >
                  👤 모든 얼굴 자동 모자이크
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={isScanning}
                  onClick={() => handleAutoEyeBar('black')}
                  startIcon={<VisibilityOffRoundedIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: 2, fontWeight: 700 }}
                >
                  🕶️ 눈 부위 방송용 블랙 바 가림
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  fullWidth
                  disabled={isScanning}
                  onClick={() => handleAutoEmojiMask(selectedEmoji)}
                  startIcon={<SentimentSatisfiedAltRoundedIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: 2, fontWeight: 700 }}
                >
                  {selectedEmoji} 얼굴에 이모지 스티커 부착
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  disabled={isScanning}
                  onClick={handleAutoDetectSensitive}
                  startIcon={<DocumentScannerRoundedIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: 2, fontWeight: 700 }}
                >
                  📄 영수증/신분증 민감정보 블랙아웃
                </Button>
              </Box>
            </Card>

            {/* 2. Manual Custom Tools & Effect Config */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                2. 수동 편집 도구 설정
              </Typography>

              {/* Tool Selector */}
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}>
                가림 방식 도구
              </Typography>
              <ToggleButtonGroup
                value={tool}
                exclusive
                onChange={(_, v) => v && setTool(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="brush" sx={{ fontWeight: 700 }}>
                  <BrushRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  브러시 칠하기
                </ToggleButton>
                <ToggleButton value="rect" sx={{ fontWeight: 700 }}>
                  <CropSquareRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  사각형 드래그
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Mode Selector */}
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}>
                마스킹 효과 스타일
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="pixelate" sx={{ fontWeight: 700 }}>
                  픽셀 모자이크
                </ToggleButton>
                <ToggleButton value="blur" sx={{ fontWeight: 700 }}>
                  부드러운 블러
                </ToggleButton>
                <ToggleButton value="blackout" sx={{ fontWeight: 700 }}>
                  블랙 가림
                </ToggleButton>
              </ToggleButtonGroup>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}>
                  부착할 이모지 선택
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {EMOJI_STICKER_OPTIONS.map((item) => (
                    <Box
                      key={item.emoji}
                      onClick={() => setSelectedEmoji(item.emoji)}
                      sx={{
                        fontSize: '1.4rem',
                        p: 0.8,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedEmoji === item.emoji ? 'primary.main' : 'divider',
                        bgcolor: selectedEmoji === item.emoji ? 'primary.lighter' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {item.emoji}
                    </Box>
                  ))}
                </Box>
              </Box>

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
                <Box>
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
                sx={{ py: 1.4, fontWeight: 700, borderRadius: 2, fontSize: '0.95rem' }}
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
