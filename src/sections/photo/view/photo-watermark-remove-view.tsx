'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import LayersClearRoundedIcon from '@mui/icons-material/LayersClearRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import { PhotoUploadWorkspace, type SampleImageItem } from '../components/photo-upload-workspace';
import {
  getPresetBox,
  type BoundingBox,
  fillSurroundingColor,
  detectCandidateWatermarks,
  sampleMaskSurroundingColor,
  type WatermarkPresetPosition,
} from '../utils/watermark-remover';

// ----------------------------------------------------------------------
// Sample Presets for Instant 1-Click Testing
// ----------------------------------------------------------------------

interface WatermarkSamplePreset extends SampleImageItem {
  defaultPreset: WatermarkPresetPosition;
}

const WATERMARK_SAMPLES: WatermarkSamplePreset[] = [
  {
    id: 'sample-landscape',
    label: '🌄 풍경 사진 작가 워터마크',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '우측 하단 저작권 텍스트',
    tag: '우하단 워터마크',
    defaultPreset: 'bottom-right',
  },
  {
    id: 'sample-document',
    label: '📄 문서 기획서 대외비 스탬프',
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop&q=80',
    subLabel: '중앙 CONFIDENTIAL 각인',
    tag: '중앙 스탬프',
    defaultPreset: 'center',
  },
  {
    id: 'sample-sneaker',
    label: '👟 e-커머스 상품 로고 마크',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    subLabel: '좌측 하단 상품 로고',
    tag: '좌하단 로고',
    defaultPreset: 'bottom-left',
  },
  {
    id: 'sample-profile',
    label: '👤 인물 프로필 타임스탬프',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '우측 상단 날짜 스탬프',
    tag: '우상단 타임스탬프',
    defaultPreset: 'top-right',
  },
];

type ToolType = 'brush' | 'box' | 'eraser';
type ViewMode = 'result' | 'mask' | 'original';

// ----------------------------------------------------------------------

