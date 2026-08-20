import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GigaViewerView } from 'src/sections/giga-viewer/view';

export const metadata: Metadata = {
  title: `대용량 로그 & CSV 초고속 뷰어 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <GigaViewerView />;
}
