import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoSvgView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `SVG 변환 (Image to SVG & SVG to Image) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoSvgView />;
}
