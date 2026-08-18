'use client';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteractiveCropBoxProps {
  imageSrc: string;
  aspectRatio?: number; // width / height or null for free
  crop: CropRect;
  onChange: (crop: CropRect) => void;
  minWidth?: number;
  minHeight?: number;
}

type DragMode = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null;

export function InteractiveCropBox({
  imageSrc,
  aspectRatio,
  crop,
  onChange,
  minWidth = 50,
  minHeight = 50,
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
  }>({ renderX: 0, renderY: 0, renderW: 1, renderH: 1, naturalW: 1, naturalH: 1 });

  const updateImageLayout = () => {
    if (!containerRef.current || !imageRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;

    const natW = img.naturalWidth || 1;
    const natH = img.naturalHeight || 1;

    const scale = Math.min(contRect.width / natW, contRect.height / natH);
    const renderW = natW * scale;
    const renderH = natH * scale;
    const renderX = (contRect.width - renderW) / 2;
    const renderY = (contRect.height - renderH) / 2;

    setImageLayout({
      renderX,
      renderY,
      renderW,
      renderH,
      naturalW: natW,
      naturalH: natH,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateImageLayout);
    return () => window.removeEventListener('resize', updateImageLayout);
  }, []);

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

    const scaleNatToRender = imageLayout.renderW / imageLayout.naturalW;
    const dx = (e.clientX - dragStart.mouseX) / scaleNatToRender;
    const dy = (e.clientY - dragStart.mouseY) / scaleNatToRender;

    let newX = dragStart.cropX;
    let newY = dragStart.cropY;
    let newW = dragStart.cropW;
    let newH = dragStart.cropH;

    if (dragMode === 'move') {
      newX = Math.max(0, Math.min(imageLayout.naturalW - newW, dragStart.cropX + dx));
      newY = Math.max(0, Math.min(imageLayout.naturalH - newH, dragStart.cropY + dy));
    } else {
      if (dragMode.includes('e')) {
        newW = Math.max(minWidth, Math.min(imageLayout.naturalW - newX, dragStart.cropW + dx));
      }
      if (dragMode.includes('s')) {
        newH = Math.max(minHeight, Math.min(imageLayout.naturalH - newY, dragStart.cropH + dy));
      }
      if (dragMode.includes('w')) {
        const maxLeft = dragStart.cropX + dragStart.cropW - minWidth;
        newX = Math.max(0, Math.min(maxLeft, dragStart.cropX + dx));
        newW = dragStart.cropX + dragStart.cropW - newX;
      }
      if (dragMode.includes('n')) {
        const maxTop = dragStart.cropY + dragStart.cropH - minHeight;
        newY = Math.max(0, Math.min(maxTop, dragStart.cropY + dy));
        newH = dragStart.cropY + dragStart.cropH - newY;
      }

      if (aspectRatio) {
        if (dragMode === 'e' || dragMode === 'w' || dragMode === 'se' || dragMode === 'sw') {
          newH = newW / aspectRatio;
          if (newY + newH > imageLayout.naturalH) {
            newH = imageLayout.naturalH - newY;
            newW = newH * aspectRatio;
          }
        } else {
          newW = newH * aspectRatio;
          if (newX + newW > imageLayout.naturalW) {
            newW = imageLayout.naturalW - newX;
            newH = newW / aspectRatio;
          }
        }
      }
    }

    onChange({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
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

  const scale = imageLayout.renderW / imageLayout.naturalW;
  const boxLeft = imageLayout.renderX + crop.x * scale;
  const boxTop = imageLayout.renderY + crop.y * scale;
  const boxWidth = crop.width * scale;
  const boxHeight = crop.height * scale;

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
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Crop Target"
        onLoad={updateImageLayout}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Dark overlay with hole */}
      <Box
        sx={{
          position: 'absolute',
          left: boxLeft,
          top: boxTop,
          width: boxWidth,
          height: boxHeight,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
          border: '2px solid #38bdf8',
          cursor: 'move',
          zIndex: 10,
        }}
        onPointerDown={(e) => handlePointerDown('move', e)}
      >
        {/* Grid lines (Rule of thirds) */}
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

        {/* 8 Handles */}
        {[
          { pos: 'nw', cursor: 'nwse-resize', top: -6, left: -6 },
          { pos: 'ne', cursor: 'nesw-resize', top: -6, right: -6 },
          { pos: 'se', cursor: 'nwse-resize', bottom: -6, right: -6 },
          { pos: 'sw', cursor: 'nesw-resize', bottom: -6, left: -6 },
          { pos: 'n', cursor: 'ns-resize', top: -6, left: 'calc(50% - 6px)' },
          { pos: 's', cursor: 'ns-resize', bottom: -6, left: 'calc(50% - 6px)' },
          { pos: 'w', cursor: 'ew-resize', top: 'calc(50% - 6px)', left: -6 },
          { pos: 'e', cursor: 'ew-resize', top: 'calc(50% - 6px)', right: -6 },
        ].map((h) => (
          <Box
            key={h.pos}
            onPointerDown={(e) => handlePointerDown(h.pos as DragMode, e)}
            sx={{
              position: 'absolute',
              width: 12,
              height: 12,
              bgcolor: '#38bdf8',
              border: '2px solid #ffffff',
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
  );
}
