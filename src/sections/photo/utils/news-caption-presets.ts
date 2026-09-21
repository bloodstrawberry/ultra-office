'use client';

export interface NewsCaptionSampleImageItem {
  id: string;
  label: string;
  url: string;
  subLabel?: string;
  tag?: string;
}

// ----------------------------------------------------------------------
// Caption Style Types
// ----------------------------------------------------------------------

export type CaptionStyleId =
  | 'human-theater'
  | 'kbs-news'
  | 'mbc-news'
  | 'sbs-news'
  | 'jtbc-news'
  | 'ytn-news'
  | 'cnn-news'
  | 'investigative'
  | 'variety-meme';

export type FontFamilyChoice = 'myeongjo' | 'gothic' | 'retro' | 'impact';

export type CaptionElementType = 'headline' | 'subText' | 'titleBadge' | 'liveBadge' | 'custom';

export type CaptionFontWeight = 'normal' | 'bold' | '800' | '900';

export interface CaptionElement {
  id: string;
  type: CaptionElementType;
  name: string;
  text: string;
  x: number; // 0.0 ~ 1.0 (정규화된 X 좌표)
  y: number; // 0.0 ~ 1.0 (정규화된 Y 좌표)
  align: 'center' | 'left' | 'right';
  fontSize: number; // 1200px 기준 기본 픽셀
  fontWeight: CaptionFontWeight;
  outlineWidth: number; // 외곽선 두께 (px)
  outlineColor: string;
  textColor: string;
  fontFamily: FontFamilyChoice;
  visible: boolean;
  isDeletable?: boolean;
}

export interface NewsCaptionConfig {
  styleId: CaptionStyleId;
  // Drag & Drop Elements
  elements: CaptionElement[];
  selectedElementId: string | null;

  // Global / Broadcast Frame Options
  enableLetterbox: boolean; // 16:9 시네마틱 상하 레터박스
  letterboxSize: number; // 5 ~ 18 (%)
  enableVignette: boolean; // 하단 다크 비네팅
  showStationLogo: boolean; // 방송국/타이틀 로고 표시
  showLiveBadge: boolean; // LIVE / 시간 뱃지 표시
  bannerColor: string;
  accentColor: string;
  bottomOffset: number; // 0 ~ 30 (%)
  fontSizeScale: number; // 전역 스케일 배율 (0.6 ~ 1.6)

  // Backwards-compatible fields (automatically synced with elements)
  headline?: string;
  subText?: string;
  badgeText?: string;
  locationText?: string;
  fontFamily?: FontFamilyChoice;
  outlineWidth?: number;
  textAlign?: 'center' | 'left';
  textColor?: string;
  outlineColor?: string;
}

export interface CaptionStylePreset {
  id: CaptionStyleId;
  name: string;
  channel: string;
  description: string;
  iconTag: string;
  themeColor: string;
  defaultConfig: Partial<NewsCaptionConfig>;
}

// ----------------------------------------------------------------------
// Sample Images for 1-Click Testing
// ----------------------------------------------------------------------

export const NEWS_SAMPLE_IMAGES: NewsCaptionSampleImageItem[] = [
  {
    id: 'sample-fridge-cat',
    label: '🐱 텅 빈 냉장고 앞 고양이',
    subLabel: '"계란이 다 떨어졌다" 인간극장 샷에 최적화',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-tired-worker',
    label: '💼 야근하는 직장인 인터뷰',
    subLabel: '현대인의 비애 / 다큐멘터리 & 뉴스 제보 샷',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-street-interview',
    label: '🎤 거리 시민 인터뷰 현장',
    subLabel: 'KBS / MBC / SBS 9시 뉴스 현장 인터뷰',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-dramatic-face',
    label: '😲 충격과 공포의 표정',
    subLabel: 'YTN / CNN 긴급 속보 & 그것이 알고싶다',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-peaceful-kitchen',
    label: '🍳 주방 요리 & 자취생 일상',
    subLabel: '인간극장 시골/자취 일상 다큐멘터리',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
  },
];

// ----------------------------------------------------------------------
// Default Elements Factory by Style
// ----------------------------------------------------------------------

