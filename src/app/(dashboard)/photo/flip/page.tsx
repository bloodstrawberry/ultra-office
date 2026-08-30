import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FlipView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `사진 상하 · 좌우 반전 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <FlipView />;
}
