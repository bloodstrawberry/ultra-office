import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WatermarkView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `워터마크 각인기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <WatermarkView />;
}
