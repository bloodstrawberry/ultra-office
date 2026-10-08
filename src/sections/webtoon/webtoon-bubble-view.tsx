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
import { getElementBounds } from 'src/sections/photo/utils/news-caption-renderer';
import { downloadDataUrl, shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';
import { STUDIO_FONTS, ensureStudioFontsLoaded } from 'src/sections/gif-studio/data/gif-fonts';

import { IMAGE_BUBBLE_ASSETS } from './bubble-assets';
import { getNewsStyle, NEWS_BUBBLE_STYLES } from './news-caption-bubbles';
import { NewsCaptionBubbleControls } from './news-caption-bubble-controls';
import { loadWebtoonSample, WEBTOON_SAMPLE_IMAGES } from './webtoon-samples';
import {
  type Bubble,
  createBubble,
  BUBBLE_SHAPES,
  RESIZE_HANDLES,
  isCaptionShape,
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
  { label: '뉴스 명조', value: '"Nanum Myeongjo", "Batang", serif' },
  { label: '뉴스 고딕', value: '"Malgun Gothic", "Noto Sans KR", sans-serif' },
  { label: '속보 임팩트', value: 'Impact, "Arial Black", sans-serif' },
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
  { id: 'caption', label: '자막 스타일' },
  { id: 'asset', label: '일러스트 에셋' },
] as const;

type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]['id'];

interface TemplateItemInfo {
  id: BubbleShape;
  label: string;
  desc: string;
  category: 'basic' | 'effect' | 'caption' | 'asset';
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

  // 뉴스 자막 스튜디오에서 가져온 방송·영상 자막 스타일
  {
    id: 'captionHuman',
    label: 'KBS 인간극장',
    desc: '명조체 다큐 인터뷰·방송 로고',
    category: 'caption',
    icon: '🎬',
  },
  ...NEWS_BUBBLE_STYLES.slice(1).map(({ shape }) => {
    const style = getNewsStyle(shape)!;
    return {
      id: shape,
      label: style.name,
      desc: style.description,
      category: 'caption' as const,
      icon: '📺',
    };
  }),
  {
    id: 'captionNews',
    label: '뉴스 하단 자막',
    desc: '상단 강조선과 NEWS 배지',
    category: 'caption',
    icon: '📰',
  },
  {
    id: 'captionBreaking',
    label: '속보 배너',
    desc: '붉은 강조선과 속보 배지',
    category: 'caption',
    icon: '🚨',
  },
  {
    id: 'captionVariety',
    label: '예능 강조 자막',
    desc: '밝은 배경의 예능형 강조 문구',
    category: 'caption',
    icon: '✨',
  },
  {
    id: 'captionYouTube',
    label: '유튜브형 자막',
    desc: '흰 글자·검은 반투명 배경',
    category: 'caption',
    icon: '▶️',
  },

