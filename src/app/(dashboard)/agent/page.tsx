import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AgentView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `사내 에이전트 | AI 어시스턴트 - ${CONFIG.appName}`,
  description: '사내 업무 자동화 및 인재/인사 평가 추천 AI 에이전트',
};

export default function Page() {
  return <AgentView />;
}
