'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
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
  type SampleImageItem,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';

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

export type ShapeCategory = 'all' | 'basic' | 'cute' | 'symbol';

export type ShapeType =
  | 'circle'
  | 'rounded-rect'
  | 'diamond'
  | 'triangle'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'heart'
  | 'star'
  | 'flower'
  | 'clover'
  | 'cloud'
  | 'drop'
  | 'bubble'
  | 'badge'
  | 'shield'
  | 'moon'
  | 'arch'
  | 'cross';

interface ShapeOption {
  id: ShapeType;
  name: string;
  icon: string;
  category: 'basic' | 'cute' | 'symbol';
}

const SHAPES: ShapeOption[] = [
  { id: 'circle', name: '원형', icon: '⚪', category: 'basic' },
  { id: 'rounded-rect', name: '둥근 사각', icon: '🔲', category: 'basic' },
  { id: 'diamond', name: '다이아몬드', icon: '🔶', category: 'basic' },
  { id: 'triangle', name: '삼각형', icon: '▲', category: 'basic' },
  { id: 'pentagon', name: '오각형', icon: '⬟', category: 'basic' },
  { id: 'hexagon', name: '육각형', icon: '⬡', category: 'basic' },
  { id: 'octagon', name: '팔각형', icon: '🛑', category: 'basic' },
  { id: 'heart', name: '하트', icon: '❤️', category: 'cute' },
  { id: 'star', name: '별', icon: '⭐', category: 'cute' },
  { id: 'flower', name: '꽃', icon: '🌸', category: 'cute' },
  { id: 'clover', name: '클로버', icon: '🍀', category: 'cute' },
  { id: 'cloud', name: '구름', icon: '☁️', category: 'cute' },
  { id: 'drop', name: '물방울', icon: '💧', category: 'cute' },
  { id: 'bubble', name: '말풍선', icon: '💬', category: 'cute' },
  { id: 'badge', name: '스탬프 뱃지', icon: '🏵️', category: 'symbol' },
  { id: 'shield', name: '방패', icon: '🛡️', category: 'symbol' },
  { id: 'moon', name: '초승달', icon: '🌙', category: 'symbol' },
  { id: 'arch', name: '아치', icon: '⛩️', category: 'symbol' },
  { id: 'cross', name: '십자가', icon: '➕', category: 'symbol' },
];

