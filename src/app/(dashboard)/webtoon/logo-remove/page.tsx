import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { WebtoonLogoRemoveView } from 'src/sections/webtoon/webtoon-logo-remove-view';

export const metadata: Metadata = {
  title: `로고 지우기 | 웹툰 편집 스튜디오 - ${CONFIG.appName}`,
};

export default function Page() {
  return <WebtoonLogoRemoveView />;
}
