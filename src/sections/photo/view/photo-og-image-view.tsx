'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PhotoSizeSelectActualRoundedIcon from '@mui/icons-material/PhotoSizeSelectActualRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { SafeNumberInput } from '../components/safe-number-input';
import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import { AppsInTossNavHeader } from '../components/apps-in-toss-nav-header';
import { type CropRect, InteractiveCropBox } from '../components/interactive-crop-box';
import { getOgCropSettings, saveOgCropSettings } from '../utils/thumbnail-storage';
import { PhotoUploadWorkspace, type SampleImageItem } from '../components/photo-upload-workspace';
import {
  formatBytes,
  type OgBgMode,
  processOgImage,
  type OgFitMode,
  downloadDataUrl,
  shareToKakaoTalk,
  type OgAlignment,
  calculateDataUrlByteSize,
} from '../utils/image-processor';

// ----------------------------------------------------------------------

const OG_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-fintech',
    label: '💳 토스 뱅킹/결제 미니앱 UI',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    subLabel: '핀테크 서비스 공유 카드',
  },
  {
    id: 'sample-promo',
    label: '🎁 이벤트 & 쿠폰 프로모션 배너',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    subLabel: '가로 2:1 프로모션 배너',
  },
  {
    id: 'sample-lifestyle',
    label: '☕ 라이프스타일 & 커뮤니티 미니앱',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    subLabel: '감성 라이프스타일 썸네일',
  },
];

interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
  badge?: string;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '1200 × 600', width: 1200, height: 600, badge: '앱인토스 기본' },
  { label: '1200 × 630', width: 1200, height: 630, badge: '웹 OG 표준' },
  { label: '800 × 400', width: 800, height: 400, badge: '2:1 경량화' },
  { label: '600 × 300', width: 600, height: 300, badge: '2:1 모바일' },
  { label: '600 × 600', width: 600, height: 600, badge: '1:1 정사각' },
];

const PRESET_BG_COLORS = [
  { label: '토스 블루', value: '#0064FF' },
  { label: '화이트', value: '#FFFFFF' },
  { label: '다크', value: '#191F28' },
  { label: '연회색', value: '#F2F4F6' },
  { label: '투명', value: 'transparent' },
];

interface UploadedFileItem {
  id: string;
  name: string;
  src: string;
  resultUrl?: string;
  fileSize?: number;
}

// ----------------------------------------------------------------------