export function ShapeCropView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [category, setCategory] = useState<ShapeCategory>('all');
  const [shape, setShape] = useState<ShapeType>('circle');
  const [mode, setMode] = useState<'inside' | 'punch'>('inside');

  const [scale, setScale] = useState<number>(80);
  const [aspectRatio, setAspectRatio] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [tightCrop, setTightCrop] = useState<boolean>(false);

  const [heartCurvature, setHeartCurvature] = useState<number>(1.0);
  const [starPoints, setStarPoints] = useState<number>(5);
  const [starInnerRatio, setStarInnerRatio] = useState<number>(0.45);
  const [flowerPetals, setFlowerPetals] = useState<number>(6);
  const [rectRadius, setRectRadius] = useState<number>(30);
  const [badgePoints, setBadgePoints] = useState<number>(16);
  const [badgeDepth, setBadgeDepth] = useState<number>(0.88);
  const [moonThickness, setMoonThickness] = useState<number>(0.45);

  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(25);
  const [splitEnd, setSplitEnd] = useState<number>(75);

  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(370);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>(
    {
      clientX: 0,
      clientY: 0,
      startX: 0,
      startY: 0,
    }
  );

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(370);

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
    const newWidth = Math.max(300, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  const drawShapePath = useCallback(
    (ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) => {
      ctx.beginPath();
      switch (shape) {
        case 'circle': {
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          break;
        }
        case 'rounded-rect': {
          const minDim = Math.min(rx, ry);
          const r = Math.max(0, (minDim * rectRadius) / 100);
          ctx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, r);
          break;
        }
        case 'diamond': {
          ctx.moveTo(cx, cy - ry);
          ctx.lineTo(cx + rx, cy);
          ctx.lineTo(cx, cy + ry);
          ctx.lineTo(cx - rx, cy);
          ctx.closePath();
          break;
        }
        case 'triangle': {
          ctx.moveTo(cx, cy - ry);
          ctx.lineTo(cx + rx, cy + ry);
          ctx.lineTo(cx - rx, cy + ry);
          ctx.closePath();
          break;
        }
        case 'pentagon':
        case 'hexagon':
        case 'octagon': {
          const sides = shape === 'pentagon' ? 5 : shape === 'hexagon' ? 6 : 8;
          for (let i = 0; i < sides; i += 1) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = cx + Math.cos(angle) * rx;
            const y = cy + Math.sin(angle) * ry;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        }
        case 'heart': {
          const w = rx * heartCurvature;
          const h = ry;
          const topNotchY = cy - h * 0.28;
          const bottomTipY = cy + h * 0.88;
          ctx.moveTo(cx, topNotchY);
          ctx.bezierCurveTo(
            cx - w * 0.55,
            cy - h * 0.96,
            cx - w * 1.18,
            cy - h * 0.12,
            cx - w * 0.98,
            cy + h * 0.24
          );
          ctx.bezierCurveTo(
            cx - w * 0.82,
            cy + h * 0.56,
            cx - w * 0.36,
            cy + h * 0.76,
            cx,
            bottomTipY
          );
          ctx.bezierCurveTo(
            cx + w * 0.36,
            cy + h * 0.76,
            cx + w * 0.82,
            cy + h * 0.56,
            cx + w * 0.98,
            cy + h * 0.24
          );
          ctx.bezierCurveTo(
            cx + w * 1.18,
            cy - h * 0.12,
            cx + w * 0.55,
            cy - h * 0.96,
            cx,
            topNotchY
          );
          ctx.closePath();
          break;
        }
        case 'star': {
          for (let i = 0; i < starPoints * 2; i += 1) {
            const rRatio = i % 2 === 0 ? 1 : starInnerRatio;
            const angle = (i * Math.PI) / starPoints - Math.PI / 2;
            const x = cx + Math.cos(angle) * (rx * rRatio);
            const y = cy + Math.sin(angle) * (ry * rRatio);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        }
        case 'flower': {
          for (let i = 0; i < flowerPetals * 2; i += 1) {
            const isOuter = i % 2 === 0;
            const rRatio = isOuter ? 1.0 : 0.45;
            const angle = (i * Math.PI) / flowerPetals - Math.PI / 2;
            const x = cx + Math.cos(angle) * (rx * rRatio);
            const y = cy + Math.sin(angle) * (ry * rRatio);
            if (i === 0) ctx.moveTo(x, y);
            else {
              const prevAngle = ((i - 1) * Math.PI) / flowerPetals - Math.PI / 2;
              const midAngle = (angle + prevAngle) / 2;
              const cpR = isOuter ? 1.08 : 0.42;
              const cpX = cx + Math.cos(midAngle) * (rx * cpR);
              const cpY = cy + Math.sin(midAngle) * (ry * cpR);
              ctx.quadraticCurveTo(cpX, cpY, x, y);
            }
          }
          ctx.closePath();
          break;
        }
        case 'clover': {
          const leafR = Math.min(rx, ry) * 0.48;
          const dist = Math.min(rx, ry) * 0.38;
          [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((ang) => {
            const lx = cx + Math.cos(ang) * dist;
            const ly = cy + Math.sin(ang) * dist;
            ctx.moveTo(lx + leafR, ly);
            ctx.arc(lx, ly, leafR, 0, Math.PI * 2);
          });
          break;
        }
        case 'cloud': {
          const w = rx * 1.8;
          const h = ry * 1.25;
          const x = cx - w / 2;
          const y = cy - h / 2;
          ctx.moveTo(x + w * 0.2, y + h * 0.85);
          ctx.lineTo(x + w * 0.8, y + h * 0.85);
          ctx.arc(x + w * 0.75, y + h * 0.65, h * 0.25, 0.5 * Math.PI, 1.7 * Math.PI, true);
          ctx.arc(x + w * 0.52, y + h * 0.4, h * 0.36, 1.9 * Math.PI, 1.2 * Math.PI, true);
          ctx.arc(x + w * 0.28, y + h * 0.45, h * 0.28, 1.3 * Math.PI, 0.9 * Math.PI, true);
          ctx.arc(x + w * 0.2, y + h * 0.7, h * 0.2, 0.9 * Math.PI, 0.5 * Math.PI, true);
          ctx.closePath();
          break;
        }
        case 'drop': {
          const topY = cy - ry * 0.95;
          const bottomY = cy + ry * 0.85;
          ctx.moveTo(cx, topY);
          ctx.bezierCurveTo(
            cx - rx * 0.25,
            cy - ry * 0.3,
            cx - rx * 1.1,
            cy + ry * 0.3,
            cx - rx * 0.8,
            cy + ry * 0.7
          );
          ctx.bezierCurveTo(
            cx - rx * 0.5,
            bottomY + ry * 0.15,
            cx + rx * 0.5,
            bottomY + ry * 0.15,
            cx + rx * 0.8,
            cy + ry * 0.7
          );
          ctx.bezierCurveTo(cx + rx * 1.1, cy + ry * 0.3, cx + rx * 0.25, cy - ry * 0.3, cx, topY);
          ctx.closePath();
          break;
        }
        case 'bubble': {
          const bw = rx * 1.8;
          const bh = ry * 1.35;
          const bx = cx - bw / 2;
          const by = cy - bh / 2 - ry * 0.08;
          ctx.roundRect(bx, by, bw, bh, 24);
          ctx.moveTo(cx - rx * 0.25, by + bh);
          ctx.lineTo(cx - rx * 0.6, cy + ry * 0.95);
          ctx.lineTo(cx, by + bh);
          break;
        }
        case 'badge': {
          for (let i = 0; i < badgePoints * 2; i += 1) {
            const rRatio = i % 2 === 0 ? 1 : badgeDepth;
            const angle = (i * Math.PI) / badgePoints - Math.PI / 2;
            const x = cx + Math.cos(angle) * (rx * rRatio);
            const y = cy + Math.sin(angle) * (ry * rRatio);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        }
        case 'shield': {
          ctx.moveTo(cx - rx, cy - ry * 0.85);
          ctx.lineTo(cx + rx, cy - ry * 0.85);
          ctx.lineTo(cx + rx, cy + ry * 0.1);
          ctx.bezierCurveTo(cx + rx, cy + ry * 0.65, cx + rx * 0.3, cy + ry * 0.9, cx, cy + ry);
          ctx.bezierCurveTo(
            cx - rx * 0.3,
            cy + ry * 0.9,
            cx - rx,
            cy + ry * 0.65,
            cx - rx,
            cy + ry * 0.1
          );
          ctx.closePath();
          break;
        }
        case 'moon': {
          ctx.arc(cx, cy, rx, -Math.PI * 0.45, Math.PI * 0.45, false);
          ctx.bezierCurveTo(
            cx + rx * (1 - moonThickness * 1.6),
            cy + ry * 0.25,
            cx + rx * (1 - moonThickness * 1.6),
            cy - ry * 0.25,
            cx + rx * Math.cos(-Math.PI * 0.45),
            cy + ry * Math.sin(-Math.PI * 0.45)
          );
          ctx.closePath();
          break;
        }
        case 'arch': {
          ctx.moveTo(cx - rx, cy + ry);
          ctx.lineTo(cx - rx, cy - ry * 0.1);
          ctx.bezierCurveTo(
            cx - rx,
            cy - ry * 0.95,
            cx + rx,
            cy - ry * 0.95,
            cx + rx,
            cy - ry * 0.1
          );
          ctx.lineTo(cx + rx, cy + ry);
          ctx.closePath();
          break;
        }
        case 'cross': {
          const aw = rx * 0.38;
          const ah = ry * 0.38;
          ctx.moveTo(cx - aw, cy - ry);
          ctx.lineTo(cx + aw, cy - ry);
          ctx.lineTo(cx + aw, cy - ah);
          ctx.lineTo(cx + rx, cy - ah);
          ctx.lineTo(cx + rx, cy + ah);
          ctx.lineTo(cx + aw, cy + ah);
          ctx.lineTo(cx + aw, cy + ry);
          ctx.lineTo(cx - aw, cy + ry);
          ctx.lineTo(cx - aw, cy + ah);
          ctx.lineTo(cx - rx, cy + ah);
          ctx.lineTo(cx - rx, cy - ah);
          ctx.lineTo(cx - aw, cy - ah);
          ctx.closePath();
          break;
        }
        default: {
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          break;
        }
      }
    },
    [
      shape,
      rectRadius,
      heartCurvature,
      starPoints,
      starInnerRatio,
      flowerPetals,
      badgePoints,
      badgeDepth,
      moonThickness,
    ]
  );

  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement, curOffX: number, curOffY: number) => {
      const img = loadedImageRef.current;
      if (!img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + (curOffX / 100) * (w / 2.5);
      const cy = h / 2 + (curOffY / 100) * (h / 2.5);
      const maxRadius = Math.min(w, h) / 2;
      const baseRadius = (maxRadius * scale) / 100;
      const rx = baseRadius * aspectRatio;
      const ry = baseRadius / aspectRatio;
      if (mode === 'inside') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        drawShapePath(ctx, cx, cy, rx, ry);
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
        drawShapePath(ctx, cx, cy, rx, ry);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.restore();
      }
    },
    [scale, aspectRatio, rotation, borderWidth, borderColor, mode, drawShapePath]
  );

  const renderAndSyncResult = useCallback(
    (curX = offsetX, curY = offsetY) => {
      if (!loadedImageRef.current) return;
      if (!internalCanvasRef.current) {
        internalCanvasRef.current = document.createElement('canvas');
      }
      const canvas = internalCanvasRef.current;
      drawToCanvas(canvas, curX, curY);

      let finalCanvas = canvas;
      if (tightCrop && mode === 'inside') {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2 + (curX / 100) * (w / 2.5);
        const cy = h / 2 + (curY / 100) * (h / 2.5);
        const maxRadius = Math.min(w, h) / 2;
        const baseRadius = (maxRadius * scale) / 100;
        const rx = baseRadius * aspectRatio;
        const ry = baseRadius / aspectRatio;
        const cropW = Math.round(rx * 2 + borderWidth * 2 + 16);
        const cropH = Math.round(ry * 2 + borderWidth * 2 + 16);
        const tight = document.createElement('canvas');
        tight.width = cropW;
        tight.height = cropH;
        const tCtx = tight.getContext('2d');
        if (tCtx) {
          tCtx.drawImage(canvas, cx - cropW / 2, cy - cropH / 2, cropW, cropH, 0, 0, cropW, cropH);
          finalCanvas = tight;
        }
      }

      setResultDataUrl(finalCanvas.toDataURL('image/png'));
    },
    [offsetX, offsetY, drawToCanvas, tightCrop, mode, scale, aspectRatio, borderWidth]
  );

  useEffect(() => {
    if (!imageSrc) {
      loadedImageRef.current = null;
      setResultDataUrl('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      renderAndSyncResult(offsetX, offsetY);
    };
    img.src = imageSrc;
  }, [imageSrc, offsetX, offsetY, renderAndSyncResult]);

  useEffect(() => {
    if (loadedImageRef.current) {
      renderAndSyncResult(offsetX, offsetY);
    }
  }, [renderAndSyncResult, offsetX, offsetY]);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('.split-handle, .split-line')) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: offsetX,
      startY: offsetY,
    };
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!container.width || !container.height) return;
    const deltaX = e.clientX - dragStartRef.current.clientX;
    const deltaY = e.clientY - dragStartRef.current.clientY;
    const sensitivity = 240;
    const newX = Math.round(
      Math.max(
        -100,
        Math.min(100, dragStartRef.current.startX + (deltaX / container.width) * sensitivity)
      )
    );
    const newY = Math.round(
      Math.max(
        -100,
        Math.min(100, dragStartRef.current.startY + (deltaY / container.height) * sensitivity)
      )
    );

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      renderAndSyncResult(newX, newY);
    });

    setOffsetX(newX);
    setOffsetY(newY);
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleResetPosition = () => {
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setAspectRatio(1.0);
    setScale(80);
    renderAndSyncResult(0, 0);
    toast.success('도형 위치와 크기가 초기화되었습니다.');
  };

  const handleSaveResult = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        resultDataUrl,
        `shape_crop_${shape}_result_${Date.now()}.png`
      );
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
      const res = await downloadDataUrl(
        splitUrl,
        `shape_crop_${shape}_split_comparison_${Date.now()}.png`
      );
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

  const filteredShapes =
    category === 'all' ? SHAPES : SHAPES.filter((s) => s.category === category);

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
          도형 자르기 & 모양 펀칭 (Shape Crop Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          하트, 별, 원형, 뱃지 등 19가지의 다채로운 도형으로 사진을 감각적으로 크롭하거나 모양을
          펀칭합니다.
        </Typography>
      </Box>

      {!imageSrc ? (
        <PhotoUploadWorkspace
          sampleImages={SHAPE_CROP_SAMPLE_IMAGES}
          onSelectSample={(url) => setImageSrc(url)}
          onFileSelect={processFile}
          title="도형 모양으로 자를 사진 업로드"
          subtitle="프로필 사진, 스티커, 감성 굿즈, 디자인 썸네일 제작에 최적화되어 있습니다."
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
              position: 'relative',
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
              bgStyle="transparent"
            >
              <Box
                onPointerDown={handlePointerDownDrag}
                onPointerMove={handlePointerMoveDrag}
                onPointerUp={handlePointerUpDrag}
                onDoubleClick={() => {
                  setOffsetX(0);
                  setOffsetY(0);
                  renderAndSyncResult(0, 0);
                  toast.success('도형이 중앙으로 정렬되었습니다.');
                }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 5,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  p: 1.5,
                  pointerEvents: 'auto',
                }}
              >
                <Box
                  sx={{
                    bgcolor: isDragging ? 'primary.main' : 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    backdropFilter: 'blur(6px)',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 20,
                    boxShadow: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    transition: 'all 0.15s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                    {isDragging
                      ? `🎯 위치 이동 중 (X: ${offsetX}, Y: ${offsetY})`
                      : '🖐️ 화면 드래그로 도형 이동 (중앙 슬라이드바로 원본 비교 / 더블클릭: 중앙 정렬)'}
                  </Typography>
                </Box>
              </Box>
            </PhotoCompareViewport>
          </Box>

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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 자르기 방식
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                fullWidth
                size="small"
                sx={{ mb: 2.5 }}
              >
                <ToggleButton value="inside" sx={{ fontWeight: 700 }}>
                  도형 내부 남기기 (Crop)
                </ToggleButton>
                <ToggleButton value="punch" sx={{ fontWeight: 700 }}>
                  도형 펀칭 뚫기 (Hole)
                </ToggleButton>
              </ToggleButtonGroup>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.25,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  2. 도형 선택 ({SHAPES.length}종)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: '전체' },
                  { id: 'basic', label: '기본 도형' },
                  { id: 'cute', label: '감성/디자인' },
                  { id: 'symbol', label: '심볼/뱃지' },
                ].map((c) => (
                  <Chip
                    key={c.id}
                    label={c.label}
                    size="small"
                    clickable
                    color={category === c.id ? 'primary' : 'default'}
                    variant={category === c.id ? 'filled' : 'outlined'}
                    onClick={() => setCategory(c.id as ShapeCategory)}
                    sx={{ fontWeight: category === c.id ? 700 : 500, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                  maxHeight: 220,
                  overflowY: 'auto',
                  pr: 0.5,
                  p: 0.5,
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                }}
              >
                {filteredShapes.map((s) => {
                  const isSelected = shape === s.id;
                  return (
                    <Button
                      key={s.id}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => setShape(s.id)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 1.5,
                        py: 1,
                        px: 0.5,
                        minWidth: 0,
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        boxShadow: isSelected ? 2 : 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: '1.25rem', mb: 0.2 }}>{s.icon}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.68rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        {s.name}
                      </Typography>
                    </Button>
                  );
                })}
              </Box>
            </Card>
            {(shape === 'heart' ||
              shape === 'star' ||
              shape === 'flower' ||
              shape === 'rounded-rect' ||
              shape === 'badge' ||
              shape === 'moon') && (
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'primary.lighter',
                  color: 'primary.darker',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TuneRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.darker' }}>
                    {SHAPES.find((s) => s.id === shape)?.name} 맞춤 정밀 조절
                  </Typography>
                </Box>
                {shape === 'heart' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        하트 볼륨 & 굴곡 (Volume)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {Math.round(heartCurvature * 100)}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0.6}
                      max={1.4}
                      step={0.02}
                      value={heartCurvature}
                      onChange={(_, v) => setHeartCurvature(v as number)}
                    />
                  </Box>
                )}
                {shape === 'rounded-rect' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        모서리 둥글기 (Roundness)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {rectRadius}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={100}
                      value={rectRadius}
                      onChange={(_, v) => setRectRadius(v as number)}
                    />
                  </Box>
                )}
                {shape === 'star' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                      >
                        별 꼭짓점 수: {starPoints}개
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {[4, 5, 6, 8].map((pts) => (
                          <Chip
                            key={pts}
                            label={`${pts}각별`}
                            size="small"
                            clickable
                            color={starPoints === pts ? 'primary' : 'default'}
                            variant={starPoints === pts ? 'filled' : 'outlined'}
                            onClick={() => setStarPoints(pts)}
                            sx={{ fontWeight: 700 }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          별 뾰족함 (Inner Spike)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                          {Math.round((1 - starInnerRatio) * 100)}%
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0.2}
                        max={0.65}
                        step={0.02}
                        value={starInnerRatio}
                        onChange={(_, v) => setStarInnerRatio(v as number)}
                      />
                    </Box>
                  </Box>
                )}
                {shape === 'flower' && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                    >
                      꽃잎 개수: {flowerPetals}장
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {[4, 5, 6, 8, 12].map((pts) => (
                        <Chip
                          key={pts}
                          label={`${pts}잎`}
                          size="small"
                          clickable
                          color={flowerPetals === pts ? 'primary' : 'default'}
                          variant={flowerPetals === pts ? 'filled' : 'outlined'}
                          onClick={() => setFlowerPetals(pts)}
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {shape === 'badge' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                      >
                        뱃지 톱니 수: {badgePoints}개
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {[8, 12, 16, 24].map((pts) => (
                          <Chip
                            key={pts}
                            label={`${pts}톱니`}
                            size="small"
                            clickable
                            color={badgePoints === pts ? 'primary' : 'default'}
                            variant={badgePoints === pts ? 'filled' : 'outlined'}
                            onClick={() => setBadgePoints(pts)}
                            sx={{ fontWeight: 700 }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          톱니 깊이
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                          {Math.round((1 - badgeDepth) * 100)}%
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0.75}
                        max={0.96}
                        step={0.01}
                        value={badgeDepth}
                        onChange={(_, v) => setBadgeDepth(v as number)}
                      />
                    </Box>
                  </Box>
                )}
                {shape === 'moon' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        초승달 두께 (Crescent)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {Math.round(moonThickness * 100)}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0.2}
                      max={0.75}
                      step={0.02}
                      value={moonThickness}
                      onChange={(_, v) => setMoonThickness(v as number)}
                    />
                  </Box>
                )}
              </Card>
            )}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  3. 크기 & 위치 정밀 조절
                </Typography>
                <Tooltip title="도형 위치 및 크기 기본값 복원">
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={handleResetPosition}
                    startIcon={<RestartAltRoundedIcon />}
                    sx={{ fontSize: '0.75rem', py: 0.2 }}
                  >
                    중앙 정렬
                  </Button>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  p: 1.25,
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  border: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  🖐️ <b>직접 드래그 지원:</b> 왼쪽 사진 화면을 마우스나 터치로 끌어서 도형 위치를
                  자유롭게 옮길 수 있습니다.
                </Typography>
              </Box>
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
                  max={140}
                  value={scale}
                  onChange={(_, v) => setScale(v as number)}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    가로/세로 비율 (Stretch)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {aspectRatio > 1
                      ? `가로 +${Math.round((aspectRatio - 1) * 100)}%`
                      : aspectRatio < 1
                        ? `세로 +${Math.round((1 - aspectRatio) * 100)}%`
                        : '1:1 정비율'}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={aspectRatio}
                  onChange={(_, v) => setAspectRatio(v as number)}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      가로 위치 (X)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {offsetX > 0 ? `+${offsetX}` : offsetX}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={-100}
                    max={100}
                    value={offsetX}
                    onChange={(_, v) => setOffsetX(v as number)}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      세로 위치 (Y)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {offsetY > 0 ? `+${offsetY}` : offsetY}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={-100}
                    max={100}
                    value={offsetY}
                    onChange={(_, v) => setOffsetY(v as number)}
                  />
                </Box>
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
                <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
                  {[0, 90, 180, 270].map((deg) => (
                    <Chip
                      key={deg}
                      label={`${deg}°`}
                      size="small"
                      clickable
                      color={rotation === deg ? 'primary' : 'default'}
                      variant={rotation === deg ? 'filled' : 'outlined'}
                      onClick={() => setRotation(deg)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                    />
                  ))}
                </Box>
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
                      max={24}
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
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {borderColor}
                      </Typography>
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
                        여백 없이 도형에 딱 맞게 자르기 (Tight Crop)
                      </Typography>
                    }
                  />
                </>
              )}
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 'auto', pt: 0.5 }}>
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

              {/* Main: Clean Result Save */}
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
                결과물 저장
              </Button>

              {/* Secondary: Split Slider Comparison State Save */}
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
                disabled={isProcessing || !loadedImageRef.current}
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
