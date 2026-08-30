import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerCatalogView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `Big-O 마스터 & 카탈로그 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerCatalogView />;
}
