import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PixelView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `픽셀 아트 변환기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PixelView />;
}
