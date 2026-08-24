'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import {
  WEATHERING_PRESETS,
  WEATHERING_SAMPLES,
  renderWeatheringPhoto,
  type WeatheringConfig,
  type WeatheringColorMode,
} from '../utils/weathering-processor';

export function WeatheringView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string>('green_mold');

  // Custom fine-tuning parameters
  const [generations, setGenerations] = useState<number>(12);
  const [jpegQuality, setJpegQuality] = useState<number>(0.12);
  const [downscaleFactor, setDownscaleFactor] = useState<number>(0.45);
  const [colorMode, setColorMode] = useState<WeatheringColorMode>('green_mold');
  const [sharpenIntensity, setSharpenIntensity] = useState<number>(70);
  const [showScreenshotUi, setShowScreenshotUi] = useState<boolean>(true);
  const [screenshotUiLevel, setScreenshotUiLevel] = useState<number>(2);
  const [watermarkCount, setWatermarkCount] = useState<number>(2);
  const [noiseIntensity, setNoiseIntensity] = useState<number>(30);
  // Compare slider
  const [comparePos, setComparePos] = useState<number>(50);
  const [isDraggingCompare, setIsDraggingCompare] = useState<boolean>(false);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareContainerRef = useRef<HTMLDivElement | null>(null);

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

  // Preset Selection
  const applyPreset = (presetId: string) => {
    const p = WEATHERING_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePresetId(p.id);
    setGenerations(p.config.generations);
    setJpegQuality(p.config.jpegQuality);
    setDownscaleFactor(p.config.downscaleFactor);
    setColorMode(p.config.colorMode);
    setSharpenIntensity(p.config.sharpenIntensity);
    setShowScreenshotUi(p.config.showScreenshotUi);
    setScreenshotUiLevel(p.config.screenshotUiLevel);
    setWatermarkCount(p.config.watermarkCount);
    setNoiseIntensity(p.config.noiseIntensity);
  };

  // Render Weathering
  const renderWeathering = useCallback(async () => {
    if (!imageSrc) return '';

    const config: WeatheringConfig = {
      presetId: activePresetId,
      generations,
      jpegQuality,
      downscaleFactor,
      colorMode,
      sharpenIntensity,
      showScreenshotUi,
      screenshotUiLevel,
      watermarkCount,
      noiseIntensity,
    };

    return renderWeatheringPhoto(imageSrc, config);
  }, [
    imageSrc,
    activePresetId,
    generations,
    jpegQuality,
    downscaleFactor,
    colorMode,
    sharpenIntensity,
    showScreenshotUi,
    screenshotUiLevel,
    watermarkCount,
    noiseIntensity,
  ]);

  useEffect(() => {
    let isMounted = true;
    if (!imageSrc) {
      setResultDataUrl('');
    } else {
      setIsProcessing(true);
      renderWeathering()
        .then((url) => {
          if (isMounted) {
            setResultDataUrl(url);
          }
        })
        .catch((err) => {
          console.error('Weathering render error:', err);
          toast.error('디지털 풍화 처리 중 오류가 발생했습니다.');
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
  }, [imageSrc, renderWeathering]);

  // Handle Dragging Compare Slider
  const handleCompareMove = useCallback((clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setComparePos(Math.round((x / rect.width) * 100));
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleCompareMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCompare) {
      handleCompareMove(e.clientX);
    }
  };

  // Download
  const handleDownload = async () => {
    if (!resultDataUrl) return;
    const res = await downloadDataUrl(
      resultDataUrl,
      `weathered_meme_${activePresetId}_${Date.now()}.jpg`
    );
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (!resultDataUrl) return;
    try {
      const blob = await (await fetch(resultDataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('풍화된 짤방이 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  // KakaoTalk Share
  const handleShare = async () => {
    if (!resultDataUrl) return;
    try {
      await shareToKakaoTalk(
        resultDataUrl,
        '풍화된 짤방 완성! 🍵',
        '디지털 풍화 시뮬레이터로 생성된 세월의 흔적이 담긴 짤방입니다.'
      );
      toast.success('카카오톡 공유가 완료되었습니다.');
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
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
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            디지털 풍화 시뮬레이터
          </Typography>
          <Chip label="Generation Loss" color="success" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          무한한 스크린샷과 재업로드, 손실 압축을 거쳐 썩어버린 인터넷 레트로 명작 짤방을
          재현합니다.
        </Typography>
      </Box>

      {!imageSrc ? (
        /* Upload Box & Samples */
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
                bgcolor: 'success.lighter',
                color: 'success.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
              }}
            >
              🍵
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              풍화시킬 사진을 업로드하세요
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              클릭하거나 사진을 이곳으로 드래그 앤 드롭 (PNG, JPG, WEBP)
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<CloudUploadRoundedIcon />}
              sx={{ borderRadius: 2 }}
            >
              사진 파일 선택
            </Button>
          </Card>

          {/* Sample Memes */}
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
              {WEATHERING_SAMPLES.map((sample) => (
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
                      borderColor: 'success.main',
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
          {/* Main Left: Preview / Compare Canvas */}
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
            {/* Compare Container */}
            <Card
              ref={compareContainerRef}
              onMouseDown={() => setIsDraggingCompare(true)}
              onMouseUp={() => setIsDraggingCompare(false)}
              onMouseLeave={() => setIsDraggingCompare(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
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
                cursor: 'ew-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => theme.customShadows?.z16 || theme.shadows[16],
              }}
            >
              {/* 1. After (Weathered Image) - Base Layer */}
              {resultDataUrl && (
                <Box
                  component="img"
                  src={resultDataUrl}
                  alt="Weathered Result"
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* 2. Before (Original Image) - Clipped Top Layer */}
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
              </Box>

              {/* Badges */}
              <Chip
                label="원본 (Before)"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  bgcolor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                  pointerEvents: 'none',
                }}
              />
              <Chip
                label="풍화 완료 (After)"
                size="small"
                color="success"
                sx={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontWeight: 800,
                  boxShadow: 2,
                  pointerEvents: 'none',
                }}
              />

              {/* Divider Line & Handle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${comparePos}%`,
                  width: '2px',
                  bgcolor: '#ffffff',
                  boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
              >
                {/* Center Drag Handle */}
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

              {/* Processing Overlay */}
              {isProcessing && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    gap: 1.5,
                    color: 'white',
                  }}
                >
                  <CircularProgress color="success" size={42} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    디지털 풍화 연산 중...
                  </Typography>
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
                bgcolor: 'success.main',
                width: '3px',
              },
              '&:hover .divider-handle, &:active .divider-handle': {
                bgcolor: 'success.main',
                borderColor: 'success.main',
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

          {/* Right Sidebar: Preset & Fine Tuning Controls */}
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
            {/* Preset Selector */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeRoundedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  1. 풍화 프리셋 선택
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {WEATHERING_PRESETS.map((p) => {
                  const isSelected = activePresetId === p.id;
                  return (
                    <Box
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: isSelected ? 'success.main' : 'divider',
                        bgcolor: isSelected ? 'success.lighter' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'success.main',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: isSelected ? 'success.dark' : 'text.primary',
                          }}
                        >
                          {p.name}
                        </Typography>
                        {isSelected && (
                          <Chip
                            label="선택됨"
                            color="success"
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? 'success.darker' : 'text.secondary',
                          display: 'block',
                        }}
                      >
                        {p.desc}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>

            {/* Fine Tuning Panel */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TuneRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  2. 세부 파라미터 미세조정
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Generations */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      재업로드 반복 횟수 (세대)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {generations}회
                    </Typography>
                  </Box>
                  <Slider
                    value={generations}
                    min={1}
                    max={25}
                    step={1}
                    size="small"
                    color="success"
                    onChange={(_, val) => setGenerations(val as number)}
                  />
                </Box>

                {/* JPEG Quality */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      JPEG 압축 품질 (손실률)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {Math.round(jpegQuality * 100)}%
                    </Typography>
                  </Box>
                  <Slider
                    value={jpegQuality}
                    min={0.02}
                    max={0.5}
                    step={0.01}
                    size="small"
                    color="success"
                    onChange={(_, val) => setJpegQuality(val as number)}
                  />
                </Box>

                {/* Downscale */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      해상도 축소 비율 (화질 뭉개짐)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {Math.round(downscaleFactor * 100)}%
                    </Typography>
                  </Box>
                  <Slider
                    value={downscaleFactor}
                    min={0.15}
                    max={0.8}
                    step={0.05}
                    size="small"
                    color="success"
                    onChange={(_, val) => setDownscaleFactor(val as number)}
                  />
                </Box>

                {/* Color Mode Select */}
                <FormControl fullWidth size="small">
                  <InputLabel>색상 변색 모드 (Color Shift)</InputLabel>
                  <Select
                    value={colorMode}
                    label="색상 변색 모드 (Color Shift)"
                    onChange={(e) => setColorMode(e.target.value as WeatheringColorMode)}
                  >
                    <MenuItem value="none">변색 없음 (표준)</MenuItem>
                    <MenuItem value="green_mold">초록 곰팡이 (디시/인벤 풍화)</MenuItem>
                    <MenuItem value="yellow_aged">누런 변색 (오래된 종이/네이버 뿜)</MenuItem>
                    <MenuItem value="cyan_shift">시안/파랑 뭉개짐 (페이스북 캡처)</MenuItem>
                    <MenuItem value="magenta_burn">마젠타 타버림 (극단적 색번짐)</MenuItem>
                  </Select>
                </FormControl>

                {/* Sharpen */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      과도한 샤픈/외곽선 찌꺼기
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {sharpenIntensity}%
                    </Typography>
                  </Box>
                  <Slider
                    value={sharpenIntensity}
                    min={0}
                    max={100}
                    step={5}
                    size="small"
                    color="success"
                    onChange={(_, val) => setSharpenIntensity(val as number)}
                  />
                </Box>

                {/* Watermarks */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      커뮤니티 워터마크 덕지덕지 각인
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {watermarkCount}개
                    </Typography>
                  </Box>
                  <Slider
                    value={watermarkCount}
                    min={0}
                    max={5}
                    step={1}
                    size="small"
                    color="success"
                    onChange={(_, val) => setWatermarkCount(val as number)}
                  />
                </Box>

                {/* Screenshot UI Switch */}
                <Box
                  sx={{
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showScreenshotUi}
                        onChange={(e) => setShowScreenshotUi(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          모바일 캡처 UI 프레임 합성
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          배터리 3%, 볼륨 바, 중첩 레터박스 테두리
                        </Typography>
                      </Box>
                    }
                  />

                  {showScreenshotUi && (
                    <Box sx={{ pl: 4, pt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          중첩 레이어 단계
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {screenshotUiLevel}단계
                        </Typography>
                      </Box>
                      <Slider
                        value={screenshotUiLevel}
                        min={1}
                        max={3}
                        step={1}
                        marks
                        size="small"
                        onChange={(_, val) => setScreenshotUiLevel(val as number)}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>

            {/* Action Buttons */}
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
                color="success"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
                sx={{ py: 1.4, fontWeight: 700, borderRadius: 2, fontSize: '0.95rem' }}
              >
                풍화 짤방 다운로드
              </Button>
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
                카카오톡 공유
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setImageSrc('')}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 사진 업로드
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
