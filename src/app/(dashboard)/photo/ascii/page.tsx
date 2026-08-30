import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoAsciiView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `ASCII 아스키 아트 변환 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoAsciiView />;
}
