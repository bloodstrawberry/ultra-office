import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TextDiffView } from 'src/sections/text/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `텍스트 비교 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TextDiffView />;
}
