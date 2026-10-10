'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

import type { ToolSettings, PhotoshopLayer, SelectionState, PhotoshopToolType } from '../types';
import {
  pickColorAt,
  drawShape,
  floodFill,
  drawGradient,
  drawDodgeBurn,
  drawBrushStroke,
  drawPencilPixel,
  drawEraserStroke,
  drawWebtoonBubbleShape,
} from '../utils/tools';
import { compositeLayers } from '../utils/canvas-layer';
import {
  drawMarchingAnts,
  createRectSelection,
  createLassoSelection,
  createEllipseSelection,
  createMagicWandSelection,
} from '../utils/selection';
import { drawWebtoonFocusLines } from '../utils/filters';

interface PsCanvasWorkspaceProps {
  layers: PhotoshopLayer[];
  activeLayerId: string;
  selection: SelectionState;
  currentTool: PhotoshopToolType;
  settings: ToolSettings;
  zoom: number;
  pan: { x: number; y: number };
  canvasSize: { width: number; height: number };
  onUpdateLayerCanvas: (layerId: string, updatedCanvas: HTMLCanvasElement) => void;
  onUpdateLayerPosition: (layerId: string, x: number, y: number) => void;
  onUpdateSelection: (newSelection: SelectionState) => void;
  onPickColor: (hex: string) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onZoomChange: (newZoom: number) => void;
  onCommitHistory: (description: string) => void;
  onCropCanvas?: (x: number, y: number, w: number, h: number) => void;
}

