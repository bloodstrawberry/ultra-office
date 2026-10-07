'use client';

import { toast } from 'sonner';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';
import { STUDIO_FONTS, ensureStudioFontsLoaded } from 'src/sections/gif-studio/data/gif-fonts';

import { loadWebtoonSample, WEBTOON_SAMPLE_IMAGES } from './webtoon-samples';
import {
  type Bubble,
  createBubble,
  BUBBLE_SHAPES,
  RESIZE_HANDLES,
  isTextOnlyShape,
  type BorderStyle,
  type BubbleShape,
  drawWebtoonCanvas,
  type ResizeHandle,
  type TailDirection,
  RESIZE_HANDLE_OFFSET,
} from './bubble-renderer';

const LOCAL_FONTS = [
  { label: '잘난고딕', family: 'JalnanGothic', url: '/fonts/JalnanGothicTTF.ttf' },
  { label: '잘난체 2', family: 'Jalnan2', url: '/fonts/Jalnan2TTF.ttf' },
  { label: '카페24 동동', family: 'Cafe24Dongdong', url: '/fonts/Cafe24DongdongRegular.ttf' },
  { label: '사용자 폰트 (my-font)', family: 'MyFont', url: '/fonts/my-font.ttf' },
];

const FONT_OPTIONS = [
  ...LOCAL_FONTS.map(({ label, family }) => ({ label, value: `"${family}", sans-serif` })),
  ...STUDIO_FONTS.map(({ name, family }) => ({ label: name, value: family })),
  { label: '맑은 고딕', value: '"Malgun Gothic", sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

const BUBBLE_SETTINGS_KEY = 'webtoon-studio:bubble-settings:v1';

function restoreBubbles(value: unknown): Bubble[] | null {
  if (!Array.isArray(value)) return null;
  return value.slice(0, 100).flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const saved = entry as Partial<Bubble>;
    if (
      typeof saved.id !== 'string' ||
      typeof saved.shape !== 'string' ||
      !BUBBLE_SHAPES.some(({ id }) => id === saved.shape)
    )
      return [];
    const bubble = createBubble(saved.shape as BubbleShape, index);
    for (const key of Object.keys(bubble) as (keyof Bubble)[]) {
      const field = saved[key];
      if (
        typeof field === typeof bubble[key] &&
        (typeof field !== 'number' || (Number.isFinite(field) && Math.abs(field) < 10_000))
      ) {
        Object.assign(bubble, { [key]: field });
      }
    }
    return [bubble];
  });
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Box
        component="input"
        type="color"
        aria-label={label}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        sx={{ width: 40, height: 36, p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer' }}
      />
      <TextField
        size="small"
        label={label}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) onChange(event.target.value);
        }}
        onBlur={() => {
          if (!/^#[0-9a-fA-F]{6}$/.test(draft)) setDraft(value);
        }}
        sx={{ minWidth: 0, flex: 1 }}
      />
    </Stack>
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
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
        step={step}
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
        sx={{ py: 0.5 }}
      />
    </Box>
  );
}

