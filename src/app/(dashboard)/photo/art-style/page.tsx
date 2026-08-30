import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoArtStyleView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `명화/예술 화풍 변환 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoArtStyleView />;
}
