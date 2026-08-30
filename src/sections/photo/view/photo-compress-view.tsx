'use client';

import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { PhotoUploadWorkspace, type SampleImageItem } from '../components/photo-upload-workspace';
import {
  formatBytes,
  downloadDataUrl,
  shareToKakaoTalk,
  calculateDataUrlByteSize,
} from '../utils/image-processor';

const COMPRESS_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-4k-nature',
    label: '🏔️ 4K 초고화질 자연 풍경',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2000&auto=format&fit=crop&q=100',
    subLabel: '대용량 풍경 사진',
  },
  {
    id: 'sample-portrait-raw',
    label: '👤 고해상도 인물 포트레이트',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=2000&auto=format&fit=crop&q=100',
    subLabel: '대용량 인물 사진',
  },
  {
    id: 'sample-city-night',
    label: '🌃 화려한 도심 야경 4K',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=2000&auto=format&fit=crop&q=100',
    subLabel: '노이즈 & 디테일 압축',
  },
];

interface CompressedItem {
  id: string;
  file: File;
  origSize: number;
  origUrl: string;
  compressedUrl?: string;
  compressedSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export function CompressView() {
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'original' | 'image/png' | 'image/jpeg' | 'image/webp'>(
    'original'
  );
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState<number>(1920);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const [listPanelHeight, setListPanelHeight] = useState<number>(180);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const isResizingListRef = useRef<boolean>(false);
  const resizeStartYRef = useRef<number>(0);
  const resizeStartHeightRef = useRef<number>(180);

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

  const handleListDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingListRef.current = true;
    resizeStartYRef.current = e.clientY;
    resizeStartHeightRef.current = listPanelHeight;
  };

