import type { MarkdownTemplate, WordTemplateConfig } from '../types';

export const WORD_TEMPLATES: WordTemplateConfig[] = [
  {
    id: 'employment-contract',
    title: '표준 근로계약서',
    category: '인사 및 계약',
    description: '고용노동부 표준 양식 기반의 정규직/계약직 근로계약서',
    icon: 'tabler:file-certificate',
    defaultData: {
      company_name: '(주)울트라오피스',
      ceo_name: '홍길동',
      employee_name: '김철수',
      employee_birth: '1995년 03월 15일',
      address: '서울특별시 강남구 테헤란로 123',
      position: '선임 소프트웨어 엔지니어',
      start_date: '2026년 09월 01일',
      monthly_salary: '5,500,000',
      bonus: '연봉의 15%',
      work_hours: '09:00 ~ 18:00 (휴게시간 12:00 ~ 13:00)',
      contract_date: '2026년 08월 20일',
    },
    fields: [
      { key: 'company_name', label: '회사명 (사업주)', type: 'text' },
      { key: 'ceo_name', label: '대표자명', type: 'text' },
      { key: 'employee_name', label: '근로자 성명', type: 'text' },
      { key: 'employee_birth', label: '근로자 생년월일', type: 'text' },
      { key: 'position', label: '담당 직무 및 직급', type: 'text' },
      { key: 'start_date', label: '근로 시작일', type: 'date' },
      { key: 'monthly_salary', label: '기본 월급 (원)', type: 'text' },
      { key: 'bonus', label: '상여금 및 인센티브', type: 'text' },
      { key: 'work_hours', label: '소정 근로 시간', type: 'text' },
      { key: 'contract_date', label: '계약 체결일', type: 'date' },
    ],
    sampleContent: `
# 표준 근로계약서

**사업주(이하 "갑")**: {company_name} (대표: {ceo_name})
**근로자(이하 "을")**: {employee_name} (생년월일: {employee_birth})

"갑"과 "을"은 상호 신의성실의 원칙에 입각하여 다음과 같이 근로계약을 체결하고 성실히 이행할 것을 서약한다.

---

### 제 1 조 (근로계약기간)
1. "을"의 근로계약 시작일은 **{start_date}**부터로 하며, 기간의 정함이 없는 정규 근로계약으로 한다.

### 제 2 조 (근무장소 및 담당업무)
1. 근무장소: {company_name} 본사 및 지정 근무지
2. 담당직무: **{position}** 및 회사가 지정하는 관련 부대업무

### 제 3 조 (근로시간 및 휴게시간)
1. 근로시간: **{work_hours}** (주 40시간 근무제 적용)
2. 주휴일: 매주 일요일을 주휴일로 정하며, 토요일은 무급휴무일로 한다.

### 제 4 조 (임금 및 지급방법)
1. 월 기본급: **금 {monthly_salary} 원**
2. 성과 상여금: {bonus}
3. 임금 지급일: 매월 25일 (을의 명의 통장으로 직접 계좌이체)

### 제 5 조 (기타)
본 계약서에 명시되지 않은 사항은 근로기준법 및 회사의 취업규칙에 따른다.

---

**계약일자**: {contract_date}

**"갑" (사업주)**: {company_name} 대표이사 {ceo_name} (인)  
**"을" (근로자)**: {employee_name} (인)
    `,
  },
  {
    id: 'nda-agreement',
    title: '비밀유지 서약서 (NDA)',
    category: '법률 및 보안',
    description: '기업의 기술 및 영업 비밀 보호를 위한 표준 비밀유지 계약서',
    icon: 'tabler:shield-lock',
    defaultData: {
      disclosing_party: '(주)울트라오피스',
      receiving_party: '넥스트테크 주식회사',
      purpose: '차세대 AI 오피스 문서 자동화 플랫폼 공동 기술 협력 및 POC 검증',
      effective_date: '2026년 08월 20일',
      duration_years: '3년',
      penalty_amount: '50,000,000',
    },
    fields: [
      { key: 'disclosing_party', label: '정보 제공자 (갑)', type: 'text' },
      { key: 'receiving_party', label: '정보 수령자 (을)', type: 'text' },
      { key: 'purpose', label: '협력 및 제공 목적', type: 'textarea' },
      { key: 'effective_date', label: '효력 발생일', type: 'date' },
      { key: 'duration_years', label: '비밀유지 의무 기간', type: 'text' },
      { key: 'penalty_amount', label: '위약벌 배상액 (원)', type: 'text' },
    ],
    sampleContent: `
# 상호 비밀유지 서약서 (Non-Disclosure Agreement)

**정보 제공자 ("갑")**: {disclosing_party}  
**정보 수령자 ("을")**: {receiving_party}  

양 당사자는 **"{purpose}"**(이하 "본 목적")과 관련하여 상호 제공하는 기밀정보의 보호를 위해 다음과 같이 계약을 체결한다.

---

### 제 1 조 (비밀정보의 정의)
"비밀정보"라 함은 본 목적과 관련하여 구두, 서면, 전자적 형태 등으로 개시되는 모든 기술상, 경영상, 영업상의 정보를 의미한다.

### 제 2 조 (비밀유지 의무)
1. "을"은 "갑"의 서면 동의 없이 비밀정보를 제3자에게 누설하거나 본 목적 이외의 용도로 사용하여서는 아니 된다.
2. "을"은 당해 비밀정보의 보호를 위해 통상적인 관리자로서의 주의의무를 다하여야 한다.

### 제 3 조 (유효기간)
본 계약에 따른 비밀유지 의무는 본 계약 체결일인 **{effective_date}**로부터 **{duration_years}**간 유효하다.

### 제 4 조 (손해배상 및 위약벌)
어느 일방이 본 계약상의 의무를 위반하여 상대방에게 손해를 입힌 경우, 위반자는 최소 **금 {penalty_amount} 원**의 손해배상 책임을 진다.

---

**체결일**: {effective_date}

**정보 제공자**: {disclosing_party} (인)  
**정보 수령자**: {receiving_party} (인)
    `,
  },
  {
    id: 'certificate-award',
    title: '교육 수료증 및 인증서',
    category: '증명서 및 발급',
    description: '전문 교육 수료 및 자격 획득을 인증하는 공식 증명서 양식',
    icon: 'tabler:award',
    defaultData: {
      cert_number: 'UO-2026-CERT-089',
      recipient_name: '이민호',
      recipient_birth: '1998.05.20',
      course_name: 'Next.js & TypeScript 풀스택 오피스 엔지니어링 마스터 과정',
      training_period: '2026년 06월 01일 ~ 2026년 08월 20일 (총 120시간)',
      issuer_org: '한국 소프트웨어 혁신 아카데미',
      issuer_ceo: '박지성',
      issue_date: '2026년 08월 20일',
    },
    fields: [
      { key: 'cert_number', label: '증서 번호', type: 'text' },
      { key: 'recipient_name', label: '수료자 성명', type: 'text' },
      { key: 'recipient_birth', label: '수료자 생년월일', type: 'text' },
      { key: 'course_name', label: '교육 과정명', type: 'text' },
      { key: 'training_period', label: '교육 이수 기간', type: 'text' },
      { key: 'issuer_org', label: '발급 기관명', type: 'text' },
      { key: 'issuer_ceo', label: '발급 기관 대표자', type: 'text' },
      { key: 'issue_date', label: '발급 일자', type: 'date' },
    ],
    sampleContent: `
# 수 료 증 (Certificate of Completion)

**제 {cert_number} 호**

* **성 명**: {recipient_name}
* **생년월일**: {recipient_birth}
* **과정명**: {course_name}
* **교육기간**: {training_period}

위 사람은 본 기관에서 주관한 상기 교육 과정을 우수한 성적으로 성실히 이수하였으므로 이 증서를 수여합니다.

---

**발급일**: {issue_date}

**{issuer_org}**  
**원 장 {issuer_ceo}** (직인생략)
    `,
  },
  {
    id: 'project-proposal',
    title: '비즈니스 프로젝트 기획서',
    category: '기획 및 비즈니스',
    description: '경영진 보고 및 클라이언트 제안용 프로젝트 종합 기획서',
    icon: 'tabler:briefcase',
    defaultData: {
      project_name: '클라우드 네이티브 오피스 문서 자동화 솔루션 구축',
      target_client: '글로벌 엔터프라이즈 및 공공기관',
      budget: '120,000,000 원',
      timeline: '2026.09 ~ 2027.02 (6개월)',
      lead_manager: '최유진 수석 PM',
      objectives: '브라우저 단독 무설치 구동, MS Office 100% 호환, 백엔드 부하 0% 달성',
    },
    fields: [
      { key: 'project_name', label: '프로젝트명', type: 'text' },
      { key: 'target_client', label: '대상 고객 / 부서', type: 'text' },
      { key: 'budget', label: '예상 총 예산', type: 'text' },
      { key: 'timeline', label: '추진 일정', type: 'text' },
      { key: 'lead_manager', label: '총괄 책임자', type: 'text' },
      { key: 'objectives', label: '핵심 달성 목표', type: 'textarea' },
    ],
    sampleContent: `
# 프로젝트 사업 기획서

## 1. 개요
* **프로젝트명**: {project_name}
* **대상 고객/시장**: {target_client}
* **총 소요 예산**: {budget}
* **사업 추진 일정**: {timeline}
* **총괄 담당자**: {lead_manager}

## 2. 사업 추진 배경 및 목표
{objectives}

## 3. 기대 효과
1. 업무 생산성 40% 이상 향상
2. 라이선스 비용 연간 5천만원 절감
3. 실시간 협업 및 무설치 웹 환경 제공
    `,
  },
];

