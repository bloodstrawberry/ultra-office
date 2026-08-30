import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioBgView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `배경 투명화 · 색상 변경 | GIF 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <GifStudioBgView />;
}
