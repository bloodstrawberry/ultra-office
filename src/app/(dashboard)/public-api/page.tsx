import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PublicApiView } from 'src/sections/public-api/view/public-api-view';

export const metadata: Metadata = {
  title: `Public API 탐색기 & 실시간 테스터 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PublicApiView />;
}
