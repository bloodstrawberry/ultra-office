import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlRidgeView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `릿지 회귀 (Ridge Regression L2) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlRidgeView />;
}
