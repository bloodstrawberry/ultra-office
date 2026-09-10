import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleWaterSortView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Water Sort 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleWaterSortView />;
}
