import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export type ToolCategory = 'all' | 'ai' | 'data' | 'pdf' | 'media' | 'dev';

export interface CategoryInfo {
  id: ToolCategory;
  label: string;
  iconName: string;
  description: string;
}

export interface ToolItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ToolCategory;
  path: string;
  tag?: string;
  tagColor?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  isFeatured?: boolean;
  featuredRank?: number;
  badge?: string;
  accentColor: string;
  iconKey: string;
  features: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'all',
    label: '전체 도구',
    iconName: 'all',
    description: 'Ultra Office가 제공하는 모든 생산성 도구',
  },
  {
    id: 'ai',
    label: 'AI & 스마트',
    iconName: 'ai',
    description: '인공지능 비서 및 스마트 광학 인식 도구',
  },
  {
    id: 'data',
    label: '문서 & 데이터',
    iconName: 'data',
    description: '스프레드시트, 데이터 비교 및 파일 관리',
  },
  {
    id: 'pdf',
    label: 'PDF & 파일 변환',
    iconName: 'pdf',
    description: 'PDF 편집, 병합 및 포맷 상호 변환',
  },
  {
    id: 'media',
    label: '미디어 & 디자인',
    iconName: 'media',
    description: '조직도, 다이어그램 및 17종 사진 편집기',
  },
  {
    id: 'dev',
    label: '개발 & 생산성',
    iconName: 'dev',
    description: '개발자 툴킷, QR/바코드, 일정 및 유틸리티',
  },
];

