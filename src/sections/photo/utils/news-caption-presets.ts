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

export interface NewsCaptionConfig {
  styleId: CaptionStyleId;
  // Content
  headline: string; // 메인 대사 또는 뉴스 헤드라인
  subText: string; // 인물 정보 또는 기자/리포터 (예: 시능지(23) / 자취생)
  badgeText: string; // 뱃지 (예: [속보], [단독], [인간극장])
  locationText: string; // 위치/시간/LIVE (예: 서울 영등포구, ● LIVE 21:00)
  // Typography
  fontFamily: FontFamilyChoice;
  fontSizeScale: number; // 0.6 ~ 1.6
  outlineWidth: number; // 외곽선 두께 (0 ~ 16)
  textAlign: 'center' | 'left';
  // Position & Layout
  bottomOffset: number; // 0 ~ 30 (%)
  enableLetterbox: boolean; // 16:9 시네마틱 상하 레터박스
  letterboxSize: number; // 5 ~ 18 (%)
  enableVignette: boolean; // 하단 다크 비네팅
  showStationLogo: boolean; // 방송국/타이틀 로고 표시
  showLiveBadge: boolean; // LIVE / 시간 뱃지 표시
  // Colors
  textColor: string;
  outlineColor: string;
  bannerColor: string;
  accentColor: string;
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
// 9 Comprehensive News & Human Theater Styles
// ----------------------------------------------------------------------

export const CAPTION_STYLES: CaptionStylePreset[] = [
  {
    id: 'human-theater',
    name: 'KBS 인간극장',
    channel: '휴먼 다큐멘터리',
    description:
      '명조체 서체 + 깊은 블랙 외곽선의 정통 다큐멘터리 인터뷰 자막 (첨부 이미지 스타일)',
    iconTag: '인간극장',
    themeColor: '#4f46e5',
    defaultConfig: {
      headline: '"계란이 다 떨어졌다"',
      subText: '시능지(23) / 자취생',
      badgeText: 'KBS 인간극장',
      locationText: '',
      fontFamily: 'myeongjo',
      fontSizeScale: 1.05,
      outlineWidth: 7,
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
      outlineWidth: 4,
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
      outlineWidth: 8,
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
// Quick Meme Quotes (원클릭 밈 대사 프리셋)
// ----------------------------------------------------------------------

export interface MemeQuotePreset {
  label: string;
  category: string;
  headline: string;
  subText: string;
  styleId?: CaptionStyleId;
}

export const MEME_QUOTE_PRESETS: MemeQuotePreset[] = [
  {
    label: '🍳 계란이 다 떨어졌다 (인간극장 원작)',
    category: '인간극장',
    headline: '"계란이 다 떨어졌다"',
    subText: '시능지(23) / 자취생',
    styleId: 'human-theater',
  },
  {
    label: '💸 월급은 통장을 스칠 뿐',
    category: '직장인',
    headline: '"월급은 통장을 스쳐 지나가는 바람 같은 존재죠"',
    subText: '김철수(34) / 직장인',
    styleId: 'human-theater',
  },
  {
    label: '💻 어제까지는 잘 됐는데...',
    category: '개발자',
    headline: '"제 로컬 컴퓨터에선 분명히 잘 돌아갔는데요..."',
    subText: '이개발(29) / 프론트엔드 개발자',
    styleId: 'human-theater',
  },
  {
    label: '📚 공부가 제일 쉬웠어요',
    category: '수험생',
    headline: '"그냥 책만 봤을 뿐인데 왜 다들 놀라는지 모르겠습니다"',
    subText: '박영재(19) / 수험생',
    styleId: 'human-theater',
  },
  {
    label: '🍵 사는 게 다 그런 거죠',
    category: '인생',
    headline: '"사는 게 뭐 별거 있습니까, 버티는 거죠"',
    subText: '최달관(52) / 자영업자',
    styleId: 'human-theater',
  },
  {
    label: '🛌 눈 떠보니 월요일',
    category: '직장인',
    headline: '"분명 금요일 저녁이었는데 눈 뜨니까 월요일 아침이었습니다"',
    subText: '정월요(26) / 신입사원',
    styleId: 'human-theater',
  },
  {
    label: '🐟 츄르가 다 떨어졌다',
    category: '반려동물',
    headline: '"츄르 캔이 비어있다. 당장 채워놓지 않으면 큰일 날 것이다"',
    subText: '야옹이(3) / 백수',
    styleId: 'human-theater',
  },
  {
    label: '🚨 [속보] 침대 밖 출근 불가 사태',
    category: '뉴스 속보',
    headline: '[속보] 강추위에 침대 밖 출근 전면 거부 사태 잇따라',
    subText: '기상청 특별 경보 발령',
    styleId: 'kbs-news',
  },
  {
    label: '🔍 [그알] 그날 밤의 진실',
    category: '탐사보도',
    headline: '"그 프로젝트는 시작할 때부터 이미 끝난 거나 다름없었습니다"',
    subText: '제보자 K씨 (음성변조) / 내부 관계자',
    styleId: 'investigative',
  },
];

// ----------------------------------------------------------------------
// Default Master State
// ----------------------------------------------------------------------

export const DEFAULT_NEWS_CAPTION_CONFIG: NewsCaptionConfig = {
  styleId: 'human-theater',
  headline: '"계란이 다 떨어졌다"',
  subText: '시능지(23) / 자취생',
  badgeText: 'KBS 인간극장',
  locationText: '',
  fontFamily: 'myeongjo',
  fontSizeScale: 1.05,
  outlineWidth: 7,
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
