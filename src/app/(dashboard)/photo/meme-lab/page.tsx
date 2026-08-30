import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoMemeLabView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `짤 생성기 (Meme Lab) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoMemeLabView />;
}