export function createDefaultElementsForStyle(
  styleId: CaptionStyleId,
  headlineText?: string,
  subText?: string,
  badgeText?: string,
  locationText?: string
): CaptionElement[] {
  switch (styleId) {
    case 'human-theater':
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '인물 정보',
          text: subText ?? '시능지(23) / 자취생',
          x: 0.5,
          y: 0.81,
          align: 'center',
          fontSize: 34,
          fontWeight: 'bold',
          outlineWidth: 2.8, // 첨부 사진에 맞춰 깔끔하고 또렷한 실선 외곽선 (기존 7px 블러에서 개선)
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '인터뷰 대사',
          text: headlineText ?? '"계란이 다 떨어졌다"',
          x: 0.5,
          y: 0.89,
          align: 'center',
          fontSize: 42,
          fontWeight: 'bold',
          outlineWidth: 2.8, // 첨부 사진에 맞춰 깔끔하고 또렷한 실선 외곽선
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'KBS 인간극장 타이틀',
          text: badgeText ?? 'KBS 인간극장',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 24,
          fontWeight: 'bold',
          outlineWidth: 2.4,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'kbs-news':
      return [
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: '뉴스 뱃지',
          text: badgeText ?? '[단독] KBS 뉴스 9',
          x: 0.06,
          y: 0.88,
          align: 'left',
          fontSize: 20,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'subText',
          type: 'subText',
          name: '기자 / 소속',
          text: subText ?? '홍길동 기자 / 사회부',
          x: 0.23,
          y: 0.88,
          align: 'left',
          fontSize: 20,
          fontWeight: 'bold',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#93c5fd',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '메인 헤드라인',
          text: headlineText ?? '초강력 한파 속 계란 품귀 현상... 자취생들 "비상"',
          x: 0.06,
          y: 0.94,
          align: 'left',
          fontSize: 32,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'liveBadge',
          type: 'liveBadge',
          name: 'LIVE 위젯',
          text: locationText ?? '● LIVE 여의도 21:15',
          x: 0.06,
          y: 0.08,
          align: 'left',
          fontSize: 20,
          fontWeight: 'bold',
          outlineWidth: 1.5,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'mbc-news':
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '발언자 명패',
          text: subText ?? '김철수(28) / 직장인',
          x: 0.08,
          y: 0.85,
          align: 'left',
          fontSize: 22,
          fontWeight: 'bold',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '메인 헤드라인',
          text: headlineText ?? '"월급날만 기다려"... 치솟는 물가에 지갑 닫는 청년들',
          x: 0.08,
          y: 0.93,
          align: 'left',
          fontSize: 30,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'MBC 로고',
          text: badgeText ?? 'MBC 뉴스데스크',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 22,
          fontWeight: '800',
          outlineWidth: 1.5,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'sbs-news':
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '소제목 / 기자',
          text: subText ?? 'SBS 8 NEWS  |  이현장 기자 / 기동취재반',
          x: 0.06,
          y: 0.87,
          align: 'left',
          fontSize: 20,
          fontWeight: 'bold',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#38bdf8',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '메인 헤드라인',
          text: headlineText ?? '[현장출동] "이불 밖은 위험해" 기습 한파에 얼어붙은 출근길',
          x: 0.06,
          y: 0.93,
          align: 'left',
          fontSize: 32,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'SBS 로고',
          text: badgeText ?? 'SBS 8',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 22,
          fontWeight: '800',
          outlineWidth: 1.5,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'jtbc-news':
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '카테고리 & 인물',
          text: subText ?? '[팩트체크] 박민수(31) / 인터뷰',
          x: 0.1,
          y: 0.87,
          align: 'left',
          fontSize: 19,
          fontWeight: 'bold',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#2dd4bf',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '인용구 헤드라인',
          text: headlineText ?? '“배가 고픈데 밥을 먹으면 배가 부릅니다”',
          x: 0.1,
          y: 0.93,
          align: 'left',
          fontSize: 30,
          fontWeight: 'bold',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'JTBC 로고',
          text: badgeText ?? 'JTBC',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 24,
          fontWeight: '800',
          outlineWidth: 1.5,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'ytn-news':
      return [
        {
          id: 'headline',
          type: 'headline',
          name: '상단 속보 바',
          text: headlineText ?? '[속보] 긴급 상황 발생... 전문가들 "침착하게 휴식 취해야"',
          x: 0.05,
          y: 0.88,
          align: 'left',
          fontSize: 22,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'subText',
          type: 'subText',
          name: '하단 티커 상세',
          text: subText ?? 'YTN 보도국 24시 속보 시스템 가동 중',
          x: 0.05,
          y: 0.94,
          align: 'left',
          fontSize: 20,
          fontWeight: 'normal',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#e2e8f0',
          fontFamily: 'gothic',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'YTN 로고',
          text: badgeText ?? 'YTN',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 24,
          fontWeight: '900',
          outlineWidth: 1.5,
          outlineColor: '#000000',
          textColor: '#f87171',
          fontFamily: 'impact',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'cnn-news':
      return [
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: 'BREAKING NEWS 헤더',
          text: badgeText ?? 'BREAKING NEWS',
          x: 0.05,
          y: 0.88,
          align: 'left',
          fontSize: 28,
          fontWeight: '900',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'impact',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '속보 헤드라인',
          text: headlineText ?? 'MASSIVE SHORTAGE OF COFFEE AND SLEEP REPORTED',
          x: 0.05,
          y: 0.94,
          align: 'left',
          fontSize: 26,
          fontWeight: '800',
          outlineWidth: 0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'impact',
          visible: true,
          isDeletable: false,
        },
      ];

    case 'investigative':
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '제보자 정보',
          text: subText ?? '제보자 A씨 (음성변조) / 전직 내부 관계자',
          x: 0.5,
          y: 0.81,
          align: 'center',
          fontSize: 30,
          fontWeight: 'bold',
          outlineWidth: 3.5,
          outlineColor: '#000000',
          textColor: '#f97316',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '인터뷰 진술 대사',
          text: headlineText ?? '"그날 밤, 그곳에선 분명 무슨 일이 벌어지고 있었습니다..."',
          x: 0.5,
          y: 0.89,
          align: 'center',
          fontSize: 38,
          fontWeight: 'bold',
          outlineWidth: 4.0,
          outlineColor: '#000000',
          textColor: '#fef08a',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: false,
        },
        {
          id: 'titleBadge',
          type: 'titleBadge',
          name: '프로그램 타이틀',
          text: badgeText ?? '그것이 알고싶다',
          x: 0.9,
          y: 0.08,
          align: 'right',
          fontSize: 22,
          fontWeight: 'bold',
          outlineWidth: 2.0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'myeongjo',
          visible: true,
          isDeletable: true,
        },
      ];

    case 'variety-meme':
    default:
      return [
        {
          id: 'subText',
          type: 'subText',
          name: '상황 설명',
          text: subText ?? '시청자(99) / 멘붕 상태',
          x: 0.5,
          y: 0.8,
          align: 'center',
          fontSize: 32,
          fontWeight: '900',
          outlineWidth: 4.0,
          outlineColor: '#000000',
          textColor: '#FFFFFF',
          fontFamily: 'retro',
          visible: true,
          isDeletable: true,
        },
        {
          id: 'headline',
          type: 'headline',
          name: '밈 자막',
          text: headlineText ?? '(대충 엄청난 일이 일어났다는 뜻)',
          x: 0.5,
          y: 0.89,
          align: 'center',
          fontSize: 46,
          fontWeight: '900',
          outlineWidth: 5.5,
          outlineColor: '#000000',
          textColor: '#fef08a',
          fontFamily: 'retro',
          visible: true,
          isDeletable: false,
        },
      ];
  }
}

