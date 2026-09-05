import type { Metadata } from 'next';

import { Suspense } from 'react';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { OpicDriveView } from 'src/sections/file-manager/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `오픽 드라이브 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OpicDriveView />
    </Suspense>
  );
}
