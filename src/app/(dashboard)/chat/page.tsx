import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ChatMessengerView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `채팅방 목업 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ChatMessengerView />;
}
