import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BlackHoleView } from 'src/sections/black-hole/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `블랙홀 & 일반 상대성 이론 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BlackHoleView />;
}
