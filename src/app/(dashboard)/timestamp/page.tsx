import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TimestampView } from 'src/sections/timestamp/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `유닉스 타임스탬프 & 글로벌 시간대 | Dashboard - ${CONFIG.appName}`,
  description:
    '유닉스 에포크 타임스탬프(초/밀리초) 변환, ISO 8601 및 전 세계 10대 도시 실시간 시차 시계',
};

export default function Page() {
  return <TimestampView />;
}
