'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl } from '../utils/image-processor';
import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';

type WatermarkType = 'text' | 'logo';
type PositionGrid = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br';

interface WatermarkedImageItem {
  id: string;
  file: File;
  origUrl: string;
  resultUrl?: string;
}

const AI_LOGOS = [
  { id: 'chatgpt', name: 'ChatGPT', src: '/assets/watermark_logo/chatgpt.png' },
  { id: 'gemini', name: 'Gemini', src: '/assets/watermark_logo/gemini.png' },
  { id: 'deepseek', name: 'DeepSeek', src: '/assets/watermark_logo/deepseek.png' },
  { id: 'grok', name: 'Grok', src: '/assets/watermark_logo/grok.png' },
  { id: 'galaxy', name: 'Galaxy AI', src: '/assets/watermark_logo/galaxy.png' },
];

export function WatermarkView() {
  const [items, setItems] = useState<WatermarkedImageItem[]>([]);
  const [type, setType] = useState<WatermarkType>('text');
  const [text, setText] = useState<string>('ULTRA OFFICE');
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(70);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<PositionGrid>('br');
  const [repeatTiled, setRepeatTiled] = useState<boolean>(false);
  const [selectedLogoId, setSelectedLogoId] = useState<string>('chatgpt');

  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newItems: WatermarkedImageItem[] = selectedFiles.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      origUrl: URL.createObjectURL(f),
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (e.target) e.target.value = '';
  };

  const applyWatermarkToImage = useCallback(
    async (imgSrc: string): Promise<string> => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgSrc;
      });

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.drawImage(img, 0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      let logoImg: HTMLImageElement | null = null;
      if (type === 'logo') {
        const logoSrc = AI_LOGOS.find((l) => l.id === selectedLogoId)?.src || AI_LOGOS[0].src;
        logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          logoImg!.onload = () => resolve();
          logoImg!.onerror = reject;
          logoImg!.src = logoSrc;
        }).catch(() => {
          logoImg = null;
        });
      }

      if (repeatTiled) {
        const gapX = Math.round(w / 4);
        const gapY = Math.round(h / 4);

        for (let y = gapY / 2; y < h; y += gapY) {
          for (let x = gapX / 2; x < w; x += gapX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);

            if (type === 'text') {
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.fillStyle = fontColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0,0,0,0.6)';
              ctx.shadowBlur = 4;
              ctx.fillText(text, 0, 0);
            } else if (logoImg) {
              const logoDim = fontSize * 2;
              ctx.drawImage(logoImg, -logoDim / 2, -logoDim / 2, logoDim, logoDim);
            }

            ctx.restore();
          }
        }
      } else {
        const margin = 40;
        let x = w - margin;
        let y = h - margin;
        let align: CanvasTextAlign = 'right';
        let baseline: CanvasTextBaseline = 'bottom';

        if (position === 'tl') {
          x = margin;
          y = margin;
          align = 'left';
          baseline = 'top';
        } else if (position === 'tc') {
          x = w / 2;
          y = margin;
          align = 'center';
          baseline = 'top';
        } else if (position === 'tr') {
          x = w - margin;
          y = margin;
          align = 'right';
          baseline = 'top';
        } else if (position === 'ml') {
          x = margin;
          y = h / 2;
          align = 'left';
          baseline = 'middle';
        } else if (position === 'mc') {
          x = w / 2;
          y = h / 2;
          align = 'center';
          baseline = 'middle';
        } else if (position === 'mr') {
          x = w - margin;
          y = h / 2;
          align = 'right';
          baseline = 'middle';
        } else if (position === 'bl') {
          x = margin;
          y = h - margin;
          align = 'left';
          baseline = 'bottom';
        } else if (position === 'bc') {
          x = w / 2;
          y = h - margin;
          align = 'center';
          baseline = 'bottom';
        } else if (position === 'br') {
          x = w - margin;
          y = h - margin;
          align = 'right';
          baseline = 'bottom';
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);

        if (type === 'text') {
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = fontColor;
          ctx.textAlign = align;
          ctx.textBaseline = baseline;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 4;
          ctx.fillText(text, 0, 0);
        } else if (logoImg) {
          const logoDim = fontSize * 2.2;
          let drawX = 0;
          let drawY = 0;
          if (align === 'right') drawX = -logoDim;
          else if (align === 'center') drawX = -logoDim / 2;

          if (baseline === 'bottom') drawY = -logoDim;
          else if (baseline === 'middle') drawY = -logoDim / 2;

          ctx.drawImage(logoImg, drawX, drawY, logoDim, logoDim);
        }

        ctx.restore();
      }

      ctx.restore();
      return canvas.toDataURL('image/png');
    },
    [type, text, fontColor, fontSize, opacity, rotation, position, repeatTiled, selectedLogoId]
  );

  useEffect(() => {
    const processAll = async () => {
      if (items.length === 0) return;
      setIsProcessing(true);

      const updated = await Promise.all(
        items.map(async (item) => {
          const resUrl = await applyWatermarkToImage(item.origUrl);
          return { ...item, resultUrl: resUrl };
        })
      );

      setItems(updated);
      setIsProcessing(false);
    };

    const timer = setTimeout(() => {
      processAll();
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, applyWatermarkToImage]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleDownloadSingle = async (item: WatermarkedImageItem) => {
    if (!item.resultUrl) return;
    const name = item.file.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.resultUrl, `watermarked_${name}.png`);
    toast.success(res.message);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.resultUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `watermarked_${it.file.name.replace(/\.[^/.]+$/, '')}.png`,
        data: it.resultUrl!,
      }));

      await downloadZipFile(`watermarked_batch_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}개 파일이 압축(ZIP)되어 저장되었습니다.`);
    } catch {
      toast.error('ZIP 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeItem = items[activeItemIndex] || items[0];

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          워터마크 각인기 (Watermark Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          텍스트 및 AI 로고(ChatGPT, Gemini, DeepSeek 등)를 9분할 위치 또는 반복 타일 패턴으로 일괄
          각인합니다.
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

      {items.length === 0 ? (
        <Card
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            minHeight: 320,
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <BrandingWatermarkRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            워터마크를 넣을 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            다중 선택으로 여러 장의 사진에 동일한 워터마크를 한 번에 넣을 수 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Preview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeItem && (
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    워터마크 미리보기: {activeItem.file.name}
                  </Typography>
                  {isProcessing && <CircularProgress size={18} />}
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 280, sm: 400 },
                    bgcolor: '#0f172a',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={activeItem.resultUrl || activeItem.origUrl}
                    alt="Watermark Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Card>
            )}

            {/* List */}
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                사진 목록 ({items.length}장)
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: activeItemIndex === idx ? 'action.selected' : 'action.hover',
                      border: '1px solid',
                      borderColor: activeItemIndex === idx ? 'primary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.resultUrl || item.origUrl}
                          alt="thumb"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {item.file.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadSingle(item)}
                      >
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>

          {/* Right: Watermark Customization */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Watermark Type */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 워터마크 종류
              </Typography>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, v) => v && setType(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="text">텍스트 문구</ToggleButton>
                <ToggleButton value="logo">AI 로고 아이콘</ToggleButton>
              </ToggleButtonGroup>

              {type === 'text' ? (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="워터마크 문구"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    style={{
                      width: 44,
                      height: 40,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 2 }}>
                  {AI_LOGOS.map((lg) => (
                    <Button
                      key={lg.id}
                      size="small"
                      variant={selectedLogoId === lg.id ? 'contained' : 'outlined'}
                      color={selectedLogoId === lg.id ? 'primary' : 'inherit'}
                      onClick={() => setSelectedLogoId(lg.id)}
                      sx={{ p: 0.8, borderRadius: 1.5, display: 'flex', flexDirection: 'column' }}
                    >
                      <img
                        src={lg.src}
                        alt={lg.name}
                        style={{ width: 24, height: 24, marginBottom: 4 }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }} noWrap>
                        {lg.name}
                      </Typography>
                    </Button>
                  ))}
                </Box>
              )}

              {/* 9-grid position selector */}
              {!repeatTiled && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.8, display: 'block' }}
                  >
                    워터마크 위치 (9분할)
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.8,
                      maxWidth: 180,
                    }}
                  >
                    {(['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'] as PositionGrid[]).map(
                      (pos) => (
                        <Button
                          key={pos}
                          size="small"
                          variant={position === pos ? 'contained' : 'outlined'}
                          color={position === pos ? 'primary' : 'inherit'}
                          onClick={() => setPosition(pos)}
                          sx={{ minWidth: 0, p: 0.8, fontWeight: 800, fontSize: '0.75rem' }}
                        >
                          {pos.toUpperCase()}
                        </Button>
                      )
                    )}
                  </Box>
                </Box>
              )}

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    크기 (Size)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {fontSize}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={12}
                  max={80}
                  value={fontSize}
                  onChange={(_, v) => setFontSize(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    투명도 (Opacity)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {opacity}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(_, v) => setOpacity(v as number)}
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
                  min={-45}
                  max={45}
                  value={rotation}
                  onChange={(_, v) => setRotation(v as number)}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={repeatTiled}
                    onChange={(e) => setRepeatTiled(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    반복 타일 패턴으로 전체 덮기
                  </Typography>
                }
              />
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.length === 0}
                startIcon={<ArchiveRoundedIcon />}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
              >
                전체 일괄 ZIP 다운로드
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ borderRadius: 2 }}
              >
                + 사진 추가하기
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