export function PhotoWatermarkRemoveView() {
  // Source and State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('image');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [pendingPreset, setPendingPreset] = useState<WatermarkPresetPosition | null>(null);

  // Surrounding Color Fill Settings (Non-AI)
  const [useAutoColor, setUseAutoColor] = useState<boolean>(true);
  const [detectedColor, setDetectedColor] = useState<string>('#ffffff');
  const [customColor, setCustomColor] = useState<string>('#ffffff');
  const [colorFeather, setColorFeather] = useState<number>(4);

  // Tools & Mask State
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [brushSize, setBrushSize] = useState<number>(32);

  // View State (no split slider)
  const [viewMode, setViewMode] = useState<ViewMode>('mask');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);

  // Export State
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState<number>(92);

  // Canvases references
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null); // Original Image
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Mask layer (Red overlay)
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null); // Inpainted Result
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mask Undo/Redo History
  const [maskHistory, setMaskHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hasResult, setHasResult] = useState<boolean>(false);

  // Interaction tracking for drawing
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const boxStartRef = useRef<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);

  // Sample and update detected surrounding color around current mask
  const updateSurroundingColor = useCallback(() => {
    const mainCanvas = mainCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!mainCanvas || !maskCanvas) return;

    try {
      const sampled = sampleMaskSurroundingColor(mainCanvas, maskCanvas);
      if (sampled && sampled.startsWith('#')) {
        setDetectedColor(sampled);
        setCustomColor((prev) => (useAutoColor ? sampled : prev));
      }
    } catch {
      // Ignore sampling errors
    }
  }, [useAutoColor]);

  // Eyedropper Color Picker
  const handlePickColorEyeDropper = useCallback(async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res?.sRGBHex) {
          setCustomColor(res.sRGBHex);
          setUseAutoColor(false);
          toast.success(`스포이드로 색상(${res.sRGBHex})이 선택되었습니다.`);
        }
      } catch {
        // User cancelled picker
      }
    } else {
      toast.info(
        '스포이드는 크롬/엣지 데스크톱 브라우저에서 지원됩니다. 팔레트에서 색상을 지정해주세요.'
      );
    }
  }, []);

  // Synchronize Loaded Image to Canvases when DOM is ready
  useEffect(() => {
    if (!loadedImage || !mainCanvasRef.current || !maskCanvasRef.current) return;

    const w = loadedImage.naturalWidth || loadedImage.width;
    const h = loadedImage.naturalHeight || loadedImage.height;
    if (w === 0 || h === 0) return;

    // 1. Draw original to main canvas
    const mainCanvas = mainCanvasRef.current;
    mainCanvas.width = w;
    mainCanvas.height = h;
    const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });
    mainCtx?.drawImage(loadedImage, 0, 0, w, h);

    // 2. Setup mask canvas
    const maskCanvas = maskCanvasRef.current;
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (maskCtx) {
      maskCtx.clearRect(0, 0, w, h);

      if (pendingPreset) {
        const box = getPresetBox(w, h, pendingPreset);
        maskCtx.fillStyle = 'rgba(255, 59, 48, 0.75)';
        maskCtx.fillRect(box.x, box.y, box.width, box.height);
        setPendingPreset(null);
      }

      // Record initial mask state
      const initialData = maskCtx.getImageData(0, 0, w, h);
      setMaskHistory([initialData]);
      setHistoryIndex(0);
      updateSurroundingColor();
    }

    // 3. Setup result canvas
    const resCanvas = resultCanvasRef.current;
    if (resCanvas) {
      resCanvas.width = w;
      resCanvas.height = h;
      const resCtx = resCanvas.getContext('2d');
      resCtx?.clearRect(0, 0, w, h);
    }
  }, [loadedImage, pendingPreset, updateSurroundingColor]);

  // Save mask state to history stack
  const saveMaskHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setMaskHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(data);
      if (next.length > 20) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
    updateSurroundingColor();
  }, [historyIndex, updateSurroundingColor]);

  // Restore mask from history
  const undoMask = useCallback(() => {
    if (historyIndex <= 0) return;
    const targetIndex = historyIndex - 1;
    const targetData = maskHistory[targetIndex];
    const maskCanvas = maskCanvasRef.current;
    if (targetData && maskCanvas) {
      const ctx = maskCanvas.getContext('2d');
      ctx?.putImageData(targetData, 0, 0);
      setHistoryIndex(targetIndex);
      setTimeout(updateSurroundingColor, 10);
    }
  }, [historyIndex, maskHistory, updateSurroundingColor]);

  const redoMask = useCallback(() => {
    if (historyIndex >= maskHistory.length - 1) return;
    const targetIndex = historyIndex + 1;
    const targetData = maskHistory[targetIndex];
    const maskCanvas = maskCanvasRef.current;
    if (targetData && maskCanvas) {
      const ctx = maskCanvas.getContext('2d');
      ctx?.putImageData(targetData, 0, 0);
      setHistoryIndex(targetIndex);
      setTimeout(updateSurroundingColor, 10);
    }
  }, [historyIndex, maskHistory, updateSurroundingColor]);

  // Clear Mask
  const handleClearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    ctx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    saveMaskHistory();
    toast.info('마스크 영역이 초기화되었습니다.');
  }, [saveMaskHistory]);

  // Load Image helper
  const loadImage = useCallback(
    (url: string, name: string = 'image', initialPreset?: WatermarkPresetPosition) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setOriginalDimensions({ width: w, height: h });
        setImageName(name.replace(/\.[^/.]+$/, ''));
        setHasResult(false);
        setPendingPreset(initialPreset || null);
        setImageSrc(url);
        setLoadedImage(img);
        setViewMode('mask');
      };
      img.onerror = () => {
        toast.error('이미지를 불러오는데 실패했습니다.');
      };
      img.src = url;
    },
    []
  );

  // File Upload Handler
  const handleFileSelect = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      loadImage(url, file.name);
    },
    [loadImage]
  );

  // Preset Sample Click Handler (Safe fetch as blob to avoid CORS canvas contamination)
  const handleSampleSelect = useCallback(
    async (url: string) => {
      const preset = WATERMARK_SAMPLES.find((s) => s.url === url);
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        loadImage(blobUrl, preset?.label || 'sample', preset?.defaultPreset);
      } catch {
        loadImage(url, preset?.label || 'sample', preset?.defaultPreset);
      }
    },
    [loadImage]
  );

  // Apply Quick Bounding Box Preset
  const handleApplyPresetBox = useCallback(
    (preset: WatermarkPresetPosition) => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas || originalDimensions.width === 0) return;
      const ctx = maskCanvas.getContext('2d');
      if (!ctx) return;

      const box = getPresetBox(originalDimensions.width, originalDimensions.height, preset);
      ctx.fillStyle = 'rgba(255, 59, 48, 0.75)';
      ctx.fillRect(box.x, box.y, box.width, box.height);

      saveMaskHistory();
      toast.success(`'${preset}' 영역에 마스크가 생성되었습니다.`);
    },
    [originalDimensions, saveMaskHistory]
  );

  // Smart Auto Detect Watermarks
  const handleAutoDetect = useCallback(() => {
    const mainCanvas = mainCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!mainCanvas || !maskCanvas) return;

    const mainCtx = mainCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!mainCtx || !maskCtx) return;

    const candidates = detectCandidateWatermarks(
      mainCtx,
      originalDimensions.width,
      originalDimensions.height
    );

    if (candidates.length === 0) {
      toast.info('자동 감지된 텍스트/워터마크 영역이 없습니다. 브러시로 직접 칠해보세요.');
      return;
    }

    const top = candidates[0];
    maskCtx.fillStyle = 'rgba(255, 59, 48, 0.75)';
    maskCtx.fillRect(top.box.x, top.box.y, top.box.width, top.box.height);

    saveMaskHistory();
    toast.success(`✨ ${top.label} 영역이 자동으로 감지되어 마스크가 지정되었습니다.`);
  }, [originalDimensions, saveMaskHistory]);

  // Convert pointer event coordinate to exact canvas pixel coordinate
  const getCanvasPoint = useCallback(
    (
      e: React.PointerEvent<HTMLCanvasElement>
    ): {
      x: number;
      y: number;
    } => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY),
      };
    },
    []
  );

  // Draw brush line on mask
  const drawBrushLine = useCallback(
    (x0: number, y0: number, x1: number, y1: number) => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const ctx = maskCanvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 59, 48, 0.75)';
      }

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
    },
    [brushSize, activeTool]
  );

  // Pointer Events on Mask Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (viewMode === 'result' && hasResult) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);

    if (activeTool === 'box') {
      boxStartRef.current = pt;
      setCurrentBox({ x: pt.x, y: pt.y, width: 0, height: 0 });
    } else {
      lastPointRef.current = pt;
      drawBrushLine(pt.x, pt.y, pt.x, pt.y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getCanvasPoint(e);

    if (activeTool === 'box' && boxStartRef.current) {
      const start = boxStartRef.current;
      const x = Math.min(start.x, pt.x);
      const y = Math.min(start.y, pt.y);
      const width = Math.abs(pt.x - start.x);
      const height = Math.abs(pt.y - start.y);
      setCurrentBox({ x, y, width, height });
    } else if (lastPointRef.current) {
      drawBrushLine(lastPointRef.current.x, lastPointRef.current.y, pt.x, pt.y);
      lastPointRef.current = pt;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activeTool === 'box' && currentBox && currentBox.width > 2 && currentBox.height > 2) {
      const maskCanvas = maskCanvasRef.current;
      const ctx = maskCanvas?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 59, 48, 0.75)';
        ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      }
      setCurrentBox(null);
      boxStartRef.current = null;
    }

    lastPointRef.current = null;
    saveMaskHistory();
  };

  // Perform Watermark Removal (Fill with Surrounding Background Color)
  const handleRunRemoval = useCallback(async () => {
    const mainCanvas = mainCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const resultCanvas = resultCanvasRef.current;

    if (!mainCanvas || !maskCanvas || !resultCanvas) return;

    setIsProcessing(true);
    setProcessProgress(25);

    await new Promise((res) => setTimeout(res, 50));
    setProcessProgress(60);

    try {
      const targetColor = useAutoColor ? detectedColor : customColor;
      const processedCanvas = fillSurroundingColor(mainCanvas, maskCanvas, {
        customColor: targetColor,
        feather: colorFeather,
        opacity: 1,
      });

      setProcessProgress(90);

      resultCanvas.width = processedCanvas.width;
      resultCanvas.height = processedCanvas.height;
      const resCtx = resultCanvas.getContext('2d');
      resCtx?.drawImage(processedCanvas, 0, 0);

      setHasResult(true);
      setViewMode('result');
      toast.success('🎨 주변 배경색으로 워터마크가 깔끔하게 제거되었습니다!');
    } catch {
      toast.error('워터마크 제거 중 문제가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  }, [useAutoColor, detectedColor, customColor, colorFeather]);

  // Multi-pass: Use current result as new base for further touch-ups
  const handleContinueOnResult = useCallback(() => {
    const mainCanvas = mainCanvasRef.current;
    const resultCanvas = resultCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    if (!mainCanvas || !resultCanvas || !maskCanvas || !hasResult) return;

    const mainCtx = mainCanvas.getContext('2d');
    mainCtx?.drawImage(resultCanvas, 0, 0);

    const maskCtx = maskCanvas.getContext('2d');
    maskCtx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    const initialData = maskCtx?.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    if (initialData) {
      setMaskHistory([initialData]);
      setHistoryIndex(0);
    }

    setHasResult(false);
    setViewMode('mask');
    toast.info(
      '현재 결과물이 새 원본으로 지정되었습니다. 추가 워터마크 영역을 칠해 지울 수 있습니다.'
    );
  }, [hasResult]);

  // Export Download
  const handleDownload = useCallback(() => {
    const canvas =
      hasResult && viewMode === 'result' ? resultCanvasRef.current : mainCanvasRef.current;
    if (!canvas) return;

    const mime =
      exportFormat === 'png' ? 'image/png' : exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const quality = exportFormat === 'png' ? undefined : exportQuality / 100;
    const dataUrl = canvas.toDataURL(mime, quality);

    downloadDataUrl(dataUrl, `${imageName}_watermark_removed.${exportFormat}`);
    toast.success('성공적으로 다운로드되었습니다!');
  }, [hasResult, viewMode, exportFormat, exportQuality, imageName]);

  // Copy to Clipboard
  const handleCopyToClipboard = useCallback(async () => {
    const canvas =
      hasResult && viewMode === 'result' ? resultCanvasRef.current : mainCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 이미지가 복사되었습니다!');
      }, 'image/png');
    } catch {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }, [hasResult, viewMode]);

  // KakaoTalk Share
  const handleKakaoShare = useCallback(async () => {
    const canvas =
      hasResult && viewMode === 'result' ? resultCanvasRef.current : mainCanvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await shareToKakaoTalk(dataUrl, '워터마크 제거 이미지', `${imageName}_clean.png`);
      toast.success(res.message);
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
    }
  }, [hasResult, viewMode, imageName]);

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
              워터마크 제거 (Watermark Remover)
            </Typography>
            <Chip
              label="주변 배경색 자동 채우기"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            사진 속 텍스트 워터마크, 날짜 스탬프, 로고를 브러시나 박스로 선택하여 주변 배경과
            자연스럽게 어우러지는 색상으로 흔적 없이 매끄럽게 채워 제거합니다.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {imageSrc && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                setImageSrc(null);
                setLoadedImage(null);
                setHasResult(false);
              }}
            >
              새 이미지
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Workspace */}
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
          /* Empty / Upload View */
          <PhotoUploadWorkspace
            sampleImages={WATERMARK_SAMPLES.map((s) => ({
              id: s.id,
              label: s.label,
              url: s.url,
              subLabel: s.subLabel,
              tag: s.tag,
            }))}
            onSelectSample={handleSampleSelect}
            onFileSelect={handleFileSelect}
            title="워터마크를 제거할 사진을 업로드하세요"
            subtitle="드래그 & 드롭 및 클립보드 붙여넣기(Ctrl+V) 지원 • 고해상도 저작권 각인, 스탬프, 서명, 로고 제거"
            icon={<AutoFixHighRoundedIcon sx={{ fontSize: 36 }} />}
          />
        ) : (
          /* Active Editing Workspace */
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 2,
              flex: '1 1 auto',
              minHeight: 0,
              height: '100%',
            }}
          >
            {/* Left: Canvas Area & Toolbar */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 0px',
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                gap: 1.5,
              }}
            >
              {/* Top Viewport Toolbar */}
              <Card
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  borderRadius: 2,
                }}
              >
                {/* Tool Selection */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
                  >
                    도구:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={activeTool}
                    exclusive
                    onChange={(_, val) => val && setActiveTool(val)}
                  >
                    <ToggleButton value="brush" sx={{ px: 1.2, py: 0.5, gap: 0.5 }}>
                      <BrushRoundedIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        브러시
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="box" sx={{ px: 1.2, py: 0.5, gap: 0.5 }}>
                      <CropSquareRoundedIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        박스 선택
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="eraser" sx={{ px: 1.2, py: 0.5, gap: 0.5 }}>
                      <LayersClearRoundedIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        지우개
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {/* Brush Size Selector (Buttons, No Slider) */}
                  {activeTool !== 'box' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}
                      >
                        크기:
                      </Typography>
                      {[16, 32, 48, 64].map((sz) => (
                        <Button
                          key={sz}
                          size="small"
                          variant={brushSize === sz ? 'contained' : 'outlined'}
                          color={brushSize === sz ? 'primary' : 'inherit'}
                          onClick={() => setBrushSize(sz)}
                          sx={{
                            minWidth: 32,
                            px: 0.8,
                            py: 0.2,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: 1,
                          }}
                        >
                          {sz}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* History & View Mode */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="실행 취소 (Undo)">
                    <span>
                      <IconButton size="small" onClick={undoMask} disabled={historyIndex <= 0}>
                        <UndoRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="다시 실행 (Redo)">
                    <span>
                      <IconButton
                        size="small"
                        onClick={redoMask}
                        disabled={historyIndex >= maskHistory.length - 1}
                      >
                        <RedoRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="마스크 전체 지우기">
                    <IconButton size="small" color="error" onClick={handleClearMask}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ width: 1, height: 20, bgcolor: 'divider', mx: 0.5 }} />

                  {/* Zoom Controls */}
                  <IconButton
                    size="small"
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  >
                    <ZoomOutRoundedIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {zoomLevel}%
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  >
                    <ZoomInRoundedIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ minWidth: 'auto', px: 0.8, fontSize: '0.75rem' }}
                    onClick={() => setZoomLevel(100)}
                  >
                    100%
                  </Button>

                  {/* Result View Mode Toggle (No Split Slider) */}
                  {hasResult && (
                    <>
                      <Box sx={{ width: 1, height: 20, bgcolor: 'divider', mx: 0.5 }} />
                      <ToggleButtonGroup
                        size="small"
                        value={viewMode}
                        exclusive
                        onChange={(_, val) => val && setViewMode(val)}
                      >
                        <ToggleButton value="result" sx={{ px: 1, py: 0.5 }}>
                          <Tooltip title="결과물" arrow>
                            <Box
                              component="span"
                              sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </Box>
                          </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="original" sx={{ px: 1, py: 0.5 }}>
                          <Tooltip title="원본" arrow>
                            <Box
                              component="span"
                              sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <VisibilityOffRoundedIcon fontSize="small" />
                            </Box>
                          </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="mask" sx={{ px: 1, py: 0.5 }}>
                          <Tooltip title="마스크 편집" arrow>
                            <Box
                              component="span"
                              sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <BrushRoundedIcon fontSize="small" />
                            </Box>
                          </Tooltip>
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </>
                  )}
                </Box>
              </Card>

              {/* Main Interactive Viewport */}
              <Card
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'auto',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                {/* Processing Overlay */}
                {isProcessing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 30,
                      bgcolor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <CircularProgress color="primary" size={48} thickness={4} />
                    <Box sx={{ textAlign: 'center', color: '#fff' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        주변 배경색으로 워터마크 지우는 중...
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        외곽 경계 색상 샘플링 및 자연스러운 페더링 블렌딩 적용 중
                      </Typography>
                    </Box>
                    <Box sx={{ width: 220 }}>
                      <LinearProgress
                        variant="determinate"
                        value={processProgress}
                        sx={{ borderRadius: 1, height: 6 }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Canvas Container */}
                <Box
                  ref={containerRef}
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    boxShadow: 8,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                    userSelect: 'none',
                    lineHeight: 0,
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Layer 1: Base Original Canvas */}
                  <canvas
                    ref={mainCanvasRef}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 270px)',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />

                  {/* Layer 2: Clean Result Canvas (Full display, No Split Slider) */}
                  <canvas
                    ref={resultCanvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      display: hasResult && viewMode === 'result' ? 'block' : 'none',
                    }}
                  />

                  {/* Layer 3: Interactive Mask Canvas (Overlay) */}
                  <canvas
                    ref={maskCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: activeTool === 'eraser' ? 'cell' : 'crosshair',
                      touchAction: 'none',
                      display: !hasResult || viewMode === 'mask' ? 'block' : 'none',
                    }}
                  />

                  {/* Layer 4: Dragging Box Selection Indicator */}
                  {currentBox && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${(currentBox.x / originalDimensions.width) * 100}%`,
                        top: `${(currentBox.y / originalDimensions.height) * 100}%`,
                        width: `${(currentBox.width / originalDimensions.width) * 100}%`,
                        height: `${(currentBox.height / originalDimensions.height) * 100}%`,
                        border: '2px dashed #ff3b30',
                        bgcolor: 'rgba(255, 59, 48, 0.35)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </Box>
              </Card>

              {/* Bottom Quick Hotspot Preset Bar */}
              <Card
                sx={{
                  px: 2,
                  py: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    ⚡ 워터마크 빠른 선택:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleApplyPresetBox('bottom-right')}
                    sx={{ fontSize: '0.75rem', py: 0.3 }}
                  >
                    우측 하단
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleApplyPresetBox('bottom-left')}
                    sx={{ fontSize: '0.75rem', py: 0.3 }}
                  >
                    좌측 하단
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleApplyPresetBox('top-right')}
                    sx={{ fontSize: '0.75rem', py: 0.3 }}
                  >
                    우측 상단
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleApplyPresetBox('top-left')}
                    sx={{ fontSize: '0.75rem', py: 0.3 }}
                  >
                    좌측 상단
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleApplyPresetBox('center')}
                    sx={{ fontSize: '0.75rem', py: 0.3 }}
                  >
                    중앙 각인
                  </Button>
                </Box>

                <Button
                  size="small"
                  variant="soft"
                  color="primary"
                  startIcon={<AutoAwesomeRoundedIcon />}
                  onClick={handleAutoDetect}
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                >
                  스마트 자동 감지
                </Button>
              </Card>
            </Box>

            {/* Right: Controls & Export Panel */}
            <Card
              sx={{
                width: { xs: '100%', lg: 340 },
                flexShrink: 0,
                p: 2.5,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                overflowY: 'auto',
              }}
            >
              {/* Action: Main Removal Trigger */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isProcessing}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <FormatColorFillRoundedIcon />
                    )
                  }
                  onClick={handleRunRemoval}
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: (theme) => theme.customShadows?.primary || 'none',
                  }}
                >
                  {isProcessing ? '워터마크 지우는 중...' : '🎨 워터마크 지우기'}
                </Button>

                {/* Secondary Action: Continue on Result */}
                {hasResult && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    fullWidth
                    startIcon={<RefreshRoundedIcon />}
                    onClick={handleContinueOnResult}
                    sx={{ fontWeight: 700 }}
                  >
                    현재 결과물에 추가 작업하기
                  </Button>
                )}
              </Box>

              {/* Surrounding Background Color Fill Settings */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    주변 배경색 채우기 설정
                  </Typography>
                  <Chip
                    label="초고속 복원"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }}
                  />
                </Box>

                {/* Auto Color Card */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useAutoColor}
                        onChange={(e) => {
                          setUseAutoColor(e.target.checked);
                          if (e.target.checked) {
                            setCustomColor(detectedColor);
                          }
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          주변 배경색 자동 추출
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                        >
                          워터마크 외곽 경계의 배경색을 자동으로 계산
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />

                  {/* Color Swatch & Manual Eyedropper */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                        bgcolor: useAutoColor ? detectedColor : customColor,
                        border: '2px solid',
                        borderColor: 'divider',
                        boxShadow: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        {useAutoColor ? '감지된 주변색' : '적용할 색상'}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                      >
                        {useAutoColor ? detectedColor.toUpperCase() : customColor.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Eyedropper & Native Color Picker */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="스포이드로 화면 색상 추출">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handlePickColorEyeDropper}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <ColorizeRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <input
                        type="color"
                        value={useAutoColor ? detectedColor : customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setUseAutoColor(false);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                        }}
                      />
                    </Box>
                  </Box>
                </Card>

                {/* Feathering (Button Selection, No Slider) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      경계 페더링 (블렌딩)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {colorFeather === 0
                        ? '0px (선명)'
                        : colorFeather === 4
                          ? '4px (기본/자연스러움)'
                          : colorFeather === 8
                            ? '8px (부드럽게)'
                            : `${colorFeather}px`}
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    fullWidth
                    size="small"
                    value={colorFeather}
                    exclusive
                    onChange={(_, val) => val !== null && setColorFeather(val)}
                  >
                    <ToggleButton value={0} sx={{ py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>
                      0px (선명)
                    </ToggleButton>
                    <ToggleButton value={4} sx={{ py: 0.6, fontSize: '0.75rem', fontWeight: 700 }}>
                      4px (기본)
                    </ToggleButton>
                    <ToggleButton value={8} sx={{ py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>
                      8px (부드럽게)
                    </ToggleButton>
                    <ToggleButton value={12} sx={{ py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>
                      12px (넓게)
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                  >
                    선택 영역의 외곽 경계면을 부드럽게 블렌딩하여 색상 경계선을 자연스럽게
                    융합합니다.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: 1, bgcolor: 'divider' }} />

              {/* Export & Download Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  저장 및 내보내기
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="포맷"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="png">PNG (무손실)</MenuItem>
                    <MenuItem value="jpeg">JPEG (고압축)</MenuItem>
                    <MenuItem value="webp">WebP (차세대)</MenuItem>
                  </TextField>

                  {exportFormat !== 'png' && (
                    <TextField
                      size="small"
                      type="number"
                      label="품질"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      inputProps={{ min: 50, max: 100 }}
                      sx={{ width: 85 }}
                    />
                  )}
                </Box>

                <Button
                  variant="contained"
                  color="inherit"
                  size="large"
                  fullWidth
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleDownload}
                  sx={{ fontWeight: 800 }}
                >
                  이미지 다운로드
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    fullWidth
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={handleCopyToClipboard}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    클립보드 복사
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    fullWidth
                    startIcon={<ShareRoundedIcon />}
                    onClick={handleKakaoShare}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    카카오톡 공유
                  </Button>
                </Box>
              </Box>

              {/* Photo Dimensions Info */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 'auto',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AspectRatioRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    해상도
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {originalDimensions.width} × {originalDimensions.height} px
                </Typography>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}

export { PhotoWatermarkRemoveView as WatermarkRemoveView };
export default PhotoWatermarkRemoveView;
