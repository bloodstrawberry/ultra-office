import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioSplitView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `프레임 분할 추출 | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioSplitView />;
}
