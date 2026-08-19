import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PdfMasterView } from 'src/sections/pdf-master/view/pdf-master-view';

export const metadata: Metadata = { title: `PDF 마스터 스튜디오 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PdfMasterView />;
}
