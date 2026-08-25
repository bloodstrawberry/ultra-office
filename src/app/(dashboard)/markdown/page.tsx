import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MarkdownView } from 'src/sections/markdown/view';

export const metadata: Metadata = {
  title: `마크다운 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <MarkdownView />;
}
