import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GlitchView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `글리치 효과 생성기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GlitchView />;
}
