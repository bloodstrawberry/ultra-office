import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlLassoView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `라쏘 회귀 (Lasso Regression L1) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlLassoView />;
}
