import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoGaroView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `가로 이어붙이기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoGaroView />;
}
