import { useRef, useState, useEffect, useCallback, type DragEvent } from 'react';

export type Offset = { x: number; y: number };

export function useImageViewer() {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isVFlip, setIsVFlip] = useState(false);
  const [isHFlip, setIsHFlip] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const startOffset = useRef<Offset>({ x: 0, y: 0 });

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent, onFileProcess: (file: File) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileProcess(e.dataTransfer.files[0]);
    }
  }, []);

  const resetViewer = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setIsVFlip(false);
    setIsHFlip(false);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          setZoom((prev) => Math.min(5, Math.max(0.1, prev + delta)));
        }
      };

      const handleMouseMoveGlobal = (e: MouseEvent) => {
        if (isPanning.current) {
          setOffset({
            x: startOffset.current.x + (e.clientX - panStart.current.x),
            y: startOffset.current.y + (e.clientY - panStart.current.y),
          });
        }
      };

      const handleMouseUpGlobal = () => {
        isPanning.current = false;
        document.body.style.cursor = 'default';
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);

      return () => {
        el.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
    return undefined;
  }, []);

  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>, hasImage: boolean) => {
    e.currentTarget.focus();
    if (!hasImage) return;

    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    startOffset.current = offset;
    document.body.style.cursor = 'grabbing';
  };

  return {
    zoom,
    setZoom,
    offset,
    setOffset,
    rotation,
    setRotation,
    isVFlip,
    setIsVFlip,
    isHFlip,
    setIsHFlip,
    isDragActive,
    setIsDragActive,
    containerRef,
    isPanning,
    resetViewer,
    handlePanStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}
