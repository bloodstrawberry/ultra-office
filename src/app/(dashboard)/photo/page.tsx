import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `사진 편집실 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoView />;
}
