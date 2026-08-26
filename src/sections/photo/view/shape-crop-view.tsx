'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';
import { PhotoUploadWorkspace, PhotoCompareViewport, type SampleImageItem } from '../components';

const SHAPE_CROP_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-portrait',
    label: '원형 프로필 아바타',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 프로필',
  },
  {
    id: 'sample-heart',
    label: '하트 & 기념일 사진',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    subLabel: '커플 & 럽스타그램',
  },
  {
    id: 'sample-pet',
    label: '반려동물 (말풍선/별 모양)',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    subLabel: '고양이 & 반려동물',
  },
];

type ShapeType = 'circle' | 'heart' | 'star' | 'triangle' | 'hexagon' | 'flower' | 'bubble';

interface ShapeOption {
  id: ShapeType;
  name: string;
  icon: string;
}

const SHAPES: ShapeOption[] = [
  { id: 'circle', name: '원형 (Circle)', icon: '⚪' },
  { id: 'heart', name: '하트 (Heart)', icon: '❤️' },
  { id: 'star', name: '별 (Star)', icon: '⭐' },
  { id: 'triangle', name: '삼각형 (Triangle)', icon: '▲' },
  { id: 'hexagon', name: '육각형 (Hexagon)', icon: '⬡' },
  { id: 'flower', name: '꽃 (Flower)', icon: '🌸' },
  { id: 'bubble', name: '말풍선 (Bubble)', icon: '💬' },
];

