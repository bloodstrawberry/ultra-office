import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `GIF → 동영상 (MP4/AVI) 변환 | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioView initialTab="to-video" />;
}
