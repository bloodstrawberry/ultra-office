import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WaveOpticsView } from 'src/sections/wave-optics/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `파동, 광학 & 푸리에 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <WaveOpticsView />;
}
