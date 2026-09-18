import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PushPushView } from 'src/sections/game/push-push/view';

export const metadata: Metadata = { title: `푸시푸시 (Push Push) | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PushPushView />;
}
