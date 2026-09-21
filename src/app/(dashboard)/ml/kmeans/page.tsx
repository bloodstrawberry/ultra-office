import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlKmeansView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `K-평균 군집화 (K-Means Clustering) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlKmeansView />;
}
