import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MonteCarloView } from 'src/sections/monte-carlo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `몬테카를로 & 기하 확률 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MonteCarloView />;
}
