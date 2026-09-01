import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `전체 도구 허브 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoView />;
}
