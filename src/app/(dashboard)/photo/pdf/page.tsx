import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoPdfView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `이미지 PDF 변환/병합 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoPdfView />;
}
