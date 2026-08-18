export type AgentQueryMode = 'regulation' | 'personnel' | 'talent' | 'report';

export interface AgentCitation {
  id: string;
  source: string;
  section: string;
  title: string;
  content: string;
}

export interface TalentCandidate {
  id: string;
  name: string;
  title: string;
  department: string;
  experience: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  domain: 'AI / Agentic' | '반도체 / AP' | '로봇 / 피지컬 AI';
  marketDemand: string;
  compensationDiagnosis: string;
  retentionRecommendation: string;
  evalHistory: Array<{ year: string; grade: string }>;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AgentQueryMode;
  createdAt: string;
  citations?: AgentCitation[];
  candidates?: TalentCandidate[];
  reportMarkdown?: string;
}

export interface AgentSession {
  id: string;
  title: string;
  mode: AgentQueryMode;
  createdAt: string;
  updatedAt: string;
  messages: AgentChatMessage[];
}

export interface ScenarioPrompt {
  id: string;
  mode: AgentQueryMode;
  title: string;
  badge: string;
  prompt: string;
}

export const SCENARIO_PROMPTS: ScenarioPrompt[] = [
  // 1. 규정 질의
  {
    id: 'reg-travel',
    mode: 'regulation',
    title: '해외 출장 여비 및 일비 정산 규정',
    badge: '복리후생/여비',
    prompt:
      '미국/유럽 해외 출장 시 숙박비 한도와 일비(식대/잡비) 지급 기준 및 영수증 증빙 요건을 정리해 줘.',
  },
  {
    id: 'reg-leave',
    mode: 'regulation',
    title: '연차 유급휴가 및 특별 경조사 휴가',
    badge: '취업규칙',
    prompt:
      '근속연수별 연차 발생 기준과 본인/가족 경조사 시 유급 휴가 일수 및 신청 기한 규정을 알려줘.',
  },
  {
    id: 'reg-security',
    mode: 'regulation',
    title: '생성형 AI 사내 활용 보안 지침',
    badge: '보안가이드',
    prompt:
      '임직원이 업무 중 ChatGPT/Claude 등 외부 생성형 AI 서비스를 활용할 때 지켜야 할 사내 정보보안 가이드라인을 요약해 줘.',
  },

  // 2. 인사 질의
  {
    id: 'hr-stats',
    mode: 'personnel',
    title: '2026년 본부별 인원 통계 및 직급 분포',
    badge: '조직현황',
    prompt:
      '현재 플랫폼개발본부, 글로벌사업본부, 경영지원본부의 인원 수 및 수석/책임/선임 연구원 직급 분포를 분석해 줘.',
  },
  {
    id: 'hr-eval',
    mode: 'personnel',
    title: '최근 3개년 고성과자(S/A등급) 비율 현황',
    badge: '인사평가',
    prompt: '최근 3개년 부서별 S/A 등급 획득 비율과 승진 가점 대상자 현황을 요약 정리해 줘.',
  },

  // 3. 인재 진단
  {
    id: 'talent-retention',
    mode: 'talent',
    title: '미래 성장동력(AI·반도체·로봇) 핵심인재 리텐션 진단',
    badge: '선제적 리텐션',
    prompt:
      '회사의 미래 성장 동력 사업(AI, 반도체, 로봇)을 이끄는 핵심 리더 중 대외 경쟁 환경 및 처우 경쟁력을 고려하여 선제적 리텐션 조치가 필요한 대상자를 분석해 줘.',
  },
  {
    id: 'talent-ai-leader',
    mode: 'talent',
    title: 'Agentic AI 및 온디바이스 AI 리더 역량 분석',
    badge: 'AI 리더십',
    prompt:
      'On-Device 및 Agentic AI 최적화를 주도하는 개발 리더의 시장 가치와 이탈 방지 방안을 진단해 줘.',
  },

  // 4. 보고서 작성
  {
    id: 'rep-strategy',
    mode: 'report',
    title: '2026 하반기 전사 AI 트랜스포메이션 추진 전략 보고서',
    badge: '경영전략',
    prompt:
      '전사 업무 생산성 혁신을 위한 AI 도구 도입 및 조직 개편 추진 전략 보고서(배경, 핵심과제, 로드맵, 기대효과)를 작성해 줘.',
  },
  {
    id: 'rep-retention-pkg',
    mode: 'report',
    title: '핵심 R&D 인재 장기근속 보상 패키지(LTI) 기안서',
    badge: '인사제도 기안',
    prompt:
      '글로벌 빅테크 스카우트에 대응하기 위한 R&D 핵심 리더 대상 양도제한조건부주식(RSU) 및 장기인센티브(LTI) 제도 도입 기안서를 작성해 줘.',
  },
];

