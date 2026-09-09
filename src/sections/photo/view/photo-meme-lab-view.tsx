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
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import GifBoxRoundedIcon from '@mui/icons-material/GifBoxRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';
import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';
import {
  MEME_EFFECTS,
  MEME_SAMPLES,
  renderMemePhoto,
  type MemeLabConfig,
  type LaserEyePoint,
  type MemeEffectType,
  createMemeAnimatedGif,
  renderSpinning3DFrame,
} from '../utils/meme-processor';

export function MemeLabView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [activeEffect, setActiveEffect] = useState<MemeEffectType>('wide');

  // Specific effect parameter states
  const [wideStretch, setWideStretch] = useState<number>(2.5);
  const [fisheyeStrength, setFisheyeStrength] = useState<number>(1.6);
  const [fisheyeRadius, setFisheyeRadius] = useState<number>(0.75);

  const [laserPoints, setLaserPoints] = useState<LaserEyePoint[]>([
    { x: 0.42, y: 0.45 },
    { x: 0.58, y: 0.45 },
  ]);
  const [laserColor, setLaserColor] = useState<'red' | 'blue' | 'gold' | 'green'>('red');
  const [laserBeamSize, setLaserBeamSize] = useState<number>(35);

  const [uncannyStage, setUncannyStage] = useState<number>(6);
  const [radialBlurStrength, setRadialBlurStrength] = useState<number>(30);
  const [radialBlurPasses, setRadialBlurPasses] = useState<number>(12);

  const [pixelSortThreshold, setPixelSortThreshold] = useState<number>(95);
  const [pixelSortDirection, setPixelSortDirection] = useState<'vertical' | 'horizontal'>(
    'vertical'
  );

  const [emojiDensity, setEmojiDensity] = useState<number>(36);

  const [spinningShape, setSpinningShape] = useState<'cube' | 'cylinder' | 'flat'>('cube');
  const [spinningSpeed, setSpinningSpeed] = useState<number>(3);
  const [isSpinningLive, setIsSpinningLive] = useState<boolean>(true);

  // 3D Live Spinning refs
  const spinningCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spinningImageRef = useRef<HTMLImageElement | null>(null);
  const spinningAngleRef = useRef<number>(35);

  const [tiltShiftPosition, setTiltShiftPosition] = useState<number>(50);
  const [tiltShiftBlur, setTiltShiftBlur] = useState<number>(8);

  const [ps1Resolution, setPs1Resolution] = useState<number>(220);
  const [ps1ColorDepth, setPs1ColorDepth] = useState<number>(15);
  const [ps1Jitter, setPs1Jitter] = useState<number>(4);

  // Compare & Result states
  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const animFrameRef = useRef<number | null>(null);

  // Object dragging refs & state
  const draggingLaserIndexRef = useRef<number | null>(null);
  const isDraggingTiltShiftRef = useRef<boolean>(false);
  const lastDragEndTimeRef = useRef<number>(0);
  const [activeLaserIndex, setActiveLaserIndex] = useState<number | null>(null);

  // Click on image area to add a new laser eye point
  const handleImageOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      activeEffect !== 'laser_eyes' ||
      draggingLaserIndexRef.current !== null ||
      Date.now() - lastDragEndTimeRef.current < 350 ||
      e.target !== e.currentTarget
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setLaserPoints((prev) => {
      if (prev.length >= 8) {
        toast.info('레이저 눈은 최대 8개까지 배치할 수 있습니다.');
        return prev;
      }
      toast.success(
        `새로운 레이저 눈 #${prev.length + 1}이 추가되었습니다! 드래그하여 이동할 수 있습니다.`
      );
      return [...prev, { x, y }];
    });
  };

  const handleAddLaserPoint = () => {
    setLaserPoints((prev) => {
      if (prev.length >= 8) {
        toast.info('레이저 눈은 최대 8개까지 배치할 수 있습니다.');
        return prev;
      }
      toast.success('새로운 레이저 눈이 중앙에 추가되었습니다! 드래그하여 이동하세요.');
      return [...prev, { x: 0.5, y: 0.5 }];
    });
  };

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

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Preload image for 3D spinning canvas
  useEffect(() => {
    if (!imageSrc) {
      spinningImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      spinningImageRef.current = img;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // 3D Live Spinning loop (direct canvas rendering without React state updates)
  useEffect(() => {
    if (activeEffect !== 'spinning_3d') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return () => {};
    }

    let lastTime = performance.now();

    const drawFrame = () => {
      const canvas = spinningCanvasRef.current;
      const img = spinningImageRef.current;
      if (canvas && img && img.complete && img.naturalWidth > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          const w = Math.round(rect.width) || 600;
          const h = Math.round(rect.height) || 600;
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          renderSpinning3DFrame(
            ctx,
            img,
            w,
            h,
            (spinningAngleRef.current * Math.PI) / 180,
            spinningShape
          );
        }
      }
    };

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isSpinningLive) {
        spinningAngleRef.current = (spinningAngleRef.current + delta * spinningSpeed * 60) % 360;
      }

      drawFrame();

      if (isSpinningLive) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    drawFrame();

    if (isSpinningLive) {
      animFrameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeEffect, isSpinningLive, spinningSpeed, spinningShape, imageSrc]);

  // Master Render Callback
  const renderMeme = useCallback(async () => {
    if (!imageSrc) return '';

    const config: MemeLabConfig = {
      effectType: activeEffect,
      wideStretch,
      wideWalkAnim: false,
      fisheyeStrength,
      fisheyeRadius,
      laserPoints,
      laserColor,
      laserBeamSize,
      uncannyStage,
      radialBlurStrength,
      radialBlurPasses,
      pixelSortThreshold,
      pixelSortDirection,
      emojiDensity,
      spinningShape,
      spinningSpeed,
      spinningAngleDeg: spinningAngleRef.current,
      tiltShiftPosition,
      tiltShiftBlur,
      ps1Resolution,
      ps1ColorDepth,
      ps1Jitter,
    };

    return renderMemePhoto(imageSrc, config);
  }, [
    imageSrc,
    activeEffect,
    wideStretch,
    fisheyeStrength,
    fisheyeRadius,
    laserPoints,
    laserColor,
    laserBeamSize,
    uncannyStage,
    radialBlurStrength,
    radialBlurPasses,
    pixelSortThreshold,
    pixelSortDirection,
    emojiDensity,
    spinningShape,
    spinningSpeed,
    tiltShiftPosition,
    tiltShiftBlur,
    ps1Resolution,
    ps1ColorDepth,
    ps1Jitter,
  ]);

  useEffect(() => {
    let isMounted = true;
    if (!imageSrc) {
      setResultDataUrl('');
      return;
    }

    if (activeEffect === 'spinning_3d') {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    renderMeme()
      .then((url) => {
        if (isMounted) {
          setResultDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Meme render error:', err);
        toast.error('밈 변환 처리 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (isMounted) {
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [imageSrc, renderMeme, activeEffect]);

  // Download Split Comparison
  const handleDownloadSplit = async () => {
    let currentResult = resultDataUrl;
    if (activeEffect === 'spinning_3d' && spinningCanvasRef.current) {
      currentResult = spinningCanvasRef.current.toDataURL('image/png');
    }
    if (!imageSrc || !currentResult) return;
    setIsProcessing(true);
    try {
      const splitUrl = await renderGenericSplitComparisonImage({
        originalSrc: imageSrc,
        resultSrc: currentResult,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      const res = await downloadDataUrl(
        splitUrl,
        `meme_${activeEffect}_split_comparison_${Date.now()}.png`
      );
      if (res.success) {
        toast.success('슬라이더 비교 상태 그대로 저장되었습니다.');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('비교 상태 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Image
  const handleDownload = async () => {
    let targetDataUrl = resultDataUrl;
    if (activeEffect === 'spinning_3d' && spinningCanvasRef.current) {
      targetDataUrl = spinningCanvasRef.current.toDataURL('image/png');
    }
    if (!targetDataUrl) return;
    const res = await downloadDataUrl(targetDataUrl, `meme_lab_${activeEffect}_${Date.now()}.png`);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Export GIF (for 3D Spin)
  const handleExportGif = async () => {
    if (!imageSrc) return;
    setIsGeneratingGif(true);
    toast.info('움짤(GIF)을 생성하고 있습니다. 잠시만 기다려 주세요...');

    try {
      const config: MemeLabConfig = {
        effectType: activeEffect,
        wideStretch,
        wideWalkAnim: false,
        fisheyeStrength,
        fisheyeRadius,
        laserPoints,
        laserColor,
        laserBeamSize,
        uncannyStage,
        radialBlurStrength,
        radialBlurPasses,
        pixelSortThreshold,
        pixelSortDirection,
        emojiDensity,
        spinningShape,
        spinningSpeed,
        spinningAngleDeg: spinningAngleRef.current,
        tiltShiftPosition,
        tiltShiftBlur,
        ps1Resolution,
        ps1ColorDepth,
        ps1Jitter,
      };

      const gifDataUrl = await createMemeAnimatedGif(imageSrc, config, 18);
      const res = await downloadDataUrl(gifDataUrl, `meme_${activeEffect}_anim_${Date.now()}.gif`);
      if (res.success) {
        toast.success('움짤 GIF 다운로드가 완료되었습니다!');
      }
    } catch (err) {
      console.error('GIF generation error:', err);
      toast.error('GIF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingGif(false);
    }
  };

  // Copy Clipboard
  const handleCopyClipboard = async () => {
    let targetDataUrl = resultDataUrl;
    if (activeEffect === 'spinning_3d' && spinningCanvasRef.current) {
      targetDataUrl = spinningCanvasRef.current.toDataURL('image/png');
    }
    if (!targetDataUrl) return;
    try {
      const blob = await (await fetch(targetDataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('밈 이미지가 클립보드에 복사되었습니다!');
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  // Share KakaoTalk
  const handleShare = async () => {
    let targetDataUrl = resultDataUrl;
    if (activeEffect === 'spinning_3d' && spinningCanvasRef.current) {
      targetDataUrl = spinningCanvasRef.current.toDataURL('image/png');
    }
    if (!targetDataUrl) return;
    try {
      await shareToKakaoTalk(
        targetDataUrl,
        '밈 연구소 짤방 완성! 🧪',
        '밈 공장에서 생성된 특수 왜곡 짤방입니다.'
      );
      toast.success('카카오톡 공유가 완료되었습니다.');
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
    }
  };

  const currentMeta = MEME_EFFECTS.find((e) => e.id === activeEffect);

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
            종합 밈 연구소 (Meme Lab)
          </Typography>
          <Chip
            label="10대 밈 왜곡 스튜디오"
            color="primary"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          와이드 푸틴, 각성 레이저 눈, 0.5x 어안 코봉이, 흑화 10단계, 3D 스피닝 짤 등 인터넷 유명 밈
          효과를 실시간 생성합니다.
        </Typography>
      </Box>

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={MEME_SAMPLES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={processFile}
          title="변환할 사진을 업로드하세요"
          subtitle="인물, 동물, 밈 캡처 등 사진을 드래그 앤 드롭하거나 클릭하여 선택"
          icon={<Typography sx={{ fontSize: 36 }}>🧪</Typography>}
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
          {/* Left: Canvas / Preview / Compare Area */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { lg: 1 },
            }}
          >
            <PhotoCompareViewport
              originalSrc={imageSrc}
              resultSrc={resultDataUrl || imageSrc}
              isLoading={isProcessing && activeEffect !== 'spinning_3d'}
              loadingProgress={{ progress: 0, text: '밈 왜곡 연산 중...' }}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              splitOrientation={splitOrientation}
              onSplitOrientationChange={setSplitOrientation}
              splitMode={splitMode}
              onSplitModeChange={setSplitMode}
              splitStart={splitStart}
              onSplitStartChange={setSplitStart}
              splitEnd={splitEnd}
              onSplitEndChange={setSplitEnd}
              bgStyle="neutral"
              extraTopActions={
                <Chip
                  label={currentMeta?.name}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: currentMeta?.badgeBg || 'primary.main',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                  }}
                />
              }
            >
              {/* 3D Spinning Live Canvas Layer */}
              {activeEffect === 'spinning_3d' && (
                <Box
                  component="canvas"
                  ref={spinningCanvasRef}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Interactive Object Layer (Laser Eyes & Tilt Shift Guideline) */}
              {(activeEffect === 'laser_eyes' || activeEffect === 'tilt_shift') && (
                <Box
                  onClick={activeEffect === 'laser_eyes' ? handleImageOverlayClick : undefined}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: activeEffect === 'laser_eyes' ? 'crosshair' : 'default',
                    pointerEvents: activeEffect === 'laser_eyes' ? 'auto' : 'none',
                  }}
                >
                  {/* Laser Eye Points */}
                  {activeEffect === 'laser_eyes' &&
                    laserPoints.map((pt, index) => {
                      const isDragging = activeLaserIndex === index;
                      const colorHex =
                        laserColor === 'red'
                          ? '#ef4444'
                          : laserColor === 'blue'
                            ? '#3b82f6'
                            : laserColor === 'gold'
                              ? '#eab308'
                              : '#22c55e';

                      return (
                        <Box
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            lastDragEndTimeRef.current = Date.now();
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                            draggingLaserIndexRef.current = index;
                            setActiveLaserIndex(index);
                          }}
                          onPointerMove={(e) => {
                            if (draggingLaserIndexRef.current !== index) return;
                            e.stopPropagation();
                            lastDragEndTimeRef.current = Date.now();
                            const parent = e.currentTarget.parentElement;
                            if (!parent) return;
                            const rect = parent.getBoundingClientRect();
                            const newX = Math.max(
                              0,
                              Math.min(1, (e.clientX - rect.left) / rect.width)
                            );
                            const newY = Math.max(
                              0,
                              Math.min(1, (e.clientY - rect.top) / rect.height)
                            );
                            setLaserPoints((prev) => {
                              const next = [...prev];
                              next[index] = { x: newX, y: newY };
                              return next;
                            });
                          }}
                          onPointerUp={(e) => {
                            e.stopPropagation();
                            lastDragEndTimeRef.current = Date.now();
                            if (draggingLaserIndexRef.current === index) {
                              draggingLaserIndexRef.current = null;
                              setActiveLaserIndex(null);
                              try {
                                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                              } catch {}
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            left: `${pt.x * 100}%`,
                            top: `${pt.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            touchAction: 'none',
                            userSelect: 'none',
                            pointerEvents: 'auto',
                            zIndex: 20,
                            '&:hover .laser-del-btn': {
                              display: 'flex',
                            },
                          }}
                        >
                          {/* Outer Glow Ring */}
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '50%',
                              border: `2px solid ${colorHex}`,
                              bgcolor: 'rgba(0, 0, 0, 0.45)',
                              boxShadow: `0 0 12px 2px ${colorHex}`,
                            }}
                          />
                          {/* Crosshairs */}
                          <Box
                            sx={{
                              position: 'absolute',
                              width: '1px',
                              height: '100%',
                              bgcolor: '#ffffff',
                              opacity: 0.8,
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              height: '1px',
                              width: '100%',
                              bgcolor: '#ffffff',
                              opacity: 0.8,
                            }}
                          />
                          {/* Center core dot */}
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#ffffff',
                              boxShadow: `0 0 6px ${colorHex}`,
                              zIndex: 1,
                            }}
                          />
                          {/* Point Index Badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -6,
                              left: -6,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: colorHex,
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 1,
                              zIndex: 2,
                            }}
                          >
                            {index + 1}
                          </Box>
                          {/* Delete button (on hover) */}
                          <Box
                            className="laser-del-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLaserPoints((prev) => prev.filter((_, i) => i !== index));
                              toast.info(`레이저 눈 #${index + 1}이 삭제되었습니다.`);
                            }}
                            sx={{
                              display: 'none',
                              position: 'absolute',
                              bottom: -6,
                              right: -6,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 900,
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: 1,
                              zIndex: 2,
                              '&:hover': {
                                transform: 'scale(1.15)',
                              },
                            }}
                            title="삭제"
                          >
                            ×
                          </Box>
                        </Box>
                      );
                    })}

                  {/* Tilt Shift Horizontal Draggable Line */}
                  {activeEffect === 'tilt_shift' && (
                    <Box
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        isDraggingTiltShiftRef.current = true;
                      }}
                      onPointerMove={(e) => {
                        if (!isDraggingTiltShiftRef.current) return;
                        const parent = e.currentTarget.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const pos = Math.round(
                          Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100))
                        );
                        setTiltShiftPosition(pos);
                      }}
                      onPointerUp={(e) => {
                        if (isDraggingTiltShiftRef.current) {
                          isDraggingTiltShiftRef.current = false;
                          try {
                            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                          } catch {}
                        }
                      }}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        top: `${tiltShiftPosition}%`,
                        transform: 'translateY(-50%)',
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'ns-resize',
                        zIndex: 20,
                        touchAction: 'none',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          borderTop: '2px dashed #ffffff',
                          boxShadow: '0 0 8px rgba(0,0,0,0.8)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 12,
                          bgcolor: 'rgba(0,0,0,0.75)',
                          color: '#ffffff',
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          pointerEvents: 'none',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        초점 영역: {tiltShiftPosition}% (상하 드래그)
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </PhotoCompareViewport>
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

          {/* Right Sidebar: 10 Meme Effect Selector & Fine Tuning */}
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
              pl: { lg: 1 },
              pr: 0.5,
            }}
          >
            {/* 1. Meme Effect Tab Selector */}
            <Card sx={{ p: 2, borderRadius: 2.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.25,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.875rem' }}>
                    1. 밈 왜곡 효과 선택
                  </Typography>
                </Box>
                {currentMeta && (
                  <Chip
                    label={currentMeta.name}
                    color="primary"
                    size="small"
                    sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700 }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 0.75,
                }}
              >
                {MEME_EFFECTS.map((eff) => {
                  const isSelected = activeEffect === eff.id;
                  return (
                    <Tooltip
                      key={eff.id}
                      title={`${eff.name} (${eff.subtitle}): ${eff.desc}`}
                      placement="top"
                      arrow
                    >
                      <Box
                        onClick={() => {
                          setActiveEffect(eff.id);
                          if (eff.id === 'spinning_3d') {
                            setPreviewMode('single');
                          }
                        }}
                        sx={{
                          p: 0.85,
                          borderRadius: 1.5,
                          border: '1.5px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          minWidth: 0,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '1.15rem', lineHeight: 1, flexShrink: 0 }}>
                          {eff.icon}
                        </Typography>
                        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: isSelected ? 800 : 700,
                              fontSize: '0.75rem',
                              color: isSelected ? 'primary.dark' : 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.25,
                            }}
                          >
                            {eff.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isSelected ? 'primary.darker' : 'text.secondary',
                              fontSize: '0.675rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                              lineHeight: 1.2,
                            }}
                          >
                            {eff.subtitle}
                          </Typography>
                        </Box>
                        {isSelected && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Card>

            {/* 2. Specific Fine Tuning Controls */}
            <Card sx={{ p: 2, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <TuneRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.875rem' }}>
                  2. 세부 파라미터 조절
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {/* 1. Wide Putin Controls */}
                {activeEffect === 'wide' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        가로 스트레칭 배율
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {wideStretch}x 배속
                      </Typography>
                    </Box>
                    <Slider
                      value={wideStretch}
                      min={1.2}
                      max={4.0}
                      step={0.1}
                      onChange={(_, val) => setWideStretch(val as number)}
                    />
                  </Box>
                )}

                {/* 2. 0.5x Fisheye Controls */}
                {activeEffect === 'fisheye' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          어안 왜곡 강도
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {fisheyeStrength}
                        </Typography>
                      </Box>
                      <Slider
                        value={fisheyeStrength}
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        onChange={(_, val) => setFisheyeStrength(val as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          왜곡 반경
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {Math.round(fisheyeRadius * 100)}%
                        </Typography>
                      </Box>
                      <Slider
                        value={fisheyeRadius}
                        min={0.3}
                        max={1.0}
                        step={0.05}
                        onChange={(_, val) => setFisheyeRadius(val as number)}
                      />
                    </Box>
                  </Box>
                )}

                {/* 3. Laser Eyes Controls */}
                {activeEffect === 'laser_eyes' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Interactive Drag Tip */}
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: '1rem', flexShrink: 0 }}>🎯</Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', lineHeight: 1.3, fontSize: '0.7rem' }}
                      >
                        사진 위 조준점을 <strong>드래그</strong>하여 레이저 위치를 이동할 수
                        있습니다. (사진 빈 곳 클릭 시 추가)
                      </Typography>
                    </Box>

                    <FormControl fullWidth size="small">
                      <InputLabel id="laser-color-label">레이저 빔 색상</InputLabel>
                      <Select
                        labelId="laser-color-label"
                        value={laserColor}
                        label="레이저 빔 색상"
                        onChange={(e) =>
                          setLaserColor(e.target.value as 'red' | 'blue' | 'gold' | 'green')
                        }
                      >
                        <MenuItem value="red">🔴 분노의 레드 (Red Flare)</MenuItem>
                        <MenuItem value="blue">🔵 사이버 블루 (Blue Flare)</MenuItem>
                        <MenuItem value="gold">🟡 각성 골드 (Gold Super Saiyan)</MenuItem>
                        <MenuItem value="green">🟢 에메랄드 그린 (Green Aura)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          레이저 발광 크기
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {laserBeamSize}px
                        </Typography>
                      </Box>
                      <Slider
                        value={laserBeamSize}
                        min={15}
                        max={80}
                        step={2}
                        size="small"
                        onChange={(_, val) => setLaserBeamSize(val as number)}
                      />
                    </Box>

                    {/* Active Points List */}
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.75,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          배치된 레이저 눈 ({laserPoints.length}개)
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={handleAddLaserPoint}
                            sx={{
                              fontSize: '0.7rem',
                              py: 0.2,
                              px: 0.8,
                              minWidth: 0,
                              fontWeight: 700,
                            }}
                          >
                            + 눈 추가
                          </Button>
                          {laserPoints.length > 0 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => setLaserPoints([])}
                              sx={{ fontSize: '0.7rem', py: 0.2, px: 0.8, minWidth: 0 }}
                            >
                              모두 삭제
                            </Button>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {laserPoints.map((_, i) => (
                          <Chip
                            key={i}
                            label={`눈 #${i + 1}`}
                            size="small"
                            onDelete={() =>
                              setLaserPoints((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        ))}
                        {laserPoints.length === 0 && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            사진을 클릭하여 레이저 눈을 추가하세요
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* 4. Uncanny 10 Stages Controls */}
                {activeEffect === 'uncanny' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        흑화 단계 (Uncanny Level)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {uncannyStage}단계 {uncannyStage === 10 ? '(심연)' : ''}
                      </Typography>
                    </Box>
                    <Slider
                      value={uncannyStage}
                      min={1}
                      max={10}
                      step={1}
                      marks
                      color="error"
                      onChange={(_, val) => setUncannyStage(val as number)}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                    >
                      1단계: 정상 ➔ 5단계: 그로테스크 ➔ 7단계: 블러드 ➔ 10단계: 심연의 공포
                    </Typography>
                  </Box>
                )}

                {/* 5. Radial Panic Blur Controls */}
                {activeEffect === 'radial_blur' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          방사형 패닉 블러 강도
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {radialBlurStrength}%
                        </Typography>
                      </Box>
                      <Slider
                        value={radialBlurStrength}
                        min={5}
                        max={60}
                        step={2}
                        onChange={(_, val) => setRadialBlurStrength(val as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          모션 잔상 샘플 수
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {radialBlurPasses}회
                        </Typography>
                      </Box>
                      <Slider
                        value={radialBlurPasses}
                        min={5}
                        max={20}
                        step={1}
                        onChange={(_, val) => setRadialBlurPasses(val as number)}
                      />
                    </Box>
                  </Box>
                )}

                {/* 6. Pixel Sort Glitch Controls */}
                {activeEffect === 'pixel_sort' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="pixel-sort-dir">흘러내림 방향</InputLabel>
                      <Select
                        labelId="pixel-sort-dir"
                        value={pixelSortDirection}
                        label="흘러내림 방향"
                        onChange={(e) =>
                          setPixelSortDirection(e.target.value as 'vertical' | 'horizontal')
                        }
                      >
                        <MenuItem value="vertical">세로 폭포수 (Vertical)</MenuItem>
                        <MenuItem value="horizontal">가로 스트림 (Horizontal)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          소팅 밝기 임계값 (Threshold)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {pixelSortThreshold}
                        </Typography>
                      </Box>
                      <Slider
                        value={pixelSortThreshold}
                        min={20}
                        max={220}
                        step={5}
                        onChange={(_, val) => setPixelSortThreshold(val as number)}
                      />
                    </Box>
                  </Box>
                )}

                {/* 7. Emoji Mosaic Controls */}
                {activeEffect === 'emoji_mosaic' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        이모지 타일 밀도 (가로 개수)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {emojiDensity}개
                      </Typography>
                    </Box>
                    <Slider
                      value={emojiDensity}
                      min={15}
                      max={60}
                      step={2}
                      onChange={(_, val) => setEmojiDensity(val as number)}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                    >
                      😂, 💀, 🔥, 💩, 🤡, 🗿 등 14종의 대표 이모지로 사진이 구성됩니다.
                    </Typography>
                  </Box>
                )}

                {/* 8. 3D Spinning Texture Controls */}
                {activeEffect === 'spinning_3d' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="3d-shape-label">3D 모델 형태</InputLabel>
                      <Select
                        labelId="3d-shape-label"
                        value={spinningShape}
                        label="3D 모델 형태"
                        onChange={(e) =>
                          setSpinningShape(e.target.value as 'cube' | 'cylinder' | 'flat')
                        }
                      >
                        <MenuItem value="cube">🧊 3D 정육면체 큐브 (Rotating Cube)</MenuItem>
                        <MenuItem value="flat">💳 3D 카드 플랫 (Flat Rotating Card)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          회전 속도
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {spinningSpeed}x
                        </Typography>
                      </Box>
                      <Slider
                        value={spinningSpeed}
                        min={1}
                        max={6}
                        step={0.5}
                        onChange={(_, val) => setSpinningSpeed(val as number)}
                      />
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={isSpinningLive ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                      onClick={() => setIsSpinningLive(!isSpinningLive)}
                      size="small"
                    >
                      {isSpinningLive ? '실시간 회전 일시정지' : '실시간 회전 시작'}
                    </Button>
                  </Box>
                )}

                {/* 9. Tilt-Shift Miniature Controls */}
                {activeEffect === 'tilt_shift' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          초점 중심 위치 (Y축)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {tiltShiftPosition}%
                        </Typography>
                      </Box>
                      <Slider
                        value={tiltShiftPosition}
                        min={10}
                        max={90}
                        step={5}
                        onChange={(_, val) => setTiltShiftPosition(val as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          배경 블러 강도
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {tiltShiftBlur}px
                        </Typography>
                      </Box>
                      <Slider
                        value={tiltShiftBlur}
                        min={2}
                        max={20}
                        step={1}
                        onChange={(_, val) => setTiltShiftBlur(val as number)}
                      />
                    </Box>
                  </Box>
                )}

                {/* 10. PS1 Demake Controls */}
                {activeEffect === 'ps1_demake' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          레트로 렌더 해상도
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {ps1Resolution}p
                        </Typography>
                      </Box>
                      <Slider
                        value={ps1Resolution}
                        min={120}
                        max={360}
                        step={20}
                        onChange={(_, val) => setPs1Resolution(val as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          색상 비트 감축
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {ps1ColorDepth}비트
                        </Typography>
                      </Box>
                      <Slider
                        value={ps1ColorDepth}
                        min={8}
                        max={24}
                        step={4}
                        marks
                        onChange={(_, val) => setPs1ColorDepth(val as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          텍스처 떨림 (Jitter)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {ps1Jitter}
                        </Typography>
                      </Box>
                      <Slider
                        value={ps1Jitter}
                        min={0}
                        max={10}
                        step={1}
                        onChange={(_, val) => setPs1Jitter(val as number)}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Action Buttons Column */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 'auto',
                pt: 0.5,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setImageSrc('')}
                sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.85rem' }}
              >
                다른 사진
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
                sx={{ py: 1, fontWeight: 700, borderRadius: 1.5, fontSize: '0.9rem' }}
              >
                저장
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<CompareArrowsRoundedIcon />}
                onClick={handleDownloadSplit}
                disabled={!resultDataUrl}
                sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.85rem' }}
              >
                비교 상태 저장 (Split View)
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<ShareRoundedIcon />}
                onClick={handleShare}
                sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.85rem' }}
              >
                공유
              </Button>
              {currentMeta?.hasGifExport && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<GifBoxRoundedIcon />}
                  onClick={handleExportGif}
                  disabled={isGeneratingGif}
                  sx={{ py: 0.8, borderRadius: 1.5, fontWeight: 600, fontSize: '0.85rem' }}
                >
                  움짤(GIF) 다운로드
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
