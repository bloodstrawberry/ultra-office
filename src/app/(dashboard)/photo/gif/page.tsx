import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoGifView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `움짤 (GIF) 만들기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoGifView />;
}
