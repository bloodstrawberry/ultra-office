import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FantasyWestwardJourneyView } from 'src/sections/game/fantasy-westward-journey/view';

export const metadata: Metadata = { title: `환상서유기 대본 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <FantasyWestwardJourneyView />;
}