  const handleListDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingListRef.current) return;
    const deltaY = resizeStartYRef.current - e.clientY;
    const newHeight = Math.max(90, Math.min(500, resizeStartHeightRef.current + deltaY));
    setListPanelHeight(newHeight);
  };

  const handleListDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingListRef.current) {
      isResizingListRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const addFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const newItems: CompressedItem[] = selectedFiles.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      origSize: f.size,
      origUrl: URL.createObjectURL(f),
      status: 'pending',
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

  useEffect(() => {
    const runCompression = async () => {
      const pendingItems = items.filter((it) => it.status === 'pending');
      if (pendingItems.length === 0) return;

      setIsProcessing(true);
      const updatedList = [...items];

      for (let i = 0; i < updatedList.length; i += 1) {
        const item = updatedList[i];
        if (item.status === 'pending') {
          item.status = 'processing';
          try {
            const options = {
              maxSizeMB: 10,
              maxWidthOrHeight,
              useWebWorker: true,
              initialQuality: quality / 100,
              fileType: format === 'original' ? item.file.type : format,
            };

            const compressedBlob: Blob = await imageCompression(item.file, options);
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(compressedBlob);
            });

            item.compressedUrl = dataUrl;
            item.compressedSize = calculateDataUrlByteSize(dataUrl);
            item.status = 'done';
          } catch {
            item.status = 'error';
          }
        }
      }

      setItems([...updatedList]);
      setIsProcessing(false);
    };

    runCompression();
  }, [items, quality, format, maxWidthOrHeight]);

  const recompressAll = () => {
    setItems((prev) => prev.map((it) => ({ ...it, status: 'pending' })));
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      if (activeItemIndex >= filtered.length) {
        setActiveItemIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const getItemExt = (item: CompressedItem) => {
    if (format === 'original') {
      const parts = item.file.name.split('.');
      return parts.length > 1 ? parts.pop()?.toLowerCase() || 'jpg' : 'jpg';
    }
    if (format === 'image/png') return 'png';
    if (format === 'image/jpeg') return 'jpg';
    return 'webp';
  };

  const handleDownloadSingle = async (item: CompressedItem) => {
    if (!item.compressedUrl) return;
    const ext = getItemExt(item);
    const name = item.file.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.compressedUrl, `compressed_${name}.${ext}`);
    toast.success(res.message);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.status === 'done' && it.compressedUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `compressed_${it.file.name.replace(/\.[^/.]+$/, '')}.${getItemExt(it)}`,
        data: it.compressedUrl!,
      }));

      await downloadZipFile(`compressed_images_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}개 파일이 압축(ZIP)되어 저장되었습니다.`);
    } catch {
      toast.error('ZIP 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    const active = items[activeItemIndex] || items[0];
    if (!active || !active.compressedUrl) {
      toast.error('공유할 압축 이미지가 없습니다.');
      return;
    }

    setIsProcessing(true);
    try {
      const ext = getItemExt(active);
      const name = active.file.name.replace(/\.[^/.]+$/, '');
      const res = await shareToKakaoTalk(
        active.compressedUrl,
        `사진 압축 결과 - ${active.file.name}`,
        `compressed_${name}.${ext}`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
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
          사진 용량 압축 (Image Compressor)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          화질 손실을 최소화하면서 사진 파일 용량을 대폭 줄입니다. 원본 포맷/PNG/JPEG/WebP 변환 및
          일괄 ZIP 다운로드를 제공합니다.
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
        <PhotoUploadWorkspace
          sampleImages={COMPRESS_SAMPLE_IMAGES}
          onSelectSample={async (sampleUrl) => {
            try {
              const res = await fetch(sampleUrl);
              const blob = await res.blob();
              const file = new File([blob], 'sample_highres_photo.jpg', {
                type: blob.type || 'image/jpeg',
              });
              addFiles([file]);
              toast.success('고화질 샘플 사진을 불러왔습니다.');
            } catch {
              toast.error('샘플 이미지를 로드하지 못했습니다.');
            }
          }}
          onFileSelect={(file) => addFiles([file])}
          title="압축할 이미지 업로드"
          subtitle="사진을 드래그하거나 다중 선택하여 일괄 압축하세요."
          icon={<CompressRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Original (Left) vs Compressed (Right) Stage & List Strip */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 0,
              pr: { md: 1 },
            }}
          >
            {activeItem && (
              <Card
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minHeight: 0,
                }}
              >
                {/* Top Information Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    flexShrink: 0,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {activeItem.file.name}
                    </Typography>
                    {activeItem.origSize && activeItem.compressedSize && (
                      <Chip
                        label={`${formatBytes(activeItem.origSize)} → ${formatBytes(activeItem.compressedSize)} (${Math.round(
                          (1 - activeItem.compressedSize / activeItem.origSize) * 100
                        )}% 절감)`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Viewport: Side-by-Side (좌우 나란히) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.5,
                    flex: '1 1 auto',
                    minHeight: 0,
                    height: '100%',
                  }}
                >
                  {/* Left: Uploaded Original Photo */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#0f172a',
                      borderRadius: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'divider',
                      minHeight: 0,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 0.75,
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 2,
                      }}
                    >
                      <Chip
                        label="업로드한 원본 사진"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          height: 22,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}
                      >
                        {formatBytes(activeItem.origSize)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: '1 1 auto',
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={activeItem.origUrl}
                        alt="Original"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 0,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Right: Compressed Preview */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#0f172a',
                      borderRadius: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      minHeight: 0,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 0.75,
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Chip
                          label="압축 미리보기"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                        />
                        {activeItem.origSize && activeItem.compressedSize && (
                          <Chip
                            label={`${Math.round(
                              (1 - activeItem.compressedSize / activeItem.origSize) * 100
                            )}% 절감`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}
                      >
                        {activeItem.compressedSize
                          ? formatBytes(activeItem.compressedSize)
                          : '압축 중...'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: '1 1 auto',
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {activeItem.status === 'processing' ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <CircularProgress color="primary" size={32} />
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            압축 처리 중...
                          </Typography>
                        </Box>
                      ) : activeItem.compressedUrl ? (
                        <img
                          src={activeItem.compressedUrl}
                          alt="Compressed Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#ef4444' }}>
                          압축 오류가 발생했습니다.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Draggable Horizontal Divider between Preview and List Strip */}
            <Box
              onPointerDown={handleListDividerPointerDown}
              onPointerMove={handleListDividerPointerMove}
              onPointerUp={handleListDividerPointerUp}
              sx={{
                display: 'flex',
                height: 12,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'row-resize',
                userSelect: 'none',
                touchAction: 'none',
                zIndex: 10,
                flexShrink: 0,
                position: 'relative',
                my: 0.25,
                '&:hover .divider-hbar, &:active .divider-hbar': {
                  bgcolor: 'primary.main',
                  height: '3px',
                },
                '&:hover .divider-hhandle, &:active .divider-hhandle': {
                  bgcolor: 'primary.main',
                  borderColor: 'primary.main',
                  '& > div > div': {
                    bgcolor: '#ffffff',
                  },
                },
              }}
            >
              {/* Horizontal Divider Line */}
              <Box
                className="divider-hbar"
                sx={{
                  width: '100%',
                  height: '2px',
                  bgcolor: 'divider',
                  borderRadius: '1px',
                  transition: 'all 0.15s ease',
                }}
              />
              {/* Horizontal Grab Handle */}
              <Box
                className="divider-hhandle"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 36,
                  height: 12,
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
                    height: 4,
                    width: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '& > div': {
                      height: 1.5,
                      width: '100%',
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

            {/* List Strip - Height Controlled by Draggable Divider */}
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                flexShrink: 0,
                height: `${listPanelHeight}px`,
                minHeight: `${listPanelHeight}px`,
                maxHeight: `${listPanelHeight}px`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.75,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  압축 파일 목록 ({items.length}개)
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.2 }}
                >
                  + 사진 추가
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6,
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'text.disabled' },
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: '6px 10px',
                      borderRadius: 1.5,
                      bgcolor: activeItemIndex === idx ? 'action.selected' : 'action.hover',
                      border: '1px solid',
                      borderColor: activeItemIndex === idx ? 'primary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 0,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.compressedUrl || item.origUrl}
                          alt="thumb"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, fontSize: '0.82rem' }}
                          noWrap
                        >
                          {item.file.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                        >
                          {formatBytes(item.origSize)}
                          {item.compressedSize && (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              {' '}
                              → {formatBytes(item.compressedSize)} (
                              {Math.round((1 - item.compressedSize / item.origSize) * 100)}% ↓)
                            </span>
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      {item.status === 'processing' && <CircularProgress size={16} />}
                      {item.status === 'done' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingle(item);
                          }}
                        >
                          <DownloadRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
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

          {/* Right: Compression Settings */}
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
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2, borderRadius: 2.5 }}>
              {/* Format selection in requested order: 원본 포맷, PNG, JPEG, WebP */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 변환 포맷
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={(_, v) => {
                  if (v) {
                    setFormat(v);
                    recompressAll();
                  }
                }}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="original">원본 포맷</ToggleButton>
                <ToggleButton value="image/png">PNG</ToggleButton>
                <ToggleButton value="image/jpeg">JPEG</ToggleButton>
                <ToggleButton value="image/webp">WebP</ToggleButton>
              </ToggleButtonGroup>

              {/* Quality Slider */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    압축 품질 (Quality)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}
                  >
                    {quality}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(_, v) => setQuality(v as number)}
                  onChangeCommitted={() => recompressAll()}
                  sx={{ py: 0.5 }}
                />
              </Box>

              {/* Max Resolution */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    최대 해상도 (Max Width/Height)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}
                  >
                    {maxWidthOrHeight}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={600}
                  max={3840}
                  step={100}
                  value={maxWidthOrHeight}
                  onChange={(_, v) => setMaxWidthOrHeight(v as number)}
                  onChangeCommitted={() => recompressAll()}
                  sx={{ py: 0.5 }}
                />
              </Box>
            </Card>

            {/* Action Buttons Column - Unified with Convert Studio */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 'auto',
                pt: 0.5,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.filter((it) => it.status === 'done').length === 0}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArchiveRoundedIcon />
                  )
                }
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: '0.9rem' }}
              >
                전체 일괄 압축(ZIP) 다운로드
              </Button>

              {activeItem && activeItem.status === 'done' && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => handleDownloadSingle(activeItem)}
                  startIcon={<DownloadRoundedIcon />}
                  sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.82rem' }}
                >
                  현재 사진 개별 저장
                </Button>
              )}

              {activeItem && activeItem.status === 'done' && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={handleShare}
                  startIcon={<ShareRoundedIcon />}
                  sx={{ py: 0.9, borderRadius: 1.5, fontWeight: 600, fontSize: '0.82rem' }}
                >
                  공유
                </Button>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setItems([])}
                startIcon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ py: 0.8, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
              >
                목록 비우기
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
