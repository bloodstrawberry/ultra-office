import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoOgImageView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `ogImage 크기 조절 (1200×600) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoOgImageView />;
}
