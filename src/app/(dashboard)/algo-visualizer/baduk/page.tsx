import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerBadukView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `바둑 사활 & 묘수풀이 AI | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerBadukView />;
}
