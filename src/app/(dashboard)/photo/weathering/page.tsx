import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WeatheringView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `디지털 풍화 시뮬레이터 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <WeatheringView />;
}
