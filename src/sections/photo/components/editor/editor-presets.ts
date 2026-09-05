'use client';

import type { SampleImageItem, FilterPresetItem } from './editor-types';

// ----------------------------------------------------------------------
// Sample Images for 1-Click Testing
// ----------------------------------------------------------------------

export const EDITOR_SAMPLE_IMAGES: (SampleImageItem & { mode: 'galaxy' | 'iphone' })[] = [
  {
    id: 'sample-galaxy-landscape',
    label: '📱 갤럭시 풍경 샷',
    subLabel: '풍부한 채도 & 고화소 풍경',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    mode: 'galaxy',
    tag: 'Galaxy S24 Ultra',
  },
  {
    id: 'sample-iphone-portrait',
    label: '🍎 아이폰 인물 샷',
    subLabel: '자연스러운 피부 & 보케 심도',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
    mode: 'iphone',
    tag: 'iPhone 16 Pro',
  },
  {
    id: 'sample-street-night',
    label: '🌃 야경 & 네온 시티',
    subLabel: '어두운 그림자 & 빛망울',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80',
    mode: 'galaxy',
    tag: '나이트그래피',
  },
  {
    id: 'sample-cafe-interior',
    label: '☕ 감성 카페 & 인테리어',
    subLabel: '따뜻한 감성 톤 & 디테일',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
    mode: 'iphone',
    tag: '인스타 감성',
  },
];

// ----------------------------------------------------------------------
// Comprehensive Filter Presets (Galaxy, iPhone, Film, Cinema, Vintage, etc.)
// ----------------------------------------------------------------------

