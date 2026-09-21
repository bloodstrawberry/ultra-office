import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlPcaView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `주성분 분석 (PCA 차원 축소) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlPcaView />;
}
