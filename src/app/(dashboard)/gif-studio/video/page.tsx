import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioVideoView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `동영상 GIF 변환 | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioVideoView />;
}
