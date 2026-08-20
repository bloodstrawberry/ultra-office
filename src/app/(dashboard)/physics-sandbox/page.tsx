import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhysicsSandboxView } from 'src/sections/physics-sandbox/view';

export const metadata: Metadata = {
  title: `2D 물리 & 과학 샌드박스 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhysicsSandboxView />;
}
