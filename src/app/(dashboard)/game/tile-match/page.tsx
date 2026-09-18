import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TileMatchView } from 'src/sections/game/tile-match/view';

export const metadata: Metadata = { title: `턴제 사천성 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TileMatchView />;
}
