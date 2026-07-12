import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TextExtractView } from 'src/sections/text/text-extract-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `텍스트 추출 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TextExtractView />;
}
