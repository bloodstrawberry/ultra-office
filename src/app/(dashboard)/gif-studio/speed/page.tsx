import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioSpeedView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `속도 조절 · 역재생 · 부메랑 | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioSpeedView />;
}
