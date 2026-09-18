import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerSolitaireView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `솔리테어 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerSolitaireView />;
}
