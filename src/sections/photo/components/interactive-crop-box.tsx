'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteractiveCropBoxProps {
  imageSrc: string;
  naturalWidth?: number;
  naturalHeight?: number;
  aspectRatio?: number; // width / height or null for free
  crop: CropRect;
  onChange: (crop: CropRect) => void;
  minWidth?: number;
  minHeight?: number;
}

type DragMode = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null;

export function InteractiveCropBox({
  imageSrc,
  naturalWidth,
  naturalHeight,
  aspectRatio,
  crop,
  onChange,
  minWidth = 1,
  minHeight = 1,
}: InteractiveCropBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
  } | null>(null);

  const [imageLayout, setImageLayout] = useState<{
    renderX: number;
    renderY: number;
    renderW: number;
    renderH: number;
    naturalW: number;
    naturalH: number;
  }>({
    renderX: 0,
    renderY: 0,
    renderW: 0,
    renderH: 0,
    naturalW: naturalWidth || 800,
    naturalH: naturalHeight || 800,
  });

  const updateImageLayout = useCallback(() => {
    if (!containerRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();
    if (!contRect.width || !contRect.height) return;

    let natW = naturalWidth || 0;
    let natH = naturalHeight || 0;

    if (!natW || !natH) {
      if (imageRef.current && imageRef.current.naturalWidth > 0) {
        natW = imageRef.current.naturalWidth;
        natH = imageRef.current.naturalHeight;
      } else {
        natW = crop.width || 800;
        natH = crop.height || 800;
      }
    }

    const scale = Math.min(contRect.width / natW, contRect.height / natH);
    const renderW = Math.round(natW * scale);
    const renderH = Math.round(natH * scale);
    const renderX = Math.round((contRect.width - renderW) / 2);
    const renderY = Math.round((contRect.height - renderH) / 2);

    setImageLayout({
      renderX,
      renderY,
      renderW,
      renderH,
      naturalW: natW,
      naturalH: natH,
    });
  }, [naturalWidth, naturalHeight, crop.width, crop.height]);

  useEffect(() => {
    updateImageLayout();
    window.addEventListener('resize', updateImageLayout);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        updateImageLayout();
      });
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateImageLayout);
      observer?.disconnect();
    };
  }, [updateImageLayout]);

  const handlePointerDown = (mode: DragMode, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragMode(mode);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.width,
      cropH: crop.height,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode || !dragStart) return;

    const natW = imageLayout.naturalW;
    const natH = imageLayout.naturalH;
    if (natW <= 0 || natH <= 0 || imageLayout.renderW <= 0) return;

    const scaleNatToRender = imageLayout.renderW / natW;
    const dx = (e.clientX - dragStart.mouseX) / scaleNatToRender;
    const dy = (e.clientY - dragStart.mouseY) / scaleNatToRender;

    let newX = dragStart.cropX;
    let newY = dragStart.cropY;
    let newW = dragStart.cropW;
    let newH = dragStart.cropH;

    const ar = aspectRatio && aspectRatio > 0 ? aspectRatio : null;

    if (dragMode === 'move') {
      newX = Math.max(0, Math.min(natW - dragStart.cropW, dragStart.cropX + dx));
      newY = Math.max(0, Math.min(natH - dragStart.cropH, dragStart.cropY + dy));
      newW = dragStart.cropW;
      newH = dragStart.cropH;
    } else if (dragMode === 'se') {
      const anchorX = dragStart.cropX;
      const anchorY = dragStart.cropY;
      const maxW = natW - anchorX;
      const maxH = natH - anchorY;
      if (ar) {
        const deltaW = Math.abs(dx) > Math.abs(dy * ar) ? dx : dy * ar;
        let targetW = dragStart.cropW + deltaW;
        if (targetW > maxW) targetW = maxW;
        if (targetW / ar > maxH) targetW = maxH * ar;
        targetW = Math.max(minWidth, targetW);
        newW = targetW;
        newH = targetW / ar;
        newX = anchorX;
        newY = anchorY;
      } else {
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW + dx));
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH + dy));
        newX = anchorX;
        newY = anchorY;
      }
    } else if (dragMode === 'sw') {
      const anchorRight = dragStart.cropX + dragStart.cropW;
      const anchorY = dragStart.cropY;
      const maxW = anchorRight;
      const maxH = natH - anchorY;
      if (ar) {
        const deltaW = Math.abs(dx) > Math.abs(dy * ar) ? -dx : dy * ar;
        let targetW = dragStart.cropW + deltaW;
        if (targetW > maxW) targetW = maxW;
        if (targetW / ar > maxH) targetW = maxH * ar;
        targetW = Math.max(minWidth, targetW);
        newW = targetW;
        newH = targetW / ar;
        newX = anchorRight - targetW;
        newY = anchorY;
      } else {
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW - dx));
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH + dy));
        newX = anchorRight - newW;
        newY = anchorY;
      }
    } else if (dragMode === 'ne') {
      const anchorX = dragStart.cropX;
      const anchorBottom = dragStart.cropY + dragStart.cropH;
      const maxW = natW - anchorX;
      const maxH = anchorBottom;
      if (ar) {
        const deltaW = Math.abs(dx) > Math.abs(dy * ar) ? dx : -dy * ar;
        let targetW = dragStart.cropW + deltaW;
        if (targetW > maxW) targetW = maxW;
        if (targetW / ar > maxH) targetW = maxH * ar;
        targetW = Math.max(minWidth, targetW);
        newW = targetW;
        newH = targetW / ar;
        newX = anchorX;
        newY = anchorBottom - targetW / ar;
      } else {
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW + dx));
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH - dy));
        newX = anchorX;
        newY = anchorBottom - newH;
      }
    } else if (dragMode === 'nw') {
      const anchorRight = dragStart.cropX + dragStart.cropW;
      const anchorBottom = dragStart.cropY + dragStart.cropH;
      const maxW = anchorRight;
      const maxH = anchorBottom;
      if (ar) {
        const deltaW = Math.abs(dx) > Math.abs(dy * ar) ? -dx : -dy * ar;
        let targetW = dragStart.cropW + deltaW;
        if (targetW > maxW) targetW = maxW;
        if (targetW / ar > maxH) targetW = maxH * ar;
        targetW = Math.max(minWidth, targetW);
        newW = targetW;
        newH = targetW / ar;
        newX = anchorRight - targetW;
        newY = anchorBottom - targetW / ar;
      } else {
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW - dx));
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH - dy));
        newX = anchorRight - newW;
        newY = anchorBottom - newH;
      }
    } else if (dragMode === 'e') {
      const anchorX = dragStart.cropX;
      const maxW = natW - anchorX;
      if (ar) {
        let targetW = Math.max(minWidth, Math.min(maxW, dragStart.cropW + dx));
        let targetH = targetW / ar;
        if (targetH > natH) {
          targetH = natH;
          targetW = targetH * ar;
        }
        const centerY = dragStart.cropY + dragStart.cropH / 2;
        let y = centerY - targetH / 2;
        if (y < 0) y = 0;
        if (y + targetH > natH) y = natH - targetH;
        newX = anchorX;
        newY = y;
        newW = targetW;
        newH = targetH;
      } else {
        newX = anchorX;
        newY = dragStart.cropY;
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW + dx));
        newH = dragStart.cropH;
      }
    } else if (dragMode === 'w') {
      const anchorRight = dragStart.cropX + dragStart.cropW;
      const maxW = anchorRight;
      if (ar) {
        let targetW = Math.max(minWidth, Math.min(maxW, dragStart.cropW - dx));
        let targetH = targetW / ar;
        if (targetH > natH) {
          targetH = natH;
          targetW = targetH * ar;
        }
        const centerY = dragStart.cropY + dragStart.cropH / 2;
        let y = centerY - targetH / 2;
        if (y < 0) y = 0;
        if (y + targetH > natH) y = natH - targetH;
        newX = anchorRight - targetW;
        newY = y;
        newW = targetW;
        newH = targetH;
      } else {
        newW = Math.max(minWidth, Math.min(maxW, dragStart.cropW - dx));
        newX = anchorRight - newW;
        newY = dragStart.cropY;
        newH = dragStart.cropH;
      }
    } else if (dragMode === 's') {
      const anchorY = dragStart.cropY;
      const maxH = natH - anchorY;
      if (ar) {
        let targetH = Math.max(minHeight, Math.min(maxH, dragStart.cropH + dy));
        let targetW = targetH * ar;
        if (targetW > natW) {
          targetW = natW;
          targetH = targetW / ar;
        }
        const centerX = dragStart.cropX + dragStart.cropW / 2;
        let x = centerX - targetW / 2;
        if (x < 0) x = 0;
        if (x + targetW > natW) x = natW - targetW;
        newX = x;
        newY = anchorY;
        newW = targetW;
        newH = targetH;
      } else {
        newX = dragStart.cropX;
        newY = anchorY;
        newW = dragStart.cropW;
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH + dy));
      }
    } else if (dragMode === 'n') {
      const anchorBottom = dragStart.cropY + dragStart.cropH;
      const maxH = anchorBottom;
      if (ar) {
        let targetH = Math.max(minHeight, Math.min(maxH, dragStart.cropH - dy));
        let targetW = targetH * ar;
        if (targetW > natW) {
          targetW = natW;
          targetH = targetW / ar;
        }
        const centerX = dragStart.cropX + dragStart.cropW / 2;
        let x = centerX - targetW / 2;
        if (x < 0) x = 0;
        if (x + targetW > natW) x = natW - targetW;
        newX = x;
        newY = anchorBottom - targetH;
        newW = targetW;
        newH = targetH;
      } else {
        newH = Math.max(minHeight, Math.min(maxH, dragStart.cropH - dy));
        newX = dragStart.cropX;
        newY = anchorBottom - newH;
        newW = dragStart.cropW;
      }
    }

    const finalX = Math.max(0, Math.round(newX));
    const finalY = Math.max(0, Math.round(newY));
    const finalW = Math.max(1, Math.round(newW));
    const finalH = Math.max(1, Math.round(newH));

    onChange({
      x: finalX,
      y: finalY,
      width: finalW,
      height: finalH,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
      setDragMode(null);
      setDragStart(null);
    }
  };

  const scale = imageLayout.naturalW > 0 ? imageLayout.renderW / imageLayout.naturalW : 1;
  const boxLeft = crop.x * scale;
  const boxTop = crop.y * scale;
  const boxWidth = Math.max(1, crop.width * scale);
  const boxHeight = Math.max(1, crop.height * scale);

  const showGrid = boxWidth >= 30 && boxHeight >= 30;
  const showVEdgeHandles = boxHeight >= 24;
  const showHEdgeHandles = boxWidth >= 24;
  const handleSize = Math.max(6, Math.min(10, Math.max(boxWidth, boxHeight) < 14 ? 6 : 10));
  const handleOffset = -handleSize / 2;

  const handles = [
    { pos: 'nw', cursor: 'nwse-resize', top: handleOffset, left: handleOffset },
    { pos: 'ne', cursor: 'nesw-resize', top: handleOffset, right: handleOffset },
    { pos: 'se', cursor: 'nwse-resize', bottom: handleOffset, right: handleOffset },
    { pos: 'sw', cursor: 'nesw-resize', bottom: handleOffset, left: handleOffset },
    ...(showVEdgeHandles
      ? [
          {
            pos: 'n',
            cursor: 'ns-resize',
            top: handleOffset,
            left: `calc(50% + ${handleOffset}px)`,
          },
          {
            pos: 's',
            cursor: 'ns-resize',
            bottom: handleOffset,
            left: `calc(50% + ${handleOffset}px)`,
          },
        ]
      : []),
    ...(showHEdgeHandles
      ? [
          {
            pos: 'w',
            cursor: 'ew-resize',
            top: `calc(50% + ${handleOffset}px)`,
            left: handleOffset,
          },
          {
            pos: 'e',
            cursor: 'ew-resize',
            top: `calc(50% + ${handleOffset}px)`,
            right: handleOffset,
          },
        ]
      : []),
  ];

  return (
    <Box
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        userSelect: 'none',
        touchAction: 'none',
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: imageLayout.renderW,
          height: imageLayout.renderH,
          userSelect: 'none',
          touchAction: 'none',
          overflow: 'visible',
          flexShrink: 0,
        }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop Target"
          onLoad={updateImageLayout}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Dark overlay with hole */}
        <Box
          sx={{
            position: 'absolute',
            left: `${boxLeft}px`,
            top: `${boxTop}px`,
            width: `${boxWidth}px`,
            height: `${boxHeight}px`,
            minWidth: '1px',
            minHeight: '1px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
            border: '2px solid #38bdf8',
            cursor: 'move',
            zIndex: 10,
          }}
          onPointerDown={(e) => handlePointerDown('move', e)}
        >
          {/* Grid lines (Rule of thirds) */}
          {showGrid && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                '& > div': { border: '1px dashed rgba(255, 255, 255, 0.3)' },
              }}
            >
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </Box>
          )}

          {/* Handles */}
          {handles.map((h) => (
            <Box
              key={h.pos}
              onPointerDown={(e) => handlePointerDown(h.pos as DragMode, e)}
              sx={{
                position: 'absolute',
                width: handleSize,
                height: handleSize,
                bgcolor: '#38bdf8',
                border: '1.5px solid #ffffff',
                borderRadius: '2px',
                cursor: h.cursor,
                zIndex: 20,
                top: h.top,
                bottom: h.bottom,
                left: h.left,
                right: h.right,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
