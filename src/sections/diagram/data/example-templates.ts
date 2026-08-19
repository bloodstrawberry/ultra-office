import type { ErdSchema, MathExample, ChartExample, MarkdownTemplate } from '../types';

// ----------------------------------------------------------------------
// 1. Math / LaTeX Examples (수식 예시 10종)
// ----------------------------------------------------------------------
export const MATH_EXAMPLES: MathExample[] = [
  {
    id: 'quadratic',
    title: '2차 방정식의 근의 공식 (Quadratic Formula)',
    category: 'algebra',
    categoryLabel: '대수학',
    description: '2차 다항 방정식 ax² + bx + c = 0 의 두 근을 구하는 기본 공식',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  },
  {
    id: 'euler-identity',
    title: "오일러의 항등식 (Euler's Identity)",
    category: 'algebra',
    categoryLabel: '대수학',
    description:
      '자연로그 밑 e, 허수단위 i, 원주율 π, 1, 0의 다섯 가지 기본 상수를 잇는 가장 아름다운 공식',
    latex: 'e^{i\\pi} + 1 = 0',
  },
  {
    id: 'fundamental-calculus',
    title: '미적분학의 기본정리 (Fundamental Theorem of Calculus)',
    category: 'calculus',
    categoryLabel: '미적분학',
    description: '연속함수 f(x)의 정적분과 부정적분(원시함수 F) 사이의 기본 관계',
    latex: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
  },
  {
    id: 'gaussian-distribution',
    title: '가우스 정규분포 확률밀도함수 (Gaussian PDF)',
    category: 'statistics',
    categoryLabel: '통계학',
    description: '평균 μ와 표준편차 σ를 갖는 정규분포의 확률밀도함수(Normal Distribution)',
    latex:
      'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left( -\\frac{(x-\\mu)^2}{2\\sigma^2} \\right)',
  },
  {
    id: 'bayes-theorem',
    title: "베이즈 정리 (Bayes' Theorem)",
    category: 'statistics',
    categoryLabel: '통계학',
    description:
      '사전확률과 우도(Likelihood)를 통해 새로운 증거가 주어졌을 때의 사후확률을 계산하는 공식',
    latex:
      'P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)} = \\frac{P(B \\mid A)\\,P(A)}{\\sum_{i} P(B \\mid A_i)\\,P(A_i)}',
  },
  {
    id: 'machine-learning-loss',
    title: '머신러닝 Cross-Entropy 손실 & Softmax',
    category: 'ai',
    categoryLabel: '인공지능 & ML',
    description: '다중 분류 신경망에서 사용되는 Softmax 활성화 함수 및 Cross-Entropy 손실 함수',
    latex:
      '\\mathcal{L}_{CE} = -\\sum_{k=1}^{K} y_k \\ln(\\hat{y}_k), \\quad \\text{where } \\hat{y}_k = \\frac{e^{z_k}}{\\sum_{j=1}^{K} e^{z_j}}',
  },
  {
    id: 'matrix-determinant',
    title: '3×3 행렬식 계산 공식 (Determinant of 3x3 Matrix)',
    category: 'algebra',
    categoryLabel: '선형대수학',
    description: '3차 정방행렬의 가역성과 부피 변화율을 나타내는 행렬식 전개식',
    latex:
      '\\det(A) = \\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg)',
  },
  {
    id: 'schrodinger',
    title: '슈뢰딩거 파동 방정식 (Time-Dependent Schrödinger Eq.)',
    category: 'physics',
    categoryLabel: '물리학',
    description:
      '양자역학에서 물질파의 상태 함수(파동함수 Ψ)가 시간에 따라 변화하는 양상을 기술하는 방정식',
    latex:
      'i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\left[ -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r},t) \\right] \\Psi(\\mathbf{r},t)',
  },
  {
    id: 'maxwell-equations',
    title: "맥스웰 방정식 (Maxwell's Equations in Differential Form)",
    category: 'physics',
    categoryLabel: '물리학',
    description:
      '전자기장을 기술하는 4가지 기본 미분방정식 (가우스 법칙, 패러데이 법칙, 앙페르-맥스웰 법칙)',
    latex:
      '\\begin{aligned} \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} & \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\[6pt] \\nabla \\cdot \\mathbf{B} &= 0 & \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\end{aligned}',
  },
  {
    id: 'special-relativity',
    title: '특수 상대성 이론 에너지-운동량 관계 (Energy-Momentum Relation)',
    category: 'physics',
    categoryLabel: '물리학',
    description: '정지 질량 m₀와 상대론적 운동량 p를 가지는 입자의 총 에너지 E 공식',
    latex: 'E^2 = (pc)^2 + (m_0 c^2)^2 \\implies E = mc^2 \\quad (\\text{when } p=0)',
  },
];

