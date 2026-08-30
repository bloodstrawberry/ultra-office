import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoScanView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `문서 스캔 효과 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoScanView />;
}
