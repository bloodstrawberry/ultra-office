import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `퍼즐 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleView />;
}