export const MATH_SYMBOLS_PALETTE = [
  { label: '분수 (a/b)', code: '\\frac{a}{b}' },
  { label: '거듭제곱 (x^n)', code: 'x^{n}' },
  { label: '아래첨자 (x_n)', code: 'x_{n}' },
  { label: '제곱근 (√x)', code: '\\sqrt{x}' },
  { label: 'N제곱근 (ⁿ√x)', code: '\\sqrt[n]{x}' },
  { label: '시그마 합 (∑)', code: '\\sum_{i=1}^{n} a_i' },
  { label: '정적분 (∫)', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: '이중적분 (∬)', code: '\\iint_{D} f(x,y)\\,dx\\,dy' },
  { label: '극한 (lim)', code: '\\lim_{x \\to \\infty} f(x)' },
  { label: '편미분 (∂f/∂x)', code: '\\frac{\\partial f}{\\partial x}' },
  { label: '행렬 2x2', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  {
    label: '행렬 3x3',
    code: '\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}',
  },
  { label: '그리스: α, β, γ', code: '\\alpha, \\beta, \\gamma' },
  { label: '그리스: θ, λ, μ', code: '\\theta, \\lambda, \\mu' },
  { label: '그리스: π, σ, ω', code: '\\pi, \\sigma, \\omega' },
  { label: '대문자: Σ, Ω, Δ', code: '\\Sigma, \\Omega, \\Delta' },
  { label: '연산자: ±, ×, ÷', code: '\\pm, \\times, \\div' },
  { label: '관계: ≤, ≥, ≠, ≈', code: '\\le, \\ge, \\neq, \\approx' },
  { label: '집합: ∈, ⊂, ∪, ∩', code: '\\in, \\subset, \\cup, \\cap' },
  { label: '화살표: →, ⇒, ⇔', code: '\\to, \\implies, \\iff' },
];

// ----------------------------------------------------------------------
// 2. Chart / Graph Examples (그래프 예시 6종)
// ----------------------------------------------------------------------
export const CHART_EXAMPLES: ChartExample[] = [
  {
    id: 'quarterly-revenue',
    title: '분기별 매출 및 영업이익 추이 (Bar & Column)',
    category: '재무 & 비즈니스',
    description: '2025~2026년 분기별 매출액, 영업이익, 순이익을 한눈에 비교하는 복합 막대 그래프',
    type: 'bar',
    categories: ['25.1Q', '25.2Q', '25.3Q', '25.4Q', '26.1Q', '26.2Q', '26.3Q', '26.4Q(E)'],
    series: [
      { name: '매출액 (억원)', data: [120, 145, 180, 210, 230, 265, 310, 350] },
      { name: '영업이익 (억원)', data: [25, 32, 45, 58, 62, 78, 92, 108] },
      { name: '당기순이익 (억원)', data: [18, 24, 35, 46, 49, 61, 74, 85] },
    ],
  },
  {
    id: 'web-traffic-conversion',
    title: '월간 트래픽 & 유료 전환율 (Area Chart)',
    category: '마케팅 & 분석',
    description: '월별 순방문자수(UV), 총 페이지뷰(PV), 신규 회원가입 유입 추이 곡선',
    type: 'area',
    categories: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    series: [
      { name: '순 방문자수 (k-UV)', data: [45, 52, 68, 74, 89, 110, 135, 148, 160, 185, 210, 240] },
      {
        name: '페이지뷰 (k-PV)',
        data: [130, 155, 205, 230, 290, 360, 420, 470, 520, 610, 700, 810],
      },
      { name: '신규 가입자 (백명)', data: [12, 15, 21, 25, 33, 42, 54, 60, 68, 80, 95, 115] },
    ],
  },
  {
    id: 'market-share',
    title: '글로벌 엔터프라이즈 클라우드 점유율 (Donut Chart)',
    category: '시장 조사',
    description: '글로벌 엔터프라이즈 클라우드 인프라 및 SaaS 시장 점유율 구성비',
    type: 'donut',
    categories: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Alibaba Cloud', 'Oracle Cloud', '기타'],
    series: [32, 23, 11, 4, 3, 27],
  },
  {
    id: 'tech-stack-radar',
    title: '개발 조직 직무 역량 다이어그램 (Radar Chart)',
    category: '조직 & HR',
    description: '프론트엔드, 백엔드, 인프라/DevOps, 데이터/AI, 보안 5대 핵심 직무 역량 지수',
    type: 'radar',
    categories: [
      'React & UI/UX',
      'Cloud & DevOps',
      'API & 시스템 설계',
      'AI & 머신러닝',
      '데이터베이스 & SQL',
      '보안 & 모니터링',
    ],
    series: [
      { name: '시니어 풀스택 팀', data: [92, 85, 95, 78, 90, 84] },
      { name: 'AI/데이터 전문 팀', data: [65, 88, 82, 98, 94, 75] },
      { name: '프론트/앱 프로덕트 팀', data: [96, 68, 75, 72, 70, 65] },
    ],
  },
  {
    id: 'service-latency-scatter',
    title: 'API 트래픽 부하별 응답 지연시간 (Line / Latency)',
    category: '시스템 성능',
    description: '초당 동시 요청수(RPS) 증가에 따른 P50, P95, P99 API Latency(ms) 변화',
    type: 'line',
    categories: [
      '1k RPS',
      '5k RPS',
      '10k RPS',
      '20k RPS',
      '35k RPS',
      '50k RPS',
      '75k RPS',
      '100k RPS',
    ],
    series: [
      { name: 'P99 Latency (ms)', data: [12, 18, 25, 42, 68, 115, 190, 310] },
      { name: 'P95 Latency (ms)', data: [8, 11, 15, 22, 34, 52, 85, 140] },
      { name: 'P50 Median (ms)', data: [4, 5, 6, 8, 12, 16, 24, 38] },
    ],
  },
  {
    id: 'user-cohort-retention',
    title: '주차별 사용자 코호트 잔존율 (Stacked Bar)',
    category: '제품 & UX',
    description: '신규 가입 유저의 주차별(W1 ~ W8) 활성 리텐션 유지 비율',
    type: 'bar',
    categories: [
      'W1 (7일차)',
      'W2 (14일차)',
      'W3 (21일차)',
      'W4 (28일차)',
      'W5 (35일차)',
      'W6 (42일차)',
      'W7 (49일차)',
      'W8 (56일차)',
    ],
    series: [
      { name: '핵심 파워유저 (%)', data: [25, 24, 23, 22, 22, 21, 21, 20] },
      { name: '일반 활성유저 (%)', data: [40, 32, 27, 24, 21, 19, 18, 17] },
      { name: '간헐적 방문자 (%)', data: [20, 18, 15, 13, 11, 10, 9, 8] },
    ],
  },
];

// ----------------------------------------------------------------------
// 3. Markdown Templates (마크다운 실무 템플릿 5종)
// ----------------------------------------------------------------------
export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  {
    id: 'prd-template',
    title: '제품 기능 기획서 (PRD Template)',
    category: 'prd',
    categoryLabel: '기획 & PRD',
    description: '프로덕트 매니저가 기능 요구사항을 정의하고 개발팀과 얼라인을 맞추는 표준 기획서',
    content: `# [PRD] 스마트 실시간 협업 스튜디오 v2.0

> **작성자:** 기획총괄 PM | **상태:** \`Approved\` | **최종 수정일:** 2026-08-20
> **관련 마일스톤:** Q3-Milestone-Sprint-04

---

## 1. 배경 및 목표 (Background & Objectives)
사용자가 브라우저 상에서 **수식(LaTeX), 그래프(Chart), 마크다운, 데이터베이스 ERD**를 실시간으로 작성하고 공유할 수 있는 통합 생산성 스튜디오를 제공합니다.

### 🎯 핵심 성공 지표 (KPIs)
* **W1 기능 활성 사용자(WAU):** 15,000+ 유저
* **문서 내보내기/복사 전환율:** 42% 이상 달성
* **로컬 렌더링 지연시간(Latency):** \`< 16ms\` (60fps 유지)

---

## 2. 주요 기능 요구사항 (Functional Requirements)

| 우선순위 | 기능명 | 세부 설명 | 대상 플랫폼 |
| :--- | :--- | :--- | :--- |
| **P0 (필수)** | LaTeX 수식 렌더러 | KaTeX 기반 실시간 수식 미리보기 및 10종 공식 템플릿 | Web / Tablet |
| **P0 (필수)** | 인터랙티브 차트 | Line, Bar, Donut, Radar 등 실시간 데이터 수정 및 렌더링 | Web / Mobile |
| **P1 (높음)** | 데이터베이스 ERD | 테이블/컬럼/외래키 시각화 및 DDL SQL 자동 생성 | Web |
| **P1 (높음)** | 마크다운 에디터 | 실시간 GFM 파싱, 표/체크리스트/코드 하이라이트 | All Devices |

---

## 3. 유저 스토리 & 시나리오 (User Stories)
\`\`\`text
[시나리오 1: 개발자 & 데이터 엔지니어]
사용자는 ERD 탭에서 '이커머스 쇼핑몰' 템플릿을 불러와 신규 결제 테이블을 추가한 뒤,
[SQL DDL 생성] 버튼을 눌러 PostgreSQL CREATE TABLE 문을 1초 만에 복사하여 배포한다.
\`\`\`

---

## 4. 체크리스트 & 마일스톤 (Action Items)
- [x] 수식 기호 빠른 삽입 툴바 UI 구현
- [x] ApexCharts 반응형 캔버스 바인딩
- [x] ERD 외래키 관계선 SVG 렌더러 최적화
- [ ] PDF 및 고해상도 SVG 일괄 내보내기 연동
`,
  },
  {
    id: 'api-spec-template',
    title: 'RESTful API 명세서 (API Specification)',
    category: 'api',
    categoryLabel: 'API 명세',
    description: '백엔드/프론트엔드 통신을 위한 엔드포인트, 요청/응답 헤더 및 JSON 스키마 명세서',
    content: `# 🚀 Ultra Office API Documentation

> **Base URL:** \`https://api.ultraoffice.io/v1\`  
> **인증 방식:** \`Bearer JWT Token\` in \`Authorization\` Header

---

## 1. 다이어그램 & 문서 저장 API

### \`POST /api/v1/diagrams/save\`
다이어그램(ERD, 수식, 그래프 데이터)을 서버 및 로컬 IndexedDB에 저장합니다.

#### Request Headers
\`\`\`http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### Request Body
\`\`\`json
{
  "title": "2026 이커머스 핵심 DB 스키마",
  "category": "erd",
  "data": {
    "tablesCount": 6,
    "relationsCount": 5,
    "version": "2.4.0"
  },
  "isPublic": false
}
\`\`\`

#### Response Examples

##### \`201 Created\` - 성공
\`\`\`json
{
  "success": true,
  "code": 201,
  "message": "다이어그램이 성공적으로 생성되었습니다.",
  "data": {
    "diagramId": "diag_8f93a1bc4e",
    "updatedAt": "2026-08-20T10:00:00Z"
  }
}
\`\`\`

##### \`400 Bad Request\` - 유효성 실패
\`\`\`json
{
  "success": false,
  "code": 400,
  "error": "INVALID_SCHEMA",
  "message": "테이블 이름은 영문, 숫자 및 언더스코어만 허용됩니다."
}
\`\`\`
`,
  },
  {
    id: 'sprint-meeting-template',
    title: '주간 스프린트 회의록 (Sprint Meeting Notes)',
    category: 'meeting',
    categoryLabel: '회의록',
    description: '스프린트 리뷰, 회고(KPT), 팀별 진척도 및 금주 Action Item을 기록하는 템플릿',
    content: `# 📋 Sprint 24 주간 리뷰 및 회고록

* **일시:** 2026년 8월 20일 (목) 10:00 ~ 11:30
* **참석자:** 김대표(CEO), 이수석(CTO), 박책임(Frontend), 최선임(Backend), 강팀장(PM)
* **장소:** 대회의실 A 및 Google Meet 화상 회의

---

## 1. 스프린트 목표 달성 현황 (Goal Review)
* **전체 목표 달성률:** \`94.2%\` (총 36개 태스크 중 34개 완료)
* 🌟 **주요 성과:**
  * 수식, 그래프, 마크다운, ERD 작성 스튜디오 런칭 완료
  * IndexedDB 로컬 암호화 저장소 용량 100MB 확장 지원

---

## 2. KPT 회고 (Keep - Problem - Try)

### 🟢 Keep (잘해서 지속할 점)
1. **타입 안전성 강화:** Strict Mode 및 엄격한 인터페이스 정의로 런타임 렌더 오류 제로 달성
2. **반응형 뷰포트:** 모바일 및 데스크톱 전 구간에서 스크롤 꼬임 없이 부드러운 UX 제공

### 🔴 Problem (아쉬웠던 점 & 병목)
1. 대용량 엑셀(10만 행 이상) 파싱 시 메인 스레드 렌더링 딜레이 발생

### 🔵 Try (다음 스프린트에 시도할 점)
1. Web Worker를 활용한 백그라운드 데이터 파싱 및 가상 스크롤 고도화
2. 원클릭 클립보드 복사 피드백 토스트 애니메이션 개선

---

## 3. 금주 Action Items (To-Do List)
- [ ] **[박책임]** 수식 기호 팔레트 다국어 툴팁 추가 (\`~ 8/22\`)
- [ ] **[최선임]** ERD DDL 생성기 SQLite 호환 구문 테스트 (\`~ 8/23\`)
- [ ] **[강팀장]** 신규 유저 온보딩 튜토리얼 툴팁 기획 (\`~ 8/24\`)
`,
  },
  {
    id: 'readme-template',
    title: '오픈소스 프로젝트 README 템플릿',
    category: 'readme',
    categoryLabel: 'README',
    description: 'GitHub 오픈소스 프로젝트를 위한 배지, 아키텍처 다이어그램, 설치 및 시작 가이드',
    content: `# ⚡ Ultra Office: All-in-One Local Productivity Suite

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)

> **브라우저만 있으면 어디서나 동작하는 강력한 100% 로컬 보안 오피스 & 개발자 도구 툴킷**

---

## ✨ 핵심 기능 (Features)

* 📐 **수식 & LaTeX 스튜디오:** KaTeX 기반 10종 수학/물리/AI 공식 렌더러 및 빠른 심볼 팔레트
* 📊 **인터랙티브 그래프:** ApexCharts 기반 6종 비즈니스 차트 및 실시간 데이터 시각화
* 🗄️ **데이터베이스 ERD:** 테이블 관계선(1:1, 1:N) 시각화 및 PostgreSQL/MySQL DDL 생성
* 📝 **마크다운 에디터:** 실시간 분할 뷰, GFM 테이블, 구문 강조 및 .md 다운로드

---

## 🛠️ 빠른 시작 (Quick Start)

\`\`\`bash
# 1. 저장소 복제
git clone https://github.com/ultra-office/suite.git

# 2. 의존성 설치
yarn install

# 3. 개발 서버 실행 (Port 8083)
yarn dev
\`\`\`

---

## 📄 라이선스 (License)
본 프로젝트는 **MIT License**에 따라 자유롭게 사용 및 배포할 수 있습니다.
`,
  },
  {
    id: 'incident-postmortem-template',
    title: '장애 분석 & 포스트모텀 리포트 (Postmortem)',
    category: 'incident',
    categoryLabel: '장애 리포트',
    description: '서비스 장애 발생 시 원인 분석, 타임라인, 긴급 조치 및 재발 방지 대책 리포트',
    content: `# 🚨 장애 분석 및 포스트모텀 (Postmortem Report)

| 항목 | 내용 |
| :--- | :--- |
| **장애 일시** | 2026-08-18 14:20 ~ 14:48 KST (총 28분간) |
| **영향 범위** | 결제 게이트웨이 웹훅 응답 지연 (전체 결제의 약 4.2%) |
| **장애 등급** | **P1 (Critical)** |
| **작성자** | 인프라 운영팀 & 백엔드 리드 |

---

## 1. 사건 개요 및 영향 (Summary & Impact)
* **증상:** 결제 승인 후 PG사 웹훅 처리가 타임아웃(HTTP 504)되면서 주문 완료 상태 전이가 지연됨.
* **사용자 영향:** 128건의 주문에서 "결제 진행 중" 화면이 1분 이상 지속됨. (금전적 유실 0건)

---

## 2. 타임라인 (Timeline)
* **14:20:** 프로모션 이벤트 시작 직후 DB 커넥션 풀 사용률 98% 도달
* **14:24:** Slack 장애 알림봇 \`#incident-p1\` 채널 경보 발송
* **14:32:** DB Read Replica 커넥션 풀 2배 증설 및 슬로우 쿼리 긴급 킬
* **14:45:** 웹훅 큐 적체 해소 및 응답 지연시간 24ms로 정상화
* **14:48:** 상황 종료 및 모니터링 모드 전환

---

## 3. 근본 원인 분석 (Root Cause - 5 Whys)
1. **왜 지연되었는가?** -> 주문 조회 시 \`order_items\` 인덱스 미적용으로 Full Table Scan 발생
2. **왜 인덱스가 없었는가?** -> 지난주 릴리즈된 결제 로그 테이블 DDL 마이그레이션 누락

---

## 4. 재발 방지 대책 (Preventive Action Items)
- [x] **[완료]** \`order_items\` 복합 인덱스 긴급 적용
- [ ] **[진행중]** CI/CD 파이프라인에 DDL 인덱스 자동 검증 린터 추가 (\`~ 8/25\`)
- [ ] **[예정]** 대규모 트래픽 부하 테스트 시나리오 자동화 (\`~ 8/30\`)
`,
  },
];

