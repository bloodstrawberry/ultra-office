import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlKnnView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `K-최근접 이웃 (KNN Classifier) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlKnnView />;
}
