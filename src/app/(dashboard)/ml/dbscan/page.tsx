import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlDbscanView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `DBSCAN 밀도 기반 군집화 | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlDbscanView />;
}
