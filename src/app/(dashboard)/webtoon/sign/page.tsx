import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WebtoonSignView } from 'src/sections/webtoon/webtoon-sign-view';

export const metadata: Metadata = {
  title: `싸인추가 | 웹툰 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <WebtoonSignView />;
}
