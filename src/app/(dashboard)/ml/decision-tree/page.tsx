import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlDecisionTreeView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `의사결정나무 (Decision Tree) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlDecisionTreeView />;
}
