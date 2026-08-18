import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ColorView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `투명화 / 배경 지우개 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ColorView />;
}
