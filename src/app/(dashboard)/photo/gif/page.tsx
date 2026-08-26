import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioView } from 'src/sections/gif-studio/view';

export const metadata: Metadata = { title: `GIF 편집 스튜디오 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GifStudioView />;
}
