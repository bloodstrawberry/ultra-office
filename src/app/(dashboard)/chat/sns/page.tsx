import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ChatSnsView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `SNS DM 목업 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ChatSnsView />;
}
