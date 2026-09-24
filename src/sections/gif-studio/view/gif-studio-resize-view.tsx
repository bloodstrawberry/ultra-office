'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  resizeGif,
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  type GifCropBox,
  type GifFrameItem,
  convertGifToVideo,
  getDataUrlByteSize,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

type ToolMode = 'resize' | 'crop';
type CropAspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '9:16' | '3:4';

const SCALE_PRESETS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100% (원본)', value: 1.0 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2.0 },
];

const RESOLUTION_PRESETS = [
  { label: '선택 안 함 (직접 설정)', width: 0, height: 0 },
  { label: '카카오톡 이모티콘 (360 × 360)', width: 360, height: 360 },
  { label: '디스코드 이모지 (128 × 128)', width: 128, height: 128 },
  { label: '디스코드 스티커 (320 × 320)', width: 320, height: 320 },
  { label: '인스타그램 정방형 (1080 × 1080)', width: 1080, height: 1080 },
  { label: '인스타그램 스토리 / 릴스 (1080 × 1920)', width: 1080, height: 1920 },
  { label: '트위터/X 프로필 (400 × 400)', width: 400, height: 400 },
  { label: '트위터/X 헤더 (1500 × 500)', width: 1500, height: 500 },
  { label: '유튜브 썸네일 (1280 × 720)', width: 1280, height: 720 },
  { label: '웹 표준 가로형 (800 × 600)', width: 800, height: 600 },
  { label: '웹 표준 배너 (1200 × 630)', width: 1200, height: 630 },
];

const CROP_RATIO_PRESETS: { label: string; value: CropAspectRatio }[] = [
  { label: '자유 비율', value: 'free' },
  { label: '1:1 정방형', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '9:16 (세로/쇼츠)', value: '9:16' },
  { label: '3:4', value: '3:4' },
];

