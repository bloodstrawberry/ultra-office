import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoFourCutView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `인생네컷/콜라주 프레임 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoFourCutView />;
}
