import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WebtoonMergeView } from 'src/sections/webtoon/webtoon-merge-view';

export const metadata: Metadata = {
  title: `이미지 합치기 | 웹툰 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <WebtoonMergeView />;
}
