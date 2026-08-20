import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LogicLabView } from 'src/sections/logic-lab/view';

export const metadata: Metadata = {
  title: `디지털 논리회로 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <LogicLabView />;
}
