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
  const [noiseIntensity, setNoiseIntensity] = useState<number>(50);

  // Compare slider
  const [comparePos, setComparePos] = useState<number>(50);
  const [isDraggingCompare, setIsDraggingCompare] = useState<boolean>(false);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareContainerRef = useRef<HTMLDivElement>(null);

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
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Main Left: Preview / Compare Canvas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {!imageSrc ? (
            /* Upload Box & Samples */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            /* Workspace: Comparison Viewer */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  height: { xs: 380, sm: 480, md: 540 },
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
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  {/* Before Label */}
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
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    원본 (Original)
                  </Box>
                </Box>

                {/* After Label */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(34, 197, 94, 0.85)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  풍화 완료 (Weathered)
                </Box>

                {/* Compare Divider Line */}
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

              {/* Action Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={() => setImageSrc('')}
                  >
                    새 사진 업로드
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={handleCopyClipboard}
                  >
                    복사
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<ShareRoundedIcon />}
                    onClick={handleShare}
                  >
                    카카오톡 공유
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={handleDownload}
                    sx={{ fontWeight: 700, px: 3 }}
                  >
                    풍화 짤방 다운로드
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Sidebar: Preset & Fine Tuning Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'success.main',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        boxShadow: 1,
                        flexShrink: 0,
                      }}
                    >
                      {p.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {p.name}
                        </Typography>
                        <Chip
                          label={p.subtitle}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: isSelected ? 'success.main' : 'action.selected',
                            color: isSelected ? 'white' : 'text.secondary',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}
                      >
                        {p.desc}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* Detailed Fine-Tuning Controls */}
          <Card sx={{ p: 2.5, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                2. 디테일 세부 조절
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Generations */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    풍화 세대 (재압축 횟수)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {generations}세대 반복
                  </Typography>
                </Box>
                <Slider
                  value={generations}
                  min={1}
                  max={25}
                  step={1}
                  onChange={(_, val) => setGenerations(val as number)}
                  color="success"
                />
              </Box>

              {/* JPEG Quality */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    JPEG 압축 품질 (저품질 열화)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {Math.round(jpegQuality * 100)}%
                  </Typography>
                </Box>
                <Slider
                  value={jpegQuality}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  onChange={(_, val) => setJpegQuality(val as number)}
                  color="error"
                />
              </Box>

              {/* Color Mode */}
              <FormControl fullWidth size="small">
                <InputLabel id="color-mode-label">색상 변색 & 열화 틴트</InputLabel>
                <Select
                  labelId="color-mode-label"
                  value={colorMode}
                  label="색상 변색 & 열화 틴트"
                  onChange={(e) => setColorMode(e.target.value as WeatheringColorMode)}
                >
                  <MenuItem value="green_mold">🍵 초록빛 썩은 짤 (Green Mold)</MenuItem>
                  <MenuItem value="aged_yellow">📜 누런 황변 (Aged Yellow)</MenuItem>
                  <MenuItem value="deep_fried">🔥 딥 프라이드 (Deep Fried)</MenuItem>
                  <MenuItem value="natural">📷 자연스러운 압축 (Natural)</MenuItem>
                  <MenuItem value="grayscale">📠 흑백 저화질 (Low-Fi Gray)</MenuItem>
                </Select>
              </FormControl>

              {/* Sharpen / Halo */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    샤프닝 & 자막 에지 번짐
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {sharpenIntensity}%
                  </Typography>
                </Box>
                <Slider
                  value={sharpenIntensity}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(_, val) => setSharpenIntensity(val as number)}
                />
              </Box>

              {/* Downscale */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    해상도 축소 비율 (8x8 블록 노이즈)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {Math.round(downscaleFactor * 100)}%
                  </Typography>
                </Box>
                <Slider
                  value={downscaleFactor}
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  onChange={(_, val) => setDownscaleFactor(val as number)}
                />
              </Box>

              {/* Watermarks */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    커뮤니티 워터마크 중첩
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {watermarkCount}개 로고
                  </Typography>
                </Box>
                <Slider
                  value={watermarkCount}
                  min={0}
                  max={4}
                  step={1}
                  marks
                  onChange={(_, val) => setWatermarkCount(val as number)}
                />
              </Box>

              {/* Screenshot UI Toggle */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
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
        </Box>
      </Box>
    </DashboardContent>
  );
}
