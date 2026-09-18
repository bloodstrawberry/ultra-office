import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SnakePuzzleView } from 'src/sections/game/snake-puzzle/view';

export const metadata: Metadata = { title: `스네이크 퍼즐 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SnakePuzzleView />;
}
