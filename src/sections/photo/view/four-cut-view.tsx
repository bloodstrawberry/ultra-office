'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

type LayoutType = 'strip4' | 'grid4' | 'strip2' | 'polaroid1';
type FrameTheme =
  | 'classic-dark'
  | 'pure-white'
  | 'pastel-pink'
  | 'retro-cream'
  | 'navy'
  | 'neon-mint'
  | 'gradient';
type PhotoFilter = 'none' | 'mono' | 'vintage' | 'warm' | 'cool' | 'film';

interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
}

const THEMES: { id: FrameTheme; name: string; bg: string; text: string }[] = [
  { id: 'classic-dark', name: '클래식 다크', bg: '#18181B', text: '#FAFAFA' },
  { id: 'pure-white', name: '퓨어 화이트', bg: '#FFFFFF', text: '#18181B' },
  { id: 'pastel-pink', name: '파스텔 핑크', bg: '#FCE7F3', text: '#9D174D' },
  { id: 'retro-cream', name: '레트로 크림', bg: '#FEF3C7', text: '#92400E' },
  { id: 'navy', name: '미드나잇 네이비', bg: '#0F172A', text: '#38BDF8' },
  { id: 'neon-mint', name: '네온 민트', bg: '#CCFBF1', text: '#115E59' },
  {
    id: 'gradient',
    name: '선셋 그라디언트',
    bg: 'linear-gradient(135deg, #EC4899, #8B5CF6, #3B82F6)',
    text: '#FFFFFF',
  },
];

const FILTERS: { id: PhotoFilter; name: string }[] = [
  { id: 'none', name: '원본' },
  { id: 'mono', name: '흑백' },
  { id: 'vintage', name: '빈티지' },
  { id: 'warm', name: '웜톤' },
  { id: 'cool', name: '쿨톤' },
  { id: 'film', name: '필름 감성' },
];

const STICKER_PRESETS = ['✨', '💖', '🎀', '🧸', '🌸', '👑', '🕶️', '🐱', '🐶', '🔥', '⭐', '🎈'];

