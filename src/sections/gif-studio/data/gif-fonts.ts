// ----------------------------------------------------------------------
// GIF Studio Subtitle Font Registry & Web Font Loader
// ----------------------------------------------------------------------

export interface StudioFontItem {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting';
  url?: string;
  sampleText?: string;
}

export const STUDIO_FONTS: StudioFontItem[] = [
  {
    id: 'pretendard',
    name: '프리텐다드 (Pretendard)',
    family: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
    category: 'sans-serif',
    url: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
    sampleText: '가나다라 ABC 123',
  },
  {
    id: 'noto-sans-kr',
    name: '노토 산스 (Noto Sans KR)',
    family: "'Noto Sans KR', sans-serif",
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
    sampleText: '가나다라 ABC 123',
  },
  {
    id: 'black-han-sans',
    name: '검은고딕 (Black Han Sans)',
    family: "'Black Han Sans', sans-serif",
    category: 'display',
    url: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
    sampleText: '볼드 예능 자막',
  },
  {
    id: 'gmarket-sans',
    name: 'Gmarket 산스 (지마켓 산스)',
    family: "'GmarketSansMedium', sans-serif",
    category: 'sans-serif',
    url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff',
    sampleText: '깔끔한 강조 자막',
  },
  {
    id: 'jalnan',
    name: '여기어때 잘난체 (Jalnan)',
    family: "'Jalnan', sans-serif",
    category: 'display',
    url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/Jalnan.woff',
    sampleText: '둥글둥글 귀여운 자막',
  },
  {
    id: 'do-hyeon',
    name: '도현체 (Do Hyeon)',
    family: "'Do Hyeon', sans-serif",
    category: 'display',
    url: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
    sampleText: '레트로 포스터 자막',
  },
  {
    id: 'jua',
    name: '주아체 (Jua)',
    family: "'Jua', sans-serif",
    category: 'handwriting',
    url: 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
    sampleText: '부드러운 손글씨풍',
  },
  {
    id: 'nanum-gothic',
    name: '나눔고딕 (Nanum Gothic)',
    family: "'Nanum Gothic', sans-serif",
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700;800&display=swap',
    sampleText: '표준 정석 고딕',
  },
  {
    id: 'nanum-myeongjo',
    name: '나눔명조 (Nanum Myeongjo)',
    family: "'Nanum Myeongjo', serif",
    category: 'serif',
    url: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@700;800&display=swap',
    sampleText: '감성 명조체 자막',
  },
  {
    id: 'cafe24-ssurround',
    name: '카페24 써라운드',
    family: "'Cafe24Ssurround', sans-serif",
    category: 'display',
    url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/Cafe24Ssurround.woff',
    sampleText: '동글동글 볼드 자막',
  },
  {
    id: 'impact',
    name: 'Impact (임팩트 - 짤방 클래식)',
    family: 'Impact, Charcoal, sans-serif',
    category: 'display',
    sampleText: 'CLASSIC MEME FONT',
  },
  {
    id: 'comic-sans',
    name: 'Comic Sans MS',
    family: "'Comic Sans MS', cursive, sans-serif",
    category: 'handwriting',
    sampleText: 'Comic Fun Font',
  },
];

let fontsLoaded = false;

/**
 * Load external web fonts dynamically into document
 */
export function ensureStudioFontsLoaded(): void {
  if (typeof window === 'undefined' || fontsLoaded) return;

  const fontCss = `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Black+Han+Sans&family=Do+Hyeon&family=Jua&family=Nanum+Gothic:wght@700;800&family=Nanum+Myeongjo:wght@700;800&display=swap');

    @font-face {
      font-family: 'GmarketSansMedium';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Jalnan';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/Jalnan.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Cafe24Ssurround';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/Cafe24Ssurround.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'studio-fonts-stylesheet';
  styleEl.textContent = fontCss;
  document.head.appendChild(styleEl);
  fontsLoaded = true;
}
