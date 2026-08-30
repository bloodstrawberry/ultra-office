import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DrawingRouletteView } from 'src/sections/drawing';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `룰렛 돌리기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DrawingRouletteView />;
}
