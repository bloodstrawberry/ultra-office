import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DocMasterView } from 'src/sections/doc-master';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `오피스 문서 마스터 (Word · PPT · MD) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <DocMasterView />;
}
