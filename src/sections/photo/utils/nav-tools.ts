import type React from 'react';
import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export interface HubToolItem {
  id: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
  section: string;
  groupTitle?: string;
  description: string;
  tag?: string;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface HubSectionGroup {
  section: string;
  tools: HubToolItem[];
}

// ----------------------------------------------------------------------

/**
 * 사전 정의된 상세 도구 메타데이터 (설명, 태그, 뱃지 색상)
 * 키: 경로(path) 또는 도구명(title)
 */
export const TOOL_METADATA_MAP: Record<
  string,
  {
    description?: string;
    tag?: string;
    badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }
> = {
  // 앱인토스
  [paths.photo.logo]: {
    description: '정사각형 크롭 및 600x600 고해상도 앱 아이콘/프로필 생성',
    tag: '규격 맞춤',
    badgeColor: 'info',
  },
  [paths.photo.color]: {
    description: '원클릭 흰색↔투명 전환 및 스마트 페인트 통 영역 채우기',
    tag: '투명화',
    badgeColor: 'info',
  },
  [paths.photo.sero]: {
    description: '모바일 카드/숏폼/인스타 스토리 규격 636x1048 일괄 스크린샷 생성',
    tag: '모바일',
    badgeColor: 'success',
  },
  [paths.photo.garo]: {
    description: '유튜브/블로그/웹 배너 규격 1504x741 가로 스크린샷 일괄 생성',
    tag: '데스크톱',
    badgeColor: 'warning',
  },
  [paths.photo.ogImage]: {
    description: '1200x600 토스 오픈그래프 규격 맞춤 리사이즈 & 공유 카드 시뮬레이터',
    tag: '1200x600',
    badgeColor: 'primary',
  },

  // 사진 필터 및 효과
  [paths.photo.artStyle]: {
    description: '인상파 유화, 수묵화, 색연필, 수채화, 지브리 애니 등 14종 예술 화풍',
    tag: '인기',
    badgeColor: 'secondary',
  },
  [paths.photo.ascii]: {
    description: '사진을 텍스트 문자로 변환 (Dark, Matrix, Cyber, Full Color)',
    tag: 'NEW',
    badgeColor: 'success',
  },
  [paths.photo.pixel]: {
    description: '8비트 게임보이 / NES 패미컴 레트로 도트 그래픽 변환기',
    tag: '레트로',
    badgeColor: 'warning',
  },
  [paths.photo.glitch]: {
    description: 'RGB 색수차 분리, CRT 스캔라인, 노이즈 왜곡 효과 생성',
    tag: '이펙트',
    badgeColor: 'secondary',
  },
  [paths.photo.weathering]: {
    description: '세대 손실(Generation Loss), 짤방 열화, 카톡 무한 압축 시뮬레이터',
    tag: 'NEW',
    badgeColor: 'success',
  },
  [paths.photo.memeLab]: {
    description: '와이드 푸틴, 레이저 눈, 코봉이 왜곡, 흑화 10단계, 3D 스피닝 짤방',
    tag: 'HOT',
    badgeColor: 'error',
  },
  [paths.photo.fourCut]: {
    description: '4컷 / 2x2 격자 / 폴라로이드 감성 프레임 & 스티커 포토부스',
    tag: '추천',
    badgeColor: 'primary',
  },

  // 사진 편집 스튜디오
  [paths.photo.bgRemove]: {
    description: 'WebGPU 기반 1초 만에 인물, 헤어라인, 제품 배경 100% 로컬 분리',
    tag: 'AI 추천',
    badgeColor: 'primary',
  },
  [paths.photo.padding]: {
    description: '상하좌우 여백 확장, SNS 규격 자동 맞춤 & 스마트 그라데이션/블러 배경 채우기',
    tag: 'NEW',
    badgeColor: 'success',
  },
  [paths.ocr]: {
    description: '영수증, 명함, 캡처 이미지, 스캔 문서에서 텍스트를 정확하게 추출',
    tag: '고정밀',
    badgeColor: 'info',
  },
  [paths.photo.colorPicker]: {
    description: '사진 픽셀 스포이드, HEX/RGB/HSL/HSV/CMYK 정밀 색상 코드 추출 & 복사',
    tag: '디자인',
    badgeColor: 'warning',
  },
  [paths.photo.compress]: {
    description: '화질 손실 없는 고효율 대용량 사진 압축 및 Before/After 실시간 비교',
    tag: '최적화',
    badgeColor: 'success',
  },
  [paths.photo.resize]: {
    description: '너비/높이 픽셀 지정, 비율 유지, 확대 방지, 25%/50%/75% 및 사용자 비율 조절',
    tag: 'NEW',
    badgeColor: 'primary',
  },
  [paths.photo.convert]: {
    description: 'PNG, JPG, WEBP, AVIF, ICO, BMP 고속 일괄 변환 & ZIP 다운로드',
    tag: '포맷 변환',
    badgeColor: 'info',
  },
  [paths.photo.svg]: {
    description: '이미지(PNG/JPG)를 벡터 SVG로 변환 & SVG 파일/코드 래스터 고화질 렌더링',
    tag: 'NEW',
    badgeColor: 'primary',
  },
  [paths.photo.flip]: {
    description: '정밀 거울 대칭 좌우/상하 반전, 90° 각도 회전 & 만화경 대칭 합성',
    tag: 'NEW',
    badgeColor: 'success',
  },
  [paths.photo.shapeCrop]: {
    description: '원형, 하트, 별, 육각형, 꽃, 말풍선 형태로 사진 크롭 & 펀칭',
    tag: '도형 크롭',
    badgeColor: 'error',
  },
  [paths.photo.mosaic]: {
    description: '얼굴 자동 감지, 민감 정보 OCR 자동 마스킹, 브러시/도형 모자이크',
    tag: 'AI 인식',
    badgeColor: 'info',
  },
  [paths.photo.aiWatermark]: {
    description: 'ChatGPT, Gemini, Claude 등 AI 로고와 손그림 마커 자유 드래그 각인',
    tag: 'AI 추천',
    badgeColor: 'primary',
  },
  [paths.photo.watermark]: {
    description: '텍스트, 사용자 지정 로고/도장, AI 아이콘 대각선 반복 타일 일괄 각인',
    tag: '추천',
    badgeColor: 'primary',
  },
  [paths.photo.scan]: {
    description: '일반 스마트폰 촬영 문서를 선명한 평판 스캐너/복사기 룩으로 변환 & PDF 생성',
    tag: 'NEW',
    badgeColor: 'success',
  },
  [paths.photo.pdf]: {
    description: '이미지 다중 선택 PDF 제작(A4/Letter) 및 PDF 페이지 이미지 추출',
    tag: '문서',
    badgeColor: 'error',
  },

  // GIF 스튜디오
  [paths.gifStudio.create]: {
    description: '필모라 스타일 타임라인 사진 & 다중 GIF 이어붙이기, 자르기, 프레임 조절',
    tag: '인기',
    badgeColor: 'primary',
  },
  [paths.gifStudio.video]: {
    description: '동영상 파일(MP4/WebM)을 초고화질 GIF로 양방향 무손실 변환',
    tag: '양방향',
    badgeColor: 'info',
  },
  [paths.gifStudio.split]: {
    description: 'GIF 프레임 단위 정밀 분석, 개별 프레임 이미지 추출 및 ZIP 다운로드',
    tag: '프레임 분석',
    badgeColor: 'secondary',
  },
  [paths.gifStudio.bg]: {
    description: 'GIF 배경색 변경, 크로마키 투명화 & 원하는 컬러 배경 채우기',
    tag: '크로마키',
    badgeColor: 'warning',
  },
  [paths.gifStudio.speed]: {
    description: 'GIF 재생 배속(0.2x~5.0x) 미세 조절 및 거꾸로 역재생 변환',
    tag: '배속/역재생',
    badgeColor: 'success',
  },

  // 동영상 편집 스튜디오
  [paths.videoMaster.root]: {
    description: '브라우저 기반 무설치 올인원 비디오 편집 및 포맷 렌더링',
    tag: '올인원',
    badgeColor: 'primary',
  },
  [paths.videoMaster.trim]: {
    description: '타임라인 구간 지정 고속 무손실 동영상 트리밍 및 컷 편집',
    tag: '트리밍',
    badgeColor: 'info',
  },
  [paths.videoMaster.merge]: {
    description: '여러 비디오 클립을 순서대로 병합하여 단일 영상 생성',
    tag: '병합',
    badgeColor: 'success',
  },
  [paths.videoMaster.aiWatermark]: {
    description: '영상 내 AI 워터마크 및 타임스탬프 실시간 각인',
    tag: 'AI 워터마크',
    badgeColor: 'secondary',
  },

  // 오피스 365
  [paths.docMaster]: {
    description: '설치 없이 브라우저에서 Word(.docx) 작성 및 템플릿 치환 대량 일괄 생성',
    tag: '문서 필수',
    badgeColor: 'primary',
  },
  [paths.powerpoint]: {
    description: '16:9 프레젠테이션 슬라이드 기획 및 네이티브 PPTX 파일 다운로드',
    tag: '발표 필수',
    badgeColor: 'error',
  },
  [paths.spreadsheet]: {
    description: '웹 기반 올인원 엑셀(XLSX/CSV) 호환 수식, 필터 및 대용량 데이터 시트',
    tag: '업무 필수',
    badgeColor: 'success',
  },
  [paths.markdown]: {
    description: '실무 마크다운 템플릿 5종, GFM 표/체크리스트 실시간 분할 뷰어',
    tag: '문서 필수',
    badgeColor: 'info',
  },
  [paths.hwpMaster]: {
    description: '무설치 HWP/HWPX 공문서 즉시 열람 및 본문/표(Excel)/이미지 완벽 추출',
    tag: '공공/실무',
    badgeColor: 'primary',
  },

  // 개발자 도구
  [paths.codeRunner]: {
    description: 'Node.js, Python 3.12, C/C++, Rust, Express 웹 서버 브라우저 즉시 컴파일 & 실행',
    tag: '강력 추천',
    badgeColor: 'success',
  },
  [paths.public.sql]: {
    description: '브라우저 메모리 SQLite 실행, 테이블 생성 및 쿼리 연습 실습실',
    tag: 'SQL 실습',
    badgeColor: 'info',
  },
  [paths.compare]: {
    description: '텍스트, 소스코드, JSON 간의 차이점을 좌우 분할 뷰로 정밀 비교 및 병합',
    tag: '강력 추천',
    badgeColor: 'warning',
  },
  [paths.text.regex]: {
    description: '정규식 실시간 매칭 테스터, 그룹 캡처 및 패턴 설명 가이드',
    tag: '정규식',
    badgeColor: 'secondary',
  },
  [paths.matlab]: {
    description: '행렬 연산, 2D/3D 수식 플롯 및 대화형 수치해석 샌드박스',
    tag: '수치해석',
    badgeColor: 'primary',
  },
  [paths.threejs]: {
    description: 'Three.js 기반 3D 그래픽스 씬 구성, 조명 및 메쉬 실시간 렌더링',
    tag: '3D 그래픽',
    badgeColor: 'secondary',
  },
  [paths.devTools]: {
    description: 'JSON 정렬/검증, Base64/URL 인코딩, Hash(MD5/SHA) 암호화 올인원 유틸',
    tag: '개발 필수',
    badgeColor: 'primary',
  },

  // 알고리즘
  [paths.algo.visualizer]: {
    description: '정렬 6종, A* 미로 최단경로 탐색, 이진 트리의 단계별 실시간 애니메이션',
    tag: '알고리즘',
    badgeColor: 'info',
  },
  [paths.algo.dataStructures]: {
    description: '스택, 큐, 연결 리스트, 힙, 그래프 등 핵심 자료구조 대화형 조작',
    tag: '자료구조',
    badgeColor: 'primary',
  },
  [paths.algo.compare]: {
    description: '알고리즘 2종의 실행 속도 및 탐색 노드 수 실시간 1:1 비교 벤치마크',
    tag: '벤치마크',
    badgeColor: 'warning',
  },
  [paths.algo.challenge]: {
    description: '인터랙티브 알고리즘 퀴즈 및 시간복잡도 추론 챌린지 모드',
    tag: '챌린지',
    badgeColor: 'error',
  },
  [paths.algo.playground]: {
    description: '직접 작성한 JavaScript 알고리즘 코드를 시각화 엔진으로 연결',
    tag: '샌드박스',
    badgeColor: 'secondary',
  },
  [paths.algo.catalog]: {
    description: 'Big-O 시간/공간 복잡도 비교 그래프 및 50+ 알고리즘 도감',
    tag: '도감/사전',
    badgeColor: 'success',
  },

  // 보드게임
  [paths.algo.baduk]: {
    description: '난이도별 바둑 사활 문제풀이, 오답 분기 분석 및 AI 착수 판정',
    tag: '바둑 사활',
    badgeColor: 'primary',
  },
  [paths.algo.janggi]: {
    description: '전통 장기 박보 장기 퍼즐 및 차/포/마 수순 시뮬레이션',
    tag: '박보 장기',
    badgeColor: 'error',
  },
  [paths.algo.chess]: {
    description: '체스 전술(Tactics), 메이트 문제 및 PGN 기보 인터랙티브 뷰어',
    tag: '체스 퍼즐',
    badgeColor: 'secondary',
  },
  [paths.algo.othello]: {
    description: '8x8 리버시 판세 분석 및 미니맥스 AI 대국 샌드박스',
    tag: '오셀로',
    badgeColor: 'success',
  },
  [paths.algo.gomoku]: {
    description: '렌주룰 3-3/4-4 금수 적용 5목 전술 퍼즐 및 대국 샌드박스',
    tag: '오목 전술',
    badgeColor: 'warning',
  },
  [paths.algo.alkkagi]: {
    description: '2D 강체 물리 엔진 기반 바둑알/장기알 튕기기 알까기 게임',
    tag: '물리 게임',
    badgeColor: 'info',
  },

  // 기타 도구
  [paths.morse]: {
    description: '텍스트 ↔ 모스 부호 실시간 양방향 변환 및 오디오 비프음 재생',
    tag: '통신/신호',
    badgeColor: 'info',
  },
  [paths.braille]: {
    description: '한글/영문 훈맹정음 6점 점자 표준 번역 및 3D 점자 촉각 시뮬레이터',
    tag: '점자 번역',
    badgeColor: 'success',
  },
  [paths.natoPhonetic]: {
    description: '국제 ICAO/NATO 표준 음성 철자 무선 통신 부호 변환기',
    tag: '무선 통신',
    badgeColor: 'primary',
  },
  [paths.cipher]: {
    description: '시저, 비즈네르, 플레이페어, 애트바쉬 등 고전 암호 해독 및 암호화',
    tag: '암호학',
    badgeColor: 'secondary',
  },
  [paths.hangulTypo]: {
    description: '영타로 잘못 친 한글 (dksry -> 안녕) 및 한타 오타 실시간 자동 변환',
    tag: '오타 복원',
    badgeColor: 'warning',
  },
  [paths.numberWords]: {
    description: '숫자 금액을 한글(일억이천만) 및 금융/계약서용 한자(壹億貳阡萬)로 변환',
    tag: '금액 표기',
    badgeColor: 'info',
  },
  [paths.romanize]: {
    description: '국어의 로마자 표기법 표준 인명, 도로명, 지명 정밀 변환',
    tag: '로마자',
    badgeColor: 'primary',
  },
  [paths.timestamp]: {
    description: 'Unix Epoch 타임스탬프 ↔ 밀리초/표준 일시 실시간 상호 변환',
    tag: '시간/타임',
    badgeColor: 'secondary',
  },
  [paths.semaphore]: {
    description: '국제 신호 기류 및 수기 신호법 대화형 그래픽 렌더러',
    tag: '해상 신호',
    badgeColor: 'success',
  },
  [paths.public.postcode]: {
    description: '행정안전부 기반 빠른 도로명/지번 우편번호 및 주소 검색',
    tag: '우편번호',
    badgeColor: 'info',
  },
  [paths.drawing.ladder]: {
    description: '팀 순번/당첨자 결정을 위한 공정하고 재미있는 애니메이션 사다리타기',
    tag: '추첨 게임',
    badgeColor: 'warning',
  },
  [paths.drawing.roulette]: {
    description: '확률 가중치 설정이 가능한 커스텀 회전판 추첨 룰렛 게임',
    tag: '룰렛 추첨',
    badgeColor: 'error',
  },

  // Document & Data
  [paths.mathGraph]: {
    description: 'LaTeX 수식 입력 및 2D/3D 대화형 함수 곡선 렌더링 시각화',
    tag: '수식 플롯',
    badgeColor: 'primary',
  },
  [paths.text.diff]: {
    description: '텍스트 문장/단락 간의 세밀한 추가, 삭제, 변경점 비교 분석',
    tag: 'Diff 비교',
    badgeColor: 'warning',
  },
  [paths.text.extract]: {
    description: '이메일, URL, 전화번호, 정규표현식 매칭 텍스트 자동 추출',
    tag: '텍스트 추출',
    badgeColor: 'info',
  },
  [paths.text.transform]: {
    description: '대소문자 변환, 줄바꿈/공백 제거, 슬러그 생성 및 인코딩 변환',
    tag: '텍스트 변환',
    badgeColor: 'secondary',
  },

  // Sci-Math & CS
  [paths.logicLab]: {
    description: 'AND, OR, NOT, XOR 게이트 연결 가산기/플립플롭 시뮬레이터 & 진리표 계산',
    tag: 'CS 핵심',
    badgeColor: 'primary',
  },
  [paths.bitLab]: {
    description: '32/64비트 부동소수점 비트 분해 & 0.1+0.2 부동소수점 오차 증명기',
    tag: '비트/진법',
    badgeColor: 'warning',
  },
  [paths.linearAlgebra]: {
    description: '2D/3D 기저벡터 왜곡 격자 애니메이션, 행렬식(Det) & 고유값 계산',
    tag: '수학/기하',
    badgeColor: 'secondary',
  },
  [paths.physicsSandbox]: {
    description: '중력/탄성 2D 강체 충돌, 이중진자 카오스 & 화학 반응식 양론 밸런서',
    tag: '물리/화학',
    badgeColor: 'success',
  },
  [paths.normalDistribution]: {
    description: '골턴 보드 2D 물리 시뮬레이션, 중심극한정리(CLT) & 가우스 Z-Score 계산',
    tag: '확률/통계',
    badgeColor: 'primary',
  },
  [paths.montyHall]: {
    description: '몬티홀 3문/N문 대화형 게임, 생일 역설 & 죄수의 딜레마 AI 토너먼트',
    tag: '확률 역설',
    badgeColor: 'warning',
  },
  [paths.fractalsChaos]: {
    description: '만델브로·줄리아 집합 실시간 딥 줌 & 로렌츠 어트랙터 3D 나비 효과',
    tag: '카오스/프랙탈',
    badgeColor: 'secondary',
  },
  [paths.cellularAutomata]: {
    description: '콘웨이의 라이프 게임 (인공생명) & 울프럼 1D 룰 256종 탐색기',
    tag: '인공생명',
    badgeColor: 'info',
  },
  [paths.waveOptics]: {
    description: '푸리에 에피사이클 분해, 영(Young)의 이중 슬릿 간섭 & 프리즘 굴절',
    tag: '파동/광학',
    badgeColor: 'success',
  },
  [paths.monteCarlo]: {
    description: '뷔퐁의 바늘, 몬테카를로 π 난수 추정 & 브라운 운동 확산 시뮬레이터',
    tag: '수치해석',
    badgeColor: 'primary',
  },
  [paths.blackHole]: {
    description: '슈바르츠실트 블랙홀 중력 렌즈, 강착원반 & 일반 상대성 이론 시뮬레이션',
    tag: '천체물리',
    badgeColor: 'secondary',
  },

  // PDF & File
  [paths.stampStudio]: {
    description: '개인/법인 투명 직인 실시간 생성 & PDF/견적서 원클릭 드래그 날인기',
    tag: '결재/계약',
    badgeColor: 'error',
  },
  [paths.pdfMaster]: {
    description: 'PDF 병합, 분할, 페이지 회전 & 이미지 상호 변환 100% 로컬 보안',
    tag: '인기 도구',
    badgeColor: 'error',
  },
  [paths.fileConvert]: {
    description: '다양한 확장자의 문서, 이미지, 데이터 파일 고화질 무손실 상호 변환',
    tag: '포맷 변환',
    badgeColor: 'info',
  },

  // Graphic & Media
  [paths.diagram]: {
    description: 'LaTeX 수식 렌더러, 비즈니스 차트, 데이터베이스 ERD & 인터랙티브 조직도',
    tag: '올인원',
    badgeColor: 'primary',
  },
  [paths.imageTool]: {
    description: '대용량 이미지 무손실 용량 압축, 해상도 리사이징, 자르기 & 빠른 편집',
    tag: '빠른 처리',
    badgeColor: 'primary',
  },

  // Productivity & Utilities
  [paths.schedule]: {
    description: '프로젝트 마일스톤, 업무 타임라인, 간트차트 및 월간 캘린더 관리',
    tag: '프로젝트',
    badgeColor: 'info',
  },
  [paths.barcode]: {
    description: 'URL/Wi-Fi 커스텀 컬러 QR 코드 및 산업 규격 바코드 생성/스캔',
    tag: '커스텀',
    badgeColor: 'warning',
  },

  // 보류
  [paths.fileManager]: {
    description: '로컬 브라우저 기반 안전한 파일, 메모, 스크립트 계층적 폴더 보관함',
    tag: '안전 보관',
    badgeColor: 'secondary',
  },
  [paths.agent]: {
    description: '문서 작성, 요약, 데이터 분석, 아이디어 도출 지원 강력한 AI 어시스턴트',
    tag: 'AI 핵심',
    badgeColor: 'primary',
  },
  [paths.privacySanitizer]: {
    description: '주민번호/계좌/전화번호 자동 마스킹 & 사진 GPS/EXIF 메타데이터 영구 제거',
    tag: '보안/안심',
    badgeColor: 'success',
  },
  [paths.gigaViewer]: {
    description: '수백 MB 대용량 로그나 CSV 파일도 멈춤 없는 가상 스크롤 & 브라우저 SQL',
    tag: '초고속 렌더',
    badgeColor: 'warning',
  },
  [paths.screenRecorder]: {
    description: '브라우저 화면/창/웹캠 녹화, 시작/끝 구간 트리밍 & 고화질 GIF 변환',
    tag: '무설치 캡처',
    badgeColor: 'info',
  },
};

// ----------------------------------------------------------------------

/**
 * navData로부터 전체 도구 목록을 동적으로 추출
 */
export function extractNavTools(navSections: NavSectionProps['data']): {
  tools: HubToolItem[];
  sectionGroups: HubSectionGroup[];
  categories: string[];
} {
  const tools: HubToolItem[] = [];
  const sectionMap = new Map<string, HubToolItem[]>();
  const seenPaths = new Set<string>();

  if (!navSections || !Array.isArray(navSections)) {
    return { tools: [], sectionGroups: [], categories: ['all'] };
  }

  navSections.forEach((sec, secIdx) => {
    // 0번 섹션이나 전체 도구 허브 자체는 제외
    const sectionName = sec.subheader || (secIdx === 0 ? 'Hub' : `Section ${secIdx}`);
    if (sectionName === 'Hub') return;

    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, []);
    }

    sec.items?.forEach((item) => {
      // 1) 자식(children)이 있는 그룹 아이템인 경우
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          if (!child.path || child.path === paths.photo.root) return;

          // 메타데이터 매핑
          const meta = TOOL_METADATA_MAP[child.path] || TOOL_METADATA_MAP[child.title] || {};
          const fallbackDesc = `${item.title} - ${child.title} 도구입니다. 브라우저에서 안전하게 바로 실행할 수 있습니다.`;

          const toolItem: HubToolItem = {
            id: `${item.title}-${child.title}-${child.path}`,
            title: child.title,
            path: child.path,
            icon: child.icon || item.icon,
            section: sectionName,
            groupTitle: item.title,
            description: meta.description || fallbackDesc,
            tag: meta.tag || item.title,
            badgeColor: meta.badgeColor || 'primary',
          };

          tools.push(toolItem);
          sectionMap.get(sectionName)?.push(toolItem);
          seenPaths.add(child.path);
        });
      }
      // 2) 단일 아이템인 경우
      else if (item.path && item.path !== paths.photo.root) {
        const meta = TOOL_METADATA_MAP[item.path] || TOOL_METADATA_MAP[item.title] || {};
        const fallbackDesc = `${sectionName} - ${item.title} 도구입니다. 브라우저에서 안전하게 바로 실행할 수 있습니다.`;

        const toolItem: HubToolItem = {
          id: `${sectionName}-${item.title}-${item.path}`,
          title: item.title,
          path: item.path,
          icon: item.icon,
          section: sectionName,
          groupTitle: undefined,
          description: meta.description || fallbackDesc,
          tag: meta.tag || sectionName,
          badgeColor: meta.badgeColor || 'primary',
        };

        tools.push(toolItem);
        sectionMap.get(sectionName)?.push(toolItem);
        seenPaths.add(item.path);
      }
    });
  });

  const sectionGroups: HubSectionGroup[] = [];
  sectionMap.forEach((sectionTools, section) => {
    if (sectionTools.length > 0) {
      sectionGroups.push({
        section,
        tools: sectionTools,
      });
    }
  });

  const categories = ['all', ...sectionGroups.map((g) => g.section)];

  return {
    tools,
    sectionGroups,
    categories,
  };
}
