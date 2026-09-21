import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlSandboxView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `머신러닝 라이브러리 벤치마크 & 샌드박스 | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlSandboxView />;
}
