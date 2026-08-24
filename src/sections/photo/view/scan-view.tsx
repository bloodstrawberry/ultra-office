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

  // Scan Configurations
  const [config, setConfig] = useState<ScanConfig>(DEFAULT_SCAN_CONFIG);
  const [viewMode, setViewMode] = useState<'split' | 'scanned' | 'original'>('scanned');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        pb: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          스캔 효과 & 문서 스캐너 (Document Scanner)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          일반 스마트폰 촬영 사진이나 문서를 평판 스캐너 및 사무용 복사기로 스캔한 것처럼 깨끗하게
          보정하고 PDF로 내보냅니다.
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
            minHeight: 360,
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
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: 2.5,
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left: Preview Panel & Document List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {activeItem && (
              <Card sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    스캔 미리보기: {activeItem.file.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isProcessing && <CircularProgress size={18} />}

                    {/* View Mode Toggle */}
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
                    height: { xs: 320, sm: 440 },
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
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Card>
            )}

            {/* Document list strip */}
            <Card sx={{ p: 2, borderRadius: 3, flex: '1 1 auto', minHeight: 0 }}>
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
                  gap: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {items.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    sx={{
                      p: 1,
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
                          width: 42,
                          height: 42,
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
                        onClick={() => handleDownloadSingle(item)}
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

          {/* Right: Controls & Adjustments */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
            {/* 1. Presets */}
            <Card sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  1. 스캐너 프리셋 선택
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={handleResetConfig}
                  startIcon={<RestartAltRoundedIcon fontSize="small" />}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  기본값 복원
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 1.5 }}>
                {SCAN_PRESETS.map((pst) => {
                  const isSelected = config.preset === pst.id;
                  return (
                    <Box
                      key={pst.id}
                      onClick={() => handleSelectPreset(pst.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1.5px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Typography variant="h5" sx={{ flexShrink: 0 }}>
                        {pst.icon}
                      </Typography>
                      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: isSelected ? 'primary.dark' : 'text.primary',
                          }}
                        >
                          {pst.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {pst.desc}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>

            {/* 2. Fine-tuning Sliders */}
            <Card sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                2. 스캐너 세부 조절
              </Typography>

              {/* Contrast */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    명암 대비 (Contrast)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {config.contrast}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={-20}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, flexShrink: 0 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleExportPdf}
                disabled={isProcessing || isExportingPdf || items.length === 0}
                startIcon={<PictureAsPdfRoundedIcon />}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 800 }}
              >
                스캔 문서 PDF로 내보내기 (A4 {items.length}페이지)
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handleDownloadAllZip}
                disabled={isProcessing || items.length === 0}
                startIcon={<ArchiveRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                스캔 이미지 일괄 ZIP 다운로드
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
