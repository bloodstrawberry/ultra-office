import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PowerpointView } from 'src/sections/powerpoint/view';

export const metadata: Metadata = {
  title: `파워 포인트 (Power Point) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PowerpointView />;
}
