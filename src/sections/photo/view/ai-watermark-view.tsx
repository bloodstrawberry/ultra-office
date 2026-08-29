'use client';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { PhotoUploadWorkspace } from '../components/photo-upload-workspace';
import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  loadImage,
  getAllLogos,
  findLogoById,
  addCustomLogo,
  drawWatermark,
  PRESET_AI_LOGOS,
  removeCustomLogo,
  type WatermarkLogo,
  isPointInWatermark,
  type PositionPreset,
  AI_WATERMARK_SAMPLES,
  exportWatermarkDataUrl,
  getWatermarkCenterRelative,
  type WatermarkRenderOptions,
  drawWatermarkSelectionOutline,
  getWatermarkDirectionArrowHit,
} from '../utils/ai-watermark-processor';

// ----------------------------------------------------------------------

interface WatermarkImageItem {
  id: string;
  file?: File;
  name: string;
  origUrl: string;
  resultUrl?: string;
}

const PRESET_ANNOTATION_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
  '#18181B', // Dark
];

const PRESET_SUBTEXT_SUGGESTIONS = [
  'Generated with AI',
  'AI 생성 이미지',
  'Created by AI',
  'AI Generated Art',
  '대외비 (CONFIDENTIAL)',
  'SAMPLE',
  'COPYRIGHT ©',
];

const GRID_POSITION_OPTIONS: { id: PositionPreset; label: string; tooltip: string }[] = [
  { id: 'top-left', label: '◤', tooltip: '좌상단' },
  { id: 'top-center', label: '▲', tooltip: '상단 중앙' },
  { id: 'top-right', label: '◥', tooltip: '우상단' },
  { id: 'center-left', label: '◀', tooltip: '좌측 중앙' },
  { id: 'center', label: '●', tooltip: '정중앙' },
  { id: 'center-right', label: '▶', tooltip: '우측 중앙' },
  { id: 'bottom-left', label: '◣', tooltip: '좌하단' },
  { id: 'bottom-center', label: '▼', tooltip: '하단 중앙' },
  { id: 'bottom-right', label: '◢', tooltip: '우하단' },
];

