import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JigsawPuzzleView } from 'src/sections/game/jigsaw-puzzle/view';

export const metadata: Metadata = { title: `사진 직쏘 퍼즐 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <JigsawPuzzleView />;
}
