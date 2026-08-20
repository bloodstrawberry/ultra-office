import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LinearAlgebraView } from 'src/sections/linear-algebra/view';

export const metadata: Metadata = {
  title: `선형대수 & 공간 변환 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <LinearAlgebraView />;
}
