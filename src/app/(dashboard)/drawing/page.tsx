import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DrawingView } from 'src/sections/drawing/drawing-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `그리기/게임 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DrawingView />;
}