export function WebtoonBubbleView() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const loadedFontsRef = useRef(new Set<string>());
  const dragRef = useRef<
    | { mode: 'move'; id: string; dx: number; dy: number }
    | {
        mode: 'resize';
        bubble: Bubble;
        handle: ResizeHandle;
        offsetX: number;
        offsetY: number;
      }
    | null
  >(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 900 });
  const [background, setBackground] = useState('#ffffff');
  const [bubbles, setBubbles] = useState<Bubble[]>(() => [createBubble('oval', 0)]);
  const [selectedId, setSelectedId] = useState<string | null>(bubbles[0]?.id ?? null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [fontRevision, setFontRevision] = useState(0);
  const selected = bubbles.find((bubble) => bubble.id === selectedId) ?? null;
  const selectedFontFamily = selected?.fontFamily;
  const textOnlyShape = selected ? isTextOnlyShape(selected.shape) : false;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BUBBLE_SETTINGS_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const data = parsed as { background?: unknown; bubbles?: unknown; selectedId?: unknown };
          if (typeof data.background === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.background)) {
            setBackground(data.background);
          }
          const restored = restoreBubbles(data.bubbles);
          if (restored) {
            setBubbles(restored);
            setSelectedId(
              typeof data.selectedId === 'string' &&
                restored.some((bubble) => bubble.id === data.selectedId)
                ? data.selectedId
                : data.selectedId === null
                  ? null
                  : (restored[0]?.id ?? null)
            );
          }
        }
      }
    } catch {
      // Keep the editor usable if local storage is unavailable or invalid.
    }
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    try {
      localStorage.setItem(
        BUBBLE_SETTINGS_KEY,
        JSON.stringify({ background, bubbles, selectedId })
      );
    } catch {
      // The current session still works when local storage is full or disabled.
    }
  }, [background, bubbles, selectedId, settingsReady]);

  useEffect(() => {
    ensureStudioFontsLoaded();
  }, []);

  useEffect(() => {
    if (!selectedFontFamily) return;
    const local = LOCAL_FONTS.find(({ family }) => selectedFontFamily.includes(`"${family}"`));
    if (local && !loadedFontsRef.current.has(local.family)) {
      loadedFontsRef.current.add(local.family);
      const font = new FontFace(
        local.family,
        `url("${process.env.NEXT_PUBLIC_BASE_PATH || ''}${local.url}")`
      );
      font
        .load()
        .then((loaded) => {
          document.fonts.add(loaded);
          setFontRevision((value) => value + 1);
        })
        .catch(() => {
          loadedFontsRef.current.delete(local.family);
          toast.error(`${local.label} 폰트를 불러오지 못했습니다.`);
        });
    } else {
      document.fonts
        .load(`16px ${selectedFontFamily}`)
        .then(() => setFontRevision((value) => value + 1))
        .catch(() => {});
    }
  }, [selectedFontFamily]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    drawWebtoonCanvas(canvas, image, background, bubbles, selectedId ?? undefined);
  }, [canvasSize, image, background, bubbles, selectedId, fontRevision]);

  const updateSelected = useCallback(
    (patch: Partial<Bubble>) => {
      if (!selectedId) return;
      setBubbles((items) =>
        items.map((item) => (item.id === selectedId ? { ...item, ...patch } : item))
      );
    },
    [selectedId]
  );

  const addBubble = (shape: BubbleShape) => {
    const bubble = createBubble(shape, bubbles.length);
    setBubbles((items) => [...items, bubble]);
    setSelectedId(bubble.id);
  };

  const changeSelectedShape = (shape: BubbleShape) => {
    const preset = createBubble(shape, 0);
    updateSelected({
      shape,
      width: preset.width,
      height: preset.height,
      tail: preset.tail,
      tailLength: preset.tailLength,
      fill: preset.fill,
      stroke: preset.stroke,
      strokeWidth: preset.strokeWidth,
      tailWidth: preset.tailWidth,
      tailPosition: preset.tailPosition,
      borderStyle: preset.borderStyle,
      flipX: preset.flipX,
      flipY: preset.flipY,
      shadowBlur: preset.shadowBlur,
      shadowColor: preset.shadowColor,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      italic: preset.italic,
      textColor: preset.textColor,
      textStrokeColor: preset.textStrokeColor,
      textStrokeWidth: preset.textStrokeWidth,
      lineHeight: preset.lineHeight,
    });
  };

  const removeSelected = () => {
    setBubbles((items) => items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  useEffect(() => {
    if (!selectedId) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || event.defaultPrevented || event.isComposing) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable], [role="textbox"]'))
      )
        return;
      event.preventDefault();
      setBubbles((items) => items.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      dragRef.current = null;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      x: Math.min(selected.x + 0.05, 0.9),
      y: Math.min(selected.y + 0.05, 0.9),
    };
    setBubbles((items) => [...items, copy]);
    setSelectedId(copy.id);
  };

  const moveLayer = (direction: -1 | 1) => {
    setBubbles((items) => {
      const index = items.findIndex((item) => item.id === selectedId);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= items.length) return items;
      const result = [...items];
      [result[index], result[next]] = [result[next], result[index]];
      return result;
    });
  };

  const uploadImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일을 선택하세요.');
      return;
    }
    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      const scale = Math.min(1, 2400 / nextImage.naturalWidth, 3000 / nextImage.naturalHeight);
      setCanvasSize({
        width: Math.round(nextImage.naturalWidth * scale),
        height: Math.round(nextImage.naturalHeight * scale),
      });
      setImage(nextImage);
      URL.revokeObjectURL(url);
    };
    nextImage.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('이미지를 불러오지 못했습니다.');
    };
    nextImage.src = url;
  };

  const selectSample = async (url: string) => {
    try {
      uploadImage(await loadWebtoonSample(url));
    } catch {
      toast.error('예시 이미지를 불러오지 못했습니다.');
    }
  };

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const toBubbleLocal = (point: { x: number; y: number }, bubble: Bubble) => {
    const dx = (point.x - bubble.x) * canvasSize.width;
    const dy = (point.y - bubble.y) * canvasSize.height;
    const radians = (bubble.rotation * Math.PI) / 180;
    return {
      x: dx * Math.cos(radians) + dy * Math.sin(radians),
      y: -dx * Math.sin(radians) + dy * Math.cos(radians),
    };
  };

  const resizeHandleAt = (
    point: { x: number; y: number },
    bubble: Bubble,
    canvas: HTMLCanvasElement
  ) => {
    const local = toBubbleLocal(point, bubble);
    const w = bubble.width * canvasSize.width;
    const h = bubble.height * canvasSize.width;
    const hitRadius = (14 * canvasSize.width) / canvas.getBoundingClientRect().width;
    return RESIZE_HANDLES.find(
      ({ x, y }) =>
        Math.hypot(
          local.x - x * (w / 2 + RESIZE_HANDLE_OFFSET),
          local.y - y * (h / 2 + RESIZE_HANDLE_OFFSET)
        ) <= hitRadius
    );
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    if (selected) {
      const handle = resizeHandleAt(point, selected, event.currentTarget);
      if (handle) {
        const local = toBubbleLocal(point, selected);
        dragRef.current = {
          mode: 'resize',
          bubble: { ...selected },
          handle,
          offsetX:
            local.x - handle.x * ((selected.width * canvasSize.width) / 2 + RESIZE_HANDLE_OFFSET),
          offsetY:
            local.y - handle.y * ((selected.height * canvasSize.width) / 2 + RESIZE_HANDLE_OFFSET),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        event.preventDefault();
        return;
      }
    }
    const hit = [...bubbles].reverse().find((bubble) => {
      const { x: localX, y: localY } = toBubbleLocal(point, bubble);
      return (
        Math.abs(localX) <= (bubble.width * canvasSize.width) / 2 &&
        Math.abs(localY) <= (bubble.height * canvasSize.width) / 2
      );
    });
    setSelectedId(hit?.id ?? null);
    if (hit) {
      dragRef.current = { mode: 'move', id: hit.id, dx: point.x - hit.x, dy: point.y - hit.y };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
      event.preventDefault();
    } else {
      dragRef.current = null;
    }
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    if (!dragRef.current) {
      const handle = selected && resizeHandleAt(point, selected, event.currentTarget);
      event.currentTarget.style.cursor = handle
        ? handle.x === 0
          ? 'ns-resize'
          : handle.y === 0
            ? 'ew-resize'
            : handle.x === handle.y
              ? 'nwse-resize'
              : 'nesw-resize'
        : 'move';
      return;
    }
    if (dragRef.current.mode === 'resize') {
      const { bubble, handle, offsetX, offsetY } = dragRef.current;
      const local = toBubbleLocal(point, bubble);
      const oldW = bubble.width * canvasSize.width;
      const oldH = bubble.height * canvasSize.width;
      const newW =
        handle.x === 0
          ? oldW
          : Math.max(
              canvasSize.width * 0.1,
              Math.min(
                canvasSize.width,
                oldW + handle.x * (local.x - offsetX - handle.x * (oldW / 2 + RESIZE_HANDLE_OFFSET))
              )
            );
      const newH =
        handle.y === 0
          ? oldH
          : Math.max(
              canvasSize.width * 0.08,
              Math.min(
                canvasSize.width * 0.8,
                oldH + handle.y * (local.y - offsetY - handle.y * (oldH / 2 + RESIZE_HANDLE_OFFSET))
              )
            );
      const shiftX = (handle.x * (newW - oldW)) / 2;
      const shiftY = (handle.y * (newH - oldH)) / 2;
      const radians = (bubble.rotation * Math.PI) / 180;
      const canvasShiftX = shiftX * Math.cos(radians) - shiftY * Math.sin(radians);
      const canvasShiftY = shiftX * Math.sin(radians) + shiftY * Math.cos(radians);
      setBubbles((items) =>
        items.map((item) =>
          item.id === bubble.id
            ? {
                ...item,
                width: newW / canvasSize.width,
                height: newH / canvasSize.width,
                x: bubble.x + canvasShiftX / canvasSize.width,
                y: bubble.y + canvasShiftY / canvasSize.height,
              }
            : item
        )
      );
      return;
    }
    const { id, dx, dy } = dragRef.current;
    setBubbles((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(0, Math.min(1, point.x - dx)),
              y: Math.max(0, Math.min(1, point.y - dy)),
            }
          : item
      )
    );
  };

  const exportPng = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      drawWebtoonCanvas(canvas, image, background, bubbles);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'webtoon-bubbles.png';
      link.click();
      toast.success('결과물을 PNG로 저장했습니다.');
    } catch {
      toast.error('PNG 저장에 실패했습니다.');
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
            웹툰 말풍선 추가
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이미지를 올리고 말풍선을 배치하세요. 드래그해 이동하고, 손잡이로 크기를 조절하세요.
          </Typography>
        </Box>
        {!image ? (
          <PhotoUploadWorkspace
            sampleImages={WEBTOON_SAMPLE_IMAGES}
            onSelectSample={(url) => void selectSample(url)}
            onFileSelect={uploadImage}
            title="말풍선을 넣을 이미지 업로드"
            subtitle="사진을 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요."
          />
        ) : (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
            <Card
              sx={{
                p: 2,
                width: { xs: '100%', lg: 220 },
                flexShrink: 0,
                maxHeight: { lg: 'calc(100vh - 160px)' },
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                말풍선 종류
              </Typography>
              <Box
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}
              >
                {BUBBLE_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    variant="outlined"
                    size="small"
                    title={shape.label}
                    onClick={() => addBubble(shape.id)}
                    sx={{
                      minHeight: 36,
                      minWidth: 0,
                      px: 0.5,
                      fontSize: '0.625rem',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {shape.label}
                    </Box>
                  </Button>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <ColorField label="캔버스 배경색" value={background} onChange={setBackground} />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                레이어 ({bubbles.length})
              </Typography>
              <Stack spacing={0.5}>
                {[...bubbles].reverse().map((bubble, index) => (
                  <Button
                    key={bubble.id}
                    variant={selectedId === bubble.id ? 'contained' : 'text'}
                    color={selectedId === bubble.id ? 'primary' : 'inherit'}
                    onClick={() => setSelectedId(bubble.id)}
                    title={`${BUBBLE_SHAPES.find((shape) => shape.id === bubble.shape)?.label} · ${bubble.text}`}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      minWidth: 0,
                      maxWidth: '100%',
                      px: 0.75,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.7rem',
                      }}
                    >
                      {bubbles.length - index}.{' '}
                      {BUBBLE_SHAPES.find((shape) => shape.id === bubble.shape)?.label} ·{' '}
                      {bubble.text.replace(/\s+/g, ' ')}
                    </Box>
                  </Button>
                ))}
              </Stack>
            </Card>
            <Card
              sx={{
                p: 2,
                flex: 1,
                width: '100%',
                minWidth: 0,
                textAlign: 'center',
                bgcolor: 'grey.100',
              }}
            >
              <Box
                sx={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  overflow: 'auto',
                  boxShadow: 3,
                  lineHeight: 0,
                }}
              >
                <canvas
                  ref={previewRef}
                  tabIndex={0}
                  onPointerDown={pointerDown}
                  onPointerMove={pointerMove}
                  onPointerUp={() => {
                    dragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null;
                  }}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '72vh',
                    width: 'auto',
                    height: 'auto',
                    touchAction: 'none',
                    cursor: 'move',
                  }}
                  aria-label="웹툰 말풍선 캔버스"
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                말풍선을 드래그해 이동 · 손잡이로 크기 조절 · Delete 키로 삭제 · {canvasSize.width}{' '}
                × {canvasSize.height}
                px
              </Typography>
            </Card>
            <Card
              sx={{
                p: 2,
                width: { xs: '100%', lg: 280 },
                flexShrink: 0,
                maxHeight: { lg: 'calc(100vh - 160px)' },
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                말풍선 편집
              </Typography>
              {!selected ? (
                <Typography color="text.secondary">말풍선을 선택하거나 새로 추가하세요.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton aria-label="복제" title="복제" onClick={duplicateSelected}>
                      <ContentCopyRoundedIcon />
                    </IconButton>
                    <IconButton aria-label="앞으로" title="앞으로" onClick={() => moveLayer(1)}>
                      <ArrowUpwardRoundedIcon />
                    </IconButton>
                    <IconButton aria-label="뒤로" title="뒤로" onClick={() => moveLayer(-1)}>
                      <ArrowDownwardRoundedIcon />
                    </IconButton>
                    <IconButton
                      aria-label="삭제"
                      title="삭제"
                      color="error"
                      onClick={removeSelected}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Stack>
                  <TextField
                    multiline
                    minRows={3}
                    label="대사"
                    value={selected.text}
                    onChange={(event) => updateSelected({ text: event.target.value })}
                    fullWidth
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>말풍선 모양</InputLabel>
                    <Select
                      label="말풍선 모양"
                      value={selected.shape}
                      onChange={(event) => changeSelectedShape(event.target.value as BubbleShape)}
                    >
                      {BUBBLE_SHAPES.map(({ id, label }) => (
                        <MenuItem key={id} value={id}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!textOnlyShape && (
                    <FormControl size="small" fullWidth>
                      <InputLabel>꼬리 방향</InputLabel>
                      <Select
                        label="꼬리 방향"
                        value={selected.tail}
                        onChange={(event) =>
                          updateSelected({ tail: event.target.value as TailDirection })
                        }
                      >
                        {(['bottom', 'top', 'left', 'right', 'none'] as const).map(
                          (value, index) => (
                            <MenuItem key={value} value={value}>
                              {['아래', '위', '왼쪽', '오른쪽', '없음'][index]}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  )}
                  {!textOnlyShape && selected.tail !== 'none' && (
                    <>
                      <NumberSlider
                        label="꼭지 길이"
                        value={Math.round(selected.tailLength * 100)}
                        min={5}
                        max={60}
                        onChange={(value) => updateSelected({ tailLength: value / 100 })}
                        suffix="%"
                      />
                      {selected.shape !== 'thought' && (
                        <>
                          <NumberSlider
                            label="꼭지 폭"
                            value={Math.round((selected.tailWidth ?? 0.24) * 100)}
                            min={10}
                            max={50}
                            onChange={(value) => updateSelected({ tailWidth: value / 100 })}
                            suffix="%"
                          />
                          <NumberSlider
                            label="꼭지 위치"
                            value={Math.round((selected.tailPosition ?? 0) * 100)}
                            min={-60}
                            max={60}
                            onChange={(value) => updateSelected({ tailPosition: value / 100 })}
                            suffix="%"
                          />
                        </>
                      )}
                    </>
                  )}
                  <Divider />
                  {!textOnlyShape && (
                    <ColorField
                      label="말풍선 배경색"
                      value={selected.fill}
                      onChange={(fill) => updateSelected({ fill })}
                    />
                  )}
                  {!textOnlyShape && (
                    <ColorField
                      label="테두리 색"
                      value={selected.stroke}
                      onChange={(stroke) => updateSelected({ stroke })}
                    />
                  )}
                  {!textOnlyShape && (
                    <NumberSlider
                      label="테두리 굵기"
                      value={selected.strokeWidth}
                      min={0}
                      max={24}
                      onChange={(strokeWidth) => updateSelected({ strokeWidth })}
                      suffix="px"
                    />
                  )}
                  {!textOnlyShape && (
                    <FormControl size="small" fullWidth>
                      <InputLabel>테두리 스타일</InputLabel>
                      <Select
                        label="테두리 스타일"
                        value={selected.borderStyle ?? 'solid'}
                        onChange={(event) =>
                          updateSelected({ borderStyle: event.target.value as BorderStyle })
                        }
                      >
                        <MenuItem value="solid">실선</MenuItem>
                        <MenuItem value="dashed">점선</MenuItem>
                        <MenuItem value="dotted">작은 점선</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  {!textOnlyShape && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        fullWidth
                        size="small"
                        variant={selected.flipX ? 'contained' : 'outlined'}
                        aria-pressed={Boolean(selected.flipX)}
                        onClick={() => updateSelected({ flipX: !selected.flipX })}
                      >
                        좌우 대칭
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        variant={selected.flipY ? 'contained' : 'outlined'}
                        aria-pressed={Boolean(selected.flipY)}
                        onClick={() => updateSelected({ flipY: !selected.flipY })}
                      >
                        상하 대칭
                      </Button>
                    </Stack>
                  )}
                  {!textOnlyShape && (
                    <NumberSlider
                      label="그림자 흐림"
                      value={selected.shadowBlur ?? 0}
                      min={0}
                      max={30}
                      onChange={(shadowBlur) => updateSelected({ shadowBlur })}
                      suffix="px"
                    />
                  )}
                  {!textOnlyShape && Boolean(selected.shadowBlur) && (
                    <ColorField
                      label="그림자 색"
                      value={selected.shadowColor ?? '#555555'}
                      onChange={(shadowColor) => updateSelected({ shadowColor })}
                    />
                  )}
                  <NumberSlider
                    label="투명도"
                    value={selected.opacity}
                    min={10}
                    max={100}
                    onChange={(opacity) => updateSelected({ opacity })}
                    suffix="%"
                  />
                  <NumberSlider
                    label="가로 크기"
                    value={Math.round(selected.width * 100)}
                    min={10}
                    max={100}
                    onChange={(value) => updateSelected({ width: value / 100 })}
                    suffix="%"
                  />
                  <NumberSlider
                    label="세로 크기"
                    value={Math.round(selected.height * 100)}
                    min={8}
                    max={80}
                    onChange={(value) => updateSelected({ height: value / 100 })}
                    suffix="%"
                  />
                  <NumberSlider
                    label="회전"
                    value={selected.rotation}
                    min={-180}
                    max={180}
                    onChange={(rotation) => updateSelected({ rotation })}
                    suffix="°"
                  />
                  <Divider />
                  <FormControl size="small" fullWidth>
                    <InputLabel>폰트</InputLabel>
                    <Select
                      label="폰트"
                      value={selected.fontFamily}
                      onChange={(event) => updateSelected({ fontFamily: event.target.value })}
                    >
                      {FONT_OPTIONS.map((font) => (
                        <MenuItem key={font.label} value={font.value}>
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <ColorField
                    label="글자색"
                    value={selected.textColor}
                    onChange={(textColor) => updateSelected({ textColor })}
                  />
                  <ColorField
                    label="글자 윤곽선 색"
                    value={selected.textStrokeColor ?? '#171717'}
                    onChange={(textStrokeColor) => updateSelected({ textStrokeColor })}
                  />
                  <NumberSlider
                    label="글자 윤곽선 굵기"
                    value={selected.textStrokeWidth ?? 0}
                    min={0}
                    max={12}
                    step={0.5}
                    onChange={(textStrokeWidth) => updateSelected({ textStrokeWidth })}
                    suffix="px"
                  />
                  <NumberSlider
                    label="글자 크기"
                    value={selected.fontSize}
                    min={12}
                    max={100}
                    onChange={(fontSize) => updateSelected({ fontSize })}
                    suffix="px"
                  />
                  <NumberSlider
                    label="글자 굵기"
                    value={selected.fontWeight}
                    min={100}
                    max={900}
                    step={100}
                    onChange={(fontWeight) => updateSelected({ fontWeight })}
                  />
                  <ToggleButtonGroup
                    size="small"
                    fullWidth
                    value={selected.italic ? 'italic' : 'normal'}
                    exclusive
                    onChange={(_, value) => {
                      if (value) updateSelected({ italic: value === 'italic' });
                    }}
                  >
                    <ToggleButton value="normal">보통</ToggleButton>
                    <ToggleButton value="italic">기울임</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    size="small"
                    fullWidth
                    value={selected.textAlign}
                    exclusive
                    onChange={(_, value) => {
                      if (value) updateSelected({ textAlign: value });
                    }}
                  >
                    <ToggleButton value="left">왼쪽</ToggleButton>
                    <ToggleButton value="center">가운데</ToggleButton>
                    <ToggleButton value="right">오른쪽</ToggleButton>
                  </ToggleButtonGroup>
                  <NumberSlider
                    label="줄 간격"
                    value={selected.lineHeight}
                    min={0.8}
                    max={2}
                    step={0.05}
                    onChange={(lineHeight) => updateSelected({ lineHeight })}
                  />
                  <NumberSlider
                    label="글자 간격"
                    value={selected.letterSpacing}
                    min={-3}
                    max={12}
                    step={0.5}
                    onChange={(letterSpacing) => updateSelected({ letterSpacing })}
                    suffix="px"
                  />
                </Stack>
              )}
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
                  onClick={() => setImage(null)}
                >
                  다른 사진
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={exportPng}
                >
                  결과물 저장
                </Button>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </DashboardContent>
  );
}
