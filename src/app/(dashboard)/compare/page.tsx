import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CompareView } from 'src/sections/compare/view';

export const metadata: Metadata = { title: `데이터 비교 스튜디오 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <CompareView />;
}
