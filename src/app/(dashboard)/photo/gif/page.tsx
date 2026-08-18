import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `GIF 스튜디오 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GifView />;
}
