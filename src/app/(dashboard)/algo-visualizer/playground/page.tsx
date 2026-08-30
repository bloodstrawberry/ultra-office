import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerPlaygroundView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `커스텀 코드 샌드박스 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerPlaygroundView />;
}
