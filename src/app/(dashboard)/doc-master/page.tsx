import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DocMasterView } from 'src/sections/doc-master';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `워드 (Word Processor) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <DocMasterView />;
}
