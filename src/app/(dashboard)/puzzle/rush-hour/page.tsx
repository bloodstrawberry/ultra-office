import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleRushHourView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Rush Hour 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleRushHourView />;
}
