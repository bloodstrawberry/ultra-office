import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerAlkkagiView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `피직스 알까기 배틀 (바둑/장기) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerAlkkagiView />;
}
