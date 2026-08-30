import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OpicDriveView } from 'src/sections/file-manager/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `오픽 드라이브 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OpicDriveView />;
}
