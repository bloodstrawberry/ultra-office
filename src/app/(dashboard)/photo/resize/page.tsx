import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ResizeView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `이미지 크기 조절 (리사이즈) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ResizeView />;
}
