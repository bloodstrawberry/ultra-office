import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SeroView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `세로 636x1048 썸네일 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SeroView />;
}