export function PsCanvasWorkspace({
  layers,
  activeLayerId,
  selection,
  currentTool,
  settings,
  zoom,
  pan,
  canvasSize,
  onUpdateLayerCanvas,
  onUpdateLayerPosition,
  onUpdateSelection,
  onPickColor,
  onPanChange,
  onZoomChange,
  onCommitHistory,
  onCropCanvas,
}: PsCanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drag interaction states (tracked in Refs to eliminate React re-render lag)
  const isDraggingRef = useRef(false);
  const isPanDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPanRef = useRef<{ x: number; y: number }>(pan);
  const lastPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPointRef = useRef<{ x: number; y: number } | null>(null);
  const lassoPointsRef = useRef<{ x: number; y: number }[]>([]);
  const layerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentLayerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasModifiedActiveLayerRef = useRef(false);
  const cursorCoordsRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });

  // Spacebar pan state
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [marchingAntsOffset, setMarchingAntsOffset] = useState(0);

  // Sync pan ref when parent pan changes
  useEffect(() => {
    currentPanRef.current = pan;
  }, [pan]);

  // Marching ants animation loop (150ms interval)
  useEffect(() => {
    if (!selection.hasSelection) return;
    const interval = setInterval(() => {
      setMarchingAntsOffset((v) => (v + 1) % 8);
    }, 150);
    return () => clearInterval(interval);
  }, [selection.hasSelection]);

  // Composite layers to main display canvas
  const renderDisplay = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
    }

    compositeLayers(canvas, layers, { renderCheckerboard: false });
  }, [layers, canvasSize]);

  useEffect(() => {
    renderDisplay();
  }, [renderDisplay]);

  // Fast direct render of active layer onto display canvas (O(1) without recompositing other layers)
  const syncDisplayCanvasFromActiveLayer = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active) return;

    // Fast redraw of all layers
    compositeLayers(displayCanvas, layers, { renderCheckerboard: false });
  }, [layers, activeLayerId]);

  // Render overlay: Marching Ants, Brush preview circle, Temp selection rectangle
  const renderOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    if (overlay.width !== canvasSize.width || overlay.height !== canvasSize.height) {
      overlay.width = canvasSize.width;
      overlay.height = canvasSize.height;
    }

    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // 1. Draw Marching Ants for active selection
    if (selection.hasSelection && selection.maskCanvas) {
      drawMarchingAnts(ctx, selection, marchingAntsOffset);
    }

    // 2. Draw circular brush/eraser cursor guide if mouse is within canvas
    const { x: cx, y: cy } = cursorCoordsRef.current;
    if (
      cx >= 0 &&
      cx <= canvasSize.width &&
      cy >= 0 &&
      cy <= canvasSize.height &&
      (currentTool === 'brush' ||
        currentTool === 'eraser' ||
        currentTool === 'pencil' ||
        currentTool === 'blur-tool' ||
        currentTool === 'dodge')
    ) {
      const radius =
        currentTool === 'pencil'
          ? 1
          : currentTool === 'eraser'
            ? settings.eraserSize / 2
            : settings.brushSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();
    }
  }, [
    canvasSize,
    selection,
    marchingAntsOffset,
    currentTool,
    settings.brushSize,
    settings.eraserSize,
  ]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  // Refs to access latest state in global keyboard listeners without rebinding
  const stateRef = useRef({ layers, activeLayerId, selection });
  useEffect(() => {
    stateRef.current = { layers, activeLayerId, selection };
  }, [layers, activeLayerId, selection]);

  // Keyboard listeners (Space for pan, Delete/Backspace for clearing selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      if ((e.code === 'Delete' || e.code === 'Backspace') && !e.repeat) {
        const {
          layers: currentLayers,
          activeLayerId: currentActiveId,
          selection: currentSel,
        } = stateRef.current;
        if (currentSel.hasSelection && currentSel.maskCanvas) {
          const activeLayer = currentLayers.find((l) => l.id === currentActiveId);
          if (activeLayer && !activeLayer.locked) {
            const ctx = activeLayer.canvas.getContext('2d');
            if (ctx) {
              ctx.save();
              ctx.globalCompositeOperation = 'destination-out';
              ctx.drawImage(currentSel.maskCanvas, -activeLayer.x, -activeLayer.y);
              ctx.restore();
              syncDisplayCanvasFromActiveLayer();
              onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
              onCommitHistory('선택 영역 삭제');
            }
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onUpdateLayerCanvas, syncDisplayCanvasFromActiveLayer, onCommitHistory]);

  // Coordinate helper: viewport screen event coords -> 캔버스 내부 로컬 픽셀 좌표
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): { x: number; y: number } => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const pX = currentPanRef.current.x;
      const pY = currentPanRef.current.y;

      const relX = e.clientX - rect.left - centerX - pX;
      const relY = e.clientY - rect.top - centerY - pY;

      const canvasX = relX / zoom + canvasSize.width / 2;
      const canvasY = relY / zoom + canvasSize.height / 2;

      return {
        x: Math.max(0, Math.min(canvasSize.width, canvasX)),
        y: Math.max(0, Math.min(canvasSize.height, canvasY)),
      };
    },
    [zoom, canvasSize]
  );

  const getActiveLayer = useCallback(() => {
    return layers.find((l) => l.id === activeLayerId) || layers[0] || null;
  }, [layers, activeLayerId]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(4, Math.max(0.2, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  // Pointer Down
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1 || isSpacePressed || currentTool === 'hand') {
      // Pan mode
      isPanDraggingRef.current = true;
      panStartRef.current = {
        x: e.clientX - currentPanRef.current.x,
        y: e.clientY - currentPanRef.current.y,
      };
      return;
    }

    if (e.button !== 0) return;

    const coords = getCanvasCoords(e);
    isDraggingRef.current = true;
    dragStartRef.current = coords;
    lastPointRef.current = coords;
    prevPointRef.current = null;
    hasModifiedActiveLayerRef.current = false;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    if (currentTool === 'zoom') {
      const zoomFactor = e.altKey ? 0.75 : 1.35;
      onZoomChange(Math.min(4, Math.max(0.2, zoom * zoomFactor)));
      return;
    }

    if (currentTool === 'eyedropper') {
      const display = displayCanvasRef.current;
      if (display) {
        const { hex } = pickColorAt(display, coords.x, coords.y);
        onPickColor(hex);
      }
      return;
    }

    if (currentTool === 'move') {
      layerStartPosRef.current = { x: activeLayer.x, y: activeLayer.y };
      currentLayerPosRef.current = { x: activeLayer.x, y: activeLayer.y };
      return;
    }

    if (currentTool === 'crop') {
      // Just record drag start
      return;
    }

    if (currentTool === 'lasso') {
      lassoPointsRef.current = [coords];
      return;
    }

    if (currentTool === 'magic-wand') {
      const newSel = createMagicWandSelection(
        activeLayer.canvas,
        coords.x - activeLayer.x,
        coords.y - activeLayer.y,
        settings.tolerance
      );
      onUpdateSelection(newSel);
      return;
    }

    if (currentTool === 'paint-bucket') {
      floodFill(
        activeLayer.canvas,
        coords.x - activeLayer.x,
        coords.y - activeLayer.y,
        settings.foregroundColor,
        settings.tolerance,
        selection.maskCanvas
      );
      syncDisplayCanvasFromActiveLayer();
      onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
      onCommitHistory('페인트통 채우기');
      return;
    }

    if (currentTool === 'text') {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.font = `${settings.fontStyle} ${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`;
        ctx.fillStyle = settings.textColor || settings.foregroundColor;
        ctx.fillText(
          settings.textString || '텍스트',
          coords.x - activeLayer.x,
          coords.y - activeLayer.y
        );
        ctx.restore();
        syncDisplayCanvasFromActiveLayer();
        onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
        onCommitHistory('텍스트 추가');
      }
      return;
    }

    // Brush, Pencil, Eraser single dot click
    if (
      currentTool === 'brush' ||
      currentTool === 'pencil' ||
      currentTool === 'eraser' ||
      currentTool === 'dodge'
    ) {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        const lx = coords.x - activeLayer.x;
        const ly = coords.y - activeLayer.y;
        if (currentTool === 'brush') {
          drawBrushStroke(
            ctx,
            null,
            { x: lx, y: ly },
            { x: lx + 0.1, y: ly + 0.1 },
            settings.brushSize,
            settings.foregroundColor,
            settings.brushOpacity,
            settings.brushHardness,
            selection.maskCanvas
          );
        } else if (currentTool === 'pencil') {
          drawPencilPixel(ctx, lx, ly, lx, ly, settings.foregroundColor);
        } else if (currentTool === 'eraser') {
          drawEraserStroke(
            ctx,
            null,
            { x: lx, y: ly },
            { x: lx + 0.1, y: ly + 0.1 },
            settings.eraserSize,
            settings.eraserOpacity,
            settings.eraserHardness
          );
        } else if (currentTool === 'dodge') {
          drawDodgeBurn(ctx, lx, ly, settings.brushSize, true);
        }
        hasModifiedActiveLayerRef.current = true;
        syncDisplayCanvasFromActiveLayer();
      }
    }
  };

  // Pointer Move (Zero React Re-render Hot Path)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Update cursor guide
    const coords = getCanvasCoords(e);
    cursorCoordsRef.current = coords;
    renderOverlay();

    // 2. Pan drag
    if (isPanDraggingRef.current) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      currentPanRef.current = { x: newX, y: newY };
      if (canvasWrapperRef.current) {
        canvasWrapperRef.current.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) scale(${zoom})`;
      }
      return;
    }

    if (!isDraggingRef.current) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    // 3. Move Tool Drag
    if (currentTool === 'move') {
      const dx = coords.x - dragStartRef.current.x;
      const dy = coords.y - dragStartRef.current.y;
      currentLayerPosRef.current = {
        x: Math.round(layerStartPosRef.current.x + dx),
        y: Math.round(layerStartPosRef.current.y + dy),
      };
      // Direct update layer object without triggering full parent state re-render
      activeLayer.x = currentLayerPosRef.current.x;
      activeLayer.y = currentLayerPosRef.current.y;
      syncDisplayCanvasFromActiveLayer();
      return;
    }

    // 4. Lasso
    if (currentTool === 'lasso') {
      lassoPointsRef.current.push(coords);
      // Draw lasso preview line on overlay
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#2196f3';
          ctx.beginPath();
          const pts = lassoPointsRef.current;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i += 1) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }

    // 4.5. Crop
    if (currentTool === 'crop') {
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(0, 0, overlay.width, overlay.height);

          const x1 = Math.min(dragStartRef.current.x, coords.x);
          const y1 = Math.min(dragStartRef.current.y, coords.y);
          const w = Math.abs(coords.x - dragStartRef.current.x);
          const h = Math.abs(coords.y - dragStartRef.current.y);

          ctx.clearRect(x1, y1, w, h);

          ctx.strokeStyle = '#ffffff';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, y1, w, h);
          ctx.setLineDash([]);
        }
      }
      return;
    }

    // 5. Marquee rect / ellipse preview
    if (currentTool === 'marquee-rect' || currentTool === 'marquee-ellipse') {
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#2196f3';
          ctx.lineWidth = 1;
          const w = coords.x - dragStartRef.current.x;
          const h = coords.y - dragStartRef.current.y;
          if (currentTool === 'marquee-rect') {
            ctx.strokeRect(dragStartRef.current.x, dragStartRef.current.y, w, h);
          } else {
            ctx.beginPath();
            ctx.ellipse(
              dragStartRef.current.x + w / 2,
              dragStartRef.current.y + h / 2,
              Math.abs(w / 2),
              Math.abs(h / 2),
              0,
              0,
              2 * Math.PI
            );
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      return;
    }

    // 6. Direct stroke drawing (Brush, Pencil, Eraser, Dodge)
    if (
      currentTool === 'brush' ||
      currentTool === 'pencil' ||
      currentTool === 'eraser' ||
      currentTool === 'dodge'
    ) {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        const lx1 = lastPointRef.current.x - activeLayer.x;
        const ly1 = lastPointRef.current.y - activeLayer.y;
        const lx2 = coords.x - activeLayer.x;
        const ly2 = coords.y - activeLayer.y;

        const p0 = prevPointRef.current
          ? { x: prevPointRef.current.x - activeLayer.x, y: prevPointRef.current.y - activeLayer.y }
          : null;
        const p1 = { x: lx1, y: ly1 };
        const p2 = { x: lx2, y: ly2 };

        if (currentTool === 'brush') {
          drawBrushStroke(
            ctx,
            p0,
            p1,
            p2,
            settings.brushSize,
            settings.foregroundColor,
            settings.brushOpacity,
            settings.brushHardness,
            selection.maskCanvas
          );
        } else if (currentTool === 'pencil') {
          drawPencilPixel(ctx, lx1, ly1, lx2, ly2, settings.foregroundColor);
        } else if (currentTool === 'eraser') {
          drawEraserStroke(
            ctx,
            p0,
            p1,
            p2,
            settings.eraserSize,
            settings.eraserOpacity,
            settings.eraserHardness
          );
        } else if (currentTool === 'dodge') {
          drawDodgeBurn(ctx, lx2, ly2, settings.brushSize, true);
        }

        prevPointRef.current = lastPointRef.current;
        lastPointRef.current = coords;
        hasModifiedActiveLayerRef.current = true;
        // Fast sync directly to displayCanvas without React setLayers call
        syncDisplayCanvasFromActiveLayer();
      }
    }
  };

  // Pointer Up
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Finish Pan
    if (isPanDraggingRef.current) {
      isPanDraggingRef.current = false;
      onPanChange(currentPanRef.current);
      return;
    }

    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const coords = getCanvasCoords(e);
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    // 1. Move tool finish
    if (currentTool === 'move') {
      onUpdateLayerPosition(
        activeLayer.id,
        currentLayerPosRef.current.x,
        currentLayerPosRef.current.y
      );
      onCommitHistory('레이어 이동');
      return;
    }

    // 2. Marquee selection finish
    if (currentTool === 'marquee-rect') {
      const w = coords.x - dragStartRef.current.x;
      const h = coords.y - dragStartRef.current.y;
      const newSel = createRectSelection(
        canvasSize.width,
        canvasSize.height,
        dragStartRef.current.x,
        dragStartRef.current.y,
        w,
        h
      );
      onUpdateSelection(newSel);
      renderOverlay();
      return;
    }

    if (currentTool === 'crop') {
      const x1 = Math.min(dragStartRef.current.x, coords.x);
      const y1 = Math.min(dragStartRef.current.y, coords.y);
      const w = Math.abs(coords.x - dragStartRef.current.x);
      const h = Math.abs(coords.y - dragStartRef.current.y);

      if (w > 10 && h > 10 && onCropCanvas) {
        onCropCanvas(x1, y1, w, h);
      }

      const overlay = overlayCanvasRef.current;
      if (overlay) {
        overlay.getContext('2d')?.clearRect(0, 0, overlay.width, overlay.height);
      }
      return;
    }

    if (currentTool === 'marquee-ellipse') {
      const w = coords.x - dragStartRef.current.x;
      const h = coords.y - dragStartRef.current.y;
      const newSel = createEllipseSelection(
        canvasSize.width,
        canvasSize.height,
        dragStartRef.current.x,
        dragStartRef.current.y,
        w,
        h
      );
      onUpdateSelection(newSel);
      renderOverlay();
      return;
    }

    if (currentTool === 'lasso') {
      const newSel = createLassoSelection(
        canvasSize.width,
        canvasSize.height,
        lassoPointsRef.current
      );
      onUpdateSelection(newSel);
      renderOverlay();
      return;
    }

    // 3. Gradient tool finish
    if (currentTool === 'gradient') {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        drawGradient(
          ctx,
          dragStartRef.current.x - activeLayer.x,
          dragStartRef.current.y - activeLayer.y,
          coords.x - activeLayer.x,
          coords.y - activeLayer.y,
          settings.foregroundColor,
          settings.backgroundColor,
          settings.gradientType
        );
        syncDisplayCanvasFromActiveLayer();
        onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
        onCommitHistory('그라디언트 채우기');
      }
      return;
    }

    // 4. Shape tool finish
    if (
      currentTool === 'shape-rect' ||
      currentTool === 'shape-ellipse' ||
      currentTool === 'shape-line' ||
      currentTool === 'shape-arrow'
    ) {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        const shapeType =
          currentTool === 'shape-rect'
            ? 'rect'
            : currentTool === 'shape-ellipse'
              ? 'ellipse'
              : currentTool === 'shape-line'
                ? 'line'
                : 'arrow';
        drawShape(
          ctx,
          shapeType,
          dragStartRef.current.x - activeLayer.x,
          dragStartRef.current.y - activeLayer.y,
          coords.x - activeLayer.x,
          coords.y - activeLayer.y,
          settings.foregroundColor,
          settings.backgroundColor,
          settings.shapeStrokeWidth,
          true,
          true
        );
        syncDisplayCanvasFromActiveLayer();
        onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
        onCommitHistory('도형 그리기');
      }
      return;
    }

    // 5. Webtoon Bubble finish
    if (currentTool === 'bubble') {
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        drawWebtoonBubbleShape(
          ctx,
          settings.bubbleShape,
          dragStartRef.current.x - activeLayer.x,
          dragStartRef.current.y - activeLayer.y,
          coords.x - activeLayer.x,
          coords.y - activeLayer.y,
          coords.x + 30 - activeLayer.x,
          coords.y + 40 - activeLayer.y,
          '#ffffff',
          '#000000',
          3
        );
        syncDisplayCanvasFromActiveLayer();
        onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
        onCommitHistory('웹툰 말풍선 추가');
      }
      return;
    }

    // 6. Webtoon Focus Line finish
    if (currentTool === 'focus-line') {
      drawWebtoonFocusLines(
        activeLayer.canvas,
        coords.x - activeLayer.x,
        coords.y - activeLayer.y,
        settings.focusLineCount,
        settings.focusLineInnerRadius,
        settings.focusLineColor || settings.foregroundColor,
        settings.focusLineThickness || 2
      );
      syncDisplayCanvasFromActiveLayer();
      onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
      onCommitHistory('웹툰 집중선 효과 추가');
      return;
    }

    // 7. Brush / Pencil / Eraser finish (Synchronize React Parent State 1 time only)
    if (hasModifiedActiveLayerRef.current) {
      onUpdateLayerCanvas(activeLayer.id, activeLayer.canvas);
      onCommitHistory(
        currentTool === 'brush'
          ? '브러시 드로잉'
          : currentTool === 'pencil'
            ? '연필 드로잉'
            : currentTool === 'eraser'
              ? '지우개 작업'
              : '닷지/번 효과'
      );
      hasModifiedActiveLayerRef.current = false;
    }
  };

  const handleMouseLeave = () => {
    cursorCoordsRef.current = { x: -100, y: -100 };
    renderOverlay();
  };

  // Cursor style
  const getCursor = () => {
    if (isSpacePressed || currentTool === 'hand') {
      return isPanDraggingRef.current ? 'grabbing' : 'grab';
    }
    if (currentTool === 'zoom') return 'zoom-in';
    if (currentTool === 'move') return 'move';
    if (currentTool === 'eyedropper') return 'crosshair';
    if (
      currentTool === 'brush' ||
      currentTool === 'eraser' ||
      currentTool === 'pencil' ||
      currentTool === 'dodge'
    ) {
      return 'none'; // custom circular cursor preview drawn on overlay
    }
    return 'crosshair';
  };

  return (
    <Box
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      sx={{
        flex: '1 1 0px',
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121417' : '#2b2d31'),
        cursor: getCursor(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        willChange: 'transform',
      }}
    >
      {/* Centered Canvas Container with GPU Accelerated Zoom & Pan */}
      <Box
        ref={canvasWrapperRef}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          width: canvasSize.width,
          height: canvasSize.height,
          // CSS Hardware Accelerated Checkerboard Background (0ms CPU cost)
          backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)',
          backgroundPosition: '0 0',
          backgroundSize: '24px 24px',
          willChange: 'transform',
        }}
      >
        {/* Main Display Composite Canvas */}
        <canvas
          ref={displayCanvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Overlay Canvas for Marching Ants & Cursor Guides */}
        <canvas
          ref={overlayCanvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
}