export const FILTER_PRESETS: FilterPresetItem[] = [
  // --- [iPhone Presets] ---
  {
    id: 'iphone-vivid',
    name: '선명하게 (Vivid)',
    category: 'iphone',
    subtitle: '아이폰 시그니처 - 콘트라스트와 채도 극대화',
    thumbnailColor: '#ff5722',
    settings: {
      contrast: 18,
      saturation: 24,
      vibrance: 20,
      highlights: -10,
      shadows: 8,
      definition: 15,
      clarity: 10,
      blackPoint: 6,
    },
  },
  {
    id: 'iphone-vivid-warm',
    name: '선명하게 (따뜻한 톤)',
    category: 'iphone',
    subtitle: '황금빛 햇살을 머금은 비비드 톤',
    thumbnailColor: '#f59e0b',
    settings: {
      contrast: 15,
      saturation: 20,
      temperature: 22,
      tint: 5,
      highlights: -8,
      shadows: 10,
      clarity: 12,
    },
  },
  {
    id: 'iphone-vivid-cool',
    name: '선명하게 (차가운 톤)',
    category: 'iphone',
    subtitle: '시원하고 청량한 푸른빛의 선명함',
    thumbnailColor: '#0ea5e9',
    settings: {
      contrast: 16,
      saturation: 18,
      temperature: -24,
      tint: -6,
      highlights: -12,
      clarity: 14,
    },
  },
  {
    id: 'iphone-dramatic',
    name: '드라마틱 (Dramatic)',
    category: 'iphone',
    subtitle: '깊은 음영과 영화 같은 중후한 대비',
    thumbnailColor: '#475569',
    settings: {
      contrast: 32,
      highlights: -25,
      shadows: -18,
      blacks: -15,
      blackPoint: 15,
      saturation: -15,
      vibrance: 10,
      clarity: 22,
    },
  },
  {
    id: 'iphone-dramatic-warm',
    name: '드라마틱 (따스하게)',
    category: 'iphone',
    subtitle: '노을빛 서사가 깃든 묵직한 드라마틱 톤',
    thumbnailColor: '#b45309',
    settings: {
      contrast: 28,
      highlights: -20,
      shadows: -12,
      temperature: 24,
      saturation: -10,
      blackPoint: 12,
    },
  },
  {
    id: 'iphone-dramatic-cool',
    name: '드라마틱 (차갑게)',
    category: 'iphone',
    subtitle: '새벽녘 차가운 공기의 묵직한 콘트라스트',
    thumbnailColor: '#334155',
    settings: {
      contrast: 30,
      highlights: -22,
      shadows: -15,
      temperature: -22,
      saturation: -12,
      blackPoint: 14,
    },
  },
  {
    id: 'iphone-mono',
    name: '모노 (Mono)',
    category: 'iphone',
    subtitle: '균형 잡힌 클래식 흑백 톤',
    thumbnailColor: '#71717a',
    settings: {
      saturation: -100,
      vibrance: -100,
      contrast: 15,
      highlights: 5,
      shadows: 5,
      gamma: 4,
    },
  },
  {
    id: 'iphone-silvertone',
    name: '실버톤 (Silvertone)',
    category: 'iphone',
    subtitle: '은빛 광채가 도는 매트한 흑백',
    thumbnailColor: '#a1a1aa',
    settings: {
      saturation: -100,
      vibrance: -100,
      contrast: -8,
      exposure: 8,
      shadows: 20,
      blacks: 12,
      fade: 18,
    },
  },
  {
    id: 'iphone-noir',
    name: '느와르 (Noir)',
    category: 'iphone',
    subtitle: '깊고 짙은 암부의 정통 필름 느와르',
    thumbnailColor: '#18181b',
    settings: {
      saturation: -100,
      vibrance: -100,
      contrast: 45,
      highlights: 12,
      shadows: -35,
      blackPoint: 25,
      clarity: 20,
    },
  },

  // --- [Galaxy Presets] ---
  {
    id: 'galaxy-vivid',
    name: '선명 (One UI Vivid)',
    category: 'galaxy',
    subtitle: '갤럭시 갤러리 특유의 화사하고 쨍한 생동감',
    thumbnailColor: '#2563eb',
    settings: {
      exposure: 6,
      brightness: 4,
      contrast: 14,
      saturation: 28,
      vibrance: 32,
      definition: 16,
      structure: 18,
      sharpening: 20,
    },
  },
  {
    id: 'galaxy-warm',
    name: '따뜻한 (Galaxy Warm)',
    category: 'galaxy',
    subtitle: '부드럽고 온화한 색감 강조',
    thumbnailColor: '#f97316',
    settings: {
      exposure: 4,
      temperature: 26,
      tint: 8,
      saturation: 15,
      shadows: 12,
      fade: 5,
    },
  },
  {
    id: 'galaxy-cool',
    name: '차가운 (Galaxy Cool)',
    category: 'galaxy',
    subtitle: '맑고 투명한 유리알 같은 푸른 톤',
    thumbnailColor: '#0284c7',
    settings: {
      exposure: 5,
      temperature: -28,
      tint: -4,
      saturation: 16,
      clarity: 15,
      highlights: -8,
    },
  },
  {
    id: 'galaxy-soft',
    name: '부드러운 (Galaxy Soft)',
    category: 'galaxy',
    subtitle: '자극 없는 포근하고 부드러운 감성',
    thumbnailColor: '#ec4899',
    settings: {
      contrast: -12,
      highlights: -15,
      shadows: 18,
      saturation: 8,
      fade: 14,
      glow: { amount: 15, radius: 15 },
    },
  },
  {
    id: 'galaxy-lyrical',
    name: '서정적 (Lyrical)',
    category: 'galaxy',
    subtitle: '한 편의 시처럼 몽환적인 감성 룩',
    thumbnailColor: '#8b5cf6',
    settings: {
      contrast: 8,
      temperature: 10,
      tint: 16,
      saturation: -8,
      fade: 16,
      shadows: 14,
    },
  },
  {
    id: 'galaxy-pastel',
    name: '파스텔 (Pastel)',
    category: 'galaxy',
    subtitle: '동화 속 수채화 같은 뽀샤시한 색감',
    thumbnailColor: '#f472b6',
    settings: {
      exposure: 12,
      contrast: -10,
      saturation: 22,
      highlights: 10,
      shadows: 20,
      clarity: -8,
    },
  },
  {
    id: 'galaxy-classic',
    name: '클래식 (Classic)',
    category: 'galaxy',
    subtitle: '자연스럽고 편안한 정돈된 톤',
    thumbnailColor: '#78716c',
    settings: {
      contrast: 10,
      highlights: -5,
      shadows: 8,
      saturation: 10,
      definition: 10,
    },
  },
  {
    id: 'galaxy-bw',
    name: '흑백 (Galaxy B&W)',
    category: 'galaxy',
    subtitle: '깔끔하고 정돈된 원 UI 흑백 모드',
    thumbnailColor: '#52525b',
    settings: {
      saturation: -100,
      contrast: 22,
      definition: 18,
      highlights: 6,
      shadows: -10,
    },
  },
  {
    id: 'galaxy-ivory',
    name: '아이보리 (Ivory)',
    category: 'galaxy',
    subtitle: '상아빛 크림 감성의 빈티지 부드러움',
    thumbnailColor: '#fef08a',
    settings: {
      exposure: 6,
      temperature: 18,
      tint: -6,
      fade: 12,
      shadows: 15,
      contrast: -6,
    },
  },
  {
    id: 'galaxy-fresh',
    name: '산뜻한 (Fresh)',
    category: 'galaxy',
    subtitle: '생기가 톡톡 터지는 싱그러운 무드',
    thumbnailColor: '#22c55e',
    settings: {
      exposure: 8,
      contrast: 12,
      saturation: 30,
      vibrance: 25,
      temperature: -8,
      clarity: 15,
    },
  },

  // --- [Vintage / Retro / Cinema / Film] ---
  {
    id: 'vintage-70s',
    name: '70s 골든 빈티지',
    category: 'vintage',
    subtitle: '빛바랜 노란빛과 부드러운 입자감',
    thumbnailColor: '#d97706',
    settings: {
      temperature: 28,
      tint: 12,
      contrast: -8,
      fade: 22,
      grain: { amount: 25, size: 2 },
      vignette: { amount: -25, midpoint: 50, roundness: 50, feather: 60 },
    },
  },
  {
    id: 'retro-vapor',
    name: '베이퍼웨이브 (Vaporwave)',
    category: 'retro',
    subtitle: '80년대 레트로 네온 마젠타 & 시안',
    thumbnailColor: '#d946ef',
    settings: {
      saturation: 35,
      tint: 35,
      temperature: -20,
      contrast: 25,
      glow: { amount: 20, radius: 25 },
    },
  },
  {
    id: 'cinema-teal-orange',
    name: '시네마 (Teal & Orange)',
    category: 'cinema',
    subtitle: '헐리우드 블록버스터 컬러 그레이딩',
    thumbnailColor: '#0891b2',
    settings: {
      contrast: 22,
      highlights: -15,
      shadows: -10,
      colorGrading: {
        shadows: { color: '#006688', intensity: 35 },
        midtones: { color: '#ffffff', intensity: 0 },
        highlights: { color: '#ff9900', intensity: 40 },
        balance: 5,
      },
    },
  },
  {
    id: 'film-portra400',
    name: '코닥 Portra 400',
    category: 'film',
    subtitle: '인물 사진의 전설, 자연스러운 피부톤과 발색',
    thumbnailColor: '#eab308',
    settings: {
      exposure: 4,
      contrast: 10,
      temperature: 12,
      tint: 6,
      saturation: 12,
      shadows: 14,
      grain: { amount: 18, size: 2 },
      fade: 10,
    },
  },
  {
    id: 'film-fuji-pro',
    name: '후지 Pro 400H',
    category: 'film',
    subtitle: '에메랄드 그린과 차분한 파스텔 톤',
    thumbnailColor: '#14b8a6',
    settings: {
      exposure: 6,
      temperature: -14,
      tint: 14,
      saturation: 15,
      shadows: 18,
      highlights: -10,
      grain: { amount: 16, size: 2 },
    },
  },
  {
    id: 'sepia-antique',
    name: '앤틱 세피아',
    category: 'sepia',
    subtitle: '고서적과 오래된 흑백 사진의 갈색 톤',
    thumbnailColor: '#78350f',
    settings: {
      saturation: -70,
      temperature: 45,
      tint: 18,
      contrast: 8,
      fade: 25,
      vignette: { amount: -35, midpoint: 45, roundness: 50, feather: 70 },
    },
  },
];

