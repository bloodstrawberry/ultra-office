export interface RegexPreset {
  id: string;
  category:
    | '연락처/개인정보'
    | '숫자/금융'
    | '웹/네트워크'
    | '텍스트/코드'
    | '검증/보안'
    | '문법/기초';
  name: string;
  pattern: string;
  flags: string;
  description: string;
  sampleInput: string;
  sampleReplacement?: string;
  replaceDescription?: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  // ==========================================================================
  // 1. 연락처 & 개인정보 (Contact & PII)
  // ==========================================================================
  {
    id: 'korean-mobile',
    category: '연락처/개인정보',
    name: '대한민국 휴대폰 번호',
    pattern: '01[016789]-?\\d{3,4}-?\\d{4}',
    flags: 'g',
    description: '010, 011, 016, 017, 018, 019로 시작하는 휴대폰 번호',
    sampleInput: `제 번호는 010-1234-5678 입니다.
업무용은 010-111-2222 입니다.
하이픈 없음: 01098765432
일반 전화: 02-123-4567 (매칭 안됨)
잘못된 번호: 010-123-456 (자리수 부족)
마지막 휴대폰 예시: 010-9876-5432`,
  },
  {
    id: 'korean-mobile-mask',
    category: '연락처/개인정보',
    name: '휴대폰 번호 마스킹 (가운데)',
    pattern: '(01[016789])-?\\d{3,4}-?(\\d{4})',
    flags: 'g',
    description: '휴대폰 번호의 중간 자리를 ****로 마스킹',
    sampleInput: `홍길동: 010-1234-5678
김철수: 010-987-6543
이영희: 01011112222
박민수: 02-888-9999 (무시됨)
최지우: 010-333-4444`,
    sampleReplacement: '$1-****-$2',
    replaceDescription: '010-****-5678 형식으로 치환',
  },
  {
    id: 'korean-tel',
    category: '연락처/개인정보',
    name: '일반 유선 전화번호 (지역번호)',
    pattern: '(02|0[3-6][1-5]|070)-?\\d{3,4}-?\\d{4}',
    flags: 'g',
    description: '02(서울), 031(경기), 051(부산), 070(인터넷전화) 등 유선전화',
    sampleInput: `서울 본사: 02-123-4567
경기 지사: 031-987-6543
부산 공장: 051-555-1234
인터넷전화: 070-8888-9999
휴대폰: 010-1234-5678 (매칭 안됨)`,
  },
  {
    id: 'global-phone-e164',
    category: '연락처/개인정보',
    name: '국제전화번호 (E.164 표준)',
    pattern: '\\+[1-9]\\d{1,14}',
    flags: 'g',
    description: '+82 10... 등의 국제 표준 전화번호',
    sampleInput: `Korea: +821012345678
USA: +16501234567
UK: +442012345678
Local: 010-1234-5678 (No +)
Japan: +819012345678`,
  },
  {
    id: 'emp-id-padding',
    category: '연락처/개인정보',
    name: '사번 8자리 자동 패딩',
    pattern: '\\b(\\d{1,8})\\b',
    flags: 'g',
    description: '8자리 이하의 모든 숫자를 찾아 패딩 규칙 적용',
    sampleInput: `사번 A : 123
사번 B : 212345
사번 C : 1919191
사번 D : 12345678`,
  },
  {
    id: 'emp-id-mask',
    category: '연락처/개인정보',
    name: '8자리 사번 뒤 4자리 마스킹',
    pattern: '\\b(\\d{4})\\d{4}\\b',
    flags: 'g',
    description: '8자리 숫자의 뒤 4자리를 ****로 마스킹',
    sampleInput: `사번: 20240001
김철수 과장 (20201234)
이영희 대리 (20215678)
전화번호: 010-1234-5678 (8자리가 아님)
임시번호: 12345 (매칭 안됨)`,
    sampleReplacement: '$1****',
    replaceDescription: '2024**** 형식으로 치환',
  },
  {
    id: 'korean-rrn',
    category: '연락처/개인정보',
    name: '주민등록번호 / 외국인등록번호',
    pattern: '\\d{6}-?[1-8]\\d{6}',
    flags: 'g',
    description: '생년월일 6자리와 성별/지역 7자리 (13자리)',
    sampleInput: `회원1: 900101-1234567
회원2: 851225-2345678
회원3: 0101013456789
외국인등록번호: 990101-5678901
잘못된 형식: 123456-56789 (자리수 부족)`,
  },
  {
    id: 'korean-rrn-mask',
    category: '연락처/개인정보',
    name: '주민등록번호 뒷자리 마스킹',
    pattern: '(\\d{6})-?[1-8]\\d{6}',
    flags: 'g',
    description: '주민번호 뒷자리를 *******로 마스킹',
    sampleInput: `회원1: 900101-1234567
회원2: 851225-2345678
회원3: 010101-3456789
회원4: 950505-4567890`,
    sampleReplacement: '$1-*******',
    replaceDescription: '900101-******* 형식으로 치환',
  },
  {
    id: 'passport-number',
    category: '연락처/개인정보',
    name: '대한민국 여권번호',
    pattern: '\\b[MSGRD][0-9A-Z]\\d{7}\\b|\\b[A-Z]{1,2}\\d{7,8}\\b',
    flags: 'g',
    description: 'M/S/G/R/D로 시작하는 신여권/구여권 9자리 번호',
    sampleInput: `구여권: M12345678
차세대 신여권: M123A4567
관용여권: G98765432
외교관여권: D11223344
일반 텍스트: TEST1234`,
  },
  {
    id: 'driver-license-kr',
    category: '연락처/개인정보',
    name: '대한민국 운전면허번호',
    pattern: '\\b\\d{2}-\\d{2}-\\d{6}-\\d{2}\\b',
    flags: 'g',
    description: '지역(2)-연도(2)-일련번호(6)-검증(2) 12자리',
    sampleInput: `서울 면허: 11-20-123456-78
경기 면허: 13-18-987654-32
전화번호: 010-1234-5678 (매칭 안됨)`,
  },
  {
    id: 'email-address',
    category: '연락처/개인정보',
    name: '이메일 주소 추출 (Email)',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'gi',
    description: 'hong_123@example.com 등 이메일 주소',
    sampleInput: `Contact: help@example.com
Admin: admin_test@service.co.kr
Personal: my-email@gmail.com
Invalid: email@com (도메인 확장자 없음)
Support: support@holding.company`,
  },
  {
    id: 'email-mask',
    category: '연락처/개인정보',
    name: '이메일 아이디 마스킹',
    pattern: '([a-zA-Z0-9._%+-]{2})[a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: 'gi',
    description: '이메일 계정의 앞 2글자만 남기고 마스킹',
    sampleInput: `contact@ultraoffice.io
admin_tech@company.co.kr
superman99@gmail.com`,
    sampleReplacement: '$1***$2',
    replaceDescription: 'co***@ultraoffice.io 형식으로 치환',
  },
  {
    id: 'korean-name',
    category: '연락처/개인정보',
    name: '한글 성명 (2~4자)',
    pattern: '^[가-힣]{2,4}$',
    flags: 'gm',
    description: '홍길동, 남궁민수 등 2~4자의 순수 한글 이름',
    sampleInput: `홍길동
김철수
남궁민수
이황
알렉산더 (5자 초과 - 매칭 안됨)
James (영문 - 매칭 안됨)`,
  },
  {
    id: 'korean-name-mask',
    category: '연락처/개인정보',
    name: '한글 성명 가운데 마스킹',
    pattern: '([가-힣])([가-힣]+)([가-힣])',
    flags: 'g',
    description: '3~4자 한글 이름의 중간 글자 마스킹',
    sampleInput: `담당자: 홍길동, 검토자: 김철수, 대표: 남궁민수`,
    sampleReplacement: '$1*$3',
    replaceDescription: '홍*동, 남*수 형식으로 치환',
  },
  {
    id: 'english-full-name',
    category: '연락처/개인정보',
    name: '영문 성명 (First Last)',
    pattern: '\\b[A-Z][a-z]+(?:\\s[A-Z][a-z]+)+\\b',
    flags: 'g',
    description: 'John Doe, Steve Jobs 등 대문자로 시작하는 영문 이름',
    sampleInput: `Author: John Doe
Founder: Steve Jobs
Scientist: Albert Einstein
Invalid: john doe (소문자 시작)`,
  },
  {
    id: 'korean-zipcode',
    category: '연락처/개인정보',
    name: '한국 우편번호 (5자리/6자리)',
    pattern: '\\b\\d{5}\\b|\\b\\d{3}-\\d{3}\\b',
    flags: 'g',
    description: '새 우편번호(5자리) 또는 구 우편번호(3자리-3자리)',
    sampleInput: `서울 강남구 테헤란로 (우편번호: 06123)
구주소 우편번호: 135-080
전화번호 뒷자리: 12345 (주변 문맥과 구분 필요)
송파구: 05500`,
  },

  // ==========================================================================
  // 2. 숫자 & 금융 (Numbers & Finance)
  // ==========================================================================
  {
    id: 'biz-reg-number',
    category: '숫자/금융',
    name: '사업자 등록번호 (10자리)',
    pattern: '\\d{3}-\\d{2}-\\d{5}',
    flags: 'g',
    description: '123-45-67890 형식의 국세청 사업자등록번호',
    sampleInput: `(주)울트라오피스: 123-45-67890
본사 번호: 222-33-44444
지점 번호: 555-66-77777
일반 전화: 02-123-4567
기타 사업자: 987-65-43210`,
  },
  {
    id: 'corp-reg-number',
    category: '숫자/금융',
    name: '법인 등록번호 (13자리)',
    pattern: '\\d{6}-\\d{7}',
    flags: 'g',
    description: '등기소 법인등록번호 (6자리-7자리)',
    sampleInput: `법인등록번호: 110111-1234567
주식회사 울트라: 134811-0987654
일반번호: 123456-12345 (자리수 부족)`,
  },
  {
    id: 'credit-card',
    category: '숫자/금융',
    name: '신용카드 번호 (16자리)',
    pattern: '\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
    flags: 'g',
    description: '16자리 신용/체크카드 번호 (하이픈 및 공백 구분)',
    sampleInput: `신한카드: 1234-5678-0000-1111
국민카드: 9876-5432-1111-2222
현대카드: 4532 9988 7766 5544
연속숫자: 1111222233334444
자릿수오류: 1234-5678-901`,
  },
  {
    id: 'credit-card-mask',
    category: '숫자/금융',
    name: '신용카드 번호 마스킹 (가운데 8자리)',
    pattern: '(\\d{4})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?(\\d{4})',
    flags: 'g',
    description: '신용카드 번호의 중간 8자리를 마스킹',
    sampleInput: `카드1: 1234-5678-0000-1111
카드2: 9876 5432 1111 2222
카드3: 1111222233334444`,
    sampleReplacement: '$1-****-****-$2',
    replaceDescription: '1234-****-****-1111 형식으로 치환',
  },
  {
    id: 'bank-account',
    category: '숫자/금융',
    name: '한국 은행 계좌번호',
    pattern: '\\b\\d{3,6}-\\d{2,6}-\\d{3,6}(?:-\\d{1,4})?\\b',
    flags: 'g',
    description: '국내 주요 은행 계좌번호 형식 (하이픈 포함)',
    sampleInput: `신한은행: 110-123-456789 (홍길동)
국민은행: 123456-04-123456
우리은행: 1002-123-456789
카카오뱅크: 3333-01-1234567
하나은행: 123-910001-12345`,
  },
  {
    id: 'currency-amount',
    category: '숫자/금융',
    name: '화폐 및 콤마 금액 (₩ / $ / €)',
    pattern: '[₩$€¥]?\\s?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?\\s?(?:원|KRW|USD|EUR)?',
    flags: 'g',
    description: '천 단위 콤마가 포함된 금액 표기',
    sampleInput: `합계: ₩1,250,000원
공급가액: 3,450,000
달러: $1,420.50 USD
유로: 890.00 EUR
단가: 25,500원`,
  },
  {
    id: 'remove-commas',
    category: '숫자/금융',
    name: '천단위 콤마 제거',
    pattern: '(\\d),(\\d{3})',
    flags: 'g',
    description: '15,000 -> 15000 콤마 제거',
    sampleInput: `Original: 15,000
Total: 1,234,567
No Comma: 100
Price: 9,900원
Balance: 1,000,000,000`,
    sampleReplacement: '$1$2',
    replaceDescription: '콤마를 제거하여 순수 숫자로 변경',
  },
  {
    id: 'number-only',
    category: '숫자/금융',
    name: '숫자 덩어리 추출 (\\d+)',
    pattern: '\\d+',
    flags: 'g',
    description: '텍스트 속 연속된 숫자만 추출',
    sampleInput: `Count: 10
Price: 25000원
사번: 20260820
Score: 99.5점`,
  },
  {
    id: 'decimal-number',
    category: '숫자/금융',
    name: '소수점 포함 실수 (Float)',
    pattern: '-?\\b\\d+\\.\\d+\\b',
    flags: 'g',
    description: '3.14, -0.05 등 소수를 가진 숫자',
    sampleInput: `원주율: 3.141592
변화율: -0.85
정수: 100 (매칭 안됨)
온도: 36.5도`,
  },
  {
    id: 'percentage',
    category: '숫자/금융',
    name: '백분율 / 퍼센트 (%)',
    pattern: '-?\\b\\d+(?:\\.\\d+)?%',
    flags: 'g',
    description: '99%, -12.5% 등 퍼센트 표기',
    sampleInput: `할인율: 25%
수익률: +14.8% (기호 제외)
달성률: 100%
오차율: 0.05%`,
  },
  {
    id: 'us-zipcode',
    category: '숫자/금융',
    name: 'US 우편번호 (Zip Code)',
    pattern: '\\b\\d{5}(?:-\\d{4})?\\b',
    flags: 'g',
    description: '5자리 또는 9자리 미국 Zip Code',
    sampleInput: `Beverly Hills: 90210
New York: 10001
Extended: 12345-6789
Invalid: 1234 (4자리)
Chicago: 60601`,
  },
  {
    id: 'bitcoin-address',
    category: '숫자/금융',
    name: '비트코인 지갑 주소 (BTC)',
    pattern: '\\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\\b',
    flags: 'g',
    description: '1 또는 3으로 시작하는 레거시 비트코인 주소',
    sampleInput: `Genesis: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Wallet 1: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
Invalid: 0x123 (Ethereum style)
Wallet 2: 1PMycacZSfbS6asf6asf6asf6asf`,
  },
  {
    id: 'ethereum-address',
    category: '숫자/금융',
    name: '이더리움 지갑 주소 (ETH)',
    pattern: '\\b0x[a-fA-F0-9]{40}\\b',
    flags: 'g',
    description: '0x로 시작하는 40자리 16진수 지갑 주소',
    sampleInput: `Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Contract: 0x06012c8cf97bead5deae237070f9587f8e7a266d
Exchange: 0xab5801a7d398351b8be11c439e05c5b3259aec9b
Invalid: 0xGHIJK (16진수 아님)`,
  },
  {
    id: 'korean-won-korean',
    category: '숫자/금융',
    name: '한글 화폐 단위 (억/만/원)',
    pattern: '\\d+(?:\\s?(?:조|억|만|천))+(?:\\s?\\d+)?원?',
    flags: 'g',
    description: '3억 5천만원, 20만 5천원 등 한글 금액 표기',
    sampleInput: `매출액: 500억원
계약금: 3억 5천만원
급여: 350만원
용돈: 5만원`,
  },
  {
    id: 'invoice-number',
    category: '숫자/금융',
    name: '송장 / 인보이스 번호',
    pattern: '\\b\\d{4}-\\d{4}-\\d{4}\\b|\\bINV-\\d{4,10}\\b',
    flags: 'g',
    description: '택배 송장번호 및 인보이스(INV-XXXX) 식별자',
    sampleInput: `대한통운 송장: 1234-5678-9012
한진택배: 9876-5432-1098
해외 인보이스: INV-20260820
일반 문자열: ABC-123`,
  },
  {
    id: 'math-formula',
    category: '숫자/금융',
    name: '사칙연산 수식 (간이)',
    pattern: '\\b\\d+(?:\\s*[-+*/]\\s*\\d+)+\\b',
    flags: 'g',
    description: '10 + 20, 100 * 5 / 2 등 기본 산술식',
    sampleInput: `계산1: 10 + 20
계산2: 500 * 3 / 2
계산3: 100 - 45 + 12
단일 숫자: 100 (매칭 안됨)`,
  },
  {
    id: 'binary-hex-number',
    category: '숫자/금융',
    name: '16진수 및 2진수 리터럴',
    pattern: '\\b(?:0x[0-9a-fA-F]+|0b[01]+)\\b',
    flags: 'g',
    description: '0xFF, 0x1A2B, 0b1010 등 프로그래밍 수치 리터럴',
    sampleInput: `Hex 1: 0xFF
Hex 2: 0x1a2B3c
Binary: 0b10101100
Dec: 12345 (매칭 안됨)`,
  },
  {
    id: 'leave-only-numbers',
    category: '숫자/금융',
    name: '숫자만 남기기 (기타 제거)',
    pattern: '[^0-9]',
    flags: 'g',
    description: '숫자 이외의 모든 문자 제거',
    sampleInput: `Price: 25,500원
Balance: $1,200.50
ID: user_99
Date: 2024/03/22`,
    sampleReplacement: '',
    replaceDescription: '25500, 120050 등으로 정리',
  },

  // ==========================================================================
  // 3. 웹 & 네트워크 (Web & Network)
  // ==========================================================================
  {
    id: 'url-web',
    category: '웹/네트워크',
    name: '웹사이트 URL 링크 (HTTP/HTTPS)',
    pattern:
      'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    description: 'http:// 또는 https://로 시작하는 완전한 URL 주소',
    sampleInput: `Site: https://www.google.com
Dev: http://localhost:3000
API: https://api.example.com/v1/user?id=123&page=1
Docs: https://react.dev/reference/react
Non-URL: example.com (프로토콜 없음)`,
  },
  {
    id: 'domain-hostname',
    category: '웹/네트워크',
    name: '도메인 및 호스트명',
    pattern: '\\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}\\b',
    flags: 'gi',
    description: 'google.com, sub.domain.co.kr 등 도메인 주소',
    sampleInput: `접속 도메인: google.com
서브 도메인: api.ultraoffice.io
국내 도메인: service.co.kr
호스트: mail.naver.com`,
  },
  {
    id: 'url-query-string',
    category: '웹/네트워크',
    name: 'URL 쿼리 파라미터 (Key=Value)',
    pattern: '[?&]([^=#]+)=([^&#]*)',
    flags: 'g',
    description: '?query=123&sort=desc 형식의 파라미터 분리',
    sampleInput: `https://example.com/search?keyword=regex&page=2&sort=asc
https://api.site.com/items?category=office&limit=10`,
  },
  {
    id: 'youtube-video-id',
    category: '웹/네트워크',
    name: 'YouTube 영상 ID (11자리)',
    pattern: '(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([a-zA-Z0-9_-]{11})',
    flags: 'g',
    description: '유튜브 영상 식별자 11자리 추출',
    sampleInput: `Watch: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Short: https://youtu.be/y6120QOlsfU
Long: https://www.youtube.com/watch?v=ScMzIvxBSi4&t=10s
Link: https://youtu.be/J---aiyznGQ`,
  },
  {
    id: 'social-mention',
    category: '웹/네트워크',
    name: '소셜 멘션 (@아이디)',
    pattern: '@[\\w]{1,30}',
    flags: 'g',
    description: 'Twitter/X, Instagram, Slack 등 @계정명',
    sampleInput: `Follow me @my_id
Check @twitter_handle
Mention @user_01
Email: user@example.com (이메일은 제외 대상)
Our team: @team_svs`,
  },
  {
    id: 'social-hashtag',
    category: '웹/네트워크',
    name: '소셜 해시태그 (#태그)',
    pattern: '#[a-zA-Z0-9_가-힣]+',
    flags: 'g',
    description: '#정규식 #오피스 등 한글/영문 해시태그',
    sampleInput: `오늘의 태그: #울트라오피스 #업무자동화 #NextJS #Regex2026
색상코드: #3f51b5 (문맥에 따라 구분)`,
  },
  {
    id: 'ipv4-address',
    category: '웹/네트워크',
    name: 'IPv4 네트워크 주소',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: '0.0.0.0 부터 255.255.255.255 사이의 유효한 IPv4',
    sampleInput: `Server: 192.168.0.101
Local: 127.0.0.1
Gateway: 172.16.0.1
DNS: 8.8.8.8
Invalid: 256.0.0.1 (범위 초과)`,
  },
  {
    id: 'ipv6-address',
    category: '웹/네트워크',
    name: 'IPv6 네트워크 주소',
    pattern:
      '\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b|\\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\\b',
    flags: 'g',
    description: '128비트 IPv6 네트워크 주소',
    sampleInput: `Full: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
Compressed: ::1
Local: fe80::1ff:fe23:4567`,
  },
  {
    id: 'mac-address',
    category: '웹/네트워크',
    name: 'MAC 하드웨어 주소',
    pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})',
    flags: 'g',
    description: '콜론 또는 하이픈으로 구분된 네트워크 MAC 어드레스',
    sampleInput: `Colon: 00:1A:2B:3C:4D:5E
Hyphen: 00-1A-2B-3C-4D-5E
Mix: AA:BB:CC:DD:EE:FF
Invalid: G1:22:33... (16진수 아님)`,
  },
  {
    id: 'ip-port',
    category: '웹/네트워크',
    name: 'IP:포트 조합 (Socket)',
    pattern: '\\b\\d{1,3}(?:\\.\\d{1,3}){3}:(\\d{1,5})\\b',
    flags: 'g',
    description: '192.168.0.1:8080 등 소켓 주소',
    sampleInput: `Web: 127.0.0.1:3000
Backend: 10.0.0.5:8080
Redis: 192.168.1.50:6379`,
  },
  {
    id: 'http-status-code',
    category: '웹/네트워크',
    name: 'HTTP 응답 상태 코드 (200~599)',
    pattern: '\\b(?:1[0-5][0-9]|2[0-2][0-9]|3[0-8][0-9]|4[0-9][0-9]|5[0-1][0-9])\\b',
    flags: 'g',
    description: '200 OK, 404 Not Found, 500 Internal Error 등',
    sampleInput: `GET /api/user -> 200
POST /api/login -> 401
GET /missing -> 404
Server Error: 500
Normal number: 8888 (상태코드 아님)`,
  },
  {
    id: 'image-url',
    category: '웹/네트워크',
    name: '이미지 파일 URL 주소',
    pattern: 'https?:\\/\\/[^\\s]+\\.(?:png|jpe?g|gif|webp|svg|ico)(?:\\?[^\\s]*)?',
    flags: 'gi',
    description: '웹상의 이미지 리소스 직링크 추출',
    sampleInput: `Banner: https://example.com/images/hero_banner.png
Thumbnail: https://cdn.site.com/photo.jpg?v=2
Avatar: https://ultraoffice.io/assets/avatar.webp
Doc: https://example.com/file.pdf (문서 - 매칭 안됨)`,
  },
  {
    id: 'jwt-token',
    category: '웹/네트워크',
    name: 'JWT 웹 토큰 (JSON Web Token)',
    pattern: '\\b[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*\\b',
    flags: 'g',
    description: 'Bearer 인증 토큰 문자열',
    sampleInput: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
Normal Text: Hello world`,
  },
  {
    id: 'git-ssh-url',
    category: '웹/네트워크',
    name: 'Git SSH / 저장소 URL',
    pattern: '(?:git@[\\w.-]+:|https?:\\/\\/[\\w.-]+\\/)[\\w.-]+\\/[\\w.-]+\\.git',
    flags: 'gi',
    description: 'GitHub / GitLab Git 레포지토리 주소',
    sampleInput: `SSH: git@github.com:facebook/react.git
HTTPS: https://github.com/vercel/next.js.git
GitLab: git@gitlab.com:company/ultra-office.git`,
  },
  {
    id: 'api-endpoint-path',
    category: '웹/네트워크',
    name: 'REST API 엔드포인트 경로',
    pattern: '^\\/(?:api\\/)?[a-zA-Z0-9_\\-/]+$',
    flags: 'gm',
    description: '/api/v1/users, /v2/auth/login 등 엔드포인트 패스',
    sampleInput: `/api/v1/users
/api/v2/orders/detail
/auth/token/refresh
invalid path with space`,
  },

  // ==========================================================================
  // 4. 텍스트 & 코드 (Text & Code)
  // ==========================================================================
  {
    id: 'korean-words',
    category: '텍스트/코드',
    name: '한글 단어 추출 (가-힣)',
    pattern: '[가-힣]+',
    flags: 'g',
    description: '연속된 한글 단어만 추출',
    sampleInput: `안녕하세요. 울트라 오피스 2026입니다.
Hello World.
추출할 한글 텍스트 샘플입니다.
12345 (Numbers)`,
  },
  {
    id: 'english-words',
    category: '텍스트/코드',
    name: '영문 단어 추출 (Words)',
    pattern: '\\b[a-zA-Z]+\\b',
    flags: 'g',
    description: '순수 알파벳 단어만 매칭',
    sampleInput: `Ultra Office is the best productivity suite.
한국어 텍스트와 123 숫자는 제외됩니다.
Code: const myVariable = true;`,
  },
  {
    id: 'camel-to-snake',
    category: '텍스트/코드',
    name: 'CamelCase -> snake_case',
    pattern: '([a-z0-9])([A-Z])',
    flags: 'g',
    description: 'userName -> user_name 변환',
    sampleInput: `userName
userAge
profileImageAddress
snake_case_already
getUserId
totalCountNumber`,
    sampleReplacement: '$1_$2',
    replaceDescription: '대문자 앞에 언더바(_) 삽입 후 소문자 변환',
  },
  {
    id: 'html-tags-strip',
    category: '텍스트/코드',
    name: 'HTML 태그 제거 / 순수 텍스트',
    pattern: '<[^>]+>',
    flags: 'g',
    description: '모든 태그 삭제 후 순수 텍스트만 추출',
    sampleInput: `<div>Hello <b>World</b></div>
<p>This is a <i>paragraph</i>.</p>
<span class="badge" id="btn-1">Button Text</span>
<br/>`,
    sampleReplacement: '',
    replaceDescription: '모든 HTML 태그를 공백 없이 삭제',
  },
  {
    id: 'html-img-src',
    category: '텍스트/코드',
    name: 'HTML <img> 태그의 src 추출',
    pattern: '<img[^>]+src=["\']([^"\']+)["\']',
    flags: 'gi',
    description: '이미지 태그 내부의 URL 경로 추출',
    sampleInput: `<img src="https://example.com/logo.png" alt="Logo" />
<img width="100" src="/assets/hero.jpg" />
<div src="not-image"></div>`,
  },
  {
    id: 'html-a-href',
    category: '텍스트/코드',
    name: 'HTML <a> 태그의 href 추출',
    pattern: '<a[^>]+href=["\']([^"\']+)["\']',
    flags: 'gi',
    description: '하이퍼링크 태그 내부의 연결 주소 추출',
    sampleInput: `<a href="https://ultraoffice.io">울트라 오피스 바로가기</a>
<a class="nav-link" href="/about">회사 소개</a>
<span href="fake"></span>`,
  },
  {
    id: 'parentheses-content',
    category: '텍스트/코드',
    name: '소괄호 내용 추출 (내용)',
    pattern: '\\(([^)]+)\\)',
    flags: 'g',
    description: '(내용) 에서 괄호 안의 텍스트 추출',
    sampleInput: `서울 (테헤란로)
Phone (010)
비고 (특이사항 없음)
빈괄호 ()
다중 (첫번째) 그리고 (두번째)`,
  },
  {
    id: 'square-brackets-content',
    category: '텍스트/코드',
    name: '대괄호 내용 추출 [내용]',
    pattern: '\\[([^\\]]+)\\]',
    flags: 'g',
    description: '[공지사항], [ERROR] 등 대괄호 안의 텍스트',
    sampleInput: `[2026-08-20 14:30:00] [INFO] 서버 시작됨
[공지] 추석 연휴 배송 안내
가격: [25,500]원`,
  },
  {
    id: 'curly-braces-content',
    category: '텍스트/코드',
    name: '중괄호 내용 추출 {내용}',
    pattern: '\\{([^}]+)\\}',
    flags: 'g',
    description: '{user_id}, {key: "value"} 등 중괄호 내용',
    sampleInput: `API 템플릿: /users/{userId}/posts/{postId}
JSON 블록: {"name": "홍길동"}`,
  },
  {
    id: 'double-quotes-content',
    category: '텍스트/코드',
    name: '큰따옴표 안의 내용 ("텍스트")',
    pattern: '"([^"]*)"',
    flags: 'g',
    description: '"..." 로 둘러싸인 문자열 추출',
    sampleInput: `const userName = "홍길동";
const title = "울트라 오피스 2026";
'작은따옴표는 제외'
빈문자열 ""`,
  },
  {
    id: 'single-quotes-content',
    category: '텍스트/코드',
    name: "작은따옴표 안의 내용 ('텍스트')",
    pattern: "'([^']*)'",
    flags: 'g',
    description: "'...' 로 둘러싸인 문자열 추출",
    sampleInput: `import React from 'react';
const type = 'primary';
"큰따옴표는 제외"`,
  },
  {
    id: 'duplicate-words',
    category: '텍스트/코드',
    name: '연속 중복 단어 찾기',
    pattern: '\\b(\\w+)\\s+\\1\\b',
    flags: 'gi',
    description: '단어 단어 처럼 연속으로 오타/중복 입력된 단어',
    sampleInput: `This is a test test for duplicated words words.
여기는 중복 단어 단어 테스트 구역입니다.
Hello hello (대소문자 무관 매칭)
정상 문장입니다.`,
  },
  {
    id: 'duplicate-chars',
    category: '텍스트/코드',
    name: '연속 중복 문자 찾기',
    pattern: '(.)\\1{2,}',
    flags: 'g',
    description: 'aaaaa, ㅋㅋㅋㅋ, !!! 등 3번 이상 연속된 문자',
    sampleInput: `와 대박ㅋㅋㅋㅋㅋㅋㅋ
진짜요???!!!!!!
good!! (2개는 제외)
sooooo cool`,
  },
  {
    id: 'trim-whitespace',
    category: '텍스트/코드',
    name: '문장 앞뒤 공백 제거 (Trim)',
    pattern: '^\\s+|\\s+$',
    flags: 'gm',
    description: '각 줄의 맨 앞과 맨 뒤 공백 매칭',
    sampleInput: `   앞뒤 공백이 많은 문장입니다.   
   탭 문자가 있는 문장\t\t
공백 없음
   들여쓰기만 있는 줄   `,
    sampleReplacement: '',
    replaceDescription: '앞뒤 불필요한 공백 삭제',
  },
  {
    id: 'collapse-whitespace',
    category: '텍스트/코드',
    name: '중복 공백 1칸으로 통합',
    pattern: '[ \\t]+',
    flags: 'g',
    description: '여러 칸의 공백을 한 칸으로 압축',
    sampleInput: `단어     사이의      공백이    너무       많습니다.
One   two   three     four.`,
    sampleReplacement: ' ',
    replaceDescription: '연속 공백을 단일 공백으로 치환',
  },
  {
    id: 'remove-all-whitespace',
    category: '텍스트/코드',
    name: '모든 공백/줄바꿈 제거',
    pattern: '\\s+',
    flags: 'g',
    description: '스페이스, 탭, 엔터 등 모든 공백 삭제',
    sampleInput: `N o   S p a c e   T e s t
1 2 3 4 5 6 7 8 9
모 든   공 백   제 거`,
    sampleReplacement: '',
    replaceDescription: '공백 없는 연속 문자열로 변환',
  },
  {
    id: 'remove-empty-lines',
    category: '텍스트/코드',
    name: '빈 줄 (개행만 있는 줄) 매칭',
    pattern: '^\\s*$\\r?\\n',
    flags: 'gm',
    description: '공백만 있거나 비어있는 줄 찾기',
    sampleInput: `첫 번째 줄

두 번째 줄 (위에 빈 줄)


세 번째 줄 (위에 빈 줄 2개)
마지막 줄`,
    sampleReplacement: '',
    replaceDescription: '빈 줄을 삭제하여 컴팩트하게 정리',
  },
  {
    id: 'single-line-comment',
    category: '텍스트/코드',
    name: '한 줄 주석 매칭 (//, #)',
    pattern: '(?:\\/\\/|#).*$',
    flags: 'gm',
    description: 'JS의 // 또는 Python/Bash의 # 주석',
    sampleInput: `const a = 10; // 변수 선언
# 파이썬 주석입니다
console.log(a); // 콘솔 출력
echo "hello" # 쉘 스크립트`,
  },
  {
    id: 'multi-line-comment',
    category: '텍스트/코드',
    name: '여러 줄 블록 주석 (/* ... */)',
    pattern: '\\/\\*[\\s\\S]*?\\*\\/',
    flags: 'g',
    description: 'C/JS 스타일의 다중 라인 주석',
    sampleInput: `/*
 * 이 함수는 데이터를 가공합니다.
 * @param {string} text
 */
function processData(text) {
  return text.trim(); /* 인라인 블록 주석 */
}`,
  },
  {
    id: 'markdown-links',
    category: '텍스트/코드',
    name: '마크다운 링크 [텍스트](URL)',
    pattern: '\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)',
    flags: 'g',
    description: '마크다운 문서의 하이퍼링크 문법 추출',
    sampleInput: `자세한 내용은 [공식 문서](https://ultraoffice.io/docs)를 참조하세요.
[Google 포털](https://www.google.com)에서 검색해보세요.`,
  },
  {
    id: 'sql-reserved-keywords',
    category: '텍스트/코드',
    name: 'SQL 주요 예약어 추출',
    pattern:
      '\\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|GROUP BY|ORDER BY|HAVING|LIMIT)\\b',
    flags: 'gi',
    description: 'SQL 쿼리문 내의 주요 DML/DQL 키워드',
    sampleInput: `SELECT user_id, user_name
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE user_age >= 20
ORDER BY created_at DESC
LIMIT 10;`,
  },
  {
    id: 'json-key-value',
    category: '텍스트/코드',
    name: 'JSON 키(Key) 추출',
    pattern: '"([a-zA-Z0-9_]+)"\\s*:',
    flags: 'g',
    description: 'JSON 객체의 프로퍼티 키 이름만 추출',
    sampleInput: `{
  "userName": "홍길동",
  "userAge": 30,
  "isActive": true,
  "roles": ["admin", "editor"]
}`,
  },

  // ==========================================================================
  // 5. 검증 & 보안 (Validation & Security)
  // ==========================================================================
  {
    id: 'password-strong',
    category: '검증/보안',
    name: '강력한 비밀번호 검증 (8~20자 영문대소문+숫자+특수문자)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^])[A-Za-z\\d@$!%*?&#^]{8,20}$',
    flags: 'gm',
    description: '대문자, 소문자, 숫자, 특수문자를 각 1개 이상 포함한 8~20자',
    sampleInput: `P@ssw0rd2026! (통과)
Ultra#Office99 (통과)
password123 (대문자/특수문자 없음 - 탈락)
12345678 (숫자만 - 탈락)
Ab1! (8자 미만 - 탈락)`,
  },
  {
    id: 'password-medium',
    category: '검증/보안',
    name: '일반 비밀번호 검증 (8자 이상 영문+숫자)',
    pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
    flags: 'gm',
    description: '영문과 숫자를 최소 1자 이상 포함한 8자 이상',
    sampleInput: `pass1234 (통과)
ValidPass2026 (통과)
onlyletters (숫자 없음 - 탈락)
12345678 (영문 없음 - 탈락)
short9 (8자 미만 - 탈락)`,
  },
  {
    id: 'only-korean',
    category: '검증/보안',
    name: '순수 한글만 허용 (전체 일치)',
    pattern: '^[가-힣]+$',
    flags: 'gm',
    description: '공백, 숫자, 특수문자 없는 순수 한글 완성형',
    sampleInput: `대한민국 (통과)
홍길동 (통과)
홍길동123 (숫자 포함 - 탈락)
Hello (영문 - 탈락)
띄어 쓰기 (공백 포함 - 탈락)`,
  },
  {
    id: 'only-english',
    category: '검증/보안',
    name: '순수 영문만 허용 (전체 일치)',
    pattern: '^[a-zA-Z]+$',
    flags: 'gm',
    description: '대소문자 알파벳으로만 구성된 문자열',
    sampleInput: `UltraOffice (통과)
hello (통과)
Hello123 (숫자 포함 - 탈락)
Hello World (공백 포함 - 탈락)`,
  },
  {
    id: 'only-alphanumeric',
    category: '검증/보안',
    name: '영문 + 숫자만 허용 (아이디/코드)',
    pattern: '^[a-zA-Z0-9]+$',
    flags: 'gm',
    description: '특수문자 및 공백 없는 영숫자 조합',
    sampleInput: `user123 (통과)
Admin2026 (통과)
user_123 (언더바 포함 - 탈락)
user-name (하이픈 포함 - 탈락)`,
  },
  {
    id: 'only-alphanumeric-korean',
    category: '검증/보안',
    name: '한글 + 영문 + 숫자 조합 (닉네임)',
    pattern: '^[가-힣a-zA-Z0-9]+$',
    flags: 'gm',
    description: '특수문자 제외 한글/영문/숫자 허용 닉네임',
    sampleInput: `홍길동123 (통과)
Super개발자 (통과)
열정맨_01 (특수문자 - 탈락)
멋진 개발자 (공백 - 탈락)`,
  },
  {
    id: 'uuid-guid',
    category: '검증/보안',
    name: 'UUID / GUID 고유 식별자',
    pattern:
      '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
    description: 'v1~v5 범용 고유 식별자 (36자리)',
    sampleInput: `ID 1: 550e8400-e29b-41d4-a716-446655440000
ID 2: f47ac10b-58cc-4372-a567-0e02b2c3d479
ID 3: b8393d8b-625d-4a6c-b26a-8671fbb7d0a2
Short: 1234-5678 (자리수 부족)`,
  },
  {
    id: 'hex-color',
    category: '검증/보안',
    name: 'HEX 16진수 색상 코드 (#RGB / #RRGGBB)',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    description: '#FFF, #3f51b5 등 CSS 컬러 코드',
    sampleInput: `White: #FFFFFF
Black: #000
Theme: #3f51b5
Accent: #FF5733
Invalid: #GGG (16진수 아님)`,
  },
  {
    id: 'rgb-rgba-color',
    category: '검증/보안',
    name: 'CSS rgb() / rgba() 색상 함수',
    pattern:
      'rgba?\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}(?:\\s*,\\s*(?:0|1|0?\\.\\d+))?\\s*\\)',
    flags: 'gi',
    description: 'rgb(255, 0, 0) 또는 rgba(0, 0, 0, 0.5)',
    sampleInput: `Color 1: rgb(255, 255, 255)
Color 2: rgba(63, 81, 181, 0.8)
Color 3: rgb(0,0,0)
Invalid: rgb(255, 255) (인자 부족)`,
  },
  {
    id: 'base64-string',
    category: '검증/보안',
    name: 'Base64 인코딩 문자열 검증',
    pattern: '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
    flags: 'gm',
    description: '4의 배수 길이와 패딩(=)을 준수하는 Base64',
    sampleInput: `SGVsbG8gV29ybGQ= (통과 - Hello World)
VWx0cmEgT2ZmaWNl (통과 - Ultra Office)
Invalid@Base64! (특수문자 포함 - 탈락)`,
  },
  {
    id: 'md5-hash',
    category: '검증/보안',
    name: 'MD5 32자리 해시값',
    pattern: '\\b[a-fA-F0-9]{32}\\b',
    flags: 'g',
    description: '32자리 16진수 MD5 체크섬',
    sampleInput: `MD5: 5d41402abc4b2a76b9719d911017c592
Checksum: e4d909c290d0fb1ca068ffaddf22cbd0
Short: 1234567890abcdef (16자리 - 탈락)`,
  },
  {
    id: 'sha256-hash',
    category: '검증/보안',
    name: 'SHA-256 64자리 해시값',
    pattern: '\\b[a-fA-F0-9]{64}\\b',
    flags: 'g',
    description: '64자리 16진수 SHA-256 해시값',
    sampleInput: `Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Token: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e`,
  },
  {
    id: 'date-yyyy-mm-dd',
    category: '검증/보안',
    name: '날짜 형식 (YYYY-MM-DD / YYYY.MM.DD)',
    pattern: '\\b\\d{4}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    description: '2026-08-20, 2026.12.31 등 표준 날짜',
    sampleInput: `작성일자: 2026-08-20
계약일자: 2026/12/31
점검일자: 2026.01.15
잘못된 월: 2026-13-01 (13월)
잘못된 일: 2026-02-32 (32일)`,
  },
  {
    id: 'date-korean',
    category: '검증/보안',
    name: '한글 날짜 (YYYY년 M월 D일)',
    pattern: '\\d{4}년\\s?(?:0?[1-9]|1[0-2])월\\s?(?:0?[1-9]|[12]\\d|3[01])일',
    flags: 'g',
    description: '2026년 8월 20일 형식의 한글 날짜',
    sampleInput: `발행일: 2026년 8월 20일
생년월일: 1995년 12월 25일
기한: 2027년03월01일`,
  },
  {
    id: 'time-hh-mm-ss',
    category: '검증/보안',
    name: '시간 형식 (HH:mm:ss 24시간제)',
    pattern: '\\b(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?\\b',
    flags: 'g',
    description: '14:30, 23:59:59 등 24시간 표기',
    sampleInput: `시작 시간: 09:00
종료 시간: 18:30:00
심야 시간: 23:59:59
잘못된 시간: 25:00 (25시)
잘못된 분: 12:65 (65분)`,
  },
  {
    id: 'iso-8601-datetime',
    category: '검증/보안',
    name: 'ISO 8601 일시 (UTC / Timezone)',
    pattern: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})',
    flags: 'g',
    description: '2026-08-20T14:30:00Z 표준 일시',
    sampleInput: `UTC: 2026-08-20T05:30:00Z
KST: 2026-08-20T14:30:00+09:00
Millis: 2026-08-20T14:30:00.123Z`,
  },
  {
    id: 'cron-expression',
    category: '검증/보안',
    name: 'Cron 스케줄러 표현식',
    pattern: '(((\\d+,)+\\d+|(\\d+(\\/|-)\\d+)|\\d+|\\*) ?){5,7}',
    flags: 'g',
    description: '0 0/5 * * * ? 등 서버 스케줄러 크론식',
    sampleInput: `5분마다: 0 0/5 * * * ?
매일 정오: 0 0 12 * * ?
매주 월요일: 0 0 10 ? * MON
매월 1일: 0 0 1 1 * ?`,
  },
  {
    id: 'log-level',
    category: '검증/보안',
    name: '서버 로그 레벨 필터링',
    pattern: '\\b(INFO|WARN(?:ING)?|ERROR|DEBUG|TRACE|FATAL|CRITICAL)\\b',
    flags: 'g',
    description: '로그 텍스트에서 등급 키워드만 추출',
    sampleInput: `[2026-08-20 14:30:01] INFO: App server started
[2026-08-20 14:30:05] WARN: Memory usage high (82%)
[2026-08-20 14:30:10] ERROR: DB query timeout
[2026-08-20 14:30:12] DEBUG: Auth token validated`,
  },
  {
    id: 'file-extension-images',
    category: '검증/보안',
    name: '이미지 파일명/확장자 (.jpg, .png 등)',
    pattern: '\\.(jpe?g|png|gif|webp|svg|bmp|ico)$',
    flags: 'gim',
    description: '대표적인 이미지 확장자로 끝나는 파일명',
    sampleInput: `photo.jpg
hero_banner.png
animation.GIF
document.pdf (매칭 안됨)
logo.svg
app.webp`,
  },
  {
    id: 'file-extension-docs',
    category: '검증/보안',
    name: '오피스/문서 파일 확장자 (.pdf, .xlsx 등)',
    pattern: '\\.(pdf|docx?|xlsx?|pptx?|hwp|txt|csv)$',
    flags: 'gim',
    description: '문서/스프레드시트/프레젠테이션 파일 확장자',
    sampleInput: `report_final.pdf
salary_table.xlsx
meeting_notes.docx
presentation.pptx
data.csv
script.js (매칭 안됨)`,
  },

  // ==========================================================================
  // 6. 문법 & 기초 (Syntax & Basics)
  // ==========================================================================
  {
    id: 'regex-any-char',
    category: '문법/기초',
    name: '아무 문자 하나 (.)',
    pattern: '.',
    flags: 'gm',
    description: '줄바꿈을 제외한 모든 단일 문자',
    sampleInput: `Line 1: abc
Line 2: 123
Line 3: !@#`,
  },
  {
    id: 'regex-digit',
    category: '문법/기초',
    name: '숫자 문자 (\\d)',
    pattern: '\\d',
    flags: 'g',
    description: '0부터 9까지의 모든 아라비아 숫자',
    sampleInput: `abc123def456
Room 402, Building 7`,
  },
  {
    id: 'regex-not-digit',
    category: '문법/기초',
    name: '숫자가 아닌 모든 문자 (\\D)',
    pattern: '\\D',
    flags: 'g',
    description: '숫자를 제외한 알파벳, 한글, 특수문자, 공백',
    sampleInput: `Price: 25000원!
Item #99`,
  },
  {
    id: 'regex-word',
    category: '문법/기초',
    name: '단어 문자 (\\w : 영문/숫자/_)',
    pattern: '\\w',
    flags: 'g',
    description: '영문 대소문자, 숫자, 언더스코어(_)',
    sampleInput: `user_name_123!
hello-world.js`,
  },
  {
    id: 'regex-not-word',
    category: '문법/기초',
    name: '비단어 문자 (\\W : 공백/특수문자)',
    pattern: '\\W',
    flags: 'g',
    description: '영문/숫자/_ 이외의 공백, 괄호, 특수기호',
    sampleInput: `Hello, World! (100%)
#hashtag @mention`,
  },
  {
    id: 'regex-whitespace',
    category: '문법/기초',
    name: '공백 문자 (\\s : 스페이스/탭/줄바꿈)',
    pattern: '\\s',
    flags: 'g',
    description: '스페이스, 탭(\\t), 캐리지리턴(\\r), 뉴라인(\\n)',
    sampleInput: `Hello World
First\tSecond
Third\nFourth`,
  },
  {
    id: 'regex-not-whitespace',
    category: '문법/기초',
    name: '공백이 아닌 모든 문자 (\\S)',
    pattern: '\\S',
    flags: 'g',
    description: '공백을 제외한 모든 글자 및 기호',
    sampleInput: `A B C 1 2 3 ! @ #`,
  },
  {
    id: 'regex-zero-or-more',
    category: '문법/기초',
    name: '0회 이상 반복 (*)',
    pattern: 'ba*',
    flags: 'g',
    description: '앞 문자가 0번 이상 연속 등장',
    sampleInput: `b (0회)
ba (1회)
baa (2회)
baaa (3회)
ccc (매칭 안됨)`,
  },
  {
    id: 'regex-one-or-more',
    category: '문법/기초',
    name: '1회 이상 반복 (+)',
    pattern: 'ba+',
    flags: 'g',
    description: '앞 문자가 최소 1번 이상 등장',
    sampleInput: `b (0회 - 매칭 안됨)
ba (1회)
baa (2회)
baaa (3회)`,
  },
  {
    id: 'regex-optional',
    category: '문법/기초',
    name: '0 또는 1회 선택 (?)',
    pattern: 'https?',
    flags: 'g',
    description: '앞 문자가 있거나 없거나 (Optional)',
    sampleInput: `http://localhost
https://google.com
ftp://file (매칭 안됨)`,
  },
  {
    id: 'regex-exact-count',
    category: '문법/기초',
    name: '정확히 n회 반복 {n}',
    pattern: '\\d{3}',
    flags: 'g',
    description: '정확히 3자리 숫자만 매칭',
    sampleInput: `1
12
123 (일치)
1234 (123만 일치)
abc`,
  },
  {
    id: 'regex-range-count',
    category: '문법/기초',
    name: 'n~m회 사이 반복 {n,m}',
    pattern: '\\d{2,4}',
    flags: 'g',
    description: '2자리에서 4자리 사이의 숫자',
    sampleInput: `1 (매칭 안됨)
12 (2자리)
123 (3자리)
1234 (4자리)
12345 (4자리 매칭)`,
  },
  {
    id: 'regex-min-count',
    category: '문법/기초',
    name: '최소 n회 이상 반복 {n,}',
    pattern: '\\d{3,}',
    flags: 'g',
    description: '최소 3자리 이상의 연속 숫자',
    sampleInput: `12 (2자리 - 매칭 안됨)
123 (3자리)
123456 (6자리)`,
  },
  {
    id: 'regex-line-start',
    category: '문법/기초',
    name: '줄의 시작 앵커 (^)',
    pattern: '^#\\s.*$',
    flags: 'gm',
    description: '줄의 맨 처음에 # 으로 시작하는 제목 라인',
    sampleInput: `# 제목 1 (일치)
본문 내용
# 제목 2 (일치)
  # 들여쓰기된 제목 (탈락)`,
  },
  {
    id: 'regex-line-end',
    category: '문법/기초',
    name: '줄의 끝 앵커 ($)',
    pattern: '끝\\.$',
    flags: 'gm',
    description: '줄의 맨 마지막이 특정 단어로 끝남',
    sampleInput: `문장의 끝. (일치)
끝.이지만 뒤에 글자가 있음 (탈락)
진짜 끝. (일치)`,
  },
  {
    id: 'regex-full-match',
    category: '문법/기초',
    name: '문자열 전체 일치 검사 (^...$)',
    pattern: '^\\d+$',
    flags: 'gm',
    description: '처음부터 끝까지 오직 숫자로만 채워진 줄',
    sampleInput: `123456 (일치)
123a456 (영문 포함 - 탈락)
  123  (공백 포함 - 탈락)
99999 (일치)`,
  },
  {
    id: 'regex-or-condition',
    category: '문법/기초',
    name: 'OR 조건 분기 (|)',
    pattern: 'cat|dog|bird',
    flags: 'gi',
    description: 'A 또는 B 또는 C 중 하나 일치',
    sampleInput: `I have a cat.
He has a dog.
She likes birds.
Fish is not matched.`,
  },
  {
    id: 'regex-capturing-group',
    category: '문법/기초',
    name: '캡처 그룹 ( )',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    flags: 'g',
    description: '괄호로 묶어 $1, $2, $3 등으로 참조 가능',
    sampleInput: `날짜: 2026-08-20
생일: 1995-12-25`,
    sampleReplacement: '$1년 $2월 $3일',
    replaceDescription: '2026년 08월 20일로 순서 재구성',
  },
  {
    id: 'regex-non-capturing-group',
    category: '문법/기초',
    name: '비캡처 그룹 (?: )',
    pattern: '(?:https?|ftp):\\/\\/([^\\s/]+)',
    flags: 'g',
    description: '그룹화만 수행하고 캡처 인덱스에는 포함하지 않음',
    sampleInput: `https://ultraoffice.io/app
http://google.com
ftp://files.org`,
  },
  {
    id: 'regex-charset-include',
    category: '문법/기초',
    name: '문자 집합 포함 [abc]',
    pattern: '[aeiou]',
    flags: 'gi',
    description: '지정된 문자 중 하나라도 일치 (영어 모음)',
    sampleInput: `hello world (e, o, o 일치)
ultra office (u, a, o, i, e 일치)`,
  },
  {
    id: 'regex-charset-exclude',
    category: '문법/기초',
    name: '문자 집합 제외 [^abc]',
    pattern: '[^0-9\\s]',
    flags: 'g',
    description: '숫자와 공백을 제외한 모든 글자',
    sampleInput: `Order 12345 (O, r, d, e, r 일치)
Price: $500 (P, r, i, c, e, :, $ 일치)`,
  },
  {
    id: 'regex-greedy-match',
    category: '문법/기초',
    name: 'Greedy 탐욕적 매칭 (<.*>)',
    pattern: '<.*>',
    flags: 'g',
    description: '일치하는 가장 긴 범위까지 매칭 (끝 태그까지 통째)',
    sampleInput: `<div>첫번째</div><span>두번째</span>
<b>굵은글씨</b>`,
  },
  {
    id: 'regex-lazy-match',
    category: '문법/기초',
    name: 'Lazy 비탐욕적 최소 매칭 (<.*?>)',
    pattern: '<.*?>',
    flags: 'g',
    description: '일치하는 가장 짧은 단위로 분할 매칭',
    sampleInput: `<div>첫번째</div><span>두번째</span>
<b>굵은글씨</b>`,
  },
  {
    id: 'regex-entire-line',
    category: '문법/기초',
    name: '내용이 있는 한 줄 전체 (^.+$)',
    pattern: '^.+$',
    flags: 'gm',
    description: '빈 줄을 제외한 텍스트가 있는 모든 줄',
    sampleInput: `첫 번째 줄

세 번째 줄 (위 빈 줄 건너뜀)
네 번째 줄`,
  },
  {
    id: 'regex-newline',
    category: '문법/기초',
    name: '개행 / 줄바꿈 문자 (\\r?\\n)',
    pattern: '\\r?\\n',
    flags: 'g',
    description: 'Windows (CRLF) 및 Unix (LF) 줄바꿈 문자',
    sampleInput: `Line 1
Line 2
Line 3`,
  },
  {
    id: 'regex-non-alphanumeric-korean',
    category: '문법/기초',
    name: '한글/영문/숫자 외 특수문자/기호',
    pattern: '[^a-zA-Z0-9가-힣\\s]',
    flags: 'g',
    description: '공백, 글자를 제외한 모든 특수기호만 매칭',
    sampleInput: `Hello! 안녕하세요? 100%
Email: user@domain.com
Price: $25,500원 #tag`,
  },
];