export function ShapeCropView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [shape, setShape] = useState<ShapeType>('circle');
  const [mode, setMode] = useState<'inside' | 'punch'>('inside');
  const [scale, setScale] = useState<number>(80);
  const [rotation, setRotation] = useState<number>(0);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [tightCrop, setTightCrop] = useState<boolean>(false);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(360);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(360);

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

  const drawShapePath = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    shapeType: ShapeType
  ) => {
    ctx.beginPath();

    if (shapeType === 'circle') {
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    } else if (shapeType === 'heart') {
      ctx.moveTo(cx, cy + radius * 0.7);
      ctx.bezierCurveTo(
        cx - radius * 1.2,
        cy - radius * 0.3,
        cx - radius * 0.9,
        cy - radius,
        cx,
        cy - radius * 0.4
      );
      ctx.bezierCurveTo(
        cx + radius * 0.9,
        cy - radius,
        cx + radius * 1.2,
        cy - radius * 0.3,
        cx,
        cy + radius * 0.7
      );
    } else if (shapeType === 'star') {
      const points = 5;
      const innerRadius = radius * 0.45;
      for (let i = 0; i < points * 2; i += 1) {
        const r = i % 2 === 0 ? radius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shapeType === 'triangle') {
      for (let i = 0; i < 3; i += 1) {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shapeType === 'hexagon') {
      for (let i = 0; i < 6; i += 1) {
        const angle = (i * 2 * Math.PI) / 6;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shapeType === 'flower') {
      const petals = 6;
      for (let i = 0; i < petals; i += 1) {
        const angle = (i * 2 * Math.PI) / petals;
        const petalX = cx + Math.cos(angle) * (radius * 0.5);
        const petalY = cy + Math.sin(angle) * (radius * 0.5);
        ctx.arc(petalX, petalY, radius * 0.45, 0, Math.PI * 2);
      }
    } else if (shapeType === 'bubble') {
      ctx.roundRect(cx - radius * 0.9, cy - radius * 0.7, radius * 1.8, radius * 1.3, 24);
      ctx.moveTo(cx - radius * 0.3, cy + radius * 0.6);
      ctx.lineTo(cx - radius * 0.6, cy + radius * 0.95);
      ctx.lineTo(cx, cy + radius * 0.6);
    }
  };

  const renderShapeCrop = useCallback(async () => {
    if (!imageSrc) {
      setResultDataUrl('');
      return '';
    }

    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageSrc;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) / 2;
    const currentRadius = (maxRadius * scale) / 100;

    if (mode === 'inside') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      drawShapePath(ctx, cx, cy, currentRadius, shape);
      ctx.clip();

      ctx.drawImage(img, 0, 0, w, h);

      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth * 2;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      drawShapePath(ctx, cx, cy, currentRadius, shape);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.restore();
    }

    let finalCanvas = canvas;
    if (tightCrop && mode === 'inside') {
      const cropDim = Math.round(currentRadius * 2 + borderWidth * 2 + 10);
      const tight = document.createElement('canvas');
      tight.width = cropDim;
      tight.height = cropDim;
      const tCtx = tight.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(
          canvas,
          cx - cropDim / 2,
          cy - cropDim / 2,
          cropDim,
          cropDim,
          0,
          0,
          cropDim,
          cropDim
        );
        finalCanvas = tight;
      }
    }

    const dataUrl = finalCanvas.toDataURL('image/png');
    setResultDataUrl(dataUrl);
    return dataUrl;
  }, [imageSrc, shape, mode, scale, rotation, borderWidth, borderColor, tightCrop]);

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        renderShapeCrop();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    imageSrc,
    shape,
    mode,
    scale,
    rotation,
    borderWidth,
    borderColor,
    tightCrop,
    renderShapeCrop,
  ]);

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(resultDataUrl, `shape_crop_${shape}_${Date.now()}.png`);
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await shareToKakaoTalk(
        resultDataUrl,
        '도형 자르기 사진',
        `shape_${shape}_${Date.now()}.png`
      );
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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          도형 자르기 & 모양 펀칭 (Shape Crop)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          원형, 하트, 별, 육각형, 꽃, 말풍선 형태로 사진을 크롭하거나 내부를 펀칭 투명화합니다.
        </Typography>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={SHAPE_CROP_SAMPLE_IMAGES}
          onSelectSample={(url) => {
            setImageSrc(url);
            setResultDataUrl('');
          }}
          onFileSelect={processFile}
          title="도형 모양으로 자를 사진 업로드"
          subtitle="프로필 사진, 스티커, 디자인 오브젝트 제작에 활용하세요."
          icon={<CropRotateRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Preview */}
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
              bgStyle="transparent"
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

          {/* Right: Shape & Controls */}
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
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Mode Toggle */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 자르기 방식
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="inside">도형 내부만 남기기 (Crop)</ToggleButton>
                <ToggleButton value="punch">도형 모양 펀칭 뚫기 (Hole)</ToggleButton>
              </ToggleButtonGroup>

              {/* Shape Selector */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                2. 도형 선택
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
                {SHAPES.map((s) => (
                  <Button
                    key={s.id}
                    size="small"
                    variant={shape === s.id ? 'contained' : 'outlined'}
                    color={shape === s.id ? 'primary' : 'inherit'}
                    onClick={() => setShape(s.id)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 1.5,
                      p: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem', mb: 0.2 }}>{s.icon}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                      {s.name.split(' ')[0]}
                    </Typography>
                  </Button>
                ))}
              </Box>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    도형 크기 (Scale)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {scale}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={20}
                  max={100}
                  value={scale}
                  onChange={(_, v) => setScale(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    회전 각도 (Rotation)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {rotation}°
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={360}
                  value={rotation}
                  onChange={(_, v) => setRotation(v as number)}
                />
              </Box>

              {mode === 'inside' && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        테두리 두께 (Border)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {borderWidth}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={20}
                      value={borderWidth}
                      onChange={(_, v) => setBorderWidth(v as number)}
                    />
                  </Box>

                  {borderWidth > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        테두리 색상:
                      </Typography>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        style={{
                          width: 40,
                          height: 32,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={tightCrop}
                        onChange={(e) => setTightCrop(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        여백 없이 도형에 딱 맞게 자르기
                      </Typography>
                    }
                  />
                </>
              )}
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
                variant="outlined"
                color="inherit"
                onClick={() => setImageSrc('')}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                저장
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
