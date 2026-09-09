'use client';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

type LayoutType = 'strip4' | 'grid4' | 'polaroid1' | 'custom';
type CustomSlotRatio = '4:3' | '1:1' | '3:4';
type ControlTab = 'layout' | 'themeFilter' | 'text' | 'stickers';
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
  size?: number; // base canvas size in pixels (default 52)
}

interface StickerCategory {
  name: string;
  isText?: boolean;
  items: string[];
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

const STICKER_CATEGORIES: StickerCategory[] = [
  {
    name: '인기 & 감성',
    items: ['✨', '💖', '🎀', '🧸', '🌸', '👑', '🕶️', '🔥', '⭐', '🎈', '❤️', '💌'],
  },
  {
    name: '동물 & 귀여움',
    items: ['🐱', '🐶', '🐰', '🐻', '🐥', '🦊', '🍀', '🌻', '🌷', '🌿', '🍒', '🍓'],
  },
  {
    name: '표정 & 포즈',
    items: ['🥰', '😎', '🥳', '🥺', '✌️', '🫰', '🫶', '👀', '💋', '🎉', '🍰', '🍻'],
  },
  {
    name: '감성 문구 태그',
    isText: true,
    items: ['인생샷', '우정해', '행복', 'LOVE', 'BEST', '짱!', '찰칵📸', '추억'],
  },
];

const FOUR_CUT_SAMPLES = {
  portrait: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  ],
  pets: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
  ],
};

