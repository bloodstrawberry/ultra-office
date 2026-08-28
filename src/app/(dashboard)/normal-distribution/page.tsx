import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { NormalDistributionView } from 'src/sections/normal-distribution/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `정규분포 & 확률통계 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <NormalDistributionView />;
}
