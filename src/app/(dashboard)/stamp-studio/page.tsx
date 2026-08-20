import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StampStudioView } from 'src/sections/stamp-studio/view';

export const metadata: Metadata = {
  title: `전자 도장 · 직인 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <StampStudioView />;
}
