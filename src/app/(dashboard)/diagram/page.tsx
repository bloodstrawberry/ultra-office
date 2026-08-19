import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DiagramView } from 'src/sections/diagram/view/diagram-view';

export const metadata: Metadata = { title: `조직도 & 마인드맵 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DiagramView />;
}
