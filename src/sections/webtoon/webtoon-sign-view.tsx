'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';

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
  { file: 'sign-blood-eng1.png', label: '피로물든딸기 영문 1' },
  { file: 'sign-blood-eng2.png', label: '피로물든딸기 영문 2' },
  { file: 'sign-blood-kor.png', label: '피로물든딸기 한글' },
  { file: 'sign-employee-eng.png', label: '이달의 우수사원 영문' },
  { file: 'sign-employee-kor.png', label: '이달의 우수사원 한글' },
] as const;

const signUrl = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/sign/${file}`;

function OptionSlider({
  label,
  value,
  min,
  max,
  onChange,
  suffix = '%',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {value}
          {suffix}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
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
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const activeSign = signAsset?.file === options.signFile ? signAsset : null;
  const signReady = !options.signFile || !!activeSign;

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
      // A corrupt or unavailable local store should not prevent editing.
    }
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    try {
      localStorage.setItem('webtoon-studio:sign-settings:v1', JSON.stringify(options));
    } catch {
      // Browsers can disable or fill local storage; the current session still works.
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

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            웹툰 싸인추가
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이미지에 여백과 둥근 모서리를 만들고 준비된 PNG 싸인을 원하는 위치에 배치하세요.
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
            title="싸인을 넣을 이미지 업로드"
            subtitle="한 장 또는 여러 장을 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요."
          />
        ) : (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
            <Card
              sx={{
                p: 2,
                width: { xs: '100%', lg: 260 },
                flexShrink: 0,
                maxHeight: { lg: 'calc(100vh - 160px)' },
                overflowY: 'auto',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">싸인 설정</Typography>
                <Typography variant="body2">싸인 이미지</Typography>
                <Box
                  sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}
                >
                  <Button
                    size="small"
                    variant={options.signFile === null ? 'contained' : 'outlined'}
                    onClick={() => updateOption('signFile', null)}
                    sx={{ minHeight: 64 }}
                  >
                    사용 안 함
                  </Button>
                  {SIGN_PRESETS.map(({ file, label }) => (
                    <Button
                      key={file}
                      size="small"
                      variant={options.signFile === file ? 'contained' : 'outlined'}
                      onClick={() => updateOption('signFile', file)}
                      aria-label={label}
                      sx={{ minWidth: 0, minHeight: 64, flexDirection: 'column', gap: 0.5, p: 0.5 }}
                    >
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: '100%',
                          height: 34,
                          bgcolor: 'white',
                          borderRadius: 1,
                          backgroundImage: `url("${signUrl(file)}")`,
                          backgroundSize: 'auto 180px',
                          backgroundPosition: 'right bottom',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                      <Typography variant="caption" sx={{ lineHeight: 1.2, color: 'inherit' }}>
                        {label}
                      </Typography>
                    </Button>
                  ))}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    여백 배경
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    fullWidth
                    exclusive
                    value={options.backgroundMode}
                    onChange={(_, value: SignOptions['backgroundMode'] | null) => {
                      if (value) updateOption('backgroundMode', value);
                    }}
                    aria-label="여백 배경"
                  >
                    <ToggleButton value="white">흰색</ToggleButton>
                    <ToggleButton value="transparent">투명</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <OptionSlider
                  label="바깥 여백"
                  value={options.padding}
                  min={0}
                  max={25}
                  onChange={(value) => updateOption('padding', value)}
                />
                <OptionSlider
                  label="하단 여백"
                  value={options.footer}
                  min={0}
                  max={30}
                  onChange={(value) => updateOption('footer', value)}
                />
                <OptionSlider
                  label="모서리 둥글기"
                  value={options.radius}
                  min={0}
                  max={30}
                  onChange={(value) => updateOption('radius', value)}
                />
                <OptionSlider
                  label="싸인 크기"
                  value={options.signSize}
                  min={5}
                  max={100}
                  onChange={(value) => updateOption('signSize', value)}
                />
                <OptionSlider
                  label="싸인 각도"
                  value={options.signAngle}
                  min={-180}
                  max={180}
                  suffix="°"
                  onChange={(value) => updateOption('signAngle', value)}
                />
                <OptionSlider
                  label="가로 위치"
                  value={options.signX}
                  min={0}
                  max={100}
                  onChange={(value) => updateOption('signX', value)}
                />
                <OptionSlider
                  label="세로 위치"
                  value={options.signY}
                  min={0}
                  max={100}
                  onChange={(value) => updateOption('signY', value)}
                />
                <Typography variant="caption" color="text.secondary">
                  미리보기를 클릭하거나 드래그해 싸인 위치를 바꿀 수 있습니다. 설정은 모든 이미지에
                  적용됩니다.
                </Typography>
              </Stack>
              <Stack
                spacing={1}
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  bottom: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={startOver}
                >
                  다른 사진
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={
                    exporting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  disabled={!signReady || exporting}
                  onClick={saveSelected}
                >
                  결과물 저장
                </Button>
                {items.length > 1 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadRoundedIcon />}
                    disabled={!signReady || exporting}
                    onClick={saveAll}
                  >
                    전체 ZIP 저장
                  </Button>
                )}
              </Stack>
            </Card>
            <Card
              sx={{
                p: 2,
                flex: 1,
                width: '100%',
                minWidth: 0,
                minHeight: 420,
                textAlign: 'center',
                bgcolor: 'grey.100',
              }}
            >
              {selected ? (
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      maxWidth: '100%',
                      overflow: 'auto',
                      boxShadow: 3,
                      lineHeight: 0,
                      backgroundImage:
                        options.backgroundMode === 'transparent'
                          ? 'conic-gradient(#d9dee5 25%, #ffffff 0 50%, #d9dee5 0 75%, #ffffff 0)'
                          : 'none',
                      backgroundSize: '20px 20px',
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
                        maxHeight: '70vh',
                        width: 'auto',
                        height: 'auto',
                        touchAction: 'none',
                        cursor: options.signFile ? 'crosshair' : 'default',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {selected.file.name} · 원본 {selected.image.naturalWidth} ×{' '}
                    {selected.image.naturalHeight}px
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    출력 {Math.round(selected.image.naturalWidth * (1 + options.padding / 50))} ×{' '}
                    {Math.round(
                      selected.image.naturalHeight +
                        (selected.image.naturalWidth * (options.padding + options.footer)) / 100
                    )}
                    px
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{ minHeight: 380 }}
                >
                  <UploadRoundedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
                  <Typography color="text.secondary">
                    이미지를 한 장 또는 여러 장 올려 주세요.
                  </Typography>
                  <Button variant="outlined" onClick={() => fileRef.current?.click()}>
                    이미지 선택
                  </Button>
                </Stack>
              )}
            </Card>
            {items.length > 0 && (
              <Card
                sx={{
                  p: 2,
                  width: { xs: '100%', lg: 220 },
                  flexShrink: 0,
                  maxHeight: { lg: '75vh' },
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  이미지 ({items.length})
                </Typography>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  onClick={() => fileRef.current?.click()}
                  sx={{ mb: 1 }}
                >
                  사진 추가
                </Button>
                <Stack spacing={1}>
                  {items.map((item) => (
                    <Stack key={item.id} direction="row" alignItems="center" spacing={0.5}>
                      <Button
                        variant={item.id === selected?.id ? 'contained' : 'outlined'}
                        onClick={() => setSelectedId(item.id)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                        }}
                      >
                        <Box
                          component="img"
                          src={item.url}
                          alt=""
                          sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 1, mr: 1 }}
                        />
                        <Box
                          component="span"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.file.name}
                        </Box>
                      </Button>
                      <IconButton
                        size="small"
                        aria-label={`${item.file.name} 제거`}
                        onClick={() => removeItem(item.id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Stack>
    </DashboardContent>
  );
}
