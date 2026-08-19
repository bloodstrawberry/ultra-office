import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BgRemoveView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `AI 배경 제거 (누끼 따기) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BgRemoveView />;
}
