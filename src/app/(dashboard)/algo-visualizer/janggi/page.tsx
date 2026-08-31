import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerJanggiView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `장기 박보 & 묘수풀이 AI | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerJanggiView />;
}
