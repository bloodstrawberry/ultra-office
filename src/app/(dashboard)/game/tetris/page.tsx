import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TetrisView } from 'src/sections/game/tetris/view';

export const metadata: Metadata = { title: `테트리스 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TetrisView />;
}
