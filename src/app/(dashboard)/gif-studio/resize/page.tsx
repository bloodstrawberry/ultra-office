import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioResizeView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `크기 조절 (리사이즈) | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioResizeView />;
}
