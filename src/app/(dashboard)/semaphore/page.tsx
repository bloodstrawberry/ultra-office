import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { SemaphoreView } from 'src/sections/semaphore/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `해군 수기 신호(Semaphore) & 해상 신호기 | Dashboard - ${CONFIG.appName}`,
  description:
    '해군 수기 신호(Flag Semaphore) 변환, 실시간 수기병 애니메이션 및 국제 해상 신호기(ICS) 도감',
};

export default function Page() {
  return <SemaphoreView />;
}
