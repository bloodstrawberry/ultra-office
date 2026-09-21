import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlLinearView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `선형 회귀 (Linear Regression) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlLinearView />;
}
