'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import GifBoxRoundedIcon from '@mui/icons-material/GifBoxRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  MEME_EFFECTS,
  MEME_SAMPLES,
  renderMemePhoto,
  type MemeLabConfig,
  type LaserEyePoint,
  type MemeEffectType,
  createMemeAnimatedGif,
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
  const [spinningAngle, setSpinningAngle] = useState<number>(35);
  const [isSpinningLive, setIsSpinningLive] = useState<boolean>(true);

  const [tiltShiftPosition, setTiltShiftPosition] = useState<number>(50);
  const [tiltShiftBlur, setTiltShiftBlur] = useState<number>(8);

  const [ps1Resolution, setPs1Resolution] = useState<number>(220);
  const [ps1ColorDepth, setPs1ColorDepth] = useState<number>(15);
  const [ps1Jitter, setPs1Jitter] = useState<number>(4);

  // Compare & Result states
  const [comparePos, setComparePos] = useState<number>(50);
  const [isDraggingCompare, setIsDraggingCompare] = useState<boolean>(false);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setComparePos((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!compareContainerRef.current || !e.touches[0]) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setComparePos((x / rect.width) * 100);
  };

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processFile(files[0]);
    },
    multiple: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

  // 3D Live Spinning loop
  useEffect(() => {
    if (activeEffect !== 'spinning_3d' || !isSpinningLive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return () => {};
    }

    let lastTime = performance.now();
    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setSpinningAngle((prev) => (prev + delta * spinningSpeed * 60) % 360);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeEffect, isSpinningLive, spinningSpeed]);

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
      spinningAngleDeg: spinningAngle,
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
    spinningAngle,
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
    } else {
      if (activeEffect !== 'spinning_3d') {
        setIsProcessing(true);
      }
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
    }

    return () => {
      isMounted = false;
    };
  }, [imageSrc, renderMeme, activeEffect]);

  // Handle Laser Eye Canvas Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeEffect !== 'laser_eyes' || !compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setLaserPoints((prev) => {
      if (prev.length >= 4) {
        return [{ x, y }];
      }
      return [...prev, { x, y }];
    });
    toast.info('레이저 눈 위치가 추가되었습니다! (최대 4개)');
  };

  // Compare Drag
  const handleCompareMove = useCallback((clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setComparePos(Math.round((x / rect.width) * 100));
  }, []);

  // Download Image
  const handleDownload = async () => {
    if (!resultDataUrl) return;
    const res = await downloadDataUrl(resultDataUrl, `meme_lab_${activeEffect}_${Date.now()}.png`);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Export GIF (for Wide Walk & 3D Spin)
  const handleExportGif = async () => {
    if (!imageSrc) return;
    setIsGeneratingGif(true);
    toast.info('움짤(GIF)을 생성하고 있습니다. 잠시만 기다려 주세요...');

    try {
      const config: MemeLabConfig = {
        effectType: activeEffect,
        wideStretch,
        wideWalkAnim: true,
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
        spinningAngleDeg: spinningAngle,
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
    if (!resultDataUrl) return;
    try {
      const blob = await (await fetch(resultDataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('밈 이미지가 클립보드에 복사되었습니다!');
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  // Share KakaoTalk
  const handleShare = async () => {
    if (!resultDataUrl) return;
    try {
      await shareToKakaoTalk(
        resultDataUrl,
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
        /* Upload & Sample Meme Box */
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Card
            {...getRootProps()}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              borderRadius: 3,
              flex: '1 1 auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                bgcolor: 'primary.lighter',
                color: 'primary.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
              }}
            >
              🧪
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              변환할 사진을 업로드하세요
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              인물, 동물, 밈 캡처 등 사진을 드래그 앤 드롭하거나 클릭하여 선택
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadRoundedIcon />}
              sx={{ borderRadius: 2 }}
            >
              사진 파일 선택
            </Button>
          </Card>

          {/* Sample Memes Quick Load */}
          <Card sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              ⚡ 샘플 짤방으로 즉시 체험하기
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {MEME_SAMPLES.map((sample) => (
                <Box
                  key={sample.id}
                  onClick={() => setImageSrc(sample.url)}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={sample.url}
                    alt={sample.label}
                    sx={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1.5,
                      mb: 0.5,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    {sample.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
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
            {/* Preview Card */}
            <Card
              ref={compareContainerRef}
              onClick={handleCanvasClick}
              onMouseDown={() => {
                if (activeEffect !== 'laser_eyes') setIsDraggingCompare(true);
              }}
              onMouseUp={() => setIsDraggingCompare(false)}
              onMouseLeave={() => setIsDraggingCompare(false)}
              onMouseMove={(e) => {
                if (isDraggingCompare) handleMouseMove(e);
              }}
              onTouchMove={(e) => {
                if (isDraggingCompare) handleTouchMove(e);
              }}
              sx={{
                position: 'relative',
                width: '100%',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                bgcolor: '#0a0a0a',
                borderRadius: 3,
                overflow: 'hidden',
                userSelect: 'none',
                cursor: activeEffect === 'laser_eyes' ? 'crosshair' : 'ew-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => theme.customShadows?.z16 || theme.shadows[16],
              }}
            >
              {/* 1. After (Transformed Image) */}
              {resultDataUrl && (
                <Box
                  component="img"
                  src={resultDataUrl}
                  alt="Meme Result"
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* 2. Before (Original Image) - Split Slider (except for 3D spin) */}
              {activeEffect !== 'spinning_3d' && activeEffect !== 'laser_eyes' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    clipPath: `polygon(0 0, ${comparePos}% 0, ${comparePos}% 100%, 0 100%)`,
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    component="img"
                    src={imageSrc}
                    alt="Original Source"
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: 'rgba(0,0,0,0.65)',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    원본 (Original)
                  </Box>
                </Box>
              )}

              {/* Effect Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: currentMeta?.badgeBg || 'primary.main',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {currentMeta?.name}
              </Box>

              {/* Compare Divider Line */}
              {activeEffect !== 'spinning_3d' && activeEffect !== 'laser_eyes' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${comparePos}%`,
                    width: '2px',
                    bgcolor: '#ffffff',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      color: '#111827',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <CompareArrowsRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                </Box>
              )}
            </Card>
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
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  1. 밈 왜곡 효과 선택
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                }}
              >
                {MEME_EFFECTS.map((eff) => {
                  const isSelected = activeEffect === eff.id;
                  return (
                    <Box
                      key={eff.id}
                      onClick={() => setActiveEffect(eff.id)}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>{eff.icon}</Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                        >
                          {eff.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem', lineClamp: 1 }}
                      >
                        {eff.subtitle}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>

            {/* 2. Specific Fine Tuning Controls */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TuneRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  2. 세부 파라미터 조절
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                    >
                      💡 &apos;움짤(GIF) 다운로드&apos;를 누르면 좌우로 위풍당당하게 걷는 바운스
                      짤이 생성됩니다!
                    </Typography>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                        onChange={(_, val) => setLaserBeamSize(val as number)}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        fullWidth
                        onClick={() => setLaserPoints([])}
                      >
                        레이저 초기화 ({laserPoints.length}개)
                      </Button>
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
                gap: 1.25,
                mt: 'auto',
                pt: 0.5,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
                sx={{ py: 1.4, fontWeight: 700, borderRadius: 2, fontSize: '0.95rem' }}
              >
                이미지 다운로드
              </Button>
              {currentMeta?.hasGifExport && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<GifBoxRoundedIcon />}
                  onClick={handleExportGif}
                  disabled={isGeneratingGif}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                >
                  움짤(GIF) 다운로드
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopyClipboard}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                복사
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                startIcon={<ShareRoundedIcon />}
                onClick={handleShare}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                카톡 공유
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setImageSrc('')}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 사진
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
