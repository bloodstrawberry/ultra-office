import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MosaicView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `모자이크 & 블러 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MosaicView />;
}
