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

  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customWatermarkInputRef = useRef<HTMLInputElement>(null);

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
          사진 워터마크 & 서명 각인
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
            minHeight: 0,
            height: '100%',
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
            <BrandingWatermarkRoundedIcon sx={{ fontSize: 34 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            워터마크를 각인할 사진들을 업로드하세요
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
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, lg: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Preview & File List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 1.5,
              pr: { lg: 1 },
            }}
          >
            {activeItem && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  minHeight: 0,
                }}
              >
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
                    워터마크 미리보기: {activeItem.file.name}
                  </Typography>
                  {isProcessing && <CircularProgress size={18} />}
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    flex: '1 1 auto',
                    minHeight: 0,
                    height: '100%',
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
            <Card sx={{ p: 2, borderRadius: 3, flexShrink: 0, maxHeight: 180 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  사진 목록 ({items.length}장)
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8,
                  maxHeight: 110,
                  overflowY: 'auto',
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: 0.8,
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
                          width: 36,
                          height: 36,
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

          {/* Right: Watermark Customization Sidebar */}
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

              {/* Text Watermark Config */}
              {type === 'text' && (
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    label="워터마크 텍스트 문구"
                    fullWidth
                    size="small"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />

                  {/* Preset quick pills */}
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.8 }}
                  >
                    자주 쓰는 문구 프리셋:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                    {TEXT_PRESETS.map((preset) => (
                      <Chip
                        key={preset}
                        label={preset}
                        size="small"
                        clickable
                        onClick={() => setText(preset)}
                        color={text === preset ? 'primary' : 'default'}
                        variant={text === preset ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>

                  {/* Font Family & Color */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>폰트 서체</InputLabel>
                      <Select
                        value={fontFamily}
                        label="폰트 서체"
                        onChange={(e) => setFontFamily(e.target.value)}
                      >
                        {FONT_FAMILIES.map((f) => (
                          <MenuItem key={f.value} value={f.value}>
                            {f.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        style={{
                          width: 40,
                          height: 38,
                          borderRadius: 8,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {fontColor}
                      </Typography>
                    </Box>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={enableShadow}
                        onChange={(e) => setEnableShadow(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">텍스트 가독성 그림자 효과 (Shadow)</Typography>
                    }
                  />
                </Box>
              )}

              {/* Custom Image Watermark Config */}
              {type === 'image' && (
                <Box sx={{ mb: 2.5 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<ImageRoundedIcon />}
                    onClick={() => customWatermarkInputRef.current?.click()}
                    sx={{ mb: 2, py: 1.2, borderRadius: 2 }}
                  >
                    {customImageSrc ? '워터마크 이미지 교체하기' : '워터마크 PNG/SVG 로고 선택'}
                  </Button>

                  {customImageSrc && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          로고 크기 비율
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
                        max={80}
                        value={customImageScale}
                        onChange={(_, v) => setCustomImageScale(v as number)}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* AI Logo Watermark Config */}
              {type === 'logo' && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                    AI 모델 워터마크 선택
                  </Typography>
                  <Box
                    sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}
                  >
                    {AI_LOGOS.map((logo) => (
                      <Button
                        key={logo.id}
                        variant={customImageSrc === logo.src ? 'contained' : 'outlined'}
                        color={customImageSrc === logo.src ? 'primary' : 'inherit'}
                        onClick={() => setCustomImageSrc(logo.src)}
                        size="small"
                        sx={{ py: 1, borderRadius: 2, fontSize: '0.8rem' }}
                      >
                        {logo.name}
                      </Button>
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        로고 크기 비율
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {customImageScale}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={5}
                      max={60}
                      value={customImageScale}
                      onChange={(_, v) => setCustomImageScale(v as number)}
                    />
                  </Box>
                </Box>
              )}

              {/* 2. Position & Arrangement */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.2 }}>
                2. 위치 및 배열 방식
              </Typography>
              <ToggleButtonGroup
                value={repeatTiled ? 'tile' : 'single'}
                exclusive
                onChange={(_, v) => v && setRepeatTiled(v === 'tile')}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="single" sx={{ fontWeight: 700 }}>
                  단일 지정 위치
                </ToggleButton>
                <ToggleButton value="tile" sx={{ fontWeight: 700 }}>
                  대각선 반복 타일 패턴
                </ToggleButton>
              </ToggleButtonGroup>

              {!repeatTiled ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    9분할 배치 위치
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                      width: 180,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {(['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'] as PositionGrid[]).map(
                      (pos) => (
                        <Button
                          key={pos}
                          variant={position === pos ? 'contained' : 'outlined'}
                          color={position === pos ? 'primary' : 'inherit'}
                          size="small"
                          onClick={() => setPosition(pos)}
                          sx={{ py: 1, minWidth: 0, fontWeight: 700 }}
                        >
                          {pos.toUpperCase()}
                        </Button>
                      )
                    )}
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        외곽선 여백 (Margin)
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
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.length === 0}
                startIcon={<ArchiveRoundedIcon />}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                전체 일괄 ZIP 다운로드 ({items.length}장)
              </Button>
              {activeItem && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleDownloadSingle(activeItem)}
                  disabled={isProcessing}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                >
                  현재 사진 개별 저장
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                사진 추가하기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => setItems([])}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                전체 비우기
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
