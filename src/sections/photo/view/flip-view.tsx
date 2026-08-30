'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { shareToKakaoTalk, downloadDataUrl } from '../utils/image-processor';
import { PhotoCompareViewport, PhotoUploadWorkspace, type SampleImageItem } from '../components';

// ----------------------------------------------------------------------

const FLIP_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-portrait',
    label: '👤 인물 셀카 (좌우 거울 모드 보정)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '셀카 좌우 반전',
  },
  {
    id: 'sample-landscape',
    label: '🏔️ 호수 반영 풍경 (상하 반영 대칭)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '자연 풍경 상하 반전',
  },
  {
    id: 'sample-architecture',
    label: '🏛️ 대칭 건축물 (거울 만화경 효과)',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    subLabel: '건축 & 대칭 아트',
  },
];

type MirrorMode = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top' | 'quad';

interface BatchFlipItem {
  id: string;
  file: File;
  name: string;
  origUrl: string;
  resultUrl?: string;
  status: 'pending' | 'done' | 'error';
}

export function FlipView() {
  const [currentTab, setCurrentTab] = useState<'single' | 'batch' | 'mirror'>('single');

  // --------------------------------------------------------------------
  // Panel Resizing State
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

  // --------------------------------------------------------------------
  // Tab 1: Single Precision Flip & Rotate State
  // --------------------------------------------------------------------
  const [singleOrigUrl, setSingleOrigUrl] = useState<string | null>(null);
  const [singleResultUrl, setSingleResultUrl] = useState<string | null>(null);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [rotateDeg, setRotateDeg] = useState<number>(0);
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to +45
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [outputQuality, setOutputQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // Tab 2: Batch Flip State
  // --------------------------------------------------------------------
  const [batchItems, setBatchItems] = useState<BatchFlipItem[]>([]);
  const [batchFlipH, setBatchFlipH] = useState<boolean>(true);
  const [batchFlipV, setBatchFlipV] = useState<boolean>(false);
  const [batchRotation, setBatchRotation] = useState<number>(0);
  const [batchFormat, setBatchFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);

  // --------------------------------------------------------------------
  // Tab 3: Mirror Symmetry Art State
  // --------------------------------------------------------------------
  const [mirrorOrigUrl, setMirrorOrigUrl] = useState<string | null>(null);
  const [mirrorResultUrl, setMirrorResultUrl] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState<MirrorMode>('left-to-right');

  // --------------------------------------------------------------------
  // Single Tab Canvas Processing
  // --------------------------------------------------------------------
  const renderSingleFlippedImage = useCallback(
    async (src: string, isH: boolean, isV: boolean, rot: number, fine: number) => {
      setIsProcessing(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        });

        const totalAngle = (((rot + fine) % 360) + 360) % 360;
        const rad = (totalAngle * Math.PI) / 180;

        // Calculate bounding box for rotated image
        const absCos = Math.abs(Math.cos(rad));
        const absSin = Math.abs(Math.sin(rad));
        const newWidth = Math.round(img.width * absCos + img.height * absSin);
        const newHeight = Math.round(img.width * absSin + img.height * absCos);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.save();
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rad);
        ctx.scale(isH ? -1 : 1, isV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        const mime =
          outputFormat === 'png'
            ? 'image/png'
            : outputFormat === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, outputQuality / 100);
        setSingleResultUrl(dataUrl);
      } catch {
        toast.error('반전 이미지 생성에 실패했습니다.');
      } finally {
        setIsProcessing(false);
      }
    },
    [outputFormat, outputQuality]
  );

  // Trigger re-render on settings change
  useEffect(() => {
    if (singleOrigUrl) {
      renderSingleFlippedImage(singleOrigUrl, flipH, flipV, rotateDeg, fineAngle);
    }
  }, [singleOrigUrl, flipH, flipV, rotateDeg, fineAngle, renderSingleFlippedImage]);

  const handleSelectSingleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setSingleOrigUrl(src);
      setFlipH(false);
      setFlipV(false);
      setRotateDeg(0);
      setFineAngle(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSingleSample = (url: string) => {
    setSingleOrigUrl(url);
    setFlipH(false);
    setFlipV(false);
    setRotateDeg(0);
    setFineAngle(0);
  };

  const handleResetSingle = () => {
    setFlipH(false);
    setFlipV(false);
    setRotateDeg(0);
    setFineAngle(0);
    toast.info('반전 및 회전 상태가 초기화되었습니다.');
  };

  const handleClearSingleImage = () => {
    setSingleOrigUrl(null);
    setSingleResultUrl(null);
    setFlipH(false);
    setFlipV(false);
    setRotateDeg(0);
    setFineAngle(0);
  };

  const handleDownloadSingle = () => {
    if (!singleResultUrl) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    downloadDataUrl(singleResultUrl, `flipped_photo_${Date.now()}.${ext}`);
    toast.success('반전 사진이 다운로드되었습니다.');
  };

  const handleShareSingle = async () => {
    if (!singleResultUrl) return;
    try {
      await shareToKakaoTalk(singleResultUrl, '상하 · 좌우 반전 사진', 'flipped_photo.png');
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
  // Batch Tab Logic
  // --------------------------------------------------------------------
  const handleAddBatchFiles = (files: File[]) => {
    const newItems: BatchFlipItem[] = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      name: f.name,
      origUrl: URL.createObjectURL(f),
      status: 'pending',
    }));
    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const batchDrop = useImageDropPaste({
    onFiles: handleAddBatchFiles,
    multiple: true,
    disabled: currentTab !== 'batch',
  });

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
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = item.origUrl;
        });

        const normRot = ((batchRotation % 360) + 360) % 360;
        const isSwap = normRot === 90 || normRot === 270;
        const w = isSwap ? img.height : img.width;
        const h = isSwap ? img.width : img.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(w / 2, h / 2);
          ctx.rotate((normRot * Math.PI) / 180);
          ctx.scale(batchFlipH ? -1 : 1, batchFlipV ? -1 : 1);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          const mime =
            batchFormat === 'png'
              ? 'image/png'
              : batchFormat === 'webp'
                ? 'image/webp'
                : 'image/jpeg';
          const ext = batchFormat === 'jpeg' ? 'jpg' : batchFormat;
          const dataUrl = canvas.toDataURL(mime, 0.92);

          item.resultUrl = dataUrl;
          item.status = 'done';

          const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
          zipEntries.push({
            filename: `${baseName}_flipped.${ext}`,
            data: dataUrl,
          });
        }
      } catch {
        item.status = 'error';
      }

      setBatchProgress(Math.round(((i + 1) / updated.length) * 100));
    }

    setBatchItems(updated);
    setIsBatchProcessing(false);

    if (zipEntries.length > 0) {
      await downloadZipFile(`flipped_images_batch_${Date.now()}.zip`, zipEntries);
      toast.success(`${zipEntries.length}개 파일이 반전 처리되어 ZIP으로 다운로드되었습니다.`);
    }
  };

  // --------------------------------------------------------------------
  // Mirror Symmetry Art Logic
  // --------------------------------------------------------------------
  const renderMirrorSymmetry = useCallback(async (src: string, mode: MirrorMode) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });

      const w = img.width;
      const h = img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (mode === 'left-to-right') {
        ctx.drawImage(img, 0, 0, w / 2, h, 0, 0, w / 2, h);
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, w / 2, h, 0, 0, w / 2, h);
        ctx.restore();
      } else if (mode === 'right-to-left') {
        ctx.drawImage(img, w / 2, 0, w / 2, h, w / 2, h, w / 2, h);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(img, w / 2, 0, w / 2, h, -w / 2, 0, w / 2, h);
        ctx.restore();
      } else if (mode === 'top-to-bottom') {
        ctx.drawImage(img, 0, 0, w, h / 2, 0, 0, w, h / 2);
        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, w, h / 2, 0, 0, w, h / 2);
        ctx.restore();
      } else if (mode === 'bottom-to-top') {
        ctx.drawImage(img, 0, h / 2, w, h / 2, 0, h / 2, w, h / 2);
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, h / 2, w, h / 2, 0, -h / 2, w, h / 2);
        ctx.restore();
      } else if (mode === 'quad') {
        const hw = w / 2;
        const hh = h / 2;
        ctx.drawImage(img, 0, 0, hw, hh, 0, 0, hw, hh);

        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, hw, hh, 0, 0, hw, hh);
        ctx.restore();

        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, hw, hh, 0, 0, hw, hh);
        ctx.restore();

        ctx.save();
        ctx.translate(w, h);
        ctx.scale(-1, -1);
        ctx.drawImage(img, 0, 0, hw, hh, 0, 0, hw, hh);
        ctx.restore();
      }

      setMirrorResultUrl(canvas.toDataURL('image/png'));
    } catch {
      toast.error('대칭 효과 생성에 실패했습니다.');
    }
  }, []);

  useEffect(() => {
    if (mirrorOrigUrl) {
      renderMirrorSymmetry(mirrorOrigUrl, mirrorMode);
    }
  }, [mirrorOrigUrl, mirrorMode, renderMirrorSymmetry]);

  const handleSelectMirrorFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setMirrorOrigUrl(src);
    };
    reader.readAsDataURL(file);
  };

  const handleClearMirrorImage = () => {
    setMirrorOrigUrl(null);
    setMirrorResultUrl(null);
  };

  const handleDownloadMirror = () => {
    if (!mirrorResultUrl) return;
    downloadDataUrl(mirrorResultUrl, `mirror_symmetry_${mirrorMode}_${Date.now()}.png`);
    toast.success('대칭 합성 이미지가 다운로드되었습니다.');
  };

  const handleShareMirror = async () => {
    if (!mirrorResultUrl) return;
    try {
      await shareToKakaoTalk(mirrorResultUrl, '거울 대칭 만화경 사진', 'mirror_symmetry.png');
    } catch {
      toast.error('공유하기 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <SwapHorizRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            사진 상하 · 좌우 반전 스튜디오 (Flip & Rotate)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          거울 대칭 좌우 반전, 상하 반전, 90도/자유 각도 회전, 다중 파일 일괄 반전 및 창의적인 거울
          대칭 합성 만화경 효과를 지원합니다.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. 정밀 반전 & 각도 회전"
            value="single"
            icon={<CropRotateRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label={`2. 다중 사진 일괄 반전 (${batchItems.length})`}
            value="batch"
            icon={<ViewModuleRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 거울 대칭 합성 (만화경)"
            value="mirror"
            icon={<AutoAwesomeRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {/* ================================================================= */}
        {/* TAB 1: SINGLE PRECISION FLIP & ROTATE */}
        {/* ================================================================= */}
        {currentTab === 'single' && (
          <>
            {!singleOrigUrl ? (
              <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 500 }}>
                <PhotoUploadWorkspace
                  sampleImages={FLIP_SAMPLE_IMAGES}
                  onSelectSample={handleSelectSingleSample}
                  onFileSelect={handleSelectSingleFile}
                  title="반전할 사진을 업로드하세요"
                  subtitle="사진을 드래그하거나 클릭하여 선택하세요. (Ctrl+V 클립보드 지원)"
                />
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 2,
                  height: '100%',
                  minHeight: 550,
                }}
              >
                {/* Left: Viewport Area */}
                <Box
                  sx={{
                    flex: '1 1 0%',
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      flex: '1 1 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: { xs: 400, lg: 500 },
                      bgcolor: 'background.neutral',
                      overflow: 'hidden',
                    }}
                  >
                    {singleResultUrl ? (
                      <PhotoCompareViewport
                        originalSrc={singleOrigUrl}
                        resultSrc={singleResultUrl}
                        isLoading={isProcessing}
                      />
                    ) : null}
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
                    overflow: 'auto',
                    pl: { lg: 1.5 },
                  }}
                >
                  {/* 1. Flip Controls Card */}
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                      1. 거울 대칭 반전 (Flip)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant={flipH ? 'contained' : 'outlined'}
                        color={flipH ? 'primary' : 'inherit'}
                        startIcon={<SwapHorizRoundedIcon />}
                        onClick={() => setFlipH((prev) => !prev)}
                        sx={{ fontWeight: 700, py: 1.1 }}
                      >
                        좌우 반전 {flipH ? 'ON' : 'OFF'}
                      </Button>
                      <Button
                        fullWidth
                        variant={flipV ? 'contained' : 'outlined'}
                        color={flipV ? 'primary' : 'inherit'}
                        startIcon={<SwapVertRoundedIcon />}
                        onClick={() => setFlipV((prev) => !prev)}
                        sx={{ fontWeight: 700, py: 1.1 }}
                      >
                        상하 반전 {flipV ? 'ON' : 'OFF'}
                      </Button>
                    </Box>
                  </Card>

                  {/* 2. Rotate & Angle Adjustment Card */}
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
                        2. 방향 회전 & 각도 보정
                      </Typography>
                      <Tooltip title="각도 초기화">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={rotateDeg === 0 && fineAngle === 0 && !flipH && !flipV}
                            onClick={handleResetSingle}
                          >
                            <RestartAltRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<RotateLeftRoundedIcon />}
                        onClick={() => setRotateDeg((prev) => (prev - 90 + 360) % 360)}
                      >
                        반시계 90°
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<RotateRightRoundedIcon />}
                        onClick={() => setRotateDeg((prev) => (prev + 90) % 360)}
                      >
                        시계 90°
                      </Button>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          미세 수평 각도
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {fineAngle > 0 ? `+${fineAngle}` : fineAngle}°
                        </Typography>
                      </Box>
                      <Slider
                        value={fineAngle}
                        min={-45}
                        max={45}
                        step={0.5}
                        onChange={(_, v) => setFineAngle(v as number)}
                      />
                    </Box>
                  </Card>

                  {/* 3. Output Format Card */}
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                      3. 저장 포맷 & 품질
                    </Typography>

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
                          <MenuItem value="webp">WebP (초경량)</MenuItem>
                        </Select>
                      </FormControl>

                      {outputFormat !== 'png' && (
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                          >
                            품질 ({outputQuality}%)
                          </Typography>
                          <Slider
                            value={outputQuality}
                            min={40}
                            max={100}
                            size="small"
                            onChange={(_, v) => setOutputQuality(v as number)}
                          />
                        </Box>
                      )}
                    </Box>
                  </Card>

                  {/* 4. Status Chips Card */}
                  <Card sx={{ p: 2, borderRadius: 3, bgcolor: 'background.neutral' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                      적용 상태 요약
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={flipH ? '좌우 반전 ON' : '좌우 원본'}
                        color={flipH ? 'primary' : 'default'}
                        variant={flipH ? 'filled' : 'outlined'}
                      />
                      <Chip
                        size="small"
                        label={flipV ? '상하 반전 ON' : '상하 원본'}
                        color={flipV ? 'primary' : 'default'}
                        variant={flipV ? 'filled' : 'outlined'}
                      />
                      <Chip
                        size="small"
                        label={`총 회전 ${(((rotateDeg + fineAngle) % 360) + 360) % 360}°`}
                        color={rotateDeg !== 0 || fineAngle !== 0 ? 'secondary' : 'default'}
                        variant={rotateDeg !== 0 || fineAngle !== 0 ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Card>

                  {/* 5. Action Buttons (AI 배경 제거 스타일) */}
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
                      onClick={handleClearSingleImage}
                      disabled={isProcessing}
                      startIcon={<RefreshRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      다른 사진
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadSingle}
                      disabled={!singleResultUrl || isProcessing}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                    >
                      저장
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={handleShareSingle}
                      disabled={!singleResultUrl || isProcessing}
                      startIcon={<ShareRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      공유
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      disabled={!singleResultUrl || isProcessing}
                      onClick={handleCopySingleClipboard}
                      sx={{ py: 1, borderRadius: 2, fontWeight: 600 }}
                    >
                      클립보드 복사
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BATCH FLIP & ZIP DOWNLOAD */}
        {/* ================================================================= */}
        {currentTab === 'batch' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Batch Options Card */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                다중 파일 일괄 반전 설정
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Button
                  variant={batchFlipH ? 'contained' : 'outlined'}
                  color={batchFlipH ? 'primary' : 'inherit'}
                  startIcon={<SwapHorizRoundedIcon />}
                  onClick={() => setBatchFlipH((p) => !p)}
                  sx={{ fontWeight: 700, py: 1.2 }}
                >
                  좌우 반전 {batchFlipH ? 'ON' : 'OFF'}
                </Button>

                <Button
                  variant={batchFlipV ? 'contained' : 'outlined'}
                  color={batchFlipV ? 'primary' : 'inherit'}
                  startIcon={<SwapVertRoundedIcon />}
                  onClick={() => setBatchFlipV((p) => !p)}
                  sx={{ fontWeight: 700, py: 1.2 }}
                >
                  상하 반전 {batchFlipV ? 'ON' : 'OFF'}
                </Button>

                <FormControl size="small">
                  <InputLabel>일괄 회전</InputLabel>
                  <Select
                    value={batchRotation}
                    label="일괄 회전"
                    onChange={(e) => setBatchRotation(Number(e.target.value))}
                  >
                    <MenuItem value={0}>회전 없음 (0°)</MenuItem>
                    <MenuItem value={90}>시계 방향 90°</MenuItem>
                    <MenuItem value={180}>180° 회전</MenuItem>
                    <MenuItem value={270}>반시계 90° (270°)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>출력 포맷</InputLabel>
                  <Select
                    value={batchFormat}
                    label="출력 포맷"
                    onChange={(e) => setBatchFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                  >
                    <MenuItem value="png">PNG 포맷</MenuItem>
                    <MenuItem value="jpeg">JPG 포맷</MenuItem>
                    <MenuItem value="webp">WebP 포맷</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {isBatchProcessing && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                    일괄 변환 처리 중... ({batchProgress}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={batchProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  이미지 추가 (다중 선택)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) handleAddBatchFiles(Array.from(e.target.files));
                      e.target.value = '';
                    }}
                  />
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FolderZipRoundedIcon />}
                  disabled={batchItems.length === 0 || isBatchProcessing}
                  onClick={handleProcessBatch}
                  sx={{ fontWeight: 800, px: 3 }}
                >
                  {isBatchProcessing
                    ? '일괄 처리 중...'
                    : `${batchItems.length}개 파일 일괄 반전 및 ZIP 다운로드`}
                </Button>

                {batchItems.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteRoundedIcon />}
                    onClick={() => setBatchItems([])}
                    sx={{ ml: 'auto' }}
                  >
                    목록 비우기
                  </Button>
                )}
              </Box>
            </Card>

            {/* Batch Drop Area & Grid */}
            <Card
              {...batchDrop.getRootProps()}
              sx={{
                p: 3,
                borderRadius: 3,
                minHeight: 320,
                bgcolor: batchDrop.isDragActive ? 'action.hover' : 'background.paper',
                border: batchDrop.isDragActive ? '2px dashed' : 'none',
                borderColor: 'primary.main',
              }}
            >
              {batchItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
                  <CloudUploadRoundedIcon sx={{ fontSize: 56, mb: 1, opacity: 0.4 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    여러 장의 사진을 드래그하거나 버튼을 눌러 추가하세요.
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    모든 사진에 동일한 반전/회전 규칙이 일괄 적용되어 ZIP으로 다운로드됩니다.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {batchItems.map((item, idx) => (
                    <Card
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, position: 'relative' }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 140,
                          borderRadius: 0,
                          overflow: 'hidden',
                          bgcolor: 'background.neutral',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1,
                        }}
                      >
                        <img
                          src={item.resultUrl || item.origUrl}
                          alt={item.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: item.resultUrl
                              ? undefined
                              : `scale(${batchFlipH ? -1 : 1}, ${batchFlipV ? -1 : 1}) rotate(${batchRotation}deg)`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {idx + 1}. {item.name}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchItems((prev) => prev.filter((it) => it.id !== item.id));
                        }}
                        sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper' }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MIRROR SYMMETRY ART */}
        {/* ================================================================= */}
        {currentTab === 'mirror' && (
          <>
            {!mirrorOrigUrl ? (
              <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 500 }}>
                <PhotoUploadWorkspace
                  sampleImages={FLIP_SAMPLE_IMAGES}
                  onSelectSample={(url) => setMirrorOrigUrl(url)}
                  onFileSelect={handleSelectMirrorFile}
                  title="대칭 효과를 적용할 사진을 선택하세요"
                  subtitle="풍경, 인물, 건축물 사진을 선택하여 신비로운 거울 대칭 아트를 완성하세요."
                />
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 2,
                  height: '100%',
                  minHeight: 550,
                }}
              >
                {/* Left: Mirror Preview Viewport */}
                <Box
                  sx={{
                    flex: '1 1 0%',
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '1 1 auto',
                      minHeight: { xs: 400, lg: 500 },
                      bgcolor: 'background.neutral',
                      overflow: 'hidden',
                    }}
                  >
                    {mirrorResultUrl ? (
                      <Box
                        component="img"
                        src={mirrorResultUrl}
                        alt="Mirror Symmetry Result"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 0,
                          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        }}
                      />
                    ) : null}
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

                {/* Right: Mirror Controls & Action Panel */}
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
                    pl: { lg: 1.5 },
                  }}
                >
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                      거울 대칭 모드 선택
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        {
                          id: 'left-to-right',
                          title: '좌측 반사 (Left ➔ Right)',
                          desc: '왼쪽 절반을 오른쪽에 거울 대칭 복제',
                        },
                        {
                          id: 'right-to-left',
                          title: '우측 반사 (Right ➔ Left)',
                          desc: '오른쪽 절반을 왼쪽에 거울 대칭 복제',
                        },
                        {
                          id: 'top-to-bottom',
                          title: '상단 반사 (Top ➔ Bottom)',
                          desc: '위쪽 절반을 아래쪽에 호수처럼 반영 복제',
                        },
                        {
                          id: 'bottom-to-top',
                          title: '하단 반사 (Bottom ➔ Top)',
                          desc: '아래쪽 절반을 위쪽에 거울 대칭 복제',
                        },
                        {
                          id: 'quad',
                          title: '4방향 십자 만화경 (Quad Kaleidoscope)',
                          desc: '좌상단 1/4을 4방향으로 대칭 회전',
                        },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          variant={mirrorMode === item.id ? 'contained' : 'outlined'}
                          color={mirrorMode === item.id ? 'primary' : 'inherit'}
                          onClick={() => setMirrorMode(item.id as MirrorMode)}
                          sx={{
                            p: 1.5,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {item.desc}
                          </Typography>
                        </Button>
                      ))}
                    </Box>
                  </Card>

                  {/* Action Buttons (AI 배경 제거 스타일) */}
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
                      onClick={handleClearMirrorImage}
                      startIcon={<RefreshRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      다른 사진
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadMirror}
                      disabled={!mirrorResultUrl}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                    >
                      저장
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={handleShareMirror}
                      disabled={!mirrorResultUrl}
                      startIcon={<ShareRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      공유
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </DashboardContent>
  );
}
