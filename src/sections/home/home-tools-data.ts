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
    description: '조직도, 다이어그램 및 16종 사진 편집기',
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
    id: 'spreadsheet',
    title: '스프레드시트',
    subtitle: '웹 기반 올인원 엑셀 & 데이터 시트',
    description:
      '설치 없이 브라우저에서 엑셀(XLSX, CSV) 파일을 열고 편집하며, 풍부한 수식과 필터를 지원합니다.',
    category: 'data',
    path: paths.spreadsheet,
    tag: '업무 필수',
    tagColor: 'success',
    isFeatured: true,
    featuredRank: 2,
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
    id: 'compare',
    title: '데이터 & 코드 비교',
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
    id: 'diagram',
    title: '다이어그램 & 문서 스튜디오',
    subtitle: '수식, 그래프, 마크다운 & ERD 올인원 스튜디오',
    description:
      'LaTeX 수식 렌더러, 비즈니스 차트, 실무 마크다운 문서 및 데이터베이스 ERD 관계도를 실시간으로 작성하고 시각화합니다.',
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
      '실무 마크다운 에디터 & 템플릿',
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
    subtitle: '16종 그래픽 & 아티스틱 크리에이터',
    description:
      '화풍 변환, 모자이크/블러, 워터마크, GIF 애니메이션, 로고/썸네일 제작, 픽셀 아트 등 16가지 전문 도구를 제공합니다.',
    category: 'media',
    path: paths.photo.root,
    tag: '16종 세부도구',
    tagColor: 'secondary',
    isFeatured: false,
    accentColor: '#A855F7', // Violet
    iconKey: 'photo',
    features: [
      '화풍 변환 & 픽셀/글리치 아트',
      '모자이크 & 블러 비식별화',
      'GIF 제작 & 워터마크 각인',
      '유튜브/SNS 썸네일 & 로고',
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
