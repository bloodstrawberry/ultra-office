'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { PhotoUploadWorkspace, type SampleImageItem } from '../components/photo-upload-workspace';
import {
  formatBytes,
  downloadDataUrl,
  shareToKakaoTalk,
  convertImageFormat,
  type SupportedFormat,
  calculateDataUrlByteSize,
} from '../utils/image-processor';

const CONVERT_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-transparent-png',
    label: '✨ 투명 배경 그래픽 & 아이콘 (PNG)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    subLabel: 'PNG ➜ WebP / JPG / ICO',
  },
  {
    id: 'sample-highres-jpg',
    label: '📸 고화질 자연 풍경 (JPG)',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    subLabel: 'JPG ➜ PNG / AVIF / WebP',
  },
  {
    id: 'sample-vector-art',
    label: '🎨 컬러 일러스트 아트 (PNG)',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
    subLabel: 'PNG ➜ ICO 파비콘 & BMP',
  },
];

interface ConvertedFileItem {
  id: string;
  file: File;
  origUrl: string;
  origSize: number;
  resultUrl?: string;
  resultSize?: number;
  width?: number;
  height?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

const FORMAT_OPTIONS: { id: SupportedFormat; label: string; desc: string }[] = [
  { id: 'png', label: 'PNG', desc: '투명도 지원 무손실 고화질' },
  { id: 'jpg', label: 'JPG', desc: '사진 표준 범용 포맷' },
  { id: 'webp', label: 'WebP', desc: '초고효율 차세대 웹 규격' },
  { id: 'avif', label: 'AVIF', desc: '최고 압축률 차세대 포맷' },
  { id: 'ico', label: 'ICO', desc: '웹 파비콘 & 윈도우 아이콘' },
  { id: 'bmp', label: 'BMP', desc: '비압축 비트맵' },
];

export function ConvertView() {
  const [items, setItems] = useState<ConvertedFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('png');
  const [quality, setQuality] = useState<number>(90);
  const [icoSize, setIcoSize] = useState<number>(64);
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

    const newItems: ConvertedFileItem[] = selectedFiles.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      origUrl: URL.createObjectURL(f),
      origSize: f.size,
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

  const processBatch = useCallback(async () => {
    const pendingItems = items.filter((it) => it.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    const updatedList = [...items];

    for (let i = 0; i < updatedList.length; i += 1) {
      const item = updatedList[i];
      if (item.status === 'pending') {
        item.status = 'processing';
        try {
          const res = await convertImageFormat(item.origUrl, {
            format: targetFormat,
            quality: quality / 100,
            icoSize,
          });

          item.resultUrl = res.dataUrl;
          item.resultSize = calculateDataUrlByteSize(res.dataUrl);
          item.width = res.width;
          item.height = res.height;
          item.status = 'done';
        } catch {
          item.status = 'error';
        }
      }
    }

    setItems([...updatedList]);
    setIsProcessing(false);
  }, [items, targetFormat, quality, icoSize]);

  useEffect(() => {
    processBatch();
  }, [items.length, targetFormat, quality, icoSize, processBatch]);

  const reprocessAll = (newFormat: SupportedFormat) => {
    setTargetFormat(newFormat);
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

  const handleDownloadSingle = async (item: ConvertedFileItem) => {
    if (!item.resultUrl) return;
    const baseName = item.file.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.resultUrl, `${baseName}.${targetFormat}`);
    toast.success(res.message);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.status === 'done' && it.resultUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `${it.file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}`,
        data: it.resultUrl!,
      }));

