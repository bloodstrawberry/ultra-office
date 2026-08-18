import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GaroView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `가로 1504x741 썸네일 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GaroView />;
}
