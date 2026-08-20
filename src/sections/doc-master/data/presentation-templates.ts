import type { PptDeck, PptTheme } from '../types';

export const PPT_THEMES: Record<string, PptTheme> = {
  'navy-tech': {
    id: 'navy-tech',
    name: '모던 네이비 테크 (Modern Navy)',
    bgColor: '#0f172a',
    cardBg: '#1e293b',
    titleColor: '#38bdf8',
    textColor: '#f8fafc',
    accentColor: '#0ea5e9',
    fontFamily: 'Pretendard, Arial, sans-serif',
  },
  'minimal-mono': {
    id: 'minimal-mono',
    name: '미니멀 모노크롬 (Minimal Monochrome)',
    bgColor: '#ffffff',
    cardBg: '#f1f5f9',
    titleColor: '#0f172a',
    textColor: '#334155',
    accentColor: '#2563eb',
    fontFamily: 'Pretendard, Arial, sans-serif',
  },
  'startup-gradient': {
    id: 'startup-gradient',
    name: '스타트업 그라디언트 (Vibrant Startup)',
    bgColor: '#18181b',
    cardBg: '#27272a',
    titleColor: '#a855f7',
    textColor: '#fafafa',
    accentColor: '#ec4899',
    fontFamily: 'Pretendard, Arial, sans-serif',
  },
  'executive-dark': {
    id: 'executive-dark',
    name: '이그제큐티브 골드 & 다크 (Executive Gold)',
    bgColor: '#111827',
    cardBg: '#1f2937',
    titleColor: '#fbbf24',
    textColor: '#f9fafb',
    accentColor: '#f59e0b',
    fontFamily: 'Pretendard, Arial, sans-serif',
  },
};

export const SAMPLE_PPT_DECKS: Record<string, PptDeck> = {
  'startup-pitch': {
    title: 'Ultra Office AI - 스타트업 IR 피치덱',
    author: 'Ultra Office Team',
    company: '(주)울트라오피스',
    themeId: 'navy-tech',
    slides: [
      {
        id: 's1',
        layout: 'title',
        title: 'Ultra Office AI',
        subtitle: '브라우저 단독 무설치 클라우드 네이티브 오피스 자동화 솔루션',
        speakerNotes: '발표 시작 인사 및 프로덕트 한 줄 비전 소개',
      },
      {
        id: 's2',
        layout: 'kpi-cards',
        title: '핵심 시장 기회 및 성장 지표',
        subtitle: '글로벌 문서 자동화 SaaS 시장의 폭발적인 성장세',
        kpiList: [
          { label: '글로벌 시장 규모', value: '$24.5B', desc: '2028년 예상 TAM' },
          { label: '연평균 성장률', value: '31.2%', desc: 'CAGR (2024-2028)' },
          { label: '비용 절감 효과', value: '75%', desc: '기존 라이선스 대비' },
        ],
      },
      {
        id: 's3',
        layout: 'chart-bar',
        title: '문서 처리 속도 벤치마크 (초)',
        subtitle: '기존 서버 렌더링 vs Ultra Office 클라이언트 엔진 비교',
        chartTitle: '대용량 1,000페이지 변환 소요 시간',
        chartLabels: ['기존 레거시 서버', '타사 클라우드 API', 'Ultra Office AI'],
        chartData: [18.4, 8.2, 1.2],
        bullets: [
          '서버 통신 지연시간 제로 (Zero Latency)',
          '브라우저 멀티스레드 WebAssembly 최적화',
          '민감 데이터 외부 유출 원천 차단 (Privacy First)',
        ],
      },
      {
        id: 's4',
        layout: 'chart-pie',
        title: '고객군별 도입 비중',
        subtitle: '엔터프라이즈, 스타트업, 공공 및 교육 기관 도입 현황',
        chartTitle: '도입 조직 세그먼트',
        chartLabels: ['IT / 스타트업', '금융 / 공공', '제조 / 유통', '교육 / 학술'],
        chartData: [45, 25, 20, 10],
      },
      {
        id: 's5',
        layout: 'timeline',
        title: '2026 ~ 2027 제품 로드맵',
        subtitle: '단계별 기능 확장 및 글로벌 진출 전략',
        timelineSteps: [
          {
            step: 'Q3 2026',
            title: 'DocMaster 1.0 출시',
            desc: 'Word, PPT, Markdown 다중 엔진 지원',
          },
          { step: 'Q4 2026', title: '팀 실시간 협업', desc: 'WebRTC P2P 기반 동시 편집' },
          {
            step: 'Q1 2027',
            title: '글로벌 엔터프라이즈',
            desc: '다국어 현지화 및 컴플라이언스 인증',
          },
        ],
      },
      {
        id: 's6',
        layout: 'team',
        title: '핵심 리더십 팀',
        subtitle: '글로벌 테크 기업 출신의 검증된 엔지니어링 조직',
        teamMembers: [
          { name: '홍길동', role: 'CEO / Co-founder', desc: '전 구글 시니어 PM, 연쇄 창업가' },
          {
            name: '김철수',
            role: 'CTO / Co-founder',
            desc: '카이스트 전산학, Wasm 컴파일러 전문가',
          },
          { name: '이영희', role: 'Head of Product', desc: 'SaaS UX 디자인 10년 경력' },
        ],
      },
      {
        id: 's7',
        layout: 'conclusion',
        title: '함께 오피스의 미래를 만들어갑니다',
        subtitle: 'Ultra Office AI와 함께 업무 혁신을 시작하세요',
        bodyText: '투자 및 파트너십 문의: contact@ultra-office.io | https://ultra-office.io',
      },
    ],
  },
};
