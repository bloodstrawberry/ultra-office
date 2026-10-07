'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

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
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import BorderAllRoundedIcon from '@mui/icons-material/BorderAllRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';
import { shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';

import { loadWebtoonSample, WEBTOON_SAMPLE_IMAGES } from './webtoon-samples';
import { type SignAsset, findSignBounds, drawSignedImage, type SignOptions } from './sign-renderer';

interface ImageItem {
  id: string;
  file: File;
  url: string;
  image: HTMLImageElement;
}

const DEFAULT_OPTIONS: SignOptions = {
  signFile: 'sign-blood-eng1.png',
  backgroundMode: 'white',
  padding: 7,
  footer: 12,
  radius: 9,
  signSize: 24,
  signAngle: 0,
  signX: 85,
  signY: 95,
};

const SIGN_PRESETS = [
  { file: 'sign-blood-eng1.png', label: '피로물든딸기 영문 1', desc: 'Blood Strawberry Cursive' },
  { file: 'sign-blood-eng2.png', label: '피로물든딸기 영문 2', desc: 'Blood Strawberry Modern' },
  { file: 'sign-blood-kor.png', label: '피로물든딸기 한글', desc: '피로물든딸기 캘리그라피' },
  { file: 'sign-employee-eng.png', label: '이달의 우수사원 영문', desc: 'Employee MVP Signature' },
  { file: 'sign-employee-kor.png', label: '이달의 우수사원 한글', desc: '이달의 우수사원 캘리' },
] as const;

const signUrl = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/sign/${file}`;

const SIGN_PANEL_TABS = [
  { id: 'presets', label: '싸인 선택' },
  { id: 'layout', label: '여백 & 배치' },
  { id: 'images', label: '이미지 목록' },
] as const;

type SignPanelTab = (typeof SIGN_PANEL_TABS)[number]['id'];

function CompactSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '%',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <Box sx={{ mb: 0.85 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}
        >
          {value}
          {suffix}
        </Typography>
      </Box>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
        sx={{ py: 0.4 }}
      />
    </Box>
  );
}

function loadImage(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name}: 이미지 파일이 아닙니다.`));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        resolve({ id: crypto.randomUUID(), file, url, image });
      } else {
        URL.revokeObjectURL(url);
        reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
    };
    image.src = url;
  });
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG 파일을 만들 수 없습니다.'));
    }, 'image/png');
  });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function WebtoonSignView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const urlsRef = useRef(new Set<string>());
  const mountedRef = useRef(true);
  const draggingRef = useRef(false);

  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [options, setOptions] = useState<SignOptions>(DEFAULT_OPTIONS);
  const [settingsReady, setSettingsReady] = useState(false);
  const [signAsset, setSignAsset] = useState<SignAsset | null>(null);
  const [exporting, setExporting] = useState(false);

  const [activeTab, setActiveTab] = useState<SignPanelTab>('presets');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const activeSign = signAsset?.file === options.signFile ? signAsset : null;
  const signReady = !options.signFile || !!activeSign;

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

  useEffect(() => {
    mountedRef.current = true;
    const urls = urlsRef.current;
    return () => {
      mountedRef.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('webtoon-studio:sign-settings:v1');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const data = parsed as Partial<SignOptions>;
          const number = (value: unknown, fallback: number, min: number, max: number) =>
            typeof value === 'number' && Number.isFinite(value)
              ? Math.max(min, Math.min(max, value))
              : fallback;
          setOptions({
            signFile:
              data.signFile === null
                ? null
                : (SIGN_PRESETS.find(({ file }) => file === data.signFile)?.file ??
                  DEFAULT_OPTIONS.signFile),
            backgroundMode:
              data.backgroundMode === 'transparent'
                ? 'transparent'
                : DEFAULT_OPTIONS.backgroundMode,
            padding: number(data.padding, DEFAULT_OPTIONS.padding, 0, 25),
            footer: number(data.footer, DEFAULT_OPTIONS.footer, 0, 30),
            radius: number(data.radius, DEFAULT_OPTIONS.radius, 0, 30),
            signSize: number(data.signSize, DEFAULT_OPTIONS.signSize, 5, 100),
            signAngle: number(data.signAngle, DEFAULT_OPTIONS.signAngle, -180, 180),
            signX: number(data.signX, DEFAULT_OPTIONS.signX, 0, 100),
            signY: number(data.signY, DEFAULT_OPTIONS.signY, 0, 100),
          });
        }
      }
    } catch {
      // ignore
    }
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    try {
      localStorage.setItem('webtoon-studio:sign-settings:v1', JSON.stringify(options));
    } catch {
      // ignore
    }
  }, [options, settingsReady]);

  useEffect(() => {
    if (!options.signFile) return undefined;
    const signFile = options.signFile;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      try {
        const bounds = findSignBounds(image);
        if (!cancelled) setSignAsset({ file: signFile, image, bounds });
      } catch {
        if (!cancelled) toast.error('싸인 이미지를 읽지 못했습니다.');
      }
    };
    image.onerror = () => {
      if (!cancelled) toast.error('싸인 이미지를 불러오지 못했습니다.');
    };
    image.src = signUrl(signFile);
    return () => {
      cancelled = true;
    };
  }, [options.signFile]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !selected) return;
    try {
      drawSignedImage(canvas, selected.image, options, activeSign, 2_000_000);
    } catch {
      toast.error('미리보기를 그리지 못했습니다.');
    }
  }, [selected, options, activeSign]);

  const updateOption = <K extends keyof SignOptions>(key: K, value: SignOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const placeSign = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    setOptions((current) => ({ ...current, signX: Math.round(x), signY: Math.round(y) }));
  };

  const addFiles = async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;
    const results = await Promise.allSettled(incoming.map(loadImage));
    const loaded = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : []
    );
    const failed = results.length - loaded.length;
    if (!mountedRef.current) {
      loaded.forEach((item) => URL.revokeObjectURL(item.url));
      return;
    }
    loaded.forEach((item) => urlsRef.current.add(item.url));
    if (loaded.length) {
      setItems((current) => [...current, ...loaded]);
      setSelectedId((current) => current ?? loaded[0].id);
    }
    if (failed) toast.error(`${failed}개 이미지를 읽지 못했습니다.`);
  };

  const selectSample = async (url: string) => {
    try {
      await addFiles([await loadWebtoonSample(url)]);
    } catch {
      toast.error('예시 이미지를 불러오지 못했습니다.');
    }
  };

  const startOver = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
    setItems([]);
    setSelectedId(null);
  };

  const removeItem = (id: string) => {
    const removed = items.find((item) => item.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
      urlsRef.current.delete(removed.url);
    }
    const remaining = items.filter((item) => item.id !== id);
    setItems(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
  };

  const renderBlob = async (item: ImageItem) => {
    if (!signReady) throw new Error('싸인 이미지를 불러오는 중입니다.');
    const canvas = document.createElement('canvas');
    drawSignedImage(canvas, item.image, options, activeSign);
    return canvasToPng(canvas);
  };

  const saveSelected = async () => {
    if (!selected || exporting) return;
    setExporting(true);
    try {
      const blob = await renderBlob(selected);
      downloadBlob(blob, `${selected.file.name.replace(/\.[^.]+$/, '')}-signed.png`);
      toast.success('결과물을 PNG로 저장했습니다.');
    } catch {
      toast.error('PNG 저장에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const saveAll = async () => {
    if (!items.length || exporting) return;
    setExporting(true);
    try {
      const zip = new JSZip();
      for (const [index, item] of items.entries()) {
        const blob = await renderBlob(item);
        zip.file(
          `${String(index + 1).padStart(2, '0')}-${item.file.name.replace(/\.[^.]+$/, '')}-signed.png`,
          blob
        );
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), 'webtoon-signed-images.zip');
      toast.success('전체 이미지를 ZIP으로 저장했습니다.');
    } catch {
      toast.error('ZIP 저장에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selected || exporting) return;
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      drawSignedImage(canvas, selected.image, options, activeSign);
      const dataUrl = canvas.toDataURL('image/png');
      const res = await shareToKakaoTalk(
        dataUrl,
        '[Ultra Office] 웹툰 싸인 완성작',
        `webtoon_sign_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
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
          웹툰 싸인추가 스튜디오 (Webtoon Signature Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          이미지에 여백과 둥근 모서리를 만들고 준비된 시그니처 싸인을 원하는 위치에 자유롭게
          배치합니다.
        </Typography>
      </Box>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {!selected ? (
        <PhotoUploadWorkspace
          sampleImages={WEBTOON_SAMPLE_IMAGES}
          onSelectSample={(url) => void selectSample(url)}
          onFileSelect={(file) => void addFiles([file])}
          onFilesSelect={(files) => void addFiles(files)}
          multiple
          title="싸인을 추가할 웹툰/사진 업로드"
          subtitle="한 장 또는 여러 장을 드래그하거나 클릭하여 올려주세요."
          icon={<BorderAllRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Viewport */}
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
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
              }}
            >
              {/* Top Viewport Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`원본 ${selected.image.naturalWidth} × ${selected.image.naturalHeight}px`}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                  <Chip
                    size="small"
                    color="primary"
                    variant="soft"
                    label={`출력 ${Math.round(selected.image.naturalWidth * (1 + options.padding / 50))} × ${Math.round(selected.image.naturalHeight + (selected.image.naturalWidth * (options.padding + options.footer)) / 100)}px`}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Box>
                <Chip
                  size="small"
                  label={`이미지 ${items.length}장`}
                  sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>

              {/* Canvas Center Preview */}
              <Box
                sx={{
                  flex: '1 1 0px',
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  p: 1,
                  userSelect: 'none',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    boxShadow: 4,
                    borderRadius: 1,
                    overflow: 'hidden',
                    lineHeight: 0,
                    backgroundImage:
                      options.backgroundMode === 'transparent'
                        ? 'conic-gradient(#e0e0e0 25%, #ffffff 0 50%, #e0e0e0 0 75%, #ffffff 0)'
                        : 'none',
                    backgroundSize: '20px 20px',
                    bgcolor: options.backgroundMode === 'white' ? '#ffffff' : 'transparent',
                  }}
                >
                  <canvas
                    ref={previewRef}
                    aria-label="싸인 적용 미리보기"
                    onPointerDown={(event) => {
                      if (!options.signFile) return;
                      draggingRef.current = true;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      placeSign(event);
                    }}
                    onPointerMove={(event) => {
                      if (draggingRef.current) placeSign(event);
                    }}
                    onPointerUp={() => {
                      draggingRef.current = false;
                    }}
                    onPointerCancel={() => {
                      draggingRef.current = false;
                    }}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 270px)',
                      width: 'auto',
                      height: 'auto',
                      touchAction: 'none',
                      cursor: options.signFile ? 'crosshair' : 'default',
                    }}
                  />
                </Box>
              </Box>

              {/* Bottom Instructions */}
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  mt: 1,
                  flexShrink: 0,
                  fontSize: '0.72rem',
                }}
              >
                미리보기를 클릭하거나 드래그하여 싸인 위치를 실시간으로 변경할 수 있습니다.
              </Typography>
            </Card>
          </Box>

          {/* Draggable Divider */}
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
          </Box>

          {/* Right: Settings Panel */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.25,
              minHeight: 0,
              height: '100%',
              overflow: { xs: 'auto', md: 'hidden' },
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, flexShrink: 0 }}>
                싸인 & 여백 설정
              </Typography>

              {/* Tabs */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.25, flexShrink: 0 }}>
                {SIGN_PANEL_TABS.map((tab) => (
                  <Chip
                    key={tab.id}
                    label={tab.label}
                    size="small"
                    clickable
                    color={activeTab === tab.id ? 'primary' : 'default'}
                    variant={activeTab === tab.id ? 'filled' : 'outlined'}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 26 }}
                  />
                ))}
              </Box>

              {/* Dynamic Scroll Section */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  pr: 0.5,
                  mb: 1.25,
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'text.disabled' },
                }}
              >
                {/* TAB 1: Presets */}
                {activeTab === 'presets' && (
                  <ToggleButtonGroup
                    orientation="vertical"
                    value={options.signFile ?? ''}
                    exclusive
                    fullWidth
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}
                  >
                    <ToggleButton
                      value=""
                      onClick={() => updateOption('signFile', null)}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: options.signFile === null ? 'primary.main' : 'divider',
                        p: '7px 10px',
                        textAlign: 'left',
                        bgcolor: options.signFile === null ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                          bgcolor: options.signFile === null ? 'primary.lighter' : 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          ✕
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, fontSize: '0.82rem' }}
                          >
                            사용 안 함
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                          >
                            싸인 없이 여백과 모서리만 적용
                          </Typography>
                        </Box>
                      </Box>
                    </ToggleButton>

                    {SIGN_PRESETS.map((p) => {
                      const isSel = options.signFile === p.file;
                      return (
                        <ToggleButton
                          key={p.file}
                          value={p.file}
                          onClick={() => updateOption('signFile', p.file)}
                          sx={{
                            justifyContent: 'flex-start',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: isSel ? 'primary.main' : 'divider',
                            p: '7px 10px',
                            textAlign: 'left',
                            bgcolor: isSel ? 'primary.lighter' : 'transparent',
                            '&:hover': {
                              bgcolor: isSel ? 'primary.lighter' : 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}
                          >
                            <Box
                              sx={{
                                width: 48,
                                height: 38,
                                borderRadius: 1,
                                bgcolor: '#ffffff',
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundImage: `url("${signUrl(p.file)}")`,
                                backgroundSize: 'auto 140px',
                                backgroundPosition: 'right bottom',
                                backgroundRepeat: 'no-repeat',
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  color: isSel ? 'primary.darker' : 'text.primary',
                                }}
                              >
                                {p.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                              >
                                {p.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </ToggleButton>
                      );
                    })}
                  </ToggleButtonGroup>
                )}

                {/* TAB 2: Layout & Details */}
                {activeTab === 'layout' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
                      >
                        여백 배경 방식
                      </Typography>
                      <ToggleButtonGroup
                        size="small"
                        fullWidth
                        exclusive
                        value={options.backgroundMode}
                        onChange={(_, value: SignOptions['backgroundMode'] | null) => {
                          if (value) updateOption('backgroundMode', value);
                        }}
                      >
                        <ToggleButton value="white">흰색 배경</ToggleButton>
                        <ToggleButton value="transparent">투명 배경 (PNG)</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <CompactSlider
                      label="바깥 여백 (Padding)"
                      value={options.padding}
                      min={0}
                      max={25}
                      onChange={(value) => updateOption('padding', value)}
                    />

                    <CompactSlider
                      label="하단 여백 (Footer)"
                      value={options.footer}
                      min={0}
                      max={30}
                      onChange={(value) => updateOption('footer', value)}
                    />

                    <CompactSlider
                      label="모서리 둥글기 (Radius)"
                      value={options.radius}
                      min={0}
                      max={30}
                      onChange={(value) => updateOption('radius', value)}
                    />

                    <CompactSlider
                      label="싸인 각도 (Angle)"
                      value={options.signAngle}
                      min={-180}
                      max={180}
                      suffix="°"
                      onChange={(value) => updateOption('signAngle', value)}
                    />
                  </Box>
                )}

                {/* TAB 3: Images */}
                {activeTab === 'images' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<UploadRoundedIcon />}
                      onClick={() => fileRef.current?.click()}
                      sx={{ mb: 0.5 }}
                    >
                      사진 추가하기
                    </Button>

                    {items.map((item) => (
                      <Box
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: '6px 8px',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: item.id === selected?.id ? 'primary.main' : 'divider',
                          bgcolor:
                            item.id === selected?.id ? 'primary.lighter' : 'background.paper',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: item.id === selected?.id ? 'primary.lighter' : 'action.hover',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Box
                            component="img"
                            src={item.url}
                            alt=""
                            sx={{
                              width: 34,
                              height: 34,
                              objectFit: 'cover',
                              borderRadius: 1,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: item.id === selected?.id ? 'primary.darker' : 'text.primary',
                            }}
                          >
                            {item.file.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Bottom Quick Sliders (Art Style Pattern) */}
              <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                <CompactSlider
                  label="싸인 크기 (Size)"
                  value={options.signSize}
                  min={5}
                  max={100}
                  onChange={(value) => updateOption('signSize', value)}
                />
                <CompactSlider
                  label="가로 위치 (X)"
                  value={options.signX}
                  min={0}
                  max={100}
                  onChange={(value) => updateOption('signX', value)}
                />
                <CompactSlider
                  label="세로 위치 (Y)"
                  value={options.signY}
                  min={0}
                  max={100}
                  onChange={(value) => updateOption('signY', value)}
                />
              </Box>
            </Card>

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={startOver}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  다른 사진
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleShare}
                  disabled={!signReady || exporting}
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  공유
                </Button>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={saveSelected}
                disabled={!signReady || exporting}
                startIcon={
                  exporting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장 (PNG)
              </Button>

              {items.length > 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={saveAll}
                  disabled={!signReady || exporting}
                  startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.65, borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}
                >
                  전체 ZIP 저장 ({items.length}장)
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}

export default WebtoonSignView;
