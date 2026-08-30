import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BarcodeView } from 'src/sections/barcode/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `바코드 & QR 스튜디오 | Dashboard - ${CONFIG.appName}`,
  description: '1D 바코드 및 2D QR 코드 생성, 커스텀 스타일링, 라벨 출력 및 스캔 시뮬레이터',
};

export default function Page() {
  return <BarcodeView />;
}
