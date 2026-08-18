import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AsciiView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `ASCII 아스키 아트 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AsciiView />;
}
