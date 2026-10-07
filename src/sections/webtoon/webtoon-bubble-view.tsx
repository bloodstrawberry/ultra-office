'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';
import { downloadDataUrl, shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';
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
  getImageBubbleAsset,
  RESIZE_HANDLE_OFFSET,
  preloadImageBubbleAssets,
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

const MAIN_PANEL_TABS = [
  { id: 'templates', label: '말풍선 템플릿' },
  { id: 'edit', label: '대사 & 스타일 편집' },
  { id: 'layers', label: '레이어 목록' },
] as const;

type MainPanelTab = (typeof MAIN_PANEL_TABS)[number]['id'];

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'basic', label: '기본 모양' },
  { id: 'effect', label: '효과·강조' },
  { id: 'asset', label: '일러스트 에셋' },
] as const;

type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]['id'];

interface TemplateItemInfo {
  id: BubbleShape;
  label: string;
  desc: string;
  category: 'basic' | 'effect' | 'asset';
  icon?: string;
  assetFile?: string;
}

const TEMPLATE_LIST: TemplateItemInfo[] = [
  // 기본 모양 (Basic)
  {
    id: 'oval',
    label: '기본 타원',
    desc: '대화용 기본 부드러운 타원',
    category: 'basic',
    icon: '💬',
  },
  {
    id: 'circleSpeech',
    label: '원형 말풍선',
    desc: '동그란 귀여운 대사 풍선',
    category: 'basic',
    icon: '🗨️',
  },
  {
    id: 'rounded',
    label: '둥근 사각형',
    desc: '메신저·모던 웹툰 대화',
    category: 'basic',
    icon: '🔲',
  },
  { id: 'box', label: '각진 말풍선', desc: '설명·차분한 대사 상자', category: 'basic', icon: '⏹️' },
  {
    id: 'narration',
    label: '내레이션',
    desc: '배경 해설·상황 설명 박스',
    category: 'basic',
    icon: '📜',
  },
  {
    id: 'chat',
    label: '메신저 대화',
    desc: '모바일 톡 메신저 말풍선',
    category: 'basic',
    icon: '📱',
  },
  {
    id: 'cloud',
    label: '구름 말풍선',
    desc: '부드러운 분위기·몽환 대사',
    category: 'basic',
    icon: '☁️',
  },

  // 효과 / 강조 (Effect)
  { id: 'shout', label: '외침 풍선', desc: '외침·큰 소리 대사', category: 'effect', icon: '📢' },
  {
    id: 'burst',
    label: '폭발 말풍선',
    desc: '강한 충격·고함·강조',
    category: 'effect',
    icon: '💥',
  },
  {
    id: 'spiky',
    label: '충격 스파이크',
    desc: '날카로운 긴장감·파편 효과',
    category: 'effect',
    icon: '⚡',
  },
  { id: 'thought', label: '생각 풍선', desc: '속마음·독백·상상', category: 'effect', icon: '💭' },
  {
    id: 'whisper',
    label: '속삭임',
    desc: '조용한 속삭임·비밀 이야기',
    category: 'effect',
    icon: '🤫',
  },
  { id: 'heart', label: '하트 풍선', desc: '두근두근·애정 표현', category: 'effect', icon: '❤️' },
  { id: 'star', label: '별 모양', desc: '반짝이는 환호·아이디어', category: 'effect', icon: '⭐' },
  {
    id: 'titleText',
    label: '큰 제목 글자',
    desc: '배경 없는 대형 타이틀',
    category: 'effect',
    icon: '🔤',
  },
  {
    id: 'emphasisText',
    label: '효과선 대사',
    desc: '효과음·집중 대사',
    category: 'effect',
    icon: '❗',
  },
  {
    id: 'outlinedText',
    label: '윤곽선 글자',
    desc: '외곽선 강조 텍스트',
    category: 'effect',
    icon: '🏷️',
  },

  // 일러스트 에셋 (Asset)
  {
    id: 'assetRetro',
    label: '손그림 둥근',
    desc: '고전 만화 감성 스케치',
    category: 'asset',
    assetFile: 'retro.png',
  },
  {
    id: 'assetComicCloud',
    label: '손그림 각진',
    desc: '만화풍 몽환 구름',
    category: 'asset',
    assetFile: 'comic-cloud.png',
  },
  {
    id: 'assetThought',
    label: '동글 생각',
    desc: '퐁퐁 방울 생각 거품',
    category: 'asset',
    assetFile: 'thought.png',
  },
  {
    id: 'assetPuffy',
    label: '푹신 구름',
    desc: '깔끔한 흰 구름 말풍선',
    category: 'asset',
    assetFile: 'blank-cloud.png',
  },
  {
    id: 'assetBurst',
    label: '번쩍 외침',
    desc: '효과음 집중선 폭발',
    category: 'asset',
    assetFile: 'burst.png',
  },
  {
    id: 'assetInk',
    label: '잉크 번짐',
    desc: '손그림 볼펜 스타일',
    category: 'asset',
    assetFile: 'round.png',
  },
  {
    id: 'assetBoldCloud',
    label: '진한 구름',
    desc: '선명한 손그림 라운드',
    category: 'asset',
    assetFile: 'round-alt.png',
  },
  {
    id: 'assetDashed',
    label: '점선 그림자',
    desc: '부드러운 점선 타원',
    category: 'asset',
    assetFile: 'oval.png',
  },
  {
    id: 'assetCallout',
    label: '손그림 네모',
    desc: '시선 집중 손그림 박스',
    category: 'asset',
    assetFile: 'callout.png',
  },
  {
    id: 'assetPink',
    label: '핑크 광택',
    desc: '광택 테두리 러블리 버블',
    category: 'asset',
    assetFile: 'pink-gloss.png',
  },
];

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
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        component="input"
        type="color"
        aria-label={label}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        sx={{
          width: 36,
          height: 36,
          p: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
        }}
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
    </Box>
  );
}

