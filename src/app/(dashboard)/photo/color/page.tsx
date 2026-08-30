import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoColorView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `색상 보정/필터 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoColorView />;
}
