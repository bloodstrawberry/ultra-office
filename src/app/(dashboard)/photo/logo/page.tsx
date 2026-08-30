import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoLogoView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `로고/아이콘 생성기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoLogoView />;
}
