import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ShapeCropView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `도형 모양 자르기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ShapeCropView />;
}
