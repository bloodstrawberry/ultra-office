import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DevToolsView } from 'src/sections/dev-tools/view/dev-tools-view';

export const metadata: Metadata = { title: `개발자 & 보안 툴킷 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DevToolsView />;
}
