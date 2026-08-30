import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoPixelView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `도트/픽셀 아트 변환 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoPixelView />;
}
