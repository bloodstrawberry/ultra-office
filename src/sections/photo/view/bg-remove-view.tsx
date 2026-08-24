'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GradientRoundedIcon from '@mui/icons-material/GradientRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  BG_REMOVE_MODELS,
  applyBrushStroke,
  removeBackground,
  type BgStyleType,
  checkWebGPUSupport,
  type BgProgressInfo,
  type BgRemoveResult,
  renderCompositeImage,
  renderSplitCompositeImage,
} from '../utils/ai-bg-remove';

// ----------------------------------------------------------------------
// Preset Samples for Instant 1-Click Testing
// ----------------------------------------------------------------------

const SAMPLE_IMAGES = [
  {
    id: 'person',
    label: '👤 인물 프로필',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sneaker',
    label: '👟 e-커머스 상품',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'pet',
    label: '🐱 반려동물',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
];

const GRADIENT_PRESETS = [
  { id: 'sunset', label: '석양 (Sunset)', color: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'ocean', label: '오션 (Ocean)', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'cyber', label: '사이버 (Cyber)', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  {
    id: 'emerald',
    label: '에메랄드 (Emerald)',
    color: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  { id: 'warm-studio', label: '웜 스튜디오', color: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
  { id: 'dark-studio', label: '다크 스튜디오', color: 'linear-gradient(135deg, #2e384d, #111827)' },
];

const SOLID_COLORS = [
  { label: '화이트', hex: '#FFFFFF' },
  { label: '스튜디오 그레이', hex: '#F1F5F9' },
  { label: '블랙', hex: '#111827' },
  { label: '파스텔 핑크', hex: '#FCE7F3' },
  { label: '스카이 블루', hex: '#E0F2FE' },
  { label: '민트 그린', hex: '#D1FAE5' },
  { label: '소프트 옐로우', hex: '#FEF3C7' },
];

// ----------------------------------------------------------------------

export function BgRemoveView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('briaai/RMBG-1.4');
  const [gpuStatus, setGpuStatus] = useState<{ supported: boolean; message: string }>({
    supported: false,
    message: '하드웨어 상태 확인 중...',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<BgProgressInfo>({
    status: 'idle',
    text: '',
    progress: 0,
  });

  const [result, setResult] = useState<BgRemoveResult | null>(null);

  // Background Customization State
  const [bgStyle, setBgStyle] = useState<BgStyleType>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [gradientPreset, setGradientPreset] = useState<string>('sunset');
  const [blurAmount, setBlurAmount] = useState<number>(20);

  // Preview Mode
  const [previewMode, setPreviewMode] = useState<'split' | 'single' | 'mask'>('split');
  const [splitOrientation, setSplitOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [splitStart, setSplitStart] = useState<number>(0); // left/top percentage (0 - 100)
  const [splitEnd, setSplitEnd] = useState<number>(50); // right/bottom percentage (0 - 100)
  const [splitMode, setSplitMode] = useState<'inside' | 'outside'>('inside'); // 'inside' (중앙 투명) or 'outside' (양끝 투명)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const draggingSplitRef = useRef<'start' | 'end' | null>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Touch-up State
  const [isTouchupMode, setIsTouchupMode] = useState<boolean>(false);
  const [brushTool, setBrushTool] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState<number>(20);
  const [touchupVersion, setTouchupVersion] = useState<number>(0);
  const [undoCount, setUndoCount] = useState<number>(0);

  // Touch-up Refs (non-reactive for performance)
  const touchupCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef<boolean>(false);
  const touchupTransformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const originalFgDataRef = useRef<ImageData | null>(null); // AI's original output for restore brush
  const undoStackRef = useRef<ImageData[]>([]);
  const lastPointRef = useRef<{ ix: number; iy: number } | null>(null);
  const rafIdRef = useRef<number>(0);
  const cursorPosRef = useRef({ x: -1, y: -1 }); // screen-space cursor for drawing

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

  // Check WebGPU on mount (Hydration safe)
  useEffect(() => {
    checkWebGPUSupport().then(setGpuStatus);
  }, []);

  // Process File
  const handleProcessImage = useCallback(
    async (src: string, modelId: string = selectedModel) => {
      setImageSrc(src);
      setIsLoading(true);
      setResult(null);
      setIsTouchupMode(false);
      undoStackRef.current = [];
      setUndoCount(0);
      lastPointRef.current = null;

      try {
        const res = await removeBackground(src, modelId, (p) => {
          setProgressInfo(p);
        });
        setResult(res);
        // Save the AI's original foreground pixels for the restore brush
        const fgCtx = res.foregroundCanvas.getContext('2d');
        if (fgCtx) {
          originalFgDataRef.current = fgCtx.getImageData(
            0,
            0,
            res.foregroundCanvas.width,
            res.foregroundCanvas.height
          );
        }
        toast.success('AI 배경 분리가 완료되었습니다!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`배경 분리 중 오류가 발생했습니다: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedModel]
  );

  // Drop & Paste Hook
  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          handleProcessImage(src);
        };
        reader.readAsDataURL(files[0]);
      }
    },
    multiple: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      handleProcessImage(src);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Split Slider Mouse/Touch Handlers (Dual: Start & End, Horizontal & Vertical)
  const handleSplitMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!splitContainerRef.current || !draggingSplitRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      let percent = 0;
      if (splitOrientation === 'horizontal') {
        const x = clientX - rect.left;
        percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      } else {
        const y = clientY - rect.top;
        percent = Math.min(Math.max((y / rect.height) * 100, 0), 100);
      }

      if (draggingSplitRef.current === 'start') {
        setSplitStart((prev) => Math.min(percent, splitEnd));
      } else if (draggingSplitRef.current === 'end') {
        setSplitEnd((prev) => Math.max(percent, splitStart));
      }
    },
    [splitOrientation, splitStart, splitEnd]
  );

  const handleStartSplitDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingSplitRef.current = 'start';
  };

  const handleEndSplitDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingSplitRef.current = 'end';
  };

  useEffect(() => {
    const handleMouseUp = () => {
      draggingSplitRef.current = null;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingSplitRef.current) {
        handleSplitMove(e.clientX, e.clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (draggingSplitRef.current && e.touches[0]) {
        handleSplitMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleSplitMove]);

  // ---------- Touch-up Canvas Rendering ----------

  const redrawTouchupCanvas = useCallback(() => {
    const canvas = touchupCanvasRef.current;
    const container = splitContainerRef.current;
    if (!canvas || !container || !result) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Checkerboard background
    const tile = 10;
    for (let y = 0; y < ch; y += tile) {
      for (let x = 0; x < cw; x += tile) {
        ctx.fillStyle =
          (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0 ? '#f1f5f9' : '#cbd5e1';
        ctx.fillRect(x, y, tile, tile);
      }
    }

    // Fit image into container (object-fit: contain)
    const iw = result.foregroundCanvas.width;
    const ih = result.foregroundCanvas.height;
    const scale = Math.min(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;
    touchupTransformRef.current = { scale, offsetX: ox, offsetY: oy };

    ctx.drawImage(result.foregroundCanvas, ox, oy, dw, dh);

    // Draw brush cursor
    const { x: cx, y: cy } = cursorPosRef.current;
    if (cx >= 0 && cy >= 0) {
      const r = brushSize * scale;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = brushTool === 'erase' ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [result, brushSize, brushTool]);

  // Redraw canvas on enter / exit / result change
  useEffect(() => {
    if (!isTouchupMode || !result) return;

    redrawTouchupCanvas();

    // Observe container resizes
    const container = splitContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(redrawTouchupCanvas);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [isTouchupMode, result, redrawTouchupCanvas, touchupVersion]);

  // ---------- Touch-up Pointer Handlers ----------

  const screenToImage = useCallback((e: React.PointerEvent): { ix: number; iy: number } | null => {
    const canvas = touchupCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { scale, offsetX, offsetY } = touchupTransformRef.current;
    return { ix: (sx - offsetX) / scale, iy: (sy - offsetY) / scale };
  }, []);

  const handleTouchupPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!result) return;
      isPaintingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Push undo snapshot (limit 10)
      const fgCtx = result.foregroundCanvas.getContext('2d');
      if (fgCtx) {
        const snap = fgCtx.getImageData(
          0,
          0,
          result.foregroundCanvas.width,
          result.foregroundCanvas.height
        );
        undoStackRef.current = [...undoStackRef.current.slice(-9), snap];
        setUndoCount(undoStackRef.current.length);
      }

      const pt = screenToImage(e);
      if (pt) {
        lastPointRef.current = pt;
        applyBrushStroke(
          result.foregroundCanvas,
          pt.ix,
          pt.iy,
          brushSize,
          brushTool,
          brushTool === 'restore' ? (originalFgDataRef.current ?? undefined) : undefined
        );
        redrawTouchupCanvas();
      }
    },
    [result, brushSize, brushTool, screenToImage, redrawTouchupCanvas]
  );

  const handleTouchupPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Always track cursor pos for circle overlay
      const canvas = touchupCanvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        cursorPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      if (isPaintingRef.current && result) {
        const pt = screenToImage(e);
        if (pt) {
          if (lastPointRef.current) {
            const dx = pt.ix - lastPointRef.current.ix;
            const dy = pt.iy - lastPointRef.current.iy;
            const dist = Math.hypot(dx, dy);
            const step = Math.max(1, brushSize * 0.25);
            const steps = Math.ceil(dist / step);
            for (let s = 1; s <= steps; s += 1) {
              const t = s / steps;
              const curX = lastPointRef.current.ix + dx * t;
              const curY = lastPointRef.current.iy + dy * t;
              applyBrushStroke(
                result.foregroundCanvas,
                curX,
                curY,
                brushSize,
                brushTool,
                brushTool === 'restore' ? (originalFgDataRef.current ?? undefined) : undefined
              );
            }
          } else {
            applyBrushStroke(
              result.foregroundCanvas,
              pt.ix,
              pt.iy,
              brushSize,
              brushTool,
              brushTool === 'restore' ? (originalFgDataRef.current ?? undefined) : undefined
            );
          }
          lastPointRef.current = pt;
        }
      }

      // Throttle redraws with rAF
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(redrawTouchupCanvas);
    },
    [result, brushSize, brushTool, screenToImage, redrawTouchupCanvas]
  );

  const handleTouchupPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      lastPointRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      // Commit canvas state to result so preview / download reflect edits
      if (result) {
        const newDataUrl = result.foregroundCanvas.toDataURL('image/png');
        setResult({ ...result, resultDataUrl: newDataUrl });
        setTouchupVersion((v) => v + 1);
        setUndoCount(undoStackRef.current.length);
      }
    },
    [result]
  );

  const handleTouchupPointerLeave = useCallback(() => {
    cursorPosRef.current = { x: -1, y: -1 };
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(redrawTouchupCanvas);
  }, [redrawTouchupCanvas]);

  // Undo last stroke
  const handleTouchupUndo = useCallback(() => {
    if (!result || undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    if (prev) {
      const fgCtx = result.foregroundCanvas.getContext('2d');
      if (fgCtx) fgCtx.putImageData(prev, 0, 0);
      const newDataUrl = result.foregroundCanvas.toDataURL('image/png');
      setResult({ ...result, resultDataUrl: newDataUrl });
      setTouchupVersion((v) => v + 1);
      setUndoCount(undoStackRef.current.length);
      toast.success('마지막 브러시 스트로크를 취소했습니다.');
    }
  }, [result]);

  // Keyboard Shortcut: Ctrl + Z (or Cmd + Z) for Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        if (undoStackRef.current.length > 0) {
          e.preventDefault();
          handleTouchupUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTouchupUndo]);

  // ---------- Display Computed Values ----------

  // Current display image URL based on selected bgStyle

  const currentRenderedUrl = React.useMemo(() => {
    if (!result) return '';
    if (bgStyle === 'transparent') {
      return result.foregroundCanvas.toDataURL('image/png');
    }
    return renderCompositeImage(
      result.foregroundCanvas,
      result.originalImage,
      {
        style: bgStyle,
        solidColor,
        gradientPreset,
        blurAmount,
      },
      'image/png'
    );
    // touchupVersion triggers recalculation after brush edits
  }, [result, bgStyle, solidColor, gradientPreset, blurAmount, touchupVersion]);

  // Download Handler
  const handleDownload = (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    if (!result) return;
    const mimeType =
      format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    let exportUrl = '';

    if (previewMode === 'split') {
      exportUrl = renderSplitCompositeImage(
        result,
        splitStart,
        splitEnd,
        {
          style: bgStyle,
          solidColor,
          gradientPreset,
          blurAmount,
        },
        splitMode,
        splitOrientation,
        mimeType
      );
    } else if (previewMode === 'mask') {
      exportUrl = result.maskDataUrl;
    } else if (bgStyle === 'transparent' && format === 'png') {
      exportUrl = result.foregroundCanvas.toDataURL('image/png');
    } else {
      exportUrl = renderCompositeImage(
        result.foregroundCanvas,
        result.originalImage,
        {
          style: bgStyle,
          solidColor,
          gradientPreset,
          blurAmount,
        },
        mimeType
      );
    }

    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = `ai_bg_${previewMode === 'split' ? 'split_' : ''}${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      previewMode === 'split'
        ? '슬라이더 비교 상태(투명 영역 반영)로 이미지가 다운로드되었습니다.'
        : '이미지가 다운로드되었습니다.'
    );
  };

  // Copy PNG to Clipboard
  const handleCopyClipboard = async () => {
    if (!result) return;
    try {
      let exportUrl = '';
      if (previewMode === 'split') {
        exportUrl = renderSplitCompositeImage(
          result,
          splitStart,
          splitEnd,
          {
            style: bgStyle,
            solidColor,
            gradientPreset,
            blurAmount,
          },
          splitMode,
          splitOrientation,
          'image/png'
        );
      } else if (previewMode === 'mask') {
        exportUrl = result.maskDataUrl;
      } else if (bgStyle === 'transparent') {
        exportUrl = result.foregroundCanvas.toDataURL('image/png');
      } else {
        exportUrl = renderCompositeImage(
          result.foregroundCanvas,
          result.originalImage,
          {
            style: bgStyle,
            solidColor,
            gradientPreset,
            blurAmount,
          },
          'image/png'
        );
      }

      const response = await fetch(exportUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      toast.success(
        previewMode === 'split'
          ? '슬라이더 비교 상태의 PNG 이미지가 클립보드에 복사되었습니다!'
          : '클립보드에 PNG 이미지가 복사되었습니다!'
      );
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
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
              AI 배경 제거 (누끼 따기)
            </Typography>
            <Chip
              label="100% 클라이언트 로컬 AI"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            서버 전송 없이 브라우저 WebGPU 가속으로 인물, 헤어라인, 복잡한 사물 배경을 정밀
            분리합니다.
          </Typography>
        </Box>

        {/* Hardware acceleration badge */}
        <Tooltip title={gpuStatus.message}>
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label={gpuStatus.supported ? 'WebGPU ⚡ 하드웨어 가속' : 'WASM CPU 모드'}
            color={gpuStatus.supported ? 'success' : 'default'}
            variant="soft"
            sx={{ fontWeight: 700 }}
          />
        </Tooltip>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!imageSrc ? (
          /* Empty / Upload State */
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              flex: '1 1 auto',
              minHeight: 0,
            }}
          >
            {/* 1-Click Instant Sample Test — pinned to top */}
            <Card sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                ⚡ 즉석 테스트 샘플 이미지
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 2, display: 'block' }}
              >
                클릭 한 번으로 AI 누끼 성능을 즉시 테스트해 보세요.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {SAMPLE_IMAGES.map((sample) => (
                  <Card
                    key={sample.id}
                    onClick={() => handleProcessImage(sample.url)}
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
                        누끼 실행 ➜
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Card>

            {/* Upload Area — fills remaining height */}
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
                flex: '1 1 auto',
                minHeight: 200,
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
                <InvertColorsRoundedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                이미지 업로드
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'center' }}
              >
                이미지를 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요.
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
          </Box>
        ) : (
          /* Active Processing / Result Workspace */
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
            {/* Left: Viewport Area */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 0px',
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                pr: { lg: 1.5 },
              }}
            >
              <Card
                sx={{
                  px: { xs: 2, md: 4 },
                  py: 2.5,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                }}
              >
                {/* Top View Mode Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <ToggleButtonGroup
                      value={isTouchupMode ? 'single' : previewMode}
                      exclusive
                      onChange={(_, v) => {
                        if (v && !isTouchupMode) setPreviewMode(v);
                      }}
                      size="small"
                      disabled={isTouchupMode}
                      sx={{
                        '& .MuiToggleButtonGroup-grouped': {
                          px: 2,
                          py: 0.75,
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        },
                      }}
                    >
                      <ToggleButton value="split">
                        <CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />
                        Before/After 비교 슬라이더
                      </ToggleButton>
                      <ToggleButton value="single">
                        <ViewStreamRoundedIcon sx={{ fontSize: 18 }} />
                        결과물 보기
                      </ToggleButton>
                      <ToggleButton value="mask">
                        <BlurOnRoundedIcon sx={{ fontSize: 18 }} />
                        알파 마스크 보기
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Split Orientation & Direction Mode Toggles */}
                    {previewMode === 'split' && !isTouchupMode && (
                      <>
                        {/* Orientation Toggle */}
                        <ToggleButtonGroup
                          value={splitOrientation}
                          exclusive
                          onChange={(_, v) => v && setSplitOrientation(v)}
                          size="small"
                          sx={{
                            '& .MuiToggleButtonGroup-grouped': {
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            },
                          }}
                        >
                          <ToggleButton value="horizontal">
                            <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
                            좌우
                          </ToggleButton>
                          <ToggleButton value="vertical">
                            <SwapVertRoundedIcon sx={{ fontSize: 16 }} />
                            상하
                          </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Direction Toggle */}
                        <ToggleButtonGroup
                          value={splitMode}
                          exclusive
                          onChange={(_, v) => v && setSplitMode(v)}
                          size="small"
                          sx={{
                            '& .MuiToggleButtonGroup-grouped': {
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            },
                          }}
                        >
                          <ToggleButton value="inside">
                            {splitOrientation === 'horizontal'
                              ? '→ [중앙 투명] ←'
                              : '↓ [중앙 투명] ↑'}
                          </ToggleButton>
                          <ToggleButton value="outside">
                            {splitOrientation === 'horizontal'
                              ? '← [양끝 투명] →'
                              : '↑ [상하 투명] ↓'}
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.8 }}>
                    {/* Touch-up Mode Toggle */}
                    <Button
                      variant={isTouchupMode ? 'contained' : 'outlined'}
                      size="small"
                      color={isTouchupMode ? 'warning' : 'inherit'}
                      onClick={() => {
                        setIsTouchupMode((prev) => !prev);
                        if (!isTouchupMode) setPreviewMode('single');
                      }}
                      disabled={!result || isLoading}
                      startIcon={<EditRoundedIcon />}
                    >
                      {isTouchupMode ? '터치업 종료' : '수동 터치업'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setImageSrc('');
                        setResult(null);
                        setIsTouchupMode(false);
                        undoStackRef.current = [];
                        setUndoCount(0);
                        lastPointRef.current = null;
                      }}
                      startIcon={<RefreshRoundedIcon />}
                    >
                      다른 사진
                    </Button>
                  </Box>
                </Box>

                {/* Viewport Canvas Container */}
                <Box
                  ref={splitContainerRef}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    flex: '1 1 auto',
                    minHeight: 0,
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isTouchupMode
                      ? 'none'
                      : bgStyle === 'transparent' || previewMode === 'split'
                        ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 20px 20px'
                        : 'background.neutral',
                  }}
                >
                  {/* Touch-up Interactive Canvas */}
                  {isTouchupMode && result && !isLoading ? (
                    <canvas
                      ref={touchupCanvasRef}
                      onPointerDown={handleTouchupPointerDown}
                      onPointerMove={handleTouchupPointerMove}
                      onPointerUp={handleTouchupPointerUp}
                      onPointerLeave={handleTouchupPointerLeave}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'none',
                        touchAction: 'none',
                      }}
                    />
                  ) : isLoading ? (
                    /* Loading / Progress State */
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        maxWidth: 420,
                      }}
                    >
                      <CircularProgress size={48} thickness={4} color="primary" />
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {progressInfo.text || 'AI 배경 제거 처리 중...'}
                        </Typography>
                        <LinearProgress
                          variant={progressInfo.progress > 0 ? 'determinate' : 'indeterminate'}
                          value={progressInfo.progress * 100}
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          최초 1회 모델 가중치를 로드한 후에는 캐시되어 즉시 처리됩니다.
                        </Typography>
                      </Box>
                    </Box>
                  ) : result ? (
                    previewMode === 'split' ? (
                      /* Interactive Dual Split Slider (Horizontal / Vertical with Inside/Outside Modes) */
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* Background Layer: Edited Result (Cutout / Transparent) */}
                        <Box
                          component="img"
                          src={currentRenderedUrl}
                          alt="AI Result"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />

                        {/* Floating Mode Toggle Pill on Canvas */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 12,
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            border: '1.5px solid',
                            borderColor: 'primary.main',
                            borderRadius: 20,
                            px: 1.5,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            boxShadow: 3,
                            userSelect: 'none',
                          }}
                        >
                          <Box
                            onClick={() =>
                              setSplitOrientation((prev) =>
                                prev === 'horizontal' ? 'vertical' : 'horizontal'
                              )
                            }
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'pointer',
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            {splitOrientation === 'horizontal' ? (
                              <SwapHorizRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            ) : (
                              <SwapVertRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            )}
                            <Typography variant="caption" sx={{ fontWeight: 800 }}>
                              {splitOrientation === 'horizontal'
                                ? '↔ 가로(좌우)'
                                : '↕ 세로(상하)'}
                            </Typography>
                          </Box>

                          <Box
                            onClick={() =>
                              setSplitMode((prev) => (prev === 'inside' ? 'outside' : 'inside'))
                            }
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'pointer',
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                            >
                              {splitOrientation === 'horizontal'
                                ? splitMode === 'inside'
                                  ? '→ [중앙 투명] ←'
                                  : '← [양끝 투명] →'
                                : splitMode === 'inside'
                                  ? '↓ [중앙 투명] ↑'
                                  : '↑ [상하 투명] ↓'}
                            </Typography>
                            <Chip
                              label="방향 전환"
                              size="small"
                              color="primary"
                              variant="filled"
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                          </Box>
                        </Box>

                        {/* Foreground Layer(s): Original Image */}
                        {splitOrientation === 'horizontal' ? (
                          splitMode === 'inside' ? (
                            <>
                              {/* Horizontal Inside: Left (0 to splitStart%) */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  overflow: 'hidden',
                                  clipPath: `polygon(0 0, ${splitStart}% 0, ${splitStart}% 100%, 0 100%)`,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={imageSrc}
                                  alt="Original Left"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Horizontal Inside: Right (splitEnd% to 100%) */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  overflow: 'hidden',
                                  clipPath: `polygon(${splitEnd}% 0, 100% 0, 100% 100%, ${splitEnd}% 100%)`,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={imageSrc}
                                  alt="Original Right"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>
                            </>
                          ) : (
                            /* Horizontal Outside: Center (splitStart% to splitEnd%) */
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                clipPath: `polygon(${splitStart}% 0, ${splitEnd}% 0, ${splitEnd}% 100%, ${splitStart}% 100%)`,
                              }}
                            >
                              <Box
                                component="img"
                                src={imageSrc}
                                alt="Original Center"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>
                          )
                        ) : splitMode === 'inside' ? (
                          <>
                            {/* Vertical Inside: Top (0 to splitStart%) */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                clipPath: `polygon(0 0, 100% 0, 100% ${splitStart}%, 0 ${splitStart}%)`,
                              }}
                            >
                              <Box
                                component="img"
                                src={imageSrc}
                                alt="Original Top"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>

                            {/* Vertical Inside: Bottom (splitEnd% to 100%) */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                clipPath: `polygon(0 ${splitEnd}%, 100% ${splitEnd}%, 100% 100%, 0 100%)`,
                              }}
                            >
                              <Box
                                component="img"
                                src={imageSrc}
                                alt="Original Bottom"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>
                          </>
                        ) : (
                          /* Vertical Outside: Middle (splitStart% to splitEnd%) */
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden',
                              clipPath: `polygon(0 ${splitStart}%, 100% ${splitStart}%, 100% ${splitEnd}%, 0 ${splitEnd}%)`,
                            }}
                          >
                            <Box
                              component="img"
                              src={imageSrc}
                              alt="Original Middle"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          </Box>
                        )}

                        {/* Divider Line & Handle 1: Start (Left in Horizontal, Top in Vertical) */}
                        <Box
                          onMouseDown={handleStartSplitDown}
                          onTouchStart={handleStartSplitDown}
                          sx={
                            splitOrientation === 'horizontal'
                              ? {
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: `${splitStart}%`,
                                  width: 3,
                                  bgcolor: '#3b82f6',
                                  boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                                  cursor: 'ew-resize',
                                  zIndex: 10,
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }
                              : {
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  top: `${splitStart}%`,
                                  height: 3,
                                  bgcolor: '#3b82f6',
                                  boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                                  cursor: 'ns-resize',
                                  zIndex: 10,
                                  transform: 'translateY(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }
                          }
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: '#3b82f6',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 3,
                              border: '2px solid #ffffff',
                              userSelect: 'none',
                            }}
                          >
                            <CompareArrowsRoundedIcon
                              sx={{
                                fontSize: 18,
                                transform:
                                  splitOrientation === 'vertical' ? 'rotate(90deg)' : 'none',
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              ...(splitOrientation === 'horizontal' ? { top: 48 } : { left: 16 }),
                              bgcolor: 'primary.darker',
                              color: '#ffffff',
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              boxShadow: 2,
                              pointerEvents: 'none',
                            }}
                          >
                            {splitOrientation === 'horizontal'
                              ? splitMode === 'inside'
                                ? `좌측 원본 ${Math.round(splitStart)}%`
                                : `좌측 투명 ${Math.round(splitStart)}%`
                              : splitMode === 'inside'
                                ? `상단 원본 ${Math.round(splitStart)}%`
                                : `상단 투명 ${Math.round(splitStart)}%`}
                          </Box>
                        </Box>

                        {/* Divider Line & Handle 2: End (Right in Horizontal, Bottom in Vertical) */}
                        <Box
                          onMouseDown={handleEndSplitDown}
                          onTouchStart={handleEndSplitDown}
                          sx={
                            splitOrientation === 'horizontal'
                              ? {
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: `${splitEnd}%`,
                                  width: 3,
                                  bgcolor: '#ffffff',
                                  boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                                  cursor: 'ew-resize',
                                  zIndex: 10,
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }
                              : {
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  top: `${splitEnd}%`,
                                  height: 3,
                                  bgcolor: '#ffffff',
                                  boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                                  cursor: 'ns-resize',
                                  zIndex: 10,
                                  transform: 'translateY(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }
                          }
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 3,
                              border: '2px solid #ffffff',
                              userSelect: 'none',
                            }}
                          >
                            <CompareArrowsRoundedIcon
                              sx={{
                                fontSize: 18,
                                transform:
                                  splitOrientation === 'vertical' ? 'rotate(90deg)' : 'none',
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              ...(splitOrientation === 'horizontal'
                                ? { bottom: 12 }
                                : { right: 16 }),
                              bgcolor: 'grey.800',
                              color: '#ffffff',
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              boxShadow: 2,
                              pointerEvents: 'none',
                            }}
                          >
                            {splitOrientation === 'horizontal'
                              ? splitMode === 'inside'
                                ? `우측 원본 ${Math.round(splitEnd)}%`
                                : `우측 투명 ${Math.round(splitEnd)}%`
                              : splitMode === 'inside'
                                ? `하단 원본 ${Math.round(splitEnd)}%`
                                : `하단 투명 ${Math.round(splitEnd)}%`}
                          </Box>
                        </Box>
                      </Box>
                    ) : previewMode === 'mask' ? (
                      /* Mask Only Mode */
                      <Box
                        component="img"
                        src={result.maskDataUrl}
                        alt="Alpha Mask"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      /* Single Result View Mode */
                      <Box
                        component="img"
                        src={currentRenderedUrl}
                        alt="AI Cutout"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    )
                  ) : null}
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

            {/* Right: Sidebar Control Panel */}
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
                pl: { lg: 1.5 },
              }}
            >
              {/* Model & AI Settings Card */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  1. AI 누끼 모델 선택
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel id="ai-model-select-label">AI 모델</InputLabel>
                  <Select
                    labelId="ai-model-select-label"
                    value={selectedModel}
                    label="AI 모델"
                    onChange={(e) => {
                      const newModel = e.target.value;
                      setSelectedModel(newModel);
                      if (imageSrc) handleProcessImage(imageSrc, newModel);
                    }}
                    disabled={isLoading}
                  >
                    {BG_REMOVE_MODELS.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {m.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={m.size}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {result && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    fullWidth
                    onClick={() => handleProcessImage(imageSrc, selectedModel)}
                    disabled={isLoading}
                    startIcon={<AutoAwesomeRoundedIcon />}
                    sx={{ mt: 1.5, borderRadius: 2 }}
                  >
                    선택한 모델로 다시 누끼 따기
                  </Button>
                )}
              </Card>

              {/* Manual Touch-up Brush Settings Card */}
              {isTouchupMode && (
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'warning.main',
                    bgcolor: 'warning.lighter',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <EditRoundedIcon sx={{ fontSize: 20, color: 'warning.dark' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      수동 터치업 브러시
                    </Typography>
                  </Box>

                  {/* Tool Selector */}
                  <ToggleButtonGroup
                    value={brushTool}
                    exclusive
                    onChange={(_, v) => v && setBrushTool(v)}
                    size="small"
                    sx={{
                      mb: 2,
                      display: 'grid',
                      gridTemplateColumns:
                        rightPanelWidth < 350 ? '1fr' : { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 1,
                      '& .MuiToggleButtonGroup-grouped': {
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px !important',
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                          bgcolor: 'warning.lighter',
                          color: 'warning.darker',
                          borderColor: 'warning.main',
                          fontWeight: 700,
                        },
                      },
                    }}
                  >
                    <ToggleButton value="erase">🧹 지우기 (배경 제거)</ToggleButton>
                    <ToggleButton value="restore">✨ 복원 (원래대로)</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Brush Size */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        브러시 크기
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                        {brushSize}px
                      </Typography>
                    </Box>
                    <Slider
                      value={brushSize}
                      min={3}
                      max={100}
                      onChange={(_, v) => setBrushSize(v as number)}
                      color="warning"
                    />
                  </Box>

                  {/* Undo & Complete Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={handleTouchupUndo}
                      disabled={undoCount === 0}
                      startIcon={<UndoRoundedIcon />}
                      sx={{ borderRadius: 2, fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      실행 취소 (Ctrl+Z) {undoCount > 0 ? `(${undoCount})` : ''}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => setIsTouchupMode(false)}
                      startIcon={<CheckRoundedIcon />}
                      sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      완료
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Background Customizer Card */}
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  2. 배경 스타일 지정
                </Typography>

                {/* Style Selector Tabs */}
                <ToggleButtonGroup
                  value={bgStyle}
                  exclusive
                  onChange={(_, v) => v && setBgStyle(v)}
                  size="small"
                  sx={{
                    mb: 2,
                    display: 'grid',
                    gridTemplateColumns:
                      rightPanelWidth < 400
                        ? 'repeat(2, 1fr)'
                        : { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px !important',
                      whiteSpace: 'nowrap',
                      px: 1,
                      py: 0.8,
                      '&.Mui-selected': {
                        bgcolor: 'primary.lighter',
                        color: 'primary.darker',
                        borderColor: 'primary.main',
                        fontWeight: 700,
                      },
                    },
                  }}
                >
                  <ToggleButton value="transparent">
                    <InvertColorsRoundedIcon sx={{ fontSize: 18, mr: 0.5, flexShrink: 0 }} /> 투명
                  </ToggleButton>
                  <ToggleButton value="solid">
                    <ColorLensRoundedIcon sx={{ fontSize: 18, mr: 0.5, flexShrink: 0 }} /> 단색
                  </ToggleButton>
                  <ToggleButton value="gradient">
                    <GradientRoundedIcon sx={{ fontSize: 18, mr: 0.5, flexShrink: 0 }} /> 그라디언트
                  </ToggleButton>
                  <ToggleButton value="blur">
                    <BlurOnRoundedIcon sx={{ fontSize: 18, mr: 0.5, flexShrink: 0 }} /> 원본블러
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Solid Color Options */}
                {bgStyle === 'solid' && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      {SOLID_COLORS.map((c) => (
                        <Box
                          key={c.hex}
                          onClick={() => setSolidColor(c.hex)}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: c.hex,
                            border: '2px solid',
                            borderColor: solidColor === c.hex ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            transform: solidColor === c.hex ? 'scale(1.15)' : 'none',
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        직접 선택:
                      </Typography>
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        style={{
                          width: 36,
                          height: 28,
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {solidColor}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Gradient Options */}
                {bgStyle === 'gradient' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {GRADIENT_PRESETS.map((g) => (
                      <Box
                        key={g.id}
                        onClick={() => setGradientPreset(g.id)}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          background: g.color,
                          border: '2px solid',
                          borderColor: gradientPreset === g.id ? 'primary.main' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          transform: gradientPreset === g.id ? 'scale(1.03)' : 'none',
                          boxShadow: gradientPreset === g.id ? 2 : 'none',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: g.id.includes('dark') ? '#ffffff' : '#1e293b',
                            textShadow: '0 0 4px rgba(255,255,255,0.4)',
                          }}
                        >
                          {g.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Blur Slider */}
                {bgStyle === 'blur' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        블러 강도
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {blurAmount}px
                      </Typography>
                    </Box>
                    <Slider
                      value={blurAmount}
                      min={4}
                      max={40}
                      onChange={(_, v) => setBlurAmount(v as number)}
                    />
                  </Box>
                )}
              </Card>

              {/* Action & Download Bar */}
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
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleDownload('png')}
                  disabled={!result || isLoading}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 1.4, fontWeight: 700, borderRadius: 2, fontSize: '0.95rem' }}
                >
                  고화질 PNG 다운로드
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={handleCopyClipboard}
                  disabled={!result || isLoading}
                  startIcon={<ContentCopyRoundedIcon />}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                >
                  클립보드 복사
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleDownload('jpeg')}
                  disabled={!result || isLoading}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                >
                  JPG 저장
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