export const TOOLS_DATA: ToolItem[] = [
  // 1. AI & Smart
  {
    id: 'agent',
    title: 'AI Agent',
    subtitle: '지능형 업무 비서 & 프롬프트 자동화',
    description:
      '문서 작성, 요약, 데이터 분석, 아이디어 도출 등 업무 전반을 지원하는 강력한 AI 어시스턴트입니다.',
    category: 'ai',
    path: paths.agent,
    tag: 'AI 핵심',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 1,
    accentColor: '#6366F1', // Indigo
    iconKey: 'agent',
    features: ['스마트 질의응답', '문서 요약 & 작성', '프롬프트 자동화', '아이디어 브레인스토밍'],
  },
  {
    id: 'ocr',
    title: '스마트 OCR',
    subtitle: '초고속 이미지/문서 문자 인식',
    description:
      '영수증, 명함, 캡처 이미지, 스캔 문서에서 텍스트를 정확하게 추출하고 즉시 복사/변환합니다.',
    category: 'ai',
    path: paths.ocr,
    tag: '고정밀',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#0EA5E9', // Sky blue
    iconKey: 'ocr',
    features: [
      '다국어 문자 인식',
      '표/문서 구조 인식',
      '영수증/명함 텍스트 추출',
      '원클릭 텍스트 복사',
    ],
  },

  // 2. Document & Data
  {
    id: 'docMaster',
    title: '워드 (Word Processor)',
    subtitle: 'Word 맞춤 작성, 템플릿 치환 & 대량 일괄 생성',
    description:
      '설치 없이 브라우저에서 워드(.docx) 문서를 작성하고, 템플릿 데이터 치환 및 100% 호환 뷰어를 제공합니다.',
    category: 'data',
    path: paths.docMaster,
    tag: '문서 필수',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 2,
    accentColor: '#2563EB', // Blue
    iconKey: 'docMaster',
    features: [
      'Word (.docx) 실시간 작성 및 다운로드',
      '표준 계약서/재직증명서 템플릿 치환',
      'Mammoth 기반 무설치 Word 뷰어',
      '수백 건 대량 일괄 ZIP 생성',
    ],
  },
  {
    id: 'spreadsheet',
    title: '스프레드시트 (Excel)',
    subtitle: '웹 기반 올인원 엑셀 & 데이터 시트',
    description:
      '설치 없이 브라우저에서 엑셀(XLSX, CSV) 파일을 열고 편집하며, 풍부한 수식과 필터를 지원합니다.',
    category: 'data',
    path: paths.spreadsheet,
    tag: '업무 필수',
    tagColor: 'success',
    isFeatured: true,
    featuredRank: 3,
    accentColor: '#10B981', // Emerald
    iconKey: 'spreadsheet',
    features: [
      '엑셀(XLSX/CSV) 완벽 호환',
      '복합 수식 & 필터링',
      '대용량 데이터 정렬',
      '시트 내보내기',
    ],
  },
  {
    id: 'translator',
    title: '다국어 번역기 (Translator)',
    subtitle: '180+ 언어 실시간 상호 번역 & 오피스 문서 번역',
    description:
      '설치 없이 브라우저에서 텍스트 및 오피스 문서를 180여 개국 언어로 즉시 번역하고, 동시 비교 및 음성 재생을 지원합니다.',
    category: 'data',
    path: paths.translator,
    tag: '글로벌 필수',
    tagColor: 'warning',
    isFeatured: true,
    featuredRank: 5,
    accentColor: '#8B5CF6',
    iconKey: 'translator',
    features: [
      '180+ 언어 실시간 양방향 번역',
      '다국어 동시 비교 일괄 번역',
      '오피스 문서 (TXT/MD/DOCX) 번역',
      'Web Speech 음성 듣기(TTS) & STT',
    ],
  },
  {
    id: 'compare',
    title: 'Diff Checker',
    subtitle: '실시간 Diff & 차이점 정밀 분석',
    description:
      '텍스트, 소스코드, JSON, 표 데이터 간의 차이점을 좌우 분할 뷰로 한눈에 비교하고 병합합니다.',
    category: 'data',
    path: paths.compare,
    tag: '강력 추천',
    tagColor: 'warning',
    isFeatured: true,
    featuredRank: 4,
    accentColor: '#F59E0B', // Amber
    iconKey: 'compare',
    features: [
      '좌우 실시간 Diff 뷰',
      '단어/줄 단위 강조',
      'JSON/코드 정밀 분석',
      '차이점 요약 리포트',
    ],
  },
  {
    id: 'text',
    title: '텍스트 마스터',
    subtitle: '텍스트 정제, 추출 & 포맷 변환기',
    description:
      '공백/특수문자 제거, 대소문자 변환, 정규식 추출, 텍스트 인코딩 변환 등 텍스트 가공을 한 번에 처리합니다.',
    category: 'data',
    path: paths.text.root,
    tag: '유틸리티',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#06B6D4', // Cyan
    iconKey: 'text',
    features: ['텍스트 Diff 비교', '정규식 패턴 추출', '대소문자/인코딩 변환', '문자/단어 수 통계'],
  },
  {
    id: 'drive',
    title: '오피스 드라이브',
    subtitle: '스마트 업무 파일 및 학습 보관함',
    description:
      '로컬 브라우저 기반으로 파일, 메모, 스크립트를 체계적인 폴더 구조로 안전하게 보관하고 관리합니다.',
    category: 'data',
    path: paths.fileManager,
    tag: '안전 저장',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#8B5CF6', // Purple
    iconKey: 'folder',
    features: ['폴더 기반 구조화', '파일 태그 및 검색', '로컬 안전 보관', '빠른 미리보기'],
  },

  // 3. PDF & Converters
  {
    id: 'pdf-master',
    title: 'PDF 마스터',
    subtitle: 'PDF 병합, 분할, 회전 & 변환 스튜디오',
    description:
      '여러 PDF 파일 병합, 특정 페이지 추출/분할, 회전, 워터마크 추가 및 이미지 변환을 브라우저에서 안전하게 처리합니다.',
    category: 'pdf',
    path: paths.pdfMaster,
    tag: '인기 도구',
    tagColor: 'error',
    isFeatured: true,
    featuredRank: 3,
    accentColor: '#EF4444', // Red
    iconKey: 'pdfMaster',
    features: [
      'PDF 병합 & 분할',
      '페이지 회전 & 순서 변경',
      'PDF <-> 이미지 상호 변환',
      '서버 미전송 100% 로컬 보안',
    ],
  },
  {
    id: 'file-convert',
    title: '파일 포맷 변환기',
    subtitle: '문서, 이미지, 데이터 포맷 상호 변환',
    description:
      '다양한 확장자의 문서, 이미지, 데이터 파일을 손쉽게 원하는 최신 포맷으로 즉시 변환합니다.',
    category: 'pdf',
    path: paths.fileConvert,
    tag: '다양한 포맷',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#3B82F6', // Blue
    iconKey: 'fileConvert',
    features: ['이미지 포맷 변환', '문서/데이터 변환', '고화질 무손실 변환', '일괄 배치 변환 지원'],
  },

  // 4. Media & Design
  {
    id: 'markdown',
    title: '마크다운 스튜디오',
    subtitle: '실시간 마크다운 에디터 & GFM 뷰어',
    description:
      '기획서(PRD), API 명세, 회의록, README 등 실무 마크다운 문서를 작성하고 실시간 미리보기를 제공합니다.',
    category: 'data',
    path: paths.markdown,
    tag: '문서 필수',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#3B82F6', // Blue
    iconKey: 'docMaster',
    features: [
      '실무 마크다운 템플릿 5종',
      'GFM 표/체크리스트/코드 하이라이트',
      '실시간 분할 뷰 미리보기',
      '.md 파일 내보내기 & 클립보드 복사',
    ],
  },
  {
    id: 'powerpoint',
    title: '파워 포인트 (Power Point)',
    subtitle: '16:9 프레젠테이션 & 차트 슬라이드 생성',
    description:
      '브라우저에서 16:9 프레젠테이션 슬라이드를 기획하고, 네이티브 차트 및 마스터 서식이 적용된 PPTX 파일로 즉시 다운로드합니다.',
    category: 'data',
    path: paths.powerpoint,
    tag: '발표 필수',
    tagColor: 'error',
    isFeatured: false,
    accentColor: '#EF4444', // Red
    iconKey: 'docMaster',
    features: [
      '16:9 슬라이드 캔버스 실시간 편집',
      'KPI 카드, 막대/원형 차트, 타임라인 레이아웃',
      '4가지 모던 프레젠테이션 테마',
      'PowerPoint (.pptx) 네이티브 파일 다운로드',
    ],
  },
  {
    id: 'diagram',
    title: '다이어그램 스튜디오',
    subtitle: '수식, 그래프, ERD & 조직도 스튜디오',
    description:
      'LaTeX 수식 렌더러, 비즈니스 차트, 데이터베이스 ERD 관계도 및 인터랙티브 조직도를 실시간으로 작성하고 시각화합니다.',
    category: 'media',
    path: paths.diagram,
    tag: '올인원 스튜디오',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 5,
    accentColor: '#14B8A6', // Teal
    iconKey: 'diagram',
    features: [
      '수식(LaTeX) 10종 공식 & 렌더링',
      '인터랙티브 비즈니스 그래프 & 차트',
      '데이터베이스 ERD & SQL DDL 생성',
      '조직도 & 마인드맵 인터랙티브 캔버스',
    ],
  },
  {
    id: 'image-tool',
    title: '이미지 툴킷',
    subtitle: '사진 압축, 리사이즈 & 빠른 편집',
    description:
      '대용량 이미지 무손실 용량 압축, 해상도 리사이징, 자르기, 필터 효과를 몇 번의 클릭으로 완성합니다.',
    category: 'media',
    path: paths.imageTool,
    tag: '빠른 처리',
    tagColor: 'primary',
    isFeatured: false,
    accentColor: '#EC4899', // Pink
    iconKey: 'imageTool',
    features: [
      '대용량 사진 초고속 압축',
      '원하는 픽셀 리사이즈',
      '스마트 크롭 & 회전',
      '웹 최적화 포맷 변환',
    ],
  },
  {
    id: 'photo',
    title: '사진 편집 스튜디오',
    subtitle: '19종 그래픽 & 아티스틱 크리에이터',
    description:
      '14종 예술 화풍 변환, 여백 조정, 정밀 크기 조절(리사이즈), 모자이크/블러, 워터마크, 로고/썸네일 제작, 픽셀 아트, 스마트 스캐너 등 전문 사진 도구를 제공합니다.',
    category: 'media',
    path: paths.photo.root,
    tag: '19종 세부도구',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#A855F7', // Violet
    iconKey: 'photo',
    features: [
      '스마트 여백 조정 & 그라데이션/블러 배경 확장',
      '너비/높이/퍼센트 정밀 이미지 크기 조절',
      '14종 예술 화풍 변환 & 아티스틱 스튜디오',
      '모자이크 & 블러 비식별화',
    ],
  },
  {
    id: 'gif-studio',
    title: 'GIF 편집 스튜디오',
    subtitle: '움짤 제작(사진/다중 GIF 이어붙이기), 동영상 ↔ GIF 변환, 분할, 배경색 & 배속 편집',
    description:
      '사진과 여러 GIF를 필모라 스타일 타임라인에서 이어붙이고 자르고 늘리는 움짤 제작, 동영상 ↔ GIF 상호 변환, 프레임 분할/추출, 배경색 변경 및 속도/역재생을 지원하는 올인원 GIF 전문 스튜디오입니다.',
    category: 'media',
    path: paths.gifStudio.root,
    tag: '5종 올인원',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 4,
    accentColor: '#8B5CF6', // Purple
    iconKey: 'gif',
    features: [
      '필모라 스타일 타임라인 사진 & 다중 GIF 이어붙이기',
      '동영상 ↔ GIF 양방향(MP4/WebM) 상호 변환',
      'GIF 프레임 분할 분석 & ZIP 일괄 다운로드',
      'GIF 배경색 변경, 크로마키 투명화 & 속도 조절',
    ],
  },

  // 5. Dev & Productivity
  {
    id: 'schedule',
    title: '일정 & 간트차트',
    subtitle: '프로젝트 일정 타임라인 & 캘린더',
    description:
      '프로젝트 마일스톤, 업무 타임라인, 간트차트 및 월간 캘린더를 통해 체계적으로 스케줄을 관리합니다.',
    category: 'dev',
    path: paths.schedule,
    tag: '프로젝트',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#6366F1', // Indigo
    iconKey: 'schedule',
    features: [
      '인터랙티브 간트차트',
      '월간/주간/일간 캘린더',
      '업무 마일스톤 관리',
      '일정 데이터 로컬 저장',
    ],
  },
  {
    id: 'dev-tools',
    title: '개발자 툴킷',
    subtitle: 'JSON, Base64, Hash & 정규식 유틸',
    description:
      'JSON 포맷터/유효성 검사, Base64 인코더, Hash/Crypto 암호화, 정규식 테스터 등 개발 및 IT 업무에 필수적인 툴셋입니다.',
    category: 'dev',
    path: paths.devTools,
    tag: '개발 필수',
    tagColor: 'primary',
    isFeatured: false,
    accentColor: '#4F46E5', // Deep Indigo
    iconKey: 'devTools',
    features: [
      'JSON 정렬 및 검증',
      'Base64/URL 인코딩/디코딩',
      'MD5, SHA256 Hash 계산',
      '정규식 실시간 테스터',
    ],
  },
  {
    id: 'code-runner',
    title: '코드 실행기 (OmniRunner)',
    subtitle: '브라우저 내 다국어 컴파일 & 웹 서버 실행',
    description:
      '서버 없이 브라우저 내에서 Node.js, Python (NumPy/Pandas/Matplotlib), C/C++, Rust, HTML/Express 웹 서버를 즉시 실행하고 실시간 미리보기를 제공합니다.',
    category: 'dev',
    path: paths.codeRunner,
    tag: '신규 기능',
    tagColor: 'success',
    isFeatured: true,
    featuredRank: 6,
    accentColor: '#38BDF8', // Sky
    iconKey: 'codeRunner',
    features: [
      'WebContainer (Node/Express) 엔진',
      'Pyodide Python 3.12 & Wasm 데이터 분석',
      'Matplotlib 실시간 차트 렌더링',
      'Monaco Editor & Xterm.js 통합 콘솔',
    ],
  },
  {
    id: 'dev-tools-ide',
    title: 'VS Code 타이핑 IDE',
    subtitle: '실시간 소스코드 타이핑 플레이어 & 시뮬레이터',
    description:
      'Visual Studio Code 스타일의 정통 IDE 환경에서 코드를 입력하고 재생 버튼을 누르면 실제 프로그래머처럼 한 글자씩 타이핑되는 효과와 타건음을 제공합니다.',
    category: 'dev',
    path: paths.devToolsIde,
    tag: 'NEW',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 7,
    accentColor: '#007ACC', // VS Code Blue
    iconKey: 'codeRunner',
    features: [
      'Visual Studio Code UI/UX 테마',
      '실시간 코드 타이핑(Type-writer) 애니메이션',
      '기계식 키보드 타건음 사운드 효과',
      '템플릿 프리셋 & 커스텀 코드 입력',
    ],
  },
  {
    id: 'barcode',
    title: 'QR & 바코드 생성기',
    subtitle: '비즈니스 커스텀 QR & 바코드 생성/스캔',
    description:
      'URL, 텍스트, Wi-Fi용 맞춤형 컬러 QR 코드와 다양한 산업 규격(Code128, EAN)의 바코드를 즉시 생성합니다.',
    category: 'dev',
    path: paths.barcode,
    tag: '커스텀',
    tagColor: 'warning',
    isFeatured: false,
    accentColor: '#D97706', // Amber Dark
    iconKey: 'barcode',
    features: [
      '컬러/로고 커스텀 QR 생성',
      '산업 표준 바코드 생성',
      '고해상도 이미지 다운로드',
      '카메라/이미지 스캔 지원',
    ],
  },
  {
    id: 'public',
    title: '주소 검색 & SQL 실습',
    subtitle: '도로명 주소 검색 & 브라우저 SQL 연습',
    description:
      '행정안전부 기반 빠른 도로명 우편번호/주소 검색과 브라우저 상에서 바로 실행되는 SQL 쿼리 실습 환경을 제공합니다.',
    category: 'dev',
    path: paths.public.root,
    tag: '공공/데이터',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#2563EB', // Blue
    iconKey: 'search',
    features: [
      '도로명/지번 우편번호 검색',
      '브라우저 메모리 SQL 실행',
      '테이블 생성 및 쿼리 연습',
      '데이터 내보내기',
    ],
  },
  {
    id: 'drawing',
    title: '사다리 & 룰렛 추첨',
    subtitle: '팀 빌딩, 점심 메뉴 & 순번 정하기',
    description:
      '팀 회의 순서 정하기, 점심 메뉴 추천, 경품 추첨을 위한 공정하고 재미있는 사다리타기와 룰렛 게임입니다.',
    category: 'dev',
    path: paths.drawing.root,
    tag: '팀 빌딩',
    tagColor: 'success',
    isFeatured: false,
    accentColor: '#059669', // Emerald Dark
    iconKey: 'drawing',
    features: [
      '실시간 사다리타기 추첨',
      '커스텀 확률 룰렛',
      '참가자 및 항목 자유 설정',
      '애니메이션 효과',
    ],
  },
  {
    id: 'hwpMaster',
    title: '한글 파일 문서',
    subtitle: '무설치 한글 공문서 뷰어 & 데이터 추출기',
    description:
      '설치 프로그램 없이 HWP/HWPX 공문서를 브라우저에서 즉시 열람하고 텍스트, 표(Excel), 이미지를 완벽 추출합니다.',
    category: 'data',
    path: paths.hwpMaster,
    tag: '공공/실무',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 4,
    accentColor: '#2563EB',
    iconKey: 'docMaster',
    features: [
      'HWP/HWPX 공문서 즉시 열람',
      '본문 텍스트 복사 & MD 변환',
      '표 데이터 CSV/Excel 추출',
      'A4 인쇄 & PDF 내보내기',
    ],
  },
  {
    id: 'stampStudio',
    title: '전자 도장 · 직인 스튜디오',
    subtitle: '투명 직인 생성 & PDF 원클릭 날인기',
    description:
      '개인 도장, 회사 대표이사 직인, 결재 도장을 실시간 생성하고 PDF나 견적서/거래명세서에 바로 날인합니다.',
    category: 'pdf',
    path: paths.stampStudio,
    tag: '결재/계약',
    tagColor: 'error',
    isFeatured: true,
    featuredRank: 5,
    accentColor: '#DC2626',
    iconKey: 'pdfMaster',
    features: [
      '원형/사각/법인 직인 생성',
      '인주 질감 투명 PNG 출력',
      'PDF/문서 원클릭 드래그 날인',
      '견적서/거래명세서 자동 서식',
    ],
  },
  {
    id: 'screenRecorder',
    title: '화면 & 웹캠 녹화 스튜디오',
    subtitle: '설치 없는 브라우저 화면 캡처 & GIF 제작',
    description:
      '별도 프로그램 없이 브라우저 화면/창/웹캠을 녹화하고, 타임라인을 트리밍하여 고화질 GIF나 비디오로 즉시 변환합니다.',
    category: 'media',
    path: paths.screenRecorder,
    tag: '무설치 캡처',
    tagColor: 'info',
    isFeatured: true,
    featuredRank: 6,
    accentColor: '#7C3AED',
    iconKey: 'video',
    features: [
      '화면/창/브라우저 탭 녹화',
      '마이크 음성 & 웹캠 PIP',
      '시작/끝 구간 트리밍',
      '고화질 GIF & WebM 변환',
    ],
  },
  {
    id: 'gigaViewer',
    title: '대용량 로그 & CSV 초고속 뷰어',
    subtitle: '100만 행도 멈춤 없는 가상 스크롤 & SQL',
    description:
      '수백 MB의 대용량 로그나 CSV 파일도 브라우저 튕김 없이 가상 스크롤로 열람하고 SQL/정규식으로 고속 필터링합니다.',
    category: 'data',
    path: paths.gigaViewer,
    tag: '초고속 렌더',
    tagColor: 'warning',
    isFeatured: false,
    accentColor: '#F59E0B',
    iconKey: 'devTools',
    features: [
      '100만 행 가상 스크롤 렌더링',
      '로그 레벨(ERROR/WARN) 필터',
      '브라우저 SQL 쿼리 실행',
      '필터 데이터 엑셀 내보내기',
    ],
  },
  {
    id: 'privacySanitizer',
    title: '개인정보 마스킹 · EXIF 파기',
    subtitle: '문서 개인정보 블라인드 & 사진 위치정보 제거',
    description:
      '주민번호, 계좌, 전화번호를 자동 탐지하여 마스킹하고, 사진 속 GPS 촬영 위치/카메라 메타데이터를 영구 세척합니다.',
    category: 'ai',
    path: paths.privacySanitizer,
    tag: '보안/안심',
    tagColor: 'success',
    isFeatured: false,
    accentColor: '#10B981',
    iconKey: 'agent',
    features: [
      '주민번호/계좌/전화번호 자동 마스킹',
      '사진 GPS/EXIF 메타데이터 파기',
      '신분증/영수증 사각 모자이크',
      '사본 워터마크 날인',
    ],
  },
  {
    id: 'logicLab',
    title: '디지털 논리회로 랩 (Logic Lab)',
    subtitle: '게이트 연결 & CPU 가산기/플립플롭 시뮬레이터',
    description:
      'AND, OR, NOT, XOR 게이트와 전선을 마우스로 연결해 반가산기, 전가산기, SR래치, 7세그먼트 회로를 시뮬레이션하고 진리표를 자동 계산합니다.',
    category: 'dev',
    path: paths.logicLab,
    tag: 'CS 핵심',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 7,
    accentColor: '#3B82F6',
    iconKey: 'devTools',
    features: [
      '게이트 배치 & 전선 드래그 연결',
      '신호(0/1) 실시간 전파 시뮬레이션',
      '진리표(Truth Table) 자동 생성',
      '반가산기/카운터 실전 프리셋',
    ],
  },
  {
    id: 'algoVisualizer',
    title: '알고리즘 & 자료구조 랩 (Algo Studio)',
    subtitle: '정렬, A* 미로 탐색 & 트리 시각화 애니메이션',
    description:
      '퀵/병합 정렬과 A* 최단 경로 탐색, 이진 탐색 트리의 동작 과정을 단계별(Step-by-step) 실시간 애니메이션으로 관찰합니다.',
    category: 'dev',
    path: paths.algoVisualizer,
    tag: '알고리즘',
    tagColor: 'info',
    isFeatured: true,
    featuredRank: 8,
    accentColor: '#8B5CF6',
    iconKey: 'codeRunner',
    features: [
      '정렬 6종 실시간 비교 애니메이션',
      'A* / 다익스트라 미로 최단경로 탐색',
      '이진 탐색 트리 회전 시각화',
      '단계별 Step 실행 & 속도 조절',
    ],
  },
  {
    id: 'bitLab',
    title: '비트 & IEEE-754 랩 (Bit & Binary Lab)',
    subtitle: '부동소수점 비트 분해 & 0.1+0.2 오차 증명기',
    description:
      '32/64비트 IEEE-754 부동소수점의 부호/지수/가수 비트를 분해하고, 2/8/10/16진수 변환 및 비트마스크/Shift 연산을 시뮬레이션합니다.',
    category: 'dev',
    path: paths.bitLab,
    tag: '비트/진법',
    tagColor: 'warning',
    isFeatured: false,
    accentColor: '#F59E0B',
    iconKey: 'devTools',
    features: [
      'IEEE-754 비트 단위 대화형 토글',
      '0.1+0.2 부동소수점 정밀도 오차 증명',
      '2/8/10/16진수 실시간 동기화',
      'Shift/비트마스크 연산기',
    ],
  },
  {
    id: 'linearAlgebra',
    title: '선형대수 & 공간 변환 (Linear Algebra)',
    subtitle: '2D/3D 기저벡터 왜곡 & 행렬식 시각화',
    description:
      '2x2/3x3 변환 행렬을 입력하여 기저벡터와 공간 격자가 회전/전단/스케일링되는 왜곡 애니메이션과 행렬식(Det), 역행렬을 계산합니다.',
    category: 'data',
    path: paths.linearAlgebra,
    tag: '수학/기하',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#EC4899',
    iconKey: 'mathGraph',
    features: [
      '2D/3D 선형 변환 격자 애니메이션',
      '행렬식(Determinant) 면적 시각화',
      '고유값 & 고유벡터 실시간 계산',
      '가우스-요르단 소거법 단계별 풀이',
    ],
  },
  {
    id: 'physicsSandbox',
    title: '2D 물리 & 과학 샌드박스 (Physics & Science)',
    subtitle: '강체 충돌, 이중진자 카오스 & 화학 반응식 밸런서',
    description:
      '중력, 탄성, 마찰력이 작동하는 2D 물리 놀이터에서 포물선과 이중진자를 시뮬레이션하고, 화학 반응식 양론 계수를 자동 계산합니다.',
    category: 'data',
    path: paths.physicsSandbox,
    tag: '물리/화학',
    tagColor: 'success',
    isFeatured: false,
    accentColor: '#10B981',
    iconKey: 'mathGraph',
    features: [
      '2D 강체 물리 충돌 & 포물선 운동',
      '이중 진자(Double Pendulum) 카오스 궤적',
      '화학 반응식 계수 자동 맞춤',
      '인터랙티브 원소 주기율표',
    ],
  },
  {
    id: 'normalDistribution',
    title: '정규분포 & 확률통계 랩 (Normal Distribution & Stats)',
    subtitle: '골턴 보드 물리 시뮬레이션, 중심극한정리 & 가우스 곡선 탐색기',
    description:
      '수천 개의 구슬이 핀을 튕겨 종 모양 곡선을 만드는 골턴 보드와, 임의의 모집단에서 정규분포로 수렴하는 중심극한정리(CLT) 및 Z-Score 확률 계산을 시각적으로 탐구합니다.',
    category: 'data',
    path: paths.normalDistribution,
    tag: '확률/통계',
    tagColor: 'primary',
    isFeatured: true,
    featuredRank: 9,
    accentColor: '#3B82F6',
    iconKey: 'mathGraph',
    features: [
      '골턴 보드(Galton Board) 2D 물리 드롭 시뮬레이션',
      '중심극한정리(CLT) 6종 분포 표본평균 수렴 실험',
      '가우스 정규분포 곡선, 구간 적분 & Z-Score 계산기',
      'Box-Muller 난수 생성 & Q-Q 플롯 정규성 검정',
    ],
  },
  {
    id: 'montyHall',
    title: '몬티홀 & 확률 역설 랩 (Monty Hall & Paradoxes)',
    subtitle: '몬티홀 3문/N문 게임, 생일 역설, 죄수의 딜레마 & 심슨의 역설',
    description:
      '인간의 직관을 깨뜨리는 유명한 몬티홀 딜레마를 대화형 게임과 10만 회 몬테카를로 검증으로 증명하고, 생일 역설 및 반복 게임이론 AI 토너먼트를 시뮬레이션합니다.',
    category: 'data',
    path: paths.montyHall,
    tag: '확률/게임이론',
    tagColor: 'warning',
    isFeatured: true,
    featuredRank: 10,
    accentColor: '#F59E0B',
    iconKey: 'drawing',
    features: [
      '몬티홀 3문 & N문 대화형 게임 및 10만 회 검증',
      '생일 역설 (Birthday Paradox) 충돌 룸 시각화',
      '반복 죄수의 딜레마 (Tit-for-Tat 등 게임이론 대전)',
      "심슨의 역설 (Simpson's Paradox) 통계 왜곡 증명",
    ],
  },
  {
    id: 'fractalsChaos',
    title: '프랙탈 & 카오스 랩 (Fractals & Chaos Studio)',
    subtitle: '만델브로·줄리아 딥 줌, 바른슬리 고사리 & 로렌츠 나비 효과',
    description:
      '복소 평면에서 무한히 확장되는 만델브로/줄리아 프랙탈 집합을 딥 줌으로 탐색하고, 바른슬리 고사리 카오스 게임 및 로렌츠 어트랙터 3D 나비 효과를 관찰합니다.',
    category: 'data',
    path: paths.fractalsChaos,
    tag: '카오스/프랙탈',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#EC4899',
    iconKey: 'mathGraph',
    features: [
      '만델브로 & 줄리아 집합 실시간 딥 줌 (Deep Zoom)',
      '카오스 게임 & 바른슬리 고사리(Barnsley Fern)',
      '로렌츠 어트랙터 3D 나비 효과 궤적 시뮬레이터',
      '시에르핀스키 삼각형 & 프랙탈 차원 분석',
    ],
  },
  {
    id: 'cellularAutomata',
    title: '셀룰러 오토마타 & 라이프 게임 (Cellular Automata)',
    subtitle: '콘웨이의 라이프 게임 (인공생명) & 울프럼 1D 룰 탐색기',
    description:
      '단순한 규칙에서 스스로 진화하고 복잡한 생명체 구조를 형성하는 콘웨이의 라이프 게임과 튜링 완전성을 갖는 울프럼 1D 셀룰러 오토마타를 시뮬레이션합니다.',
    category: 'dev',
    path: paths.cellularAutomata,
    tag: '인공생명/CS',
    tagColor: 'info',
    isFeatured: false,
    accentColor: '#06B6D4',
    iconKey: 'devTools',
    features: [
      '콘웨이의 라이프 게임 (글라이더 건 등 20종 프리셋)',
      '울프럼 1D 셀룰러 오토마타 (Rule 30, 90, 110 등 256종)',
      '60fps 초고속 캔버스 & 인터랙티브 펜 드로잉',
      'B3/S23 커스텀 생명 탄생/생존 규칙 에디터',
    ],
  },
  {
    id: 'waveOptics',
    title: '파동, 광학 & 푸리에 랩 (Wave & Fourier Studio)',
    subtitle: '푸리에 에피사이클 분해, 이중 슬릿 간섭 & 스넬의 굴절/프리즘',
    description:
      '임의의 파형이나 그림을 회전하는 원(에피사이클)들의 합으로 분해하는 푸리에 급수와, 영의 이중 슬릿 파동 간섭, 빛의 굴절/반사/전반사 및 프리즘 무지개 분산을 탐구합니다.',
    category: 'data',
    path: paths.waveOptics,
    tag: '파동/광학',
    tagColor: 'success',
    isFeatured: false,
    accentColor: '#10B981',
    iconKey: 'mathGraph',
    features: [
      '푸리에 급수 & 자유 드로잉 에피사이클 분해',
      '영(Young)의 이중 슬릿 파동 간섭 무늬 시뮬레이터',
      "스넬의 법칙(Snell's Law) 빛의 굴절 & 전반사",
      '프리즘 광학 매질별 무지개 빛 분산 렌더러',
    ],
  },
  {
    id: 'monteCarlo',
    title: '몬테카를로 & 기하 확률 랩 (Monte Carlo Studio)',
    subtitle: '뷔퐁의 바늘, 원주율(π) 난수 추정 & 브라운 운동 확산',
    description:
      '평행선에 바늘을 던져 원주율을 구하는 뷔퐁의 바늘과 몬테카를로 파이 점 투척, 1D/2D 무작위 보행(Random Walk) 및 주식 기하 브라운 운동(GBM)을 시뮬레이션합니다.',
    category: 'data',
    path: paths.monteCarlo,
    tag: '수치해석/확률',
    tagColor: 'primary',
    isFeatured: false,
    accentColor: '#6366F1',
    iconKey: 'mathGraph',
    features: [
      "뷔퐁의 바늘 (Buffon's Needle) 기하 확률 파이 근사",
      '몬테카를로 2D 점 투척 원주율(π) 수렴 시뮬레이터',
      '1D/2D 랜덤 워크 (Random Walk) 확산 궤적',
      '기하 브라운 운동 (GBM) 금융 시계열 시뮬레이션',
    ],
  },
];

