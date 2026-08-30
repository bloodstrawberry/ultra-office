import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoBgRemoveView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `배경 제거 (누끼따기) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoBgRemoveView />;
}
