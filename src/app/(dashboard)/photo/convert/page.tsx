import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoConvertView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `포맷 변환 (PNG, JPG, WebP) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoConvertView />;
}