export const TALENT_PRESETS: TalentCandidate[] = [
  {
    id: 'cand-01',
    name: '이종석 수석',
    title: 'AP Solution 설계개발팀장',
    department: '반도체/MX 솔루션개발실',
    experience: 'Apple Silicon AP 설계 리드 출신 (경력 14년)',
    riskLevel: 'HIGH',
    domain: '반도체 / AP',
    marketDemand: '글로벌 빅테크(Apple, Meta, Qualcomm)의 자체 AI 칩셋 설계 리더 스카우트 상시화',
    compensationDiagnosis:
      '외부 시장 연봉 대비 약 25% 낮게 형성. 비LTI 구간으로 전직 시 기술 유출 리스크 극대',
    retentionRecommendation: 'MX 개발실 내 역할 확대 및 상무 승진 조기 검토, 특화 RSU 패키지 지급',
    evalHistory: [
      { year: '2023', grade: 'S (우수)' },
      { year: '2024', grade: 'S (우수)' },
      { year: '2025', grade: 'S (우수)' },
    ],
  },
  {
    id: 'cand-02',
    name: '고현목 책임',
    title: 'Agentic AI 최적화팀장',
    department: 'AI Research 센터',
    experience: '글로벌 Top-tier AI Lab 출신, On-Device 경량화 특허 12건',
    riskLevel: 'HIGH',
    domain: 'AI / Agentic',
    marketDemand: 'AI 스타트업 및 유니콘 기업의 파격적 스톡옵션 오퍼 집중',
    compensationDiagnosis: '업계 Top 개발자 대비 기본급 격차 존재. 프로젝트 인센티브 상한 도달',
    retentionRecommendation: '독립 연구 랩 디렉터 권한 부여 및 특허 마일스톤 특별 성과급 체계 도입',
    evalHistory: [
      { year: '2023', grade: 'A (양호)' },
      { year: '2024', grade: 'S (우수)' },
      { year: '2025', grade: 'S (우수)' },
    ],
  },
  {
    id: 'cand-03',
    name: '최고은 책임',
    title: 'Robotics Platform 그룹장',
    department: '로보틱스 사업추진실',
    experience: '휴머노이드 로봇 관절제어 및 SLAM 자율주행 권위자',
    riskLevel: 'MEDIUM',
    domain: '로봇 / 피지컬 AI',
    marketDemand: '완성차 및 로봇 제조업계의 플랫폼 총괄 영입 경쟁',
    compensationDiagnosis:
      '차세대 리더로 조직 의존도가 매우 높으나 직급 대비 처우 역전 현상 발생 가능성',
    retentionRecommendation:
      '차세대 리더 트랙 지정, 해외 학회 및 산학 협력 프로젝트 총괄 리드 배정',
    evalHistory: [
      { year: '2023', grade: 'A (양호)' },
      { year: '2024', grade: 'A (양호)' },
      { year: '2025', grade: 'S (우수)' },
    ],
  },
];

/**
 * Generate intelligent mock response with citations and rich data
 */
