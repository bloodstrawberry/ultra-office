import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StackGameView } from 'src/sections/game/stack/view';

export const metadata: Metadata = { title: `스택 게임 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StackGameView />;
}
