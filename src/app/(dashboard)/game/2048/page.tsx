import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { Game2048View } from 'src/sections/game/2048/view';

export const metadata: Metadata = { title: `2048 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <Game2048View />;
}
