import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoResizeView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `크기 조절/리사이즈 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoResizeView />;
}
