import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { RouletteView } from 'src/sections/drawing/roulette-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `룰렛 돌리기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <RouletteView />;
}
