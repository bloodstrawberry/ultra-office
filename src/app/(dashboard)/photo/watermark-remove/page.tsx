import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoWatermarkRemoveView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `워터마크 제거 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoWatermarkRemoveView />;
}