export function generateAgentResponse(
  prompt: string,
  mode: AgentQueryMode
): {
  content: string;
  citations?: AgentCitation[];
  candidates?: TalentCandidate[];
  reportMarkdown?: string;
} {
  const lower = prompt.toLowerCase();

  // 1. Talent Search Scenario
  if (
    mode === 'talent' ||
    lower.includes('리텐션') ||
    lower.includes('인재') ||
    lower.includes('성장동력')
  ) {
    return {
      content: `**회사의 미래 성장 동력 사업(AI · 반도체 · 로봇)**을 이끄는 핵심 리더 중, 대외 경쟁 환경과 처우 경쟁력을 종합 진단하여 **선제적 리텐션이 필요한 핵심 인재 3명**을 도출했습니다.\n\n### 🌐 대외 경쟁 환경 분석\n- **AI 분야**: 글로벌 빅테크 및 AI 스타트업의 공격적 영입으로 Agentic/On-Device AI 최고급 인력의 몸값이 급등했습니다.\n- **반도체 분야**: 자체 칩셋(NPU/AP)을 내재화하려는 글로벌 팹리스의 핵심 설계자 스카우트가 상시화되었습니다.\n- **로봇 플랫폼**: 휴머노이드 상용화 단계 진입으로 플랫폼 리더 수요가 폭증하고 있습니다.\n\n아래 **후보자 진단 카드**와 권장 리텐션 액션을 확인해 주시기 바랍니다.`,
      candidates: TALENT_PRESETS,
      citations: [
        {
          id: 'cit-1',
          source: '2026 R&D 핵심인재 리텐션 백서',
          section: '제3장 2절',
          title: '글로벌 빅테크 이직 리스크 진단',
          content:
            'Apple, Meta, OpenAI 등 글로벌 기업의 국내 인재 영입 조건이 기본급 30% 이상 인상 및 RSU 지급 형태로 고도화됨.',
        },
        {
          id: 'cit-2',
          source: '사내 임원/핵심인력 처우 규정',
          section: '제12조',
          title: '장기근속 인센티브 및 특화 보상 체계',
          content:
            '전략 사업 분야 핵심 기여자에 대해 CEO 직속 특별 보상 패키지(RSU 및 연구 자율권)를 부여할 수 있음.',
        },
      ],
    };
  }

  // 2. Regulation Scenario
  if (
    mode === 'regulation' ||
    lower.includes('출장') ||
    lower.includes('여비') ||
    lower.includes('연차') ||
    lower.includes('규정')
  ) {
    return {
      content: `요청하신 **사내 규정 및 가이드라인**에 대한 핵심 기준을 정리해 드립니다.\n\n### ✈️ 해외 출장 여비 정산 기준 (여비교통비 규정 제8조)\n1. **숙박비(실비 정산)**: \n   - 미주/서유럽 지역: 1박당 최대 $250 / €230 한도 실비 정산\n   - 아시아/기타 지역: 1박당 최대 $180 한도\n2. **일비 및 식대**: \n   - 1일당 $80 정액 지급 (법인카드 영수증 증빙 불필요, 출장 품의서 기준)\n3. **항공료**: \n   - 비행시간 6시간 이상 출장 시 비즈니스석 업그레이드 지원 (부장/수석급 이상)\n4. **정산 기한**: 출장 종료 후 **7영업일 이내** ERP 전자결재 상신 완료.`,
      citations: [
        {
          id: 'cit-reg-1',
          source: '사내 여비교통비 규정집 (2026년 개정판)',
          section: '제8조 (해외출장비 지급기준)',
          title: '지역별 숙박비 상한액 및 일비 정산 요령',
          content:
            '해외 출장자는 ERP 출장 품의 결재 후 법인카드로 결제하며, 한도 초과 시 사업부장 사전 승인을 득해야 함.',
        },
        {
          id: 'cit-reg-2',
          source: '취업규칙 및 복무규정',
          section: '제24조 (복무 및 여비정산)',
          title: '증빙 서류 제출 의무',
          content:
            '항공권 탑승권(Boarding Pass) 원본 및 호텔 인보이스는 ERP 증빙 시스템에 반드시 첨부하여야 함.',
        },
      ],
    };
  }

  // 3. Report Builder Scenario
  if (mode === 'report' || lower.includes('보고서') || lower.includes('기안')) {
    const reportMd = `# 2026 전사 AI 트랜스포메이션 추진 전략 보고서

**작성일자:** 2026년 08월 18일  
**작성부서:** 디지털혁신전략실 / AI CoE  
**보고대상:** 경영전략위원회

---

## 1. 추진 배경 및 필요성
- 생성형 AI 및 Agentic AI 기술의 급속한 발전으로 업무 생산성 패러다임 전환 가속화
- 사내 분산된 업무 도구(스프레드시트, 데이터 분석, 문서 변환)를 통합하는 **'Ultra-Office'** 지능형 오피스 생태계 구축 필요
- R&D 및 사업 부서의 반복 업무 40% 자동화 및 데이터 기반 의사결정 체계 확립

---

## 2. 3대 핵심 추진 과제

### 과제 1: AI Agent 기반 사내 지식 비서 구축
- 사규, 규정, 인사 정보, 기술 문서를 통합 인덱싱하는 RAG(검색증강생성) 파이프라인 가동
- 전 임직원 1인 1 AI Agent 보급을 통한 업무 검색 시간 60% 단축

### 과제 2: 스마트 데이터 & 포토 스튜디오 워크스테이션 고도화
- 브라우저 내에서 무설치로 구동되는 17종 이미지 가공 및 데이터 포맷 변환 툴셋 제공
- 개인정보(OCR 주민번호, 계좌, 얼굴) 100% 온디바이스 자동 마스킹으로 보안 컴플라이언스 준수

### 과제 3: 핵심 인재 리텐션 및 보상 체계 연계
- AI·반도체·로봇 3대 성장동력 분야 핵심 리더 대상 LTI(장기인센티브) 및 RSU 패키지 신설
- 사내 AI 전문역량 인증제 도입 및 고성과자 패스트트랙 승진 지원

---

## 3. 단계별 추진 로드맵

| 단계 | 기간 | 주요 마일스톤 | 기대 산출물 |
| :--- | :--- | :--- | :--- |
| **1단계: 인프라 구축** | 2026.Q1 ~ Q2 | Ultra-Office 통합 플랫폼 파일럿 런칭 | 사내 6대 핵심 Util 툴셋 오픈 |
| **2단계: 전사 확산** | 2026.Q3 ~ Q4 | 전 사업부 AI 에이전트 연동 및 교육 | 업무 효율성 35% 향상 |
| **3단계: 고도화** | 2027.Q1 ~ | 멀티모달 자율 의사결정 에이전트 도입 | 업무 생산성 글로벌 Top 5% 달성 |

---

## 4. 기대 효과 및 투자 대비 효과 (ROI)
- **정량적 효과**: 연간 120,000시간 업무 절감 (연간 약 60억 원 비용 절감 효과)
- **정성적 효과**: 데이터 기반 신속한 의사결정 체계 확보 및 핵심 R&D 인재 유출 방지`;

    return {
      content: `요청하신 **'2026 전사 AI 트랜스포메이션 추진 전략 보고서'**가 완성되었습니다.\n\n아래 전문을 확인하시고, **'보고서 복사'** 또는 **'마크다운 다운로드'**를 통해 즉시 보고용 자료로 활용하실 수 있습니다.`,
      reportMarkdown: reportMd,
    };
  }

  // 4. General / Personnel Query
  return {
    content: `**[인사 & 조직 분석 결과]**\n\n문의하신 부서별 현황을 분석한 결과는 다음과 같습니다:\n\n1. **플랫폼개발본부**: 총 148명 (수석 18명, 책임 52명, 선임 62명, 사원 16명)\n2. **글로벌사업본부**: 총 85명 (수석 9명, 책임 31명, 선임 35명, 사원 10명)\n3. **경영지원본부**: 총 42명 (수석 4명, 책임 15명, 선임 18명, 사원 5명)\n\n최근 3개년 고성과자(S/A) 비율은 플랫폼개발본부가 42%로 가장 높으며, 차세대 프로젝트 리더 트랙 대상자가 14명 식별되었습니다.`,
    citations: [
      {
        id: 'cit-hr-1',
        source: '2026년 3분기 전사 조직 인원 현황 통계',
        section: '인사기획팀 내부 데이터',
        title: '부서별/직급별 인력 분포표',
        content:
          '2026년 8월 기준 전사 정규직 임직원 수는 총 275명이며 연구개발 직무 비중이 53.8%를 차지함.',
      },
    ],
  };
}
