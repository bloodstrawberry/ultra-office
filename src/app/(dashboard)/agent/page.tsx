import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AiAgentView } from 'src/sections/agent/view';

export const metadata: Metadata = { title: `AI Agent 스위트 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AiAgentView />;
}
