import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlLogisticView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `로지스틱 회귀 (Logistic Regression) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlLogisticView />;
}
