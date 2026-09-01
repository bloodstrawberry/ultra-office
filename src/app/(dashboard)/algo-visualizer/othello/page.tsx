import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerOthelloView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `오셀로 전술 & 리버시 AI | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerOthelloView />;
}
