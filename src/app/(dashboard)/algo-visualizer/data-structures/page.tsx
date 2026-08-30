import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerDataStructuresView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `자료구조 도감 & 실습실 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerDataStructuresView />;
}
