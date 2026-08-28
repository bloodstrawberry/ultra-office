import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MontyHallView } from 'src/sections/monty-hall/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `몬티홀 & 확률 역설 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MontyHallView />;
}
