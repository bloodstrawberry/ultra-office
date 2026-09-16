import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleMinesweeperView } from 'src/sections/puzzle/view';

export const metadata: Metadata = { title: `지뢰찾기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleMinesweeperView />;
}