export const WORKSPACE_METRICS = [
  {
    iconKey: 'lock',
    title: '100% 로컬 프라이버시',
    subtitle: '서버 저장 없는 완벽한 보안',
    description:
      '모든 파일과 데이터는 브라우저 내부에서만 처리되어 회사 기밀이나 개인정보 유출 걱정이 없습니다.',
  },
  {
    iconKey: 'flash',
    title: '초고속 WebAssembly 엔진',
    subtitle: '대용량 작업도 딜레이 없이 즉시 실행',
    description: '최적화된 웹 기술로 대용량 엑셀, PDF, 이미지 변환 작업도 빠르게 수행합니다.',
  },
  {
    iconKey: 'devices',
    title: '설치 없는 웹 올인원',
    subtitle: '어디서나 링크 하나로 즉시 사용',
    description:
      '복잡한 소프트웨어 설치나 권한 승인 없이, 브라우저만 있으면 모든 도구를 즉시 활용할 수 있습니다.',
  },
  {
    iconKey: 'free',
    title: '완전 무료 & 무제한',
    subtitle: '가입/결제 제한 없는 자유로운 이용',
    description:
      '별도의 유료 구독이나 사용량 제한 없이 모든 프리미엄 업무 도구를 영구적으로 무료 제공합니다.',
  },
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: '도구 선택',
    description: '상단 검색창이나 카테고리에서 필요한 업무 도구를 클릭하세요.',
  },
  {
    step: '02',
    title: '데이터 작업',
    description: '파일을 드래그하거나 내용을 붙여넣어 안전하게 처리하세요.',
  },
  {
    step: '03',
    title: '결과물 저장',
    description: '완성된 파일이나 텍스트를 원하는 포맷으로 즉시 다운로드하세요.',
  },
];
