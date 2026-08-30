'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PhotoSizeSelectActualRoundedIcon from '@mui/icons-material/PhotoSizeSelectActualRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { PhotoUploadWorkspace, type SampleImageItem } from '../components';
import {
  formatBytes,
  downloadDataUrl,
  shareToKakaoTalk,
  calculateDataUrlByteSize,
} from '../utils/image-processor';

// ----------------------------------------------------------------------

const RESIZE_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-4k-landscape',
    label: '🏔️ 4K 초고화질 자연 풍경 (3840×2160)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2400&auto=format&fit=crop&q=90',
    subLabel: '대용량 4K 풍경 사진',
  },
  {
    id: 'sample-portrait-hd',
    label: '👤 고해상도 인물 포트레이트 (2400×3200)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=2400&auto=format&fit=crop&q=90',
    subLabel: '세로형 고해상도 사진',
  },
  {
    id: 'sample-architecture',
    label: '🏛️ 건축 & 인테리어 (3000×2000)',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=2400&auto=format&fit=crop&q=90',
    subLabel: '정밀 디테일 건축 사진',
  },
];

interface PresetResolution {
  label: string;
  width: number;
  height: number;
  category: string;
}

const PRESET_RESOLUTIONS: PresetResolution[] = [
  { label: 'Full HD (1080p)', width: 1920, height: 1080, category: '표준 영상' },
  { label: 'HD (720p)', width: 1280, height: 720, category: '표준 영상' },
  { label: '4K UHD (2160p)', width: 3840, height: 2160, category: '고화질' },
  { label: '인스타그램 피드 (1:1)', width: 1080, height: 1080, category: 'SNS' },
  { label: '인스타 스토리 / 릴스', width: 1080, height: 1920, category: 'SNS' },
  { label: '유튜브 썸네일', width: 1280, height: 720, category: '웹/미디어' },
  { label: '웹 배너 (와이드)', width: 1200, height: 630, category: '웹/미디어' },
  { label: '프로필 / 아이콘 (정사각)', width: 512, height: 512, category: '아이콘' },
];

type SmoothingQuality = 'high' | 'medium' | 'pixelated';