// ----------------------------------------------------------------------
// 4. ERD Schemas (실전 데이터베이스 ERD 예시 4종)
// ----------------------------------------------------------------------
export const ERD_SCHEMAS: ErdSchema[] = [
  {
    id: 'ecommerce-db',
    title: '이커머스 쇼핑몰 데이터베이스 (E-Commerce System)',
    description:
      '회원(Users), 상품(Products), 카테고리(Categories), 주문(Orders), 주문상세(Order_Items), 결제(Payments) 6개 핵심 테이블',
    tables: [
      {
        id: 'users',
        name: 'users',
        comment: '회원 기본 정보',
        color: '#1976d2',
        x: 40,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '회원 고유 PK' },
          { name: 'email', type: 'VARCHAR(120)', isUnique: true, comment: '로그인 이메일' },
          { name: 'password_hash', type: 'VARCHAR(255)', comment: '비밀번호 해시' },
          { name: 'name', type: 'VARCHAR(50)', comment: '회원명' },
          { name: 'phone', type: 'VARCHAR(20)', nullable: true, comment: '휴대폰 번호' },
          { name: 'status', type: 'VARCHAR(20)', comment: 'ACTIVE, SUSPENDED' },
          { name: 'created_at', type: 'TIMESTAMP', comment: '가입 일시' },
        ],
      },
      {
        id: 'orders',
        name: 'orders',
        comment: '주문 마스터',
        color: '#2e7d32',
        x: 320,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '주문 고유 번호' },
          {
            name: 'user_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'users.id',
            comment: '주문자 ID',
          },
          { name: 'order_number', type: 'VARCHAR(64)', isUnique: true, comment: '주문 식별 코드' },
          { name: 'total_amount', type: 'DECIMAL(12,2)', comment: '총 주문 금액' },
          { name: 'discount_amount', type: 'DECIMAL(12,2)', comment: '할인 금액' },
          { name: 'status', type: 'VARCHAR(30)', comment: 'PENDING, PAID, SHIPPED' },
          { name: 'ordered_at', type: 'TIMESTAMP', comment: '주문 일시' },
        ],
      },
      {
        id: 'order_items',
        name: 'order_items',
        comment: '주문 상품 상세 품목',
        color: '#ed6c02',
        x: 600,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '품목 고유 PK' },
          {
            name: 'order_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'orders.id',
            comment: '소속 주문 ID',
          },
          {
            name: 'product_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'products.id',
            comment: '주문 상품 ID',
          },
          { name: 'unit_price', type: 'DECIMAL(12,2)', comment: '결제 단가' },
          { name: 'quantity', type: 'INT', comment: '주문 수량' },
          { name: 'subtotal', type: 'DECIMAL(12,2)', comment: '소계 금액' },
        ],
      },
      {
        id: 'products',
        name: 'products',
        comment: '상품 카탈로그',
        color: '#9c27b0',
        x: 600,
        y: 340,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '상품 고유 PK' },
          {
            name: 'category_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'categories.id',
            comment: '카테고리 ID',
          },
          { name: 'name', type: 'VARCHAR(150)', comment: '상품명' },
          { name: 'price', type: 'DECIMAL(12,2)', comment: '정상 판매가' },
          { name: 'stock_quantity', type: 'INT', comment: '현재 재고수량' },
          { name: 'is_active', type: 'BOOLEAN', comment: '판매 여부' },
          { name: 'created_at', type: 'TIMESTAMP', comment: '등록 일시' },
        ],
      },
      {
        id: 'categories',
        name: 'categories',
        comment: '상품 분류 카테고리',
        color: '#0288d1',
        x: 880,
        y: 340,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '카테고리 ID' },
          {
            name: 'parent_id',
            type: 'BIGINT',
            isFk: true,
            nullable: true,
            fkTarget: 'categories.id',
            comment: '상위 분류',
          },
          { name: 'name', type: 'VARCHAR(80)', comment: '분류명' },
          { name: 'depth', type: 'INT', comment: '계층 깊이 (1~3)' },
        ],
      },
      {
        id: 'payments',
        name: 'payments',
        comment: '결제 내역 및 트랜잭션',
        color: '#d32f2f',
        x: 320,
        y: 360,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '결제 고유 ID' },
          {
            name: 'order_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'orders.id',
            comment: '결제 대상 주문 ID',
          },
          { name: 'pg_provider', type: 'VARCHAR(30)', comment: 'TOSS, KAKAO, STRIPE' },
          { name: 'payment_key', type: 'VARCHAR(128)', isUnique: true, comment: 'PG 승인 키' },
          { name: 'amount', type: 'DECIMAL(12,2)', comment: '실결제 승인 금액' },
          { name: 'paid_at', type: 'TIMESTAMP', comment: '결제 승인 일시' },
        ],
      },
    ],
    relations: [
      { fromTable: 'users', fromColumn: 'id', toTable: 'orders', toColumn: 'user_id', type: '1:N' },
      {
        fromTable: 'orders',
        fromColumn: 'id',
        toTable: 'order_items',
        toColumn: 'order_id',
        type: '1:N',
      },
      {
        fromTable: 'products',
        fromColumn: 'id',
        toTable: 'order_items',
        toColumn: 'product_id',
        type: '1:N',
      },
      {
        fromTable: 'categories',
        fromColumn: 'id',
        toTable: 'products',
        toColumn: 'category_id',
        type: '1:N',
      },
      {
        fromTable: 'orders',
        fromColumn: 'id',
        toTable: 'payments',
        toColumn: 'order_id',
        type: '1:1',
      },
    ],
  },
  {
    id: 'saas-workspace-db',
    title: 'SaaS 협업툴 & 권한 관리 시스템 (SaaS Workspace & RBAC)',
    description:
      '워크스페이스(Workspaces), 회원(Users), 멤버십/역할(Workspace_Members, Roles), 프로젝트(Projects), 업무(Tasks)',
    tables: [
      {
        id: 'workspaces',
        name: 'workspaces',
        comment: '회사 및 팀 워크스페이스',
        color: '#6366f1',
        x: 40,
        y: 40,
        columns: [
          { name: 'id', type: 'UUID', isPk: true, comment: '워크스페이스 고유 식별자' },
          { name: 'slug', type: 'VARCHAR(50)', isUnique: true, comment: 'URL 슬러그' },
          { name: 'name', type: 'VARCHAR(100)', comment: '워크스페이스명' },
          { name: 'plan_type', type: 'VARCHAR(20)', comment: 'FREE, PRO, ENTERPRISE' },
          { name: 'created_at', type: 'TIMESTAMP', comment: '개설 일시' },
        ],
      },
      {
        id: 'workspace_members',
        name: 'workspace_members',
        comment: '워크스페이스 소속 구성원 매핑',
        color: '#3b82f6',
        x: 320,
        y: 40,
        columns: [
          { name: 'id', type: 'UUID', isPk: true, comment: '멤버십 ID' },
          {
            name: 'workspace_id',
            type: 'UUID',
            isFk: true,
            fkTarget: 'workspaces.id',
            comment: '워크스페이스 ID',
          },
          { name: 'user_id', type: 'UUID', isFk: true, fkTarget: 'users.id', comment: '회원 ID' },
          {
            name: 'role_id',
            type: 'VARCHAR(30)',
            isFk: true,
            fkTarget: 'roles.id',
            comment: '부여된 역할',
          },
          { name: 'joined_at', type: 'TIMESTAMP', comment: '참여 일시' },
        ],
      },
      {
        id: 'roles',
        name: 'roles',
        comment: 'RBAC 역할 및 권한 정의',
        color: '#14b8a6',
        x: 320,
        y: 320,
        columns: [
          { name: 'id', type: 'VARCHAR(30)', isPk: true, comment: 'OWNER, ADMIN, MEMBER, VIEWER' },
          { name: 'name', type: 'VARCHAR(50)', comment: '역할 이름' },
          { name: 'permissions', type: 'JSONB', comment: '세부 권한 플래그 JSON' },
        ],
      },
      {
        id: 'projects',
        name: 'projects',
        comment: '워크스페이스 내 프로젝트 단위',
        color: '#f59e0b',
        x: 600,
        y: 40,
        columns: [
          { name: 'id', type: 'UUID', isPk: true, comment: '프로젝트 ID' },
          {
            name: 'workspace_id',
            type: 'UUID',
            isFk: true,
            fkTarget: 'workspaces.id',
            comment: '소속 워크스페이스',
          },
          { name: 'name', type: 'VARCHAR(120)', comment: '프로젝트명' },
          { name: 'is_private', type: 'BOOLEAN', comment: '비공개 여부' },
          { name: 'created_at', type: 'TIMESTAMP', comment: '생성 일시' },
        ],
      },
      {
        id: 'tasks',
        name: 'tasks',
        comment: '칸반 및 업무 태스크',
        color: '#ec4899',
        x: 880,
        y: 40,
        columns: [
          { name: 'id', type: 'UUID', isPk: true, comment: '태스크 고유 ID' },
          {
            name: 'project_id',
            type: 'UUID',
            isFk: true,
            fkTarget: 'projects.id',
            comment: '소속 프로젝트',
          },
          {
            name: 'assignee_id',
            type: 'UUID',
            isFk: true,
            nullable: true,
            fkTarget: 'users.id',
            comment: '담당자 ID',
          },
          { name: 'title', type: 'VARCHAR(255)', comment: '업무 제목' },
          { name: 'priority', type: 'VARCHAR(20)', comment: 'LOW, MEDIUM, HIGH, URGENT' },
          { name: 'status', type: 'VARCHAR(30)', comment: 'TODO, IN_PROGRESS, DONE' },
          { name: 'due_date', type: 'DATE', nullable: true, comment: '마감 기한' },
        ],
      },
    ],
    relations: [
      {
        fromTable: 'workspaces',
        fromColumn: 'id',
        toTable: 'workspace_members',
        toColumn: 'workspace_id',
        type: '1:N',
      },
      {
        fromTable: 'roles',
        fromColumn: 'id',
        toTable: 'workspace_members',
        toColumn: 'role_id',
        type: '1:N',
      },
      {
        fromTable: 'workspaces',
        fromColumn: 'id',
        toTable: 'projects',
        toColumn: 'workspace_id',
        type: '1:N',
      },
      {
        fromTable: 'projects',
        fromColumn: 'id',
        toTable: 'tasks',
        toColumn: 'project_id',
        type: '1:N',
      },
    ],
  },
  {
    id: 'community-db',
    title: '블로그 & SNS 커뮤니티 데이터베이스 (Community Platform)',
    description:
      '작성자(Users), 게시글(Posts), 댓글(Comments), 태그(Tags), 매핑(Post_Tags), 좋아요(Likes)',
    tables: [
      {
        id: 'users',
        name: 'users',
        comment: '커뮤니티 회원',
        color: '#2563eb',
        x: 40,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '회원 PK' },
          { name: 'handle', type: 'VARCHAR(40)', isUnique: true, comment: '@사용자핸들' },
          { name: 'nickname', type: 'VARCHAR(50)', comment: '프로필 닉네임' },
          { name: 'avatar_url', type: 'VARCHAR(255)', nullable: true, comment: '프로필 이미지' },
          { name: 'reputation', type: 'INT', comment: '활동 평판 점수' },
        ],
      },
      {
        id: 'posts',
        name: 'posts',
        comment: '게시글 / 아티클 본문',
        color: '#059669',
        x: 340,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '게시글 ID' },
          {
            name: 'author_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'users.id',
            comment: '작성자 ID',
          },
          { name: 'title', type: 'VARCHAR(200)', comment: '글 제목' },
          { name: 'content', type: 'LONGTEXT', comment: '마크다운 본문' },
          { name: 'view_count', type: 'INT', comment: '조회수' },
          { name: 'published_at', type: 'TIMESTAMP', comment: '발행 일시' },
        ],
      },
      {
        id: 'comments',
        name: 'comments',
        comment: '게시글 계층형 댓글',
        color: '#d97706',
        x: 640,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '댓글 ID' },
          {
            name: 'post_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'posts.id',
            comment: '소속 게시글 ID',
          },
          {
            name: 'author_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'users.id',
            comment: '댓글 작성자 ID',
          },
          {
            name: 'parent_id',
            type: 'BIGINT',
            isFk: true,
            nullable: true,
            fkTarget: 'comments.id',
            comment: '대댓글 부모 ID',
          },
          { name: 'body', type: 'TEXT', comment: '댓글 내용' },
          { name: 'created_at', type: 'TIMESTAMP', comment: '작성 일시' },
        ],
      },
      {
        id: 'tags',
        name: 'tags',
        comment: '해시태그 메타데이터',
        color: '#8b5cf6',
        x: 340,
        y: 350,
        columns: [
          { name: 'id', type: 'INT', isPk: true, comment: '태그 ID' },
          { name: 'name', type: 'VARCHAR(40)', isUnique: true, comment: '태그 키워드' },
          { name: 'post_count', type: 'INT', comment: '태그된 글 수' },
        ],
      },
      {
        id: 'post_tags',
        name: 'post_tags',
        comment: '게시글-태그 N:M 매핑 테이블',
        color: '#6b7280',
        x: 640,
        y: 350,
        columns: [
          {
            name: 'post_id',
            type: 'BIGINT',
            isPk: true,
            isFk: true,
            fkTarget: 'posts.id',
            comment: '게시글 ID',
          },
          {
            name: 'tag_id',
            type: 'INT',
            isPk: true,
            isFk: true,
            fkTarget: 'tags.id',
            comment: '태그 ID',
          },
        ],
      },
    ],
    relations: [
      {
        fromTable: 'users',
        fromColumn: 'id',
        toTable: 'posts',
        toColumn: 'author_id',
        type: '1:N',
      },
      {
        fromTable: 'posts',
        fromColumn: 'id',
        toTable: 'comments',
        toColumn: 'post_id',
        type: '1:N',
      },
      {
        fromTable: 'users',
        fromColumn: 'id',
        toTable: 'comments',
        toColumn: 'author_id',
        type: '1:N',
      },
      {
        fromTable: 'posts',
        fromColumn: 'id',
        toTable: 'post_tags',
        toColumn: 'post_id',
        type: '1:N',
      },
      {
        fromTable: 'tags',
        fromColumn: 'id',
        toTable: 'post_tags',
        toColumn: 'tag_id',
        type: '1:N',
      },
    ],
  },
  {
    id: 'hr-payroll-db',
    title: '사내 인사 & 근태/급여 관리 시스템 (HR & Payroll DB)',
    description:
      '임직원(Employees), 부서(Departments), 직급(Positions), 출퇴근(Attendance), 휴가(Leaves), 급여(Payrolls)',
    tables: [
      {
        id: 'departments',
        name: 'departments',
        comment: '조직 부서',
        color: '#0891b2',
        x: 40,
        y: 40,
        columns: [
          { name: 'id', type: 'INT', isPk: true, comment: '부서 코드' },
          { name: 'name', type: 'VARCHAR(60)', comment: '부서명' },
          { name: 'manager_id', type: 'BIGINT', nullable: true, comment: '부서장 사번' },
        ],
      },
      {
        id: 'employees',
        name: 'employees',
        comment: '임직원 인사 마스터',
        color: '#4f46e5',
        x: 340,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '사원 번호 (사번)' },
          {
            name: 'dept_id',
            type: 'INT',
            isFk: true,
            fkTarget: 'departments.id',
            comment: '소속 부서',
          },
          { name: 'name', type: 'VARCHAR(40)', comment: '성명' },
          { name: 'position', type: 'VARCHAR(40)', comment: '직급 / 직책' },
          { name: 'hire_date', type: 'DATE', comment: '입사일자' },
          { name: 'status', type: 'VARCHAR(20)', comment: 'EMPLOYED, LEAVE, RESIGNED' },
        ],
      },
      {
        id: 'attendance',
        name: 'attendance',
        comment: '일별 출퇴근 기록',
        color: '#16a34a',
        x: 660,
        y: 40,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '근태 기록 PK' },
          {
            name: 'employee_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'employees.id',
            comment: '사번',
          },
          { name: 'work_date', type: 'DATE', comment: '근무 일자' },
          { name: 'check_in', type: 'TIME', comment: '출근 시간' },
          { name: 'check_out', type: 'TIME', nullable: true, comment: '퇴근 시간' },
          { name: 'overtime_hours', type: 'DECIMAL(4,2)', comment: '연장 근무시간' },
        ],
      },
      {
        id: 'leaves',
        name: 'leaves',
        comment: '연차 및 휴가 신청 내역',
        color: '#ea580c',
        x: 340,
        y: 340,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '휴가 신청 ID' },
          {
            name: 'employee_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'employees.id',
            comment: '신청자 사번',
          },
          { name: 'leave_type', type: 'VARCHAR(30)', comment: 'ANNUAL, SICK, HALF' },
          { name: 'start_date', type: 'DATE', comment: '시작일' },
          { name: 'end_date', type: 'DATE', comment: '종료일' },
          { name: 'status', type: 'VARCHAR(20)', comment: 'PENDING, APPROVED, REJECTED' },
        ],
      },
      {
        id: 'payrolls',
        name: 'payrolls',
        comment: '월별 급여 명세 및 정산',
        color: '#dc2626',
        x: 660,
        y: 340,
        columns: [
          { name: 'id', type: 'BIGINT', isPk: true, comment: '급여 정산 PK' },
          {
            name: 'employee_id',
            type: 'BIGINT',
            isFk: true,
            fkTarget: 'employees.id',
            comment: '지급 대상 사번',
          },
          { name: 'pay_month', type: 'CHAR(7)', comment: '귀속 연월 (YYYY-MM)' },
          { name: 'base_salary', type: 'DECIMAL(12,2)', comment: '기본급' },
          { name: 'tax_deduction', type: 'DECIMAL(12,2)', comment: '4대보험 및 세금 공제액' },
          { name: 'net_pay', type: 'DECIMAL(12,2)', comment: '실 수령액' },
        ],
      },
    ],
    relations: [
      {
        fromTable: 'departments',
        fromColumn: 'id',
        toTable: 'employees',
        toColumn: 'dept_id',
        type: '1:N',
      },
      {
        fromTable: 'employees',
        fromColumn: 'id',
        toTable: 'attendance',
        toColumn: 'employee_id',
        type: '1:N',
      },
      {
        fromTable: 'employees',
        fromColumn: 'id',
        toTable: 'leaves',
        toColumn: 'employee_id',
        type: '1:N',
      },
      {
        fromTable: 'employees',
        fromColumn: 'id',
        toTable: 'payrolls',
        toColumn: 'employee_id',
        type: '1:N',
      },
    ],
  },
];
