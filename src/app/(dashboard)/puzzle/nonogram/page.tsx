import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleNonogramView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `네모네모 로직 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleNonogramView />;
}