export function FourCutView() {
  const [layout, setLayout] = useState<LayoutType>('strip4');
  const [customRows, setCustomRows] = useState<number>(3);
  const [customCols, setCustomCols] = useState<number>(2);
  const [customRatio, setCustomRatio] = useState<CustomSlotRatio>('4:3');
  const [controlTab, setControlTab] = useState<ControlTab>('layout');
  const [slotGap, setSlotGap] = useState<number>(24);
  const [theme, setTheme] = useState<FrameTheme>('classic-dark');
  const [filter, setFilter] = useState<PhotoFilter>('none');
  const [dateText, setDateText] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  });
  const [captionText, setCaptionText] = useState<string>('LIFE FOUR CUTS');
  const [images, setImages] = useState<string[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [customEmojiInput, setCustomEmojiInput] = useState<string>('');
  const [isDraggingSticker, setIsDraggingSticker] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const stickersRef = useRef<StickerItem[]>(stickers);
  useEffect(() => {
    stickersRef.current = stickers;
  }, [stickers]);

  const frameContainerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Measure container for WYSIWYG font scale
  useEffect(() => {
    const container = frameContainerRef.current;
    if (!container) return undefined;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [resultDataUrl]);

  // Keyboard shortcut: Delete selected sticker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStickerId) {
        e.preventDefault();
        setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
        setSelectedStickerId(null);
        toast.info('스티커가 삭제되었습니다.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickerId]);

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

  const maxSlots =
    layout === 'strip4' || layout === 'grid4'
      ? 4
      : layout === 'polaroid1'
        ? 1
        : customRows * customCols;

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
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLoadSampleSet = (type: 'portrait' | 'pets') => {
    const base = FOUR_CUT_SAMPLES[type];
    const list: string[] = [];
    for (let i = 0; i < maxSlots; i += 1) {
      list.push(base[i % base.length]);
    }
    setImages(list);
    toast.success(
      `${type === 'portrait' ? '감성 인물' : '귀여운 펫'} 예시 사진 ${list.length}장을 불러왔습니다.`
    );
  };

  const frameDimensions = useMemo(() => {
    let width = 600;
    let height = 1900;

    if (layout === 'strip4') {
      width = 600;
      const marginTop = 50;
      const photoH = 380;
      const gap = slotGap;
      const footerHeight = 170;
      height = marginTop + 4 * photoH + 3 * gap + footerHeight;
    } else if (layout === 'grid4') {
      width = 900;
      const marginTop = 60;
      const gap = slotGap;
      const photoH = 430;
      const footerHeight = 130;
      height = marginTop + 2 * photoH + gap + footerHeight;
    } else if (layout === 'polaroid1') {
      width = 700;
      height = 900;
    } else if (layout === 'custom') {
      let slotW = 380;
      let slotH = 285;
      if (customRatio === '1:1') {
        slotW = 360;
        slotH = 360;
      } else if (customRatio === '3:4') {
        slotW = 330;
        slotH = 440;
      }

      const marginX = 45;
      const marginTop = 50;
      const gap = slotGap;
      const footerHeight = 130;

      const contentW = customCols * slotW + (customCols - 1) * gap;
      const contentH = customRows * slotH + (customRows - 1) * gap;

      width = Math.max(600, contentW + marginX * 2);
      height = marginTop + contentH + footerHeight;
    }

    return { width, height };
  }, [layout, slotGap, customRows, customCols, customRatio]);

  const displayScale =
    containerWidth > 0 ? containerWidth / frameDimensions.width : 360 / frameDimensions.width;

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  const addSticker = (emoji: string) => {
    const newSticker: StickerItem = {
      id: `${Date.now()}_${Math.random()}`,
      emoji,
      x: Math.round((35 + Math.random() * 30) * 10) / 10,
      y: Math.round((35 + Math.random() * 30) * 10) / 10,
      size: 52,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    toast.success(`${emoji} 스티커가 추가되었습니다. 드래그하여 원하는 위치로 옮겨보세요!`);
  };

  const handleAddCustomSticker = (text?: string) => {
    const val = (text ?? customEmojiInput).trim();
    if (!val) {
      toast.error('스티커로 사용할 이모지나 문구를 입력해주세요.');
      return;
    }
    const newSticker: StickerItem = {
      id: `${Date.now()}_${Math.random()}`,
      emoji: val,
      x: Math.round((35 + Math.random() * 30) * 10) / 10,
      y: Math.round((35 + Math.random() * 30) * 10) / 10,
      size: 52,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setCustomEmojiInput('');
    toast.success(`'${val}' 스티커가 추가되었습니다. 원하는 위치로 드래그해보세요!`);
  };

  const duplicateSticker = (st: StickerItem) => {
    const newSticker: StickerItem = {
      ...st,
      id: `${Date.now()}_${Math.random()}`,
      x: Math.min(95, Math.round((st.x + 5) * 10) / 10),
      y: Math.min(95, Math.round((st.y + 5) * 10) / 10),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    toast.success('스티커가 복제되었습니다.');
  };

  const handleStickerPointerDown = (e: React.PointerEvent, st: StickerItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStickerId(st.id);
    setIsDraggingSticker(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    draggingRef.current = {
      id: st.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: st.x,
      startY: st.y,
    };
  };

  const handleStickerPointerMove = (e: React.PointerEvent, st: StickerItem) => {
    if (!draggingRef.current || draggingRef.current.id !== st.id) return;
    e.preventDefault();
    e.stopPropagation();

    const container = frameContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = e.clientX - draggingRef.current.startClientX;
    const deltaY = e.clientY - draggingRef.current.startClientY;

    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    const newX = Math.max(2, Math.min(98, draggingRef.current.startX + deltaXPercent));
    const newY = Math.max(2, Math.min(98, draggingRef.current.startY + deltaYPercent));

    setStickers((prev) =>
      prev.map((item) =>
        item.id === st.id
          ? {
              ...item,
              x: Math.round(newX * 10) / 10,
              y: Math.round(newY * 10) / 10,
            }
          : item
      )
    );
  };

  const handleStickerPointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      draggingRef.current = null;
      setIsDraggingSticker(false);
    }
  };

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      setSelectedStickerId(null);
    }
  };

  const renderFrame = useCallback(
    async (includeStickers: boolean = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return '';
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      const { width, height } = frameDimensions;

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
        const gap = slotGap;

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
        const gap = slotGap;
        const photoW = (width - marginX * 2 - gap) / 2;
        const photoH = 430;

        slots.push({ x: marginX, y: marginTop, w: photoW, h: photoH });
        slots.push({ x: marginX + photoW + gap, y: marginTop, w: photoW, h: photoH });
        slots.push({ x: marginX, y: marginTop + photoH + gap, w: photoW, h: photoH });
        slots.push({
          x: marginX + photoW + gap,
          y: marginTop + photoH + gap,
          w: photoW,
          h: photoH,
        });
      } else if (layout === 'polaroid1') {
        const marginX = 50;
        const marginTop = 60;
        const photoW = width - marginX * 2;
        const photoH = 620;
        slots.push({ x: marginX, y: marginTop, w: photoW, h: photoH });
      } else if (layout === 'custom') {
        let slotW = 380;
        let slotH = 285;
        if (customRatio === '1:1') {
          slotW = 360;
          slotH = 360;
        } else if (customRatio === '3:4') {
          slotW = 330;
          slotH = 440;
        }

        const marginTop = 50;
        const gap = slotGap;
        const contentW = customCols * slotW + (customCols - 1) * gap;
        const actualMarginX = (width - contentW) / 2;

        for (let r = 0; r < customRows; r += 1) {
          for (let c = 0; c < customCols; c += 1) {
            slots.push({
              x: actualMarginX + c * (slotW + gap),
              y: marginTop + r * (slotH + gap),
              w: slotW,
              h: slotH,
            });
          }
        }
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
      } else if (layout === 'polaroid1') {
        const footerY = height - 100;
        ctx.font = 'bold 36px "Public Sans", sans-serif';
        ctx.fillText(captionText, width / 2, footerY);
        ctx.font = '600 22px monospace';
        ctx.fillText(dateText, width / 2, footerY + 45);
      } else if (layout === 'custom') {
        const footerY = height - 75;
        const fontSize = Math.max(26, Math.min(38, Math.round(width / 24)));
        ctx.font = `bold ${fontSize}px "Public Sans", sans-serif`;
        ctx.fillText(captionText, width / 2, footerY);
        ctx.font = `600 ${Math.round(fontSize * 0.6)}px monospace`;
        ctx.fillText(dateText, width / 2, footerY + Math.round(fontSize * 1.15));
      }

      if (includeStickers && stickersRef.current.length > 0) {
        stickersRef.current.forEach((st) => {
          const size = st.size || 52;
          ctx.save();
          ctx.font = `bold ${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const x = (st.x / 100) * width;
          const y = (st.y / 100) * height;

          const hasLettersOrDigits = /[\p{L}\p{N}]/u.test(st.emoji);
          if (hasLettersOrDigits) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.lineWidth = Math.max(2, Math.round(size * 0.08));
            ctx.strokeText(st.emoji, x, y);
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(st.emoji, x, y);
          ctx.restore();
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl;
    },
    [
      frameDimensions,
      images,
      layout,
      theme,
      filter,
      dateText,
      captionText,
      customRows,
      customCols,
      customRatio,
      slotGap,
    ]
  );

  useEffect(() => {
    let isMounted = true;
    renderFrame(false).then((url) => {
      if (isMounted && url) {
        setResultDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [renderFrame]);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const fullDataUrl = await renderFrame(true);
      if (!fullDataUrl) {
        toast.error('이미지를 생성할 수 없습니다.');
        return;
      }
      const res = await downloadDataUrl(fullDataUrl, `four_cut_${layout}_${Date.now()}.png`);
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const fullDataUrl = await renderFrame(true);
      if (!fullDataUrl) {
        toast.error('이미지를 생성할 수 없습니다.');
        return;
      }
      const res = await shareToKakaoTalk(fullDataUrl, '인생네컷 사진', `fourcut_${Date.now()}.png`);
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
          4컷 스트립, 2×2 격자, 폴라로이드 및 N×M 사용자 정의 격자 프레임에 사진을 배치하고 스티커와
          문구를 꾸밉니다.
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
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {resultDataUrl ? (
              <Box
                ref={frameContainerRef}
                onPointerDown={handleContainerPointerDown}
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                  userSelect: 'none',
                  touchAction: 'none',
                  lineHeight: 0,
                }}
              >
                <img
                  src={resultDataUrl}
                  alt="Four Cut Frame"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />

                {/* Interactive Stickers Overlay */}
                {stickers.map((st) => {
                  const isSelected = selectedStickerId === st.id;
                  const stickerFontSize = Math.max(14, Math.round((st.size ?? 52) * displayScale));

                  return (
                    <Box
                      key={st.id}
                      onPointerDown={(e) => handleStickerPointerDown(e, st)}
                      onPointerMove={(e) => handleStickerPointerMove(e, st)}
                      onPointerUp={handleStickerPointerUp}
                      onPointerCancel={handleStickerPointerUp}
                      sx={{
                        position: 'absolute',
                        left: `${st.x}%`,
                        top: `${st.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: isDraggingSticker && isSelected ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        touchAction: 'none',
                        zIndex: isSelected ? 30 : 20,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: '4px',
                        borderRadius: '8px',
                        border: isSelected ? '2px dashed #00B8D9' : '2px dashed transparent',
                        bgcolor: isSelected ? 'rgba(0, 184, 217, 0.16)' : 'transparent',
                        transition: isDraggingSticker
                          ? 'none'
                          : 'border-color 0.15s, background-color 0.15s',
                        '&:hover': {
                          border: isSelected
                            ? '2px dashed #00B8D9'
                            : '1.5px dashed rgba(255, 255, 255, 0.7)',
                          bgcolor: isSelected
                            ? 'rgba(0, 184, 217, 0.16)'
                            : 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: `${stickerFontSize}px`,
                          lineHeight: 1,
                          display: 'block',
                          userSelect: 'none',
                          pointerEvents: 'none',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                          fontWeight: 800,
                          color: '#ffffff',
                          textShadow: '0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
                        }}
                      >
                        {st.emoji}
                      </Typography>

                      {/* Quick Delete Badge on Selected Sticker */}
                      {isSelected && (
                        <Box
                          component="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStickers((prev) => prev.filter((s) => s.id !== st.id));
                            setSelectedStickerId(null);
                          }}
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            cursor: 'pointer',
                            p: 0,
                            lineHeight: 1,
                            zIndex: 35,
                            '&:hover': {
                              bgcolor: 'error.dark',
                              transform: 'scale(1.15)',
                            },
                          }}
                        >
                          ×
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
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
            gap: 1.5,
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
            pl: { md: 1 },
            pr: 0.5,
          }}
        >
          {/* Top Pinned: Photo Slots Manager */}
          <Card sx={{ p: 2, borderRadius: 2.5, flexShrink: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                사진 등록 ({Math.min(images.length, maxSlots)}/{maxSlots})
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
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  maxSlots <= 4
                    ? `repeat(${maxSlots}, 1fr)`
                    : `repeat(${Math.min(customCols > 0 ? customCols : 4, 6)}, 1fr)`,
                gap: 0.8,
                maxHeight: 130,
                overflowY: maxSlots > 4 ? 'auto' : 'visible',
                pr: maxSlots > 4 ? 0.5 : 0,
              }}
            >
              {Array.from({ length: maxSlots }).map((_, idx) => {
                const img = images[idx];
                return (
                  <Box
                    key={idx}
                    onClick={() => !img && fileInputRef.current?.click()}
                    sx={{
                      aspectRatio: '1',
                      borderRadius: 1.5,
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
                            p: 0.3,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            '&:hover': { bgcolor: '#ef4444' },
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </>
                    ) : (
                      <PhotoFilterRoundedIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Sample Preset Buttons */}
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleLoadSampleSet('portrait')}
                sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, borderRadius: 1.5, fontWeight: 700 }}
              >
                ✨ 감성 인물 예시
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => handleLoadSampleSet('pets')}
                sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, borderRadius: 1.5, fontWeight: 700 }}
              >
                🐱 펫 예시
              </Button>
            </Box>
          </Card>

          {/* Middle: Tabbed Settings Card */}
          <Card
            sx={{
              borderRadius: 2.5,
              flex: '1 1 0px',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={controlTab}
              onChange={(_, v) => setControlTab(v)}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: 42,
                flexShrink: 0,
                '& .MuiTab-root': {
                  minHeight: 42,
                  py: 0.8,
                  px: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                },
              }}
            >
              <Tab label="프레임 레이아웃" value="layout" />
              <Tab label="테마, 필터" value="themeFilter" />
              <Tab label="텍스트 문구" value="text" />
              <Tab label="스티커" value="stickers" />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 2, flex: '1 1 0px', minHeight: 0, overflowY: 'auto' }}>
              {/* TAB 1: 프레임 레이아웃 */}
              {controlTab === 'layout' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Layout Selector */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}
                    >
                      프레임 레이아웃 선택
                    </Typography>
                    <ToggleButtonGroup
                      value={layout}
                      exclusive
                      onChange={(_, v) => v && setLayout(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="strip4">4컷 세로</ToggleButton>
                      <ToggleButton value="grid4">2×2 격자</ToggleButton>
                      <ToggleButton value="polaroid1">폴라로이드</ToggleButton>
                      <ToggleButton value="custom">사용자 정의</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Custom N×M Grid Controls */}
                  {layout === 'custom' && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.100',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                      }}
                    >
                      {/* Header info */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <GridViewRoundedIcon sx={{ fontSize: 16 }} /> N×M 격자 설정 ({customRows}행
                        × {customCols}열, 총 {customRows * customCols}컷)
                      </Typography>

                      {/* Preset Chips */}
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {[
                          { label: '2×3 (6컷)', r: 3, c: 2 },
                          { label: '3×2 (6컷)', r: 2, c: 3 },
                          { label: '3×3 (9컷)', r: 3, c: 3 },
                          { label: '2×4 (8컷)', r: 4, c: 2 },
                          { label: '1×3 (3컷)', r: 3, c: 1 },
                        ].map((preset) => {
                          const isSelected = customRows === preset.r && customCols === preset.c;
                          return (
                            <Button
                              key={preset.label}
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              color={isSelected ? 'primary' : 'inherit'}
                              onClick={() => {
                                setCustomRows(preset.r);
                                setCustomCols(preset.c);
                              }}
                              sx={{
                                py: 0.3,
                                px: 0.8,
                                fontSize: '0.7rem',
                                borderRadius: 1.5,
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {preset.label}
                            </Button>
                          );
                        })}
                      </Box>

                      {/* Rows & Cols Stepper Controls */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        {/* Cols (가로 칸 수, M) */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            p: 0.8,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                          >
                            가로 칸 수 (열, M)
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => setCustomCols((prev) => Math.max(1, prev - 1))}
                              disabled={customCols <= 1}
                              sx={{ p: 0.3 }}
                            >
                              <RemoveRoundedIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {customCols}칸
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => setCustomCols((prev) => Math.min(6, prev + 1))}
                              disabled={customCols >= 6}
                              sx={{ p: 0.3 }}
                            >
                              <AddRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Rows (세로 칸 수, N) */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            p: 0.8,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                          >
                            세로 칸 수 (행, N)
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => setCustomRows((prev) => Math.max(1, prev - 1))}
                              disabled={customRows <= 1}
                              sx={{ p: 0.3 }}
                            >
                              <RemoveRoundedIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {customRows}칸
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => setCustomRows((prev) => Math.min(6, prev + 1))}
                              disabled={customRows >= 6}
                              sx={{ p: 0.3 }}
                            >
                              <AddRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>

                      {/* Photo Aspect Ratio */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <AspectRatioRoundedIcon sx={{ fontSize: 14 }} /> 사진 칸 비율
                        </Typography>
                        <ToggleButtonGroup
                          value={customRatio}
                          exclusive
                          onChange={(_, v) => v && setCustomRatio(v)}
                          fullWidth
                          size="small"
                        >
                          <ToggleButton value="4:3" sx={{ py: 0.4, fontSize: '0.72rem' }}>
                            4:3 (가로형)
                          </ToggleButton>
                          <ToggleButton value="1:1" sx={{ py: 0.4, fontSize: '0.72rem' }}>
                            1:1 (정사각)
                          </ToggleButton>
                          <ToggleButton value="3:4" sx={{ py: 0.4, fontSize: '0.72rem' }}>
                            3:4 (세로형)
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Box>
                  )}

                  {/* Frame Gap Controls */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (t) =>
                        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.100',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <StraightenRoundedIcon sx={{ fontSize: 16 }} /> 프레임 사진 간격 (Gap)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {slotGap}px
                      </Typography>
                    </Box>

                    <Slider
                      value={slotGap}
                      min={0}
                      max={60}
                      step={2}
                      onChange={(_, v) => setSlotGap(v as number)}
                      valueLabelDisplay="auto"
                      size="small"
                      sx={{ mx: 0.5 }}
                    />

                    {/* Gap Preset Buttons */}
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {[
                        { label: '없음 (0px)', val: 0 },
                        { label: '좁게 (16px)', val: 16 },
                        { label: '보통 (24px)', val: 24 },
                        { label: '넓게 (36px)', val: 36 },
                      ].map((p) => {
                        const isSelected = slotGap === p.val;
                        return (
                          <Button
                            key={p.val}
                            size="small"
                            variant={isSelected ? 'contained' : 'outlined'}
                            color={isSelected ? 'primary' : 'inherit'}
                            onClick={() => setSlotGap(p.val)}
                            sx={{
                              flex: 1,
                              py: 0.3,
                              px: 0.5,
                              fontSize: '0.68rem',
                              borderRadius: 1.5,
                              fontWeight: isSelected ? 700 : 500,
                            }}
                          >
                            {p.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 2: 테마, 필터 */}
              {controlTab === 'themeFilter' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Theme */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      프레임 배경 테마
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.8 }}>
                      {THEMES.map((t) => (
                        <Button
                          key={t.id}
                          size="small"
                          variant={theme === t.id ? 'contained' : 'outlined'}
                          color={theme === t.id ? 'primary' : 'inherit'}
                          onClick={() => setTheme(t.id)}
                          sx={{ borderRadius: 1.5, fontSize: '0.72rem', p: 0.7 }}
                        >
                          {t.name}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Filter */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      사진 필터 효과
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8 }}>
                      {FILTERS.map((f) => (
                        <Button
                          key={f.id}
                          size="small"
                          variant={filter === f.id ? 'contained' : 'outlined'}
                          color={filter === f.id ? 'primary' : 'inherit'}
                          onClick={() => setFilter(f.id)}
                          sx={{ borderRadius: 1.5, fontSize: '0.72rem', p: 0.7 }}
                        >
                          {f.name}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 3: 텍스트 문구 */}
              {controlTab === 'text' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    프레임 하단 문구 & 날짜
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    label="하단 문구"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="예: LIFE FOUR CUTS"
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="날짜 표시"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    placeholder="예: 2026.09.05"
                  />
                </Box>
              )}

              {/* TAB 4: 스티커 */}
              {controlTab === 'stickers' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Custom Input */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      직접 이모지 / 문구 입력
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="이모지 또는 문구 (예: 💖, 짱!, 🎂)"
                        value={customEmojiInput}
                        onChange={(e) => setCustomEmojiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSticker();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddCustomSticker()}
                        disabled={!customEmojiInput.trim()}
                        startIcon={<AddRoundedIcon />}
                        sx={{ flexShrink: 0, px: 1.8, fontWeight: 700, borderRadius: 1.5 }}
                      >
                        추가
                      </Button>
                    </Box>
                  </Box>

                  {/* Selected Sticker Controls */}
                  {selectedSticker && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(0, 184, 217, 0.12)'
                            : 'rgba(0, 184, 217, 0.08)',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'text.secondary' }}
                          >
                            선택된 스티커
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.2,
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              border: '1px solid',
                              borderColor: 'divider',
                              lineHeight: 1.2,
                            }}
                          >
                            {selectedSticker.emoji}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={() => duplicateSticker(selectedSticker)}
                            sx={{ fontSize: '0.7rem', py: 0.2, px: 0.8, borderRadius: 1 }}
                          >
                            복제
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteRoundedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => {
                              setStickers((prev) =>
                                prev.filter((s) => s.id !== selectedSticker.id)
                              );
                              setSelectedStickerId(null);
                            }}
                            sx={{ fontSize: '0.7rem', py: 0.2, px: 0.8, borderRadius: 1 }}
                          >
                            삭제
                          </Button>
                        </Box>
                      </Box>

                      {/* Size slider */}
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                          >
                            크기 조절
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            {selectedSticker.size ?? 52}px
                          </Typography>
                        </Box>
                        <Slider
                          value={selectedSticker.size ?? 52}
                          min={24}
                          max={120}
                          step={2}
                          onChange={(_, val) => {
                            const newSize = val as number;
                            setStickers((prev) =>
                              prev.map((s) =>
                                s.id === selectedSticker.id ? { ...s, size: newSize } : s
                              )
                            );
                          }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Preset Stickers by Category */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      추천 스티커 & 문구
                    </Typography>

                    {STICKER_CATEGORIES.map((cat) => (
                      <Box key={cat.name}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.6,
                            fontSize: '0.7rem',
                          }}
                        >
                          {cat.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: cat.isText ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
                            gap: 0.6,
                          }}
                        >
                          {cat.items.map((item) => (
                            <Button
                              key={item}
                              size="small"
                              variant="outlined"
                              color="inherit"
                              onClick={() => addSticker(item)}
                              sx={{
                                minWidth: cat.isText ? 'unset' : 34,
                                py: cat.isText ? 0.4 : 0.6,
                                px: cat.isText ? 0.6 : 0.4,
                                fontSize: cat.isText ? '0.72rem' : '1.2rem',
                                fontWeight: cat.isText ? 700 : 400,
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                borderColor: 'divider',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'action.hover',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.1s ease',
                              }}
                            >
                              {item}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Placed Stickers List */}
                  {stickers.length > 0 && (
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.100',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'text.secondary' }}
                        >
                          배치된 스티커 ({stickers.length}개)
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setStickers([]);
                            setSelectedStickerId(null);
                          }}
                          sx={{ fontSize: '0.7rem', p: 0.2 }}
                        >
                          전체 초기화
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {stickers.map((st) => (
                          <Box
                            key={st.id}
                            onClick={() => setSelectedStickerId(st.id)}
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.6,
                              px: 1,
                              py: 0.3,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              bgcolor:
                                selectedStickerId === st.id ? 'primary.main' : 'background.paper',
                              color:
                                selectedStickerId === st.id
                                  ? 'primary.contrastText'
                                  : 'text.primary',
                              border: '1px solid',
                              borderColor: selectedStickerId === st.id ? 'primary.main' : 'divider',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              transition: 'all 0.15s',
                            }}
                          >
                            <span>{st.emoji}</span>
                            <Box
                              component="span"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStickers((prev) => prev.filter((s) => s.id !== st.id));
                                if (selectedStickerId === st.id) setSelectedStickerId(null);
                              }}
                              sx={{
                                fontSize: '13px',
                                opacity: 0.7,
                                lineHeight: 1,
                                ml: 0.2,
                                '&:hover': { opacity: 1, color: 'error.main' },
                              }}
                            >
                              ×
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      textAlign: 'center',
                      mt: 0.5,
                      fontSize: '0.72rem',
                    }}
                  >
                    💡 사진 위의 스티커를 마우스나 터치로 드래그하여 옮길 수 있습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Action Buttons Column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexShrink: 0,
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
                setSelectedStickerId(null);
              }}
              startIcon={<RefreshRoundedIcon />}
              sx={{ py: 1, borderRadius: 2, fontWeight: 600, fontSize: '0.85rem' }}
            >
              다른 사진
            </Button>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 700, fontSize: '0.9rem' }}
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
                sx={{ py: 1.1, borderRadius: 2, fontWeight: 600, fontSize: '0.9rem' }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardContent>
  );
}
