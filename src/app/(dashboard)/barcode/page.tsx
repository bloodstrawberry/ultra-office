import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BarcodeStudioView } from 'src/sections/barcode/view/barcode-studio-view';

export const metadata: Metadata = { title: `QR & 바코드 스튜디오 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BarcodeStudioView />;
}
