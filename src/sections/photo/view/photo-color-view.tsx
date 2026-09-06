'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CircularProgress from '@mui/material/CircularProgress';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  drawShape,
  moveShape,
  resizeShape,
  drawAllShapes,
  isPointInShape,
  getShapeResizeHandle,
  type MaskShape,
  type ShapePoint,
  type ResizeHandleType,
  sampleSurroundingColor,
} from '../utils/watermark-remover';
import {
  ColorShapePanel,
  ColorOneClickPanel,
  type ToolMode,
  type ColorShapeTool,
} from '../components/color-change';
import { AppsInTossNavHeader, PhotoUploadWorkspace, type SampleImageItem } from '../components';
import {
  downloadDataUrl,
  floodFillCanvas,
  shareToKakaoTalk,
  toggleBackgroundWhiteTransparent,
} from '../utils/image-processor';

// ----------------------------------------------------------------------

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

type ColorViewTab = 'one-click' | 'shapes';

// ----------------------------------------------------------------------

export function PhotoColorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Tab State: 'one-click' | 'shapes'
  const [activeTab, setActiveTab] = useState<ColorViewTab>('one-click');

  // --- ONE-CLICK MODE STATE ---
  const [mode, setMode] = useState<ToolMode>('erase');
  const [fillColorHex, setFillColorHex] = useState<string>('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(25);

  // --- SHAPES MODE STATE ---
  const [shapeTool, setShapeTool] = useState<ColorShapeTool>('circle');
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [autoSurrounding, setAutoSurrounding] = useState<boolean>(false);
  const [feather, setFeather] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [shapes, setShapes] = useState<MaskShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shapesHistory, setShapesHistory] = useState<MaskShape[][]>([[]]);
  const [shapeHistoryIndex, setShapeHistoryIndex] = useState<number>(0);

  // Shared Viewport & History State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  // Canvases
  const canvasRef = useRef<HTMLCanvasElement>(null); // Base working image
  const shapeCanvasRef = useRef<HTMLCanvasElement>(null); // Shapes overlay
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction Refs
  const isDrawingRef = useRef<boolean>(false);
  const isMovingRef = useRef<boolean>(false);
  const isResizingShapeRef = useRef<boolean>(false);
  const activeResizeHandleRef = useRef<ResizeHandleType | null>(null);
  const moveStartPtRef = useRef<ShapePoint | null>(null);
  const resizeStartPtRef = useRef<ShapePoint | null>(null);
  const movingShapeInitRef = useRef<MaskShape | null>(null);
  const resizingShapeInitRef = useRef<MaskShape | null>(null);
  const shapeStartRef = useRef<ShapePoint | null>(null);
  const shapePointsRef = useRef<ShapePoint[]>([]);
  const [shapeCanvasCursor, setShapeCanvasCursor] = useState<string>('crosshair');

  const shapesRef = useRef<MaskShape[]>(shapes);
  shapesRef.current = shapes;

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  // Divider resize handlers
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

  // Base canvas history (One-Click mode)
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

      if (shapeCanvasRef.current) {
        shapeCanvasRef.current.width = prevState.width;
        shapeCanvasRef.current.height = prevState.height;
      }

      toast.info('실행 취소가 적용되었습니다.');
    }
  }, [history]);

  // Shape history (Shapes mode)
  const pushShapeHistory = useCallback(
    (nextShapes: MaskShape[]) => {
      setShapes(nextShapes);
      setShapesHistory((prev) => {
        const next = prev.slice(0, shapeHistoryIndex + 1);
        next.push(nextShapes);
        if (next.length > 25) next.shift();
        return next;
      });
      setShapeHistoryIndex((prev) => Math.min(prev + 1, 24));
    },
    [shapeHistoryIndex]
  );

  const handleShapeUndo = useCallback(() => {
    if (shapeHistoryIndex <= 0) return;
    const targetIdx = shapeHistoryIndex - 1;
    const target = shapesHistory[targetIdx] || [];
    setShapes(target);
    setShapeHistoryIndex(targetIdx);
    setSelectedShapeId(null);
    toast.info('도형 작업이 취소되었습니다.');
  }, [shapeHistoryIndex, shapesHistory]);

  const handleShapeRedo = useCallback(() => {
    if (shapeHistoryIndex >= shapesHistory.length - 1) return;
    const targetIdx = shapeHistoryIndex + 1;
    const target = shapesHistory[targetIdx] || [];
    setShapes(target);
    setShapeHistoryIndex(targetIdx);
    setSelectedShapeId(null);
    toast.info('도형 작업이 다시 실행되었습니다.');
  }, [shapeHistoryIndex, shapesHistory]);

  const handleUpdateSelectedShape = useCallback(
    (updater: (prev: MaskShape) => MaskShape) => {
      if (!selectedShapeId) return;
      setShapes((prev) => prev.map((s) => (s.id === selectedShapeId ? updater(s) : s)));
    },
    [selectedShapeId]
  );

  const handleCommitShapeHistory = useCallback(() => {
    pushShapeHistory(shapesRef.current);
  }, [pushShapeHistory]);

  const handleSampleSurroundingForSelected = useCallback(() => {
    if (!selectedShapeId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const target = shapes.find((s) => s.id === selectedShapeId);
    if (!target) return;

    const sampled = sampleSurroundingColor(
      ctx,
      target.x,
      target.y,
      Math.max(10, target.width),
      Math.max(10, target.height),
      canvas.width,
      canvas.height
    );

    const next = shapes.map((s) => (s.id === selectedShapeId ? { ...s, fillColor: sampled } : s));
    pushShapeHistory(next);
    toast.success(`주변 배경색이 자동 추출되어 적용되었습니다: ${sampled}`);
  }, [selectedShapeId, shapes, pushShapeHistory]);

  // Keyboard Shortcuts: DEL (Delete selected shape), Ctrl+Z (Undo), Ctrl+Y (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      // DEL or Backspace to delete selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeTab === 'shapes' && selectedShapeId) {
          e.preventDefault();
          const next = shapes.filter((s) => s.id !== selectedShapeId);
          pushShapeHistory(next);
          setSelectedShapeId(null);
          toast.success('선택된 도형이 삭제되었습니다.');
          return;
        }
      }

      // Ctrl + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (activeTab === 'shapes') {
            handleShapeRedo();
          }
        } else {
          if (activeTab === 'shapes') {
            handleShapeUndo();
          } else {
            handleUndo();
          }
        }
        return;
      }

      // Ctrl + Y (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (activeTab === 'shapes') {
          handleShapeRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    selectedShapeId,
    shapes,
    pushShapeHistory,
    handleShapeUndo,
    handleShapeRedo,
    handleUndo,
  ]);

  // Redraw shape canvas whenever shapes or selection changes
  const redrawShapes = useCallback(
    (shapeList: MaskShape[], selectedId: string | null = selectedShapeId) => {
      const sCanvas = shapeCanvasRef.current;
      if (!sCanvas) return;
      const ctx = sCanvas.getContext('2d');
      if (!ctx) return;

      drawAllShapes(ctx, shapeList, selectedId);
    },
    [selectedShapeId]
  );

  useEffect(() => {
    redrawShapes(shapes, selectedShapeId);
  }, [shapes, selectedShapeId, redrawShapes]);

  // Coordinate converter for canvas pointer events
  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): ShapePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  }, []);

  // One-click toggle background
  const handleToggleBackground = () => {
    if (!canvasRef.current) return;
    toggleBackgroundWhiteTransparent(canvasRef.current);
    pushHistory();
    toast.success('흰색 ↔ 투명 전환이 완료되었습니다.');
  };

  // One-click canvas click (flood fill or eyedropper)
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

  // Explicit Add Shape Button Handler (spawns shape at canvas center)
  const handleAddShape = useCallback(
    (type: 'circle' | 'rect' | 'triangle') => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = Math.min(Math.round(canvas.width * 0.28), 160);
      const h = Math.min(Math.round(canvas.height * 0.22), 120);
      const x = Math.max(0, Math.round((canvas.width - w) / 2));
      const y = Math.max(0, Math.round((canvas.height - h) / 2));

      let finalColor = isTransparent ? 'transparent' : fillColorHex;
      const ctx = canvas.getContext('2d');
      if (!isTransparent && autoSurrounding && ctx) {
        finalColor = sampleSurroundingColor(ctx, x, y, w, h, canvas.width, canvas.height);
      }

      const newShape: MaskShape = {
        id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        x,
        y,
        width: w,
        height: h,
        fillColor: finalColor,
        feather,
        opacity,
      };

      pushShapeHistory([...shapes, newShape]);
      setSelectedShapeId(newShape.id);
      const label = type === 'circle' ? '동그라미' : type === 'rect' ? '네모' : '세모';
      toast.success(
        `${label}가 추가되었습니다. 캔버스에서 마우스로 드래그하여 이동할 수 있습니다.`
      );
    },
    [isTransparent, fillColorHex, autoSurrounding, feather, opacity, shapes, pushShapeHistory]
  );

  // Shape Mode Pointer Events (Selection, Moving, Resizing, Drawing)
  const handleShapePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasPoint(e);

    // Eyedropper tool
    if (shapeTool === 'spoid') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      if (pixel[3] === 0) {
        toast.info('투명한 영역을 클릭했습니다.');
      } else {
        const hex = `#${[pixel[0], pixel[1], pixel[2]]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()}`;
        setFillColorHex(hex);
        setIsTransparent(false);
        if (selectedShapeId) {
          setShapes((prev) =>
            prev.map((s) => (s.id === selectedShapeId ? { ...s, fillColor: hex } : s))
          );
        }
        toast.success(`배경색 (${hex})이 추출되었습니다.`);
      }
      return;
    }

    // 1. Check if clicking on resize handles of the selected shape
    if (selectedShapeId) {
      const selected = shapes.find((s) => s.id === selectedShapeId);
      if (selected) {
        const handle = getShapeResizeHandle(selected, pt.x, pt.y);
        if (handle) {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          isResizingShapeRef.current = true;
          activeResizeHandleRef.current = handle;
          resizeStartPtRef.current = pt;
          resizingShapeInitRef.current = { ...selected };
          return;
        }
      }
    }

    // Freehand drawing mode
    if (shapeTool === 'freehand') {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      shapePointsRef.current = [pt];
      const sCanvas = shapeCanvasRef.current;
      const sCtx = sCanvas?.getContext('2d');
      if (sCtx) {
        drawShape(sCtx, {
          id: 'preview',
          type: 'freehand',
          x: pt.x,
          y: pt.y,
          width: 0,
          height: 0,
          points: [pt],
          brushSize,
          fillColor: isTransparent ? 'transparent' : fillColorHex,
          feather,
          opacity,
        });
      }
      return;
    }

    // 2. Hit test against existing shapes (from top layer downwards)
    let hitShape: MaskShape | null = null;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (isPointInShape(shapes[i], pt.x, pt.y)) {
        hitShape = shapes[i];
        break;
      }
    }

    if (hitShape) {
      // Shape selected & initiate move drag
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setSelectedShapeId(hitShape.id);
      isMovingRef.current = true;
      moveStartPtRef.current = pt;
      movingShapeInitRef.current = { ...hitShape };
      return;
    }

    // 3. Clicked empty canvas space
    setSelectedShapeId(null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    shapeStartRef.current = pt;
  };

  const handleShapePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (shapeTool === 'spoid') {
      setShapeCanvasCursor('crosshair');
      return;
    }
    const pt = getCanvasPoint(e);
    const sCanvas = shapeCanvasRef.current;
    if (!sCanvas) return;
    const sCtx = sCanvas.getContext('2d');
    if (!sCtx) return;

    // 1. Resizing selected shape
    if (
      isResizingShapeRef.current &&
      resizeStartPtRef.current &&
      resizingShapeInitRef.current &&
      activeResizeHandleRef.current
    ) {
      const dx = pt.x - resizeStartPtRef.current.x;
      const dy = pt.y - resizeStartPtRef.current.y;
      const updated = resizeShape(
        resizingShapeInitRef.current,
        activeResizeHandleRef.current,
        dx,
        dy
      );

      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return;
    }

    // 2. Moving selected shape
    if (isMovingRef.current && moveStartPtRef.current && movingShapeInitRef.current) {
      const dx = pt.x - moveStartPtRef.current.x;
      const dy = pt.y - moveStartPtRef.current.y;
      const updated = moveShape(movingShapeInitRef.current, dx, dy);

      setShapes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return;
    }

    // 3. Hover cursor update when idle
    if (!isDrawingRef.current) {
      if (selectedShapeId) {
        const selected = shapes.find((s) => s.id === selectedShapeId);
        if (selected) {
          const handle = getShapeResizeHandle(selected, pt.x, pt.y);
          if (handle) {
            if (handle === 'nw' || handle === 'se') setShapeCanvasCursor('nwse-resize');
            else if (handle === 'ne' || handle === 'sw') setShapeCanvasCursor('nesw-resize');
            else if (handle === 'n' || handle === 's') setShapeCanvasCursor('ns-resize');
            else if (handle === 'e' || handle === 'w') setShapeCanvasCursor('ew-resize');
            return;
          }
          if (isPointInShape(selected, pt.x, pt.y)) {
            setShapeCanvasCursor('move');
            return;
          }
        }
      }

      const overAny = shapes.some((s) => isPointInShape(s, pt.x, pt.y));
      if (overAny) {
        setShapeCanvasCursor('pointer');
        return;
      }

      setShapeCanvasCursor(shapeTool === 'freehand' ? 'crosshair' : 'crosshair');
      return;
    }

    // 4. Freehand stroke preview
    if (shapeTool === 'freehand') {
      shapePointsRef.current.push(pt);
      drawAllShapes(sCtx, shapes, selectedShapeId);
      drawShape(sCtx, {
        id: 'preview',
        type: 'freehand',
        x: shapePointsRef.current[0].x,
        y: shapePointsRef.current[0].y,
        width: 0,
        height: 0,
        points: shapePointsRef.current,
        brushSize,
        fillColor: isTransparent ? 'transparent' : fillColorHex,
        feather,
        opacity,
      });
      return;
    }

    // 5. Dragging to create new shape preview
    if (shapeStartRef.current) {
      const start = shapeStartRef.current;
      const x = Math.min(start.x, pt.x);
      const y = Math.min(start.y, pt.y);
      const w = Math.abs(pt.x - start.x);
      const h = Math.abs(pt.y - start.y);

      drawAllShapes(sCtx, shapes, selectedShapeId);
      drawShape(sCtx, {
        id: 'preview',
        type: shapeTool,
        x,
        y,
        width: w,
        height: h,
        fillColor: isTransparent ? 'transparent' : fillColorHex,
        feather,
        opacity,
      });
    }
  };

  const handleShapePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (shapeTool === 'spoid') return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // 1. Finished resizing shape
    if (isResizingShapeRef.current) {
      isResizingShapeRef.current = false;
      activeResizeHandleRef.current = null;
      resizeStartPtRef.current = null;
      resizingShapeInitRef.current = null;
      pushShapeHistory(shapes);
      return;
    }

    // 2. Finished moving shape
    if (isMovingRef.current) {
      isMovingRef.current = false;
      moveStartPtRef.current = null;
      movingShapeInitRef.current = null;
      pushShapeHistory(shapes);
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const pt = getCanvasPoint(e);
    const start = shapeStartRef.current;
    const baseCanvas = canvasRef.current;
    const baseCtx = baseCanvas?.getContext('2d');

    // 2. Finished freehand
    if (shapeTool === 'freehand') {
      if (shapePointsRef.current.length > 1) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const p of shapePointsRef.current) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }

        let finalColor = isTransparent ? 'transparent' : fillColorHex;
        if (!isTransparent && autoSurrounding && baseCtx && baseCanvas) {
          finalColor = sampleSurroundingColor(
            baseCtx,
            minX,
            minY,
            Math.max(10, maxX - minX),
            Math.max(10, maxY - minY),
            baseCanvas.width,
            baseCanvas.height
          );
        }

        const newShape: MaskShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'freehand',
          x: minX,
          y: minY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY),
          points: [...shapePointsRef.current],
          brushSize,
          fillColor: finalColor,
          feather,
          opacity,
        };

        pushShapeHistory([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
      }
      shapePointsRef.current = [];
    } else if (start) {
      // 3. Finished dragging shape
      const x = Math.min(start.x, pt.x);
      const y = Math.min(start.y, pt.y);
      const w = Math.abs(pt.x - start.x);
      const h = Math.abs(pt.y - start.y);

      if (w >= 4 && h >= 4) {
        let finalColor = isTransparent ? 'transparent' : fillColorHex;
        if (!isTransparent && autoSurrounding && baseCtx && baseCanvas) {
          finalColor = sampleSurroundingColor(
            baseCtx,
            x,
            y,
            w,
            h,
            baseCanvas.width,
            baseCanvas.height
          );
        }

        const newShape: MaskShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: shapeTool,
          x,
          y,
          width: w,
          height: h,
          fillColor: finalColor,
          feather,
          opacity,
        };

        pushShapeHistory([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
      }
    }

    shapeStartRef.current = null;
    redrawShapes(shapes, selectedShapeId);
  };

  // Apply Shapes to Base Canvas
  const handleApplyShapesToImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || shapes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (const shape of shapes) {
      drawShape(ctx, shape, false);
    }

    pushHistory();
    pushShapeHistory([]);
    setSelectedShapeId(null);

    const sCanvas = shapeCanvasRef.current;
    if (sCanvas) {
      const sCtx = sCanvas.getContext('2d');
      sCtx?.clearRect(0, 0, sCanvas.width, sCanvas.height);
    }

    toast.success('✨ 추가된 도형이 원본 이미지에 성공적으로 병합되었습니다.');
  }, [shapes, pushHistory, pushShapeHistory]);

  // Load image helpers
  const setupCanvasesWithImage = (img: HTMLImageElement) => {
    setImageDimensions({ width: img.width, height: img.height });

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }

    const sCanvas = shapeCanvasRef.current;
    if (sCanvas) {
      sCanvas.width = img.width;
      sCanvas.height = img.height;
      const sCtx = sCanvas.getContext('2d');
      sCtx?.clearRect(0, 0, sCanvas.width, sCanvas.height);
    }

    setShapes([]);
    setShapesHistory([[]]);
    setShapeHistoryIndex(0);
    setSelectedShapeId(null);
  };

  const loadSampleImage = useCallback((url: string) => {
    setImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setupCanvasesWithImage(img);
    img.src = url;
  }, []);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setupCanvasesWithImage(img);
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Export Canvas Helper (Combines base image + shapes)
  const getExportCanvas = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    if (shapes.length === 0) return canvas;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return canvas;

    expCtx.drawImage(canvas, 0, 0);
    for (const shape of shapes) {
      drawShape(expCtx, shape, false);
    }

    return exportCanvas;
  }, [shapes]);

  // Save / Download
  const handleSave = async () => {
    const canvas = getExportCanvas();
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

  // Share
  const handleShare = async () => {
    const canvas = getExportCanvas();
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
              {/* Header Info */}
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
                  {activeTab === 'one-click'
                    ? mode === 'erase'
                      ? '투명화 지우개'
                      : mode === 'fill'
                        ? '색상 채우기'
                        : '스포이드'
                    : shapeTool === 'circle'
                      ? '동그라미 추가'
                      : shapeTool === 'rect'
                        ? '네모 추가'
                        : shapeTool === 'triangle'
                          ? '세모 추가'
                          : shapeTool === 'freehand'
                            ? '자유 그리기'
                            : '스포이드'}
                  )
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {shapes.length > 0 && activeTab === 'shapes' && (
                    <Chip
                      size="small"
                      color="primary"
                      label={`도형 ${shapes.length}개 배치됨`}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  )}
                  {imageDimensions.width > 0 && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`사진 크기: ${imageDimensions.width} × ${imageDimensions.height} px`}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Viewport & Interactive Layered Canvas */}
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
                <Box
                  ref={containerRef}
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.1s ease',
                    lineHeight: 0,
                    userSelect: 'none',
                  }}
                >
                  {/* Layer 1: Base Image Canvas */}
                  <canvas
                    ref={canvasRef}
                    onClick={activeTab === 'one-click' ? handleCanvasClick : undefined}
                    style={{
                      cursor:
                        activeTab === 'one-click'
                          ? mode === 'erase'
                            ? 'crosshair'
                            : mode === 'spoid'
                              ? 'crosshair'
                              : 'pointer'
                          : 'default',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      background:
                        'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 16px 16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      borderRadius: 0,
                      display: 'block',
                    }}
                  />

                  {/* Layer 2: Shape Overlay Canvas (Supports selection, moving, live preview) */}
                  <canvas
                    ref={shapeCanvasRef}
                    onPointerDown={activeTab === 'shapes' ? handleShapePointerDown : undefined}
                    onPointerMove={activeTab === 'shapes' ? handleShapePointerMove : undefined}
                    onPointerUp={activeTab === 'shapes' ? handleShapePointerUp : undefined}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: activeTab === 'shapes' ? shapeCanvasCursor : 'default',
                      pointerEvents: activeTab === 'shapes' ? 'auto' : 'none',
                      touchAction: 'none',
                      display: 'block',
                    }}
                  />
                </Box>
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
            {/* Mode Tabs: 원클릭 변환 | 도형 추가 */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => v && setActiveTab(v)}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                minHeight: 44,
                boxShadow: (theme) => theme.customShadows?.card || 1,
                '& .MuiTabs-indicator': {
                  height: '100%',
                  borderRadius: 1.5,
                  zIndex: 0,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.lighter',
                },
                '& .MuiTab-root': {
                  flex: 1,
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  borderRadius: 1.5,
                  minHeight: 38,
                  py: 0.8,
                  zIndex: 1,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <Tab
                value="one-click"
                icon={<AutoFixHighRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="원클릭 변환"
              />
              <Tab
                value="shapes"
                icon={<CategoryRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`도형 추가${shapes.length > 0 ? ` (${shapes.length})` : ''}`}
              />
            </Tabs>

            {/* Mode-Specific Panel */}
            {activeTab === 'one-click' ? (
              <ColorOneClickPanel
                onToggleBackground={handleToggleBackground}
                mode={mode}
                onChangeMode={setMode}
                fillColorHex={fillColorHex}
                onChangeFillColorHex={setFillColorHex}
                quickColors={QUICK_COLORS}
                tolerance={tolerance}
                onChangeTolerance={setTolerance}
              />
            ) : (
              <ColorShapePanel
                shapeTool={shapeTool}
                onChangeShapeTool={setShapeTool}
                onAddShape={handleAddShape}
                isTransparent={isTransparent}
                onToggleTransparent={setIsTransparent}
                fillColorHex={fillColorHex}
                onChangeFillColorHex={setFillColorHex}
                quickColors={QUICK_COLORS}
                autoSurrounding={autoSurrounding}
                onToggleAutoSurrounding={setAutoSurrounding}
                feather={feather}
                onChangeFeather={setFeather}
                opacity={opacity}
                onChangeOpacity={setOpacity}
                brushSize={brushSize}
                onChangeBrushSize={setBrushSize}
                shapes={shapes}
                selectedShapeId={selectedShapeId}
                onSelectShape={setSelectedShapeId}
                onDeleteShape={(id) => {
                  const next = shapes.filter((s) => s.id !== id);
                  pushShapeHistory(next);
                  if (selectedShapeId === id) setSelectedShapeId(null);
                  toast.success('도형이 삭제되었습니다.');
                }}
                onClearShapes={() => {
                  pushShapeHistory([]);
                  setSelectedShapeId(null);
                  toast.info('추가된 도형이 모두 삭제되었습니다.');
                }}
                onApplyShapesToImage={handleApplyShapesToImage}
                onUpdateSelectedShape={handleUpdateSelectedShape}
                onCommitShapeHistory={handleCommitShapeHistory}
                onSampleSurroundingForSelected={handleSampleSurroundingForSelected}
              />
            )}

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
                onClick={() => {
                  if (activeTab === 'shapes') {
                    handleShapeUndo();
                  } else {
                    handleUndo();
                  }
                }}
                disabled={activeTab === 'shapes' ? shapeHistoryIndex <= 0 : history.length <= 1}
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
                  setShapes([]);
                  setSelectedShapeId(null);
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
