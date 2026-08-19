import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OcrScannerView } from 'src/sections/ocr/view/ocr-scanner-view';

export const metadata: Metadata = { title: `스마트 OCR 스캐너 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OcrScannerView />;
}
