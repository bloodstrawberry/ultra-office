import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoWatermarkView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `워터마크 삽입 (텍스트/로고) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoWatermarkView />;
}