  // 이미지 에셋은 bubble-assets.ts의 목록에서 자동으로 가져옵니다.
  ...IMAGE_BUBBLE_ASSETS.map(({ id, label, desc, file }) => ({
    id,
    label,
    desc,
    category: 'asset' as const,
    assetFile: file,
  })),
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
    | { mode: 'news-element'; id: string; elementId: string; dx: number; dy: number }
    | {
        mode: 'news-resize';
        id: string;
        elementId: string;
        fontSize: number;
        centerX: number;
        centerY: number;
        halfWidth: number;
        halfHeight: number;
        handle: ResizeHandle;
      }
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
  const [originalPreview, setOriginalPreview] = useState('');
  const [previewMode, setPreviewMode] = useState<'edit' | 'original' | 'compare'>('edit');
  const [compareStart, setCompareStart] = useState(30);
  const [compareEnd, setCompareEnd] = useState(70);
  const [compareOrientation, setCompareOrientation] = useState<'left-right' | 'top-bottom'>(
    'left-right'
  );
  const [compareOutside, setCompareOutside] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 900 });
  const [background, setBackground] = useState('#ffffff');
  const [bubbles, setBubbles] = useState<Bubble[]>(() => [createBubble('oval', 0)]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [fontRevision, setFontRevision] = useState(0);
  const [assetRevision, setAssetRevision] = useState(0);

  const [activeTab, setActiveTab] = useState<MainPanelTab>('templates');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(390);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(390);

  const selected = bubbles.find((bubble) => bubble.id === selectedId) ?? null;
  const selectedNewsElement = selected?.newsConfig?.elements.find(
    (element) => element.id === selected.newsConfig?.selectedElementId
  );
  const layerCount = bubbles.reduce(
    (count, bubble) => count + 1 + (bubble.newsConfig?.elements.length ?? 0),
    0
  );
  const activeAssetIds = [...new Set(bubbles.map(({ shape }) => shape).filter(getImageBubbleAsset))]
    .sort()
    .join('|');
  const selectedFontFamily = selected?.fontFamily;
  const textOnlyShape = selected ? isTextOnlyShape(selected.shape) : false;
  const captionShape = selected ? isCaptionShape(selected.shape) : false;
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
    if (!activeAssetIds) return undefined;
    let mounted = true;
    preloadImageBubbleAssets(activeAssetIds.split('|') as BubbleShape[])
      .then(() => {
        if (mounted) setAssetRevision((value) => value + 1);
      })
      .catch(() => {
        if (mounted) toast.error('이미지 말풍선 일부를 불러오지 못했습니다.');
      });
    return () => {
      mounted = false;
    };
  }, [activeAssetIds]);

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
    drawWebtoonCanvas(
      canvas,
      image,
      background,
      bubbles,
      previewMode === 'edit' ? (selectedId ?? undefined) : undefined
    );
  }, [
    canvasSize,
    image,
    background,
    bubbles,
    selectedId,
    fontRevision,
    assetRevision,
    previewMode,
  ]);

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
    if (bubble.newsConfig) bubble.height = canvasSize.height / canvasSize.width;
    setBubbles((items) => [...items, bubble]);
    setSelectedId(bubble.id);
    setActiveTab('edit');
    toast.success('새 말풍선이 추가되었습니다.');
  };

  const changeSelectedShape = (shape: BubbleShape) => {
    const preset = createBubble(shape, 0);
    if (preset.newsConfig) preset.height = canvasSize.height / canvasSize.width;
    updateSelected({
      shape,
      x: preset.x,
      y: preset.y,
      text: preset.newsConfig ? preset.text : (selected?.text ?? preset.text),
      width: preset.width,
      height: preset.height,
      newsConfig: preset.newsConfig,
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
      backgroundOpacity: preset.backgroundOpacity,
      cornerRadius: preset.cornerRadius,
      accentColor: preset.accentColor,
      badgeVisible: preset.badgeVisible,
      badgeText: preset.badgeText,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      italic: preset.italic,
      textColor: preset.textColor,
      textStrokeColor: preset.textStrokeColor,
      textStrokeWidth: preset.textStrokeWidth,
      textShadowBlur: preset.textShadowBlur,
      textShadowColor: preset.textShadowColor,
      textAlign: preset.textAlign,
      lineHeight: preset.lineHeight,
    });
  };

  const removeSelected = () => {
    if (selected?.newsConfig && selectedNewsElement && selectedNewsElement.isDeletable !== false) {
      setBubbles((items) => items.map((item) => item.id === selected.id && item.newsConfig ? {
        ...item,
        newsConfig: {
          ...item.newsConfig,
          elements: item.newsConfig.elements.filter((element) => element.id !== selectedNewsElement.id),
          selectedElementId: null,
        },
      } : item));
      return;
    }
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
      if (selected?.newsConfig && selectedNewsElement && selectedNewsElement.isDeletable !== false) {
        setBubbles((items) => items.map((item) => item.id === selectedId && item.newsConfig ? {
          ...item,
          newsConfig: {
            ...item.newsConfig,
            elements: item.newsConfig.elements.filter((element) => element.id !== selectedNewsElement.id),
            selectedElementId: null,
          },
        } : item));
        dragRef.current = null;
        return;
      }
      setBubbles((items) => items.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      dragRef.current = null;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, selectedNewsElement, selected]);

  const duplicateBubble = (bubble: Bubble) => {
    const copy = {
      ...bubble,
      id: crypto.randomUUID(),
      x: bubble.newsConfig ? bubble.x : Math.min(bubble.x + 0.05, 0.9),
      y: bubble.newsConfig ? bubble.y : Math.min(bubble.y + 0.05, 0.9),
      newsConfig: bubble.newsConfig ? {
        ...bubble.newsConfig,
        selectedElementId: null,
        elements: bubble.newsConfig.elements.map((element) => ({ ...element, id: crypto.randomUUID() })),
      } : undefined,
    };
    setBubbles((items) => [...items, copy]);
    setSelectedId(copy.id);
    toast.success('레이어가 복제되었습니다.');
  };

  const duplicateSelected = () => {
    if (!selected) return;
    if (selected.newsConfig && selectedNewsElement) {
      const id = crypto.randomUUID();
      setBubbles((items) => items.map((item) => item.id === selected.id && item.newsConfig ? {
        ...item,
        newsConfig: {
          ...item.newsConfig,
          elements: [...item.newsConfig.elements, { ...selectedNewsElement, id, name: `${selectedNewsElement.name} 복사`, x: Math.min(1, selectedNewsElement.x + 0.025), y: Math.min(1, selectedNewsElement.y + 0.025), isDeletable: true }],
          selectedElementId: id,
        },
      } : item));
      toast.success('자막 요소가 복제되었습니다.');
      return;
    }
    duplicateBubble(selected);
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
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = Math.round(nextImage.naturalWidth * scale);
      originalCanvas.height = Math.round(nextImage.naturalHeight * scale);
      originalCanvas
        .getContext('2d')
        ?.drawImage(nextImage, 0, 0, originalCanvas.width, originalCanvas.height);
      setOriginalPreview(originalCanvas.toDataURL('image/png'));
      setBubbles((items) =>
        items.map((item) =>
          item.newsConfig ? { ...item, height: originalCanvas.height / originalCanvas.width } : item
        )
      );
      setPreviewMode('edit');
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
        if (bubble.newsConfig && !newsElementAt(point, bubble)) continue;
        return bubble;
      }
    }
    return null;
  };

  const newsElementAt = (point: { x: number; y: number }, bubble: Bubble) => {
    if (!bubble.newsConfig) return null;
    const w = bubble.width * canvasSize.width;
    const h = bubble.height * canvasSize.width;
    const local = toBubbleLocal(point, bubble);
    const x = local.x + w / 2;
    const y = local.y + h / 2;
    const bounds = getElementBounds(w, h, bubble.newsConfig);
    return (
      [...bubble.newsConfig.elements].reverse().find((element) => {
        const box = bounds[element.id];
        return box && x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
      }) || null
    );
  };

  const newsElementHandleAt = (
    point: { x: number; y: number },
    bubble: Bubble,
    canvas: HTMLCanvasElement
  ) => {
    const config = bubble.newsConfig;
    const element = config?.elements.find((item) => item.id === config.selectedElementId);
    if (!config || !element?.visible) return null;
    const w = bubble.width * canvasSize.width;
    const h = bubble.height * canvasSize.width;
    const bounds = getElementBounds(w, h, config)[element.id];
    if (!bounds) return null;
    const local = toBubbleLocal(point, bubble);
    const x = local.x + w / 2;
    const y = local.y + h / 2;
    const hitRadius = (14 * canvasSize.width) / canvas.getBoundingClientRect().width;
    const handle = RESIZE_HANDLES.find(
      (candidate) =>
        Math.hypot(
          x - (bounds.x + ((candidate.x + 1) * bounds.width) / 2),
          y - (bounds.y + ((candidate.y + 1) * bounds.height) / 2)
        ) <= hitRadius
    );
    return handle ? { handle, bounds, element } : null;
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    if (selected) {
      const newsHandle = selected.newsConfig
        ? newsElementHandleAt(point, selected, event.currentTarget)
        : null;
      if (newsHandle) {
        const { handle, bounds, element } = newsHandle;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          mode: 'news-resize',
          id: selected.id,
          elementId: element.id,
          fontSize: element.fontSize,
          centerX: bounds.x + bounds.width / 2,
          centerY: bounds.y + bounds.height / 2,
          halfWidth: bounds.width / 2,
          halfHeight: bounds.height / 2,
          handle,
        };
        return;
      }
      const handle = selected.newsConfig
        ? null
        : resizeHandleAt(point, selected, event.currentTarget);
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
      const newsElement = newsElementAt(point, hit);
      if (newsElement && hit.newsConfig) {
        const local = toBubbleLocal(point, hit);
        const w = hit.width * canvasSize.width;
        const h = hit.height * canvasSize.width;
        setBubbles((items) =>
          items.map((item) =>
            item.id === hit.id && item.newsConfig
              ? { ...item, newsConfig: { ...item.newsConfig, selectedElementId: newsElement.id } }
              : item
          )
        );
        dragRef.current = {
          mode: 'news-element',
          id: hit.id,
          elementId: newsElement.id,
          dx: (local.x + w / 2) / w - newsElement.x,
          dy: (local.y + h / 2) / h - newsElement.y,
        };
        return;
      }
      if (hit.newsConfig) {
        dragRef.current = null;
        return;
      }
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
      const newsHandle = selected.newsConfig
        ? newsElementHandleAt(point, selected, event.currentTarget)
        : null;
      const handle = newsHandle?.handle ??
        (selected.newsConfig ? null : resizeHandleAt(point, selected, event.currentTarget));
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
        event.currentTarget.style.cursor =
          hit && newsElementAt(point, hit)
            ? 'move'
            : hit?.newsConfig
              ? 'default'
              : hit
                ? 'move'
                : 'default';
      }
      return;
    }

    if (dragRef.current.mode === 'news-resize') {
      const { id, elementId, fontSize, centerX, centerY, halfWidth, halfHeight, handle } =
        dragRef.current;
      const bubble = bubbles.find((item) => item.id === id);
      if (!bubble?.newsConfig) return;
      const local = toBubbleLocal(point, bubble);
      const x = local.x + (bubble.width * canvasSize.width) / 2;
      const y = local.y + (bubble.height * canvasSize.width) / 2;
      const scaleX = handle.x ? Math.abs(x - centerX) / Math.max(1, halfWidth) : 1;
      const scaleY = handle.y ? Math.abs(y - centerY) / Math.max(1, halfHeight) : 1;
      const factor = handle.x && handle.y ? (scaleX + scaleY) / 2 : handle.x ? scaleX : scaleY;
      const nextSize = Math.max(12, Math.min(140, Math.round(fontSize * factor)));
      setBubbles((items) =>
        items.map((item) =>
          item.id === id && item.newsConfig
            ? {
                ...item,
                newsConfig: {
                  ...item.newsConfig,
                  elements: item.newsConfig.elements.map((element) =>
                    element.id === elementId ? { ...element, fontSize: nextSize } : element
                  ),
                },
              }
            : item
        )
      );
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
                bubble.newsConfig ? canvasSize.height : canvasSize.width * 0.8,
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

    if (dragRef.current.mode === 'news-element') {
      const { id, elementId, dx, dy } = dragRef.current;
      setBubbles((items) =>
        items.map((item) => {
          if (item.id !== id || !item.newsConfig) return item;
          const local = toBubbleLocal(point, item);
          const w = item.width * canvasSize.width;
          const h = item.height * canvasSize.width;
          return {
            ...item,
            newsConfig: {
              ...item.newsConfig,
              elements: item.newsConfig.elements.map((element) =>
                element.id === elementId
                  ? {
                      ...element,
                      x: Math.max(0, Math.min(1, (local.x + w / 2) / w - dx)),
                      y: Math.max(0, Math.min(1, (local.y + h / 2) / h - dy)),
                    }
                  : element
              ),
            },
          };
        })
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
      await preloadImageBubbleAssets(bubbles.map(({ shape }) => shape));
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

  const handleCopyResult = async () => {
    setIsProcessing(true);
    try {
      await preloadImageBubbleAssets(bubbles.map(({ shape }) => shape));
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      drawWebtoonCanvas(canvas, image, background, bubbles);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('PNG 생성 실패'))),
          'image/png'
        )
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('결과 이미지가 클립보드에 복사되었습니다.');
    } catch {
      toast.error('이미지 복사에 실패했습니다. 브라우저의 클립보드 권한을 확인해 주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      await preloadImageBubbleAssets(bubbles.map(({ shape }) => shape));
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

  const templateKeyword = templateSearch.trim().toLocaleLowerCase();
  const filteredTemplates = TEMPLATE_LIST.filter(
    (item) =>
      (templateCategory === 'all' || item.category === templateCategory) &&
      (!templateKeyword ||
        `${item.label} ${item.desc}`.toLocaleLowerCase().includes(templateKeyword))
  );

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
                    label={`레이어 ${layerCount}개`}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flexWrap: 'wrap',
                  mb: 1,
                  flexShrink: 0,
                }}
              >
                {(['edit', 'original', 'compare'] as const).map((mode) => (
                  <Chip
                    key={mode}
                    size="small"
                    clickable
                    label={{ edit: '편집 결과', original: '원본', compare: '전후 비교' }[mode]}
                    color={previewMode === mode ? 'primary' : 'default'}
                    variant={previewMode === mode ? 'filled' : 'outlined'}
                    onClick={() => setPreviewMode(mode)}
                  />
                ))}
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                  확대 {Math.round(previewZoom * 100)}%
                </Typography>
                <Slider
                  size="small"
                  aria-label="미리보기 확대"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={previewZoom}
                  onChange={(_, value) => setPreviewZoom(value as number)}
                  sx={{ width: 85 }}
                />
              </Box>
              {previewMode === 'compare' && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setCompareOrientation(
                        compareOrientation === 'left-right' ? 'top-bottom' : 'left-right'
                      )
                    }
                  >
                    {compareOrientation === 'left-right' ? '좌우 분할' : '상하 분할'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCompareOutside(!compareOutside)}
                  >
                    {compareOutside ? '구간 바깥 원본' : '구간 안쪽 원본'}
                  </Button>
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    비교 구간 {compareStart}–{compareEnd}%
                  </Typography>
                  <Slider
                    size="small"
                    aria-label="원본 비교 구간"
                    min={0}
                    max={100}
                    value={[compareStart, compareEnd]}
                    onChange={(_, value) => {
                      const [start, end] = value as number[];
                      setCompareStart(start);
                      setCompareEnd(end);
                    }}
                    sx={{ minWidth: 100, flex: 1 }}
                  />
                </Box>
              )}

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
                    zoom: previewZoom,
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
                    onPointerDown={previewMode === 'edit' ? pointerDown : undefined}
                    onPointerMove={previewMode === 'edit' ? pointerMove : undefined}
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
                  {previewMode !== 'edit' && originalPreview && (
                    <Box
                      component="img"
                      src={originalPreview}
                      alt="원본 이미지"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        clipPath:
                          previewMode === 'compare' && !compareOutside
                            ? compareOrientation === 'left-right'
                              ? `inset(0 ${100 - compareEnd}% 0 ${compareStart}%)`
                              : `inset(${compareStart}% 0 ${100 - compareEnd}% 0)`
                            : 'none',
                        maskImage:
                          previewMode === 'compare' && compareOutside
                            ? `linear-gradient(to ${compareOrientation === 'left-right' ? 'right' : 'bottom'}, black 0 ${compareStart}%, transparent ${compareStart}% ${compareEnd}%, black ${compareEnd}% 100%)`
                            : 'none',
                      }}
                    />
                  )}
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

                    <TextField
                      size="small"
                      placeholder="말풍선 이름·스타일 검색"
                      value={templateSearch}
                      onChange={(event) => setTemplateSearch(event.target.value)}
                      inputProps={{ 'aria-label': '말풍선 검색' }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {filteredTemplates.length}개 말풍선
                    </Typography>

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
                                  loading="lazy"
                                  decoding="async"
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

                        {selected.newsConfig && (
                          <NewsCaptionBubbleControls
                            config={selected.newsConfig}
                            onChange={(newsConfig) =>
                              updateSelected({
                                newsConfig,
                                text:
                                  newsConfig.elements.find((element) => element.type === 'headline')
                                    ?.text || selected.text,
                              })
                            }
                          />
                        )}
                        {!selected.newsConfig && (
                          <>
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

                            <ToggleButtonGroup
                              size="small"
                              fullWidth
                              exclusive
                              value={selected.fontWeight}
                              onChange={(_, fontWeight) =>
                                fontWeight && updateSelected({ fontWeight })
                              }
                              aria-label="글자 굵기"
                            >
                              <ToggleButton value={500}>보통</ToggleButton>
                              <ToggleButton value={700}>굵게</ToggleButton>
                              <ToggleButton value={900}>아주 굵게</ToggleButton>
                            </ToggleButtonGroup>

                            {/* Tail Direction for non-image shapes */}
                            {!textOnlyShape && !imageAsset && !captionShape && (
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
                                        {
                                          ['아래', '위', '왼쪽', '오른쪽', '없음 (꼬리 없음)'][
                                            index
                                          ]
                                        }
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            )}

                            {/* Flip Buttons */}
                            {!textOnlyShape && !captionShape && (
                              <Box
                                sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}
                              >
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

                            <ColorField
                              label="글자 그림자색"
                              value={selected.textShadowColor}
                              onChange={(textShadowColor) => updateSelected({ textShadowColor })}
                            />

                            {!textOnlyShape && !imageAsset && (
                              <>
                                <ColorField
                                  label={captionShape ? '자막 배경색' : '말풍선 배경색'}
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

                            {captionShape &&
                              selected.shape !== 'captionYouTube' &&
                              selected.shape !== 'captionHuman' && (
                                <ColorField
                                  label="강조색"
                                  value={selected.accentColor}
                                  onChange={(accentColor) => updateSelected({ accentColor })}
                                />
                              )}

                            {(selected.shape === 'captionNews' ||
                              selected.shape === 'captionBreaking') && (
                              <>
                                <Button
                                  size="small"
                                  variant={selected.badgeVisible ? 'contained' : 'outlined'}
                                  onClick={() =>
                                    updateSelected({ badgeVisible: !selected.badgeVisible })
                                  }
                                >
                                  배지 {selected.badgeVisible ? '표시 중' : '숨김'}
                                </Button>
                                {selected.badgeVisible && (
                                  <TextField
                                    size="small"
                                    label="배지 문구"
                                    value={selected.badgeText}
                                    onChange={(event) =>
                                      updateSelected({ badgeText: event.target.value.slice(0, 12) })
                                    }
                                  />
                                )}
                              </>
                            )}

                            {!textOnlyShape && (
                              <ColorField
                                label="그림자 색상"
                                value={selected.shadowColor ?? '#555555'}
                                onChange={(shadowColor) => updateSelected({ shadowColor })}
                              />
                            )}

                            <CompactSlider
                              label="글자 외곽선 굵기"
                              value={selected.textStrokeWidth}
                              min={0}
                              max={12}
                              step={0.5}
                              onChange={(textStrokeWidth) => updateSelected({ textStrokeWidth })}
                              suffix="px"
                            />
                            <CompactSlider
                              label="글자 그림자 흐림"
                              value={selected.textShadowBlur}
                              min={0}
                              max={25}
                              onChange={(textShadowBlur) => updateSelected({ textShadowBlur })}
                              suffix="px"
                            />
                            <CompactSlider
                              label="줄 간격"
                              value={selected.lineHeight}
                              min={0.8}
                              max={2}
                              step={0.05}
                              onChange={(lineHeight) => updateSelected({ lineHeight })}
                            />
                            <CompactSlider
                              label="자간"
                              value={selected.letterSpacing}
                              min={-4}
                              max={12}
                              step={0.5}
                              onChange={(letterSpacing) => updateSelected({ letterSpacing })}
                              suffix="px"
                            />

                            {captionShape && selected.shape !== 'captionHuman' && (
                              <>
                                <CompactSlider
                                  label="배경 불투명도 (0=투명)"
                                  value={selected.backgroundOpacity}
                                  min={0}
                                  max={100}
                                  onChange={(backgroundOpacity) =>
                                    updateSelected({ backgroundOpacity })
                                  }
                                  suffix="%"
                                />
                                <CompactSlider
                                  label="배경 모서리 둥글기"
                                  value={selected.cornerRadius}
                                  min={0}
                                  max={50}
                                  onChange={(cornerRadius) => updateSelected({ cornerRadius })}
                                  suffix="px"
                                />
                              </>
                            )}

                            {captionShape && selected.shape !== 'captionHuman' && (
                              <CompactSlider
                                label="배경 그림자 흐림"
                                value={selected.shadowBlur}
                                min={0}
                                max={25}
                                onChange={(shadowBlur) => updateSelected({ shadowBlur })}
                                suffix="px"
                              />
                            )}
                          </>
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
                        레이어 목록 ({layerCount})
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
                      const isCur = b.id === selectedId && !b.newsConfig?.selectedElementId;
                      return (
                        <React.Fragment key={b.id}>
                        <Box
                          onClick={() => {
                            setSelectedId(b.id);
                            if (b.newsConfig) {
                              setBubbles((items) => items.map((item) => item.id === b.id && item.newsConfig ? { ...item, newsConfig: { ...item.newsConfig, selectedElementId: null } } : item));
                            }
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
                                {shapeInfo?.label || '말풍선'}{b.newsConfig ? ' · 배경/효과' : ''}
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
                              {b.newsConfig ? '방송 배너·레터박스·비네팅' : b.text ? b.text.replace(/\s+/g, ' ') : '(대사 없음)'}
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
                        {b.newsConfig && [...b.newsConfig.elements].reverse().map((element) => {
                          const elementSelected = b.id === selectedId && b.newsConfig?.selectedElementId === element.id;
                          return (
                            <Box
                              key={element.id}
                              onClick={() => {
                                setSelectedId(b.id);
                                setBubbles((items) => items.map((item) => item.id === b.id && item.newsConfig ? { ...item, newsConfig: { ...item.newsConfig, selectedElementId: element.id } } : item));
                                setActiveTab('edit');
                              }}
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2, px: 1, py: 0.6, border: '1px solid', borderColor: elementSelected ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: elementSelected ? 'primary.lighter' : 'background.paper', opacity: element.visible ? 1 : 0.5, cursor: 'pointer' }}
                            >
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{element.name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{element.text || '(문구 없음)'}</Typography>
                              </Box>
                              <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button size="small" sx={{ minWidth: 0, px: 0.5 }} onClick={() => setBubbles((items) => items.map((item) => item.id === b.id && item.newsConfig ? { ...item, newsConfig: { ...item.newsConfig, elements: item.newsConfig.elements.map((part) => part.id === element.id ? { ...part, visible: !part.visible } : part) } } : item))}>{element.visible ? '숨김' : '표시'}</Button>
                                <IconButton size="small" title={`${element.name} 복제`} onClick={() => {
                                  const id = crypto.randomUUID();
                                  setBubbles((items) => items.map((item) => item.id === b.id && item.newsConfig ? { ...item, newsConfig: { ...item.newsConfig, elements: [...item.newsConfig.elements, { ...element, id, name: `${element.name} 복사`, x: Math.min(1, element.x + 0.025), y: Math.min(1, element.y + 0.025), isDeletable: true }], selectedElementId: id } } : item));
                                  setSelectedId(b.id);
                                  setActiveTab('edit');
                                }}><ContentCopyRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                                {element.isDeletable !== false && <IconButton size="small" color="error" title={`${element.name} 삭제`} onClick={() => setBubbles((items) => items.map((item) => item.id === b.id && item.newsConfig ? { ...item, newsConfig: { ...item.newsConfig, elements: item.newsConfig.elements.filter((part) => part.id !== element.id), selectedElementId: item.newsConfig.selectedElementId === element.id ? null : item.newsConfig.selectedElementId } } : item))}><DeleteRoundedIcon sx={{ fontSize: 16 }} /></IconButton>}
                              </Box>
                            </Box>
                          );
                        })}
                        </React.Fragment>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Sliders in compact container (Photo Art Style Pattern) */}
              {selected && (
                <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                  {!selected.newsConfig && (
                    <CompactSlider
                      label="글자 크기 (Font Size)"
                      value={selected.fontSize}
                      min={12}
                      max={100}
                      onChange={(fontSize) => updateSelected({ fontSize })}
                      suffix="px"
                    />
                  )}

                  {!selected.newsConfig && !textOnlyShape && !imageAsset && (
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
                    label="전체 불투명도"
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

              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleCopyResult}
                disabled={isProcessing}
                startIcon={<ContentCopyRoundedIcon />}
              >
                결과 이미지 복사
              </Button>

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
