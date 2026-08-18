import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LogoView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `로고 / 정사각형 1:1 썸네일 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <LogoView />;
}
