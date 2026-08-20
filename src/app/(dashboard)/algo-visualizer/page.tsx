import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `알고리즘 & 자료구조 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerView />;
}
