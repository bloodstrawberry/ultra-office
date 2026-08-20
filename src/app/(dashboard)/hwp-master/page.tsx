import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { HwpMasterView } from 'src/sections/hwp-master/view';

export const metadata: Metadata = {
  title: `한글 문서 마스터 (HWP · HWPX) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <HwpMasterView />;
}