// ----------------------------------------------------------------------
// 9 Comprehensive News & Human Theater Styles
// ----------------------------------------------------------------------

export const CAPTION_STYLES: CaptionStylePreset[] = [
  {
    id: 'human-theater',
    name: 'KBS 인간극장',
    channel: '휴먼 다큐멘터리',
    description:
      '명조체 서체 + 깔끔한 블랙 외곽선의 정통 다큐멘터리 인터뷰 자막 (첨부 이미지 스타일)',
    iconTag: '인간극장',
    themeColor: '#4f46e5',
    defaultConfig: {
      headline: '"계란이 다 떨어졌다"',
      subText: '시능지(23) / 자취생',
      badgeText: 'KBS 인간극장',
      locationText: '',
      fontFamily: 'myeongjo',
      fontSizeScale: 1.0,
      outlineWidth: 2.8,
      textAlign: 'center',
      bottomOffset: 12,
      enableLetterbox: false,
      letterboxSize: 10,
      enableVignette: true,
      showStationLogo: true,
      showLiveBadge: false,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: 'rgba(0,0,0,0)',
      accentColor: '#fbbf24',
    },
  },
  {
    id: 'kbs-news',
    name: 'KBS 9시 뉴스',
    channel: 'KBS 1TV',
    description: '코발트 블루 그라데이션 하단 바와 레드 [단독] 뱃지, 신뢰의 공영방송 뉴스',
    iconTag: '9시 뉴스',
    themeColor: '#1d4ed8',
    defaultConfig: {
      headline: '초강력 한파 속 계란 품귀 현상... 자취생들 "비상"',
      subText: '홍길동 기자 / 사회부',
      badgeText: '[단독] KBS 뉴스 9',
      locationText: '● LIVE 여의도 21:15',
      fontFamily: 'gothic',
      fontSizeScale: 1.0,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 5,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: true,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#1e3a8a',
      accentColor: '#dc2626',
    },
  },
  {
    id: 'mbc-news',
    name: 'MBC 뉴스데스크',
    channel: 'MBC TV',
    description: '다이내믹한 사선 배너와 시안 네온 포인트, 집중취재 및 인터뷰 네임플레이트',
    iconTag: '뉴스데스크',
    themeColor: '#0284c7',
    defaultConfig: {
      headline: '"월급날만 기다려"... 치솟는 물가에 지갑 닫는 청년들',
      subText: '김철수(28) / 직장인',
      badgeText: '[집중취재]',
      locationText: '서울 마포구 상암동',
      fontFamily: 'gothic',
      fontSizeScale: 1.0,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 5,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: true,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#0369a1',
      accentColor: '#06b6d4',
    },
  },
  {
    id: 'sbs-news',
    name: 'SBS 8 뉴스',
    channel: 'SBS TV',
    description: '세련된 딥 네이비 & 네온 일렉트릭 라인, 생생한 속보와 리포트 자막',
    iconTag: '8 뉴스',
    themeColor: '#0f172a',
    defaultConfig: {
      headline: '[현장출동] "이불 밖은 위험해" 기습 한파에 얼어붙은 출근길',
      subText: '이현장 기자 / 기동취재반',
      badgeText: 'SBS 8 NEWS',
      locationText: '● LIVE 목동 스튜디오',
      fontFamily: 'gothic',
      fontSizeScale: 1.0,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 5,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: true,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#0f172a',
      accentColor: '#38bdf8',
    },
  },
  {
    id: 'jtbc-news',
    name: 'JTBC 뉴스룸',
    channel: 'JTBC',
    description: '다크 슬레이트 매트 배너와 따옴표 인용 레이아웃, 심층 팩트체크 디자인',
    iconTag: '뉴스룸',
    themeColor: '#334155',
    defaultConfig: {
      headline: '“배가 고픈데 밥을 먹으면 배가 부릅니다”',
      subText: '박민수(31) / 인터뷰',
      badgeText: '[팩트체크] JTBC',
      locationText: '서울 상암동',
      fontFamily: 'gothic',
      fontSizeScale: 1.02,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 5,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: false,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#1e293b',
      accentColor: '#14b8a6',
    },
  },
  {
    id: 'ytn-news',
    name: 'YTN 24시 속보',
    channel: 'YTN',
    description: '상단 레드 긴급 속보 바 + 하단 옐로우 티커, 24시간 실시간 뉴스 전문',
    iconTag: 'YTN 속보',
    themeColor: '#b91c1c',
    defaultConfig: {
      headline: '[속보] 긴급 상황 발생... 전문가들 "침착하게 휴식 취해야"',
      subText: 'YTN 보도국 24시',
      badgeText: 'BREAKING NEWS',
      locationText: '● LIVE 15:42 상암동',
      fontFamily: 'gothic',
      fontSizeScale: 0.98,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 4,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: true,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#dc2626',
      accentColor: '#facc15',
    },
  },
  {
    id: 'cnn-news',
    name: 'CNN / 글로벌 속보',
    channel: 'Global News',
    description: '강렬한 레드 & 블랙 볼드 블록, 국제적 긴급 속보 BREAKING NEWS 스타일',
    iconTag: 'CNN',
    themeColor: '#cc0000',
    defaultConfig: {
      headline: 'BREAKING: MASSIVE SHORTAGE OF COFFEE AND SLEEP REPORTED',
      subText: 'Global Emergency Report',
      badgeText: 'BREAKING NEWS',
      locationText: '● LIVE 03:00 PM EST',
      fontFamily: 'impact',
      fontSizeScale: 1.0,
      outlineWidth: 0,
      textAlign: 'left',
      bottomOffset: 4,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: true,
      showLiveBadge: true,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      bannerColor: '#cc0000',
      accentColor: '#eab308',
    },
  },
  {
    id: 'investigative',
    name: '그것이 알고싶다 (시사 다큐)',
    channel: '탐사보도',
    description: '어두운 분위기의 음성변조 인터뷰, 진실을 추적하는 미스터리 시사 고발',
    iconTag: '그알 스타일',
    themeColor: '#18181b',
    defaultConfig: {
      headline: '"그날 밤, 그곳에선 분명 무언가 벌어지고 있었습니다..."',
      subText: '제보자 A씨 (음성변조) / 전직 내부 관계자',
      badgeText: '[단독 입수] 그것이 알고싶다',
      locationText: '익명 제보 현장',
      fontFamily: 'myeongjo',
      fontSizeScale: 1.02,
      outlineWidth: 3.5,
      textAlign: 'center',
      bottomOffset: 10,
      enableLetterbox: true,
      letterboxSize: 10,
      enableVignette: true,
      showStationLogo: true,
      showLiveBadge: false,
      textColor: '#fef08a',
      outlineColor: '#000000',
      bannerColor: 'rgba(0,0,0,0.7)',
      accentColor: '#f97316',
    },
  },
  {
    id: 'variety-meme',
    name: '예능 / 유튜브 인터뷰 밈',
    channel: '예능 자막',
    description: '선명한 옐로우 볼드 서체와 굵은 외곽선 & 섀도우, 빵 터지는 밈 연출',
    iconTag: '유튜브 밈',
    themeColor: '#eab308',
    defaultConfig: {
      headline: '(대충 엄청난 일이 일어났다는 뜻)',
      subText: '시청자(99) / 멘붕 상태',
      badgeText: '[충격]',
      locationText: '현실 도피 중',
      fontFamily: 'retro',
      fontSizeScale: 1.15,
      outlineWidth: 5.5,
      textAlign: 'center',
      bottomOffset: 12,
      enableLetterbox: false,
      letterboxSize: 8,
      enableVignette: false,
      showStationLogo: false,
      showLiveBadge: false,
      textColor: '#fef08a',
      outlineColor: '#000000',
      bannerColor: 'rgba(0,0,0,0)',
      accentColor: '#ec4899',
    },
  },
];

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// Default Master State
// ----------------------------------------------------------------------

export const DEFAULT_NEWS_CAPTION_CONFIG: NewsCaptionConfig = {
  styleId: 'human-theater',
  elements: createDefaultElementsForStyle('human-theater'),
  selectedElementId: null,
  headline: '"계란이 다 떨어졌다"',
  subText: '시능지(23) / 자취생',
  badgeText: 'KBS 인간극장',
  locationText: '',
  fontFamily: 'myeongjo',
  fontSizeScale: 1.0,
  outlineWidth: 2.8,
  textAlign: 'center',
  bottomOffset: 12,
  enableLetterbox: false,
  letterboxSize: 10,
  enableVignette: true,
  showStationLogo: true,
  showLiveBadge: false,
  textColor: '#FFFFFF',
  outlineColor: '#000000',
  bannerColor: 'rgba(0,0,0,0)',
  accentColor: '#fbbf24',
};
