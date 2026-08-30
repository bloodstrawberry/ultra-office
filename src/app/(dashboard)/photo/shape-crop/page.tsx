import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoShapeCropView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `모양 자르기 (원형/하트/다각형) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoShapeCropView />;
}
