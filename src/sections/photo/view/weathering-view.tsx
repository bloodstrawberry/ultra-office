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
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
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
      setResultDataUrl('');
    };
    reader.readAsDataURL(file);
  }, []);

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

  // Download Result
  const handleDownloadResult = async () => {
    if (!resultDataUrl) return;
    const res = await downloadDataUrl(
      resultDataUrl,
      `weathered_meme_${activePresetId}_result_${Date.now()}.jpg`
    );
    if (res.success) {
      toast.success('완성된 결과물 이미지가 저장되었습니다.');
    } else {
      toast.error(res.message);
    }
  };

  // Download Split Comparison
  const handleDownloadSplit = async () => {
    if (!imageSrc || !resultDataUrl) return;
    try {
      const splitUrl = await renderGenericSplitComparisonImage({
        originalSrc: imageSrc,
        resultSrc: resultDataUrl,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      const res = await downloadDataUrl(
        splitUrl,
        `weathered_meme_${activePresetId}_split_comparison_${Date.now()}.png`
      );
      if (res.success) {
        toast.success('슬라이더 비교 상태 그대로 이미지가 저장되었습니다.');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('비교 상태 저장 중 오류가 발생했습니다.');
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
        <PhotoUploadWorkspace
          sampleImages={WEATHERING_SAMPLES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={processFile}
          title="풍화시킬 사진을 업로드하세요"
          subtitle="클릭하거나 사진을 이곳으로 드래그 앤 드롭 (PNG, JPG, WEBP)"
          icon={<Typography sx={{ fontSize: 36 }}>🍵</Typography>}
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
            <PhotoCompareViewport
              originalSrc={imageSrc}
              resultSrc={resultDataUrl}
              isLoading={isProcessing}
              loadingProgress={{ progress: 0, text: '디지털 풍화 연산 중...' }}
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
            />
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
                variant="outlined"
                color="inherit"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setImageSrc('')}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>

              {/* Main: Clean Result Save */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadResult}
                disabled={isProcessing || !resultDataUrl}
                sx={{ py: 1.3, fontWeight: 700, borderRadius: 2, fontSize: '0.95rem' }}
              >
                결과물 저장
              </Button>

              {/* Secondary: Split Slider Comparison State Save */}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<CompareArrowsRoundedIcon />}
                onClick={handleDownloadSplit}
                disabled={isProcessing || !resultDataUrl}
                sx={{ py: 1.1, fontWeight: 700, borderRadius: 2, fontSize: '0.85rem' }}
              >
                비교 상태 저장 (Split View)
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<ShareRoundedIcon />}
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
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
