'use client';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import CompareRoundedIcon from '@mui/icons-material/CompareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from '../components/photo-upload-workspace';
import {
  validateSvg,
  formatSvgCode,
  formatByteSize,
  convertImageToSvg,
  SAMPLE_SVG_PRESETS,
  SAMPLE_RASTER_IMAGES,
  renderSvgToRasterImage,
  type SvgConversionMode,
  type SvgRasterizeOptions,
} from '../utils/svg-processor';

// ----------------------------------------------------------------------

export function PhotoSvgView() {
  const [currentTab, setCurrentTab] = useState<'toSvg' | 'toImage'>('toSvg');

  // --------------------------------------------------------------------
  // Panel Resizing State (다른 스튜디오와 동일한 Desktop Divider)
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

  // ====================================================================
  // 1. Tab 1: Image to SVG State
  // ====================================================================
  const [rasterImageFile, setRasterImageFile] = useState<File | null>(null);
  const [rasterImageUrl, setRasterImageUrl] = useState<string | null>(null);
  const [rasterDimensions, setRasterDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [rasterByteSize, setRasterByteSize] = useState<number>(0);

  // SVG 생성 파라미터
  const [svgMode, setSvgMode] = useState<SvgConversionMode>('color');
  const [colorCount, setColorCount] = useState<number>(8);
  const [threshold, setThreshold] = useState<number>(128);
  const [pixelSize, setPixelSize] = useState<number>(6);
  const [invertBw, setInvertBw] = useState<boolean>(false);
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(true);

  // 생성된 원본 SVG 및 사용자가 직접 수정한 편집본 SVG
  const [generatedSvg, setGeneratedSvg] = useState<string>('');
  const [userEditedSvg, setUserEditedSvg] = useState<string>('');
  const [isConvertingToSvg, setIsConvertingToSvg] = useState<boolean>(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);
  const [showSvgCodeEditor, setShowSvgCodeEditor] = useState<boolean>(false);
  const [toSvgZoom, setToSvgZoom] = useState<number>(100);
  const [fullscreenCodeModalOpen, setFullscreenCodeModalOpen] = useState<boolean>(false);

  // ====================================================================
  // 2. Tab 2: SVG to Image State
  // ====================================================================
  const [svgInputCode, setSvgInputCode] = useState<string>('');
  const [svgInputFileName, setSvgInputFileName] = useState<string>('vector-graphic.svg');
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [renderedDimensions, setRenderedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [renderedByteSize, setRenderedByteSize] = useState<number>(0);
  const [isRenderingImage, setIsRenderingImage] = useState<boolean>(false);
  const [svgError, setSvgError] = useState<string | null>(null);

  // 래스터화 옵션
  const [rasterScale, setRasterScale] = useState<number>(2);
  const [rasterFormat, setRasterFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [rasterBgColor, setRasterBgColor] = useState<string>('transparent');
  const [toImageZoom, setToImageZoom] = useState<number>(100);
  const [showTab2CodeEditor, setShowTab2CodeEditor] = useState<boolean>(true);

  // 모달: SVG 코드 직접 붙여넣기 모달
  const [pasteModalOpen, setPasteModalOpen] = useState<boolean>(false);
  const [pasteBuffer, setPasteBuffer] = useState<string>('');

  // --------------------------------------------------------------------
  // 파일 인풋 참조
  // --------------------------------------------------------------------
  const rasterFileInputRef = useRef<HTMLInputElement>(null);
  const svgFileInputRef = useRef<HTMLInputElement>(null);

  // ====================================================================
  // 공통 드롭 & 파일 로드 핸들러
  // ====================================================================
  const handleIncomingFile = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.svg') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setSvgInputCode(content);
          setSvgInputFileName(file.name);
          setCurrentTab('toImage');
          toast.success(`SVG 파일이 로드되었습니다 (${file.name})`);
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      setRasterImageFile(file);
      setRasterByteSize(file.size);
      const url = URL.createObjectURL(file);
      setRasterImageUrl(url);

      const img = new Image();
      img.onload = () => {
        setRasterDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;

      setCurrentTab('toSvg');
      toast.success(`이미지가 로드되었습니다 (${file.name})`);
    } else {
      toast.error('지원하지 않는 파일 형식입니다. 이미지(PNG/JPG) 또는 SVG 파일을 올려주세요.');
    }
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        handleIncomingFile(files[0]);
      }
    },
  });

  // ====================================================================
  // Tab 1: 이미지 ➜ SVG 변환 실행
  // ====================================================================
  const runImageToSvgConversion = useCallback(async () => {
    if (!rasterImageUrl) return;

    setIsConvertingToSvg(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
        img.src = rasterImageUrl;
      });

      const svgString = await convertImageToSvg(img, {
        mode: svgMode,
        colorCount,
        threshold,
        pixelSize,
        invert: invertBw,
        removeWhiteBg,
      });

      setGeneratedSvg(svgString);
      setUserEditedSvg(svgString);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SVG 변환 중 에러 발생';
      toast.error(msg);
    } finally {
      setIsConvertingToSvg(false);
    }
  }, [rasterImageUrl, svgMode, colorCount, threshold, pixelSize, invertBw, removeWhiteBg]);

  // 설정값 변경 시 디바운스 변환 실행
  useEffect(() => {
    if (!rasterImageUrl) return undefined;
    const timer = setTimeout(() => {
      runImageToSvgConversion();
    }, 250);

    return () => clearTimeout(timer);
  }, [runImageToSvgConversion, rasterImageUrl]);

  // 사용자가 현재 보고 있는 최종 SVG (수정본 우선)
  const currentActiveSvg = useMemo(
    () => userEditedSvg || generatedSvg,
    [userEditedSvg, generatedSvg]
  );

  // Tab 1용 SVG 다운로드
  const handleDownloadGeneratedSvg = useCallback(() => {
    if (!currentActiveSvg) return;
    const blob = new Blob([currentActiveSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = rasterImageFile?.name?.replace(/\.[^/.]+$/, '') || 'vectorized';
    link.href = url;
    link.download = `${baseName}_${svgMode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('SVG 파일이 다운로드되었습니다.');
  }, [currentActiveSvg, rasterImageFile, svgMode]);

  // 코드 클립보드 복사
  const handleCopySvgCode = useCallback((code: string) => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success('SVG 코드가 클립보드에 복사되었습니다.');
      })
      .catch(() => {
        toast.error('클립보드 복사에 실패했습니다.');
      });
  }, []);

  // 서식 정리 (Pretty format)
  const handleFormatSvgCodeTab1 = useCallback(() => {
    if (!userEditedSvg) return;
    const formatted = formatSvgCode(userEditedSvg);
    setUserEditedSvg(formatted);
    toast.info('SVG 코드 서식이 정렬되었습니다.');
  }, [userEditedSvg]);

  // ====================================================================
  // Tab 2: SVG ➜ 래스터 이미지 렌더링
  // ====================================================================
  const renderSvgImage = useCallback(async () => {
    if (!svgInputCode || !svgInputCode.trim()) {
      setRenderedImageUrl(null);
      setSvgError(null);
      return;
    }

    setIsRenderingImage(true);
    setSvgError(null);

    try {
      const validation = validateSvg(svgInputCode);
      if (!validation.isValid) {
        setSvgError(validation.error || '잘못된 SVG 형식입니다.');
        setIsRenderingImage(false);
        return;
      }

      const options: SvgRasterizeOptions = {
        scale: rasterScale,
        format: rasterFormat,
        backgroundColor: rasterBgColor,
        quality: 0.95,
      };

      const result = await renderSvgToRasterImage(svgInputCode, options);
      setRenderedImageUrl(result.dataUrl);
      setRenderedDimensions({ width: result.width, height: result.height });
      setRenderedByteSize(result.byteSize);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '이미지 렌더링 중 오류 발생';
      setSvgError(msg);
      setRenderedImageUrl(null);
    } finally {
      setIsRenderingImage(false);
    }
  }, [svgInputCode, rasterScale, rasterFormat, rasterBgColor]);

  useEffect(() => {
    if (!svgInputCode) return undefined;
    const timer = setTimeout(() => {
      renderSvgImage();
    }, 200);

    return () => clearTimeout(timer);
  }, [renderSvgImage, svgInputCode]);

  // 렌더링된 이미지 다운로드
  const handleDownloadRenderedImage = useCallback(() => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    const baseName = svgInputFileName.replace(/\.[^/.]+$/, '') || 'svg_render';
    const ext = rasterFormat === 'jpeg' ? 'jpg' : rasterFormat;
    link.href = renderedImageUrl;
    link.download = `${baseName}_${rasterScale}x.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${ext.toUpperCase()} 이미지가 다운로드되었습니다.`);
  }, [renderedImageUrl, svgInputFileName, rasterScale, rasterFormat]);

  // 클립보드로 이미지 복사
  const handleCopyImageToClipboard = useCallback(async () => {
    if (!renderedImageUrl) return;

    try {
      const res = await fetch(renderedImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success('이미지가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기 가능)');
    } catch {
      toast.error('클립보드 이미지 복사를 지원하지 않는 브라우저입니다. 다운로드를 이용해 주세요.');
    }
  }, [renderedImageUrl]);

  // 서식 정리 (Tab 2)
  const handleFormatSvgCodeTab2 = useCallback(() => {
    if (!svgInputCode) return;
    const formatted = formatSvgCode(svgInputCode);
    setSvgInputCode(formatted);
    toast.info('SVG 코드 서식이 정렬되었습니다.');
  }, [svgInputCode]);

  // 프리셋 로드
  const handleLoadSvgPreset = useCallback((preset: (typeof SAMPLE_SVG_PRESETS)[0]) => {
    setSvgInputCode(preset.svgCode);
    setSvgInputFileName(`${preset.id}.svg`);
    setCurrentTab('toImage');
    toast.success(`프리셋 "${preset.title}"이 로드되었습니다.`);
  }, []);

  // 모달 붙여넣기 적용
  const handleApplyPastedSvg = useCallback(() => {
    if (!pasteBuffer.trim()) {
      toast.error('SVG 코드를 입력해 주세요.');
      return;
    }
    setSvgInputCode(pasteBuffer.trim());
    setSvgInputFileName('pasted-vector.svg');
    setPasteModalOpen(false);
    setCurrentTab('toImage');
    toast.success('SVG 코드가 적용되어 이미지가 렌더링되었습니다!');
  }, [pasteBuffer]);

  // SVG 바이트 크기
  const currentActiveSvgByteSize = useMemo(() => {
    if (!currentActiveSvg) return 0;
    return new Blob([currentActiveSvg]).size;
  }, [currentActiveSvg]);

  // ====================================================================
  // Render
  // ====================================================================
  return (
    <DashboardContent>
      {/* 1. Header (다른 스튜디오들과 완벽 통일) */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            SVG 변환 스튜디오 (SVG Studio)
          </Typography>
          <Chip label="NEW" size="small" color="primary" sx={{ fontWeight: 700, height: 22 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          일반 이미지를 벡터 SVG로 자동 변환하거나, SVG 파일 및 코드를 업로드하여 고화질 이미지로
          렌더링하고 SVG 소스 코드를 실시간으로 직접 확인 및 수정할 수 있습니다.
        </Typography>
      </Box>

      {/* 숨겨진 파일 인풋 */}
      <input
        ref={rasterFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/bmp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleIncomingFile(file);
            e.target.value = '';
          }
        }}
        style={{ display: 'none' }}
      />
      <input
        ref={svgFileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleIncomingFile(file);
            e.target.value = '';
          }
        }}
        style={{ display: 'none' }}
      />

      {/* 2. Tabs Navigation */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. 이미지 ➜ SVG 벡터 변환 (Raster to Vector)"
            value="toSvg"
            icon={<ImageRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. SVG ➜ 이미지 변환 & 코드 에디터 (SVG to Image)"
            value="toImage"
            icon={<CodeRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Main Workspace Area */}
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
        {/* TAB 1: 이미지 ➜ SVG 벡터 변환                                     */}
        {/* ================================================================= */}
        {currentTab === 'toSvg' && (
          <>
            {!rasterImageUrl ? (
              <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 500 }}>
                <PhotoUploadWorkspace
                  sampleImages={SAMPLE_RASTER_IMAGES.map((s) => ({
                    id: s.id,
                    label: s.label,
                    url: s.url,
                    subLabel: s.subLabel,
                  }))}
                  onSelectSample={async (sampleUrl) => {
                    try {
                      const res = await fetch(sampleUrl);
                      const blob = await res.blob();
                      const file = new File([blob], 'sample_vector_image.png', {
                        type: 'image/png',
                      });
                      handleIncomingFile(file);
                    } catch {
                      setRasterImageUrl(sampleUrl);
                      setRasterByteSize(150000);
                      toast.info('샘플 이미지를 불러왔습니다.');
                    }
                  }}
                  onFileSelect={(file) => handleIncomingFile(file)}
                  title="벡터(SVG)로 변환할 사진을 업로드하세요"
                  subtitle="사진을 드래그하거나 클릭하여 선택하세요. (Ctrl+V 클립보드 지원)"
                  icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 44, color: 'primary.main' }} />}
                />
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
                {/* Left: Viewport Area & Collapsible SVG Code Editor */}
                <Box
                  sx={{
                    flex: '1 1 0px',
                    minWidth: 0,
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pr: { lg: 1.5 },
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
                    {/* Top Stats & Toolbar */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`원본: ${rasterDimensions.width} × ${rasterDimensions.height} px (${formatByteSize(rasterByteSize)})`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          label={`SVG 크기: ${formatByteSize(currentActiveSvgByteSize)}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                        {isConvertingToSvg && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CircularProgress size={16} />
                            <Typography
                              variant="caption"
                              sx={{ color: 'primary.main', fontWeight: 600 }}
                            >
                              벡터화 중...
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Viewport Toolbar Buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant={showOriginalComparison ? 'contained' : 'outlined'}
                          color={showOriginalComparison ? 'secondary' : 'inherit'}
                          startIcon={<CompareRoundedIcon />}
                          onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                          sx={{
                            borderRadius: 1.5,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {showOriginalComparison ? '변환 SVG 보기' : '원본 비교'}
                        </Button>
                        <Button
                          size="small"
                          variant={showSvgCodeEditor ? 'contained' : 'outlined'}
                          color={showSvgCodeEditor ? 'primary' : 'inherit'}
                          startIcon={<CodeRoundedIcon />}
                          onClick={() => setShowSvgCodeEditor(!showSvgCodeEditor)}
                          sx={{
                            borderRadius: 1.5,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {showSvgCodeEditor ? '코드 에디터 닫기' : 'SVG 코드 보기 & 수정'}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => setToSvgZoom((prev) => Math.max(25, prev - 25))}
                        >
                          <ZoomOutRoundedIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}
                        >
                          {toSvgZoom}%
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setToSvgZoom((prev) => Math.min(300, prev + 25))}
                        >
                          <ZoomInRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setToSvgZoom(100)}
                          title="줌 초기화"
                        >
                          <RestartAltRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Viewport: SVG Graphic Output Canvas */}
                    <Box
                      sx={{
                        flex: showSvgCodeEditor ? '1 1 50%' : '1 1 auto',
                        minHeight: 180,
                        borderRadius: 2,
                        overflow: 'auto',
                        bgcolor: '#f8fafc',
                        backgroundImage: `
                          linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                          linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                          linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        position: 'relative',
                      }}
                    >
                      {showOriginalComparison ? (
                        <Box
                          component="img"
                          src={rasterImageUrl}
                          alt="Original"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `scale(${toSvgZoom / 100})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.15s ease-out',
                            boxShadow: 3,
                            borderRadius: 1,
                          }}
                        />
                      ) : currentActiveSvg ? (
                        <Box
                          sx={{
                            transform: `scale(${toSvgZoom / 100})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.15s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))',
                            '& svg': {
                              maxWidth: '100%',
                              maxHeight: '100%',
                              display: 'block',
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: currentActiveSvg }}
                        />
                      ) : (
                        <CircularProgress />
                      )}
                    </Box>

                    {/* User Editable SVG Code Panel (사용자 요청: SVG는 코드 보기 해서 수정가능하게 해줘) */}
                    {showSvgCodeEditor && (
                      <Box
                        sx={{
                          flex: '1 1 50%',
                          minHeight: 140,
                          mt: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            py: 0.75,
                            px: 1.5,
                            bgcolor: 'background.neutral',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <CodeRoundedIcon sx={{ fontSize: 16 }} />
                            SVG 실시간 코드 수정 (수정 시 상단 이미지가 즉시 업데이트됩니다)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<FormatAlignLeftRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={handleFormatSvgCodeTab1}
                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                            >
                              서식 정리
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<RestartAltRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => {
                                setUserEditedSvg(generatedSvg);
                                toast.info('초기 생성 코드로 복구되었습니다.');
                              }}
                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                            >
                              되돌리기
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleCopySvgCode(currentActiveSvg)}
                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                            >
                              복사
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => setFullscreenCodeModalOpen(true)}
                              title="코드 전체화면으로 편집"
                            >
                              <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                        <TextField
                          multiline
                          fullWidth
                          value={userEditedSvg}
                          onChange={(e) => setUserEditedSvg(e.target.value)}
                          placeholder="<svg ...> ... </svg>"
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              p: 1.5,
                              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                              fontSize: '0.8rem',
                              lineHeight: 1.5,
                              height: '100%',
                              alignItems: 'flex-start',
                              overflowY: 'auto',
                            },
                          }}
                          sx={{ flex: '1 1 auto', minHeight: 0 }}
                        />
                      </Box>
                    )}

                    {/* Bottom Action Buttons */}
                    <Box
                      sx={{
                        pt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon />}
                          onClick={() => handleCopySvgCode(currentActiveSvg)}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          SVG 코드 복사
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => {
                            setRasterImageUrl(null);
                            setRasterImageFile(null);
                            setGeneratedSvg('');
                            setUserEditedSvg('');
                          }}
                          sx={{ borderRadius: 1.5 }}
                        >
                          다른 사진 선택
                        </Button>
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadGeneratedSvg}
                        disabled={!currentActiveSvg || isConvertingToSvg}
                        sx={{ borderRadius: 1.5, fontWeight: 800 }}
                      >
                        SVG 다운로드 (.svg)
                      </Button>
                    </Box>
                  </Card>
                </Box>

                {/* Desktop Resizer Divider (다른 스튜디오들과 완벽 통일) */}
                <Box
                  onPointerDown={handleDividerPointerDown}
                  onPointerMove={handleDividerPointerMove}
                  onPointerUp={handleDividerPointerUp}
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    width: 12,
                    cursor: 'col-resize',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none',
                    userSelect: 'none',
                    zIndex: 10,
                    '&:hover .divider-bar, &:active .divider-bar': {
                      bgcolor: 'primary.main',
                      transform: 'scaleX(1.8)',
                    },
                  }}
                >
                  <Box
                    className="divider-bar"
                    sx={{
                      width: 4,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'divider',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </Box>

                {/* Right: Settings Control Panel */}
                <Box
                  sx={{
                    width: { xs: '100%', lg: rightPanelWidth },
                    flexShrink: 0,
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5,
                      height: '100%',
                      overflowY: 'auto',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TuneRoundedIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        벡터 변환 옵션
                      </Typography>
                    </Box>

                    {/* Mode Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        변환 알고리즘 모드
                      </Typography>
                      <ToggleButtonGroup
                        value={svgMode}
                        exclusive
                        onChange={(_, val) => val && setSvgMode(val)}
                        size="small"
                        fullWidth
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 0.5,
                          '& .MuiToggleButton-root': {
                            borderRadius: '8px !important',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            py: 1,
                            '&.Mui-selected': {
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ToggleButton value="color">🎨 컬러 벡터</ToggleButton>
                        <ToggleButton value="bw">🖋️ 흑백 트레이스</ToggleButton>
                        <ToggleButton value="pixel">👾 픽셀 아트</ToggleButton>
                        <ToggleButton value="embed">📦 무손실 래퍼</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Mode Parameters */}
                    {svgMode === 'color' && (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            색상 레이어 수 (Palette)
                          </Typography>
                          <Chip
                            label={`${colorCount} 색상`}
                            size="small"
                            color="primary"
                            sx={{ height: 22, fontWeight: 700 }}
                          />
                        </Box>
                        <Slider
                          value={colorCount}
                          min={2}
                          max={24}
                          step={2}
                          marks={[
                            { value: 2, label: '2' },
                            { value: 8, label: '8' },
                            { value: 16, label: '16' },
                            { value: 24, label: '24' },
                          ]}
                          onChange={(_, val) => setColorCount(val as number)}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                        >
                          색상 수가 많을수록 원본과 유사하며, 적을수록 심플한 일러스트 벡터가
                          됩니다.
                        </Typography>
                      </Box>
                    )}

                    {svgMode === 'bw' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              명도 임계값 (Threshold)
                            </Typography>
                            <Chip
                              label={threshold}
                              size="small"
                              color="primary"
                              sx={{ height: 22, fontWeight: 700 }}
                            />
                          </Box>
                          <Slider
                            value={threshold}
                            min={20}
                            max={235}
                            step={5}
                            onChange={(_, val) => setThreshold(val as number)}
                          />
                        </Box>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={invertBw}
                              onChange={(e) => setInvertBw(e.target.checked)}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              흑백 반전 (Invert)
                            </Typography>
                          }
                        />
                      </Box>
                    )}

                    {svgMode === 'pixel' && (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            픽셀 그리드 크기
                          </Typography>
                          <Chip
                            label={`${pixelSize} px`}
                            size="small"
                            color="primary"
                            sx={{ height: 22, fontWeight: 700 }}
                          />
                        </Box>
                        <Slider
                          value={pixelSize}
                          min={2}
                          max={18}
                          step={2}
                          marks={[
                            { value: 2, label: '2px' },
                            { value: 6, label: '6px' },
                            { value: 12, label: '12px' },
                            { value: 18, label: '18px' },
                          ]}
                          onChange={(_, val) => setPixelSize(val as number)}
                        />
                      </Box>
                    )}

                    {svgMode === 'embed' && (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                          무손실 SVG 래퍼
                        </Typography>
                        원본 이미지를 100% 무손실로 래핑하여 어디서든 깨지지 않는 SVG 규격으로
                        변환합니다.
                      </Alert>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={removeWhiteBg}
                          onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          배경 흰색 투명화
                        </Typography>
                      }
                    />

                    {/* Quick Preset Selector for Tab 1 */}
                    <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        다른 샘플로 테스트하기
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {SAMPLE_RASTER_IMAGES.map((sample) => (
                          <Button
                            key={sample.id}
                            variant="outlined"
                            size="small"
                            onClick={async () => {
                              try {
                                const res = await fetch(sample.url);
                                const blob = await res.blob();
                                const file = new File([blob], `${sample.label}.png`, {
                                  type: 'image/png',
                                });
                                handleIncomingFile(file);
                              } catch {
                                setRasterImageUrl(sample.url);
                                setRasterByteSize(150000);
                                toast.info('샘플 이미지를 로드했습니다.');
                              }
                            }}
                            sx={{
                              justifyContent: 'flex-start',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: 0.75,
                            }}
                          >
                            {sample.label}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SVG ➜ 이미지 변환 & 실시간 에디터 (SVG to Image)          */}
        {/* ================================================================= */}
        {currentTab === 'toImage' && (
          <>
            {!svgInputCode ? (
              <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 500 }}>
                {/* SVG 전용 업로드 워크스페이스 (다른 스튜디오와 동일 통일감) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      ⚡ 즉석 테스트 샘플 SVG 프리셋
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ContentPasteRoundedIcon />}
                      onClick={() => {
                        setPasteBuffer('');
                        setPasteModalOpen(true);
                      }}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      SVG 코드 직접 붙여넣기
                    </Button>
                  </Box>

                  {/* 프리셋 카드 그리드 */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                      gap: 2,
                    }}
                  >
                    {SAMPLE_SVG_PRESETS.map((preset) => (
                      <Card
                        key={preset.id}
                        onClick={() => handleLoadSvgPreset(preset)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[8],
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 120,
                            borderRadius: 1.5,
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1.5,
                            '& svg': {
                              maxWidth: '100%',
                              maxHeight: '100%',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))',
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: preset.svgCode }}
                        />
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {preset.title}
                            </Typography>
                            <Chip
                              label={preset.category}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {preset.description}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
                  </Box>

                  {/* 업로드 드롭존 */}
                  <Box
                    onClick={() => svgFileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'divider',
                      bgcolor: isDragActive ? 'primary.lighter' : 'background.neutral',
                      borderRadius: 3,
                      p: { xs: 3, sm: 4 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: '1 1 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                      }}
                    >
                      <CodeRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                      SVG 파일(.svg)을 업로드하거나 코드를 입력하세요
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      업로드 즉시 화면에 고해상도 이미지가 출력되며, 코드를 자유롭게 수정할 수
                      있습니다.
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      컴퓨터에서 SVG 선택
                    </Button>
                  </Box>
                </Box>
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
                {/* Left: Rendered Image Viewport & Live Code Editor */}
                <Box
                  sx={{
                    flex: '1 1 0px',
                    minWidth: 0,
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pr: { lg: 1.5 },
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
                    {/* Top Stats Bar */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`렌더링 해상도: ${renderedDimensions.width} × ${renderedDimensions.height} px (${rasterScale}x)`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          label={`출력 포맷: ${rasterFormat.toUpperCase()} (${formatByteSize(renderedByteSize)})`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        {isRenderingImage && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CircularProgress size={16} />
                            <Typography
                              variant="caption"
                              sx={{ color: 'primary.main', fontWeight: 600 }}
                            >
                              이미지 렌더링 중...
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Zoom & Code Toggle Buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant={showTab2CodeEditor ? 'contained' : 'outlined'}
                          color={showTab2CodeEditor ? 'primary' : 'inherit'}
                          startIcon={<CodeRoundedIcon />}
                          onClick={() => setShowTab2CodeEditor(!showTab2CodeEditor)}
                          sx={{
                            borderRadius: 1.5,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {showTab2CodeEditor ? '코드 에디터 접기' : 'SVG 코드 실시간 편집'}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => setToImageZoom((prev) => Math.max(25, prev - 25))}
                        >
                          <ZoomOutRoundedIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}
                        >
                          {toImageZoom}%
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setToImageZoom((prev) => Math.min(300, prev + 25))}
                        >
                          <ZoomInRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setToImageZoom(100)}>
                          <RestartAltRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* SVG Error Alert */}
                    {svgError && (
                      <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                        {svgError}
                      </Alert>
                    )}

                    {/* Viewport: Live Rendered Raster Image (사용자 요청: svg 올리면 이미지가 나오도록) */}
                    <Box
                      sx={{
                        flex: showTab2CodeEditor ? '1 1 50%' : '1 1 auto',
                        minHeight: 180,
                        borderRadius: 2,
                        overflow: 'auto',
                        bgcolor: '#f8fafc',
                        backgroundImage:
                          rasterBgColor === 'transparent'
                            ? `
                              linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                              linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                              linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                            `
                            : 'none',
                        backgroundColor:
                          rasterBgColor !== 'transparent' ? rasterBgColor : undefined,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        position: 'relative',
                      }}
                    >
                      {renderedImageUrl ? (
                        <Box
                          component="img"
                          src={renderedImageUrl}
                          alt="Rendered from SVG"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `scale(${toImageZoom / 100})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.15s ease-out',
                            boxShadow: 3,
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          <CircularProgress size={32} sx={{ mb: 1 }} />
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            SVG를 이미지로 렌더링하고 있습니다...
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Collapsible & Editable Live SVG Code Editor (사용자 요청: SVG는 코드 보기 해서 수정가능하게 해줘) */}
                    {showTab2CodeEditor && (
                      <Box
                        sx={{
                          flex: '1 1 50%',
                          minHeight: 140,
                          mt: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            py: 0.75,
                            px: 1.5,
                            bgcolor: 'background.neutral',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <CodeRoundedIcon sx={{ fontSize: 16 }} />⚡ SVG 코드 실시간 편집기 (코드
                            수정 시 화면의 이미지가 즉시 업데이트됩니다)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<FormatAlignLeftRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={handleFormatSvgCodeTab2}
                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                            >
                              서식 정리
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleCopySvgCode(svgInputCode)}
                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                            >
                              복사
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => setFullscreenCodeModalOpen(true)}
                              title="코드 전체화면으로 편집"
                            >
                              <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                        <TextField
                          multiline
                          fullWidth
                          value={svgInputCode}
                          onChange={(e) => setSvgInputCode(e.target.value)}
                          placeholder="<svg ...> ... </svg>"
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              p: 1.5,
                              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                              fontSize: '0.8rem',
                              lineHeight: 1.5,
                              height: '100%',
                              alignItems: 'flex-start',
                              overflowY: 'auto',
                            },
                          }}
                          sx={{ flex: '1 1 auto', minHeight: 0 }}
                        />
                      </Box>
                    )}

                    {/* Bottom Action Footer */}
                    <Box
                      sx={{
                        pt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon />}
                          onClick={handleCopyImageToClipboard}
                          disabled={!renderedImageUrl}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          클립보드 이미지 복사
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => {
                            setSvgInputCode('');
                            setRenderedImageUrl(null);
                          }}
                          sx={{ borderRadius: 1.5 }}
                        >
                          새 SVG 열기
                        </Button>
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadRenderedImage}
                        disabled={!renderedImageUrl || isRenderingImage}
                        sx={{ borderRadius: 1.5, fontWeight: 800 }}
                      >
                        {rasterFormat.toUpperCase()} 이미지 다운로드
                      </Button>
                    </Box>
                  </Card>
                </Box>

                {/* Desktop Resizer Divider */}
                <Box
                  onPointerDown={handleDividerPointerDown}
                  onPointerMove={handleDividerPointerMove}
                  onPointerUp={handleDividerPointerUp}
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    width: 12,
                    cursor: 'col-resize',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none',
                    userSelect: 'none',
                    zIndex: 10,
                    '&:hover .divider-bar, &:active .divider-bar': {
                      bgcolor: 'primary.main',
                      transform: 'scaleX(1.8)',
                    },
                  }}
                >
                  <Box
                    className="divider-bar"
                    sx={{
                      width: 4,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'divider',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </Box>

                {/* Right: Output Controls Panel */}
                <Box
                  sx={{
                    width: { xs: '100%', lg: rightPanelWidth },
                    flexShrink: 0,
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5,
                      height: '100%',
                      overflowY: 'auto',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageRoundedIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        이미지 출력 설정
                      </Typography>
                    </Box>

                    {/* Scale Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        해상도 배율 (Scale)
                      </Typography>
                      <ToggleButtonGroup
                        value={rasterScale}
                        exclusive
                        onChange={(_, val) => val && setRasterScale(val)}
                        size="small"
                        fullWidth
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: 0.5,
                          '& .MuiToggleButton-root': {
                            borderRadius: '8px !important',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            py: 1,
                            '&.Mui-selected': {
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ToggleButton value={1}>1x</ToggleButton>
                        <ToggleButton value={2}>2x</ToggleButton>
                        <ToggleButton value={4}>4x (HD)</ToggleButton>
                        <ToggleButton value={8}>8x (UHD)</ToggleButton>
                      </ToggleButtonGroup>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}
                      >
                        SVG는 벡터이므로 4배, 8배로 키워도 절대 깨지지 않는 초고화질로 렌더링됩니다.
                      </Typography>
                    </Box>

                    {/* Format Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        출력 파일 포맷
                      </Typography>
                      <ToggleButtonGroup
                        value={rasterFormat}
                        exclusive
                        onChange={(_, val) => val && setRasterFormat(val)}
                        size="small"
                        fullWidth
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 0.5,
                          '& .MuiToggleButton-root': {
                            borderRadius: '8px !important',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontWeight: 700,
                            py: 1,
                            '&.Mui-selected': {
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ToggleButton value="png">PNG</ToggleButton>
                        <ToggleButton value="jpeg">JPG</ToggleButton>
                        <ToggleButton value="webp">WebP</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Background Color Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        배경 색상
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                          size="small"
                          variant={rasterBgColor === 'transparent' ? 'contained' : 'outlined'}
                          onClick={() => setRasterBgColor('transparent')}
                          sx={{ flex: 1, borderRadius: 2, fontWeight: 700 }}
                        >
                          투명
                        </Button>
                        <Button
                          size="small"
                          variant={rasterBgColor === '#ffffff' ? 'contained' : 'outlined'}
                          onClick={() => setRasterBgColor('#ffffff')}
                          sx={{ flex: 1, borderRadius: 2, fontWeight: 700 }}
                        >
                          흰색
                        </Button>
                        <Button
                          size="small"
                          variant={rasterBgColor === '#000000' ? 'contained' : 'outlined'}
                          onClick={() => setRasterBgColor('#000000')}
                          sx={{ flex: 1, borderRadius: 2, fontWeight: 700 }}
                        >
                          검은색
                        </Button>
                      </Box>
                    </Box>

                    {/* SVG Preset Selector */}
                    <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
                      >
                        다른 SVG 프리셋 렌더링
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {SAMPLE_SVG_PRESETS.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="outlined"
                            size="small"
                            onClick={() => handleLoadSvgPreset(preset)}
                            sx={{
                              justifyContent: 'flex-start',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: 0.75,
                            }}
                          >
                            {preset.title}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ================================================================= */}
      {/* 4. Modal: SVG 코드 전체화면 편집 다이얼로그 (수정 가능!)          */}
      {/* ================================================================= */}
      <Dialog
        open={fullscreenCodeModalOpen}
        onClose={() => setFullscreenCodeModalOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 1,
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeRoundedIcon sx={{ color: 'primary.main' }} />
            <span>SVG 소스 코드 편집기</span>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FormatAlignLeftRoundedIcon />}
              onClick={() => {
                if (currentTab === 'toSvg') handleFormatSvgCodeTab1();
                else handleFormatSvgCodeTab2();
              }}
              sx={{ borderRadius: 1.5 }}
            >
              서식 정리
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => {
                handleCopySvgCode(currentTab === 'toSvg' ? currentActiveSvg : svgInputCode);
              }}
              sx={{ borderRadius: 1.5 }}
            >
              코드 복사
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', p: 0 }}
        >
          <TextField
            multiline
            fullWidth
            value={currentTab === 'toSvg' ? userEditedSvg : svgInputCode}
            onChange={(e) => {
              if (currentTab === 'toSvg') {
                setUserEditedSvg(e.target.value);
              } else {
                setSvgInputCode(e.target.value);
              }
            }}
            placeholder="<svg ...> ... </svg>"
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                p: 2,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                height: '100%',
                alignItems: 'flex-start',
                overflowY: 'auto',
                bgcolor: 'background.neutral',
              },
            }}
            sx={{ flex: '1 1 auto', height: '100%', display: 'flex', flexDirection: 'column' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Typography variant="caption" sx={{ mr: 'auto', color: 'text.secondary' }}>
            💡 코드를 수정하고 닫으면 화면에 실시간으로 반영됩니다.
          </Typography>
          <Button
            onClick={() => setFullscreenCodeModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: 1.5, fontWeight: 700 }}
          >
            확인 및 닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================================================= */}
      {/* 5. Modal: SVG 코드 직접 붙여넣기 모달                             */}
      {/* ================================================================= */}
      <Dialog
        open={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>SVG 코드 직접 입력하기</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            아래에 `<svg> ... </svg>` 태그가 포함된 SVG 코드를 붙여넣으세요. 입력 즉시 고해상도
            이미지가 화면에 출력됩니다.
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={12}
            value={pasteBuffer}
            onChange={(e) => setPasteBuffer(e.target.value)}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"> ... </svg>'
            variant="outlined"
            slotProps={{
              input: {
                sx: {
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.85rem',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setPasteModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            취소
          </Button>
          <Button
            onClick={handleApplyPastedSvg}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1.5, fontWeight: 700 }}
          >
            적용하고 이미지 보기
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