export function FourCutView() {
  const [layout, setLayout] = useState<LayoutType>('strip4');
  const [theme, setTheme] = useState<FrameTheme>('classic-dark');
  const [filter, setFilter] = useState<PhotoFilter>('none');
  const [dateText, setDateText] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  });
  const [captionText, setCaptionText] = useState<string>('LIFE FOUR CUTS');
  const [images, setImages] = useState<string[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const maxSlots = layout === 'strip4' || layout === 'grid4' ? 4 : layout === 'strip2' ? 2 : 1;

  const addFiles = useCallback(
    (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) return;

      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (src) {
            setImages((prev) => {
              if (prev.length < maxSlots) {
                return [...prev, src];
              }
              return prev;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [maxSlots]
  );

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: addFiles,
    multiple: true,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSticker = (emoji: string) => {
    const newSticker: StickerItem = {
      id: `${Date.now()}_${Math.random()}`,
      emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
    };
    setStickers((prev) => [...prev, newSticker]);
    toast.success(`${emoji} 스티커가 추가되었습니다.`);
  };

  const renderFrame = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    let width = 600;
    let height = 1900;

    if (layout === 'strip4') {
      width = 600;
      height = 1900;
    } else if (layout === 'grid4') {
      width = 900;
      height = 1200;
    } else if (layout === 'strip2') {
      width = 600;
      height = 1100;
    } else if (layout === 'polaroid1') {
      width = 700;
      height = 900;
    }

    canvas.width = width;
    canvas.height = height;

    const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

    if (theme === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#EC4899');
      grad.addColorStop(0.5, '#8B5CF6');
      grad.addColorStop(1, '#3B82F6');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = currentTheme.bg;
    }
    ctx.fillRect(0, 0, width, height);

    interface SlotRect {
      x: number;
      y: number;
      w: number;
      h: number;
    }
    const slots: SlotRect[] = [];

    if (layout === 'strip4') {
      const marginX = 40;
      const marginTop = 50;
      const photoW = width - marginX * 2;
      const photoH = 380;
      const gap = 30;

      for (let i = 0; i < 4; i += 1) {
        slots.push({
          x: marginX,
          y: marginTop + i * (photoH + gap),
          w: photoW,
          h: photoH,
        });
      }
    } else if (layout === 'grid4') {
      const marginX = 50;
      const marginTop = 60;
      const gap = 30;
      const photoW = (width - marginX * 2 - gap) / 2;
      const photoH = 430;

      slots.push({ x: marginX, y: marginTop, w: photoW, h: photoH });
      slots.push({ x: marginX + photoW + gap, y: marginTop, w: photoW, h: photoH });
      slots.push({ x: marginX, y: marginTop + photoH + gap, w: photoW, h: photoH });
      slots.push({ x: marginX + photoW + gap, y: marginTop + photoH + gap, w: photoW, h: photoH });
    } else if (layout === 'strip2') {
      const marginX = 45;
      const marginTop = 60;
      const photoW = width - marginX * 2;
      const photoH = 390;
      const gap = 35;

      for (let i = 0; i < 2; i += 1) {
        slots.push({
          x: marginX,
          y: marginTop + i * (photoH + gap),
          w: photoW,
          h: photoH,
        });
      }
    } else if (layout === 'polaroid1') {
      const marginX = 50;
      const marginTop = 60;
      const photoW = width - marginX * 2;
      const photoH = 620;
      slots.push({ x: marginX, y: marginTop, w: photoW, h: photoH });
    }

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      const imgSrc = images[i];

      ctx.save();
      const radius = 16;
      ctx.beginPath();
      ctx.moveTo(slot.x + radius, slot.y);
      ctx.lineTo(slot.x + slot.w - radius, slot.y);
      ctx.quadraticCurveTo(slot.x + slot.w, slot.y, slot.x + slot.w, slot.y + radius);
      ctx.lineTo(slot.x + slot.w, slot.y + slot.h - radius);
      ctx.quadraticCurveTo(
        slot.x + slot.w,
        slot.y + slot.h,
        slot.x + slot.w - radius,
        slot.y + slot.h
      );
      ctx.lineTo(slot.x + radius, slot.y + slot.h);
      ctx.quadraticCurveTo(slot.x, slot.y + slot.h, slot.x, slot.y + slot.h - radius);
      ctx.lineTo(slot.x, slot.y + radius);
      ctx.quadraticCurveTo(slot.x, slot.y, slot.x + radius, slot.y);
      ctx.closePath();
      ctx.clip();

      if (imgSrc) {
        try {
          const img = await loadImg(imgSrc);

          const scale = Math.max(slot.w / img.width, slot.h / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = slot.x + (slot.w - drawW) / 2;
          const drawY = slot.y + (slot.h - drawH) / 2;

          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          if (filter !== 'none') {
            const slotData = ctx.getImageData(slot.x, slot.y, slot.w, slot.h);
            const data = slotData.data;

            for (let j = 0; j < data.length; j += 4) {
              const r = data[j];
              const g = data[j + 1];
              const b = data[j + 2];

              if (filter === 'mono') {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[j] = gray;
                data[j + 1] = gray;
                data[j + 2] = gray;
              } else if (filter === 'vintage') {
                data[j] = Math.min(255, r * 1.1 + 20);
                data[j + 1] = Math.min(255, g * 0.95 + 10);
                data[j + 2] = Math.max(0, b * 0.8 - 10);
              } else if (filter === 'warm') {
                data[j] = Math.min(255, r * 1.1 + 15);
                data[j + 1] = Math.min(255, g * 1.05 + 10);
              } else if (filter === 'cool') {
                data[j + 2] = Math.min(255, b * 1.15 + 20);
              } else if (filter === 'film') {
                data[j] = Math.min(255, (r - 128) * 1.2 + 128);
                data[j + 1] = Math.min(255, (g - 128) * 1.2 + 128);
                data[j + 2] = Math.min(255, (b - 128) * 1.2 + 128);
              }
            }
            ctx.putImageData(slotData, slot.x, slot.y);
          }
        } catch {
          // image load error
        }
      } else {
        ctx.fillStyle = theme === 'pure-white' ? '#F4F4F5' : '#27272A';
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.fillStyle = '#71717A';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Slot #${i + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
      }

      ctx.restore();
    }

    ctx.fillStyle = currentTheme.text;
    ctx.textAlign = 'center';

    if (layout === 'strip4') {
      const footerY = height - 120;
      ctx.font = 'bold 36px "Public Sans", sans-serif';
      ctx.fillText(captionText, width / 2, footerY);
      ctx.font = '600 22px monospace';
      ctx.fillText(dateText, width / 2, footerY + 45);
    } else if (layout === 'grid4') {
      const footerY = height - 85;
      ctx.font = 'bold 38px "Public Sans", sans-serif';
      ctx.fillText(captionText, width / 2, footerY);
      ctx.font = '600 22px monospace';
      ctx.fillText(dateText, width / 2, footerY + 45);
    } else if (layout === 'strip2') {
      const footerY = height - 100;
      ctx.font = 'bold 34px "Public Sans", sans-serif';
      ctx.fillText(captionText, width / 2, footerY);
      ctx.font = '600 20px monospace';
      ctx.fillText(dateText, width / 2, footerY + 40);
    } else if (layout === 'polaroid1') {
      const footerY = height - 100;
      ctx.font = 'bold 36px "Public Sans", sans-serif';
      ctx.fillText(captionText, width / 2, footerY);
      ctx.font = '600 22px monospace';
      ctx.fillText(dateText, width / 2, footerY + 45);
    }

    if (stickers.length > 0) {
      ctx.font = '52px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      stickers.forEach((st) => {
        const x = (st.x / 100) * width;
        const y = (st.y / 100) * height;
        ctx.fillText(st.emoji, x, y);
      });
    }

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  }, [images, layout, theme, filter, dateText, captionText, stickers]);

  useEffect(() => {
    let isMounted = true;
    renderFrame().then((url) => {
      if (isMounted && url) {
        setResultDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [renderFrame]);

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(resultDataUrl, `four_cut_${layout}_${Date.now()}.png`);
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
        '인생네컷 사진',
        `fourcut_${Date.now()}.png`
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
          인생네컷 포토부스 (Photo Booth)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          4컷 스트립, 2x2 격자, 폴라로이드 감성 프레임에 사진을 배치하고 스티커와 문구를 꾸밉니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

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
        {/* Left: Frame Preview */}
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
          <Card
            {...getRootProps()}
            sx={{
              p: 2,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDragActive ? 'action.hover' : '#0f172a',
              border: isDragActive ? '2px dashed' : 'none',
              borderColor: 'primary.main',
              flex: '1 1 auto',
              minHeight: 0,
              height: '100%',
              transition: (t) => t.transitions.create(['border-color', 'background-color']),
            }}
          >
            {resultDataUrl ? (
              <img
                src={resultDataUrl}
                alt="Four Cut Frame"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                }}
              />
            ) : (
              <CircularProgress color="inherit" />
            )}
          </Card>
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

        {/* Right: Customization Controls */}
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
            {/* Layout selector */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              1. 프레임 레이아웃
            </Typography>
            <ToggleButtonGroup
              value={layout}
              exclusive
              onChange={(_, v) => v && setLayout(v)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="strip4">4컷 세로</ToggleButton>
              <ToggleButton value="grid4">2×2 격자</ToggleButton>
              <ToggleButton value="strip2">2컷 세로</ToggleButton>
              <ToggleButton value="polaroid1">폴라로이드</ToggleButton>
            </ToggleButtonGroup>

            {/* Photo Slots Manager */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  2. 사진 등록 ({images.length}/{maxSlots})
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddPhotoAlternateRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= maxSlots}
                >
                  사진 추가
                </Button>
              </Box>

              <Box
                sx={{ display: 'grid', gridTemplateColumns: `repeat(${maxSlots}, 1fr)`, gap: 1 }}
              >
                {Array.from({ length: maxSlots }).map((_, idx) => {
                  const img = images[idx];
                  return (
                    <Box
                      key={idx}
                      onClick={() => !img && fileInputRef.current?.click()}
                      sx={{
                        aspectRatio: '1',
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px dashed',
                        borderColor: img ? 'transparent' : 'divider',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: img ? 'default' : 'pointer',
                      }}
                    >
                      {img ? (
                        <>
                          <img
                            src={img}
                            alt={`Slot ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              '&:hover': { bgcolor: '#ef4444' },
                            }}
                          >
                            <DeleteRoundedIcon fontSize="inherit" />
                          </IconButton>
                        </>
                      ) : (
                        <PhotoFilterRoundedIcon sx={{ color: 'text.disabled' }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Theme & Filter */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              3. 프레임 테마 & 필터
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
              {THEMES.map((t) => (
                <Button
                  key={t.id}
                  size="small"
                  variant={theme === t.id ? 'contained' : 'outlined'}
                  color={theme === t.id ? 'primary' : 'inherit'}
                  onClick={() => setTheme(t.id)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem', p: 0.8 }}
                >
                  {t.name}
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              4. 사진 필터
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.8, mb: 2 }}>
              {FILTERS.map((f) => (
                <Button
                  key={f.id}
                  size="small"
                  variant={filter === f.id ? 'contained' : 'outlined'}
                  color={filter === f.id ? 'primary' : 'inherit'}
                  onClick={() => setFilter(f.id)}
                  sx={{ borderRadius: 1.5, fontSize: '0.7rem', p: 0.6 }}
                >
                  {f.name}
                </Button>
              ))}
            </Box>

            {/* Text and Date */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              5. 텍스트 문구 & 날짜
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                label="하단 문구"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
              />
              <TextField
                size="small"
                sx={{ width: 140 }}
                label="날짜"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
              />
            </Box>

            {/* Stickers */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              6. 스티커 붙이기
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {STICKER_PRESETS.map((emoji) => (
                <Button
                  key={emoji}
                  size="small"
                  variant="outlined"
                  onClick={() => addSticker(emoji)}
                  sx={{ minWidth: 36, px: 0.8, fontSize: '1.2rem', borderRadius: 1.5 }}
                >
                  {emoji}
                </Button>
              ))}
              {stickers.length > 0 && (
                <Button size="small" color="error" onClick={() => setStickers([])}>
                  스티커 초기화
                </Button>
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
              variant="outlined"
              color="inherit"
              onClick={() => {
                setImages([]);
                setStickers([]);
              }}
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
    </DashboardContent>
  );
}
