import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoHubView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `이미지 편집 허브 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PhotoHubView />;
}
