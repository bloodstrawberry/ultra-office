'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

// ----------------------------------------------------------------------

export type ComparePreviewMode = 'split' | 'single' | 'mask';
export type SplitOrientation = 'horizontal' | 'vertical';
export type SplitMode = 'inside' | 'outside';

export interface PhotoCompareViewportProps {
  originalSrc: string;
  resultSrc: string;
  maskSrc?: string;
  isLoading?: boolean;
  loadingProgress?: { progress: number; text?: string; description?: string };
  previewMode?: ComparePreviewMode;
  onPreviewModeChange?: (mode: ComparePreviewMode) => void;
  splitOrientation?: SplitOrientation;
  onSplitOrientationChange?: (orientation: SplitOrientation) => void;
  splitMode?: SplitMode;
  onSplitModeChange?: (mode: SplitMode) => void;
  splitStart?: number;
  onSplitStartChange?: (start: number) => void;
  splitEnd?: number;
  onSplitEndChange?: (end: number) => void;
  bgStyle?: 'transparent' | 'neutral' | 'none';
  extraTopActions?: React.ReactNode;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function PhotoCompareViewport({
  originalSrc,
  resultSrc,
  maskSrc,
  isLoading = false,
  loadingProgress,
  previewMode: controlledPreviewMode,
  onPreviewModeChange,
  splitOrientation: controlledSplitOrientation,
  onSplitOrientationChange,
  splitMode: controlledSplitMode,
  onSplitModeChange,
  splitStart: controlledSplitStart,
  onSplitStartChange,
  splitEnd: controlledSplitEnd,
  onSplitEndChange,
  bgStyle = 'transparent',
  extraTopActions,
  children,
  sx,
}: PhotoCompareViewportProps) {
  // Internal state for uncontrolled mode
  const [internalPreviewMode, setInternalPreviewMode] = useState<ComparePreviewMode>('split');
  const [internalOrientation, setInternalOrientation] = useState<SplitOrientation>('horizontal');
  const [internalSplitMode, setInternalSplitMode] = useState<SplitMode>('inside');
  const [internalSplitStart, setInternalSplitStart] = useState<number>(25);
  const [internalSplitEnd, setInternalSplitEnd] = useState<number>(75);

  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const targetSrc = resultSrc || originalSrc;
    if (!targetSrc) return;
    const img = new Image();
    img.src = targetSrc;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
  }, [originalSrc, resultSrc]);

  const viewportAreaRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = viewportAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setViewportSize({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const photoBoxSize = useMemo(() => {
    const imgW = imageDimensions.width;
    const imgH = imageDimensions.height;
    if (!imgW || !imgH || !viewportSize.width || !viewportSize.height) {
      return { width: '100%', height: '100%' };
    }
    const scale = Math.min(viewportSize.width / imgW, viewportSize.height / imgH);
    return {
      width: Math.max(1, Math.round(imgW * scale)),
      height: Math.max(1, Math.round(imgH * scale)),
    };
  }, [imageDimensions, viewportSize]);

  const previewMode = controlledPreviewMode ?? internalPreviewMode;
  const setPreviewMode = (mode: ComparePreviewMode) => {
    setInternalPreviewMode(mode);
    onPreviewModeChange?.(mode);
  };

  const splitOrientation = controlledSplitOrientation ?? internalOrientation;
  const setSplitOrientation = (orientation: SplitOrientation) => {
    setInternalOrientation(orientation);
    onSplitOrientationChange?.(orientation);
  };

  const splitMode = controlledSplitMode ?? internalSplitMode;
  const setSplitMode = (mode: SplitMode) => {
    setInternalSplitMode(mode);
    onSplitModeChange?.(mode);
  };

  const splitStart = controlledSplitStart ?? internalSplitStart;
  const setSplitStart = (val: number) => {
    setInternalSplitStart(val);
    onSplitStartChange?.(val);
  };

  const splitEnd = controlledSplitEnd ?? internalSplitEnd;
  const setSplitEnd = (val: number) => {
    setInternalSplitEnd(val);
    onSplitEndChange?.(val);
  };

  // Slider Dragging State
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingStartRef = useRef(false);
  const isDraggingEndRef = useRef(false);

  const handlePointerDown = (type: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'start') {
      isDraggingStartRef.current = true;
    } else {
      isDraggingEndRef.current = true;
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingStartRef.current && !isDraggingEndRef.current) return;
      const rect = splitContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let pct = 50;
      if (splitOrientation === 'horizontal') {
        const x = e.clientX - rect.left;
        pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      } else {
        const y = e.clientY - rect.top;
        pct = Math.max(0, Math.min(100, (y / rect.height) * 100));
      }

      if (isDraggingStartRef.current) {
        setSplitStart(Math.min(pct, splitEnd - 5));
      } else if (isDraggingEndRef.current) {
        setSplitEnd(Math.max(pct, splitStart + 5));
      }
    },
    [splitOrientation, splitStart, splitEnd]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingStartRef.current = false;
    isDraggingEndRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        ...sx,
      }}
    >
      {/* 1. Top View Mode Toolbar */}
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
            value={previewMode}
            exclusive
            onChange={(_, v) => v && setPreviewMode(v)}
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
            <ToggleButton value="split">
              <CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />
              비교 슬라이더
            </ToggleButton>
            <ToggleButton value="single">
              <ViewStreamRoundedIcon sx={{ fontSize: 18 }} />
              결과물
            </ToggleButton>
            {maskSrc && (
              <ToggleButton value="mask">
                <BlurOnRoundedIcon sx={{ fontSize: 18 }} />
                알파 마스크
              </ToggleButton>
            )}
          </ToggleButtonGroup>

          {/* Split Orientation & Mode Toggles */}
          {previewMode === 'split' && (
            <>
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
                  {splitOrientation === 'horizontal' ? '→ [중앙 적용] ←' : '↓ [중앙 적용] ↑'}
                </ToggleButton>
                <ToggleButton value="outside">
                  {splitOrientation === 'horizontal' ? '← [양끝 적용] →' : '↑ [상하 적용] ↓'}
                </ToggleButton>
              </ToggleButtonGroup>
            </>
          )}
        </Box>

        {/* Extra Top Actions */}
        {extraTopActions && (
          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>{extraTopActions}</Box>
        )}
      </Box>

      {/* 2. Interactive Viewport Canvas Area */}
      <Box
        ref={viewportAreaRef}
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          p: 0,
        }}
      >
        {isLoading ? (
          /* Loading State */
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
                {loadingProgress?.text || '이미지 처리 중...'}
              </Typography>
              {loadingProgress && loadingProgress.progress > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={loadingProgress.progress * 100}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
              )}
              {loadingProgress?.description && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {loadingProgress.description}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            ref={splitContainerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
              position: 'relative',
              width: photoBoxSize.width,
              height: photoBoxSize.height,
              flexShrink: 0,
              borderRadius: 0,
              overflow: 'hidden',
              userSelect: 'none',
              touchAction: 'none',
              background:
                bgStyle === 'transparent' || previewMode === 'split'
                  ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / 16px 16px'
                  : 'background.neutral',
            }}
          >
            {previewMode === 'mask' && maskSrc ? (
              /* Mask Mode */
              <Box
                component="img"
                src={maskSrc}
                alt="Alpha Mask"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            ) : previewMode === 'single' ? (
              /* Single Result Mode */
              <Box
                component="img"
                src={resultSrc || originalSrc}
                alt="Result"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            ) : previewMode === 'split' ? (
              /* Split Comparison Mode */
              <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {/* Background Layer: Processed Result */}
                <Box
                  component="img"
                  src={resultSrc || originalSrc}
                  alt="Result Layer"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 0,
                  }}
                />

                {/* Floating Quick Pill Toggle on Canvas */}
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
                      setSplitOrientation(
                        splitOrientation === 'horizontal' ? 'vertical' : 'horizontal'
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
                      {splitOrientation === 'horizontal' ? '↔ 가로(좌우)' : '↕ 세로(상하)'}
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => setSplitMode(splitMode === 'inside' ? 'outside' : 'inside')}
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
                    <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {splitOrientation === 'horizontal'
                        ? splitMode === 'inside'
                          ? '→ [중앙 적용] ←'
                          : '← [양끝 적용] →'
                        : splitMode === 'inside'
                          ? '↓ [중앙 적용] ↑'
                          : '↑ [상하 적용] ↓'}
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

                {/* Foreground Layer: Original Image Clipped */}
                {splitOrientation === 'horizontal' ? (
                  splitMode === 'inside' ? (
                    <>
                      {/* Left (0 to splitStart%) */}
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
                          src={originalSrc}
                          alt="Original Left"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 0,
                          }}
                        />
                      </Box>

                      {/* Right (splitEnd% to 100%) */}
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
                          src={originalSrc}
                          alt="Original Right"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 0,
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    /* Center (splitStart% to splitEnd%) */
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
                        src={originalSrc}
                        alt="Original Center"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                      />
                    </Box>
                  )
                ) : splitMode === 'inside' ? (
                  <>
                    {/* Top (0 to splitStart%) */}
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
                        src={originalSrc}
                        alt="Original Top"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                      />
                    </Box>

                    {/* Bottom (splitEnd% to 100%) */}
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
                        src={originalSrc}
                        alt="Original Bottom"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                      />
                    </Box>
                  </>
                ) : (
                  /* Middle (splitStart% to splitEnd%) */
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
                      src={originalSrc}
                      alt="Original Middle"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
                    />
                  </Box>
                )}

                {/* Split Handle 1: Start (Blue) */}
                <Box
                  onPointerDown={handlePointerDown('start')}
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
                      width: splitOrientation === 'horizontal' ? 36 : 48,
                      height: splitOrientation === 'horizontal' ? 48 : 36,
                      borderRadius: 2,
                      bgcolor: '#1d4ed8',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 3,
                      border: '2px solid #ffffff',
                      userSelect: 'none',
                    }}
                  >
                    {splitOrientation === 'horizontal' ? (
                      <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <SwapVertRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, lineHeight: 1 }}>
                      {Math.round(splitStart)}%
                    </Typography>
                  </Box>
                </Box>

                {/* Split Handle 2: End (Green) */}
                <Box
                  onPointerDown={handlePointerDown('end')}
                  sx={
                    splitOrientation === 'horizontal'
                      ? {
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${splitEnd}%`,
                          width: 3,
                          bgcolor: '#10b981',
                          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
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
                          bgcolor: '#10b981',
                          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
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
                      width: splitOrientation === 'horizontal' ? 36 : 48,
                      height: splitOrientation === 'horizontal' ? 48 : 36,
                      borderRadius: 2,
                      bgcolor: '#047857',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 3,
                      border: '2px solid #ffffff',
                      userSelect: 'none',
                    }}
                  >
                    {splitOrientation === 'horizontal' ? (
                      <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <SwapVertRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, lineHeight: 1 }}>
                      {Math.round(splitEnd)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : null}

            {/* Optional Overlay Children (e.g. Touchup canvas) */}
            {children}
          </Box>
        )}
      </Box>
    </Card>
  );
}
