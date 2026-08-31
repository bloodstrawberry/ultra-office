import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerChessView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `체스 전술 & 퍼즐풀이 AI | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerChessView />;
}
