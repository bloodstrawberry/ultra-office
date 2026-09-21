import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `머신러닝 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlView />;
}
