import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FractalsChaosView } from 'src/sections/fractals-chaos/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `프랙탈 & 카오스 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <FractalsChaosView />;
}
