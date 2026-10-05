'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { createOutlineMask, removeSimilarColor } from '../utils/outline-processor';
import { PhotoCompareViewport, PhotoUploadWorkspace, type SampleImageItem } from '../components';
import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';

const QUICK_COLORS = ['#FFFFFF', '#111827', '#F43F5E', '#FACC15', '#38BDF8', '#A3E635'];
const OUTLINE_SAMPLES: SampleImageItem[] = [
  {
    id: 'berry-logo',
    label: '🍓 딸기 로고 · 투명 PNG',
    url: '/logo.png',
    subLabel: '그림 윤곽 테두리',
  },
  {
    id: 'korean-title',
    label: '📝 한글 타이틀 · 투명 PNG',
    url: '/images/title.png',
    subLabel: '글자 윤곽 테두리',
  },
  {
    id: 'solid-background',
    label: '🎨 단색 배경 로고 · JPG',
    url: '/assets/watermark_logo/meta.jpg',
    subLabel: '배경 제거 연습',
  },
];

export function PhotoOutlineView() {
  const resizeStartRef = useRef({ x: 0, width: 380 });
  const isResizingRef = useRef(false);
  const [imageSrc, setImageSrc] = useState('');
  const [fileName, setFileName] = useState('image');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourcePixels, setSourcePixels] = useState<Uint8ClampedArray | null>(null);
  const [workingPixels, setWorkingPixels] = useState<Uint8ClampedArray | null>(null);
  const [editedSrc, setEditedSrc] = useState('');
  const [beforeSrc, setBeforeSrc] = useState('');
  const [resultSrc, setResultSrc] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [thickness, setThickness] = useState(8);
  const [previewBg, setPreviewBg] = useState<'checker' | 'dark'>('checker');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [tolerance, setTolerance] = useState(32);
  const [previewMode, setPreviewMode] = useState<'split' | 'single'>('split');
  const [splitOrientation, setSplitOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [splitMode, setSplitMode] = useState<'inside' | 'outside'>('inside');
  const [splitStart, setSplitStart] = useState(25);
  const [splitEnd, setSplitEnd] = useState(75);
  const [rightPanelWidth, setRightPanelWidth] = useState(380);

  const handleSelectSample = (url: string) => {
    setFileName(OUTLINE_SAMPLES.find((sample) => sample.url === url)?.id || 'sample');
    setImage(null);
    setSourcePixels(null);
    setWorkingPixels(null);
    setEditedSrc('');
    setBeforeSrc('');
    setResultSrc('');
    setRemoveMode(false);
    setImageSrc(url);
  };

  const handleBackToUpload = () => {
    setImageSrc('');
    setImage(null);
    setSourcePixels(null);
    setWorkingPixels(null);
    setEditedSrc('');
    setBeforeSrc('');
    setResultSrc('');
    setRemoveMode(false);
  };

  const handleFileSelect = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('PNG, JPG 또는 WebP 이미지를 선택해 주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'image');
      setImage(null);
      setSourcePixels(null);
      setWorkingPixels(null);
      setEditedSrc('');
      setBeforeSrc('');
      setResultSrc('');
      setRemoveMode(false);
      setImageSrc(String(reader.result));
    };
    reader.onerror = () => toast.error('이미지를 읽지 못했습니다.');
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return undefined;
    let cancelled = false;
    const nextImage = new Image();
    nextImage.onload = () => {
      if (cancelled) return;
      try {
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = nextImage.naturalWidth;
        sourceCanvas.height = nextImage.naturalHeight;
        const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas 2D context unavailable');
        ctx.drawImage(nextImage, 0, 0);
        const pixels = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
        setImage(nextImage);
        setSourcePixels(pixels);
        setWorkingPixels(pixels);
        setEditedSrc(imageSrc);
      } catch {
        toast.error('이미지를 처리하지 못했습니다. 더 작은 파일로 다시 시도해 주세요.');
      }
    };
    nextImage.onerror = () => {
      if (!cancelled) toast.error('이미지를 열지 못했습니다.');
    };
    nextImage.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!image || !workingPixels) return undefined;
    let cancelled = false;
    setIsProcessing(true);
    const timer = window.setTimeout(() => {
      try {
        const outline = createOutlineMask(
          workingPixels,
          image.naturalWidth,
          image.naturalHeight,
          thickness,
          color
        );
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        canvas.width = outline.width;
        canvas.height = outline.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');
        const mask = ctx.createImageData(outline.width, outline.height);
        mask.data.set(outline.pixels);
        ctx.putImageData(mask, 0, 0);
        const editedCanvas = document.createElement('canvas');
        editedCanvas.width = image.naturalWidth;
        editedCanvas.height = image.naturalHeight;
        const editedCtx = editedCanvas.getContext('2d');
        if (!editedCtx) throw new Error('Canvas 2D context unavailable');
        const editedData = editedCtx.createImageData(image.naturalWidth, image.naturalHeight);
        editedData.data.set(workingPixels);
        editedCtx.putImageData(editedData, 0, 0);
        ctx.drawImage(editedCanvas, outline.padding, outline.padding);
        const beforeCanvas = document.createElement('canvas');
        beforeCanvas.width = outline.width;
        beforeCanvas.height = outline.height;
        beforeCanvas.getContext('2d')?.drawImage(image, outline.padding, outline.padding);
        setBeforeSrc(beforeCanvas.toDataURL('image/png'));
        setResultSrc(canvas.toDataURL('image/png'));
      } catch {
        if (!cancelled) toast.error('테두리 생성에 실패했습니다.');
      } finally {
        if (!cancelled) setIsProcessing(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, workingPixels, color, thickness]);

  const handleRemoveBackground = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!removeMode || !image || !workingPixels) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * image.naturalWidth);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * image.naturalHeight);
    const { pixels, removedCount } = removeSimilarColor(
      workingPixels,
      image.naturalWidth,
      image.naturalHeight,
      x,
      y,
      tolerance
    );
    if (removedCount === 0) {
      toast.info('투명한 부분이거나 지울 색상이 없습니다.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const editedData = ctx.createImageData(canvas.width, canvas.height);
    editedData.data.set(pixels);
    ctx.putImageData(editedData, 0, 0);
    setIsProcessing(true);
    setResultSrc('');
    setWorkingPixels(pixels);
    setEditedSrc(canvas.toDataURL('image/png'));
    setPreviewMode('single');
    setRemoveMode(false);
    toast.success(
      `${removedCount.toLocaleString()}개 픽셀의 배경색을 지우고 테두리를 다시 적용했습니다.`
    );
  };

  const handleResetBackground = () => {
    if (!sourcePixels) return;
    setResultSrc('');
    setWorkingPixels(sourcePixels);
    setEditedSrc(imageSrc);
    setRemoveMode(false);
    toast.info('배경 제거를 초기화했습니다.');
  };

  const handleSaveResult = async () => {
    if (!resultSrc) return;
    setIsExporting(true);
    try {
      const result = await downloadDataUrl(resultSrc, `${fileName}_테두리.png`);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error('결과물 저장에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveComparison = async () => {
    if (!beforeSrc || !resultSrc) return;
    setIsExporting(true);
    try {
      const comparisonSrc = await renderGenericSplitComparisonImage({
        originalSrc: beforeSrc,
        resultSrc,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      const result = await downloadDataUrl(comparisonSrc, `${fileName}_테두리_비교.png`);
      if (result.success) toast.success('현재 비교 상태를 저장했습니다.');
      else toast.error(result.message);
    } catch {
      toast.error('비교 상태 저장에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!resultSrc) return;
    setIsExporting(true);
    try {
      const result = await shareToKakaoTalk(
        resultSrc,
        '[Ultra Office] 테두리 추가',
        `${fileName}_테두리.png`
      );
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error('공유에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const previewSx =
    previewBg === 'dark'
      ? { backgroundColor: '#171A20' }
      : {
          backgroundColor: '#ABB0BA',
          backgroundImage:
            'linear-gradient(45deg, #D4D7DD 25%, transparent 25%), linear-gradient(-45deg, #D4D7DD 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #D4D7DD 75%), linear-gradient(-45deg, transparent 75%, #D4D7DD 75%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0',
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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
          테두리 추가
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PNG, JPG 또는 WebP를 올리고 필요한 경우 배경색을 클릭해 투명하게 만드세요. 글자와 그림의
          윤곽을 따라 원하는 색상과 굵기의 테두리를 추가할 수 있습니다.
        </Typography>
      </Box>

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={OUTLINE_SAMPLES}
          onSelectSample={handleSelectSample}
          onFileSelect={handleFileSelect}
          title="테두리를 넣을 이미지를 업로드하세요"
          subtitle="PNG, JPG 또는 WebP를 선택하세요. 배경이 불투명해도 업로드 후 지울 수 있습니다."
          sampleTitle="⚡ 테두리 추가 예제 3개"
          sampleSubtitle="투명 그림, 한글 타이틀, 단색 배경 로고를 클릭해 바로 편집해 보세요."
          buttonText="이미지 선택하기"
          accept="image/png,image/jpeg,image/webp"
          sx={{ minHeight: 440 }}
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: { xs: 520, md: 0 },
              height: { xs: 520, md: '100%' },
              pr: { md: 1 },
            }}
          >
            {removeMode ? (
              <Card
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    배경 편집 · 지울 색상을 클릭하세요
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Chip
                      label="체커보드"
                      size="small"
                      clickable
                      color={previewBg === 'checker' ? 'primary' : 'default'}
                      onClick={() => setPreviewBg('checker')}
                    />
                    <Chip
                      label="어두운 배경"
                      size="small"
                      clickable
                      color={previewBg === 'dark' ? 'primary' : 'default'}
                      onClick={() => setPreviewBg('dark')}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    ...previewSx,
                    flex: '1 1 auto',
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: 2,
                  }}
                >
                  {editedSrc ? (
                    <Box
                      component="img"
                      src={editedSrc}
                      alt="배경색 선택 캔버스"
                      onClick={handleRemoveBackground}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        cursor: 'crosshair',
                      }}
                    />
                  ) : (
                    <CircularProgress />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  이 배경색은 미리보기 전용입니다. 저장되는 PNG에는 포함되지 않습니다.
                </Typography>
              </Card>
            ) : (
              <PhotoCompareViewport
                originalSrc={beforeSrc || imageSrc}
                resultSrc={resultSrc}
                isLoading={isProcessing}
                loadingProgress={{ progress: 0, text: '테두리를 만드는 중...' }}
                previewMode={previewMode}
                onPreviewModeChange={(mode) => {
                  if (mode !== 'mask') setPreviewMode(mode);
                }}
                splitOrientation={splitOrientation}
                onSplitOrientationChange={setSplitOrientation}
                splitMode={splitMode}
                onSplitModeChange={setSplitMode}
                splitStart={splitStart}
                onSplitStartChange={setSplitStart}
                splitEnd={splitEnd}
                onSplitEndChange={setSplitEnd}
                bgStyle="transparent"
              />
            )}
          </Box>

          <Box
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              isResizingRef.current = true;
              resizeStartRef.current = { x: event.clientX, width: rightPanelWidth };
            }}
            onPointerMove={(event) => {
              if (isResizingRef.current) {
                setRightPanelWidth(
                  Math.max(
                    280,
                    Math.min(
                      650,
                      resizeStartRef.current.width + resizeStartRef.current.x - event.clientX
                    )
                  )
                );
              }
            }}
            onPointerUp={(event) => {
              isResizingRef.current = false;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
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
              '&:hover .divider-bar, &:active .divider-bar': { bgcolor: 'primary.main', width: 3 },
            }}
          >
            <Box
              className="divider-bar"
              sx={{ width: 2, height: '100%', bgcolor: 'divider', borderRadius: 1 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.25,
              minHeight: 0,
              height: { xs: 'auto', md: '100%' },
              overflow: { xs: 'visible', md: 'hidden' },
              pl: { md: 1 },
              pr: { md: 0.5 },
            }}
          >
            <Card
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: { xs: 'auto', md: 0 },
              }}
            >
              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: { xs: 'auto', md: 0 },
                  overflowY: { xs: 'visible', md: 'auto' },
                  overscrollBehavior: 'contain',
                  pr: 0.5,
                }}
              >
                <Box sx={{ pb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    1. 배경 제거
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}
                  >
                    버튼을 누른 뒤 왼쪽 이미지에서 지울 배경색을 클릭하세요. 비슷한 색은 이미지
                    전체에서 투명해지고 테두리가 다시 적용됩니다. 다른 색도 지우려면 버튼을 다시
                    누르세요.
                  </Typography>
                  <Button
                    fullWidth
                    variant={removeMode ? 'contained' : 'outlined'}
                    color="secondary"
                    startIcon={<ColorizeRoundedIcon />}
                    aria-pressed={removeMode}
                    onClick={() => setRemoveMode((prev) => !prev)}
                    sx={{ mb: 1.5 }}
                  >
                    {removeMode ? '배경 편집 완료 · 비교 보기' : '배경 제거'}
                  </Button>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">비슷한 색 허용 범위</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      ±{tolerance}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={tolerance}
                    min={0}
                    max={150}
                    onChange={(_, value) => setTolerance(value as number)}
                    aria-label="배경색 허용 범위"
                    sx={{ mb: 1 }}
                  />
                  <Button
                    size="small"
                    startIcon={<RestartAltRoundedIcon />}
                    disabled={!sourcePixels || workingPixels === sourcePixels}
                    onClick={handleResetBackground}
                    sx={{ mb: 0 }}
                  >
                    배경 제거 초기화
                  </Button>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                    2. 테두리 설정
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    색상
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {QUICK_COLORS.map((quickColor) => (
                      <Box
                        key={quickColor}
                        component="button"
                        type="button"
                        aria-label={`테두리 색상 ${quickColor}`}
                        aria-pressed={color.toLowerCase() === quickColor.toLowerCase()}
                        onClick={() => setColor(quickColor)}
                        sx={{
                          width: 32,
                          height: 32,
                          p: 0,
                          borderRadius: '50%',
                          bgcolor: quickColor,
                          border: '2px solid',
                          borderColor:
                            color.toLowerCase() === quickColor.toLowerCase()
                              ? 'primary.main'
                              : 'divider',
                          cursor: 'pointer',
                          boxShadow: '0 0 0 1px rgba(0,0,0,.18)',
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Box
                      component="input"
                      type="color"
                      aria-label="사용자 지정 테두리 색상"
                      value={color}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setColor(event.target.value)
                      }
                      sx={{
                        width: 48,
                        height: 38,
                        p: 0,
                        border: 'none',
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                    <Typography variant="body2">{color.toUpperCase()}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      굵기
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {thickness}px
                    </Typography>
                  </Box>
                  <Slider
                    value={thickness}
                    min={1}
                    max={48}
                    valueLabelDisplay="auto"
                    onChange={(_, value) => setThickness(value as number)}
                    aria-label="테두리 굵기"
                    sx={{ mb: 0 }}
                  />
                </Box>
              </Box>
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={handleBackToUpload}
                  disabled={isExporting}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  다른 사진
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleShare}
                  disabled={isProcessing || isExporting || !resultSrc}
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  공유
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSaveResult}
                disabled={isProcessing || isExporting || !resultSrc}
                startIcon={
                  isExporting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleSaveComparison}
                disabled={isProcessing || isExporting || !beforeSrc || !resultSrc}
                startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ py: 0.65, borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}
              >
                비교 상태 저장
              </Button>
              {isProcessing && (
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}
                >
                  테두리를 만드는 중...
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
