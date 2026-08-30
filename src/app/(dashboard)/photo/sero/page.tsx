import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoSeroView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `세로 이어붙이기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoSeroView />;
}