export function GifStudioResizeView() {
  const [file, setFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<GifFrameItem[]>([]);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [totalDurationMs, setTotalDurationMs] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Mode Selection: 'resize' (전체 크기 조절) vs 'crop' (사각형 영역 자르기)
  const [toolMode, setToolMode] = useState<ToolMode>('resize');

  // Resize Settings
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');
  const [containBgColor, setContainBgColor] = useState<string>('transparent');
  const [imageSmoothing, setImageSmoothing] = useState<boolean>(true);
  const [qualityPreset, setQualityPreset] = useState<number>(10);
  const [selectedResolutionPreset, setSelectedResolutionPreset] = useState<string>('');

  // Crop Settings (사각형 영역 선택)
  const [cropBox, setCropBox] = useState<GifCropBox>({ x: 0, y: 0, width: 0, height: 0 });
  const [cropAspectRatio, setCropAspectRatio] = useState<CropAspectRatio>('free');
  const [cropOutputMode, setCropOutputMode] = useState<'original' | 'custom'>('original');
  const [cropCustomWidth, setCropCustomWidth] = useState<number>(0);
  const [cropCustomHeight, setCropCustomHeight] = useState<number>(0);

  // Preview & Playback
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<'live' | 'compare' | 'result'>('live');
  const [canvasBg, setCanvasBg] = useState<'checkered' | 'dark' | 'light'>('checkered');

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [resultGifUrl, setResultGifUrl] = useState<string>('');
  const [resultGifSize, setResultGifSize] = useState<number>(0);

  // Video Conversion
  const [isMp4Converting, setIsMp4Converting] = useState<boolean>(false);
  const [mp4Url, setMp4Url] = useState<string>('');
  const [mp4Size, setMp4Size] = useState<number>(0);
  const [mp4Progress, setMp4Progress] = useState<number>(0);

  // Sample Menu & Resizing panel
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  // Refs
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Crop Dragging State Refs
  const cropDragModeRef = useRef<string | null>(null);
  const cropDragStartRef = useRef<{ clientX: number; clientY: number; box: GifCropBox }>({
    clientX: 0,
    clientY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  // ----------------------------------------------------------------------
  // Resizable Panel Handlers
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

  // ----------------------------------------------------------------------
  // File Processing
  const processGifFile = useCallback(async (newFile: File) => {
    setFile(newFile);
    setIsExtracting(true);
    setResultGifUrl('');
    setResultGifSize(0);
    setMp4Url('');
    setMp4Size(0);
    setPreviewTab('live');
    toast.info('GIF 프레임을 분석하는 중입니다...');

    try {
      const res = await extractGifFrames(newFile);
      setFrames(res.frames);
      setOriginalDimensions({ width: res.width, height: res.height });
      setTargetWidth(res.width);
      setTargetHeight(res.height);

      // Initialize crop box to center 80%
      const initCropW = Math.round(res.width * 0.8);
      const initCropH = Math.round(res.height * 0.8);
      const initCropX = Math.round((res.width - initCropW) / 2);
      const initCropY = Math.round((res.height - initCropH) / 2);
      setCropBox({ x: initCropX, y: initCropY, width: initCropW, height: initCropH });
      setCropCustomWidth(initCropW);
      setCropCustomHeight(initCropH);

      setTotalDurationMs(res.totalDuration);
      setPlayerIndex(0);
      setIsPlaying(true);
      toast.success(
        `GIF 로드 완료: ${res.width} × ${res.height} px, 총 ${res.frames.length}개 프레임`
      );
    } catch {
      toast.error('GIF 파일을 분석하지 못했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const dropPaste = useImageDropPaste({
    onFiles: (files) => {
      const gif = files.find((f) => f.type === 'image/gif' || f.name.endsWith('.gif'));
      if (gif) processGifFile(gif);
      else toast.error('GIF 파일만 업로드할 수 있습니다.');
    },
    disabled: false,
  });

  const handleSelectSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const sampleFile = await fetchSampleGifFile(sample);
      await processGifFile(sampleFile);
      toast.success(`'${sample.label}' 예시 파일을 불러왔습니다.`);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  // ----------------------------------------------------------------------
  // Playback Loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return undefined;
    const currentFrame = frames[playerIndex % frames.length];
    const delay = Math.max(20, currentFrame?.delay || 100);

    const timer = setTimeout(() => {
      setPlayerIndex((prev) => (prev + 1) % frames.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, frames, playerIndex]);

  // ----------------------------------------------------------------------
  // Live Canvas Rendering (for both Resize & Cropped Preview)
  useEffect(() => {
    if (frames.length === 0 || !previewCanvasRef.current) return;

    const currentFrame = frames[playerIndex % frames.length];
    if (!currentFrame) return;

    const canvas = previewCanvasRef.current;
    const isCropping = toolMode === 'crop';

    // Output dimensions for canvas
    let renderW = targetWidth;
    let renderH = targetHeight;
    let sx = 0;
    let sy = 0;
    let sw = originalDimensions.width;
    let sh = originalDimensions.height;

    if (isCropping) {
      sx = Math.max(0, Math.min(originalDimensions.width - 1, Math.round(cropBox.x)));
      sy = Math.max(0, Math.min(originalDimensions.height - 1, Math.round(cropBox.y)));
      sw = Math.max(1, Math.min(originalDimensions.width - sx, Math.round(cropBox.width)));
      sh = Math.max(1, Math.min(originalDimensions.height - sy, Math.round(cropBox.height)));

      renderW = cropOutputMode === 'custom' && cropCustomWidth > 0 ? cropCustomWidth : sw;
      renderH = cropOutputMode === 'custom' && cropCustomHeight > 0 ? cropCustomHeight : sh;
    }

    if (renderW <= 0 || renderH <= 0) return;

    canvas.width = renderW;
    canvas.height = renderH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, renderW, renderH);
    ctx.imageSmoothingEnabled = imageSmoothing;
    if (imageSmoothing) {
      ctx.imageSmoothingQuality = 'high';
    }

    if (containBgColor && containBgColor !== 'transparent') {
      ctx.fillStyle = containBgColor;
      ctx.fillRect(0, 0, renderW, renderH);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (fitMode === 'contain') {
        const scale = Math.min(renderW / sw, renderH / sh);
        const dw = Math.round(sw * scale);
        const dh = Math.round(sh * scale);
        const dx = Math.round((renderW - dw) / 2);
        const dy = Math.round((renderH - dh) / 2);
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      } else if (fitMode === 'cover') {
        const scale = Math.max(renderW / sw, renderH / sh);
        const dw = Math.round(sw * scale);
        const dh = Math.round(sh * scale);
        const dx = Math.round((renderW - dw) / 2);
        const dy = Math.round((renderH - dh) / 2);
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, renderW, renderH);
      }
    };
    img.src = currentFrame.dataUrl;
  }, [
    frames,
    playerIndex,
    toolMode,
    targetWidth,
    targetHeight,
    cropBox,
    cropOutputMode,
    cropCustomWidth,
    cropCustomHeight,
    fitMode,
    containBgColor,
    imageSmoothing,
    originalDimensions,
  ]);

  // ----------------------------------------------------------------------
  // Crop Box Geometry Helpers
  const getAspectRatioMultiplier = (ratio: CropAspectRatio): number | null => {
    switch (ratio) {
      case '1:1':
        return 1.0;
      case '4:3':
        return 3 / 4;
      case '16:9':
        return 9 / 16;
      case '9:16':
        return 16 / 9;
      case '3:4':
        return 4 / 3;
      default:
        return null;
    }
  };

  const handleSetCropRatio = (ratio: CropAspectRatio) => {
    setCropAspectRatio(ratio);
    if (ratio === 'free' || originalDimensions.width <= 0) return;

    const mult = getAspectRatioMultiplier(ratio);
    if (!mult) return;

    let newW = cropBox.width;
    let newH = Math.round(newW * mult);

    if (newH > originalDimensions.height) {
      newH = originalDimensions.height;
      newW = Math.round(newH / mult);
    }
    if (newW > originalDimensions.width) {
      newW = originalDimensions.width;
      newH = Math.round(newW * mult);
    }

    const newX = Math.round((originalDimensions.width - newW) / 2);
    const newY = Math.round((originalDimensions.height - newH) / 2);

    setCropBox({ x: newX, y: newY, width: newW, height: newH });
    setCropCustomWidth(newW);
    setCropCustomHeight(newH);
    toast.info(`'${ratio}' 비율로 사각형 영역이 지정되었습니다.`);
  };

  const handleResetCropToFull = () => {
    if (originalDimensions.width <= 0) return;
    setCropBox({
      x: 0,
      y: 0,
      width: originalDimensions.width,
      height: originalDimensions.height,
    });
    setCropAspectRatio('free');
    setCropCustomWidth(originalDimensions.width);
    setCropCustomHeight(originalDimensions.height);
    toast.info('전체 영역으로 복원되었습니다.');
  };

  const handleCenterCropBox = () => {
    if (originalDimensions.width <= 0) return;
    const newX = Math.max(0, Math.round((originalDimensions.width - cropBox.width) / 2));
    const newY = Math.max(0, Math.round((originalDimensions.height - cropBox.height) / 2));
    setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
  };

  // ----------------------------------------------------------------------
  // Interactive Crop Dragging Handlers
  const handleCropPointerDown = (mode: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetEl = e.currentTarget as HTMLElement;
    targetEl.setPointerCapture(e.pointerId);

    cropDragModeRef.current = mode;
    cropDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      box: { ...cropBox },
    };
  };

  const handleCropContainerPointerDown = (e: React.PointerEvent) => {
    if (toolMode !== 'crop' || !cropCanvasContainerRef.current) return;
    // When clicking outside the box, start creating a new crop box
    const container = cropCanvasContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scaleX = originalDimensions.width / rect.width;
    const scaleY = originalDimensions.height / rect.height;

    const startX = Math.round((e.clientX - rect.left) * scaleX);
    const startY = Math.round((e.clientY - rect.top) * scaleY);

    container.setPointerCapture(e.pointerId);
    cropDragModeRef.current = 'creating';
    cropDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      box: { x: startX, y: startY, width: 4, height: 4 },
    };
    setCropBox({ x: startX, y: startY, width: 4, height: 4 });
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    const dragMode = cropDragModeRef.current;
    if (!dragMode || !cropCanvasContainerRef.current || originalDimensions.width <= 0) return;

    const container = cropCanvasContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scaleX = originalDimensions.width / rect.width;
    const scaleY = originalDimensions.height / rect.height;

    const deltaX = Math.round((e.clientX - cropDragStartRef.current.clientX) * scaleX);
    const deltaY = Math.round((e.clientY - cropDragStartRef.current.clientY) * scaleY);
    const start = cropDragStartRef.current.box;
    const origW = originalDimensions.width;
    const origH = originalDimensions.height;
    const ratioMult = getAspectRatioMultiplier(cropAspectRatio);

    if (dragMode === 'moving') {
      const nextX = Math.max(0, Math.min(origW - start.width, start.x + deltaX));
      const nextY = Math.max(0, Math.min(origH - start.height, start.y + deltaY));
      setCropBox((prev) => ({ ...prev, x: nextX, y: nextY }));
      return;
    }

    if (dragMode === 'creating') {
      const startClickX = start.x;
      const startClickY = start.y;
      const curX = Math.max(0, Math.min(origW, Math.round((e.clientX - rect.left) * scaleX)));
      const curY = Math.max(0, Math.min(origH, Math.round((e.clientY - rect.top) * scaleY)));

      let newX = Math.min(startClickX, curX);
      let newY = Math.min(startClickY, curY);
      let newW = Math.max(8, Math.abs(curX - startClickX));
      let newH = Math.max(8, Math.abs(curY - startClickY));

      if (ratioMult) {
        newH = Math.round(newW * ratioMult);
        if (newY + newH > origH) {
          newH = origH - newY;
          newW = Math.round(newH / ratioMult);
        }
      }

      setCropBox({ x: newX, y: newY, width: newW, height: newH });
      setCropCustomWidth(newW);
      setCropCustomHeight(newH);
      return;
    }

    // Handle corner/edge resizing
    let nextX = start.x;
    let nextY = start.y;
    let nextW = start.width;
    let nextH = start.height;

    if (dragMode.includes('e')) {
      nextW = Math.max(16, Math.min(origW - start.x, start.width + deltaX));
    }
    if (dragMode.includes('s')) {
      nextH = Math.max(16, Math.min(origH - start.y, start.height + deltaY));
    }
    if (dragMode.includes('w')) {
      const clampedDeltaX = Math.min(start.width - 16, Math.max(-start.x, deltaX));
      nextX = start.x + clampedDeltaX;
      nextW = start.width - clampedDeltaX;
    }
    if (dragMode.includes('n')) {
      const clampedDeltaY = Math.min(start.height - 16, Math.max(-start.y, deltaY));
      nextY = start.y + clampedDeltaY;
      nextH = start.height - clampedDeltaY;
    }

    // Apply aspect ratio constraints if locked
    if (ratioMult) {
      nextH = Math.round(nextW * ratioMult);
      if (nextY + nextH > origH) {
        nextH = origH - nextY;
        nextW = Math.round(nextH / ratioMult);
      }
    }

    setCropBox({ x: nextX, y: nextY, width: nextW, height: nextH });
    setCropCustomWidth(nextW);
    setCropCustomHeight(nextH);
  };

  const handleCropPointerUp = () => {
    cropDragModeRef.current = null;
  };

  // ----------------------------------------------------------------------
  // Resize Mode Dimension Handlers
  const handleWidthChange = (newWidthVal: number) => {
    const w = Math.max(1, newWidthVal);
    setTargetWidth(w);
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.max(1, Math.round(w * ratio)));
    }
  };

  const handleHeightChange = (newHeightVal: number) => {
    const h = Math.max(1, newHeightVal);
    setTargetHeight(h);
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.max(1, Math.round(h * ratio)));
    }
  };

  const handleScalePresetClick = (scale: number) => {
    if (originalDimensions.width <= 0) return;
    const w = Math.max(1, Math.round(originalDimensions.width * scale));
    const h = Math.max(1, Math.round(originalDimensions.height * scale));
    setTargetWidth(w);
    setTargetHeight(h);
    toast.info(`크기가 원본의 ${(scale * 100).toFixed(0)}%(${w} × ${h} px)로 설정되었습니다.`);
  };

  const handleResolutionPresetSelect = (presetLabel: string) => {
    setSelectedResolutionPreset(presetLabel);
    const found = RESOLUTION_PRESETS.find((p) => p.label === presetLabel);
    if (found && found.width > 0 && found.height > 0) {
      setTargetWidth(found.width);
      setTargetHeight(found.height);
      toast.info(`'${found.label}' 해상도로 설정되었습니다.`);
    }
  };

  const handleSwapDimensions = () => {
    setTargetWidth(targetHeight);
    setTargetHeight(targetWidth);
    toast.info('가로와 세로 해상도가 맞바뀌었습니다.');
  };

  const handleResetToOriginal = () => {
    setTargetWidth(originalDimensions.width);
    setTargetHeight(originalDimensions.height);
    toast.info('원본 해상도로 초기화되었습니다.');
  };

  // ----------------------------------------------------------------------
  // Execute GIF Resize / Crop
  const handleExecute = async () => {
    if (!file || frames.length === 0) return;

    const isCropping = toolMode === 'crop';

    let finalW = targetWidth;
    let finalH = targetHeight;
    let selectedCrop: GifCropBox | undefined;

    if (isCropping) {
      if (cropBox.width <= 0 || cropBox.height <= 0) {
        toast.error('유효한 사각형 영역을 선택해주세요.');
        return;
      }
      selectedCrop = {
        x: Math.round(cropBox.x),
        y: Math.round(cropBox.y),
        width: Math.round(cropBox.width),
        height: Math.round(cropBox.height),
      };
      finalW =
        cropOutputMode === 'custom' && cropCustomWidth > 0
          ? cropCustomWidth
          : Math.round(cropBox.width);
      finalH =
        cropOutputMode === 'custom' && cropCustomHeight > 0
          ? cropCustomHeight
          : Math.round(cropBox.height);
    } else if (targetWidth <= 0 || targetHeight <= 0) {
      toast.error('유효한 너비와 높이를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    toast.info(
      isCropping
        ? '선택한 사각형 영역으로 GIF를 자르는 중입니다...'
        : 'GIF 크기를 조절하여 새 파일을 생성하는 중입니다...'
    );

    try {
      const newGifUrl = await resizeGif(
        {
          frames,
          width: originalDimensions.width,
          height: originalDimensions.height,
        },
        {
          targetWidth: finalW,
          targetHeight: finalH,
          cropBox: selectedCrop,
          fitMode,
          bgColor: containBgColor,
          imageSmoothing,
          sampleInterval: qualityPreset,
          progressCallback: (prog) => {
            setProcessProgress(prog);
          },
        }
      );

      setResultGifUrl(newGifUrl);
      const sizeBytes = getDataUrlByteSize(newGifUrl);
      setResultGifSize(sizeBytes);
      setPreviewTab('result');
      toast.success(
        `${isCropping ? 'GIF 사각형 자르기(크롭)' : 'GIF 크기 조절'} 완료! (${finalW} × ${finalH} px, ${formatBytes(sizeBytes)})`
      );
    } catch {
      toast.error('GIF 생성에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert Result GIF to MP4
  const handleConvertToMp4 = async () => {
    if (!resultGifUrl) {
      toast.warning('먼저 생성된 GIF를 준비해주세요.');
      return;
    }

    setIsMp4Converting(true);
    setMp4Progress(0);
    toast.info('MP4 비디오로 변환하는 중입니다...');

    try {
      const resBlob = await fetch(resultGifUrl).then((r) => r.blob());
      const res = await convertGifToVideo(resBlob, {
        targetFormat: 'mp4',
        fps: 30,
        scale: 1.0,
        progressCallback: (prog) => {
          setMp4Progress(prog);
        },
      });

      setMp4Url(res.videoUrl);
      setMp4Size(res.size);
      toast.success(`MP4 비디오 변환 완료! (${formatBytes(res.size)})`);
    } catch {
      toast.error('MP4 비디오 변환 중 오류가 발생했습니다.');
    } finally {
      setIsMp4Converting(false);
    }
  };

  // Background styling for preview canvas
  const getCanvasBgStyle = () => {
    if (canvasBg === 'dark') {
      return { bgcolor: '#1e1e1e' };
    }
    if (canvasBg === 'light') {
      return { bgcolor: '#ffffff' };
    }
    return {
      backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)`,
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
      bgcolor: 'background.paper',
    };
  };

  const scaleRatioX = originalDimensions.width > 0 ? targetWidth / originalDimensions.width : 1;
  const scaleRatioY = originalDimensions.height > 0 ? targetHeight / originalDimensions.height : 1;
  const originalSize = file ? file.size : 0;
  const sizeDiffPercent =
    originalSize > 0 && resultGifSize > 0
      ? Math.round(((resultGifSize - originalSize) / originalSize) * 100)
      : null;

  // Percentage positioning for Crop Box Overlay
  const cropBoxPercent = {
    left: originalDimensions.width > 0 ? `${(cropBox.x / originalDimensions.width) * 100}%` : '0%',
    top: originalDimensions.height > 0 ? `${(cropBox.y / originalDimensions.height) * 100}%` : '0%',
    width:
      originalDimensions.width > 0
        ? `${(cropBox.width / originalDimensions.width) * 100}%`
        : '100%',
    height:
      originalDimensions.height > 0
        ? `${(cropBox.height / originalDimensions.height) * 100}%`
        : '100%',
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
      <GifStudioNavHeader currentTab="resize" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/gif"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) processGifFile(selected);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {/* State 1: No file loaded */}
      {!file ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Sample Section */}
          <Box sx={{ flexShrink: 0 }}>
            <GifSampleSection
              onSelectSample={handleSelectSample}
              loadingSampleId={loadingSampleId}
              isLoading={isExtracting || !!loadingSampleId}
              title="⚡ 즉석 테스트 예시 GIF 파일"
              subtitle="클릭 한 번으로 고화질 예시 움짤을 불러와 GIF 크기 조절 & 사각형 자르기(크롭)를 테스트해 보세요."
            />
          </Box>

          {/* Upload Dropzone */}
          <Card
            {...dropPaste.getRootProps({
              onClick: () => fileInputRef.current?.click(),
            })}
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: '2px dashed',
              borderColor: dropPaste.isDragActive ? 'primary.main' : 'divider',
              bgcolor: dropPaste.isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: 2,
              textAlign: 'center',
              flex: '1 1 auto',
              minHeight: 200,
              width: '100%',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AspectRatioRoundedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                크기를 조절하거나 자를 GIF 파일을 끌어다 놓거나 클릭하여 선택하세요
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                GIF 전체 해상도 리사이즈 및 원하는 사각형 영역만 지정하여 자르기(크롭)를 모두
                지원합니다
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip size="small" label="GIF 전용" color="primary" variant="outlined" />
              <Chip size="small" label="클립보드 붙여넣기 (Ctrl+V) 지원" variant="soft" />
              <Chip
                size="small"
                label="✂️ 사각형 영역 자르기 (크롭)"
                color="secondary"
                variant="soft"
              />
              <Chip size="small" label="비율 유지 & 규격 프리셋" variant="soft" />
              <Chip size="small" label="도트/픽셀 아트 보존 지원" variant="soft" />
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadRoundedIcon />}
              sx={{ mt: 1 }}
            >
              GIF 파일 선택하기
            </Button>
          </Card>
        </Box>
      ) : (
        /* State 2: File loaded - Main Workspace */
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Top Info Bar */}
          <Card
            sx={{
              p: 1.5,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {toolMode === 'crop' ? (
                  <CropRoundedIcon sx={{ fontSize: 22 }} />
                ) : (
                  <AspectRatioRoundedIcon sx={{ fontSize: 22 }} />
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {file.name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.25,
                    flexWrap: 'wrap',
                  }}
                >
                  <Chip
                    size="small"
                    variant="soft"
                    label={`원본: ${originalDimensions.width} × ${originalDimensions.height} px`}
                  />
                  <Chip size="small" variant="soft" label={`용량: ${formatBytes(file.size)}`} />
                  <Chip size="small" variant="soft" label={`프레임: ${frames.length}장`} />
                  {totalDurationMs > 0 && (
                    <Chip
                      size="small"
                      variant="soft"
                      label={`길이: ${(totalDurationMs / 1000).toFixed(1)}초`}
                    />
                  )}
                  {toolMode === 'crop' ? (
                    <Chip
                      size="small"
                      color="secondary"
                      variant="filled"
                      label={`선택 영역: ${Math.round(cropBox.width)} × ${Math.round(cropBox.height)} px`}
                    />
                  ) : scaleRatioX !== 1 || scaleRatioY !== 1 ? (
                    <Chip
                      size="small"
                      color="primary"
                      variant="filled"
                      label={`목표: ${targetWidth} × ${targetHeight} px (${(scaleRatioX * 100).toFixed(0)}%)`}
                    />
                  ) : null}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDownRoundedIcon />}
                onClick={(e) => setSampleMenuAnchorEl(e.currentTarget)}
              >
                예시 파일
              </Button>
              <Menu
                anchorEl={sampleMenuAnchorEl}
                open={Boolean(sampleMenuAnchorEl)}
                onClose={() => setSampleMenuAnchorEl(null)}
              >
                {GIF_SAMPLE_LIST.map((sample) => (
                  <MenuItem
                    key={sample.id}
                    onClick={() => {
                      setSampleMenuAnchorEl(null);
                      handleSelectSample(sample);
                    }}
                  >
                    {sample.label} ({sample.subLabel})
                  </MenuItem>
                ))}
              </Menu>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                다른 GIF 열기
              </Button>
            </Box>
          </Card>

          {/* Main Workspace: Left (Preview/Canvas) + Right (Controls) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flex: '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {/* Left Column: Preview & Player */}
            <Box
              sx={{
                flex: '1 1 0%',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              {/* Preview Header Tabs */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant={previewTab === 'live' ? 'contained' : 'text'}
                    color={previewTab === 'live' ? 'primary' : 'inherit'}
                    onClick={() => setPreviewTab('live')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {toolMode === 'crop' ? '사각형 영역 지정 (크롭)' : '실시간 조절 미리보기'}
                  </Button>
                  <Button
                    size="small"
                    variant={previewTab === 'compare' ? 'contained' : 'text'}
                    color={previewTab === 'compare' ? 'primary' : 'inherit'}
                    onClick={() => setPreviewTab('compare')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {toolMode === 'crop' ? '잘라낸 결과 실시간 보기' : '원본 vs 조절 비교'}
                  </Button>
                  {resultGifUrl && (
                    <Button
                      size="small"
                      variant={previewTab === 'result' ? 'contained' : 'text'}
                      color={previewTab === 'result' ? 'success' : 'inherit'}
                      onClick={() => setPreviewTab('result')}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                      startIcon={<CheckCircleRoundedIcon />}
                    >
                      생성된 결과물 GIF
                    </Button>
                  )}
                </Box>

                {/* Canvas Background Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mr: 0.5, display: { xs: 'none', sm: 'block' } }}
                  >
                    배경:
                  </Typography>
                  <IconButton
                    size="small"
                    color={canvasBg === 'checkered' ? 'primary' : 'default'}
                    onClick={() => setCanvasBg('checkered')}
                    title="체커보드 투명 배경"
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        border: '1px solid currentColor',
                        backgroundImage: `linear-gradient(45deg, #888 25%, transparent 25%),
                          linear-gradient(-45deg, #888 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #888 75%),
                          linear-gradient(-45deg, transparent 75%, #888 75%)`,
                        backgroundSize: '4px 4px',
                      }}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={canvasBg === 'dark' ? 'primary' : 'default'}
                    onClick={() => setCanvasBg('dark')}
                    title="어두운 배경"
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        border: '1px solid currentColor',
                        bgcolor: '#222',
                      }}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={canvasBg === 'light' ? 'primary' : 'default'}
                    onClick={() => setCanvasBg('light')}
                    title="밝은 배경"
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        border: '1px solid currentColor',
                        bgcolor: '#fff',
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>

              {/* Viewport Canvas Area */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  overflow: 'auto',
                  position: 'relative',
                  ...getCanvasBgStyle(),
                }}
              >
                {/* Mode A: Interactive Crop Box Editor (when toolMode === 'crop' and previewTab === 'live') */}
                {toolMode === 'crop' && previewTab === 'live' && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    {/* Interactive Crop Container */}
                    <Box
                      ref={cropCanvasContainerRef}
                      onPointerDown={handleCropContainerPointerDown}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      sx={{
                        position: 'relative',
                        boxShadow: 3,
                        borderRadius: 1,
                        overflow: 'hidden',
                        lineHeight: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        cursor: 'crosshair',
                        userSelect: 'none',
                        touchAction: 'none',
                      }}
                    >
                      {/* Base Image Frame */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={frames[playerIndex % frames.length]?.dataUrl}
                        alt="Crop source frame"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '60vh',
                          objectFit: 'contain',
                          display: 'block',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Dimmed Outside Overlays */}
                      {/* Top */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: cropBoxPercent.top,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Bottom */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          top: `calc(${cropBoxPercent.top} + ${cropBoxPercent.height})`,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Left */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: cropBoxPercent.top,
                          left: 0,
                          width: cropBoxPercent.left,
                          height: cropBoxPercent.height,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Right */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: cropBoxPercent.top,
                          left: `calc(${cropBoxPercent.left} + ${cropBoxPercent.width})`,
                          right: 0,
                          height: cropBoxPercent.height,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Crop Selection Bounding Box */}
                      <Box
                        onPointerDown={(e) => handleCropPointerDown('moving', e)}
                        sx={{
                          position: 'absolute',
                          left: cropBoxPercent.left,
                          top: cropBoxPercent.top,
                          width: cropBoxPercent.width,
                          height: cropBoxPercent.height,
                          border: '2px solid #00A76F',
                          boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.8), inset 0 0 0 1px rgba(0,0,0,0.3)',
                          cursor: 'move',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Rule of Thirds Grid Lines */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '33.33%',
                            left: 0,
                            right: 0,
                            height: 1,
                            borderTop: '1px dashed rgba(255,255,255,0.6)',
                            pointerEvents: 'none',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '66.66%',
                            left: 0,
                            right: 0,
                            height: 1,
                            borderTop: '1px dashed rgba(255,255,255,0.6)',
                            pointerEvents: 'none',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            left: '33.33%',
                            top: 0,
                            bottom: 0,
                            width: 1,
                            borderLeft: '1px dashed rgba(255,255,255,0.6)',
                            pointerEvents: 'none',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            left: '66.66%',
                            top: 0,
                            bottom: 0,
                            width: 1,
                            borderLeft: '1px dashed rgba(255,255,255,0.6)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* Size Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                          }}
                        >
                          {Math.round(cropBox.width)} × {Math.round(cropBox.height)} px
                        </Box>

                        {/* 4 Corner Resize Handles */}
                        {/* NW */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-nw', e)}
                          sx={{
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            width: 12,
                            height: 12,
                            bgcolor: '#fff',
                            border: '2px solid #00A76F',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                          }}
                        />
                        {/* NE */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-ne', e)}
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 12,
                            height: 12,
                            bgcolor: '#fff',
                            border: '2px solid #00A76F',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                          }}
                        />
                        {/* SE */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-se', e)}
                          sx={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            width: 12,
                            height: 12,
                            bgcolor: '#fff',
                            border: '2px solid #00A76F',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                          }}
                        />
                        {/* SW */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-sw', e)}
                          sx={{
                            position: 'absolute',
                            bottom: -6,
                            left: -6,
                            width: 12,
                            height: 12,
                            bgcolor: '#fff',
                            border: '2px solid #00A76F',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                          }}
                        />

                        {/* 4 Edge Resize Handles */}
                        {/* N */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-n', e)}
                          sx={{
                            position: 'absolute',
                            top: -4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 16,
                            height: 8,
                            bgcolor: '#00A76F',
                            borderRadius: 1,
                            cursor: 'ns-resize',
                          }}
                        />
                        {/* S */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-s', e)}
                          sx={{
                            position: 'absolute',
                            bottom: -4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 16,
                            height: 8,
                            bgcolor: '#00A76F',
                            borderRadius: 1,
                            cursor: 'ns-resize',
                          }}
                        />
                        {/* E */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-e', e)}
                          sx={{
                            position: 'absolute',
                            right: -4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 16,
                            bgcolor: '#00A76F',
                            borderRadius: 1,
                            cursor: 'ew-resize',
                          }}
                        />
                        {/* W */}
                        <Box
                          onPointerDown={(e) => handleCropPointerDown('resizing-w', e)}
                          sx={{
                            position: 'absolute',
                            left: -4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 16,
                            bgcolor: '#00A76F',
                            borderRadius: 1,
                            cursor: 'ew-resize',
                          }}
                        />
                      </Box>
                    </Box>

                    <Chip
                      size="small"
                      color="secondary"
                      variant="soft"
                      label={`사각형을 드래그하여 이동하거나 모서리를 늘려 자를 영역을 선택하세요`}
                    />
                  </Box>
                )}

                {/* Mode B: Live Preview Canvas (for Resize Mode, or Cropped Result Preview) */}
                {((toolMode === 'resize' && previewTab === 'live') ||
                  (toolMode === 'crop' && previewTab === 'compare')) && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        boxShadow: 3,
                        borderRadius: 1,
                        overflow: 'hidden',
                        lineHeight: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <canvas
                        ref={previewCanvasRef}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '60vh',
                          objectFit: 'contain',
                          display: 'block',
                          imageRendering: imageSmoothing ? 'auto' : 'pixelated',
                        }}
                      />
                    </Box>

                    <Chip
                      size="small"
                      color={toolMode === 'crop' ? 'secondary' : 'primary'}
                      variant="soft"
                      label={
                        toolMode === 'crop'
                          ? `잘라낸 사각형 영역 실시간 미리보기 (${Math.round(cropBox.width)} × ${Math.round(cropBox.height)} px)`
                          : `현재 미리보기 크기: ${targetWidth} × ${targetHeight} px (프레임 ${playerIndex + 1} / ${frames.length})`
                      }
                    />
                  </Box>
                )}

                {/* Mode C: Side-by-Side Comparison (Resize mode only) */}
                {toolMode === 'resize' && previewTab === 'compare' && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      flexWrap: 'wrap',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    {/* Original Frame */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        label={`원본: ${originalDimensions.width} × ${originalDimensions.height} px`}
                        variant="outlined"
                      />
                      <Box
                        sx={{
                          boxShadow: 2,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          maxHeight: '50vh',
                          maxWidth: '40vw',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={frames[playerIndex % frames.length]?.dataUrl}
                          alt="Original frame"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '50vh',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Resized Live Frame */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        color="primary"
                        label={`조절됨: ${targetWidth} × ${targetHeight} px (${(scaleRatioX * 100).toFixed(0)}%)`}
                        variant="filled"
                      />
                      <Box
                        sx={{
                          boxShadow: 2,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          bgcolor: 'background.paper',
                          maxHeight: '50vh',
                          maxWidth: '40vw',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewCanvasRef.current?.toDataURL() || ''}
                          alt="Resized preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '50vh',
                            objectFit: 'contain',
                            display: 'block',
                            imageRendering: imageSmoothing ? 'auto' : 'pixelated',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Mode D: Rendered Result GIF */}
                {previewTab === 'result' && resultGifUrl && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        boxShadow: 4,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'success.main',
                        bgcolor: 'background.paper',
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resultGifUrl}
                        alt="Processed GIF Result"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '60vh',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {/* Result Stats */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      <Chip
                        color="success"
                        variant="filled"
                        label={`최종 해상도: ${
                          toolMode === 'crop'
                            ? cropOutputMode === 'custom' && cropCustomWidth > 0
                              ? `${cropCustomWidth} × ${cropCustomHeight}`
                              : `${Math.round(cropBox.width)} × ${Math.round(cropBox.height)}`
                            : `${targetWidth} × ${targetHeight}`
                        } px`}
                      />
                      <Chip
                        variant="soft"
                        label={`용량: ${formatBytes(resultGifSize)} (${
                          sizeDiffPercent !== null
                            ? sizeDiffPercent <= 0
                              ? `${Math.abs(sizeDiffPercent)}% 감소`
                              : `${sizeDiffPercent}% 증가`
                            : ''
                        })`}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Player Controls Bar */}
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setIsPlaying(!isPlaying)}
                  color={isPlaying ? 'primary' : 'default'}
                >
                  {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() =>
                    setPlayerIndex((prev) => (prev - 1 + frames.length) % frames.length)
                  }
                  disabled={isPlaying}
                >
                  <SkipPreviousRoundedIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => setPlayerIndex((prev) => (prev + 1) % frames.length)}
                  disabled={isPlaying}
                >
                  <SkipNextRoundedIcon />
                </IconButton>

                {/* Frame Scrub Slider */}
                <Box sx={{ flex: 1, px: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Slider
                    size="small"
                    value={playerIndex}
                    min={0}
                    max={Math.max(0, frames.length - 1)}
                    onChange={(_, val) => {
                      setPlayerIndex(val as number);
                      if (isPlaying) setIsPlaying(false);
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v + 1} / ${frames.length}`}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', minWidth: 60, textAlign: 'right' }}
                  >
                    {playerIndex + 1} / {frames.length}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Resizable Divider */}
            <Box
              onPointerDown={handleDividerPointerDown}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
              sx={{
                width: 8,
                cursor: 'col-resize',
                bgcolor: 'divider',
                transition: 'background-color 0.2s',
                position: 'relative',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: 'primary.main',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 2,
                  height: 24,
                  bgcolor: 'text.disabled',
                  borderRadius: 1,
                },
              }}
            />

            {/* Right Column: Controls Panel */}
            <Box
              sx={{
                width: rightPanelWidth,
                minWidth: 300,
                maxWidth: 680,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflowY: 'auto',
                p: 2.5,
                gap: 2.5,
                bgcolor: 'background.paper',
              }}
            >
              {/* Mode Switch: Resize vs Crop */}
              <Box
                sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: 'action.hover', borderRadius: 1.5 }}
              >
                <Button
                  fullWidth
                  size="small"
                  variant={toolMode === 'resize' ? 'contained' : 'text'}
                  color={toolMode === 'resize' ? 'primary' : 'inherit'}
                  startIcon={<AspectRatioRoundedIcon />}
                  onClick={() => {
                    setToolMode('resize');
                    setPreviewTab('live');
                  }}
                  sx={{ py: 1, fontWeight: 700, borderRadius: 1 }}
                >
                  📐 해상도 크기 조절
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant={toolMode === 'crop' ? 'contained' : 'text'}
                  color={toolMode === 'crop' ? 'secondary' : 'inherit'}
                  startIcon={<CropRoundedIcon />}
                  onClick={() => {
                    setToolMode('crop');
                    setPreviewTab('live');
                  }}
                  sx={{ py: 1, fontWeight: 700, borderRadius: 1 }}
                >
                  ✂️ 사각형 자르기 (크롭)
                </Button>
              </Box>

              {/* ============================================================== */}
              {/* TAB 1: CROP SELECTION CONTROLS (사각형 자르기) */}
              {/* ============================================================== */}
              {toolMode === 'crop' ? (
                <>
                  {/* Crop Coordinates & Dimensions */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        ✂️ 사각형 선택 영역 수치
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ReplayRoundedIcon />}
                        onClick={handleResetCropToFull}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        전체 초기화
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <TextField
                        label="너비 (W)"
                        type="number"
                        size="small"
                        value={Math.round(cropBox.width) || ''}
                        onChange={(e) => {
                          const w = Math.max(16, parseInt(e.target.value, 10) || 16);
                          setCropBox((prev) => ({
                            ...prev,
                            width: Math.min(originalDimensions.width - prev.x, w),
                          }));
                        }}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="높이 (H)"
                        type="number"
                        size="small"
                        value={Math.round(cropBox.height) || ''}
                        onChange={(e) => {
                          const h = Math.max(16, parseInt(e.target.value, 10) || 16);
                          setCropBox((prev) => ({
                            ...prev,
                            height: Math.min(originalDimensions.height - prev.y, h),
                          }));
                        }}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <TextField
                        label="시작 위치 (X)"
                        type="number"
                        size="small"
                        value={Math.round(cropBox.x)}
                        onChange={(e) => {
                          const x = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setCropBox((prev) => ({
                            ...prev,
                            x: Math.min(originalDimensions.width - prev.width, x),
                          }));
                        }}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="시작 위치 (Y)"
                        type="number"
                        size="small"
                        value={Math.round(cropBox.y)}
                        onChange={(e) => {
                          const y = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setCropBox((prev) => ({
                            ...prev,
                            y: Math.min(originalDimensions.height - prev.height, y),
                          }));
                        }}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    {/* Quick Align Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<CenterFocusStrongRoundedIcon />}
                        onClick={handleCenterCropBox}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        정중앙 정렬
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          const size = Math.min(
                            originalDimensions.width,
                            originalDimensions.height
                          );
                          const x = Math.round((originalDimensions.width - size) / 2);
                          const y = Math.round((originalDimensions.height - size) / 2);
                          setCropBox({ x, y, width: size, height: size });
                          setCropAspectRatio('1:1');
                        }}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        최대 1:1 정방형
                      </Button>
                    </Box>
                  </Box>

                  {/* Crop Aspect Ratio Presets */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      📏 자르기 비율 프리셋
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {CROP_RATIO_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          size="small"
                          variant={cropAspectRatio === preset.value ? 'contained' : 'outlined'}
                          color={cropAspectRatio === preset.value ? 'secondary' : 'inherit'}
                          onClick={() => handleSetCropRatio(preset.value)}
                          sx={{ fontSize: '0.75rem', py: 0.5, borderRadius: 1 }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Output Size Mode for Crop */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      🎯 잘라낸 후 출력 크기
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <ToggleButton
                        value="original"
                        selected={cropOutputMode === 'original'}
                        onChange={() => setCropOutputMode('original')}
                        sx={{ flex: 1, py: 0.75, textTransform: 'none', fontSize: '0.8125rem' }}
                      >
                        선택 영역 크기 그대로 ({Math.round(cropBox.width)} ×{' '}
                        {Math.round(cropBox.height)})
                      </ToggleButton>
                      <ToggleButton
                        value="custom"
                        selected={cropOutputMode === 'custom'}
                        onChange={() => setCropOutputMode('custom')}
                        sx={{ flex: 1, py: 0.75, textTransform: 'none', fontSize: '0.8125rem' }}
                      >
                        별도 해상도로 리사이즈
                      </ToggleButton>
                    </Box>

                    {cropOutputMode === 'custom' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="출력 너비"
                          type="number"
                          size="small"
                          value={cropCustomWidth || ''}
                          onChange={(e) => setCropCustomWidth(parseInt(e.target.value, 10) || 0)}
                          InputProps={{
                            endAdornment: <Typography variant="caption">px</Typography>,
                          }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="출력 높이"
                          type="number"
                          size="small"
                          value={cropCustomHeight || ''}
                          onChange={(e) => setCropCustomHeight(parseInt(e.target.value, 10) || 0)}
                          InputProps={{
                            endAdornment: <Typography variant="caption">px</Typography>,
                          }}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                /* ============================================================== */
                /* TAB 2: RESOLUTION RESIZE CONTROLS (전체 크기 조절) */
                /* ============================================================== */
                <>
                  {/* Section 1: Dimensions Input */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        📏 해상도 직접 지정
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ReplayRoundedIcon />}
                        onClick={handleResetToOriginal}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        원본 복원
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <TextField
                        label="너비 (Width)"
                        type="number"
                        size="small"
                        value={targetWidth || ''}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />

                      {/* Lock Aspect Ratio Toggle Button */}
                      <Tooltip
                        title={
                          lockAspectRatio
                            ? '가로세로 비율 고정 해제 (자유 비율)'
                            : '가로세로 비율 유지 고정'
                        }
                      >
                        <IconButton
                          color={lockAspectRatio ? 'primary' : 'default'}
                          onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          sx={{
                            border: '1px solid',
                            borderColor: lockAspectRatio ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          {lockAspectRatio ? (
                            <LockOutlineRoundedIcon fontSize="small" />
                          ) : (
                            <LockOpenRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <TextField
                        label="높이 (Height)"
                        type="number"
                        size="small"
                        value={targetHeight || ''}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                        InputProps={{ endAdornment: <Typography variant="caption">px</Typography> }}
                        sx={{ flex: 1 }}
                      />

                      {/* Swap Dimensions Button */}
                      <Tooltip title="가로/세로 맞바꾸기">
                        <IconButton
                          onClick={handleSwapDimensions}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          <SwapHorizRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Aspect Ratio Info Banner */}
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        비율 변동:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        가로 {(scaleRatioX * 100).toFixed(0)}% · 세로{' '}
                        {(scaleRatioY * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Section 2: Quick Scale Presets */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      ⚡ 빠른 배율 프리셋
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {SCALE_PRESETS.map((preset) => {
                        const isSelected =
                          Math.abs(scaleRatioX - preset.value) < 0.02 &&
                          Math.abs(scaleRatioY - preset.value) < 0.02;
                        return (
                          <Button
                            key={preset.label}
                            size="small"
                            variant={isSelected ? 'contained' : 'outlined'}
                            color={isSelected ? 'primary' : 'inherit'}
                            onClick={() => handleScalePresetClick(preset.value)}
                            sx={{
                              py: 0.5,
                              px: 1,
                              fontSize: '0.75rem',
                              borderRadius: 1,
                            }}
                          >
                            {preset.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Section 3: Standard / Social Presets */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      📱 소셜 미디어 / 표준 규격 프리셋
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel id="res-preset-label">규격 선택</InputLabel>
                      <Select
                        labelId="res-preset-label"
                        value={selectedResolutionPreset}
                        label="규격 선택"
                        onChange={(e) => handleResolutionPresetSelect(e.target.value)}
                      >
                        {RESOLUTION_PRESETS.map((p) => (
                          <MenuItem key={p.label} value={p.label}>
                            {p.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Section 4: Fit Mode (When aspect ratio changes) */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      🎯 맞춤 모드 (비율 변경 시)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ToggleButton
                        value="stretch"
                        selected={fitMode === 'stretch'}
                        onChange={() => setFitMode('stretch')}
                        sx={{ flex: 1, py: 0.75, textTransform: 'none', fontSize: '0.8125rem' }}
                      >
                        늘리기 (Stretch)
                      </ToggleButton>
                      <ToggleButton
                        value="contain"
                        selected={fitMode === 'contain'}
                        onChange={() => setFitMode('contain')}
                        sx={{ flex: 1, py: 0.75, textTransform: 'none', fontSize: '0.8125rem' }}
                      >
                        여백 채우기 (Contain)
                      </ToggleButton>
                      <ToggleButton
                        value="cover"
                        selected={fitMode === 'cover'}
                        onChange={() => setFitMode('cover')}
                        sx={{ flex: 1, py: 0.75, textTransform: 'none', fontSize: '0.8125rem' }}
                      >
                        꽉 채우기 (Cover)
                      </ToggleButton>
                    </Box>

                    {fitMode === 'contain' && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                        >
                          여백 채우기 색상:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button
                            size="small"
                            variant={containBgColor === 'transparent' ? 'contained' : 'outlined'}
                            onClick={() => setContainBgColor('transparent')}
                          >
                            투명 여백
                          </Button>
                          <Button
                            size="small"
                            variant={containBgColor === '#000000' ? 'contained' : 'outlined'}
                            onClick={() => setContainBgColor('#000000')}
                          >
                            검정색
                          </Button>
                          <Button
                            size="small"
                            variant={containBgColor === '#ffffff' ? 'contained' : 'outlined'}
                            onClick={() => setContainBgColor('#ffffff')}
                          >
                            흰색
                          </Button>
                          <input
                            type="color"
                            value={containBgColor === 'transparent' ? '#000000' : containBgColor}
                            onChange={(e) => setContainBgColor(e.target.value)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: 'none',
                            }}
                            title="사용자 지정 색상"
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {/* Shared Options: Quality & Pixel-Art Options */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  ✨ 렌더링 & 인코딩 옵션
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={!imageSmoothing}
                      onChange={(e) => setImageSmoothing(!e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        👾 레트로 도트/픽셀 아트 보존 (Nearest Neighbor)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        활성화 시 확대 시에도 픽셀 경계가 흐려지지 않고 각지게 유지됩니다
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1.5, alignItems: 'flex-start' }}
                />

                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                  >
                    인코딩 화질 및 속도:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant={qualityPreset === 10 ? 'contained' : 'outlined'}
                      color={qualityPreset === 10 ? 'primary' : 'inherit'}
                      onClick={() => setQualityPreset(10)}
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      초고속 (10)
                    </Button>
                    <Button
                      size="small"
                      variant={qualityPreset === 5 ? 'contained' : 'outlined'}
                      color={qualityPreset === 5 ? 'primary' : 'inherit'}
                      onClick={() => setQualityPreset(5)}
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      표준 (5)
                    </Button>
                    <Button
                      size="small"
                      variant={qualityPreset === 2 ? 'contained' : 'outlined'}
                      color={qualityPreset === 2 ? 'primary' : 'inherit'}
                      onClick={() => setQualityPreset(2)}
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      고화질 (2)
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Section 6: Action & Execution Button */}
              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color={toolMode === 'crop' ? 'secondary' : 'primary'}
                  size="large"
                  onClick={handleExecute}
                  disabled={isProcessing || isExtracting}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : toolMode === 'crop' ? (
                      <CropRoundedIcon />
                    ) : (
                      <AutoAwesomeRoundedIcon />
                    )
                  }
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  {isProcessing
                    ? `GIF 인코딩 생성 중... (${processProgress}%)`
                    : toolMode === 'crop'
                      ? '선택 사각형 영역으로 GIF 자르기 적용'
                      : 'GIF 크기 조절 적용 및 생성'}
                </Button>

                {/* Download Actions (when result ready) */}
                {resultGifUrl && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="medium"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={() =>
                        downloadDataUrl(
                          resultGifUrl,
                          `${toolMode === 'crop' ? 'cropped' : 'resized'}_${Date.now()}.gif`
                        )
                      }
                      sx={{ fontWeight: 700 }}
                    >
                      완성된 GIF 다운로드 ({formatBytes(resultGifSize)})
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={
                        isMp4Converting ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <MovieCreationRoundedIcon />
                        )
                      }
                      onClick={handleConvertToMp4}
                      disabled={isMp4Converting}
                    >
                      {isMp4Converting
                        ? `MP4 비디오로 변환 중... (${mp4Progress}%)`
                        : mp4Url
                          ? `MP4 비디오 다운로드 (${formatBytes(mp4Size)})`
                          : 'MP4 비디오로 내보내기'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
