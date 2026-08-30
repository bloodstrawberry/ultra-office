import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoWeatheringView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `풍화 효과/인쇄 스캔 왜곡 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoWeatheringView />;
}