export function PhotoOgImageView() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Editor State
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [outputWidth, setOutputWidth] = useState<number>(1200);
  const [outputHeight, setOutputHeight] = useState<number>(600);
  const [isAspectLocked, setIsAspectLocked] = useState<boolean>(true);

  const [fitMode, setFitMode] = useState<OgFitMode>('fit');
  const [alignment, setAlignment] = useState<OgAlignment>('center');
  const [bgMode, setBgMode] = useState<OgBgMode>('color');
  const [bgColor, setBgColor] = useState<string>('#0064FF');

  const [cropArea, setCropArea] = useState<CropRect>({ x: 0, y: 0, width: 600, height: 300 });

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>(
    'image/png'
  );
  const [quality, setQuality] = useState<number>(92);
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [previewMode, setPreviewMode] = useState<'canvas' | 'shareCard'>('canvas');
  const [shareTitle, setShareTitle] = useState<string>('내 앱인토스 미니앱');
  const [shareDesc, setShareDesc] = useState<string>(
    '토스에서 간편하게 즐기는 스마트 라이프 서비스'
  );

  // Batch Editor State
  const [batchFiles, setBatchFiles] = useState<UploadedFileItem[]>([]);
  const [batchProcessing, setBatchProcessing] = useState<boolean>(false);

  // Panel sizing
  const [panelWidth, setPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Storage hydration
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getOgCropSettings().then((saved) => {
      setOutputWidth(saved.width || 1200);
      setOutputHeight(saved.height || 600);
      setIsLoaded(true);
    });
  }, []);

  const handleUpdateDimensions = (w: number, h: number) => {
    setOutputWidth(w);
    setOutputHeight(h);
    if (isLoaded) {
      saveOgCropSettings({ x: 0, y: 0, width: w, height: h });
    }
  };

  // Divider resize
  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = panelWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = resizeStartXRef.current - e.clientX;
    const newWidth = Math.max(280, Math.min(640, resizeStartWidthRef.current + deltaX));
    setPanelWidth(newWidth);
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

  // Process Single Image
  const generatePreview = useCallback(
    async (src: string, crop?: CropRect) => {
      if (!src) return;
      setIsProcessing(true);
      try {
        const outUrl = await processOgImage(src, {
          width: outputWidth,
          height: outputHeight,
          mode: fitMode,
          alignment,
          backgroundColor: bgColor,
          bgMode,
          cropArea: crop || cropArea,
          format: exportFormat,
          quality: quality / 100,
        });
        setResultDataUrl(outUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      outputWidth,
      outputHeight,
      fitMode,
      alignment,
      bgColor,
      bgMode,
      cropArea,
      exportFormat,
      quality,
    ]
  );

  // Debounce preview update when options change
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        generatePreview(imageSrc);
      }, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [imageSrc, generatePreview]);

  // Load Image handler
  const loadSingleImage = (url: string) => {
    setImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });

      const targetAspect = outputWidth / (outputHeight || 1);
      const imgAspect = img.width / img.height;
      let initialW = img.width;
      let initialH = img.height;

      if (imgAspect > targetAspect) {
        initialH = img.height * 0.9;
        initialW = initialH * targetAspect;
      } else {
        initialW = img.width * 0.9;
        initialH = initialW / targetAspect;
      }

      const initialCrop: CropRect = {
        x: Math.round((img.width - initialW) / 2),
        y: Math.round((img.height - initialH) / 2),
        width: Math.max(1, Math.round(initialW)),
        height: Math.max(1, Math.round(initialH)),
      };
      setCropArea(initialCrop);
      generatePreview(url, initialCrop);
    };
    img.src = url;
  };

  const handleSingleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        loadSingleImage(src);
        toast.success(`'${file.name}' 이미지를 불러왔습니다.`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Aspect ratio handlers
  const handleWidthChange = (newW: number) => {
    if (isAspectLocked && outputWidth > 0) {
      const ratio = outputHeight / outputWidth;
      const newH = Math.max(1, Math.round(newW * ratio));
      handleUpdateDimensions(newW, newH);
    } else {
      handleUpdateDimensions(newW, outputHeight);
    }
  };

  const handleHeightChange = (newH: number) => {
    if (isAspectLocked && outputHeight > 0) {
      const ratio = outputWidth / outputHeight;
      const newW = Math.max(1, Math.round(newH * ratio));
      handleUpdateDimensions(newW, newH);
    } else {
      handleUpdateDimensions(outputWidth, newH);
    }
  };

  const handleApplyPreset = (preset: ResolutionPreset) => {
    handleUpdateDimensions(preset.width, preset.height);
    toast.info(`해상도가 ${preset.width}×${preset.height}로 설정되었습니다.`);
  };

  const handleResetToDefault = () => {
    handleUpdateDimensions(1200, 600);
    setFitMode('fit');
    setBgMode('color');
    setBgColor('#0064FF');
    setIsAspectLocked(true);
    toast.info('토스 기본 규격(1200×600, 토스 블루)으로 초기화되었습니다.');
  };

  // Single Action buttons
  const handleDownloadSingle = () => {
    if (!resultDataUrl) return;
    const ext =
      exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    downloadDataUrl(resultDataUrl, `og_image_${outputWidth}x${outputHeight}.${ext}`);
    toast.success('ogImage가 성공적으로 다운로드되었습니다.');
  };

  const handleShareKakao = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await shareToKakaoTalk(
        resultDataUrl,
        '앱인토스 ogImage',
        `og_${outputWidth}x${outputHeight}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!resultDataUrl) return;
    try {
      const res = await fetch(resultDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('1200×600 이미지가 클립보드에 복사되었습니다.');
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저이거나 복사 중 오류가 발생했습니다.');
    }
  };

  // ─── Batch Processing ───
  const addBatchFiles = (filesToAdd: File[]) => {
    if (filesToAdd.length === 0) return;
    const newItems: UploadedFileItem[] = [];
    let count = 0;

    filesToAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            name: f.name,
            src,
            fileSize: f.size,
          });
        }
        count += 1;
        if (count === filesToAdd.length) {
          setBatchFiles((prev) => [...prev, ...newItems]);
          toast.success(`${newItems.length}개 파일이 일괄 작업 목록에 추가되었습니다.`);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const processBatchAll = useCallback(async () => {
    if (batchFiles.length === 0) return;
    setBatchProcessing(true);
    try {
      const updated = await Promise.all(
        batchFiles.map(async (file) => {
          const outUrl = await processOgImage(file.src, {
            width: outputWidth,
            height: outputHeight,
            mode: fitMode,
            alignment,
            backgroundColor: bgColor,
            bgMode,
            format: exportFormat,
            quality: quality / 100,
          });
          return { ...file, resultUrl: outUrl };
        })
      );
      setBatchFiles(updated);
      toast.success(`${updated.length}개 이미지의 1200×600 변환이 완료되었습니다.`);
    } catch {
      toast.error('일괄 변환 처리 중 오류가 발생했습니다.');
    } finally {
      setBatchProcessing(false);
    }
  }, [
    batchFiles,
    outputWidth,
    outputHeight,
    fitMode,
    alignment,
    bgColor,
    bgMode,
    exportFormat,
    quality,
  ]);

  const handleDownloadBatchZip = async () => {
    const readyFiles = batchFiles.filter((f) => !!f.resultUrl);
    if (readyFiles.length === 0) {
      toast.warning('변환된 이미지가 없습니다.');
      return;
    }

    const ext =
      exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    const zipEntries: ZipFileEntry[] = readyFiles.map((file, idx) => {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      return {
        filename: `og_${outputWidth}x${outputHeight}_${baseName || idx + 1}.${ext}`,
        data: file.resultUrl!,
      };
    });

    await downloadZipFile(`apps_in_toss_og_${outputWidth}x${outputHeight}.zip`, zipEntries);
    toast.success('전체 ZIP 파일 다운로드를 시작했습니다.');
  };

  // Drop & Paste Hook
  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (droppedFiles) => {
      if (activeTab === 'batch') {
        addBatchFiles(droppedFiles);
      } else if (droppedFiles[0]) {
        handleSingleFileSelect(droppedFiles[0]);
      }
    },
    multiple: activeTab === 'batch',
  });

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
      {/* 1. Apps in Toss Navigation Header */}
      <AppsInTossNavHeader currentTab="ogImage" />

      {/* 2. Top Tabs: Single Editor vs Batch Converter */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem', minHeight: 44 },
          }}
        >
          <Tab
            value="single"
            label="단일 ogImage 정밀 제작"
            icon={<PhotoSizeSelectActualRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="batch"
            label={`다중 이미지 일괄 변환 (${batchFiles.length})`}
            icon={<ViewStreamRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 'single' && imageSrc && (
          <ToggleButtonGroup
            size="small"
            value={previewMode}
            exclusive
            onChange={(_, v) => v && setPreviewMode(v)}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <ToggleButton
              value="canvas"
              sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', fontWeight: 600 }}
            >
              에디터 뷰
            </ToggleButton>
            <ToggleButton
              value="shareCard"
              sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', fontWeight: 600 }}
            >
              토스 공유 카드 시뮬레이터
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* 3. Main Workspace Area */}
      {activeTab === 'single' ? (
        !imageSrc ? (
          <PhotoUploadWorkspace
            sampleImages={OG_SAMPLE_IMAGES}
            onSelectSample={loadSingleImage}
            onFileSelect={handleSingleFileSelect}
            title="ogImage 생성할 이미지 업로드"
            subtitle="토스 앱인토스 기본 규격인 1200×600 (2:1 비율)로 즉시 크기를 맞춥니다."
            icon={<ShareRoundedIcon sx={{ fontSize: 36 }} />}
            buttonText="이미지 선택 (1200×600 리사이즈)"
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
            {/* Center: Image Canvas or Share Card Simulator */}
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
                  flex: '1 1 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2.5 },
                  minHeight: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top Quick Status Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 14,
                    left: 16,
                    right: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto', flexWrap: 'wrap' }}>
                    <Chip
                      label={`출력 규격: ${outputWidth} × ${outputHeight} px (2:1)`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    {imageDimensions.width > 0 && (
                      <Chip
                        label={`원본: ${imageDimensions.width} × ${imageDimensions.height} px`}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: 'background.paper' }}
                      />
                    )}
                    {resultDataUrl && (
                      <Chip
                        label={formatBytes(calculateDataUrlByteSize(resultDataUrl))}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: 'background.paper', fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{
                      pointerEvents: 'auto',
                      bgcolor: 'background.paper',
                      boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[4],
                    }}
                  >
                    다른 사진
                  </Button>
                </Box>

                {/* Viewport Content */}
                {previewMode === 'canvas' ? (
                  fitMode === 'crop' ? (
                    // Interactive Drag Cropper
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pt: 6,
                      }}
                    >
                      <InteractiveCropBox
                        imageSrc={imageSrc}
                        naturalWidth={imageDimensions.width}
                        naturalHeight={imageDimensions.height}
                        aspectRatio={isAspectLocked ? outputWidth / (outputHeight || 1) : undefined}
                        crop={cropArea}
                        onChange={(newCrop) => {
                          setCropArea(newCrop);
                          generatePreview(imageSrc, newCrop);
                        }}
                      />
                    </Box>
                  ) : (
                    // Result Image Live Preview
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pt: 6,
                        minHeight: 0,
                      }}
                    >
                      {resultDataUrl ? (
                        <Box
                          component="img"
                          src={resultDataUrl}
                          alt="ogImage 1200x600 preview"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 2,
                            boxShadow: (theme) =>
                              theme.customShadows?.z24 || '0 20px 40px rgba(0,0,0,0.15)',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      ) : (
                        <CircularProgress />
                      )}
                    </Box>
                  )
                ) : (
                  // Toss / SNS Share Card Simulator
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pt: 6,
                      overflowY: 'auto',
                    }}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        maxWidth: 440,
                        borderRadius: 3.5,
                        overflow: 'hidden',
                        boxShadow: '0 16px 36px rgba(0,0,0,0.14)',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {/* Simulated Card Image (1200:600 = 2:1 Ratio) */}
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '2 / 1',
                          position: 'relative',
                          bgcolor: bgColor === 'transparent' ? '#191F28' : bgColor,
                          overflow: 'hidden',
                        }}
                      >
                        {resultDataUrl && (
                          <Box
                            component="img"
                            src={resultDataUrl}
                            alt="Share Card Thumbnail"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <Chip
                          label="앱인토스 미리보기"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>

                      {/* Card Text & Metadata */}
                      <Box sx={{ p: 2.25 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          toss.im · 미니앱 오픈그래프
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          variant="standard"
                          value={shareTitle}
                          onChange={(e) => setShareTitle(e.target.value)}
                          placeholder="공유 제목 (예: 내 토스 미니앱)"
                          InputProps={{
                            disableUnderline: false,
                            sx: {
                              fontWeight: 800,
                              fontSize: '1.05rem',
                              color: 'text.primary',
                              mb: 1,
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          variant="standard"
                          multiline
                          rows={2}
                          value={shareDesc}
                          onChange={(e) => setShareDesc(e.target.value)}
                          placeholder="공유 설명문 (예: 토스에서 간편하게 서비스를 이용해보세요)"
                          InputProps={{
                            disableUnderline: false,
                            sx: { fontSize: '0.85rem', color: 'text.secondary' },
                          }}
                        />
                      </Box>
                    </Card>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      💡 사용자가 토스 또는 메신저에 공유했을 때 보이는 1200×600 카드의 실제 렌더링
                      형태입니다.
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>

            {/* Draggable Divider */}
            <Box
              onPointerDown={handleDividerPointerDown}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: 14,
                cursor: 'col-resize',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                userSelect: 'none',
                touchAction: 'none',
                '&:hover .divider-bar, &:active .divider-bar': {
                  bgcolor: 'primary.main',
                  width: 4,
                },
              }}
            >
              <Box
                className="divider-bar"
                sx={{
                  width: 2,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'divider',
                  transition: 'all 0.15s',
                }}
              />
            </Box>

            {/* Right: Controls & Adjustments */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: { xs: '100%', md: `${panelWidth}px` },
                minWidth: { md: `${panelWidth}px` },
                maxWidth: { md: `${panelWidth}px` },
                flexShrink: 0,
                gap: 2,
                minHeight: 0,
                overflowY: 'auto',
                pl: { md: 1 },
              }}
            >
              {/* Card 1: Output Resolution */}
              <Card sx={{ p: 2.2, borderRadius: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    출력 규격 (해상도)
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleResetToDefault}
                    startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                  >
                    기본값 (1200×600)
                  </Button>
                </Box>

                {/* Number Inputs + Aspect Ratio Lock */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                    >
                      가로 (W)
                    </Typography>
                    <SafeNumberInput
                      min={10}
                      max={4096}
                      value={outputWidth}
                      fallbackValue={1200}
                      onChangeValue={handleWidthChange}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        padding: '8px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </Box>

                  <Tooltip title={isAspectLocked ? '비율 고정 해제 (2:1)' : '비율 고정 켜기'}>
                    <IconButton
                      color={isAspectLocked ? 'primary' : 'default'}
                      onClick={() => setIsAspectLocked(!isAspectLocked)}
                      sx={{ mt: 2.5, bgcolor: isAspectLocked ? 'primary.lighter' : 'action.hover' }}
                    >
                      {isAspectLocked ? (
                        <LockRoundedIcon fontSize="small" />
                      ) : (
                        <LockOpenRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                    >
                      세로 (H)
                    </Typography>
                    <SafeNumberInput
                      min={10}
                      max={4096}
                      value={outputHeight}
                      fallbackValue={600}
                      onChangeValue={handleHeightChange}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        padding: '8px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </Box>
                </Box>

                {/* Preset Chips */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {RESOLUTION_PRESETS.map((preset) => {
                    const isSelected =
                      outputWidth === preset.width && outputHeight === preset.height;
                    return (
                      <Chip
                        key={preset.label}
                        label={`${preset.label} ${preset.badge ? `(${preset.badge})` : ''}`}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() => handleApplyPreset(preset)}
                        sx={{ fontWeight: isSelected ? 800 : 500, fontSize: '0.72rem' }}
                      />
                    );
                  })}
                </Box>
              </Card>

              {/* Card 2: Fit Mode & Canvas Adjustments */}
              <Card sx={{ p: 2.2, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  크기 맞춤 방식 (Fit Mode)
                </Typography>

                <ToggleButtonGroup
                  fullWidth
                  size="small"
                  value={fitMode}
                  exclusive
                  onChange={(_, v) => v && setFitMode(v)}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="fit" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    여백 채우기
                  </ToggleButton>
                  <ToggleButton value="cover" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    채워 자르기
                  </ToggleButton>
                  <ToggleButton value="crop" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    직접 크롭
                  </ToggleButton>
                  <ToggleButton value="stretch" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    늘리기
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Mode Option 1: Fit 여백 채우기 배경 설정 */}
                {fitMode === 'fit' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      여백 배경 채우기 스타일
                    </Typography>

                    <ToggleButtonGroup
                      fullWidth
                      size="small"
                      value={bgMode}
                      exclusive
                      onChange={(_, v) => v && setBgMode(v)}
                    >
                      <ToggleButton value="color" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        단색 배경
                      </ToggleButton>
                      <ToggleButton value="blur" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        블러 배경 효과
                      </ToggleButton>
                      <ToggleButton
                        value="transparent"
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        투명화 (PNG)
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {bgMode === 'color' && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                          mt: 0.5,
                        }}
                      >
                        {PRESET_BG_COLORS.map((c) => (
                          <Chip
                            key={c.value}
                            label={c.label}
                            size="small"
                            variant={bgColor === c.value ? 'filled' : 'outlined'}
                            onClick={() => setBgColor(c.value)}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              bgcolor:
                                bgColor === c.value
                                  ? c.value === 'transparent'
                                    ? 'action.selected'
                                    : c.value
                                  : undefined,
                              color:
                                bgColor === c.value
                                  ? c.value === '#FFFFFF' ||
                                    c.value === '#F2F4F6' ||
                                    c.value === 'transparent'
                                    ? '#000'
                                    : '#fff'
                                  : undefined,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ))}
                        {/* Custom Color Input */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <input
                            type="color"
                            value={bgColor.startsWith('#') ? bgColor : '#0064FF'}
                            onChange={(e) => setBgColor(e.target.value)}
                            style={{
                              width: 26,
                              height: 26,
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {bgColor}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Mode Option 2: Cover 꽉 채우기 정렬 */}
                {fitMode === 'cover' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      자르기 기준 정렬 (Alignment)
                    </Typography>
                    <ToggleButtonGroup
                      fullWidth
                      size="small"
                      value={alignment}
                      exclusive
                      onChange={(_, v) => v && setAlignment(v)}
                    >
                      <ToggleButton value="center" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        중앙 (기본)
                      </ToggleButton>
                      <ToggleButton value="top" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        상단
                      </ToggleButton>
                      <ToggleButton value="bottom" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        하단
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}

                {/* Mode Option 3: Crop 대화형 크롭 안내 */}
                {fitMode === 'crop' && (
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    💡 왼쪽 캔버스에서 드래그 박스를 움직이거나 모서리를 당겨서 원하는 2:1 영역을
                    지정하세요.
                  </Typography>
                )}
              </Card>

              {/* Card 3: Format & Export Settings */}
              <Card sx={{ p: 2.2, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  저장 포맷 및 품질
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                    <Chip
                      key={fmt}
                      label={
                        fmt === 'image/jpeg' ? 'JPG' : fmt === 'image/webp' ? 'WebP' : 'PNG (권장)'
                      }
                      size="small"
                      color={exportFormat === fmt ? 'primary' : 'default'}
                      variant={exportFormat === fmt ? 'filled' : 'outlined'}
                      onClick={() => setExportFormat(fmt)}
                      sx={{ flex: 1, fontWeight: 700 }}
                    />
                  ))}
                </Box>

                {exportFormat !== 'image/png' && (
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        압축 품질
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {quality}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={quality}
                      min={60}
                      max={100}
                      onChange={(_, v) => setQuality(v as number)}
                    />
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleDownloadSingle}
                    disabled={isProcessing || !resultDataUrl}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ py: 1.2, fontWeight: 800, borderRadius: 2 }}
                  >
                    1200×600 이미지 다운로드
                  </Button>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={handleCopyToClipboard}
                      disabled={isProcessing || !resultDataUrl}
                      startIcon={<ContentCopyRoundedIcon />}
                      sx={{ py: 1, fontWeight: 700, borderRadius: 2 }}
                    >
                      클립보드 복사
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={handleShareKakao}
                      disabled={isProcessing || !resultDataUrl}
                      startIcon={<ShareRoundedIcon />}
                      sx={{ py: 1, fontWeight: 700, borderRadius: 2 }}
                    >
                      카톡 공유
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        )
      ) : (
        // ─── Batch Mode ───
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            gap: 2,
          }}
        >
          {/* Batch Toolbar */}
          <Card
            sx={{
              p: 2,
              borderRadius: 2.5,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={`일괄 대상: ${outputWidth} × ${outputHeight} px`}
                color="primary"
                size="small"
                sx={{ fontWeight: 800 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                등록된 이미지 {batchFiles.length}개
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => batchFileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                size="small"
                sx={{ fontWeight: 700 }}
              >
                + 사진 추가
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={processBatchAll}
                disabled={batchProcessing || batchFiles.length === 0}
                size="small"
                sx={{ fontWeight: 800 }}
              >
                {batchProcessing ? '일괄 변환 중...' : '전체 1200×600 변환'}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleDownloadBatchZip}
                disabled={batchProcessing || batchFiles.filter((f) => !!f.resultUrl).length === 0}
                startIcon={<ArchiveRoundedIcon />}
                size="small"
                sx={{ fontWeight: 800 }}
              >
                전체 ZIP 다운로드
              </Button>
            </Box>
          </Card>

          {/* Batch Files Grid */}
          {batchFiles.length === 0 ? (
            <Card
              {...getRootProps()}
              sx={{
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                borderRadius: 3,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                bgcolor: isDragActive ? 'primary.lighter' : 'background.neutral',
                cursor: 'pointer',
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                여러 장의 사진을 여기에 드래그하세요
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                모든 사진이 한 번에 1200×600 ogImage 규격으로 변환됩니다.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => batchFileInputRef.current?.click()}
              >
                사진 다중 선택하기
              </Button>
            </Card>
          ) : (
            <Box
              sx={{
                flex: '1 1 auto',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                pr: 0.5,
              }}
            >
              {batchFiles.map((file, idx) => (
                <Card
                  key={file.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '2 / 1',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: 'background.neutral',
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src={file.resultUrl || file.src}
                      alt={file.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {file.resultUrl && (
                      <Chip
                        label="1200×600 완료"
                        color="success"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          fontWeight: 700,
                          fontSize: '0.65rem',
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                        {idx + 1}. {file.name}
                      </Typography>
                      {file.fileSize && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatBytes(file.fileSize)}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {file.resultUrl && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            downloadDataUrl(
                              file.resultUrl!,
                              `og_${outputWidth}x${outputHeight}_${file.name}`
                            )
                          }
                        >
                          <DownloadRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setBatchFiles((prev) => prev.filter((f) => f.id !== file.id))
                        }
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleSingleFileSelect(e.target.files[0]);
          }
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            addBatchFiles(Array.from(e.target.files));
          }
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
    </DashboardContent>
  );
}
