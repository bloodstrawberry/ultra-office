import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoFlipView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `상하/좌우 반전 및 회전 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoFlipView />;
}
