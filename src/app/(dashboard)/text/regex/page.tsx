import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TextRegexView } from 'src/sections/text/view';

export const metadata: Metadata = {
  title: `정규표현식 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <TextRegexView />;
}
