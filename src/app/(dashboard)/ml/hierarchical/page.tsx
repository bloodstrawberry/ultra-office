import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlHierarchicalView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `계층적 군집화 (Hierarchical Clustering) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlHierarchicalView />;
}
