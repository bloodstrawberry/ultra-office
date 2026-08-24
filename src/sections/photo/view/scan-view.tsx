'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';
import { DashboardContent } from 'src/layouts/dashboard';
import { downloadDataUrl } from '../utils/image-processor';
import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import {
  SCAN_PRESETS,
  DEFAULT_SCAN_CONFIG,
  renderScanEffect,
  exportScannedImagesToPdf,
  downloadPdfBytes,
  type ScanConfig,
  type ScanPresetType,
} from '../utils/scanner-processor';

interface ScannedImageItem {
  id: string;
  file: File;
  origUrl: string;
  resultUrl?: string;
}

export function ScanView() {
  const [items, setItems] = useState<ScannedImageItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  // Scan Configurations
  const [config, setConfig] = useState<ScanConfig>(DEFAULT_SCAN_CONFIG);
  const [viewMode, setViewMode] = useState<'split' | 'scanned' | 'original'>('scanned');

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

    const newItems: ScannedImageItem[] = selectedFiles.map((f) => ({
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

  const handleSelectPreset = (presetId: ScanPresetType) => {
    const presetObj = SCAN_PRESETS.find((p) => p.id === presetId);
    if (!presetObj) return;

    setConfig((prev) => ({
      ...prev,
      preset: presetId,
      ...presetObj.defaultConfig,
    }));
  };

  const handleResetConfig = () => {
    handleSelectPreset('bw_document');
  };

  // Re-process all images when config or items change
  useEffect(() => {
    const processAll = async () => {
      if (items.length === 0) return;
      setIsProcessing(true);

      try {
        const updated = await Promise.all(
          items.map(async (item) => {
            const resUrl = await renderScanEffect(item.origUrl, config);
            return { ...item, resultUrl: resUrl };
          })
        );
        setItems(updated);
      } catch (err) {
        console.error('Scan render error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    const timer = setTimeout(() => {
      processAll();
    }, 150);
    return () => clearTimeout(timer);
  }, [items.length, config]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Downloads
  const handleDownloadSingle = async (item: ScannedImageItem) => {
    if (!item.resultUrl) return;
    const name = item.file.name.replace(/\.[^/.]+$/, '');
    const res = await downloadDataUrl(item.resultUrl, `scanned_${name}.jpg`);
    toast.success(res.message);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.resultUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((it) => ({
        filename: `scanned_${it.file.name.replace(/\.[^/.]+$/, '')}.jpg`,
        data: it.resultUrl!,
      }));

      await downloadZipFile(`scanned_batch_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}개 파일이 압축(ZIP)되어 저장되었습니다.`);
    } catch {
      toast.error('ZIP 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPdf = async () => {
    const readyUrls = items.map((it) => it.resultUrl || it.origUrl).filter(Boolean);
    if (readyUrls.length === 0) return;

    setIsExportingPdf(true);
    try {
      const pdfBytes = await exportScannedImagesToPdf(readyUrls, 'A4');
      downloadPdfBytes(pdfBytes, `scanned_document_${Date.now()}.pdf`);
      toast.success('스캔 PDF 문서가 생성되었습니다.');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('PDF 변환에 실패했습니다.');
    } finally {
      setIsExportingPdf(false);
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
          스캔 효과 · 문서 스캐너 (Scanner Effect & PDF)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          스마트폰으로 찍은 사진을 복합기에서 정밀 스캔한 것처럼 보정하고, 다중 페이지 PDF 및
          ZIP으로 일괄 변환합니다.
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
            <DocumentScannerRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            스캔할 문서나 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            스마트폰으로 촬영한 서류, 계약서, 영수증, 신분증, 필기 노트를 드래그해 놓으세요
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            문서 사진 선택하기
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
          {/* Left: Preview Panel & Document List */}
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
                    스캔 미리보기: {activeItem.file.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isProcessing && <CircularProgress size={18} />}
                    <ToggleButtonGroup
                      size="small"
                      value={viewMode}
                      exclusive
                      onChange={(_, v) => v && setViewMode(v)}
                    >
                      <ToggleButton
                        value="scanned"
                        sx={{ px: 1.2, py: 0.4, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        스캔 결과
                      </ToggleButton>
                      <ToggleButton
                        value="original"
                        sx={{ px: 1.2, py: 0.4, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        원본 사진
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
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
                    src={
                      viewMode === 'original'
                        ? activeItem.origUrl
                        : activeItem.resultUrl || activeItem.origUrl
                    }
                    alt="Scan Preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
              </Card>
            )}

            {/* Document list strip */}
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
                  스캔 대기 문서 ({items.length}장)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  + 문서 추가
                </Button>
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
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(item);
                        }}
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

          {/* Right: Controls & Adjustments */}
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
            {/* Presets Selector Card */}
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  스캔 프리셋 스타일
                </Typography>
                <Button
                  size="small"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={handleResetConfig}
                  sx={{ color: 'text.secondary' }}
                >
                  기본값 복원
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {SCAN_PRESETS.map((preset) => {
                  const isSelected = config.preset === preset.id;
                  return (
                    <Box
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                        border: '1.5px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: isSelected ? 'primary.main' : 'primary.light',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>{preset.icon}</Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: isSelected ? 'primary.dark' : 'text.primary',
                          }}
                        >
                          {preset.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          display: 'block',
                          lineHeight: 1.2,
                        }}
                      >
                        {preset.desc}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>

            {/* Detailed Sliders Card */}
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                정밀 스캔 파라미터 조절
              </Typography>

              {/* Contrast */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    대비 강조 (Contrast)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.contrast}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={80}
                  value={config.contrast}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, contrast: v as number }))}
                />
              </Box>

              {/* Brightness */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    밝기 (Brightness)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.brightness}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={-30}
                  max={40}
                  value={config.brightness}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, brightness: v as number }))}
                />
              </Box>

              {/* Paper Whitening */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    종이 배경 미백 (Paper Whitening)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.paperWhitening}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={config.paperWhitening}
                  onChange={(_, v) =>
                    setConfig((prev) => ({ ...prev, paperWhitening: v as number }))
                  }
                />
              </Box>

              {/* Scanner Noise */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    스캐너 노이즈 / 먼지 입자 (Noise)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.noise}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={40}
                  value={config.noise}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, noise: v as number }))}
                />
              </Box>

              {/* Skew Angle */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    미세 회전 비틀림 (Realistic Skew Angle)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.skewAngle}°
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={-2.0}
                  max={2.0}
                  step={0.1}
                  value={config.skewAngle}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, skewAngle: v as number }))}
                />
              </Box>

              {/* Edge Vignette */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    평판 스캐너 테두리 음영 (Bed Shadow)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.edgeVignette}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={60}
                  value={config.edgeVignette}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, edgeVignette: v as number }))}
                />
              </Box>

              {/* Optical Scanlines */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    광학 센서 주사선 (Scanlines)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.scanlines}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={50}
                  value={config.scanlines}
                  onChange={(_, v) => setConfig((prev) => ({ ...prev, scanlines: v as number }))}
                />
              </Box>
            </Card>

            {/* Actions: Export PDF & ZIP */}
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
                onClick={handleExportPdf}
                disabled={isProcessing || isExportingPdf || items.length === 0}
                startIcon={<PictureAsPdfRoundedIcon />}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                스캔 문서 PDF로 내보내기 (A4 {items.length}페이지)
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.length === 0}
                startIcon={<ArchiveRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                스캔 이미지 일괄 ZIP 다운로드
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => setItems([])}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
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
