import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoPaddingView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `여백 조정 (Padding Studio) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoPaddingView />;
}
