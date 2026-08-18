import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ImageToolView } from 'src/sections/image-tool/view';

export const metadata: Metadata = {
  title: `이미지 도구 워크스테이션 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ImageToolView />;
}
