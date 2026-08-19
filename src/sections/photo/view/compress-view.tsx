'use client';

import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { formatBytes, downloadDataUrl, calculateDataUrlByteSize } from '../utils/image-processor';

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
  const [format, setFormat] = useState<'original' | 'image/webp' | 'image/jpeg' | 'image/png'>(
    'image/webp'
  );
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState<number>(1920);
  const [comparePos, setComparePos] = useState<number>(50);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleDownloadSingle = async (item: CompressedItem) => {
    if (!item.compressedUrl) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/jpeg' ? 'jpg' : 'png';
    const name = item.file.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.compressedUrl, `compressed_${name}.${ext}`);
    toast.success(res.message);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.status === 'done' && it.compressedUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const ext = format === 'image/webp' ? 'webp' : format === 'image/jpeg' ? 'jpg' : 'png';
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `compressed_${it.file.name.replace(/\.[^/.]+$/, '')}.${ext}`,
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

  const activeItem = items[activeItemIndex] || items[0];

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          용량 압축 & 최적화 (Image Compressor)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          웹 최적화 WebP/JPEG/PNG 고효율 압축을 지원하며, Before/After 실시간 비교 및 일괄 ZIP
          다운로드를 제공합니다.
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
            minHeight: 320,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
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
            <CompressRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            압축할 이미지들을 업로드하세요
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            다중 선택으로 여러 장의 사진을 한 번에 압축할 수 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Compare Slider or List Preview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeItem && (
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
                    압축 비교 미리보기: {activeItem.file.name}
                  </Typography>
                  {activeItem.origSize && activeItem.compressedSize && (
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {formatBytes(activeItem.origSize)} → {formatBytes(activeItem.compressedSize)}{' '}
                      ({Math.round((1 - activeItem.compressedSize / activeItem.origSize) * 100)}%
                      절감)
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 280, sm: 380 },
                    bgcolor: '#0f172a',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Compressed (Under) */}
                  {activeItem.compressedUrl && (
                    <img
                      src={activeItem.compressedUrl}
                      alt="Compressed"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}

                  {/* Original (Clipped) */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      overflow: 'hidden',
                      width: `${comparePos}%`,
                      borderRight: '2px solid #ffffff',
                      boxShadow: '2px 0 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <img
                      src={activeItem.origUrl}
                      alt="Original"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        maxWidth: 'none',
                      }}
                    />
                  </Box>

                  {/* Split Handle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: `${comparePos}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 3,
                      fontSize: 10,
                      fontWeight: 800,
                      pointerEvents: 'none',
                    }}
                  >
                    ↔
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5, px: 1 }}>
                  <Slider
                    size="small"
                    min={0}
                    max={100}
                    value={comparePos}
                    onChange={(_, v) => setComparePos(v as number)}
                  />
                </Box>
              </Card>
            )}

            {/* List */}
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                압축 파일 목록 ({items.length}개)
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
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
                          width: 44,
                          height: 44,
                          borderRadius: 1,
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
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {item.file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.status === 'processing' && <CircularProgress size={16} />}
                      {item.status === 'done' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownloadSingle(item)}
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

          {/* Right: Compression Settings */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Format selection */}
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
                sx={{ mb: 2.5 }}
              >
                <ToggleButton value="image/webp">WebP (추천)</ToggleButton>
                <ToggleButton value="image/jpeg">JPEG</ToggleButton>
                <ToggleButton value="image/png">PNG</ToggleButton>
                <ToggleButton value="original">원본 유지</ToggleButton>
              </ToggleButtonGroup>

              {/* Quality Slider */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    압축 품질 (Quality)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
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
                />
              </Box>

              {/* Max Resolution */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    최대 해상도 (Max Width/Height)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
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
                />
              </Box>

              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                + 이미지 추가하기
              </Button>
            </Card>

            {/* Action Download Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.filter((it) => it.status === 'done').length === 0}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArchiveRoundedIcon />
                  )
                }
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
              >
                전체 일괄 압축(ZIP) 다운로드
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => setItems([])}
                sx={{ borderRadius: 2 }}
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
