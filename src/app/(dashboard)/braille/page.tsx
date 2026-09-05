import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BrailleView } from 'src/sections/braille/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `훈맹정음 점자(Braille) 스튜디오 | Dashboard - ${CONFIG.appName}`,
  description:
    '한국어 표준 훈맹정음 및 영문 6점자 양방향 변환, 3D 엠보싱 촉각 점자 보드 및 점자 일람표',
};

export default function Page() {
  return <BrailleView />;
}
