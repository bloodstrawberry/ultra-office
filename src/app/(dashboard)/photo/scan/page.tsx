import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ScanView } from 'src/sections/photo/view/scan-view';

export const metadata: Metadata = {
  title: `스캔 효과 & 문서 스캐너 | Photo Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <ScanView />;
}
