import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MemeLabView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `종합 밈 연구소 (Meme Lab) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MemeLabView />;
}
