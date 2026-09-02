import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ChatLlmView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `LLM 프롬프트 대화 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ChatLlmView />;
}
