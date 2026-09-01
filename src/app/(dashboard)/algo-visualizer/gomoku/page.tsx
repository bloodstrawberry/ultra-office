import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerGomokuView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `오목 전술 & 5목 대국 AI | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerGomokuView />;
}
