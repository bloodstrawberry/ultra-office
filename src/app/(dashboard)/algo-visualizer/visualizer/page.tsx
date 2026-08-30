import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerVisualizerView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `알고리즘 시각화 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerVisualizerView />;
}
