import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PdfView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `PDF 변환 & 분할 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PdfView />;
}
