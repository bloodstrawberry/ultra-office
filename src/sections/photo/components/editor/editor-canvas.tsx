'use client';

import type { TabCategory, PhotoEditorState } from './editor-types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { processPixelData, renderEditorOverlays } from './editor-processor';

// ----------------------------------------------------------------------

interface EditorCanvasProps {
  originalImage: HTMLImageElement | null;
  state: PhotoEditorState;
  currentTab: TabCategory;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isComparing: boolean;
  onUpdateState: (newState: PhotoEditorState) => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function EditorCanvas({
  originalImage,
  state,
  currentTab,
  zoom,
  setZoom,
  isComparing,
  onUpdateState,
  maskCanvasRef,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pan Offset
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Brush / Drawing in progress
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<Array<{ x: number; y: number }>>([]);

  // Active dragging layer
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const layerDragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // 1. Initial Render & Offscreen Buffer Setup
  useEffect(() => {
    if (!originalImage) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offscreenCanvasRef.current;
    offCanvas.width = originalImage.naturalWidth || originalImage.width;
    offCanvas.height = originalImage.naturalHeight || originalImage.height;

    // Mask canvas matching resolution
    if (maskCanvasRef.current) {
      maskCanvasRef.current.width = offCanvas.width;
      maskCanvasRef.current.height = offCanvas.height;
    }
  }, [originalImage, maskCanvasRef]);

  // 2. Render Pipeline
  const renderPipeline = useCallback(() => {
    if (!originalImage || !mainCanvasRef.current || !offscreenCanvasRef.current) return;

    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = originalImage.naturalWidth || originalImage.width;
    const height = originalImage.naturalHeight || originalImage.height;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 2-1. If user is comparing (Before mode), draw raw original image
    if (isComparing) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(originalImage, 0, 0);
      return;
    }

    // 2-2. Draw original onto offscreen canvas to extract pixel data
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.clearRect(0, 0, width, height);

    // Apply Geometric Transforms: Rotation, Flip, Straighten, Perspective, Lens Distortion
    offCtx.save();
    offCtx.translate(width / 2, height / 2);

    if (state.crop.rotation) {
      offCtx.rotate((state.crop.rotation * Math.PI) / 180);
    }
    if (state.crop.straighten) {
      offCtx.rotate((state.crop.straighten * Math.PI) / 180);
    }
    if (state.crop.flipH || state.crop.flipV) {
      offCtx.scale(state.crop.flipH ? -1 : 1, state.crop.flipV ? -1 : 1);
    }
    offCtx.drawImage(originalImage, -width / 2, -height / 2, width, height);
    offCtx.restore();

    // 2-3. Read pixel buffer and execute color/tone/detail processing
    const imgData = offCtx.getImageData(0, 0, width, height);

    let selectiveMaskData: Uint8ClampedArray | null = null;
    if (state.selective.active && maskCanvasRef.current) {
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        selectiveMaskData = mCtx.getImageData(0, 0, width, height).data;
      }
    }

    // Execute core pixel engine
    processPixelData(imgData.data, width, height, state, selectiveMaskData);
    ctx.putImageData(imgData, 0, 0);

    // 2-4. Render Overlays (Light leaks, frames, text layers, stickers, drawings, mosaic)
    renderEditorOverlays(ctx, width, height, state);
  }, [originalImage, state, isComparing, maskCanvasRef]);

  useEffect(() => {
    renderPipeline();
  }, [renderPipeline]);