// ----------------------------------------------------------------------
// Light Leak Overlay Presets
// ----------------------------------------------------------------------

export const LIGHT_LEAK_PRESETS = [
  { id: 'warm-corner', name: '웜 코너 빛샘', color: 'rgba(255, 150, 50, 0.7)' },
  { id: 'rainbow-burst', name: '레인보우 스펙트럼', color: 'rgba(255, 80, 180, 0.7)' },
  { id: 'prism-flare', name: '프리즘 플레어', color: 'rgba(80, 200, 255, 0.7)' },
  { id: 'sunset-glow', name: '석양 글로우', color: 'rgba(255, 90, 40, 0.7)' },
  { id: 'vintage-leak', name: '필름 번 (Film Burn)', color: 'rgba(255, 200, 80, 0.7)' },
];

// ----------------------------------------------------------------------
// Frame Presets
// ----------------------------------------------------------------------

export const FRAME_PRESETS = [
  { id: 'none', name: '프레임 없음' },
  { id: 'iphone-viewfinder', name: '🍎 아이폰 카메라 UI 프레임' },
  { id: 'galaxy-camera', name: '📱 갤럭시 카메라 UI 프레임' },
  { id: 'polaroid', name: '📷 레트로 폴라로이드' },
  { id: 'film-strip', name: '🎞️ 35mm 영화 필름' },
  { id: 'simple-white', name: '◻️ 심플 화이트 보더' },
  { id: 'shadow-card', name: '🪟 플로팅 섀도우 카드' },
];

