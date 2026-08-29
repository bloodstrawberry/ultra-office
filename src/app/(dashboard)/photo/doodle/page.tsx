import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DoodleView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `대충 · 하찮은 그림 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <DoodleView />;
}