  // 3. Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.max(0.2, Math.min(3.0, prev + delta)));
  };

  // 4. Pointer Down: Pan, Draw Brush, or Layer Select
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mainCanvasRef.current) return;

    // Middle button or Space key down -> Pan
    if (e.button === 1 || e.altKey) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = mainCanvasRef.current.width / rect.width;
    const scaleY = mainCanvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const normX = clickX / mainCanvasRef.current.width;
    const normY = clickY / mainCanvasRef.current.height;

    // Check if drawing mode is active (decorate drawing, or AI eraser, or selective brush)
    if (state.decorate.drawingActive) {
      isDrawingRef.current = true;
      currentPathRef.current = [{ x: normX, y: normY }];
      return;
    }

    if (state.ai.eraserActive && maskCanvasRef.current) {
      isDrawingRef.current = true;
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = '#ff0000';
        mCtx.beginPath();
        mCtx.arc(clickX, clickY, state.ai.eraserBrushSize, 0, Math.PI * 2);
        mCtx.fill();
        renderPipeline();
      }
      return;
    }

    if (state.selective.active && state.selective.maskType === 'brush' && maskCanvasRef.current) {
      isDrawingRef.current = true;
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = '#ffffff';
        mCtx.beginPath();
        mCtx.arc(clickX, clickY, state.selective.brushRadius, 0, Math.PI * 2);
        mCtx.fill();
        renderPipeline();
      }
      return;
    }

    // Check layer selection
    if (state.decorate.layers.length > 0) {
      for (let i = state.decorate.layers.length - 1; i >= 0; i--) {
        const layer = state.decorate.layers[i];
        const dist = Math.sqrt((layer.x - normX) ** 2 + (layer.y - normY) ** 2);
        if (dist < 0.15) {
          setDraggingLayerId(layer.id);
          layerDragOffsetRef.current = { dx: normX - layer.x, dy: normY - layer.y };
          onUpdateState({ ...state, decorate: { ...state.decorate, selectedLayerId: layer.id } });
          return;
        }
      }
    }

    // Default: Pan on drag
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // 5. Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!mainCanvasRef.current) return;
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = mainCanvasRef.current.width / rect.width;
    const scaleY = mainCanvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const normX = clickX / mainCanvasRef.current.width;
    const normY = clickY / mainCanvasRef.current.height;

    // Drawing
    if (isDrawingRef.current) {
      if (state.decorate.drawingActive) {
        currentPathRef.current.push({ x: normX, y: normY });
        // Real-time stroke feedback
        const ctx = mainCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = state.decorate.currentBrushColor;
          ctx.lineWidth = state.decorate.currentBrushWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          const p = currentPathRef.current;
          if (p.length > 1) {
            ctx.moveTo(
              p[p.length - 2].x * mainCanvasRef.current.width,
              p[p.length - 2].y * mainCanvasRef.current.height
            );
            ctx.lineTo(
              p[p.length - 1].x * mainCanvasRef.current.width,
              p[p.length - 1].y * mainCanvasRef.current.height
            );
            ctx.stroke();
          }
        }
      } else if (state.ai.eraserActive && maskCanvasRef.current) {
        const mCtx = maskCanvasRef.current.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = '#ff0000';
          mCtx.beginPath();
          mCtx.arc(clickX, clickY, state.ai.eraserBrushSize, 0, Math.PI * 2);
          mCtx.fill();
          renderPipeline();
        }
      } else if (state.selective.active && maskCanvasRef.current) {
        const mCtx = maskCanvasRef.current.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = '#ffffff';
          mCtx.beginPath();
          mCtx.arc(clickX, clickY, state.selective.brushRadius, 0, Math.PI * 2);
          mCtx.fill();
          renderPipeline();
        }
      }
      return;
    }

    // Moving selected layer
    if (draggingLayerId) {
      const nextLayers = state.decorate.layers.map((l) => {
        if (l.id === draggingLayerId) {
          return {
            ...l,
            x: Math.max(0, Math.min(1, normX - layerDragOffsetRef.current.dx)),
            y: Math.max(0, Math.min(1, normY - layerDragOffsetRef.current.dy)),
          };
        }
        return l;
      });
      onUpdateState({ ...state, decorate: { ...state.decorate, layers: nextLayers } });
    }
  };

  // 6. Pointer Up
  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
    }

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (state.decorate.drawingActive && currentPathRef.current.length > 1) {
        const newPath = {
          id: `path-${Date.now()}`,
          points: [...currentPathRef.current],
          color: state.decorate.currentBrushColor,
          width: state.decorate.currentBrushWidth,
          type: state.decorate.currentBrushType,
          opacity: 1.0,
        };
        onUpdateState({
          ...state,
          decorate: {
            ...state.decorate,
            drawingPaths: [...state.decorate.drawingPaths, newPath],
          },
        });
        currentPathRef.current = [];
      }
    }

    if (draggingLayerId) {
      setDraggingLayerId(null);
    }
  };

  return (
    <Box
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      sx={{
        flex: '1 1 auto',
        height: '100%',
        bgcolor: '#0a0d14',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: state.decorate.drawingActive
          ? 'crosshair'
          : state.ai.eraserActive
            ? 'crosshair'
            : isPanningRef.current
              ? 'grabbing'
              : 'default',
        userSelect: 'none',
      }}
    >
      {/* 바둑판 투명 배경 그리드 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          pointerEvents: 'none',
        }}
      />

      {/* 메인 캔버스 렌더링 컨테이너 */}
      <Box
        sx={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanningRef.current ? 'none' : 'transform 0.05s ease-out',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'inline-block',
          lineHeight: 0,
        }}
      >
        <canvas
          ref={mainCanvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* 하단 플로팅 힌트 바 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          color: '#FFFFFF',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          display: 'flex',
          gap: 1.5,
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="caption" sx={{ color: 'grey.300' }}>
          🔍 휠: 줌 ({Math.round(zoom * 100)}%)
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.300' }}>
          ✋ 드래그: 이동
        </Typography>
        {isComparing && (
          <Typography variant="caption" sx={{ color: 'warning.light', fontWeight: 800 }}>
            ⚡ 원본 보기 활성화됨
          </Typography>
        )}
      </Box>
    </Box>
  );
}
