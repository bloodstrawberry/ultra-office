import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FourCutView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `인생네컷 포토부스 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <FourCutView />;
}