function CompactSlider({
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [fontRevision, setFontRevision] = useState(0);
  const [assetRevision, setAssetRevision] = useState(0);

  const [activeTab, setActiveTab] = useState<MainPanelTab>('templates');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(390);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(390);

  const selected = bubbles.find((bubble) => bubble.id === selectedId) ?? null;
  const selectedFontFamily = selected?.fontFamily;
  const textOnlyShape = selected ? isTextOnlyShape(selected.shape) : false;
  const imageAsset = selected ? getImageBubbleAsset(selected.shape) : undefined;

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
    let mounted = true;
    preloadImageBubbleAssets()
      .then(() => {
        if (mounted) setAssetRevision((value) => value + 1);
      })
      .catch(() => {
        if (mounted) toast.error('이미지 말풍선 일부를 불러오지 못했습니다.');
      });
    return () => {
      mounted = false;
    };
  }, []);

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
          if (restored && restored.length > 0) {
            setBubbles(restored);
            setSelectedId(
              typeof data.selectedId === 'string' &&
                restored.some((bubble) => bubble.id === data.selectedId)
                ? data.selectedId
                : restored[0].id
            );
          }
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
      localStorage.setItem(
        BUBBLE_SETTINGS_KEY,
        JSON.stringify({ background, bubbles, selectedId })
      );
    } catch {
      // ignore
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
  }, [canvasSize, image, background, bubbles, selectedId, fontRevision, assetRevision]);

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
    setActiveTab('edit');
    toast.success('새 말풍선이 추가되었습니다.');
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
    toast.success('말풍선이 복제되었습니다.');
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
      if (bubbles.length === 0) {
        const initial = createBubble('oval', 0);
        setBubbles([initial]);
        setSelectedId(initial.id);
      } else if (!selectedId) {
        setSelectedId(bubbles[0].id);
      }
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

  const bubbleAt = (point: { x: number; y: number }) => {
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = bubbles[i];
      const local = toBubbleLocal(point, bubble);
      const w = (bubble.width * canvasSize.width) / 2;
      const h = (bubble.height * canvasSize.width) / 2;
      if (Math.abs(local.x) <= w && Math.abs(local.y) <= h) {
        return bubble;
      }
    }
    return null;
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    if (selected) {
      const handle = resizeHandleAt(point, selected, event.currentTarget);
      if (handle) {
        event.currentTarget.setPointerCapture(event.pointerId);
        const local = toBubbleLocal(point, selected);
        dragRef.current = {
          mode: 'resize',
          bubble: selected,
          handle,
          offsetX:
            local.x - handle.x * ((selected.width * canvasSize.width) / 2 + RESIZE_HANDLE_OFFSET),
          offsetY:
            local.y - handle.y * ((selected.height * canvasSize.width) / 2 + RESIZE_HANDLE_OFFSET),
        };
        return;
      }
    }
    const hit = bubbleAt(point);
    if (hit) {
      setSelectedId(hit.id);
      setActiveTab('edit');
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        mode: 'move',
        id: hit.id,
        dx: point.x - hit.x,
        dy: point.y - hit.y,
      };
    } else {
      setSelectedId(null);
    }
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    if (!dragRef.current) {
      if (!selected) {
        event.currentTarget.style.cursor = 'default';
        return;
      }
      const handle = resizeHandleAt(point, selected, event.currentTarget);
      if (handle) {
        event.currentTarget.style.cursor =
          handle.x === 0
            ? 'ns-resize'
            : handle.y === 0
              ? 'ew-resize'
              : handle.x === handle.y
                ? 'nwse-resize'
                : 'nesw-resize';
      } else {
        const hit = bubbleAt(point);
        event.currentTarget.style.cursor = hit ? 'move' : 'default';
      }
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

  const handleSaveResult = async () => {
    setIsProcessing(true);
    try {
      await preloadImageBubbleAssets();
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      drawWebtoonCanvas(canvas, image, background, bubbles);
      const dataUrl = canvas.toDataURL('image/png');
      const res = await downloadDataUrl(dataUrl, `webtoon_bubble_${Date.now()}.png`);
      toast.success(res.message);
    } catch {
      toast.error('결과물 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      await preloadImageBubbleAssets();
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      drawWebtoonCanvas(canvas, image, background, bubbles);
      const dataUrl = canvas.toDataURL('image/png');
      const res = await shareToKakaoTalk(
        dataUrl,
        '[Ultra Office] 웹툰 말풍선 스튜디오 작품',
        `webtoon_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTemplates =
    templateCategory === 'all'
      ? TEMPLATE_LIST
      : TEMPLATE_LIST.filter((t) => t.category === templateCategory);

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
          웹툰 말풍선 스튜디오 (Webtoon Bubble Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          대사와 말풍선을 직관적으로 배치하고 모양·크기·스타일을 조절하여 생생한 웹툰 장면을
          완성합니다.
        </Typography>
      </Box>

      {!image ? (
        <PhotoUploadWorkspace
          sampleImages={WEBTOON_SAMPLE_IMAGES}
          onSelectSample={(url) => void selectSample(url)}
          onFileSelect={uploadImage}
          title="말풍선을 추가할 웹툰/사진 업로드"
          subtitle="PNG, JPG, WEBP 이미지를 드래그하거나 클릭하여 올려주세요."
          icon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 36 }} />}
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
          {/* Left: Main Canvas Workspace */}
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
              {/* Top Viewport Toolbar */}
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
                    label={`${canvasSize.width} × ${canvasSize.height} px`}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      배경:
                    </Typography>
                    <Box
                      component="input"
                      type="color"
                      value={background}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBackground(e.target.value)
                      }
                      title="캔버스 배경색"
                      sx={{
                        width: 24,
                        height: 24,
                        p: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        bgcolor: 'transparent',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="soft"
                    label={`레이어 ${bubbles.length}개`}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Box>
              </Box>

              {/* Canvas Center Area */}
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
                    bgcolor: background,
                    backgroundImage:
                      background === 'transparent'
                        ? 'conic-gradient(#e0e0e0 25%, #ffffff 0 50%, #e0e0e0 0 75%, #ffffff 0)'
                        : 'none',
                    backgroundSize: '20px 20px',
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
                      maxHeight: 'calc(100vh - 270px)',
                      width: 'auto',
                      height: 'auto',
                      touchAction: 'none',
                      cursor: 'default',
                    }}
                    aria-label="웹툰 말풍선 캔버스"
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
                말풍선 클릭하여 선택 · 드래그하여 이동 · 모서리 손잡이로 크기 조절 · Delete키로 삭제
              </Typography>
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

          {/* Right: Settings & Editing Controls */}
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
              {/* Category Tab Chips (Art-Style Pattern) */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, flexShrink: 0 }}>
                말풍선 스튜디오 컨트롤
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.25, flexShrink: 0 }}>
                {MAIN_PANEL_TABS.map((tab) => (
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

              {/* Dynamic Scrollable Content */}
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
                {/* TAB 1: 말풍선 템플릿 목록 */}
                {activeTab === 'templates' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <Chip
                          key={cat.id}
                          label={cat.label}
                          size="small"
                          clickable
                          color={templateCategory === cat.id ? 'primary' : 'default'}
                          variant={templateCategory === cat.id ? 'filled' : 'outlined'}
                          onClick={() => setTemplateCategory(cat.id)}
                          sx={{ fontSize: '0.68rem', height: 22 }}
                        />
                      ))}
                    </Box>

                    <ToggleButtonGroup
                      orientation="vertical"
                      value={selected?.shape || ''}
                      exclusive
                      fullWidth
                      sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}
                    >
                      {filteredTemplates.map((item) => (
                        <ToggleButton
                          key={item.id}
                          value={item.id}
                          onClick={() => {
                            if (selected) {
                              changeSelectedShape(item.id);
                              toast.success(
                                `선택된 말풍선이 '${item.label}' 모양으로 변경되었습니다.`
                              );
                            } else {
                              addBubble(item.id);
                            }
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: selected?.shape === item.id ? 'primary.main' : 'divider',
                            p: '7px 10px',
                            textAlign: 'left',
                            flexShrink: 0,
                            bgcolor:
                              selected?.shape === item.id ? 'primary.lighter' : 'transparent',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor:
                                selected?.shape === item.id ? 'primary.lighter' : 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 1,
                                bgcolor: 'background.neutral',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              {item.assetFile ? (
                                <Box
                                  component="img"
                                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/bubbles/${item.assetFile}`}
                                  alt=""
                                  sx={{ width: '85%', height: '85%', objectFit: 'contain' }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: '1.25rem' }}>{item.icon}</Typography>
                              )}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  color:
                                    selected?.shape === item.id ? 'primary.darker' : 'text.primary',
                                }}
                              >
                                {item.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.desc}
                              </Typography>
                            </Box>
                            <AddRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </Box>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                )}

                {/* TAB 2: 대사 & 스타일 편집 */}
                {activeTab === 'edit' && (
                  <>
                    {!selected ? (
                      <Box
                        sx={{
                          py: 5,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <ChatBubbleOutlineRoundedIcon
                          sx={{ fontSize: 44, color: 'text.disabled' }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          캔버스에서 편집할 말풍선을 클릭하거나
                          <br />
                          상단 &apos;말풍선 템플릿&apos;에서 새로 추가하세요.
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddRoundedIcon />}
                          onClick={() => setActiveTab('templates')}
                        >
                          말풍선 추가하기
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Selected Bubble Quick Actions */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 0.75,
                            bgcolor: 'background.neutral',
                            borderRadius: 1.5,
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700, pl: 0.5 }}>
                            {BUBBLE_SHAPES.find((s) => s.id === selected.shape)?.label || '말풍선'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <IconButton size="small" title="복제" onClick={duplicateSelected}>
                              <ContentCopyRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" title="위로" onClick={() => moveLayer(1)}>
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" title="아래로" onClick={() => moveLayer(-1)}>
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="삭제"
                              color="error"
                              onClick={removeSelected}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Dialogue Text */}
                        <TextField
                          multiline
                          minRows={3}
                          label="대사 입력"
                          value={selected.text}
                          onChange={(e) => updateSelected({ text: e.target.value })}
                          fullWidth
                          size="small"
                        />

                        {/* Font Selection */}
                        <FormControl size="small" fullWidth>
                          <InputLabel>폰트 서체</InputLabel>
                          <Select
                            label="폰트 서체"
                            value={selected.fontFamily}
                            onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                          >
                            {FONT_OPTIONS.map((f) => (
                              <MenuItem key={f.label} value={f.value}>
                                {f.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Text Formatting Controls */}
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <ToggleButtonGroup
                            size="small"
                            fullWidth
                            value={selected.textAlign}
                            exclusive
                            onChange={(_, v) => v && updateSelected({ textAlign: v })}
                          >
                            <ToggleButton value="left" aria-label="왼쪽 정렬">
                              <FormatAlignLeftRoundedIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="center" aria-label="가운데 정렬">
                              <FormatAlignCenterRoundedIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="right" aria-label="오른쪽 정렬">
                              <FormatAlignRightRoundedIcon fontSize="small" />
                            </ToggleButton>
                          </ToggleButtonGroup>

                          <ToggleButton
                            size="small"
                            value="italic"
                            selected={Boolean(selected.italic)}
                            onChange={() => updateSelected({ italic: !selected.italic })}
                            aria-label="기울임"
                            sx={{ px: 1.5 }}
                          >
                            <FormatItalicRoundedIcon fontSize="small" />
                          </ToggleButton>
                        </Box>

                        {/* Tail Direction for non-image shapes */}
                        {!textOnlyShape && !imageAsset && (
                          <FormControl size="small" fullWidth>
                            <InputLabel>꼬리 방향</InputLabel>
                            <Select
                              label="꼬리 방향"
                              value={selected.tail}
                              onChange={(e) =>
                                updateSelected({ tail: e.target.value as TailDirection })
                              }
                            >
                              {(['bottom', 'top', 'left', 'right', 'none'] as const).map(
                                (value, index) => (
                                  <MenuItem key={value} value={value}>
                                    {['아래', '위', '왼쪽', '오른쪽', '없음 (꼬리 없음)'][index]}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        )}

                        {/* Flip Buttons */}
                        {!textOnlyShape && (
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                            <Button
                              size="small"
                              variant={selected.flipX ? 'contained' : 'outlined'}
                              onClick={() => updateSelected({ flipX: !selected.flipX })}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              좌우 반전
                            </Button>
                            <Button
                              size="small"
                              variant={selected.flipY ? 'contained' : 'outlined'}
                              onClick={() => updateSelected({ flipY: !selected.flipY })}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              상하 반전
                            </Button>
                          </Box>
                        )}

                        <Divider sx={{ my: 0.5 }} />

                        {/* Colors Section */}
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'text.secondary' }}
                        >
                          색상 및 스타일
                        </Typography>

                        <ColorField
                          label="글자색"
                          value={selected.textColor}
                          onChange={(textColor) => updateSelected({ textColor })}
                        />

                        <ColorField
                          label="글자 외곽선색"
                          value={selected.textStrokeColor ?? '#171717'}
                          onChange={(textStrokeColor) => updateSelected({ textStrokeColor })}
                        />

                        {!textOnlyShape && !imageAsset && (
                          <>
                            <ColorField
                              label="말풍선 배경색"
                              value={selected.fill}
                              onChange={(fill) => updateSelected({ fill })}
                            />
                            <ColorField
                              label="테두리 색상"
                              value={selected.stroke}
                              onChange={(stroke) => updateSelected({ stroke })}
                            />
                            <FormControl size="small" fullWidth>
                              <InputLabel>테두리 스타일</InputLabel>
                              <Select
                                label="테두리 스타일"
                                value={selected.borderStyle ?? 'solid'}
                                onChange={(e) =>
                                  updateSelected({ borderStyle: e.target.value as BorderStyle })
                                }
                              >
                                <MenuItem value="solid">실선</MenuItem>
                                <MenuItem value="dashed">점선 (대시)</MenuItem>
                                <MenuItem value="dotted">작은 점선</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        )}

                        {!textOnlyShape && (
                          <ColorField
                            label="그림자 색상"
                            value={selected.shadowColor ?? '#555555'}
                            onChange={(shadowColor) => updateSelected({ shadowColor })}
                          />
                        )}
                      </Box>
                    )}
                  </>
                )}

                {/* TAB 3: 레이어 목록 */}
                {activeTab === 'layers' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary' }}
                      >
                        레이어 목록 ({bubbles.length})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setActiveTab('templates')}
                        sx={{ fontSize: '0.72rem' }}
                      >
                        말풍선 추가
                      </Button>
                    </Box>

                    {[...bubbles].reverse().map((b, idx) => {
                      const shapeInfo = BUBBLE_SHAPES.find((s) => s.id === b.shape);
                      const isCur = b.id === selectedId;
                      return (
                        <Box
                          key={b.id}
                          onClick={() => {
                            setSelectedId(b.id);
                            setActiveTab('edit');
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: '8px 10px',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: isCur ? 'primary.main' : 'divider',
                            bgcolor: isCur ? 'primary.lighter' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isCur ? 'primary.lighter' : 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip
                                size="small"
                                label={`#${bubbles.length - idx}`}
                                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                              />
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  color: isCur ? 'primary.darker' : 'text.primary',
                                }}
                              >
                                {shapeInfo?.label || '말풍선'}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.25,
                              }}
                            >
                              {b.text ? b.text.replace(/\s+/g, ' ') : '(대사 없음)'}
                            </Typography>
                          </Box>

                          <Box
                            sx={{ display: 'flex', alignItems: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconButton
                              size="small"
                              title="복제"
                              onClick={() => {
                                setSelectedId(b.id);
                                duplicateSelected();
                              }}
                            >
                              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="삭제"
                              onClick={() => {
                                setBubbles((items) => items.filter((item) => item.id !== b.id));
                                if (selectedId === b.id) setSelectedId(null);
                              }}
                            >
                              <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Sliders in compact container (Photo Art Style Pattern) */}
              {selected && (
                <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                  <CompactSlider
                    label="글자 크기 (Font Size)"
                    value={selected.fontSize}
                    min={12}
                    max={100}
                    onChange={(fontSize) => updateSelected({ fontSize })}
                    suffix="px"
                  />

                  {!textOnlyShape && !imageAsset && (
                    <CompactSlider
                      label="테두리 굵기 (Stroke Width)"
                      value={selected.strokeWidth}
                      min={0}
                      max={20}
                      onChange={(strokeWidth) => updateSelected({ strokeWidth })}
                      suffix="px"
                    />
                  )}

                  <CompactSlider
                    label="투명도 (Opacity)"
                    value={selected.opacity}
                    min={10}
                    max={100}
                    onChange={(opacity) => updateSelected({ opacity })}
                    suffix="%"
                  />

                  <CompactSlider
                    label="회전 각도 (Rotation)"
                    value={selected.rotation}
                    min={-180}
                    max={180}
                    onChange={(rotation) => updateSelected({ rotation })}
                    suffix="°"
                  />
                </Box>
              )}
            </Card>

            {/* Action Buttons (Photo Art Style Pattern) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.85,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => setImage(null)}
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
                  disabled={isProcessing}
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  공유
                </Button>
              </Box>

              {/* Main: Clean Result Save */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSaveResult}
                disabled={isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장 (PNG)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}

export default WebtoonBubbleView;
