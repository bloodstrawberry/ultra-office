import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TextTransformView } from 'src/sections/text/view';

export const metadata: Metadata = {
  title: `텍스트 변환 & 정규식 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <TextTransformView />;
}