      await downloadZipFile(`converted_images_${targetFormat}_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}개 변환 파일이 압축(ZIP)되어 저장되었습니다.`);
    } catch {
      toast.error('ZIP 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    const active = items[activeItemIndex] || items[0];
    if (!active || !active.resultUrl) {
      toast.error('공유할 변환 이미지가 없습니다.');
      return;
    }

    setIsProcessing(true);
    try {
      const baseName = active.file.name.replace(/\.[^/.]+$/, '');
      const res = await shareToKakaoTalk(
        active.resultUrl,
        `사진 확장자 변환 결과 - ${active.file.name}`,
        `${baseName}.${targetFormat}`
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
          사진 확장자 포맷 변환기 (Format Converter)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PNG, JPG, WebP, AVIF, ICO(아이콘 파비콘), BMP 형식 간 상호 무손실/고화질 일괄 변환을
          지원합니다.
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
          sampleImages={CONVERT_SAMPLE_IMAGES}
          onSelectSample={async (sampleUrl) => {
            try {
              const res = await fetch(sampleUrl);
              const blob = await res.blob();
              const file = new File([blob], 'sample_convert_image.png', {
                type: blob.type || 'image/png',
              });
              addFiles([file]);
              toast.success('샘플 이미지를 불러왔습니다.');
            } catch {
              toast.error('샘플 이미지를 로드하지 못했습니다.');
            }
          }}
          onFileSelect={(file) => addFiles([file])}
          title="확장자를 변환할 이미지 업로드"
          subtitle="사진을 드래그하거나 다중 선택하여 PNG, JPG, WebP, AVIF, ICO로 변환하세요."
          icon={<TransformRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Original (Left) vs Converted (Right) Stage & List Strip */}
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
                    {activeItem.origSize && (
                      <Chip
                        label={`${formatBytes(activeItem.origSize)} → ${targetFormat.toUpperCase()} (${
                          activeItem.resultSize ? formatBytes(activeItem.resultSize) : '변환 중'
                        })`}
                        size="small"
                        color="primary"
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

                  {/* Right: Converted Preview */}
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
                      <Chip
                        label={`변환 미리보기 (${targetFormat.toUpperCase()})`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}
                      >
                        {activeItem.resultSize ? formatBytes(activeItem.resultSize) : '변환 중...'}
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
                            확장자 변환 처리 중...
                          </Typography>
                        </Box>
                      ) : activeItem.resultUrl ? (
                        <img
                          src={activeItem.resultUrl}
                          alt="Converted Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#ef4444' }}>
                          변환 오류가 발생했습니다.
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
                  변환 대상 목록 ({items.length}개)
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
                          src={item.resultUrl || item.origUrl}
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
                          {formatBytes(item.origSize)} →{' '}
                          <span style={{ color: '#3b82f6', fontWeight: 800 }}>
                            {targetFormat.toUpperCase()} ({formatBytes(item.resultSize)})
                          </span>
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

          {/* Right: Convert Options */}
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
              {/* Target Format Selector */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 변환할 목표 확장자 선택
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                {FORMAT_OPTIONS.map((opt) => (
                  <Tooltip key={opt.id} title={opt.desc} arrow placement="top">
                    <Button
                      size="medium"
                      variant={targetFormat === opt.id ? 'contained' : 'outlined'}
                      color={targetFormat === opt.id ? 'primary' : 'inherit'}
                      onClick={() => reprocessAll(opt.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        fontWeight: 800,
                        fontSize: '0.92rem',
                      }}
                    >
                      {opt.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>

              {/* Quality Slider (for JPG/WebP/AVIF) */}
              {(targetFormat === 'jpg' || targetFormat === 'webp' || targetFormat === 'avif') && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      변환 화질 (Quality)
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
                    onChangeCommitted={() => reprocessAll(targetFormat)}
                    sx={{ py: 0.5 }}
                  />
                </Box>
              )}

              {/* ICO Size Preset */}
              {targetFormat === 'ico' && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.75rem' }}
                  >
                    아이콘 해상도 (px)
                  </Typography>
                  <ToggleButtonGroup
                    value={icoSize}
                    exclusive
                    onChange={(_, v) => {
                      if (v) {
                        setIcoSize(v);
                        reprocessAll('ico');
                      }
                    }}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value={16}>16×16</ToggleButton>
                    <ToggleButton value={32}>32×32</ToggleButton>
                    <ToggleButton value={64}>64×64</ToggleButton>
                    <ToggleButton value={128}>128×128</ToggleButton>
                    <ToggleButton value={256}>256×256</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Card>

            {/* Action Buttons Column - Unified with Compressor */}
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
                전체 일괄 변환(ZIP) 다운로드
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
