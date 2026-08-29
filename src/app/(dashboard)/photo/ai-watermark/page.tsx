import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AiWatermarkView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `AI 워터마크 & 생성물 표기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AiWatermarkView />;
}