interface BatchResizeItem {
  id: string;
  file: File;
  name: string;
  origUrl: string;
  origWidth: number;
  origHeight: number;
  origSize: number;
  targetWidth?: number;
  targetHeight?: number;
  resultUrl?: string;
  resultSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

// ----------------------------------------------------------------------

export function ResizeView() {
  const [currentTab, setCurrentTab] = useState<'single' | 'batch'>('single');

  // --------------------------------------------------------------------
  // Panel Resizing State (Desktop Divider)
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // Tab 1: Single Precision Resize State
  // --------------------------------------------------------------------
  const [singleOrigUrl, setSingleOrigUrl] = useState<string | null>(null);
  const [singleResultUrl, setSingleResultUrl] = useState<string | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [origByteSize, setOrigByteSize] = useState<number>(0);
  const [resultByteSize, setResultByteSize] = useState<number>(0);

  // Resize Settings
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [noUpscale, setNoUpscale] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(100);
  const [resizeMode, setResizeMode] = useState<'pixel' | 'percent'>('pixel');
  const [smoothing, setSmoothing] = useState<SmoothingQuality>('high');
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [outputQuality, setOutputQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // Tab 2: Batch Resize State
  // --------------------------------------------------------------------
  const [batchItems, setBatchItems] = useState<BatchResizeItem[]>([]);
  const [batchMode, setBatchMode] = useState<'percent' | 'maxWidth' | 'maxHeight'>('percent');
  const [batchPercent, setBatchPercent] = useState<number>(50);
  const [batchMaxWidth, setBatchMaxWidth] = useState<number>(1920);
  const [batchMaxHeight, setBatchMaxHeight] = useState<number>(1080);
  const [batchNoUpscale, setBatchNoUpscale] = useState<boolean>(true);
  const [batchFormat, setBatchFormat] = useState<'original' | 'png' | 'jpeg' | 'webp'>('original');
  const [batchQuality, setBatchQuality] = useState<number>(90);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);

  // --------------------------------------------------------------------
  // Single Canvas Processing Engine
  // --------------------------------------------------------------------
  const renderResizedImage = useCallback(
    async (
      src: string,
      reqW: number,
      reqH: number,
      origW: number,
      origH: number,
      isNoUpscale: boolean,
      smooth: SmoothingQuality,
      format: 'png' | 'jpeg' | 'webp',
      quality: number
    ) => {
      if (!src || reqW <= 0 || reqH <= 0 || origW <= 0 || origH <= 0) return;

      setIsProcessing(true);
      try {
        let finalW = reqW;
        let finalH = reqH;

        // "더 작을 경우 확대 안함" 로직 적용
        if (isNoUpscale) {
          if (finalW > origW || finalH > origH) {
            const scaleW = origW / finalW;
            const scaleH = origH / finalH;
            const minScale = Math.min(scaleW, scaleH, 1);
            finalW = Math.max(1, Math.round(finalW * minScale));
            finalH = Math.max(1, Math.round(finalH * minScale));
          }
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        });

        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        // Resampling interpolation configuration
        if (smooth === 'pixelated') {
          ctx.imageSmoothingEnabled = false;
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = smooth === 'high' ? 'high' : 'medium';
        }

        // Multi-step downscaling for highest quality if downscaling by more than 50%
        if (smooth === 'high' && (finalW < origW * 0.5 || finalH < origH * 0.5)) {
          let curW = origW;
          let curH = origH;
          let tempCanvas = document.createElement('canvas');
          tempCanvas.width = curW;
          tempCanvas.height = curH;
          let tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);

            while (curW * 0.5 > finalW && curH * 0.5 > finalH) {
              const nextW = Math.max(finalW, Math.round(curW * 0.5));
              const nextH = Math.max(finalH, Math.round(curH * 0.5));
              const stepCanvas = document.createElement('canvas');
              stepCanvas.width = nextW;
              stepCanvas.height = nextH;
              const stepCtx = stepCanvas.getContext('2d');
              if (stepCtx) {
                stepCtx.imageSmoothingEnabled = true;
                stepCtx.imageSmoothingQuality = 'high';
                stepCtx.drawImage(tempCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
                tempCanvas = stepCanvas;
                tempCtx = stepCtx;
                curW = nextW;
                curH = nextH;
              } else {
                break;
              }
            }

            ctx.drawImage(tempCanvas, 0, 0, curW, curH, 0, 0, finalW, finalH);
          } else {
            ctx.drawImage(img, 0, 0, origW, origH, 0, 0, finalW, finalH);
          }
        } else {
          ctx.drawImage(img, 0, 0, origW, origH, 0, 0, finalW, finalH);
        }

        const mime =
          format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality / 100);

        setSingleResultUrl(dataUrl);
        setResultByteSize(calculateDataUrlByteSize(dataUrl));
      } catch {
        toast.error('이미지 리사이즈 처리에 실패했습니다.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Trigger re-render on settings change
  useEffect(() => {
    if (singleOrigUrl && targetWidth > 0 && targetHeight > 0) {
      renderResizedImage(
        singleOrigUrl,
        targetWidth,
        targetHeight,
        origDimensions.width,
        origDimensions.height,
        noUpscale,
        smoothing,
        outputFormat,
        outputQuality
      );
    }
  }, [
    singleOrigUrl,
    targetWidth,
    targetHeight,
    origDimensions,
    noUpscale,
    smoothing,
    outputFormat,
    outputQuality,
    renderResizedImage,
  ]);

  // Handle Loading Initial Single Image
  const handleLoadSingleImage = useCallback((src: string, byteSize?: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      setSingleOrigUrl(src);
      setOrigDimensions({ width: w, height: h });
      setTargetWidth(w);
      setTargetHeight(h);
      setPercentage(100);
      setResizeMode('pixel');
      const calculatedSize = byteSize || calculateDataUrlByteSize(src);
      setOrigByteSize(calculatedSize);
    };
    img.src = src;
  }, []);

  const handleSelectSingleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      handleLoadSingleImage(src, file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSingleSample = (url: string) => {
    handleLoadSingleImage(url);
  };

  // --------------------------------------------------------------------
  // Width & Height Change Handlers (with Aspect Ratio Sync)
  // --------------------------------------------------------------------
  const handleWidthChange = (newWidth: number) => {
    const w = Math.max(1, Math.round(newWidth));
    setTargetWidth(w);
    if (keepAspectRatio && origDimensions.width > 0 && origDimensions.height > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      const h = Math.max(1, Math.round(w * ratio));
      setTargetHeight(h);
      setPercentage(Math.round((w / origDimensions.width) * 100));
    } else if (origDimensions.width > 0) {
      setPercentage(Math.round((w / origDimensions.width) * 100));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const h = Math.max(1, Math.round(newHeight));
    setTargetHeight(h);
    if (keepAspectRatio && origDimensions.width > 0 && origDimensions.height > 0) {
      const ratio = origDimensions.width / origDimensions.height;
      const w = Math.max(1, Math.round(h * ratio));
      setTargetWidth(w);
      setPercentage(Math.round((w / origDimensions.width) * 100));
    }
  };

  const handlePercentageChange = (newPct: number) => {
    const pct = Math.max(1, Math.min(500, Math.round(newPct)));
    setPercentage(pct);
    if (origDimensions.width > 0 && origDimensions.height > 0) {
      const factor = pct / 100;
      setTargetWidth(Math.max(1, Math.round(origDimensions.width * factor)));
      setTargetHeight(Math.max(1, Math.round(origDimensions.height * factor)));
    }
  };

  const handleApplyPreset = (preset: PresetResolution) => {
    if (keepAspectRatio && origDimensions.width > 0 && origDimensions.height > 0) {
      // Fit within preset bounds while preserving aspect ratio
      const scaleW = preset.width / origDimensions.width;
      const scaleH = preset.height / origDimensions.height;
      const scale = Math.min(scaleW, scaleH);
      const w = Math.max(1, Math.round(origDimensions.width * scale));
      const h = Math.max(1, Math.round(origDimensions.height * scale));
      setTargetWidth(w);
      setTargetHeight(h);
      setPercentage(Math.round((w / origDimensions.width) * 100));
    } else {
      setTargetWidth(preset.width);
      setTargetHeight(preset.height);
      if (origDimensions.width > 0) {
        setPercentage(Math.round((preset.width / origDimensions.width) * 100));
      }
    }
    toast.success(`[${preset.label}] 규격 (${preset.width}×${preset.height})이 적용되었습니다.`);
  };

  const handleResetSingle = () => {
    if (origDimensions.width > 0 && origDimensions.height > 0) {
      setTargetWidth(origDimensions.width);
      setTargetHeight(origDimensions.height);
      setPercentage(100);
      toast.info('원본 해상도 (100%)로 복원되었습니다.');
    }
  };

  const handleClearSingleImage = () => {
    setSingleOrigUrl(null);
    setSingleResultUrl(null);
    setOrigDimensions({ width: 0, height: 0 });
    setOrigByteSize(0);
    setResultByteSize(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setPercentage(100);
  };

  const handleDownloadSingle = () => {
    if (!singleResultUrl) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const filename = `resized_${targetWidth}x${targetHeight}_${Date.now()}.${ext}`;
    downloadDataUrl(singleResultUrl, filename);
    toast.success('리사이즈 이미지가 다운로드되었습니다.');
  };

  const handleShareSingle = async () => {
    if (!singleResultUrl) return;
    try {
      await shareToKakaoTalk(singleResultUrl, '이미지 크기 조절 사진', 'resized_photo.png');
    } catch {
      toast.error('공유하기 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCopySingleClipboard = async () => {
    if (!singleResultUrl) return;
    try {
      const response = await fetch(singleResultUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('클립보드 복사를 지원하지 않거나 실패했습니다.');
    }
  };

  // --------------------------------------------------------------------
  // Batch Resize Handlers
  // --------------------------------------------------------------------
  const handleAddBatchFiles = (files: File[]) => {
    const newItems: BatchResizeItem[] = files.map((f) => {
      const objUrl = URL.createObjectURL(f);
      return {
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        origUrl: objUrl,
        origWidth: 0,
        origHeight: 0,
        origSize: f.size,
        status: 'pending',
      };
    });

    // Load dimensions for each file
    newItems.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        setBatchItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, origWidth: img.width, origHeight: img.height } : it
          )
        );
      };
      img.src = item.origUrl;
    });

    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const batchDrop = useImageDropPaste({
    onFiles: handleAddBatchFiles,
    multiple: true,
    disabled: currentTab !== 'batch',
  });

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearAllBatch = () => {
    setBatchItems([]);
  };

  const handleProcessBatch = async () => {
    if (batchItems.length === 0) {
      toast.error('처리할 이미지를 추가해 주세요.');
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(0);

    const updated = [...batchItems];
    const zipEntries: ZipFileEntry[] = [];

    for (let i = 0; i < updated.length; i += 1) {
      const item = updated[i];
      item.status = 'processing';
      setBatchItems([...updated]);

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = item.origUrl;
        });

        const ow = img.width;
        const oh = img.height;
        let tw = ow;
        let th = oh;

        if (batchMode === 'percent') {
          const factor = batchPercent / 100;
          tw = Math.max(1, Math.round(ow * factor));
          th = Math.max(1, Math.round(oh * factor));
        } else if (batchMode === 'maxWidth') {
          if (ow > batchMaxWidth || !batchNoUpscale) {
            const scale = batchMaxWidth / ow;
            tw = batchMaxWidth;
            th = Math.max(1, Math.round(oh * scale));
          }
        } else if (batchMode === 'maxHeight') {
          if (oh > batchMaxHeight || !batchNoUpscale) {
            const scale = batchMaxHeight / oh;
            th = batchMaxHeight;
            tw = Math.max(1, Math.round(ow * scale));
          }
        }

        // Apply No Upscale check
        if (batchNoUpscale) {
          if (tw > ow || th > oh) {
            const scaleW = ow / tw;
            const scaleH = oh / th;
            const minScale = Math.min(scaleW, scaleH, 1);
            tw = Math.max(1, Math.round(tw * minScale));
            th = Math.max(1, Math.round(th * minScale));
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, ow, oh, 0, 0, tw, th);

        let targetMime = 'image/png';
        let targetExt = 'png';
        if (batchFormat === 'original') {
          const fileExt = item.name.split('.').pop()?.toLowerCase();
          if (fileExt === 'jpg' || fileExt === 'jpeg') {
            targetMime = 'image/jpeg';
            targetExt = 'jpg';
          } else if (fileExt === 'webp') {
            targetMime = 'image/webp';
            targetExt = 'webp';
          }
        } else if (batchFormat === 'jpeg') {
          targetMime = 'image/jpeg';
          targetExt = 'jpg';
        } else if (batchFormat === 'webp') {
          targetMime = 'image/webp';
          targetExt = 'webp';
        }

        const dataUrl = canvas.toDataURL(targetMime, batchQuality / 100);
        item.resultUrl = dataUrl;
        item.targetWidth = tw;
        item.targetHeight = th;
        item.resultSize = calculateDataUrlByteSize(dataUrl);
        item.status = 'done';

        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        zipEntries.push({
          filename: `${baseName}_resized_${tw}x${th}.${targetExt}`,
          data: dataUrl,
        });
      } catch {
        item.status = 'error';
      }

      setBatchProgress(Math.round(((i + 1) / updated.length) * 100));
    }

    setBatchItems([...updated]);
    setIsBatchProcessing(false);

    if (zipEntries.length > 0) {
      await downloadZipFile(`resized_images_batch_${Date.now()}.zip`, zipEntries);
      toast.success(
        `${zipEntries.length}개 파일의 크기 조절이 완료되어 ZIP으로 다운로드되었습니다.`
      );
    }
  };

  const isUpscaled =
    origDimensions.width > 0 &&
    (targetWidth > origDimensions.width || targetHeight > origDimensions.height);

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AspectRatioRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            이미지 크기 조절 (Image Resize Studio)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          너비 · 높이 픽셀 지정, 가로세로 비율 고정, 원본보다 작을 때 확대 방지(No Upscale),
          25%/50%/75% 퍼센트별 축소 및 다중 사진 일괄 리사이즈를 지원합니다.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. 정밀 크기 조절 (Single)"
            value="single"
            icon={<AspectRatioRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label={`2. 다중 사진 일괄 크기 조절 (${batchItems.length})`}
            value="batch"
            icon={<ViewModuleRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: { xs: 'auto', lg: 'hidden' },
          pb: { xs: 2, lg: 0 },
        }}
      >
        {/* ================================================================= */}
        {/* TAB 1: SINGLE PRECISION RESIZE */}
        {/* ================================================================= */}
        {currentTab === 'single' && (
          <>
            {!singleOrigUrl ? (
              <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 500 }}>
                <PhotoUploadWorkspace
                  sampleImages={RESIZE_SAMPLE_IMAGES}
                  onSelectSample={handleSelectSingleSample}
                  onFileSelect={handleSelectSingleFile}
                  title="크기를 조절할 사진을 업로드하세요"
                  subtitle="사진을 드래그하거나 클릭하여 선택하세요. (Ctrl+V 클립보드 붙여넣기 지원)"
                  icon={<AspectRatioRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />}
                />
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 2,
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Left: Viewport Area */}
                <Box
                  sx={{
                    flex: '1 1 0%',
                    minWidth: 0,
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Card
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 3,
                      flex: '1 1 auto',
                      minHeight: 0,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top Resolution & Size Badge Bar */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`원본: ${origDimensions.width} × ${origDimensions.height} px (${formatBytes(origByteSize)})`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.75rem', height: 24 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 800, color: 'text.disabled' }}
                        >
                          →
                        </Typography>
                        <Chip
                          label={`조절 후: ${targetWidth} × ${targetHeight} px (${formatBytes(resultByteSize)})`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 800, fontSize: '0.75rem', height: 24 }}
                        />
                      </Box>

                      {origByteSize > 0 && resultByteSize > 0 && (
                        <Chip
                          label={
                            resultByteSize < origByteSize
                              ? `${Math.round((1 - resultByteSize / origByteSize) * 100)}% 용량 절감`
                              : `${percentage}% 크기`
                          }
                          size="small"
                          color={resultByteSize < origByteSize ? 'success' : 'info'}
                          sx={{ fontWeight: 800, fontSize: '0.75rem', height: 24 }}
                        />
                      )}
                    </Box>

                    {/* Direct Image Viewport - Exact Photo Bounds Preview (No Lines, No Scrollbar) */}
                    <Box
                      sx={{
                        flex: '1 1 auto',
                        minHeight: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.neutral',
                        p: 0,
                        userSelect: 'none',
                      }}
                    >
                      {isProcessing && (
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(15, 23, 42, 0.45)',
                            backdropFilter: 'blur(3px)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                          }}
                        >
                          <CircularProgress color="primary" size={36} />
                          <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700 }}>
                            크기 조절 중...
                          </Typography>
                        </Box>
                      )}

                      {singleResultUrl ? (
                        <Box
                          component="img"
                          src={singleResultUrl}
                          alt="Resized Image"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: 0,
                            display: 'block',
                            userSelect: 'none',
                            pointerEvents: 'none',
                          }}
                        />
                      ) : null}
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

                {/* Right: Sidebar Control & Action Panel */}
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
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: 0.5,
                    pl: { lg: 1.5 },
                  }}
                >
                  {/* Mode Switcher Tabs: 픽셀별 vs 퍼센트별 */}
                  <Card sx={{ p: 0.75, borderRadius: 2.5, bgcolor: 'background.neutral' }}>
                    <Tabs
                      value={resizeMode}
                      onChange={(_, v) => setResizeMode(v)}
                      variant="fullWidth"
                      sx={{
                        minHeight: 42,
                        '& .MuiTabs-indicator': {
                          height: '100%',
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          boxShadow: (theme) => theme.customShadows?.z1 || theme.shadows[1],
                          zIndex: 0,
                        },
                        '& .MuiTab-root': {
                          zIndex: 1,
                          minHeight: 42,
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          borderRadius: 2,
                          transition: 'color 0.2s',
                          '&.Mui-selected': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    >
                      <Tab
                        value="pixel"
                        label="픽셀별 (px)"
                        icon={<PhotoSizeSelectActualRoundedIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                      />
                      <Tab
                        value="percent"
                        label="퍼센트별 (%)"
                        icon={<AspectRatioRoundedIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                      />
                    </Tabs>
                  </Card>

                  {/* ======================================================= */}
                  {/* MODE A: 픽셀별 (Pixel Mode) */}
                  {/* ======================================================= */}
                  {resizeMode === 'pixel' && (
                    <>
                      {/* 1. Dimensions (너비 / 높이 설정) Card */}
                      <Card sx={{ p: 2.5, borderRadius: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            너비 · 높이 설정 (픽셀)
                          </Typography>
                          <Tooltip title="원본 크기 (100%)로 복원">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={
                                  targetWidth === origDimensions.width &&
                                  targetHeight === origDimensions.height
                                }
                                onClick={handleResetSingle}
                              >
                                <RestartAltRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>

                        {/* Width & Height Input Row with Lock Aspect Ratio Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <TextField
                            label="너비 (Width)"
                            type="number"
                            size="small"
                            value={targetWidth || ''}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                              },
                            }}
                            sx={{ flex: 1 }}
                          />

                          <Tooltip
                            title={
                              keepAspectRatio
                                ? '가로세로 비율 고정됨 (클릭 시 자유 조절)'
                                : '비율 유지 해제됨 (클릭 시 비율 고정)'
                            }
                          >
                            <IconButton
                              color={keepAspectRatio ? 'primary' : 'default'}
                              onClick={() => setKeepAspectRatio((prev) => !prev)}
                              sx={{
                                border: '1px solid',
                                borderColor: keepAspectRatio ? 'primary.main' : 'divider',
                                bgcolor: keepAspectRatio ? 'action.selected' : 'transparent',
                                p: 1,
                              }}
                            >
                              {keepAspectRatio ? (
                                <LinkRoundedIcon fontSize="small" />
                              ) : (
                                <LinkOffRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <TextField
                            label="높이 (Height)"
                            type="number"
                            size="small"
                            value={targetHeight || ''}
                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                              },
                            }}
                            sx={{ flex: 1 }}
                          />
                        </Box>

                        {/* Toggle: 가로세로 비율 유지 & 더 작을 경우 확대 안함 */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            pt: 0.5,
                            borderTop: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={keepAspectRatio}
                                onChange={(e) => setKeepAspectRatio(e.target.checked)}
                              />
                            }
                            label={
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                가로 · 세로 비율 유지 (Aspect Ratio)
                              </Typography>
                            }
                          />

                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                color="warning"
                                checked={noUpscale}
                                onChange={(e) => setNoUpscale(e.target.checked)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  더 작을 경우 확대 안함 (No Upscale)
                                </Typography>
                                {isUpscaled && noUpscale && (
                                  <Chip
                                    label="확대 방지 적용 중"
                                    size="small"
                                    color="warning"
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      </Card>

                      {/* 2. Preset Resolutions Card */}
                      <Card sx={{ p: 2.5, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                          자주 쓰는 규격 프리셋
                        </Typography>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1,
                          }}
                        >
                          {PRESET_RESOLUTIONS.map((preset) => (
                            <Button
                              key={preset.label}
                              size="small"
                              variant="outlined"
                              onClick={() => handleApplyPreset(preset)}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                p: 1,
                                borderRadius: 1.5,
                                textAlign: 'left',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.2,
                                }}
                              >
                                {preset.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.68rem' }}
                              >
                                {preset.width} × {preset.height} px
                              </Typography>
                            </Button>
                          ))}
                        </Box>
                      </Card>
                    </>
                  )}

                  {/* ======================================================= */}
                  {/* MODE B: 퍼센트별 (Percentage Mode) */}
                  {/* ======================================================= */}
                  {resizeMode === 'percent' && (
                    <>
                      {/* 1. Percentage Resize Card */}
                      <Card sx={{ p: 2.5, borderRadius: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            퍼센트별 비율 조절
                          </Typography>
                          <Chip
                            label={`${percentage}%`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                          />
                        </Box>

                        {/* Quick Preset Buttons: 25%, 50%, 75%, 100% */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 0.75,
                            mb: 2,
                          }}
                        >
                          {[25, 50, 75, 100].map((pct) => (
                            <Button
                              key={pct}
                              size="small"
                              variant={percentage === pct ? 'contained' : 'outlined'}
                              color={percentage === pct ? 'primary' : 'inherit'}
                              onClick={() => handlePercentageChange(pct)}
                              sx={{ fontWeight: 800, fontSize: '0.75rem', py: 0.75 }}
                            >
                              {pct === 100 ? '100% 원본' : `${pct}% 작게`}
                            </Button>
                          ))}
                        </Box>

                        {/* Direct Percentage Input & Slider */}
                        <Box sx={{ mb: 1.5 }}>
                          <TextField
                            fullWidth
                            label="사용자 지정 비율"
                            type="number"
                            size="small"
                            value={percentage || ''}
                            onChange={(e) => handlePercentageChange(Number(e.target.value))}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              },
                            }}
                            sx={{ mb: 1.5 }}
                          />

                          <Box sx={{ px: 0.5 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 600 }}
                              >
                                10% (초소형)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 600 }}
                              >
                                100% (원본)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 600 }}
                              >
                                200% (확대)
                              </Typography>
                            </Box>
                            <Slider
                              value={percentage}
                              min={10}
                              max={200}
                              step={1}
                              onChange={(_, v) => handlePercentageChange(v as number)}
                            />
                          </Box>
                        </Box>

                        {/* Toggle: 더 작을 경우 확대 안함 in Percentage Mode */}
                        <Box
                          sx={{
                            pt: 1,
                            borderTop: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                color="warning"
                                checked={noUpscale}
                                onChange={(e) => setNoUpscale(e.target.checked)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  더 작을 경우 확대 안함 (No Upscale)
                                </Typography>
                                {isUpscaled && noUpscale && (
                                  <Chip
                                    label="확대 방지 적용 중"
                                    size="small"
                                    color="warning"
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      </Card>

                      {/* 2. Calculated Dimensions Summary Card */}
                      <Card sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.neutral' }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}
                        >
                          계산된 결과 해상도 미리보기
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              원본 해상도
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {origDimensions.width} × {origDimensions.height} px
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
                            →
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'primary.main', fontWeight: 700 }}
                            >
                              조절 후 ({percentage}%)
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800, color: 'primary.main' }}
                            >
                              {targetWidth} × {targetHeight} px
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </>
                  )}

                  {/* 4. Resampling & Output Format Card */}
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                      4. 저장 포맷 및 보간 품질
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>리사이징 보간법</InputLabel>
                        <Select
                          value={smoothing}
                          label="리사이징 보간법"
                          onChange={(e) => setSmoothing(e.target.value as SmoothingQuality)}
                        >
                          <MenuItem value="high">고품질 부드럽게 (Bicubic High)</MenuItem>
                          <MenuItem value="medium">표준 보간 (Bilinear Standard)</MenuItem>
                          <MenuItem value="pixelated">픽셀 도트 보존 (Pixel Art / 도트용)</MenuItem>
                        </Select>
                      </FormControl>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: outputFormat === 'png' ? '1fr' : '1fr 1fr',
                          gap: 1.5,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>출력 포맷</InputLabel>
                          <Select
                            value={outputFormat}
                            label="출력 포맷"
                            onChange={(e) =>
                              setOutputFormat(e.target.value as 'png' | 'jpeg' | 'webp')
                            }
                          >
                            <MenuItem value="png">PNG (무손실)</MenuItem>
                            <MenuItem value="jpeg">JPG (표준 압축)</MenuItem>
                            <MenuItem value="webp">WebP (웹 최적화)</MenuItem>
                          </Select>
                        </FormControl>

                        {outputFormat !== 'png' && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Box
                              sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                품질
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: 'primary.main' }}
                              >
                                {outputQuality}%
                              </Typography>
                            </Box>
                            <Slider
                              size="small"
                              value={outputQuality}
                              min={10}
                              max={100}
                              onChange={(_, v) => setOutputQuality(v as number)}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>

                  {/* 5. Action Buttons Card */}
                  <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.neutral' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleDownloadSingle}
                      disabled={!singleResultUrl || isProcessing}
                      sx={{ fontWeight: 800, py: 1.3, mb: 1.5, fontSize: '0.95rem' }}
                    >
                      리사이즈 사진 다운로드
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={handleCopySingleClipboard}
                        disabled={!singleResultUrl || isProcessing}
                        sx={{ fontWeight: 700 }}
                      >
                        클립보드 복사
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ShareRoundedIcon />}
                        onClick={handleShareSingle}
                        disabled={!singleResultUrl || isProcessing}
                        sx={{ fontWeight: 700 }}
                      >
                        공유하기
                      </Button>
                    </Box>

                    <Button
                      fullWidth
                      variant="text"
                      color="inherit"
                      size="small"
                      startIcon={<CloudUploadRoundedIcon />}
                      onClick={handleClearSingleImage}
                      sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      다른 사진 선택하기
                    </Button>
                  </Card>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BATCH RESIZE (다중 사진 일괄 크기 조절) */}
        {/* ================================================================= */}
        {currentTab === 'batch' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Batch Settings Card */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                다중 사진 일괄 리사이즈 설정
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                  mb: 2,
                }}
              >
                {/* Mode 1: Percentage */}
                <Card
                  onClick={() => setBatchMode('percent')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: batchMode === 'percent' ? 'primary.main' : 'divider',
                    bgcolor: batchMode === 'percent' ? 'action.selected' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    비율(%) 기준 일괄 축소
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                    {[25, 50, 75].map((pct) => (
                      <Button
                        key={pct}
                        size="small"
                        variant={
                          batchPercent === pct && batchMode === 'percent' ? 'contained' : 'outlined'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchMode('percent');
                          setBatchPercent(pct);
                        }}
                        sx={{ fontSize: '0.72rem', py: 0.4, fontWeight: 700 }}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Slider
                      size="small"
                      value={batchPercent}
                      min={10}
                      max={150}
                      disabled={batchMode !== 'percent'}
                      onChange={(_, v) => setBatchPercent(v as number)}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 40 }}>
                      {batchPercent}%
                    </Typography>
                  </Box>
                </Card>

                {/* Mode 2: Max Width */}
                <Card
                  onClick={() => setBatchMode('maxWidth')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: batchMode === 'maxWidth' ? 'primary.main' : 'divider',
                    bgcolor: batchMode === 'maxWidth' ? 'action.selected' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    최대 너비(Max Width) 기준
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    비율을 유지하며 지정 너비에 맞춥니다.
                  </Typography>
                  <TextField
                    fullWidth
                    label="최대 너비"
                    type="number"
                    size="small"
                    value={batchMaxWidth}
                    disabled={batchMode !== 'maxWidth'}
                    onChange={(e) => setBatchMaxWidth(Number(e.target.value))}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      },
                    }}
                  />
                </Card>

                {/* Mode 3: Max Height */}
                <Card
                  onClick={() => setBatchMode('maxHeight')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: batchMode === 'maxHeight' ? 'primary.main' : 'divider',
                    bgcolor: batchMode === 'maxHeight' ? 'action.selected' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    최대 높이(Max Height) 기준
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    비율을 유지하며 지정 높이에 맞춥니다.
                  </Typography>
                  <TextField
                    fullWidth
                    label="최대 높이"
                    type="number"
                    size="small"
                    value={batchMaxHeight}
                    disabled={batchMode !== 'maxHeight'}
                    onChange={(e) => setBatchMaxHeight(Number(e.target.value))}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      },
                    }}
                  />
                </Card>
              </Box>

              {/* Batch Options (No Upscale & Format) */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={batchNoUpscale}
                      onChange={(e) => setBatchNoUpscale(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      개별 사진이 목표치보다 작을 경우 확대 안함 (No Upscale)
                    </Typography>
                  }
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>출력 포맷</InputLabel>
                    <Select
                      value={batchFormat}
                      label="출력 포맷"
                      onChange={(e) =>
                        setBatchFormat(e.target.value as 'original' | 'png' | 'jpeg' | 'webp')
                      }
                    >
                      <MenuItem value="original">원본 포맷 유지</MenuItem>
                      <MenuItem value="png">PNG (무손실)</MenuItem>
                      <MenuItem value="jpeg">JPG (표준 압축)</MenuItem>
                      <MenuItem value="webp">WebP (웹 최적화)</MenuItem>
                    </Select>
                  </FormControl>

                  {batchFormat !== 'png' && (
                    <Box sx={{ width: 140, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        품질: {batchQuality}%
                      </Typography>
                      <Slider
                        size="small"
                        value={batchQuality}
                        min={10}
                        max={100}
                        onChange={(_, v) => setBatchQuality(v as number)}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>

            {/* Batch Upload Dropzone */}
            <Card
              {...batchDrop.getRootProps()}
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: batchDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: batchDrop.isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                다중 사진을 드래그하거나 클릭하여 일괄 추가하세요
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                여러 장의 사진을 한 번에 업로드하여 지정한 규격으로 일괄 크기 조절 후 ZIP으로
                다운로드할 수 있습니다.
              </Typography>
            </Card>

            {/* Batch Items List & Actions */}
            {batchItems.length > 0 && (
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    업로드된 사진 목록 ({batchItems.length}개)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      onClick={handleClearAllBatch}
                      disabled={isBatchProcessing}
                    >
                      전체 비우기
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleProcessBatch}
                      disabled={isBatchProcessing}
                      sx={{ fontWeight: 800 }}
                    >
                      {isBatchProcessing
                        ? '일괄 리사이즈 처리 중...'
                        : '일괄 리사이즈 & ZIP 다운로드'}
                    </Button>
                  </Box>
                </Box>

                {isBatchProcessing && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        처리 진행률
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {batchProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={batchProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {batchItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 0,
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
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {item.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                          >
                            원본: {item.origWidth}×{item.origHeight} px (
                            {formatBytes(item.origSize)})
                            {item.targetWidth && item.targetHeight && (
                              <span style={{ color: '#6366f1', fontWeight: 700 }}>
                                {' '}
                                → 조절 후: {item.targetWidth}×{item.targetHeight} px (
                                {formatBytes(item.resultSize)})
                              </span>
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {item.status === 'processing' && (
                          <Chip label="처리 중" size="small" color="primary" />
                        )}
                        {item.status === 'done' && (
                          <Chip
                            label="완료"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                        {item.status === 'error' && (
                          <Chip label="오류" size="small" color="error" />
                        )}

                        {item.resultUrl && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              downloadDataUrl(
                                item.resultUrl!,
                                `resized_${item.targetWidth}x${item.targetHeight}_${item.name}`
                              );
                            }}
                          >
                            <DownloadRoundedIcon fontSize="small" />
                          </IconButton>
                        )}

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveBatchItem(item.id)}
                          disabled={isBatchProcessing}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
