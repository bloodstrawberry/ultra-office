import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AlgoVisualizerChallengeView } from 'src/sections/algo-visualizer/view';

export const metadata: Metadata = {
  title: `CS 챌린지 모드 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AlgoVisualizerChallengeView />;
}
