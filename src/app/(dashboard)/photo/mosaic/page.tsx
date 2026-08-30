import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoMosaicView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `모자이크/블러 브러시 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoMosaicView />;
}
