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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import GestureRoundedIcon from '@mui/icons-material/GestureRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';
import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';
import {
  type DoodleMode,
  type DoodleConfig,
  renderDoodlePhoto,
  type PaperBackground,
  type DerpyExpression,
  type DoodleColorStyle,
  DOODLE_SAMPLE_IMAGES,
  FUNNY_DERPY_CAPTIONS,
} from '../utils/doodle-processor';

export function DoodleView() {
  const [imageSrc, setImageSrc] = useState<string>('');

  // Mode Selection
  const [mode, setMode] = useState<DoodleMode>('derpy');
  const [randomSeed, setRandomSeed] = useState<number>(42);

  // Mode 1: Doodle Settings
  const [roughness, setRoughness] = useState<number>(6);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [crosshatchDensity, setCrosshatchDensity] = useState<number>(50);
  const [colorStyle, setColorStyle] = useState<DoodleColorStyle>('black_ink');
  const [paperBg, setPaperBg] = useState<PaperBackground>('white');

  // Mode 2: Derpy Settings
  const [derpLevel, setDerpLevel] = useState<number>(6);
  const [mouseJitter, setMouseJitter] = useState<number>(65);
  const [pixelBrushSize, setPixelBrushSize] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [enablePaintBucket, setEnablePaintBucket] = useState<boolean>(true);
  const [paintColorCount, setPaintColorCount] = useState<4 | 8 | 16 | 24>(16);
  const [derpyExpression, setDerpyExpression] = useState<DerpyExpression>('auto');

  // Caption Settings
  const [showCaption, setShowCaption] = useState<boolean>(true);
  const [customCaption, setCustomCaption] = useState<string>('(하찮음 100%)');

  // Viewport comparison state
  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const newWidth = Math.max(300, Math.min(680, resizeStartWidthRef.current + deltaX));
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
      setResultDataUrl('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRandomize = () => {
    const nextSeed = Math.floor(Math.random() * 100000) + 1;
    setRandomSeed(nextSeed);

    // Pick random funny caption
    const randomCaption =
      FUNNY_DERPY_CAPTIONS[Math.floor(Math.random() * FUNNY_DERPY_CAPTIONS.length)];
    setCustomCaption(randomCaption);

    toast.success('니맘대로 다시 그리기 적용 완료!', {
      description: '새로운 삐뚤빼뚤 선과 표정으로 하찮게 다시 그렸습니다.',
    });
  };

  const applyDoodle = useCallback(async () => {
    if (!imageSrc) {
      setResultDataUrl('');
      return '';
    }

    const canvas = canvasRef.current;
    if (!canvas) return '';

    setIsProcessing(true);

    try {
      const config: DoodleConfig = {
        mode,
        randomSeed,
        roughness,
        strokeWidth,
        crosshatchDensity,
        colorStyle,
        paperBg,
        derpLevel,
        mouseJitter,
        pixelBrushSize,
        enablePaintBucket,
        paintColorCount,
        derpyExpression,
        customCaption,
        showCaption,
      };

      const outUrl = await renderDoodlePhoto(canvas, imageSrc, config);
      setResultDataUrl(outUrl);
      return outUrl;
    } catch {
      toast.error('그림 변환 중 오류가 발생했습니다.');
      return '';
    } finally {
      setIsProcessing(false);
    }
  }, [
    imageSrc,
    mode,
    randomSeed,
    roughness,
    strokeWidth,
    crosshatchDensity,
    colorStyle,
    paperBg,
    derpLevel,
    mouseJitter,
    pixelBrushSize,
    enablePaintBucket,
    paintColorCount,
    derpyExpression,
    customCaption,
    showCaption,
  ]);

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        applyDoodle();
      }, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [imageSrc, applyDoodle]);

  const handleSaveResult = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const fileName =
        mode === 'derpy'
          ? `derpy_ms_paint_${Date.now()}.png`
          : `lazy_doodle_sketch_${Date.now()}.png`;
      const res = await downloadDataUrl(resultDataUrl, fileName);
      toast.success(res.message);
    } catch {
      toast.error('결과물 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSplit = async () => {
    if (!imageSrc || !resultDataUrl) return;
    setIsProcessing(true);
    try {
      const splitUrl = await renderGenericSplitComparisonImage({
        originalSrc: imageSrc,
        resultSrc: resultDataUrl,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      const res = await downloadDataUrl(splitUrl, `doodle_comparison_${mode}_${Date.now()}.png`);
      toast.success('슬라이더 비교 상태 그대로 저장되었습니다.');
    } catch {
      toast.error('비교 상태 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const title = mode === 'derpy' ? '세상에서 가장 하찮은 그림' : '대충 그린 스케치';
      const res = await shareToKakaoTalk(resultDataUrl, title, `doodle_${Date.now()}.png`);
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
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
            대충 · 하찮은 그림 스튜디오
          </Typography>
          <Chip label="NEW" color="success" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 대충 끄적인 펜 스케치나, 그림판에서 마우스로 개발새발 그린 세상에서 가장 하찮은
          짤로 즉시 변환합니다.
        </Typography>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={DOODLE_SAMPLE_IMAGES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={processFile}
          title="하찮게 그릴 이미지 업로드"
          subtitle="반려동물, 인물, 풍경 사진을 드래그하거나 클릭하여 올려주세요."
          icon={<GestureRoundedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Compare Viewport */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
            }}
          >
            <PhotoCompareViewport
              originalSrc={imageSrc}
              resultSrc={resultDataUrl}
              isLoading={isProcessing}
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
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setImageSrc('');
                    setResultDataUrl('');
                  }}
                  startIcon={<RefreshRoundedIcon />}
                >
                  다른 사진
                </Button>
              }
            />
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
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

          {/* Right: Control Panel */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            {/* Mode Switcher */}
            <Card sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 그리기 모드 선택
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 1.5 }}
              >
                <ToggleButton
                  value="derpy"
                  sx={{
                    py: 1,
                    fontWeight: 700,
                    borderColor: mode === 'derpy' ? 'error.main' : 'divider',
                    color: mode === 'derpy' ? 'error.main' : 'text.primary',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <AutoFixHighRoundedIcon fontSize="small" />
                    <span>하찮은 그림판 짤</span>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="doodle"
                  sx={{
                    py: 1,
                    fontWeight: 700,
                    borderColor: mode === 'doodle' ? 'primary.main' : 'divider',
                    color: mode === 'doodle' ? 'primary.main' : 'text.primary',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <BrushRoundedIcon fontSize="small" />
                    <span>대충 그린 스케치</span>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Randomize Button: "아 됐고 그냥 니맘대로 그려" */}
              <Button
                fullWidth
                variant="contained"
                color={mode === 'derpy' ? 'error' : 'warning'}
                onClick={handleRandomize}
                startIcon={<CasinoRoundedIcon />}
                sx={{
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: (theme) => theme.customShadows?.z8,
                }}
              >
                🎲 니맘대로 다시 그리기 (Random)
              </Button>
            </Card>

            {/* Mode 2: Derpy MS Paint Specific Controls */}
            {mode === 'derpy' && (
              <Card sx={{ p: 2, borderRadius: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    2. 하찮음 디테일 설정
                  </Typography>
                  <Chip
                    label={`하찮음 Level ${derpLevel}`}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Box>

                {/* Derp Level Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      하찮음 & 단순화 강도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {derpLevel === 10 ? '우주급 개발새발 (MAX)' : `Lv.${derpLevel}`}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={1}
                    max={10}
                    step={1}
                    value={derpLevel}
                    onChange={(_, v) => setDerpLevel(v as number)}
                    color="error"
                  />
                </Box>

                {/* Mouse Jitter Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      마우스 떨림 (개발새발 선 삐뚤빼뚤)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {mouseJitter}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={10}
                    max={100}
                    value={mouseJitter}
                    onChange={(_, v) => setMouseJitter(v as number)}
                    color="error"
                  />
                </Box>

                {/* Pixel Brush Size */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.8 }}>
                    그림판 픽셀 브러시 굵기
                  </Typography>
                  <ToggleButtonGroup
                    value={pixelBrushSize}
                    exclusive
                    onChange={(_, v) => v && setPixelBrushSize(v)}
                    fullWidth
                    size="small"
                  >
                    {[1, 2, 3, 5].map((size) => (
                      <ToggleButton key={size} value={size} sx={{ py: 0.5, fontWeight: 700 }}>
                        {size}px
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Paint Bucket Fill Toggle */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                    p: 1.2,
                    bgcolor: 'action.hover',
                    borderRadius: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      그림판 페인트통 채색
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      단색 양자화 & 미세 틈새 채우기
                    </Typography>
                  </Box>
                  <Switch
                    checked={enablePaintBucket}
                    onChange={(e) => setEnablePaintBucket(e.target.checked)}
                    color="error"
                  />
                </Box>

                {/* Expression Overlay */}
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel>하찮은 표정 / 점눈</InputLabel>
                  <Select
                    value={derpyExpression}
                    label="하찮은 표정 / 점눈"
                    onChange={(e) => setDerpyExpression(e.target.value as DerpyExpression)}
                  >
                    <MenuItem value="auto">🎲 자동 랜덤 표정</MenuItem>
                    <MenuItem value="dot_eyes">• • 점눈 & 삐뚤빼뚤 미소</MenuItem>
                    <MenuItem value="derp_bean">👀 짝짝이 콩알눈 & 멍때리기</MenuItem>
                    <MenuItem value="wink">^ _ ~ 윙크 & 냥이 입 (:3)</MenuItem>
                    <MenuItem value="blank">- _ - 극대노 무표정</MenuItem>
                    <MenuItem value="smug">◡ ◡ 킹받는 미소</MenuItem>
                    <MenuItem value="none">표정 오버레이 끄기</MenuItem>
                  </Select>
                </FormControl>
              </Card>
            )}

            {/* Mode 1: Lazy Doodle Specific Controls */}
            {mode === 'doodle' && (
              <Card sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  2. 스케치 디테일 설정
                </Typography>

                {/* Roughness Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      스케치 러프함 (Roughness)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {roughness}/10
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={1}
                    max={10}
                    value={roughness}
                    onChange={(_, v) => setRoughness(v as number)}
                  />
                </Box>

                {/* Stroke Width Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      펜/연필 선 굵기
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {strokeWidth}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={1}
                    max={6}
                    value={strokeWidth}
                    onChange={(_, v) => setStrokeWidth(v as number)}
                  />
                </Box>

                {/* Crosshatch Density */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      음영 끄적임 / 사선 해칭 밀도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {crosshatchDensity}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0}
                    max={100}
                    value={crosshatchDensity}
                    onChange={(_, v) => setCrosshatchDensity(v as number)}
                  />
                </Box>

                {/* Color Style Selection */}
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel>펜 & 채색 스타일</InputLabel>
                  <Select
                    value={colorStyle}
                    label="펜 & 채색 스타일"
                    onChange={(e) => setColorStyle(e.target.value as DoodleColorStyle)}
                  >
                    <MenuItem value="black_ink">🖋️ 흑백 볼펜 / 잉크</MenuItem>
                    <MenuItem value="blue_pen">🖊️ 파란색 모나미 볼펜</MenuItem>
                    <MenuItem value="pencil">✏️ 연필 소묘 흑연 톤</MenuItem>
                    <MenuItem value="marker_color">🎨 컬러 마커 끄적임</MenuItem>
                  </Select>
                </FormControl>
              </Card>
            )}

            {/* Background & Caption Controls */}
            <Card sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                3. 배경 & 손글씨 문구
              </Typography>

              {/* Background Selection */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>배경 캔버스 스타일</InputLabel>
                <Select
                  value={paperBg}
                  label="배경 캔버스 스타일"
                  onChange={(e) => setPaperBg(e.target.value as PaperBackground)}
                >
                  <MenuItem value="white">⚪ 순백색 캔버스 (기본)</MenuItem>
                  <MenuItem value="kraft">📜 누런 재생 메모지</MenuItem>
                  <MenuItem value="grid">📐 모눈종이 노트</MenuItem>
                  <MenuItem value="paint_grey">🖼️ Windows 그림판 룩</MenuItem>
                  <MenuItem value="transparent">🔳 투명 배경 (PNG)</MenuItem>
                </Select>
              </FormControl>

              {/* Caption Toggle & Text Input */}
              <FormControlLabel
                control={
                  <Switch
                    checked={showCaption}
                    onChange={(e) => setShowCaption(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    하찮은 손글씨 제목 스탬프
                  </Typography>
                }
                sx={{ mb: 1 }}
              />

              {showCaption && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder="하찮은 문구를 입력하세요"
                  />
                  {/* Preset chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {FUNNY_DERPY_CAPTIONS.slice(0, 5).map((cap) => (
                      <Chip
                        key={cap}
                        label={cap}
                        size="small"
                        clickable
                        onClick={() => setCustomCaption(cap)}
                        variant={customCaption === cap ? 'filled' : 'outlined'}
                        color={customCaption === cap ? 'primary' : 'default'}
                        sx={{ fontSize: '0.72rem', height: 24 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
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
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setResultDataUrl('');
                }}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSaveResult}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                결과물 저장 (PNG)
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSaveSplit}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<CompareArrowsRoundedIcon />}
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
              >
                비교 상태 저장 (Split View)
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<ShareRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
