import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MathGraphView } from 'src/sections/math-graph';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `수식 그래프 시각화 (Math Graph Lab) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MathGraphView />;
}
