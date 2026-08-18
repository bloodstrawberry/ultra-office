import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CompressView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `용량 압축 & 최적화 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <CompressView />;
}
