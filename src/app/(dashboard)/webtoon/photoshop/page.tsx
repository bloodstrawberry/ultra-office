import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WebtoonPhotoshopView } from 'src/sections/webtoon/view/webtoon-photoshop-view';

export const metadata: Metadata = {
  title: `웹툰 포토샵 | 웹툰 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <WebtoonPhotoshopView />;
}
