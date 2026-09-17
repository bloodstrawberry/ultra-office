import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VeryHardPuzzleView } from 'src/sections/game/very-hard-puzzle/view';

export const metadata: Metadata = { title: `베리 하드 퍼즐 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VeryHardPuzzleView />;
}
