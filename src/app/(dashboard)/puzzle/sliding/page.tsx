import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleSlidingView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `슬라이딩 퍼즐 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleSlidingView />;
}
