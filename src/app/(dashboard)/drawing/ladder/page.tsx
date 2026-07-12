import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LadderView } from 'src/sections/drawing/ladder-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `사다리 타기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <LadderView />;
}
