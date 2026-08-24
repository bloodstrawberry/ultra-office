'use client';

import { toast } from 'sonner';
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
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import {
  formatBytes,
  downloadDataUrl,
  convertImageFormat,
  type SupportedFormat,
  calculateDataUrlByteSize,
} from '../utils/image-processor';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

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
    setItems((prev) => prev.filter((it) => it.id !== id));
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
            <TransformRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            확장자를 변경할 이미지들을 업로드하세요
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            다중 선택으로 여러 장의 사진을 한 번에 변환할 수 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
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
          {/* Left: Files List */}
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
                  변환 대상 목록 ({items.length}개)
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, width: 24 }}>
                        #{idx + 1}
                      </Typography>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
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
                          {item.file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatBytes(item.origSize)} →{' '}
                          <span style={{ color: '#3b82f6', fontWeight: 800 }}>
                            {targetFormat.toUpperCase()} ({formatBytes(item.resultSize)})
                          </span>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.status === 'processing' && <CircularProgress size={18} />}
                      {item.status === 'done' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownloadSingle(item)}
                        >
                          <DownloadRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
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
              gap: 2,
              minHeight: 0,
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Target Format Selector */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                1. 변환할 목표 확장자 선택
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2.5 }}>
                {FORMAT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    size="small"
                    variant={targetFormat === opt.id ? 'contained' : 'outlined'}
                    color={targetFormat === opt.id ? 'primary' : 'inherit'}
                    onClick={() => reprocessAll(opt.id)}
                    sx={{
                      borderRadius: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      py: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }} noWrap>
                      {opt.desc}
                    </Typography>
                  </Button>
                ))}
              </Box>

              {/* Quality Slider (for JPG/WebP/AVIF) */}
              {(targetFormat === 'jpg' || targetFormat === 'webp' || targetFormat === 'avif') && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      변환 화질 (Quality)
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
                    onChangeCommitted={() => reprocessAll(targetFormat)}
                  />
                </Box>
              )}

              {/* ICO Size Preset */}
              {targetFormat === 'ico' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
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
                disabled={isProcessing || items.filter((it) => it.status === 'done').length === 0}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArchiveRoundedIcon />
                  )
                }
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                전체 일괄 변환(ZIP) 다운로드
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                + 이미지 추가하기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => setItems([])}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                전체 삭제
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
