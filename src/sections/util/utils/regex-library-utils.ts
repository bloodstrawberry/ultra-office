export interface RegexPreset {
  id: string;
  category: '연락처/개인정보' | '웹/네트워크' | '숫자/금융' | '텍스트/코드' | '검증/보안';
  name: string;
  pattern: string;
  flags: string;
  description: string;
  sampleInput: string;
  sampleReplacement?: string;
  replaceDescription?: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  // 1. 연락처 & 개인정보
  {
    id: 'korean-mobile',
    category: '연락처/개인정보',
    name: '대한민국 휴대폰 번호',
    pattern: '01[016789]-?\\d{3,4}-?\\d{4}',
    flags: 'g',
    description: '010, 011, 016, 017, 018, 019로 시작하는 휴대폰 번호 (하이픈 유무 무관)',
    sampleInput: '홍길동: 010-1234-5678, 김영희: 01098765432, 고객센터: 016-333-4444',
    sampleReplacement: '010-****-$2',
  },
  {
    id: 'korean-tel',
    category: '연락처/개인정보',
    name: '일반 유선 전화번호',
    pattern: '(02|0[3-6][1-5]|070)-?\\d{3,4}-?\\d{4}',
    flags: 'g',
    description: '02(서울), 031(경기), 051(부산), 070(인터넷전화) 등 지역번호 포함 유선전화',
    sampleInput: '서울 본사: 02-123-4567, 경기 지사: 031-987-6543, 고객상담: 070-8888-9999',
  },
  {
    id: 'email-address',
    category: '연락처/개인정보',
    name: '이메일 주소 (Email)',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: '일반적인 이메일 주소 형식 (영문, 숫자, 마침표, 언더바 등)',
    sampleInput:
      '문의: contact@ultraoffice.io, 관리자: admin.tech_dev@company.co.kr, dev+test@gmail.com',
    sampleReplacement: '[EMAIL_PROTECTED]',
  },
  {
    id: 'korean-rrn',
    category: '연락처/개인정보',
    name: '주민등록번호 / 외국인등록번호',
    pattern: '\\d{6}-?[1-8]\\d{6}',
    flags: 'g',
    description: '생년월일 6자리와 성별/지역 7자리 (하이픈 선택)',
    sampleInput: '직원1: 950815-1234567, 직원2: 0203044567890 (가상 번호)',
    sampleReplacement: '$1-*******',
  },

  // 2. 숫자 & 금융
  {
    id: 'biz-reg-number',
    category: '숫자/금융',
    name: '사업자등록번호 (10자리)',
    pattern: '\\d{3}-?\\d{2}-?\\d{5}',
    flags: 'g',
    description: '국세청 사업자등록번호 형식 (3자리-2자리-5자리)',
    sampleInput: '(주)울트라: 120-88-99482, (주)글로벌: 2148512345, 파트너: 101-02-33445',
  },
  {
    id: 'corp-reg-number',
    category: '숫자/금융',
    name: '법인등록번호 (13자리)',
    pattern: '\\d{6}-?\\d{7}',
    flags: 'g',
    description: '등기소 법인등록번호 형식 (6자리-7자리)',
    sampleInput: '법인등록번호: 110111-1234567, 134811-0987654',
  },
  {
    id: 'credit-card',
    category: '숫자/금융',
    name: '신용카드 번호 (16자리)',
    pattern: '\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
    flags: 'g',
    description: 'Visa, Master, Hyundai 등 16자리 신용/체크카드 번호',
    sampleInput: '결제 카드: 5424-1234-5678-9012, 현대카드: 4532 9988 7766 5544',
    sampleReplacement: '****-****-****-$4',
  },
  {
    id: 'currency-amount',
    category: '숫자/금융',
    name: '화폐 및 콤마 금액 (₩ / $)',
    pattern: '[₩$]?\\s?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?\\s?(?:원|KRW|USD)?',
    flags: 'g',
    description: '천 단위 콤마가 포함된 금액 표기',
    sampleInput: '합계: ₩1,250,000원, 공급가액: 3,450,000, 달러: $1,420.50 USD, 단가: 89000원',
  },

  // 3. 웹 & 네트워크
  {
    id: 'url-web',
    category: '웹/네트워크',
    name: '웹사이트 URL 링크',
    pattern:
      'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'g',
    description: 'http:// 또는 https://로 시작하는 완전한 URL 주소',
    sampleInput:
      '공식홈페이지: https://ultraoffice.io/app/demo, 블로그: http://blog.naver.com/tech_team?id=492&ref=banner',
  },
  {
    id: 'ipv4-address',
    category: '웹/네트워크',
    name: 'IPv4 네트워크 주소',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: '0.0.0.0 부터 255.255.255.255 사이의 유효한 IPv4 주소',
    sampleInput:
      '게이트웨이: 192.168.0.1, DNS서버: 8.8.8.8, 내부서버: 10.0.4.155, 외부IP: 211.234.120.9',
  },
  {
    id: 'mac-address',
    category: '웹/네트워크',
    name: 'MAC 하드웨어 주소',
    pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})',
    flags: 'g',
    description: '네트워크 어댑터 MAC 물리 주소 (콜론 또는 하이픈 구분)',
    sampleInput: '이더넷: 00:1A:2B:3C:4D:5E, Wi-Fi: 00-50-56-C0-00-08, 블루투스: a4:c3:f0:8e:12:34',
  },

  // 4. 텍스트 & 코드
  {
    id: 'korean-words',
    category: '텍스트/코드',
    name: '한글 단어 및 문자 (가-힣)',
    pattern: '[가-힣]+',
    flags: 'g',
    description: '한글 완성형 글자 단어만 추출',
    sampleInput: 'Hello 안녕하세요! This is Ultra Office 울트라 오피스 2026.',
  },
  {
    id: 'html-tags',
    category: '텍스트/코드',
    name: 'HTML 태그 제거 / 추출',
    pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(\\s+[^>]*)?>',
    flags: 'g',
    description: '여는 태그, 닫는 태그, 속성이 포함된 HTML 엘리먼트 태그',
    sampleInput:
      '<div class="card"><h1 style="color:red">제목</h1><p>본문 내용입니다.<br/></p></div>',
    sampleReplacement: '',
    replaceDescription: '태그를 모두 지워 순수 텍스트만 추출',
  },
  {
    id: 'date-format',
    category: '텍스트/코드',
    name: '날짜 형식 (YYYY-MM-DD)',
    pattern: '\\b\\d{4}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    description: '년-월-일 (하이픈, 슬래시, 마침표 구분)',
    sampleInput: '계약일자: 2026-08-18, 만료일자: 2027/12/31, 결제예정일: 2026.09.01',
  },
  {
    id: 'hex-color-code',
    category: '텍스트/코드',
    name: 'HEX 16진수 색상 코드',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    description: '#RGB 또는 #RRGGBB 헥스 컬러 코드',
    sampleInput: '배경색: #FFFFFF, 텍스트: #333, 브랜드색상: #3B82F6, 강조색: #EF4444',
  },

  // 5. 검증 & 보안
  {
    id: 'password-strength',
    category: '검증/보안',
    name: '안전한 비밀번호 (8~20자 영문+숫자+특수문자)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$',
    flags: '',
    description: '대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각 1개 이상 포함한 8~20자',
    sampleInput: 'P@ssw0rd2026!',
  },
];
