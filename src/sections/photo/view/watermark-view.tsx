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
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';
import { DashboardContent } from 'src/layouts/dashboard';
import { downloadDataUrl } from '../utils/image-processor';
import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';

type WatermarkType = 'text' | 'image' | 'logo';
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

const TEXT_PRESETS = [
  '대외비',
  'CONFIDENTIAL',
  'SAMPLE',
  '복제금지',
  '내부문서 ONLY',
  'APPROVED',
  'COPYRIGHT ©',
  '사본',
  '검토용',
];

const COLOR_PRESETS = [
  { label: 'White', color: '#ffffff' },
  { label: 'Black', color: '#000000' },
  { label: 'Red', color: '#ef4444' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Gray', color: '#94a3b8' },
  { label: 'Gold', color: '#f59e0b' },
];

const FONT_FAMILIES = [
  { label: '고딕 (Sans-serif)', value: 'sans-serif' },
  { label: '명조 (Serif)', value: 'serif' },
  { label: '모노스페이스 (Monospace)', value: 'monospace' },
  { label: '임팩트 (Impact)', value: 'Impact, sans-serif' },
];

export function WatermarkView() {
  const [items, setItems] = useState<WatermarkedImageItem[]>([]);
  const [type, setType] = useState<WatermarkType>('text');

  // Text Watermark Options
  const [text, setText] = useState<string>('대외비 (CONFIDENTIAL)');
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [fontSize, setFontSize] = useState<number>(42);
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  const [enableShadow, setEnableShadow] = useState<boolean>(true);

  // Custom Image Watermark Options
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [customImageScale, setCustomImageScale] = useState<number>(25); // percentage of min dimension

  // Common Options
  const [opacity, setOpacity] = useState<number>(65);
  const [rotation, setRotation] = useState<number>(-30);
  const [position, setPosition] = useState<PositionGrid>('mc');
  const [margin, setMargin] = useState<number>(40);
  const [repeatTiled, setRepeatTiled] = useState<boolean>(false);
  const [tileGap, setTileGap] = useState<number>(180);
  const [selectedLogoId, setSelectedLogoId] = useState<string>('chatgpt');

  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customWatermarkInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const newItems: WatermarkedImageItem[] = selectedFiles.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      origUrl: URL.createObjectURL(f),
    }));

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: addFiles,
    multiple: true,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  const handleCustomWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setCustomImageSrc(ev.target.result);
        toast.success('워터마크 이미지가 업로드되었습니다.');
      }
    };
    reader.readAsDataURL(file);
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

      // 1. Draw base image
      ctx.drawImage(img, 0, 0, w, h);

      // 2. Prepare watermark element
      ctx.save();
      ctx.globalAlpha = Math.max(0.01, Math.min(1, opacity / 100));

      let watermarkImg: HTMLImageElement | null = null;
      if (type === 'logo') {
        const logoSrc = AI_LOGOS.find((l) => l.id === selectedLogoId)?.src || AI_LOGOS[0].src;
        watermarkImg = new Image();
        watermarkImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          watermarkImg!.onload = () => resolve();
          watermarkImg!.onerror = reject;
          watermarkImg!.src = logoSrc;
        }).catch(() => {
          watermarkImg = null;
        });
      } else if (type === 'image' && customImageSrc) {
        watermarkImg = new Image();
        watermarkImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          watermarkImg!.onload = () => resolve();
          watermarkImg!.onerror = reject;
          watermarkImg!.src = customImageSrc;
        }).catch(() => {
          watermarkImg = null;
        });
      }

      const minDim = Math.min(w, h);
      const computedFontSize = Math.max(12, Math.round((fontSize * minDim) / 800));

      if (repeatTiled) {
        // Tiled repetition across entire canvas
        const step = Math.max(80, Math.round((tileGap * minDim) / 800));
        const rad = (rotation * Math.PI) / 180;

        // Cover extra bounds to accommodate rotation
        const maxDiagonal = Math.sqrt(w * w + h * h);
        const startX = -maxDiagonal / 2;
        const endX = w + maxDiagonal / 2;
        const startY = -maxDiagonal / 2;
        const endY = h + maxDiagonal / 2;

        for (let y = startY; y < endY; y += step) {
          for (let x = startX; x < endX; x += step) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rad);

            if (type === 'text') {
              ctx.font = `bold ${computedFontSize}px ${fontFamily}`;
              ctx.fillStyle = fontColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              if (enableShadow) {
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = Math.max(2, Math.round(computedFontSize * 0.1));
              }
              ctx.fillText(text, 0, 0);
            } else if (watermarkImg) {
              const baseImgSize = Math.max(24, Math.round((customImageScale / 100) * minDim * 0.8));
              const aspect = watermarkImg.width / watermarkImg.height || 1;
              const imgW = aspect >= 1 ? baseImgSize : baseImgSize * aspect;
              const imgH = aspect >= 1 ? baseImgSize / aspect : baseImgSize;
              ctx.drawImage(watermarkImg, -imgW / 2, -imgH / 2, imgW, imgH);
            }

            ctx.restore();
          }
        }
      } else {
        // 9-Grid Position placement
        const posMargin = Math.round((margin * minDim) / 800);
        let posX = w / 2;
        let posY = h / 2;
        let align: CanvasTextAlign = 'center';
        let baseline: CanvasTextBaseline = 'middle';

        switch (position) {
          case 'tl':
            posX = posMargin;
            posY = posMargin;
            align = 'left';
            baseline = 'top';
            break;
          case 'tc':
            posX = w / 2;
            posY = posMargin;
            align = 'center';
            baseline = 'top';
            break;
          case 'tr':
            posX = w - posMargin;
            posY = posMargin;
            align = 'right';
            baseline = 'top';
            break;
          case 'ml':
            posX = posMargin;
            posY = h / 2;
            align = 'left';
            baseline = 'middle';
            break;
          case 'mc':
            posX = w / 2;
            posY = h / 2;
            align = 'center';
            baseline = 'middle';
            break;
          case 'mr':
            posX = w - posMargin;
            posY = h / 2;
            align = 'right';
            baseline = 'middle';
            break;
          case 'bl':
            posX = posMargin;
            posY = h - posMargin;
            align = 'left';
            baseline = 'bottom';
            break;
          case 'bc':
            posX = w / 2;
            posY = h - posMargin;
            align = 'center';
            baseline = 'bottom';
            break;
          case 'br':
            posX = w - posMargin;
            posY = h - posMargin;
            align = 'right';
            baseline = 'bottom';
            break;
        }

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate((rotation * Math.PI) / 180);

        if (type === 'text') {
          ctx.font = `bold ${computedFontSize}px ${fontFamily}`;
          ctx.fillStyle = fontColor;
          ctx.textAlign = align;
          ctx.textBaseline = baseline;
          if (enableShadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = Math.max(3, Math.round(computedFontSize * 0.12));
          }
          ctx.fillText(text, 0, 0);
        } else if (watermarkImg) {
          const baseImgSize = Math.max(30, Math.round((customImageScale / 100) * minDim));
          const aspect = watermarkImg.width / watermarkImg.height || 1;
          const imgW = aspect >= 1 ? baseImgSize : baseImgSize * aspect;
          const imgH = aspect >= 1 ? baseImgSize / aspect : baseImgSize;

          let drawX = -imgW / 2;
          let drawY = -imgH / 2;

          if (align === 'left') drawX = 0;
          else if (align === 'right') drawX = -imgW;

          if (baseline === 'top') drawY = 0;
          else if (baseline === 'bottom') drawY = -imgH;

          ctx.drawImage(watermarkImg, drawX, drawY, imgW, imgH);
        }

        ctx.restore();
      }

      ctx.restore();
      return canvas.toDataURL('image/png');
    },
    [
      type,
      text,
      fontColor,
      fontSize,
      fontFamily,
      enableShadow,
      customImageSrc,
      customImageScale,
      opacity,
      rotation,
      position,
      margin,
      repeatTiled,
      tileGap,
      selectedLogoId,
    ]
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
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        pb: 2,
      }}
    >
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          워터마크 각인기 (Watermark Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          텍스트, 사용자 지정 로고/도장, AI 아이콘을 단일 위치 또는 대각선 반복 타일 패턴으로 일괄
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
      <input
        ref={customWatermarkInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleCustomWatermarkUpload}
        style={{ display: 'none' }}
      />

      {items.length === 0 ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            flex: '1 1 auto',
            minHeight: 360,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <BrandingWatermarkRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            워터마크를 넣을 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            사진을 드래그하여 놓거나 클릭하여 다중 선택하세요 (클라이언트 100% 로컬 처리)
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: 2.5,
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left: Preview & File List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {activeItem && (
              <Card sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
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
                    height: { xs: 300, sm: 420 },
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

            {/* List Strip */}
            <Card sx={{ p: 2, borderRadius: 3, flex: '1 1 auto', minHeight: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  사진 목록 ({items.length}장)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  + 사진 추가
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  maxHeight: 200,
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
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
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

                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
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

          {/* Right: Watermark Customization Sidebar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
              {/* 1. Watermark Type */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.2 }}>
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
                <ToggleButton value="text" sx={{ gap: 0.5, fontWeight: 700 }}>
                  <TextFieldsRoundedIcon fontSize="small" /> 텍스트
                </ToggleButton>
                <ToggleButton value="image" sx={{ gap: 0.5, fontWeight: 700 }}>
                  <ImageRoundedIcon fontSize="small" /> 로고/도장 이미지
                </ToggleButton>
                <ToggleButton value="logo" sx={{ gap: 0.5, fontWeight: 700 }}>
                  <AutoAwesomeRoundedIcon fontSize="small" /> AI 로고
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Mode 1: Text Watermark */}
              {type === 'text' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="워터마크 문구"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <Box
                      sx={{
                        position: 'relative',
                        width: 44,
                        height: 40,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        style={{
                          position: 'absolute',
                          top: -6,
                          left: -6,
                          width: 56,
                          height: 52,
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Preset chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {TEXT_PRESETS.map((pst) => (
                      <Chip
                        key={pst}
                        label={pst}
                        size="small"
                        variant={text === pst ? 'filled' : 'outlined'}
                        color={text === pst ? 'primary' : 'default'}
                        onClick={() => setText(pst)}
                        sx={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      />
                    ))}
                  </Box>

                  {/* Color Preset Chips */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      색상:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {COLOR_PRESETS.map((cp) => (
                        <Box
                          key={cp.label}
                          onClick={() => setFontColor(cp.color)}
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: cp.color,
                            border: '2px solid',
                            borderColor: fontColor === cp.color ? 'primary.main' : '#cbd5e1',
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Font Family & Shadow */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>글꼴 (Font)</InputLabel>
                      <Select
                        value={fontFamily}
                        label="글꼴 (Font)"
                        onChange={(e) => setFontFamily(e.target.value)}
                      >
                        {FONT_FAMILIES.map((ff) => (
                          <MenuItem key={ff.value} value={ff.value}>
                            {ff.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={enableShadow}
                          onChange={(e) => setEnableShadow(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          외곽 그림자
                        </Typography>
                      }
                    />
                  </Box>
                </Box>
              )}

              {/* Mode 2: Custom Image Watermark */}
              {type === 'image' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  <Box
                    onClick={() => customWatermarkInputRef.current?.click()}
                    sx={{
                      p: 2,
                      border: '2px dashed',
                      borderColor: customImageSrc ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    {customImageSrc ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <img
                          src={customImageSrc}
                          alt="Custom logo"
                          style={{
                            maxWidth: 60,
                            maxHeight: 50,
                            objectFit: 'contain',
                            background: '#f1f5f9',
                            borderRadius: 4,
                            padding: 2,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            워터마크 이미지 등록됨
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            클릭하여 다른 이미지로 교체
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddPhotoAlternateRoundedIcon color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          도장/로고 PNG 이미지 선택하기
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {customImageSrc && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          이미지 크기 비율
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {customImageScale}%
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={5}
                        max={70}
                        value={customImageScale}
                        onChange={(_, v) => setCustomImageScale(v as number)}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Mode 3: AI Logos */}
              {type === 'logo' && (
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

              {/* 2. Position & Layout */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.2 }}>
                2. 위치 & 패턴 스타일
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={repeatTiled}
                      onChange={(e) => setRepeatTiled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      반복 타일 패턴으로 전체 덮기 (보안/복제방지)
                    </Typography>
                  }
                />
              </Box>

              {/* 9-grid position selector */}
              {!repeatTiled ? (
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

                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        가장자리 여백 (Margin)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {margin}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={10}
                      max={120}
                      value={margin}
                      onChange={(_, v) => setMargin(v as number)}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      타일 간격 / 밀도
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {tileGap}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={80}
                    max={360}
                    value={tileGap}
                    onChange={(_, v) => setTileGap(v as number)}
                  />
                </Box>
              )}

              {/* Sliders: Size, Opacity, Rotation */}
              {type === 'text' && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      글자 크기 (Font Size)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {fontSize}px
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={12}
                    max={120}
                    value={fontSize}
                    onChange={(_, v) => setFontSize(v as number)}
                  />
                </Box>
              )}

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
                  min={5}
                  max={100}
                  value={opacity}
                  onChange={(_, v) => setOpacity(v as number)}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
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
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(_, v) => setRotation(v as number)}
                />
              </Box>
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
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
                전체 일괄 ZIP 다운로드 ({items.length}장)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
