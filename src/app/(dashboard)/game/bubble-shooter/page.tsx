import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BubbleShooterView } from 'src/sections/game/bubble-shooter/view';

export const metadata: Metadata = { title: `버블 슈터 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BubbleShooterView />;
}