export function AiWatermarkView() {
  // Image Items State
  const [items, setItems] = useState<WatermarkImageItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Logos State
  const [selectedLogoId, setSelectedLogoId] = useState<string>('chatgpt');
  const [, setCustomLogosVersion] = useState<number>(0);

  // Watermark Adjustments
  const [opacity, setOpacity] = useState<number>(0.4);
  const [scale, setScale] = useState<number>(0.12);
  const [rotation, setRotation] = useState<number>(0);
  const [positionPreset, setPositionPreset] = useState<PositionPreset>('bottom-right');
  const [customX, setCustomX] = useState<number>(0.85);
  const [customY, setCustomY] = useState<number>(0.85);

  // Subtext Options
  const [showText, setShowText] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('Generated with AI');
  const [textColor, setTextColor] = useState<string>('#ffffff');

  // Marker Annotations (Circle, Arrow, Square)
  const [showLogoCircle, setShowLogoCircle] = useState<boolean>(false);
  const [showLogoArrow, setShowLogoArrow] = useState<boolean>(false);
  const [showLogoSquare, setShowLogoSquare] = useState<boolean>(false);
  const [logoAnnotationColor, setLogoAnnotationColor] = useState<string>('#EF4444');
  const [logoAnnotationLineWidth, setLogoAnnotationLineWidth] = useState<number>(1.0);
  const [logoAnnotationOpacity, setLogoAnnotationOpacity] = useState<number>(1.0);
  const [logoAnnotationSize, setLogoAnnotationSize] = useState<number>(1.0);

  // UI States
  const [activeTab, setActiveTab] = useState<'logo' | 'style' | 'position' | 'text'>('logo');
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(390);

  // Zoom & Pan for interactive canvas
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const customLogoInputRef = useRef<HTMLInputElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(390);

  const isSelectionVisibleRef = useRef<boolean>(true);
  const isDraggingLogoRef = useRef<boolean>(false);
  const dragPosRef = useRef<{ customX: number; customY: number } | null>(null);
  const lastCustomPosRef = useRef<{ customX: number; customY: number } | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const isPanningRef = useRef<boolean>(false);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number>(0);
  const initialZoomRef = useRef<number>(1.0);
  const lastPanPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);

  const selectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exportDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const activeItem = items[activeItemIndex] || items[0];

  // Helper options object
  const currentRenderOptions: WatermarkRenderOptions = useMemo(
    () => ({
      opacity,
      scale,
      rotation,
      positionPreset,
      customX,
      customY,
      customText,
      showText,
      textColor,
      showLogoCircle,
      showLogoArrow,
      showLogoSquare,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationOpacity,
      logoAnnotationSize,
    }),
    [
      opacity,
      scale,
      rotation,
      positionPreset,
      customX,
      customY,
      customText,
      showText,
      textColor,
      showLogoCircle,
      showLogoArrow,
      showLogoSquare,
      logoAnnotationColor,
      logoAnnotationLineWidth,
      logoAnnotationOpacity,
      logoAnnotationSize,
    ]
  );

  // Add Files to List
  const addFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const newItems: WatermarkImageItem[] = selectedFiles.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      name: f.name,
      origUrl: URL.createObjectURL(f),
    }));

    setItems((prev) => [...prev, ...newItems]);
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleSelectSample = (sampleUrl: string) => {
    const sampleItem: WatermarkImageItem = {
      id: `sample_${Date.now()}`,
      name: 'ai_sample_art.jpg',
      origUrl: sampleUrl,
    };
    setItems((prev) => [sampleItem, ...prev]);
    setActiveItemIndex(0);
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  useImageDropPaste({
    onFiles: addFiles,
    multiple: true,
  });

  // Redraw Canvas Viewport
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const mainImg = mainImgRef.current;
    const container = containerRef.current;
    if (!canvas || !mainImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = mainImg.naturalWidth || mainImg.width || 800;
    const naturalH = mainImg.naturalHeight || mainImg.height || 600;
    const aspect = naturalW / naturalH;

    const containerW = container?.clientWidth || 500;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const maxPreviewW = Math.min(naturalW, Math.max(900, Math.round(containerW * dpr * 1.5)));
    const targetW = Math.round(maxPreviewW);
    const targetH = Math.round(maxPreviewW / aspect);

    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;

    const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;

    const effectiveOptions: WatermarkRenderOptions = activeCustomPos
      ? {
          ...currentRenderOptions,
          positionPreset: 'custom',
          customX: activeCustomPos.customX,
          customY: activeCustomPos.customY,
        }
      : currentRenderOptions;

    // 1. Draw base watermarked image
    if (viewMode === 'before') {
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(mainImg, 0, 0, targetW, targetH);
    } else {
      drawWatermark(ctx, mainImg, logoImgRef.current, effectiveOptions);

      // 2. Draw temporary selection indicator overlay
      const showDirectionArrows = activeTab === 'position';
      if (isSelectionVisibleRef.current) {
        drawWatermarkSelectionOutline(
          ctx,
          mainImg,
          logoImgRef.current,
          effectiveOptions,
          showDirectionArrows
        );
      }
    }
  }, [currentRenderOptions, activeTab, viewMode]);

  // Export full resolution result for active item
  const exportActiveResult = useCallback(() => {
    const mainImg = mainImgRef.current;
    if (!mainImg || !activeItem) return;

    try {
      const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;
      const effectiveOptions: WatermarkRenderOptions = activeCustomPos
        ? {
            ...currentRenderOptions,
            positionPreset: 'custom',
            customX: activeCustomPos.customX,
            customY: activeCustomPos.customY,
          }
        : currentRenderOptions;

      const dataUrl = exportWatermarkDataUrl(mainImg, logoImgRef.current, effectiveOptions);
      if (dataUrl) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === activeItemIndex ? { ...item, resultUrl: dataUrl } : item
          )
        );
      }
    } catch {
      // ignore
    }
  }, [activeItem, activeItemIndex, currentRenderOptions]);

  // Trigger selection box display for 3.5s
  const triggerSelectionBox = useCallback(() => {
    isSelectionVisibleRef.current = true;
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }
    selectionTimerRef.current = setTimeout(() => {
      isSelectionVisibleRef.current = false;
      redrawCanvas();
    }, 3500);
  }, [redrawCanvas]);

  // Load Main & Logo Images whenever active item or logo changes
  useEffect(() => {
    if (!activeItem) return undefined;
    let isCancelled = false;

    const logoObj = findLogoById(selectedLogoId);

    Promise.all([
      loadImage(activeItem.origUrl),
      logoObj?.src ? loadImage(logoObj.src) : Promise.resolve(null),
    ])
      .then(([mainImg, logoImg]) => {
        if (isCancelled) return;
        mainImgRef.current = mainImg;
        logoImgRef.current = logoImg;
        redrawCanvas();
        exportActiveResult();
      })
      .catch(() => {
        if (isCancelled) return;
        toast.error('이미지를 로드하는데 실패했습니다.');
      });

    return () => {
      isCancelled = true;
    };
  }, [activeItem, selectedLogoId, redrawCanvas, exportActiveResult]);

  // Redraw when options change
  useEffect(() => {
    if (isDraggingLogoRef.current) return;
    if (positionPreset !== 'custom' && !dragPosRef.current) {
      lastCustomPosRef.current = null;
    }
    dragPosRef.current = null;
    triggerSelectionBox();
    redrawCanvas();

    if (exportDebounceTimerRef.current) {
      clearTimeout(exportDebounceTimerRef.current);
    }
    exportDebounceTimerRef.current = setTimeout(() => {
      exportActiveResult();
    }, 200);
  }, [
    opacity,
    scale,
    rotation,
    positionPreset,
    customX,
    customY,
    showText,
    customText,
    textColor,
    showLogoCircle,
    showLogoArrow,
    showLogoSquare,
    logoAnnotationColor,
    logoAnnotationLineWidth,
    logoAnnotationOpacity,
    logoAnnotationSize,
    selectedLogoId,
    activeTab,
    viewMode,
    triggerSelectionBox,
    redrawCanvas,
    exportActiveResult,
  ]);

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (selectionTimerRef.current) clearTimeout(selectionTimerRef.current);
      if (exportDebounceTimerRef.current) clearTimeout(exportDebounceTimerRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    },
    []
  );

  // Screen pointer to relative canvas coordinates
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { canvasX: 0, canvasY: 0, relX: 0.5, relY: 0.5, imgRenderW: 400 };

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const canvasW = canvas.width || 800;
    const canvasH = canvas.height || 600;
    const canvasAspect = canvasW / canvasH;

    const rectW = rect.width || 400;
    const rectH = rect.height || 300;
    const rectAspect = rectW / rectH;

    let imgRenderW = rectW;
    let imgRenderH = rectH;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > rectAspect) {
      imgRenderW = rectW;
      imgRenderH = rectW / canvasAspect;
      offsetY = (rectH - imgRenderH) / 2;
    } else {
      imgRenderH = rectH;
      imgRenderW = rectH * canvasAspect;
      offsetX = (rectW - imgRenderW) / 2;
    }

    const imgClickX = clickX - offsetX;
    const imgClickY = clickY - offsetY;

    const relX = Math.max(0, Math.min(1, imgClickX / Math.max(1, imgRenderW)));
    const relY = Math.max(0, Math.min(1, imgClickY / Math.max(1, imgRenderH)));

    const canvasX = relX * canvasW;
    const canvasY = relY * canvasH;

    return { canvasX, canvasY, relX, relY, imgRenderW };
  };

  // Pointer Down (Canvas Drag & Direction Handle Clicks)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || viewMode === 'before') return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 2) {
      isDraggingLogoRef.current = false;
      isPanningRef.current = false;
      const p1 = pointers[0];
      const p2 = pointers[1];
      initialPinchDistRef.current = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      initialZoomRef.current = zoomScale;
    } else if (pointers.length === 1) {
      const { canvasX, canvasY, relX, relY, imgRenderW } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeCustomPos = dragPosRef.current || lastCustomPosRef.current;
      const effectiveOpts: WatermarkRenderOptions = activeCustomPos
        ? {
            ...currentRenderOptions,
            positionPreset: 'custom',
            customX: activeCustomPos.customX,
            customY: activeCustomPos.customY,
          }
        : currentRenderOptions;

      // 1. Check if 4 direction handles (▲ ◀ ▼ ▶) were clicked in position tab
      const showDirectionArrows = activeTab === 'position';
      const arrowHit = showDirectionArrows
        ? getWatermarkDirectionArrowHit(
            canvas.width,
            canvas.height,
            logoImgRef.current,
            effectiveOpts,
            canvasX,
            canvasY,
            imgRenderW
          )
        : null;

      if (arrowHit) {
        const logoCenter = getWatermarkCenterRelative(
          canvas.width,
          canvas.height,
          logoImgRef.current,
          effectiveOpts
        );

        const step = 0.01;
        let nextX = logoCenter.relX;
        let nextY = logoCenter.relY;

        if (arrowHit === 'up') nextY = Math.max(0.01, nextY - step);
        if (arrowHit === 'down') nextY = Math.min(0.99, nextY + step);
        if (arrowHit === 'left') nextX = Math.max(0.01, nextX - step);
        if (arrowHit === 'right') nextX = Math.min(0.99, nextX + step);

        dragPosRef.current = { customX: nextX, customY: nextY };
        lastCustomPosRef.current = { customX: nextX, customY: nextY };
        setPositionPreset('custom');
        setCustomX(nextX);
        setCustomY(nextY);

        triggerSelectionBox();
        redrawCanvas();
        exportActiveResult();
        return;
      }

      // 2. Check if logo area is hit
      const isHit = isPointInWatermark(
        canvas.width,
        canvas.height,
        logoImgRef.current,
        effectiveOpts,
        canvasX,
        canvasY,
        imgRenderW
      );

      if (isHit) {
        isDraggingLogoRef.current = true;
        setIsDraggingLogo(true);
        isPanningRef.current = false;
        isSelectionVisibleRef.current = true;

        const logoCenter = getWatermarkCenterRelative(
          canvas.width,
          canvas.height,
          logoImgRef.current,
          effectiveOpts
        );

        dragOffsetRef.current = {
          dx: relX - logoCenter.relX,
          dy: relY - logoCenter.relY,
        };
        dragPosRef.current = { customX: logoCenter.relX, customY: logoCenter.relY };
        lastCustomPosRef.current = { customX: logoCenter.relX, customY: logoCenter.relY };

        redrawCanvas();
      } else {
        const now = Date.now();
        if (now - lastTapTimeRef.current < 300) {
          setZoomScale(1.0);
          setPanOffset({ x: 0, y: 0 });
        }
        lastTapTimeRef.current = now;

        if (zoomScale > 1.0) {
          isPanningRef.current = true;
          isDraggingLogoRef.current = false;
          lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        }
      }
    }
  };

  // Pointer Move (Live Dragging & Pinch Zooming)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 2) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const currentDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (initialPinchDistRef.current > 0) {
        const scaleFactor = currentDist / initialPinchDistRef.current;
        const newZoom = Math.max(1.0, Math.min(15.0, initialZoomRef.current * scaleFactor));
        setZoomScale(newZoom);
        if (newZoom <= 1.01) {
          setPanOffset({ x: 0, y: 0 });
        }
      }
    } else if (pointers.length === 1) {
      if (isDraggingLogoRef.current) {
        const { relX, relY } = getCanvasCoords(e);
        const targetX = Math.max(0, Math.min(1, relX - dragOffsetRef.current.dx));
        const targetY = Math.max(0, Math.min(1, relY - dragOffsetRef.current.dy));

        dragPosRef.current = { customX: targetX, customY: targetY };
        lastCustomPosRef.current = { customX: targetX, customY: targetY };
        isSelectionVisibleRef.current = true;

        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            redrawCanvas();
          });
        }
      } else if (isPanningRef.current) {
        const dx = (e.clientX - lastPanPosRef.current.x) / zoomScale;
        const dy = (e.clientY - lastPanPosRef.current.y) / zoomScale;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };

        const maxPan = Math.max(150, (zoomScale - 1) * 300);
        setPanOffset((prev) => ({
          x: Math.max(-maxPan, Math.min(maxPan, prev.x + dx)),
          y: Math.max(-maxPan, Math.min(maxPan, prev.y + dy)),
        }));
      }
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = 0;
    }

    if (activePointersRef.current.size === 0) {
      if (isDraggingLogoRef.current) {
        isDraggingLogoRef.current = false;
        setIsDraggingLogo(false);

        if (dragPosRef.current) {
          setPositionPreset('custom');
          setCustomX(dragPosRef.current.customX);
          setCustomY(dragPosRef.current.customY);
        }

        dragPosRef.current = null;
        triggerSelectionBox();
        exportActiveResult();
      }
      isPanningRef.current = false;
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.003;
    setZoomScale((prev) => {
      const next = Math.max(1.0, Math.min(15.0, prev + zoomDelta));
      if (next <= 1.01) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Reset Zoom
  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Custom Logo Upload
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        const newLogo: WatermarkLogo = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '') || '내 커스텀 로고',
          src: dataUrl,
          defaultText: 'Custom Watermark',
          category: 'custom',
        };
        addCustomLogo(newLogo);
        setCustomLogosVersion((v) => v + 1);
        setSelectedLogoId(newLogo.id);
        toast.success('커스텀 로고가 성공적으로 등록되었습니다.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteCustomLogo = (e: React.MouseEvent, logoId: string) => {
    e.stopPropagation();
    removeCustomLogo(logoId);
    setCustomLogosVersion((v) => v + 1);
    if (selectedLogoId === logoId) {
      setSelectedLogoId(PRESET_AI_LOGOS[0].id);
    }
    toast.success('커스텀 로고가 삭제되었습니다.');
  };

  // Single Item Download
  const handleDownloadSingle = async (item: WatermarkImageItem) => {
    if (!item.resultUrl) return;
    const cleanName = item.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.resultUrl, `ai_watermarked_${cleanName}.png`);
    toast.success(res.message);
  };

  // All Items ZIP Download
  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.resultUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `ai_watermarked_${it.name.replace(/\.[^/.]+$/, '')}.png`,
        data: it.resultUrl!,
      }));

      await downloadZipFile(`ai_watermarked_batch_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}개 이미지가 ZIP 압축 파일로 다운로드되었습니다.`);
    } catch {
      toast.error('ZIP 압축 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // KakaoTalk Share
  const handleShare = async () => {
    if (!activeItem?.resultUrl) return;
    setIsProcessing(true);
    try {
      const res = await shareToKakaoTalk(
        activeItem.resultUrl,
        'AI Watermark 생성물 각인',
        `ai_watermark_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset All Settings
  const handleResetSettings = useCallback(() => {
    setOpacity(0.4);
    setScale(0.12);
    setRotation(0);
    setPositionPreset('bottom-right');
    setCustomX(0.85);
    setCustomY(0.85);
    setShowText(false);
    setCustomText('Generated with AI');
    setTextColor('#ffffff');
    setShowLogoCircle(false);
    setShowLogoArrow(false);
    setShowLogoSquare(false);
    setLogoAnnotationColor('#EF4444');
    setLogoAnnotationLineWidth(1.0);
    setLogoAnnotationOpacity(1.0);
    setLogoAnnotationSize(1.0);
    toast.success('워터마크 설정이 초기화되었습니다.');
  }, []);

  // Reset Everything to Upload Workspace
  const handleReset = useCallback(() => {
    setItems([]);
    setActiveItemIndex(0);
    setOpacity(0.4);
    setScale(0.12);
    setRotation(0);
    setPositionPreset('bottom-right');
    setCustomX(0.85);
    setCustomY(0.85);
    setShowText(false);
    setCustomText('Generated with AI');
    setTextColor('#ffffff');
    setShowLogoCircle(false);
    setShowLogoArrow(false);
    setShowLogoSquare(false);
    setLogoAnnotationColor('#EF4444');
    setLogoAnnotationLineWidth(1.0);
    setLogoAnnotationOpacity(1.0);
    setLogoAnnotationSize(1.0);
  }, []);

  // Resizable Divider
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
    const newWidth = Math.max(300, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  const allAvailableLogos = getAllLogos();

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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            AI 워터마크 & 생성물 표기 스튜디오
          </Typography>
          <Chip label="AI 추천" color="primary" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          ChatGPT, Gemini, Claude, DeepSeek 등 주요 AI 로고와 손그림 마커(동그라미·화살표·네모)를
          캔버스 위에서 자유롭게 배치하여 각인합니다.
        </Typography>
      </Box>

      {/* Hidden File Inputs */}
      <input
        ref={multiFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          addFiles(files);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <input
        ref={customLogoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleCustomLogoUpload}
        style={{ display: 'none' }}
      />

      {items.length === 0 ? (
        <PhotoUploadWorkspace
          sampleImages={AI_WATERMARK_SAMPLES}
          onSelectSample={handleSelectSample}
          onFileSelect={(file) => addFiles([file])}
          title="AI 워터마크를 각인할 사진 업로드"
          subtitle="AI 생성 이미지, 포트폴리오, 사진을 드래그하거나 클릭하여 다중 선택하세요 (100% 클라이언트 안전 처리)"
          icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 38 }} />}
        />
      ) : (
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
          {/* Left: Interactive Canvas & Thumbnail Strip */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 1.5,
              pr: { lg: 1 },
            }}
          >
            {/* Live Interactive Viewport */}
            <Card
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                position: 'relative',
              }}
            >
              {/* Top Viewport Toolbar */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 0.5 }}>
                    {activeItem ? activeItem.name : '미리보기'}
                  </Typography>
                  {isProcessing && <CircularProgress size={16} />}

                  {/* Before / After Toggle */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    size="small"
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
                    <ToggleButton value="before">원본 보기</ToggleButton>
                    <ToggleButton value="after">워터마크 각인</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={() => multiFileInputRef.current?.click()}
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                  >
                    사진 추가
                  </Button>
                </Box>
              </Box>

              {/* Canvas Container with Pinch & Wheel Zoom */}
              <Box
                ref={containerRef}
                onWheel={handleWheel}
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor: '#090d16',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  touchAction: 'none',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                {/* Zoom Badge */}
                {zoomScale > 1.05 && (
                  <Button
                    size="small"
                    onClick={handleResetZoom}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 20,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      px: 1.5,
                      py: 0.5,
                      '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.95)' },
                    }}
                  >
                    🔍 {zoomScale.toFixed(1)}x (원래대로)
                  </Button>
                )}

                {/* Dragging Status Badge */}
                {isDraggingLogo && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 20,
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      color: 'primary.light',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      px: 1.5,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                    <span>✨ 로고 위치 이동 중...</span>
                  </Box>
                )}

                {/* Main Canvas View */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${zoomScale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transformOrigin: 'center center',
                    transition: isDraggingLogo ? 'none' : 'transform 0.06s ease-out',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      cursor: isDraggingLogo ? 'grabbing' : 'grab',
                      touchAction: 'none',
                    }}
                  />
                </Box>
              </Box>

              {/* Live Canvas Guide Caption */}
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  mt: 1,
                  fontSize: '0.73rem',
                  display: 'block',
                }}
              >
                💡 캔버스 위에서 로고를 직접 마우스/터치로 드래그해 이동하거나, 휠로 사진을
                확대/축소할 수 있습니다.
              </Typography>
            </Card>

            {/* Bottom Multi-Photo Strip */}
            <Card sx={{ p: 1.5, borderRadius: 3, flexShrink: 0, maxHeight: 170 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  작업 사진 목록 ({items.length}장)
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {items.length > 1 && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadAllZip}
                      startIcon={<ArchiveRoundedIcon fontSize="small" />}
                      sx={{ fontWeight: 700 }}
                    >
                      전체 ZIP 다운로드
                    </Button>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 0.5,
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: 0.8,
                      borderRadius: 2,
                      bgcolor: activeItemIndex === idx ? 'action.selected' : 'action.hover',
                      border: '1.5px solid',
                      borderColor: activeItemIndex === idx ? 'primary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: 200,
                      maxWidth: 240,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        bgcolor: '#090d16',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.resultUrl || item.origUrl}
                        alt="thumb"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                        noWrap
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.resultUrl ? '각인 완료' : '대기 중'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.2, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(item);
                        }}
                      >
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItems((prev) => prev.filter((_, i) => i !== idx));
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>

          {/* Draggable Split Divider (Desktop) */}
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
                '& > div > div': { bgcolor: '#ffffff' },
              },
            }}
          >
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

          {/* Right: Customization Sidebar */}
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
              overflowY: 'auto',
              pl: { lg: 1 },
              pr: 0.5,
            }}
          >
            {/* Tab Navigation */}
            <Card sx={{ p: 1, borderRadius: 2.5, flexShrink: 0 }}>
              <ToggleButtonGroup
                value={activeTab}
                exclusive
                onChange={(_, v) => v && setActiveTab(v)}
                fullWidth
                size="small"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 0.5,
                  '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px !important',
                    whiteSpace: 'nowrap',
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.darker',
                      borderColor: 'primary.main',
                      fontWeight: 700,
                    },
                  },
                }}
              >
                <ToggleButton value="logo">로고 선택</ToggleButton>
                <ToggleButton value="style">스타일</ToggleButton>
                <ToggleButton value="position">위치</ToggleButton>
                <ToggleButton value="text">문구</ToggleButton>
              </ToggleButtonGroup>
            </Card>

            {/* TAB 1: Logo & Marker Annotations */}
            {activeTab === 'logo' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* AI Model Logo Grid */}
                <Card sx={{ p: 2, borderRadius: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      AI 모델 & 로고 선택
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => customLogoInputRef.current?.click()}
                      startIcon={<AddRoundedIcon />}
                      sx={{ fontSize: '0.72rem', py: 0.3 }}
                    >
                      로고 직접 등록
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1.2,
                    }}
                  >
                    {allAvailableLogos.map((logo) => {
                      const isSelected = selectedLogoId === logo.id;
                      const isCustom = logo.id.startsWith('custom-');

                      return (
                        <Box
                          key={logo.id}
                          onClick={() => {
                            setSelectedLogoId(logo.id);
                            if (!showText && logo.defaultText) {
                              setCustomText(logo.defaultText);
                            }
                          }}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 0.6,
                            }}
                          >
                            <img
                              src={logo.src}
                              alt={logo.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              textAlign: 'center',
                              color: isSelected ? 'primary.main' : 'text.primary',
                            }}
                            noWrap
                          >
                            {logo.name}
                          </Typography>

                          {/* Selected Check Badge */}
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckRoundedIcon sx={{ fontSize: 11 }} />
                            </Box>
                          )}

                          {/* Delete Custom Logo Button */}
                          {isCustom && (
                            <Box
                              onClick={(e) => handleDeleteCustomLogo(e, logo.id)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'error.dark' },
                              }}
                            >
                              <CloseRoundedIcon sx={{ fontSize: 11 }} />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Card>

                {/* Hand-Drawn Annotations 3-Way Selector */}
                <Card sx={{ p: 2, borderRadius: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      손그림 마커 표기 (강조 효과)
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      onClick={() => setIsAnnotationModalOpen(true)}
                      startIcon={<TuneRoundedIcon fontSize="small" />}
                      sx={{ fontSize: '0.72rem', py: 0.3 }}
                    >
                      표기 상세 설정
                    </Button>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
                    {/* Circle Button */}
                    <Button
                      variant={showLogoCircle ? 'contained' : 'outlined'}
                      color={showLogoCircle ? 'error' : 'inherit'}
                      onClick={() => setShowLogoCircle(!showLogoCircle)}
                      startIcon={<RadioButtonUncheckedRoundedIcon />}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      동그라미
                    </Button>

                    {/* Arrow Button */}
                    <Button
                      variant={showLogoArrow ? 'contained' : 'outlined'}
                      color={showLogoArrow ? 'error' : 'inherit'}
                      onClick={() => setShowLogoArrow(!showLogoArrow)}
                      startIcon={<NorthEastRoundedIcon />}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      화살표
                    </Button>

                    {/* Square Button */}
                    <Button
                      variant={showLogoSquare ? 'contained' : 'outlined'}
                      color={showLogoSquare ? 'error' : 'inherit'}
                      onClick={() => setShowLogoSquare(!showLogoSquare)}
                      startIcon={<CropSquareRoundedIcon />}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      네모 박스
                    </Button>
                  </Box>
                </Card>
              </Box>
            )}

            {/* TAB 2: Style (Opacity, Scale, Rotation) */}
            {activeTab === 'style' && (
              <Card sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  워터마크 크기 및 투명도 설정
                </Typography>

                {/* Opacity Slider */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      워터마크 투명도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {Math.round(opacity * 100)}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={opacity}
                    onChange={(_, v) => setOpacity(v as number)}
                  />
                </Box>

                {/* Scale Slider */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      워터마크 크기 (비율)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {Math.round(scale * 100)}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0.05}
                    max={0.45}
                    step={0.01}
                    value={scale}
                    onChange={(_, v) => setScale(v as number)}
                  />
                </Box>

                {/* Rotation Slider */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      회전 각도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {Math.round(rotation)}°
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0}
                    max={360}
                    step={5}
                    value={rotation}
                    onChange={(_, v) => setRotation(v as number)}
                  />
                </Box>
              </Card>
            )}

            {/* TAB 3: Position Grid & Coordinates */}
            {activeTab === 'position' && (
              <Card sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  위치 선택 & 정렬
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.2,
                    mb: 2,
                  }}
                >
                  {GRID_POSITION_OPTIONS.map((pos) => {
                    const isSelected = positionPreset === pos.id;
                    return (
                      <Tooltip key={pos.id} title={pos.tooltip} arrow>
                        <Button
                          variant={isSelected ? 'contained' : 'outlined'}
                          color={isSelected ? 'primary' : 'inherit'}
                          onClick={() => {
                            setPositionPreset(pos.id);
                            triggerSelectionBox();
                          }}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 800,
                          }}
                        >
                          {pos.label}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* Free Custom Mode Button */}
                <Button
                  fullWidth
                  variant={positionPreset === 'custom' ? 'contained' : 'outlined'}
                  color={positionPreset === 'custom' ? 'primary' : 'inherit'}
                  onClick={() => {
                    setPositionPreset('custom');
                    triggerSelectionBox();
                  }}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  🖐️ 캔버스 위 자유 드래그 위치 ({Math.round(customX * 100)}%,{' '}
                  {Math.round(customY * 100)}%)
                </Button>
              </Card>
            )}

            {/* TAB 4: Subtext Options */}
            {activeTab === 'text' && (
              <Card sx={{ p: 2, borderRadius: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    보조 텍스트 문구 각인
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showText}
                        onChange={(e) => setShowText(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>

                {showText && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="각인할 문구를 입력하세요"
                    />

                    {/* Quick Suggestion Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                      {PRESET_SUBTEXT_SUGGESTIONS.map((sug) => (
                        <Chip
                          key={sug}
                          label={sug}
                          size="small"
                          clickable
                          onClick={() => setCustomText(sug)}
                          variant={customText === sug ? 'filled' : 'outlined'}
                          color={customText === sug ? 'primary' : 'default'}
                          sx={{ fontSize: '0.72rem', height: 24 }}
                        />
                      ))}
                    </Box>

                    {/* Text Color Picker */}
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, mb: 0.8, display: 'block' }}
                      >
                        글자 색상
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {PRESET_ANNOTATION_COLORS.map((c) => (
                          <Box
                            key={c}
                            onClick={() => setTextColor(c)}
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              bgcolor: c,
                              border: '2px solid',
                              borderColor: textColor === c ? 'primary.main' : 'divider',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.1s',
                              '&:hover': { transform: 'scale(1.15)' },
                            }}
                          >
                            {textColor === c && (
                              <CheckRoundedIcon
                                sx={{
                                  fontSize: 14,
                                  color: c === '#FFFFFF' ? '#000000' : '#ffffff',
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Card>
            )}

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
                variant="outlined"
                color="inherit"
                onClick={handleReset}
                disabled={items.length === 0 || isProcessing}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>

              {/* Main: Clean Result Save */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => activeItem && handleDownloadSingle(activeItem)}
                disabled={items.length === 0 || isProcessing}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                결과물 저장
              </Button>

              {/* Secondary: All ZIP Download if multiple items */}
              {items.length > 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleDownloadAllZip}
                  disabled={isProcessing}
                  startIcon={<ArchiveRoundedIcon />}
                  sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
                >
                  전체 일괄 압축(ZIP) 다운로드
                </Button>
              )}

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={!activeItem?.resultUrl || isProcessing}
                startIcon={<ShareRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Detail Annotation Settings Modal */}
      <Dialog
        open={isAnnotationModalOpen}
        onClose={() => setIsAnnotationModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 2.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteRoundedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              손그림 표기 상세 설정
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsAnnotationModalOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Color Palette */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            표기 색상
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {PRESET_ANNOTATION_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setLogoAnnotationColor(c)}
                sx={{
                  h: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: c,
                  border: '2px solid',
                  borderColor: logoAnnotationColor === c ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows?.z1,
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                {logoAnnotationColor === c && (
                  <CheckRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: c === '#FFFFFF' ? '#000000' : '#ffffff',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Line Thickness Slider */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              선 굵기 배율
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {logoAnnotationLineWidth.toFixed(1)}x
            </Typography>
          </Box>
          <Slider
            size="small"
            min={0.5}
            max={2.5}
            step={0.1}
            value={logoAnnotationLineWidth}
            onChange={(_, v) => setLogoAnnotationLineWidth(v as number)}
          />
        </Box>

        {/* Line Opacity Slider */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              선 투명도 (독립 설정)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {Math.round(logoAnnotationOpacity * 100)}%
            </Typography>
          </Box>
          <Slider
            size="small"
            min={0.1}
            max={1.0}
            step={0.05}
            value={logoAnnotationOpacity}
            onChange={(_, v) => setLogoAnnotationOpacity(v as number)}
          />
        </Box>

        {/* Size Slider */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              표기 크기 (독립 설정)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {Math.round(logoAnnotationSize * 100)}%
            </Typography>
          </Box>
          <Slider
            size="small"
            min={0.5}
            max={2.0}
            step={0.1}
            value={logoAnnotationSize}
            onChange={(_, v) => setLogoAnnotationSize(v as number)}
          />
        </Box>

        {/* Visual Line Preview Bar */}
        <Box
          sx={{
            width: '100%',
            height: 38,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              borderRadius: 999,
              bgcolor: logoAnnotationColor,
              opacity: logoAnnotationOpacity,
              height: `${Math.max(2, Math.round(logoAnnotationLineWidth * 4 * logoAnnotationSize))}px`,
              transition: 'all 0.15s',
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => setIsAnnotationModalOpen(false)}
          sx={{ fontWeight: 800, borderRadius: 2 }}
        >
          설정 완료
        </Button>
      </Dialog>
    </DashboardContent>
  );
}
