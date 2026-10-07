import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WebtoonBubbleView } from 'src/sections/webtoon/webtoon-bubble-view';

export const metadata: Metadata = {
  title: `말풍선 추가 | 웹툰 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <WebtoonBubbleView />;
}
