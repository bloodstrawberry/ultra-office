import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ArtStyleView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `명화 & 스케치 필터 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ArtStyleView />;
}
