import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DevToolsIdeView } from 'src/sections/dev-tools/view/dev-tools-ide-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `VS Code 타이핑 IDE | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <DevToolsIdeView />;
}
