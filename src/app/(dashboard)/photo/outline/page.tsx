import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoOutlineView } from 'src/sections/photo/view';

export const metadata: Metadata = {
  title: `테두리 추가 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoOutlineView />;
}
