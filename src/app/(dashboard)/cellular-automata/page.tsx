import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CellularAutomataView } from 'src/sections/cellular-automata/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `셀룰러 오토마타 & 라이프 게임 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <CellularAutomataView />;
}
