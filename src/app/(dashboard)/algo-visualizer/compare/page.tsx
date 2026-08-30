import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerCompareView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `1:1 알고리즘 비교 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerCompareView />;
}
