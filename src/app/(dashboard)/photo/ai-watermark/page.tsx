import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoAiWatermarkView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `보이지 않는 AI 워터마크 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoAiWatermarkView />;
}