// ----------------------------------------------------------------------
// Sticker Emojis and Mobile Badges
// ----------------------------------------------------------------------

export const STICKER_PRESETS = [
  { id: 'camera', label: '📸 카메라', value: '📸' },
  { id: 'sparkles', label: '✨ 반짝임', value: '✨' },
  { id: 'fire', label: '🔥 불꽃', value: '🔥' },
  { id: 'heart', label: '💖 하트', value: '💖' },
  { id: 'sunglasses', label: '😎 선글라스', value: '😎' },
  { id: 'crown', label: '👑 왕관', value: '👑' },
  { id: 'cat', label: '🐱 고양이', value: '🐱' },
  { id: 'party', label: '🎉 축하', value: '🎉' },
  { id: 'coffee', label: '☕ 커피', value: '☕' },
  { id: 'star', label: '⭐ 별', value: '⭐' },
  { id: 'badge-iphone', label: '🍎 Shot on iPhone', value: 'Shot on iPhone' },
  { id: 'badge-galaxy', label: '📱 Galaxy AI Pro', value: 'Galaxy AI Pro' },
  { id: 'badge-remaster', label: '✨ Remastered', value: '✨ Remastered' },
  { id: 'badge-oneui', label: '⚡ One UI Camera', value: '⚡ One UI' },
];

// ----------------------------------------------------------------------
// Aspect Ratio Options
// ----------------------------------------------------------------------

export const ASPECT_RATIO_OPTIONS = [
  { id: 'free', label: '자유 (Free)', ratio: 0 },
  { id: 'original', label: '원본 비율', ratio: -1 },
  { id: '1:1', label: '1:1 (정사각형/인스타)', ratio: 1 },
  { id: '4:5', label: '4:5 (인스타 세로)', ratio: 4 / 5 },
  { id: '3:4', label: '3:4 (기본 카메라)', ratio: 3 / 4 },
  { id: '9:16', label: '9:16 (스마트폰 풀화면)', ratio: 9 / 16 },
  { id: '16:9', label: '16:9 (유튜브/와이드)', ratio: 16 / 9 },
  { id: '4:3', label: '4:3 (가로 표준)', ratio: 4 / 3 },
  { id: '2:3', label: '2:3 (DSLR 표준)', ratio: 2 / 3 },
];