export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  {
    id: 'tech-spec',
    title: '기술 설계 사양서 (RFC / Tech Spec)',
    category: '소프트웨어 엔지니어링',
    description: '시스템 아키텍처, 데이터 플로우, API 명세가 포함된 기술 문서',
    content: `# [RFC] 다중 엔진 오피스 문서 자동화 아키텍처

## 1. 요약 (Abstract)
본 문서는 Next.js 환경에서 **Word(.docx)** 및 **PowerPoint(.pptx)** 문서를 서버 부하 없이 클라이언트 사이드에서 동적으로 조립하고 시각화하는 시스템을 제안합니다.

## 2. 수학적 성능 모델 (Mathematical Model)
클라이언트 처리 시간 $T_{total}$은 문서 크기 $S$와 요소 수 $N$에 선형 비례합니다:
$$T_{total}(S, N) = \\alpha S + \\beta \\sum_{i=1}^{N} w_i + \\mathcal{O}(\\log N)$$

## 3. 아키텍처 시퀀스 다이어그램 (Architecture)

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 (브라우저)
    participant UI as DocMaster UI
    participant Gen as DOCX/PPTX 엔진
    participant DL as FileSaver

    User->>UI: 데이터 입력 및 템플릿 선택
    UI->>Gen: JSON 데이터 주입 & AST 파싱
    Gen->>Gen: ArrayBuffer 바이너리 압축
    Gen-->>UI: Blob 객체 반환
    UI->>DL: saveAs(blob, filename.docx)
    DL-->>User: 즉시 다운로드 완료
\`\`\`

## 4. 지원 엔진 비교표

| 엔진 구분 | 지원 포맷 | 주요 라이브러리 | 렌더링 방식 |
| :--- | :---: | :---: | :---: |
| **Word Generator** | \`.docx\` | \`docx\`, \`docxtemplater\` | Pure Client-side OOXML |
| **Word Viewer** | \`.docx\` | \`mammoth\` | HTML5 변환 렌더링 |
| **Slide Studio** | \`.pptx\` | \`pptxgenjs\` | OpenXML Presentation |
| **Math & Diagram** | Math/Flow | \`KaTeX\`, \`Mermaid\` | WebGL & SVG Vector |

## 5. 핵심 체크리스트
- [x] 완전한 클라이언트 단독 실행 (No Server Cost)
- [x] 메모리 누수 방지 리소스 Destroy 처리
- [ ] 오프라인 IndexedDB 임시 저장 지원
`,
  },
  {
    id: 'meeting-notes',
    title: '주간 전략 회의록 (Meeting Notes)',
    category: '비즈니스 & 협업',
    description: '참석자, 안건, 의사결정 사항, 액션 아이템을 정리하는 템플릿',
    content: `# 2026 Q3 프로덕트 전략 주간 회의록

* **일시**: 2026년 08월 20일 14:00 ~ 15:30 (KST)
* **장소**: 대회의실 & Google Meet
* **참석자**: 홍길동(PM), 김철수(FE Lead), 이영희(Design), 박민수(QA)

---

## 1. 주요 의결 사항 (Key Decisions)
1. **Office 스위트 런칭 일정**: 9월 1주차 베타 오픈 확정
2. **다중 엔진 지원**: Word, PPTX, Markdown 3개 축 동시 릴리즈

## 2. 기능 우선순위 현황

\`\`\`mermaid
pie title 기능별 개발 리소스 투입 비율
    "Word .docx 빌더" : 35
    "PPTX 슬라이드 자동화" : 30
    "마크다운 & KaTeX" : 20
    "배치 일괄 생성기" : 15
\`\`\`

## 3. 팀별 액션 아이템 (Action Items)
- [x] **[김철수]** \`docx\` 및 \`pptxgenjs\` 비동기 로더 번들 최적화
- [x] **[이영희]** 슬라이드 템플릿 4종 컬러 팔레트 가이드 배포
- [ ] **[박민수]** 대용량 500개 행 배치 테스트 및 벤치마크 보고서 작성
`,
  },
];
