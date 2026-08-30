import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GifStudioCreateView } from 'src/sections/gif-studio/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `GIF 편집 스튜디오 | Dashboard - ${CONFIG.appName}`,
  description: '움짤 제작, 동영상 GIF 변환, 프레임 분할 추출, 배경색 변경, 속도 및 역재생 편집기',
};

export default function Page() {
  return <GifStudioCreateView />;
}
