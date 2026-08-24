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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

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
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
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
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 이미지가 복사되었습니다!');
      }
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
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
      {/* Header */}
      <Box
        sx={{
          mb: 2.5,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              모자이크 & AI 비식별화 스튜디오
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {!imageSrc ? (
          /* Empty / Upload & Sample State */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card
              {...getRootProps({
                onClick: () => fileInputRef.current?.click(),
              })}
              sx={{
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                borderRadius: 3,
                minHeight: 320,
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <BlurOnRoundedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                모자이크 및 비식별화할 사진을 업로드하세요
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'center' }}
              >
                드래그 & 드롭 및 클립보드 붙여넣기(Ctrl+V) 지원 • 다중 인물, 단체 사진,
                신분증/영수증
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                사진 선택하기
              </Button>
            </Card>

            {/* Preset Samples */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                ⚡ 1초 즉석 테스트 샘플 이미지
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 2, display: 'block' }}
              >
                MediaPipe 다중 얼굴 감지 및 OCR 마스킹 성능을 클릭 한 번으로 체험해 보세요.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {SAMPLE_MOSAIC_IMAGES.map((sample) => (
                  <Card
                    key={sample.id}
                    onClick={() => loadSampleImage(sample.url)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={sample.url}
                      alt={sample.label}
                      sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {sample.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {sample.desc} ➜
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Card>
          </Box>
        ) : (
          /* Active Editing Workspace */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Canvas Area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    flexWrap: 'wrap',
                    gap: 1,
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
                    height: { xs: 360, sm: 520 },
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
                      }}
                    >
                      <CircularProgress size={44} thickness={4} color="primary" />
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
                        {scanActionName || 'AI 비전 분석 중...'}
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
                    }}
                  />
                </Box>
              </Card>
            </Box>

            {/* Right: Controls & AI Tools */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* 1. MediaPipe Vision AI Actions */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    1. MediaPipe AI 원클릭 비식별화
                  </Typography>
                  <Chip
                    label="GPU AI"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
                  {/* Full Face */}
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAutoDetectFaces}
                    disabled={isScanning}
                    startIcon={<AutoAwesomeRoundedIcon />}
                    sx={{ py: 1.1, fontWeight: 700, borderRadius: 2 }}
                  >
                    AI 얼굴 전체 자동 모자이크
                  </Button>

                  {/* Eye-bar Censor */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      onClick={() => handleAutoEyeBar('black')}
                      disabled={isScanning}
                      startIcon={<VisibilityOffRoundedIcon />}
                      sx={{ py: 1, fontWeight: 700, borderRadius: 2 }}
                    >
                      눈 가림 블랙 바
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      onClick={() => handleAutoEyeBar('blur')}
                      disabled={isScanning}
                      startIcon={<BlurOnRoundedIcon />}
                      sx={{ py: 1, fontWeight: 700, borderRadius: 2 }}
                    >
                      눈 가림 블러 바
                    </Button>
                  </Box>

                  {/* OCR Sensitive Info */}
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleAutoDetectSensitive}
                    disabled={isScanning}
                    startIcon={<DocumentScannerRoundedIcon />}
                    sx={{ py: 1, fontWeight: 700, borderRadius: 2 }}
                  >
                    OCR 개인정보(주민/계좌/전화) 가리기
                  </Button>
                </Box>

                {/* Emoji Sticker Masking */}
                <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      얼굴 이모지 스티커 자동 부착
                    </Typography>
                    <Button
                      size="small"
                      variant="soft"
                      color="warning"
                      onClick={() => handleAutoEmojiMask(selectedEmoji)}
                      disabled={isScanning}
                      startIcon={<SentimentSatisfiedAltRoundedIcon />}
                      sx={{ fontWeight: 700, py: 0.4 }}
                    >
                      {selectedEmoji} 스티커 부착
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {EMOJI_STICKER_OPTIONS.map((em) => (
                      <Tooltip key={em.id} title={em.label}>
                        <Button
                          variant={selectedEmoji === em.emoji ? 'contained' : 'outlined'}
                          color={selectedEmoji === em.emoji ? 'primary' : 'inherit'}
                          size="small"
                          onClick={() => {
                            setSelectedEmoji(em.emoji);
                            handleAutoEmojiMask(em.emoji);
                          }}
                          sx={{ minWidth: 38, px: 1, py: 0.5, fontSize: '1.1rem' }}
                        >
                          {em.emoji}
                        </Button>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Card>

              {/* 2. Manual Tools & Mode Setting */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  2. 수동 마스킹 도구 & 효과
                </Typography>

                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}>
                  모자이크 효과 형태
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
                  <ToggleButton value="blackout">블랙아웃</ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}>
                  그리기 도구
                </Typography>
                <ToggleButtonGroup
                  value={tool}
                  exclusive
                  onChange={(_, v) => v && setTool(v)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="brush">
                    <BrushRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 브러시
                  </ToggleButton>
                  <ToggleButton value="rect">
                    <CropSquareRoundedIcon sx={{ mr: 0.5, fontSize: 18 }} /> 사각형 드래그
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Sliders */}
                <Box sx={{ mb: 1.5 }}>
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

              {/* 3. Export & Actions */}
              <Card
                sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  3. 저장 및 내보내기
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSave}
                  disabled={isProcessing}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  sx={{ py: 1.3, fontWeight: 800, borderRadius: 2 }}
                >
                  보호된 사진 저장 (PNG)
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={handleCopyClipboard}
                    disabled={isProcessing}
                    startIcon={<ContentCopyRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    클립보드 복사
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleShare}
                    disabled={isProcessing}
                    startIcon={<ShareRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    카카오 공유
                  </Button>
                </Box>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
